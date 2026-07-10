// ============================================================
// SAF - Tipos compartidos: Flota (Asignaciones y Documentos)
// ============================================================

export interface AsignacionVehiculo {
  id: string;
  vehiculoId: string;
  conductorId: string;
  sectorAsignado: string;
  fechaAsignacion: Date;
  fechaFin: Date | null;
  activa: boolean;
  observaciones: string | null;
  creadoEn: Date;
  // Relaciones
  vehiculo?: import("./vehiculo").Vehiculo;
  conductor?: import("./usuario").Usuario;
}

export interface DocumentoVehiculo {
  id: string;
  vehiculoId: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  fechaEmision: Date;
  fechaVencimiento: Date | null;
  entidadEmisora: string | null;
  observaciones: string | null;
  creadoEn: Date;
  // Relaciones
  vehiculo?: import("./vehiculo").Vehiculo;
}

export type TipoDocumento = "LICENCIA" | "SOAT" | "REVISION_TECNICA" | "SEGURO" | "TARJETA_PROPIEDAD" | "OTRO";

export type AsignacionVehiculoCreateInput = Omit<AsignacionVehiculo, "id" | "creadoEn" | "vehiculo" | "conductor">;
export type AsignacionVehiculoUpdateInput = Partial<Omit<AsignacionVehiculo, "id" | "creadoEn">>;

export type DocumentoVehiculoCreateInput = Omit<DocumentoVehiculo, "id" | "creadoEn" | "vehiculo">;
export type DocumentoVehiculoUpdateInput = Partial<Omit<DocumentoVehiculo, "id" | "creadoEn">>;
