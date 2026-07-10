import { z } from "zod";

export const assignPermisoSchema = z.object({
  usuarioId: z.string().uuid("ID de usuario inválido"),
  permisoId: z.string().uuid("ID de permiso inválido"),
});

export const removePermisoQuerySchema = z.object({
  usuarioId: z.string().uuid("ID de usuario inválido"),
  permisoId: z.string().uuid("ID de permiso inválido"),
});

export const auditQuerySchema = z.object({
  modulo: z.string().optional(),
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
});
