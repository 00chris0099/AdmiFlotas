const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

async function main() {
  await client.connect();
  console.log("Connected to Supabase Postgres database");

  const schemasToDrop = [
    "seguridad",
    "personal",
    "vehiculos",
    "movimientos",
    "combustible",
    "mantenimiento",
    "llantas",
    "costos",
    "configuracion",
    "flota",
    "operaciones",
    "analitica",
    "conductores",
    "movimientos_diarios",
    "control_combustible",
    "control_mantenimiento",
    "control_llantas",
    "control_costos"
  ];

  for (const schema of schemasToDrop) {
    try {
      console.log(`Dropping schema "${schema}" CASCADE...`);
      await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE;`);
      console.log(`Dropped schema "${schema}" successfully.`);
    } catch (err) {
      console.error(`Error dropping schema "${schema}":`, err.message);
    }
  }

  await client.end();
  console.log("Disconnected from database");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
