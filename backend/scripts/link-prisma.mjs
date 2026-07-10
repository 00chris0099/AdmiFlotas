// ============================================================
// SAF Backend - Postinstall script
// Links the generated Prisma Client to node_modules/@prisma/client
// ============================================================

import { symlinkSync, existsSync, rmSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const backendDir = resolve(__dirname, "..");
const generatedDir = resolve(backendDir, "..", "generated", "prisma");
const targetDir = resolve(backendDir, "node_modules", "@prisma", "client");

try {
  if (existsSync(targetDir)) {
    rmSync(targetDir, { recursive: true, force: true });
  }

  const parentDir = resolve(targetDir, "..");
  if (!existsSync(parentDir)) {
    mkdirSync(parentDir, { recursive: true });
  }

  symlinkSync(generatedDir, targetDir, "junction");
  console.log("✅ Linked @prisma/client → generated/prisma");
} catch (error) {
  console.warn("⚠️  Could not link @prisma/client:", error.message);
}
