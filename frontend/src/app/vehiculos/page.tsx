"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import SearchSelect from "@/components/ui/SearchSelect";
import api from "@/lib/api";
import { exportToExcel } from "@/utils/exportUtils";
import {
  MARCAS_VEHICULOS,
  MARCAS_MODELOS,
  ANIOS_FABRICACION,
  COLORES_VEHICULOS,
  TIPOS_COMBUSTIBLE,
  CATEGORIAS_VEHICULO,
  getSubtiposCombustible,
  tieneSubtipos,
} from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";

// Defaults por categoría para costos fijos del vehículo
const DEFAULTS_POR_CATEGORIA: Record<string, { vidaUtil: number; porcentajeSeguro: number; licenciamiento: number; kmAnuales: number }> = {
  PASAJEROS: { vidaUtil: 10, porcentajeSeguro: 4.0, licenciamiento: 500, kmAnuales: 30000 },
  CARGA: { vidaUtil: 12, porcentajeSeguro: 3.5, licenciamiento: 650, kmAnuales: 50000 },
  ESPECIAL: { vidaUtil: 10, porcentajeSeguro: 4.5, licenciamiento: 600, kmAnuales: 25000 },
};

interface Vehiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  codigoPatrimonial: string;
  estado: string;
  anioFabricacion: number;
  tipoCombustible: string;
  capacidadPasajeros: number | null;
  capacidadCargaKg: number | null;
  valorAdquisicion: number | null;
  vidaUtilAnios: number | null;
  seguroAnual: number | null;
  licenciamientoAnual: number | null;
  kmAnualesReferencia: number | null;
  periodicidadMantenimientoKm: number | null;
}

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const toast = useToast();
  const { confirm } = useConfirm();

  // Form states — Datos del vehículo
  const [placa, setPlaca] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anioFabricacion, setAnioFabricacion] = useState(new Date().getFullYear().toString());
  const [tipoCombustible, setTipoCombustible] = useState("DIESEL");
  const [subtipoCombustible, setSubtipoCombustible] = useState("");
  const [categoriaPatrimonial, setCategoriaPatrimonial] = useState("PASAJEROS");
  const [color, setColor] = useState("");
  const [capacidadPasajeros, setCapacidadPasajeros] = useState("");
  const [capacidadCargaKg, setCapacidadCargaKg] = useState("");

  // Form states — Costos fijos del vehículo
  const [valorAdquisicion, setValorAdquisicion] = useState("");
  const [vidaUtilAnios, setVidaUtilAnios] = useState("10");
  const [seguroAnual, setSeguroAnual] = useState("");
  const [licenciamientoAnual, setLicenciamientoAnual] = useState("");
  const [kmAnualesReferencia, setKmAnualesReferencia] = useState("30000");
  const [periodicidadMantenimientoKm, setPeriodicidadMantenimientoKm] = useState("5000");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Cálculo automático de depreciación anual ───
  const depreciacionAnual = useMemo(() => {
    const valor = parseFloat(valorAdquisicion) || 0;
    const vida = parseInt(vidaUtilAnios) || 1;
    if (valor > 0 && vida > 0) return valor / vida;
    return 0;
  }, [valorAdquisicion, vidaUtilAnios]);

  // ─── Aplicar defaults cuando cambia la categoría ───
  useEffect(() => {
    if (editingId) return; // No sobreescribir al editar
    const defaults = DEFAULTS_POR_CATEGORIA[categoriaPatrimonial];
    if (!defaults) return;
    setVidaUtilAnios(defaults.vidaUtil.toString());
    setLicenciamientoAnual(defaults.licenciamiento.toString());
    setKmAnualesReferencia(defaults.kmAnuales.toString());
    // Recalcular seguro si ya hay valor de adquisición
    if (valorAdquisicion) {
      const valor = parseFloat(valorAdquisicion);
      setSeguroAnual((valor * defaults.porcentajeSeguro / 100).toFixed(2));
    }
  }, [categoriaPatrimonial, editingId]);

  // ─── Recalcular seguro cuando cambia el valor de adquisición ───
  useEffect(() => {
    const valor = parseFloat(valorAdquisicion) || 0;
    const defaults = DEFAULTS_POR_CATEGORIA[categoriaPatrimonial];
    if (valor > 0 && defaults) {
      setSeguroAnual((valor * defaults.porcentajeSeguro / 100).toFixed(2));
    }
  }, [valorAdquisicion, categoriaPatrimonial]);

  const cargarVehiculos = async () => {
    try {
      setIsLoading(true);
      const data = await api.getVehiculos();
      if (Array.isArray(data)) {
        setVehiculos(data);
      }
    } catch (err) {
      console.error("Error al cargar vehículos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarVehiculos();
  }, []);

  const marcaOptions = useMemo(
    () => MARCAS_VEHICULOS.map((m) => ({ value: m, label: m })),
    []
  );

  const modeloOptions = useMemo(() => {
    if (!marca) return [];
    const modelos = MARCAS_MODELOS[marca] ?? [];
    return modelos.map((m) => ({ value: m, label: m }));
  }, [marca]);

  const anioOptions = ANIOS_FABRICACION;

  const colorOptions = useMemo(
    () => COLORES_VEHICULOS.map((c) => ({ value: c, label: c })),
    []
  );

  const resetForm = () => {
    setPlaca("");
    setMarca("");
    setModelo("");
    setAnioFabricacion(new Date().getFullYear().toString());
    setTipoCombustible("DIESEL");
    setSubtipoCombustible("");
    setCategoriaPatrimonial("PASAJEROS");
    setColor("");
    setCapacidadPasajeros("");
    setCapacidadCargaKg("");
    setValorAdquisicion("");
    setVidaUtilAnios("10");
    setSeguroAnual("");
    setLicenciamientoAnual("");
    setKmAnualesReferencia("30000");
    setPeriodicidadMantenimientoKm("5000");
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placa || !marca || !modelo || !anioFabricacion || !tipoCombustible) {
      toast.warning("Placa, marca, modelo, año y tipo de combustible son requeridos.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        placa,
        marca,
        modelo,
        anioFabricacion: parseInt(anioFabricacion),
        tipoCombustible,
        subtipoCombustible: subtipoCombustible || undefined,
        categoriaPatrimonial,
        color: color || undefined,
        capacidadPasajeros: capacidadPasajeros ? parseInt(capacidadPasajeros) : undefined,
        capacidadCargaKg: capacidadCargaKg ? parseFloat(capacidadCargaKg) : undefined,
        valorAdquisicion: valorAdquisicion ? parseFloat(valorAdquisicion) : undefined,
        vidaUtilAnios: parseInt(vidaUtilAnios) || undefined,
        seguroAnual: seguroAnual ? parseFloat(seguroAnual) : undefined,
        licenciamientoAnual: licenciamientoAnual ? parseFloat(licenciamientoAnual) : undefined,
        kmAnualesReferencia: kmAnualesReferencia ? parseInt(kmAnualesReferencia) : undefined,
        periodicidadMantenimientoKm: parseInt(periodicidadMantenimientoKm) || 5000,
      };

      if (editingId) {
        await api.updateVehiculo(editingId, payload);
      } else {
        await api.createVehiculo(payload);
      }

      setModalOpen(false);
      resetForm();
      cargarVehiculos();
      toast.success(editingId ? "¡Vehículo actualizado!" : "¡Vehículo registrado con éxito!");
    } catch (err: any) {
      toast.error("Error: " + (err.message || "Error de red"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (veh: Vehiculo) => {
    setEditingId(veh.id);
    setPlaca(veh.placa);
    setMarca(veh.marca);
    setModelo(veh.modelo);
    setAnioFabricacion(veh.anioFabricacion.toString());
    setTipoCombustible(veh.tipoCombustible);
    setCategoriaPatrimonial("PASAJEROS");
    setValorAdquisicion(veh.valorAdquisicion?.toString() || "");
    setVidaUtilAnios(veh.vidaUtilAnios?.toString() || "10");
    setSeguroAnual(veh.seguroAnual?.toString() || "");
    setLicenciamientoAnual(veh.licenciamientoAnual?.toString() || "");
    setKmAnualesReferencia(veh.kmAnualesReferencia?.toString() || "30000");
    setPeriodicidadMantenimientoKm(veh.periodicidadMantenimientoKm?.toString() || "5000");
    setModalOpen(true);
  };

  const handleDelete = async (id: string, placa: string) => {
    const ok = await confirm({
      title: "Dar de Baja",
      message: `¿Está seguro de dar de baja el vehículo ${placa}? No aparecerá en las listas pero se conservará el historial.`,
      variant: "danger",
      confirmText: "Dar de Baja",
    });
    if (!ok) return;
    try {
      await api.deleteVehiculo(id);
      cargarVehiculos();
      toast.success("Vehículo dado de baja correctamente");
    } catch (err: any) {
      toast.error("Error: " + (err.message || "Error de conexión"));
    }
  };

  const columns: ColumnDef<Vehiculo>[] = [
    { header: "Cód. Patrimonial", accessorKey: "codigoPatrimonial", className: "font-mono text-indigo-400 font-semibold" },
    { header: "Placa", accessorKey: "placa", className: "font-bold text-white" },
    { header: "Marca / Modelo", accessorKey: (row) => `${row.marca} ${row.modelo}` },
    { header: "Año", accessorKey: "anioFabricacion", className: "font-mono" },
    { header: "Combustible", accessorKey: "tipoCombustible" },
    {
      header: "Estado",
      accessorKey: (row) => {
        const colors: Record<string, string> = {
          OPERATIVO: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          EN_MANTENIMIENTO: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          INOPERATIVO: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          DADO_DE_BAJA: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        };
        return (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[row.estado] || ""}`}>
            {row.estado}
          </span>
        );
      },
    },
    {
      header: "Acciones",
      className: "text-right",
      accessorKey: (row) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => handleEdit(row)} className="text-xs text-blue-400 hover:text-blue-300">Editar</button>
          <button onClick={() => handleDelete(row.id, row.placa)} className="text-xs text-rose-400 hover:text-rose-300">Dar de Baja</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">← Volver al Dashboard</Link>
          <h2 className="text-2xl font-bold text-white mt-1">Inventario de Flota</h2>
          <p className="text-xs text-slate-400 mt-1">Ficha técnica patrimonial completa — Diagrama 3 F1T02</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportToExcel(vehiculos, "vehiculos_saf.xlsx")}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition"
          >
            Exportar Excel
          </button>
          <button
            onClick={() => { resetForm(); setModalOpen(true); }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition"
          >
            + Registrar Vehículo
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={vehiculos} />

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">{editingId ? "Editar Vehículo" : "Registrar Nuevo Vehículo"}</h3>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* ─── Sección: Datos del Vehículo ─── */}
              <div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Datos del Vehículo</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 font-semibold">Placa *</label>
                    <input type="text" value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())} className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" required />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-semibold">Marca *</label>
                    <SearchSelect
                      options={marcaOptions}
                      value={marca}
                      onChange={(v) => { setMarca(v); setModelo(""); }}
                      placeholder="Buscar marca..."
                      searchPlaceholder="Escriba para buscar marca..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-semibold">Modelo *</label>
                    <SearchSelect
                      options={modeloOptions}
                      value={modelo}
                      onChange={setModelo}
                      placeholder={marca ? "Buscar modelo..." : "Primero seleccione una marca"}
                      searchPlaceholder="Escriba para buscar modelo..."
                      disabled={!marca}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-semibold">Año Fabricación *</label>
                    <SearchSelect
                      options={anioOptions}
                      value={anioFabricacion}
                      onChange={setAnioFabricacion}
                      placeholder="Seleccionar año..."
                      searchPlaceholder="Escriba el año..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-semibold">Tipo Combustible *</label>
                    <select value={tipoCombustible} onChange={(e) => {
                      setTipoCombustible(e.target.value);
                      setSubtipoCombustible("");
                    }} className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
                      {TIPOS_COMBUSTIBLE.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  {tieneSubtipos(tipoCombustible) && (
                    <div>
                      <label className="text-xs text-slate-400 font-semibold">Subtipo Combustible</label>
                      <select value={subtipoCombustible} onChange={(e) => setSubtipoCombustible(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
                        <option value="">Seleccionar subtipo...</option>
                        {getSubtiposCombustible(tipoCombustible).map((st) => (
                          <option key={st.value} value={st.value}>{st.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-slate-400 font-semibold">Categoría</label>
                    <select value={categoriaPatrimonial} onChange={(e) => setCategoriaPatrimonial(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
                      {CATEGORIAS_VEHICULO.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-semibold">Color</label>
                    <SearchSelect
                      options={colorOptions}
                      value={color}
                      onChange={setColor}
                      placeholder="Buscar color..."
                      searchPlaceholder="Escriba para buscar color..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-semibold">Cap. Pasajeros</label>
                    <input type="number" value={capacidadPasajeros} onChange={(e) => setCapacidadPasajeros(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-semibold">Cap. Carga (kg)</label>
                    <input type="number" step="0.01" value={capacidadCargaKg} onChange={(e) => setCapacidadCargaKg(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                  </div>
                </div>
              </div>

              {/* ─── Sección: Costos Fijos del Vehículo ─── */}
              <div>
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Costos Fijos del Vehículo</h4>
                <p className="text-xs text-slate-500 mb-3">Los valores se calculan automáticamente según la categoría. Puede modificarlos manualmente.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 font-semibold">Valor Adquisición (S/.)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={valorAdquisicion}
                      onChange={(e) => setValorAdquisicion(e.target.value)}
                      placeholder="Ej: 120000"
                      className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-semibold">Vida Útil (años)</label>
                    <input
                      type="number"
                      value={vidaUtilAnios}
                      onChange={(e) => setVidaUtilAnios(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-semibold">Seguro Anual (S/.)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={seguroAnual}
                      onChange={(e) => setSeguroAnual(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-semibold">Licenciamiento Anual (S/.)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={licenciamientoAnual}
                      onChange={(e) => setLicenciamientoAnual(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-semibold">KM Anuales de Referencia</label>
                    <input
                      type="number"
                      value={kmAnualesReferencia}
                      onChange={(e) => setKmAnualesReferencia(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-semibold">Periodicidad Mant. Preventivo (Km)</label>
                    <input
                      type="number"
                      value={periodicidadMantenimientoKm}
                      onChange={(e) => setPeriodicidadMantenimientoKm(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>

                {/* ─── Resumen de costos calculados ─── */}
                {depreciacionAnual > 0 && (
                  <div className="mt-4 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                    <p className="text-xs font-bold text-slate-300 mb-2">Resumen de Costos Fijos Anuales</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Depreciación Anual:</span>
                        <span className="text-white font-mono font-semibold">S/. {depreciacionAnual.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Seguro Anual:</span>
                        <span className="text-white font-mono font-semibold">S/. {parseFloat(seguroAnual || "0").toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Licenciamiento Anual:</span>
                        <span className="text-white font-mono font-semibold">S/. {parseFloat(licenciamientoAnual || "0").toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-700 pt-2 mt-1">
                        <span className="text-slate-300 font-bold">Total Costos Fijos Anuales:</span>
                        <span className="text-emerald-400 font-mono font-bold">
                          S/. {(depreciacionAnual + parseFloat(seguroAnual || "0") + parseFloat(licenciamientoAnual || "0")).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      {kmAnualesReferencia && parseInt(kmAnualesReferencia) > 0 && (
                        <div className="flex justify-between col-span-2 border-t border-slate-700 pt-2 mt-1">
                          <span className="text-slate-300 font-bold">Costo Fijo por KM:</span>
                          <span className="text-amber-400 font-mono font-bold">
                            S/. {((depreciacionAnual + parseFloat(seguroAnual || "0") + parseFloat(licenciamientoAnual || "0")) / parseInt(kmAnualesReferencia)).toFixed(4)}/km
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setModalOpen(false); resetForm(); }} className="px-4 py-2 text-slate-400 hover:text-white text-sm">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-semibold rounded-xl text-sm transition">
                  {isSubmitting ? "Guardando..." : editingId ? "Actualizar" : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
