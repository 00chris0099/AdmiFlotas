import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

const ROLES_PERMITIDOS = ["JEFE_MANTENIMIENTO", "ENCARGADO_TALLER", "MECANICO", "ADMINISTRATIVO"];

// GET: Listar repuestos con información de stock
export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const prisma = getPrisma();
    const repuestos = await prisma.repuesto.findMany({
      include: {
        movimientos: {
          orderBy: { fecha: "desc" },
          take: 1,
        },
      },
      orderBy: { codigo: "asc" },
    });

    const plainRepuestos = repuestos.map((r) => ({
      id: r.id,
      codigo: r.codigo,
      descripcion: r.descripcion,
      categoria: r.categoria,
      unidadMedida: r.unidadMedida,
      stockActual: r.stockActual,
      stockMinimo: r.stockMinimo,
      precioUnitario: r.precioUnitario ? parseFloat(r.precioUnitario.toString()) : null,
      estadoStock: r.stockActual <= 0 ? "AGOTADO" : r.stockActual <= r.stockMinimo ? "BAJO" : "NORMAL",
    }));

    return NextResponse.json(plainRepuestos);
  } catch (error: any) {
    console.error("Error al cargar repuestos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, { requiredRoles: ROLES_PERMITIDOS });

// POST: Crear nuevo repuesto
export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();
    const { codigo, descripcion, categoria, unidadMedida, stockActual, stockMinimo, precioUnitario } = body;

    if (!codigo || !descripcion || !categoria) {
      return NextResponse.json({ error: "Faltan campos requeridos: codigo, descripcion, categoria" }, { status: 400 });
    }

    const prisma = getPrisma();

    const existente = await prisma.repuesto.findUnique({ where: { codigo } });
    if (existente) {
      return NextResponse.json({ error: "Ya existe un repuesto con ese código" }, { status: 409 });
    }

    const nuevoRepuesto = await prisma.repuesto.create({
      data: {
        codigo,
        descripcion,
        categoria,
        unidadMedida: unidadMedida || "unidad",
        stockActual: stockActual || 0,
        stockMinimo: stockMinimo || 0,
        precioUnitario: precioUnitario ? parseFloat(precioUnitario) : null,
      },
    });

    return NextResponse.json(nuevoRepuesto, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear repuesto:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, { requiredRoles: ROLES_PERMITIDOS });

// PUT: Actualizar repuesto
export const PUT = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();
    const { id, descripcion, categoria, unidadMedida, stockMinimo, precioUnitario } = body;

    if (!id) {
      return NextResponse.json({ error: "Falta campo requerido: id" }, { status: 400 });
    }

    const prisma = getPrisma();

    const datosActualizar: Record<string, any> = {};
    if (descripcion !== undefined) datosActualizar.descripcion = descripcion;
    if (categoria !== undefined) datosActualizar.categoria = categoria;
    if (unidadMedida !== undefined) datosActualizar.unidadMedida = unidadMedida;
    if (stockMinimo !== undefined) datosActualizar.stockMinimo = parseInt(stockMinimo);
    if (precioUnitario !== undefined) datosActualizar.precioUnitario = precioUnitario ? parseFloat(precioUnitario) : null;

    const repuestoActualizado = await prisma.repuesto.update({
      where: { id },
      data: datosActualizar,
    });

    return NextResponse.json(repuestoActualizado);
  } catch (error: any) {
    console.error("Error al actualizar repuesto:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, { requiredRoles: ROLES_PERMITIDOS });

// DELETE: Eliminar repuesto
export const DELETE = withAuth(async (request: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Falta parámetro: id" }, { status: 400 });
    }

    const prisma = getPrisma();

    const movimientos = await prisma.movimientoAlmacen.count({ where: { repuestoId: id } });
    if (movimientos > 0) {
      return NextResponse.json({ error: "No se puede eliminar: tiene movimientos registrados" }, { status: 409 });
    }

    await prisma.repuesto.delete({ where: { id } });

    return NextResponse.json({ message: "Repuesto eliminado" });
  } catch (error: any) {
    console.error("Error al eliminar repuesto:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, { requiredRoles: ROLES_PERMITIDOS });
