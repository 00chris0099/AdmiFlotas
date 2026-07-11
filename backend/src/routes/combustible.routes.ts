// ============================================================
// SAF Backend - Combustible Routes
// ============================================================

import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from "../utils/apiResponse.js";
import { validate } from "../middleware/validate.js";
import { createOrdenCombustibleSchema } from "../schemas/business.schema.js";
import prisma from "../config/database.js";
import { generateNumeroOrden } from "../utils/orderGenerator.js";

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /control_combustible:
 *   get:
 *     tags: [Combustible]
 *     summary: Listar órdenes de combustible
 *     description: Obtiene la lista de órdenes de combustible con paginación.
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
 *     responses:
 *       200:
 *         description: Lista paginada de órdenes de combustible
 */
router.get("/", async (req, res, next) => {
  try {
    const { page = "1", limit = "20" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      prisma.ordenCombustible.findMany({
        include: {
          vehiculo: { include: { marca: true, modelo: true } },
          centroServicio: true,
          sectorSolicitante: true,
        },
        skip,
        take: limitNum,
        orderBy: { fecha: "desc" },
      }),
      prisma.ordenCombustible.count(),
    ]);

    sendPaginated(res, items, total, pageNum, limitNum);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /control_combustible/{id}:
 *   get:
 *     tags: [Combustible]
 *     summary: Obtener orden de combustible por ID
 *     description: Retorna una orden de combustible con sus relaciones.
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
 *         description: Orden encontrada
 */
router.get("/:id", async (req, res, next) => {
  try {
    const item = await prisma.ordenCombustible.findUnique({
      where: { id: req.params.id as string },
      include: {
        vehiculo: { include: { marca: true, modelo: true } },
        centroServicio: true,
        sectorSolicitante: true,
      },
    });
    sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /control_combustible:
 *   post:
 *     tags: [Combustible]
 *     summary: Crear orden de combustible
 *     description: Registra una nueva orden de combustible. El número de orden se genera automáticamente.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehiculoId, fecha, tipoCombustible, cantidadGalones, costoCombustible]
 *             properties:
 *               vehiculoId:
 *                 type: string
 *               fecha:
 *                 type: string
 *                 format: date
 *               tipoCombustible:
 *                 type: string
 *                 example: DIESEL
 *               cantidadGalones:
 *                 type: number
 *               costoCombustible:
 *                 type: number
 *               centroServicioId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Orden creada
 */
router.post("/", validate(createOrdenCombustibleSchema), async (req, res, next) => {
  try {
    const numeroOrden = await generateNumeroOrden("OC");
    const body = req.body;

    // Calcular costos automáticamente
    const galones = Number(body.cantidadGalones || body.galones || 0);
    const costoGalon = Number(body.costoGalon || 0);
    const costoCombustible = galones * costoGalon;
    const costoAceiteMotor = Number(body.costoAceiteMotor || 0);
    const costoAceiteCaja = Number(body.costoAceiteCaja || 0);
    const costoTotal = costoCombustible + costoAceiteMotor + costoAceiteCaja;

    const orden = await prisma.ordenCombustible.create({
      data: {
        ...body,
        numeroOrden,
        costoCombustible,
        costoTotal,
      },
      include: { vehiculo: true, centroServicio: true, sectorSolicitante: true },
    });
    sendCreated(res, orden);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /control_combustible/{id}:
 *   put:
 *     tags: [Combustible]
 *     summary: Actualizar orden de combustible
 *     description: Actualiza los datos de una orden de combustible existente.
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
 *               tipoCombustible:
 *                 type: string
 *               cantidadGalones:
 *                 type: number
 *               costoCombustible:
 *                 type: number
 *     responses:
 *       200:
 *         description: Orden actualizada
 */
router.put("/:id", async (req, res, next) => {
  try {
    const body = req.body;

    // Recalcular costos si se actualizaron campos relacionados
    const updateData: any = { ...body };
    if (body.cantidadGalones !== undefined || body.costoGalon !== undefined || body.costoAceiteMotor !== undefined || body.costoAceiteCaja !== undefined) {
      const existing = await prisma.ordenCombustible.findUnique({ where: { id: req.params.id as string } });
      const galones = Number(body.cantidadGalones ?? existing?.cantidadGalones ?? 0);
      const costoGalon = Number(body.costoGalon ?? existing?.costoGalon ?? 0);
      const costoCombustible = galones * costoGalon;
      const costoAceiteMotor = Number(body.costoAceiteMotor ?? existing?.costoAceiteMotor ?? 0);
      const costoAceiteCaja = Number(body.costoAceiteCaja ?? existing?.costoAceiteCaja ?? 0);
      updateData.costoCombustible = costoCombustible;
      updateData.costoTotal = costoCombustible + costoAceiteMotor + costoAceiteCaja;
    }

    const item = await prisma.ordenCombustible.update({
      where: { id: req.params.id as string },
      data: updateData,
      include: { vehiculo: true, centroServicio: true, sectorSolicitante: true },
    });
    sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /control_combustible/{id}:
 *   delete:
 *     tags: [Combustible]
 *     summary: Eliminar orden de combustible
 *     description: Elimina una orden de combustible del sistema.
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
 *         description: Orden eliminada
 */
router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.ordenCombustible.delete({
      where: { id: req.params.id as string },
    });
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

export { router as combustibleRoutes };
