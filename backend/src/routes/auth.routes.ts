// ============================================================
// SAF Backend - Auth Routes
// ============================================================

import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import prisma from "../config/database.js";
import { env } from "../config/env.js";
import { authenticate } from "../middleware/auth.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { AppError } from "../utils/errors.js";
import { sendEmail, generatePasswordResetEmail, generateUserConfirmationEmail } from "../utils/email.js";
import { validate } from "../middleware/validate.js";
import { loginSchema } from "../schemas/auth.schema.js";
import crypto from "crypto";

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión
 *     description: Autentica un usuario con email y contraseña, retorna un token JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@saf.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT token (válido 8 horas)
 *                     usuario:
 *                       $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Email y contraseña requeridos
 *       401:
 *         description: Credenciales inválidas
 *       403:
 *         description: Usuario desactivado o bloqueado
 */
router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email y contraseña son requeridos", 400);
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { rol: true },
    });

    if (!usuario) {
      throw new AppError("Credenciales inválidas", 401);
    }

    if (!usuario.activo) {
      throw new AppError("Usuario desactivado", 403);
    }

    if (usuario.bloqueadoHasta && usuario.bloqueadoHasta > new Date()) {
      throw new AppError("Usuario bloqueado temporalmente", 403);
    }

    if (!usuario.password) {
      throw new AppError("Usuario sin contraseña configurada", 401);
    }

    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) {
      const intentos = await prisma.usuario.update({
        where: { id: usuario.id },
        data: { intentosFallidos: { increment: 1 } },
      });

      if (intentos.intentosFallidos >= 5) {
        const bloqueadoHasta = new Date();
        bloqueadoHasta.setMinutes(bloqueadoHasta.getMinutes() + 30);
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { bloqueadoHasta },
        });
        throw new AppError("Usuario bloqueado por intentos fallidos", 403);
      }

      throw new AppError("Credenciales inválidas", 401);
    }

    // Reset intentos fallidos
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { intentosFallidos: 0, bloqueadoHasta: null, ultimoAcceso: new Date() },
    });

    const options: SignOptions = { expiresIn: 28800 }; // 8 hours in seconds
    const token = jwt.sign(
      {
        userId: usuario.id,
        email: usuario.email,
        rol: usuario.rol?.codigo,
      },
      env.JWT_SECRET,
      options
    );

    const { password: _, rol: rolObj, ...rest } = usuario;

    sendSuccess(res, {
      token,
      usuario: { ...rest, rol: rolObj?.codigo ?? rolObj ?? null },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Cerrar sesión
 *     description: Invalida la sesión del usuario actual.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *       401:
 *         description: No autenticado
 */
router.post("/logout", authenticate, async (req, res, next) => {
  try {
    // In a real app, you'd invalidate the token
    sendSuccess(res, { message: "Sesión cerrada exitosamente" });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Obtener usuario actual
 *     description: Retorna los datos del usuario autenticado actualmente.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Usuario no encontrado
 */
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user!.userId },
      include: { rol: true },
    });

    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }

    const { password: _, rol: rolObj, ...rest } = usuario;
    sendSuccess(res, { ...rest, rol: rolObj?.codigo ?? rolObj ?? null });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/solicitar-cambio-password:
 *   post:
 *     tags: [Auth]
 *     summary: Solicitar cambio de contraseña
 *     description: Genera un token de un solo uso y envía un email con el enlace para restablecer la contraseña. Si el email no existe, retorna 200 igualmente por seguridad.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Si el email existe, se envió un enlace de restablecimiento
 */
router.post("/solicitar-cambio-password", async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError("Email es requerido", 400);
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    // Always return 200 to not reveal whether the email exists
    if (usuario) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiraEn = new Date();
      expiraEn.setHours(expiraEn.getHours() + 1);

      await prisma.tokenConfirmacion.create({
        data: {
          usuarioId: usuario.id,
          token,
          tipo: "CAMBIO_PASSWORD",
          expiraEn,
        },
      });

      try {
        await sendEmail({
          to: usuario.email,
          subject: "SAF - Restablecer Contraseña",
          html: generatePasswordResetEmail(token, `${usuario.nombre} ${usuario.apellido}`),
        });
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
      }
    }

    sendSuccess(res, { message: "Si el email existe, recibirás un enlace de restablecimiento" });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/confirmar-usuario:
 *   post:
 *     tags: [Auth]
 *     summary: Confirmar cuenta de usuario
 *     description: Valida el token de confirmación, establece la contraseña del usuario y marca la cuenta como confirmada.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Cuenta confirmada exitosamente
 *       400:
 *         description: Token inválido, expirado o ya utilizado
 */
router.post("/confirmar-usuario", async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new AppError("Token y contraseña son requeridos", 400);
    }

    if (password.length < 6) {
      throw new AppError("La contraseña debe tener al menos 6 caracteres", 400);
    }

    const tokenRecord = await prisma.tokenConfirmacion.findUnique({
      where: { token },
      include: { usuario: true },
    });

    if (!tokenRecord) {
      throw new AppError("Token inválido", 400);
    }

    if (tokenRecord.usadoEn) {
      throw new AppError("Este token ya fue utilizado", 400);
    }

    if (tokenRecord.expiraEn < new Date()) {
      throw new AppError("Token expirado", 400);
    }

    if (tokenRecord.tipo !== "CONFIRMACION_USUARIO") {
      throw new AppError("Tipo de token inválido", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx: any) => {
      await tx.usuario.update({
        where: { id: tokenRecord.usuarioId },
        data: { password: hashedPassword, activo: true },
      });

      await tx.tokenConfirmacion.update({
        where: { id: tokenRecord.id },
        data: { usadoEn: new Date() },
      });
    });

    sendSuccess(res, { message: "Cuenta confirmada exitosamente" });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/cambiar-password:
 *   post:
 *     tags: [Auth]
 *     summary: Cambiar contraseña
 *     description: Valida el token de cambio de contraseña y actualiza la contraseña del usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *       400:
 *         description: Token inválido, expirado o ya utilizado
 */
router.post("/cambiar-password", async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new AppError("Token y contraseña son requeridos", 400);
    }

    if (password.length < 6) {
      throw new AppError("La contraseña debe tener al menos 6 caracteres", 400);
    }

    const tokenRecord = await prisma.tokenConfirmacion.findUnique({
      where: { token },
    });

    if (!tokenRecord) {
      throw new AppError("Token inválido", 400);
    }

    if (tokenRecord.usadoEn) {
      throw new AppError("Este token ya fue utilizado", 400);
    }

    if (tokenRecord.expiraEn < new Date()) {
      throw new AppError("Token expirado", 400);
    }

    if (tokenRecord.tipo !== "CAMBIO_PASSWORD") {
      throw new AppError("Tipo de token inválido", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx: any) => {
      await tx.usuario.update({
        where: { id: tokenRecord.usuarioId },
        data: { password: hashedPassword, intentosFallidos: 0, bloqueadoHasta: null },
      });

      await tx.tokenConfirmacion.update({
        where: { id: tokenRecord.id },
        data: { usadoEn: new Date() },
      });
    });

    sendSuccess(res, { message: "Contraseña cambiada exitosamente" });
  } catch (error) {
    next(error);
  }
});

export { router as authRoutes };
