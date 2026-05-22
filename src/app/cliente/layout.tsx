'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

/**
 * Layout para el portal de clientes.
 * Cumple con DESIGN.md: Enterprise Minimalism, Colores y Tipografía.
 */
export default function ClientLayout({
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
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Navbar para clientes - Cumple DESIGN.md: Surface White, 1px Border Slate-200 */}
      <header className="bg-surface border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-primary tracking-tight">AutoCore Pro</h1>
          <span className="h-4 w-[1px] bg-slate-200"></span>
          <span className="text-sm font-medium text-secondary">Portal de Clientes</span>
        </div>
        
        <nav className="flex gap-8 items-center">
          <a href="/cliente" className="text-sm font-semibold text-secondary hover:text-primary transition-colors">Mis Órdenes</a>
          <a href="#" className="text-sm font-semibold text-secondary hover:text-primary transition-colors">Perfil</a>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-bold text-error hover:text-error/80 uppercase tracking-widest transition-colors ml-4"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Cerrar Sesión
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 container-max mx-auto w-full p-6">
        {children}
      </main>
    </div>
  );
}
