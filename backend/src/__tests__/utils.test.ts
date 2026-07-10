// ============================================================
// SAF Backend - Utility Unit Tests
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendError,
  sendPaginated,
} from "../utils/apiResponse.js";
import { AppError, BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError } from "../utils/errors.js";
import { generatePasswordResetEmail, generateUserConfirmationEmail } from "../utils/email.js";

// ─── apiResponse Tests ───

describe("apiResponse", () => {
  let mockRes: any;

  beforeEach(() => {
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  describe("sendSuccess", () => {
    it("should return 200 with data by default", () => {
      sendSuccess(mockRes, { id: 1, name: "test" });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1, name: "test" },
      });
    });

    it("should return custom status code", () => {
      sendSuccess(mockRes, { id: 1 }, 201);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("should include message when provided", () => {
      sendSuccess(mockRes, { id: 1 }, 200, "Operation successful");
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1 },
        message: "Operation successful",
      });
    });
  });

  describe("sendCreated", () => {
    it("should return 201", () => {
      sendCreated(mockRes, { id: 1 });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1 },
      });
    });
  });

  describe("sendNoContent", () => {
    it("should return 204 with no body", () => {
      sendNoContent(mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });
  });

  describe("sendError", () => {
    it("should return 500 by default", () => {
      sendError(mockRes, "Internal error");
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Internal error",
      });
    });

    it("should return custom status code", () => {
      sendError(mockRes, "Not found", 404);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe("sendPaginated", () => {
    it("should return paginated data with meta", () => {
      const data = [{ id: 1 }, { id: 2 }];
      sendPaginated(mockRes, data, 10, 1, 20);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data,
        meta: {
          total: 10,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      });
    });

    it("should calculate totalPages correctly", () => {
      sendPaginated(mockRes, [], 55, 1, 20);
      const call = mockRes.json.mock.calls[0][0];
      expect(call.meta.totalPages).toBe(3);
    });
  });
});

// ─── AppError Tests ───

describe("AppError", () => {
  it("should create error with message and status code", () => {
    const error = new AppError("Test error", 400);
    expect(error.message).toBe("Test error");
    expect(error.statusCode).toBe(400);
    expect(error.isOperational).toBe(true);
  });

  it("should be instanceof Error", () => {
    const error = new AppError("Test", 500);
    expect(error).toBeInstanceOf(Error);
  });
});

describe("BadRequestError", () => {
  it("should have status 400", () => {
    const error = new BadRequestError();
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Solicitud inválida");
  });
});

describe("UnauthorizedError", () => {
  it("should have status 401", () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
  });
});

describe("ForbiddenError", () => {
  it("should have status 403", () => {
    const error = new ForbiddenError();
    expect(error.statusCode).toBe(403);
  });
});

describe("NotFoundError", () => {
  it("should have status 404", () => {
    const error = new NotFoundError();
    expect(error.statusCode).toBe(404);
  });
});

// ─── Email Template Tests ───

describe("email templates", () => {
  describe("generatePasswordResetEmail", () => {
    it("should generate HTML with token", () => {
      const html = generatePasswordResetEmail("test-token-123", "Juan Perez");
      expect(html).toContain("test-token-123");
      expect(html).toContain("Juan Perez");
      expect(html).toContain("Restablecer Contraseña");
    });

    it("should be valid HTML", () => {
      const html = generatePasswordResetEmail("token", "User");
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("</html>");
    });
  });

  describe("generateUserConfirmationEmail", () => {
    it("should generate HTML with token and email", () => {
      const html = generateUserConfirmationEmail("confirm-token", "Maria Lopez", "maria@test.com");
      expect(html).toContain("confirm-token");
      expect(html).toContain("Maria Lopez");
      expect(html).toContain("Confirmar Cuenta");
    });

    it("should be valid HTML", () => {
      const html = generateUserConfirmationEmail("token", "User", "user@test.com");
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("</html>");
    });
  });
});

// ─── Zod Schema Validation Tests ───

describe("Zod schemas", () => {
  describe("loginSchema", async () => {
    const { loginSchema } = await import("../schemas/auth.schema.js");

    it("should accept valid login data", () => {
      const result = loginSchema.safeParse({
        email: "test@saf.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject short password", () => {
      const result = loginSchema.safeParse({
        email: "test@saf.com",
        password: "12345",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createVehiculoSchema", async () => {
    const { createVehiculoSchema } = await import("../schemas/vehiculo.schema.js");

    it("should accept valid vehiculo data", () => {
      const result = createVehiculoSchema.safeParse({
        placa: "ABC-123",
        marcaId: "550e8400-e29b-41d4-a716-446655440000",
        modeloId: "550e8400-e29b-41d4-a716-446655440001",
      });
      expect(result.success).toBe(true);
    });

    it("should reject missing placa", () => {
      const result = createVehiculoSchema.safeParse({
        marcaId: "550e8400-e29b-41d4-a716-446655440000",
        modeloId: "550e8400-e29b-41d4-a716-446655440001",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createMovimientoSchema", async () => {
    const { createMovimientoSchema } = await import("../schemas/movimiento.schema.js");

    it("should accept valid movement data", () => {
      const result = createMovimientoSchema.safeParse({
        vehiculoId: "550e8400-e29b-41d4-a716-446655440000",
        conductorId: "550e8400-e29b-41d4-a716-446655440001",
        fecha: "2026-07-09",
      });
      expect(result.success).toBe(true);
    });

    it("should reject missing vehiculoId", () => {
      const result = createMovimientoSchema.safeParse({
        conductorId: "550e8400-e29b-41d4-a716-446655440001",
        fecha: "2026-07-09",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createOrdenCombustibleSchema", async () => {
    const { createOrdenCombustibleSchema } = await import("../schemas/business.schema.js");

    it("should accept valid fuel order data", () => {
      const result = createOrdenCombustibleSchema.safeParse({
        vehiculoId: "550e8400-e29b-41d4-a716-446655440000",
        fecha: "2026-07-09",
        galones: 50,
      });
      expect(result.success).toBe(true);
    });

    it("should reject negative galones", () => {
      const result = createOrdenCombustibleSchema.safeParse({
        vehiculoId: "550e8400-e29b-41d4-a716-446655440000",
        fecha: "2026-07-09",
        galones: -10,
      });
      expect(result.success).toBe(false);
    });
  });
});
