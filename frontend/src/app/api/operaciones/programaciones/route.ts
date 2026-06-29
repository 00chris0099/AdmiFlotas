import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

// GET: Listar programaciones con filtros
export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const prisma = getPrisma();
    const { searchParams } = new URL(request.url);
    const fechaInicio = searchParams.get("fechaInicio");
    const fechaFin = searchParams.get("fechaFin");
    const estado = searchParams.get("estado");
    const vehiculoId = searchParams.get("vehiculoId");
    const conductorId = searchParams.get("conductorId");
    const rutaId = searchParams.get("rutaId");

    const where: any = {};

    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) where.fecha.gte = new Date(fechaInicio);
      if (fechaFin) where.fecha.lte = new Date(fechaFin);
    }

    if (estado) where.estado = estado;
    if (vehiculoId) where.vehiculoId = vehiculoId;
    if (conductorId) where.conductorId = conductorId;
    if (rutaId) where.rutaId = rutaId;

    const programaciones = await prisma.programacionRuta.findMany({
      where,
      include: {
        ruta: true,
        vehiculo: true,
        conductor: true,
      },
      orderBy: [{ fecha: "asc" }, { horaSalida: "asc" }],
    });

    const plain = programaciones.map((p) => ({
      id: p.id,
      rutaId: p.rutaId,
      rutaNombre: p.ruta.nombre,
      rutaOrigen: p.ruta.origen,
      rutaDestino: p.ruta.destino,
      distanciaKm: p.ruta.distanciaKm ? parseFloat(p.ruta.distanciaKm.toString()) : null,
      vehiculoId: p.vehiculoId,
      vehiculoPlaca: p.vehiculo.placa,
      vehiculoLabel: `${p.vehiculo.marca} ${p.vehiculo.modelo}`,
      conductorId: p.conductorId,
      conductorNombre: `${p.conductor.nombre} ${p.conductor.apellido}`,
      fecha: p.fecha.toISOString().split("T")[0],
      horaSalida: p.horaSalida,
      horaLlegada: p.horaLlegada,
      estado: p.estado,
      observaciones: p.observaciones,
      creadoEn: p.creadoEn.toISOString(),
    }));

    return NextResponse.json(plain);
  } catch (error: any) {
    console.error("Error al obtener programaciones:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// POST: Crear programación de ruta
export const POST = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json();
      const { rutaId, vehiculoId, conductorId, fecha, horaSalida, horaLlegada, observaciones } = body;

      if (!rutaId || !vehiculoId || !conductorId || !fecha || !horaSalida) {
        return NextResponse.json(
          { error: "Ruta, vehículo, conductor, fecha y hora de salida son requeridos" },
          { status: 400 }
        );
      }

      const prisma = getPrisma();

      // Validar que el vehículo esté operativo
      const vehiculo = await prisma.vehiculo.findUnique({ where: { id: vehiculoId } });
      if (!vehiculo || vehiculo.estado !== "OPERATIVO") {
        return NextResponse.json(
          { error: "El vehículo seleccionado no está operativo" },
          { status: 400 }
        );
      }

      // Verificar conflictos de horario para el vehículo
      const conflictoVehiculo = await prisma.programacionRuta.findFirst({
        where: {
          vehiculoId,
          fecha: new Date(fecha),
          estado: { notIn: ["CANCELADO"] },
          OR: [
            { horaSalida: { lte: horaSalida }, horaLlegada: { gt: horaSalida } },
            { horaSalida: { lte: horaLlegada || "23:59" }, horaLlegada: { gt: horaSalida } },
          ],
        },
      });

      if (conflictoVehiculo) {
        return NextResponse.json(
          { error: "El vehículo ya tiene una programación en ese horario" },
          { status: 400 }
        );
      }

      // Verificar conflictos de horario para el conductor
      const conflictoConductor = await prisma.programacionRuta.findFirst({
        where: {
          conductorId,
          fecha: new Date(fecha),
          estado: { notIn: ["CANCELADO"] },
          OR: [
            { horaSalida: { lte: horaSalida }, horaLlegada: { gt: horaSalida } },
            { horaSalida: { lte: horaLlegada || "23:59" }, horaLlegada: { gt: horaSalida } },
          ],
        },
      });

      if (conflictoConductor) {
        return NextResponse.json(
          { error: "El conductor ya tiene una programación en ese horario" },
          { status: 400 }
        );
      }

      const programacion = await prisma.programacionRuta.create({
        data: {
          rutaId,
          vehiculoId,
          conductorId,
          fecha: new Date(fecha),
          horaSalida,
          horaLlegada: horaLlegada || null,
          observaciones: observaciones || null,
        },
      });

      return NextResponse.json(programacion, { status: 201 });
    } catch (error: any) {
      console.error("Error al crear programación:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredRoles: ["JEFE_OPERACION", "CONTROLADOR_TRANSITO", "ADMINISTRATIVO"] }
);

// PUT: Actualizar programación
export const PUT = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json();
      const { id, vehiculoId, conductorId, fecha, horaSalida, horaLlegada, estado, observaciones } = body;

      if (!id) {
        return NextResponse.json({ error: "ID de programación requerido" }, { status: 400 });
      }

      const prisma = getPrisma();

      const programacion = await prisma.programacionRuta.update({
        where: { id },
        data: {
          vehiculoId: vehiculoId ?? undefined,
          conductorId: conductorId ?? undefined,
          fecha: fecha ? new Date(fecha) : undefined,
          horaSalida: horaSalida ?? undefined,
          horaLlegada: horaLlegada !== undefined ? horaLlegada : undefined,
          estado: estado ?? undefined,
          observaciones: observaciones !== undefined ? observaciones : undefined,
        },
      });

      return NextResponse.json(programacion);
    } catch (error: any) {
      console.error("Error al actualizar programación:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredRoles: ["JEFE_OPERACION", "CONTROLADOR_TRANSITO", "ADMINISTRATIVO"] }
);

// DELETE: Cancelar programación
export const DELETE = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");

      if (!id) {
        return NextResponse.json({ error: "ID de programación requerido" }, { status: 400 });
      }

      const prisma = getPrisma();

      // Solo permitir cancelar si está PROGRAMADO
      const prog = await prisma.programacionRuta.findUnique({ where: { id } });
      if (!prog) {
        return NextResponse.json({ error: "Programación no encontrada" }, { status: 404 });
      }

      if (prog.estado !== "PROGRAMADO") {
        return NextResponse.json(
          { error: "Solo se pueden cancelar programaciones en estado PROGRAMADO" },
          { status: 400 }
        );
      }

      await prisma.programacionRuta.update({
        where: { id },
        data: { estado: "CANCELADO" },
      });

      return NextResponse.json({ message: "Programación cancelada" });
    } catch (error: any) {
      console.error("Error al cancelar programación:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredRoles: ["JEFE_OPERACION", "CONTROLADOR_TRANSITO", "ADMINISTRATIVO"] }
);
