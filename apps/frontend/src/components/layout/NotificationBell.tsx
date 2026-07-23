'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { fetchWithAuth } from '@/lib/apiClient';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  orderId?: string;
}

export const NotificationBell = ({ userId, userRole, theme = 'dark' }: { userId: string, userRole: string, theme?: 'light' | 'dark' }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar notificaciones persistentes
  useEffect(() => {
    if (!userId) return;
    const stored = localStorage.getItem(`notifs_${userId}`);
    if (stored) {
      try {
        setNotifications(JSON.parse(stored).map((n: any) => ({...n, time: new Date(n.time)})));
      } catch (e) {}
    }
  }, [userId]);

  // Guardar notificaciones cuando cambian
  useEffect(() => {
    if (userId && notifications.length > 0) {
      localStorage.setItem(`notifs_${userId}`, JSON.stringify(notifications));
    } else if (userId && notifications.length === 0) {
      localStorage.removeItem(`notifs_${userId}`);
    }
  }, [notifications, userId]);

  // Cerrar al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar órdenes del usuario actual para saber de qué salas escuchar
  useEffect(() => {
    if (!userId) return;
    const loadOrders = async () => {
      try {
        const res = await fetchWithAuth('/operaciones/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (e) {
        console.error('Error fetching orders for notifications', e);
      }
    };
    loadOrders();
    
    // Enviar latido (heartbeat) de conexión activa
    const sendHeartbeat = () => {
      fetchWithAuth(`/auth/users/${userId}/heartbeat`, { method: 'PATCH' }).catch(() => {});
    };
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 10000); // Cada 10 segundos
    
    // Avisar desconexión al cerrar ventana
    const handleBeforeUnload = () => {
      // El backend registrará la última conexión por ausencia de heartbeats (pasados X minutos)
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId]);

  // Escuchar WebSockets
  useEffect(() => {
    if (!userId) return;
    
    // Si no es admin y no tiene órdenes, no escuchamos nada aún (hasta que le asignen una)
    // Pero es mejor escuchar siempre, y si coincide, notificar.
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
    const socket = io(socketUrl, { path: '/socket.io/', transports: ['websocket'] });

    const processMessage = (data: any): Notification | null => {
      if (data.senderId === userId) return null;
      let shouldNotify = false;
      let title = '';

      if (userRole === 'CLIENTE') {
        const isMyOrder = orders.some(o => o.id === data.room);
        if (isMyOrder && data.senderId === 'SYSTEM') {
          shouldNotify = true;
          title = 'Actualización del Taller';
        }
      } else if (userRole === 'MECANICO') {
        const isMyOrder = orders.some(o => o.id === data.room);
        if (isMyOrder && data.senderId !== 'SYSTEM') {
          shouldNotify = true;
          title = `Mensaje de ${data.senderName}`;
        }
      } else if (userRole === 'ADMIN') {
        if (data.room === 'admin_alerts') {
          shouldNotify = true;
          title = 'Alerta de Retiro';
        }
      }

      if (shouldNotify) {
        return {
          id: data.id || Math.random().toString(36).substr(2, 9),
          title,
          message: data.content,
          time: new Date(data.createdAt || new Date()),
          read: false,
          orderId: data.room
        };
      }
      return null;
    };

    socket.on('connect', () => {
      if (userRole === 'ADMIN') {
        socket.emit('requestHistory', 'admin_alerts');
      } else {
        orders.forEach(o => socket.emit('requestHistory', o.id));
      }
    });

    socket.on('chatHistory', (history: any[]) => {
      setNotifications(prev => {
        let newNotifs = [...prev];
        let changed = false;
        history.forEach(data => {
          const notif = processMessage(data);
          if (notif) {
            // Verificar si ya la tenemos basada en contenido y tiempo aproximado (1 min de tolerancia) o ID exacto
            const exists = newNotifs.some(n => 
              (n.id === notif.id) || 
              (n.message === notif.message && Math.abs(new Date(n.time).getTime() - notif.time.getTime()) < 60000)
            );
            if (!exists) {
              newNotifs.push(notif);
              changed = true;
            }
          }
        });
        if (changed) {
          return newNotifs.sort((a, b) => b.time.getTime() - a.time.getTime());
        }
        return prev;
      });
    });

    socket.on('newMessage', (data: any) => {
      const notif = processMessage(data);
      if (notif) {
        setNotifications(prev => {
          if (prev.some(n => n.message === notif.message && (new Date().getTime() - new Date(n.time).getTime() < 5000))) return prev;
          return [notif, ...prev];
        });
      }
    });

    return () => { socket.disconnect(); };
  }, [userId, orders, userRole]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpenDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Marcar todas como leídas al abrir
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleOpenDropdown}
        className={`p-2 rounded-full transition-colors relative flex items-center justify-center ${theme === 'light' ? 'text-slate-400 hover:bg-slate-50' : 'text-white hover:bg-white/10'}`}
      >
        <span className="material-symbols-outlined text-[20px]">notifications</span>
        
        {unreadCount > 0 && (
          <div className={`absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md border-2 animate-bounce ${theme === 'light' ? 'border-white' : 'border-[#172554]'}`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Menú Desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Notificaciones</h3>
            <span className="text-[10px] font-black uppercase text-primary/60 tracking-wider">
              {notifications.length} Totales
            </span>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <span className="material-symbols-outlined text-3xl mb-2 opacity-50">notifications_paused</span>
                <p className="text-xs font-medium">No tienes notificaciones nuevas</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[11px] font-black uppercase text-primary tracking-tight">
                        {notif.title}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400">
                        {notif.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-600 font-medium leading-snug line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
              <button 
                onClick={() => setNotifications([])}
                className="text-[10px] font-bold text-slate-500 hover:text-red-500 uppercase tracking-widest transition-colors"
              >
                Limpiar todas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
