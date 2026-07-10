// ============================================================
// SAF Backend - Zod Validation Middleware
// ============================================================

import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        }));
        _res.status(400).json({
          success: false,
          error: "Error de validación",
          details: errors,
        });
        return;
      }
      next(error);
    }
  };
}
