// ============================================================
// SAF Backend - Usuarios Routes
// ============================================================

import { Router } from "express";
import bcrypt from "bcryptjs";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { sendSuccess, sendCreated, sendPaginated } from "../utils/apiResponse.js";
import { validate } from "../middleware/validate.js";
import { createUsuarioSchema, updateUsuarioSchema } from "../schemas/auth.schema.js";
import prisma from "../config/database.js";

const router = Router();

router.use(authenticate);
router.use(requireRole("ADMINISTRADOR"));

/**
 * @swagger
 * /admin/usuarios:
 *   get:
 *     tags: [Usuarios]
 *     summary: Listar usuarios
 *     description: Obtiene la lista de usuarios con paginación y filtros. Solo administradores.
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre, apellido o email
 *       - in: query
 *         name: rolId
 *         schema:
 *           type: string
 *         description: Filtrar por rol
 *     responses:
 *       200:
 *         description: Lista paginada de usuarios
 */
router.get("/", async (req, res, next) => {
  try {
    const { page = "1", limit = "20", search, rolId } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      ...(search && {
        OR: [
          { nombre: { contains: search as string, mode: "insensitive" } },
          { apellido: { contains: search as string, mode: "insensitive" } },
          { email: { contains: search as string, mode: "insensitive" } },
        ],
      }),
      ...(rolId && { rolId: rolId as string }),
    };

    const [items, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        include: { rol: true },
        skip,
        take: limitNum,
        orderBy: { creadoEn: "desc" },
      }),
      prisma.usuario.count({ where }),
    ]);

    sendPaginated(res, items, total, pageNum, limitNum);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /admin/usuarios:
 *   post:
 *     tags: [Usuarios]
 *     summary: Crear usuario
 *     description: Crea un nuevo usuario en el sistema. Solo administradores. La contraseña por defecto es "saf123".
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, nombre, apellido, rolId]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               rolId:
 *                 type: string
 *               password:
 *                 type: string
 *                 description: Contraseña (opcional, default: saf123)
 *     responses:
 *       201:
 *         description: Usuario creado
 */
router.post("/", validate(createUsuarioSchema), async (req, res, next) => {
  try {
    const { password, ...userData } = req.body;
    const hashedPassword = await bcrypt.hash(password || "saf123", 10);

    const usuario = await prisma.usuario.create({
      data: { ...userData, password: hashedPassword },
      include: { rol: true },
    });

    sendCreated(res, usuario);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /admin/usuarios/{id}:
 *   put:
 *     tags: [Usuarios]
 *     summary: Actualizar usuario
 *     description: Actualiza los datos de un usuario existente. Solo administradores.
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
 *               apellido:
 *                 type: string
 *               email:
 *                 type: string
 *               rolId:
 *                 type: string
 *               activo:
 *                 type: boolean
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
router.put("/:id", validate(updateUsuarioSchema), async (req, res, next) => {
  try {
    const { password, ...userData } = req.body;
    const updateData: any = { ...userData };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const usuario = await prisma.usuario.update({
      where: { id: req.params.id as string },
      data: updateData,
      include: { rol: true },
    });

    sendSuccess(res, usuario);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /admin/usuarios/{id}:
 *   delete:
 *     tags: [Usuarios]
 *     summary: Eliminar usuario
 *     description: Elimina un usuario del sistema. Solo administradores.
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
 *         description: Usuario eliminado
 */
router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.usuario.delete({ where: { id: req.params.id } });
    sendSuccess(res, { message: "Usuario eliminado" });
  } catch (error) {
    next(error);
  }
});

export { router as usuariosRoutes };
