'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

/**
 * Layout Principal para el Panel de Administración.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');
  const [userName, setUserName] = useState('Administrador');

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
    
    // Sincronizar el término de búsqueda con la URL
    const params = new URLSearchParams(window.location.search);
    setSearchTerm(params.get('q') || '');
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/autenticacion', { method: 'DELETE' });
      if (response.ok) {
        router.push('/autenticacion/inicio-sesion');
        router.refresh();
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchTerm.trim();
    let targetPath = '/administrador/usuarios';
    if (pathname.includes('/vehiculos')) targetPath = '/administrador/vehiculos';
    if (pathname.includes('/ordenes')) targetPath = '/administrador/ordenes';

    if (query) {
      router.push(`${targetPath}?q=${encodeURIComponent(query)}`);
    } else {
      router.push(targetPath);
    }
  };

  const navLinks = [
    { href: '/administrador', label: 'Dashboard', icon: 'dashboard' },
    { href: '/administrador/ordenes', label: 'Órdenes de Servicio', icon: 'trolley' },
    { href: '/administrador/usuarios', label: 'Usuarios', icon: 'group' },
    { href: '/administrador/vehiculos', label: 'Vehículos', icon: 'directions_car' },
    { href: '/administrador/mecanicos', label: 'Mecánicos', icon: 'engineering' },
    { href: '/administrador/inventario', label: 'Inventario', icon: 'inventory_2' },
    { href: '/administrador/reportes', label: 'Reportes', icon: 'assessment' },
    { href: '/administrador/configuracion', label: 'Configuración', icon: 'settings' },
  ];

  return (
    <div className="bg-slate-50/50 text-slate-900 min-h-screen font-sans flex text-[13px]">
      
      {/* Sidebar - Deep Navy (#172554) */}
      <aside className="w-56 h-screen fixed left-0 top-0 bg-primary-container text-white flex flex-col py-5 z-50 border-r border-white/5">
        <div className="mb-6 px-6">
          <h1 className="text-lg font-bold tracking-tight">AutoCore Pro</h1>
          <p className="text-[10px] text-on-primary-container font-bold uppercase tracking-widest mt-0.5">Enterprise Workshop</p>
        </div>
        
        <nav className="flex-1 space-y-0.5 px-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/administrador');
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/10 text-white font-bold shadow-sm' 
                    : 'text-on-primary-container hover:bg-white/5 hover:text-white font-semibold' 
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-white' : 'text-on-primary-container'}`}>
                  {link.icon}
                </span>
                <span className="text-[13px]">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10 px-3 space-y-0.5">
          <Link href="/administrador/perfil" className="flex items-center gap-3 px-3 py-2 rounded-md text-on-primary-container hover:bg-white/5 hover:text-white font-semibold transition-colors">
            <span className="material-symbols-outlined text-[18px]">account_circle</span>
            <span className="text-[13px]">Mi Perfil</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-red-300 hover:bg-red-500/10 font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className="text-[13px]">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Area de Contenido */}
      <div className="flex-1 ml-56 flex flex-col min-h-screen">
        
        {/* Barra Superior */}
        <header className="h-14 sticky top-0 bg-white border-b border-slate-100 flex justify-between items-center px-6 z-40">
          <div className="flex items-center gap-4 w-1/2">
            <form onSubmit={handleSearch} className="relative w-full max-w-sm group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] group-focus-within:text-primary transition-colors">search</span>
              <input 
                className="w-full bg-slate-50 border border-slate-100 rounded-lg pl-9 pr-9 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary/30 transition-all outline-none placeholder:text-slate-400 text-slate-700 font-medium" 
                placeholder={pathname.includes('vehiculos') ? "Buscar placa, marca o dueño..." : "Buscar por nombre o correo..."}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    const target = pathname.includes('vehiculos') ? '/administrador/vehiculos' : '/administrador/usuarios';
                    router.push(target);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </form>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-slate-50 transition-colors text-slate-400">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            <div className="h-6 w-[1px] bg-slate-100"></div>
            <div className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 transition-colors p-1 rounded-md">
              <div className="text-right hidden lg:block">
                <p className="text-[12px] font-bold text-slate-800 leading-tight">{userName || 'Administrador'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Administrador</p>
              </div>
              <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-white text-[10px] font-black shadow-sm uppercase">
                {(userName || 'AD').substring(0, 2)}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 flex-1 bg-slate-50/10">
          <div className="max-w-[1280px] mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
