import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

const ROLES_PERMITIDOS = ["JEFE_MANTENIMIENTO", "LAVADOR", "ADMINISTRATIVO"];

// GET: Listar lavados con información del vehículo
export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const prisma = getPrisma();
    const lavados = await prisma.lavado.findMany({
      include: {
        vehiculo: {
          select: {
            id: true,
            placa: true,
            marca: true,
            modelo: true,
            codigoPatrimonial: true,
          },
        },
      },
      orderBy: { fecha: "desc" },
    });

    const plainLavados = lavados.map((l) => ({
      id: l.id,
      vehiculoId: l.vehiculoId,
      vehiculoPlaca: l.vehiculo.placa,
      vehiculoMarca: l.vehiculo.marca,
      vehiculoModelo: l.vehiculo.modelo,
      vehiculoCodigo: l.vehiculo.codigoPatrimonial,
      fecha: l.fecha.toISOString().split("T")[0],
      tipoLavado: l.tipoLavado,
      costo: l.costo ? parseFloat(l.costo.toString()) : null,
      proveedor: l.proveedor,
      responsable: l.responsable,
      observaciones: l.observaciones,
      creadoEn: l.creadoEn.toISOString(),
    }));

    return NextResponse.json(plainLavados);
  } catch (error: any) {
    console.error("Error al cargar lavados:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, { requiredRoles: ROLES_PERMITIDOS });

// POST: Crear nuevo registro de lavado
export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();
    const { vehiculoId, fecha, tipoLavado, costo, proveedor, responsable, observaciones } = body;

    if (!vehiculoId || !fecha || !tipoLavado) {
      return NextResponse.json({ error: "Faltan campos requeridos: vehiculoId, fecha, tipoLavado" }, { status: 400 });
    }

    if (!["EXTERIOR", "INTERIOR", "COMPLETO"].includes(tipoLavado)) {
      return NextResponse.json({ error: "tipoLavado debe ser EXTERIOR, INTERIOR o COMPLETO" }, { status: 400 });
    }

    const prisma = getPrisma();

    const nuevoLavado = await prisma.lavado.create({
      data: {
        vehiculoId,
        fecha: new Date(fecha),
        tipoLavado,
        costo: costo ? parseFloat(costo) : null,
        proveedor: proveedor || null,
        responsable: responsable || null,
        observaciones: observaciones || null,
      },
    });

    return NextResponse.json(nuevoLavado, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear lavado:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, { requiredRoles: ROLES_PERMITIDOS });

// DELETE: Eliminar registro de lavado
export const DELETE = withAuth(async (request: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Falta parámetro: id" }, { status: 400 });
    }

    const prisma = getPrisma();

    await prisma.lavado.delete({ where: { id } });

    return NextResponse.json({ message: "Lavado eliminado" });
  } catch (error: any) {
    console.error("Error al eliminar lavado:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, { requiredRoles: ROLES_PERMITIDOS });
