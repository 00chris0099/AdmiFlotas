"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import SearchSelect from "@/components/ui/SearchSelect";
import api from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";

interface Llanta {
  id: string;
  codigoEps: string;
  placaVehiculo: string;
  vehiculoId: string;
  posicion: number;
  descripcionPosicion: string;
  fabricante: string;
  dimension: string;
  modeloLlanta: string;
  kilometrajeAcumulado: number;
  vecesReencauchada: number;
  estado: "EN_USO" | "DADA_DE_BAJA" | "EN_ALMACEN";
}

interface DbVehiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
}

export default function LlantasPage() {
  const [llantas, setLlantas] = useState<Llanta[]>([]);
  const [vehiculos, setVehiculos] = useState<DbVehiculo[]>([]);
  const [selectedVehiculoId, setSelectedVehiculoId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPosicion, setSelectedPosicion] = useState<number | null>(null);
  const toast = useToast();
  const { confirm } = useConfirm();

  // Estados Formulario de Registro
  const [codigoEps, setCodigoEps] = useState("");
  const [fabricante, setFabricante] = useState("Michelin");
  const [dimension, setDimension] = useState("295/80R22.5");
  const [modeloLlanta, setModeloLlanta] = useState("X Multi T");
  const [costoAdquisicion, setCostoAdquisicion] = useState("450");
  const [kilometrajeInstalacion, setKilometrajeInstalacion] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados Rotación
  const [targetRotarPosicion, setTargetRotarPosicion] = useState<string>("");
  const [rotating, setRotating] = useState(false);
  const [updatingLifecycle, setUpdatingLifecycle] = useState(false);

  // Opciones para SearchSelect de vehículo
  const vehiculoOptions = useMemo(
    () => vehiculos.map((v) => ({
      value: v.id,
      label: `${v.placa} — ${v.marca} ${v.modelo}`,
    })),
    [vehiculos]
  );

  // Auto-load km del vehículo cuando cambia la selección
  useEffect(() => {
    if (!selectedVehiculoId) return;
    const cargarKm = async () => {
      try {
        const data = await api.getVehiculo(selectedVehiculoId);
        if (data?.kilometrajeActual) {
          setKilometrajeInstalacion(String(data.kilometrajeActual));
        }
      } catch {}
    };
    cargarKm();
  }, [selectedVehiculoId]);

  // Opciones para SearchSelect de llantas
  const fabricanteOptions = useMemo(() => [
    { value: "MICHELIN", label: "MICHELIN" },
    { value: "BRIDGESTONE", label: "BRIDGESTONE" },
    { value: "GOODYEAR", label: "GOODYEAR" },
    { value: "CONTINENTAL", label: "CONTINENTAL" },
    { value: "FIRESTONE", label: "FIRESTONE" },
    { value: "PIRELLI", label: "PIRELLI" },
    { value: "DUNLOP", label: "DUNLOP" },
    { value: "YOKOHAMA", label: "YOKOHAMA" },
    { value: "HANKOOK", label: "HANKOOK" },
    { value: "KUMHO", label: "KUMHO" },
    { value: "TOYO", label: "TOYO" },
    { value: "COOPER", label: "COOPER" },
    { value: "FATE", label: "FATE" },
    { value: "CEAT", label: "CEAT" },
  ], []);

  const dimensionOptions = useMemo(() => [
    { value: "295/80R22.5", label: "295/80R22.5" },
    { value: "11R22.5", label: "11R22.5" },
    { value: "12R22.5", label: "12R22.5" },
    { value: "315/80R22.5", label: "315/80R22.5" },
    { value: "275/80R22.5", label: "275/80R22.5" },
    { value: "265/70R19.5", label: "265/70R19.5" },
    { value: "225/75R17.5", label: "225/75R17.5" },
    { value: "8.25R20", label: "8.25R20" },
    { value: "7.50R16", label: "7.50R16" },
    { value: "7.00R16", label: "7.00R16" },
    { value: "7.00R15", label: "7.00R15" },
    { value: "6.50R16", label: "6.50R16" },
    { value: "6.00R16", label: "6.00R16" },
    { value: "185/75R16", label: "185/75R16" },
    { value: "175/75R16", label: "175/75R16" },
  ], []);

  const cargarVehiculos = async () => {
    try {
      const data = await api.getVehiculos();
      if (Array.isArray(data)) {
        setVehiculos(data);
        if (data.length > 0) {
          setSelectedVehiculoId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Error al cargar vehículos:", err);
    }
  };

  const cargarLlantas = async () => {
    if (!selectedVehiculoId) return;
    try {
      setIsLoading(true);
      const data = await api.getControlLlantas();
      if (Array.isArray(data)) {
        setLlantas(data);
      }
    } catch (err) {
      console.error("Error al cargar llantas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarVehiculos();
  }, []);

  useEffect(() => {
    cargarLlantas();
    setSelectedPosicion(null);
  }, [selectedVehiculoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehiculoId || !selectedPosicion) return;
    setIsSubmitting(true);

    try {
      const data = await api.createControlLlanta({
        codigoEps,
        vehiculoId: selectedVehiculoId,
        posicionVehiculo: selectedPosicion,
        descripcionPosicion: getPosicionLabel(selectedPosicion),
        fabricante,
        dimension,
        modeloLlanta,
        costoAdquisicion: parseFloat(costoAdquisicion),
        kilometrajeInstalacion: parseInt(kilometrajeInstalacion),
      });

      setModalOpen(false);
      setCodigoEps("");
      cargarLlantas();
      toast.success("¡Llanta registrada y montada con éxito!");
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rotar llantas
  const handleRotar = async () => {
    const origenLlanta = llantas.find((l) => l.posicion === selectedPosicion);
    const destinoLlanta = llantas.find((l) => l.posicion === parseInt(targetRotarPosicion));
    
    if (!origenLlanta || !destinoLlanta) {
      toast.warning("Debes seleccionar una llanta de origen y una llanta de destino montadas.");
      return;
    }

    setRotating(true);
    try {
      await api.rotarLlantas(origenLlanta.id, destinoLlanta.id);
      toast.success("Rotación completada.");
      setTargetRotarPosicion("");
      cargarLlantas();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error de conexión");
    } finally {
      setRotating(false);
    }
  };

  // Reencauchar llanta
  const handleReencauchar = async (llantaId: string) => {
    setUpdatingLifecycle(true);
    try {
      await api.reencaucharLlanta(llantaId);
      toast.success("Reencauche registrado con éxito.");
      cargarLlantas();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al reencauchar");
    } finally {
      setUpdatingLifecycle(false);
    }
  };

  // Dar de baja llanta
  const handleBaja = async (llantaId: string) => {
    const ok = await confirm({ message: "¿Está seguro de retirar y dar de baja esta llanta permanentemente?", variant: "danger" });
    if (!ok) return;
    setUpdatingLifecycle(true);
    try {
      await api.bajaLlanta(llantaId);
      toast.success("Llanta dada de baja.");
      setSelectedPosicion(null);
      cargarLlantas();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al dar de baja");
    } finally {
      setUpdatingLifecycle(false);
    }
  };

  const getPosicionLabel = (pos: number) => {
    const labels: { [key: number]: string } = {
      1: "Delantera Izquierda",
      2: "Delantera Derecha",
      3: "Trasera Izquierda Exterior",
      4: "Trasera Izquierda Interior",
      5: "Trasera Derecha Interior",
      6: "Trasera Derecha Exterior",
      7: "Llanta de Repuesto",
    };
    return labels[pos] || `Posición ${pos}`;
  };

  // Encontrar llanta montada en una posición
  const getLlantaEnPosicion = (pos: number) => {
    return llantas.find((l) => l.posicion === pos);
  };

  // Retornar color de desgaste
  const getWearColor = (km: number) => {
    if (km < 20000) return "fill-emerald-500 stroke-emerald-400";
    if (km < 40000) return "fill-amber-500 stroke-amber-400";
    return "fill-rose-500 stroke-rose-400";
  };

  const selectedLlanta = selectedPosicion ? getLlantaEnPosicion(selectedPosicion) : null;

  const columns: ColumnDef<Llanta>[] = [
    { header: "Código EPS", accessorKey: "codigoEps", className: "font-mono text-indigo-400 font-semibold" },
    { header: "Posición", accessorKey: (row) => getPosicionLabel(row.posicion) },
    { header: "Fabricante", accessorKey: "fabricante" },
    { header: "Medida", accessorKey: "dimension" },
    { header: "Km Acumulado", accessorKey: (row) => `${row.kilometrajeAcumulado.toLocaleString()} km`, className: "font-mono" },
    { header: "Reencauches", accessorKey: (row) => `${row.vecesReencauchada} veces`, className: "text-slate-300" },
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
          <h2 className="text-2xl font-bold text-white">Fichas de Control de Llantas</h2>
          <p className="text-xs text-slate-400">Rotación interactiva de neumáticos y seguimiento de desgaste (Diagrama 4 - F1T02)</p>
        </div>

        {/* SELECTOR DE VEHÍCULO */}
        {vehiculos.length > 0 && (
          <div className="max-w-[280px]">
            <SearchSelect
              options={vehiculoOptions}
              value={selectedVehiculoId}
              onChange={setSelectedVehiculoId}
              placeholder="Seleccionar vehículo..."
              searchPlaceholder="Buscar por placa..."
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SILUETA SVG INTERACTIVA DEL VEHÍCULO */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-850/80 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[360px] relative overflow-hidden">
          <span className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase">Mapa de Desgaste y Distribución</span>
          
          <div className="relative w-[340px] h-[340px] flex items-center justify-center">
            {/* Chassis SVG Background */}
            <svg className="absolute w-[240px] h-[320px]" viewBox="0 0 100 150">
              {/* Ejes y cuerpo del chasis */}
              <rect x="44" y="20" width="12" height="110" fill="#1e293b" rx="2" />
              <rect x="20" y="30" width="60" height="6" fill="#334155" />
              <rect x="20" y="110" width="60" height="6" fill="#334155" />
            </svg>

            {/* Ruedas Interactivas */}
            {/* 1. Delantera Izquierda (1) */}
            <button
              onClick={() => setSelectedPosicion(1)}
              className={`absolute top-4 left-4 w-12 h-16 border rounded-lg transition flex flex-col items-center justify-center ${
                selectedPosicion === 1 ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-800"
              } ${getLlantaEnPosicion(1) ? getWearColor(getLlantaEnPosicion(1)!.kilometrajeAcumulado) : "bg-slate-900 text-slate-600"}`}
            >
              <span className="text-[10px] font-bold">DI [1]</span>
            </button>

            {/* 2. Delantera Derecha (2) */}
            <button
              onClick={() => setSelectedPosicion(2)}
              className={`absolute top-4 right-4 w-12 h-16 border rounded-lg transition flex flex-col items-center justify-center ${
                selectedPosicion === 2 ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-800"
              } ${getLlantaEnPosicion(2) ? getWearColor(getLlantaEnPosicion(2)!.kilometrajeAcumulado) : "bg-slate-900 text-slate-600"}`}
            >
              <span className="text-[10px] font-bold">DD [2]</span>
            </button>

            {/* Doble Eje Trasero Izquierdo Exterior (3) e Interior (4) */}
            <div className="absolute bottom-10 left-0 flex space-x-1">
              <button
                onClick={() => setSelectedPosicion(3)}
                className={`w-10 h-16 border rounded-lg transition flex flex-col items-center justify-center ${
                  selectedPosicion === 3 ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-800"
                } ${getLlantaEnPosicion(3) ? getWearColor(getLlantaEnPosicion(3)!.kilometrajeAcumulado) : "bg-slate-900 text-slate-600"}`}
              >
                <span className="text-[9px] font-bold">TIE [3]</span>
              </button>
              <button
                onClick={() => setSelectedPosicion(4)}
                className={`w-10 h-16 border rounded-lg transition flex flex-col items-center justify-center ${
                  selectedPosicion === 4 ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-800"
                } ${getLlantaEnPosicion(4) ? getWearColor(getLlantaEnPosicion(4)!.kilometrajeAcumulado) : "bg-slate-900 text-slate-600"}`}
              >
                <span className="text-[9px] font-bold">TII [4]</span>
              </button>
            </div>

            {/* Doble Eje Trasero Derecho Interior (5) y Exterior (6) */}
            <div className="absolute bottom-10 right-0 flex space-x-1">
              <button
                onClick={() => setSelectedPosicion(5)}
                className={`w-10 h-16 border rounded-lg transition flex flex-col items-center justify-center ${
                  selectedPosicion === 5 ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-800"
                } ${getLlantaEnPosicion(5) ? getWearColor(getLlantaEnPosicion(5)!.kilometrajeAcumulado) : "bg-slate-900 text-slate-600"}`}
              >
                <span className="text-[9px] font-bold">TDI [5]</span>
              </button>
              <button
                onClick={() => setSelectedPosicion(6)}
                className={`w-10 h-16 border rounded-lg transition flex flex-col items-center justify-center ${
                  selectedPosicion === 6 ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-800"
                } ${getLlantaEnPosicion(6) ? getWearColor(getLlantaEnPosicion(6)!.kilometrajeAcumulado) : "bg-slate-900 text-slate-600"}`}
              >
                <span className="text-[9px] font-bold">TDE [6]</span>
              </button>
            </div>

            {/* 7. Llanta de Repuesto (7) */}
            <button
              onClick={() => setSelectedPosicion(7)}
              className={`absolute -bottom-16 w-16 h-12 border rounded-lg transition flex flex-col items-center justify-center ${
                selectedPosicion === 7 ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-800"
              } ${getLlantaEnPosicion(7) ? getWearColor(getLlantaEnPosicion(7)!.kilometrajeAcumulado) : "bg-slate-900 text-slate-600"}`}
            >
              <span className="text-[10px] font-bold">REP [7]</span>
            </button>
          </div>

          {/* Código de Colores Desgaste */}
          <div className="flex space-x-4 text-[9px] font-bold mt-20">
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
              <span className="text-slate-400">ÓPTIMO (&lt; 20K KM)</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span>
              <span className="text-slate-400">DESGASTE MEDIO (20K-40K)</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"></span>
              <span className="text-slate-400">CRÍTICO (&gt; 40K KM)</span>
            </div>
          </div>
        </div>

        {/* DETALLE Y ACCIONES DE LA LLANTA SELECCIONADA */}
        <div className="bg-slate-950 border border-slate-850/80 p-6 rounded-2xl space-y-6 flex flex-col justify-between">
          {selectedPosicion ? (
            <>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{getPosicionLabel(selectedPosicion)}</h3>
                <p className="text-[10px] text-slate-400 mt-1">Gestión del componente y acciones de rotación</p>
              </div>

              {selectedLlanta ? (
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 space-y-2">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Código EPS</span>
                      <span className="font-mono font-bold text-white text-sm">{selectedLlanta.codigoEps}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 text-[10px]">Fabricante</span>
                        <p className="font-semibold text-white">{selectedLlanta.fabricante}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Dimensión</span>
                        <p className="font-semibold text-white">{selectedLlanta.dimension}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 text-[10px]">Kilómetros</span>
                        <p className="font-semibold text-indigo-400 font-mono">{selectedLlanta.kilometrajeAcumulado.toLocaleString()} km</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Reencauches</span>
                        <p className="font-semibold text-white font-mono">{selectedLlanta.vecesReencauchada} veces</p>
                      </div>
                    </div>
                  </div>

                  {/* FORMULARIO DE ROTACIÓN */}
                  <div className="border-t border-slate-900 pt-4 space-y-3">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase block tracking-wider">Rotar Llanta</span>
                    <div className="flex gap-2">
                      <select
                        value={targetRotarPosicion}
                        onChange={(e) => setTargetRotarPosicion(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="">Selecciona destino...</option>
                        {[1, 2, 3, 4, 5, 6, 7]
                          .filter((p) => p !== selectedPosicion && getLlantaEnPosicion(p))
                          .map((p) => (
                            <option key={p} value={p}>
                              {getPosicionLabel(p)}
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={handleRotar}
                        disabled={rotating || !targetRotarPosicion}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs transition duration-150"
                      >
                        {rotating ? "Rotando..." : "Intercambiar"}
                      </button>
                    </div>
                  </div>

                  {/* ACCIONES DE VIDA ÚTIL */}
                  <div className="grid grid-cols-2 gap-2 border-t border-slate-900 pt-4">
                    <button
                      onClick={() => handleReencauchar(selectedLlanta.id)}
                      disabled={updatingLifecycle}
                      className="py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold rounded-xl text-xs transition duration-150"
                    >
                      Registrar Reencauche
                    </button>
                    <button
                      onClick={() => handleBaja(selectedLlanta.id)}
                      disabled={updatingLifecycle}
                      className="py-2.5 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-400 font-bold rounded-xl text-xs transition duration-150"
                    >
                      Dar de Baja
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl text-xs">
                    Ninguna llanta montada en esta posición.
                  </div>
                  <button
                    onClick={() => {
                      setCodigoEps(`EPS-${selectedVehiculoId.slice(-4)}-${selectedPosicion}-${Date.now().toString().slice(-4)}`);
                      setModalOpen(true);
                    }}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition duration-150 shadow-md"
                  >
                    + Montar y Registrar Llanta
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs text-center p-8">
              Haz clic en cualquier rueda de la silueta del chasis para gestionar su estado y rotación.
            </div>
          )}
        </div>

      </div>

      {/* DATATABLE */}
      {selectedVehiculoId && (
        <DataTable
          data={llantas}
          columns={columns}
          searchKey="codigoEps"
          searchPlaceholder="Buscar por código EPS..."
          newActionLabel=""
          onNewAction={() => {}}
        />
      )}

      {/* MODAL MONTAR LLANTA */}
      {modalOpen && selectedPosicion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div>
              <h3 className="text-lg font-bold text-indigo-400">Montar Llanta en {getPosicionLabel(selectedPosicion)}</h3>
              <p className="text-xs text-slate-450">Ficha de control de componentes e inventario de llantas</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-350">Código EPS (Grabado)</label>
                  <input
                    type="text"
                    value={codigoEps}
                    onChange={(e) => setCodigoEps(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-350">Fabricante</label>
                  <SearchSelect
                    options={fabricanteOptions}
                    value={fabricante}
                    onChange={setFabricante}
                    placeholder="Buscar fabricante..."
                    searchPlaceholder="Marca de llanta..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-350">Medida (Dimensión)</label>
                  <SearchSelect
                    options={dimensionOptions}
                    value={dimension}
                    onChange={setDimension}
                    placeholder="Buscar medida..."
                    searchPlaceholder="Ej: 295/80R22.5..."
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-350">Modelo</label>
                  <input
                    type="text"
                    value={modeloLlanta}
                    onChange={(e) => setModeloLlanta(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-350">Costo Adquisición (S/.)</label>
                  <input
                    type="number"
                    value={costoAdquisicion}
                    onChange={(e) => setCostoAdquisicion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-350">Km al Montar</label>
                  <input
                    type="number"
                    value={kilometrajeInstalacion}
                    onChange={(e) => setKilometrajeInstalacion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold rounded-xl transition duration-150 shadow-lg text-sm"
              >
                {isSubmitting ? "Registrando..." : "Confirmar y Montar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
