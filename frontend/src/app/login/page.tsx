"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleQuickLogin = (emailStr: string) => {
    setEmail(emailStr);
    setPassword("saf123"); // Contraseña maestra/inicial configurada en el endpoint
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-3xl mb-2">
            🚛
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">SAF ERP</h2>
          <p className="text-xs text-slate-400">Sistema de Administración de Flotas | Manual F1T02</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-xs text-rose-400 font-semibold">
              {errorMessage}
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-slate-350 block mb-1">Correo Institucional</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre.apellido@flota.gob"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition duration-150"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-350 block mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition duration-150"
              required
            />
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
                const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
                const email = emailInput?.value;
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
    </div>
  );
}
