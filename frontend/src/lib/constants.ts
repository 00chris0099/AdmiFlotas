// ============================================
// CONSTANTES COMPARTIDAS - SAF ERP
// Basado en guía F1T02 y estándares del Perú
// ============================================

// --------------------------------------------
// MARCAS DE VEHÍCULOS (Estándar Perú)
// --------------------------------------------
export const MARCAS_VEHICULOS = [
  "TOYOTA",
  "HYUNDAI",
  "KIA",
  "NISSAN",
  "CHEVROLET",
  "FORD",
  "MAZDA",
  "MITSUBISHI",
  "SUZUKI",
  "ISUZU",
  "MERCEDES-BENZ",
  "VOLKSWAGEN",
  "FIAT",
  "HONDA",
  "DAIHATSU",
  "CHERY",
  "MOTORS",
  "DFM",
  "CHANGAN",
  "GWM",
  "HAVAL",
  "JAC",
  "RENAULT",
  "PEUGEOT",
  "CITROËN",
  "BMW",
  "SUBARU",
  "LEXUS",
  "INFINITI",
  "AUDI",
] as const;

export type MarcaVehiculo = typeof MARCAS_VEHICULOS[number];

// --------------------------------------------
// COLORES ESTÁNDAR PARA FLOTAS
// --------------------------------------------
export const COLORES_VEHICULOS = [
  "BLANCO",
  "NEGRO",
  "GRIS",
  "PLATA",
  "AZUL",
  "ROJO",
  "VERDE",
  "AMARILLO",
  "NARANJA",
  "BEIGE",
  "MARRÓN",
] as const;

export type ColorVehiculo = typeof COLORES_VEHICULOS[number];

// --------------------------------------------
// TIPOS DE COMBUSTIBLE - ESTÁNDAR PERÚ
// --------------------------------------------
export const TIPOS_COMBUSTIBLE = [
  { value: "DIESEL", label: "Diésel" },
  { value: "GASOLINA", label: "Gasolina" },
  { value: "GLP", label: "GLP (Gas Licuado de Petróleo)" },
  { value: "ELECTRICO", label: "Eléctrico" },
  { value: "HIBRIDO", label: "Híbrido" },
] as const;

// --------------------------------------------
// SUBTIPOS DE COMBUSTIBLE POR TIPO
// --------------------------------------------
export const SUBTIPOS_COMBUSTIBLE: Record<string, { value: string; label: string }[]> = {
  DIESEL: [
    { value: "DIESEL_UBA", label: "Diésel UBA (Ultra Bajo Azufre)" },
    { value: "DIESEL_2000", label: "Diésel 2000" },
    { value: "DIESEL_5000", label: "Diésel 5000" },
    { value: "DIESEL_MAIRO", label: "Diésel Máximo Rendimiento" },
  ],
  GASOLINA: [
    { value: "GASOLINA_84", label: "Gasolina 84 (Regular)" },
    { value: "GASOLINA_90", label: "Gasolina 90" },
    { value: "GASOLINA_95", label: "Gasolina 95 (Premium)" },
    { value: "GASOLINA_98", label: "Gasolina 98 (Super Premium)" },
  ],
  GLP: [],
  ELECTRICO: [],
  HIBRIDO: [],
};

// --------------------------------------------
// SECTORES ORGANIZACIONALES (EPS)
// --------------------------------------------
export const SECTORES_ORGANIZACIONALES = [
  "ADMINISTRACIÓN GENERAL",
  "OPERACIONES",
  "LOGÍSTICA",
  "MANTENIMIENTO",
  "TESORERÍA",
  "CONTABILIDAD",
  "RECURSOS HUMANOS",
  "SISTEMAS",
  "PLANEAMIENTO",
  "COMPRAS",
  "ALMACÉN",
  "CONTROL",
  "JURÍDICO",
  "COMUNICACIONES",
  "SEGURIDAD",
  "MEDIO AMBIENTE",
  "OBRAS",
  "PROYECTOS",
  "BRIGADAS",
  "OTROS",
] as const;

export type SectorOrganizacional = typeof SECTORES_ORGANIZACIONALES[number];

// --------------------------------------------
// LOCALIDADES / SEDES
// --------------------------------------------
export const LOCALIDADES = [
  "SEDE CENTRAL",
  "PLANTA PURIFICADORA NORTE",
  "PLANTA PURIFICADORA SUR",
  "PLANTA TRATAMIENTO ESTE",
  "ALMACÉN CENTRAL",
  "ALMACÉN NORTE",
  "ALMACÉN SUR",
  "TALLER CENTRAL",
  "TALLER NORTE",
  "TALLER SUR",
  "BASE DE OPERACIONES",
  "CAMPOexperimental",
  "OTRAS",
] as const;

