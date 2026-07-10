import { z } from "zod";

export const createMovimientoSchema = z.object({
  vehiculoId: z.string().uuid(),
  conductorId: z.string().uuid(),
  inspectorId: z.string().uuid().optional(),
  fecha: z.coerce.date(),
  horaSalida: z.string().optional(),
  horaRegreso: z.string().optional(),
  kmSalida: z.number().int().min(0).optional(),
  kmRegreso: z.number().int().min(0).optional(),
  destino: z.string().max(255).optional(),
  observaciones: z.string().optional(),
  estado: z.enum(["PENDIENTE", "EN_CURSO", "COMPLETADO", "CANCELADO"]).optional(),
});

export const updateMovimientoSchema = createMovimientoSchema.partial();
