import React from 'react';

export default function MecanicoDashboard() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary font-sans">Mis Órdenes de Trabajo</h1>
        <p className="text-secondary font-medium">Panel de ejecución técnica - AutoCore Pro</p>
      </header>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <p className="text-secondary italic">No tienes órdenes asignadas para hoy.</p>
      </div>
    </div>
  );
}
