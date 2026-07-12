// ============================================================
// SAF Backend - Vehiculos Routes
// ============================================================

import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { sendSuccess, sendCreated, sendPaginated, sendError } from "../utils/apiResponse.js";
import { flattenVehiculo } from "../utils/flatten.js";
import { validate } from "../middleware/validate.js";
import { createVehiculoSchema, updateVehiculoSchema } from "../schemas/vehiculo.schema.js";
import prisma from "../config/database.js";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /vehiculos:
 *   get:
 *     tags: [Vehiculos]
 *     summary: Listar vehículos
 *     description: Obtiene la lista de vehículos con paginación y filtros opcionales.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por placa o código patrimonial
 *       - in: query
 *         name: estadoId
 *         schema:
 *           type: string
 *         description: Filtrar por estado del vehículo
 *       - in: query
 *         name: marcaId
 *         schema:
 *           type: string
 *         description: Filtrar por marca
 *     responses:
 *       200:
 *         description: Lista paginada de vehículos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get("/", async (req, res, next) => {
  try {
    const { page = "1", limit = "20", search, estadoId, marcaId, includeBaja } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Buscar el ID del estado DADO_DE_BAJA para excluirlo por defecto
    const estadoBaja = await prisma.estadoVehiculo.findUnique({
      where: { codigo: "DADO_DE_BAJA" },
    });

    const where: any = {
      ...(search && {
        OR: [
          { placa: { contains: search as string, mode: "insensitive" } },
          { codigoPatrimonial: { contains: search as string, mode: "insensitive" } },
        ],
      }),
      ...(estadoId && { estadoId: estadoId as string }),
      ...(!estadoId && !includeBaja && estadoBaja && {
        estadoId: { not: estadoBaja.id },
      }),
      ...(marcaId && { marcaId: marcaId as string }),
    };

    const [items, total] = await Promise.all([
      prisma.vehiculo.findMany({
        where,
        include: { marca: true, modelo: true, color: true, tipoCombustible: true, estado: true },
        skip,
        take: limitNum,
        orderBy: { creadoEn: "desc" },
      }),
      prisma.vehiculo.count({ where }),
    ]);

    sendPaginated(res, items.map(flattenVehiculo), total, pageNum, limitNum);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /vehiculos/{id}:
 *   get:
 *     tags: [Vehiculos]
 *     summary: Obtener vehículo por ID
 *     description: Retorna un vehículo con todas sus relaciones.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID del vehículo
 *     responses:
 *       200:
 *         description: Vehículo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehiculo'
 *       404:
 *         description: Vehículo no encontrado
 */
router.get("/:id", async (req, res, next) => {
  try {
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id: req.params.id },
      include: { marca: true, modelo: true, color: true, tipoCombustible: true, estado: true },
    });
    sendSuccess(res, flattenVehiculo(vehiculo));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /vehiculos:
 *   post:
 *     tags: [Vehiculos]
 *     summary: Crear vehículo
 *     description: Registra un nuevo vehículo en el sistema. Requiere rol ADMINISTRADOR o JEFE_PROCESO.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [placa]
 *             properties:
 *               placa:
 *                 type: string
 *                 example: ABC-123
 *               codigoPatrimonial:
 *                 type: string
 *               marcaId:
 *                 type: string
 *               modeloId:
 *                 type: string
 *               colorId:
 *                 type: string
 *               tipoCombustibleId:
 *                 type: string
 *               estadoId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Vehículo creado
 *       403:
 *         description: Sin permisos
 */
router.post("/", requireRole("ADMINISTRADOR", "JEFE_PROCESO"), validate(createVehiculoSchema), async (req, res, next) => {
  try {
    const {
      marca, modelo, color, tipoCombustible, categoriaPatrimonial,
      capacidadPasajeros, capacidadCargaKg,
      ...rest
    } = req.body;

    // Resolver nombres a UUIDs de tablas de normalización
    const [marcaRecord, modeloRecord, colorRecord, tipoCombustibleRecord, categoriaRecord] = await Promise.all([
      prisma.marcaVehiculo.findFirst({ where: { nombre: marca } }),
      prisma.modeloVehiculo.findFirst({ where: { nombre: modelo } }),
      color ? prisma.colorVehiculo.findFirst({ where: { nombre: color } }) : Promise.resolve(null),
      tipoCombustible ? prisma.tipoCombustible.findFirst({ where: { nombre: tipoCombustible } }) : Promise.resolve(null),
      categoriaPatrimonial ? prisma.categoriaVehiculo.findFirst({ where: { codigo: categoriaPatrimonial } }) : Promise.resolve(null),
    ]);

    const data: any = {
      ...rest,
      ...(marcaRecord && { marcaId: marcaRecord.id }),
      ...(modeloRecord && { modeloId: modeloRecord.id }),
      ...(colorRecord && { colorId: colorRecord.id }),
      ...(tipoCombustibleRecord && { tipoCombustibleId: tipoCombustibleRecord.id }),
      ...(categoriaRecord && { categoriaPatrimonialId: categoriaRecord.id }),
      capacidadPasajeros: capacidadPasajeros ?? undefined,
      capacidadCargaKg: capacidadCargaKg ?? undefined,
      clasePatrimonial: rest.clasePatrimonial || "01",
      secuencial: rest.secuencial || "001",
      codigoPatrimonial: rest.codigoPatrimonial || `01-01-001`,
    };

    const vehiculo = await prisma.vehiculo.create({
      data,
      include: { marca: true, modelo: true, color: true, tipoCombustible: true, estado: true },
    });
    sendCreated(res, vehiculo);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /vehiculos/{id}:
 *   put:
 *     tags: [Vehiculos]
 *     summary: Actualizar vehículo
 *     description: Actualiza los datos de un vehículo existente. Requiere rol ADMINISTRADOR o JEFE_PROCESO.
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
 *               placa:
 *                 type: string
 *               estadoId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vehículo actualizado
 *       403:
 *         description: Sin permisos
 */
router.put("/:id", requireRole("ADMINISTRADOR", "JEFE_PROCESO"), validate(updateVehiculoSchema), async (req, res, next) => {
  try {
    const vehiculo = await prisma.vehiculo.update({
      where: { id: req.params.id as string },
      data: req.body,
      include: { marca: true, modelo: true, color: true, tipoCombustible: true, estado: true },
    });
    sendSuccess(res, vehiculo);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /vehiculos/{id}:
 *   delete:
 *     tags: [Vehiculos]
 *     summary: Eliminar vehículo
 *     description: Elimina un vehículo del sistema. Solo ADMINISTRADOR.
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
 *         description: Vehículo eliminado
 *       403:
 *         description: Sin permisos (solo ADMINISTRADOR)
 */
router.delete("/:id", requireRole("ADMINISTRADOR", "JEFE_PROCESO"), async (req, res, next) => {
  try {
    const vehiculoId = req.params.id as string;

    // Verificar que el vehículo existe
    const vehiculo = await prisma.vehiculo.findUnique({ where: { id: vehiculoId } });
    if (!vehiculo) {
      return sendError(res, "Vehículo no encontrado", 404);
    }

    // Buscar el estado "DADO_DE_BAJA"
    const estadoBaja = await prisma.estadoVehiculo.findUnique({
      where: { codigo: "DADO_DE_BAJA" },
    });

    if (!estadoBaja) {
      return sendError(res, "Estado DADO_DE_BAJA no configurado en el sistema", 500);
    }

    // Soft delete: cambiar estado en vez de eliminar físicamente
    await prisma.vehiculo.update({
      where: { id: vehiculoId },
      data: { estadoId: estadoBaja.id },
    });

    sendSuccess(res, { message: "Vehículo dado de baja correctamente" });
  } catch (error) {
    next(error);
  }
});

export { router as vehiculosRoutes };
