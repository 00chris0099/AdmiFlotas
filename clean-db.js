const pg = require('pg');
const pool = new pg.Pool({ connectionString: 'postgresql://flotas:Mineria99*@187.77.57.116:5441/flotas' });

async function clean() {
  const tables = [
    'tokens_confirmacion', 'auditoria', 'permisos_usuario', 'permisos', 'sesiones_auth',
    'checklist_verificacion', 'movimientos_diarios',
    'ordenes_combustible',
    'detalle_mano_obra', 'detalle_repuestos', 'ordenes_mantenimiento',
    'control_llantas',
    'costos_fijos_prorrateables',
    'vehiculos',
    'usuarios',
    'configuracion_flota'
  ];

  for (const table of tables) {
    try {
      await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
      console.log(`Dropped: ${table}`);
    } catch (e) {
      console.log(`Skip ${table}: ${e.message}`);
    }
  }

  const enums = ['rol_usuario', 'estado_checklist', 'tipo_accion_auditoria', 'estado_sesion_auth', 'tipo_token', 'tipo_mantenimiento', 'tipo_taller', 'estado_orden', 'estado_movimiento', 'tipo_combustible', 'posicion_llanta', 'tipo_costo_fijo'];
  for (const e of enums) {
    try {
      await pool.query(`DROP TYPE IF EXISTS ${e} CASCADE`);
      console.log(`Dropped enum: ${e}`);
    } catch (err) {}
  }

  await pool.end();
  console.log('\nDatabase cleaned.');
}

clean().catch(e => { console.error(e); process.exit(1); });
