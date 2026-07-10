// ============================================================
// SAF Backend - Mantenimiento Routes
// ============================================================

import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from "../utils/apiResponse.js";
import { validate } from "../middleware/validate.js";
import { createOrdenMantenimientoSchema } from "../schemas/business.schema.js";
import prisma from "../config/database.js";
import { generateNumeroOrden } from "../utils/orderGenerator.js";

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /control_mantenimiento:
 *   get:
 *     tags: [Mantenimiento]
 *     summary: Listar órdenes de mantenimiento
 *     description: Obtiene la lista de órdenes de mantenimiento con paginación.
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
 *         description: Lista paginada de órdenes de mantenimiento
 */
router.get("/", async (req, res, next) => {
  try {
    const { page = "1", limit = "20" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      prisma.ordenMantenimiento.findMany({
        include: {
          vehiculo: { include: { marca: true, modelo: true } },
          tecnico: true,
          repuestos: true,
          manoDeObra: true,
        },
        skip,
        take: limitNum,
        orderBy: { fechaEmision: "desc" },
      }),
      prisma.ordenMantenimiento.count(),
    ]);

    sendPaginated(res, items, total, pageNum, limitNum);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /control_mantenimiento/{id}:
 *   get:
 *     tags: [Mantenimiento]
 *     summary: Obtener orden de mantenimiento por ID
 *     description: Retorna una orden de mantenimiento con repuestos y mano de obra.
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
    const item = await prisma.ordenMantenimiento.findUnique({
      where: { id: req.params.id as string },
      include: {
        vehiculo: { include: { marca: true, modelo: true } },
        tecnico: true,
        repuestos: true,
        manoDeObra: true,
      },
    });
    sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /control_mantenimiento:
 *   post:
 *     tags: [Mantenimiento]
 *     summary: Crear orden de mantenimiento
 *     description: Registra una nueva orden de mantenimiento. El número de orden se genera automáticamente.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehiculoId, tipoMantenimiento]
 *             properties:
 *               vehiculoId:
 *                 type: string
 *               tipoMantenimiento:
 *                 type: string
 *                 enum: [PREVENTIVO, CORRECTIVO]
 *               tecnicoId:
 *                 type: string
 *               descripcionFalla:
 *                 type: string
 *               costoPiezasRepuestos:
 *                 type: number
 *               costoOtros:
 *                 type: number
 *     responses:
 *       201:
 *         description: Orden creada
 */
router.post("/", validate(createOrdenMantenimientoSchema), async (req, res, next) => {
  try {
    const numeroOrden = await generateNumeroOrden("OM");
    const orden = await prisma.ordenMantenimiento.create({
      data: {
        ...req.body,
        numeroOrden,
        fechaEmision: new Date(),
      },
      include: { vehiculo: true, tecnico: true, repuestos: true, manoDeObra: true },
    });
    sendCreated(res, orden);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /control_mantenimiento/{id}:
 *   put:
 *     tags: [Mantenimiento]
 *     summary: Actualizar orden de mantenimiento
 *     description: Actualiza una orden de mantenimiento. Soporta firmas digitales por tipo.
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
 *                 enum: [PENDIENTE, EN_PROCESO, COMPLETADO]
 *               firma:
 *                 type: string
 *                 description: Firma digital en base64
 *               tipoFirma:
 *                 type: string
 *                 enum: [encargado_taller, tecnico, jefe_mantenimiento]
 *     responses:
 *       200:
 *         description: Orden actualizada
 */
router.put("/:id", async (req, res, next) => {
  try {
    const { firma, tipoFirma, ...data } = req.body;

    const updateData: any = { ...data };

    if (firma && tipoFirma) {
      const firmaField =
        tipoFirma === "encargado_taller"
          ? "firmaEncargadoTaller"
          : tipoFirma === "tecnico"
          ? "firmaTecnico"
          : tipoFirma === "jefe_mantenimiento"
          ? "firmaJefeMantenimiento"
          : null;
      if (firmaField) {
        updateData[firmaField] = firma;
        if (tipoFirma === "tecnico") {
          updateData.fechaFirmaTecnico = new Date();
        }
      }
    }

    const item = await prisma.ordenMantenimiento.update({
      where: { id: req.params.id as string },
      data: updateData,
      include: { vehiculo: true, tecnico: true, repuestos: true, manoDeObra: true },
    });
    sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /control_mantenimiento/{id}:
 *   delete:
 *     tags: [Mantenimiento]
 *     summary: Eliminar orden de mantenimiento
 *     description: Elimina una orden de mantenimiento del sistema.
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
    await prisma.ordenMantenimiento.delete({
      where: { id: req.params.id as string },
    });
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /control_mantenimiento/mano-obra:
 *   post:
 *     tags: [Mantenimiento]
 *     summary: Agregar detalle de mano de obra
 *     description: Agrega un detalle de mano de obra a una orden y recalcula el costo total.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ordenMantenimientoId, descripcionTarea, horasTrabajadas, costoHora]
 *             properties:
 *               ordenMantenimientoId:
 *                 type: string
 *               descripcionTarea:
 *                 type: string
 *               horasTrabajadas:
 *                 type: number
 *               costoHora:
 *                 type: number
 *               nombreTecnico:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mano de obra agregada
 */
router.post("/mano-obra", async (req, res, next) => {
  try {
    const { ordenMantenimientoId, descripcionTarea, horasTrabajadas, costoHora, nombreTecnico } = req.body;
    const subtotal = parseFloat(horasTrabajadas) * parseFloat(costoHora);

    const item = await prisma.detalleManoObra.create({
      data: {
        ordenMantenimientoId,
        descripcionTarea,
        horasTrabajadas: parseFloat(horasTrabajadas),
        costoHora: parseFloat(costoHora),
        subtotal,
        nombreTecnico: nombreTecnico || null,
      },
    });

    // Update order total cost
    const order = await prisma.ordenMantenimiento.findUnique({
      where: { id: ordenMantenimientoId },
      select: { manoDeObra: true, costoPiezasRepuestos: true, costoOtros: true },
    });
    if (order) {
      const totalManoObra = order.manoDeObra.reduce((sum: number, m: any) => sum + Number(m.subtotal), 0) + Number(subtotal);
      const costoTotal = totalManoObra + Number(order.costoPiezasRepuestos || 0) + Number(order.costoOtros || 0);
      await prisma.ordenMantenimiento.update({
        where: { id: ordenMantenimientoId },
        data: { costoManoObraPropia: totalManoObra, costoTotal },
      });
    }

    sendCreated(res, item);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /control_mantenimiento/mano-obra/{id}:
 *   delete:
 *     tags: [Mantenimiento]
 *     summary: Eliminar detalle de mano de obra
 *     description: Elimina un detalle de mano de obra y recalcula el costo total de la orden.
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
 *         description: Mano de obra eliminada
 */
router.delete("/mano-obra/:id", async (req, res, next) => {
  try {
    const item = await prisma.detalleManoObra.delete({
      where: { id: req.params.id as string },
    });

    // Recalculate order total
    const order = await prisma.ordenMantenimiento.findUnique({
      where: { id: item.ordenMantenimientoId },
      select: { manoDeObra: true, costoPiezasRepuestos: true, costoOtros: true },
    });
    if (order) {
      const totalManoObra = order.manoDeObra.reduce((sum: number, m: any) => sum + Number(m.subtotal), 0);
      const costoTotal = totalManoObra + Number(order.costoPiezasRepuestos || 0) + Number(order.costoOtros || 0);
      await prisma.ordenMantenimiento.update({
        where: { id: item.ordenMantenimientoId },
        data: { costoManoObraPropia: totalManoObra, costoTotal },
      });
    }

    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

export { router as mantenimientoRoutes };
