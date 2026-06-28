import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

const DEFAULT_METAS = [
  { clave: "CKV_META", valor: "3.50", descripcion: "Costo Máximo de Kilómetro permitido", grupo: "financiero" },
  { clave: "KRP_DIARIO", valor: "50", descripcion: "Kilómetros Parámetro Diario de referencia para IUV", grupo: "operativo" },
  { clave: "HUP_DIARIO", valor: "8", descripcion: "Horas Parámetro Diario de referencia para IUV", grupo: "operativo" },
  { clave: "METAS_MANTENIMIENTO", valor: "5000", descripcion: "Periodicidad estándar de mantenimiento preventivo (Km)", grupo: "mantenimiento" },
];

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const prisma = getPrisma();
    
    // Obtener todas las configuraciones
    let configs = await prisma.configuracionFlota.findMany();
    
    // Si está vacío, inicializar con valores por defecto
    if (configs.length === 0) {
      await prisma.configuracionFlota.createMany({
        data: DEFAULT_METAS,
      });
      configs = await prisma.configuracionFlota.findMany();
    }
    
    // Retornar mapa clave-valor para fácil lectura
    const configMap = configs.reduce((acc: { [key: string]: string }, item) => {
      acc[item.clave] = item.valor;
      return acc;
    }, {});
    
    return NextResponse.json({ configMap, configs });
  } catch (error: any) {
    console.error("Error al obtener configuración:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const prisma = getPrisma();
    const body = await request.json(); // Espera { CKV_META: "3.50", ... }
    
    const updates = Object.entries(body).map(([clave, valor]) => {
      return prisma.configuracionFlota.upsert({
        where: { clave },
        update: { valor: String(valor) },
        create: {
          clave,
          valor: String(valor),
          descripcion: `Configuración de ${clave}`,
          grupo: "general",
        },
      });
    });
    
    await prisma.$transaction(updates);
    
    return NextResponse.json({ message: "Configuraciones actualizadas con éxito" });
  } catch (error: any) {
    console.error("Error al guardar configuración:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
