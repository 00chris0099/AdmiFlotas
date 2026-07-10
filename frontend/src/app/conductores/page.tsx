"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import api from "@/lib/api";
import Icon from "@/components/ui/Icon";

interface Conductor {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  licenciaConducir: string;
  categoriaLicencia: string;
  vencimientoLicencia: string;
  telefono?: string;
  activo: boolean;
}

export default function ConductoresPage() {
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [licenciaConducir, setLicenciaConducir] = useState("");
  const [categoriaLicencia, setCategoriaLicencia] = useState("AI");
  const [vencimientoLicencia, setVencimientoLicencia] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargarConductores = async () => {
    try {
      setIsLoading(true);
      const data = await api.getUsuarios();
      const items = Array.isArray(data) ? data : data?.usuarios ?? [];
      const formatted = items.map((c: any) => ({
        ...c,
        vencimientoLicencia: c.vencimientoLicencia 
          ? c.vencimientoLicencia.split("T")[0]
          : "N/D",
      }));
      setConductores(formatted);
    } catch (err) {
      console.error("Error al cargar conductores:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarConductores();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !apellido || !email || !licenciaConducir || !categoriaLicencia || !vencimientoLicencia) {
      alert("Por favor complete todos los campos obligatorios.");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.createUsuario({
        nombre,
        apellido,
        email,
        telefono: telefono || undefined,
        licenciaConducir,
        categoriaLicencia,
        vencimientoLicencia,
      });

      alert("¡Conductor registrado con éxito!");
      setModalOpen(false);
      setNombre("");
      setApellido("");
      setEmail("");
      setTelefono("");
      setLicenciaConducir("");
      setCategoriaLicencia("AI");
      setVencimientoLicencia("");
      cargarConductores();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<Conductor>[] = [
    {
      header: "Nombre Completo",
      accessorKey: (row) => `${row.nombre} ${row.apellido}`,
      className: "font-semibold text-white",
    },
    { header: "Email", accessorKey: "email" },
    { header: "N° Licencia", accessorKey: "licenciaConducir", className: "font-mono" },
    { header: "Categoría", accessorKey: "categoriaLicencia" },
    {
      header: "Vencimiento",
      accessorKey: (row) => {
        const isVencida = row.vencimientoLicencia !== "N/D" && new Date(row.vencimientoLicencia) < new Date();
        return (
          <span className={isVencida ? "text-rose-400 font-bold" : "text-slate-300"}>
            {row.vencimientoLicencia} {isVencida && <Icon name="warning" size={12} />} {isVencida && "(Vencida)"}
          </span>
        );
      },
    },
    {
      header: "Estado",
      className: "text-right",
      accessorKey: (row) => (
        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">
          {row.activo ? "ACTIVO" : "INACTIVO"}
        </span>
      ),
    },
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

      <div>
        <h2 className="text-2xl font-bold text-white">Equipo de Operación — Conductores</h2>
        <p className="text-xs text-slate-400">Control de licencias, vigencia y asignación del personal operativo (F1T02)</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-450 text-sm">Cargando conductores...</div>
      ) : (
        <DataTable
          data={conductores}
          columns={columns}
          searchKey="nombre"
          searchPlaceholder="Buscar por nombre..."
          newActionLabel="Registrar Conductor"
          onNewAction={() => setModalOpen(true)}
        />
      )}

      {/* MODAL DE REGISTRO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              <Icon name="close" size={16} />
            </button>

            <div>
              <h3 className="text-lg font-bold text-emerald-400 flex items-center space-x-2">
                <Icon name="driver" size={18} />
                <span>Registrar Nuevo Conductor</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                SAF ERP — Manual de Control de Conductores F1T02
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Juan"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Apellido *</label>
                  <input
                    type="text"
                    required
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Ej. Pérez"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="juan.perez@flota.gob"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Teléfono</label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej. 987654321"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">N° Licencia *</label>
                  <input
                    type="text"
                    required
                    value={licenciaConducir}
                    onChange={(e) => setLicenciaConducir(e.target.value)}
                    placeholder="Ej. Q-9948211"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Categoría *</label>
                  <select
                    value={categoriaLicencia}
                    onChange={(e) => setCategoriaLicencia(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                  >
                    <option value="AI">AI (Particular)</option>
                    <option value="AIIA">AIIA (Taxi / Ambulancia)</option>
                    <option value="AIIB">AIIB (Camión pequeño / Pick-up)</option>
                    <option value="AIIIA">AIIIA (Bus / Colectivo)</option>
                    <option value="AIIIB">AIIIB (Camión pesado / Remolcador)</option>
                    <option value="AIIIC">AIIIC (Especial / Volquete)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Fecha de Vencimiento de Licencia *</label>
                <input
                  type="date"
                  required
                  value={vencimientoLicencia}
                  onChange={(e) => setVencimientoLicencia(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer text-center"
                >
                  {isSubmitting ? "Registrando..." : "Registrar Conductor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
