import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(request.url);
    const vehiculoId = searchParams.get("vehiculoId");

    const prisma = getPrisma();
    
    const whereClause: any = {
      estado: { not: "DADA_DE_BAJA" }
    };
    
    if (vehiculoId) {
      whereClause.vehiculoId = vehiculoId;
    }

    const llantas = await prisma.controlLlanta.findMany({
      where: whereClause,
      include: {
        vehiculo: true,
      },
      orderBy: {
        posicionVehiculo: "asc",
      },
    });

    const plainLlantas = llantas.map((ll) => ({
      id: ll.id,
      codigoEps: ll.codigoEps,
      placaVehiculo: ll.vehiculo.placa,
      vehiculoId: ll.vehiculoId,
      posicion: ll.posicionVehiculo,
      descripcionPosicion: ll.descripcionPosicion || `Posición ${ll.posicionVehiculo}`,
      fabricante: ll.fabricante,
      dimension: ll.dimension,
      modeloLlanta: ll.modeloLlanta,
      kilometrajeAcumulado: ll.kilometrajeAcumulado || 0,
      vecesReencauchada: ll.vecesReencauchada || 0,
      estado: ll.estado,
    }));

    return NextResponse.json(plainLlantas);
  } catch (error: any) {
    console.error("Error al obtener llantas:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();
    const {
      codigoEps,
      vehiculoId,
      posicionVehiculo,
      descripcionPosicion,
      fabricante,
      dimension,
      modeloLlanta,
      costoAdquisicion,
      kilometrajeInstalacion,
    } = body;

    const prisma = getPrisma();
    
    // Validar si la posición ya está ocupada por otra llanta en uso
    const posicionOcupada = await prisma.controlLlanta.findFirst({
      where: {
        vehiculoId,
        posicionVehiculo: parseInt(posicionVehiculo),
        estado: "EN_USO",
      }
    });

    if (posicionOcupada && parseInt(posicionVehiculo) !== 7) { // 7 es repuesto, asumimos que puede variar o no
      return NextResponse.json({ error: `La posición ${posicionVehiculo} ya está ocupada por la llanta ${posicionOcupada.codigoEps}` }, { status: 400 });
    }

    const nuevaLlanta = await prisma.controlLlanta.create({
      data: {
        codigoEps,
        vehiculoId,
        posicionVehiculo: parseInt(posicionVehiculo),
        descripcionPosicion: descripcionPosicion || `Posición ${posicionVehiculo}`,
        fabricante,
        dimension,
        modeloLlanta,
        costoAdquisicion: parseFloat(costoAdquisicion || 0),
        fechaInstalacion: new Date(),
        kilometrajeInstalacion: parseInt(kilometrajeInstalacion || 0),
        kilometrajeAcumulado: 0,
        vecesReencauchada: 0,
        estado: "EN_USO",
      },
    });

    return NextResponse.json(nuevaLlanta);
  } catch (error: any) {
    console.error("Error al registrar llanta:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const PATCH = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();
    const { action, llantaId1, llantaId2, llantaId } = body;

    const prisma = getPrisma();

    if (action === "ROTAR") {
      if (!llantaId1 || !llantaId2) {
        return NextResponse.json({ error: "Faltan IDs de las llantas a rotar" }, { status: 400 });
      }

      const result = await prisma.$transaction(async (tx) => {
        const ll1 = await tx.controlLlanta.findUnique({ where: { id: llantaId1 } });
        const ll2 = await tx.controlLlanta.findUnique({ where: { id: llantaId2 } });

        if (!ll1 || !ll2) {
          throw new Error("Una o ambas llantas no existen");
        }

        // Intercambiar posiciones
        await tx.controlLlanta.update({
          where: { id: llantaId1 },
          data: {
            posicionVehiculo: ll2.posicionVehiculo,
            descripcionPosicion: ll2.descripcionPosicion,
          },
        });

        await tx.controlLlanta.update({
          where: { id: llantaId2 },
          data: {
            posicionVehiculo: ll1.posicionVehiculo,
            descripcionPosicion: ll1.descripcionPosicion,
          },
        });

        return { message: "Rotación completada con éxito" };
      });

      return NextResponse.json(result);
    }

    if (action === "REENCAUCHAR") {
      if (!llantaId) {
        return NextResponse.json({ error: "Falta ID de la llanta" }, { status: 400 });
      }

      const llantaActualizada = await prisma.controlLlanta.update({
        where: { id: llantaId },
        data: {
          vecesReencauchada: { increment: 1 },
          // Opcionalmente se puede disminuir el desgaste relativo
          estado: "EN_USO",
        },
      });

      return NextResponse.json(llantaActualizada);
    }

    if (action === "DAR_DE_BAJA") {
      if (!llantaId) {
        return NextResponse.json({ error: "Falta ID de la llanta" }, { status: 400 });
      }

      const llantaDadaBaja = await prisma.controlLlanta.update({
        where: { id: llantaId },
        data: {
          estado: "DADA_DE_BAJA",
          posicionVehiculo: 0, // Desmontada
          fechaRetiro: new Date(),
        },
      });

      return NextResponse.json(llantaDadaBaja);
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error: any) {
    console.error("Error al actualizar llanta:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
