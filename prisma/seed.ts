// ============================================================
// SAF - Sistema de Administración de Flotas
// Manual F1T02 — Procedimientos Básicos de Operación y Control
// Script de datos iniciales (Seed) — NORMALIZADO
// Cubre: Tablas Lookup, Seguridad/Personal, Flota, Operación y Configuración
// ============================================================
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const MASTER_PASSWORD = process.env.SEED_PASSWORD || "saf123";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash(MASTER_PASSWORD, 10);
  console.log("🚛 Iniciando seed del Sistema de Administración de Flotas (SAF)...\n");

  // ══════════════════════════════════════════
  // BLOQUE 0: TABLAS DE NORMALIZACIÓN (LOOKUPS)
  // ══════════════════════════════════════════
  console.log("📋 ── TABLAS DE NORMALIZACIÓN ──");

  // 0.1 Marcas de Vehículos
  console.log("   🏭 Creando marcas de vehículos...");
  const marcasData = [
    { nombre: "TOYOTA", pais: "Japón" }, { nombre: "HYUNDAI", pais: "Corea del Sur" },
    { nombre: "KIA", pais: "Corea del Sur" }, { nombre: "NISSAN", pais: "Japón" },
    { nombre: "CHEVROLET", pais: "Estados Unidos" }, { nombre: "FORD", pais: "Estados Unidos" },
    { nombre: "MAZDA", pais: "Japón" }, { nombre: "MITSUBISHI", pais: "Japón" },
    { nombre: "SUZUKI", pais: "Japón" }, { nombre: "ISUZU", pais: "Japón" },
    { nombre: "MERCEDES-BENZ", pais: "Alemania" }, { nombre: "VOLKSWAGEN", pais: "Alemania" },
    { nombre: "FIAT", pais: "Italia" }, { nombre: "HONDA", pais: "Japón" },
    { nombre: "DAIHATSU", pais: "Japón" }, { nombre: "CHERY", pais: "China" },
    { nombre: "MOTORS", pais: "China" }, { nombre: "DFM", pais: "China" },
    { nombre: "CHANGAN", pais: "China" }, { nombre: "GWM", pais: "China" },
    { nombre: "HAVAL", pais: "China" }, { nombre: "JAC", pais: "China" },
    { nombre: "RENAULT", pais: "Francia" }, { nombre: "PEUGEOT", pais: "Francia" },
    { nombre: "CITROËN", pais: "Francia" }, { nombre: "BMW", pais: "Alemania" },
    { nombre: "SUBARU", pais: "Japón" }, { nombre: "LEXUS", pais: "Japón" },
    { nombre: "INFINITI", pais: "Japón" }, { nombre: "AUDI", pais: "Alemania" },
  ];
  const marcas: Record<string, string> = {};
  for (const m of marcasData) {
    const created = await prisma.marcaVehiculo.upsert({
      where: { nombre: m.nombre }, update: {}, create: m,
    });
    marcas[m.nombre] = created.id;
  }
  console.log(`   ✅ ${marcasData.length} marcas creadas`);

  // 0.2 Modelos de Vehículos
  console.log("   🚗 Creando modelos de vehículos...");
  const modelosData: Record<string, string[]> = {
    "TOYOTA": ["HILUX", "COROLLA", "CAMRY", "4RUNNER", "PRADO", "COASTER", "HIACE", "INNOVA", "RUSH", "FORTUNER"],
    "HYUNDAI": ["TUCSON", "SANTA FE", "ACCENT", "i10", "i20", "HD78", "PORTER", "ELANTRA", "CRETA"],
    "KIA": ["SPORTAGE", "SONATA", "PICANTO", "CERATO", "SORENTO", "RIO", "SELTOS"],
    "NISSAN": ["FRONTIER", "SENTRA", "MARCH", "X-TRAIL", "NP300", "KICKS", "QASHQAI"],
    "CHEVROLET": ["SAIL", "ONIX", "CAPTIVA", "NPR", "TORNADO", "SPARK", "TRACKER", "S10"],
    "FORD": ["RANGER", "ESCAPE", "ECOSPORT", "TRANSIT", "TERRITORY", "MAVERICK"],
    "MAZDA": ["MAZDA3", "MAZDA6", "CX-3", "CX-5", "CX-30", "BT-50"],
    "MITSUBISHI": ["OUTLANDER", "L200", "MONTERO", "ASX", "ATTRAGE", "TRITON"],
    "SUZUKI": ["SWIFT", "VITARA", "JIMNY", "CELERIO", "DZIRE", "CARRY"],
    "ISUZU": ["D-MAX", "MU-X", "NPR", "NQR", "FRR", "FSR"],
    "MERCEDES-BENZ": ["SPRINTER", "ACTROS", "ATEGO", "VITO", "CLASE C", "CLASE E"],
    "VOLKSWAGEN": ["GOL", "POLO", "T-CROSS", "TIGUAN", "AMAROK", "TRANSPORTER"],
    "FIAT": ["DUCATO", "DOBLÒ", "PUNTO", "500", "CRONOS"],
    "HONDA": ["CIVIC", "CR-V", "HR-V", "FIT", "WR-V"],
    "DAIHATSU": ["TERIOS", "HIJET", "MIRA", "CUORE"],
    "CHERY": ["TIGGO", "ARRIZO", "QQ", "FULWIN"],
    "DFM": ["RICH", "C35", "K01"],
    "CHANGAN": ["CS35", "CS55", "CS75", "ALSVIN"],
    "GWM": ["POER", "Haval JOLION", "Haval H6", "ORA"],
    "HAVAL": ["JOLION", "H6", "F7"],
    "JAC": ["S2", "S3", "T6", "REFINE"],
    "RENAULT": ["DUSTER", "KWID", "SANDERO", "LOGAN", "KOLEOS"],
    "PEUGEOT": ["208", "2008", "3008", "PARTNER", "RENDER"],
    "CITROËN": ["C3", "C4", "BERLINGO", "JUMPER"],
    "BMW": ["SERIE 3", "SERIE 5", "X1", "X3", "X5"],
    "SUBARU": ["OUTBACK", "FORESTER", "XV"],
    "LEXUS": ["NX", "RX", "IS", "ES"],
    "INFINITI": ["Q50", "QX50", "QX60"],
    "AUDI": ["A3", "A4", "Q3", "Q5"],
  };
  let totalModelos = 0;
  for (const [marcaNombre, modelos] of Object.entries(modelosData)) {
    const marcaId = marcas[marcaNombre];
    if (!marcaId) continue;
    for (const modeloNombre of modelos) {
      await prisma.modeloVehiculo.upsert({
        where: { marcaId_nombre: { marcaId, nombre: modeloNombre } },
        update: {}, create: { marcaId, nombre: modeloNombre },
      });
      totalModelos++;
    }
  }
  console.log(`   ✅ ${totalModelos} modelos creados`);

  // 0.3 Colores de Vehículos
  console.log("   🎨 Creando colores...");
  const coloresData = [
    { nombre: "BLANCO", codigoHex: "#FFFFFF" }, { nombre: "NEGRO", codigoHex: "#000000" },
    { nombre: "GRIS", codigoHex: "#808080" }, { nombre: "PLATA", codigoHex: "#C0C0C0" },
    { nombre: "AZUL", codigoHex: "#0000FF" }, { nombre: "ROJO", codigoHex: "#FF0000" },
    { nombre: "VERDE", codigoHex: "#008000" }, { nombre: "AMARILLO", codigoHex: "#FFFF00" },
    { nombre: "NARANJA", codigoHex: "#FFA500" }, { nombre: "BEIGE", codigoHex: "#F5F5DC" },
    { nombre: "MARRÓN", codigoHex: "#8B4513" },
  ];
  const colores: Record<string, string> = {};
  for (const c of coloresData) {
    const created = await prisma.colorVehiculo.upsert({
      where: { nombre: c.nombre }, update: {}, create: c,
    });
    colores[c.nombre] = created.id;
  }
  console.log(`   ✅ ${coloresData.length} colores creados`);

  // 0.4 Tipos de Combustible
  console.log("   ⛽ Creando tipos de combustible...");
  const combustiblesData = [
    { nombre: "GASOLINA" }, { nombre: "DIESEL" }, { nombre: "GLP" },
    { nombre: "ELECTRICO" }, { nombre: "HIBRIDO" },
  ];
  const combustibles: Record<string, string> = {};
  for (const c of combustiblesData) {
    const created = await prisma.tipoCombustible.upsert({
      where: { nombre: c.nombre }, update: {}, create: c,
    });
    combustibles[c.nombre] = created.id;
  }
  console.log(`   ✅ ${combustiblesData.length} tipos de combustible creados`);

  // 0.5 Estados de Vehículo
  console.log("   📊 Creando estados de vehículo...");
  const estadosData = [
    { nombre: "Operativo", codigo: "OPERATIVO" },
    { nombre: "En Mantenimiento", codigo: "EN_MANTENIMIENTO" },
    { nombre: "Inoperativo", codigo: "INOPERATIVO" },
    { nombre: "Dado de Baja", codigo: "DADO_DE_BAJA" },
  ];
  const estados: Record<string, string> = {};
  for (const e of estadosData) {
    const created = await prisma.estadoVehiculo.upsert({
      where: { codigo: e.codigo }, update: {}, create: e,
    });
    estados[e.codigo] = created.id;
  }
  console.log(`   ✅ ${estadosData.length} estados creados`);

  // 0.6 Categorías de Vehículo (F1T02)
  console.log("   🏷️  Creando categorías de vehículo...");
  const categoriasData = [
    { nombre: "Vehículos de Pasajeros", codigo: "PASAJEROS" },
    { nombre: "Vehículos de Carga", codigo: "CARGA" },
    { nombre: "Vehículos Especiales", codigo: "ESPECIAL" },
  ];
  const categorias: Record<string, string> = {};
  for (const c of categoriasData) {
    const created = await prisma.categoriaVehiculo.upsert({
      where: { codigo: c.codigo }, update: {}, create: c,
    });
    categorias[c.codigo] = created.id;
  }
  console.log(`   ✅ ${categoriasData.length} categorías creadas`);

  // 0.7 Roles de Usuario
  console.log("   👥 Creando roles de usuario...");
  const rolesData = [
    { nombre: "Jefe de Proceso", codigo: "JEFE_PROCESO", descripcion: "Máxima autoridad del proceso de gestión de flotas" },
    { nombre: "Jefe de Operación", codigo: "JEFE_OPERACION", descripcion: "Responsable del equipo de operación" },
    { nombre: "Encargado de Garaje", codigo: "ENCARGADO_GARAJE", descripcion: "Responsable del garaje y control de vehículos" },
    { nombre: "Inspector", codigo: "INSPECTOR", descripcion: "Valida checklists pre-operacionales" },
    { nombre: "Controlador de Tránsito", codigo: "CONTROLADOR_TRANSITO", descripcion: "Control de tránsito y rutas" },
    { nombre: "Analista", codigo: "ANALISTA", descripcion: "Análisis de datos y reportes" },
    { nombre: "Conductor", codigo: "CONDUCTOR", descripcion: "Conductor de vehículos de la flota" },
    { nombre: "Jefe de Mantenimiento", codigo: "JEFE_MANTENIMIENTO", descripcion: "Responsable del equipo de mantenimiento" },
    { nombre: "Encargado de Taller", codigo: "ENCARGADO_TALLER", descripcion: "Responsable del taller mecánico" },
    { nombre: "Mecánico", codigo: "MECANICO", descripcion: "Técnico mecánico automotriz" },
    { nombre: "Electricista", codigo: "ELECTRICISTA", descripcion: "Técnico electricista automotriz" },
    { nombre: "Reencauchador", codigo: "REENCAUCHADOR", descripcion: "Especialista en reencauche de llantas" },
    { nombre: "Lavador", codigo: "LAVADOR", descripcion: "Personal de lavado de vehículos" },
    { nombre: "Administrativo", codigo: "ADMINISTRATIVO", descripcion: "Apoyo administrativo del proceso" },
  ];
  const roles: Record<string, string> = {};
  for (const r of rolesData) {
    const created = await prisma.rol.upsert({
      where: { codigo: r.codigo }, update: {}, create: r,
    });
    roles[r.codigo] = created.id;
  }
  console.log(`   ✅ ${rolesData.length} roles creados`);

  // 0.8 Sectores Organizacionales
  console.log("   🏢 Creando sectores organizacionales...");
  const sectoresData = [
    "ADMINISTRACIÓN GENERAL", "OPERACIONES", "LOGÍSTICA", "MANTENIMIENTO",
    "TESORERÍA", "CONTABILIDAD", "RECURSOS HUMANOS", "SISTEMAS",
    "PLANEAMIENTO", "COMPRAS", "ALMACÉN", "CONTROL",
    "JURÍDICO", "COMUNICACIONES", "SEGURIDAD", "MEDIO AMBIENTE",
    "OBRAS", "PROYECTOS", "BRIGADAS", "OTROS",
  ];
  const sectores: Record<string, string> = {};
  for (const s of sectoresData) {
    const created = await prisma.sectorOrganizacional.upsert({
      where: { nombre: s }, update: {}, create: { nombre: s },
    });
    sectores[s] = created.id;
  }
  console.log(`   ✅ ${sectoresData.length} sectores creados`);

  // 0.9 Localidades
  console.log("   📍 Creando localidades...");
  const localidadesData = [
    "SEDE CENTRAL", "PLANTA PURIFICADORA NORTE", "PLANTA PURIFICADORA SUR",
    "PLANTA TRATAMIENTO ESTE", "ALMACÉN CENTRAL", "ALMACÉN NORTE",
    "ALMACÉN SUR", "TALLER CENTRAL", "TALLER NORTE", "TALLER SUR",
    "BASE DE OPERACIONES", "CAMPO EXPERIMENTAL", "OTRAS",
  ];
  for (const l of localidadesData) {
    await prisma.localidad.upsert({ where: { nombre: l }, update: {}, create: { nombre: l } });
  }
  console.log(`   ✅ ${localidadesData.length} localidades creadas`);

  // 0.10 Centros de Servicio (Servicentros)
  console.log("   ⛽ Creando centros de servicio...");
  const centrosData = [
    { nombre: "REPSOL" }, { nombre: "PRIMAX" }, { nombre: "PETROPERÚ" },
    { nombre: "SHELL" }, { nombre: "AVIATION" }, { nombre: "GNV" },
    { nombre: "GRAN SAN MARCOS" }, { nombre: "PESQUERÍA" }, { nombre: "VOPOL" },
    { nombre: "SERVIGAS" }, { nombre: "OTROS" },
  ];
  for (const c of centrosData) {
    const existing = await prisma.centroServicio.findFirst({ where: { nombre: c.nombre } });
    if (!existing) await prisma.centroServicio.create({ data: c });
  }
  console.log(`   ✅ ${centrosData.length} centros de servicio creados`);

  // 0.11 Fabricantes de Llantas
  console.log("   🛞 Creando fabricantes de llantas...");
  const fabricantesData = [
    { nombre: "Bridgestone", pais: "Japón" }, { nombre: "Goodyear", pais: "Estados Unidos" },
    { nombre: "Michelin", pais: "Francia" }, { nombre: "Continental", pais: "Alemania" },
    { nombre: "Pirelli", pais: "Italia" }, { nombre: "Firestone", pais: "Estados Unidos" },
    { nombre: "Hankook", pais: "Corea del Sur" }, { nombre: "Yokohama", pais: "Japón" },
    { nombre: "Toyo", pais: "Japón" }, { nombre: "Maxxis", pais: "Taiwán" },
  ];
  for (const f of fabricantesData) {
    await prisma.fabricanteLlanta.upsert({ where: { nombre: f.nombre }, update: {}, create: f });
  }
  console.log(`   ✅ ${fabricantesData.length} fabricantes de llantas creados`);

  // 0.12 Dimensiones de Llantas
  console.log("   📐 Creando dimensiones de llantas...");
  const dimensionesData = [
    { dimension: "7.50R16", descripcion: "LLanta radial 7.50 pulgadas, rin 16" },
    { dimension: "8.25R16", descripcion: "LLanta radial 8.25 pulgadas, rin 16" },
    { dimension: "235/65R16C", descripcion: "LLanta 235mm, perfil 65, rin 16, carga" },
    { dimension: "265/70R16", descripcion: "LLanta 265mm, perfil 70, rin 16" },
    { dimension: "225/75R16", descripcion: "LLanta 225mm, perfil 75, rin 16" },
    { dimension: "215/75R16", descripcion: "LLanta 215mm, perfil 75, rin 16" },
    { dimension: "195/75R16", descripcion: "LLanta 195mm, perfil 75, rin 16" },
    { dimension: "295/75R22.5", descripcion: "LLanta 295mm, perfil 75, rin 22.5" },
  ];
  for (const d of dimensionesData) {
    await prisma.dimensionLlanta.upsert({ where: { dimension: d.dimension }, update: {}, create: d });
  }
  console.log(`   ✅ ${dimensionesData.length} dimensiones de llantas creadas`);

  // 0.13 Categorías de Repuestos
  console.log("   🔧 Creando categorías de repuestos...");
  const categoriasRepData = [
    "FILTROS", "ACEITES", "LUBRICANTES", "FRENOS", "SUSPENSIÓN",
    "DIRECCIÓN", "ELÉCTRICO", "MOTOR", "TRANSMISIÓN", "EMBRAGUE",
    "TURBO", "ENFRIAMIENTO", "EXTERIOR", "INTERIOR", "HERRAMIENTAS", "OTROS",
  ];
  const categoriasRep: Record<string, string> = {};
  for (const c of categoriasRepData) {
    const created = await prisma.categoriaRepuesto.upsert({
      where: { nombre: c }, update: {}, create: { nombre: c },
    });
    categoriasRep[c] = created.id;
  }
  console.log(`   ✅ ${categoriasRepData.length} categorías de repuestos creadas`);

  // 0.14 Tipos de Lavado
  console.log("   🧼 Creando tipos de lavado...");
  const tiposLavadoData = [
    { nombre: "Exterior", codigo: "EXTERIOR" },
    { nombre: "Interior", codigo: "INTERIOR" },
    { nombre: "Completo", codigo: "COMPLETO" },
  ];
  const tiposLavado: Record<string, string> = {};
  for (const t of tiposLavadoData) {
    const created = await prisma.tipoLavado.upsert({
      where: { codigo: t.codigo }, update: {}, create: t,
    });
    tiposLavado[t.codigo] = created.id;
  }
  console.log(`   ✅ ${tiposLavadoData.length} tipos de lavado creados`);

  // 0.15 Tipos de Movimiento de Almacén
  console.log("   📦 Creando tipos de movimiento de almacén...");
  const tiposMovData = [
    { nombre: "Entrada", codigo: "ENTRADA" },
    { nombre: "Salida", codigo: "SALIDA" },
    { nombre: "Devolución", codigo: "DEVOLUCION" },
  ];
  for (const t of tiposMovData) {
    await prisma.tipoMovimientoAlmacen.upsert({
      where: { codigo: t.codigo }, update: {}, create: t,
    });
  }
  console.log(`   ✅ ${tiposMovData.length} tipos de movimiento creados`);

  // ══════════════════════════════════════════
  // BLOQUE 1: CONFIGURACIÓN DEL SISTEMA
  // ══════════════════════════════════════════
  console.log("\n⚙️  ── CONFIGURACIÓN ──");
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
  // ══════════════════════════════════════════
  console.log("\n👥 ── PERSONAL (ORGANIGRAMA F1T02) ──");
  console.log("   👤 Creando integrantes del equipo...");

  const superadmin = await prisma.usuario.upsert({
    where: { email: "anchillo00@gmail.com" }, update: {},
    create: {
      nombre: "Anchillo", apellido: "Admin", email: "anchillo00@gmail.com",
      password: hashedPassword, rol: { connect: { id: roles["JEFE_PROCESO"] } },
      telefono: "+51 999 000 000", especialidad: "Superadmin del Sistema",
    },
  });
  console.log(`   ✅ Superadmin creado: anchillo00@gmail.com (rol: JEFE_PROCESO)`);

  const escriba = await prisma.usuario.upsert({
    where: { email: "escriba.matto@flota.gob" }, update: {},
    create: {
      nombre: "Escriba", apellido: "Matto", email: "escriba.matto@flota.gob",
      password: hashedPassword, rol: { connect: { id: roles["JEFE_PROCESO"] } },
      telefono: "+51 999 000 001", especialidad: "Gestión de Flotas y Logística",
    },
  });

  const leon = await prisma.usuario.upsert({
    where: { email: "leon.mejia@flota.gob" }, update: {},
    create: {
      nombre: "Leon", apellido: "Mejia", email: "leon.mejia@flota.gob",
      password: hashedPassword, rol: { connect: { id: roles["CONDUCTOR"] } },
      telefono: "+51 999 000 002", licenciaConducir: "Q23456789",
      categoriaLicencia: "AIIB", vencimientoLicencia: new Date("2027-06-15"),
    },
  });

  const gomez = await prisma.usuario.upsert({
    where: { email: "gomez.sanchez@flota.gob" }, update: {},
    create: {
      nombre: "Gomez", apellido: "Sanchez", email: "gomez.sanchez@flota.gob",
      password: hashedPassword, rol: { connect: { id: roles["CONDUCTOR"] } },
      telefono: "+51 999 000 006", licenciaConducir: "Q98765432",
      categoriaLicencia: "AIII", vencimientoLicencia: new Date("2028-11-20"),
    },
  });

  const montero = await prisma.usuario.upsert({
    where: { email: "montero.salazar@flota.gob" }, update: {},
    create: {
      nombre: "Montero", apellido: "Salazar", email: "montero.salazar@flota.gob",
      password: hashedPassword, rol: { connect: { id: roles["INSPECTOR"] } },
      telefono: "+51 999 000 003", especialidad: "Control e Inspección Vehicular",
    },
  });

  const polanco = await prisma.usuario.upsert({
    where: { email: "polanco.jimenez@flota.gob" }, update: {},
    create: {
      nombre: "Polanco", apellido: "Jimenez", email: "polanco.jimenez@flota.gob",
      password: hashedPassword, rol: { connect: { id: roles["MECANICO"] } },
      telefono: "+51 999 000 004", especialidad: "Mecánica Automotriz y Diesel",
    },
  });

  const guerra = await prisma.usuario.upsert({
    where: { email: "guerra.salas@flota.gob" }, update: {},
    create: {
      nombre: "Guerra", apellido: "Salas", email: "guerra.salas@flota.gob",
      password: hashedPassword, rol: { connect: { id: roles["MECANICO"] } },
      telefono: "+51 999 000 007", especialidad: "Sistemas Hidráulicos y Frenos",
    },
  });

  const ventura = await prisma.usuario.upsert({
    where: { email: "ventura.chipana@flota.gob" }, update: {},
    create: {
      nombre: "Ventura", apellido: "Chipana", email: "ventura.chipana@flota.gob",
      password: hashedPassword, rol: { connect: { id: roles["ADMINISTRATIVO"] } },
      telefono: "+51 999 000 005",
    },
  });

  const quiroz = await prisma.usuario.upsert({
    where: { email: "quiroz.torres@flota.gob" }, update: {},
    create: {
      nombre: "Quiroz", apellido: "Torres", email: "quiroz.torres@flota.gob",
      password: hashedPassword, rol: { connect: { id: roles["ADMINISTRATIVO"] } },
      telefono: "+51 999 000 008",
    },
  });

  console.log("   ✅ 9 usuarios creados con roles normalizados");

  // Permisos por módulo
  console.log("   🔑 Creando permisos del sistema SAF...");
  const modulosSAF = ["vehiculos", "movimiento_diario", "combustible", "mantenimiento", "llantas", "costos", "reportes", "configuracion"];
  const acciones = ["crear", "leer", "actualizar", "eliminar"];
  const permisos: { id: string; modulo: string; accion: string }[] = [];

  for (const modulo of modulosSAF) {
    for (const accion of acciones) {
      const p = await prisma.permiso.upsert({
        where: { modulo_accion: { modulo, accion } }, update: {},
        create: { modulo, accion, descripcion: `Permiso para ${accion} en módulo ${modulo}` },
      });
      permisos.push(p);
    }
  }
  console.log(`   ✅ ${permisos.length} permisos creados`);

  // Asignar permisos por rol
  console.log("   🛡️  Asignando permisos por rol...");
  for (const p of permisos) {
    await prisma.permisoUsuario.upsert({
      where: { usuarioId_permisoId: { usuarioId: escriba.id, permisoId: p.id } },
      update: {}, create: { usuarioId: escriba.id, permisoId: p.id },
    });
  }

  const permisosConductor = permisos.filter(p =>
    (p.modulo === "vehiculos" && p.accion === "leer") ||
    (p.modulo === "movimiento_diario" && ["crear", "leer"].includes(p.accion)) ||
    (p.modulo === "combustible" && ["crear", "leer"].includes(p.accion))
  );
  for (const cond of [leon, gomez]) {
    for (const p of permisosConductor) {
      await prisma.permisoUsuario.upsert({
        where: { usuarioId_permisoId: { usuarioId: cond.id, permisoId: p.id } },
        update: {}, create: { usuarioId: cond.id, permisoId: p.id },
      });
    }
  }

  const permisosInspector = permisos.filter(p =>
    (p.modulo === "movimiento_diario" && ["leer", "actualizar"].includes(p.accion)) ||
    (p.modulo === "vehiculos" && ["leer", "actualizar"].includes(p.accion)) ||
    (p.modulo === "llantas" && ["crear", "leer", "actualizar"].includes(p.accion))
  );
  for (const p of permisosInspector) {
    await prisma.permisoUsuario.upsert({
      where: { usuarioId_permisoId: { usuarioId: montero.id, permisoId: p.id } },
      update: {}, create: { usuarioId: montero.id, permisoId: p.id },
    });
  }

  const permisosMecanico = permisos.filter(p =>
    (p.modulo === "mantenimiento" && ["crear", "leer", "actualizar"].includes(p.accion)) ||
    (p.modulo === "vehiculos" && p.accion === "leer")
  );
  for (const mec of [polanco, guerra]) {
    for (const p of permisosMecanico) {
      await prisma.permisoUsuario.upsert({
        where: { usuarioId_permisoId: { usuarioId: mec.id, permisoId: p.id } },
        update: {}, create: { usuarioId: mec.id, permisoId: p.id },
      });
    }
  }

  const permisosAdmin = permisos.filter(p =>
    p.accion === "leer" ||
    (p.modulo === "costos" && ["crear", "actualizar"].includes(p.accion)) ||
    (p.modulo === "reportes" && ["crear", "leer"].includes(p.accion))
  );
  for (const adm of [ventura, quiroz]) {
    for (const p of permisosAdmin) {
      await prisma.permisoUsuario.upsert({
        where: { usuarioId_permisoId: { usuarioId: adm.id, permisoId: p.id } },
        update: {}, create: { usuarioId: adm.id, permisoId: p.id },
      });
    }
  }
  console.log("   ✅ Permisos asignados por rol");

  // ══════════════════════════════════════════
  // BLOQUE 3: COSTOS FIJOS PRORRATEABLES (CKV)
  // ══════════════════════════════════════════
  console.log("\n💰 ── COSTOS FIJOS PRORRATEABLES ──");
  const costosFijos = [
    { periodo: "2026-05", tipo: "PERSONAL_ADMINISTRATIVO" as const, descripcion: "Remuneración Ventura Chipana (Apoyo Administrativo)", montoMensual: 2800 },
    { periodo: "2026-05", tipo: "OFICINA" as const, descripcion: "Alquiler oficina + servicios (agua, luz, internet)", montoMensual: 1200 },
    { periodo: "2026-05", tipo: "COMUNICACIONES" as const, descripcion: "Telefonía móvil y radio comunicación flota", montoMensual: 450 },
    { periodo: "2026-05", tipo: "LICENCIAS_SOFTWARE" as const, descripcion: "Licencia sistema SAF + herramientas digitales", montoMensual: 350 },
  ];
  for (const cf of costosFijos) {
    await prisma.costoFijoProrrateable.upsert({
      where: { id: `seed-cf-${cf.tipo.toLowerCase()}` }, update: {},
      create: { id: `seed-cf-${cf.tipo.toLowerCase()}`, ...cf },
    });
  }
  console.log(`   ✅ ${costosFijos.length} costos fijos prorrateables registrados`);

  // ══════════════════════════════════════════
  // BLOQUE 4: INVENTARIO DE FLOTA — VEHÍCULOS (NORMALIZADO)
  // ══════════════════════════════════════════
  console.log("\n🚗 ── INVENTARIO DE FLOTA (NORMALIZADO) ──");

  const vehiculo1 = await prisma.vehiculo.upsert({
    where: { codigoPatrimonial: "01-01-001" }, update: {},
    create: {
      clasePatrimonial: "01",
      categoriaPatrimonialId: categorias["PASAJEROS"],
      secuencial: "001",
      codigoPatrimonial: "01-01-001",
      placa: "ABC-123",
      marcaId: marcas["TOYOTA"],
      modeloId: (await prisma.modeloVehiculo.findUnique({ where: { marcaId_nombre: { marcaId: marcas["TOYOTA"], nombre: "COASTER" } } }))!.id,
      anioFabricacion: 2020,
      colorId: colores["BLANCO"],
      numeroMotor: "TOY-1HZ-987654",
      numeroChasis: "JTFSX22P300123456",
      potenciaHp: 150,
      cilindraje: 4.2,
      numeroCilindros: 6,
      tipoCombustibleId: combustibles["DIESEL"],
      capacidadTanqueGal: 20,
      capacidadPasajeros: 25,
      pesoNetoKg: 3200,
      pesoBrutoKg: 5500,
      bateriaTipo: "Plomo-Ácido", bateriaCeldas: 6, bateriaVoltios: 12, bateriaAmperios: 90, numeroBaterias: 1,
      numeroEjes: 2, configuracionEjes: "4×2", totalLlantas: 6,
      dimensionLlantaEstandar: "7.50R16", presionLlantaDelantera: 80, presionLlantaTrasera: 95,
      estadoPintura: "BUENO", estadoFaros: "BUENO", estadoLunas: "BUENO", estadoEspejos: "BUENO", estadoCarroceria: "BUENO",
      inventarioHerramientas: "Gata hidráulica, llave de ruedas, triángulos reflectantes, extintor 2kg, botiquín, cable de arranque",
      valorAdquisicion: 85000, vidaUtilAnios: 10, kmAnualesReferencia: 60000,
      seguroAnual: 3200, licenciamientoAnual: 450, periodicidadMantenimientoKm: 5000,
      estadoId: estados["OPERATIVO"],
    },
  });

  const vehiculo2 = await prisma.vehiculo.upsert({
    where: { codigoPatrimonial: "01-02-001" }, update: {},
    create: {
      clasePatrimonial: "01",
      categoriaPatrimonialId: categorias["CARGA"],
      secuencial: "001",
      codigoPatrimonial: "01-02-001",
      placa: "DEF-456",
      marcaId: marcas["HYUNDAI"],
      modeloId: (await prisma.modeloVehiculo.findUnique({ where: { marcaId_nombre: { marcaId: marcas["HYUNDAI"], nombre: "HD78" } } }))!.id,
      anioFabricacion: 2019,
      colorId: colores["AZUL"],
      numeroMotor: "HYU-D4DD-234567",
      numeroChasis: "KMFGA17BP1K234567",
      potenciaHp: 130, cilindraje: 3.9, numeroCilindros: 4,
      tipoCombustibleId: combustibles["DIESEL"],
      capacidadTanqueGal: 26, capacidadCargaKg: 3500,
      pesoNetoKg: 2800, pesoBrutoKg: 7500,
      bateriaTipo: "AGM", bateriaCeldas: 6, bateriaVoltios: 12, bateriaAmperios: 100, numeroBaterias: 1,
      numeroEjes: 2, configuracionEjes: "4×2", totalLlantas: 6,
      dimensionLlantaEstandar: "8.25R16", presionLlantaDelantera: 90, presionLlantaTrasera: 105,
      estadoPintura: "REGULAR", estadoFaros: "BUENO", estadoLunas: "BUENO", estadoEspejos: "REGULAR", estadoCarroceria: "REGULAR",
      inventarioHerramientas: "Gata botella 5T, llave de ruedas, triángulos reflectantes, extintor 4kg, botiquín, eslinga",
      valorAdquisicion: 65000, vidaUtilAnios: 8, kmAnualesReferencia: 50000,
      seguroAnual: 2800, licenciamientoAnual: 550, periodicidadMantenimientoKm: 5000,
      estadoId: estados["OPERATIVO"],
    },
  });

  const vehiculo3 = await prisma.vehiculo.upsert({
    where: { codigoPatrimonial: "01-03-001" }, update: {},
    create: {
      clasePatrimonial: "01",
      categoriaPatrimonialId: categorias["ESPECIAL"],
      secuencial: "001",
      codigoPatrimonial: "01-03-001",
      placa: "GHI-789",
      marcaId: marcas["MERCEDES-BENZ"],
      modeloId: (await prisma.modeloVehiculo.findUnique({ where: { marcaId_nombre: { marcaId: marcas["MERCEDES-BENZ"], nombre: "SPRINTER" } } }))!.id,
      anioFabricacion: 2021,
      colorId: colores["BLANCO"],
      numeroMotor: "MB-OM651-345678",
      numeroChasis: "WDB9066331S345678",
      potenciaHp: 150, cilindraje: 2.2, numeroCilindros: 4,
      tipoCombustibleId: combustibles["DIESEL"],
      capacidadTanqueGal: 18, capacidadPasajeros: 3,
      pesoNetoKg: 2100, pesoBrutoKg: 3500,
      bateriaTipo: "AGM", bateriaCeldas: 6, bateriaVoltios: 12, bateriaAmperios: 90, numeroBaterias: 2,
      numeroEjes: 2, configuracionEjes: "4×2", totalLlantas: 5,
      dimensionLlantaEstandar: "235/65R16C", presionLlantaDelantera: 65, presionLlantaTrasera: 75,
      estadoPintura: "BUENO", estadoFaros: "BUENO", estadoLunas: "BUENO", estadoEspejos: "BUENO", estadoCarroceria: "BUENO",
      inventarioHerramientas: "Gata pantógrafo, llave de ruedas, triángulos, extintor 2kg, botiquín médico avanzado, camilla, tanque de oxígeno",
      valorAdquisicion: 120000, vidaUtilAnios: 12, kmAnualesReferencia: 40000,
      seguroAnual: 4500, licenciamientoAnual: 650, periodicidadMantenimientoKm: 5000,
      estadoId: estados["OPERATIVO"],
    },
  });
  console.log("   ✅ 3 vehículos registrados con FKs normalizadas");

  // ══════════════════════════════════════════
  // BLOQUE 5: CONTROL DE LLANTAS (NORMALIZADO)
  // ══════════════════════════════════════════
  console.log("\n🛞  ── CONTROL DE LLANTAS ──");
  const fabricanteBridgestone = await prisma.fabricanteLlanta.findUnique({ where: { nombre: "Bridgestone" } });
  const fabricanteGoodyear = await prisma.fabricanteLlanta.findUnique({ where: { nombre: "Goodyear" } });
  const fabricanteMichelin = await prisma.fabricanteLlanta.findUnique({ where: { nombre: "Michelin" } });
  const dim750R16 = await prisma.dimensionLlanta.findUnique({ where: { dimension: "7.50R16" } });
  const dim825R16 = await prisma.dimensionLlanta.findUnique({ where: { dimension: "8.25R16" } });

  const llantas = [
    { codigoEps: "EPS-2024-001", vehiculoId: vehiculo1.id, fabricanteId: fabricanteBridgestone!.id, dimensionId: dim750R16!.id, modeloLlanta: "R168", posicionVehiculo: 1, descripcionPosicion: "Delantera Izquierda", fechaInstalacion: new Date("2024-01-15"), kilometrajeInstalacion: 45000, costoAdquisicion: 280 },
    { codigoEps: "EPS-2024-002", vehiculoId: vehiculo1.id, fabricanteId: fabricanteBridgestone!.id, dimensionId: dim750R16!.id, modeloLlanta: "R168", posicionVehiculo: 2, descripcionPosicion: "Delantera Derecha", fechaInstalacion: new Date("2024-01-15"), kilometrajeInstalacion: 45000, costoAdquisicion: 280 },
    { codigoEps: "EPS-2024-003", vehiculoId: vehiculo1.id, fabricanteId: fabricanteGoodyear!.id, dimensionId: dim750R16!.id, modeloLlanta: "G658", posicionVehiculo: 3, descripcionPosicion: "Trasera Izq. Exterior", fechaInstalacion: new Date("2023-06-01"), kilometrajeInstalacion: 28000, costoAdquisicion: 310 },
    { codigoEps: "EPS-2024-004", vehiculoId: vehiculo1.id, fabricanteId: fabricanteGoodyear!.id, dimensionId: dim750R16!.id, modeloLlanta: "G658", posicionVehiculo: 4, descripcionPosicion: "Trasera Izq. Interior", fechaInstalacion: new Date("2023-06-01"), kilometrajeInstalacion: 28000, costoAdquisicion: 310 },
    { codigoEps: "EPS-2024-005", vehiculoId: vehiculo1.id, fabricanteId: fabricanteGoodyear!.id, dimensionId: dim750R16!.id, modeloLlanta: "G658", posicionVehiculo: 5, descripcionPosicion: "Trasera Der. Interior", fechaInstalacion: new Date("2023-06-01"), kilometrajeInstalacion: 28000, costoAdquisicion: 310 },
    { codigoEps: "EPS-2024-006", vehiculoId: vehiculo1.id, fabricanteId: fabricanteGoodyear!.id, dimensionId: dim750R16!.id, modeloLlanta: "G658", posicionVehiculo: 6, descripcionPosicion: "Trasera Der. Exterior", fechaInstalacion: new Date("2023-06-01"), kilometrajeInstalacion: 28000, costoAdquisicion: 310 },
    { codigoEps: "EPS-2024-007", vehiculoId: vehiculo1.id, fabricanteId: fabricanteBridgestone!.id, dimensionId: dim750R16!.id, modeloLlanta: "R168", posicionVehiculo: 7, descripcionPosicion: "Repuesto", fechaInstalacion: new Date("2024-01-15"), kilometrajeInstalacion: 45000, costoAdquisicion: 280 },
    { codigoEps: "EPS-2024-008", vehiculoId: vehiculo2.id, fabricanteId: fabricanteMichelin!.id, dimensionId: dim825R16!.id, modeloLlanta: "XZY3", posicionVehiculo: 1, descripcionPosicion: "Delantera Izquierda", fechaInstalacion: new Date("2024-03-10"), kilometrajeInstalacion: 62000, costoAdquisicion: 420 },
    { codigoEps: "EPS-2024-009", vehiculoId: vehiculo2.id, fabricanteId: fabricanteMichelin!.id, dimensionId: dim825R16!.id, modeloLlanta: "XZY3", posicionVehiculo: 2, descripcionPosicion: "Delantera Derecha", fechaInstalacion: new Date("2024-03-10"), kilometrajeInstalacion: 62000, costoAdquisicion: 420 },
  ];
  for (const ll of llantas) {
    await prisma.controlLlanta.upsert({
      where: { codigoEps: ll.codigoEps }, update: {},
      create: { ...ll, estado: "EN_USO", kilometrajeAcumulado: 0, vecesReencauchada: 0 },
    });
  }
  console.log(`   ✅ ${llantas.length} llantas registradas con FKs normalizadas`);

  // ══════════════════════════════════════════
  // BLOQUE 6: MOVIMIENTOS DIARIOS (MA 122 01 01)
  // ══════════════════════════════════════════
  console.log("\n📋 ── MOVIMIENTOS DIARIOS (MA 122 01 01) ──");

  const mov1 = await prisma.movimientoDiario.upsert({
    where: { id: "seed-mov-001" }, update: {},
    create: {
      id: "seed-mov-001", vehiculoId: vehiculo1.id, conductorId: leon.id, inspectorId: montero.id,
      fecha: new Date("2026-05-20"), sectorSolicitanteId: sectores["OPERACIONES"],
      destino: "Hospital Regional - Av. Los Héroes 1234", proposito: "Traslado de personal médico",
      kilometrajeSalida: 48500, kilometrajeLlegada: 48712, kilometrajeRecorrido: 212,
      horaSalida: "07:30", horaLlegada: "16:45", horasUtilizacion: 9.25,
      estado: "COMPLETADO", observaciones: "Servicio completado sin incidentes",
    },
  });

  await prisma.checklistVerificacion.upsert({
    where: { movimientoId: "seed-mov-001" }, update: {},
    create: {
      movimientoId: "seed-mov-001", documentos: "OK", aceiteMotor: "OK", agua: "OK",
      bateria: "OK", frenos: "OK", embrague: "OK", fajas: "OK", faros: "OK",
      lunas: "OK", plumillas: "OK", llantas: "OK", espejos: "OK",
      herramientas: "OK", extintorBotiquin: "OK", manchasFugas: "OK",
      aptoParaOperar: true, observacionesGenerales: "Vehículo en óptimas condiciones pre-operacionales",
      firmaConductor: "Leon Mejia", firmaInspector: "Montero Salazar",
    },
  });

  const mov2 = await prisma.movimientoDiario.upsert({
    where: { id: "seed-mov-002" }, update: {},
    create: {
      id: "seed-mov-002", vehiculoId: vehiculo2.id, conductorId: leon.id, inspectorId: montero.id,
      fecha: new Date("2026-05-21"), sectorSolicitanteId: sectores["LOGÍSTICA"],
      destino: "Sede Norte - Km 15 Carretera Norte", proposito: "Distribución de materiales logísticos",
      kilometrajeSalida: 67300, kilometrajeLlegada: 67580, kilometrajeRecorrido: 280,
      horaSalida: "08:00", horaLlegada: "17:30", horasUtilizacion: 9.5,
      estado: "COMPLETADO", observaciones: "Desgaste leve en llanta trasera derecha exterior",
    },
  });

  await prisma.checklistVerificacion.upsert({
    where: { movimientoId: "seed-mov-002" }, update: {},
    create: {
      movimientoId: "seed-mov-002", documentos: "OK", aceiteMotor: "OK", agua: "OK",
      bateria: "OK", frenos: "OK", embrague: "OK", fajas: "OK", faros: "OK",
      lunas: "OK", plumillas: "OK", llantas: "OBSERVADO", observLlantas: "Desgaste en llanta posición 6, presión baja 5 PSI",
      espejos: "OBSERVADO", observEspejos: "Espejo retrovisor derecho con vibración leve",
      herramientas: "OK", extintorBotiquin: "OK", manchasFugas: "OK",
      aptoParaOperar: true, observacionesGenerales: "Apto para operar, programar revisión de llantas",
      firmaConductor: "Leon Mejia", firmaInspector: "Montero Salazar",
    },
  });
  console.log("   ✅ 2 movimientos diarios con checklist creados");

  // ══════════════════════════════════════════
  // BLOQUE 7: ÓRDENES DE COMBUSTIBLE (MA 122 01 02)
  // ══════════════════════════════════════════
  console.log("\n⛽ ── ÓRDENES DE COMBUSTIBLE (MA 122 01 02) ──");

  const centroServicio1 = await prisma.centroServicio.findFirst({ where: { nombre: "GRAN SAN MARCOS" } });
  const centroServicio2 = await prisma.centroServicio.findFirst({ where: { nombre: "PRIMAX" } });

  await prisma.ordenCombustible.upsert({
    where: { numeroOrden: "OC-2026-001" }, update: {},
    create: {
      numeroOrden: "OC-2026-001", fecha: new Date("2026-05-20"),
      vehiculoId: vehiculo1.id, conductorId: leon.id,
      sectorSolicitanteId: sectores["OPERACIONES"],
      tipoCombustible: "DIESEL", cantidadGalones: 12, costoGalon: 4.85, costoCombustible: 58.20,
      incluyeAceiteMotor: true, cantidadAceiteMotorLt: 4, marcaAceiteMotor: "Mobil Delvac",
      viscosidadAceiteMotor: "15W-40", costoAceiteMotor: 48.00,
      incluyeAceiteCaja: false, costoTotal: 106.20, kilometrajeActual: 48500,
      centroServicioId: centroServicio1?.id,
      numeroTicketServiccentro: "T-00234", responsableServiccentro: "Juan Carlos Ramos",
      selloServiccentro: true,
    },
  });

  await prisma.ordenCombustible.upsert({
    where: { numeroOrden: "OC-2026-002" }, update: {},
    create: {
      numeroOrden: "OC-2026-002", fecha: new Date("2026-05-21"),
      vehiculoId: vehiculo2.id, conductorId: leon.id,
      sectorSolicitanteId: sectores["LOGÍSTICA"],
      tipoCombustible: "DIESEL", cantidadGalones: 18, costoGalon: 4.85, costoCombustible: 87.30,
      incluyeAceiteMotor: false, incluyeAceiteCaja: false, costoTotal: 87.30,
      kilometrajeActual: 67300, centroServicioId: centroServicio2?.id,
      numeroTicketServiccentro: "T-00891", responsableServiccentro: "María López Soto",
      selloServiccentro: true,
    },
  });
  console.log("   ✅ 2 órdenes de combustible creadas");

  // ══════════════════════════════════════════
  // BLOQUE 8: ÓRDENES DE MANTENIMIENTO (MA 122 02 01)
  // ══════════════════════════════════════════
  console.log("\n🔧 ── MANTENIMIENTO (MA 122 02 01) ──");

  const om1 = await prisma.ordenMantenimiento.upsert({
    where: { numeroOrden: "OM-2026-001" }, update: {},
    create: {
      numeroOrden: "OM-2026-001", fechaEmision: new Date("2026-05-10"),
      vehiculoId: vehiculo1.id, tecnicoId: polanco.id,
      sectorSolicitanteId: sectores["OPERACIONES"],
      tipoMantenimiento: "PREVENTIVO", tipoTaller: "PROPIO",
      fechaEntradaTaller: new Date("2026-05-12"), horaEntradaTaller: "08:00",
      fechaSalidaTaller: new Date("2026-05-12"), horaSalidaTaller: "13:30",
      kilometrajeEntrada: 45000, kilometrajeSalida: 45000,
      descripcionServicio: "Mantenimiento preventivo de 5,000 km: cambio de aceite y filtros, revisión general de frenos y sistema eléctrico",
      fallaReportada: "Mantenimiento programado por kilometraje",
      diagnosticoTecnico: "Vehículo en buen estado, se realiza mantenimiento según cronograma del fabricante",
      costoManoObraPropia: 120.00, costoPiezasRepuestos: 215.50, costoOtros: 0, costoTotal: 335.50,
      estado: "COMPLETADO",
    },
  });

  await prisma.detalleRepuesto.createMany({
    skipDuplicates: true,
    data: [
      { id: "seed-rep-001", ordenMantenimientoId: om1.id, descripcion: "Aceite de motor Mobil Delvac 15W-40", numeroParteCatalogo: "MOB-15W40-5L", unidadMedida: "litro", cantidad: 4, precioUnitario: 12.00, subtotal: 48.00, esAlmacenPropio: true, proveedor: "Almacén Mantenimiento" },
      { id: "seed-rep-002", ordenMantenimientoId: om1.id, descripcion: "Filtro de aceite", numeroParteCatalogo: "TOY-90915-YZZD4", unidadMedida: "unidad", cantidad: 1, precioUnitario: 18.50, subtotal: 18.50, esAlmacenPropio: true, proveedor: "Almacén Mantenimiento" },
      { id: "seed-rep-003", ordenMantenimientoId: om1.id, descripcion: "Filtro de combustible", numeroParteCatalogo: "TOY-23390-64450", unidadMedida: "unidad", cantidad: 1, precioUnitario: 22.00, subtotal: 22.00, esAlmacenPropio: true, proveedor: "Almacén Mantenimiento" },
      { id: "seed-rep-004", ordenMantenimientoId: om1.id, descripcion: "Filtro de aire", numeroParteCatalogo: "TOY-17801-38020", unidadMedida: "unidad", cantidad: 1, precioUnitario: 35.00, subtotal: 35.00, esAlmacenPropio: true, proveedor: "Almacén Mantenimiento" },
      { id: "seed-rep-005", ordenMantenimientoId: om1.id, descripcion: "Líquido de frenos DOT 4", numeroParteCatalogo: "LF-DOT4-500ML", unidadMedida: "frasco", cantidad: 2, precioUnitario: 15.00, subtotal: 30.00, esAlmacenPropio: true, proveedor: "Almacén Mantenimiento" },
      { id: "seed-rep-006", ordenMantenimientoId: om1.id, descripcion: "Grasa multipropósito", numeroParteCatalogo: "GRS-MULTI-500G", unidadMedida: "pote", cantidad: 1, precioUnitario: 12.00, subtotal: 12.00, esAlmacenPropio: true, proveedor: "Almacén Mantenimiento" },
      { id: "seed-rep-007", ordenMantenimientoId: om1.id, descripcion: "Faja de alternador", numeroParteCatalogo: "FAJ-ALT-1HZ", unidadMedida: "unidad", cantidad: 1, precioUnitario: 50.00, subtotal: 50.00, esAlmacenPropio: false, proveedor: "Ferretería Automotriz Central" },
    ],
  });

  await prisma.detalleManoObra.createMany({
    skipDuplicates: true,
    data: [
      { id: "seed-mo-001", ordenMantenimientoId: om1.id, descripcionTarea: "Cambio de aceite y filtros", horasTrabajadas: 1.5, costoHora: 30, subtotal: 45.00, nombreTecnico: "Polanco Jimenez" },
      { id: "seed-mo-002", ordenMantenimientoId: om1.id, descripcionTarea: "Revisión y ajuste del sistema de frenos", horasTrabajadas: 1.5, costoHora: 30, subtotal: 45.00, nombreTecnico: "Polanco Jimenez" },
      { id: "seed-mo-003", ordenMantenimientoId: om1.id, descripcionTarea: "Revisión sistema eléctrico y batería", horasTrabajadas: 1.0, costoHora: 30, subtotal: 30.00, nombreTecnico: "Polanco Jimenez" },
    ],
  });

  const om2 = await prisma.ordenMantenimiento.upsert({
    where: { numeroOrden: "OM-2026-002" }, update: {},
    create: {
      numeroOrden: "OM-2026-002", fechaEmision: new Date("2026-05-18"),
      vehiculoId: vehiculo2.id, tecnicoId: polanco.id,
      sectorSolicitanteId: sectores["LOGÍSTICA"],
      tipoMantenimiento: "CORRECTIVO", tipoTaller: "TERCEROS",
      nombreTallerExterno: "Taller Diesel Hnos. Ramírez",
      numeroAutorizacionExterna: "ASE-2026-045",
      fechaEntradaTaller: new Date("2026-05-19"), horaEntradaTaller: "09:00",
      fechaSalidaTaller: new Date("2026-05-20"), horaSalidaTaller: "17:00",
      kilometrajeEntrada: 67000, kilometrajeSalida: 67000,
      descripcionServicio: "Reparación correctiva: diagnóstico y cambio de inyectores del motor diesel",
      fallaReportada: "Motor con pérdida de potencia y humo negro excesivo reportado por conductor",
      diagnosticoTecnico: "2 inyectores defectuosos (posición 2 y 4). Se requiere reemplazo y calibración.",
      costoManoObraTerceros: 350.00, costoPiezasRepuestos: 480.00, costoOtros: 25.00, costoTotal: 855.00,
      estado: "COMPLETADO", observaciones: "Autorización de Servicio Externo ASE-2026-045 adjunta a la orden",
    },
  });

  await prisma.detalleRepuesto.createMany({
    skipDuplicates: true,
    data: [
      { id: "seed-rep-008", ordenMantenimientoId: om2.id, descripcion: "Inyector Diesel Bosch (posición 2)", numeroParteCatalogo: "BSH-0445110012", unidadMedida: "unidad", cantidad: 1, precioUnitario: 240.00, subtotal: 240.00, esAlmacenPropio: false, proveedor: "Taller Diesel Hnos. Ramírez" },
      { id: "seed-rep-009", ordenMantenimientoId: om2.id, descripcion: "Inyector Diesel Bosch (posición 4)", numeroParteCatalogo: "BSH-0445110012", unidadMedida: "unidad", cantidad: 1, precioUnitario: 240.00, subtotal: 240.00, esAlmacenPropio: false, proveedor: "Taller Diesel Hnos. Ramírez" },
    ],
  });

  console.log("   ✅ 2 órdenes de mantenimiento creadas");

  // ══════════════════════════════════════════
  // RESUMEN FINAL
  // ══════════════════════════════════════════
  console.log("\n" + "═".repeat(60));
  console.log("✅ SEED SAF — SISTEMA DE ADMINISTRACIÓN DE FLOTAS (NORMALIZADO)");
  console.log("═".repeat(60));
  console.log(`
📊 Resumen de datos creados:

   📋 TABLAS DE NORMALIZACIÓN:
      • 30 marcas de vehículos
      • ${totalModelos} modelos de vehículos
      • 11 colores
      • 5 tipos de combustible
      • 4 estados de vehículo
      • 3 categorías de vehículo (F1T02)
      • 14 roles de usuario
      • 20 sectores organizacionales
      • 13 localidades
      • 11 centros de servicio
      • 10 fabricantes de llantas
      • 8 dimensiones de llantas
      • 16 categorías de repuestos
      • 3 tipos de lavado
      • 3 tipos de movimiento de almacén

   ⚙️  CONFIGURACIÓN:
      • 8 parámetros del sistema SAF

   👥 PERSONAL:
      • 9 usuarios con roles normalizados (FK)
      • 32 permisos (8 módulos × 4 acciones)
      • Permisos asignados por rol

   💰 COSTOS FIJOS:
      • 4 costos fijos prorrateables

   🚗 INVENTARIO DE FLOTA:
      • 3 vehículos con FKs normalizadas

   🛞  CONTROL DE LLANTAS:
      • 9 llantas con fabricante y dimensión normalizados

   📋 MOVIMIENTOS DIARIOS:
      • 2 movimientos con checklist de 15 puntos

   ⛽ COMBUSTIBLE:
      • 2 órdenes con centro de servicio normalizado

   🔧 MANTENIMIENTO:
      • 2 órdenes con sector normalizado
      • 9 repuestos y 3 registros de mano de obra
  `);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error("❌ Error durante el seed SAF:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
