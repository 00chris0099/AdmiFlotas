// ============================================================
// SAF - Tipos compartidos: Control de Costos
// ============================================================

export interface CostoFijoProrrateable {
  id: string;
  periodo: string;
  tipo: TipoCostoFijo;
  descripcion: string;
  montoMensual: number;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface ReporteMensualCostos {
  id: string;
  vehiculoId: string;
  periodo: string;
  costoCombustible: number;
  costoMantenimiento: number;
  costoFijoProrrateado: number;
  costoTotal: number;
  // Relaciones
  vehiculo?: import("./vehiculo").Vehiculo;
}

export interface ResumenKpisVehiculo {
  id: string;
  vehiculoId: string;
  marca: string;
  modelo: string;
  placa: string;
  kilometrajeTotal: number;
  horasUtilizacion: number;
  galonesCombustible: number;
  costoCombustible: number;
  costoMantenimiento: number;
  viajesRealizados: number;
  // Relaciones
  vehiculo?: import("./vehiculo").Vehiculo;
}

export type TipoCostoFijo = "PERSONAL_ADMINISTRATIVO" | "OFICINA" | "COMUNICACIONES" | "SEGUROS_GENERALES" | "LICENCIAS_SOFTWARE" | "OTROS";

export type CostoFijoProrrateableCreateInput = Omit<CostoFijoProrrateable, "id" | "creadoEn" | "actualizadoEn">;
export type CostoFijoProrrateableUpdateInput = Partial<Omit<CostoFijoProrrateable, "id" | "creadoEn" | "actualizadoEn">>;
