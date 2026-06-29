"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import Icon from "@/components/ui/Icon";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    const success = await login(email, password);
    setIsLoading(false);
    if (!success) {
      setErrorMessage("Credenciales inválidas. Verifique su email y contraseña.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[120px]" />

      {/* Header with logo */}
      <header className="relative z-20 px-6 py-4">
        <Link href="/" className="flex items-center space-x-3 cursor-pointer w-fit">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Icon name="truck" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-sm text-emerald-400 tracking-tight">SAF ERP</h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Manual F1T02</p>
          </div>
        </Link>
      </header>

      {/* Main content - centered form */}
      <main className="flex-1 flex items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">Iniciar Sesión</h2>
            <p className="text-xs text-slate-400">Sistema de Administración de Flotas</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-xs text-rose-400 font-semibold">
                {errorMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Correo Institucional</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre.apellido@flota.gob"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition duration-150"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none transition duration-150"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  <Icon name={showPassword ? "eye-hide" : "eye"} size={16} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 font-bold rounded-xl transition duration-150 shadow-lg text-sm"
            >
              {isLoading ? "Validando credenciales..." : "Iniciar Sesión"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  if (email) {
                    fetch("/api/auth/recuperar-password", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email }),
                    }).then(() => {
                      setErrorMessage("Si el correo existe, recibirás un enlace de recuperación.");
                    });
                  } else {
                    setErrorMessage("Ingresa tu correo para recuperar la contraseña.");
                  }
                }}
                className="text-[10px] text-slate-500 hover:text-slate-300 transition"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
