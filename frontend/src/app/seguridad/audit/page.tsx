"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Icon from "@/components/ui/Icon";

interface AuditLog {
  id: string;
  usuarioId: string | null;
  accion: string;
  modulo: string;
  entidad: string;
  entidadId: string | null;
  datosAntes: string | null;
  datosDespues: string | null;
  ipAddress: string | null;
  descripcion: string | null;
  creadoEn: string;
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
  } | null;
}

const ACCION_COLORS: Record<string, string> = {
  CREAR: "bg-emerald-500/20 text-emerald-400",
  ACTUALIZAR: "bg-blue-500/20 text-blue-400",
  ELIMINAR: "bg-rose-500/20 text-rose-400",
  LOGIN: "bg-indigo-500/20 text-indigo-400",
  LOGOUT: "bg-slate-500/20 text-slate-400",
  CONSULTAR: "bg-amber-500/20 text-amber-400",
  EXPORTAR: "bg-cyan-500/20 text-cyan-400",
  CONFIGURAR: "bg-violet-500/20 text-violet-400",
  ALERTA_MANTENIMIENTO: "bg-orange-500/20 text-orange-400",
};

const MODULOS = [
  "seguridad",
  "flota",
  "operaciones",
  "mantenimiento",
  "control_costos",
  "control_combustible",
  "control_mantenimiento",
  "control_llantas",
  "conductores",
  "movimientos_diarios",
  "reportes",
  "configuracion",
];

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroModulo, setFiltroModulo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const cargarAuditorias = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAuditLogs({
        modulo: filtroModulo || undefined,
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
      });
      if (Array.isArray(data)) {
        setLogs(data);
      }
    } catch (err) {
      console.error("Error al cargar auditorías:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarAuditorias();
  }, []);

  const handleFilter = () => {
    cargarAuditorias();
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon name="eye" size={24} />
          <h1 className="text-2xl font-bold text-white">Auditoría del Sistema</h1>
        </div>
        <span className="text-sm text-slate-400">Total: {logs.length} registros</span>
      </div>

      {/* Filtros */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Módulo
            </label>
            <select
              value={filtroModulo}
              onChange={(e) => setFiltroModulo(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Todos los módulos</option>
              {MODULOS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleFilter}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition duration-150"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Auditorías */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Cargando registros...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No se encontraron registros de auditoría</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-700">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Acción
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Módulo
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Entidad
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-700/30 transition duration-150">
                    <td className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap">
                      {formatFecha(log.creadoEn)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ACCION_COLORS[log.accion] || "bg-slate-500/20 text-slate-400"
                        }`}
                      >
                        {log.accion}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300 capitalize">{log.modulo}</td>
                    <td className="px-4 py-3 text-sm text-slate-300 capitalize">{log.entidad}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {log.usuario ? (
                        <div>
                          <div className="font-medium text-white">
                            {log.usuario.nombre} {log.usuario.apellido}
                          </div>
                          <div className="text-xs text-slate-400">{log.usuario.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500">Sistema</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400 max-w-xs truncate">
                      {log.descripcion || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400 font-mono">
                      {log.ipAddress || "-"}
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
