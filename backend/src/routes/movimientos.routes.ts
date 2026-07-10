// ============================================================
// SAF Backend - Movimientos Diarios Routes
// ============================================================

import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from "../utils/apiResponse.js";
import { validate } from "../middleware/validate.js";
import { createMovimientoSchema } from "../schemas/movimiento.schema.js";
import prisma from "../config/database.js";
import { generateNumeroOrden } from "../utils/orderGenerator.js";

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /movimientos_diarios:
 *   get:
 *     tags: [Movimientos Diarios]
 *     summary: Listar movimientos diarios
 *     description: Obtiene la lista de movimientos diarios con paginación y filtros.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: vehiculoId
 *         schema:
 *           type: string
 *         description: Filtrar por vehículo
 *       - in: query
 *         name: conductorId
 *         schema:
 *           type: string
 *         description: Filtrar por conductor
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [EN_RUTA, COMPLETADO, CANCELADO]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista paginada de movimientos
 */
router.get("/", async (req, res, next) => {
  try {
    const { page = "1", limit = "20", vehiculoId, conductorId, estado } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      ...(vehiculoId && { vehiculoId: vehiculoId as string }),
      ...(conductorId && { conductorId: conductorId as string }),
      ...(estado && { estado: estado as any }),
    };

    const [items, total] = await Promise.all([
      prisma.movimientoDiario.findMany({
        where,
        include: {
          vehiculo: { include: { marca: true, modelo: true } },
          conductor: true,
          inspector: true,
          checklist: true,
        },
        skip,
        take: limitNum,
        orderBy: { fecha: "desc" },
      }),
      prisma.movimientoDiario.count({ where }),
    ]);

    sendPaginated(res, items, total, pageNum, limitNum);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /movimientos_diarios/checklist:
 *   get:
 *     tags: [Movimientos Diarios]
 *     summary: Listar checklists de verificación
 *     description: Obtiene todos los checklists de verificación pre-operativa.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de checklists
 */
router.get("/checklist", async (_req, res, next) => {
  try {
    const items = await prisma.checklistVerificacion.findMany({
      include: {
        movimiento: {
          include: {
            vehiculo: { include: { marca: true, modelo: true } },
            inspector: true,
          },
        },
      },
      orderBy: { fechaRegistro: "desc" },
    });

    const formatted = items.map((c: any) => ({
      id: c.id,
      movimientoId: c.movimientoId,
      placa: c.movimiento.vehiculo.placa,
      inspector: c.movimiento.inspector
        ? `${c.movimiento.inspector.nombre} ${c.movimiento.inspector.apellido}`
        : "N/A",
      fecha: c.fechaRegistro,
      aptoParaOperar: c.aptoParaOperar,
      documentos: c.documentos,
      frenos: c.frenos,
      llantas: c.llantas,
    }));

    sendSuccess(res, formatted);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /movimientos_diarios/{id}:
 *   get:
 *     tags: [Movimientos Diarios]
 *     summary: Obtener movimiento por ID
 *     description: Retorna un movimiento diario con todas sus relaciones.
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
 *         description: Movimiento encontrado
 */
router.get("/:id", async (req, res, next) => {
  try {
    const item = await prisma.movimientoDiario.findUnique({
      where: { id: req.params.id as string },
      include: {
        vehiculo: { include: { marca: true, modelo: true } },
        conductor: true,
        inspector: true,
        checklist: true,
      },
    });
    sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /movimientos_diarios:
 *   post:
 *     tags: [Movimientos Diarios]
 *     summary: Crear movimiento diario
 *     description: Crea un movimiento diario con su checklist de verificación en transacción. El número de orden se genera automáticamente.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehiculoId, conductorId, fecha]
 *             properties:
 *               vehiculoId:
 *                 type: string
 *               conductorId:
 *                 type: string
 *               inspectorId:
 *                 type: string
 *               fecha:
 *                 type: string
 *                 format: date-time
 *               estado:
 *                 type: string
 *                 enum: [EN_RUTA, COMPLETADO, CANCELADO]
 *               checklist:
 *                 type: object
 *                 properties:
 *                   documentos:
 *                     type: boolean
 *                   frenos:
 *                     type: boolean
 *                   llantas:
 *                     type: boolean
 *                   aptoParaOperar:
 *                     type: boolean
 *     responses:
 *       201:
 *         description: Movimiento creado
 */
router.post("/", validate(createMovimientoSchema), async (req, res, next) => {
  try {
    const numeroOrden = await generateNumeroOrden("MD");
    const { checklist, ...movimientoData } = req.body;

    const result = await prisma.$transaction(async (tx: any) => {
      const movimiento = await tx.movimientoDiario.create({
        data: {
          ...movimientoData,
          numeroOrden,
        },
        include: {
          vehiculo: { include: { marca: true, modelo: true } },
          conductor: true,
          inspector: true,
        },
      });

      if (checklist && typeof checklist === "object") {
        const { id: _id, movimientoId: _mid, fechaRegistro: _fr, ...checklistData } = checklist;
        await tx.checklistVerificacion.create({
          data: {
            movimientoId: movimiento.id,
            ...checklistData,
          },
        });
      }

      return tx.movimientoDiario.findUnique({
        where: { id: movimiento.id },
        include: {
          vehiculo: { include: { marca: true, modelo: true } },
          conductor: true,
          inspector: true,
          checklist: true,
        },
      });
    });

    sendCreated(res, result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /movimientos_diarios/{id}:
 *   put:
 *     tags: [Movimientos Diarios]
 *     summary: Actualizar movimiento diario
 *     description: Actualiza los datos de un movimiento diario existente.
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
 *               estado:
 *                 type: string
 *                 enum: [EN_RUTA, COMPLETADO, CANCELADO]
 *     responses:
 *       200:
 *         description: Movimiento actualizado
 */
router.put("/:id", async (req, res, next) => {
  try {
    const item = await prisma.movimientoDiario.update({
      where: { id: req.params.id as string },
      data: req.body,
      include: {
        vehiculo: { include: { marca: true, modelo: true } },
        conductor: true,
        inspector: true,
        checklist: true,
      },
    });
    sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /movimientos_diarios/{id}:
 *   delete:
 *     tags: [Movimientos Diarios]
 *     summary: Eliminar movimiento diario
 *     description: Elimina un movimiento diario del sistema.
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
 *         description: Movimiento eliminado
 */
router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.movimientoDiario.delete({
      where: { id: req.params.id as string },
    });
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

export { router as movimientosRoutes };
