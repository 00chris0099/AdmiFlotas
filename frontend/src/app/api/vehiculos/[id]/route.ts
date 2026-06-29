import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const prisma = getPrisma();
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id },
      include: {
        movimientosDiarios: {
          orderBy: { fecha: "desc" },
          take: 10,
          include: { conductor: true },
        },
        ordenesMantenimiento: {
          orderBy: { fechaEmision: "desc" },
          take: 5,
        },
        controlLlantas: {
          orderBy: { posicionVehiculo: "asc" },
        },
      },
    });

    if (!vehiculo) {
      return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 });
    }

    return NextResponse.json(vehiculo);
  } catch (error: any) {
    console.error("Error al obtener vehículo:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const PUT = withAuth(async (request: NextRequest, { user }) => {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const body = await request.json();
    const prisma = getPrisma();

    const vehiculo = await prisma.vehiculo.findUnique({ where: { id } });
    if (!vehiculo) {
      return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 });
    }

    const updated = await prisma.vehiculo.update({
      where: { id },
      data: {
        ...(body.marca && { marca: body.marca }),
        ...(body.modelo && { modelo: body.modelo }),
        ...(body.color && { color: body.color }),
        ...(body.estado && { estado: body.estado }),
        ...(body.numeroMotor !== undefined && { numeroMotor: body.numeroMotor || null }),
        ...(body.numeroChasis !== undefined && { numeroChasis: body.numeroChasis || null }),
        ...(body.potenciaHp !== undefined && { potenciaHp: body.potenciaHp ? parseInt(body.potenciaHp) : null }),
        ...(body.tipoCombustible && { tipoCombustible: body.tipoCombustible }),
        ...(body.capacidadCargaKg !== undefined && { capacidadCargaKg: body.capacidadCargaKg ? parseFloat(body.capacidadCargaKg) : null }),
        ...(body.capacidadPasajeros !== undefined && { capacidadPasajeros: body.capacidadPasajeros ? parseInt(body.capacidadPasajeros) : null }),
        ...(body.valorAdquisicion !== undefined && { valorAdquisicion: body.valorAdquisicion ? parseFloat(body.valorAdquisicion) : null }),
        ...(body.vidaUtilAnios !== undefined && { vidaUtilAnios: body.vidaUtilAnios ? parseInt(body.vidaUtilAnios) : null }),
        ...(body.seguroAnual !== undefined && { seguroAnual: body.seguroAnual ? parseFloat(body.seguroAnual) : null }),
        ...(body.licenciamientoAnual !== undefined && { licenciamientoAnual: body.licenciamientoAnual ? parseFloat(body.licenciamientoAnual) : null }),
        ...(body.periodicidadMantenimientoKm !== undefined && { periodicidadMantenimientoKm: body.periodicidadMantenimientoKm ? parseInt(body.periodicidadMantenimientoKm) : null }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error al actualizar vehículo:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, { requiredRoles: ["JEFE_PROCESO", "ADMINISTRATIVO"] });

export const DELETE = withAuth(async (request: NextRequest, { user }) => {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const prisma = getPrisma();

    const vehiculo = await prisma.vehiculo.findUnique({ where: { id } });
    if (!vehiculo) {
      return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 });
    }

    // Verificar dependencias
    const movimientos = await prisma.movimientoDiario.count({ where: { vehiculoId: id } });
    if (movimientos > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar: tiene movimientos registrados" },
        { status: 400 }
      );
    }

    await prisma.vehiculo.delete({ where: { id } });

    return NextResponse.json({ message: "Vehículo eliminado correctamente" });
  } catch (error: any) {
    console.error("Error al eliminar vehículo:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, { requiredRoles: ["JEFE_PROCESO"] });
