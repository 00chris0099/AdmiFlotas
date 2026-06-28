import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const prisma = getPrisma();
    const vehiculos = await prisma.vehiculo.findMany({
      select: {
        id: true,
        placa: true,
        marca: true,
        modelo: true,
        codigoPatrimonial: true,
      },
      orderBy: {
        placa: "asc",
      },
    });

    return NextResponse.json(vehiculos);
  } catch (error: any) {
    console.error("Error al obtener vehículos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
