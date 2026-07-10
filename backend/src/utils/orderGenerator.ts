// ============================================================
// SAF Backend - Database-based Order Number Generator
// ============================================================

import prisma from "../config/database.js";

type TipoOrden = "OC" | "OM" | "MD";

export async function generateNumeroOrden(tipo: TipoOrden): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `${tipo}-${year}`;

  // Get the last order number for this type and year
  const lastOrder = await prisma.$queryRaw<{ numero_orden: string }[]>`
    SELECT numero_orden 
    FROM (
      SELECT numero_orden FROM ordenes_combustible WHERE numero_orden LIKE ${prefix + '%'}
      UNION ALL
      SELECT numero_orden FROM ordenes_mantenimiento WHERE numero_orden LIKE ${prefix + '%'}
      UNION ALL
      SELECT numero_orden FROM movimientos_diarios WHERE numero_orden LIKE ${prefix + '%'}
    ) AS all_orders
    ORDER BY numero_orden DESC
    LIMIT 1
  `;

  let nextNumber = 1;

  if (lastOrder.length > 0) {
    const lastNum = lastOrder[0].numero_orden.split("-").pop();
    nextNumber = parseInt(lastNum || "0", 10) + 1;
  }

  return `${prefix}-${String(nextNumber).padStart(4, "0")}`;
}
