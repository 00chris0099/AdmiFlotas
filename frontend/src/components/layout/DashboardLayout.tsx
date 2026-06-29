"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";
import Icon from "../ui/Icon";
import ThemeToggle from "../ui/ThemeToggle";

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
        icon: "clipboard",
        roles: ["JEFE_PROCESO", "CONDUCTOR", "INSPECTOR", "ANALISTA", "ADMINISTRATIVO"],
      },
      {
        name: "Control Combustible",
        href: "/control_combustible",
        icon: "fuel",
        roles: ["JEFE_PROCESO", "CONDUCTOR", "INSPECTOR", "ANALISTA", "ADMINISTRATIVO"],
      },
      {
        name: "Conductores Activos",
        href: "/conductores",
        icon: "driver",
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
        icon: "wrench",
        roles: ["JEFE_PROCESO", "MECANICO", "ELECTRICISTA", "ADMINISTRATIVO"],
      },
      {
        name: "Checklists Control",
        href: "/movimientos_diarios/checklist",
        icon: "checklist",
        roles: ["JEFE_PROCESO", "MECANICO", "ELECTRICISTA", "INSPECTOR", "ADMINISTRATIVO"],
      },
      {
        name: "Control de Llantas",
        href: "/control_llantas",
        icon: "tire",
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
        icon: "money",
        roles: ["JEFE_PROCESO", "ADMINISTRATIVO"],
      },
      {
        name: "Reportes KPI (CKV/IUV)",
        href: "/control_costos/reportes-kpi",
        icon: "chart",
        roles: ["JEFE_PROCESO", "ADMINISTRATIVO", "ANALISTA"],
      },
      {
        name: "Sustitución Vehicular",
        href: "/control_costos/sustitucion",
        icon: "swap",
        roles: ["JEFE_PROCESO", "ADMINISTRATIVO"],
      },
      {
        name: "Configuración de Metas",
        href: "/configuracion",
        icon: "settings",
        roles: ["JEFE_PROCESO", "ADMINISTRATIVO"],
      },
    ],
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const userRole = user?.rol || "ADMINISTRATIVO";

  // Cerrar menús al hacer click afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filtrar secciones de navegación por el rol del usuario
  const filteredSections = MENU_SECTIONS.map((section) => {
    const matchedItems = section.items.filter((item) => item.roles.includes(userRole));
    return {
      ...section,
      items: matchedItems,
    };
  }).filter((section) => section.items.length > 0);

  // Si estamos en la página de login o en la raíz (que tiene su propio selector limpio y encabezado), retornar children directamente
  if (pathname === "/login" || pathname === "/" || pathname === "/unauthorized") {
    return <div className="min-h-screen bg-slate-950 text-slate-100">{children}</div>;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* CABECERA PRINCIPAL CON NAVEGACIÓN HOVER */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-40 relative">
        {/* LOGO */}
        <Link href="/" className="flex items-center space-x-3 cursor-pointer">
          <span className="text-2xl"><Icon name="truck" size={28} /></span>
          <div>
            <h1 className="font-bold text-sm text-emerald-400 tracking-tight">SAF ERP</h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Manual F1T02</p>
          </div>
        </Link>

        {/* NAVEGACIÓN FLOTANTE (HOVER DE MÓDULOS) */}
        <div 
          className="relative h-full flex items-center"
          ref={navRef}
          onMouseEnter={() => setNavOpen(true)}
          onMouseLeave={() => setNavOpen(false)}
        >
          <button
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition duration-150 flex items-center space-x-2 ${
              navOpen 
                ? "bg-slate-800 border-emerald-500/30 text-emerald-400" 
                : "bg-slate-950/40 border-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <Icon name="folder" size={14} />
            <span>Navegar Módulos</span>
            <span className="text-[10px] text-slate-500">▼</span>
          </button>

          {/* FLYOUT MENU (PANEL FLOTANTE CON TODAS LAS TAREAS DE LOS MÓDULOS) */}
          {navOpen && (
            <div 
              className="absolute left-1/2 -translate-x-1/2 top-14 w-[750px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 grid grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
              onMouseEnter={() => setNavOpen(true)}
            >
              {filteredSections.map((section, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1.5">
                    {section.title}
                  </h3>
                  <ul className="space-y-1.5">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setNavOpen(false)}
                            className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition duration-150 ${
                              isActive
                                ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500"
                                : "hover:bg-slate-800 hover:text-white text-slate-300"
                            }`}
                          >
                            <span><Icon name={item.icon} size={16} /></span>
                            <span className="truncate">{item.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* THEME TOGGLE */}
        <ThemeToggle />

        {/* PERFIL ESQUINA DERECHA */}
        <div className="relative h-full flex items-center" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-3 px-3 py-1.5 bg-slate-950/40 hover:bg-slate-800 border border-slate-800 rounded-full transition duration-150 focus:outline-none"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs">
              <Icon name="pilot" size={16} />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[10px] font-bold text-white leading-none">
                {user ? `${user.nombre} ${user.apellido}` : "Cargando..."}
              </p>
            </div>
            <span className="text-[10px] text-slate-500">▼</span>
          </button>

          {/* DROPDOWN PERFIL */}
          {profileOpen && (
            <div className="absolute right-0 top-14 w-60 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="border-b border-slate-800/80 pb-2">
                <p className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider">{userRole}</p>
                <p className="font-bold text-white text-xs">
                  {user ? `${user.nombre} ${user.apellido}` : "Cargando..."}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                }}
                className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold rounded-xl transition duration-150 text-xs flex items-center justify-center space-x-2"
              >
                <Icon name="logout" size={14} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* CUERPO PRINCIPAL (100% DE LA PANTALLA) */}
      <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
        <div className="max-w-7xl mx-auto w-full h-full">
          {children}
        </div>
      </main>
    </div>
  );
};
