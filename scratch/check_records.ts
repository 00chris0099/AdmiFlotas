import "dotenv/config";
import pg from "pg";

async function checkRecords() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error("No database URL found");
    return;
  }
  const client = new pg.Client({ connectionString: url });
  await client.connect();

  console.log("Connected to Supabase PostgreSQL.");

  const tablesRes = await client.query(`
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
    ORDER BY table_schema, table_name
  `);

  console.log("\n=== CONTEO DE FILAS POR TABLA ===");
  for (const row of tablesRes.rows) {
    const schema = row.table_schema;
    const table = row.table_name;
    try {
      const countRes = await client.query(`SELECT COUNT(*) as count FROM "${schema}"."${table}"`);
      const count = countRes.rows[0].count;
      console.log(`- ${schema}.${table}: ${count} filas`);
    } catch (err: any) {
      console.log(`- ${schema}.${table}: ERROR (${err.message})`);
    }
  }

  await client.end();
}

checkRecords().catch(console.error);
