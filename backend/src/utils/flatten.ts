// ============================================================
// SAF Backend - Utility: Flatten nested Prisma objects
// ============================================================

export function flattenVehiculo(v: any): any {
  if (!v) return v;
  return {
    ...v,
    marca: v.marca?.nombre ?? v.marca ?? "",
    modelo: v.modelo?.nombre ?? v.modelo ?? "",
    color: v.color?.nombre ?? v.color ?? "",
    tipoCombustible: v.tipoCombustible?.nombre ?? v.tipoCombustible ?? "",
    estado: v.estado?.codigo ?? v.estado?.nombre ?? v.estado ?? "",
    vehiculoLabel: v.vehiculo?.placa
      ? `${v.vehiculo.marca?.nombre ?? ""} ${v.vehiculo.modelo?.nombre ?? ""} (${v.vehiculo.placa})`
      : undefined,
    placa: v.placa ?? v.vehiculo?.placa ?? "",
  };
}