export type Localidad = typeof LOCALIDADES[number];

// --------------------------------------------
// SERVICENTROS ACREDITADOS
// --------------------------------------------
export const SERVICENTROS = [
  "REPSOL",
  "PRIMAX",
  "PETROPERÚ",
  "SHELL",
  "AVIATION",
  "GNV",
  "GRAN SAN MARCOS",
  "PESQUERÍA",
  "VOPOL",
  "SERVIGAS",
  "OTROS",
] as const;

export type Servicentro = typeof SERVICENTROS[number];

// --------------------------------------------
// CATEGORÍAS DE VEHÍCULOS (F1T02)
// --------------------------------------------
export const CATEGORIAS_VEHICULO = [
  { value: "PASAJEROS", label: "Vehículos de Pasajeros" },
  { value: "CARGA", label: "Vehículos de Carga" },
  { value: "ESPECIAL", label: "Vehículos Especiales" },
] as const;

// --------------------------------------------
// TIPOS DE COMBUSTIBLE PARA ÓRDENES (F1T02)
// --------------------------------------------
export const TIPOS_COMBUSTIBLE_ORDEN = [
  { value: "GASOLINA", label: "Gasolina" },
  { value: "DIESEL", label: "Diésel" },
  { value: "GLP", label: "GLP" },
  { value: "ACEITE_MOTOR", label: "Aceite de Motor" },
  { value: "ACEITE_CAJA", label: "Aceite de Caja" },
  { value: "MIXTO", label: "Mixto" },
] as const;

// --------------------------------------------
// CATEGORÍAS DE LICENCIA DE CONDUCIR
// --------------------------------------------
export const CATEGORIAS_LICENCIA = [
  { value: "AI", label: "AI - Vehículos de hasta 8 asientos" },
  { value: "AIIA", label: "AIIA - Vehículos de 9-15 asientos" },
  { value: "AIIB", label: "AIIB - Vehículos de 16+ asientos" },
  { value: "AIIIA", label: "AIIIA - Vehículos de carga hasta 3,500 kg" },
  { value: "AIIIB", label: "AIIIB - Vehículos de carga hasta 12,000 kg" },
  { value: "AIIIC", label: "AIIIC - Vehículos de carga más de 12,000 kg" },
] as const;

// --------------------------------------------
// ROLES DE USUARIO
// --------------------------------------------
export const ROLES_USUARIO = [
  { value: "JEFE_PROCESO", label: "Jefe de Proceso" },
  { value: "ADMINISTRATIVO", label: "Administrativo" },
  { value: "ANALISTA", label: "Analista" },
  { value: "INSPECTOR", label: "Inspector" },
  { value: "MECANICO", label: "Mecánico" },
  { value: "ELECTRICISTA", label: "Electricista" },
  { value: "REENCAUCHADOR", label: "Reencauchador" },
  { value: "LAVADOR", label: "Lavador" },
  { value: "CONDUCTOR", label: "Conductor" },
  { value: "ENCARGADO_GARAJE", label: "Encargado de Garaje" },
  { value: "ENCARGADO_TALLER", label: "Encargado de Taller" },
  { value: "JEFE_MANTENIMIENTO", label: "Jefe de Mantenimiento" },
  { value: "JEFE_OPERACION", label: "Jefe de Operación" },
  { value: "CONTROLADOR_TRANSITO", label: "Controlador de Tránsito" },
] as const;

// --------------------------------------------
// TIPOS DE MANTENIMIENTO
// --------------------------------------------
export const TIPOS_MANTENIMIENTO = [
  { value: "PREVENTIVO", label: "Preventivo" },
  { value: "CORRECTIVO", label: "Correctivo" },
] as const;

// --------------------------------------------
// TIPOS DE TALLER
// --------------------------------------------
export const TIPOS_TALLER = [
  { value: "PROPIO", label: "Taller Propio" },
  { value: "TERCEROS", label: "Terceros" },
] as const;

// --------------------------------------------
// ESTADOS DE VEHÍCULO
// --------------------------------------------
export const ESTADOS_VEHICULO = [
  { value: "OPERATIVO", label: "Operativo" },
  { value: "EN_MANTENIMIENTO", label: "En Mantenimiento" },
  { value: "INOPERATIVO", label: "Inoperativo" },
  { value: "DADO_DE_BAJA", label: "Dado de Baja" },
] as const;

