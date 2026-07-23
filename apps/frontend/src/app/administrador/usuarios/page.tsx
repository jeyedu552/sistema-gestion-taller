'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/apiClient';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastActive?: string;
  createdAt: string;
}

/**
 * Función para formatear la fecha de última conexión de forma amigable con el estado visual
 */
function formatLastLogin(dateString?: string) {
  if (!dateString) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
        <span>Nunca</span>
      </div>
    );
  }
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  
  // Si estuvo activo hace menos de 15 segundos, está en línea
  const isOnline = diffInSecs <= 15;
  const statusDot = <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>;

  let timeText = '';
  if (isOnline) {
    timeText = 'En línea ahora';
  } else if (diffInMins < 1) {
    timeText = `Hace ${diffInSecs} s`;
  } else if (diffInMins < 60) {
    timeText = `Hace ${diffInMins} min`;
  } else if (diffInMs < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
    timeText = `Hoy, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else {
    timeText = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ` ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  return (
    <div className="flex items-center gap-1.5">
      {statusDot}
      <span className={isOnline ? 'text-green-600 font-bold' : 'text-slate-500 font-medium'}>
        {timeText}
      </span>
    </div>
  );
}

/**
 * Componente principal con Suspense para manejar searchParams
 */
export default function UsersDirectoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-medium text-slate-500">Cargando directorio...</div>}>
      <UsersContent />
    </Suspense>
  );
}

function UsersContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Obtener término de búsqueda de la URL
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  // Estados de Control Locales
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'MECANICO' | 'CLIENTE'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Estado para Modal de Registro
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CLIENTE' as const
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetchWithAuth(`/auth/users?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Error al cargar usuarios');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Lógica de Filtrado: Combina búsqueda de URL y filtro de rol local
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(urlQuery.toLowerCase()) || 
        user.email.toLowerCase().includes(urlQuery.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, urlQuery, roleFilter]);

  // Lógica de Paginación Dinámica
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [urlQuery, roleFilter]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      mechanics: users.filter(u => u.role === 'MECANICO' && u.isActive).length,
      newThisMonth: users.filter(u => {
        const date = new Date(u.createdAt);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length,
      inactive: users.filter(u => !u.isActive).length
    };
  }, [users]);

  const handleToggleStatus = async (user: User) => {
    try {
      const response = await fetchWithAuth(`/auth/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive })
      });
      
      if (response.ok) {
        setUsers(users.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth('/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        let errorMsg = 'Error al crear usuario';
        try {
          const data = await response.json();
          errorMsg = data.error || errorMsg;
        } catch (parseError) {
          console.error('La respuesta de error no es JSON válido');
        }
        throw new Error(errorMsg);
      }
      
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'CLIENTE' });
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cabecera de Página */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary tracking-tight">Directorio de Usuarios</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Gestión operativa de clientes y personal técnico</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-primary/90 transition-all shadow-sm active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>NUEVO USUARIO</span>
        </button>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="TOTAL USUARIOS" value={stats.total} trend="+12%" />
        <KpiCard label="MECÁNICOS ACTIVOS" value={stats.mechanics} subValue={`de ${users.filter(u=>u.role==='MECANICO').length} total`} />
        <KpiCard label="NUEVOS CLIENTES" value={stats.newThisMonth} subValue="Este mes" />
        <div className="bg-white border border-slate-100 shadow-sm rounded-lg p-4 flex flex-col gap-1 relative overflow-hidden">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">ALERTAS SISTEMA</span>
          <div className="flex items-end gap-2 relative z-10">
            <span className="text-2xl font-bold text-red-600">{stats.inactive}</span>
            <span className="text-slate-400 text-[11px] font-bold mb-0.5">INACTIVOS</span>
          </div>
          <div className="absolute right-0 bottom-0 text-slate-50 pointer-events-none translate-x-2 translate-y-2 opacity-30">
            <span className="material-symbols-outlined text-[60px]">warning</span>
          </div>
        </div>
      </div>

      {/* Toolbar: Filtros */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-lg p-3 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {urlQuery ? (
            <div className="flex items-center gap-2 bg-blue-50 text-primary px-3 py-1.5 rounded-md border border-blue-100">
              <span className="material-symbols-outlined text-[16px]">search</span>
              Resultados: <span className="font-bold">"{urlQuery}"</span>
            </div>
          ) : (
            <span className="italic ml-2 opacity-60 font-medium normal-case tracking-normal">Usa el buscador superior para filtrar...</span>
          )}
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <select 
              className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-bold py-2 pl-9 pr-9 rounded-lg hover:bg-slate-50 outline-none transition-all cursor-pointer w-full"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
            >
              <option value="ALL">TODOS LOS ROLES</option>
              <option value="ADMIN">ADMINISTRADORES</option>
              <option value="MECANICO">MECÁNICOS</option>
              <option value="CLIENTE">CLIENTES</option>
            </select>
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-400 pointer-events-none">filter_list</span>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-300 pointer-events-none">expand_more</span>
          </div>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-4 text-slate-500 text-[11px] font-bold uppercase tracking-widest border-b border-slate-50 bg-slate-50/50">Nombre / Email</th>
                <th className="px-6 py-4 text-slate-500 text-[11px] font-bold uppercase tracking-widest border-b border-slate-50 bg-slate-50/50">Rol</th>
                <th className="px-6 py-4 text-slate-500 text-[11px] font-bold uppercase tracking-widest border-b border-slate-50 bg-slate-50/50">Estado</th>
                <th className="px-6 py-4 text-slate-500 text-[11px] font-bold uppercase tracking-widest border-b border-slate-50 bg-slate-50/50">Última Conexión</th>
                <th className="px-6 py-4 text-slate-500 text-[11px] font-bold uppercase tracking-widest border-b border-slate-50 bg-slate-50/50 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm font-medium">Sincronizando con el servidor...</td></tr>
              ) : paginatedUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm font-medium">No se encontraron usuarios que coincidan con los filtros.</td></tr>
              ) : (
                paginatedUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-white font-bold text-xs shadow-sm">
                          {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-tight">{user.name}</p>
                          <p className="text-[12px] text-slate-500 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-bold tracking-wider ${
                        user.role === 'ADMIN' ? 'text-blue-700' :
                        user.role === 'MECANICO' ? 'text-orange-700' :
                        'text-slate-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-[11px] font-bold tracking-wider text-primary ${!user.isActive ? 'underline decoration-blue-400 underline-offset-4' : ''}`}>
                          {user.isActive ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[12px] text-slate-500 font-medium">
                      {formatLastLogin(user.lastActive)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== 'ADMIN' ? (
                        <button 
                          onClick={() => handleToggleStatus(user)}
                          className="px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all bg-primary text-white hover:bg-primary-container shadow-sm active:scale-[0.98]"
                        >
                          {user.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-4">Protegido</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación Real */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/30">
          <p className="text-[13px] text-slate-500 font-medium">
            Mostrando <span className="font-bold text-slate-800">{paginatedUsers.length}</span> de <span className="font-bold text-slate-800">{filteredUsers.length}</span> usuarios
          </p>
          <div className="flex gap-2 items-center">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-200 hover:bg-white transition-colors disabled:opacity-30 bg-white shadow-sm flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px] text-slate-600">chevron_left</span>
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded text-xs font-bold transition-all ${
                    currentPage === page 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'text-slate-600 hover:bg-white border border-transparent hover:border-slate-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded border border-slate-200 hover:bg-white transition-colors disabled:opacity-30 bg-white shadow-sm flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px] text-slate-600">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Registro */}
      {showModal && (
        <div className="fixed inset-0 bg-primary/10 backdrop-blur-[2px] flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-8 border border-slate-100 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-primary">Registrar Usuario</h2>
                <p className="text-sm text-slate-500 font-medium">Crea una cuenta para el equipo o clientes</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                <input 
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
                <input 
                  type="email"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Contraseña Temporal</label>
                <input 
                  type="password"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium"
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Rol del Sistema</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm focus:border-primary outline-none transition-all font-bold text-primary cursor-pointer"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                >
                  <option value="CLIENTE">CLIENTE</option>
                  <option value="MECANICO">MECÁNICO</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-sm font-bold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? 'Registrando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, subValue, trend }: any) {
  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-lg p-4 flex flex-col gap-1.5 transition-all hover:shadow-md">
      <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{label}</span>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-primary leading-none">{value}</span>
        {trend && (
          <span className="text-green-600 text-[10px] font-bold mb-0.5 flex items-center">
            <span className="material-symbols-outlined text-[12px] leading-none">arrow_upward</span> {trend}
          </span>
        )}
        {subValue && (
          <span className="text-slate-400 text-[10px] font-bold mb-0.5 uppercase">{subValue}</span>
        )}
      </div>
    </div>
  );
}
