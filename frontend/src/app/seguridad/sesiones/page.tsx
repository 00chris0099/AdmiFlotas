"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Icon from "@/components/ui/Icon";
import { useConfirm } from "@/components/ui/ConfirmDialog";

interface Sesion {
  id: string;
  token: string;
  ipAddress: string | null;
  userAgent: string | null;
  estado: string;
  iniciadaEn: string;
  expiraEn: string;
  cerradaEn: string | null;
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
  };
}

const ROL_COLORS: Record<string, string> = {
  JEFE_PROCESO: "bg-purple-500/20 text-purple-400",
  ADMINISTRATIVO: "bg-blue-500/20 text-blue-400",
  JEFE_OPERACION: "bg-amber-500/20 text-amber-400",
  JEFE_MANTENIMIENTO: "bg-orange-500/20 text-orange-400",
  CONDUCTOR: "bg-emerald-500/20 text-emerald-400",
  MECANICO: "bg-red-500/20 text-red-400",
  ELECTRICISTA: "bg-red-500/20 text-red-400",
  INSPECTOR: "bg-cyan-500/20 text-cyan-400",
  ANALISTA: "bg-violet-500/20 text-violet-400",
  ENCARGADO_TALLER: "bg-orange-500/20 text-orange-400",
  LAVADOR: "bg-sky-500/20 text-sky-400",
  CONTROLADOR_TRANSITO: "bg-teal-500/20 text-teal-400",
};

export default function SesionesPage() {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { confirm } = useConfirm();

  const cargarSesiones = async () => {
    try {
      setIsLoading(true);
      const data = await api.getSesiones();
      if (Array.isArray(data)) {
        setSesiones(data);
      }
    } catch (err) {
      console.error("Error al cargar sesiones:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarSesiones();
  }, []);

  const handleCerrarSesion = async (sesionId: string) => {
    const ok = await confirm({ message: "¿Está seguro que desea cerrar esta sesión?", variant: "danger" });
    if (!ok) return;

    try {
      await api.cerrarSesion(sesionId);
      setSesiones((prev) => prev.filter((s) => s.id !== sesionId));
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatExpiraEn = (fecha: string) => {
    const date = new Date(fecha);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diff < 0) {
      return "Expirada";
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon name="lock" size={24} />
          <h1 className="text-2xl font-bold text-white">Control de Sesiones</h1>
        </div>
        <span className="text-sm text-slate-400">Total: {sesiones.length} sesiones activas</span>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Cargando sesiones...</div>
        ) : sesiones.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No hay sesiones activas en el sistema</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-700">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Iniciada
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Tiempo Restante
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    IP
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {sesiones.map((sesion) => (
                  <tr key={sesion.id} className="hover:bg-slate-700/30 transition duration-150">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-white">
                          {sesion.usuario.nombre} {sesion.usuario.apellido}
                        </div>
                        <div className="text-xs text-slate-400">{sesion.usuario.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ROL_COLORS[sesion.usuario.rol] || "bg-slate-500/20 text-slate-400"
                        }`}
                      >
                        {sesion.usuario.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap">
                      {formatFecha(sesion.iniciadaEn)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap">
                      {formatExpiraEn(sesion.expiraEn)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400 font-mono">
                      {sesion.ipAddress || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sesion.estado === "ACTIVA"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-slate-500/20 text-slate-400"
                        }`}
                      >
                        {sesion.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleCerrarSesion(sesion.id)}
                        className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-rose-400 bg-rose-500/10 rounded-lg hover:bg-rose-500/20 transition"
                      >
                        <Icon name="logout" size={14} />
                        <span className="ml-1">Cerrar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
