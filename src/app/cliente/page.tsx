import React from 'react';

export default function ClienteDashboard() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary font-sans">Mis Vehículos</h1>
        <p className="text-secondary font-medium">Estado actual de tus reparaciones en AutoCore Pro</p>
      </header>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <p className="text-secondary italic">No tienes vehículos registrados actualmente.</p>
      </div>
    </div>
  );
}
