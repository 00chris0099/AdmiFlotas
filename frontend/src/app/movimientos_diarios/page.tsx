"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";

interface MovimientoDiario {
  id: string;
  vehiculo: string;
  placa: string;
  vehiculoId: string;
  conductor: string;
  fecha: string;
  destino: string;
  kilometrajeSalida: number;
  kilometrajeLlegada: number | null;
  horasUtilizacion: number | null;
  estado: "EN_RUTA" | "COMPLETADO" | "CANCELADO";
}

interface DbVehiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  codigoPatrimonial: string;
}

interface DbConductor {
  id: string;
  nombre: string;
  apellido: string;
  vencimientoLicencia: string | null;
  licenciaConducir: string | null;
}

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState<MovimientoDiario[]>([]);
  const [vehiculos, setVehiculos] = useState<DbVehiculo[]>([]);
  const [conductores, setConductores] = useState<DbConductor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Estados del Formulario
  const [vehiculoId, setVehiculoId] = useState("");
  const [conductorId, setConductorId] = useState("");
  const [destino, setDestino] = useState("Sector Industrial");
  const [sectorSolicitante, setSectorSolicitante] = useState("Logística");
  const [kilometrajeSalida, setKilometrajeSalida] = useState("10500");
  const [horaSalida, setHoraSalida] = useState("08:00");

  // 15 Puntos Checklist
  const [documentos, setDocumentos] = useState("OK");
  const [aceiteMotor, setAceiteMotor] = useState("OK");
  const [agua, setAgua] = useState("OK");
  const [bateria, setBateria] = useState("OK");
  const [frenos, setFrenos] = useState("OK");
  const [embrague, setEmbrague] = useState("OK");
  const [fajas, setFajas] = useState("OK");
  const [faros, setFaros] = useState("OK");
  const [lunas, setLunas] = useState("OK");
  const [plumillas, setPlumillas] = useState("OK");
  const [llantas, setLlantas] = useState("OK");
  const [espejos, setEspejos] = useState("OK");
  const [herramientas, setHerramientas] = useState("OK");
  const [extintorBotiquin, setExtintorBotiquin] = useState("OK");
  const [manchasFugas, setManchasFugas] = useState("OK");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const conductorSeleccionado = conductores.find((c) => c.id === conductorId);
  const isLicenciaVencida = conductorSeleccionado?.vencimientoLicencia 
    ? new Date(conductorSeleccionado.vencimientoLicencia) < new Date()
    : false;

  const cargarCatalogos = async () => {
    try {
      const [resVeh, resCond] = await Promise.all([
        fetch("/api/vehiculos"),
        fetch("/api/conductores")
      ]);
      const dataVeh = await resVeh.json();
      const dataCond = await resCond.json();
      
      if (Array.isArray(dataVeh)) {
        setVehiculos(dataVeh);
        if (dataVeh.length > 0) setVehiculoId(dataVeh[0].id);
      }
      if (Array.isArray(dataCond)) {
        setConductores(dataCond);
        if (dataCond.length > 0) setConductorId(dataCond[0].id);
      }
    } catch (err) {
      console.error("Error al cargar catálogos:", err);
    }
  };

  const cargarMovimientos = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/movimientos_diarios");
      const data = await res.json();
      if (Array.isArray(data)) {
        setMovimientos(data);
      }
    } catch (err) {
      console.error("Error al cargar movimientos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarCatalogos();
    cargarMovimientos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLicenciaVencida) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/movimientos_diarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehiculoId,
          conductorId,
          fecha: new Date().toISOString(),
          sectorSolicitante,
          destino,
          kilometrajeSalida: parseInt(kilometrajeSalida),
          horaSalida,
          documentos,
          aceiteMotor,
          agua,
          bateria,
          frenos,
          embrague,
          fajas,
          faros,
          lunas,
          plumillas,
          llantas,
          espejos,
          herramientas,
          extintorBotiquin,
          manchasFugas,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        cargarMovimientos();
        alert("¡Movimiento registrado con éxito!");
      } else {
        alert("Error: " + data.error);
      }
    } catch (err: any) {
      alert("Error de red: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<MovimientoDiario>[] = [
    {
      header: "ID Movimiento",
      accessorKey: (row) => row.id.substring(0, 8).toUpperCase(),
      className: "font-mono text-indigo-400 font-semibold",
    },
    {
      header: "Vehículo",
      accessorKey: (row) => (
        <div>
          <div className="font-semibold text-white">{row.placa}</div>
          <div className="text-xs text-slate-450">{row.vehiculo}</div>
        </div>
      ),
    },
    { header: "Conductor", accessorKey: "conductor" },
    { header: "Destino", accessorKey: "destino", className: "text-slate-350" },
    { header: "Km Salida", accessorKey: (row) => `${row.kilometrajeSalida} km`, className: "font-mono" },
    { header: "HUV", accessorKey: (row) => (row.horasUtilizacion ? `${row.horasUtilizacion} hrs` : "-"), className: "font-mono" },
    {
      header: "Estado",
      className: "text-right",
      accessorKey: (row) => {
        const colors = {
          EN_RUTA: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          COMPLETADO: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          CANCELADO: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          PROGRAMADO: "bg-slate-500/10 text-slate-450 border-slate-500/20",
        };
        return (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[row.estado] || colors.EN_RUTA}`}>
            {row.estado}
          </span>
        );
      },
    },
  ];

  const checklistItems = [
    { label: "1. Documentación (SOAT/Licencias)", state: documentos, setState: setDocumentos },
    { label: "2. Nivel de Aceite de Motor", state: aceiteMotor, setState: setAceiteMotor },
    { label: "3. Nivel de Agua (Radiador)", state: agua, setState: setAgua },
    { label: "4. Batería (Electrolito/Bornes)", state: bateria, setState: setBateria },
    { label: "5. Sistema de Frenos", state: frenos, setState: setFrenos },
    { label: "6. Embrague (Accionamiento)", state: embrague, setState: setEmbrague },
    { label: "7. Faja del Ventilador/Alternador", state: fajas, setState: setFajas },
    { label: "8. Faros y Luces del Tablero", state: faros, setState: setFaros },
    { label: "9. Lunas y Parabrisas", state: lunas, setState: setLunas },
    { label: "10. Plumillas Limpiaparabrisas", state: plumillas, setState: setPlumillas },
    { label: "11. Estado y Presión de Llantas", state: llantas, setState: setLlantas },
    { label: "12. Espejos Retrovisores", state: espejos, setState: setEspejos },
    { label: "13. Herramientas de Emergencia", state: herramientas, setState: setHerramientas },
    { label: "14. Extintor y Botiquín", state: extintorBotiquin, setState: setExtintorBotiquin },
    { label: "15. Fugas (Manchas en Estacionamiento)", state: manchasFugas, setState: setManchasFugas },
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
        <h2 className="text-2xl font-bold text-white">Movimientos Diarios</h2>
        <p className="text-xs text-slate-450">
          Registro diario de odómetro, checklist pre-operacional e indicadores de HUV (MA 122 01 01)
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-450 text-sm">Cargando movimientos reales de Supabase...</div>
      ) : (
        <DataTable
          data={movimientos}
          columns={columns}
          searchKey="conductor"
          searchPlaceholder="Buscar por conductor..."
          newActionLabel="Registrar Movimiento"
          onNewAction={() => setModalOpen(true)}
        />
      )}

      {/* MODAL DE REGISTRO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-455 hover:text-white font-bold"
            >
              ✕
            </button>

            <div>
              <h3 className="text-lg font-bold text-indigo-400">Registrar Movimiento Diario</h3>
              <p className="text-xs text-slate-450">Formulario MA 122 01 01 (Checklist completo de 15 puntos)</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Vehículo</label>
                  <select
                    value={vehiculoId}
                    onChange={(e) => setVehiculoId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    required
                  >
                    {vehiculos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.placa} ({v.marca} {v.modelo})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Conductor</label>
                  <select
                    value={conductorId}
                    onChange={(e) => setConductorId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    required
                  >
                    {conductores.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} {c.apellido}
                      </option>
                    ))}
                  </select>
                  {isLicenciaVencida && (
                    <p className="text-[9px] text-rose-400 font-bold mt-1">
                      ⚠ LICENCIA VENCIDA (Bloqueado)
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Km Salida</label>
                  <input
                    type="number"
                    value={kilometrajeSalida}
                    onChange={(e) => setKilometrajeSalida(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Hora Salida</label>
                  <input
                    type="text"
                    value={horaSalida}
                    onChange={(e) => setHoraSalida(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Destino</label>
                  <input
                    type="text"
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Sector Solicitante</label>
                  <input
                    type="text"
                    value={sectorSolicitante}
                    onChange={(e) => setSectorSolicitante(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Checklist de 15 Puntos */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <span className="text-[10px] font-bold text-indigo-400 uppercase block tracking-wider">Auditoría Pre-operativa de 15 Puntos (F1T02)</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 max-h-[260px] overflow-y-auto bg-slate-950 p-4 border border-slate-850 rounded-xl">
                  {checklistItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs border-b border-slate-900 pb-1">
                      <span className="text-slate-300 truncate max-w-[170px]">{item.label}</span>
                      <select
                        value={item.state}
                        onChange={(e) => item.setState(e.target.value)}
                        className={`bg-slate-900 border rounded px-1.5 py-0.5 text-[10px] focus:outline-none ${
                          item.state === "FALLADO" 
                            ? "border-rose-500 text-rose-450" 
                            : item.state === "OBSERVADO" 
                              ? "border-amber-500 text-amber-450" 
                              : "border-slate-800 text-slate-300"
                        }`}
                      >
                        <option value="OK">OK</option>
                        <option value="OBSERVADO">OBS</option>
                        <option value="FALLADO">FALLA</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLicenciaVencida}
                className="w-full py-3 bg-indigo-650 hover:bg-indigo-600 disabled:bg-slate-800 text-white font-bold rounded-xl transition duration-150 shadow-lg text-xs cursor-pointer"
              >
                {isSubmitting 
                  ? "Guardando en Supabase..." 
                  : isLicenciaVencida 
                    ? "Bloqueado: Conductor Inhabilitado" 
                    : "Confirmar y Iniciar Viaje"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
