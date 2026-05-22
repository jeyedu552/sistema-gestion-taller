'use client';

import React, { useState } from 'react';
import Link from 'next/link';

/**
 * Página de Restablecimiento de Contraseña.
 * Cumple con DESIGN.md: Enterprise Minimalism, Colores, Tipografía y Radios.
 */
export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setIsLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch (err: any) {
      setError('Ocurrió un error al procesar tu solicitud.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background font-sans items-center justify-center p-6">
      <div className="w-full max-w-[440px]">
        
        {/* Cabecera de Marca - Cumple DESIGN.md: Semibold 600 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-primary tracking-tight mb-2">AutoCore Pro</h1>
          <p className="text-sm font-medium text-secondary">
            Terminal de Administración • Workshop Management
          </p>
        </div>

        {/* Tarjeta de Formulario - Cumple DESIGN.md: Surface White, 1px Border Slate-200 */}
        <div className="bg-surface rounded-lg p-10 border border-slate-200 shadow-xl shadow-primary/5">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-primary">Nueva Contraseña</h2>
                <p className="text-sm text-secondary">
                  Ingresa tu nueva clave de acceso para asegurar tu cuenta en la terminal.
                </p>
              </div>

              {/* Campos de Contraseña - Cumple DESIGN.md: rounded-md (6px), Label Medium (500) */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label 
                    className="block text-xs font-semibold text-secondary uppercase tracking-wider ml-1" 
                    htmlFor="password"
                  >
                    Nueva Contraseña
                  </label>
                  <input 
                    className="w-full px-4 py-3 rounded-md border border-slate-200 bg-background text-on-surface text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    required 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label 
                    className="block text-xs font-semibold text-secondary uppercase tracking-wider ml-1" 
                    htmlFor="confirmPassword"
                  >
                    Confirmar Contraseña
                  </label>
                  <input 
                    className="w-full px-4 py-3 rounded-md border border-slate-200 bg-background text-on-surface text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all" 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    placeholder="••••••••" 
                    required 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-error-container text-error text-xs font-bold rounded-md border border-error/10">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {error}
                </div>
              )}

              {/* Botón Principal - Cumple DESIGN.md: Primary Style */}
              <button 
                className="w-full py-4 bg-primary text-white text-sm font-bold rounded-md hover:bg-primary-container transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-base">sync</span>
                    Actualizando...
                  </>
                ) : (
                  <>
                    Actualizar Contraseña
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6 text-center py-4">
              <div className="flex justify-center">
                <span className="material-symbols-outlined text-6xl text-green-600">check_circle</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-primary">¡Contraseña Actualizada!</h2>
                <p className="text-sm text-secondary">
                  Tu contraseña ha sido restablecida con éxito. Ya puedes ingresar a la plataforma.
                </p>
              </div>
              <Link 
                href="/autenticacion/inicio-sesion"
                className="block w-full py-4 bg-primary text-white text-sm font-bold rounded-md hover:bg-primary-container transition-all shadow-lg shadow-primary/20"
              >
                Volver al Inicio de Sesión
              </Link>
            </div>
          )}
        </div>

        {/* Enlace de Footer */}
        {!isSubmitted && (
          <div className="mt-8 text-center">
            <Link className="text-sm font-bold text-primary hover:underline decoration-2 underline-offset-4 uppercase tracking-widest text-[11px]" href="/autenticacion/inicio-sesion">
              Cancelar y volver
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
