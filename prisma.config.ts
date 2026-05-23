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
    // Usa la URL directa (puerto 5432) para que los comandos CLI
    // (db push, migrate, etc.) funcionen correctamente sin PgBouncer.
    // La app en runtime debe usar DATABASE_URL (pooled, puerto 6543).
    url: process.env["DIRECT_URL"],
  },
});
