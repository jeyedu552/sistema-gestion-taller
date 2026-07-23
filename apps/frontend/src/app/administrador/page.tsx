'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/apiClient';

interface Order {
  id: string;
  description: string;
  status: string;
  createdAt: string;
  mechanicId: string | null;
  vehicle: {
    licensePlate: string;
    brand: string;
    model: string;
    ownerId: string;
  };
  items: Array<{ price: number }>;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [ordersRes, usersRes] = await Promise.all([
          fetchWithAuth(`/operaciones/orders?t=${Date.now()}`, { cache: 'no-store' }),
          fetchWithAuth(`/auth/users?t=${Date.now()}`, { cache: 'no-store' })
        ]);

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
        }
        
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        }
      } catch (err) {
        console.error('Error al cargar datos del dashboard', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const activeOrders = orders.filter(o => o.status !== 'FINALIZADO').length;
    
    // Ingresos calculados basados en items de órdenes
    const totalIncome = orders.reduce((sum, order) => {
      const orderTotal = order.items?.reduce((itemSum, item) => itemSum + item.price, 0) || 0;
      return sum + orderTotal;
    }, 0);

    const activeMechanics = users.filter(u => u.role === 'MECANICO' && u.isActive).length;
    const totalMechanics = users.filter(u => u.role === 'MECANICO').length;

    return {
      activeOrders,
      totalIncome,
      activeMechanics,
      totalMechanics,
      lowInventoryAlerts: 0 // Placeholder, no hay módulo de inventario real aún
    };
  }, [orders, users]);

  // Mostrar solo las 5 órdenes más recientes
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [orders]);

  const getUserName = (userId: string | null) => {
    if (!userId) return 'Sin asignar';
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Desconocido';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">PENDIENTE</span>;
      case 'EN_PROGRESO':
        return <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700">EN PROGRESO</span>;
      case 'LISTO_PARA_LIQUIDAR':
        return <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700">LISTO LIQUIDAR</span>;
      case 'FINALIZADO':
        return <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700">FINALIZADO</span>;
      default:
        return <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Cabecera de Página y Acciones Rápidas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Panel de Control</h1>
          <p className="text-sm text-slate-500 mt-1">Resumen general del sistema AutoCore Pro</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => router.push('/administrador/usuarios')}
            className="bg-white text-primary border border-slate-200 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm"
          >
            Registrar Cliente
          </button>
          <button 
            onClick={() => router.push('/administrador/ordenes')}
            className="bg-primary text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-primary/90 transition-all active:scale-[0.98] shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nueva Orden
          </button>
        </div>
      </div>

      {/* Fila de Tarjetas KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6 flex flex-col gap-2">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Órdenes Activas</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-primary">
              {isLoading ? '...' : stats.activeOrders}
            </span>
            <span className="text-primary text-[11px] font-medium mb-1.5 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div> En taller
            </span>
          </div>
        </div>
        
        {/* KPI 2 */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6 flex flex-col gap-2">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Ingresos Totales</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-primary">
              ${isLoading ? '...' : stats.totalIncome.toFixed(2)}
            </span>
            <span className="text-green-600 text-[11px] font-semibold mb-1 flex items-center">
              Registrado
            </span>
          </div>
        </div>
        
        {/* KPI 3 */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6 flex flex-col gap-2">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Mecánicos Disp.</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-primary">
              {isLoading ? '...' : stats.activeMechanics}
            </span>
            <span className="text-slate-400 text-[11px] font-medium mb-1.5">
              de {stats.totalMechanics} en total
            </span>
          </div>
        </div>
        
        {/* KPI 4 */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6 flex flex-col gap-2 relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Alertas Inventario</span>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-red-500">
                {stats.lowInventoryAlerts}
              </span>
              <span className="text-slate-400 text-[11px] font-medium mb-1.5">Items bajos</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-[80px]">inventory_2</span>
          </div>
        </div>
      </div>

      {/* Sección de Tabla de Datos: Órdenes Recientes */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
        <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-primary">Órdenes de Servicio Recientes</h3>
          <Link href="/administrador/ordenes" className="text-primary text-sm font-semibold hover:underline transition-all">
            Ver todas
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/20">
                <th className="px-6 py-4 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">ID Orden</th>
                <th className="px-6 py-4 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">Cliente</th>
                <th className="px-6 py-4 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">Vehículo</th>
                <th className="px-6 py-4 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">Mecánico Asignado</th>
                <th className="px-6 py-4 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">Estado</th>
                <th className="px-6 py-4 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-medium">Cargando órdenes recientes...</td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-medium">No hay órdenes registradas.</td>
                </tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-primary text-sm">#{order.id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4 text-sm text-slate-800 font-medium">{getUserName(order.vehicle.ownerId)}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-800">{order.vehicle.brand} {order.vehicle.model}</p>
                      <p className="text-[12px] text-slate-500 font-medium">{order.vehicle.licensePlate || (order.vehicle as any).plate}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">{getUserName(order.mechanicId)}</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => router.push(`/administrador/ordenes?id=${order.id}`)}
                        className="text-primary hover:text-blue-700 transition-colors" 
                        title="Ver detalle"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}