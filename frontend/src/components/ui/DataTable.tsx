"use client";

import React, { useState } from "react";

export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
  newActionLabel?: string;
  onNewAction?: () => void;
  showViewSummary?: boolean; // Habilitado por defecto
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  searchPlaceholder = "Buscar...",
  searchKey,
  newActionLabel,
  onNewAction,
  showViewSummary = true,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState<T | null>(null);
  const itemsPerPage = 5;

  // Filtrado de datos por el campo de búsqueda
  const filteredData = data.filter((item) => {
    if (!searchTerm || !searchKey) return true;
    const value = item[searchKey];
    if (typeof value === "string") {
      return value.toLowerCase().includes(searchTerm.toLowerCase());
    }
    if (typeof value === "number") {
      return value.toString().includes(searchTerm);
    }
    return true;
  });

  // Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Descargar como JSON
  const downloadJSON = (row: T) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(row, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `saf_registro_${row.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Descargar como TXT formateado
  const downloadTXT = (row: T) => {
    let textContent = `==================================================\n`;
    textContent += `         SAF ERP - FICHA DE RESUMEN DETALLADA\n`;
    textContent += `==================================================\n\n`;
    textContent += `ID Registro  : ${row.id}\n`;
    textContent += `Generado el  : ${new Date().toLocaleString()}\n`;
    textContent += `--------------------------------------------------\n\n`;

    Object.entries(row).forEach(([key, val]) => {
      if (key !== "id" && val !== null && val !== undefined) {
        const title = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        
        let formattedVal = val;
        if (typeof val === "object") {
          formattedVal = JSON.stringify(val);
        } else if (typeof val === "boolean") {
          formattedVal = val ? "SÍ" : "NO";
        }
        textContent += `${title.padEnd(20)}: ${formattedVal}\n`;
      }
    });

    textContent += `\n==================================================\n`;
    textContent += `Manual de Administración de Flotas - EPS\n`;

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `saf_resumen_${row.id}.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-slate-100">
      {/* Controles superiores (Buscador y botón de acción) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {searchKey && (
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Resetear a primera página
              }}
              placeholder={searchPlaceholder}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-300 focus:outline-none transition duration-150"
            />
          </div>
        )}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          {newActionLabel && onNewAction && (
            <button
              onClick={onNewAction}
              className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition duration-150 shadow-md"
            >
              ＋ {newActionLabel}
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className={`pb-3 px-4 ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
              {showViewSummary && <th className="pb-3 px-4 text-right">Detalle</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850 text-sm">
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-850/50 transition duration-150"
                >
                  {columns.map((col, cIdx) => {
                    const content =
                      typeof col.accessorKey === "function"
                        ? col.accessorKey(row)
                        : (row[col.accessorKey] as React.ReactNode);
                    return (
                      <td key={cIdx} className={`py-4 px-4 ${col.className || ""}`}>
                        {content}
                      </td>
                    );
                  })}
                  {showViewSummary && (
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedRow(row)}
                        className="px-2.5 py-1 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-750 text-emerald-400 hover:text-emerald-300 font-semibold rounded-lg text-xs transition cursor-pointer"
                      >
                        👁️ Ver Ficha
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (showViewSummary ? 1 : 0)}
                  className="py-8 text-center text-sm text-slate-500"
                >
                  No se encontraron registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
        <div>
          Mostrando {Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1)} a{" "}
          {Math.min(filteredData.length, currentPage * itemsPerPage)} de {filteredData.length}{" "}
          registros
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 transition duration-150"
          >
            Anterior
          </button>
          <span className="font-medium text-slate-300">
            Pág. {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 transition duration-150"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* MODAL DETALLES DEL REGISTRO */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setSelectedRow(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div>
              <h3 className="text-lg font-bold text-emerald-400 flex items-center space-x-2">
                <span>📋</span>
                <span>Ficha de Resumen del Registro</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                SAF ERP - Manual Técnico F1T02
              </p>
            </div>

            <div className="max-h-[50vh] overflow-y-auto space-y-3 bg-slate-950 p-4 border border-slate-850 rounded-2xl">
              <div className="text-xs border-b border-slate-850 pb-2 flex justify-between font-mono">
                <span className="text-slate-500">ID Registro:</span>
                <span className="text-white font-bold">{selectedRow.id}</span>
              </div>
              
              {Object.entries(selectedRow).map(([key, val]) => {
                if (key === "id" || val === null || val === undefined) return null;
                const fieldLabel = key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase());

                let displayVal = val;
                if (typeof val === "object") {
                  displayVal = JSON.stringify(val);
                } else if (typeof val === "boolean") {
                  displayVal = val ? "Sí" : "No";
                }

                return (
                  <div key={key} className="text-xs flex flex-col space-y-0.5 border-b border-slate-900/50 pb-1.5">
                    <span className="text-slate-450 font-semibold">{fieldLabel}</span>
                    <span className="text-slate-100 font-medium">{displayVal}</span>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => downloadTXT(selectedRow)}
                className="py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition duration-150 flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>📄</span>
                <span>Descargar Ficha (TXT)</span>
              </button>
              <button
                onClick={() => downloadJSON(selectedRow)}
                className="py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition duration-150 flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>💾</span>
                <span>Descargar Datos (JSON)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
