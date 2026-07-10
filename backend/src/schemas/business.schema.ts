import { z } from "zod";

export const createOrdenCombustibleSchema = z.object({
  vehiculoId: z.string().uuid(),
  centroServicioId: z.string().uuid().optional(),
  sectorSolicitanteId: z.string().uuid().optional(),
  fecha: z.coerce.date(),
  galones: z.number().min(0),
  montoTotal: z.number().min(0).optional(),
  observaciones: z.string().optional(),
});

export const createOrdenMantenimientoSchema = z.object({
  vehiculoId: z.string().uuid(),
  tecnicoId: z.string().uuid().optional(),
  fechaEmision: z.coerce.date(),
  fechaVencimiento: z.coerce.date().optional(),
  descripcion: z.string().optional(),
  tipoMantenimiento: z.string().max(50).optional(),
  estado: z.enum(["PENDIENTE", "EN_PROCESO", "COMPLETADO", "CANCELADO"]).optional(),
});

export const createControlLlantaSchema = z.object({
  vehiculoId: z.string().uuid(),
  fabricanteId: z.string().uuid().optional(),
  dimensionId: z.string().uuid().optional(),
  posicion: z.string().max(30).optional(),
  vidaUtil: z.number().int().min(0).optional(),
  presion: z.number().min(0).optional(),
  estado: z.enum(["NUEVA", "RECAPADA", "DESGASTADA", "FUERA_DE_SERVICIO"]).optional(),
});

export const createCostoSchema = z.object({
  vehiculoId: z.string().uuid().optional(),
  periodo: z.string().max(20),
  tipoCosto: z.string().max(50),
  monto: z.number().min(0),
  descripcion: z.string().optional(),
});

export const createRepuestoSchema = z.object({
  descripcion: z.string().min(1).max(255),
  codigo: z.string().max(50).optional(),
  categoriaId: z.string().uuid().optional(),
  precioUnitario: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
});

export const createConfiguracionSchema = z.object({
  clave: z.string().min(1).max(100),
  valor: z.string(),
  descripcion: z.string().max(255).optional(),
  grupo: z.string().max(50).default("general"),
});
