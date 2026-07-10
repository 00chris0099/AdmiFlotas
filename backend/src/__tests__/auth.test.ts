// ============================================================
// SAF Backend - Auth Integration Tests
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// Mock bcryptjs at top level
vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn().mockResolvedValue(true),
    hash: vi.fn().mockResolvedValue("$2a$10$hashedpassword"),
  },
}));

// Mock Prisma before importing routes
vi.mock("../config/database.js", () => ({
  default: {
    usuario: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    tokenConfirmacion: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((fn: any) => fn({
      usuario: {
        update: vi.fn().mockResolvedValue({}),
      },
      tokenConfirmacion: {
        update: vi.fn().mockResolvedValue({}),
      },
    })),
  },
}));

vi.mock("../utils/email.js", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
  generatePasswordResetEmail: vi.fn().mockReturnValue("<html>reset</html>"),
  generateUserConfirmationEmail: vi.fn().mockReturnValue("<html>confirm</html>"),
}));

import { authRoutes } from "../routes/auth.routes.js";
import prisma from "../config/database.js";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Auth Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/login", () => {
    it("should return 200 with token on valid credentials", async () => {
      const mockUser = {
        id: "user-1",
        email: "admin@saf.com",
        nombre: "Admin",
        apellido: "SAF",
        activo: true,
        bloqueadoHasta: null,
        password: "$2a$10$hashedpassword",
        intentosFallidos: 0,
        rol: { codigo: "ADMINISTRADOR" },
      };

      (prisma.usuario.findUnique as any).mockResolvedValue(mockUser);
      (prisma.usuario.update as any).mockResolvedValue(mockUser);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "admin@saf.com", password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it("should return 400 when email is missing", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ password: "password123" });

      expect(res.status).toBe(400);
    });

    it("should return 401 when user not found", async () => {
      (prisma.usuario.findUnique as any).mockResolvedValue(null);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nonexistent@saf.com", password: "password123" });

      expect(res.status).toBe(401);
    });

    it("should return 403 when user is inactive", async () => {
      const mockUser = {
        id: "user-1",
        email: "inactive@saf.com",
        activo: false,
        bloqueadoHasta: null,
        password: "$2a$10$hashedpassword",
        rol: { codigo: "CONDUCTOR" },
      };

      (prisma.usuario.findUnique as any).mockResolvedValue(mockUser);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "inactive@saf.com", password: "password123" });

      expect(res.status).toBe(403);
    });

    it("should return 403 when user is blocked", async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 30);

      const mockUser = {
        id: "user-1",
        email: "blocked@saf.com",
        activo: true,
        bloqueadoHasta: futureDate,
        password: "$2a$10$hashedpassword",
        rol: { codigo: "CONDUCTOR" },
      };

      (prisma.usuario.findUnique as any).mockResolvedValue(mockUser);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "blocked@saf.com", password: "password123" });

      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/auth/solicitar-cambio-password", () => {
    it("should return 200 even if email does not exist", async () => {
      (prisma.usuario.findUnique as any).mockResolvedValue(null);

      const res = await request(app)
        .post("/api/auth/solicitar-cambio-password")
        .send({ email: "nonexistent@saf.com" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should create token and send email when user exists", async () => {
      const mockUser = {
        id: "user-1",
        email: "user@saf.com",
        nombre: "Test",
        apellido: "User",
      };

      (prisma.usuario.findUnique as any).mockResolvedValue(mockUser);
      (prisma.tokenConfirmacion.create as any).mockResolvedValue({});

      const res = await request(app)
        .post("/api/auth/solicitar-cambio-password")
        .send({ email: "user@saf.com" });

      expect(res.status).toBe(200);
      expect(prisma.tokenConfirmacion.create).toHaveBeenCalled();
    });
  });

  describe("POST /api/auth/confirmar-usuario", () => {
    it("should return 400 when token is missing", async () => {
      const res = await request(app)
        .post("/api/auth/confirmar-usuario")
        .send({ password: "newpassword123" });

      expect(res.status).toBe(400);
    });

    it("should return 400 when token is invalid", async () => {
      (prisma.tokenConfirmacion.findUnique as any).mockResolvedValue(null);

      const res = await request(app)
        .post("/api/auth/confirmar-usuario")
        .send({ token: "invalid-token", password: "newpassword123" });

      expect(res.status).toBe(400);
    });

    it("should return 400 when token is already used", async () => {
      const mockToken = {
        id: "token-1",
        token: "used-token",
        tipo: "CONFIRMACION_USUARIO",
        expiraEn: new Date(Date.now() + 3600000),
        usadoEn: new Date(),
        usuarioId: "user-1",
      };

      (prisma.tokenConfirmacion.findUnique as any).mockResolvedValue(mockToken);

      const res = await request(app)
        .post("/api/auth/confirmar-usuario")
        .send({ token: "used-token", password: "newpassword123" });

      expect(res.status).toBe(400);
    });

    it("should return 400 when token is expired", async () => {
      const mockToken = {
        id: "token-1",
        token: "expired-token",
        tipo: "CONFIRMACION_USUARIO",
        expiraEn: new Date(Date.now() - 3600000),
        usadoEn: null,
        usuarioId: "user-1",
      };

      (prisma.tokenConfirmacion.findUnique as any).mockResolvedValue(mockToken);

      const res = await request(app)
        .post("/api/auth/confirmar-usuario")
        .send({ token: "expired-token", password: "newpassword123" });

      expect(res.status).toBe(400);
    });
  });
});
