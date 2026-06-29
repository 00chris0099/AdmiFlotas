import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const modulo = searchParams.get("modulo");
    const fechaInicio = searchParams.get("fechaInicio");
    const fechaFin = searchParams.get("fechaFin");

    const prisma = getPrisma();

    const where: any = {};

    if (modulo) {
      where.modulo = modulo;
    }

    if (fechaInicio || fechaFin) {
      where.creadoEn = {};
      if (fechaInicio) {
        where.creadoEn.gte = new Date(fechaInicio);
      }
      if (fechaFin) {
        const finDate = new Date(fechaFin);
        finDate.setHours(23, 59, 59, 999);
        where.creadoEn.lte = finDate;
      }
    }

    const auditorias = await prisma.auditoria.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            rol: true,
          },
        },
      },
      orderBy: { creadoEn: "desc" },
      take: 100,
    });

    return NextResponse.json(auditorias);
  } catch (error) {
    console.error("Error consultando auditorías:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}, { requiredRoles: ["JEFE_PROCESO"] });
