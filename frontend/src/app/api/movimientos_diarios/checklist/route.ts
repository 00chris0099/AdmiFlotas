import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const prisma = getPrisma();
    const checklists = await prisma.checklistVerificacion.findMany({
      include: {
        movimiento: {
          include: {
            vehiculo: true,
            inspector: true,
          },
        },
      },
      orderBy: {
        fechaRegistro: "desc",
      },
    });

    const formatted = checklists.map((c) => ({
      id: c.id,
      movimientoId: c.movimientoId,
      placa: c.movimiento.vehiculo.placa,
      inspector: c.movimiento.inspector 
        ? `${c.movimiento.inspector.nombre} ${c.movimiento.inspector.apellido}`
        : "Sistema / Conductor",
      fecha: c.fechaRegistro.toISOString().split("T")[0],
      aptoParaOperar: c.aptoParaOperar,
      documentos: c.documentos,
      frenos: c.frenos,
      llantas: c.llantas,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Error al obtener checklists:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
