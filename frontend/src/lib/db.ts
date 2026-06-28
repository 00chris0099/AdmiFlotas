import { PrismaClient } from "../../../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

let prismaInstance: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL no está definida en las variables de entorno");
    }
    
    // Configurar el pool de pg para conectar a Supabase
    const pool = new pg.Pool({
      connectionString: url,
    });
    const adapter = new PrismaPg(pool);
    
    prismaInstance = new PrismaClient({ adapter });
  }
  return prismaInstance;
}

export default getPrisma;
