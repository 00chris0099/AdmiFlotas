// ============================================================
// SAF Backend - Operaciones Routes
// ============================================================

import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/apiResponse.js";
import prisma from "../config/database.js";

const router = Router();
router.use(authenticate);

// ─── Rutas ───

/**
 * @swagger
 * /operaciones/rutas:
 *   get:
 *     tags: [Operaciones]
 *     summary: Listar rutas
 *     description: Obtiene la lista de rutas de operaciones con conteo de programaciones.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de rutas
 */
router.get("/rutas", async (_req, res, next) => {
  try {
    const items = await prisma.ruta.findMany({
      include: {
        _count: { select: { programaciones: true } },
      },
      orderBy: { nombre: "asc" },
    });

    const formatted = items.map((r: any) => ({
      ...r,
      totalProgramaciones: r._count.programaciones,
    }));

    sendSuccess(res, formatted);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /operaciones/rutas:
 *   post:
 *     tags: [Operaciones]
 *     summary: Crear ruta
 *     description: Registra una nueva ruta de operaciones.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, origen, destino]
 *             properties:
 *               nombre:
 *                 type: string
 *               origen:
 *                 type: string
 *               destino:
 *                 type: string
 *               distanciaKm:
 *                 type: number
 *               tiempoEstimadoMin:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Ruta creada
 */
router.post("/rutas", async (req, res, next) => {
  try {
    const item = await prisma.ruta.create({ data: req.body });
    sendCreated(res, item);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /operaciones/rutas/{id}:
 *   put:
 *     tags: [Operaciones]
 *     summary: Actualizar ruta
 *     description: Actualiza los datos de una ruta existente.
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
 *               nombre:
 *                 type: string
 *               distanciaKm:
 *                 type: number
 *     responses:
 *       200:
 *         description: Ruta actualizada
 */
router.put("/rutas/:id", async (req, res, next) => {
  try {
    const item = await prisma.ruta.update({
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
 * /operaciones/rutas/{id}:
 *   delete:
 *     tags: [Operaciones]
 *     summary: Eliminar ruta
 *     description: Elimina una ruta del sistema.
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
 *         description: Ruta eliminada
 */
router.delete("/rutas/:id", async (req, res, next) => {
  try {
    await prisma.ruta.delete({ where: { id: req.params.id as string } });
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

// ─── Programaciones ───

/**
 * @swagger
 * /operaciones/programaciones:
 *   get:
 *     tags: [Operaciones]
 *     summary: Listar programaciones
 *     description: Obtiene la lista de programaciones de rutas con detalles de ruta, vehículo y conductor.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de programaciones
 */
router.get("/programaciones", async (_req, res, next) => {
  try {
    const items = await prisma.programacionRuta.findMany({
      include: {
        ruta: true,
        vehiculo: { include: { marca: true, modelo: true } },
        conductor: true,
      },
      orderBy: { fecha: "desc" },
    });

    const formatted = items.map((p: any) => ({
      id: p.id,
      rutaId: p.rutaId,
      rutaNombre: p.ruta.nombre,
      rutaOrigen: p.ruta.origen,
      rutaDestino: p.ruta.destino,
      distanciaKm: p.ruta.distanciaKm,
      vehiculoId: p.vehiculoId,
      vehiculoPlaca: p.vehiculo.placa,
      vehiculoLabel: `${p.vehiculo.marca?.nombre || ""} ${p.vehiculo.modelo?.nombre || ""}`,
      conductorId: p.conductorId,
      conductorNombre: `${p.conductor.nombre} ${p.conductor.apellido}`,
      fecha: p.fecha,
      horaSalida: p.horaSalida,
      horaLlegada: p.horaLlegada,
      estado: p.estado,
      observaciones: p.observaciones,
    }));

    sendSuccess(res, formatted);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /operaciones/programaciones:
 *   post:
 *     tags: [Operaciones]
 *     summary: Crear programación
 *     description: Registra una nueva programación de ruta.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rutaId, vehiculoId, conductorId, fecha, horaSalida]
 *             properties:
 *               rutaId:
 *                 type: string
 *               vehiculoId:
 *                 type: string
 *               conductorId:
 *                 type: string
 *               fecha:
 *                 type: string
 *                 format: date
 *               horaSalida:
 *                 type: string
 *               horaLlegada:
 *                 type: string
 *               estado:
 *                 type: string
 *                 enum: [PROGRAMADO, EN_CURSO, COMPLETADO, CANCELADO]
 *     responses:
 *       201:
 *         description: Programación creada
 */
router.post("/programaciones", async (req, res, next) => {
  try {
    const item = await prisma.programacionRuta.create({
      data: req.body,
      include: { ruta: true, vehiculo: true, conductor: true },
    });
    sendCreated(res, item);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /operaciones/programaciones/{id}:
 *   put:
 *     tags: [Operaciones]
 *     summary: Actualizar programación
 *     description: Actualiza una programación de ruta existente.
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
 *                 enum: [PROGRAMADO, EN_CURSO, COMPLETADO, CANCELADO]
 *               observaciones:
 *                 type: string
 *     responses:
 *       200:
 *         description: Programación actualizada
 */
router.put("/programaciones/:id", async (req, res, next) => {
  try {
    const item = await prisma.programacionRuta.update({
      where: { id: req.params.id as string },
      data: req.body,
      include: { ruta: true, vehiculo: true, conductor: true },
    });
    sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /operaciones/programaciones/{id}:
 *   delete:
 *     tags: [Operaciones]
 *     summary: Eliminar programación
 *     description: Elimina una programación de ruta.
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
 *         description: Programación eliminada
 */
router.delete("/programaciones/:id", async (req, res, next) => {
  try {
    await prisma.programacionRuta.delete({
      where: { id: req.params.id as string },
    });
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

export { router as operacionesRoutes };
