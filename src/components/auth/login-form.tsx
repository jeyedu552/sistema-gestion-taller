'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth';

export const LoginForm = () => {
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
      const response = await fetch('/api/autenticacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Credenciales inválidas');
      }

      const path = AuthService.getRedirectPathByRole(data.user.role);
      router.push(path);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px]">
      <div className="mb-10 text-left">
        <h1 className="text-4xl font-bold text-[#000f3f] font-sans tracking-tight mb-2">AutoCore Pro</h1>
        <p className="text-[#505f76] text-sm font-medium font-sans">
          Admin Terminal • Workshop Management System
        </p>
      </div>

      <div className="bg-white p-10 rounded-[24px] border border-slate-200 shadow-xl shadow-blue-900/5">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label 
              htmlFor="email" 
              className="block text-xs font-bold text-[#505f76] uppercase tracking-[0.1em] font-sans ml-1"
            >
              Work Email
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                mail
              </span>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-[#fbf8fd] border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-sans text-sm text-[#1b1b1f]"
                placeholder="name@workshop.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label 
                htmlFor="password" 
                className="block text-xs font-bold text-[#505f76] uppercase tracking-[0.1em] font-sans"
              >
                Password
              </label>
              <Link 
                href="/autenticacion/olvido-contrasena" 
                className="text-[11px] font-bold text-primary hover:underline font-sans uppercase tracking-wider"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                lock
              </span>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-[#fbf8fd] border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-sans text-sm text-[#1b1b1f]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center ml-1">
            <input
              id="remember"
              type="checkbox"
              className="h-4.5 w-4.5 text-primary focus:ring-primary border-slate-300 rounded-md"
            />
            <label htmlFor="remember" className="ml-3 block text-xs text-[#505f76] font-semibold font-sans">
              Stay signed in on this device
            </label>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 text-[#ba1a1a] text-xs font-bold rounded-xl border border-red-100 font-sans">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#000f3f] text-white py-4 px-6 rounded-xl font-bold text-sm hover:bg-[#172554] transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-base">sync</span>
                Authenticating...
              </>
            ) : (
              <>
                Sign In to Terminal
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative flex items-center justify-center mb-8">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Or access via</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
              <span className="text-xs font-bold text-slate-700">Google</span>
            </button>
            <button className="flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <img src="https://www.microsoft.com/favicon.ico" className="w-4 h-4" alt="Microsoft" />
              <span className="text-xs font-bold text-slate-700">Microsoft</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-6">
        <Link 
          href="/autenticacion/registro" 
          className="text-xs font-bold text-primary hover:underline font-sans uppercase tracking-[0.1em]"
        >
          New to the platform? Create workspace
        </Link>
        
        <div className="flex items-center gap-6 opacity-40">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#505f76] uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">encrypted</span>
            Secure AES-256
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#505f76] uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">terminal</span>
            v4.2.0-stable
          </div>
        </div>
      </div>
    </div>
  );
};
