// ============================================================
// SAF - Sistema de Administración de Flotas
// Manual F1T02 — Procedimientos Básicos de Operación y Control
// Script de datos iniciales (Seed)
// Cubre: Seguridad/Personal, Flota, Operación y Configuración
// ============================================================
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const MASTER_PASSWORD = "saf123";
const hashedPassword = await bcrypt.hash(MASTER_PASSWORD, 10);

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚛 Iniciando seed del Sistema de Administración de Flotas (SAF)...\n");

  // ══════════════════════════════════════════
  // BLOQUE 1: CONFIGURACIÓN DEL SISTEMA
  // ══════════════════════════════════════════
  console.log("⚙️  ── CONFIGURACIÓN ──");
  const configs = [
    { clave: "nombre_unidad",        valor: "Unidad de Gestión de Flotas",          descripcion: "Nombre oficial de la unidad administrativa",       grupo: "general" },
    { clave: "codigo_dependencia",   valor: "F1T02",                                descripcion: "Código del manual técnico de referencia",           grupo: "general" },
    { clave: "km_objetivo_mensual",  valor: "5000",                                 descripcion: "Kilometraje objetivo mensual por vehículo (km)",    grupo: "indicadores" },
    { clave: "horas_objetivo_dia",   valor: "8",                                    descripcion: "Horas de utilización objetivo por día (HUV)",       grupo: "indicadores" },
    { clave: "km_mantenimiento_prev",valor: "5000",                                 descripcion: "Periodicidad de mantenimiento preventivo (km)",     grupo: "mantenimiento" },
    { clave: "costo_galon_gasolina", valor: "5.50",                                 descripcion: "Precio referencial por galón de gasolina",          grupo: "costos" },
    { clave: "costo_galon_diesel",   valor: "4.80",                                 descripcion: "Precio referencial por galón de diesel",            grupo: "costos" },
    { clave: "responsable_proceso",  valor: "Jefe de Logística",                    descripcion: "Cargo responsable de actualizar procedimientos",    grupo: "general" },
  ];
  for (const cfg of configs) {
    await prisma.configuracionFlota.upsert({ where: { clave: cfg.clave }, update: {}, create: cfg });
  }
  console.log(`   ✅ ${configs.length} configuraciones del sistema creadas`);

  // ══════════════════════════════════════════
  // BLOQUE 2: PERSONAL — ORGANIGRAMA F1T02
  // Jefe de Proceso → Operación / Mantenimiento / Administrativo
  // Integrantes iniciales del equipo del proyecto
  // ══════════════════════════════════════════
  console.log("\n👥 ── PERSONAL (ORGANIGRAMA F1T02) ──");

  // 2.1 Usuarios del sistema (5 integrantes del equipo)
  console.log("   👤 Creando integrantes del equipo...");

  // Jefe del Proceso (responsable de actualización de procedimientos F1T02)
  const escriba = await prisma.usuario.upsert({
    where: { email: "escriba.matto@flota.gob" },
    update: {},
    create: {
      nombre:    "Escriba",
      apellido:  "Matto",
      email:     "escriba.matto@flota.gob",
      password:  hashedPassword,
      rol:       "JEFE_PROCESO",
      telefono:  "+51 999 000 001",
      especialidad: "Gestión de Flotas y Logística",
    },
  });

  // Equipo de Operación — Conductores
  const leon = await prisma.usuario.upsert({
    where: { email: "leon.mejia@flota.gob" },
    update: {},
    create: {
      nombre:             "Leon",
      apellido:           "Mejia",
      email:              "leon.mejia@flota.gob",
      password:           hashedPassword,
      rol:                "CONDUCTOR",
      telefono:           "+51 999 000 002",
      licenciaConducir:   "Q23456789",
      categoriaLicencia:  "AIIB",
      vencimientoLicencia: new Date("2027-06-15"),
    },
  });

  const gomez = await prisma.usuario.upsert({
    where: { email: "gomez.sanchez@flota.gob" },
    update: {},
    create: {
      nombre:             "Gomez",
      apellido:           "Sanchez",
      email:              "gomez.sanchez@flota.gob",
      password:           hashedPassword,
      rol:                "CONDUCTOR",
      telefono:           "+51 999 000 006",
      licenciaConducir:   "Q98765432",
      categoriaLicencia:  "AIII",
      vencimientoLicencia: new Date("2028-11-20"),
    },
  });

  const montero = await prisma.usuario.upsert({
    where: { email: "montero.salazar@flota.gob" },
    update: {},
    create: {
      nombre:   "Montero",
      apellido: "Salazar",
      email:    "montero.salazar@flota.gob",
      password: hashedPassword,
      rol:      "INSPECTOR",
      telefono: "+51 999 000 003",
      especialidad: "Control e Inspección Vehicular",
    },
  });

  // Equipo de Mantenimiento — Mecánicos
  const polanco = await prisma.usuario.upsert({
    where: { email: "polanco.jimenez@flota.gob" },
    update: {},
    create: {
      nombre:      "Polanco",
      apellido:    "Jimenez",
      email:       "polanco.jimenez@flota.gob",
      password:    hashedPassword,
      rol:         "MECANICO",
      telefono:    "+51 999 000 004",
      especialidad: "Mecánica Automotriz y Diesel",
    },
  });

  const guerra = await prisma.usuario.upsert({
    where: { email: "guerra.salas@flota.gob" },
    update: {},
    create: {
      nombre:      "Guerra",
      apellido:    "Salas",
      email:       "guerra.salas@flota.gob",
      password:    hashedPassword,
      rol:         "MECANICO",
      telefono:    "+51 999 000 007",
      especialidad: "Sistemas Hidráulicos y Frenos",
    },
  });

  // Apoyo Administrativo
  const ventura = await prisma.usuario.upsert({
    where: { email: "ventura.chipana@flota.gob" },
    update: {},
    create: {
      nombre:   "Ventura",
      apellido: "Chipana",
      email:    "ventura.chipana@flota.gob",
      password: hashedPassword,
      rol:      "ADMINISTRATIVO",
      telefono: "+51 999 000 005",
    },
  });

  const quiroz = await prisma.usuario.upsert({
    where: { email: "quiroz.torres@flota.gob" },
    update: {},
    create: {
      nombre:   "Quiroz",
      apellido: "Torres",
      email:    "quiroz.torres@flota.gob",
      password: hashedPassword,
      rol:      "ADMINISTRATIVO",
      telefono: "+51 999 000 008",
    },
  });

  console.log("   ✅ Integrantes creados:");
  console.log("      • Escriba Matto      → JEFE_PROCESO");
  console.log("      • Leon Mejia         → CONDUCTOR");
  console.log("      • Gomez Sanchez      → CONDUCTOR");
  console.log("      • Montero Salazar    → INSPECTOR");
  console.log("      • Polanco Jimenez    → MECANICO");
  console.log("      • Guerra Salas       → MECANICO");
  console.log("      • Ventura Chipana    → ADMINISTRATIVO");
  console.log("      • Quiroz Torres      → ADMINISTRATIVO");

  // 2.2 Permisos por módulo del sistema SAF
  console.log("   🔑 Creando permisos del sistema SAF...");
  const modulosSAF = ["vehiculos", "movimiento_diario", "combustible", "mantenimiento", "llantas", "costos", "reportes", "configuracion"];
  const acciones   = ["crear", "leer", "actualizar", "eliminar"];
  const permisos: { id: string; modulo: string; accion: string }[] = [];

  for (const modulo of modulosSAF) {
    for (const accion of acciones) {
      const p = await prisma.permiso.upsert({
        where:  { modulo_accion: { modulo, accion } },
        update: {},
        create: { modulo, accion, descripcion: `Permiso para ${accion} en módulo ${modulo}` },
      });
      permisos.push(p);
    }
  }
  console.log(`   ✅ ${permisos.length} permisos creados (${modulosSAF.length} módulos × ${acciones.length} acciones)`);

  // 2.3 Asignar permisos por rol
  console.log("   🛡️  Asignando permisos por rol...");

  // Jefe de Proceso: acceso total
  for (const p of permisos) {
    await prisma.permisoUsuario.upsert({
      where:  { usuarioId_permisoId: { usuarioId: escriba.id, permisoId: p.id } },
      update: {}, create: { usuarioId: escriba.id, permisoId: p.id },
    });
  }

  // Conductores: leer vehículos + crear/leer movimiento_diario y combustible
  const permisosConductor = permisos.filter(p =>
    (p.modulo === "vehiculos" && p.accion === "leer") ||
    (p.modulo === "movimiento_diario" && ["crear", "leer"].includes(p.accion)) ||
    (p.modulo === "combustible" && ["crear", "leer"].includes(p.accion))
  );
  for (const cond of [leon, gomez]) {
    for (const p of permisosConductor) {
      await prisma.permisoUsuario.upsert({
        where:  { usuarioId_permisoId: { usuarioId: cond.id, permisoId: p.id } },
        update: {}, create: { usuarioId: cond.id, permisoId: p.id },
      });
    }
  }

  // Inspector: leer/actualizar movimiento_diario + leer vehículos/llantas
  const permisosInspector = permisos.filter(p =>
    (p.modulo === "movimiento_diario" && ["leer", "actualizar"].includes(p.accion)) ||
    (p.modulo === "vehiculos" && ["leer", "actualizar"].includes(p.accion)) ||
    (p.modulo === "llantas" && ["crear", "leer", "actualizar"].includes(p.accion))
  );
  for (const p of permisosInspector) {
    await prisma.permisoUsuario.upsert({
      where:  { usuarioId_permisoId: { usuarioId: montero.id, permisoId: p.id } },
      update: {}, create: { usuarioId: montero.id, permisoId: p.id },
    });
  }

  // Mecánicos: crear/leer/actualizar mantenimiento
  const permisosMecanico = permisos.filter(p =>
    (p.modulo === "mantenimiento" && ["crear", "leer", "actualizar"].includes(p.accion)) ||
    (p.modulo === "vehiculos" && p.accion === "leer")
  );
  for (const mec of [polanco, guerra]) {
    for (const p of permisosMecanico) {
      await prisma.permisoUsuario.upsert({
        where:  { usuarioId_permisoId: { usuarioId: mec.id, permisoId: p.id } },
        update: {}, create: { usuarioId: mec.id, permisoId: p.id },
      });
    }
  }

  // Administrativos: leer todos + crear/actualizar costos y configuración
  const permisosAdmin = permisos.filter(p =>
    p.accion === "leer" ||
    (p.modulo === "costos" && ["crear", "actualizar"].includes(p.accion)) ||
    (p.modulo === "reportes" && ["crear", "leer"].includes(p.accion))
  );
  for (const adm of [ventura, quiroz]) {
    for (const p of permisosAdmin) {
      await prisma.permisoUsuario.upsert({
        where:  { usuarioId_permisoId: { usuarioId: adm.id, permisoId: p.id } },
        update: {}, create: { usuarioId: adm.id, permisoId: p.id },
      });
    }
  }

  console.log("   ✅ Permisos asignados por rol (Jefe: todo | Conductores/Inspector/Mecánicos/Admins: granular)");

  // ══════════════════════════════════════════
  // BLOQUE 3: COSTOS FIJOS PRORRATEABLES (CKV)
  // ══════════════════════════════════════════
  console.log("\n💰 ── COSTOS FIJOS PRORRATEABLES ──");
  const costosFijos = [
    { periodo: "2026-05", tipo: "PERSONAL_ADMINISTRATIVO" as const, descripcion: "Remuneración Ventura Chipana (Apoyo Administrativo)", montoMensual: 2800 },
    { periodo: "2026-05", tipo: "OFICINA"                 as const, descripcion: "Alquiler oficina + servicios (agua, luz, internet)",    montoMensual: 1200 },
    { periodo: "2026-05", tipo: "COMUNICACIONES"          as const, descripcion: "Telefonía móvil y radio comunicación flota",            montoMensual:  450 },
    { periodo: "2026-05", tipo: "LICENCIAS_SOFTWARE"      as const, descripcion: "Licencia sistema SAF + herramientas digitales",         montoMensual:  350 },
  ];
  for (const cf of costosFijos) {
    await prisma.costoFijoProrrateable.upsert({
      where: { id: `seed-cf-${cf.tipo.toLowerCase()}` },
      update: {},
      create: { id: `seed-cf-${cf.tipo.toLowerCase()}`, ...cf },
    });
  }
  console.log(`   ✅ ${costosFijos.length} costos fijos prorrateables registrados`);

  // ══════════════════════════════════════════
  // BLOQUE 4: INVENTARIO DE FLOTA — VEHÍCULOS
  // Código Patrimonial: CL-CAT-SEQ (6 dígitos)
  //   01 = Terrestre | 01=Pasajeros / 02=Carga / 03=Especial
  // ══════════════════════════════════════════
  console.log("\n🚗 ── INVENTARIO DE FLOTA ──");
  console.log("   🔧 Creando vehículos con ficha técnica completa...");

  // Vehículo 1: Minibus de Pasajeros — Código 01-01-001
  const vehiculo1 = await prisma.vehiculo.upsert({
    where: { codigoPatrimonial: "01-01-001" },
    update: {},
    create: {
      clasePatrimonial:      "01",
      categoriaPatrimonial:  "PASAJEROS",
      secuencial:            "001",
      codigoPatrimonial:     "01-01-001",
      placa:                 "ABC-123",
      marca:                 "Toyota",
      modelo:                "Coaster",
      anioFabricacion:       2020,
      color:                 "Blanco",
      numeroMotor:           "TOY-1HZ-987654",
      numeroChasis:          "JTFSX22P300123456",
      potenciaHp:            150,
      cilindraje:            4.2,
      numeroCilindros:       6,
      tipoCombustible:       "DIESEL",
      capacidadTanqueGal:    20,
      capacidadPasajeros:    25,
      pesoNetoKg:            3200,
      pesoBrutoKg:           5500,
      // Batería
      bateriaTipo:           "Plomo-Ácido",
      bateriaCeldas:         6,
      bateriaVoltios:        12,
      bateriaAmperios:       90,
      numeroBaterias:        1,
      // Ejes y llantas
      numeroEjes:            2,
      configuracionEjes:     "4×2",
      totalLlantas:          6,
      dimensionLlantaEstandar: "7.50R16",
      presionLlantaDelantera: 80,
      presionLlantaTrasera:   95,
      // Inventario físico (Diagrama 3)
      estadoPintura:         "BUENO",
      estadoFaros:           "BUENO",
      estadoLunas:           "BUENO",
      estadoEspejos:         "BUENO",
      estadoCarroceria:      "BUENO",
      inventarioHerramientas: "Gata hidráulica, llave de ruedas, triángulos reflectantes, extintor 2kg, botiquín, cable de arranque",
      // Costos fijos para CKV
      valorAdquisicion:      85000,
      vidaUtilAnios:         10,
      kmAnualesReferencia:   60000,
      seguroAnual:           3200,
      licenciamientoAnual:   450,
      periodicidadMantenimientoKm: 5000,
      estado:                "OPERATIVO",
    },
  });

  // Vehículo 2: Camión de Carga — Código 01-02-001
  const vehiculo2 = await prisma.vehiculo.upsert({
    where: { codigoPatrimonial: "01-02-001" },
    update: {},
    create: {
      clasePatrimonial:      "01",
      categoriaPatrimonial:  "CARGA",
      secuencial:            "001",
      codigoPatrimonial:     "01-02-001",
      placa:                 "DEF-456",
      marca:                 "Hyundai",
      modelo:                "HD78",
      anioFabricacion:       2019,
      color:                 "Azul",
      numeroMotor:           "HYU-D4DD-234567",
      numeroChasis:          "KMFGA17BP1K234567",
      potenciaHp:            130,
      cilindraje:            3.9,
      numeroCilindros:       4,
      tipoCombustible:       "DIESEL",
      capacidadTanqueGal:    26,
      capacidadCargaKg:      3500,
      pesoNetoKg:            2800,
      pesoBrutoKg:           7500,
      // Batería
      bateriaTipo:           "AGM",
      bateriaCeldas:         6,
      bateriaVoltios:        12,
      bateriaAmperios:       100,
      numeroBaterias:        1,
      // Ejes y llantas
      numeroEjes:            2,
      configuracionEjes:     "4×2",
      totalLlantas:          6,
      dimensionLlantaEstandar: "8.25R16",
      presionLlantaDelantera: 90,
      presionLlantaTrasera:   105,
      // Inventario físico
      estadoPintura:         "REGULAR",
      estadoFaros:           "BUENO",
      estadoLunas:           "BUENO",
      estadoEspejos:         "REGULAR",
      estadoCarroceria:      "REGULAR",
      inventarioHerramientas: "Gata botella 5T, llave de ruedas, triángulos reflectantes, extintor 4kg, botiquín, eslinga",
      // Costos fijos para CKV
      valorAdquisicion:      65000,
      vidaUtilAnios:         8,
      kmAnualesReferencia:   50000,
      seguroAnual:           2800,
      licenciamientoAnual:   550,
      periodicidadMantenimientoKm: 5000,
      estado:                "OPERATIVO",
    },
  });

  // Vehículo 3: Vehículo Especial / Ambulancia — Código 01-03-001
  const vehiculo3 = await prisma.vehiculo.upsert({
    where: { codigoPatrimonial: "01-03-001" },
    update: {},
    create: {
      clasePatrimonial:      "01",
      categoriaPatrimonial:  "ESPECIAL",
      secuencial:            "001",
      codigoPatrimonial:     "01-03-001",
      placa:                 "GHI-789",
      marca:                 "Mercedes-Benz",
      modelo:                "Sprinter 315 CDI",
      anioFabricacion:       2021,
      color:                 "Blanco con franjas rojas",
      numeroMotor:           "MB-OM651-345678",
      numeroChasis:          "WDB9066331S345678",
      potenciaHp:            150,
      cilindraje:            2.2,
      numeroCilindros:       4,
      tipoCombustible:       "DIESEL",
      capacidadTanqueGal:    18,
      capacidadPasajeros:    3,
      pesoNetoKg:            2100,
      pesoBrutoKg:           3500,
      // Batería (doble batería por equipos médicos)
      bateriaTipo:           "AGM",
      bateriaCeldas:         6,
      bateriaVoltios:        12,
      bateriaAmperios:       90,
      numeroBaterias:        2,
      // Ejes y llantas
      numeroEjes:            2,
      configuracionEjes:     "4×2",
      totalLlantas:          5,
      dimensionLlantaEstandar: "235/65R16C",
      presionLlantaDelantera: 65,
      presionLlantaTrasera:   75,
      // Inventario físico
      estadoPintura:         "BUENO",
      estadoFaros:           "BUENO",
      estadoLunas:           "BUENO",
      estadoEspejos:         "BUENO",
      estadoCarroceria:      "BUENO",
      inventarioHerramientas: "Gata pantógrafo, llave de ruedas, triángulos, extintor 2kg, botiquín médico avanzado, camilla, tanque de oxígeno",
      // Costos fijos para CKV
      valorAdquisicion:      120000,
      vidaUtilAnios:         12,
      kmAnualesReferencia:   40000,
      seguroAnual:           4500,
      licenciamientoAnual:   650,
      periodicidadMantenimientoKm: 5000,
      estado:                "OPERATIVO",
    },
  });

  console.log("   ✅ 3 vehículos registrados:");
  console.log("      • 01-01-001 | ABC-123 | Toyota Coaster       | Pasajeros (25)");
  console.log("      • 01-02-001 | DEF-456 | Hyundai HD78         | Carga (3,500 kg)");
  console.log("      • 01-03-001 | GHI-789 | Mercedes Sprinter    | Especial (Ambulancia)");

  // ══════════════════════════════════════════
  // BLOQUE 5: CONTROL DE LLANTAS
  // ══════════════════════════════════════════
  console.log("\n🛞  ── CONTROL DE LLANTAS ──");
  const llantas = [
    // Vehículo 1 (ABC-123) — Toyota Coaster — 6 llantas
    { codigoEps: "EPS-2024-001", vehiculoId: vehiculo1.id, fabricante: "Bridgestone", dimension: "7.50R16", modeloLlanta: "R168",  posicionVehiculo: 1, descripcionPosicion: "Delantera Izquierda",    fechaInstalacion: new Date("2024-01-15"), kilometrajeInstalacion: 45000, costoAdquisicion: 280 },
    { codigoEps: "EPS-2024-002", vehiculoId: vehiculo1.id, fabricante: "Bridgestone", dimension: "7.50R16", modeloLlanta: "R168",  posicionVehiculo: 2, descripcionPosicion: "Delantera Derecha",     fechaInstalacion: new Date("2024-01-15"), kilometrajeInstalacion: 45000, costoAdquisicion: 280 },
    { codigoEps: "EPS-2024-003", vehiculoId: vehiculo1.id, fabricante: "Goodyear",    dimension: "7.50R16", modeloLlanta: "G658",  posicionVehiculo: 3, descripcionPosicion: "Trasera Izq. Exterior", fechaInstalacion: new Date("2023-06-01"), kilometrajeInstalacion: 28000, costoAdquisicion: 310 },
    { codigoEps: "EPS-2024-004", vehiculoId: vehiculo1.id, fabricante: "Goodyear",    dimension: "7.50R16", modeloLlanta: "G658",  posicionVehiculo: 4, descripcionPosicion: "Trasera Izq. Interior", fechaInstalacion: new Date("2023-06-01"), kilometrajeInstalacion: 28000, costoAdquisicion: 310 },
    { codigoEps: "EPS-2024-005", vehiculoId: vehiculo1.id, fabricante: "Goodyear",    dimension: "7.50R16", modeloLlanta: "G658",  posicionVehiculo: 5, descripcionPosicion: "Trasera Der. Interior", fechaInstalacion: new Date("2023-06-01"), kilometrajeInstalacion: 28000, costoAdquisicion: 310 },
    { codigoEps: "EPS-2024-006", vehiculoId: vehiculo1.id, fabricante: "Goodyear",    dimension: "7.50R16", modeloLlanta: "G658",  posicionVehiculo: 6, descripcionPosicion: "Trasera Der. Exterior", fechaInstalacion: new Date("2023-06-01"), kilometrajeInstalacion: 28000, costoAdquisicion: 310 },
    { codigoEps: "EPS-2024-007", vehiculoId: vehiculo1.id, fabricante: "Bridgestone", dimension: "7.50R16", modeloLlanta: "R168",  posicionVehiculo: 7, descripcionPosicion: "Repuesto",              fechaInstalacion: new Date("2024-01-15"), kilometrajeInstalacion: 45000, costoAdquisicion: 280 },
    // Vehículo 2 (DEF-456) — Hyundai HD78 — 2 llantas de ejemplo
    { codigoEps: "EPS-2024-008", vehiculoId: vehiculo2.id, fabricante: "Michelin",    dimension: "8.25R16", modeloLlanta: "XZY3", posicionVehiculo: 1, descripcionPosicion: "Delantera Izquierda",    fechaInstalacion: new Date("2024-03-10"), kilometrajeInstalacion: 62000, costoAdquisicion: 420 },
    { codigoEps: "EPS-2024-009", vehiculoId: vehiculo2.id, fabricante: "Michelin",    dimension: "8.25R16", modeloLlanta: "XZY3", posicionVehiculo: 2, descripcionPosicion: "Delantera Derecha",     fechaInstalacion: new Date("2024-03-10"), kilometrajeInstalacion: 62000, costoAdquisicion: 420 },
  ];
  for (const ll of llantas) {
    await prisma.controlLlanta.upsert({
      where:  { codigoEps: ll.codigoEps },
      update: {},
      create: { ...ll, estado: "EN_USO", kilometrajeAcumulado: 0, veceReencauchada: 0 },
    });
  }
  console.log(`   ✅ ${llantas.length} llantas registradas (7 del Coaster + 2 del HD78)`);

  // ══════════════════════════════════════════
  // BLOQUE 6: MOVIMIENTOS DIARIOS (MA 122 01 01)
  // ══════════════════════════════════════════
  console.log("\n📋 ── MOVIMIENTOS DIARIOS (MA 122 01 01) ──");

  // Movimiento 1: León (conductor) con vehículo 1 — con checklist OK
  const mov1 = await prisma.movimientoDiario.upsert({
    where: { id: "seed-mov-001" },
    update: {},
    create: {
      id:                  "seed-mov-001",
      vehiculoId:          vehiculo1.id,
      conductorId:         leon.id,
      inspectorId:         montero.id,
      fecha:               new Date("2026-05-20"),
      sectorSolicitante:   "Oficina Central",
      destino:             "Hospital Regional - Av. Los Héroes 1234",
      proposito:           "Traslado de personal médico",
      kilometrajeSalida:   48500,
      kilometrajeLlegada:  48712,
      kilometrajeRecorrido: 212,
      horaSalida:          "07:30",
      horaLlegada:         "16:45",
      horasUtilizacion:    9.25,
      estado:              "COMPLETADO",
      observaciones:       "Servicio completado sin incidentes",
    },
  });

  // Checklist del movimiento 1 — todo en orden
  await prisma.checklistVerificacion.upsert({
    where: { movimientoId: "seed-mov-001" },
    update: {},
    create: {
      movimientoId:       "seed-mov-001",
      documentos:         "OK",
      aceiteMotor:        "OK",
      agua:               "OK",
      bateria:            "OK",
      frenos:             "OK",
      embrague:           "OK",
      fajas:              "OK",
      faros:              "OK",
      lunas:              "OK",
      plumillas:          "OK",
      llantas:            "OK",
      espejos:            "OK",
      herramientas:       "OK",
      extintorBotiquin:   "OK",
      manchasFugas:       "OK",
      aptoParaOperar:     true,
      observacionesGenerales: "Vehículo en óptimas condiciones pre-operacionales",
      firmaConductor:     "Leon Mejia",
      firmaInspector:     "Montero Salazar",
    },
  });

  // Movimiento 2: Camión de carga — con observación en llantas
  const mov2 = await prisma.movimientoDiario.upsert({
    where: { id: "seed-mov-002" },
    update: {},
    create: {
      id:                  "seed-mov-002",
      vehiculoId:          vehiculo2.id,
      conductorId:         leon.id,
      inspectorId:         montero.id,
      fecha:               new Date("2026-05-21"),
      sectorSolicitante:   "Almacén Central",
      destino:             "Sede Norte - Km 15 Carretera Norte",
      proposito:           "Distribución de materiales logísticos",
      kilometrajeSalida:   67300,
      kilometrajeLlegada:  67580,
      kilometrajeRecorrido: 280,
      horaSalida:          "08:00",
      horaLlegada:         "17:30",
      horasUtilizacion:    9.5,
      estado:              "COMPLETADO",
      observaciones:       "Desgaste leve en llanta trasera derecha exterior",
    },
  });

  await prisma.checklistVerificacion.upsert({
    where: { movimientoId: "seed-mov-002" },
    update: {},
    create: {
      movimientoId:       "seed-mov-002",
      documentos:         "OK",
      aceiteMotor:        "OK",
      agua:               "OK",
      bateria:            "OK",
      frenos:             "OK",
      embrague:           "OK",
      fajas:              "OK",
      faros:              "OK",
      lunas:              "OK",
      plumillas:          "OK",
      llantas:            "OBSERVADO",
      observLlantas:      "Desgaste en llanta posición 6 (trasera der. exterior), presión baja 5 PSI",
      espejos:            "OBSERVADO",
      observEspejos:      "Espejo retrovisor derecho con vibración leve",
      herramientas:       "OK",
      extintorBotiquin:   "OK",
      manchasFugas:       "OK",
      aptoParaOperar:     true,
      observacionesGenerales: "Apto para operar, programar revisión de llantas",
      firmaConductor:     "Leon Mejia",
      firmaInspector:     "Montero Salazar",
    },
  });

  console.log("   ✅ 2 movimientos diarios con checklist creados");

  // ══════════════════════════════════════════
  // BLOQUE 7: ÓRDENES DE COMBUSTIBLE (MA 122 01 02)
  // ══════════════════════════════════════════
  console.log("\n⛽ ── ÓRDENES DE COMBUSTIBLE (MA 122 01 02) ──");

  await prisma.ordenCombustible.upsert({
    where: { numeroOrden: "OC-2026-001" },
    update: {},
    create: {
      numeroOrden:          "OC-2026-001",
      fecha:                new Date("2026-05-20"),
      vehiculoId:           vehiculo1.id,
      conductorId:          leon.id,
      sectorSolicitante:    "Oficina Central",
      tipoCombustible:      "DIESEL",
      cantidadGalones:      12,
      costoGalon:           4.85,
      costoCombustible:     58.20,
      // Lubricante — aceite de motor por separado
      incluyeAceiteMotor:   true,
      cantidadAceiteMotorLt: 4,
      marcaAceiteMotor:     "Mobil Delvac",
      viscosidadAceiteMotor: "15W-40",
      costoAceiteMotor:     48.00,
      // Sin cambio de aceite de caja en esta orden
      incluyeAceiteCaja:    false,
      costoTotal:           106.20,
      kilometrajeActual:    48500,
      // Datos del servicentro acreditado
      nombreServiccentro:   "Grifo San Martín S.A.C.",
      direccionServiccentro: "Av. Industrial 456, Zona Industrial",
      numeroTicketServiccentro: "T-00234",
      responsableServiccentro: "Juan Carlos Ramos",
      sellServiccentro:     true,
    },
  });

  await prisma.ordenCombustible.upsert({
    where: { numeroOrden: "OC-2026-002" },
    update: {},
    create: {
      numeroOrden:          "OC-2026-002",
      fecha:                new Date("2026-05-21"),
      vehiculoId:           vehiculo2.id,
      conductorId:          leon.id,
      sectorSolicitante:    "Almacén Central",
      tipoCombustible:      "DIESEL",
      cantidadGalones:      18,
      costoGalon:           4.85,
      costoCombustible:     87.30,
      incluyeAceiteMotor:   false,
      incluyeAceiteCaja:    false,
      costoTotal:           87.30,
      kilometrajeActual:    67300,
      nombreServiccentro:   "Primax Express - Sede Norte",
      direccionServiccentro: "Km 12 Carretera Norte",
      numeroTicketServiccentro: "T-00891",
      responsableServiccentro: "María López Soto",
      sellServiccentro:     true,
    },
  });

  console.log("   ✅ 2 órdenes de combustible creadas (con registro de lubricante por separado)");

  // ══════════════════════════════════════════
  // BLOQUE 8: ÓRDENES DE MANTENIMIENTO (MA 122 02 01)
  // ══════════════════════════════════════════
  console.log("\n🔧 ── MANTENIMIENTO (MA 122 02 01) ──");

  // Mantenimiento Preventivo — Taller Propio
  const om1 = await prisma.ordenMantenimiento.upsert({
    where: { numeroOrden: "OM-2026-001" },
    update: {},
    create: {
      numeroOrden:          "OM-2026-001",
      fechaEmision:         new Date("2026-05-10"),
      vehiculoId:           vehiculo1.id,
      tecnicoId:            polanco.id,
      sectorSolicitante:    "Oficina Central",
      tipoMantenimiento:    "PREVENTIVO",
      tipoTaller:           "PROPIO",
      fechaEntradaTaller:   new Date("2026-05-12"),
      horaEntradaTaller:    "08:00",
      fechaSalidaTaller:    new Date("2026-05-12"),
      horaSalidaTaller:     "13:30",
      kilometrajeEntrada:   45000,
      kilometrajeSalida:    45000,
      descripcionServicio:  "Mantenimiento preventivo de 5,000 km: cambio de aceite y filtros, revisión general de frenos y sistema eléctrico",
      fallaReportada:       "Mantenimiento programado por kilometraje",
      diagnosticoTecnico:   "Vehículo en buen estado, se realiza mantenimiento según cronograma del fabricante",
      costoManoObraPropia:  120.00,
      costoPiezasRepuestos: 215.50,
      costoOtros:           0,
      costoTotal:           335.50,
      estado:               "COMPLETADO",
    },
  });

  // Repuestos del mantenimiento 1 (Almacén de Mantenimiento)
  await prisma.detalleRepuesto.createMany({
    skipDuplicates: true,
    data: [
      { id: "seed-rep-001", ordenMantenimientoId: om1.id, descripcion: "Aceite de motor Mobil Delvac 15W-40",  numeroParteCatalogo: "MOB-15W40-5L",    unidadMedida: "litro",   cantidad: 4,    precioUnitario: 12.00, subtotal: 48.00, esAlmacenPropio: true,  proveedor: "Almacén Mantenimiento" },
      { id: "seed-rep-002", ordenMantenimientoId: om1.id, descripcion: "Filtro de aceite",                    numeroParteCatalogo: "TOY-90915-YZZD4",  unidadMedida: "unidad",  cantidad: 1,    precioUnitario: 18.50, subtotal: 18.50, esAlmacenPropio: true,  proveedor: "Almacén Mantenimiento" },
      { id: "seed-rep-003", ordenMantenimientoId: om1.id, descripcion: "Filtro de combustible",               numeroParteCatalogo: "TOY-23390-64450",  unidadMedida: "unidad",  cantidad: 1,    precioUnitario: 22.00, subtotal: 22.00, esAlmacenPropio: true,  proveedor: "Almacén Mantenimiento" },
      { id: "seed-rep-004", ordenMantenimientoId: om1.id, descripcion: "Filtro de aire",                      numeroParteCatalogo: "TOY-17801-38020",  unidadMedida: "unidad",  cantidad: 1,    precioUnitario: 35.00, subtotal: 35.00, esAlmacenPropio: true,  proveedor: "Almacén Mantenimiento" },
      { id: "seed-rep-005", ordenMantenimientoId: om1.id, descripcion: "Líquido de frenos DOT 4",             numeroParteCatalogo: "LF-DOT4-500ML",   unidadMedida: "frasco",  cantidad: 2,    precioUnitario: 15.00, subtotal: 30.00, esAlmacenPropio: true,  proveedor: "Almacén Mantenimiento" },
      { id: "seed-rep-006", ordenMantenimientoId: om1.id, descripcion: "Grasa multipropósito",               numeroParteCatalogo: "GRS-MULTI-500G",  unidadMedida: "pote",    cantidad: 1,    precioUnitario: 12.00, subtotal: 12.00, esAlmacenPropio: true,  proveedor: "Almacén Mantenimiento" },
      { id: "seed-rep-007", ordenMantenimientoId: om1.id, descripcion: "Faja de alternador",                 numeroParteCatalogo: "FAJ-ALT-1HZ",     unidadMedida: "unidad",  cantidad: 1,    precioUnitario: 50.00, subtotal: 50.00, esAlmacenPropio: false, proveedor: "Ferretería Automotriz Central" },
    ],
  });

  // Mano de obra del mantenimiento 1
  await prisma.detalleManoObra.createMany({
    skipDuplicates: true,
    data: [
      { id: "seed-mo-001", ordenMantenimientoId: om1.id, descripcionTarea: "Cambio de aceite y filtros",           horasTrabajadas: 1.5, costoHora: 30, subtotal: 45.00, nombreTecnico: "Polanco Jimenez" },
      { id: "seed-mo-002", ordenMantenimientoId: om1.id, descripcionTarea: "Revisión y ajuste del sistema de frenos", horasTrabajadas: 1.5, costoHora: 30, subtotal: 45.00, nombreTecnico: "Polanco Jimenez" },
      { id: "seed-mo-003", ordenMantenimientoId: om1.id, descripcionTarea: "Revisión sistema eléctrico y batería",  horasTrabajadas: 1.0, costoHora: 30, subtotal: 30.00, nombreTecnico: "Polanco Jimenez" },
    ],
  });

  // Mantenimiento Correctivo — Taller de Terceros
  const om2 = await prisma.ordenMantenimiento.upsert({
    where: { numeroOrden: "OM-2026-002" },
    update: {},
    create: {
      numeroOrden:            "OM-2026-002",
      fechaEmision:           new Date("2026-05-18"),
      vehiculoId:             vehiculo2.id,
      tecnicoId:              polanco.id,
      sectorSolicitante:      "Almacén Central",
      tipoMantenimiento:      "CORRECTIVO",
      tipoTaller:             "TERCEROS",
      nombreTallerExterno:    "Taller Diesel Hnos. Ramírez",
      numeroAutorizacionExterna: "ASE-2026-045",
      fechaEntradaTaller:     new Date("2026-05-19"),
      horaEntradaTaller:      "09:00",
      fechaSalidaTaller:      new Date("2026-05-20"),
      horaSalidaTaller:       "17:00",
      kilometrajeEntrada:     67000,
      kilometrajeSalida:      67000,
      descripcionServicio:    "Reparación correctiva: diagnóstico y cambio de inyectores del motor diesel",
      fallaReportada:         "Motor con pérdida de potencia y humo negro excesivo reportado por conductor",
      diagnosticoTecnico:     "2 inyectores defectuosos (posición 2 y 4). Se requiere reemplazo y calibración.",
      costoManoObraTerceros:  350.00,
      costoPiezasRepuestos:   480.00,
      costoOtros:             25.00,
      costoTotal:             855.00,
      estado:                 "COMPLETADO",
      observaciones:          "Autorización de Servicio Externo ASE-2026-045 adjunta a la orden",
    },
  });

  await prisma.detalleRepuesto.createMany({
    skipDuplicates: true,
    data: [
      { id: "seed-rep-008", ordenMantenimientoId: om2.id, descripcion: "Inyector Diesel Bosch (posición 2)", numeroParteCatalogo: "BSH-0445110012", unidadMedida: "unidad", cantidad: 1, precioUnitario: 240.00, subtotal: 240.00, esAlmacenPropio: false, proveedor: "Taller Diesel Hnos. Ramírez" },
      { id: "seed-rep-009", ordenMantenimientoId: om2.id, descripcion: "Inyector Diesel Bosch (posición 4)", numeroParteCatalogo: "BSH-0445110012", unidadMedida: "unidad", cantidad: 1, precioUnitario: 240.00, subtotal: 240.00, esAlmacenPropio: false, proveedor: "Taller Diesel Hnos. Ramírez" },
    ],
  });

  console.log("   ✅ 2 órdenes de mantenimiento creadas:");
  console.log("      • OM-2026-001 | Preventivo | Taller Propio    | Toyota Coaster (Polanco Jimenez)");
  console.log("      • OM-2026-002 | Correctivo | Taller Terceros  | Hyundai HD78 (ASE-2026-045)");

  // ══════════════════════════════════════════
  // RESUMEN FINAL
  // ══════════════════════════════════════════
  console.log("\n" + "═".repeat(60));
  console.log("✅ SEED SAF — SISTEMA DE ADMINISTRACIÓN DE FLOTAS COMPLETADO");
  console.log("═".repeat(60));
  console.log(`
📊 Resumen de datos creados:

   ⚙️  CONFIGURACIÓN:
      • 8 parámetros del sistema SAF

   👥 PERSONAL (ORGANIGRAMA F1T02):
      • 5 usuarios con roles jerárquicos
        - Escriba Matto      → JEFE_PROCESO
        - Leon Mejia         → CONDUCTOR (Lic. AIIB)
        - Montero Salazar    → INSPECTOR
        - Polanco Jimenez    → MECANICO
        - Ventura Chipana    → ADMINISTRATIVO
      • 32 permisos (8 módulos × 4 acciones)
      • Permisos asignados por rol

   💰 COSTOS FIJOS PRORRATEABLES (CKV):
      • 4 costos fijos del periodo 2026-05

   🚗 INVENTARIO DE FLOTA:
      • 3 vehículos con ficha técnica completa
        - 01-01-001 | ABC-123 | Toyota Coaster       | Pasajeros
        - 01-02-001 | DEF-456 | Hyundai HD78         | Carga
        - 01-03-001 | GHI-789 | Mercedes Sprinter    | Especial

   🛞  CONTROL DE LLANTAS:
      • 9 llantas registradas (7 del Coaster + 2 del HD78)
      • Control por código EPS y posición (1–7)

   📋 MOVIMIENTOS DIARIOS (MA 122 01 01):
      • 2 movimientos con checklist de 15 puntos
      • Horas de utilización (HUV) registradas

   ⛽ COMBUSTIBLE Y LUBRICANTES (MA 122 01 02):
      • 2 órdenes de abastecimiento
      • Lubricante de motor registrado por separado

   🔧 MANTENIMIENTO (MA 122 02 01):
      • 2 órdenes (1 Preventivo Taller Propio + 1 Correctivo Terceros)
      • 9 repuestos del Almacén de Mantenimiento
      • 3 registros de mano de obra (Tarjeta de Mano de Obra)
  `);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error("❌ Error durante el seed SAF:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
