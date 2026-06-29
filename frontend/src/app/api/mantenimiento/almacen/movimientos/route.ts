import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

const ROLES_PERMITIDOS = ["JEFE_MANTENIMIENTO", "ENCARGADO_TALLER", "MECANICO", "ADMINISTRATIVO"];

// GET: Listar movimientos (filtro por repuestoId o todos)
export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(request.url);
    const repuestoId = searchParams.get("repuestoId");

    const prisma = getPrisma();

    const where = repuestoId ? { repuestoId } : {};

    const movimientos = await prisma.movimientoAlmacen.findMany({
      where,
      include: {
        repuesto: {
          select: { codigo: true, descripcion: true },
        },
      },
      orderBy: { fecha: "desc" },
      take: 200,
    });

    const plainMovimientos = movimientos.map((m) => ({
      id: m.id,
      repuestoId: m.repuestoId,
      repuestoCodigo: m.repuesto.codigo,
      repuestoDescripcion: m.repuesto.descripcion,
      tipoMovimiento: m.tipoMovimiento,
      cantidad: m.cantidad,
      ordenMantenimientoId: m.ordenMantenimientoId,
      responsable: m.responsable,
      fecha: m.fecha,
      observaciones: m.observaciones,
    }));

    return NextResponse.json(plainMovimientos);
  } catch (error: any) {
    console.error("Error al cargar movimientos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, { requiredRoles: ROLES_PERMITIDOS });

// POST: Crear movimiento (entrada/salida) y actualizar stock
export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();
    const { repuestoId, tipoMovimiento, cantidad, ordenMantenimientoId, responsable, observaciones } = body;

    if (!repuestoId || !tipoMovimiento || !cantidad || !responsable) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: repuestoId, tipoMovimiento, cantidad, responsable" },
        { status: 400 }
      );
    }

    if (!["ENTRADA", "SALIDA"].includes(tipoMovimiento)) {
      return NextResponse.json({ error: "tipoMovimiento debe ser ENTRADA o SALIDA" }, { status: 400 });
    }

    if (cantidad <= 0) {
      return NextResponse.json({ error: "La cantidad debe ser mayor a 0" }, { status: 400 });
    }

    const prisma = getPrisma();

    const repuesto = await prisma.repuesto.findUnique({ where: { id: repuestoId } });
    if (!repuesto) {
      return NextResponse.json({ error: "Repuesto no encontrado" }, { status: 404 });
    }

    if (tipoMovimiento === "SALIDA" && repuesto.stockActual < cantidad) {
      return NextResponse.json(
        { error: `Stock insuficiente. Disponible: ${repuesto.stockActual}` },
        { status: 400 }
      );
    }

    const nuevoStock = tipoMovimiento === "ENTRADA"
      ? repuesto.stockActual + cantidad
      : repuesto.stockActual - cantidad;

    const [movimiento] = await prisma.$transaction([
      prisma.movimientoAlmacen.create({
        data: {
          repuestoId,
          tipoMovimiento,
          cantidad,
          ordenMantenimientoId: ordenMantenimientoId || null,
          responsable,
          observaciones: observaciones || null,
        },
      }),
      prisma.repuesto.update({
        where: { id: repuestoId },
        data: { stockActual: nuevoStock },
      }),
    ]);

    return NextResponse.json({
      ...movimiento,
      stockActual: nuevoStock,
      estadoStock: nuevoStock <= 0 ? "AGOTADO" : nuevoStock <= repuesto.stockMinimo ? "BAJO" : "NORMAL",
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear movimiento:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, { requiredRoles: ROLES_PERMITIDOS });
