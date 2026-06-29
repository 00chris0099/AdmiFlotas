"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

interface CostoItem {
  id: string;
  periodo: string;
  tipo: string;
  descripcion: string;
  montoMensual: number;
  activo: boolean;
}

interface ResumenCostos {
  totalFijo: number;
  totalCombustible: number;
  totalMantenimiento: number;
}

export default function CostosPage() {
  const [costos, setCostos] = useState<CostoItem[]>([]);
  const [resumen, setResumen] = useState<ResumenCostos>({ totalFijo: 0, totalCombustible: 0, totalMantenimiento: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Campos del formulario
  const [periodo, setPeriodo] = useState("2026-06");
  const [tipo, setTipo] = useState("PERSONAL_ADMINISTRATIVO");
  const [descripcion, setDescripcion] = useState("");
  const [montoMensual, setMontoMensual] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    fetchWithAuth("/api/control_costos/costos-fijo-variable")
      .then((res) => res.json())
      .then((data) => {
        setCostos(data.costosFijos || []);
        setResumen(data.resumenCostos || { totalFijo: 0, totalCombustible: 0, totalMantenimiento: 0 });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar costos:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este costo fijo?")) return;
    try {
      const res = await fetchWithAuth("/api/control_costos/costos-fijo-variable", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar costo");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion || !montoMensual) return;
    
    setSubmitting(true);
    try {
      const res = await fetchWithAuth("/api/control_costos/costos-fijo-variable", {
        method: "POST",
        body: JSON.stringify({
          periodo,
          tipo,
          descripcion,
          montoMensual: parseFloat(montoMensual),
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setDescripcion("");
        setMontoMensual("");
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Error al guardar costo");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnDef<CostoItem>[] = [
    { header: "Período", accessorKey: "periodo", className: "font-mono" },
    { header: "Tipo de Costo", accessorKey: "tipo" },
    { header: "Descripción", accessorKey: "descripcion", className: "text-slate-350" },
    { header: "Monto Mensual", accessorKey: (row) => `S/. ${Number(row.montoMensual).toFixed(2)}`, className: "font-semibold text-white" },
    {
      header: "Estado",
      className: "text-right",
      accessorKey: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          row.activo 
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
            : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
        }`}>
          {row.activo ? "ACTIVO" : "INACTIVO"}
        </span>
      ),
    },
    {
      header: "Acciones",
      className: "text-right",
      accessorKey: (row) => (
        <button
          onClick={() => handleDelete(row.id)}
          className="px-2.5 py-1 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg text-[10px] font-bold transition duration-150"
        >
          Eliminar
        </button>
      ),
    },
  ];

  // Agrupamiento por tipo de costo fijo para el gráfico SVG
  const distribucionFijos = costos
    .filter(c => c.activo)
    .reduce((acc: { [key: string]: number }, item) => {
      acc[item.tipo] = (acc[item.tipo] || 0) + Number(item.montoMensual);
      return acc;
    }, {});

  const totalFijos = Object.values(distribucionFijos).reduce((sum, v) => sum + v, 0) || 1;

  // Colores por categoría de costo fijo
  const colorsMap: { [key: string]: string } = {
    PERSONAL_ADMINISTRATIVO: "#6366f1", // Indigo
    OFICINA: "#3b82f6", // Blue
    COMUNICACIONES: "#06b6d4", // Cyan
    SEGUROS_GENERALES: "#10b981", // Emerald
    LICENCIAS_SOFTWARE: "#f59e0b", // Amber
    OTROS: "#64748b", // Slate
  };

  // Calcular ángulos acumulados para el gráfico de dona SVG
  let acumuladoAngulo = 0;
  const donutslices = Object.entries(distribucionFijos).map(([tipo, monto]) => {
    const porcentaje = (monto / totalFijos) * 100;
    const angulo = (monto / totalFijos) * 360;
    const slice = {
      tipo,
      monto,
      porcentaje,
      anguloStart: acumuladoAngulo,
      anguloEnd: acumuladoAngulo + angulo,
      color: colorsMap[tipo] || "#64748b",
    };
    acumuladoAngulo += angulo;
    return slice;
  });

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
          <h2 className="text-2xl font-bold text-white">Costos Fijos y Variables</h2>
          <p className="text-xs text-slate-400">Prorrateo de costos fijos generales (Oficina, personal, comunicaciones) para el cálculo del CKV (F1T02)</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition duration-150 shadow-md"
        >
          + Registrar Costo Fijo
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Cargando desglose de costos...</div>
      ) : (
        <>
          {/* PANEL ANALÍTICO DE DISTRIBUCIÓN DE COSTOS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* GRÁFICO DONA SVG DE DISTRIBUCIÓN (COSTO FIJO) */}
            <div className="bg-slate-950 border border-slate-850/80 p-6 rounded-2xl flex flex-col items-center justify-between space-y-6">
              <div className="w-full text-left">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Distribución Costos Fijos</h4>
                <p className="text-[10px] text-slate-400 mt-1">Participación relativa en el presupuesto fijo del SAF</p>
              </div>

              {donutslices.length > 0 ? (
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#1e293b" strokeWidth="4.5" />
                    {donutslices.map((slice, i) => {
                      // Dasharray = Porcentaje, Dashoffset = 100 - AnguloInicialAcumulado + Porcentaje
                      const strokeDash = `${slice.porcentaje} ${100 - slice.porcentaje}`;
                      const strokeOffset = 100 - slice.anguloStart / 3.6 + 25; // +25 para iniciar arriba
                      
                      return (
                        <circle
                          key={i}
                          cx="21"
                          cy="21"
                          r="15.915"
                          fill="transparent"
                          stroke={slice.color}
                          strokeWidth="4.5"
                          strokeDasharray={strokeDash}
                          strokeDashoffset={strokeOffset}
                          className="transition-all duration-300"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Total Fijo</span>
                    <span className="text-xl font-black text-white">S/. {resumen.totalFijo}</span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">Sin costos fijos cargados</div>
              )}

              {/* LEYENDA */}
              <div className="w-full grid grid-cols-2 gap-2 text-[10px]">
                {donutslices.map((slice, i) => (
                  <div key={i} className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: slice.color }}></span>
                    <span className="text-slate-400 truncate uppercase">{slice.tipo.replace("_", " ")}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RATIO DE COSTOS VARIABLES (COMBUSTIBLE VS MANTENIMIENTO) */}
            <div className="lg:col-span-2 bg-slate-950 border border-slate-850/80 p-6 rounded-2xl flex flex-col justify-between space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Costo Variable Total (CVV)</h4>
                <p className="text-[10px] text-slate-400 mt-1">Proporción de gastos acumulados en Combustible y Órdenes de Mantenimiento</p>
              </div>

              {/* BARRA HORIZONTAL APILADA */}
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-indigo-400">Combustible: S/. {resumen.totalCombustible?.toFixed(2)}</span>
                  <span className="text-emerald-400">Mantenimiento: S/. {resumen.totalMantenimiento?.toFixed(2)}</span>
                </div>
                
                <div className="w-full h-6 bg-slate-900 rounded-xl overflow-hidden flex border border-slate-850">
                  {resumen.totalCombustible + resumen.totalMantenimiento > 0 ? (
                    <>
                      <div 
                        className="bg-indigo-600 h-full transition-all duration-300"
                        style={{ width: `${(resumen.totalCombustible / (resumen.totalCombustible + resumen.totalMantenimiento)) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${(resumen.totalMantenimiento / (resumen.totalCombustible + resumen.totalMantenimiento)) * 100}%` }}
                      ></div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">Sin datos registrados</div>
                  )}
                </div>
                
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Porcentaje del CVV: {resumen.totalCombustible + resumen.totalMantenimiento > 0 ? Math.round((resumen.totalCombustible / (resumen.totalCombustible + resumen.totalMantenimiento)) * 100) : 0}%</span>
                  <span>Porcentaje del CVV: {resumen.totalCombustible + resumen.totalMantenimiento > 0 ? Math.round((resumen.totalMantenimiento / (resumen.totalCombustible + resumen.totalMantenimiento)) * 100) : 0}%</span>
                </div>
              </div>

              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-900 text-[11px] text-slate-350">
                <span className="font-bold text-white">F1T02 Nota:</span> Mantener control estricto sobre el balance CVV asegura una correcta toma de decisiones en el cálculo mensual del CKV.
              </div>
            </div>

          </div>

          {/* DATATABLE */}
          <DataTable
            data={costos}
            columns={columns}
            searchKey="tipo"
            searchPlaceholder="Buscar por tipo de costo..."
            newActionLabel="Exportar Datos"
            onNewAction={() => {
              const text = JSON.stringify({ costos, resumen }, null, 2);
              const blob = new Blob([text], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "costos_fijos_variables_F1T02.json";
              a.click();
            }}
          />
        </>
      )}

      {/* MODAL REGISTRAR COSTO FIJO */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-850 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-900 flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Registrar Costo Fijo Prorrateable</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold">×</button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Período de Referencia</label>
                <input
                  type="text"
                  placeholder="YYYY-MM"
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-600 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tipo de Costo Fijo</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-600"
                >
                  <option value="PERSONAL_ADMINISTRATIVO">Personal Administrativo</option>
                  <option value="OFICINA">Oficina</option>
                  <option value="COMUNICACIONES">Comunicaciones</option>
                  <option value="SEGUROS_GENERALES">Seguros Generales</option>
                  <option value="LICENCIAS_SOFTWARE">Licencias de Software</option>
                  <option value="OTROS">Otros</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Descripción</label>
                <input
                  type="text"
                  placeholder="Ej. Pago de arriendo oficina principal"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Monto Mensual (S/.)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={montoMensual}
                  onChange={(e) => setMontoMensual(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-xs font-bold border border-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition duration-150"
                >
                  {submitting ? "Guardando..." : "Guardar Registro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
