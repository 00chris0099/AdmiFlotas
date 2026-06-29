import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

// GET: Listar rutas con filtros opcionales
export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const prisma = getPrisma();
    const { searchParams } = new URL(request.url);
    const activa = searchParams.get("activa");
    const buscar = searchParams.get("buscar");

    const where: any = {};

    if (activa !== null && activa !== undefined && activa !== "") {
      where.activa = activa === "true";
    }

    if (buscar) {
      where.OR = [
        { nombre: { contains: buscar, mode: "insensitive" } },
        { origen: { contains: buscar, mode: "insensitive" } },
        { destino: { contains: buscar, mode: "insensitive" } },
      ];
    }

    const rutas = await prisma.ruta.findMany({
      where,
      include: {
        _count: { select: { programaciones: true } },
      },
      orderBy: { nombre: "asc" },
    });

    const plainRutas = rutas.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      origen: r.origen,
      destino: r.destino,
      distanciaKm: r.distanciaKm ? parseFloat(r.distanciaKm.toString()) : null,
      tiempoEstimado: r.tiempoEstimado,
      activa: r.activa,
      totalProgramaciones: r._count.programaciones,
      creadoEn: r.creadoEn.toISOString(),
    }));

    return NextResponse.json(plainRutas);
  } catch (error: any) {
    console.error("Error al obtener rutas:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// POST: Crear nueva ruta
export const POST = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json();
      const { nombre, origen, destino, distanciaKm, tiempoEstimado } = body;

      if (!nombre || !origen || !destino) {
        return NextResponse.json(
          { error: "Nombre, origen y destino son requeridos" },
          { status: 400 }
        );
      }

      const prisma = getPrisma();

      const ruta = await prisma.ruta.create({
        data: {
          nombre,
          origen,
          destino,
          distanciaKm: distanciaKm ? parseFloat(distanciaKm) : null,
          tiempoEstimado: tiempoEstimado || null,
        },
      });

      return NextResponse.json(ruta, { status: 201 });
    } catch (error: any) {
      console.error("Error al crear ruta:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredRoles: ["JEFE_OPERACION", "CONTROLADOR_TRANSITO", "ADMINISTRATIVO"] }
);

// PUT: Actualizar ruta
export const PUT = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json();
      const { id, nombre, origen, destino, distanciaKm, tiempoEstimado, activa } = body;

      if (!id) {
        return NextResponse.json({ error: "ID de ruta requerido" }, { status: 400 });
      }

      const prisma = getPrisma();

      const ruta = await prisma.ruta.update({
        where: { id },
        data: {
          nombre: nombre ?? undefined,
          origen: origen ?? undefined,
          destino: destino ?? undefined,
          distanciaKm: distanciaKm !== undefined ? (distanciaKm ? parseFloat(distanciaKm) : null) : undefined,
          tiempoEstimado: tiempoEstimado !== undefined ? tiempoEstimado : undefined,
          activa: activa ?? undefined,
        },
      });

      return NextResponse.json(ruta);
    } catch (error: any) {
      console.error("Error al actualizar ruta:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredRoles: ["JEFE_OPERACION", "CONTROLADOR_TRANSITO", "ADMINISTRATIVO"] }
);

// DELETE: Eliminar ruta
export const DELETE = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");

      if (!id) {
        return NextResponse.json({ error: "ID de ruta requerido" }, { status: 400 });
      }

      const prisma = getPrisma();

      // Verificar que no tenga programaciones activas
      const activas = await prisma.programacionRuta.count({
        where: { rutaId: id, estado: { notIn: ["CANCELADO", "COMPLETADO"] } },
      });

      if (activas > 0) {
        return NextResponse.json(
          { error: "No se puede eliminar: la ruta tiene programaciones activas" },
          { status: 400 }
        );
      }

      await prisma.ruta.delete({ where: { id } });

      return NextResponse.json({ message: "Ruta eliminada" });
    } catch (error: any) {
      console.error("Error al eliminar ruta:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredRoles: ["JEFE_OPERACION", "CONTROLADOR_TRANSITO", "ADMINISTRATIVO"] }
);
