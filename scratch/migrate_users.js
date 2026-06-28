require("dotenv").config();
const pg = require("pg");

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Copy users from public to conductores schema
    // Need to cast the rol enum from public to conductores schema
    await client.query(
      `INSERT INTO conductores.usuarios (
        id, nombre, apellido, email, password, rol, activo, telefono,
        licencia_conducir, categoria_licencia, vencimiento_licencia,
        especialidad, ultimo_acceso, creado_en, actualizado_en,
        bloqueado_hasta, intentos_fallidos
      )
      SELECT
        id, nombre, apellido, email, password,
        rol::text::conductores."RolUsuario",
        activo, telefono, licencia_conducir, categoria_licencia,
        vencimiento_licencia, especialidad, ultimo_acceso, creado_en,
        actualizado_en, bloqueado_hasta, intentos_fallidos
      FROM public.usuarios
      ON CONFLICT (id) DO NOTHING`
    );

    const check = await client.query("SELECT email, rol, activo FROM conductores.usuarios");
    console.log("conductores.usuarios:", JSON.stringify(check.rows, null, 2));

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Error:", e.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
