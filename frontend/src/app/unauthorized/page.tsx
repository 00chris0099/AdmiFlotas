"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import Icon from "@/components/ui/Icon";

export default function UnauthorizedPage() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-rose-500/5 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[120px]" />

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

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 space-y-6">
        <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center animate-pulse">
          <Icon name="warning" size={40} />
        </div>
        
        <div className="space-y-2 max-w-md">
          <h1 className="text-3xl font-black text-white tracking-tight">Acceso Restringido</h1>
          <p className="text-sm text-slate-400">
            Lo sentimos, tu rol actual (<span className="text-rose-400 font-bold">{user?.rol || "Sin Rol"}</span>) no tiene los privilegios necesarios para este módulo.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/"
            className="px-6 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-sm font-semibold rounded-xl transition duration-150"
          >
            Volver al Inicio
          </Link>
          <button
            onClick={logout}
            className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-slate-950 text-sm font-bold rounded-xl transition duration-150"
          >
            Cerrar Sesión e Ingresar con otro Rol
          </button>
        </div>
      </main>
    </div>
  );
}
