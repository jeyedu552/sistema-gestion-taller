'use client';

import React, { useState, useEffect, Suspense } from 'react';

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
}

interface ServiceItem {
  description: string;
  price: number;
}

interface Mechanic {
  name: string;
}

interface WorkOrder {
  id: string;
  description: string;
  status: 'PENDIENTE' | 'EN_PROGRESO' | 'LISTO_PARA_LIQUIDAR' | 'FINALIZADO';
  createdAt: string;
  vehicle: Vehicle;
  mechanic: Mechanic;
  items: ServiceItem[];
}

export default function ClientDashboardPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400 font-medium text-sm">Sincronizando portal...</div>}>
      <ClientDashboard />
    </Suspense>
  );
}

function ClientDashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);

  useEffect(() => {
    fetchData();

    // Polling silencioso cada 15 segundos para ver actualizaciones en tiempo real
    const interval = setInterval(() => {
      fetchData(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const [vRes, oRes] = await Promise.all([
        fetch(`/api/cliente/vehiculos?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/cliente/ordenes?t=${Date.now()}`, { cache: 'no-store' })
      ]);

      if (!vRes.ok || !oRes.ok) throw new Error('Error al cargar datos');

      const vData = await vRes.json();
      const oData = await oRes.json();

      setVehicles(vData);
      setOrders(oData);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setIsLoading(false);
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

  const inProgressCount = orders.filter(o => o.status === 'PENDIENTE' || o.status === 'EN_PROGRESO').length;
  const readyCount = orders.filter(o => o.status === 'LISTO_PARA_LIQUIDAR').length;

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      <header>
        <h1 className="text-2xl font-bold text-primary tracking-tight">Mi Garaje Virtual</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Sigue el estado de tus vehículos y reparaciones en tiempo real.</p>
      </header>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400 font-medium">Cargando información...</div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                <span className="material-symbols-outlined text-2xl">directions_car</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registrados</p>
                <p className="text-2xl font-black text-primary leading-tight">{vehicles.length}</p>
              </div>
            </div>
            
            <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-5 flex items-center gap-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-primary z-10">
                <span className="material-symbols-outlined text-2xl">engineering</span>
              </div>
              <div className="z-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">En Reparación</p>
                <p className="text-2xl font-black text-slate-800 leading-tight">{inProgressCount}</p>
              </div>
              {inProgressCount > 0 && (
                <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-primary"></div>
              )}
            </div>

            <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-5 flex items-center gap-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 z-10">
                <span className="material-symbols-outlined text-2xl">task_alt</span>
              </div>
              <div className="z-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Listos para Retirar</p>
                <p className="text-2xl font-black text-green-700 leading-tight">{readyCount}</p>
              </div>
              {readyCount > 0 && (
                <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-green-500"></div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna Izquierda: Mis Vehículos */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">garage</span>
                Mis Vehículos
              </h3>
              
              <div className="flex flex-col gap-3">
                {vehicles.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center">
                    <p className="text-xs font-medium text-slate-500">No tienes vehículos registrados.</p>
                  </div>
                ) : (
                  vehicles.map(v => (
                    <div key={v.id} className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        <span className="material-symbols-outlined">directions_car</span>
                      </div>
                      <div>
                        <div className="font-mono font-black text-primary text-sm tracking-tight">{v.plate}</div>
                        <div className="text-[11px] font-bold text-slate-500 uppercase">{v.brand} {v.model} ({v.year})</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Columna Derecha: Historial de Órdenes */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">history</span>
                Historial de Servicios
              </h3>
              
              <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
                {orders.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm font-medium">
                    Aún no hay historial de reparaciones para tus vehículos.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {orders.map(order => (
                      <div 
                        key={order.id} 
                        onClick={() => setSelectedOrder(order)}
                        className="p-5 hover:bg-slate-50/80 transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-black text-[11px] text-slate-700 shadow-inner shrink-0 mt-1">
                            {order.vehicle.plate}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 mb-1 leading-tight line-clamp-1">{order.description}</p>
                            <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                              {new Date(order.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 justify-between sm:justify-end shrink-0 pl-16 sm:pl-0">
                          <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                            {order.status === 'EN_PROGRESO' ? 'EN TALLER' : order.status.replace(/_/g, ' ')}
                          </span>
                          <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Detalle de Orden (Solo Lectura) */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Detalle de Servicio</span>
                <div className="flex items-center gap-3">
                  <div className="font-mono font-black text-xl text-primary tracking-tighter">{selectedOrder.vehicle.plate}</div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status === 'EN_PROGRESO' ? 'EN TALLER' : selectedOrder.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-primary transition-colors bg-white rounded-full p-1 shadow-sm border border-slate-100">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-5 sm:p-8 space-y-8">
              
              {/* Info Básica */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mecánico Asignado</h4>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-primary">engineering</span>
                    {selectedOrder.mechanic.name}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fecha de Ingreso</h4>
                  <p className="text-sm font-bold text-slate-800">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Diagnóstico */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Motivo de Ingreso / Diagnóstico</h4>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed font-medium">
                  {selectedOrder.description}
                </div>
              </div>

              {/* Repuestos (Solo lectura) */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trabajos y Repuestos Aplicados</h4>
                  <span className="text-xs font-bold text-primary bg-blue-50 px-2 py-0.5 rounded-md">{selectedOrder.items.length} ítems</span>
                </div>
                
                {selectedOrder.items.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    Aún no se han registrado insumos o trabajos en esta orden.
                  </div>
                ) : (
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <tr>
                          <th className="px-4 py-3 border-b border-slate-100">Descripción del Trabajo/Repuesto</th>
                          <th className="px-4 py-3 border-b border-slate-100 text-right">Costo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                        {selectedOrder.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3">{item.description}</td>
                            <td className="px-4 py-3 text-right text-primary font-bold">${item.price.toFixed(2)}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50/50 font-black text-slate-900 border-t-2 border-slate-100">
                          <td className="px-4 py-3 text-right uppercase text-[10px] tracking-widest">Subtotal Acumulado</td>
                          <td className="px-4 py-3 text-right text-sm">${selectedOrder.items.reduce((acc, curr) => acc + curr.price, 0).toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
