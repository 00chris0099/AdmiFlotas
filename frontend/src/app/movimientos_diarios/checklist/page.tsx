"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import api from "@/lib/api";

interface ChecklistItem {
  id: string;
  movimientoId: string;
  placa: string;
  inspector: string;
  fecha: string;
  aptoParaOperar: boolean;
  documentos: "OK" | "OBSERVADO" | "FALLADO";
  frenos: "OK" | "OBSERVADO" | "FALLADO";
  llantas: "OK" | "OBSERVADO" | "FALLADO";
}

export default function ChecklistPage() {
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cargarChecklists = async () => {
    try {
      setIsLoading(true);
      const data = await api.getChecklists();
      if (Array.isArray(data)) {
        setChecklists(data);
      }
    } catch (err) {
      console.error("Error al cargar checklists:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarChecklists();
  }, []);

  const columns: ColumnDef<ChecklistItem>[] = [
    { header: "ID Checklist", accessorKey: "id", className: "font-mono text-emerald-400 font-semibold" },
    { header: "Vehículo", accessorKey: "placa" },
    { header: "Inspector", accessorKey: "inspector" },
    { header: "Fecha Registro", accessorKey: "fecha" },
    { header: "Doc. Ficha", accessorKey: "documentos" },
    { header: "Frenos", accessorKey: "frenos" },
    { header: "Llantas", accessorKey: "llantas" },
    {
      header: "Estado Operación",
      className: "text-right",
      accessorKey: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
          row.aptoParaOperar
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
        }`}>
          {row.aptoParaOperar ? "Apto" : "No Apto"}
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
        <h2 className="text-2xl font-bold text-white">Checklists de Verificación Pre-Operacional</h2>
        <p className="text-xs text-slate-400">Inspección de 15 puntos críticos del vehículo antes de la salida (F1T02 — MA 122 01 01)</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Cargando checklists...</div>
      ) : (
        <DataTable
          data={checklists}
          columns={columns}
          searchKey="placa"
          searchPlaceholder="Buscar por placa..."
          newActionLabel="Auditar Vehículo"
          onNewAction={() => alert("El checklist pre-operacional se genera automáticamente al iniciar un Movimiento Diario.")}
        />
      )}
    </div>
  );
}
