// ============================================================
// SAF Backend - Almacen Routes
// ============================================================

import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from "../utils/apiResponse.js";
import prisma from "../config/database.js";

const router = Router();
router.use(authenticate);

// ─── CRUD Repuestos ───

/**
 * @swagger
 * /mantenimiento/almacen:
 *   get:
 *     tags: [Almacen]
 *     summary: Listar repuestos
 *     description: Obtiene la lista de repuestos del almacén.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de repuestos
 */
router.get("/", async (_req, res, next) => {
  try {
    const items = await prisma.repuesto.findMany({
      include: { categoria: true },
      orderBy: { descripcion: "asc" },
    });
    sendSuccess(res, items);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /mantenimiento/almacen/{id}:
 *   get:
 *     tags: [Almacen]
 *     summary: Obtener repuesto por ID
 *     description: Retorna un repuesto con su categoría.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Repuesto encontrado
 */
router.get("/:id", async (req, res, next) => {
  try {
    const item = await prisma.repuesto.findUnique({
      where: { id: req.params.id as string },
      include: { categoria: true },
    });
    sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /mantenimiento/almacen:
 *   post:
 *     tags: [Almacen]
 *     summary: Crear repuesto
 *     description: Registra un nuevo repuesto en el almacén.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [descripcion]
 *             properties:
 *               descripcion:
 *                 type: string
 *               codigoParte:
 *                 type: string
 *               categoriaId:
 *                 type: string
 *               stockActual:
 *                 type: integer
 *               stockMinimo:
 *                 type: integer
 *               costoUnitario:
 *                 type: number
 *     responses:
 *       201:
 *         description: Repuesto creado
 */
router.post("/", async (req, res, next) => {
  try {
    const item = await prisma.repuesto.create({ data: req.body });
    sendCreated(res, item);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /mantenimiento/almacen/{id}:
 *   put:
 *     tags: [Almacen]
 *     summary: Actualizar repuesto
 *     description: Actualiza los datos de un repuesto existente.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *               stockActual:
 *                 type: integer
 *               costoUnitario:
 *                 type: number
 *     responses:
 *       200:
 *         description: Repuesto actualizado
 */
router.put("/:id", async (req, res, next) => {
  try {
    const item = await prisma.repuesto.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /mantenimiento/almacen/{id}:
 *   delete:
 *     tags: [Almacen]
 *     summary: Eliminar repuesto
 *     description: Elimina un repuesto del almacén.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Repuesto eliminado
 */
router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.repuesto.delete({ where: { id: req.params.id as string } });
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

// ─── Movimientos de Almacén ───

/**
 * @swagger
 * /mantenimiento/almacen/movimientos:
 *   get:
 *     tags: [Almacen]
 *     summary: Listar movimientos de almacén
 *     description: Obtiene el historial de movimientos de almacén (entradas y salidas).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: repuestoId
 *         schema:
 *           type: string
 *         description: Filtrar por repuesto
 *     responses:
 *       200:
 *         description: Lista de movimientos
 */
router.get("/movimientos", async (req, res, next) => {
  try {
    const { repuestoId } = req.query;
    const where = repuestoId ? { repuestoId: repuestoId as string } : {};
    const items = await prisma.movimientoAlmacen.findMany({
      where,
      include: { repuesto: true, tipoMovimiento: true },
      orderBy: { fecha: "desc" },
    });
    sendSuccess(res, items);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /mantenimiento/almacen/movimientos:
 *   post:
 *     tags: [Almacen]
 *     summary: Registrar movimiento de almacén
 *     description: Registra una entrada o salida de almacén y actualiza el stock del repuesto.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [repuestoId, cantidad, tipoMovimientoAlmacenId]
 *             properties:
 *               repuestoId:
 *                 type: string
 *               cantidad:
 *                 type: integer
 *               tipoMovimientoAlmacenId:
 *                 type: string
 *               observaciones:
 *                 type: string
 *     responses:
 *       201:
 *         description: Movimiento registrado
 */
router.post("/movimientos", async (req, res, next) => {
  try {
    const item = await prisma.movimientoAlmacen.create({
      data: req.body,
      include: { repuesto: true, tipoMovimiento: true },
    });

    // Update stock
    const { repuestoId, cantidad, tipoMovimientoAlmacenId } = req.body;
    if (tipoMovimientoAlmacenId && repuestoId) {
      const tipoMov = await prisma.tipoMovimientoAlmacen.findUnique({
        where: { id: tipoMovimientoAlmacenId },
      });
      if (tipoMov) {
        const stockChange = tipoMov.nombre.toLowerCase().includes("entrada") ? cantidad : -cantidad;
        await prisma.repuesto.update({
          where: { id: repuestoId },
          data: { stockActual: { increment: stockChange } },
        });
      }
    }

    sendCreated(res, item);
  } catch (error) {
    next(error);
  }
});

// ─── Lavados ───

/**
 * @swagger
 * /mantenimiento/almacen/lavado:
 *   get:
 *     tags: [Almacen]
 *     summary: Listar lavados
 *     description: Obtiene el historial de lavados de vehículos.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de lavados
 */
router.get("/lavado", async (_req, res, next) => {
  try {
    const items = await prisma.lavado.findMany({
      include: { vehiculo: true, tipoLavado: true },
      orderBy: { fecha: "desc" },
    });
    sendSuccess(res, items);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /mantenimiento/almacen/lavado:
 *   post:
 *     tags: [Almacen]
 *     summary: Registrar lavado
 *     description: Registra un nuevo lavado de vehículo.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehiculoId, fecha, tipoLavadoId]
 *             properties:
 *               vehiculoId:
 *                 type: string
 *               fecha:
 *                 type: string
 *                 format: date-time
 *               tipoLavadoId:
 *                 type: string
 *               costo:
 *                 type: number
 *     responses:
 *       201:
 *         description: Lavado registrado
 */
router.post("/lavado", async (req, res, next) => {
  try {
    const item = await prisma.lavado.create({
      data: req.body,
      include: { vehiculo: true, tipoLavado: true },
    });
    sendCreated(res, item);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /mantenimiento/almacen/lavado/{id}:
 *   delete:
 *     tags: [Almacen]
 *     summary: Eliminar lavado
 *     description: Elimina un registro de lavado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Lavado eliminado
 */
router.delete("/lavado/:id", async (req, res, next) => {
  try {
    await prisma.lavado.delete({ where: { id: req.params.id as string } });
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

export { router as almacenRoutes };
