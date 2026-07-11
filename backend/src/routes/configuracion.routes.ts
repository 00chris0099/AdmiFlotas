// ============================================================
// SAF Backend - Configuracion Routes
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
 * /configuracion:
 *   get:
 *     tags: [Configuracion]
 *     summary: Listar parámetros de configuración
 *     description: Obtiene los parámetros de configuración del sistema, opcionalmente filtrados por grupo.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: grupo
 *         schema:
 *           type: string
 *         description: Filtrar por grupo de configuración
 *     responses:
 *       200:
 *         description: Lista de parámetros
 */
router.get("/", async (req, res, next) => {
  try {
    const { grupo } = req.query;
    const where = grupo ? { grupo: grupo as string } : {};
    const items = await prisma.configuracionFlota.findMany({
      where,
      orderBy: [{ grupo: "asc" }, { clave: "asc" }],
    });
    sendSuccess(res, items);
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /configuracion/{clave}:
 *   get:
 *     tags: [Configuracion]
 *     summary: Obtener parámetro por clave
 *     description: Retorna un parámetro de configuración específico por su clave.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clave
 *         required: true
 *         schema:
 *           type: string
 *         description: Clave del parámetro
 *     responses:
 *       200:
 *         description: Parámetro encontrado
 *       404:
 *         description: Parámetro no encontrado
 */
router.get("/:clave", async (req, res, next) => {
  try {
    const item = await prisma.configuracionFlota.findUnique({
      where: { clave: req.params.clave },
    });
    if (!item) {
      return res.status(404).json({ error: "Parámetro no encontrado" });
    }
    sendSuccess(res, item);
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /configuracion/{clave}:
 *   put:
 *     tags: [Configuracion]
 *     summary: Actualizar parámetro
 *     description: Actualiza o crea un parámetro de configuración (upsert). Solo administradores.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clave
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
 *               valor:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               grupo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Parámetro actualizado
 */
router.put("/:clave", requireRole("ADMINISTRADOR", "JEFE_PROCESO"), async (req, res, next) => {
  try {
    const clave = req.params.clave as string;
    const { valor, descripcion, grupo } = req.body;
    const item = await prisma.configuracionFlota.upsert({
      where: { clave },
      update: { valor, descripcion, grupo },
      create: { clave, valor, descripcion, grupo },
    });
    sendSuccess(res, item);
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /configuracion:
 *   post:
 *     tags: [Configuracion]
 *     summary: Crear parámetro
 *     description: Crea un nuevo parámetro de configuración. Solo administradores.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clave, valor]
 *             properties:
 *               clave:
 *                 type: string
 *               valor:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               grupo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Parámetro creado
 */
router.post("/", requireRole("ADMINISTRADOR", "JEFE_PROCESO"), async (req, res, next) => {
  try {
    const item = await prisma.configuracionFlota.create({ data: req.body });
    sendCreated(res, item);
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /configuracion/{clave}:
 *   delete:
 *     tags: [Configuracion]
 *     summary: Eliminar parámetro
 *     description: Elimina un parámetro de configuración. Solo administradores.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clave
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Parámetro eliminado
 */
router.delete("/:clave", requireRole("ADMINISTRADOR", "JEFE_PROCESO"), async (req, res, next) => {
  try {
    await prisma.configuracionFlota.delete({ where: { clave: req.params.clave as string } });
    res.status(204).end();
  } catch (error) { next(error); }
});

export { router as configuracionRoutes };
