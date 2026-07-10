// ============================================================
// SAF Backend - Seguridad (RBAC + Permisos) Tests
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// Mock Prisma
vi.mock("../config/database.js", () => ({
  default: {
    permiso: {
      findMany: vi.fn(),
    },
    permisoUsuario: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    sesionAuth: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    auditoria: {
      findMany: vi.fn(),
    },
  },
}));

// Mock auth middleware
vi.mock("../middleware/auth.js", () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { userId: "user-1", email: "admin@saf.com", rol: "ADMINISTRADOR" };
    next();
  },
}));

// Mock rbac middleware
vi.mock("../middleware/rbac.js", () => ({
  requireRole: (...roles: string[]) => (req: any, _res: any, next: any) => {
    if (!req.user) {
      const error = new Error("No autenticado");
      (error as any).statusCode = 401;
      next(error);
      return;
    }
    if (roles.includes(req.user.rol)) {
      next();
    } else {
      const error = new Error("No tiene permisos");
      (error as any).statusCode = 403;
      next(error);
    }
  },
}));

import { seguridadRoutes } from "../routes/seguridad.routes.js";
import prisma from "../config/database.js";

const app = express();
app.use(express.json());
app.use("/api/admin", seguridadRoutes);

app.use((err: any, _req: any, res: any, _next: any) => {
  res.status(err.statusCode || 500).json({ success: false, error: err.message });
});

describe("Seguridad Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/admin/permisos", () => {
    it("should return all permissions with assigned users", async () => {
      const mockPermisos = [
        {
          id: "p1",
          modulo: "vehiculos",
          accion: "crear",
          usuarios: [
            { usuario: { id: "u1", nombre: "Admin", apellido: "SAF", email: "admin@saf.com" } },
          ],
        },
      ];

      (prisma.permiso.findMany as any).mockResolvedValue(mockPermisos);

      const res = await request(app).get("/api/admin/permisos");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].usuarios).toHaveLength(1);
    });
  });

  describe("POST /api/admin/permisos", () => {
    it("should assign a permission to a user", async () => {
      (prisma.permisoUsuario.findUnique as any).mockResolvedValue(null);
      (prisma.permisoUsuario.create as any).mockResolvedValue({
        id: "pu1",
        usuarioId: "u1",
        permisoId: "p1",
        usuario: { nombre: "Test" },
        permiso: { modulo: "vehiculos", accion: "crear" },
      });

      const res = await request(app)
        .post("/api/admin/permisos")
        .send({ usuarioId: "u1", permisoId: "p1" });

      expect(res.status).toBe(201);
      expect(res.body.data.usuarioId).toBe("u1");
    });

    it("should return 409 if permission already assigned", async () => {
      (prisma.permisoUsuario.findUnique as any).mockResolvedValue({ id: "existing" });

      const res = await request(app)
        .post("/api/admin/permisos")
        .send({ usuarioId: "u1", permisoId: "p1" });

      expect(res.status).toBe(409);
    });

    it("should return 400 if missing fields", async () => {
      const res = await request(app)
        .post("/api/admin/permisos")
        .send({ usuarioId: "u1" });

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/admin/permisos", () => {
    it("should remove a permission from a user", async () => {
      (prisma.permisoUsuario.deleteMany as any).mockResolvedValue({ count: 1 });

      const res = await request(app)
        .delete("/api/admin/permisos?usuarioId=u1&permisoId=p1");

      expect(res.status).toBe(204);
    });

    it("should return 400 if missing query params", async () => {
      const res = await request(app).delete("/api/admin/permisos");

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/admin/sesiones", () => {
    it("should return all sessions with user info", async () => {
      const mockSesiones = [
        {
          id: "s1",
          token: "abc...",
          estado: "ACTIVA",
          usuario: { nombre: "Admin", apellido: "SAF", email: "admin@saf.com", rol: { codigo: "ADMINISTRADOR" } },
        },
      ];

      (prisma.sesionAuth.findMany as any).mockResolvedValue(mockSesiones);

      const res = await request(app).get("/api/admin/sesiones");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe("DELETE /api/admin/sesiones", () => {
    it("should close a session remotely", async () => {
      (prisma.sesionAuth.update as any).mockResolvedValue({});

      const res = await request(app).delete("/api/admin/sesiones?id=s1");

      expect(res.status).toBe(204);
      expect(prisma.sesionAuth.update).toHaveBeenCalledWith({
        where: { id: "s1" },
        data: { estado: "CERRADA", cerradaEn: expect.any(Date) },
      });
    });
  });

  describe("GET /api/admin/audit", () => {
    it("should return audit logs", async () => {
      const mockLogs = [
        {
          id: "a1",
          accion: "LOGIN",
          modulo: "auth",
          usuario: { nombre: "Admin", apellido: "SAF" },
        },
      ];

      (prisma.auditoria.findMany as any).mockResolvedValue(mockLogs);

      const res = await request(app).get("/api/admin/audit");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it("should filter by modulo", async () => {
      (prisma.auditoria.findMany as any).mockResolvedValue([]);

      const res = await request(app).get("/api/admin/audit?modulo=vehiculos");

      expect(res.status).toBe(200);
      expect(prisma.auditoria.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ modulo: "vehiculos" }),
        })
      );
    });

    it("should filter by date range", async () => {
      (prisma.auditoria.findMany as any).mockResolvedValue([]);

      const res = await request(app).get("/api/admin/audit?fechaInicio=2026-07-01&fechaFin=2026-07-31");

      expect(res.status).toBe(200);
      expect(prisma.auditoria.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            creadoEn: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });
  });
});

// ─── RBAC Middleware Unit Tests ───

describe("RBAC Middleware", () => {
  it("requireRole should allow matching roles", async () => {
    const { requireRole } = await import("../middleware/rbac.js");
    const middleware = requireRole("ADMINISTRADOR");
    const req = { user: { rol: "ADMINISTRADOR" } };
    const res = {};
    const next = vi.fn();

    middleware(req as any, res as any, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("requireRole should reject non-matching roles", async () => {
    const { requireRole } = await import("../middleware/rbac.js");
    const middleware = requireRole("ADMINISTRADOR");
    const req = { user: { rol: "CONDUCTOR" } };
    const res = {};
    const next = vi.fn();

    middleware(req as any, res as any, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("permisos") }));
  });

  it("requireRole should reject unauthenticated users", async () => {
    const { requireRole } = await import("../middleware/rbac.js");
    const middleware = requireRole("ADMINISTRADOR");
    const req = {};
    const res = {};
    const next = vi.fn();

    middleware(req as any, res as any, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("autenticado") }));
  });
});
