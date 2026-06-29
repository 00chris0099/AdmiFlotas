"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

interface DocumentoVehiculo {
  id: string;
  vehiculoId: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaEmision: string;
  fechaVencimiento: string | null;
  entidadEmisora: string | null;
  observaciones: string | null;
  creadoEn: string;
  vehiculo: {
    id: string;
    placa: string;
    marca: string;
    modelo: string;
    codigoPatrimonial: string;
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

const TIPOS_DOCUMENTO: Record<string, string> = {
  LICENCIA: "Licencia",
  SOAT: "SOAT",
  REVISION_TECNICA: "Revisión Técnica",
  SEGURO: "Seguro",
  TARJETA_PROPIEDAD: "Tarjeta de Propiedad",
  OTRO: "Otro",
};

function getEstadoVencimiento(fechaVencimiento: string | null): { color: string; label: string } {
  if (!fechaVencimiento) return { color: "text-slate-400", label: "Sin fecha" };

  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);
  const diffMs = vencimiento.getTime() - hoy.getTime();
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias < 0) {
    return { color: "text-red-400 bg-red-500/10 border-red-500/20", label: `Vencido (${Math.abs(diffDias)} días)` };
  }
  if (diffDias <= 30) {
    return { color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", label: `Vence en ${diffDias} días` };
  }
  if (diffDias <= 90) {
    return { color: "text-orange-400 bg-orange-500/10 border-orange-500/20", label: `Vence en ${diffDias} días` };
  }
  return { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: `Vigente (${diffDias} días)` };
}

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<DocumentoVehiculo[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filtroVehiculo, setFiltroVehiculo] = useState("");

  const [vehiculoId, setVehiculoId] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [fechaEmision, setFechaEmision] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [entidadEmisora, setEntidadEmisora] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      const url = filtroVehiculo
        ? `/api/flota/documentos?vehiculoId=${filtroVehiculo}`
        : "/api/flota/documentos";
      const [resDoc, resVeh] = await Promise.all([
        fetchWithAuth(url),
        fetchWithAuth("/api/vehiculos"),
      ]);
      const dataDoc = await resDoc.json();
      const dataVeh = await resVeh.json();

