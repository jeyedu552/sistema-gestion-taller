'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth';
import { fetchWithAuth } from '@/lib/apiClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Credenciales inválidas');
      }

      // 1. Guardar token para el API Client
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // 2. Establecer cookie de sesión para el Middleware de Next.js
      document.cookie = `session=${JSON.stringify(data.user)}; path=/; max-age=86400; samesite=strict`;

      // 3. Redirigir según el rol del usuario (HU-01)
      const path = AuthService.getRedirectPathByRole(data.user.role);
      router.push(path);
      router.refresh(); // Asegura que el middleware detecte la nueva cookie
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fbf8fd] font-sans">
      {/* Columna Izquierda: Formulario de Login */}
      <main className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24">
        <div className="w-full max-w-[440px]">
          
          {/* Cabecera de Marca */}
          <div className="text-left mb-8">
            <h1 className="text-3xl font-bold text-[#000f3f] mb-2">AutoCore Pro</h1>
            <p className="text-sm text-[#505f76]">Terminal de Administración • Sistema de Gestión de Taller</p>
          </div>

          {/* Tarjeta de Login */}
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Campo Correo */}
              <div>
                <label className="block text-xs font-semibold text-[#505f76] mb-1.5 uppercase tracking-wider" htmlFor="email">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <input 
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-[#fbf8fd] text-[#1b1b1f] text-sm focus:border-[#000f3f] focus:ring-2 focus:ring-[#000f3f]/10 outline-none transition-all duration-200" 
                    id="email" 
                    name="email" 
                    placeholder="correo@taller.com" 
                    required 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-[#505f76] uppercase tracking-wider" htmlFor="password">
                    Contraseña
                  </label>
                  <Link className="text-xs font-semibold text-[#000f3f] hover:underline decoration-2 underline-offset-4" href="/autenticacion/olvido-contrasena">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <input 
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-[#fbf8fd] text-[#1b1b1f] text-sm focus:border-[#000f3f] focus:ring-2 focus:ring-[#000f3f]/10 outline-none transition-all duration-200" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    required 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Recordar Sesión */}
              <div className="flex items-center gap-2">
                <input 
                  className="w-4 h-4 rounded border-slate-300 text-[#000f3f] focus:ring-[#000f3f] cursor-pointer" 
                  id="remember" 
                  name="remember" 
                  type="checkbox"
                />
                <label className="text-sm text-[#505f76] cursor-pointer" htmlFor="remember">
                  Mantener sesión iniciada en este dispositivo
                </label>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-[#ba1a1a] text-xs font-bold rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              {/* Botón Principal */}
              <button 
                className="w-full mt-2 py-3 bg-[#000f3f] text-white text-base font-semibold rounded-lg hover:bg-[#172554] transition-all active:scale-[0.98] shadow-sm disabled:opacity-70 disabled:cursor-not-allowed" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
              </button>
            </form>
          </div>

          {/* Enlaces de Footer */}
          <div className="mt-8">
            <p className="text-sm text-[#505f76]">
              ¿No tienes una cuenta?{' '}
              <Link className="text-[#000f3f] font-semibold hover:underline decoration-2 underline-offset-4" href="/autenticacion/registro">
                Crear cuenta
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Columna Derecha: Imagen de Fondo (Pantalla Dividida) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-[#000f3f]">
        <img 
          alt="Interior del Taller" 
          className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 opacity-40" 
          src="https://images.unsplash.com/photo-1613214149922-f1809c99b414?q=80&w=2070&auto=format&fit=crop" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#000f3f]/80 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-24">
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 max-w-md text-white">
            <h3 className="text-xl font-medium mb-2">Integración de Flotas Empresariales</h3>
            <p className="text-sm opacity-80 leading-relaxed">
              Gestiona operaciones complejas del taller con diagnósticos de precisión y sincronización de inventario en tiempo real en todas las sucursales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
