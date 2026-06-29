import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const prisma = getPrisma();

    const sesiones = await prisma.sesionAuth.findMany({
      where: {
        estado: "ACTIVA",
      },
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
      orderBy: { iniciadaEn: "desc" },
    });

    return NextResponse.json(sesiones);
  } catch (error) {
    console.error("Error consultando sesiones:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}, { requiredRoles: ["JEFE_PROCESO"] });

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const sesionId = searchParams.get("id");

    if (!sesionId) {
      return NextResponse.json({ message: "ID de sesión requerido" }, { status: 400 });
    }

    const prisma = getPrisma();

    const sesion = await prisma.sesionAuth.findUnique({
      where: { id: sesionId },
    });

    if (!sesion) {
      return NextResponse.json({ message: "Sesión no encontrada" }, { status: 404 });
    }

    await prisma.sesionAuth.update({
      where: { id: sesionId },
      data: {
        estado: "CERRADA",
        cerradaEn: new Date(),
      },
    });

    return NextResponse.json({ message: "Sesión cerrada exitosamente" });
  } catch (error) {
    console.error("Error cerrando sesión:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}, { requiredRoles: ["JEFE_PROCESO"] });
