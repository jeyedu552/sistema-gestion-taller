'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

/**
 * Layout para el panel del mecánico.
 * Cumple con DESIGN.md: Colores (#172554), Tipografía (Inter), Bordes y Spacing.
 */
export default function MechanicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

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
    <div className="flex min-h-screen bg-background font-sans">
      {/* Sidebar - Cumple DESIGN.md: 240px, Deep Navy (#172554) */}
      <aside className="w-[240px] bg-primary-container text-white p-6 hidden md:flex flex-col border-r border-slate-200">
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-8 tracking-tight">AutoCore Pro</h2>
          <nav className="space-y-1">
            <div className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.1em] mb-4 ml-1">
              Terminal Mecánica
            </div>
            <a href="/mecanico" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white bg-white/10 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-lg">engineering</span>
              Mis Órdenes
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-lg">history</span>
              Historial
            </a>
          </nav>
        </div>

        {/* Botón de Cerrar Sesión - Cumple DESIGN.md: Ghost Style */}
        <div className="mt-auto pt-6 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors w-full text-left"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        {/* Barra superior móvil */}
        <div className="md:hidden bg-primary-container text-white p-4 flex justify-between items-center">
          <span className="font-bold">AutoCore Pro</span>
          <button onClick={handleLogout} className="material-symbols-outlined">logout</button>
        </div>
        
        <div className="container-max mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
