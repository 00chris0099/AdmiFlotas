"use client";

import React, { useState, FormEvent } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import Icon from "@/components/ui/Icon";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError("Credenciales inválidas.");
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Header - Logo único */}
      <header className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Icon name="truck" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-sm text-emerald-400 tracking-tight">SAF ERP</h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Manual F1T02</p>
          </div>
        </div>
      </header>

      {/* Formulario centrado */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">Iniciar Sesión</h2>
              <p className="text-xs text-slate-400 mt-1">Ingrese sus credenciales institucionales</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2.5 text-xs text-rose-400 font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Correo</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@empresa.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none transition"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none transition"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    tabIndex={-1}
                  >
                    <Icon name={showPassword ? "eye-hide" : "eye"} size={16} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-lg transition text-sm"
              >
                {isLoading ? "Ingresando..." : "Iniciar Sesión"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
