require("dotenv").config();
const pg = require("pg");

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  // Get all enum types per schema
  const enumsResult = await client.query(`
    SELECT t.typname AS enum_name, n.nspname AS schema_name,
           array_agg(e.enumlabel ORDER BY e.enumsortorder) AS values
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE n.nspname NOT IN ('pg_catalog','information_schema','auth','storage','realtime','vault')
    GROUP BY t.typname, n.nspname
  `);

  // Build map: enum_name → { schema, values }
  const enumMap = {};
  for (const row of enumsResult.rows) {
    enumMap[row.enum_name] = { schema: row.schema_name, values: row.values };
  }

  // Get column info for a table
  async function getColumns(schema, table) {
    const r = await client.query(
      `SELECT column_name, udt_name
       FROM information_schema.columns
       WHERE table_schema = $1 AND table_name = $2
       ORDER BY ordinal_position`,
      [schema, table]
    );
    return r.rows;
  }

  // Check if a udt_name is an enum type that exists in both public and target schema
  function getEnumCast(udtName, targetSchema) {
    const e = enumMap[udtName];
    if (!e) return null;
    // If the enum exists in both public and target schema with same name
    if (e.schema === "public" || e.schema === targetSchema) {
      return `"${targetSchema}"."${udtName}"`;
    }
    return null;
  }

  const MIGRATIONS = [
    { from: "public.auditoria", to: "seguridad.auditoria", targetSchema: "seguridad" },
    { from: "public.vehiculos", to: "vehiculos.vehiculos", targetSchema: "vehiculos" },
    { from: "public.movimientos_diarios", to: "movimientos_diarios.movimientos_diarios", targetSchema: "movimientos_diarios" },
    { from: "public.checklist_verificacion", to: "movimientos_diarios.checklist_verificacion", targetSchema: "movimientos_diarios" },
    { from: "public.ordenes_combustible", to: "control_combustible.ordenes_combustible", targetSchema: "control_combustible" },
    { from: "public.ordenes_mantenimiento", to: "control_mantenimiento.ordenes_mantenimiento", targetSchema: "control_mantenimiento" },
    { from: "public.detalle_repuestos", to: "control_mantenimiento.detalle_repuestos", targetSchema: "control_mantenimiento" },
    { from: "public.detalle_mano_obra", to: "control_mantenimiento.detalle_mano_obra", targetSchema: "control_mantenimiento" },
    { from: "public.control_llantas", to: "control_llantas.control_llantas", targetSchema: "control_llantas" },
    { from: "public.costos_fijos_prorrateables", to: "control_costos.costos_fijos_prorrateables", targetSchema: "control_costos" },
  ];

  for (const { from, to, targetSchema } of MIGRATIONS) {
    const [srcSchema, srcTable] = from.split(".");
    const [tgtSchema, tgtTable] = to.split(".");

    try {
      const countResult = await client.query(`SELECT COUNT(*) as cnt FROM ${from}`);
      const count = parseInt(countResult.rows[0].cnt);
      if (count === 0) {
        console.log(`  SKIP  ${from} → ${to} (empty)`);
        continue;
      }

      const srcCols = await getColumns(srcSchema, srcTable);

      // Build SELECT with casts for enum columns
      const selectParts = srcCols.map(col => {
        const cast = getEnumCast(col.udt_name, targetSchema);
        if (cast) {
          return `"${col.column_name}"::text::${cast} AS "${col.column_name}"`;
        }
        return `"${col.column_name}"`;
      });

      const colNames = srcCols.map(c => `"${c.column_name}"`).join(", ");
      const sql = `INSERT INTO ${to} (${colNames}) SELECT ${selectParts.join(", ")} FROM ${from} ON CONFLICT DO NOTHING`;

      await client.query(sql);
      console.log(`  OK    ${from} → ${to} (${count} rows)`);
    } catch (e) {
      console.log(`  FAIL  ${from} → ${to}: ${e.message.substring(0, 120)}`);
    }
  }

  console.log("\nDone!");
  client.release();
  await pool.end();
}

main();
