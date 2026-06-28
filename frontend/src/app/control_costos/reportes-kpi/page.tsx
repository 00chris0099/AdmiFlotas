"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { exportToPDF, exportToExcel } from "@/utils/exportUtils";

interface KPIReport {
  id: string;
  vehiculo: string;
  placa: string;
  periodo: string;
  iuv: number;
  ckv: number;
  metaCumplida: boolean;
  diasOperados: number;
  kilometraje: number;
  horasUso: number;
  costoCombustible: number;
  costoMantenimiento: number;
}

interface ResumenFlota {
  ckvMedio: number;
  iuvMedio: number;
  metaTasa: number;
}

export default function KPIPage() {
  const [reportes, setReportes] = useState<KPIReport[]>([]);
  const [resumen, setResumen] = useState<ResumenFlota>({ ckvMedio: 0, iuvMedio: 0, metaTasa: 0 });
  const [loading, setLoading] = useState(true);
  const [vistaGrafica, setVistaGrafica] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    fetch("/api/control_costos/reportes-kpi")
      .then((res) => res.json())
      .then((data) => {
        setReportes(data.reportes || []);
        setResumen(data.resumenFlota || { ckvMedio: 0, iuvMedio: 0, metaTasa: 0 });
        if (data.reportes?.length > 0) {
          setSelectedReportId(data.reportes[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar KPIs:", err);
        setLoading(false);
      });
  }, []);

  const columns: ColumnDef<KPIReport>[] = [
    { header: "Período", accessorKey: "periodo", className: "font-mono" },
    { header: "Vehículo", accessorKey: (row) => `${row.placa} (${row.vehiculo})` },
    { header: "IUV (Utilización)", accessorKey: (row) => `${row.iuv}%` },
    { header: "CKV (Costo/Km)", accessorKey: (row) => `S/. ${row.ckv.toFixed(2)}`, className: "font-semibold text-white" },
    {
      header: "Meta F1T02",
      className: "text-right",
      accessorKey: (row) => (
        <span className={`inline-block border px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          row.metaCumplida
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
        }`}>
          {row.metaCumplida ? "CUMPLIDA" : "DESVIACIÓN"}
        </span>
      ),
    },
  ];

  // Reporte seleccionado para el detalle visual
  const selectedReport = reportes.find((r) => r.id === selectedReportId) || reportes[0];

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
          <h2 className="text-2xl font-bold text-white">Reportes KPI (CKV / IUV)</h2>
          <p className="text-xs text-slate-400">Consolidado mensual de Costo por Kilómetro e Índice de Utilización Vehicular (Manual Técnico F1T02)</p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setVistaGrafica(true)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition duration-150 ${
              vistaGrafica ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Panel Gráfico
          </button>
          <button
            onClick={() => setVistaGrafica(false)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition duration-150 ${
              !vistaGrafica ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Tablas y Datos
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Cargando reportes e indicadores de la base de datos...</div>
      ) : (
        <>
          {/* TARJETAS KPI RESUMEN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 border border-slate-850/80 p-5 rounded-2xl relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl"></div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">CKV Promedio Flota</p>
              <h3 className="text-3xl font-black text-white mt-2">S/. {resumen.ckvMedio?.toFixed(2)}</h3>
              <p className="text-[10px] text-emerald-400 mt-1">✓ Meta objetivo: S/. 3.50 por Km</p>
            </div>
            
            <div className="bg-slate-950 border border-slate-850/80 p-5 rounded-2xl relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl"></div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">IUV Promedio Flota</p>
              <h3 className="text-3xl font-black text-white mt-2">{resumen.iuvMedio}%</h3>
              <p className="text-[10px] text-cyan-400 mt-1">✓ Nivel de utilización eficiente</p>
            </div>

            <div className="bg-slate-950 border border-slate-850/80 p-5 rounded-2xl relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl"></div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Cumplimiento de Metas</p>
              <h3 className="text-3xl font-black text-emerald-400 mt-2">{resumen.metaTasa}%</h3>
              <p className="text-[10px] text-slate-400 mt-1">Vehículos operando bajo estándares F1T02</p>
            </div>
          </div>

          {vistaGrafica ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LISTADO INTERACTIVO Y GRÁFICO DE BARRAS CKV */}
              <div className="lg:col-span-2 bg-slate-950 border border-slate-850/80 p-6 rounded-2xl space-y-6">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Comparativa CKV por Vehículo</h4>
                
                {/* GRÁFICO DE BARRAS SVG */}
                <div className="h-64 flex flex-col justify-end space-y-2 relative pt-6">
                  {/* Línea de Meta F1T02 */}
                  <div className="absolute left-0 w-full border-t border-dashed border-rose-500/50" style={{ bottom: "57%" }}>
                    <span className="absolute right-2 -top-5 text-[9px] font-bold text-rose-400 bg-slate-950 px-1">META MÁXIMA CKV (S/. 3.50)</span>
                  </div>
                  
                  <div className="flex items-end justify-around h-full pb-4 border-b border-slate-800">
                    {reportes.map((rep) => {
                      const percentage = Math.min(100, (rep.ckv / 5) * 100);
                      const isSelected = selectedReportId === rep.id;
                      
                      return (
                        <div
                          key={rep.id}
                          onClick={() => setSelectedReportId(rep.id)}
                          className="flex flex-col items-center group cursor-pointer w-20"
                        >
                          <div className="relative w-full flex justify-center">
                            {/* Tooltip */}
                            <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all duration-150 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-bold text-white z-10 whitespace-nowrap shadow-xl">
                              S/. {rep.ckv.toFixed(2)} / km
                            </div>
                            
                            {/* Barra */}
                            <div
                              className={`w-12 rounded-t-lg transition-all duration-300 ${
                                isSelected 
                                  ? "bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.3)]" 
                                  : "bg-slate-800 group-hover:bg-slate-700"
                              }`}
                              style={{ height: `${percentage * 1.6}px` }}
                            ></div>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold font-mono mt-2 group-hover:text-white transition duration-150">
                            {rep.placa}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* SELECTOR/DETALLES VEHÍCULO */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {reportes.map((rep) => (
                    <button
                      key={rep.id}
                      onClick={() => setSelectedReportId(rep.id)}
                      className={`p-3 rounded-xl border text-left transition duration-150 ${
                        selectedReportId === rep.id
                          ? "bg-indigo-950/20 border-indigo-500/40 text-white"
                          : "bg-slate-900/40 border-slate-850 hover:border-slate-800 text-slate-400"
                      }`}
                    >
                      <p className="text-[10px] font-bold font-mono">{rep.placa}</p>
                      <p className="text-xs font-semibold truncate">{rep.vehiculo}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* DETALLE INDIVIDUAL DE UTILIZACIÓN (IUV GAUGE CHART) */}
              {selectedReport && (
                <div className="bg-slate-950 border border-slate-850/80 p-6 rounded-2xl flex flex-col justify-between space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Utilización Vehicular (IUV)</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Evaluación de horas operadas y rendimiento de {selectedReport.placa}</p>
                  </div>
                  
                  {/* CALIBRADOR ANILLO SVG */}
                  <div className="flex justify-center relative">
                    <svg className="w-48 h-48 transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="76"
                        stroke="#1e293b"
                        strokeWidth="14"
                        fill="transparent"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="76"
                        stroke="url(#indigoGrad)"
                        strokeWidth="14"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 76}
                        strokeDashoffset={2 * Math.PI * 76 * (1 - selectedReport.iuv / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                      <defs>
                        <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-white">{selectedReport.iuv}%</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Índice IUV</span>
                    </div>
                  </div>

                  {/* DATOS DETALLADOS */}
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-4 text-xs">
                    <div>
                      <span className="text-slate-400">Kilómetros</span>
                      <p className="font-semibold text-white font-mono mt-0.5">{selectedReport.kilometraje} Km</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Horas Efectivas</span>
                      <p className="font-semibold text-white font-mono mt-0.5">{selectedReport.horasUso} hrs</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Gasto Combustible</span>
                      <p className="font-semibold text-white font-mono mt-0.5">S/. {selectedReport.costoCombustible?.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Gasto Mantenimiento</span>
                      <p className="font-semibold text-white font-mono mt-0.5">S/. {selectedReport.costoMantenimiento?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <DataTable
              data={reportes}
              columns={columns}
              searchKey="placa"
              searchPlaceholder="Buscar por placa..."
              newActionLabel="Exportar Reportes"
              onNewAction={() => setShowExportModal(true)}
            />
          )}
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
                <span>Exportar Reportes de KPI</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Seleccione el formato de exportación para la flota
              </p>
            </div>

            <div className="space-y-3">
              {/* PDF button */}
              <button
                onClick={() => {
                  const pdfRows = reportes.map(r => ({
                    ...r,
                    metaCumplidaLabel: r.metaCumplida ? "CUMPLIDA" : "DESVIACIÓN",
                    ckv: `S/. ${r.ckv.toFixed(2)}`,
                    iuv: `${r.iuv}%`
                  }));
                  exportToPDF(
                    "CONSOLIDADO MENSUAL DE INDICADORES DE FLOTA",
                    "Reporte ejecutivo de costos CKV y niveles de utilización IUV según norma F1T02.",
                    [
                      { header: "Período", dataKey: "periodo" },
                      { header: "Placa", dataKey: "placa" },
                      { header: "Vehículo", dataKey: "vehiculo" },
                      { header: "Uso (Hrs)", dataKey: "horasUso" },
                      { header: "Recorrido (Km)", dataKey: "kilometraje" },
                      { header: "IUV", dataKey: "iuv" },
                      { header: "CKV", dataKey: "ckv" },
                      { header: "Meta F1T02", dataKey: "metaCumplidaLabel" }
                    ],
                    pdfRows,
                    "reportes_kpi_flota_F1T02.pdf"
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
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Genera un informe con membrete oficial e indicadores de cumplimiento.</p>
                </div>
              </button>

              {/* Excel button */}
              <button
                onClick={() => {
                  const excelRows = reportes.map(r => ({
                    "ID": r.id,
                    "Vehículo": r.vehiculo,
                    "Placa": r.placa,
                    "Período": r.periodo,
                    "IUV (%)": r.iuv,
                    "CKV (S/.)": r.ckv,
                    "Cumple Meta": r.metaCumplida ? "SÍ" : "NO",
                    "Días Operados": r.diasOperados,
                    "Kilometraje": r.kilometraje,
                    "Horas Uso": r.horasUso,
                    "Costo Combustible": r.costoCombustible,
                    "Costo Mantenimiento": r.costoMantenimiento
                  }));
                  exportToExcel(excelRows, "reportes_kpi_flota_F1T02.xlsx");
                  setShowExportModal(false);
                }}
                className="w-full p-4 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-emerald-500/40 rounded-2xl text-left transition duration-150 flex items-center space-x-4 group cursor-pointer"
              >
                <span className="text-2xl p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                  📗
                </span>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition">Excel (XLSX)</h4>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Descarga la hoja de cálculo completa de KPIs para auditoría y BI.</p>
                </div>
              </button>

              {/* JSON button */}
              <button
                onClick={() => {
                  const text = JSON.stringify(reportes, null, 2);
                  const blob = new Blob([text], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "reportes_kpi_F1T02.json";
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
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Descarga el dataset sin procesar en formato JSON nativo.</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

