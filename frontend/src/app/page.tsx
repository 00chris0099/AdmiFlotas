"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

interface TaskItem {
  name: string;
  href: string;
  icon: string;
  description: string;
  roles: string[];
}

interface ModuleData {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  hoverGradient: string;
  roles: string[];
  tasks: TaskItem[];
}

const MODULES: ModuleData[] = [
  {
    id: "operaciones",
    title: "Módulo Operaciones",
    description: "Registro de movimientos diarios (MA 122 01 01), combustibles (MA 122 01 02) y conductores.",
    icon: "📋",
    gradient: "from-emerald-500/10 to-teal-500/5 hover:border-emerald-500/40 hover:from-emerald-500/20",
    hoverGradient: "border-emerald-500/30",
    roles: ["JEFE_PROCESO", "CONDUCTOR", "INSPECTOR", "ANALISTA", "ADMINISTRATIVO"],
    tasks: [
      {
        name: "Movimientos Diarios",
        href: "/movimientos_diarios",
        icon: "📋",
        description: "Control pre-operacional and HUV diario (MA 122 01 01)",
        roles: ["JEFE_PROCESO", "CONDUCTOR", "INSPECTOR", "ANALISTA", "ADMINISTRATIVO"],
      },
      {
        name: "Control Combustible",
        href: "/control_combustible",
        icon: "⛽",
        description: "Órdenes de abastecimiento y lubricantes (MA 122 01 02)",
        roles: ["JEFE_PROCESO", "CONDUCTOR", "INSPECTOR", "ANALISTA", "ADMINISTRATIVO"],
      },
      {
        name: "Conductores Activos",
        href: "/conductores",
        icon: "👤",
        description: "Licencias, categorías y asignación de flota",
        roles: ["JEFE_PROCESO", "ANALISTA", "ADMINISTRATIVO", "INSPECTOR"],
      },
    ],
  },
  {
    id: "mantenimiento",
    title: "Módulo Mantenimiento",
    description: "Gestión de Órdenes de Servicio (MA 122 02 01), inspecciones de 15 puntos y control de llantas.",
    icon: "🔧",
    gradient: "from-blue-500/10 to-indigo-500/5 hover:border-blue-500/40 hover:from-blue-500/20",
    hoverGradient: "border-blue-500/30",
    roles: ["JEFE_PROCESO", "MECANICO", "ELECTRICISTA", "INSPECTOR", "ADMINISTRATIVO"],
    tasks: [
      {
        name: "Órdenes de Servicio",
        href: "/control_mantenimiento",
        icon: "🔧",
        description: "Preventivo, correctivo y repuestos de almacén (MA 122 02 01)",
        roles: ["JEFE_PROCESO", "MECANICO", "ELECTRICISTA", "ADMINISTRATIVO"],
      },
      {
        name: "Checklists Control",
        href: "/movimientos_diarios/checklist",
        icon: "✅",
        description: "Inspecciones técnicas y conformidad de 15 puntos",
        roles: ["JEFE_PROCESO", "MECANICO", "ELECTRICISTA", "INSPECTOR", "ADMINISTRATIVO"],
      },
      {
        name: "Control de Llantas",
        href: "/control_llantas",
        icon: "🛞",
        description: "Profundidad de cocada, presiones y reencauche",
        roles: ["JEFE_PROCESO", "MECANICO", "ELECTRICISTA", "INSPECTOR", "ADMINISTRATIVO"],
      },
    ],
  },
  {
    id: "administracion",
    title: "Módulo Administrativo",
    description: "Cálculo financiero de CKV, análisis de indicadores IUV y plan de sustitución vehicular.",
    icon: "💰",
    gradient: "from-amber-500/10 to-orange-500/5 hover:border-amber-500/40 hover:from-amber-500/20",
    hoverGradient: "border-amber-500/30",
    roles: ["JEFE_PROCESO", "ADMINISTRATIVO", "ANALISTA"],
    tasks: [
      {
        name: "Costos Fijos y Variables",
        href: "/control_costos/costos-fijo-variable",
        icon: "💰",
        description: "Registro de costos prorrateables del área y amortización",
        roles: ["JEFE_PROCESO", "ADMINISTRATIVO"],
      },
      {
        name: "Reportes KPI (CKV/IUV)",
        href: "/control_costos/reportes-kpi",
        icon: "📈",
        description: "Análisis de Costo por Kilómetro e Índice de Utilización",
        roles: ["JEFE_PROCESO", "ADMINISTRATIVO", "ANALISTA"],
      },
      {
        name: "Sustitución Vehicular",
        href: "/control_costos/sustitucion",
        icon: "🔄",
        description: "Estudio de vida útil óptima y punto de reemplazo",
        roles: ["JEFE_PROCESO", "ADMINISTRATIVO"],
      },
      {
        name: "Configuración de Metas",
        href: "/configuracion",
        icon: "⚙️",
        description: "Configuración de metas de la flota, KPIs y límites (Settings)",
        roles: ["JEFE_PROCESO", "ADMINISTRATIVO"],
      },
    ],
  },
];

