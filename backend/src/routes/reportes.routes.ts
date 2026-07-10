// ============================================================
// SAF Backend - Reportes Routes
// ============================================================

import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { AppError } from "../utils/errors.js";
import prisma from "../config/database.js";

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /reportes/excel:
 *   get:
 *     tags: [Reportes]
 *     summary: Exportar vehículos a CSV
 *     description: Genera un archivo CSV con el reporte de vehículos incluyendo marca, modelo, estado y kostos.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [vehiculos, combustible, mantenimiento]
 *           default: vehiculos
 *         description: Tipo de reporte
 *     responses:
 *       200:
 *         description: Archivo CSV
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get("/excel", async (req, res, next) => {
  try {
    const tipo = (req.query.tipo as string) || "vehiculos";

    let csvContent = "";
    let filename = "";

    if (tipo === "vehiculos") {
      const vehiculos = await prisma.vehiculo.findMany({
        include: { marca: true, modelo: true, color: true, estado: true, tipoCombustible: true },
        orderBy: { placa: "asc" },
      });

      csvContent = "Placa,Código Patrimonial,Marca,Modelo,Color,Estado,Tipo Combustible,Año\n";
      for (const v of vehiculos) {
        csvContent += [
          v.placa,
          v.codigoPatrimonial || "",
          v.marca?.nombre || "",
          v.modelo?.nombre || "",
          v.color?.nombre || "",
          v.estado?.nombre || "",
          v.tipoCombustible?.nombre || "",
          v.anioFabricacion || "",
        ].map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",") + "\n";
      }
      filename = "reporte_vehiculos.csv";
    } else if (tipo === "combustible") {
      const ordenes = await prisma.ordenCombustible.findMany({
        include: {
          vehiculo: { include: { marca: true, modelo: true } },
          centroServicio: true,
        },
        orderBy: { fecha: "desc" },
      });

      csvContent = "N° Orden,Fecha,Placa,Vehículo,Centro Servicio,Galones,Costo Total\n";
      for (const o of ordenes) {
        csvContent += [
          o.numeroOrden,
          o.fecha ? new Date(o.fecha).toISOString().split("T")[0] : "",
          o.vehiculo?.placa || "",
          `${o.vehiculo?.marca?.nombre || ""} ${o.vehiculo?.modelo?.nombre || ""}`,
          o.centroServicio?.nombre || "",
          o.cantidadGalones || 0,
          o.costoCombustible || 0,
        ].map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",") + "\n";
      }
      filename = "reporte_combustible.csv";
    } else if (tipo === "mantenimiento") {
      const ordenes = await prisma.ordenMantenimiento.findMany({
        include: {
          vehiculo: { include: { marca: true, modelo: true } },
          tecnico: true,
        },
        orderBy: { fechaEmision: "desc" },
      });

      csvContent = "N° Orden,Fecha Emisión,Placa,Vehículo,Tipo,Técnico,Estado,Costo Total\n";
      for (const o of ordenes) {
        csvContent += [
          o.numeroOrden,
          o.fechaEmision ? new Date(o.fechaEmision).toISOString().split("T")[0] : "",
          o.vehiculo?.placa || "",
          `${o.vehiculo?.marca?.nombre || ""} ${o.vehiculo?.modelo?.nombre || ""}`,
          o.tipoMantenimiento || "",
          o.tecnico ? `${o.tecnico.nombre} ${o.tecnico.apellido}` : "",
          o.estado || "",
          o.costoTotal || 0,
        ].map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",") + "\n";
      }
      filename = "reporte_mantenimiento.csv";
    } else {
      throw new AppError("Tipo de reporte no válido. Use: vehiculos, combustible, mantenimiento", 400);
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send("\uFEFF" + csvContent); // BOM for Excel UTF-8 compatibility
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /reportes/pdf:
 *   get:
 *     tags: [Reportes]
 *     summary: Obtener datos para reporte PDF
 *     description: Retorna los datos JSON completos para que el frontend genere el PDF con jsPDF. Soporta orden de mantenimiento, combustible y movimiento diario.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [orden_mantenimiento, orden_combustible, movimiento_diario]
 *         description: Tipo de reporte
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del registro
 *     responses:
 *       200:
 *         description: Datos del reporte en formato JSON
 *       400:
 *         description: Tipo o ID no válido
 *       404:
 *         description: Registro no encontrado
 */
router.get("/pdf", async (req, res, next) => {
  try {
    const { tipo, id } = req.query;

    if (!tipo || !id) {
      throw new AppError("Parámetros 'tipo' e 'id' son requeridos", 400);
    }

    if (tipo === "orden_mantenimiento") {
      const orden = await prisma.ordenMantenimiento.findUnique({
        where: { id: id as string },
        include: {
          vehiculo: { include: { marca: true, modelo: true, color: true } },
          tecnico: true,
          repuestos: true,
          manoDeObra: true,
        },
      });

      if (!orden) {
        throw new AppError("Orden de mantenimiento no encontrada", 404);
      }

      sendSuccess(res, orden);
    } else if (tipo === "orden_combustible") {
      const orden = await prisma.ordenCombustible.findUnique({
        where: { id: id as string },
        include: {
          vehiculo: { include: { marca: true, modelo: true } },
          centroServicio: true,
          sectorSolicitante: true,
        },
      });

      if (!orden) {
        throw new AppError("Orden de combustible no encontrada", 404);
      }

      sendSuccess(res, orden);
    } else if (tipo === "movimiento_diario") {
      const movimiento = await prisma.movimientoDiario.findUnique({
        where: { id: id as string },
        include: {
          vehiculo: { include: { marca: true, modelo: true } },
          conductor: true,
          inspector: true,
          checklist: true,
        },
      });

      if (!movimiento) {
        throw new AppError("Movimiento diario no encontrado", 404);
      }

      sendSuccess(res, movimiento);
    } else {
      throw new AppError("Tipo de reporte no válido. Use: orden_mantenimiento, orden_combustible, movimiento_diario", 400);
    }
  } catch (error) {
    next(error);
  }
});

export { router as reportesRoutes };
