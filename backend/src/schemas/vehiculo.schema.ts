import { z } from "zod";

export const createVehiculoSchema = z.object({
  placa: z.string().min(1).max(20),
  codigoPatrimonial: z.string().min(1).max(50).optional(),
  clasePatrimonial: z.string().optional(),
  secuencial: z.string().optional(),
  anioFabricacion: z.number().int().min(1900).max(2100).optional(),
  kilometraje: z.number().int().min(0).optional(),
  estadoId: z.string().uuid().optional(),
  marca: z.string().min(1),
  modelo: z.string().min(1),
  color: z.string().optional(),
  tipoCombustible: z.string().optional(),
  subtipoCombustible: z.string().optional(),
  categoriaPatrimonial: z.string().optional(),
  capacidadPasajeros: z.number().int().min(0).optional(),
  capacidadCargaKg: z.number().min(0).optional(),
  valorAdquisicion: z.number().positive().optional(),
  vidaUtilAnios: z.number().int().min(1).max(50).optional(),
  kmAnualesReferencia: z.number().int().min(0).optional(),
  seguroAnual: z.number().min(0).optional(),
  licenciamientoAnual: z.number().min(0).optional(),
  periodicidadMantenimientoKm: z.number().int().min(100).optional(),
});

export const updateVehiculoSchema = createVehiculoSchema.partial();

export const vehiculoQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  estadoId: z.string().uuid().optional(),
  marcaId: z.string().uuid().optional(),
});
