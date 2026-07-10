// ============================================================
// SAF - Tipos compartidos: Almacén de Mantenimiento
// ============================================================

export interface Repuesto {
  id: string;
  codigo: string;
  descripcion: string;
  categoriaId: string | null;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  precioUnitario: number | null;
  creadoEn: Date;
  // Relaciones
  categoria?: import("./lookup").CategoriaRepuesto;
  movimientos?: MovimientoAlmacen[];
}

export interface MovimientoAlmacen {
  id: string;
  repuestoId: string;
  tipoMovimientoAlmacenId: string | null;
  cantidad: number;
  ordenMantenimientoId: string | null;
  responsable: string;
  fecha: Date;
  observaciones: string | null;
  // Relaciones
  repuesto?: Repuesto;
  tipoMovimiento?: import("./lookup").TipoMovimientoAlmacen;
}

export interface Lavado {
  id: string;
  vehiculoId: string;
  fecha: Date;
  tipoLavadoId: string | null;
  costo: number | null;
  proveedor: string | null;
  responsable: string | null;
  observaciones: string | null;
  creadoEn: Date;
  // Relaciones
  vehiculo?: import("./vehiculo").Vehiculo;
  tipoLavado?: import("./lookup").TipoLavado;
}

export type RepuestoCreateInput = Omit<Repuesto, "id" | "creadoEn" | "categoria" | "movimientos">;
export type RepuestoUpdateInput = Partial<Omit<Repuesto, "id" | "creadoEn">>;

export type MovimientoAlmacenCreateInput = Omit<MovimientoAlmacen, "id" | "repuesto" | "tipoMovimiento">;
export type LavadoCreateInput = Omit<Lavado, "id" | "creadoEn" | "vehiculo" | "tipoLavado">;
export type LavadoUpdateInput = Partial<Omit<Lavado, "id" | "creadoEn">>;
