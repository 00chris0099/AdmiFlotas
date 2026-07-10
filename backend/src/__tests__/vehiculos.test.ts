// ============================================================
// SAF Backend - Vehiculos Integration Tests
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

// Mock Prisma
vi.mock("../config/database.js", () => ({
  default: {
    vehiculo: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

// Mock auth middleware
vi.mock("../middleware/auth.js", () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = {
      userId: "user-1",
      email: "admin@saf.com",
      rol: "ADMINISTRADOR",
    };
    next();
  },
}));

// Mock rbac middleware
vi.mock("../middleware/rbac.js", () => ({
  requireRole: (...roles: string[]) => (req: any, _res: any, next: any) => {
    if (roles.includes(req.user?.rol)) {
      next();
    } else {
      const error = new Error("No tiene permisos");
      (error as any).statusCode = 403;
      next(error);
    }
  },
}));

import { vehiculosRoutes } from "../routes/vehiculos.routes.js";
import prisma from "../config/database.js";

const app = express();
app.use(express.json());
app.use("/api/vehiculos", vehiculosRoutes);

// Error handler for tests
app.use((err: any, _req: any, res: any, _next: any) => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message,
  });
});

describe("Vehiculos Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/vehiculos", () => {
    it("should return paginated vehicles", async () => {
      const mockVehiculos = [
        { id: "v1", placa: "ABC-123", marca: { nombre: "Toyota" }, modelo: { nombre: "Hilux" } },
        { id: "v2", placa: "DEF-456", marca: { nombre: "Hyundai" }, modelo: { nombre: "Tucson" } },
      ];

      (prisma.vehiculo.findMany as any).mockResolvedValue(mockVehiculos);
      (prisma.vehiculo.count as any).mockResolvedValue(2);

      const res = await request(app).get("/api/vehiculos");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta.total).toBe(2);
    });

    it("should handle pagination params", async () => {
      (prisma.vehiculo.findMany as any).mockResolvedValue([]);
      (prisma.vehiculo.count as any).mockResolvedValue(0);

      const res = await request(app).get("/api/vehiculos?page=2&limit=10");

      expect(res.status).toBe(200);
      expect(prisma.vehiculo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 })
      );
    });
  });

  describe("GET /api/vehiculos/:id", () => {
    it("should return a vehicle by ID", async () => {
      const mockVehiculo = {
        id: "v1",
        placa: "ABC-123",
        marca: { nombre: "Toyota" },
        modelo: { nombre: "Hilux" },
        color: null,
        tipoCombustible: null,
        estado: null,
      };

      (prisma.vehiculo.findUnique as any).mockResolvedValue(mockVehiculo);

      const res = await request(app).get("/api/vehiculos/v1");

      expect(res.status).toBe(200);
      expect(res.body.data.placa).toBe("ABC-123");
    });
  });

  describe("POST /api/vehiculos", () => {
    it("should create a vehicle with valid data", async () => {
      const newVehiculo = {
        id: "v-new",
        placa: "GHI-789",
        marca: { nombre: "Kia" },
        modelo: { nombre: "Sportage" },
      };

      (prisma.vehiculo.create as any).mockResolvedValue(newVehiculo);

      const res = await request(app)
        .post("/api/vehiculos")
        .send({
          placa: "GHI-789",
          marcaId: "550e8400-e29b-41d4-a716-446655440000",
          modeloId: "550e8400-e29b-41d4-a716-446655440001",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.placa).toBe("GHI-789");
    });
  });

  describe("PUT /api/vehiculos/:id", () => {
    it("should update a vehicle", async () => {
      const updatedVehiculo = {
        id: "v1",
        placa: "ABC-123-UPDATED",
        marca: { nombre: "Toyota" },
      };

      (prisma.vehiculo.update as any).mockResolvedValue(updatedVehiculo);

      const res = await request(app)
        .put("/api/vehiculos/v1")
        .send({ placa: "ABC-123-UPDATED" });

      expect(res.status).toBe(200);
      expect(res.body.data.placa).toBe("ABC-123-UPDATED");
    });
  });

  describe("DELETE /api/vehiculos/:id", () => {
    it("should delete a vehicle", async () => {
      (prisma.vehiculo.delete as any).mockResolvedValue({});

      const res = await request(app).delete("/api/vehiculos/v1");

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe("Vehículo eliminado");
    });
  });

  describe("RBAC", () => {
    it("should allow ADMINISTRADOR to create vehicles", async () => {
      (prisma.vehiculo.create as any).mockResolvedValue({ id: "v1", placa: "TEST" });

      const res = await request(app)
        .post("/api/vehiculos")
        .send({
          placa: "TEST",
          marcaId: "550e8400-e29b-41d4-a716-446655440000",
          modeloId: "550e8400-e29b-41d4-a716-446655440001",
        });

      expect(res.status).toBe(201);
    });
  });
});
