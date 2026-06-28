import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const prisma = getPrisma();
    
    // 1. Obtener costos fijos prorrateables
    const costosFijos = await prisma.costoFijoProrrateable.findMany({
      orderBy: { creadoEn: "desc" },
    });
    
    // 2. Obtener sumatorias variables de combustibles y mantenimientos completados
    const combustibles = await prisma.ordenCombustible.findMany();
    const mantenimientos = await prisma.ordenMantenimiento.findMany({
      where: { estado: "COMPLETADO" },
    });
    
    const totalCombustible = combustibles.reduce((sum, c) => sum + Number(c.costoTotal), 0);
    const totalMantenimiento = mantenimientos.reduce((sum, m) => sum + Number(m.costoTotal || 0), 0);
    
    return NextResponse.json({
      costosFijos,
      resumenCostos: {
        totalFijo: costosFijos.filter(c => c.activo).reduce((sum, c) => sum + Number(c.montoMensual), 0),
        totalCombustible,
        totalMantenimiento,
      }
    });
  } catch (error: any) {
    console.error("Error al obtener costos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const prisma = getPrisma();
    const body = await request.json();
    
    const { periodo, tipo, descripcion, montoMensual } = body;
    
    if (!periodo || !tipo || !descripcion || !montoMensual) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }
    
    const nuevoCosto = await prisma.costoFijoProrrateable.create({
      data: {
        periodo,
        tipo,
        descripcion,
        montoMensual: Number(montoMensual),
        activo: true,
      },
    });
    
    return NextResponse.json(nuevoCosto, { status: 201 });
  } catch (error: any) {
    console.error("Error al registrar costo fijo:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
