// ============================================================
// SAF Backend - Flota Routes
// ============================================================

import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from "../utils/apiResponse.js";
import prisma from "../config/database.js";

const router = Router();
router.use(authenticate);

// ─── Asignaciones ───

/**
 * @swagger
 * /flota/asignacion:
 *   get:
 *     tags: [Flota]
 *     summary: Listar asignaciones de vehículos
 *     description: Obtiene la lista de asignaciones de vehículos a conductores.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de asignaciones
 */
router.get("/asignacion", async (_req, res, next) => {
  try {
    const items = await prisma.asignacionVehiculo.findMany({
      include: { vehiculo: true, conductor: true },
      orderBy: { fechaAsignacion: "desc" },
    });
    sendSuccess(res, items);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /flota/asignacion:
 *   post:
 *     tags: [Flota]
 *     summary: Crear asignación de vehículo
 *     description: Asigna un vehículo a un conductor.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehiculoId, conductorId]
 *             properties:
 *               vehiculoId:
 *                 type: string
 *               conductorId:
 *                 type: string
 *               fechaAsignacion:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Asignación creada
 */
router.post("/asignacion", async (req, res, next) => {
  try {
    const item = await prisma.asignacionVehiculo.create({
      data: req.body,
      include: { vehiculo: true, conductor: true },
    });
    sendCreated(res, item);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /flota/asignacion/{id}:
 *   put:
 *     tags: [Flota]
 *     summary: Actualizar asignación
 *     description: Actualiza una asignación de vehículo existente.
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
 *               fechaFin:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Asignación actualizada
 */
router.put("/asignacion/:id", async (req, res, next) => {
  try {
    const item = await prisma.asignacionVehiculo.update({
      where: { id: req.params.id as string },
      data: req.body,
      include: { vehiculo: true, conductor: true },
    });
    sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /flota/asignacion/{id}:
 *   delete:
 *     tags: [Flota]
 *     summary: Eliminar asignación
 *     description: Elimina una asignación de vehículo.
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
 *         description: Asignación eliminada
 */
router.delete("/asignacion/:id", async (req, res, next) => {
  try {
    await prisma.asignacionVehiculo.delete({
      where: { id: req.params.id as string },
    });
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

// ─── Documentos ───

/**
 * @swagger
 * /flota/documentos:
 *   get:
 *     tags: [Flota]
 *     summary: Listar documentos de vehículos
 *     description: Obtiene la lista de documentos (SOAT, tecnocheck, etc.) de los vehículos.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vehiculoId
 *         schema:
 *           type: string
 *         description: Filtrar por vehículo
 *     responses:
 *       200:
 *         description: Lista de documentos
 */
router.get("/documentos", async (req, res, next) => {
  try {
    const { vehiculoId } = req.query;
    const where = vehiculoId ? { vehiculoId: vehiculoId as string } : {};
    const items = await prisma.documentoVehiculo.findMany({
      where,
      include: { vehiculo: true },
      orderBy: { creadoEn: "desc" },
    });
    sendSuccess(res, items);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /flota/documentos:
 *   post:
 *     tags: [Flota]
 *     summary: Crear documento de vehículo
 *     description: Registra un nuevo documento para un vehículo.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehiculoId, tipo, numero]
 *             properties:
 *               vehiculoId:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 example: SOAT
 *               numero:
 *                 type: string
 *               fechaExpedicion:
 *                 type: string
 *                 format: date
 *               fechaVencimiento:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Documento creado
 */
router.post("/documentos", async (req, res, next) => {
  try {
    const item = await prisma.documentoVehiculo.create({
      data: req.body,
      include: { vehiculo: true },
    });
    sendCreated(res, item);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /flota/documentos/{id}:
 *   delete:
 *     tags: [Flota]
 *     summary: Eliminar documento
 *     description: Elimina un documento de vehículo.
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
 *         description: Documento eliminado
 */
router.delete("/documentos/:id", async (req, res, next) => {
  try {
    await prisma.documentoVehiculo.delete({
      where: { id: req.params.id as string },
    });
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

export { router as flotaRoutes };
