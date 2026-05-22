import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary font-sans">Panel de Control Administrador</h1>
        <p className="text-secondary font-medium">Bienvenido al sistema de gestión AutoCore Pro</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI Cards Placeholder */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Órdenes Activas</h3>
          <p className="text-4xl font-bold text-primary">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Vehículos en Taller</h3>
          <p className="text-4xl font-bold text-primary">8</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Mecánicos Disponibles</h3>
          <p className="text-4xl font-bold text-primary">5</p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold text-primary mb-4 font-sans">Acciones Rápidas</h2>
        <div className="flex gap-4">
          <button className="bg-primary text-white px-4 py-2 rounded-md font-bold text-sm">Nueva Orden</button>
          <button className="bg-white text-primary border border-primary px-4 py-2 rounded-md font-bold text-sm">Registrar Vehículo</button>
        </div>
      </div>
    </div>
  );
}
