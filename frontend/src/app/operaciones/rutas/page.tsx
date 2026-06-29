"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import Icon from "@/components/ui/Icon";

interface Ruta {
  id: string;
  nombre: string;
  origen: string;
  destino: string;
  distanciaKm: number | null;
  tiempoEstimado: string | null;
  activa: boolean;
  totalProgramaciones: number;
  creadoEn: string;
}

interface Programacion {
  id: string;
  rutaId: string;
  rutaNombre: string;
  rutaOrigen: string;
  rutaDestino: string;
  distanciaKm: number | null;
  vehiculoId: string;
  vehiculoPlaca: string;
  vehiculoLabel: string;
  conductorId: string;
  conductorNombre: string;
  fecha: string;
  horaSalida: string;
  horaLlegada: string | null;
  estado: string;
  observaciones: string | null;
}

interface Vehiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  estado: string;
}

interface Conductor {
  id: string;
  nombre: string;
  apellido: string;
  activo: boolean;
}

type TabType = "rutas" | "programaciones";

export default function RutasPage() {
  const [tab, setTab] = useState<TabType>("rutas");
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [programaciones, setProgramaciones] = useState<Programacion[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [modalRutaOpen, setModalRutaOpen] = useState(false);
  const [modalProgOpen, setModalProgOpen] = useState(false);
  const [editingRutaId, setEditingRutaId] = useState<string | null>(null);
  const [editingProgId, setEditingProgId] = useState<string | null>(null);

  // Ruta form
  const [nombre, setNombre] = useState("");
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [distanciaKm, setDistanciaKm] = useState("");
  const [tiempoEstimado, setTiempoEstimado] = useState("");

  // Programación form
  const [progRutaId, setProgRutaId] = useState("");
  const [progVehiculoId, setProgVehiculoId] = useState("");
  const [progConductorId, setProgConductorId] = useState("");
  const [progFecha, setProgFecha] = useState(new Date().toISOString().split("T")[0]);
  const [progHoraSalida, setProgHoraSalida] = useState("08:00");
  const [progHoraLlegada, setProgHoraLlegada] = useState("");
  const [progObservaciones, setProgObservaciones] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      const [rutasRes, progRes, vehRes, condRes] = await Promise.all([
        fetchWithAuth("/api/operaciones/rutas"),
        fetchWithAuth("/api/operaciones/programaciones"),
        fetchWithAuth("/api/vehiculos"),
        fetchWithAuth("/api/conductores"),
      ]);

      const rutasData = await rutasRes.json();
      const progData = await progRes.json();
      const vehData = await vehRes.json();
      const condData = await condRes.json();

      if (Array.isArray(rutasData)) setRutas(rutasData);
      if (Array.isArray(progData)) setProgramaciones(progData);
      if (Array.isArray(vehData)) setVehiculos(vehData.filter((v: Vehiculo) => v.estado === "OPERATIVO"));
      if (Array.isArray(condData)) setConductores(condData.filter((c: Conductor) => c.activo));
    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // ── Ruta CRUD ──
  const resetRutaForm = () => {
    setNombre("");
    setOrigen("");
    setDestino("");
    setDistanciaKm("");
    setTiempoEstimado("");
    setEditingRutaId(null);
  };

  const handleRutaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !origen || !destino) {
      alert("Nombre, origen y destino son requeridos.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id: editingRutaId || undefined,
        nombre,
        origen,
        destino,
        distanciaKm: distanciaKm || undefined,
        tiempoEstimado: tiempoEstimado || undefined,
      };

      let res;
      if (editingRutaId) {
        res = await fetchWithAuth("/api/operaciones/rutas", {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetchWithAuth("/api/operaciones/rutas", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok) {
        setModalRutaOpen(false);
        resetRutaForm();
        cargarDatos();
        alert(editingRutaId ? "¡Ruta actualizada!" : "¡Ruta registrada con éxito!");
      } else {
        alert("Error: " + (data.error || data.message));
      }
    } catch (err: any) {
      alert("Error de red: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRuta = (ruta: Ruta) => {
    setEditingRutaId(ruta.id);
    setNombre(ruta.nombre);
    setOrigen(ruta.origen);
    setDestino(ruta.destino);
    setDistanciaKm(ruta.distanciaKm?.toString() || "");
    setTiempoEstimado(ruta.tiempoEstimado || "");
    setModalRutaOpen(true);
  };

  const handleToggleRuta = async (id: string, activa: boolean) => {
    try {
      await fetchWithAuth("/api/operaciones/rutas", {
        method: "PUT",
        body: JSON.stringify({ id, activa: !activa }),
      });
      cargarDatos();
    } catch {
      alert("Error al actualizar estado");
    }
  };

  const handleDeleteRuta = async (id: string, nombre: string) => {
    if (!confirm(`¿Está seguro de eliminar la ruta "${nombre}"?`)) return;
    try {
      const res = await fetchWithAuth(`/api/operaciones/rutas?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        cargarDatos();
        alert("Ruta eliminada.");
      } else {
        alert(data.error || "Error al eliminar");
      }
    } catch {
      alert("Error de conexión");
    }
  };

  // ── Programación CRUD ──
  const resetProgForm = () => {
    setProgRutaId("");
    setProgVehiculoId("");
    setProgConductorId("");
    setProgFecha(new Date().toISOString().split("T")[0]);
    setProgHoraSalida("08:00");
    setProgHoraLlegada("");
    setProgObservaciones("");
    setEditingProgId(null);
  };

  const handleProgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progRutaId || !progVehiculoId || !progConductorId || !progFecha || !progHoraSalida) {
      alert("Ruta, vehículo, conductor, fecha y hora de salida son requeridos.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        id: editingProgId || undefined,
        rutaId: progRutaId,
        vehiculoId: progVehiculoId,
        conductorId: progConductorId,
        fecha: progFecha,
        horaSalida: progHoraSalida,
        horaLlegada: progHoraLlegada || undefined,
        observaciones: progObservaciones || undefined,
      };

      let res;
      if (editingProgId) {
        res = await fetchWithAuth("/api/operaciones/programaciones", {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetchWithAuth("/api/operaciones/programaciones", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok) {
        setModalProgOpen(false);
        resetProgForm();
        cargarDatos();
        alert(editingProgId ? "¡Programación actualizada!" : "¡Programación creada con éxito!");
      } else {
        alert("Error: " + (data.error || data.message));
      }
    } catch (err: any) {
      alert("Error de red: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProg = (prog: Programacion) => {
    setEditingProgId(prog.id);
    setProgRutaId(prog.rutaId);
    setProgVehiculoId(prog.vehiculoId);
    setProgConductorId(prog.conductorId);
    setProgFecha(prog.fecha);
    setProgHoraSalida(prog.horaSalida);
    setProgHoraLlegada(prog.horaLlegada || "");
    setProgObservaciones(prog.observaciones || "");
    setModalProgOpen(true);
  };

  const handleCancelProg = async (id: string) => {
    if (!confirm("¿Está seguro de cancelar esta programación?")) return;
    try {
      const res = await fetchWithAuth(`/api/operaciones/programaciones?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        cargarDatos();
        alert("Programación cancelada.");
      } else {
        alert(data.error || "Error al cancelar");
      }
    } catch {
      alert("Error de conexión");
    }
  };

  const programacionesFiltradas = programaciones.filter((p) => {
    if (filtroFechaInicio && p.fecha < filtroFechaInicio) return false;
    if (filtroFechaFin && p.fecha > filtroFechaFin) return false;
    if (filtroEstado && p.estado !== filtroEstado) return false;
    return true;
  });

  const rutaColumns: ColumnDef<Ruta>[] = [
    { header: "Nombre", accessorKey: "nombre", className: "font-semibold text-white" },
    { header: "Origen", accessorKey: "origen" },
    { header: "Destino", accessorKey: "destino" },
    {
      header: "Distancia",
      accessorKey: (row) => (row.distanciaKm ? `${row.distanciaKm} km` : "—"),
      className: "font-mono",
    },
    {
      header: "Tiempo Est.",
      accessorKey: (row) => row.tiempoEstimado || "—",
    },
    {
      header: "Programaciones",
      accessorKey: (row) => row.totalProgramaciones.toString(),
      className: "font-mono text-center",
    },
    {
      header: "Estado",
      accessorKey: (row) => (
        <button
          onClick={() => handleToggleRuta(row.id, row.activa)}
          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border cursor-pointer transition ${
            row.activa
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-slate-500/10 text-slate-400 border-slate-500/20"
          }`}
        >
          {row.activa ? "ACTIVA" : "INACTIVA"}
        </button>
      ),
    },
    {
      header: "Acciones",
      className: "text-right",
      accessorKey: (row) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => handleEditRuta(row)} className="text-xs text-blue-400 hover:text-blue-300">
            Editar
          </button>
          <button onClick={() => handleDeleteRuta(row.id, row.nombre)} className="text-xs text-rose-400 hover:text-rose-300">
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  const progColumns: ColumnDef<Programacion>[] = [
    {
      header: "Fecha",
      accessorKey: "fecha",
      className: "font-mono",
    },
    { header: "Hora Salida", accessorKey: "horaSalida", className: "font-mono" },
    { header: "Hora Llegada", accessorKey: (row) => row.horaLlegada || "—", className: "font-mono" },
    { header: "Ruta", accessorKey: "rutaNombre", className: "font-semibold text-white" },
    {
      header: "Trayecto",
      accessorKey: (row) => `${row.rutaOrigen} → ${row.rutaDestino}`,
      className: "text-xs",
    },
    { header: "Vehículo", accessorKey: (row) => `${row.vehiculoPlaca} — ${row.vehiculoLabel}` },
    { header: "Conductor", accessorKey: "conductorNombre" },
    {
      header: "Estado",
      accessorKey: (row) => {
        const colors: Record<string, string> = {
          PROGRAMADO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          EN_RUTA: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          COMPLETADO: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          CANCELADO: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        };
        return (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[row.estado] || ""}`}>
            {row.estado}
          </span>
        );
      },
    },
    {
      header: "Acciones",
      className: "text-right",
      accessorKey: (row) => (
        <div className="flex justify-end gap-2">
          {row.estado === "PROGRAMADO" && (
            <>
              <button onClick={() => handleEditProg(row)} className="text-xs text-blue-400 hover:text-blue-300">
                Editar
              </button>
              <button onClick={() => handleCancelProg(row.id)} className="text-xs text-rose-400 hover:text-rose-300">
                Cancelar
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition duration-150 inline-flex items-center space-x-2"
        >
          <span>←</span>
          <span>Volver al Dashboard</span>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Programación de Rutas</h2>
          <p className="text-xs text-slate-400">Gestión de rutas y programación de viajes — F1T02</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("rutas")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            tab === "rutas" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Rutas ({rutas.length})
        </button>
        <button
          onClick={() => setTab("programaciones")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            tab === "programaciones" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Programaciones ({programaciones.length})
        </button>
      </div>

      {/* Tab Content */}
      {tab === "rutas" && (
        <>
          {isLoading ? (
            <div className="text-center py-12 text-slate-450 text-sm">Cargando rutas...</div>
          ) : (
            <DataTable
              data={rutas}
              columns={rutaColumns}
              searchKey="nombre"
              searchPlaceholder="Buscar por nombre..."
              newActionLabel="Nueva Ruta"
              onNewAction={() => {
                resetRutaForm();
                setModalRutaOpen(true);
              }}
            />
          )}
        </>
      )}

      {tab === "programaciones" && (
        <>
          {/* Filtros */}
          <div className="flex flex-wrap gap-3 items-end bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Fecha Inicio</label>
              <input
                type="date"
                value={filtroFechaInicio}
                onChange={(e) => setFiltroFechaInicio(e.target.value)}
                className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Fecha Fin</label>
              <input
                type="date"
                value={filtroFechaFin}
                onChange={(e) => setFiltroFechaFin(e.target.value)}
                className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Estado</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
              >
                <option value="">Todos</option>
                <option value="PROGRAMADO">Programado</option>
                <option value="EN_RUTA">En Ruta</option>
                <option value="COMPLETADO">Completado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
            <div className="flex-1" />
            <button
              onClick={() => {
                resetProgForm();
                setModalProgOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition"
            >
              + Nueva Programación
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-slate-450 text-sm">Cargando programaciones...</div>
          ) : (
            <DataTable data={programacionesFiltradas} columns={progColumns} />
          )}
        </>
      )}

      {/* Modal Ruta */}
      {modalRutaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setModalRutaOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              <Icon name="close" size={16} />
            </button>

            <div>
              <h3 className="text-lg font-bold text-emerald-400 flex items-center space-x-2">
                <Icon name="route" size={18} />
                <span>{editingRutaId ? "Editar Ruta" : "Nueva Ruta"}</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                SAF ERP — Programación de Rutas F1T02
              </p>
            </div>

            <form onSubmit={handleRutaSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Nombre de la Ruta *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Ruta Centro - Zona Industrial"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Origen *</label>
                  <input
                    type="text"
                    required
                    value={origen}
                    onChange={(e) => setOrigen(e.target.value)}
                    placeholder="Ej. Terminal Terrestre"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Destino *</label>
                  <input
                    type="text"
                    required
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    placeholder="Ej. Zona Industrial"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Distancia (km)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={distanciaKm}
                    onChange={(e) => setDistanciaKm(e.target.value)}
                    placeholder="Ej. 25.5"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Tiempo Estimado</label>
                  <input
                    type="text"
                    value={tiempoEstimado}
                    onChange={(e) => setTiempoEstimado(e.target.value)}
                    placeholder="Ej. 45 min"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalRutaOpen(false)}
                  className="py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer text-center"
                >
                  {isSubmitting ? "Guardando..." : editingRutaId ? "Actualizar Ruta" : "Crear Ruta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Programación */}
      {modalProgOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 space-y-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setModalProgOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              <Icon name="close" size={16} />
            </button>

            <div>
              <h3 className="text-lg font-bold text-emerald-400 flex items-center space-x-2">
                <Icon name="calendar" size={18} />
                <span>{editingProgId ? "Editar Programación" : "Nueva Programación"}</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                SAF ERP — Asignación de Vehículo y Conductor a Ruta F1T02
              </p>
            </div>

            <form onSubmit={handleProgSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Ruta *</label>
                <select
                  value={progRutaId}
                  onChange={(e) => setProgRutaId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                >
                  <option value="">Seleccionar ruta...</option>
                  {rutas
                    .filter((r) => r.activa)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre} ({r.origen} → {r.destino})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Vehículo *</label>
                  <select
                    value={progVehiculoId}
                    onChange={(e) => setProgVehiculoId(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                  >
                    <option value="">Seleccionar vehículo...</option>
                    {vehiculos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.placa} — {v.marca} {v.modelo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Conductor *</label>
                  <select
                    value={progConductorId}
                    onChange={(e) => setProgConductorId(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                  >
                    <option value="">Seleccionar conductor...</option>
                    {conductores.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} {c.apellido}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={progFecha}
                    onChange={(e) => setProgFecha(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Hora Salida *</label>
                  <input
                    type="time"
                    required
                    value={progHoraSalida}
                    onChange={(e) => setProgHoraSalida(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Hora Llegada</label>
                  <input
                    type="time"
                    value={progHoraLlegada}
                    onChange={(e) => setProgHoraLlegada(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Observaciones</label>
                <textarea
                  value={progObservaciones}
                  onChange={(e) => setProgObservaciones(e.target.value)}
                  rows={2}
                  placeholder="Notas adicionales sobre el viaje..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalProgOpen(false)}
                  className="py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer text-center"
                >
                  {isSubmitting ? "Guardando..." : editingProgId ? "Actualizar" : "Programar Viaje"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
