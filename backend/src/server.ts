// ============================================================
// SAF Backend - Express Server Entry Point
// ============================================================

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { prisma } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRoutes } from "./routes/auth.routes.js";
import { usuariosRoutes } from "./routes/usuarios.routes.js";
import { vehiculosRoutes } from "./routes/vehiculos.routes.js";
import { movimientosRoutes } from "./routes/movimientos.routes.js";
import { combustibleRoutes } from "./routes/combustible.routes.js";
import { mantenimientoRoutes } from "./routes/mantenimiento.routes.js";
import { llantasRoutes } from "./routes/llantas.routes.js";
import { costosRoutes } from "./routes/costos.routes.js";
import { flotaRoutes } from "./routes/flota.routes.js";
import { almacenRoutes } from "./routes/almacen.routes.js";
import { operacionesRoutes } from "./routes/operaciones.routes.js";
import { reportesRoutes } from "./routes/reportes.routes.js";
import { configuracionRoutes } from "./routes/configuracion.routes.js";
import { lookupRoutes } from "./routes/lookup.routes.js";
import { seguridadRoutes } from "./routes/seguridad.routes.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

const app = express();

// ─── Trust proxy (EasyPanel / Docker) ───
app.set("trust proxy", 1);

// ─── Security Middleware ───
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// ─── Rate Limiting ───
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: { error: "Demasiadas solicitudes, intente de nuevo más tarde" },
});
app.use("/api/", limiter);

// ─── Body Parsing ───
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Flatten Prisma nested objects in JSON responses ───
function flattenObject(obj: any): any {
  if (Array.isArray(obj)) return obj.map(flattenObject);
  if (obj === null || typeof obj !== "object") return obj;
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value) && "nombre" in value && "id" in value && value.constructor?.name !== "Date") {
      const nested = value as any;
      if (key === "vehiculo") {
        result[key] = nested.placa ?? "";
        result.vehiculoLabel = `${nested.marca?.nombre ?? nested.marca ?? ""} ${nested.modelo?.nombre ?? nested.modelo ?? ""}`.trim();
        result.placa = nested.placa ?? "";
        result.marcaVehiculo = nested.marca?.nombre ?? "";
        result.modeloVehiculo = nested.modelo?.nombre ?? "";
      } else if (key === "rol") {
        result[key] = nested.codigo ?? nested.nombre ?? "";
      } else {
        result[key] = nested.codigo ?? nested.nombre ?? "";
      }
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = flattenObject(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

app.use((_req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function (body: any) {
    if (body && typeof body === "object") {
      body = flattenObject(body);
    }
    return originalJson(body);
  };
  next();
});

// ─── Swagger UI ───
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "SAF API Docs",
}));

// ─── Root Response ───
app.get("/", (_req, res) => {
  res.json({
    name: "SAF - Sistema de Administración de Flotas",
    version: "1.0.0",
    docs: "/api/docs",
    health: "/api/health",
  });
});

// ─── Health Check ───
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── API Routes ───
app.use("/api/auth", authRoutes);
app.use("/api/admin/usuarios", usuariosRoutes);
app.use("/api/vehiculos", vehiculosRoutes);
app.use("/api/movimientos_diarios", movimientosRoutes);
app.use("/api/control_combustible", combustibleRoutes);
app.use("/api/control_mantenimiento", mantenimientoRoutes);
app.use("/api/control_llantas", llantasRoutes);
app.use("/api/control_costos", costosRoutes);
app.use("/api/flota", flotaRoutes);
app.use("/api/mantenimiento/almacen", almacenRoutes);
app.use("/api/operaciones", operacionesRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/configuracion", configuracionRoutes);
app.use("/api/lookups", lookupRoutes);
app.use("/api/admin", seguridadRoutes);

// ─── Error Handler ───
app.use(errorHandler);

// ─── Start Server ───
async function main() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected");

    app.listen(env.PORT, () => {
      console.log(`🚀 SAF Backend running on port ${env.PORT}`);
      console.log(`📍 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

main();

export default app;
