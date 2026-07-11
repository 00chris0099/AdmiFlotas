"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import api from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";

interface Vehiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  codigoPatrimonial: string;
}

interface Lavado {
  id: string;
  vehiculoId: string;
  vehiculoPlaca: string;
  vehiculoMarca: string;
  vehiculoModelo: string;
  vehiculoCodigo: string;
  fecha: string;
  tipoLavado: "EXTERIOR" | "INTERIOR" | "COMPLETO";
  costo: number | null;
  proveedor: string | null;
  responsable: string | null;
  observaciones: string | null;
  creadoEn: string;
}

const TIPOS_LAVADO = ["EXTERIOR", "INTERIOR", "COMPLETO"] as const;

export default function LavadoPage() {
  const [lavados, setLavados] = useState<Lavado[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const { confirm } = useConfirm();

  // Formulario
  const [vehiculoId, setVehiculoId] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [tipoLavado, setTipoLavado] = useState<string>("EXTERIOR");
  const [costo, setCosto] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [responsable, setResponsable] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const cargarLavados = async () => {
    try {
      setIsLoading(true);
      const data = await api.getLavados();
      if (Array.isArray(data)) {
        setLavados(data);
      }
    } catch (err) {
      console.error("Error al cargar lavados:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const cargarVehiculos = async () => {
    try {
      const data = await api.getVehiculos();
      if (Array.isArray(data)) {
        setVehiculos(data);
      }
    } catch (err) {
      console.error("Error al cargar vehículos:", err);
    }
  };

  useEffect(() => {
    cargarLavados();
    cargarVehiculos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.createLavado({
        vehiculoId,
        fecha,
        tipoLavado,
        costo: costo ? parseFloat(costo) : null,
        proveedor: proveedor || null,
        responsable: responsable || null,
        observaciones: observaciones || null,
      });

      setModalOpen(false);
      resetForm();
      cargarLavados();
      toast.success("Lavado registrado con éxito");
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEliminar = async (id: string) => {
    const ok = await confirm({ message: "¿Está seguro de eliminar este registro de lavado?", variant: "danger" });
    if (!ok) return;

    try {
      await api.deleteLavado(id);
      cargarLavados();
      toast.success("Lavado eliminado");
    } catch (err: any) {
      toast.error("Error: " + err.message);
    }
  };

  const resetForm = () => {
    setVehiculoId("");
    setFecha(new Date().toISOString().split("T")[0]);
    setTipoLavado("EXTERIOR");
    setCosto("");
    setProveedor("");
    setResponsable("");
    setObservaciones("");
  };

  const getTipoBadge = (tipo: string) => {
    const colors: Record<string, string> = {
      EXTERIOR: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      INTERIOR: "bg-violet-500/10 text-violet-400 border-violet-500/20",
      COMPLETO: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    };
    return (
      <span className={`inline-block border px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[tipo] || colors.EXTERIOR}`}>
        {tipo}
      </span>
    );
  };

  const columns: ColumnDef<Lavado>[] = [
    {
      header: "Fecha",
      accessorKey: "fecha",
      className: "font-mono text-slate-400",
    },
    {
      header: "Vehículo",
      accessorKey: (row) => (
        <div>
          <div className="font-mono font-bold text-indigo-400">{row.vehiculoPlaca}</div>
          <div className="text-[10px] text-slate-500">{row.vehiculoMarca} {row.vehiculoModelo}</div>
        </div>
      ),
    },
    { header: "Tipo", accessorKey: (row) => getTipoBadge(row.tipoLavado) },
    {
      header: "Costo",
      accessorKey: (row) =>
        row.costo != null ? (
          <span className="font-mono font-bold text-white">S/. {Number(row.costo).toFixed(2)}</span>
        ) : (
          <span className="text-slate-500">-</span>
        ),
      className: "font-mono",
    },
    { header: "Proveedor", accessorKey: (row) => row.proveedor || "-", className: "text-slate-400" },
    { header: "Responsable", accessorKey: (row) => row.responsable || "-", className: "text-slate-400" },
    {
      header: "Acciones",
      accessorKey: (row) => (
        <div className="flex gap-1.5">
          <button
            onClick={() => handleEliminar(row.id)}
            className="px-2 py-1 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-400 text-[10px] font-bold rounded-lg transition"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition duration-150 inline-flex items-center space-x-2"
        >
          <span>←</span>
          <span>Volver al Dashboard</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Control de Lavados</h2>
          <p className="text-xs text-slate-400">Registro y historial de lavados de vehículos</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition duration-150 shadow-md"
        >
          + Registrar Lavado
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Cargando lavados...</div>
      ) : (
        <DataTable
          data={lavados}
          columns={columns}
          searchKey="vehiculoPlaca"
          searchPlaceholder="Buscar por placa..."
          newActionLabel=""
          onNewAction={() => {}}
        />
      )}

      {/* MODAL REGISTRAR LAVADO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div>
              <h3 className="text-lg font-bold text-sky-400">Registrar Lavado</h3>
              <p className="text-xs text-slate-450">Control de lavados de vehículos</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-350">Vehículo</label>
                <select
                  value={vehiculoId}
                  onChange={(e) => setVehiculoId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  required
                >
                  <option value="">Seleccionar vehículo...</option>
                  {vehiculos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.placa} - {v.marca} {v.modelo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-350">Fecha</label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-350">Tipo de Lavado</label>
                  <select
                    value={tipoLavado}
                    onChange={(e) => setTipoLavado(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    {TIPOS_LAVADO.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-350">Costo (S/.)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={costo}
                    onChange={(e) => setCosto(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-350">Proveedor</label>
                  <input
                    type="text"
                    value={proveedor}
                    onChange={(e) => setProveedor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-350">Responsable</label>
                <input
                  type="text"
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-350">Observaciones</label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-sm focus:outline-none h-16"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white font-bold rounded-xl transition duration-150 shadow-lg text-sm"
              >
                {isSubmitting ? "Guardando..." : "Registrar Lavado"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
