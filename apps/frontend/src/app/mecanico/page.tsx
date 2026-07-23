'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { OrderChat } from '@/components/chat/order-chat';
import { io } from 'socket.io-client';
import { fetchWithAuth } from '@/lib/apiClient';

interface Vehicle {
  plate: string;
  brand: string;
  model: string;
  year: number;
}

interface ServiceItem {
  id: string;
  description: string;
  price: number;
  createdAt: string;
}

interface WorkOrder {
  id: string;
  description: string;
  status: 'PENDIENTE' | 'EN_PROGRESO' | 'LISTO_PARA_LIQUIDAR' | 'FINALIZADO' | 'CLIENTE_EN_CAMINO';
  createdAt: string;
  vehicle: Vehicle;
  _count?: { items: number };
}

/**
 * Componente con Suspense para manejar searchParams
 */
export default function MechanicDashboardPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400 font-medium">Sincronizando con la estación...</div>}>
      <MechanicDashboard />
    </Suspense>
  );
}

function MechanicDashboard() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  
  // Notificaciones de Chat
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [currentUser, setCurrentUser] = useState<{id: string, role: string} | null>(null);

  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  const [newItem, setNewItem] = useState({ description: '', price: '' });
  const [isAddingItem, setIsAddingItem] = useState(false);

  // 1. Cargar Órdenes y Sesión
  useEffect(() => {
    fetchOrders();
    fetchSession();
    
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // 2. Configurar Escucha de Notificaciones en Segundo Plano
  useEffect(() => {
    if (!currentUser || orders.length === 0) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
    const socket = io(socketUrl, {
      path: '/socket.io/',
      transports: ['websocket']
    });
    
    // Unirse a todas las salas de sus órdenes para recibir avisos
    orders.forEach(order => {
      socket.emit('join_order_chat', order.id);
    });

    socket.on('newMessage', (data: any) => {
      // Si el mensaje no es mío y el chat de esa orden NO está abierto
      if (data.senderId !== currentUser.id && selectedOrder?.id !== data.room) {
        setUnreadCounts(prev => ({
          ...prev,
          [data.room]: (prev[data.room] || 0) + 1
        }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser, orders.length, selectedOrder?.id]);

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const response = await fetchWithAuth(`/operaciones/orders?t=${Date.now()}`, { 
        cache: 'no-store' 
      });
      if (!response.ok) throw new Error('Error al cargar órdenes');
      const data = await response.json();
      const mappedOrders = data.map((o: any) => ({
        ...o,
        vehicle: {
          ...o.vehicle,
          plate: o.vehicle?.plate || o.vehicle?.licensePlate
        }
      }));
      setOrders(mappedOrders);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const fetchSession = async () => {
    try {
      const response = await fetchWithAuth('/auth/verify');
      if (response.ok) {
        const data = await response.json();
        if (data.userId) {
          setCurrentUser({ id: data.userId, role: data.role });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      setIsModalLoading(true);
      const response = await fetchWithAuth(`/operaciones/orders/${orderId}/items?t=${Date.now()}`, { 
        cache: 'no-store' 
      });
      if (!response.ok) throw new Error('Error al cargar ítems');
      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsModalLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const search = urlQuery.toLowerCase();
      return (
        (order.vehicle?.plate || '').toLowerCase().includes(search) ||
        (order.description || '').toLowerCase().includes(search) ||
        (order.vehicle?.brand || '').toLowerCase().includes(search) ||
        (order.vehicle?.model || '').toLowerCase().includes(search)
      );
    });
  }, [orders, urlQuery]);

  const handleOpenDetail = (order: WorkOrder) => {
    setSelectedOrder(order);
    // Limpiar notificaciones al abrir el chat
    setUnreadCounts(prev => ({ ...prev, [order.id]: 0 }));
    fetchOrderDetails(order.id);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    try {
      const response = await fetchWithAuth(`/operaciones/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        const updated = await response.json();
        setSelectedOrder({ ...selectedOrder, status: updated.status });
        setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: updated.status } : o));
        
        // Enviar notificación al chat como mensaje del sistema
        let statusMsg = '';
        if (newStatus === 'EN_PROGRESO') statusMsg = '⚙️ El vehículo ha entrado a revisión/reparación (EN TALLER).';
        else if (newStatus === 'LISTO_PARA_LIQUIDAR') statusMsg = '✅ Su vehículo ya está listo. Por favor, pase a retirarlo.';
        
        if (statusMsg) {
          const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
          const socket = io(socketUrl, { path: '/socket.io/', transports: ['websocket'] });
          socket.on('connect', () => {
            socket.emit('sendMessage', {
              senderId: 'SYSTEM',
              senderName: 'Notificación del Sistema',
              content: statusMsg,
              room: selectedOrder.id
            });
            setTimeout(() => socket.disconnect(), 500);
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !newItem.description || !newItem.price) return;
    
    setIsAddingItem(true);
    try {
      const response = await fetchWithAuth(`/operaciones/orders/${selectedOrder.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: newItem.description,
          price: parseFloat(newItem.price)
        })
      });

      if (response.ok) {
        setNewItem({ description: '', price: '' });
        fetchOrderDetails(selectedOrder.id);
        fetchOrders(true); 
        
        // Notificación al cliente
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
        const socket = io(socketUrl, { path: '/socket.io/', transports: ['websocket'] });
        socket.on('connect', () => {
          socket.emit('sendMessage', {
            senderId: 'SYSTEM',
            senderName: 'Registro de Insumo',
            content: `🔧 Se ha registrado un nuevo insumo/repuesto: "${newItem.description}" con un costo de $${parseFloat(newItem.price).toFixed(2)}.`,
            room: selectedOrder.id
          });
          setTimeout(() => socket.disconnect(), 500);
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingItem(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDIENTE': return 'text-slate-500 border-slate-200 bg-slate-50';
      case 'EN_PROGRESO': return 'text-primary border-primary/20 bg-blue-50';
      case 'LISTO_PARA_LIQUIDAR': return 'text-green-700 border-green-200 bg-green-50';
      case 'FINALIZADO': return 'text-slate-900 border-slate-900 bg-slate-100';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Mis Órdenes de Trabajo</h1>
          <p className="text-sm text-slate-500 font-medium">Gestiona las reparaciones asignadas a tu terminal</p>
        </div>
        {urlQuery && (
          <div className="flex items-center gap-2 bg-blue-50 text-primary px-3 py-1.5 rounded-lg border border-blue-100 text-xs font-bold uppercase tracking-wider animate-in fade-in slide-in-from-right-4">
            <span className="material-symbols-outlined text-[16px]">search</span>
            Buscando: "{urlQuery}"
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-slate-400 font-medium">Consultando servidor...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 font-medium bg-white rounded-2xl border border-dashed border-slate-200">
            {urlQuery ? 'No se encontraron órdenes que coincidan con la búsqueda.' : 'No tienes órdenes asignadas actualmente.'}
          </div>
        ) : (
          filteredOrders.map(order => {
            const unread = unreadCounts[order.id] || 0;
            return (
              <div 
                key={order.id}
                onClick={() => handleOpenDetail(order)}
                className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group border-l-4 border-l-primary relative overflow-hidden"
              >
                {/* Badge de Notificación */}
                {unread > 0 && (
                  <div className="absolute top-0 right-0 p-2">
                    <div className="bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                      {unread}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className="font-mono font-black text-primary text-lg tracking-tighter">
                    {order.vehicle.plate}
                  </div>
                  <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                    {order.status === 'EN_PROGRESO' ? 'EN TALLER' : 
                    order.status === 'LISTO_PARA_LIQUIDAR' ? 'LISTO PARA ENTREGA' :
                    order.status === 'FINALIZADO' ? 'LIQUIDADO' : order.status}
                  </span>
                </div>              
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehículo</p>
                    <p className="text-sm font-bold text-slate-700">{order.vehicle.brand} {order.vehicle.model} ({order.vehicle.year})</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diagnóstico</p>
                    <p className="text-xs font-medium text-slate-600 line-clamp-2 leading-relaxed">{order.description}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className={`material-symbols-outlined text-base ${unread > 0 ? 'text-red-500' : ''}`}>
                      {unread > 0 ? 'notification_important' : 'build'}
                    </span>
                    <span className="text-[11px] font-bold uppercase">{order._count?.items || 0} Insumos</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.02] transition-colors pointer-events-none"></div>
              </div>
            );
          })
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Cabecera Modal */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="font-mono font-black text-2xl text-primary tracking-tighter">{selectedOrder.vehicle.plate}</div>
                <div className="h-6 w-[1px] bg-slate-200"></div>
                <div className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                  {selectedOrder.vehicle.brand} {selectedOrder.vehicle.model}
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-3xl">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              {/* Columna Izquierda: Gestión Técnica (7/12) */}
              <div className="lg:col-span-7 overflow-y-auto p-8 border-r border-slate-100 space-y-8">
                <section className="space-y-3">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado del Servicio</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <StatusButton 
                      label="PENDIENTE" 
                      active={selectedOrder.status === 'PENDIENTE'} 
                      onClick={() => handleUpdateStatus('PENDIENTE')}
                      disabled={selectedOrder.status === 'FINALIZADO' || selectedOrder.status === 'CLIENTE_EN_CAMINO'}
                    />
                    <StatusButton 
                      label="EN TALLER" 
                      active={selectedOrder.status === 'EN_PROGRESO'} 
                      onClick={() => handleUpdateStatus('EN_PROGRESO')}
                      disabled={selectedOrder.status === 'FINALIZADO' || selectedOrder.status === 'CLIENTE_EN_CAMINO'}
                    />
                    <StatusButton 
                      label="LISTO" 
                      active={selectedOrder.status === 'LISTO_PARA_LIQUIDAR'} 
                      onClick={() => handleUpdateStatus('LISTO_PARA_LIQUIDAR')}
                      disabled={selectedOrder.status === 'FINALIZADO' || selectedOrder.status === 'CLIENTE_EN_CAMINO'}
                    />
                  </div>
                  {selectedOrder.status === 'FINALIZADO' && (
                    <div className="p-3 bg-slate-900 text-white rounded-lg text-center font-black text-[10px] tracking-widest mt-2">
                      ORDEN FINALIZADA Y CERRADA
                    </div>
                  )}
                  {selectedOrder.status === 'CLIENTE_EN_CAMINO' && (
                    <div className="p-3 bg-primary text-white rounded-lg text-center font-black text-[10px] tracking-widest mt-2">
                      CLIENTE EN CAMINO - NO SE PERMITEN MÁS COBROS
                    </div>
                  )}
                </section>

                <section className="space-y-4">
                  <div className="flex justify-between items-end">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Repuestos e Insumos</h3>
                    <span className="text-xs font-bold text-primary bg-blue-50 px-2 py-0.5 rounded-md">{items.length} Registros</span>
                  </div>

                  {selectedOrder.status !== 'FINALIZADO' && selectedOrder.status !== 'CLIENTE_EN_CAMINO' && (
                    <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-blue-50/30 p-4 rounded-xl border border-blue-100/50">
                      <div className="sm:col-span-3">
                        <input 
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-primary outline-none font-medium"
                          placeholder="Descripción (ej: Cambio de aceite)"
                          required
                          value={newItem.description}
                          onChange={e => setNewItem({...newItem, description: e.target.value})}
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <input 
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-primary outline-none font-bold"
                          placeholder="Precio"
                          required
                          value={newItem.price}
                          onChange={e => setNewItem({...newItem, price: e.target.value})}
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isAddingItem}
                        className="bg-primary text-white text-[10px] font-black rounded-lg hover:bg-primary-container transition-all disabled:opacity-50"
                      >
                        {isAddingItem ? '...' : 'AÑADIR'}
                      </button>
                    </form>
                  )}

                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <tr>
                          <th className="px-4 py-3">Descripción</th>
                          <th className="px-4 py-3 text-right">Precio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                        {isModalLoading ? (
                          <tr><td colSpan={2} className="px-4 py-8 text-center text-slate-400">Actualizando...</td></tr>
                        ) : items.length === 0 ? (
                          <tr><td colSpan={2} className="px-4 py-8 text-center text-slate-400 italic">No hay repuestos registrados.</td></tr>
                        ) : (
                          <>
                            {items.map(item => (
                              <tr key={item.id} className="hover:bg-slate-50/50">
                                <td className="px-4 py-3">{item.description}</td>
                                <td className="px-4 py-3 text-right text-primary font-bold">${item.price.toFixed(2)}</td>
                              </tr>
                            ))}
                            <tr className="bg-slate-50/30 font-black text-primary border-t-2 border-slate-100">
                              <td className="px-4 py-3 text-right">SUBTOTAL</td>
                              <td className="px-4 py-3 text-right text-base">${items.reduce((acc, curr) => acc + curr.price, 0).toFixed(2)}</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              {/* Columna Derecha: Chat Interactivo (5/12) */}
              <div className="lg:col-span-5 bg-slate-50/30 flex flex-col h-full border-l border-slate-100">
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Comunicación con Cliente</h3>
                    <span className="material-symbols-outlined text-primary text-xl">forum</span>
                  </div>
                  
                  {currentUser ? (
                    <OrderChat 
                      orderId={selectedOrder.id}
                      currentUserId={currentUser.id}
                      currentUserRole={currentUser.role}
                      isLocked={selectedOrder.status === 'FINALIZADO'}
                    />
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-medium italic">
                      Cargando sesión de chat...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusButton({ label, active, onClick, disabled }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-2.5 px-3 rounded-xl text-[9px] font-black tracking-widest transition-all border-2 flex items-center justify-between ${
        active 
          ? 'bg-primary text-white border-primary shadow-md' 
          : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
      } ${disabled && !active ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      <span>{label}</span>
      {active && <span className="material-symbols-outlined text-xs">check_circle</span>}
    </button>
  );
}

function KpiCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-5 flex flex-col gap-1 relative overflow-hidden group hover:shadow-md transition-all">
      <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">{label}</span>
      <div className="flex items-end gap-2">
        <span className={`text-3xl font-black ${color === 'slate' ? 'text-slate-600' : 'text-primary'} leading-none`}>{value}</span>
      </div>
      <div className="absolute right-0 bottom-0 text-slate-50 pointer-events-none translate-x-2 translate-y-2 group-hover:text-primary/5 transition-colors">
        <span className="material-symbols-outlined text-[70px]">{icon}</span>
      </div>
    </div>
  );
}
