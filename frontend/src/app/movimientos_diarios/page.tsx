"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import SearchSelect from "@/components/ui/SearchSelect";
import api from "@/lib/api";
import { generateMovimientoDiarioPDF } from "@/utils/pdfGenerators";
import Icon from "@/components/ui/Icon";
import { exportToExcel } from "@/utils/exportUtils";
import {
  SECTORES_ORGANIZACIONALES,
  ESTADOS_CHECKLIST,
} from "@/lib/constants";

interface Ruta {
  id: string;
  nombre: string;
  origen: string;
  destino: string;
}

interface MovimientoDiario {
  id: string;
  vehiculo: string;
  placa: string;
  vehiculoId: string;
  conductor: string;
  fecha: string;
  destino: string;
  kilometrajeSalida: number;
  kilometrajeLlegada: number | null;
  horasUtilizacion: number | null;
  estado: "EN_RUTA" | "COMPLETADO" | "CANCELADO";
  firmaConductor: string | null;
  firmaInspector: string | null;
  firmaEncargadoGaraje: string | null;
  fechaFirmaConductor: string | null;
  fechaFirmaInspector: string | null;
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
  vencimientoLicencia: string | null;
  licenciaConducir: string | null;
}

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState<MovimientoDiario[]>([]);
  const [vehiculos, setVehiculos] = useState<DbVehiculo[]>([]);
  const [conductores, setConductores] = useState<DbConductor[]>([]);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Estados del Formulario
  const [vehiculoId, setVehiculoId] = useState("");
  const [conductorId, setConductorId] = useState("");
  const [destino, setDestino] = useState("Sector Industrial");
  const [sectorSolicitante, setSectorSolicitante] = useState("Logística");
  const [kilometrajeSalida, setKilometrajeSalida] = useState("10500");
  const [horaSalida, setHoraSalida] = useState("08:00");

  // 15 Puntos Checklist
  const [documentos, setDocumentos] = useState("OK");
  const [aceiteMotor, setAceiteMotor] = useState("OK");
  const [agua, setAgua] = useState("OK");
  const [bateria, setBateria] = useState("OK");
  const [frenos, setFrenos] = useState("OK");
  const [embrague, setEmbrague] = useState("OK");
  const [fajas, setFajas] = useState("OK");
  const [faros, setFaros] = useState("OK");
  const [lunas, setLunas] = useState("OK");
  const [plumillas, setPlumillas] = useState("OK");
  const [llantas, setLlantas] = useState("OK");
  const [espejos, setEspejos] = useState("OK");
  const [herramientas, setHerramientas] = useState("OK");
  const [extintorBotiquin, setExtintorBotiquin] = useState("OK");
  const [manchasFugas, setManchasFugas] = useState("OK");

  // Firmas
  const [firmaConductorInput, setFirmaConductorInput] = useState("");
  const [firmaInspectorInput, setFirmaInspectorInput] = useState("");
  const [firmaEncargadoGarajeInput, setFirmaEncargadoGarajeInput] = useState("");

  // Modal de cierre (completar movimiento)
  const [cierreModalOpen, setCierreModalOpen] = useState(false);
  const [movimientoACerrar, setMovimientoACerrar] = useState<MovimientoDiario | null>(null);
  const [kmLlegada, setKmLlegada] = useState("");
  const [horaLlegada, setHoraLlegada] = useState("17:00");
  const [horasUtilizacion, setHorasUtilizacion] = useState("9");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const conductorSeleccionado = conductores.find((c) => c.id === conductorId);
  const isLicenciaVencida = conductorSeleccionado?.vencimientoLicencia 
    ? new Date(conductorSeleccionado.vencimientoLicencia) < new Date()
    : false;

  // Opciones para SearchSelect
  const vehiculoOptions = useMemo(
    () => vehiculos.map((v) => ({
      value: v.id,
      label: `${v.placa} — ${v.marca} ${v.modelo}`,
    })),
    [vehiculos]
  );

  const conductorOptions = useMemo(
    () => conductores.map((c) => ({
      value: c.id,
      label: `${c.nombre} ${c.apellido}${c.licenciaConducir ? ` (Lic: ${c.licenciaConducir})` : ""}`,
    })),
    [conductores]
  );

  const rutaOptions = useMemo(() => {
    if (rutas.length > 0) {
      return rutas.map((r) => ({
        value: r.nombre,
        label: `${r.nombre} (${r.origen} → ${r.destino})`,
      }));
    }
    return [
      { value: "Sector Industrial", label: "Sector Industrial" },
      { value: "Almacén Central", label: "Almacén Central" },
      { value: "Sede Central", label: "Sede Central" },
      { value: "Planta Purificadora", label: "Planta Purificadora" },
      { value: "Taller Central", label: "Taller Central" },
      { value: "Otro", label: "Otro" },
    ];
  }, [rutas]);

  const sectorOptions = useMemo(
    () => SECTORES_ORGANIZACIONALES.map((s) => ({ value: s, label: s })),
    []
  );

  const cargarCatalogos = async () => {
    try {
      const [dataVeh, dataCond] = await Promise.all([
        api.getVehiculos(),
        api.getUsuarios(),
      ]);

      let dataRutas: Ruta[] = [];
      try {
        dataRutas = await api.getRutas() || [];
      } catch {
        dataRutas = [];
      }

      if (Array.isArray(dataVeh)) {
        setVehiculos(dataVeh);
        if (dataVeh.length > 0) setVehiculoId(dataVeh[0].id);
      }
      if (Array.isArray(dataCond)) {
        setConductores(dataCond);
        if (dataCond.length > 0) setConductorId(dataCond[0].id);
      }
      if (Array.isArray(dataRutas)) {
        setRutas(dataRutas);
      }
    } catch (err) {
      console.error("Error al cargar catálogos:", err);
    }
  };

  const cargarMovimientos = async () => {
    try {
      setIsLoading(true);
      const data = await api.getMovimientos();
      if (Array.isArray(data)) {
        setMovimientos(data);
      }
    } catch (err) {
      console.error("Error al cargar movimientos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarCatalogos();
    cargarMovimientos();
  }, []);

  const abrirCierreModal = (mov: MovimientoDiario) => {
    setMovimientoACerrar(mov);
    setKmLlegada(String(mov.kilometrajeSalida + 50));
    setHoraLlegada("17:00");
    setHorasUtilizacion("9");
    setFirmaConductorInput("");
    setFirmaInspectorInput("");
    setFirmaEncargadoGarajeInput("");
    setCierreModalOpen(true);
  };

  const handleCierreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movimientoACerrar) return;
    setIsSubmitting(true);

    try {
      await api.updateMovimiento(movimientoACerrar.id, {
        kilometrajeLlegada: parseInt(kmLlegada),
        horaLlegada,
        horasUtilizacion,
        firmaConductor: firmaConductorInput || undefined,
        firmaInspector: firmaInspectorInput || undefined,
        firmaEncargadoGaraje: firmaEncargadoGarajeInput || undefined,
      });

      setCierreModalOpen(false);
      setMovimientoACerrar(null);
      cargarMovimientos();
      alert("Movimiento completado con éxito!");
    } catch (err: any) {
      alert("Error de red: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLicenciaVencida) return;
    setIsSubmitting(true);

    try {
      await api.createMovimiento({
        vehiculoId,
        conductorId,
        fecha: new Date().toISOString(),
        sectorSolicitante,
        destino,
        kilometrajeSalida: parseInt(kilometrajeSalida),
        horaSalida,
        documentos,
        aceiteMotor,
        agua,
        bateria,
        frenos,
        embrague,
        fajas,
        faros,
        lunas,
        plumillas,
        llantas,
        espejos,
        herramientas,
        extintorBotiquin,
        manchasFugas,
      });

      setModalOpen(false);
      cargarMovimientos();
      alert("¡Movimiento registrado con éxito!");
    } catch (err: any) {
      alert("Error de red: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<MovimientoDiario>[] = [
    {
      header: "ID Movimiento",
      accessorKey: (row) => row.id.substring(0, 8).toUpperCase(),
      className: "font-mono text-indigo-400 font-semibold",
    },
    {
      header: "Vehículo",
      accessorKey: (row) => (
        <div>
          <div className="font-semibold text-white">{row.placa}</div>
          <div className="text-xs text-slate-450">{row.vehiculo}</div>
        </div>
      ),
    },
    { header: "Conductor", accessorKey: "conductor" },
    { header: "Destino", accessorKey: "destino", className: "text-slate-350" },
    { header: "Km Salida", accessorKey: (row) => `${row.kilometrajeSalida} km`, className: "font-mono" },
    { header: "HUV", accessorKey: (row) => (row.horasUtilizacion ? `${row.horasUtilizacion} hrs` : "-"), className: "font-mono" },
    {
      header: "Estado",
      className: "text-right",
      accessorKey: (row) => {
        const colors = {
          EN_RUTA: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          COMPLETADO: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          CANCELADO: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          PROGRAMADO: "bg-slate-500/10 text-slate-450 border-slate-500/20",
        };
        return (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[row.estado] || colors.EN_RUTA}`}>
            {row.estado}
          </span>
        );
      },
    },
    {
      header: "Firmas",
      accessorKey: (row) => {
        const signed = [row.firmaConductor, row.firmaInspector, row.firmaEncargadoGaraje].filter(Boolean).length;
        const total = 3;
        const color = signed === total
          ? "text-emerald-400"
          : signed > 0
            ? "text-amber-400"
            : "text-slate-500";
        return (
          <span className={`text-xs font-semibold ${color}`}>
            {signed}/{total}
          </span>
        );
      },
    },
    {
      header: "Acciones",
      className: "text-right",
      accessorKey: (row) => {
        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => generateMovimientoDiarioPDF(row)}
              className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold rounded-lg transition"
              title="Descargar PDF"
            >
              PDF
            </button>
            {row.estado === "EN_RUTA" && (
              <button
                onClick={() => abrirCierreModal(row)}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition"
              >
                Completar
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const checklistItems = [
    { label: "1. Documentación (SOAT/Licencias)", state: documentos, setState: setDocumentos },
    { label: "2. Nivel de Aceite de Motor", state: aceiteMotor, setState: setAceiteMotor },
    { label: "3. Nivel de Agua (Radiador)", state: agua, setState: setAgua },
    { label: "4. Batería (Electrolito/Bornes)", state: bateria, setState: setBateria },
    { label: "5. Sistema de Frenos", state: frenos, setState: setFrenos },
    { label: "6. Embrague (Accionamiento)", state: embrague, setState: setEmbrague },
    { label: "7. Faja del Ventilador/Alternador", state: fajas, setState: setFajas },
    { label: "8. Faros y Luces del Tablero", state: faros, setState: setFaros },
    { label: "9. Lunas y Parabrisas", state: lunas, setState: setLunas },
    { label: "10. Plumillas Limpiaparabrisas", state: plumillas, setState: setPlumillas },
    { label: "11. Estado y Presión de Llantas", state: llantas, setState: setLlantas },
    { label: "12. Espejos Retrovisores", state: espejos, setState: setEspejos },
    { label: "13. Herramientas de Emergencia", state: herramientas, setState: setHerramientas },
    { label: "14. Extintor y Botiquín", state: extintorBotiquin, setState: setExtintorBotiquin },
    { label: "15. Fugas (Manchas en Estacionamiento)", state: manchasFugas, setState: setManchasFugas },
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
          <h2 className="text-2xl font-bold text-white">Movimientos Diarios</h2>
          <p className="text-xs text-slate-450">
            Registro diario de odómetro, checklist pre-operacional e indicadores de HUV (MA 122 01 01)
          </p>
        </div>
        <button
          onClick={() => exportToExcel(movimientos, "movimientos_diarios.xlsx")}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition"
        >
          Exportar Excel
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-450 text-sm">Cargando movimientos diarios...</div>
      ) : (
        <DataTable
          data={movimientos}
          columns={columns}
          searchKey="conductor"
          searchPlaceholder="Buscar por conductor..."
          newActionLabel="Registrar Movimiento"
          onNewAction={() => setModalOpen(true)}
        />
      )}

      {/* MODAL DE CIERRE DE MOVIMIENTO */}
      {cierreModalOpen && movimientoACerrar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative text-slate-100">
            <button
              onClick={() => { setCierreModalOpen(false); setMovimientoACerrar(null); }}
              className="absolute top-4 right-4 text-slate-455 hover:text-white font-bold"
            >
              ✕
            </button>

            <div>
              <h3 className="text-lg font-bold text-emerald-400">Completar Movimiento</h3>
              <p className="text-xs text-slate-450">
                {movimientoACerrar.placa} - {movimientoACerrar.vehiculo} - {movimientoACerrar.conductor}
              </p>
            </div>

            <form onSubmit={handleCierreSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Km Llegada</label>
                  <input
                    type="number"
                    value={kmLlegada}
                    onChange={(e) => setKmLlegada(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Hora Llegada</label>
                  <input
                    type="time"
                    value={horaLlegada}
                    onChange={(e) => setHoraLlegada(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">HUV</label>
                  <input
                    type="number"
                    step="0.1"
                    value={horasUtilizacion}
                    onChange={(e) => setHorasUtilizacion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              {/* Firmas de Cierre */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <span className="text-[10px] font-bold text-emerald-400 uppercase block tracking-wider">Firmas para Cierre</span>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Firma del Conductor</label>
                    <input
                      type="text"
                      value={firmaConductorInput}
                      onChange={(e) => setFirmaConductorInput(e.target.value)}
                      placeholder="Nombre completo del conductor"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Firma del Inspector</label>
                    <input
                      type="text"
                      value={firmaInspectorInput}
                      onChange={(e) => setFirmaInspectorInput(e.target.value)}
                      placeholder="Nombre completo del inspector"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Firma del Encargado del Garaje</label>
                    <input
                      type="text"
                      value={firmaEncargadoGarajeInput}
                      onChange={(e) => setFirmaEncargadoGarajeInput(e.target.value)}
                      placeholder="Nombre completo del encargado"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold rounded-xl transition duration-150 shadow-lg text-xs cursor-pointer"
              >
                {isSubmitting ? "Guardando..." : "Completar Movimiento"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE REGISTRO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-455 hover:text-white font-bold"
            >
              ✕
            </button>

            <div>
              <h3 className="text-lg font-bold text-indigo-400">Registrar Movimiento Diario</h3>
              <p className="text-xs text-slate-450">Formulario MA 122 01 01 (Checklist completo de 15 puntos)</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Vehículo</label>
                  <SearchSelect
                    options={vehiculoOptions}
                    value={vehiculoId}
                    onChange={setVehiculoId}
                    placeholder="Buscar vehículo..."
                    searchPlaceholder="Placa, marca o modelo..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Conductor</label>
                  <SearchSelect
                    options={conductorOptions}
                    value={conductorId}
                    onChange={setConductorId}
                    placeholder="Buscar conductor..."
                    searchPlaceholder="Nombre o apellido..."
                  />
                  {isLicenciaVencida && (
                    <p className="text-[9px] text-rose-400 font-bold mt-1">
                      <Icon name="warning" size={10} /> LICENCIA VENCIDA (Bloqueado)
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Km Salida</label>
                  <input
                    type="number"
                    value={kilometrajeSalida}
                    onChange={(e) => setKilometrajeSalida(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Hora Salida</label>
                  <input
                    type="time"
                    value={horaSalida}
                    onChange={(e) => setHoraSalida(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Destino</label>
                  <SearchSelect
                    options={rutaOptions}
                    value={destino}
                    onChange={setDestino}
                    placeholder="Buscar destino..."
                    searchPlaceholder="Nombre de ruta o destino..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Sector Solicitante</label>
                  <SearchSelect
                    options={sectorOptions}
                    value={sectorSolicitante}
                    onChange={setSectorSolicitante}
                    placeholder="Buscar sector..."
                    searchPlaceholder="Nombre del sector..."
                  />
                </div>
              </div>

              {/* Checklist de 15 Puntos */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <span className="text-[10px] font-bold text-indigo-400 uppercase block tracking-wider">Auditoría Pre-operativa de 15 Puntos (F1T02)</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 max-h-[260px] overflow-y-auto bg-slate-950 p-4 border border-slate-850 rounded-xl">
                  {checklistItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs border-b border-slate-900 pb-1">
                      <span className="text-slate-300 truncate max-w-[170px]">{item.label}</span>
                      <select
                        value={item.state}
                        onChange={(e) => item.setState(e.target.value)}
                        className={`bg-slate-900 border rounded px-1.5 py-0.5 text-[10px] focus:outline-none ${
                          item.state === "FALLADO" 
                            ? "border-rose-500 text-rose-450" 
                            : item.state === "OBSERVADO" 
                              ? "border-amber-500 text-amber-450" 
                              : "border-slate-800 text-slate-300"
                        }`}
                      >
                        <option value="OK">OK</option>
                        <option value="OBSERVADO">OBS</option>
                        <option value="FALLADO">FALLA</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Firmas del Checklist */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <span className="text-[10px] font-bold text-indigo-400 uppercase block tracking-wider">Firmas del Checklist Pre-operativo</span>
                
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Firma del Conductor</label>
                    <input
                      type="text"
                      value={firmaConductorInput}
                      onChange={(e) => setFirmaConductorInput(e.target.value)}
                      placeholder="Nombre completo del conductor"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Firma del Inspector</label>
                    <input
                      type="text"
                      value={firmaInspectorInput}
                      onChange={(e) => setFirmaInspectorInput(e.target.value)}
                      placeholder="Nombre completo del inspector"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Firma del Encargado del Garaje</label>
                    <input
                      type="text"
                      value={firmaEncargadoGarajeInput}
                      onChange={(e) => setFirmaEncargadoGarajeInput(e.target.value)}
                      placeholder="Nombre completo del encargado"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLicenciaVencida}
                className="w-full py-3 bg-indigo-650 hover:bg-indigo-600 disabled:bg-slate-800 text-white font-bold rounded-xl transition duration-150 shadow-lg text-xs cursor-pointer"
              >
                {isSubmitting 
                  ? "Guardando..." 
                  : isLicenciaVencida 
                    ? "Bloqueado: Conductor Inhabilitado" 
                    : "Confirmar y Iniciar Viaje"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
