"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import Icon from "@/components/ui/Icon";

export default function UnauthorizedPage() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
      <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-4xl text-rose-500 animate-pulse">
        <Icon name="warning" size={40} />
      </div>
      
      <div className="space-y-2 max-w-md">
        <h1 className="text-3xl font-black text-white tracking-tight">Acceso Restringido</h1>
        <p className="text-sm text-slate-400">
          Lo sentimos, tu rol actual (<span className="text-rose-450 font-bold">{user?.rol || "Sin Rol"}</span>) no tiene los privilegios necesarios de lectura o escritura para este módulo de negocio.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link
          href="/"
          className="px-6 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 text-sm font-semibold rounded-xl transition duration-150"
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
    </div>
  );
}
