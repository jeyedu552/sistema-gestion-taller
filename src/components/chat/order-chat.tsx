'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id?: string;
  text: string;
  createdAt: string;
  senderId: string;
  sender: {
    name: string;
    role: string;
  };
}

interface OrderChatProps {
  orderId: string;
  currentUserId: string;
  currentUserRole: string;
  isLocked: boolean; // Si la orden está FINALIZADA
}

/**
 * Componente de Chat Interactivo en Tiempo Real.
 * Refinado por Jefferson: Responsive, Colores Institucionales y Alineación inteligente.
 */
export const OrderChat = ({ orderId, currentUserId, currentUserRole, isLocked }: OrderChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();

    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join_order_chat', orderId);
    });

    socket.on('receive_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/chat/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error cargando historial de chat:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLocked || currentUserRole === 'ADMIN') return;

    const messageText = inputText.trim();
    setInputText('');

    try {
      const response = await fetch(`/api/chat/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageText })
      });

      if (response.ok) {
        const savedMessage = await response.json();
        socketRef.current?.emit('send_message', {
          ...savedMessage,
          orderId
        });
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  };

  return (
    <div className="flex flex-col h-[50vh] min-h-[350px] max-h-[500px] w-full bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      {/* Header del Chat */}
      <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {isConnected ? 'Canal en Vivo' : 'Sin Conexión'}
          </span>
        </div>
        {isLocked && (
          <span className="text-[9px] font-black text-white bg-slate-900 px-2 py-0.5 rounded-full uppercase tracking-tighter">
            Bloqueado
          </span>
        )}
      </div>

      {/* Area de Mensajes - Responsive */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 scrollbar-thin scrollbar-thumb-slate-200"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-30">
            <span className="material-symbols-outlined text-4xl mb-2">forum</span>
            <p className="text-[11px] font-bold uppercase tracking-widest">Sin mensajes previos</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUserId || msg.sender?.role === currentUserRole;
            return (
              <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-1 duration-300`}>
                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                  isMe 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                }`}>
                  {!isMe && (
                    <p className="text-[9px] font-black uppercase tracking-tighter text-primary/60 mb-1 flex items-center gap-1">
                      {msg.sender.name}
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      {msg.sender.role}
                    </p>
                  )}
                  <p className="text-[13px] font-medium leading-relaxed break-words">{msg.text}</p>
                </div>
                <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[9px] font-bold text-slate-400">
                    {new Date(msg.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && isConnected && <span className="material-symbols-outlined text-[10px] text-blue-400">done_all</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input de Texto - Adaptable */}
      {!isLocked && currentUserRole !== 'ADMIN' ? (
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
          <input 
            type="text"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium placeholder:text-slate-400"
            placeholder="Mensaje..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!inputText.trim()}
            className="w-11 h-11 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-container transition-all active:scale-90 disabled:opacity-30 shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-xl">send</span>
          </button>
        </form>
      ) : (
        <div className="p-4 bg-slate-100 text-center border-t border-slate-200">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">lock</span>
            {currentUserRole === 'ADMIN' ? 'Auditoría: Solo Lectura' : 'Chat Finalizado'}
          </p>
        </div>
      )}
    </div>
  );
};
