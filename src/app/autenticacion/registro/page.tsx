'use client';

import React, { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';

/**
 * Página de Registro de Clientes.
 * HU-02: Registro público forzando el rol CLIENTE y manejo de errores amigables.
 * Cumple con DESIGN.md: Colores (#000f3f), Tipografía Inter y Enterprise Minimalism.
 */
export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/autenticacion/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }

      // Registro exitoso, redirigir al login
      router.push('/autenticacion/inicio-sesion?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-4 sm:p-8 font-sans">
      <main className="w-full max-w-[1024px] grid grid-cols-1 md:grid-cols-2 bg-surface rounded-xl overflow-hidden border border-slate-200 shadow-xl shadow-primary/5">
        
        {/* Mitad Izquierda: Branding - Deep Navy (#000f3f) */}
        <div className="hidden md:flex flex-col justify-between p-8 xl:p-12 bg-primary text-white relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              alt="Fondo Técnico Automotriz" 
              className="w-full h-full object-cover grayscale contrast-125 opacity-40" 
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent"></div>
          </div>

          <div className="z-10 relative">
            <div className="flex items-center gap-2 mb-8">
              <span className="material-symbols-outlined text-[32px] text-blue-400">precision_manufacturing</span>
              <h1 className="text-2xl font-semibold tracking-tight">AutoCore Pro</h1>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">El Control de tu Vehículo en tus Manos</h2>
            <p className="text-base text-blue-100/80 max-w-[320px] leading-relaxed mb-8">
              Accede a nuestro portal de clientes para realizar el seguimiento de tus órdenes de servicio en tiempo real.
            </p>
          </div>
          
          <div className="z-10 relative flex flex-col gap-4 mt-8">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-400">check_circle</span>
              <span className="text-sm font-medium">Seguimiento en Tiempo Real</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-400">check_circle</span>
              <span className="text-sm font-medium">Historial Digital</span>
            </div>
          </div>
        </div>

        {/* Mitad Derecha: Formulario de Registro */}
        <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-2">Crear Cuenta</h2>
            <p className="text-sm text-secondary">Ingresa tus datos personales para comenzar.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Nombre Completo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1" htmlFor="fullName">
                Nombre Completo
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">person</span>
                <input 
                  className="w-full pl-11 pr-4 py-3 rounded-md border border-slate-200 bg-background focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm outline-none text-on-surface" 
                  id="fullName" 
                  name="fullName" 
                  placeholder="Juan Pérez" 
                  required 
                  type="text"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            {/* Correo Electrónico */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1" htmlFor="email">
                Correo Electrónico
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">mail</span>
                <input 
                  className="w-full pl-11 pr-4 py-3 rounded-md border border-slate-200 bg-background focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm outline-none text-on-surface" 
                  id="email" 
                  name="email" 
                  placeholder="correo@taller.com" 
                  required 
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1" htmlFor="password">
                Contraseña
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">lock</span>
                <input 
                  className="w-full pl-11 pr-4 py-3 rounded-md border border-slate-200 bg-background focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm outline-none text-on-surface" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-error text-xs font-bold rounded-md border border-red-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}

            {/* Botón de Enviar */}
            <button 
              className="w-full mt-4 bg-primary text-white py-3.5 px-6 rounded-md text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary-container transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-70" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              {!isLoading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </form>

          {/* Enlace de Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-secondary">
              ¿Ya tienes una cuenta?{' '}
              <Link className="text-primary font-bold hover:underline ml-1 uppercase tracking-widest text-[11px]" href="/autenticacion/inicio-sesion">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
