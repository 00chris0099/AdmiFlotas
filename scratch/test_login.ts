import "dotenv/config";
import pg from "pg";

async function testLogin() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error("No DB URL found");
    return;
  }
  const client = new pg.Client({ connectionString: url });
  await client.connect();

  console.log("=== USUARIOS EN LA BD ===");
  const res = await client.query("SELECT id, nombre, apellido, email, password, activo, rol FROM conductores.usuarios");
  console.table(res.rows);

  const emailToTest = "escriba.matto@flota.gob";
  const passwordToTest = "saf123";

  const user = res.rows.find(u => u.email === emailToTest);
  if (!user) {
    console.log(`Usuario ${emailToTest} no encontrado en la base de datos.`);
  } else {
    console.log(`Usuario encontrado:`, user);
    const passwordMatch = user.password.includes(passwordToTest) || user.password === passwordToTest;
    console.log(`¿Coincide la contraseña (${passwordToTest})?:`, passwordMatch);
  }

  await client.end();
}

testLogin().catch(console.error);