export default function Home() {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userRole = user?.rol || "ADMINISTRATIVO";

  // Cerrar el dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filtrar módulos y tareas según el rol
  const accessibleModules = MODULES.map((mod) => {
    const accessibleTasks = mod.tasks.filter((task) => task.roles.includes(userRole));
    return {
      ...mod,
      tasks: accessibleTasks,
    };
  }).filter((mod) => mod.roles.includes(userRole) && mod.tasks.length > 0);

  const activeModule = accessibleModules.find((m) => m.id === selectedModuleId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-[-25%] left-[-20%] w-[70%] h-[70%] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-20%] w-[70%] h-[70%] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />

      {/* HEADER SIMPLE */}
      <header className="h-20 border-b border-slate-900 bg-slate-900/40 backdrop-blur-md px-6 flex items-center justify-between z-45 relative">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🚛</span>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">SAF ERP</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Manual F1T02 Digital</p>
          </div>
        </div>

        {/* PERFIL ESQUINA DERECHA */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-3 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full transition duration-150 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-sm">
              👨‍✈️
            </div>
            <div className="hidden sm:block text-left pr-1">
              <p className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider">{userRole}</p>
              <p className="text-xs font-bold text-white truncate max-w-[130px]">
                {user ? `${user.nombre} ${user.apellido}` : "Cargando..."}
              </p>
            </div>
            <span className="text-xs text-slate-500">▼</span>
          </button>

          {/* DROPDOWN MENU */}
          {profileOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              <div className="border-b border-slate-800/80 pb-3">
                <p className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">{userRole}</p>
                <p className="font-bold text-white text-sm">
                  {user ? `${user.nombre} ${user.apellido}` : "Cargando..."}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {user?.email}
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Detalles de Operación</div>
                <div className="text-xs text-slate-300 flex justify-between py-1">
                  <span>Licencia:</span>
                  <span className="font-mono text-white">{user?.licenciaConducir || "N/A"}</span>
                </div>
                <div className="text-xs text-slate-300 flex justify-between py-1">
                  <span>Estado:</span>
                  <span className="text-emerald-400 font-bold">ACTIVO</span>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold rounded-xl transition duration-150 text-xs flex items-center justify-center space-x-2"
              >
                <span>🚪</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* CONTENIDO DINÁMICO */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-12 relative z-10 max-w-6xl mx-auto w-full">
        {!activeModule ? (
          /* VISTA 1: SELECCIONAR MÓDULOS (BOTONES COMPLETOS) */
          <div className="w-full space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest">
                Panel Central
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
                Selección de Módulo SAF
              </h2>
              <p className="text-sm text-slate-450">
                Bienvenido. Por favor selecciona uno de los módulos de la administración de flotas autorizados para tu rol actual.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {accessibleModules.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => setSelectedModuleId(mod.id)}
                  className={`bg-gradient-to-b ${mod.gradient} border border-slate-800/80 rounded-3xl p-8 transition duration-300 shadow-xl flex flex-col space-y-5 text-left w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-emerald-500/30 group`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-4xl p-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner group-hover:scale-105 transition duration-300">
                      {mod.icon}
                    </span>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">ENTRAR →</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-emerald-400 transition">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-normal">
                      {mod.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* VISTA 2: PANTALLA LIMPIA DE TAREAS DEL MÓDULO */
          <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* BOTÓN VOLVER */}
            <div>
              <button
                onClick={() => setSelectedModuleId(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white rounded-xl text-xs font-bold transition duration-150 flex items-center space-x-2"
              >
                <span>←</span>
                <span>Volver a Módulos</span>
              </button>
            </div>

            <div className="border-b border-slate-900 pb-6 space-y-3">
              <div className="flex items-center space-x-3 text-slate-400">
                <span className="text-3xl">{activeModule.icon}</span>
                <h2 className="text-2xl font-black text-white tracking-tight">{activeModule.title}</h2>
              </div>
              <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
                {activeModule.description}
              </p>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Tareas y Formularios Autorizados
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {activeModule.tasks.map((task) => (
                  <Link
                    key={task.href}
                    href={task.href}
                    className="bg-slate-900/60 hover:bg-slate-850 border border-slate-800/60 hover:border-slate-700 rounded-3xl p-5 hover:shadow-xl transition duration-150 flex flex-col space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl p-2 bg-slate-950 rounded-xl border border-slate-850">{task.icon}</span>
                      <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider group-hover:translate-x-1 transition duration-150">
                        IR →
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
                        {task.name}
                      </h4>
                      <p className="text-xs text-slate-450 leading-relaxed mt-1">
                        {task.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER SIMPLE */}
      <footer className="h-16 border-t border-slate-900 flex items-center justify-center text-[10px] text-slate-500">
        © 2026 Sistema de Administración de Flotas SAF • EPS • Todos los derechos reservados.
      </footer>
    </div>
  );
}
