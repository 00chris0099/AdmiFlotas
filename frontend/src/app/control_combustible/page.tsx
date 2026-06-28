"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";

interface OrdenCombustible {
  id: string;
  numeroOrden: string;
  placa: string;
  vehiculoLabel: string;
  vehiculoId: string;
  conductor: string;
  cantidadGalones: number;
  costoTotal: number;
  kilometrajeActual: number;
  servicentro: string;
  tipoCombustible: string;
}

interface DbVehiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
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

  // Estados Formulario
  const [numeroOrden, setNumeroOrden] = useState("");
  const [vehiculoId, setVehiculoId] = useState("");
  const [conductorId, setConductorId] = useState("");
  const [tipoCombustible, setTipoCombustible] = useState("DIESEL");
  const [cantidadGalones, setCantidadGalones] = useState("10");
  const [costoGalon, setCostoGalon] = useState("16.50");
  const [kilometrajeActual, setKilometrajeActual] = useState("");
  const [nombreServiccentro, setNombreServiccentro] = useState("Repsol Prialé");
  const [incluyeAceiteMotor, setIncluyeAceiteMotor] = useState(false);
  const [cantidadAceiteMotorLt, setCantidadAceiteMotorLt] = useState("0.5");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargarCatalogos = async () => {
    try {
      const [resVeh, resCond] = await Promise.all([
        fetch("/api/vehiculos"),
        fetch("/api/conductores")
      ]);
      const dataVeh = await resVeh.json();
      const dataCond = await resCond.json();

      if (Array.isArray(dataVeh)) {
        setVehiculos(dataVeh);
        if (dataVeh.length > 0) setVehiculoId(dataVeh[0].id);
      }
      if (Array.isArray(dataCond)) {
        setConductores(dataCond);
        if (dataCond.length > 0) setConductorId(dataCond[0].id);
      }
    } catch (err) {
      console.error("Error al cargar catálogos:", err);
    }
  };

  const cargarOrdenes = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/control_combustible");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/control_combustible", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numeroOrden,
          vehiculoId,
          conductorId,
          tipoCombustible,
          cantidadGalones: parseFloat(cantidadGalones),
          costoGalon: parseFloat(costoGalon),
          kilometrajeActual: parseInt(kilometrajeActual),
          nombreServiccentro,
          incluyeAceiteMotor,
          cantidadAceiteMotorLt: incluyeAceiteMotor ? parseFloat(cantidadAceiteMotorLt) : 0,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        setNumeroOrden("");
        setKilometrajeActual("");
        cargarOrdenes();
        alert("¡Abastecimiento registrado con éxito!");
      } else {
        alert("Error: " + data.error);
      }
    } catch (err: any) {
      alert("Error de red: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cálculos dinámicos de eficiencia de combustible global
  const totalGalones = ordenes.reduce((sum, o) => sum + o.cantidadGalones, 0);
  const totalCosto = ordenes.reduce((sum, o) => sum + o.costoTotal, 0);
  
  // Calcular rendimiento (km / galón) estimativo por vehículo
  // Buscamos diferencia entre odómetro máximo y mínimo de cada vehículo
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
    const diffKm = maxOdo - minOdo || 120; // 120 km por defecto si es solo una carga
    const galons = galonesPorVehiculo[placa] || 1;
    const kmGalon = diffKm / galons;
    
    // Nivel de eficiencia (0 al 100). Meta F1T02 = 35 km/galón
    const eficiencia = Math.min(100, Math.round((kmGalon / 35) * 100));

    return {
      placa,
      kmGalon: Number(kmGalon.toFixed(1)),
      eficiencia,
    };
  });

  const columns: ColumnDef<OrdenCombustible>[] = [
    { header: "N° Orden", accessorKey: "numeroOrden", className: "font-mono text-indigo-400 font-semibold" },
    { header: "Vehículo", accessorKey: "placa" },
    { header: "Conductor", accessorKey: "conductor" },
    { header: "Galones", accessorKey: (row) => `${row.cantidadGalones} Gal`, className: "font-mono" },
    { header: "Combustible", accessorKey: "tipoCombustible" },
    { header: "Km Registro", accessorKey: (row) => `${row.kilometrajeActual} km`, className: "font-mono" },
    { header: "Servicentro", accessorKey: "servicentro" },
    { header: "Costo Total", accessorKey: (row) => `S/. ${row.costoTotal.toFixed(2)}`, className: "text-right font-bold text-white" },
  ];

  return (
    <div className="space-y-6">
      {/* BOTÓN VOLVER */}
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
          <h2 className="text-2xl font-bold text-white">Control de Combustible y Lubricantes</h2>
          <p className="text-xs text-slate-400">Órdenes de abastecimiento y trazabilidad de servicentros acreditados (MA 122 01 02)</p>
        </div>

        <button
          onClick={() => {
            setNumeroOrden(`FAC-${Date.now().toString().slice(-6)}`);
            setModalOpen(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition duration-150 shadow-md"
        >
          + Registrar Abastecimiento
        </button>
      </div>

      {/* TARJETAS DE KPIs DE COMBUSTIBLE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-950 border border-slate-850/80 p-5 rounded-2xl relative overflow-hidden shadow-lg">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Combustible Despachado</p>
          <h3 className="text-3xl font-black text-white mt-2">{totalGalones.toFixed(1)} Galones</h3>
          <p className="text-[10px] text-slate-400 mt-1">Acumulado total de la flota</p>
        </div>

        <div className="bg-slate-950 border border-slate-850/80 p-5 rounded-2xl relative overflow-hidden shadow-lg">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Costo Acumulado Combustible</p>
          <h3 className="text-3xl font-black text-white mt-2">S/. {totalCosto.toFixed(2)}</h3>
          <p className="text-[10px] text-slate-400 mt-1">Gasto total en servicentros acreditados</p>
        </div>

        <div className="bg-slate-950 border border-slate-850/80 p-5 rounded-2xl relative overflow-hidden shadow-lg">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Rendimiento Promedio Flota</p>
          <h3 className="text-3xl font-black text-emerald-400 mt-2">
            {rendimientos.length > 0 
              ? (rendimientos.reduce((sum, r) => sum + r.kmGalon, 0) / rendimientos.length).toFixed(1)
              : "0"} Km/Gal
          </h3>
          <p className="text-[10px] text-emerald-400 mt-1">✓ Meta patrón: 35 km por galón</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TABLA PRINCIPAL DE REGISTROS */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Cargando abastecimientos reales de Supabase...</div>
          ) : (
            <DataTable
              data={ordenes}
              columns={columns}
              searchKey="numeroOrden"
              searchPlaceholder="Buscar por número de orden..."
              newActionLabel=""
              onNewAction={() => {}}
            />
          )}
        </div>

        {/* INDICADORES DE RENDIMIENTO (GAUGE CHARTS SVG) */}
        <div className="bg-slate-950 border border-slate-850/80 p-6 rounded-2xl space-y-6">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Eficiencia de Consumo (Km/Galón)</h4>
            <p className="text-[10px] text-slate-400 mt-1">Rendimiento relativo frente a la meta F1T02 por vehículo</p>
          </div>

          {rendimientos.length > 0 ? (
            <div className="space-y-6 max-h-[350px] overflow-y-auto pr-1">
              {rendimientos.map((r, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div>
                    <span className="text-xs font-bold text-white font-mono">{r.placa}</span>
                    <p className="text-[10px] text-slate-400">Rendimiento: {r.kmGalon} km/gal</p>
                  </div>
                  
                  {/* Calibrador de progreso */}
                  <div className="flex items-center space-x-3">
                    <span className={`text-[10px] font-bold ${
                      r.eficiencia >= 80 ? "text-emerald-400" : r.eficiencia >= 50 ? "text-amber-400" : "text-rose-400"
                    }`}>
                      {r.eficiencia}% Meta
                    </span>
                    <div className="w-20 h-2 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                      <div 
                        className={`h-full ${
                          r.eficiencia >= 80 ? "bg-emerald-500" : r.eficiencia >= 50 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${r.eficiencia}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-900 rounded-xl">
              Sin datos de rendimiento para simular. Registre al menos dos abastecimientos por vehículo.
            </div>
          )}
        </div>

      </div>

      {/* MODAL DE REGISTRO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div>
              <h3 className="text-lg font-bold text-indigo-400">Registrar Combustible</h3>
              <p className="text-xs text-slate-400">Formulario MA 122 01 02</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-350">N° de Orden</label>
                <input
                  type="text"
                  value={numeroOrden}
                  onChange={(e) => setNumeroOrden(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-350">Vehículo</label>
                  <select
                    value={vehiculoId}
                    onChange={(e) => setVehiculoId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    required
                  >
                    {vehiculos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.placa} ({v.marca} {v.modelo})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-350">Conductor</label>
                  <select
                    value={conductorId}
                    onChange={(e) => setConductorId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    required
                  >
                    {conductores.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} {c.apellido}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-350">Galones</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cantidadGalones}
                    onChange={(e) => setCantidadGalones(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-350">Precio por Galón</label>
                  <input
                    type="number"
                    step="0.01"
                    value={costoGalon}
                    onChange={(e) => setCostoGalon(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-350">Odómetro Actual (Km)</label>
                  <input
                    type="number"
                    value={kilometrajeActual}
                    onChange={(e) => setKilometrajeActual(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-350">Servicentro</label>
                  <input
                    type="text"
                    value={nombreServiccentro}
                    onChange={(e) => setNombreServiccentro(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    required
                  />
                </div>
              </div>

              <label className="flex items-center space-x-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={incluyeAceiteMotor}
                  onChange={(e) => setIncluyeAceiteMotor(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                />
                <span className="text-xs text-slate-300">¿Incluye abastecimiento de Aceite de Motor?</span>
              </label>

              {incluyeAceiteMotor && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400">Cantidad (Litros)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={cantidadAceiteMotorLt}
                        onChange={(e) => setCantidadAceiteMotorLt(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400">Viscosidad</label>
                      <input
                        type="text"
                        defaultValue="15W-40"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-505 disabled:bg-slate-800 text-white font-bold rounded-xl transition duration-150 shadow-lg text-sm"
              >
                {isSubmitting ? "Guardando en Supabase..." : "Confirmar y Registrar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
