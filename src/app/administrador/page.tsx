'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DashboardOrder {
  id: string;
  description: string;
  status: 'PENDIENTE' | 'EN_PROGRESO' | 'LISTO_PARA_LIQUIDAR' | 'FINALIZADO';
  createdAt: string;
  vehicle: {
    id: string;
    plate: string;
    brand: string;
    model: string;
  };
  mechanic: {
    id: string;
    name: string;
  } | null;
}

interface DashboardVehicle {
  id: string;
  plate: string;
  isActive?: boolean;
}

interface DashboardUser {
  id: string;
  name: string;
  role: 'ADMIN' | 'MECANICO' | 'CLIENTE';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

function capitalizeText(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

function formatHeroDate(date: Date) {
  const formatted = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

  return capitalizeText(formatted);
}

function statusMeta(status: DashboardOrder['status']) {
  switch (status) {
    case 'PENDIENTE':
      return {
        label: 'Pendiente',
        className: 'bg-slate-100 text-slate-700 border-slate-200',
      };
    case 'EN_PROGRESO':
      return {
        label: 'En progreso',
        className: 'bg-amber-50 text-amber-700 border-amber-100',
      };
    case 'LISTO_PARA_LIQUIDAR':
      return {
        label: 'Listo para liquidar',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      };
    case 'FINALIZADO':
      return {
        label: 'Finalizado',
        className: 'bg-rose-50 text-rose-700 border-rose-100',
      };
    default:
      return {
        label: status,
        className: 'bg-slate-100 text-slate-700 border-slate-200',
      };
  }
}

function metricIconColor(icon: string) {
  switch (icon) {
    case 'receipt_long':
      return 'bg-blue-50 text-primary';
    case 'garage':
      return 'bg-slate-100 text-slate-800';
    case 'payments':
      return 'bg-emerald-50 text-emerald-700';
    case 'engineering':
      return 'bg-amber-50 text-amber-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('Administrador');
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [vehicles, setVehicles] = useState<DashboardVehicle[]>([]);
  const [users, setUsers] = useState<DashboardUser[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const [sessionRes, ordersRes, vehiclesRes, usersRes] = await Promise.all([
          fetch('/api/autenticacion', { cache: 'no-store' }),
          fetch('/api/ordenes', { cache: 'no-store' }),
          fetch('/api/vehiculos', { cache: 'no-store' }),
          fetch('/api/usuarios', { cache: 'no-store' }),
        ]);

        if (!sessionRes.ok || !ordersRes.ok || !vehiclesRes.ok || !usersRes.ok) {
          throw new Error('No fue posible cargar el panel de administración.');
        }

        const sessionData = await sessionRes.json();
        const ordersData = await ordersRes.json();
        const vehiclesData = await vehiclesRes.json();
        const usersData = await usersRes.json();

        if (!isMounted) return;

        if (sessionData.authenticated) {
          setAdminName(sessionData.user.name || 'Administrador');
        }

        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (error) {
        console.error('Error cargando el centro de control:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const activeOrders = orders.filter((order) => order.status !== 'FINALIZADO');
    const activeVehicleIds = new Set(activeOrders.map((order) => order.vehicle?.id).filter(Boolean));
    const finalizadas = orders.filter((order) => order.status === 'FINALIZADO').length;

    return {
      totalOrders: orders.length,
      vehiclesInWorkshop: activeVehicleIds.size || activeOrders.length,
      paidOrders: finalizadas,
      activeMechanics: users.filter((user) => user.role === 'MECANICO' && user.isActive).length,
    };
  }, [orders, users]);

  const latestOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [orders]);

  const userStats = useMemo(() => {
    const mechanics = users.filter((user) => user.role === 'MECANICO');
    const clients = users.filter((user) => user.role === 'CLIENTE');
    const activeUsers = users.filter((user) => user.isActive);
    const inactiveUsers = users.filter((user) => !user.isActive);

    return {
      mechanics: mechanics.length,
      clients: clients.length,
      active: activeUsers.length,
      inactive: inactiveUsers.length,
      total: users.length,
    };
  }, [users]);

  const workshopState = metrics.totalOrders > 0
    ? 'Operativo y procesando órdenes activas'
    : 'En espera de nuevas órdenes';

  return (
    <div className="space-y-6 pb-2">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(23,37,84,0.10),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(191,219,254,0.26),_transparent_30%)]" />
        <div className="relative grid gap-6 p-6 lg:grid-cols-[1.5fr_0.9fr] lg:p-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Centro de control del taller
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
                Bienvenido, {adminName}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                {formatHeroDate(new Date())}. {workshopState}. Este panel resume la operación del día y concentra las acciones críticas del administrador.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push('/administrador/ordenes')}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-container active:scale-[0.99]"
              >
                <span className="material-symbols-outlined text-[18px]">add_task</span>
                Nueva orden
              </button>
              <button
                type="button"
                onClick={() => router.push('/administrador/usuarios?nuevo=cliente')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-slate-50 active:scale-[0.99]"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Registrar cliente
              </button>
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Estado operativo</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{workshopState}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Órdenes activas</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{metrics.totalOrders - metrics.paidOrders}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Fecha del sistema</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{formatHeroDate(new Date())}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Órdenes totales', value: metrics.totalOrders, icon: 'receipt_long' },
              { label: 'Vehículos en taller', value: metrics.vehiclesInWorkshop, icon: 'garage' },
              { label: 'Pagos liquidados', value: metrics.paidOrders, icon: 'payments' },
              { label: 'Mecánicos activos', value: metrics.activeMechanics, icon: 'engineering' },
            ].map((metric) => (
              <article key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{metric.label}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-primary">
                      {isLoading ? '—' : metric.value}
                    </p>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${metricIconColor(metric.icon)}`}>
                    <span className="material-symbols-outlined text-[22px]">{metric.icon}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-primary">Últimas órdenes de trabajo</h2>
                <p className="text-sm text-slate-500">Actividad más reciente del taller con estado, vehículo y responsable.</p>
              </div>
              <Link
                href="/administrador/ordenes"
                className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-slate-100"
              >
                Ver todas
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Orden</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Vehículo</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Mecánico</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Fecha</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Estado</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                        Cargando órdenes recientes...
                      </td>
                    </tr>
                  ) : latestOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                        Todavía no hay órdenes registradas.
                      </td>
                    </tr>
                  ) : (
                    latestOrders.map((order) => {
                      const meta = statusMeta(order.status);

                      return (
                        <tr key={order.id} className="transition-colors hover:bg-slate-50/70">
                          <td className="px-5 py-4 align-top">
                            <div className="font-mono text-sm font-semibold tracking-tight text-primary">{order.id}</div>
                            <div className="mt-1 text-[12px] text-slate-500 line-clamp-1">{order.description}</div>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <div className="text-sm font-semibold text-slate-900">{order.vehicle?.brand} {order.vehicle?.model}</div>
                            <div className="mt-1 text-[12px] font-medium uppercase tracking-[0.18em] text-slate-500">{order.vehicle?.plate}</div>
                          </td>
                          <td className="px-5 py-4 align-top text-sm text-slate-600">
                            {order.mechanic?.name || 'Sin asignar'}
                          </td>
                          <td className="px-5 py-4 align-top text-sm text-slate-600">
                            {formatDateTime(order.createdAt)}
                          </td>
                          <td className="px-5 py-4 align-top">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${meta.className}`}>
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 align-top text-right">
                            <Link
                              href="/administrador/ordenes"
                              className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-primary"
                              aria-label={`Ver orden ${order.id}`}
                            >
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-primary">Gestión de Usuarios</h2>
                <p className="text-sm text-slate-500">Estado resumido del directorio operativo del taller.</p>
              </div>
              <span className="rounded-full bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                {userStats.total} cuentas
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Mecánicos registrados</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-primary">{isLoading ? '—' : userStats.mechanics}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Clientes totales</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-primary">{isLoading ? '—' : userStats.clients}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Estado de cuentas</p>
                <p className="text-xs font-medium text-slate-500">Activos vs Inactivos</p>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>Activos</span>
                    <span>{userStats.active}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${userStats.total ? Math.max(10, (userStats.active / userStats.total) * 100) : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>Inactivos</span>
                    <span>{userStats.inactive}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-rose-500"
                      style={{ width: `${userStats.total ? Math.max(10, (userStats.inactive / userStats.total) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight text-primary">Resumen operativo</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">Vehículos registrados</span>
                <span className="text-sm font-semibold text-slate-900">{vehicles.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">Usuarios activos</span>
                <span className="text-sm font-semibold text-slate-900">{users.filter((user) => user.isActive).length}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">Órdenes en cola</span>
                <span className="text-sm font-semibold text-slate-900">
                  {orders.filter((order) => order.status === 'PENDIENTE').length}
                </span>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}