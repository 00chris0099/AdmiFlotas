import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const prisma = getPrisma();
    const asignaciones = await prisma.asignacionVehiculo.findMany({
      where: { activa: true },
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
        conductor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            licenciaConducir: true,
          },
        },
      },
      orderBy: { fechaAsignacion: "desc" },
    });

    return NextResponse.json(asignaciones);
  } catch (error: any) {
    console.error("Error al obtener asignaciones:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();
    const { vehiculoId, conductorId, sectorAsignado, observaciones } = body;

    if (!vehiculoId || !conductorId || !sectorAsignado) {
      return NextResponse.json(
        { error: "Vehículo, conductor y sector son requeridos" },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    // Desactivar asignación anterior del mismo vehículo
    await prisma.asignacionVehiculo.updateMany({
      where: {
        vehiculoId,
        activa: true,
      },
      data: {
        activa: false,
        fechaFin: new Date(),
      },
    });

    // Crear nueva asignación
    const asignacion = await prisma.asignacionVehiculo.create({
      data: {
        vehiculoId,
        conductorId,
        sectorAsignado,
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
        conductor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    return NextResponse.json(asignacion, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear asignación:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, { requiredRoles: ["JEFE_PROCESO", "JEFE_OPERACION", "ADMINISTRATIVO"] });
