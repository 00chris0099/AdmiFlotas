import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const prisma = getPrisma();
    const body = await request.json();
    const {
      ordenMantenimientoId,
      descripcionTarea,
      horasTrabajadas,
      costoHora,
      nombreTecnico,
    } = body;

    if (!ordenMantenimientoId || !descripcionTarea || !horasTrabajadas || !costoHora) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios para registrar la mano de obra." },
        { status: 400 }
      );
    }

    const subtotal = Number(horasTrabajadas) * Number(costoHora);

    const manoObra = await prisma.detalleManoObra.create({
      data: {
        ordenMantenimientoId,
        descripcionTarea,
        horasTrabajadas: Number(horasTrabajadas),
        costoHora: Number(costoHora),
        subtotal,
        nombreTecnico: nombreTecnico || null,
      },
    });

    return NextResponse.json(manoObra, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear mano de obra:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
