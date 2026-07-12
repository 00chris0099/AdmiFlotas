import { z } from "zod";

const estadoChecklistEnum = z.enum(["OK", "OBSERVADO", "FALLADO"]);

export const createMovimientoSchema = z.object({
  vehiculoId: z.string().uuid(),
  conductorId: z.string().uuid(),
  inspectorId: z.string().uuid().optional(),
  fecha: z.coerce.date(),
  sectorSolicitante: z.string().max(255).optional(),
  destino: z.string().min(1).max(255),
  proposito: z.string().max(255).optional(),
  kilometrajeSalida: z.number().int().min(0),
  kilometrajeLlegada: z.number().int().min(0).optional(),
  horaSalida: z.string().min(1),
  horaLlegada: z.string().optional(),
  observaciones: z.string().optional(),
  estado: z.enum(["PROGRAMADO", "EN_RUTA", "COMPLETADO", "CANCELADO"]).optional(),
  // 15 puntos del checklist de verificación pre-operacional
  documentos: estadoChecklistEnum.optional(),
  aceiteMotor: estadoChecklistEnum.optional(),
  agua: estadoChecklistEnum.optional(),
  bateria: estadoChecklistEnum.optional(),
  frenos: estadoChecklistEnum.optional(),
  embrague: estadoChecklistEnum.optional(),
  fajas: estadoChecklistEnum.optional(),
  faros: estadoChecklistEnum.optional(),
  lunas: estadoChecklistEnum.optional(),
  plumillas: estadoChecklistEnum.optional(),
  llantas: estadoChecklistEnum.optional(),
  espejos: estadoChecklistEnum.optional(),
  herramientas: estadoChecklistEnum.optional(),
  extintorBotiquin: estadoChecklistEnum.optional(),
  manchasFugas: estadoChecklistEnum.optional(),
});

export const updateMovimientoSchema = createMovimientoSchema.partial();
