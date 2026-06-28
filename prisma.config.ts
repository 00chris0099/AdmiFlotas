// ============================================
// TPV - Terminal Punto de Venta
// Configuración de Prisma ORM
// ============================================
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Usa DATABASE_URL (pooled) para comandos CLI.
    url: process.env["DATABASE_URL"],
  },
});
