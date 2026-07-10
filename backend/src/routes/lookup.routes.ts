// ============================================================
// SAF Backend - Lookup Routes
// Todas las tablas de normalización / catálogos del sistema
// ============================================================

import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { sendSuccess, sendCreated } from "../utils/apiResponse.js";
import prisma from "../config/database.js";
import { requireRole } from "../middleware/rbac.js";

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /lookups/marcas:
 *   get:
 *     tags: [Lookups]
 *     summary: Listar marcas de vehículos
 *     description: Obtiene todas las marcas de vehículos activas.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de marcas
 */
/**
 * @swagger
 * /lookups/marcas:
 *   post:
 *     tags: [Lookups]
 *     summary: Crear marca de vehículo
 *     description: Registra una nueva marca de vehículo. Solo administradores.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre:
 *                 type: string
 *     responses:
 *       201:
 *         description: Marca creada
 */
/**
 * @swagger
 * /lookups/modelos:
 *   get:
 *     tags: [Lookups]
 *     summary: Listar modelos de vehículos
 *     description: Obtiene todos los modelos de vehículos activos.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de modelos
 */
/**
 * @swagger
 * /lookups/colores:
 *   get:
 *     tags: [Lookups]
 *     summary: Listar colores de vehículos
 *     description: Obtiene todos los colores de vehículos activos.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de colores
 */
/**
 * @swagger
 * /lookups/tipos-combustible:
 *   get:
 *     tags: [Lookups]
 *     summary: Listar tipos de combustible
 *     description: Obtiene todos los tipos de combustible activos.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos de combustible
 */
/**
 * @swagger
 * /lookups/estados-vehiculo:
 *   get:
 *     tags: [Lookups]
 *     summary: Listar estados de vehículo
 *     description: Obtiene todos los estados de vehículo activos (DISPONIBLE, EN_MANTENIMIENTO, etc.).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de estados
 */
/**
 * @swagger
 * /lookups/categorias-vehiculo:
 *   get:
 *     tags: [Lookups]
 *     summary: Listar categorías de vehículo
 *     description: Obtiene todas las categorías de vehículo activas.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
/**
 * @swagger
 * /lookups/roles:
 *   get:
 *     tags: [Lookups]
 *     summary: Listar roles del sistema
 *     description: Obtiene todos los roles del sistema (JEFE_PROCESO, CONDUCTOR, etc.).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles
 */
/**
 * @swagger
 * /lookups/sectores:
 *   get:
 *     tags: [Lookups]
 *     summary: Listar sectores organizacionales
 *     description: Obtiene todos los sectores organizacionales activos.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sectores
 */
/**
 * @swagger
 * /lookups/localidades:
 *   get:
 *     tags: [Lookups]
 *     summary: Listar localidades
 *     description: Obtiene todas las localidades activas.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de localidades
 */
/**
 * @swagger
 * /lookups/centros-servicio:
 *   get:
 *     tags: [Lookups]
 *     summary: Listar centros de servicio
 *     description: Obtiene todos los centros de servicio activos.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de centros de servicio
 */
/**
 * @swagger
 * /lookups/fabricantes-llanta:
 *   get:
 *     tags: [Lookups]
 *     summary: Listar fabricantes de llantas
 *     description: Obtiene todos los fabricantes de llantas activos.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de fabricantes
 */
/**
 * @swagger
 * /lookups/dimensiones-llanta:
 *   get:
 *     tags: [Lookups]
 *     summary: Listar dimensiones de llantas
 *     description: Obtiene todas las dimensiones de llantas activas.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de dimensiones
 */
/**
 * @swagger
 * /lookups/categorias-repuesto:
 *   get:
 *     tags: [Lookups]
 *     summary: Listar categorías de repuesto
 *     description: Obtiene todas las categorías de repuesto activas.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías de repuesto
 */
/**
 * @swagger
 * /lookups/tipos-lavado:
 *   get:
 *     tags: [Lookups]
 *     summary: Listar tipos de lavado
 *     description: Obtiene todos los tipos de lavado activos.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos de lavado
 */
/**
 * @swagger
 * /lookups/tipos-movimiento-almacen:
 *   get:
 *     tags: [Lookups]
 *     summary: Listar tipos de movimiento de almacén
 *     description: Obtiene todos los tipos de movimiento de almacén activos (Entrada, Salida).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos de movimiento
 */
/**
 * @swagger
 * /lookups/modelos-por-marca/{marcaId}:
 *   get:
 *     tags: [Lookups]
 *     summary: Modelos por marca
 *     description: Obtiene los modelos de vehículos filtrados por marca.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: marcaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la marca
 *     responses:
 *       200:
 *         description: Lista de modelos de la marca
 */

// ─── Helper genérico para CRUD de tablas de lookup ───
function createLookupRoutes(modelName: string, displayName: string) {
  const model = (prisma as any)[modelName];

  router.get(`/${displayName}`, async (_req, res, next) => {
    try {
      const items = await model.findMany({
        where: { activo: true },
        orderBy: { nombre: "asc" },
      });
      sendSuccess(res, items);
    } catch (error) { next(error); }
  });

  router.post(`/${displayName}`, requireRole("ADMINISTRADOR"), async (req, res, next) => {
    try {
      const item = await model.create({ data: req.body });
      sendCreated(res, item);
    } catch (error) { next(error); }
  });

  router.put(`/${displayName}/:id`, requireRole("ADMINISTRADOR"), async (req, res, next) => {
    try {
      const item = await model.update({
        where: { id: req.params.id },
        data: req.body,
      });
      sendSuccess(res, item);
    } catch (error) { next(error); }
  });

  router.delete(`/${displayName}/:id`, requireRole("ADMINISTRADOR"), async (req, res, next) => {
    try {
      await model.update({
        where: { id: req.params.id },
        data: { activo: false },
      });
      res.status(204).end();
    } catch (error) { next(error); }
  });
}

// ─── Vehículos ───
createLookupRoutes("marcaVehiculo", "marcas");
createLookupRoutes("modeloVehiculo", "modelos");
createLookupRoutes("colorVehiculo", "colores");
createLookupRoutes("tipoCombustible", "tipos-combustible");
createLookupRoutes("estadoVehiculo", "estados-vehiculo");
createLookupRoutes("categoriaVehiculo", "categorias-vehiculo");

// ─── Usuarios ───
createLookupRoutes("rol", "roles");

// ─── Organización ───
createLookupRoutes("sectorOrganizacional", "sectores");
createLookupRoutes("localidad", "localidades");
createLookupRoutes("centroServicio", "centros-servicio");

// ─── Llantas ───
createLookupRoutes("fabricanteLlanta", "fabricantes-llanta");
createLookupRoutes("dimensionLlanta", "dimensiones-llanta");

// ─── Almacén ───
createLookupRoutes("categoriaRepuesto", "categorias-repuesto");
createLookupRoutes("tipoLavado", "tipos-lavado");
createLookupRoutes("tipoMovimientoAlmacen", "tipos-movimiento-almacen");

// ─── Modelos por Marca (endpoint especial) ───
router.get("/modelos-por-marca/:marcaId", async (req, res, next) => {
  try {
    const items = await prisma.modeloVehiculo.findMany({
      where: { marcaId: req.params.marcaId, activo: true },
      orderBy: { nombre: "asc" },
    });
    sendSuccess(res, items);
  } catch (error) { next(error); }
});

export { router as lookupRoutes };
