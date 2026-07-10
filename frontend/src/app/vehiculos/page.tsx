"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import api from "@/lib/api";
import { exportToExcel } from "@/utils/exportUtils";
import {
  MARCAS_VEHICULOS,
  COLORES_VEHICULOS,
  TIPOS_COMBUSTIBLE,
  SUBTIPOS_COMBUSTIBLE,
  CATEGORIAS_VEHICULO,
  getSubtiposCombustible,
  tieneSubtipos,
} from "@/lib/constants";

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
}

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
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
  const [valorAdquisicion, setValorAdquisicion] = useState("");
  const [vidaUtilAnios, setVidaUtilAnios] = useState("10");
  const [seguroAnual, setSeguroAnual] = useState("");
  const [licenciamientoAnual, setLicenciamientoAnual] = useState("");
  const [periodicidadMantenimientoKm, setPeriodicidadMantenimientoKm] = useState("5000");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setPeriodicidadMantenimientoKm("5000");
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placa || !marca || !modelo || !anioFabricacion || !tipoCombustible) {
      alert("Placa, marca, modelo, año y tipo de combustible son requeridos.");
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
        vidaUtilAnios: parseInt(vidaUtilAnios),
        seguroAnual: seguroAnual ? parseFloat(seguroAnual) : undefined,
        licenciamientoAnual: licenciamientoAnual ? parseFloat(licenciamientoAnual) : undefined,
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
      alert(editingId ? "¡Vehículo actualizado!" : "¡Vehículo registrado con éxito!");
    } catch (err: any) {
      alert("Error: " + (err.message || "Error de red"));
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
    setModalOpen(true);
  };

  const handleDelete = async (id: string, placa: string) => {
    if (!confirm(`¿Está seguro de eliminar el vehículo ${placa}?`)) return;
    try {
      await api.deleteVehiculo(id);
      cargarVehiculos();
      alert("Vehículo eliminado.");
    } catch {
      alert("Error de conexión");
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
          <button onClick={() => handleDelete(row.id, row.placa)} className="text-xs text-rose-400 hover:text-rose-300">Eliminar</button>
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-semibold">Placa *</label>
                  <input type="text" value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())} className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" required />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold">Marca *</label>
                  <select value={marca} onChange={(e) => setMarca(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" required>
                    <option value="">Seleccionar marca...</option>
                    {MARCAS_VEHICULOS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold">Modelo *</label>
                  <input type="text" value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Ej: Hilux, Corolla..." className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" required />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold">Año Fabricación *</label>
                  <input type="number" value={anioFabricacion} onChange={(e) => setAnioFabricacion(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" required />
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
                  <select value={color} onChange={(e) => setColor(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
                    <option value="">Seleccionar color...</option>
                    {COLORES_VEHICULOS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold">Cap. Pasajeros</label>
                  <input type="number" value={capacidadPasajeros} onChange={(e) => setCapacidadPasajeros(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold">Cap. Carga (kg)</label>
                  <input type="number" step="0.01" value={capacidadCargaKg} onChange={(e) => setCapacidadCargaKg(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold">Valor Adquisición (S/.)</label>
                  <input type="number" step="0.01" value={valorAdquisicion} onChange={(e) => setValorAdquisicion(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold">Vida Útil (años)</label>
                  <input type="number" value={vidaUtilAnios} onChange={(e) => setVidaUtilAnios(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold">Seguro Anual (S/.)</label>
                  <input type="number" step="0.01" value={seguroAnual} onChange={(e) => setSeguroAnual(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold">Licenciamiento Anual (S/.)</label>
                  <input type="number" step="0.01" value={licenciamientoAnual} onChange={(e) => setLicenciamientoAnual(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold">Periodicidad Mant. Preventivo (Km)</label>
                  <input type="number" value={periodicidadMantenimientoKm} onChange={(e) => setPeriodicidadMantenimientoKm(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                </div>
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
