// Client-safe order number generator (preview only, real number assigned by backend)

type TipoOrden = "OC" | "OM" | "MD";

export function generateNumeroOrden(tipo: TipoOrden): string {
  const year = new Date().getFullYear();
  const now = new Date();
  const seq = String(
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  ).padStart(4, "0");
  return `${tipo}-${year}-${seq}`;
}
