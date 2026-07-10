"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api";

export default function ConfiguracionPage() {
  const { token, user } = useAuth();
  const [ckvMeta, setCkvMeta] = useState("3.50");
  const [krpDiario, setKrpDiario] = useState("50");
  const [hupDiario, setHupDiario] = useState("8");
  const [metasMantenimiento, setMetasMantenimiento] = useState("5000");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requestingPasswordChange, setRequestingPasswordChange] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    api.getConfiguracion()
      .then((data: any) => {
        if (data.configMap) {
          setCkvMeta(data.configMap["CKV_META"] || "3.50");
          setKrpDiario(data.configMap["KRP_DIARIO"] || "50");
          setHupDiario(data.configMap["HUP_DIARIO"] || "8");
          setMetasMantenimiento(data.configMap["METAS_MANTENIMIENTO"] || "5000");
        }
        setLoading(false);
      })
      .catch((err: any) => {
        console.error("Error al cargar configuración:", err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.saveConfiguracion({
        CKV_META: ckvMeta,
        KRP_DIARIO: krpDiario,
        HUP_DIARIO: hupDiario,
        METAS_MANTENIMIENTO: metasMantenimiento,
      });
      alert("Configuraciones de la flota actualizadas con éxito.");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error de red");
    } finally {
      setSaving(false);
    }
  };

  const handleRequestPasswordChange = async () => {
    setRequestingPasswordChange(true);
    setPasswordMessage("");
    try {
      const data = await api.solicitarCambioPassword();
      setPasswordMessage(data.message);
    } catch {
      setPasswordMessage("Error de conexión");
    } finally {
      setRequestingPasswordChange(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
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
        <h2 className="text-2xl font-bold text-white">Configuración del Sistema</h2>
        <p className="text-xs text-slate-400">Parámetros operacionales y administración de usuarios</p>
      </div>

      {/* SECCIÓN: Gestión de Usuarios (solo JEFE_PROCESO) */}
      {user?.rol === "JEFE_PROCESO" && (
        <div className="bg-slate-950 border border-slate-850/80 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Gestión de Usuarios</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Crear y administrar usuarios del sistema</p>
            </div>
            <Link
              href="/configuracion/gestion-usuarios"
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs transition"
            >
              Administrar →
            </Link>
          </div>
        </div>
      )}

      {/* SECCIÓN: Cambiar Contraseña */}
      <div className="bg-slate-950 border border-slate-850/80 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Cambiar Contraseña</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Se enviará un correo con las instrucciones</p>
          </div>
          <button
            onClick={handleRequestPasswordChange}
            disabled={requestingPasswordChange}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-slate-300 font-bold rounded-xl text-xs transition"
          >
            {requestingPasswordChange ? "Enviando..." : "Enviar correo"}
          </button>
        </div>
        {passwordMessage && (
          <p className="text-[10px] text-emerald-400 mt-2">{passwordMessage}</p>
        )}
      </div>

      {/* SECCIÓN: Parámetros de Flota */}
      <div>
        <h3 className="text-sm font-bold text-white mb-1">Parámetros de Flota</h3>
        <p className="text-[10px] text-slate-400">Ajuste de límites y coeficientes analíticos (Manual F1T02)</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Cargando configuración...</div>
      ) : (
        <form onSubmit={handleSave} className="bg-slate-950 border border-slate-850/80 p-6 rounded-2xl space-y-6 shadow-xl text-slate-100">
          <div className="space-y-4">
            
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Costo por Kilómetro Límite (CKV Meta)</label>
              <input
                type="number"
                step="0.01"
                value={ckvMeta}
                onChange={(e) => setCkvMeta(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white focus:outline-none font-mono"
                required
              />
              <span className="text-[9px] text-slate-500 block mt-1">Límite financiero máximo tolerable de costo operativo por kilómetro.</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kilómetros Patrón Diario (KRP)</label>
              <input
                type="number"
                value={krpDiario}
                onChange={(e) => setKrpDiario(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white focus:outline-none font-mono"
                required
              />
              <span className="text-[9px] text-slate-500 block mt-1">Kilometraje esperado para un vehículo en uso en un día útil.</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Horas Patrón Diario (HUP)</label>
              <input
                type="number"
                value={hupDiario}
                onChange={(e) => setHupDiario(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white focus:outline-none font-mono"
                required
              />
              <span className="text-[9px] text-slate-500 block mt-1">Horas estándar de operación activa para el cálculo del IUV.</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Periodicidad Mantenimiento Preventivo (Km)</label>
              <input
                type="number"
                value={metasMantenimiento}
                onChange={(e) => setMetasMantenimiento(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white focus:outline-none font-mono"
                required
              />
              <span className="text-[9px] text-slate-500 block mt-1">Kilometraje acumulado requerido para disparar alertas de servicio.</span>
            </div>

          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-550 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs transition duration-150 shadow-md cursor-pointer"
          >
            {saving ? "Guardando configuraciones..." : "Guardar Cambios Operacionales"}
          </button>
        </form>
      )}
    </div>
  );
}
