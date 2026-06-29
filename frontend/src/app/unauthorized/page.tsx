"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import Icon from "@/components/ui/Icon";

export default function UnauthorizedPage() {
  const { logout, user } = useAuth();

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

      {/* Contenido centrado */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mb-6">
          <Icon name="warning" size={32} />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Acceso Restringido</h1>
        <p className="text-sm text-slate-400 max-w-sm mb-8">
          Tu rol (<span className="text-rose-400 font-medium">{user?.rol || "Sin Rol"}</span>) no tiene permisos para este módulo.
        </p>

        <div className="flex gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-sm font-medium rounded-lg transition"
          >
            Inicio
          </Link>
          <button
            onClick={logout}
            className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </main>
    </div>
  );
}
