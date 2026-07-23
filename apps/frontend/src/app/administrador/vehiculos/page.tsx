'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/apiClient';

interface Owner {
  id: string;
  name: string;
  email: string;
}

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  isActive: boolean;
  owner: Owner;
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

/**
 * Componente principal con Suspense para manejar searchParams (HU-03)
 * Incluye Edición, Gestión de Bajas y Refinamiento de Tabla.
 */
export default function VehiclesDirectoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-medium text-slate-500 text-sm">Sincronizando flota de vehículos...</div>}>
      <VehiclesContent />
    </Suspense>
  );
}

function VehiclesContent() {
  const [vehicles, setVehiculos] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Obtener término de búsqueda de la URL
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  // Estados de Control Locales
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Estado para Modal de Registro/Edición
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    ownerId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [vRes, cRes] = await Promise.all([
        fetchWithAuth(`/operaciones/vehicles?t=${Date.now()}`, { cache: 'no-store' }),
        fetchWithAuth(`/auth/users?t=${Date.now()}`, { cache: 'no-store' }) 
      ]);

      if (!vRes.ok || !cRes.ok) throw new Error('Error al cargar datos');
      
      const vData = await vRes.json();
      const cData = await cRes.json();
      
      const mappedVehicles = vData.map((v: any) => {
        const owner = cData.find((u: any) => u.id === v.ownerId);
        return {
          ...v,
          owner: owner ? { id: owner.id, name: owner.name, email: owner.email } : { id: v.ownerId, name: 'Desconocido', email: 'N/A' }
        };
      });
      
      setVehiculos(mappedVehicles);
      setClients(cData.filter((u: any) => u.role === 'CLIENTE' && u.isActive));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Lógica de Filtrado
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const search = urlQuery.toLowerCase();
      const matchesSearch = (
        v.plate.toLowerCase().includes(search) ||
        v.brand.toLowerCase().includes(search) ||
        v.model.toLowerCase().includes(search) ||
        v.owner.name.toLowerCase().includes(search)
      );
      return matchesSearch;
    });
  }, [vehicles, urlQuery]);

  // Lógica de Paginación Dinámica
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [urlQuery]);

  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(start, start + itemsPerPage);
  }, [filteredVehicles, currentPage]);

  const stats = useMemo(() => {
    return {
      total: vehicles.filter(v => v.isActive).length,
      brands: new Set(vehicles.filter(v => v.isActive).map(v => v.brand)).size,
      inactive: vehicles.filter(v => !v.isActive).length
    };
  }, [vehicles]);

  const handleOpenEdit = (vehicle: Vehicle) => {
    setIsEditing(true);
    setSelectedVehicleId(vehicle.id);
    setFormData({
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      ownerId: vehicle.owner.id
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (vehicle: Vehicle) => {
    const confirmMsg = vehicle.isActive 
      ? `¿Estás seguro de dar de baja el vehículo ${vehicle.plate}?`
      : `¿Deseas reactivar el vehículo ${vehicle.plate}?`;
    
    if (!confirm(confirmMsg)) return;

    try {
      const response = await fetchWithAuth(`/operaciones/vehicles/${vehicle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !vehicle.isActive })
      });
      
      if (response.ok) {
        setVehiculos(vehicles.map(v => v.id === vehicle.id ? { ...v, isActive: !v.isActive } : v));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = isEditing ? `/operaciones/vehicles/${selectedVehicleId}` : '/operaciones/vehicles';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      let errorMsg = 'Error al procesar vehículo';
      if (!response.ok) {
        try {
          const data = await response.json();
          errorMsg = data.error || errorMsg;
        } catch (e) {
          console.error('La respuesta de error no es JSON válido');
        }
        throw new Error(errorMsg);
      }
      
      setShowModal(false);
      setIsEditing(false);
      setSelectedVehicleId(null);
      setFormData({ plate: '', brand: '', model: '', year: new Date().getFullYear(), ownerId: '' });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary tracking-tight">Gestión de Vehículos</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Control de inventario y vinculación con propietarios</p>
        </div>
        <button 
          onClick={() => { setIsEditing(false); setShowModal(true); }}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-primary/90 transition-all shadow-sm active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>REGISTRAR VEHÍCULO</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard label="FLOTA ACTIVA" value={stats.total} icon="directions_car" />
        <KpiCard label="MARCAS REGISTRADAS" value={stats.brands} icon="stars" />
        <div className="bg-white border border-slate-100 shadow-sm rounded-lg p-4 flex flex-col gap-1 relative overflow-hidden">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">ALERTA DE RETIRO</span>
          <div className="flex items-end gap-2 relative z-10">
            <span className="text-2xl font-bold text-red-600">{stats.inactive}</span>
            <span className="text-slate-400 text-[11px] font-bold mb-0.5 uppercase">Fuera de Servicio</span>
          </div>
          <div className="absolute right-0 bottom-0 text-slate-50 pointer-events-none translate-x-2 translate-y-2 opacity-30">
            <span className="material-symbols-outlined text-[60px]">delete_sweep</span>
          </div>
        </div>
      </div>

      {/* Tabla de Vehículos - Distribución Uniforme */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="w-[15%] px-6 py-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50">Placa</th>
                <th className="w-[15%] px-6 py-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50">Marca</th>
                <th className="w-[20%] px-6 py-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50">Modelo / Año</th>
                <th className="w-[30%] px-6 py-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50">Dueño (Cliente)</th>
                <th className="w-[20%] px-6 py-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50 text-right">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs font-medium">Cargando base de datos...</td></tr>
              ) : paginatedVehicles.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs font-medium">No se encontraron unidades registradas.</td></tr>
              ) : (
                paginatedVehicles.map(v => (
                  <tr key={v.id} className={`hover:bg-slate-50/80 transition-colors ${!v.isActive ? 'bg-slate-50/50' : ''}`}>
                    <td className="px-6 py-4">
                      <span className={`text-base font-black tracking-tight font-mono ${!v.isActive ? 'text-slate-400 line-through decoration-2' : 'text-primary'}`}>
                        {v.plate}
                      </span>
                    </td>
                    <td className={`px-6 py-4 uppercase font-bold text-xs ${!v.isActive ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {v.brand}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-xs font-semibold truncate ${!v.isActive ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{v.model}</div>
                      <div className="text-[10px] font-bold text-slate-400">{v.year}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className={`text-xs font-bold leading-tight truncate ${!v.isActive ? 'text-slate-400' : 'text-slate-800'}`}>
                          {v.owner.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium truncate">{v.owner.email}</div>
                        {!v.isActive && (
                          <span className="text-[9px] font-black text-red-500 uppercase mt-0.5 tracking-tighter">Unidad de Baja</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(v)}
                          className="p-1.5 rounded-md text-primary border border-slate-200 hover:bg-blue-50 transition-colors"
                          title="Editar Vehículo"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(v)}
                          className={`p-1.5 rounded-md border transition-colors ${
                            v.isActive 
                            ? 'text-red-500 border-red-50 hover:bg-red-50' 
                            : 'text-green-600 border-green-50 hover:bg-green-50'
                          }`}
                          title={v.isActive ? "Dar de Baja" : "Reactivar"}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {v.isActive ? 'delete' : 'restore_from_trash'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="px-6 py-3 border-t border-slate-100 flex justify-between items-center bg-slate-50/20">
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
            Mostrando {paginatedVehicles.length} de {filteredVehicles.length} unidades
          </p>
          <div className="flex gap-1.5 items-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded text-[10px] font-black transition-all ${
                  currentPage === page 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-slate-500 hover:bg-white hover:border-slate-200 border border-transparent'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Registro/Edición */}
      {showModal && (
        <div className="fixed inset-0 bg-primary/10 backdrop-blur-[2px] flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-8 border border-slate-100 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-primary">{isEditing ? 'Editar Vehículo' : 'Registrar Vehículo'}</h2>
                <p className="text-sm text-slate-500 font-medium">Completa la información técnica de la unidad</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Placa</label>
                  <input 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-black uppercase"
                    required
                    placeholder="ABC-1234"
                    pattern="[A-Za-z]{3}-\d{4}"
                    title="Formato: 3 letras, guión, 4 números (Ej: ABC-1234)"
                    maxLength={8}
                    value={formData.plate}
                    onChange={e => {
                      let val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
                      if (val.length === 3 && !val.includes('-') && formData.plate.length < 3) {
                        val += '-';
                      }
                      setFormData({ ...formData, plate: val });
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Año</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold"
                    required
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Marca</label>
                <input 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-semibold"
                  required
                  placeholder="Ej: Toyota"
                  value={formData.brand}
                  onChange={e => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Modelo</label>
                <input 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-semibold"
                  required
                  placeholder="Ej: Hilux"
                  value={formData.model}
                  onChange={e => setFormData({ ...formData, model: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Dueño (Cliente)</label>
                <select 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-sm focus:border-primary outline-none transition-all font-bold text-primary cursor-pointer disabled:opacity-60"
                  required
                  value={formData.ownerId}
                  onChange={e => setFormData({ ...formData, ownerId: e.target.value })}
                  disabled={isEditing} // El dueño no se cambia en edición por integridad de historial
                >
                  <option value="">Seleccionar Cliente...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>
                {isEditing && <p className="text-[9px] text-slate-400 ml-1 italic">* El propietario no puede modificarse una vez vinculado.</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Registrar Auto')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, subValue, icon }: any) {
  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-lg p-4 flex flex-col gap-1 relative overflow-hidden group hover:shadow-md transition-all">
      <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{label}</span>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-primary leading-none">{value}</span>
        {subValue && (
          <span className="text-slate-400 text-[10px] font-bold mb-0.5 uppercase">{subValue}</span>
        )}
      </div>
      <div className="absolute right-0 bottom-0 text-slate-50 pointer-events-none translate-x-2 translate-y-2 group-hover:text-primary/5 transition-colors">
        <span className="material-symbols-outlined text-[60px]">{icon}</span>
      </div>
    </div>
  );
}
