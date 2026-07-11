"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import SearchSelect from "@/components/ui/SearchSelect";
import api from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";

interface Repuesto {
  id: string;
  codigo: string;
  descripcion: string;
  categoria: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  precioUnitario: number | null;
  estadoStock: "NORMAL" | "BAJO" | "AGOTADO";
}

interface Movimiento {
  id: string;
  repuestoId: string;
  repuestoCodigo: string;
  repuestoDescripcion: string;
  tipoMovimiento: "ENTRADA" | "SALIDA";
  cantidad: number;
  ordenMantenimientoId: string | null;
  responsable: string;
  fecha: string;
  observaciones: string | null;
}

export default function AlmacenPage() {
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalRepuestoOpen, setModalRepuestoOpen] = useState(false);
  const [modalMovimientoOpen, setModalMovimientoOpen] = useState(false);
  const [editingRepuesto, setEditingRepuesto] = useState<Repuesto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const { confirm } = useConfirm();

  // Formulario Repuesto
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("FILTROS");
  const [unidadMedida, setUnidadMedida] = useState("unidad");
  const [stockMinimo, setStockMinimo] = useState("0");
  const [precioUnitario, setPrecioUnitario] = useState("");

  // Formulario Movimiento
  const [movRepuestoId, setMovRepuestoId] = useState("");
  const [movTipo, setMovTipo] = useState("ENTRADA");
  const [movCantidad, setMovCantidad] = useState("");
  const [movResponsable, setMovResponsable] = useState("");
  const [movOrdenId, setMovOrdenId] = useState("");
  const [movObservaciones, setMovObservaciones] = useState("");

  // Órdenes de mantenimiento para SearchSelect
  const [ordenesMantenimiento, setOrdenesMantenimiento] = useState<{id: string; numeroOrden: string; placa: string}[]>([]);

  // Opciones para SearchSelect
  const repuestoOptions = useMemo(
    () => repuestos.map((r: any) => ({
      value: r.id,
      label: `${r.codigo} - ${r.descripcion} (Stock: ${r.stockActual})`,
    })),
    [repuestos]
  );

  const ordenOptions = useMemo(
    () => ordenesMantenimiento.map((o: any) => ({
      value: o.id,
      label: `${o.numeroOrden} - ${o.placa}`,
    })),
    [ordenesMantenimiento]
  );

  const cargarRepuestos = async () => {
    try {
      setIsLoading(true);
      const data = await api.getRepuestos();
      if (Array.isArray(data)) {
        setRepuestos(data);
      }
    } catch (err) {
      console.error("Error al cargar repuestos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const cargarMovimientos = async (repuestoId?: string) => {
    try {
      const data = await api.getMovimientosAlmacen(repuestoId);
      if (Array.isArray(data)) {
        setMovimientos(data);
      }
    } catch (err) {
      console.error("Error al cargar movimientos:", err);
    }
  };

  useEffect(() => {
    cargarRepuestos();
    cargarMovimientos();
    // Cargar órdenes de mantenimiento para el SearchSelect
    const cargarOrdenes = async () => {
      try {
        const data = await api.getOrdenesMantenimiento();
        const items = Array.isArray(data) ? data : data?.ordenes ?? [];
        setOrdenesMantenimiento(items);
      } catch {}
    };
    cargarOrdenes();
  }, []);

  const handleSubmitRepuesto = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: Record<string, any> = {
        codigo,
        descripcion,
        categoria,
        unidadMedida,
        stockMinimo: parseInt(stockMinimo),
        precioUnitario: precioUnitario ? parseFloat(precioUnitario) : null,
      };

      if (editingRepuesto) {
        payload.id = editingRepuesto.id;
        const data = await api.updateRepuesto(editingRepuesto.id, payload);
        setModalRepuestoOpen(false);
        setEditingRepuesto(null);
        cargarRepuestos();
        toast.success("Repuesto actualizado con éxito");
      } else {
        payload.stockActual = 0;
        const data = await api.createRepuesto(payload);
        setModalRepuestoOpen(false);
        setCodigo("");
        setDescripcion("");
        setPrecioUnitario("");
        setStockMinimo("0");
        cargarRepuestos();
        toast.success("Repuesto registrado con éxito");
      }
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = await api.createMovimientoAlmacen({
        repuestoId: movRepuestoId,
        tipoMovimiento: movTipo,
        cantidad: parseInt(movCantidad),
        responsable: movResponsable,
        ordenMantenimientoId: movOrdenId || null,
        observaciones: movObservaciones || null,
      });

      setModalMovimientoOpen(false);
      setMovRepuestoId("");
      setMovCantidad("");
      setMovResponsable("");
      setMovOrdenId("");
      setMovObservaciones("");
      cargarRepuestos();
      cargarMovimientos();
      toast.success("Movimiento registrado con éxito");
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEliminarRepuesto = async (id: string) => {
    const ok = await confirm({ message: "¿Está seguro de eliminar este repuesto?", variant: "danger" });
    if (!ok) return;

    try {
      await api.deleteRepuesto(id);
      cargarRepuestos();
      toast.success("Repuesto eliminado");
    } catch (err: any) {
      toast.error("Error: " + err.message);
    }
  };

  const abrirEditarRepuesto = (r: Repuesto) => {
    setEditingRepuesto(r);
    setCodigo(r.codigo);
    setDescripcion(r.descripcion);
    setCategoria(r.categoria);
    setUnidadMedida(r.unidadMedida);
    setStockMinimo(String(r.stockMinimo));
    setPrecioUnitario(r.precioUnitario ? String(r.precioUnitario) : "");
    setModalRepuestoOpen(true);
  };

  const abrirMovimiento = (repuestoId?: string) => {
    setMovRepuestoId(repuestoId || "");
    setMovTipo("ENTRADA");
    setMovCantidad("");
    setMovResponsable("");
    setMovOrdenId("");
    setMovObservaciones("");
    setModalMovimientoOpen(true);
  };

  const getStockBadge = (r: Repuesto) => {
    if (r.estadoStock === "AGOTADO") {
      return <span className="inline-block border px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border-rose-500/20">AGOTADO</span>;
    }
    if (r.estadoStock === "BAJO") {
      return <span className="inline-block border px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border-amber-500/20">BAJO</span>;
    }
    return <span className="inline-block border px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border-emerald-500/20">NORMAL</span>;
  };

  const alertasStock = repuestos.filter((r) => r.estadoStock !== "NORMAL");

  const columns: ColumnDef<Repuesto>[] = [
    { header: "Código", accessorKey: "codigo", className: "font-mono text-indigo-400 font-semibold" },
    { header: "Descripción", accessorKey: "descripcion" },
    { header: "Categoría", accessorKey: "categoria" },
    { header: "U. Medida", accessorKey: "unidadMedida" },
    { header: "Stock Mín.", accessorKey: (row) => String(row.stockMinimo), className: "font-mono text-slate-400" },
    { header: "Stock Actual", accessorKey: (row) => (
      <span className={`font-mono font-bold ${row.estadoStock === "AGOTADO" ? "text-rose-400" : row.estadoStock === "BAJO" ? "text-amber-400" : "text-white"}`}>
        {row.stockActual}
      </span>
    )},
    { header: "Precio Unit.", accessorKey: (row) => row.precioUnitario != null ? `S/. ${Number(row.precioUnitario).toFixed(2)}` : "-", className: "font-mono" },
    { header: "Estado", accessorKey: (row) => getStockBadge(row) },
    {
      header: "Acciones",
      accessorKey: (row) => (
        <div className="flex gap-1.5">
          <button
            onClick={() => abrirMovimiento(row.id)}
            className="px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold rounded-lg transition"
          >
            Movimiento
          </button>
          <button
            onClick={() => abrirEditarRepuesto(row)}
            className="px-2 py-1 bg-slate-600/20 hover:bg-slate-600/30 border border-slate-500/30 text-slate-400 text-[10px] font-bold rounded-lg transition"
          >
            Editar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition duration-150 inline-flex items-center space-x-2"
        >
          <span>←</span>
          <span>Volver al Dashboard</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Almacén de Mantenimiento</h2>
          <p className="text-xs text-slate-400">Gestión de repuestos, stock e inventario (MA 122 02 01)</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => abrirMovimiento()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition duration-150 shadow-md"
          >
            + Registrar Movimiento
          </button>
          <button
            onClick={() => {
              setEditingRepuesto(null);
              setCodigo("");
              setDescripcion("");
              setCategoria("FILTROS");
              setUnidadMedida("unidad");
              setStockMinimo("0");
              setPrecioUnitario("");
              setModalRepuestoOpen(true);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition duration-150 shadow-md"
          >
            + Nuevo Repuesto
          </button>
        </div>
      </div>

      {alertasStock.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl space-y-2">
          <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">⚠ Alerta de Stock Bajo</h4>
          <div className="flex flex-wrap gap-2 pt-1">
            {alertasStock.map((r) => (
              <span
                key={r.id}
                className={`px-3 py-1 rounded-xl text-[10px] font-bold font-mono border ${
                  r.estadoStock === "AGOTADO"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                }`}
              >
                {r.codigo}: {r.stockActual} {r.unidadMedida} (mín. {r.stockMinimo})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Cargando inventario...</div>
          ) : (
            <DataTable
              data={repuestos}
              columns={columns}
              searchKey="codigo"
              searchPlaceholder="Buscar por código o descripción..."
              newActionLabel=""
              onNewAction={() => {}}
            />
          )}
        </div>

        <div className="bg-slate-950 border border-slate-850/80 p-6 rounded-2xl space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Últimos Movimientos</h3>
            <p className="text-[10px] text-slate-400 mt-1">Historial de entradas y salidas del almacén</p>
          </div>

          {movimientos.length === 0 ? (
            <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl text-xs">
              Sin movimientos registrados
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {movimientos.slice(0, 20).map((m) => (
                <div key={m.id} className="p-3 bg-slate-900 rounded-xl border border-slate-850 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-white">{m.repuestoCodigo}</span>
                    <span className={`inline-block border px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      m.tipoMovimiento === "ENTRADA"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/15 text-rose-400 border-rose-500/20"
                    }`}>
                      {m.tipoMovimiento}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[10px] truncate">{m.repuestoDescripcion}</p>
                  <div className="flex justify-between text-[10px]">
                    <span className={`font-mono font-bold ${m.tipoMovimiento === "ENTRADA" ? "text-emerald-400" : "text-rose-400"}`}>
                      {m.tipoMovimiento === "ENTRADA" ? "+" : "-"}{m.cantidad} uds
                    </span>
                    <span className="text-slate-500">{m.responsable}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL CREAR/EDITAR REPUESTO */}
      {modalRepuestoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => { setModalRepuestoOpen(false); setEditingRepuesto(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div>
              <h3 className="text-lg font-bold text-indigo-400">
                {editingRepuesto ? "Editar Repuesto" : "Registrar Nuevo Repuesto"}
              </h3>
              <p className="text-xs text-slate-450">Almacén de Mantenimiento</p>
            </div>

            <form onSubmit={handleSubmitRepuesto} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-350">Código</label>
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    disabled={!!editingRepuesto}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none disabled:opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-350">Categoría</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="FILTROS">Filtros</option>
                    <option value="FRENOS">Frenos</option>
                    <option value="MOTOR">Motor</option>
                    <option value="ELECTRICO">Eléctrico</option>
                    <option value="SUSPENSION">Suspensión</option>
                    <option value="TRANSMISION">Transmisión</option>
                    <option value="CARROCERIA">Carrocería</option>
                    <option value="LUBRICANTES">Lubricantes</option>
                    <option value="HERRAMIENTAS">Herramientas</option>
                    <option value="OTROS">Otros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-350">Descripción</label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-350">Unidad</label>
                  <select
                    value={unidadMedida}
                    onChange={(e) => setUnidadMedida(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="unidad">Unidad</option>
                    <option value="litro">Litro</option>
                    <option value="par">Par</option>
                    <option value="juego">Juego</option>
                    <option value="metro">Metro</option>
                    <option value="kg">Kilogramo</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-350">Stock Mínimo</label>
                  <input
                    type="number"
                    value={stockMinimo}
                    onChange={(e) => setStockMinimo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-350">Precio Unit. (S/.)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={precioUnitario}
                    onChange={(e) => setPrecioUnitario(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold rounded-xl transition duration-150 shadow-lg text-sm"
              >
                {isSubmitting ? "Guardando..." : editingRepuesto ? "Actualizar Repuesto" : "Registrar Repuesto"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR MOVIMIENTO */}
      {modalMovimientoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setModalMovimientoOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div>
              <h3 className="text-lg font-bold text-indigo-400">Registrar Movimiento</h3>
              <p className="text-xs text-slate-450">Entrada o salida de almacén</p>
            </div>

            <form onSubmit={handleSubmitMovimiento} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-350">Repuesto</label>
                <SearchSelect
                  options={repuestoOptions}
                  value={movRepuestoId}
                  onChange={setMovRepuestoId}
                  placeholder="Buscar repuesto..."
                  searchPlaceholder="Código o descripción..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-350">Tipo Movimiento</label>
                  <select
                    value={movTipo}
                    onChange={(e) => setMovTipo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="ENTRADA">ENTRADA (Ingreso)</option>
                    <option value="SALIDA">SALIDA (Egreso)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-350">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={movCantidad}
                    onChange={(e) => setMovCantidad(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-350">Responsable</label>
                <input
                  type="text"
                  value={movResponsable}
                  onChange={(e) => setMovResponsable(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-350">Orden de Mantenimiento (opcional)</label>
                <SearchSelect
                  options={[{ value: "", label: "Ninguna orden" }, ...ordenOptions]}
                  value={movOrdenId}
                  onChange={setMovOrdenId}
                  placeholder="Ninguna orden"
                  searchPlaceholder="Número de orden o placa..."
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-350">Observaciones</label>
                <textarea
                  value={movObservaciones}
                  onChange={(e) => setMovObservaciones(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm focus:outline-none h-16"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 font-bold rounded-xl transition duration-150 shadow-lg text-sm text-white ${
                  movTipo === "ENTRADA"
                    ? "bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800"
                    : "bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800"
                }`}
              >
                {isSubmitting ? "Procesando..." : movTipo === "ENTRADA" ? "Registrar Entrada" : "Registrar Salida"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
