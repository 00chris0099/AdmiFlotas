// ============================================================
// SAF - Tipos compartidos: Control de Llantas
// ============================================================

export interface ControlLlanta {
  id: string;
  codigoEps: string;
  vehiculoId: string;
  fabricanteId: string;
  dimensionId: string;
  modeloLlanta: string;
  posicionVehiculo: number;
  descripcionPosicion: string | null;
  estado: EstadoLlanta;
  fechaInstalacion: Date;
  fechaRetiro: Date | null;
  kilometrajeInstalacion: number;
  kilometrajeRetiro: number | null;
  kilometrajeAcumulado: number;
  vecesReencauchada: number;
  costoAdquisicion: number | null;
  observaciones: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
  // Relaciones
  vehiculo?: import("./vehiculo").Vehiculo;
  fabricante?: import("./lookup").FabricanteLlanta;
  dimension?: import("./lookup").DimensionLlanta;
}

export interface DesempenoLlantas {
  id: string;
  codigoEps: string;
  vehiculoId: string;
  fabricante: string;
  kilometrajeAcumulado: number;
  vecesReencauchada: number;
  costoAdquisicion: number | null;
  costoPorKm: number | null;
  // Relaciones
  vehiculo?: import("./vehiculo").Vehiculo;
}

export type EstadoLlanta = "EN_USO" | "EN_ALMACEN" | "REENCAUCHADA" | "EN_REENCAUCHE" | "DADA_DE_BAJA";

export type ControlLlantaCreateInput = Omit<ControlLlanta, "id" | "creadoEn" | "actualizadoEn" | "vehiculo" | "fabricante" | "dimension">;
export type ControlLlantaUpdateInput = Partial<Omit<ControlLlanta, "id" | "creadoEn" | "actualizadoEn">>;
