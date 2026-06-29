"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { generateOrdenMantenimientoPDF } from "@/utils/pdfGenerators";
import Icon from "@/components/ui/Icon";
import { exportToExcel } from "@/utils/exportUtils";

interface DetalleManoObra {
  id: string;
  descripcionTarea: string;
  horasTrabajadas: number;
  costoHora: number;
  subtotal: number;
  nombreTecnico: string;
}

interface OrdenMantenimiento {
  id: string;
  numeroOrden: string;
  vehiculoId: string;
  placa: string;
  vehiculoLabel: string;
  tipoMantenimiento: "PREVENTIVO" | "CORRECTIVO";
  tipoTaller: "PROPIO" | "TERCEROS";
  descripcionServicio: string;
  costoManoObraPropia: number;
  costoPiezasRepuestos: number;
  costoOtros: number;
  costoTotal: number;
  estado: "PENDIENTE" | "EN_PROCESO" | "COMPLETADO";
  manoDeObra?: DetalleManoObra[];
  firmaEncargadoTaller?: string | null;
  firmaTecnico?: string | null;
  firmaJefeMantenimiento?: string | null;
  fechaFirmaTecnico?: string | null;
}

interface DbVehiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
}

export default function OrdenesMantenimientoPage() {
  const [ordenes, setOrdenes] = useState<OrdenMantenimiento[]>([]);
  const [vehiculos, setVehiculos] = useState<DbVehiculo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Estados Formulario Orden
  const [numeroOrden, setNumeroOrden] = useState("");
  const [vehiculoId, setVehiculoId] = useState("");
  const [tipoMantenimiento, setTipoMantenimiento] = useState("PREVENTIVO");
  const [tipoTaller, setTipoTaller] = useState("PROPIO");
  const [descripcionServicio, setDescripcionServicio] = useState("");
  const [costoRepuestos, setCostoRepuestos] = useState("0");
  const [costoOtros, setCostoOtros] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados Formulario Mano de Obra
  const [descripcionTarea, setDescripcionTarea] = useState("");
  const [horasTrabajadas, setHorasTrabajadas] = useState("");
  const [costoHora, setCostoHora] = useState("45");
  const [nombreTecnico, setNombreTecnico] = useState("");
  const [savingLabor, setSavingLabor] = useState(false);

  // Estados Firmas
  const [signingOrderId, setSigningOrderId] = useState<string | null>(null);
  const [signingRole, setSigningRole] = useState<string>("");
  const [firmaNombre, setFirmaNombre] = useState("");
  const [savingFirma, setSavingFirma] = useState(false);

  const cargarCatalogos = async () => {
    try {
      const res = await fetchWithAuth("/api/vehiculos");
      const data = await res.json();
      if (Array.isArray(data)) {
        setVehiculos(data);
        if (data.length > 0) setVehiculoId(data[0].id);
      }
    } catch (err) {
      console.error("Error al cargar vehículos:", err);
    }
  };

  const cargarOrdenes = async () => {
    try {
      setIsLoading(true);
      const res = await fetchWithAuth("/api/control_mantenimiento");
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrdenes(data);
      }
    } catch (err) {
      console.error("Error al cargar órdenes:", err);
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
      const res = await fetchWithAuth("/api/control_mantenimiento", {
        method: "POST",
        body: JSON.stringify({
          numeroOrden,
          vehiculoId,
          tipoMantenimiento,
          tipoTaller,
          descripcionServicio,
          costoManoObraPropia: 0, // Inicia en 0 hasta registrar tareas
          costoPiezasRepuestos: parseFloat(costoRepuestos),
          costoOtros: parseFloat(costoOtros),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        setNumeroOrden("");
        setDescripcionServicio("");
        setCostoRepuestos("0");
        setCostoOtros("0");
        cargarOrdenes();
        alert("¡Orden de mantenimiento creada con éxito!");
      } else {
        alert("Error: " + data.error);
      }
    } catch (err: any) {
      alert("Error de red: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Guardar línea de mano de obra
  const handleAddLabor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !descripcionTarea || !horasTrabajadas || !costoHora) return;

    setSavingLabor(true);
    try {
      const res = await fetchWithAuth("/api/control_mantenimiento/mano-obra", {
        method: "POST",
        body: JSON.stringify({
          ordenMantenimientoId: selectedOrderId,
          descripcionTarea,
          horasTrabajadas: parseFloat(horasTrabajadas),
          costoHora: parseFloat(costoHora),
          nombreTecnico,
        }),
      });

      if (res.ok) {
        setDescripcionTarea("");
        setHorasTrabajadas("");
        setNombreTecnico("");
        cargarOrdenes(); // Recargar todas las órdenes
      } else {
        const data = await res.json();
        alert(data.error || "Error al agregar tarea");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red");
    } finally {
      setSavingLabor(false);
    }
  };

  // Firma digital
  const handleFirmar = async (ordenId: string, tipoFirma: string) => {
    if (!firmaNombre.trim()) {
      alert("Ingrese su nombre para firmar");
      return;
    }
    setSavingFirma(true);
    try {
      const res = await fetchWithAuth("/api/control_mantenimiento", {
        method: "PUT",
        body: JSON.stringify({
          id: ordenId,
          firma: firmaNombre.trim(),
          tipoFirma,
        }),
      });

      if (res.ok) {
        setSigningOrderId(null);
        setSigningRole("");
        setFirmaNombre("");
        cargarOrdenes();
        alert("Firma registrada con éxito");
      } else {
        const data = await res.json();
        alert(data.error || "Error al firmar");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red al firmar");
    } finally {
      setSavingFirma(false);
    }
  };

  const columns: ColumnDef<OrdenMantenimiento>[] = [
    { header: "N° Orden", accessorKey: "numeroOrden", className: "font-mono text-indigo-400 font-semibold" },
    { header: "Vehículo", accessorKey: "placa" },
    { header: "Tipo", accessorKey: "tipoMantenimiento" },
    { header: "Taller", accessorKey: "tipoTaller" },
    { header: "Costo Total", accessorKey: (row) => `S/. ${Number(row.costoTotal).toFixed(2)}`, className: "font-semibold text-white" },
    {
      header: "Estado",
      accessorKey: (row) => {
        const classes = {
          COMPLETADO: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          EN_PROCESO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          PENDIENTE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        };
        return (
          <span className={`inline-block border px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes[row.estado] || classes.PENDIENTE}`}>
            {row.estado}
          </span>
        );
      },
    },
    {
      header: "Firmas",
      accessorKey: (row) => {
        const total = 3;
        const firmadas = [
          row.firmaEncargadoTaller,
          row.firmaTecnico,
          row.firmaJefeMantenimiento,
        ].filter(Boolean).length;
        const allSigned = firmadas === total;
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
            allSigned
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
              : "bg-slate-500/15 text-slate-400 border border-slate-500/20"
          }`}>
            {firmadas}/{total}
          </span>
        );
      },
    },
    {
      header: "Mano de Obra",
      className: "text-right",
      accessorKey: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleDownloadPDF(row.id)}
            className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold rounded-lg transition"
            title="Descargar PDF"
          >
            PDF
          </button>
          <button
            onClick={() => setSelectedOrderId(row.id)}
            className="px-2.5 py-1 bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-500/20 text-indigo-400 font-semibold rounded-lg text-xs transition cursor-pointer"
          >
            Gestionar MO
          </button>
        </div>
      ),
    },
  ];

  // Buscar alertas de mantenimiento predictivo (órdenes con prefijo PREV-)
  const alertasPredictivas = ordenes.filter((o) => o.estado === "PENDIENTE" && o.numeroOrden.startsWith("PREV-"));

  // Buscar orden seleccionada
  const selectedOrder = ordenes.find((o) => o.id === selectedOrderId);

  const handleDownloadPDF = async (ordenId: string) => {
    try {
      const res = await fetchWithAuth(`/api/reportes/pdf?tipo=orden_mantenimiento&id=${ordenId}`);
      const data = await res.json();
      if (res.ok) {
        generateOrdenMantenimientoPDF(data);
      } else {
        alert("Error al obtener datos: " + data.error);
      }
    } catch (err: any) {
      alert("Error al generar PDF: " + err.message);
    }
  };

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
          <h2 className="text-2xl font-bold text-white">Órdenes de Mantenimiento</h2>
          <p className="text-xs text-slate-400">Control de órdenes de servicio preventivas y correctivas (MA 122 02 01)</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => exportToExcel(ordenes, "control_mantenimiento.xlsx")}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition"
          >
            Exportar Excel
          </button>
          <button
            onClick={() => {
              setNumeroOrden(`OM-${Date.now().toString().slice(-6)}`);
              setModalOpen(true);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition duration-150 shadow-md"
          >
            + Crear Orden de Servicio
          </button>
        </div>
      </div>

      {/* ALERTAS PREVENTIVAS POR ODÓMETRO */}
      {alertasPredictivas.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl space-y-2">
          <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider"><Icon name="warning" size={12} /> Alerta Preventiva de Mantenimiento por Odómetro</h4>
          <p className="text-[11px] text-slate-350">
            Los siguientes vehículos han superado los **5,000 km** de recorrido acumulado desde su última revisión y tienen alertas autogeneradas:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {alertasPredictivas.map((alt) => (
              <span
                key={alt.id}
                onClick={() => setSelectedOrderId(alt.id)}
                className="bg-rose-500/20 text-rose-300 px-3 py-1 rounded-xl text-[10px] font-bold font-mono border border-rose-500/30 cursor-pointer hover:bg-rose-500/30"
              >
                {alt.placa} ({alt.numeroOrden})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TABLA PRINCIPAL */}
        <div className={selectedOrderId ? "lg:col-span-2" : "lg:col-span-3"}>
          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Cargando órdenes reales de Supabase...</div>
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

        {/* DETALLE Y TARJETA DE MANO DE OBRA (MA 122 02 04) */}
        {selectedOrderId && selectedOrder && (
          <div className="bg-slate-950 border border-slate-850/80 p-6 rounded-2xl space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{selectedOrder.numeroOrden}</h3>
                <p className="text-[10px] text-slate-400 mt-1">Ficha técnica y costos acumulados</p>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Cerrar Detalle
              </button>
            </div>

            <div className="space-y-3 border-t border-slate-900 pt-4 text-xs">
              <div>
                <span className="text-slate-400 block">Vehículo</span>
                <span className="font-semibold text-white">{selectedOrder.placa}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Descripción del Servicio</span>
                <span className="font-semibold text-slate-300">{selectedOrder.descripcionServicio}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-slate-900 pt-3">
                <div>
                  <span className="text-slate-400 text-[10px]">Mano de Obra</span>
                  <p className="font-mono font-bold text-white">S/. {Number(selectedOrder.costoManoObraPropia || 0).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Piezas/Rep.</span>
                  <p className="font-mono font-bold text-white">S/. {Number(selectedOrder.costoPiezasRepuestos || 0).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Costo Total</span>
                  <p className="font-mono font-bold text-indigo-400">S/. {Number(selectedOrder.costoTotal).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* FIRMAS DIGITALES */}
            <div className="border-t border-slate-900 pt-4 space-y-4">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Firmas Digitales (MA 122 02 01)</h4>
              <div className="space-y-2">
                {/* Encargado del Taller */}
                <div className="flex items-center justify-between p-2 bg-slate-900 rounded-xl border border-slate-850">
                  <div className="text-[10px]">
                    <span className="text-slate-400 block">Encargado del Taller</span>
                    {selectedOrder.firmaEncargadoTaller ? (
                      <span className="text-emerald-400 font-semibold">✓ {selectedOrder.firmaEncargadoTaller}</span>
                    ) : (
                      <span className="text-slate-500">Sin firmar</span>
                    )}
                  </div>
                  {!selectedOrder.firmaEncargadoTaller && (
                    <button
                      onClick={() => { setSigningOrderId(selectedOrder.id); setSigningRole("encargado_taller"); }}
                      className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-lg transition"
                    >
                      Firmar
                    </button>
                  )}
                </div>

                {/* Técnico */}
                <div className="flex items-center justify-between p-2 bg-slate-900 rounded-xl border border-slate-850">
                  <div className="text-[10px]">
                    <span className="text-slate-400 block">Técnico</span>
                    {selectedOrder.firmaTecnico ? (
                      <span className="text-emerald-400 font-semibold">✓ {selectedOrder.firmaTecnico}</span>
                    ) : (
                      <span className="text-slate-500">Sin firmar</span>
                    )}
                  </div>
                  {!selectedOrder.firmaTecnico && (
                    <button
                      onClick={() => { setSigningOrderId(selectedOrder.id); setSigningRole("tecnico"); }}
                      className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-lg transition"
                    >
                      Firmar
                    </button>
                  )}
                </div>

                {/* Jefe de Mantenimiento */}
                <div className="flex items-center justify-between p-2 bg-slate-900 rounded-xl border border-slate-850">
                  <div className="text-[10px]">
                    <span className="text-slate-400 block">Jefe de Mantenimiento</span>
                    {selectedOrder.firmaJefeMantenimiento ? (
                      <span className="text-emerald-400 font-semibold">✓ {selectedOrder.firmaJefeMantenimiento}</span>
                    ) : (
                      <span className="text-slate-500">Sin firmar</span>
                    )}
                  </div>
                  {!selectedOrder.firmaJefeMantenimiento && (
                    <button
                      onClick={() => { setSigningOrderId(selectedOrder.id); setSigningRole("jefe_mantenimiento"); }}
                      className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-lg transition"
                    >
                      Firmar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* MODAL FIRMA */}
            {signingOrderId && (
              <div className="border-t border-slate-900 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Firmar como {
                  signingRole === "encargado_taller" ? "Encargado del Taller" :
                  signingRole === "tecnico" ? "Técnico" : "Jefe de Mantenimiento"
                }</h4>
                <input
                  type="text"
                  placeholder="Nombre completo para la firma"
                  value={firmaNombre}
                  onChange={(e) => setFirmaNombre(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSigningOrderId(null); setSigningRole(""); setFirmaNombre(""); }}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleFirmar(signingOrderId, signingRole)}
                    disabled={savingFirma || !firmaNombre.trim()}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
                  >
                    {savingFirma ? "Firmando..." : "Confirmar Firma"}
                  </button>
                </div>
              </div>
            )}

            {/* FORMULARIO TARJETA MANO DE OBRA (MA 122 02 04) */}
            <div className="border-t border-slate-900 pt-4 space-y-4">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Tarjeta de Mano de Obra (MA 122 02 04)</h4>
              
              <form onSubmit={handleAddLabor} className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Descripción de la tarea (ej. Ajuste de frenos)"
                    value={descripcionTarea}
                    onChange={(e) => setDescripcionTarea(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Horas (ej. 2.5)"
                    value={horasTrabajadas}
                    onChange={(e) => setHorasTrabajadas(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Tarifa/Hora (S/.)"
                    value={costoHora}
                    onChange={(e) => setCostoHora(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Nombre del Técnico"
                    value={nombreTecnico}
                    onChange={(e) => setNombreTecnico(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingLabor}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs transition duration-150"
                >
                  {savingLabor ? "Registrando..." : "Añadir Tarea a Mano de Obra"}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* MODAL CREAR ORDEN */}
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
              <h3 className="text-lg font-bold text-indigo-400">Registrar Orden de Mantenimiento</h3>
              <p className="text-xs text-slate-450">Formulario MA 122 02 01</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-350">N° de Orden</label>
                  <input
                    type="text"
                    value={numeroOrden}
                    onChange={(e) => setNumeroOrden(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    required
                  />
                </div>
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
                        {v.placa}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-350">Tipo Mantenimiento</label>
                  <select
                    value={tipoMantenimiento}
                    onChange={(e) => setTipoMantenimiento(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="PREVENTIVO">PREVENTIVO</option>
                    <option value="CORRECTIVO">CORRECTIVO</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-350">Tipo Taller</label>
                  <select
                    value={tipoTaller}
                    onChange={(e) => setTipoTaller(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="PROPIO">PROPIO (Taller Interno)</option>
                    <option value="TERCEROS">TERCEROS (Taller Externo)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-350">Descripción del Servicio</label>
                <textarea
                  value={descripcionServicio}
                  onChange={(e) => setDescripcionServicio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none h-16"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Repuestos / Piezas (S/.)</label>
                  <input
                    type="number"
                    value={costoRepuestos}
                    onChange={(e) => setCostoRepuestos(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Otros Costos (S/.)</label>
                  <input
                    type="number"
                    value={costoOtros}
                    onChange={(e) => setCostoOtros(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold rounded-xl transition duration-150 shadow-lg text-sm"
              >
                {isSubmitting ? "Creando en Supabase..." : "Registrar Orden"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
