"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { exportToPDF, exportToExcel } from "@/utils/exportUtils";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

interface CurvaPunto {
  anio: number;
  depreciacion: number;
  mantenimiento: number;
  costoTotal: number;
  cpa: number;
}

interface VehiculoBaja {
  id: string;
  vehiculoId: string;
  vehiculoLabel: string;
  placa: string;
  valorAdquisicion: number;
  vidaUtilAnios: number;
  aniosUso: number;
  anioOptimo: number;
  requiereCambio: boolean;
  curva: CurvaPunto[];
}

export default function SustitucionPage() {
  const [vehiculosBajas, setVehiculosBajas] = useState<VehiculoBaja[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehiculoId, setSelectedVehiculoId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    fetchWithAuth("/api/control_costos/sustitucion")
      .then((res) => res.json())
      .then((data) => {
        setVehiculosBajas(data || []);
        if (data && data.length > 0) {
          setSelectedVehiculoId(data[0].vehiculoId);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar sustituciones:", err);
        setLoading(false);
      });
  }, []);

  const activeVeh = vehiculosBajas.find((v) => v.vehiculoId === selectedVehiculoId) || vehiculosBajas[0];

  const columns: ColumnDef<VehiculoBaja>[] = [
    { header: "Vehículo", accessorKey: "vehiculoLabel", className: "font-semibold text-white" },
    { header: "Años de Uso", accessorKey: (row) => `${row.aniosUso} años` },
    { header: "Año Óptimo Sustitución", accessorKey: (row) => `Año ${row.anioOptimo}` },
    { header: "Valor Nuevo", accessorKey: (row) => `S/. ${row.valorAdquisicion.toLocaleString()}` },
    {
      header: "Alerta Renovación",
      className: "text-right",
      accessorKey: (row) => (
        <span className={`inline-block border px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          row.requiereCambio
            ? "bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse"
            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        }`}>
          {row.requiereCambio ? "REEMPLAZAR" : "ÓPTIMO"}
        </span>
      ),
    },
  ];

  // Generar coordenadas SVG para las líneas
  const generateSvgPoints = (dataPoints: CurvaPunto[], key: "depreciacion" | "mantenimiento" | "cpa", width: number, height: number) => {
    const maxX = 10;
    const maxY = Math.max(...dataPoints.map((pt) => Math.max(pt.depreciacion, pt.mantenimiento, pt.cpa))) || 20000;
    
    return dataPoints.map((pt) => {
      const x = ((pt.anio - 1) / (maxX - 1)) * (width - 40) + 20;
      const val = pt[key];
      const y = height - ((val / maxY) * (height - 40) + 20);
      return `${x},${y}`;
    }).join(" ");
  };

  const svgWidth = 500;
  const svgHeight = 280;

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

      <div>
        <h2 className="text-2xl font-bold text-white">Análisis de Sustitución Vehicular</h2>
        <p className="text-xs text-slate-400">Evaluación de vida útil acumulada y alertas de renovación de flota basadas en depreciación CKV (F1T02)</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Cargando datos de simulación...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* GRÁFICO SVG CARTESIANO DE CURVA DE SUSTITUCIÓN */}
            <div className="lg:col-span-2 bg-slate-950 border border-slate-850/80 p-6 rounded-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Curva de Vida Económica (F1T02)</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Intersección de Depreciación, Conservación y Costo Promedio Anual (Cpa)</p>
                </div>
                
                {/* SELECTOR DE VEHÍCULO */}
                {vehiculosBajas.length > 0 && (
                  <select
                    value={selectedVehiculoId || ""}
                    onChange={(e) => setSelectedVehiculoId(e.target.value)}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-600 max-w-[200px]"
                  >
                    {vehiculosBajas.map((v) => (
                      <option key={v.vehiculoId} value={v.vehiculoId}>
                        {v.placa} ({v.vehiculoLabel.split(" - ")[1]})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {activeVeh && activeVeh.curva?.length > 0 ? (
                <div className="relative w-full flex justify-center py-4 bg-slate-900/10 rounded-xl border border-slate-900/60">
                  <svg className="w-full max-w-[500px] h-[280px]" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                    {/* Grilla Horizontales */}
                    <line x1="20" y1="20" x2={svgWidth - 20} y2="20" stroke="#1e293b" strokeDasharray="3 3" />
                    <line x1="20" y1="80" x2={svgWidth - 20} y2="80" stroke="#1e293b" strokeDasharray="3 3" />
                    <line x1="20" y1="140" x2={svgWidth - 20} y2="140" stroke="#1e293b" strokeDasharray="3 3" />
                    <line x1="20" y1="200" x2={svgWidth - 20} y2="200" stroke="#1e293b" strokeDasharray="3 3" />
                    
                    {/* Ejes */}
                    <line x1="20" y1={svgHeight - 20} x2={svgWidth - 20} y2={svgHeight - 20} stroke="#475569" strokeWidth="1.5" />
                    <line x1="20" y1="20" x2="20" y2={svgHeight - 20} stroke="#475569" strokeWidth="1.5" />

                    {/* Curva Depreciación (Rojo / Naranja) */}
                    <polyline
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2.5"
                      points={generateSvgPoints(activeVeh.curva, "depreciacion", svgWidth, svgHeight)}
                      className="opacity-75"
                    />

                    {/* Curva Conservación/Mantenimiento (Cyan) */}
                    <polyline
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2.5"
                      points={generateSvgPoints(activeVeh.curva, "mantenimiento", svgWidth, svgHeight)}
                      className="opacity-75"
                    />

                    {/* Curva Costo Promedio Anual Cpa (Indigo) */}
                    <polyline
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="3.5"
                      points={generateSvgPoints(activeVeh.curva, "cpa", svgWidth, svgHeight)}
                    />

                    {/* Punto Óptimo Reemplazo */}
                    {(() => {
                      const optPt = activeVeh.curva.find(pt => pt.anio === activeVeh.anioOptimo);
                      if (!optPt) return null;
                      const maxX = 10;
                      const maxY = Math.max(...activeVeh.curva.map((pt) => Math.max(pt.depreciacion, pt.mantenimiento, pt.cpa))) || 20000;
                      const cx = ((activeVeh.anioOptimo - 1) / (maxX - 1)) * (svgWidth - 40) + 20;
                      const cy = svgHeight - ((optPt.cpa / maxY) * (svgHeight - 40) + 20);
                      
                      return (
                        <g>
                          <circle cx={cx} cy={cy} r="8" fill="#6366f1" className="animate-ping" opacity="0.4" />
                          <circle cx={cx} cy={cy} r="5" fill="#6366f1" />
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-500">Sin datos de simulación</div>
              )}

              {/* Leyenda Gráfico */}
              <div className="flex justify-center space-x-6 text-[10px] uppercase font-bold">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-0.5 bg-[#f97316] inline-block"></span>
                  <span className="text-slate-400">Depreciación Acumulada</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-0.5 bg-[#06b6d4] inline-block"></span>
                  <span className="text-slate-400">Mantenimiento Acumulado</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-0.5 bg-[#6366f1] inline-block"></span>
                  <span className="text-indigo-400">Costo Promedio Anual (Cpa)</span>
                </div>
              </div>
            </div>

            {/* DETALLES DE CUMPLIMIENTO / DECISIÓN */}
            {activeVeh && (
              <div className="bg-slate-950 border border-slate-850/80 p-6 rounded-2xl flex flex-col justify-between space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Estado Técnico - Financiero</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Conclusión económica según Ecuación 11 y 12 (F1T02)</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-850">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Uso Transcurrido</span>
                    <span className="text-2xl font-black text-white">{activeVeh.aniosUso} Años</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-850">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Reemplazo Recomendado</span>
                    <span className="text-2xl font-black text-indigo-400">Año {activeVeh.anioOptimo}</span>
                  </div>

                  <div className={`p-4 rounded-xl border text-center font-bold text-sm ${
                    activeVeh.requiereCambio 
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse" 
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  }`}>
                    {activeVeh.requiereCambio 
                      ? "⚠ RENOVACIÓN RECOMENDADA INMEDIATA" 
                      : "✓ ACTIVO OPERANDO EN RANGO ÓPTIMO"}
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 italic">
                  * La simulación considera un desgaste y aumento de conservación real extraído del historial de mantenimiento del vehículo en Supabase.
                </div>
              </div>
            )}

          </div>

          {/* DATATABLE */}
          <DataTable
            data={vehiculosBajas}
            columns={columns}
            searchKey="placa"
            searchPlaceholder="Buscar por placa..."
            newActionLabel="Exportar Datos"
            onNewAction={() => setShowExportModal(true)}
          />
        </>
      )}

      {/* MODAL DE EXPORTACIÓN */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setShowExportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>📥</span>
                <span>Exportar Datos de Sustitución</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Seleccione el formato de exportación para la simulación
              </p>
            </div>

            <div className="space-y-3">
              {/* PDF button */}
              <button
                onClick={() => {
                  const pdfRows = vehiculosBajas.map(v => ({
                    ...v,
                    requiereCambioLabel: v.requiereCambio ? "REEMPLAZAR" : "ÓPTIMO",
                    valorAdquisicion: `S/. ${v.valorAdquisicion.toLocaleString()}`
                  }));
                  exportToPDF(
                    "SIMULACIÓN DE SUSTITUCIÓN DE VEHÍCULOS",
                    "Análisis del ciclo de vida económico de activos de la flota según depreciación anual acumulada.",
                    [
                      { header: "Vehículo", dataKey: "vehiculoLabel" },
                      { header: "Placa", dataKey: "placa" },
                      { header: "Años Uso", dataKey: "aniosUso" },
                      { header: "Año Óptimo", dataKey: "anioOptimo" },
                      { header: "Valor Nuevo", dataKey: "valorAdquisicion" },
                      { header: "Estado", dataKey: "requiereCambioLabel" }
                    ],
                    pdfRows,
                    "simulacion_sustitucion_flota_F1T02.pdf"
                  );
                  setShowExportModal(false);
                }}
                className="w-full p-4 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-indigo-500/40 rounded-2xl text-left transition duration-150 flex items-center space-x-4 group cursor-pointer"
              >
                <span className="text-2xl p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400">
                  📕
                </span>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition">PDF Corporativo</h4>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Genera un reporte corporativo con el ciclo de vida y la vida económica óptima.</p>
                </div>
              </button>

              {/* Excel button */}
              <button
                onClick={() => {
                  const excelRows = vehiculosBajas.map(v => ({
                    "ID": v.id,
                    "Vehículo": v.vehiculoLabel,
                    "Placa": v.placa,
                    "Valor Adquisición": v.valorAdquisicion,
                    "Vida Útil (Años)": v.vidaUtilAnios,
                    "Años Uso": v.aniosUso,
                    "Año Óptimo Reemplazo": v.anioOptimo,
                    "Requiere Cambio": v.requiereCambio ? "SÍ" : "NO"
                  }));
                  exportToExcel(excelRows, "simulacion_sustitucion_flota_F1T02.xlsx");
                  setShowExportModal(false);
                }}
                className="w-full p-4 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-emerald-500/40 rounded-2xl text-left transition duration-150 flex items-center space-x-4 group cursor-pointer"
              >
                <span className="text-2xl p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                  📗
                </span>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition">Excel (XLSX)</h4>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Descarga la tabla de simulación del ciclo de vida para auditorías de activos.</p>
                </div>
              </button>

              {/* JSON button */}
              <button
                onClick={() => {
                  const text = JSON.stringify(vehiculosBajas, null, 2);
                  const blob = new Blob([text], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "simulacion_sustitucion_flota_F1T02.json";
                  a.click();
                  setShowExportModal(false);
                }}
                className="w-full p-4 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-750 rounded-2xl text-left transition duration-150 flex items-center space-x-4 group cursor-pointer"
              >
                <span className="text-2xl p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
                  💾
                </span>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-white group-hover:text-white transition">Datos JSON</h4>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Descarga los datos de simulación crudos en formato JSON.</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

