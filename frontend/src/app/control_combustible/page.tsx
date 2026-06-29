"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { generateOrdenAbastecimientoPDF } from "@/utils/pdfGenerators";
import { exportToExcel } from "@/utils/exportUtils";
import {
  TIPOS_COMBUSTIBLE_ORDEN,
  SECTORES_ORGANIZACIONALES,
  LOCALIDADES,
  SERVICENTROS,
  SUBTIPOS_COMBUSTIBLE,
  getSubtiposCombustible,
  tieneSubtipos,
} from "@/lib/constants";

interface OrdenCombustible {
  id: string;
  numeroOrden: string;
  fecha: string;
  codigoPatrimonial: string;
  placa: string;
  vehiculoLabel: string;
  vehiculoId: string;
  conductor: string;
  conductorId: string;
  sectorSolicitante: string;
  localidadSolicitante: string;
  tipoCombustible: string;
  cantidadGalones: number;
  costoGalon: number;
  costoTotal: number;
  kilometrajeActual: number;
  nombreServiccentro: string;
  numeroTicketServiccentro: string;
  responsableServiccentro: string;
  selloServiccentro: boolean;
  incluyeAceiteMotor: boolean;
  cantidadAceiteMotorLt: number;
  firmaEncargadoGaraje: string;
  firmaConductor: string;
  firmaServicentro: string;
}

interface DbVehiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  codigoPatrimonial: string;
}

interface DbConductor {
  id: string;
  nombre: string;
  apellido: string;
}