// --------------------------------------------
// ESTADOS DE MOVIMIENTO
// --------------------------------------------
export const ESTADOS_MOVIMIENTO = [
  { value: "PROGRAMADO", label: "Programado" },
  { value: "EN_RUTA", label: "En Ruta" },
  { value: "COMPLETADO", label: "Completado" },
  { value: "CANCELADO", label: "Cancelado" },
] as const;

// --------------------------------------------
// ESTADOS DE CHECKLIST (F1T02)
// --------------------------------------------
export const ESTADOS_CHECKLIST = [
  { value: "OK", label: "OK", color: "emerald" },
  { value: "OBSERVADO", label: "Observado", color: "amber" },
  { value: "FALLADO", label: "Fallado", color: "rose" },
] as const;

// --------------------------------------------
// TIPOS DE COSTO FIJO
// --------------------------------------------
export const TIPOS_COSTO_FIJO = [
  { value: "PERSONAL_ADMINISTRATIVO", label: "Personal Administrativo" },
  { value: "OFICINA", label: "Oficina" },
  { value: "COMUNICACIONES", label: "Comunicaciones" },
  { value: "SEGUROS_GENERALES", label: "Seguros Generales" },
  { value: "LICENCIAS_SOFTWARE", label: "Licencias de Software" },
  { value: "OTROS", label: "Otros" },
] as const;

// --------------------------------------------
// CATEGORÍAS DE ALMACÉN
// --------------------------------------------
export const CATEGORIAS_ALMACEN = [
  "FILTROS",
  "ACEITES",
  "LUBRICANTES",
  "FRENOS",
  "SUSPENSIÓN",
  "DIRECCIÓN",
  "ELÉCTRICO",
  "MOTOR",
  "TRANSMISIÓN",
  "EMBRAGUE",
  "TURBO",
  "ENFRIAMIENTO",
  "EXTERIOR",
  "INTERIOR",
  "HERRAMIENTAS",
  "OTROS",
] as const;

// --------------------------------------------
// UNIDADES DE MEDIDA
// --------------------------------------------
export const UNIDADES_MEDIDA = [
  { value: "UNIDAD", label: "Unidad" },
  { value: "LITRO", label: "Litro" },
  { value: "KG", label: "Kilogramo" },
  { value: "METRO", label: "Metro" },
  { value: "PAR", label: "Par" },
  { value: "JUEGO", label: "Juego" },
  { value: "Frasco", label: "Frasco" },
] as const;

// --------------------------------------------
// TIPOS DE LAVADO
// --------------------------------------------
export const TIPOS_LAVADO = [
  { value: "EXTERIOR", label: "Exterior" },
  { value: "INTERIOR", label: "Interior" },
  { value: "COMPLETO", label: "Completo" },
] as const;

// --------------------------------------------
// POSICIONES DE LLANTAS (F1T02)
// --------------------------------------------
export const POSICIONES_LLANTAS = [
  { value: "DELANTERA_IZQ", label: "Delantera Izquierda" },
  { value: "DELANTERA_DER", label: "Delantera Derecha" },
  { value: "TRASERA_IZQ_EXT", label: "Trasera Izquierda Externa" },
  { value: "TRASERA_IZQ_INT", label: "Trasera Izquierda Interna" },
  { value: "TRASERA_DER_EXT", label: "Trasera Derecha Externa" },
  { value: "TRASERA_DER_INT", label: "Trasera Derecha Interna" },
  { value: "REPUESTO", label: "Repuesto" },
] as const;

// --------------------------------------------
// FUNCIONES AUXILIARES
// --------------------------------------------

/**
 * Obtiene los subtipos de combustible para un tipo dado
 */
export function getSubtiposCombustible(tipo: string): { value: string; label: string }[] {
  return SUBTIPOS_COMBUSTIBLE[tipo] || [];
}

/**
 * Verifica si un tipo de combustible tiene subtipos
 */
export function tieneSubtipos(tipo: string): boolean {
  return (SUBTIPOS_COMBUSTIBLE[tipo]?.length || 0) > 0;
}

/**
 * Formatea el display de un tipo de combustible
 */
export function formatTipoCombustible(tipo: string): string {
  const found = TIPOS_COMBUSTIBLE.find(t => t.value === tipo);
  return found?.label || tipo;
}

/**
 * Formatea el display de un subtipo de combustible
 */
export function formatSubtipoCombustible(subtipo: string): string {
  const allSubtipos = Object.values(SUBTIPOS_COMBUSTIBLE).flat();
  const found = allSubtipos.find(s => s.value === subtipo);
  return found?.label || subtipo;
}
