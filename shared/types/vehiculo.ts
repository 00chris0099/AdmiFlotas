// ============================================================
// SAF - Tipos compartidos: Vehículo
// ============================================================

export interface Vehiculo {
  id: string;
  clasePatrimonial: string;
  categoriaPatrimonialId: string;
  secuencial: string;
  codigoPatrimonial: string;
  placa: string;
  marcaId: string;
  modeloId: string;
  anioFabricacion: number;
  colorId: string | null;
  numeroMotor: string | null;
  numeroChasis: string | null;
  potenciaHp: number | null;
  cilindraje: number | null;
  numeroCilindros: number | null;
  tipoCombustibleId: string;
  subtipoCombustible: string | null;
  capacidadTanqueGal: number | null;
  capacidadCargaKg: number | null;
  capacidadPasajeros: number | null;
  pesoNetoKg: number | null;
  pesoBrutoKg: number | null;
  bateriaTipo: string | null;
  bateriaCeldas: number | null;
  bateriaVoltios: number | null;
  bateriaAmperios: number | null;
  numeroBaterias: number | null;
  numeroEjes: number | null;
  configuracionEjes: string | null;
  totalLlantas: number | null;
  dimensionLlantaEstandar: string | null;
  presionLlantaDelantera: number | null;
  presionLlantaTrasera: number | null;
  estadoPintura: string | null;
  estadoFaros: string | null;
  estadoLunas: string | null;
  estadoEspejos: string | null;
  estadoCarroceria: string | null;
  inventarioHerramientas: string | null;
  observacionesFisicas: string | null;
  valorAdquisicion: number | null;
  vidaUtilAnios: number | null;
  kmAnualesReferencia: number | null;
  seguroAnual: number | null;
  licenciamientoAnual: number | null;
  kmAlertaMantenimiento: number | null;
  periodicidadMantenimientoKm: number | null;
  kilometrajeActual: number | null;
  estadoId: string;
  fechaIngreso: Date;
  fechaBaja: Date | null;
  motivoBaja: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
  // Relaciones (populadas)
  marca?: MarcaVehiculo;
  modelo?: ModeloVehiculo;
  color?: ColorVehiculo;
  tipoCombustible?: TipoCombustible;
  estado?: EstadoVehiculo;
  categoriaPatrimonial?: CategoriaVehiculo;
}

export interface MarcaVehiculo {
  id: string;
  nombre: string;
  pais: string | null;
  activo: boolean;
}

export interface ModeloVehiculo {
  id: string;
  marcaId: string;
  nombre: string;
  activo: boolean;
  marca?: MarcaVehiculo;
}

export interface ColorVehiculo {
  id: string;
  nombre: string;
  codigoHex: string | null;
  activo: boolean;
}

export interface TipoCombustible {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface EstadoVehiculo {
  id: string;
  nombre: string;
  codigo: string;
  activo: boolean;
}

export interface CategoriaVehiculo {
  id: string;
  nombre: string;
  codigo: string;
  activo: boolean;
}

export type VehiculoCreateInput = Omit<Vehiculo, "id" | "creadoEn" | "actualizadoEn" | "marca" | "modelo" | "color" | "tipoCombustible" | "estado" | "categoriaPatrimonial">;

export type VehiculoUpdateInput = Partial<Omit<Vehiculo, "id" | "creadoEn" | "actualizadoEn">>;
