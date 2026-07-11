"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import api from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

interface Asignacion {
  id: string;
  vehiculoId: string;
  conductorId: string;
  sectorAsignado: string;
  fechaAsignacion: string;
  fechaFin: string | null;
  activa: boolean;
  observaciones: string | null;
  vehiculo: {
    id: string;
    placa: string;
    marca: string;
    modelo: string;
    codigoPatrimonial: string;
  };
  conductor: {
    id: string;
    nombre: string;
    apellido: string;
    licenciaConducir: string | null;
  };
}

interface Vehiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  codigoPatrimonial: string;
  estado: string;
}

interface Conductor {
  id: string;
  nombre: string;
  apellido: string;
  licenciaConducir: string | null;
}

export default function AsignacionPage() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const [vehiculoId, setVehiculoId] = useState("");
  const [conductorId, setConductorId] = useState("");
  const [sectorAsignado, setSectorAsignado] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      const [dataAsig, dataVeh, dataCond] = await Promise.all([
        api.getAsignaciones(),
        api.getVehiculos(),
        api.getUsuarios(),
      ]);

      if (Array.isArray(dataAsig)) setAsignaciones(dataAsig);
      if (Array.isArray(dataVeh)) {
        setVehiculos(dataVeh.filter((v: Vehiculo) => v.estado === "OPERATIVO"));
      }
      if (Array.isArray(dataCond)) setConductores(dataCond);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const resetForm = () => {
    setVehiculoId("");
    setConductorId("");
    setSectorAsignado("");
    setObservaciones("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiculoId || !conductorId || !sectorAsignado) {
      toast.warning("Vehículo, conductor y sector son requeridos.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createAsignacion({ vehiculoId, conductorId, sectorAsignado, observaciones });
      setModalOpen(false);
      resetForm();
      cargarDatos();
      toast.success("Asignación registrada con éxito");
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<Asignacion>[] = [
    {
      header: "Vehículo",
      accessorKey: (row) => (
        <div>
          <span className="font-mono text-indigo-400 text-xs">{row.vehiculo.codigoPatrimonial}</span>
          <span className="text-slate-400 mx-1">·</span>
          <span className="font-bold text-white">{row.vehiculo.placa}</span>
          <div className="text-xs text-slate-500">{row.vehiculo.marca} {row.vehiculo.modelo}</div>
        </div>
      ),
    },
    {
      header: "Conductor",
      accessorKey: (row: any) => (
        <div>
          <span className="text-white">{typeof row.conductor === "string" ? row.conductor : row.conductor?.nombre ? `${row.conductor.nombre} ${row.conductor.apellido}` : ""}</span>
        </div>
      ),
    },
    { header: "Sector", accessorKey: "sectorAsignado", className: "text-sm text-slate-300" },
    {
      header: "Fecha Asignación",
      accessorKey: (row) => new Date(row.fechaAsignacion).toLocaleDateString("es-PE"),
      className: "text-xs text-slate-400",
    },
    {
      header: "Estado",
      accessorKey: (row) => (
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
          row.activa
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-slate-500/10 text-slate-400 border-slate-500/20"
        }`}>
          {row.activa ? "ACTIVA" : "INACTIVA"}
        </span>
      ),
    },
    {
      header: "Observaciones",
      accessorKey: (row) => row.observaciones || "-",
      className: "text-xs text-slate-500 max-w-[200px] truncate",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">← Volver al Dashboard</Link>
          <h2 className="text-2xl font-bold text-white mt-1">Asignación de Vehículos</h2>
          <p className="text-xs text-slate-400 mt-1">Asignar vehículos a conductores y sectores — F1T02</p>
        </div>
        <button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition"
        >
          + Nueva Asignación
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Cargando asignaciones...</div>
      ) : (
        <DataTable columns={columns} data={asignaciones} />
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold text-white mb-4">Nueva Asignación de Vehículo</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold">Vehículo *</label>
                <select
                  value={vehiculoId}
                  onChange={(e) => setVehiculoId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                  required
                >
                  <option value="">Seleccionar vehículo...</option>
                  {vehiculos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.codigoPatrimonial} — {v.placa} — {v.marca} {v.modelo}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold">Conductor *</label>
                <select
                  value={conductorId}
                  onChange={(e) => setConductorId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                  required
                >
                  <option value="">Seleccionar conductor...</option>
                  {conductores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} {c.apellido}
                      {c.licenciaConducir ? ` (Lic: ${c.licenciaConducir})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold">Sector Asignado *</label>
                <input
                  type="text"
                  value={sectorAsignado}
                  onChange={(e) => setSectorAsignado(e.target.value)}
                  placeholder="Ej: Zona Norte, Sector Industrial..."
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold">Observaciones</label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); resetForm(); }}
                  className="px-4 py-2 text-slate-400 hover:text-white text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-semibold rounded-xl text-sm transition"
                >
                  {isSubmitting ? "Guardando..." : "Registrar Asignación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