      if (Array.isArray(dataDoc)) setDocumentos(dataDoc);
      if (Array.isArray(dataVeh)) {
        setVehiculos(dataVeh.filter((v: Vehiculo) => v.estado === "OPERATIVO"));
      }
    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [filtroVehiculo]);

  const resetForm = () => {
    setVehiculoId("");
    setTipoDocumento("");
    setNumeroDocumento("");
    setFechaEmision("");
    setFechaVencimiento("");
    setEntidadEmisora("");
    setObservaciones("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiculoId || !tipoDocumento || !numeroDocumento || !fechaEmision) {
      alert("Vehículo, tipo de documento, número y fecha de emisión son requeridos.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetchWithAuth("/api/flota/documentos", {
        method: "POST",
        body: JSON.stringify({
          vehiculoId,
          tipoDocumento,
          numeroDocumento,
          fechaEmision,
          fechaVencimiento: fechaVencimiento || null,
          entidadEmisora: entidadEmisora || null,
          observaciones: observaciones || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        resetForm();
        cargarDatos();
        alert("Documento registrado con éxito");
      } else {
        alert("Error: " + (data.error || data.message));
      }
    } catch (err: any) {
      alert("Error de red: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este documento?")) return;

    try {
      const res = await fetchWithAuth(`/api/flota/documentos?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        cargarDatos();
        alert("Documento eliminado correctamente");
      } else {
        alert("Error: " + (data.error || data.message));
      }
    } catch (err: any) {
      alert("Error de red: " + err.message);
    }
  };

  const columns: ColumnDef<DocumentoVehiculo>[] = [
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
      header: "Tipo",
      accessorKey: (row) => (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          {TIPOS_DOCUMENTO[row.tipoDocumento] || row.tipoDocumento}
        </span>
      ),
    },
    { header: "N° Documento", accessorKey: "numeroDocumento", className: "text-sm text-slate-300 font-mono" },
    {
      header: "Fecha Emisión",
      accessorKey: (row) => new Date(row.fechaEmision).toLocaleDateString("es-PE"),
      className: "text-xs text-slate-400",
    },
    {
      header: "Vencimiento",
      accessorKey: (row) => {
        const estado = getEstadoVencimiento(row.fechaVencimiento);
        return (
          <div>
            <div className="text-xs text-slate-300">
              {row.fechaVencimiento ? new Date(row.fechaVencimiento).toLocaleDateString("es-PE") : "-"}
            </div>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${estado.color}`}>
              {estado.label}
            </span>
          </div>
        );
      },
    },
    {
      header: "Entidad Emisora",
      accessorKey: (row) => row.entidadEmisora || "-",
      className: "text-xs text-slate-500 max-w-[150px] truncate",
    },
    {
      header: "Acciones",
      accessorKey: (row) => (
        <button
          onClick={() => handleDelete(row.id)}
          className="text-red-400 hover:text-red-300 text-xs font-semibold transition"
        >
          Eliminar
        </button>
      ),
      className: "text-center",
    },
  ];

  const documentosVencidos = documentos.filter((d) => {
    if (!d.fechaVencimiento) return false;
    return new Date(d.fechaVencimiento) < new Date();
  });

  const documentosPorVencer = documentos.filter((d) => {
    if (!d.fechaVencimiento) return false;
    const diff = new Date(d.fechaVencimiento).getTime() - new Date().getTime();
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return dias >= 0 && dias <= 30;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">← Volver al Dashboard</Link>
          <h2 className="text-2xl font-bold text-white mt-1">Documentos de Vehículos</h2>
          <p className="text-xs text-slate-400 mt-1">Gestión de documentos vehiculares (licencias, SOAT, seguro, etc.) — F1T02</p>
        </div>
        <button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition"
        >
          + Nuevo Documento
        </button>
      </div>

      {(documentosVencidos.length > 0 || documentosPorVencer.length > 0) && (
        <div className="flex gap-4">
          {documentosVencidos.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <div>
                <span className="text-red-400 font-bold text-sm">{documentosVencidos.length}</span>
                <span className="text-red-300 text-xs ml-1">documento(s) vencido(s)</span>
              </div>
            </div>
          )}
          {documentosPorVencer.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <div>
                <span className="text-yellow-400 font-bold text-sm">{documentosPorVencer.length}</span>
                <span className="text-yellow-300 text-xs ml-1">documento(s) por vencer (30 días)</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <label className="text-xs text-slate-400 font-semibold">Filtrar por vehículo:</label>
        <select
          value={filtroVehiculo}
          onChange={(e) => setFiltroVehiculo(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
        >
          <option value="">Todos los vehículos</option>
          {vehiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.codigoPatrimonial} — {v.placa} — {v.marca} {v.modelo}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Cargando documentos...</div>
      ) : (
        <DataTable columns={columns} data={documentos} />
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold text-white mb-4">Nuevo Documento de Vehículo</h3>
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
                <label className="text-xs text-slate-400 font-semibold">Tipo de Documento *</label>
                <select
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                  required
                >
                  <option value="">Seleccionar tipo...</option>
                  {Object.entries(TIPOS_DOCUMENTO).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold">Número de Documento *</label>
                <input
                  type="text"
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  placeholder="Ej: ABC-12345"
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-semibold">Fecha de Emisión *</label>
                  <input
                    type="date"
                    value={fechaEmision}
                    onChange={(e) => setFechaEmision(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={fechaVencimiento}
                    onChange={(e) => setFechaVencimiento(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold">Entidad Emisora</label>
                <input
                  type="text"
                  value={entidadEmisora}
                  onChange={(e) => setEntidadEmisora(e.target.value)}
                  placeholder="Ej: SUTRAN, Aseguradora XYZ..."
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
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
                  {isSubmitting ? "Guardando..." : "Registrar Documento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
