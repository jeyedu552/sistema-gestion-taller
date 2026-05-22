'use client';

import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MECANICO' | 'CLIENTE';
  isActive: boolean;
  createdAt: string;
}

/**
 * Página de Gestión de Usuarios para el Administrador.
 * HU-02: Registro, consulta e inactivación de usuarios.
 */
export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para el formulario de nuevo usuario
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
      const response = await fetch('/api/usuarios');
      if (!response.ok) throw new Error('Error al cargar usuarios');
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const response = await fetch(`/api/usuarios/${user.id}`, {
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
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Error al crear usuario');
      
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
    <div className="p-8 font-sans">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Directorio de Usuarios</h1>
          <p className="text-secondary font-medium mt-1">Gestión operativa de clientes y personal técnico</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-md font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-container transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">person_add</span>
          Nuevo Usuario
        </button>
      </header>

      {/* Tabla de Usuarios - Estilo DESIGN.md */}
      <div className="bg-surface rounded-lg border border-slate-200 shadow-xl shadow-primary/5 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b-2 border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold text-secondary uppercase tracking-widest">Nombre / Email</th>
              <th className="px-6 py-4 text-[11px] font-bold text-secondary uppercase tracking-widest">Rol</th>
              <th className="px-6 py-4 text-[11px] font-bold text-secondary uppercase tracking-widest">Estado</th>
              <th className="px-6 py-4 text-[11px] font-bold text-secondary uppercase tracking-widest">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {isLoading ? (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-secondary">Cargando usuarios...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-secondary">No hay usuarios registrados.</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-on-surface">{user.name}</div>
                    <div className="text-xs text-secondary">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                      user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                      user.role === 'MECANICO' ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                      user.isActive 
                      ? 'bg-green-50 text-green-700' // DESIGN.md: Soft Mint
                      : 'bg-red-50 text-red-700'     // DESIGN.md: Soft Rose
                    }`}>
                      {user.isActive ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggleStatus(user)}
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        user.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                      }`}
                    >
                      {user.isActive ? 'Inactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Registro (Simplificado) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-surface rounded-lg w-full max-w-md p-8 border border-slate-200 shadow-2xl">
            <h2 className="text-xl font-bold text-primary mb-6">Registrar Nuevo Usuario</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-secondary uppercase tracking-wider ml-1">Nombre Completo</label>
                <input 
                  className="w-full px-4 py-2.5 rounded-md border border-slate-200 text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-secondary uppercase tracking-wider ml-1">Correo Electrónico</label>
                <input 
                  type="email"
                  className="w-full px-4 py-2.5 rounded-md border border-slate-200 text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-secondary uppercase tracking-wider ml-1">Contraseña Temporal</label>
                <input 
                  type="password"
                  className="w-full px-4 py-2.5 rounded-md border border-slate-200 text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-secondary uppercase tracking-wider ml-1">Rol del Sistema</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-md border border-slate-200 text-sm focus:border-primary outline-none transition-all"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                >
                  <option value="CLIENTE">Cliente</option>
                  <option value="MECANICO">Mecánico</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-sm font-bold text-secondary border border-slate-200 rounded-md hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 text-sm font-bold text-white bg-primary rounded-md hover:bg-primary-container shadow-lg shadow-primary/20 disabled:opacity-50"
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
