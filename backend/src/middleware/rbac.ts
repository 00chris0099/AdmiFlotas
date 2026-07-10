// ============================================================
// SAF Backend - RBAC (Role-Based Access Control) Middleware
// ============================================================

import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";
import prisma from "../config/database.js";

type Rol =
  | "JEFE_PROCESO"
  | "CONDUCTOR"
  | "INSPECTOR"
  | "MECANICO"
  | "ELECTRICISTA"
  | "ENCARGADO_TALLER"
  | "LAVADOR"
  | "JEFE_MANTENIMIENTO"
  | "JEFE_OPERACION"
  | "CONTROLADOR_TRANSITO"
  | "ANALISTA"
  | "ADMINISTRATIVO"
  | "ADMINISTRADOR";

export function requireRole(...roles: Rol[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError("No autenticado", 401);
    }

    if (!roles.includes(req.user.rol as Rol)) {
      throw new AppError("No tiene permisos para realizar esta acción", 403);
    }

    next();
  };
}

export function requirePermission(modulo: string, accion: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError("No autenticado", 401);
      if (req.user.rol === "ADMINISTRADOR") return next();

      const permiso = await prisma.permisoUsuario.findFirst({
        where: {
          usuarioId: req.user.userId,
          permiso: { modulo, accion },
        },
        include: { permiso: true },
      });

      if (!permiso) {
        throw new AppError("No tiene permisos para esta acción", 403);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