export default function CombustiblePage() {
  const [ordenes, setOrdenes] = useState<OrdenCombustible[]>([]);
  const [vehiculos, setVehiculos] = useState<DbVehiculo[]>([]);
  const [conductores, setConductores] = useState<DbConductor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states — Orden
  const [numeroOrden, setNumeroOrden] = useState("");

  // Form states — Vehículo
  const [vehiculoId, setVehiculoId] = useState("");
  const [conductorId, setConductorId] = useState("");

  // Form states — Solicitante
  const [sectorSolicitante, setSectorSolicitante] = useState("");
  const [localidadSolicitante, setLocalidadSolicitante] = useState("");

  // Form states — Tipo de Abastecimiento
  const [tipoCombustible, setTipoCombustible] = useState("DIESEL");
  const [subtipoCombustible, setSubtipoCombustible] = useState("");

  // Form states — Cantidad
  const [cantidadGalones, setCantidadGalones] = useState("");
  const [costoGalon, setCostoGalon] = useState("16.50");
  const [kilometrajeActual, setKilometrajeActual] = useState("");

  // Form states — Servicentro
  const [nombreServiccentro, setNombreServiccentro] = useState("");
  const [numeroTicketServiccentro, setNumeroTicketServiccentro] = useState("");
  const [responsableServiccentro, setResponsableServiccentro] = useState("");
  const [selloServiccentro, setSelloServiccentro] = useState(false);

  // Form states — Lubricante
  const [incluyeAceiteMotor, setIncluyeAceiteMotor] = useState(false);
  const [cantidadAceiteMotorLt, setCantidadAceiteMotorLt] = useState("0.5");

  // Form states — Firmas
  const [firmaEncargadoGaraje, setFirmaEncargadoGaraje] = useState("");
  const [firmaConductor, setFirmaConductor] = useState("");
  const [firmaServicentro, setFirmaServicentro] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargarCatalogos = async () => {
    try {
      const [resVeh, resCond] = await Promise.all([
        fetchWithAuth("/api/vehiculos"),
        fetchWithAuth("/api/conductores")
      ]);
      const dataVeh = await resVeh.json();
      const dataCond = await resCond.json();

      if (Array.isArray(dataVeh)) {
        setVehiculos(dataVeh);
        if (dataVeh.length > 0) setVehiculoId(dataVeh[0].id);
      }
      if (Array.isArray(dataCond)) {
        setConductores(dataCond);
        if (dataCond.length > 0) {
          setConductorId(dataCond[0].id);
          setFirmaConductor(`${dataCond[0].nombre} ${dataCond[0].apellido}`);
        }
      }
    } catch (err) {
      console.error("Error al cargar catálogos:", err);
    }
  };

  const cargarOrdenes = async () => {
    try {
      setIsLoading(true);
      const res = await fetchWithAuth("/api/control_combustible");
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrdenes(data);
      }
    } catch (err) {
      console.error("Error al cargar combustibles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarCatalogos();
    cargarOrdenes();
  }, []);

  const vehiculoSeleccionado = vehiculos.find((v) => v.id === vehiculoId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetchWithAuth("/api/control_combustible", {
        method: "POST",
        body: JSON.stringify({
          numeroOrden,
          vehiculoId,
          conductorId,
          sectorSolicitante,
          localidadSolicitante,
          tipoCombustible,
          cantidadGalones: parseFloat(cantidadGalones) || 0,
          costoGalon: parseFloat(costoGalon) || 0,
          kilometrajeActual: parseInt(kilometrajeActual),
          nombreServiccentro,
          numeroTicketServiccentro,
          responsableServiccentro,
          selloServiccentro,
          incluyeAceiteMotor,
          cantidadAceiteMotorLt: incluyeAceiteMotor ? parseFloat(cantidadAceiteMotorLt) : 0,
          firmaEncargadoGaraje,
          firmaConductor,
          firmaServicentro,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        resetForm();
        cargarOrdenes();
        alert("¡Orden de abastecimiento registrada con éxito!");
      } else {
        alert("Error: " + data.error);
      }
    } catch (err: any) {
      alert("Error de red: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNumeroOrden("");
    setKilometrajeActual("");
    setCantidadGalones("");
    setSectorSolicitante("");
    setLocalidadSolicitante("");
    setTipoCombustible("DIESEL");
    setSubtipoCombustible("");
    setNombreServiccentro("");
    setNumeroTicketServiccentro("");
    setResponsableServiccentro("");
    setSelloServiccentro(false);
    setIncluyeAceiteMotor(false);
    setFirmaEncargadoGaraje("");
    setFirmaServicentro("");
  };

  // Cálculos de KPIs
  const totalGalones = ordenes.reduce((sum, o) => sum + o.cantidadGalones, 0);
  const totalCosto = ordenes.reduce((sum, o) => sum + o.costoTotal, 0);

  const kilometrajesPorVehiculo = ordenes.reduce((acc: { [key: string]: number[] }, o) => {
    if (!acc[o.placa]) acc[o.placa] = [];
    acc[o.placa].push(o.kilometrajeActual);
    return acc;
  }, {});

  const galonesPorVehiculo = ordenes.reduce((acc: { [key: string]: number }, o) => {
    acc[o.placa] = (acc[o.placa] || 0) + o.cantidadGalones;
    return acc;
  }, {});

  const rendimientos = Object.entries(kilometrajesPorVehiculo).map(([placa, odos]) => {
    const maxOdo = Math.max(...odos);
    const minOdo = Math.min(...odos);
    const diffKm = maxOdo - minOdo || 120;
    const galons = galonesPorVehiculo[placa] || 1;
    const kmGalon = diffKm / galons;
    const eficiencia = Math.min(100, Math.round((kmGalon / 35) * 100));
    return { placa, kmGalon: Number(kmGalon.toFixed(1)), eficiencia };
  });

  const columns: ColumnDef<OrdenCombustible>[] = [
    { header: "N° Orden", accessorKey: "numeroOrden", className: "font-mono text-indigo-400 font-semibold" },
    { header: "Fecha", accessorKey: "fecha", className: "font-mono text-xs" },
    {
      header: "Vehículo",
      accessorKey: (row) => (
        <div>
          <div className="font-mono text-[10px] text-slate-400">{row.codigoPatrimonial}</div>
          <div className="font-bold text-white">{row.placa}</div>
        </div>
      ),
    },
    { header: "Conductor", accessorKey: "conductor" },
    { header: "Tipo", accessorKey: "tipoCombustible", className: "text-xs" },
    { header: "Galones", accessorKey: (row) => `${row.cantidadGalones} Gal`, className: "font-mono" },
    { header: "Km", accessorKey: (row) => `${row.kilometrajeActual} km`, className: "font-mono" },
    { header: "Servicentro", accessorKey: "nombreServiccentro", className: "text-xs" },
    { header: "Costo Total", accessorKey: (row) => `S/. ${row.costoTotal.toFixed(2)}`, className: "text-right font-bold text-white" },
    {
      header: "Firmas",
      accessorKey: (row) => (
        <div className="flex gap-1">
          {row.firmaEncargadoGaraje && <span title="Encargado" className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1 rounded">EG</span>}
          {row.firmaConductor && <span title="Conductor" className="text-[10px] bg-blue-500/20 text-blue-400 px-1 rounded">CD</span>}
          {row.firmaServicentro && <span title="Servicentro" className="text-[10px] bg-amber-500/20 text-amber-400 px-1 rounded">SV</span>}
        </div>
      ),
    },
    {
      header: "PDF",
      className: "text-right",
      accessorKey: (row) => (
        <button
          onClick={() => generateOrdenAbastecimientoPDF(row)}
          className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold rounded-lg transition"
          title="Descargar PDF"
        >
          PDF
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition duration-150 inline-flex items-center space-x-2">
          <span>←</span>
          <span>Volver al Dashboard</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Control de Combustible y Lubricantes</h2>
          <p className="text-xs text-slate-400">Órdenes de abastecimiento — Formulario MA 122 01 02 (F1T02)</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportToExcel(ordenes, "control_combustible.xlsx")}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition"
          >
            Exportar Excel
          </button>
          <button
            onClick={() => {
              setNumeroOrden(`OC-${Date.now().toString().slice(-6)}`);
              resetForm();
              if (conductores.length > 0) {
                setFirmaConductor(`${conductores[0].nombre} ${conductores[0].apellido}`);
              }
              setModalOpen(true);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition duration-150 shadow-md"
          >
            + Nueva Orden de Abastecimiento
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-950 border border-slate-850/80 p-5 rounded-2xl shadow-lg">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Combustible Despachado</p>
          <h3 className="text-3xl font-black text-white mt-2">{totalGalones.toFixed(1)} Galones</h3>
        </div>
        <div className="bg-slate-950 border border-slate-850/80 p-5 rounded-2xl shadow-lg">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Costo Acumulado</p>
          <h3 className="text-3xl font-black text-white mt-2">S/. {totalCosto.toFixed(2)}</h3>
        </div>
        <div className="bg-slate-950 border border-slate-850/80 p-5 rounded-2xl shadow-lg">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Rendimiento Promedio</p>
          <h3 className="text-3xl font-black text-emerald-400 mt-2">
            {rendimientos.length > 0 ? (rendimientos.reduce((sum, r) => sum + r.kmGalon, 0) / rendimientos.length).toFixed(1) : "0"} Km/Gal
          </h3>
          <p className="text-[10px] text-emerald-400 mt-1">Meta F1T02: 35 km/galón</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-slate-950 border border-slate-850/80 rounded-2xl p-4">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Cargando órdenes...</div>
        ) : (
          <DataTable data={ordenes} columns={columns} searchKey="numeroOrden" searchPlaceholder="Buscar por N° orden..." />
        )}
      </div>

      {/* MODAL — Formulario MA 122 01 02 */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/80 backdrop-blur-sm p-4 pt-8 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl relative text-slate-100 mb-8">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg">✕</button>

            {/* Header del formulario */}
            <div className="text-center border-b border-slate-800 pb-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Sistema Administrativo — Subsistema Logística</p>
              <h3 className="text-lg font-black text-indigo-400 mt-1">ORDEN DE ABASTECIMIENTO</h3>
              <p className="text-xs text-slate-400">Formulario MA 122 01 02</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* SECCIÓN 1: ORDEN */}
              <div className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">1. Orden</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">N° de Orden *</label>
                    <input type="text" value={numeroOrden} onChange={(e) => setNumeroOrden(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm focus:outline-none font-mono" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">Fecha</label>
                    <input type="text" value={new Date().toISOString().split("T")[0]} readOnly className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-400 font-mono" />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: VEHÍCULO */}
              <div className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">2. Vehículo</h4>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase">Seleccionar Vehículo *</label>
                  <select value={vehiculoId} onChange={(e) => setVehiculoId(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm focus:outline-none" required>
                    {vehiculos.map((v) => (
                      <option key={v.id} value={v.id}>[{v.codigoPatrimonial}] {v.placa} — {v.marca} {v.modelo}</option>
                    ))}
                  </select>
                </div>
                {vehiculoSeleccionado && (
                  <div className="flex gap-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="text-center">
                      <p className="text-[9px] text-slate-500 uppercase">Código Patrimonial</p>
                      <p className="text-sm font-black text-indigo-400 font-mono">{vehiculoSeleccionado.codigoPatrimonial}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] text-slate-500 uppercase">Placa</p>
                      <p className="text-sm font-black text-white font-mono">{vehiculoSeleccionado.placa}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] text-slate-500 uppercase">Marca/Modelo</p>
                      <p className="text-sm font-semibold text-slate-300">{vehiculoSeleccionado.marca} {vehiculoSeleccionado.modelo}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN 3: SOLICITANTE */}
              <div className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">3. Solicitante</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">Sector *</label>
                    <select value={sectorSolicitante} onChange={(e) => setSectorSolicitante(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm focus:outline-none" required>
                      <option value="">Seleccionar sector...</option>
                      {SECTORES_ORGANIZACIONALES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">Localidad</label>
                    <select value={localidadSolicitante} onChange={(e) => setLocalidadSolicitante(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm focus:outline-none">
                      <option value="">Seleccionar localidad...</option>
                      {LOCALIDADES.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 4: TIPO DE ABASTECIMIENTO */}
              <div className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">4. Tipo de Abastecimiento</h4>
                <div className="grid grid-cols-3 gap-2">
                  {TIPOS_COMBUSTIBLE_ORDEN.map((tipo) => (
                    <button key={tipo.value} type="button" onClick={() => {
                      setTipoCombustible(tipo.value);
                      setSubtipoCombustible("");
                    }} className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition ${tipoCombustible === tipo.value ? "bg-indigo-600/20 border-indigo-500 text-indigo-400" : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"}`}>
                      {tipo.label}
                    </button>
                  ))}
                </div>
                {tieneSubtipos(tipoCombustible) && (
                  <div className="pt-2">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">Subtipo de Combustible</label>
                    <select value={subtipoCombustible} onChange={(e) => setSubtipoCombustible(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm focus:outline-none">
                      <option value="">Seleccionar subtipo...</option>
                      {getSubtiposCombustible(tipoCombustible).map((st) => (
                        <option key={st.value} value={st.value}>{st.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* SECCIÓN 5: CANTIDAD */}
              <div className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">5. Cantidad</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">Galones / Litros</label>
                    <input type="number" step="0.01" value={cantidadGalones} onChange={(e) => setCantidadGalones(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm focus:outline-none font-mono" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">Costo por Galón</label>
                    <input type="number" step="0.01" value={costoGalon} onChange={(e) => setCostoGalon(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm focus:outline-none font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">Kilometraje (Odómetro) *</label>
                    <input type="number" value={kilometrajeActual} onChange={(e) => setKilometrajeActual(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm focus:outline-none font-mono" required />
                  </div>
                </div>
                {cantidadGalones && costoGalon && (
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Costo Total: </span>
                    <span className="text-sm font-black text-white">S/. {(parseFloat(cantidadGalones || "0") * parseFloat(costoGalon || "0")).toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* SECCIÓN 6: SERVICENTRO */}
              <div className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">6. Sello del Servicentro</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">Nombre del Servicentro</label>
                    <select value={nombreServiccentro} onChange={(e) => setNombreServiccentro(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm focus:outline-none">
                      <option value="">Seleccionar servicentro...</option>
                      {SERVICENTROS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">N° Ticket / Factura</label>
                    <input type="text" value={numeroTicketServiccentro} onChange={(e) => setNumeroTicketServiccentro(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">Responsable Servicentro</label>
                    <input type="text" value={responsableServiccentro} onChange={(e) => setResponsableServiccentro(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center space-x-2 cursor-pointer pb-2">
                      <input type="checkbox" checked={selloServiccentro} onChange={(e) => setSelloServiccentro(e.target.checked)} className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600" />
                      <span className="text-xs text-slate-300">¿Sello recibido?</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 7: LUBRICANTE (Opcional) */}
              <div className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-4 space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={incluyeAceiteMotor} onChange={(e) => setIncluyeAceiteMotor(e.target.checked)} className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-300">Incluye Aceite de Motor</span>
                </label>
                {incluyeAceiteMotor && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase">Cantidad (Litros)</label>
                      <input type="number" step="0.1" value={cantidadAceiteMotorLt} onChange={(e) => setCantidadAceiteMotorLt(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm focus:outline-none font-mono" />
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN 8: FIRMAS */}
              <div className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">7. Firmas</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">Encargado del Garaje *</label>
                    <input type="text" value={firmaEncargadoGaraje} onChange={(e) => setFirmaEncargadoGaraje(e.target.value)} placeholder="Nombre completo" className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm focus:outline-none" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">Conductor *</label>
                    <input type="text" value={firmaConductor} onChange={(e) => setFirmaConductor(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm focus:outline-none" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">Representante Servicentro</label>
                    <input type="text" value={firmaServicentro} onChange={(e) => setFirmaServicentro(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm focus:outline-none" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold rounded-xl transition duration-150 shadow-lg text-sm">
                {isSubmitting ? "Guardando..." : "Registrar Orden de Abastecimiento"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
