import React from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      
      {/* Cabecera de Página y Acciones Rápidas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Panel de Control</h1>
          <p className="text-sm text-on-surface-variant mt-1">Resumen general del sistema AutoCore Pro</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white text-primary border border-outline-variant px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-surface-container-low transition-all shadow-sm">
            Registrar Cliente
          </button>
          <button className="bg-primary text-on-primary px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-primary-container transition-all active:scale-[0.98] shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nueva Orden
          </button>
        </div>
      </div>

      {/* Fila de Tarjetas KPI (Métricas Clave) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="bg-white border border-outline-variant shadow-sm rounded-xl p-6 flex flex-col gap-2">
          <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">Órdenes Activas</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-primary">12</span>
            <span className="text-primary text-[11px] font-medium mb-1.5 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div> En taller
            </span>
          </div>
        </div>
        
        {/* KPI 2 */}
        <div className="bg-white border border-outline-variant shadow-sm rounded-xl p-6 flex flex-col gap-2">
          <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">Ingresos del Mes</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-primary">$4,250</span>
            <span className="text-green-600 text-[11px] font-semibold mb-1 flex items-center">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 8%
            </span>
          </div>
        </div>
        
        {/* KPI 3 */}
        <div className="bg-white border border-outline-variant shadow-sm rounded-xl p-6 flex flex-col gap-2">
          <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">Mecánicos Disp.</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-primary">5</span>
            <span className="text-on-surface-variant text-[11px] font-medium mb-1.5">de 8 en turno</span>
          </div>
        </div>
        
        {/* KPI 4 */}
        <div className="bg-white border border-outline-variant shadow-sm rounded-xl p-6 flex flex-col gap-2 relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">Alertas Inventario</span>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-error">4</span>
              <span className="text-on-surface-variant text-[11px] font-medium mb-1.5">Items bajos</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-[80px]">inventory_2</span>
          </div>
        </div>
      </div>

      {/* Sección de Tabla de Datos: Órdenes Recientes */}
      <div className="bg-white border border-outline-variant shadow-sm rounded-xl overflow-hidden">
        <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant flex justify-between items-center">
          <h3 className="text-lg font-semibold text-primary">Órdenes de Servicio Recientes</h3>
          <Link href="/administrador/ordenes" className="text-primary text-sm font-semibold hover:underline transition-all">
            Ver todas
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest">
                <th className="px-6 py-4 text-on-surface-variant text-xs font-semibold uppercase tracking-wider border-b-2 border-outline-variant">ID Orden</th>
                <th className="px-6 py-4 text-on-surface-variant text-xs font-semibold uppercase tracking-wider border-b-2 border-outline-variant">Cliente</th>
                <th className="px-6 py-4 text-on-surface-variant text-xs font-semibold uppercase tracking-wider border-b-2 border-outline-variant">Vehículo</th>
                <th className="px-6 py-4 text-on-surface-variant text-xs font-semibold uppercase tracking-wider border-b-2 border-outline-variant">Mecánico Asignado</th>
                <th className="px-6 py-4 text-on-surface-variant text-xs font-semibold uppercase tracking-wider border-b-2 border-outline-variant">Estado</th>
                <th className="px-6 py-4 text-on-surface-variant text-xs font-semibold uppercase tracking-wider border-b-2 border-outline-variant text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {/* Fila 1 */}
              <tr className="hover:bg-surface-container transition-colors">
                <td className="px-6 py-4 font-semibold text-primary text-sm">#ORD-0892</td>
                <td className="px-6 py-4 text-sm text-on-surface">Carlos Mendoza</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-on-surface">Toyota Hilux</p>
                  <p className="text-[12px] text-on-surface-variant">PBA-1234</p>
                </td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">Roberto López</td>
                <td className="px-6 py-4">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700">EN PROGRESO</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-primary hover:text-primary-container transition-colors" title="Ver detalle">
                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                  </button>
                </td>
              </tr>
              
              {/* Fila 2 */}
              <tr className="hover:bg-surface-container transition-colors">
                <td className="px-6 py-4 font-semibold text-primary text-sm">#ORD-0891</td>
                <td className="px-6 py-4 text-sm text-on-surface">Ana Salazar</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-on-surface">Chevrolet Spark</p>
                  <p className="text-[12px] text-on-surface-variant">PCC-9876</p>
                </td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">Sin asignar</td>
                <td className="px-6 py-4">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-surface-container-high border border-outline-variant text-on-surface-variant">PENDIENTE</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-primary hover:text-primary-container transition-colors" title="Ver detalle">
                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                  </button>
                </td>
              </tr>
              
              {/* Fila 3 */}
              <tr className="hover:bg-surface-container transition-colors">
                <td className="px-6 py-4 font-semibold text-primary text-sm">#ORD-0890</td>
                <td className="px-6 py-4 text-sm text-on-surface">Empresa Logística S.A.</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-on-surface">Ford F-150</p>
                  <p className="text-[12px] text-on-surface-variant">PXI-4455</p>
                </td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">Mecánico Prueba</td>
                <td className="px-6 py-4">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700">COMPLETADO</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-primary hover:text-primary-container transition-colors" title="Ver detalle">
                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}