"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import Icon from "@/components/ui/Icon";

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

interface KPI {
  label: string;
  value: string;
  icon: string;
  color: string;
  bgColor: string;
}

interface ActivityItem {
  label: string;
  detail: string;
  time: string;
  type: "movimiento" | "combustible" | "mantenimiento";
}

interface AlertItem {
  message: string;
  severity: "high" | "medium" | "low";
  type: "documento" | "mantenimiento" | "stock";
}

const MODULES: ModuleData[] = [
  {
    id: "flota",
    title: "Módulo Flota",
    description: "Inventario de vehículos con ficha técnica patrimonial completa (Diagrama 3 F1T02).",
    icon: "🚛",
    gradient: "from-cyan-500/10 to-sky-500/5 hover:border-cyan-500/40 hover:from-cyan-500/20",
    hoverGradient: "border-cyan-500/30",
    roles: ["JEFE_PROCESO", "ADMINISTRATIVO", "ANALISTA"],
    tasks: [
      {
        name: "Inventario de Flota",
        href: "/vehiculos",
    icon: "truck",
        description: "Ficha técnica patrimonial y estado de cada vehículo",
        roles: ["JEFE_PROCESO", "ADMINISTRATIVO", "ANALISTA"],
      },
    ],
  },
  {
    id: "operaciones",
    title: "Módulo Operaciones",
    description: "Registro de movimientos diarios (MA 122 01 01), combustibles (MA 122 01 02) y conductores.",
    icon: "clipboard",
    gradient: "from-emerald-500/10 to-teal-500/5 hover:border-emerald-500/40 hover:from-emerald-500/20",
    hoverGradient: "border-emerald-500/30",
    roles: ["JEFE_PROCESO", "CONDUCTOR", "INSPECTOR", "ANALISTA", "ADMINISTRATIVO"],
    tasks: [
      {
        name: "Movimientos Diarios",
        href: "/movimientos_diarios",
        icon: "clipboard",
        description: "Control pre-operacional and HUV diario (MA 122 01 01)",
        roles: ["JEFE_PROCESO", "CONDUCTOR", "INSPECTOR", "ANALISTA", "ADMINISTRATIVO"],
      },
      {
        name: "Control Combustible",
        href: "/control_combustible",
        icon: "fuel",
        description: "Órdenes de abastecimiento y lubricantes (MA 122 01 02)",
        roles: ["JEFE_PROCESO", "CONDUCTOR", "INSPECTOR", "ANALISTA", "ADMINISTRATIVO"],
      },
      {
        name: "Conductores Activos",
        href: "/conductores",
        icon: "driver",
        description: "Licencias, categorías y asignación de flota",
        roles: ["JEFE_PROCESO", "ANALISTA", "ADMINISTRATIVO", "INSPECTOR"],
      },
    ],
  },
  {
    id: "mantenimiento",
    title: "Módulo Mantenimiento",
    description: "Gestión de Órdenes de Servicio (MA 122 02 01), inspecciones de 15 puntos y control de llantas.",
    icon: "wrench",
    gradient: "from-blue-500/10 to-indigo-500/5 hover:border-blue-500/40 hover:from-blue-500/20",
    hoverGradient: "border-blue-500/30",
    roles: ["JEFE_PROCESO", "MECANICO", "ELECTRICISTA", "INSPECTOR", "ADMINISTRATIVO"],
    tasks: [
      {
        name: "Órdenes de Servicio",
        href: "/control_mantenimiento",
        icon: "wrench",
        description: "Preventivo, correctivo y repuestos de almacén (MA 122 02 01)",
        roles: ["JEFE_PROCESO", "MECANICO", "ELECTRICISTA", "ADMINISTRATIVO"],
      },
      {
        name: "Checklists Control",
        href: "/movimientos_diarios/checklist",
        icon: "checklist",
        description: "Inspecciones técnicas y conformidad de 15 puntos",
        roles: ["JEFE_PROCESO", "MECANICO", "ELECTRICISTA", "INSPECTOR", "ADMINISTRATIVO"],
      },
      {
        name: "Control de Llantas",
        href: "/control_llantas",
        icon: "tire",
        description: "Profundidad de cocada, presiones y reencauche",
        roles: ["JEFE_PROCESO", "MECANICO", "ELECTRICISTA", "INSPECTOR", "ADMINISTRATIVO"],
      },
    ],
  },
  {
    id: "administracion",
    title: "Módulo Administrativo",
    description: "Cálculo financiero de CKV, análisis de indicadores IUV y plan de sustitución vehicular.",
    icon: "money",
    gradient: "from-amber-500/10 to-orange-500/5 hover:border-amber-500/40 hover:from-amber-500/20",
    hoverGradient: "border-amber-500/30",
    roles: ["JEFE_PROCESO", "ADMINISTRATIVO", "ANALISTA"],
    tasks: [
      {
        name: "Costos Fijos y Variables",
        href: "/control_costos/costos-fijo-variable",
        icon: "money",
        description: "Registro de costos prorrateables del área y amortización",
        roles: ["JEFE_PROCESO", "ADMINISTRATIVO"],
      },
      {
        name: "Reportes KPI (CKV/IUV)",
        href: "/control_costos/reportes-kpi",
        icon: "chart",
        description: "Análisis de Costo por Kilómetro e Índice de Utilización",
        roles: ["JEFE_PROCESO", "ADMINISTRATIVO", "ANALISTA"],
      },
      {
        name: "Sustitución Vehicular",
        href: "/control_costos/sustitucion",
        icon: "swap",
        description: "Estudio de vida útil óptima y punto de reemplazo",
        roles: ["JEFE_PROCESO", "ADMINISTRATIVO"],
      },
      {
        name: "Configuración de Metas",
        href: "/configuracion",
        icon: "settings",
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
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const userRole = user?.rol || "ADMINISTRATIVO";

  useEffect(() => {
    if (selectedModuleId || !user) return;
    async function loadDashboard() {
      setDashboardLoading(true);
      try {
        const [vehiculosRes, movimientosRes, mantenimientoRes, combustibleRes, documentosRes, almacenRes] =
          await Promise.all([
            fetchWithAuth("/api/vehiculos"),
            fetchWithAuth("/api/movimientos_diarios"),
            fetchWithAuth("/api/control_mantenimiento"),
            fetchWithAuth("/api/control_combustible"),
            fetchWithAuth("/api/flota/documentos"),
            fetchWithAuth("/api/mantenimiento/almacen").catch(() => null),
          ]);

        const vehiculos = vehiculosRes.ok ? await vehiculosRes.json() : [];
        const movimientos = movimientosRes.ok ? await movimientosRes.json() : [];
        const ordenesMant = mantenimientoRes.ok ? await mantenimientoRes.json() : [];
        const ordenesComb = combustibleRes.ok ? await combustibleRes.json() : [];
        const documentos = documentosRes.ok ? await documentosRes.json() : [];
        const repuestos = almacenRes && almacenRes.ok ? await almacenRes.json() : [];

        const today = new Date().toISOString().split("T")[0];
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const activosHoy = movimientos.filter(
          (m: any) => m.fecha === today && m.estado === "EN_RUTA"
        ).length;

        const ordenesPendientes = ordenesMant.filter((o: any) => o.estado === "PENDIENTE").length;

        const costoCombustibleMes = ordenesComb
          .filter((o: any) => {
            const d = new Date(o.fecha);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          })
          .reduce((sum: number, o: any) => sum + (o.costoTotal || 0), 0);

        setKpis([
          {
            label: "Vehículos en Flota",
            value: String(vehiculos.length),
            icon: "truck",
            color: "text-cyan-400",
            bgColor: "bg-cyan-500/10 border-cyan-500/20",
          },
          {
            label: "Movimientos Hoy",
            value: String(activosHoy),
            icon: "clipboard",
            color: "text-emerald-400",
            bgColor: "bg-emerald-500/10 border-emerald-500/20",
          },
          {
            label: "Órdenes Pendientes",
            value: String(ordenesPendientes),
            icon: "wrench",
            color: "text-amber-400",
            bgColor: "bg-amber-500/10 border-amber-500/20",
          },
          {
            label: "Costo Combustible (Mes)",
            value: `$${costoCombustibleMes.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: "fuel",
            color: "text-rose-400",
            bgColor: "bg-rose-500/10 border-rose-500/20",
          },
        ]);

        const recentMoves: ActivityItem[] = movimientos.slice(0, 5).map((m: any) => ({
          label: `${m.vehiculo} (${m.placa})`,
          detail: m.destino || "Sin destino",
          time: m.fecha,
          type: "movimiento" as const,
        }));

        const recentFuel: ActivityItem[] = ordenesComb.slice(0, 5).map((o: any) => ({
          label: `${o.vehiculoLabel} (${o.placa})`,
          detail: `${o.cantidadGalones || 0} gal - $${(o.costoTotal || 0).toFixed(2)}`,
          time: o.fecha,
          type: "combustible" as const,
        }));

        const recentMant: ActivityItem[] = ordenesMant.slice(0, 5).map((o: any) => ({
          label: `${o.numeroOrden} (${o.placa})`,
          detail: `${o.tipoMantenimiento} - ${o.estado}`,
          time: o.numeroOrden,
          type: "mantenimiento" as const,
        }));

        const allActivity = [...recentMoves, ...recentFuel, ...recentMant].slice(0, 10);
        setActivities(allActivity);

        const alertList: AlertItem[] = [];

        const expiredDocs = documentos.filter((d: any) => {
          if (!d.fechaVencimiento) return false;
          return new Date(d.fechaVencimiento) < now;
        });
        expiredDocs.forEach((d: any) => {
          alertList.push({
            message: `Documento vencido: ${d.tipoDocumento} - ${d.vehiculo?.placa || "N/A"}`,
            severity: "high",
            type: "documento",
          });
        });

        const overdueMant = ordenesMant.filter(
          (o: any) => o.estado === "PENDIENTE" && o.tipoMantenimiento === "PREVENTIVO"
        );
        overdueMant.slice(0, 5).forEach((o: any) => {
          alertList.push({
            message: `Mantenimiento preventivo pendiente: ${o.numeroOrden} (${o.placa})`,
            severity: "medium",
            type: "mantenimiento",
          });
        });

        const lowStock = repuestos.filter(
          (r: any) => r.estadoStock === "BAJO" || r.estadoStock === "AGOTADO"
        );
        lowStock.slice(0, 5).forEach((r: any) => {
          alertList.push({
            message: `Stock ${r.estadoStock === "AGOTADO" ? "agotado" : "bajo"}: ${r.descripcion} (${r.codigo})`,
            severity: r.estadoStock === "AGOTADO" ? "high" : "low",
            type: "stock",
          });
        });

        setAlerts(alertList.slice(0, 8));
      } catch (err) {
        console.error("Error cargando dashboard:", err);
      } finally {
        setDashboardLoading(false);
      }
    }
    loadDashboard();
  }, [selectedModuleId, user]);

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
          <span className="text-3xl"><Icon name="truck" size={36} /></span>
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
              <Icon name="pilot" size={18} />
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
                <Icon name="logout" size={14} />
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

            {/* KPI CARDS */}
            {kpis.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                {kpis.map((kpi) => (
                  <div
                    key={kpi.label}
                    className={`${kpi.bgColor} border rounded-2xl p-5 flex items-center space-x-4 transition duration-200`}
                  >
                    <div className={`${kpi.bgColor} rounded-xl p-3`}>
                      <Icon name={kpi.icon} size={28} color="currentColor" className={kpi.color} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                      <p className={`text-2xl font-black ${kpi.color} tracking-tight`}>{kpi.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ALERTS + ACTIVITY ROW */}
            {(alerts.length > 0 || activities.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                {/* ALERTS */}
                {alerts.length > 0 && (
                  <div className="bg-slate-900/60 border border-slate-800/60 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                        <Icon name="warning" size={18} className="text-amber-400" />
                        <span>Alertas Activas</span>
                      </h3>
                      <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[10px] font-bold">
                        {alerts.length}
                      </span>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {alerts.map((alert, i) => (
                        <div
                          key={i}
                          className={`flex items-start space-x-3 p-3 rounded-xl border transition duration-150 ${
                            alert.severity === "high"
                              ? "bg-rose-500/5 border-rose-500/20"
                              : alert.severity === "medium"
                              ? "bg-amber-500/5 border-amber-500/20"
                              : "bg-slate-800/50 border-slate-700/50"
                          }`}
                        >
                          <span
                            className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                              alert.severity === "high"
                                ? "bg-rose-500"
                                : alert.severity === "medium"
                                ? "bg-amber-500"
                                : "bg-slate-500"
                            }`}
                          />
                          <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* RECENT ACTIVITY */}
                {activities.length > 0 && (
                  <div className="bg-slate-900/60 border border-slate-800/60 rounded-3xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Icon name="clipboard" size={18} className="text-emerald-400" />
                      <span>Actividad Reciente</span>
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {activities.map((act, i) => (
                        <div
                          key={i}
                          className="flex items-center space-x-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800/50"
                        >
                          <span
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              act.type === "movimiento"
                                ? "bg-emerald-500/10"
                                : act.type === "combustible"
                                ? "bg-rose-500/10"
                                : "bg-blue-500/10"
                            }`}
                          >
                            <Icon
                              name={act.type === "movimiento" ? "clipboard" : act.type === "combustible" ? "fuel" : "wrench"}
                              size={16}
                              className={
                                act.type === "movimiento"
                                  ? "text-emerald-400"
                                  : act.type === "combustible"
                                  ? "text-rose-400"
                                  : "text-blue-400"
                              }
                            />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{act.label}</p>
                            <p className="text-[10px] text-slate-400 truncate">{act.detail}</p>
                          </div>
                          <span className="text-[9px] text-slate-500 font-mono flex-shrink-0">{act.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MODULE CARDS SECTION HEADER */}
            <div className="pt-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Módulos del Sistema
              </span>
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
                        <Icon name={mod.icon} size={40} />
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
                <span className="text-3xl"><Icon name={activeModule.icon} size={32} /></span>
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
                      <span className="text-2xl p-2 bg-slate-950 rounded-xl border border-slate-850"><Icon name={task.icon} size={24} /></span>
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
