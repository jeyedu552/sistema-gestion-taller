'use client';

import React, { useState, useEffect, useRef } from 'react';

// Definimos la estructura de la notificación
interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notificaciones');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error('Error cargando notificaciones:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // Cerrar el panel al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Marcar como leídas en la base de datos
  const handleMarkAsRead = async () => {
    try {
      await fetch('/api/notificaciones', { method: 'PATCH' });
      // Actualizamos el estado local para quitar el puntito rojo
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error al marcar como leídas:', error);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    // Si abrimos el panel y hay no leídas, las marcamos como leídas
    if (!isOpen && unreadCount > 0) {
      handleMarkAsRead();
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de Campanilla */}
      <button 
        onClick={handleToggle}
        className="p-2 rounded-full hover:bg-slate-100 transition-colors relative flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        
        {/* Indicador Animado (Puntito Rojo) */}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
          </span>
        )}
      </button>

      {/* Panel Desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Notificaciones</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                {unreadCount} nuevas
              </span>
            )}
          </div>
          
          <div className="max-h-[320px] overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center flex flex-col items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[11px] font-medium text-slate-500">Cargando...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 mb-3">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                <p className="text-xs text-slate-500 font-medium">No tienes notificaciones por ahora</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`p-4 hover:bg-slate-50 transition-colors ${!notif.isRead ? 'bg-primary/5' : ''}`}>
                    <div className="flex gap-3">
                      <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${!notif.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                      <div>
                        <p className="text-xs font-bold text-slate-800 leading-tight">{notif.title}</p>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-2.5 uppercase tracking-widest">
                          {new Date(notif.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}