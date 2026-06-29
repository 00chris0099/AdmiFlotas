"use client";

import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import Icon from "@/components/ui/Icon";

interface PermisoUsuario {
  id: string;
  usuarioId: string;
  otorgadoEn: string;
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
}

interface Permiso {
  id: string;
  modulo: string;
  accion: string;
  descripcion: string | null;
  usuarios: PermisoUsuario[];
}

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  activo: boolean;
}

const MODULOS = [
  "vehiculos",
  "movimiento_diario",
  "combustible",
  "mantenimiento",
  "llantas",
  "costos",
  "reportes",
  "configuracion",
];

const ACCIONES = ["crear", "leer", "actualizar", "eliminar"];

const MODULO_LABELS: Record<string, string> = {
  vehiculos: "Vehículos",
  movimiento_diario: "Movimiento Diario",
  combustible: "Combustible",
  mantenimiento: "Mantenimiento",
  llantas: "Llantas",
  costos: "Costos",
  reportes: "Reportes",
  configuracion: "Configuración",
};

const ACCION_COLORS: Record<string, string> = {
  crear: "bg-emerald-500/20 text-emerald-400",
  leer: "bg-blue-500/20 text-blue-400",
  actualizar: "bg-amber-500/20 text-amber-400",
  eliminar: "bg-rose-500/20 text-rose-400",
};

export default function PermisosPage() {
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      const res = await fetchWithAuth("/api/admin/permisos");
      const data = await res.json();

      if (data.permisos && data.usuarios) {
        setPermisos(data.permisos);
        setUsuarios(data.usuarios);
      }
    } catch (err) {
      console.error("Error al cargar permisos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    setMessage(null);
  }, [selectedUserId]);

  const isPermisoAssigned = (permiso: Permiso): boolean => {
    if (!selectedUserId) return false;
    return permiso.usuarios.some((pu) => pu.usuarioId === selectedUserId);
  };

  const getPermisoUsuarioId = (permiso: Permiso): string | undefined => {
    const pu = permiso.usuarios.find((pu) => pu.usuarioId === selectedUserId);
    return pu?.id;
  };

  const handleTogglePermiso = async (permiso: Permiso) => {
    if (!selectedUserId) return;

    const assigned = isPermisoAssigned(permiso);
    setIsSaving(true);

    try {
      if (assigned) {
        const res = await fetchWithAuth(
          `/api/admin/permisos?usuarioId=${selectedUserId}&permisoId=${permiso.id}`,
          { method: "DELETE" }
        );
        const data = await res.json();

        if (res.ok) {
          setMessage({ type: "success", text: data.message });
          await cargarDatos();
        } else {
          setMessage({ type: "error", text: data.message || "Error al remover permiso" });
        }
      } else {
        const res = await fetchWithAuth("/api/admin/permisos", {
          method: "POST",
          body: JSON.stringify({ usuarioId: selectedUserId, permisoId: permiso.id }),
        });
        const data = await res.json();

        if (res.ok) {
          setMessage({ type: "success", text: data.message });
          await cargarDatos();
        } else {
          setMessage({ type: "error", text: data.message || "Error al asignar permiso" });
        }
      }
    } catch (err) {
      console.error("Error al modificar permiso:", err);
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedUser = usuarios.find((u) => u.id === selectedUserId);

  const assignedCount = permisos.filter((p) => isPermisoAssigned(p)).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon name="key-lock" size={24} />
          <h1 className="text-2xl font-bold text-white">Gestión de Permisos</h1>
        </div>
        <span className="text-sm text-slate-400">Total: {permisos.length} permisos</span>
      </div>

      {/* Selector de usuario */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Seleccionar Usuario
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">-- Seleccionar usuario --</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} {u.apellido} ({u.rol.replace(/_/g, " ")})
                </option>
              ))}
            </select>
          </div>
          <div>
            {selectedUser && (
              <div className="text-sm text-slate-400">
                <span className="font-medium text-emerald-400">{assignedCount}</span> de{" "}
                {permisos.length} permisos asignados
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mensaje de feedback */}
      {message && (
        <div
          className={`px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Matriz de permisos */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Cargando permisos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-700">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Módulo
                  </th>
                  {ACCIONES.map((accion) => (
                    <th
                      key={accion}
                      className="text-center px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider"
                    >
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ACCION_COLORS[accion] || ""
                        }`}
                      >
                        {accion}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {MODULOS.map((modulo) => (
                  <tr key={modulo} className="hover:bg-slate-700/30 transition duration-150">
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      {MODULO_LABELS[modulo] || modulo}
                    </td>
                    {ACCIONES.map((accion) => {
                      const permiso = permisos.find(
                        (p) => p.modulo === modulo && p.accion === accion
                      );
                      const assigned = permiso ? isPermisoAssigned(permiso) : false;

                      return (
                        <td key={accion} className="px-4 py-3 text-center">
                          {permiso ? (
                            <button
                              onClick={() => handleTogglePermiso(permiso)}
                              disabled={!selectedUserId || isSaving}
                              className={`w-8 h-8 rounded-lg border-2 transition duration-150 flex items-center justify-center mx-auto ${
                                assigned
                                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 hover:bg-rose-500/20 hover:border-rose-500 hover:text-rose-400"
                                  : "bg-slate-900 border-slate-600 text-slate-500 hover:border-emerald-500 hover:text-emerald-400"
                              } ${!selectedUserId ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                              title={
                                !selectedUserId
                                  ? "Seleccione un usuario primero"
                                  : assigned
                                    ? `Quitar permiso ${accion}`
                                    : `Asignar permiso ${accion}`
                              }
                            >
                              {assigned ? <Icon name="check" size={16} /> : <span className="text-xs">+</span>}
                            </button>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
            <Icon name="check" size={10} />
          </span>
          <span>Asignado</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-slate-900 border border-slate-600 flex items-center justify-center text-[10px]">
            +
          </span>
          <span>No asignado</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-600">-</span>
          <span>Permiso no encontrado</span>
        </div>
      </div>
    </div>
  );
}
