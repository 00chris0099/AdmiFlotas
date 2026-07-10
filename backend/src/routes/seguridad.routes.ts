// ============================================================
// SAF Backend - Seguridad Routes (Permisos, Sesiones, Auditoría)
// ============================================================

import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/apiResponse.js";
import { AppError } from "../utils/errors.js";
import prisma from "../config/database.js";

const router = Router();
router.use(authenticate);
router.use(requireRole("ADMINISTRADOR"));

// ─── Permisos ───

/**
 * @swagger
 * /admin/permisos:
 *   get:
 *     tags: [Seguridad]
 *     summary: Listar permisos
 *     description: Obtiene todos los permisos del sistema con los usuarios asignados a cada uno. Solo administradores.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de permisos con usuarios
 */
router.get("/permisos", async (_req, res, next) => {
  try {
    const permisos = await prisma.permiso.findMany({
      include: {
        usuarios: {
          include: {
            usuario: {
              select: { id: true, nombre: true, apellido: true, email: true },
            },
          },
        },
      },
      orderBy: [{ modulo: "asc" }, { accion: "asc" }],
    });
    sendSuccess(res, permisos);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /admin/permisos:
 *   post:
 *     tags: [Seguridad]
 *     summary: Asignar permiso a usuario
 *     description: Asigna un permiso específico a un usuario. Solo administradores.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [usuarioId, permisoId]
 *             properties:
 *               usuarioId:
 *                 type: string
 *                 format: uuid
 *               permisoId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Permiso asignado
 *       409:
 *         description: El permiso ya está asignado a este usuario
 */
router.post("/permisos", async (req, res, next) => {
  try {
    const { usuarioId, permisoId } = req.body;

    if (!usuarioId || !permisoId) {
      throw new AppError("usuarioId y permisoId son requeridos", 400);
    }

    const existing = await prisma.permisoUsuario.findUnique({
      where: { usuarioId_permisoId: { usuarioId, permisoId } },
    });

    if (existing) {
      throw new AppError("Este permiso ya está asignado a este usuario", 409);
    }

    const permiso = await prisma.permisoUsuario.create({
      data: { usuarioId, permisoId },
      include: { usuario: true, permiso: true },
    });

    sendCreated(res, permiso);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /admin/permisos:
 *   delete:
 *     tags: [Seguridad]
 *     summary: Quitar permiso a usuario
 *     description: Elimina la asignación de un permiso a un usuario. Solo administradores.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID del usuario
 *       - in: query
 *         name: permisoId
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID del permiso
 *     responses:
 *       204:
 *         description: Permiso removido
 */
router.delete("/permisos", async (req, res, next) => {
  try {
    const { usuarioId, permisoId } = req.query;

    if (!usuarioId || !permisoId) {
      throw new AppError("usuarioId y permisoId son requeridos", 400);
    }

    await prisma.permisoUsuario.deleteMany({
      where: {
        usuarioId: usuarioId as string,
        permisoId: permisoId as string,
      },
    });

    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

// ─── Sesiones ───

/**
 * @swagger
 * /admin/sesiones:
 *   get:
 *     tags: [Seguridad]
 *     summary: Listar sesiones
 *     description: Obtiene todas las sesiones de autenticación con información del usuario. Solo administradores.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sesiones
 */
router.get("/sesiones", async (_req, res, next) => {
  try {
    const sesiones = await prisma.sesionAuth.findMany({
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido: true, email: true, rol: true },
        },
      },
      orderBy: { iniciadaEn: "desc" },
    });
    sendSuccess(res, sesiones);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /admin/sesiones:
 *   delete:
 *     tags: [Seguridad]
 *     summary: Cerrar sesión remota
 *     description: Cierra una sesión de autenticación de forma remota. Solo administradores.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID de la sesión
 *     responses:
 *       204:
 *         description: Sesión cerrada
 */
router.delete("/sesiones", async (req, res, next) => {
  try {
    const { id } = req.query;

    if (!id) {
      throw new AppError("id de sesión es requerido", 400);
    }

    await prisma.sesionAuth.update({
      where: { id: id as string },
      data: { estado: "CERRADA", cerradaEn: new Date() },
    });

    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

// ─── Auditoría ───

/**
 * @swagger
 * /admin/audit:
 *   get:
 *     tags: [Seguridad]
 *     summary: Listar logs de auditoría
 *     description: Obtiene los registros de auditoría del sistema con filtros opcionales por módulo y rango de fechas. Solo administradores.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: modulo
 *         schema:
 *           type: string
 *         description: Filtrar por módulo
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de logs de auditoría
 */
router.get("/audit", async (req, res, next) => {
  try {
    const { modulo, fechaInicio, fechaFin } = req.query;

    const where: any = {};
    if (modulo) where.modulo = modulo as string;
    if (fechaInicio || fechaFin) {
      where.creadoEn = {};
      if (fechaInicio) where.creadoEn.gte = new Date(fechaInicio as string);
      if (fechaFin) where.creadoEn.lte = new Date(fechaFin as string);
    }

    const logs = await prisma.auditoria.findMany({
      where,
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido: true, email: true, rol: true },
        },
      },
      orderBy: { creadoEn: "desc" },
      take: 500,
    });

    sendSuccess(res, logs);
  } catch (error) {
    next(error);
  }
});

export { router as seguridadRoutes };
