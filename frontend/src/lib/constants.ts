// ============================================
// CONSTANTES COMPARTIDAS - SAF ERP
// Basado en guía F1T02 y estándares del Perú
// ============================================

// --------------------------------------------
// MARCAS DE VEHÍCULOS (Mercado Peruano Completo)
// --------------------------------------------
export const MARCAS_VEHICULOS = [
  // Japonesas
  "TOYOTA", "NISSAN", "MAZDA", "MITSUBISHI", "SUZUKI", "ISUZU", "HONDA", "DAIHATSU", "SUBARU", "LEXUS", "INFINITI",
  // Coreanas
  "HYUNDAI", "KIA", "GENESIS", "SSANGYONG",
  // Europeas
  "MERCEDES-BENZ", "VOLKSWAGEN", "BMW", "AUDI", "RENAULT", "PEUGEOT", "CITROËN", "FIAT", "VOLVO", "FIAT",
  // Americanas
  "CHEVROLET", "FORD", "DODGE", "RAM", "JEEP",
  // Chinas
  "CHERY", "CHANGAN", "GWM", "HAVAL", "JAC", "BYD", "MG", "GEELY", "FOTON", "DONGFENG", "DFM", "GREAT WALL",
  "LIFAN", "JMEV", "BAIC", "MAXUS", "TANK", "JETOUR", "OMODA", "JACOO", "CAOA CHERY", "JAC MOTORS",
  // Brasileñas/Indianas
  "FIAT", "TATA",
  // Comercial/Pesada
  "HINO", "SCANIA", "MAN", "FUSO",
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
// CÓDIGOS DE SERVICIO (F1T02)
// --------------------------------------------
export const CODIGOS_SERVICIO = {
  TRABAJO: [
    { value: "CT", label: "CT - Cambio Total" },
    { value: "CP", label: "CP - Cambio Parcial" },
    { value: "RG", label: "RG - Regulación" },
    { value: "RP", label: "RP - Reparación" },
    { value: "RV", label: "RV - Revisión" },
    { value: "VR", label: "VR - Verificación" },
  ],
  ORGANO: [
    { value: "01", label: "01 - Motor" },
    { value: "02", label: "02 - Frenos" },
    { value: "03", label: "03 - Dirección" },
    { value: "04", label: "04 - Embrague" },
    { value: "05", label: "05 - Suspensión" },
    { value: "06", label: "06 - Transmisión" },
    { value: "07", label: "07 - Diferencial" },
    { value: "08", label: "08 - Eléctrica" },
    { value: "09", label: "09 - Planchado" },
    { value: "10", label: "10 - Pintura" },
    { value: "11", label: "11 - Vidrios" },
    { value: "12", label: "12 - Tapicería" },
    { value: "13", label: "13 - Carrocería" },
    { value: "14", label: "14 - Capota" },
    { value: "15", label: "15 - Ruedas/Llantas" },
  ],
} as const;

// --------------------------------------------
// CONJUNTOS SUBSTITUIDOS (F1T02)
// --------------------------------------------
export const CONJUNTOS_SUBSTITUIDOS = [
  "Motor",
  "Caja de Velocidades",
  "Diferencial",
  "Dirección",
  "Embrague",
  "Suspensión Delantera",
  "Suspensión Trasera",
  "Frenos Delanteros",
  "Frenos Traseros",
  "Amortiguadores",
  "Balatas",
  "Discos",
  "Bomba de Agua",
  "Bomba de Aceite",
  "Alternador",
  "Marcha",
  "Batería",
  "Radiador",
  "Turbo",
  "Inyectores",
  "Válvulas",
  "Correas/Fajas",
  "Filtro de Aire",
  "Filtro de Aceite",
  "Filtro de Combustible",
] as const;

// --------------------------------------------
// MARCAS Y MODELOS DE VEHÍCULOS (Estándar Perú)
// --------------------------------------------
export const MARCAS_MODELOS: Record<string, string[]> = {
  // Japonesas
  "TOYOTA": ["HILUX", "COROLLA", "CAMRY", "4RUNNER", "PRADO", "COASTER", "HIACE", "INNOVA", "RUSH", "FORTUNER", "LAND CRUISER", "YARIS", "HILUX SW4", "RAV4", "DYNA", "HIACE COMBI", "GR SUPRA", "C-HR", "SIENNA", "PREVIA", "AVENSIS", "RAV4 PRIME"],
  "NISSAN": ["FRONTIER", "SENTRA", "MARCH", "X-TRAIL", "NP300", "KICKS", "QASHQAI", "PATROL", "NAVARA", "URVAN", "VERSA", "MURANO", "ARMADA", "KING CAB", "CABSTAR", "NT450"],
  "MAZDA": ["MAZDA3", "MAZDA6", "CX-3", "CX-5", "CX-30", "BT-50", "CX-50", "CX-60", "CX-90", "MX-5"],
  "MITSUBISHI": ["OUTLANDER", "L200", "MONTERO", "ASX", "ATTRAGE", "TRITON", "PAJERO SPORT", "MONTERO SPORT", "COLT", "ECLIPSE CROSS", "MIRAGE", "FUSO CANTER", "FUSO fighter"],
  "SUZUKI": ["SWIFT", "VITARA", "JIMNY", "CELERIO", "DZIRE", "CARRY", "S-PRESSO", "BALENO", "EEGUER", "XL7", "ERTIGA", "JIMNY SIERRA", "SWACE", "ACROSS"],
  "ISUZU": ["D-MAX", "MU-X", "NPR", "NQR", "FRR", "FSR", "FVZ", "FVR", "FORWARD", "GIGA", "ELF"],
  "HONDA": ["CIVIC", "CR-V", "HR-V", "FIT", "WR-V", "ACCORD", "PILOT", "ODYSSEY", "BR-V", "STEP WGN", "ACTY"],
  "DAIHATSU": ["TERIOS", "HIJET", "MIRA", "CUORE", "COPEN", "MATERIA", "BOON", "MOVE", "TANTO"],
  "SUBARU": ["OUTBACK", "FORESTER", "XV", "IMPREZA", "LEGACY", "WRX", "LEVORG", "ASCENT", "SOLTERRA"],
  "LEXUS": ["NX", "RX", "IS", "ES", "UX", "GX", "LX", "RC", "LS", "LC"],
  "INFINITI": ["Q50", "QX50", "QX60", "QX80", "Q60", "Q70"],
  // Coreanas
  "HYUNDAI": ["TUCSON", "SANTA FE", "ACCENT", "i10", "i20", "HD78", "PORTER", "ELANTRA", "CRETA", "KONA", "STAREX", "IONIQ 5", "AVANTE", "VERNA", "H1", "H350", "SONATA", "PALISADE", "VENUE", "BAYON"],
  "KIA": ["SPORTAGE", "SONATA", "PICANTO", "CERATO", "SORENTO", "RIO", "SELTOS", "STONIC", "MORNING", "CARNIVAL", "OPTIMA", "K5", "NIRO", "EV6", "SOUL", "SELTOS", "CARENS", "PREGIO", "BONGO"],
  "GENESIS": ["G70", "G80", "GV70", "GV80", "Electrified G80"],
  "SSANGYONG": ["TIVOLI", "KORANDO", "REXTON", "MUSSO", "ACTYON", "KORANDO C300"],
  // Europeas
  "MERCEDES-BENZ": ["SPRINTER", "ACTROS", "ATEGO", "VITO", "CLASE C", "CLASE E", "CLASE A", "GLA", "GLC", "GLE", "V-CLASS", "CITAN", "ATEGO", "AXOR", "UNIMOG", "CITO"],
  "VOLKSWAGEN": ["GOL", "POLO", "T-CROSS", "TIGUAN", "AMAROK", "TRANSPORTER", "TAOS", "T-ROC", "TOUAREG", "VIRTUS", "SAVEIRO", "CRETE", "GOL POWER", "CRAFTER", "MULTIVAN"],
  "BMW": ["SERIE 3", "SERIE 5", "X1", "X3", "X5", "SERIE 1", "SERIE 2", "X2", "X4", "X6", "Z4", "I3", "I4", "IX", "M3", "M5"],
  "AUDI": ["A3", "A4", "Q3", "Q5", "A1", "A5", "A6", "A7", "Q7", "Q8", "E-TRON", "TT"],
  "RENAULT": ["DUSTER", "KWID", "SANDERO", "LOGAN", "KOLEOS", "CAPTUR", "MEGANE", "SCENIC", "TRAFIC", "MASTER", "KANGOO", "ALASKAN", "OROCH"],
  "PEUGEOT": ["208", "2008", "3008", "PARTNER", "RENDER", "207", "301", "408", "5008", "RIFTER", "TRAVELLER", "BOXER", "EXPERT"],
  "CITROËN": ["C3", "C4", "BERLINGO", "JUMPER", "C3 AIRCROSS", "C5 AIRCROSS", "JUMPY", "RELAY", "SPACETOURER"],
  "FIAT": ["DUCATO", "DOBLÒ", "PUNTO", "500", "CRONOS", "ARGO", "PULSE", "STRADA", "TORO", "MULTIPLA", "ULYSSE", "DUCATO MAXI"],
  "VOLVO": ["FH", "FM", "FMX", "FL", "FE", "XC40", "XC60", "XC90", "S60", "V40", "V60", "V90", "C40 RECHARGE"],
  // Americanas
  "CHEVROLET": ["SAIL", "ONIX", "CAPTIVA", "NPR", "TORNADO", "SPARK", "TRACKER", "S10", "N300", "NHR", "TRAX", "TRAVERSE", "COLORADO", "SILVERADO", "SUBURBAN", "TAHOE", "EQUINOX", "SONIC", "CRUZE", "MERIVA", "SPARK GT", "TORNADO EV"],
  "FORD": ["RANGER", "ESCAPE", "ECOSPORT", "TRANSIT", "TERRITORY", "MAVERICK", "EXPLORER", "EDGE", "BRONCO", "BRONCO SPORT", "SUPER DUTY", "F-150", "LOBO", "SPEEDWAY", "F-600", "F-7000"],
  "DODGE": ["JOURNEY", "DURANGO", "RAM 1500", "RAM 2500", "RAM 3500", "CHARGER", "CHALLENGER", "GRAND CARAVAN"],
  "RAM": ["1500", "2500", "3500", "PROMASTER", "CHASSIS CAB"],
  "JEEP": ["RENEGADE", "COMPASS", "WRANGLER", "GRAND CHEROKEE", "CHEROKEE", "GLADIATOR"],
  // Chinas
  "CHERY": ["TIGGO 2", "TIGGO 3", "TIGGO 4", "TIGGO 7", "TIGGO 8", "ARRIZO 5", "ARRIZO 6", "ARRIZO 8", "OMODA 5", "JACOO 7", "QQ", "FULWIN", "FOLLOW", "KARRY", "TIGGO PRO", "TIGGO 8 PRO", "ARRIZO GX"],
  "CHANGAN": ["CS35", "CS55", "CS75", "ALSVIN", "HUNTER", "STAR MODEL", "CS95", "EADO", "UNI-T", "UNI-K", "CS35 PLUS", "CS55 PLUS", "CS75 PLUS", "Z6", "LUMIN"],
  "GWM": ["POER", "Haval JOLION", "Haval H6", "ORA", "CANNON", "TANK 300", "TANK 500", "Haval F7", "Haval初恋", "WINGLE 7", "STEED"],
  "HAVAL": ["JOLION", "H6", "F7", "F7X", "DARGO", "H9"],
  "JAC": ["S2", "S3", "S4", "S5", "S7", "T6", "T8", "REFINE", "SUNRAY", "iEV", "REIN", "S2 MINI", "T8 PRO", "SUNRAY PRO", "iEV7S"],
  "BYD": ["YUAN PLUS", "ATTO 3", "DOLPHIN", "SEAL", "SONG PLUS", "TANG", "HAN", "QIN PLUS", "SEAGULL", "DOLPHIN MINI", "SONG PRO", "TAN", "F3", "S6", "S7"],
  "MG": ["ZS", "HS", "MG5", "MG3", "RX8", "GLOSTER", "ZS EV", "HS PHEV", "MARVEL R", "EP", "MG ONE"],
  "GEELY": ["EMGRAND", "COOLRAY", "AZKARRA", "OKAVANGO", "MONJARO", "TUGELLA", "ATLAS", "BINRAY", "STARHILL", "PROTON"],
  "FOTON": ["TUNLAND", "AUMARK", "VIEW", "TUNLAND G9", "TOANO", "SAPU", "BJ40", "SAUVANA", "GRAND TUNLAND", "拓陆者"],
  "DONGFENG": ["AX7", "RICH", "T5 EVO", "GLORY 580", "AEOLUS", "BOX", "SERES", "FENGON 500", "FENGON 7", "MAXUS V80"],
  "DFM": ["RICH", "C35", "K01", "S30", "A9", "AX7", "H30", "E70", "BOX"],
  "GREAT WALL": ["STEED", "WINGLE 7", "POER", "HAVAL H6", "HAVAL JOLION", "ORA GOOD CAT"],
  "LIFAN": ["330", "520", "620", "X60", "MYWAY", "820", "KPV"],
  "JMEV": ["EV30", "E200", "E400", "RAY", "EX5"],
  "BAIC": ["X35", "X55", "X65", "BJ20", "BJ40", "BJ80", "EU5", "EC5", "EX360"],
  "MAXUS": ["V80", "V90", "T60", "T70", "G10", "G20", "D90", "MIFA 9", "EV30", "EV90"],
  "TANK": ["300", "400", "500", "700", "800"],
  "JETOUR": ["X70", "X70 PLUS", "X90", "DASHING", "T2"],
  "OMODA": ["5", "5 GT", "C5"],
  "JACOO": ["7", "8"],
  "CAOA CHERY": ["TIGGO 2", "TIGGO 3X", "TIGGO 4", "TIGGO 7", "TIGGO 8"],
  "JAC MOTORS": ["S2", "S3", "T6", "REFINE", "SUNRAY"],
  // Brasileñas/Indianas
  "TATA": ["NEXON", "HARBOR", "TIAGO", "TIGOR", "PUNCH", "ALTROZ", "SAFARI", "HARRIER", "NEXON EV"],
  // Comercial/Pesada
  "HINO": ["300", "500", "700", "PROFIA", "RANGER", "PONTO", "DUTRO"],
  "SCANIA": ["R-SERIE", "S-SERIE", "G-SERIE", "P-SERIE", "TUBULAR", "F-SERIE"],
  "MAN": ["TGX", "TGL", "TGM", "TGS", "CITATION"],
  "FUSO": ["CANTER", "FIKER", "SUPER GREAT", "COLT", "FEAR", "FIGHTER"],
} as const;

// --------------------------------------------
// AÑOS DE FABRICACIÓN VÁLIDOS (Perú - Decreto Supremo)
// --------------------------------------------
export const ANIOS_FABRICACION: { value: string; label: string }[] = Array.from(
  { length: 2026 - 1990 + 1 },
  (_, i) => {
    const year = 2026 - i;
    return { value: String(year), label: String(year) };
  }
);

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
