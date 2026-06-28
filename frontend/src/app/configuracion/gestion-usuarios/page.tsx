"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  activo: boolean;
  telefono: string | null;
  ultimoAcceso: string | null;
  creadoEn: string;
}

const ROLES = [
  { value: "JEFE_PROCESO", label: "Jefe de Proceso", color: "indigo" },
  { value: "CONDUCTOR", label: "Conductor", color: "amber" },
  { value: "INSPECTOR", label: "Inspector", color: "cyan" },
  { value: "ANALISTA", label: "Analista", color: "blue" },
  { value: "MECANICO", label: "Mecánico", color: "pink" },
  {value: "ELECTRICISTA", label: "Eléctrico", color: "violet" },
  { value: "ADMINISTRATIVO", label: "Administrativo", color: "emerald" },
];

const ROLE_COLORS: Record<string, string> = {
  JEFE_PROCESO: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  CONDUCTOR: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  INSPECTOR: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  ANALISTA: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  MECANICO: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  ELECTRICISTA: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  ADMINISTRATIVO: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function GestionUsuariosPage() {
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [tokenResult, setTokenResult] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    rol: "CONDUCTOR",
    telefono: "",
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch("/api/admin/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data);
      }
    } catch {
      console.error("Error fetching usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });
    setTokenResult("");

    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        if (data.token) {
          setTokenResult(data.token);
        }
        setForm({ nombre: "", apellido: "", email: "", rol: "CONDUCTOR", telefono: "" });
        setShowForm(false);
        fetchUsuarios();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/configuracion" className="text-xs text-slate-500 hover:text-slate-300 transition">
              ← Configuración
            </Link>
            <h1 className="text-2xl font-black text-white mt-1">Gestión de Usuarios</h1>
            <p className="text-xs text-slate-400 mt-1">Crear y administrar usuarios del sistema</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setMessage({ type: "", text: "" }); setTokenResult(""); }}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition"
          >
            {showForm ? "Cancelar" : "+ Nuevo Usuario"}
          </button>
        </div>

        {message.text && (
          <div className={`rounded-xl px-4 py-3 text-xs font-semibold ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
          }`}>
            {message.text}
          </div>
        )}

        {tokenResult && (
          <div className="rounded-xl px-4 py-3 text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 space-y-2">
            <p className="font-bold">No se pudo enviar el correo (SMTP no configurado).</p>
            <p>Copia este enlace y compártelo con el usuario:</p>
            <code className="block bg-slate-900 rounded-lg p-2 text-[10px] break-all">
              {typeof window !== "undefined" ? window.location.origin : ""}/confirmar-usuario?token={tokenResult}
            </code>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white">Crear Nuevo Usuario</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Nombre *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Apellido *</label>
                <input
                  type="text"
                  value={form.apellido}
                  onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="nombre@flota.gob"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Rol *</label>
                <select
                  value={form.rol}
                  onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  placeholder="+51 999 000 000"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 font-bold rounded-xl text-sm transition"
              >
                {submitting ? "Creando..." : "Crear Usuario"}
              </button>
            </div>
          </form>
        )}

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Cargando usuarios...</div>
          ) : usuarios.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No hay usuarios registrados</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rol</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Último Acceso</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{u.nombre} {u.apellido}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold border ${ROLE_COLORS[u.rol] || "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
                          {ROLES.find(r => r.value === u.rol)?.label || u.rol}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          u.activo
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {u.activo ? "Activo" : "Pendiente"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {u.ultimoAcceso
                          ? new Date(u.ultimoAcceso).toLocaleDateString("es-PE")
                          : "Nunca"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
