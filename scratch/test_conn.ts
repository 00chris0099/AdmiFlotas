import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const regions = [
  "aws-0-us-east-1.pooler.supabase.com",
  "aws-1-us-east-1.pooler.supabase.com",
  "aws-0-us-west-1.pooler.supabase.com",
  "aws-0-us-west-2.pooler.supabase.com",
  "aws-0-ca-central-1.pooler.supabase.com",
  "aws-0-eu-west-1.pooler.supabase.com",
  "aws-0-eu-west-2.pooler.supabase.com",
  "aws-0-eu-west-3.pooler.supabase.com",
  "aws-0-eu-central-1.pooler.supabase.com",
  "aws-0-ap-southeast-1.pooler.supabase.com",
  "aws-0-ap-southeast-2.pooler.supabase.com",
  "aws-0-ap-northeast-1.pooler.supabase.com",
  "aws-0-ap-northeast-2.pooler.supabase.com",
  "aws-0-ap-south-1.pooler.supabase.com",
  "aws-0-sa-east-1.pooler.supabase.com"
];

async function testConnection() {
  const password = "Mineria_99***";
  const tenant = "zjbxsxcrvtxgadwgvpuy";

  console.log(`Iniciando escaneo global de regiones para el proyecto: ${tenant}...`);

  for (const host of regions) {
    const url = `postgresql://postgres.${tenant}:${password}@${host}:6543/postgres?pgbouncer=true`;
    
    const pool = new pg.Pool({ connectionString: url, connectionTimeoutMillis: 3000 });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
      // Intento rápido de consulta
      await prisma.usuario.findMany({ take: 1 });
      console.log(`\n🎉 ¡CONEXIÓN EXITOSA EN REGIÓN: ${host}!`);
      console.log(">>> Modifica tu archivo .env con esta URL:");
      console.log(`DATABASE_URL="postgresql://postgres.${tenant}:${password}@${host}:6543/postgres?pgbouncer=true"`);
      
      await prisma.$disconnect();
      await pool.end();
      return;
    } catch (error: any) {
      // Si el error es ENOTFOUND (inquilino no encontrado), simplemente seguimos con el siguiente
      if (error.message && error.message.includes("not found")) {
        // Ignorar de manera silenciosa para no saturar la consola
      } else {
        console.log(`ℹ️ Host ${host} respondió con otro error: ${error.message || error}`);
      }
    } finally {
      await prisma.$disconnect();
      await pool.end();
    }
  }

  console.log("\n❌ No se pudo establecer conexión en ninguna región global.");
  console.log("Por favor, verifica en el dashboard de Supabase si el proyecto ya se encuentra en estado 'Active' o si la contraseña es correcta.");
}

testConnection();
