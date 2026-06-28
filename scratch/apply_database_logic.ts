import "dotenv/config";
import pg from "pg";

async function applyDatabaseLogic() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error("Error: DATABASE_URL o DIRECT_URL no están configuradas.");
    return;
  }

  console.log("Conectando a la base de datos PostgreSQL...");
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  console.log("¡Conexión establecida!");

  try {
    // 1. Crear las vistas analíticas
    console.log("\nCreando/Reemplazando Vista: control_llantas.v_desempeno_llantas...");
    await client.query(`
      CREATE OR REPLACE VIEW control_llantas.v_desempeno_llantas AS
      SELECT 
        id,
        codigo_eps,
        vehiculo_id,
        fabricante,
        kilometraje_acumulado,
        veces_reencauchada,
        costo_adquisicion,
        CASE 
          WHEN kilometraje_acumulado > 0 THEN (costo_adquisicion / kilometraje_acumulado)
          ELSE 0 
        END::numeric(10,4) AS costo_por_km
      FROM control_llantas.control_llantas;
    `);

    console.log("Creando/Reemplazando Vista: control_costos.v_resumen_kpis_vehiculo...");
    await client.query(`
      CREATE OR REPLACE VIEW control_costos.v_resumen_kpis_vehiculo AS
      SELECT 
        v.id AS id,
        v.id AS vehiculo_id,
        v.marca,
        v.modelo,
        v.placa,
        COALESCE(
          (SELECT MAX(kilometraje_llegada) FROM movimientos_diarios.movimientos_diarios WHERE vehiculo_id = v.id),
          0
        )::integer AS kilometraje_total,
        COALESCE(
          (SELECT SUM(horas_utilizacion) FROM movimientos_diarios.movimientos_diarios WHERE vehiculo_id = v.id),
          0
        )::numeric(10,2) AS horas_utilizacion,
        COALESCE(
          (SELECT SUM(cantidad_galones) FROM control_combustible.ordenes_combustible WHERE vehiculo_id = v.id),
          0
        )::numeric(10,2) AS galones_combustible,
        COALESCE(
          (SELECT SUM(costo_total) FROM control_combustible.ordenes_combustible WHERE vehiculo_id = v.id),
          0
        )::numeric(12,2) AS costo_combustible,
        COALESCE(
          (SELECT SUM(costo_total) FROM control_mantenimiento.ordenes_mantenimiento WHERE vehiculo_id = v.id AND estado = 'COMPLETADO'),
          0
        )::numeric(12,2) AS costo_mantenimiento,
        COALESCE(
          (SELECT COUNT(*) FROM movimientos_diarios.movimientos_diarios WHERE vehiculo_id = v.id AND estado = 'COMPLETADO'),
          0
        )::integer AS viajes_realizados
      FROM vehiculos.vehiculos v;
    `);

    console.log("Creando/Reemplazando Vista: control_costos.v_reporte_mensual_costos...");
    await client.query(`
      CREATE OR REPLACE VIEW control_costos.v_reporte_mensual_costos AS
      WITH periods AS (
        SELECT DISTINCT v.id AS vehiculo_id, p.periodo
        FROM vehiculos.vehiculos v
        CROSS JOIN (
          SELECT DISTINCT TO_CHAR(fecha, 'YYYY-MM') AS periodo FROM control_combustible.ordenes_combustible
          UNION
          SELECT DISTINCT TO_CHAR(fecha_emision, 'YYYY-MM') AS periodo FROM control_mantenimiento.ordenes_mantenimiento
          UNION
          SELECT DISTINCT periodo FROM control_costos.costos_fijos_prorrateables
        ) p
      ),
      combustible_costs AS (
        SELECT 
          vehiculo_id,
          TO_CHAR(fecha, 'YYYY-MM') AS periodo,
          COALESCE(SUM(costo_total), 0) AS costo_combustible
        FROM control_combustible.ordenes_combustible
        GROUP BY vehiculo_id, TO_CHAR(fecha, 'YYYY-MM')
      ),
      mantenimiento_costs AS (
        SELECT 
          vehiculo_id,
          TO_CHAR(fecha_emision, 'YYYY-MM') AS periodo,
          COALESCE(SUM(costo_total), 0) AS costo_mantenimiento
        FROM control_mantenimiento.ordenes_mantenimiento
        WHERE estado = 'COMPLETADO'
        GROUP BY vehiculo_id, TO_CHAR(fecha_emision, 'YYYY-MM')
      ),
      vehiculos_count AS (
        SELECT 
          p.periodo,
          COUNT(DISTINCT v.id) as total_vehiculos
        FROM (
          SELECT DISTINCT TO_CHAR(fecha, 'YYYY-MM') AS periodo FROM control_combustible.ordenes_combustible
          UNION
          SELECT DISTINCT TO_CHAR(fecha_emision, 'YYYY-MM') AS periodo FROM control_mantenimiento.ordenes_mantenimiento
          UNION
          SELECT DISTINCT periodo FROM control_costos.costos_fijos_prorrateables
        ) p
        CROSS JOIN vehiculos.vehiculos v
        WHERE v.estado != 'DADO_DE_BAJA'
        GROUP BY p.periodo
      ),
      fijos_costs AS (
        SELECT 
          cf.periodo,
          COALESCE(SUM(cf.monto_mensual), 0) AS monto_total_fijo
        FROM control_costos.costos_fijos_prorrateables cf
        WHERE cf.activo = true
        GROUP BY cf.periodo
      )
      SELECT 
        (p.vehiculo_id || '-' || p.periodo)::text AS id,
        p.vehiculo_id,
        p.periodo::varchar(7) as periodo,
        COALESCE(cc.costo_combustible, 0)::numeric(12,2) AS costo_combustible,
        COALESCE(cm.costo_mantenimiento, 0)::numeric(12,2) AS costo_mantenimiento,
        COALESCE(
          (fc.monto_total_fijo / NULLIF(vc.total_vehiculos, 0)), 
          0
        )::numeric(12,2) AS costo_fijo_prorrateado,
        (
          COALESCE(cc.costo_combustible, 0) + 
          COALESCE(cm.costo_mantenimiento, 0) + 
          COALESCE((fc.monto_total_fijo / NULLIF(vc.total_vehiculos, 0)), 0)
        )::numeric(12,2) AS costo_total
      FROM periods p
      LEFT JOIN combustible_costs cc ON p.vehiculo_id = cc.vehiculo_id AND p.periodo = cc.periodo
      LEFT JOIN mantenimiento_costs cm ON p.vehiculo_id = cm.vehiculo_id AND p.periodo = cm.periodo
      LEFT JOIN fijos_costs fc ON p.periodo = fc.periodo
      LEFT JOIN vehiculos_count vc ON p.periodo = vc.periodo;
    `);

    // 2. Crear trigger para actualizar costos en mantenimiento
    console.log("\nCreando Trigger Función para actualización de costos de órdenes de mantenimiento...");
    await client.query(`
      CREATE OR REPLACE FUNCTION control_mantenimiento.fn_actualizar_costo_total_mantenimiento()
      RETURNS TRIGGER AS $$
      DECLARE
        v_orden_id uuid;
        v_total_repuestos numeric(12,2);
        v_total_mo numeric(12,2);
        v_total_otros numeric(12,2);
        v_tipo_taller text;
      BEGIN
        IF TG_OP = 'DELETE' THEN
          v_orden_id := OLD.orden_mantenimiento_id;
        ELSE
          v_orden_id := NEW.orden_mantenimiento_id;
        END IF;

        -- Calcular sumas de repuestos y mano de obra
        SELECT COALESCE(SUM(subtotal), 0) INTO v_total_repuestos 
        FROM control_mantenimiento.detalle_repuestos 
        WHERE orden_mantenimiento_id = v_orden_id;

        SELECT COALESCE(SUM(subtotal), 0) INTO v_total_mo 
        FROM control_mantenimiento.detalle_mano_obra 
        WHERE orden_mantenimiento_id = v_orden_id;

        SELECT COALESCE(costo_otros, 0), tipo_taller INTO v_total_otros, v_tipo_taller
        FROM control_mantenimiento.ordenes_mantenimiento
        WHERE id = v_orden_id;

        -- Actualizar costo en la cabecera
        IF v_tipo_taller = 'PROPIO' THEN
          UPDATE control_mantenimiento.ordenes_mantenimiento
          SET 
            costo_piezas_repuestos = v_total_repuestos,
            costo_mano_obra_propia = v_total_mo,
            costo_total = v_total_repuestos + v_total_mo + v_total_otros
          WHERE id = v_orden_id;
        ELSE
          UPDATE control_mantenimiento.ordenes_mantenimiento
          SET 
            costo_piezas_repuestos = v_total_repuestos,
            costo_mano_obra_terceros = v_total_mo,
            costo_total = v_total_repuestos + v_total_mo + v_total_otros
          WHERE id = v_orden_id;
        END IF;

        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log("Asociando triggers a detalle_repuestos y detalle_mano_obra...");
    await client.query(`
      DROP TRIGGER IF EXISTS tg_actualizar_costo_repuesto ON control_mantenimiento.detalle_repuestos;
      CREATE TRIGGER tg_actualizar_costo_repuesto
      AFTER INSERT OR UPDATE OR DELETE ON control_mantenimiento.detalle_repuestos
      FOR EACH ROW EXECUTE FUNCTION control_mantenimiento.fn_actualizar_costo_total_mantenimiento();

      DROP TRIGGER IF EXISTS tg_actualizar_costo_mo ON control_mantenimiento.detalle_mano_obra;
      CREATE TRIGGER tg_actualizar_costo_mo
      AFTER INSERT OR UPDATE OR DELETE ON control_mantenimiento.detalle_mano_obra
      FOR EACH ROW EXECUTE FUNCTION control_mantenimiento.fn_actualizar_costo_total_mantenimiento();
    `);

    // 3. Crear trigger de Mantenimiento Predictivo Automático
    console.log("\nCreando Trigger Función para Mantenimiento Predictivo...");
    await client.query(`
      CREATE OR REPLACE FUNCTION movimientos_diarios.fn_trg_mantenimiento_predictivo()
      RETURNS TRIGGER AS $$
      DECLARE
        v_placa text;
        v_periodicidad integer;
        v_ultimo_km_salida integer;
        v_km_recorridos_desde_mant integer;
        v_num_orden_auto text;
        v_total_pendientes integer;
      BEGIN
        IF NEW.estado = 'COMPLETADO' AND (OLD.estado IS NULL OR OLD.estado != 'COMPLETADO') AND NEW.kilometraje_llegada IS NOT NULL THEN
          
          SELECT placa, COALESCE(periodicidad_mantenimiento_km, 5000)
          INTO v_placa, v_periodicidad
          FROM vehiculos.vehiculos
          WHERE id = NEW.vehiculo_id;

          SELECT COALESCE(MAX(kilometraje_salida), 0)
          INTO v_ultimo_km_salida
          FROM control_mantenimiento.ordenes_mantenimiento
          WHERE vehiculo_id = NEW.vehiculo_id
            AND tipo_mantenimiento = 'PREVENTIVO'
            AND estado = 'COMPLETADO';

          v_km_recorridos_desde_mant := NEW.kilometraje_llegada - v_ultimo_km_salida;

          IF v_km_recorridos_desde_mant >= v_periodicidad THEN
            SELECT COUNT(*) INTO v_total_pendientes
            FROM control_mantenimiento.ordenes_mantenimiento
            WHERE vehiculo_id = NEW.vehiculo_id
              AND estado = 'PENDIENTE'
              AND tipo_mantenimiento = 'PREVENTIVO';

            IF v_total_pendientes = 0 THEN
              v_num_orden_auto := 'PREV-' || v_placa || '-' || substring(md5(random()::text) from 1 for 4);
              
              INSERT INTO control_mantenimiento.ordenes_mantenimiento (
                id, numero_orden, fecha_emision, vehiculo_id, tipo_mantenimiento, tipo_taller,
                descripcion_servicio, costo_mano_obra_propia, costo_piezas_repuestos, costo_otros,
                costo_total, estado, sector_solicitante, creado_en, actualizado_en
              ) VALUES (
                gen_random_uuid(), v_num_orden_auto, CURRENT_DATE, NEW.vehiculo_id, 'PREVENTIVO', 'PROPIO',
                'ALERTA PREVENTIVA AUTOMÁTICA (DB TRIGGER): Vehículo superó los ' || v_periodicidad || ' km. Odómetro actual: ' || NEW.kilometraje_llegada || ' km.',
                0.00, 0.00, 0.00, 0.00, 'PENDIENTE', 'Soporte Predictivo DB', NOW(), NOW()
              );

              UPDATE vehiculos.vehiculos
              SET km_alerta_mantenimiento = NEW.kilometraje_llegada
              WHERE id = NEW.vehiculo_id;
            END IF;
          END IF;

        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log("Asociando trigger a movimientos_diarios...");
    await client.query(`
      DROP TRIGGER IF EXISTS tg_mantenimiento_predictivo ON movimientos_diarios.movimientos_diarios;
      CREATE TRIGGER tg_mantenimiento_predictivo
      AFTER UPDATE ON movimientos_diarios.movimientos_diarios
      FOR EACH ROW EXECUTE FUNCTION movimientos_diarios.fn_trg_mantenimiento_predictivo();
    `);

    console.log("\n🎉 ¡Todos los objetos de base de datos han sido creados y asociados exitosamente en Supabase!");

  } catch (error) {
    console.error("Error aplicando lógica de base de datos:", error);
  } finally {
    await client.end();
  }
}

applyDatabaseLogic().catch(console.error);
