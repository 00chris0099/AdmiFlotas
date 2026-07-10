// ============================================================
// SAF Backend - Movimientos Diarios Integration Tests
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// Mock Prisma
vi.mock("../config/database.js", () => ({
  default: {
    movimientoDiario: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    checklistVerificacion: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn((fn: any) => fn({
      movimientoDiario: {
        create: vi.fn().mockResolvedValue({ id: "mov-1", numeroOrden: "MD-2026-0001" }),
        findUnique: vi.fn().mockResolvedValue({ id: "mov-1", numeroOrden: "MD-2026-0001" }),
      },
      checklistVerificacion: {
        create: vi.fn().mockResolvedValue({}),
      },
    })),
    $queryRaw: vi.fn().mockResolvedValue([]),
  },
}));

// Mock auth middleware
vi.mock("../middleware/auth.js", () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { userId: "user-1", email: "test@saf.com", rol: "ADMINISTRADOR" };
    next();
  },
}));

// Mock order generator
vi.mock("../utils/orderGenerator.js", () => ({
  generateNumeroOrden: vi.fn().mockResolvedValue("MD-2026-0001"),
}));

import { movimientosRoutes } from "../routes/movimientos.routes.js";
import prisma from "../config/database.js";

const app = express();
app.use(express.json());
app.use("/api/movimientos_diarios", movimientosRoutes);

app.use((err: any, _req: any, res: any, _next: any) => {
  res.status(err.statusCode || 500).json({ success: false, error: err.message });
});

describe("Movimientos Diarios Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/movimientos_diarios", () => {
    it("should return paginated movements", async () => {
      const mockMovimientos = [
        { id: "m1", numeroOrden: "MD-2026-0001", vehiculo: { placa: "ABC-123" } },
      ];

      (prisma.movimientoDiario.findMany as any).mockResolvedValue(mockMovimientos);
      (prisma.movimientoDiario.count as any).mockResolvedValue(1);

      const res = await request(app).get("/api/movimientos_diarios");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe("GET /api/movimientos_diarios/checklist", () => {
    it("should return formatted checklists", async () => {
      const mockChecklists = [
        {
          id: "c1",
          movimientoId: "m1",
          fechaRegistro: new Date(),
          aptoParaOperar: true,
          documentos: true,
          frenos: true,
          llantas: true,
          movimiento: {
            vehiculo: { placa: "ABC-123", marca: { nombre: "Toyota" }, modelo: { nombre: "Hilux" } },
            inspector: { nombre: "Juan", apellido: "Perez" },
          },
        },
      ];

      (prisma.checklistVerificacion.findMany as any).mockResolvedValue(mockChecklists);

      const res = await request(app).get("/api/movimientos_diarios/checklist");

      expect(res.status).toBe(200);
      expect(res.body.data[0].placa).toBe("ABC-123");
      expect(res.body.data[0].inspector).toBe("Juan Perez");
    });
  });

  describe("POST /api/movimientos_diarios", () => {
    it("should create a movement with checklist in transaction", async () => {
      const res = await request(app)
        .post("/api/movimientos_diarios")
        .send({
          vehiculoId: "550e8400-e29b-41d4-a716-446655440000",
          conductorId: "550e8400-e29b-41d4-a716-446655440001",
          fecha: "2026-07-09",
          checklist: {
            documentos: true,
            frenos: true,
            llantas: true,
            aptoParaOperar: true,
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.data.numeroOrden).toBe("MD-2026-0001");
    });

    it("should create movement without checklist", async () => {
      const res = await request(app)
        .post("/api/movimientos_diarios")
        .send({
          vehiculoId: "550e8400-e29b-41d4-a716-446655440000",
          conductorId: "550e8400-e29b-41d4-a716-446655440001",
          fecha: "2026-07-09",
        });

      expect(res.status).toBe(201);
    });
  });

  describe("DELETE /api/movimientos_diarios/:id", () => {
    it("should delete a movement", async () => {
      (prisma.movimientoDiario.delete as any).mockResolvedValue({});

      const res = await request(app).delete("/api/movimientos_diarios/m1");

      expect(res.status).toBe(204);
    });
  });
});
