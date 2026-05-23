'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Layout para el portal de clientes.
 * Sincronizado con el estilo visual de Admin y Mecánico (Deep Navy TopBar).
 */
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [userName, setUserName] = useState('Cliente');

  useEffect(() => {
    // Obtener información de sesión desde la API segura
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/autenticacion');
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            setUserName(data.user.name);
          }
        }
      } catch (error) {
        console.error('Error al recuperar sesión:', error);
      }
    };

    fetchSession();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/autenticacion', {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/autenticacion/inicio-sesion');
        router.refresh();
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* Navbar para clientes - Azul Deep Navy (#172554) para consistencia global */}
      <header className="bg-primary-container text-white px-6 py-3.5 flex justify-between items-center shadow-md z-40 sticky top-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight">AutoCore Pro</h1>
          <span className="h-4 w-[1px] bg-white/20"></span>
          <span className="text-xs font-bold uppercase tracking-widest text-on-primary-container">Portal Clientes</span>
        </div>
        
        <nav className="flex gap-6 items-center">
          <div className="hidden md:flex gap-6 mr-4 border-r border-white/10 pr-6">
            <a href="/cliente" className="text-[13px] font-bold text-white hover:text-white/80 transition-colors">Inicio</a>
            <a href="#" className="text-[13px] font-semibold text-on-primary-container hover:text-white transition-colors">Mis Vehículos</a>
          </div>

          {/* Perfil del Cliente */}
          <div className="flex items-center gap-3 pr-2">
            <div className="text-right hidden sm:block">
              <p className="text-[12px] font-bold text-white leading-tight">{userName || 'Cliente'}</p>
              <p className="text-[10px] font-bold text-on-primary-container uppercase tracking-tight">Propietario</p>
            </div>
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white text-[10px] font-black shadow-sm uppercase border border-white/10">
              {(userName || 'CL').substring(0, 2)}
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-[11px] font-black text-red-300 hover:text-red-200 uppercase tracking-widest transition-colors ml-2"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span className="hidden sm:inline">Salir</span>
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 container-max mx-auto w-full p-6">
        <div className="max-w-[1280px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
