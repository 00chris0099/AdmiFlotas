// ============================================================
// SAF Backend - Llantas Routes
// ============================================================

import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { sendSuccess, sendCreated, sendPaginated } from "../utils/apiResponse.js";
import prisma from "../config/database.js";

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /control_llantas:
 *   get:
 *     tags: [Llantas]
 *     summary: Listar control de llantas
 *     description: Obtiene la lista de registros de control individualizado de llantas con paginación.
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
 *         description: Lista paginada de control de llantas
 */
router.get("/", async (req, res, next) => {
  try {
    const { page = "1", limit = "20" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      prisma.controlLlanta.findMany({
        include: { vehiculo: { include: { marca: true, modelo: true } }, fabricante: true, dimension: true },
        skip, take: limitNum, orderBy: { creadoEn: "desc" },
      }),
      prisma.controlLlanta.count(),
    ]);

    sendPaginated(res, items, total, pageNum, limitNum);
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /control_llantas:
 *   post:
 *     tags: [Llantas]
 *     summary: Registrar control de llanta
 *     description: Registra un nuevo control individualizado de llanta (montaje, rotación, reencauche o baja).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehiculoId, posicion]
 *             properties:
 *               vehiculoId:
 *                 type: string
 *               posicion:
 *                 type: string
 *                 example: "Delantera Izquierda"
 *               fabricanteId:
 *                 type: string
 *               dimensionId:
 *                 type: string
 *               vidaUtilKm:
 *                 type: number
 *               kmActuales:
 *                 type: number
 *     responses:
 *       201:
 *         description: Control registrado
 */
router.post("/", async (req, res, next) => {
  try {
    const llanta = await prisma.controlLlanta.create({
      data: req.body,
      include: { vehiculo: true, fabricante: true, dimension: true },
    });
    sendCreated(res, llanta);
  } catch (error) { next(error); }
});

export { router as llantasRoutes };
