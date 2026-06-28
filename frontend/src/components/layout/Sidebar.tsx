"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";

interface MenuItem {
  name: string;
  href: string;
  icon: string;
  roles: string[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: "Módulo Operaciones",
    items: [
      {
        name: "Movimientos Diarios",
        href: "/movimientos_diarios",
        icon: "📋",
        roles: ["JEFE_PROCESO", "CONDUCTOR", "INSPECTOR", "ANALISTA", "ADMINISTRATIVO"],
      },
      {
        name: "Control Combustible",
        href: "/control_combustible",
        icon: "⛽",
        roles: ["JEFE_PROCESO", "CONDUCTOR", "INSPECTOR", "ANALISTA", "ADMINISTRATIVO"],
      },
      {
        name: "Conductores Activos",
        href: "/conductores",
        icon: "👤",
        roles: ["JEFE_PROCESO", "ANALISTA", "ADMINISTRATIVO", "INSPECTOR"],
      },
    ],
  },
  {
    title: "Módulo Mantenimiento",
    items: [
      {
        name: "Órdenes de Servicio",
        href: "/control_mantenimiento",
        icon: "🔧",
        roles: ["JEFE_PROCESO", "MECANICO", "ELECTRICISTA", "ADMINISTRATIVO"],
      },
      {
        name: "Checklists Control",
        href: "/movimientos_diarios/checklist",
        icon: "✅",
        roles: ["JEFE_PROCESO", "MECANICO", "ELECTRICISTA", "INSPECTOR", "ADMINISTRATIVO"],
      },
      {
        name: "Control de Llantas",
        href: "/control_llantas",
        icon: "🛞",
        roles: ["JEFE_PROCESO", "MECANICO", "ELECTRICISTA", "INSPECTOR", "ADMINISTRATIVO"],
      },
    ],
  },
  {
    title: "Módulo Administrativo",
    items: [
      {
        name: "Costos Fijos y Variables",
        href: "/control_costos/costos-fijo-variable",
        icon: "💰",
        roles: ["JEFE_PROCESO", "ADMINISTRATIVO"],
      },
      {
        name: "Reportes KPI (CKV/IUV)",
        href: "/control_costos/reportes-kpi",
        icon: "📈",
        roles: ["JEFE_PROCESO", "ADMINISTRATIVO", "ANALISTA"],
      },
      {
        name: "Sustitución Vehicular",
        href: "/control_costos/sustitucion",
        icon: "🔄",
        roles: ["JEFE_PROCESO", "ADMINISTRATIVO"],
      },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const userRole = user?.rol || "ADMINISTRATIVO";

  // Filtrar secciones y sus items que correspondan al rol del usuario
  const filteredSections = MENU_SECTIONS.map((section) => {
    const matchedItems = section.items.filter((item) => item.roles.includes(userRole));
    return {
      ...section,
      items: matchedItems,
    };
  }).filter((section) => section.items.length > 0);

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-300">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🚛</span>
          <div>
            <h1 className="font-bold text-base text-emerald-400 tracking-tight">SAF ERP</h1>
            <span className="text-[10px] text-slate-400">Manual F1T02 Digital</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {filteredSections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500"
                          : "hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-3">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-850">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm">
              {userRole === "JEFE_PROCESO" ? "👑" : userRole === "CONDUCTOR" ? "👨‍✈️" : "🔧"}
            </div>
            <div className="truncate max-w-[120px]">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{userRole}</p>
              <p className="text-xs font-bold text-white truncate">
                {user ? `${user.nombre} ${user.apellido}` : "Cargando..."}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Cerrar Sesión"
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition"
          >
            🚪
          </button>
        </div>
      </div>
    </aside>
  );
};
