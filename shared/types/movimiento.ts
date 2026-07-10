// ============================================================
// SAF - Tipos compartidos: Movimiento Diario
// ============================================================

export interface MovimientoDiario {
  id: string;
  vehiculoId: string;
  conductorId: string;
  inspectorId: string | null;
  fecha: Date;
  sectorSolicitanteId: string | null;
  destino: string;
  proposito: string | null;
  kilometrajeSalida: number;
  kilometrajeLlegada: number | null;
  kilometrajeRecorrido: number | null;
  horaSalida: string;
  horaLlegada: string | null;
  horasUtilizacion: number | null;
  firmaConductor: string | null;
  firmaInspector: string | null;
  firmaEncargadoGaraje: string | null;
  fechaFirmaConductor: Date | null;
  fechaFirmaInspector: Date | null;
  estado: EstadoMovimiento;
  observaciones: string | null;
  rutaId: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
  // Relaciones
  vehiculo?: import("./vehiculo").Vehiculo;
  conductor?: import("./usuario").Usuario;
  inspector?: import("./usuario").Usuario;
  checklist?: ChecklistVerificacion;
  ruta?: import("./operacion").Ruta;
}

export interface ChecklistVerificacion {
  id: string;
  movimientoId: string;
  documentos: EstadoChecklist;
  observDocumentos: string | null;
  aceiteMotor: EstadoChecklist;
  observAceiteMotor: string | null;
  agua: EstadoChecklist;
  observAgua: string | null;
  bateria: EstadoChecklist;
  observBateria: string | null;
  frenos: EstadoChecklist;
  observFrenos: string | null;
  embrague: EstadoChecklist;
  observEmbrague: string | null;
  fajas: EstadoChecklist;
  observFajas: string | null;
  faros: EstadoChecklist;
  observFaros: string | null;
  lunas: EstadoChecklist;
  observLunas: string | null;
  plumillas: EstadoChecklist;
  observPlumillas: string | null;
  llantas: EstadoChecklist;
  observLlantas: string | null;
  espejos: EstadoChecklist;
  observEspejos: string | null;
  herramientas: EstadoChecklist;
  observHerramientas: string | null;
  extintorBotiquin: EstadoChecklist;
  observExtintorBotiquin: string | null;
  manchasFugas: EstadoChecklist;
  observManchasFugas: string | null;
  aptoParaOperar: boolean;
  observacionesGenerales: string | null;
  firmaConductor: string | null;
  firmaInspector: string | null;
  fechaRegistro: Date;
}

export type EstadoMovimiento = "PROGRAMADO" | "EN_RUTA" | "COMPLETADO" | "CANCELADO";
export type EstadoChecklist = "OK" | "OBSERVADO" | "FALLADO";
