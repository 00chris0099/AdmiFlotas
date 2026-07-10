// ============================================================
// SAF - Tipos compartidos: Operación (Rutas y Programación)
// ============================================================

export interface Ruta {
  id: string;
  nombre: string;
  origen: string;
  destino: string;
  distanciaKm: number | null;
  tiempoEstimado: string | null;
  activa: boolean;
  creadoEn: Date;
}

export interface ProgramacionRuta {
  id: string;
  rutaId: string;
  vehiculoId: string;
  conductorId: string;
  fecha: Date;
  horaSalida: string;
  horaLlegada: string | null;
  estado: string;
  observaciones: string | null;
  creadoEn: Date;
  // Relaciones
  ruta?: Ruta;
  vehiculo?: import("./vehiculo").Vehiculo;
  conductor?: import("./usuario").Usuario;
}
