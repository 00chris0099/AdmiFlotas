require("dotenv").config();
const pg = require("pg");

const MIGRATIONS = [
  { from: "public.permisos", to: "seguridad.permisos" },
  { from: "public.permisos_usuario", to: "seguridad.permisos_usuario" },
  { from: "public.sesiones_auth", to: "seguridad.sesiones_auth" },
  { from: "public.auditoria", to: "seguridad.auditoria" },
  { from: "public.vehiculos", to: "vehiculos.vehiculos" },
  { from: "public.movimientos_diarios", to: "movimientos_diarios.movimientos_diarios" },
  { from: "public.checklist_verificacion", to: "movimientos_diarios.checklist_verificacion" },
  { from: "public.ordenes_combustible", to: "control_combustible.ordenes_combustible" },
  { from: "public.ordenes_mantenimiento", to: "control_mantenimiento.ordenes_mantenimiento" },
  { from: "public.detalle_repuestos", to: "control_mantenimiento.detalle_repuestos" },
  { from: "public.detalle_mano_obra", to: "control_mantenimiento.detalle_mano_obra" },
  { from: "public.control_llantas", to: "control_llantas.control_llantas" },
  { from: "public.costos_fijos_prorrateables", to: "control_costos.costos_fijos_prorrateables" },
  { from: "public.configuracion_flota", to: "configuracion.configuracion_flota" },
];

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    for (const { from, to } of MIGRATIONS) {
      try {
        const countResult = await client.query(`SELECT COUNT(*) as cnt FROM ${from}`);
        const count = parseInt(countResult.rows[0].cnt);
        if (count === 0) {
          console.log(`  SKIP  ${from} → ${to} (empty)`);
          continue;
        }
        await client.query(`INSERT INTO ${to} SELECT * FROM ${from} ON CONFLICT DO NOTHING`);
        console.log(`  OK    ${from} → ${to} (${count} rows)`);
      } catch (e) {
        console.log(`  FAIL  ${from} → ${to}: ${e.message}`);
      }
    }
    console.log("\nDone!");
  } finally {
    client.release();
    await pool.end();
  }
}

main();
