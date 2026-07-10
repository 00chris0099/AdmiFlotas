// ============================================================
// SAF Backend - Costos Routes
// ============================================================

import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from "../utils/apiResponse.js";
import prisma from "../config/database.js";

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /control_costos/reportes-kpi:
 *   get:
 *     tags: [Costos]
 *     summary: Reportes KPI de costos
 *     description: Obtiene el resumen de KPIs de costos por vehículo.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de KPIs por vehículo
 */
router.get("/reportes-kpi", async (_req, res, next) => {
  try {
    const kpis = await prisma.resumenKpisVehiculo.findMany({
      include: { vehiculo: { include: { marca: true, modelo: true } } },
    });
    sendSuccess(res, kpis);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /control_costos/costos-fijo-variable:
 *   get:
 *     tags: [Costos]
 *     summary: Listar costos fijos prorrateables
 *     description: Obtiene la lista de costos fijos prorrateables con paginación.
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
 *         description: Lista paginada de costos fijos
 */
router.get("/costos-fijo-variable", async (req, res, next) => {
  try {
    const { page = "1", limit = "20" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      prisma.costoFijoProrrateable.findMany({
        skip,
        take: limitNum,
        orderBy: { periodo: "desc" },
      }),
      prisma.costoFijoProrrateable.count(),
    ]);

    sendPaginated(res, items, total, pageNum, limitNum);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /control_costos/costos-fijo-variable:
 *   post:
 *     tags: [Costos]
 *     summary: Crear costo fijo prorrateable
 *     description: Registra un nuevo costo fijo prorrateable.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [periodo, descripcion, monto]
 *             properties:
 *               periodo:
 *                 type: string
 *                 example: "2026-07"
 *               descripcion:
 *                 type: string
 *               monto:
 *                 type: number
 *     responses:
 *       201:
 *         description: Costo creado
 */
router.post("/costos-fijo-variable", async (req, res, next) => {
  try {
    const item = await prisma.costoFijoProrrateable.create({ data: req.body });
    sendCreated(res, item);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /control_costos/costos-fijo-variable/{id}:
 *   delete:
 *     tags: [Costos]
 *     summary: Eliminar costo fijo prorrateable
 *     description: Elimina un costo fijo prorrateable.
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
 *         description: Costo eliminado
 */
router.delete("/costos-fijo-variable/:id", async (req, res, next) => {
  try {
    await prisma.costoFijoProrrateable.delete({
      where: { id: req.params.id as string },
    });
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /control_costos/sustitucion:
 *   get:
 *     tags: [Costos]
 *     summary: Curva de sustitución CPA
 *     description: Calcula la curva de Costo Por Año (CPA) para cada vehículo, proyectando depreciación, mantenimiento y combustible a lo largo de su vida útil.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Análisis de sustitución con curva CPA por vehículo
 */
router.get("/sustitucion", async (_req, res, next) => {
  try {
    const vehiculos = await prisma.vehiculo.findMany({
      where: { estado: { isNot: null } },
      include: {
        marca: true,
        modelo: true,
        estado: true,
        ordenesCombustible: {
          select: { costoCombustible: true, cantidadGalones: true, fecha: true },
          orderBy: { fecha: "asc" },
        },
        ordenesMantenimiento: {
          select: { costoTotal: true, fechaEmision: true },
          orderBy: { fechaEmision: "asc" },
        },
      },
    });

    const result = vehiculos.map((v: any) => {
      const totalCombustible = v.ordenesCombustible.reduce(
        (sum: number, o: any) => sum + Number(o.costoCombustible || 0),
        0
      );
      const totalMantenimiento = v.ordenesMantenimiento.reduce(
        (sum: number, o: any) => sum + Number(o.costoTotal || 0),
        0
      );
      const costoAdquisicion = Number(v.valorAdquisicion || 0);
      const vidaUtilAnios = v.vidaUtilAnios || 5;
      const kmAnuales = v.kmAnualesReferencia || 30000;
      const depreciacionAnual = costoAdquisicion / vidaUtilAnios;

      // CPA curve: annual cost projections
      const curvaCpa = [];
      for (let year = 1; year <= vidaUtilAnios; year++) {
        const depreciacion = depreciacionAnual;
        const mantenimiento = totalMantenimiento * (1 + (year - 1) * 0.15);
        const combustible = totalCombustible * (1 - (year - 1) * 0.03);
        const costoAnual = depreciacion + mantenimiento + combustible;
        const costoKm = kmAnuales > 0 ? costoAnual / kmAnuales : 0;

        curvaCpa.push({
          anio: year,
          depreciacion,
          mantenimiento,
          combustible,
          costoAnual,
          costoKm,
        });
      }

      return {
        vehiculoId: v.id,
        placa: v.placa,
        marca: v.marca?.nombre || "",
        modelo: v.modelo?.nombre || "",
        vidaUtilAnios,
        costoAdquisicion,
        kmAnuales,
        totalCombustible,
        totalMantenimiento,
        depreciacionAnual,
        curvaCpa,
      };
    });

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

export { router as costosRoutes };
