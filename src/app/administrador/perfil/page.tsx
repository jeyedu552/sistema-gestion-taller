'use client';

import React, { useState, useEffect } from 'react';

export default function PerfilPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Cargar los datos actuales del usuario al montar el componente
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/autenticacion');
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            setFormData(prev => ({
              ...prev,
              name: data.user.name,
              email: data.user.email
            }));
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar el perfil');
      }

      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      // Limpiar los campos de contraseñas tras un éxito
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' })); 
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium">Cargando perfil...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-primary tracking-tight">Mi Perfil</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">Gestiona tu información personal y credenciales de seguridad</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg text-sm font-bold shadow-sm ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white border border-slate-100 shadow-sm rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Sección de Avatar (Preparada para futura subida de archivos) */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-black shadow-sm uppercase">
              {formData.name.substring(0, 2)}
            </div>
            <div>
              <button type="button" className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-not-allowed opacity-70">
                Cambiar Avatar
              </button>
              <p className="text-[10px] text-slate-400 mt-1">Soporta JPG, PNG. (Módulo de subida en desarrollo)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
              <input 
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm focus:border-primary outline-none transition-all font-medium"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
              <input 
                type="email"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm focus:border-primary outline-none transition-all font-medium"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Seguridad de la Cuenta</h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Contraseña Actual</label>
              <input 
                type="password"
                placeholder="Requerida solo si deseas cambiar tu contraseña"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm focus:border-primary outline-none transition-all font-medium placeholder:text-slate-400"
                value={formData.currentPassword}
                onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nueva Contraseña</label>
              <input 
                type="password"
                placeholder="Deja en blanco si no deseas cambiarla"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm focus:border-primary outline-none transition-all font-medium placeholder:text-slate-400"
                value={formData.newPassword}
                onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
            >
              {isSubmitting ? 'Guardando Cambios...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}