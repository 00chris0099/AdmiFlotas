import "dotenv/config";
import pg from "pg";

async function inspectDb() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error("No DATABASE_URL or DIRECT_URL found");
    return;
  }
  const client = new pg.Client({ connectionString: url });
  await client.connect();

  console.log("=== SCHEMAS ===");
  const schemas = await client.query(`
    SELECT schema_name FROM information_schema.schemata 
    WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
  `);
  console.log(schemas.rows.map(r => r.schema_name));

  console.log("\n=== VIEWS ===");
  const views = await client.query(`
    SELECT table_schema, table_name 
    FROM information_schema.views 
    WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
  `);
  console.table(views.rows);

  console.log("\n=== TRIGGERS ===");
  const triggers = await client.query(`
    SELECT trigger_schema, trigger_name, event_object_table, action_statement
    FROM information_schema.triggers
  `);
  console.table(triggers.rows);

  console.log("\n=== FUNCTIONS/PROCEDURES ===");
  const functions = await client.query(`
    SELECT n.nspname as schema, p.proname as name, pg_get_functiondef(p.oid) as definition
    FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      AND p.prokind IN ('f', 'p')
  `);
  for (const row of functions.rows) {
    console.log(`- ${row.schema}.${row.name}`);
  }

  await client.end();
}

inspectDb().catch(console.error);
