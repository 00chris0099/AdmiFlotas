// ============================================
// GENERADOR DE NÚMEROS DE ORDEN - SAF ERP
// Genera números automáticos según F1T02
// ============================================

/**
 * Genera un número de orden automático
 * @param tipo - "OC" para Combustible, "OM" para Mantenimiento, "MD" para Movimientos
 * @returns Número de orden en formato TIPO-AÑO-XXXX
 */
export function generateNumeroOrden(tipo: "OC" | "OM" | "MD"): string {
  const year = new Date().getFullYear();
  const counter = getNextCounter(tipo);
  return `${tipo}-${year}-${String(counter).padStart(4, "0")}`;
}

/**
 * Obtiene y incrementa el contador para un tipo de orden
 */
function getNextCounter(tipo: string): number {
  const key = `saf_counter_${tipo}_${new Date().getFullYear()}`;
  
  // En producción, esto debería venir de la base de datos
  // Por ahora usamos localStorage como fallback
  let current = 0;
  
  if (typeof window !== "undefined") {
    current = parseInt(localStorage.getItem(key) || "0");
    const next = current + 1;
    localStorage.setItem(key, next.toString());
    return next;
  }
  
  // Fallback para SSR - usar timestamp
  return Date.now() % 10000;
}

/**
 * Valida el formato de un número de orden
 */
export function validateNumeroOrden(numero: string, tipo: "OC" | "OM" | "MD"): boolean {
  const regex = new RegExp(`^${tipo}-\\d{4}-\\d{4}$`);
  return regex.test(numero);
}

/**
 * Genera un código de servicio según F1T02
 * @param trabajo - Tipo de trabajo (CT, CP, RG, RP, RV, VR)
 * @param organo - Código del órgano (01-15)
 * @returns Código de servicio en formato X1X2-X3X4
 */
export function generateCodigoServicio(trabajo: string, organo: string): string {
  return `${trabajo}-${organo}`;
}

/**
 * Valida un código de servicio
 */
export function validateCodigoServicio(codigo: string): boolean {
  const regex = /^[A-Z]{2}-\d{2}$/;
  return regex.test(codigo);
}
