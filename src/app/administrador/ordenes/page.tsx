'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
}

interface Mechanic {
  id: string;
  name: string;
}

interface WorkOrder {
  id: string;
  description: string;
  status: 'PENDIENTE' | 'EN_PROGRESO' | 'LISTO_PARA_LIQUIDAR' | 'FINALIZADO';
  createdAt: string;
  vehicle: Vehicle;
  mechanic: Mechanic;
}

/**
 * Componente principal con Suspense para manejar searchParams (HU-04)
 */
export default function WorkOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-medium text-slate-500 text-sm">Sincronizando órdenes de servicio...</div>}>
      <WorkOrdersContent />
    </Suspense>
  );
}

function WorkOrdersContent() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Evitar error de hidratación renderizando fechas solo en el cliente
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    vehicleId: '',
    mechanicId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Polling silencioso para el Administrador (cada 15s)
    const interval = setInterval(() => {
      fetchData(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const [oRes, vRes, mRes] = await Promise.all([
        fetch(`/api/ordenes?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/vehiculos?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/usuarios?t=${Date.now()}`, { cache: 'no-store' })
      ]);

      if (!oRes.ok || !vRes.ok || !mRes.ok) throw new Error('Error al cargar datos');
      
      const oData = await oRes.json();
      const vData = await vRes.json();
      const uData = await mRes.json();
      
      setOrders(oData);
      setVehicles(vData.filter((v: any) => v.isActive));
      setMechanics(uData.filter((u: any) => u.role === 'MECANICO' && u.isActive));
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const search = urlQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(search) ||
        order.vehicle.plate.toLowerCase().includes(search) ||
        order.mechanic.name.toLowerCase().includes(search) ||
        order.description.toLowerCase().includes(search)
      );
    });
  }, [orders, urlQuery]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [urlQuery]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const stats = useMemo(() => {
    return {
      pending: orders.filter(o => o.status === 'PENDIENTE').length,
      inProgress: orders.filter(o => o.status === 'EN_PROGRESO').length,
      completed: orders.filter(o => o.status === 'FINALIZADO').length
    };
  }, [orders]);

  const handleOpenEdit = (order: WorkOrder) => {
    setIsEditing(true);
    setCurrentOrderId(order.id);
    setFormData({
      description: order.description,
      vehicleId: order.vehicle.id,
      mechanicId: order.mechanic.id
    });
    setShowModal(true);
  };

  const handleFinalizeOrder = async (orderId: string) => {
    if (!confirm('¿Deseas confirmar el pago y liquidar esta orden? El registro se cerrará definitivamente.')) return;
    
    try {
      const response = await fetch(`/api/administrador/ordenes/${orderId}/liquidar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const updated = await response.json();
        // Actualizar el estado localmente para reflejar el cambio al instante
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: updated.status } : o));
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al liquidar la orden');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al servidor');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = '/api/ordenes';
      const method = isEditing ? 'PATCH' : 'POST';
      const body = isEditing 
        ? { id: currentOrderId, description: formData.description }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al procesar orden');
      
      setShowModal(false);
      setIsEditing(false);
      setFormData({ description: '', vehicleId: '', mechanicId: '' });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDIENTE': return 'text-slate-600 underline decoration-slate-300 underline-offset-4';
      case 'EN_PROGRESO': return 'text-primary underline decoration-blue-400 underline-offset-4';
      case 'LISTO_PARA_LIQUIDAR': return 'text-green-700 underline decoration-green-400 underline-offset-4';
      case 'FINALIZADO': return 'text-slate-900 font-black underline decoration-slate-900 underline-offset-4';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary tracking-tight">Órdenes de Servicio</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Control de reparaciones y asignación técnica</p>
        </div>
        <button 
          onClick={() => { setIsEditing(false); setShowModal(true); }}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-primary/90 transition-all shadow-sm active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">add_task</span>
          <span>NUEVA ORDEN</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard label="PENDIENTES" value={stats.pending} icon="pending_actions" color="slate" />
        <KpiCard label="EN TALLER" value={stats.inProgress} icon="engineering" color="primary" />
        <KpiCard label="LIQUIDADAS" value={stats.completed} icon="task_alt" color="primary" />
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-lg p-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {urlQuery ? (
            <div className="flex items-center gap-2 bg-blue-50 text-primary px-3 py-1.5 rounded-md border border-blue-100">
              <span className="material-symbols-outlined text-[16px]">search</span>
              Resultados: <span className="font-bold">"{urlQuery}"</span>
            </div>
          ) : (
            <span className="italic ml-2 opacity-60 font-medium normal-case tracking-normal text-slate-400 text-[13px]">
              Usa el buscador superior para filtrar órdenes...
            </span>
          )}
        </div>
      </div>

      {/* Tabla de Órdenes - Distribución Uniforme */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="w-[12%] px-6 py-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50 text-left">Placa</th>
                <th className="w-[18%] px-6 py-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50 text-center">Modelo / Marca</th>
                <th className="w-[30%] px-6 py-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50 text-left">Descripción del Fallo</th>
                <th className="w-[15%] px-6 py-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50 text-left">Mecánico</th>
                <th className="w-[15%] px-6 py-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50 text-right">Estado / Fecha</th>
                <th className="w-[10%] px-6 py-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs font-medium">Cargando bitácora operativa...</td></tr>
              ) : paginatedOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs font-medium">No hay órdenes registradas.</td></tr>
              ) : (
                paginatedOrders.map(order => {
                  const isLocked = order.status === 'FINALIZADO';
                  const isReadyToLiquidate = order.status === 'LISTO_PARA_LIQUIDAR';
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`text-[13px] font-black font-mono tracking-tight ${isLocked ? 'text-slate-400 line-through' : 'text-primary'}`}>
                          {order.vehicle.plate}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`text-xs font-bold uppercase leading-none ${isLocked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{order.vehicle.brand}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{order.vehicle.model}</div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <p className={`text-[11px] font-medium line-clamp-2 leading-relaxed ${isLocked ? 'text-slate-400 italic' : 'text-slate-700'}`}>
                          {order.description}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-bold truncate ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>{order.mechanic.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`text-[10px] font-black tracking-tight ${getStatusStyle(order.status)}`}>
                            {order.status === 'EN_PROGRESO' ? 'EN TALLER' : 
                             order.status === 'LISTO_PARA_LIQUIDAR' ? 'LISTO PARA ENTREGA' :
                             order.status === 'FINALIZADO' ? 'LIQUIDADO' : order.status.replace(/_/g, ' ')}
                          </span>
                          {isClient && (
                            <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">
                              {new Date(order.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          {!isLocked ? (
                            <>
                              <button 
                                onClick={() => handleOpenEdit(order)}
                                className="p-1.5 rounded-md text-primary border border-slate-200 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
                                title="Editar Descripción"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              {isReadyToLiquidate && (
                                <button 
                                  onClick={() => handleFinalizeOrder(order.id)}
                                  className="p-1.5 rounded-md text-green-600 border border-green-100 bg-green-50 hover:bg-green-100 transition-all shadow-sm active:scale-95"
                                  title="Confirmar Pago y Liquidar"
                                >
                                  <span className="material-symbols-outlined text-[18px]">payments</span>
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="material-symbols-outlined text-slate-300 cursor-not-allowed mx-auto block" title="Orden Liquidada y Bloqueada">
                              lock
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="px-6 py-3 border-t border-slate-100 flex justify-between items-center bg-slate-50/20">
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
            Mostrando {paginatedOrders.length} de {filteredOrders.length} órdenes
          </p>
          <div className="flex gap-1.5 items-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded text-[10px] font-black transition-all ${
                  currentPage === page 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-slate-500 hover:bg-white hover:border-slate-200 border border-transparent'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Nueva/Editar Orden */}
      {showModal && (
        <div className="fixed inset-0 bg-primary/10 backdrop-blur-[2px] flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-8 border border-slate-100 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-primary">{isEditing ? 'Editar Descripción' : 'Apertura de Orden'}</h2>
                <p className="text-sm text-slate-500 font-medium">
                  {isEditing ? 'Actualiza los detalles técnicos del fallo' : 'Asigna un mecánico al vehículo del cliente'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isEditing && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Vehículo a Intervenir</label>
                    <select 
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-sm focus:border-primary outline-none transition-all font-bold text-primary cursor-pointer"
                      required
                      value={formData.vehicleId}
                      onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}
                    >
                      <option value="">Seleccionar Vehículo...</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.plate} - {v.brand} {v.model}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Mecánico Responsable</label>
                    <select 
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-sm focus:border-primary outline-none transition-all font-bold text-primary cursor-pointer"
                      required
                      value={formData.mechanicId}
                      onChange={e => setFormData({ ...formData, mechanicId: e.target.value })}
                    >
                      <option value="">Seleccionar Mecánico...</option>
                      {mechanics.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Descripción del Fallo</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium min-h-[120px] resize-none"
                  required
                  placeholder="Detalla el diagnóstico inicial o el motivo del ingreso..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Procesando...' : (isEditing ? 'Guardar Cambios' : 'Abrir Orden')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-lg p-4 flex flex-col gap-1 relative overflow-hidden group hover:shadow-md transition-all">
      <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{label}</span>
      <div className="flex items-end gap-2">
        <span className={`text-2xl font-bold ${color === 'slate' ? 'text-slate-600' : 'text-primary'} leading-none`}>{value}</span>
      </div>
      <div className="absolute right-0 bottom-0 text-slate-50 pointer-events-none translate-x-2 translate-y-2 group-hover:text-primary/5 transition-colors">
        <span className="material-symbols-outlined text-[60px]">{icon}</span>
      </div>
    </div>
  );
}
