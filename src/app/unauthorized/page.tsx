import React from 'react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="text-center max-w-md p-8 bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="text-error mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-primary mb-2 font-sans">Acceso No Autorizado</h1>
        <p className="text-secondary mb-6 font-sans">
          No tienes los permisos necesarios para acceder a esta sección del sistema.
        </p>
        <Link 
          href="/" 
          className="inline-block bg-primary text-white py-2 px-6 rounded-md font-bold text-sm hover:bg-primary-container transition-colors"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
