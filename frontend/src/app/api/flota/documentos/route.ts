import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(request.url);
    const vehiculoId = searchParams.get("vehiculoId");

    const prisma = getPrisma();

    const whereClause: any = {};
    if (vehiculoId) {
      whereClause.vehiculoId = vehiculoId;
    }

    const documentos = await prisma.documentoVehiculo.findMany({
      where: whereClause,
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
      orderBy: { fechaVencimiento: "asc" },
    });

    return NextResponse.json(documentos);
  } catch (error: any) {
    console.error("Error al obtener documentos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();
    const {
      vehiculoId,
      tipoDocumento,
      numeroDocumento,
      fechaEmision,
      fechaVencimiento,
      entidadEmisora,
      observaciones,
    } = body;

    if (!vehiculoId || !tipoDocumento || !numeroDocumento || !fechaEmision) {
      return NextResponse.json(
        { error: "Vehículo, tipo de documento, número y fecha de emisión son requeridos" },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    const documento = await prisma.documentoVehiculo.create({
      data: {
        vehiculoId,
        tipoDocumento,
        numeroDocumento,
        fechaEmision: new Date(fechaEmision),
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
        entidadEmisora: entidadEmisora || null,
        observaciones: observaciones || null,
      },
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
    });

    return NextResponse.json(documento, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear documento:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, { requiredRoles: ["JEFE_PROCESO", "ADMINISTRATIVO"] });

export const DELETE = withAuth(async (request: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID del documento es requerido" }, { status: 400 });
    }

    const prisma = getPrisma();

    const existing = await prisma.documentoVehiculo.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    await prisma.documentoVehiculo.delete({ where: { id } });

    return NextResponse.json({ message: "Documento eliminado correctamente" });
  } catch (error: any) {
    console.error("Error al eliminar documento:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, { requiredRoles: ["JEFE_PROCESO", "ADMINISTRATIVO"] });
