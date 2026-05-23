import React from 'react';
import Link from 'next/link';

/**
 * Página de Error 403 - Acceso No Autorizado.
 * Cumple con DESIGN.md: Colores de Error, Tipografía Inter y Enterprise Minimalism.
 */
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 font-sans">
      <div className="text-center max-w-md w-full p-10 bg-surface border border-slate-200 rounded-lg shadow-xl shadow-primary/5">
        <div className="text-error mb-6">
          <span className="material-symbols-outlined text-7xl font-light">
            gpp_bad
          </span>
        </div>
        
        <h1 className="text-3xl font-bold text-primary mb-3 tracking-tight">
          Acceso Restringido
        </h1>
        
        <p className="text-secondary mb-8 leading-relaxed">
          Lo sentimos, tu perfil de usuario no cuenta con los permisos necesarios para visualizar esta sección del terminal.
        </p>
        
        <div className="flex flex-col gap-4">
          <Link 
            href="/" 
            className="w-full bg-primary text-white py-3 px-6 rounded-md font-bold text-sm hover:bg-primary-container transition-all active:scale-[0.98] shadow-lg shadow-primary/10 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">home</span>
            Ir al Panel Principal
          </Link>
          
          <Link 
            href="/autenticacion/inicio-sesion" 
            className="w-full bg-white text-secondary border border-slate-200 py-3 px-6 rounded-md font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Cerrar Sesión e Iniciar con otra cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
