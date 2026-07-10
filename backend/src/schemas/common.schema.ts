import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

export const claveParamSchema = z.object({
  clave: z.string().min(1),
});
