import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const createUsuarioSchema = z.object({
  nombre: z.string().min(1).max(100),
  apellido: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  rolId: z.string().uuid(),
  activo: z.boolean().optional(),
});

export const updateUsuarioSchema = createUsuarioSchema.partial();
