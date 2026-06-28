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
        </form>

        <div className="border-t border-slate-800/80 pt-4 space-y-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Acceso Rápido (Seeding / Roles F1T02)
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
            <button
              onClick={() => handleQuickLogin("anchillo00@gmail.com")}
              className="px-3 py-2 bg-slate-950 hover:bg-slate-850 border border-amber-500/30 hover:border-amber-500/50 rounded-xl text-left text-xs transition duration-150 cursor-pointer"
            >
              <div className="font-bold text-amber-400 text-[10px] truncate">Anchillo Admin</div>
              <div className="text-[8px] text-amber-400 font-extrabold uppercase tracking-widest">SUPERADMIN</div>
            </button>

            <button
              onClick={() => handleQuickLogin("escriba.matto@flota.gob")}
              className="px-3 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-left text-xs transition duration-150 cursor-pointer"
            >
              <div className="font-bold text-white text-[10px] truncate">Escriba Matto</div>
              <div className="text-[8px] text-indigo-400 font-extrabold uppercase tracking-widest">JEFE PROCESO</div>
            </button>

            <button
              onClick={() => handleQuickLogin("ventura.chipana@flota.gob")}
              className="px-3 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-left text-xs transition duration-150 cursor-pointer"
            >
              <div className="font-bold text-white text-[10px] truncate">Ventura Chipana</div>
              <div className="text-[8px] text-emerald-400 font-extrabold uppercase tracking-widest">ADMIN 1</div>
            </button>

            <button
              onClick={() => handleQuickLogin("quiroz.torres@flota.gob")}
              className="px-3 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-left text-xs transition duration-150 cursor-pointer"
            >
              <div className="font-bold text-white text-[10px] truncate">Quiroz Torres</div>
              <div className="text-[8px] text-emerald-400 font-extrabold uppercase tracking-widest">ADMIN 2</div>
            </button>

            <button
              onClick={() => handleQuickLogin("leon.mejia@flota.gob")}
              className="px-3 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-left text-xs transition duration-150 cursor-pointer"
            >
              <div className="font-bold text-white text-[10px] truncate">Leon Mejia</div>
              <div className="text-[8px] text-amber-400 font-extrabold uppercase tracking-widest">CONDUCTOR 1</div>
            </button>

            <button
              onClick={() => handleQuickLogin("gomez.sanchez@flota.gob")}
              className="px-3 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-left text-xs transition duration-150 cursor-pointer"
            >
              <div className="font-bold text-white text-[10px] truncate">Gomez Sanchez</div>
              <div className="text-[8px] text-amber-400 font-extrabold uppercase tracking-widest">CONDUCTOR 2</div>
            </button>

            <button
              onClick={() => handleQuickLogin("montero.salazar@flota.gob")}
              className="px-3 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-left text-xs transition duration-150 cursor-pointer"
            >
              <div className="font-bold text-white text-[10px] truncate">Montero Salazar</div>
              <div className="text-[8px] text-cyan-400 font-extrabold uppercase tracking-widest">INSPECTOR</div>
            </button>

            <button
              onClick={() => handleQuickLogin("polanco.jimenez@flota.gob")}
              className="px-3 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-left text-xs transition duration-150 cursor-pointer"
            >
              <div className="font-bold text-white text-[10px] truncate">Polanco Jimenez</div>
              <div className="text-[8px] text-pink-400 font-extrabold uppercase tracking-widest">MECANICO 1</div>
            </button>

            <button
              onClick={() => handleQuickLogin("guerra.salas@flota.gob")}
              className="px-3 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-left text-xs transition duration-150 cursor-pointer"
            >
              <div className="font-bold text-white text-[10px] truncate">Guerra Salas</div>
              <div className="text-[8px] text-pink-400 font-extrabold uppercase tracking-widest">MECANICO 2</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
