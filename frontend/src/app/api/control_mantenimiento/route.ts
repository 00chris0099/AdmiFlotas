import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

// GET: Listar todas las órdenes de mantenimiento
export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const prisma = getPrisma();
    const ordenes = await prisma.ordenMantenimiento.findMany({
      include: {
        vehiculo: true,
      },
      orderBy: {
        fechaEmision: "desc",
      },
    });

    const plainOrdenes = ordenes.map((ord) => ({
      id: ord.id,
      numeroOrden: ord.numeroOrden,
      placa: ord.vehiculo.placa,
      tipoMantenimiento: ord.tipoMantenimiento,
      tipoTaller: ord.tipoTaller,
      costoTotal: ord.costoTotal ? parseFloat(ord.costoTotal.toString()) : 0,
      estado: ord.estado,
      firmaEncargadoTaller: ord.firmaEncargadoTaller,
      firmaTecnico: ord.firmaTecnico,
      firmaJefeMantenimiento: ord.firmaJefeMantenimiento,
      fechaFirmaTecnico: ord.fechaFirmaTecnico,
    }));

    return NextResponse.json(plainOrdenes);
  } catch (error: any) {
    console.error("Error al cargar órdenes de mantenimiento:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// POST: Registrar una orden de mantenimiento
export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();
    const {
      numeroOrden,
      vehiculoId,
      tipoMantenimiento,
      tipoTaller,
      descripcionServicio,
      costoManoObraPropia,
      costoPiezasRepuestos,
      costoOtros,
    } = body;

    const prisma = getPrisma();
    const total = parseFloat(costoManoObraPropia || 0) + parseFloat(costoPiezasRepuestos || 0) + parseFloat(costoOtros || 0);

    const nuevaOrden = await prisma.ordenMantenimiento.create({
      data: {
        numeroOrden,
        fechaEmision: new Date(),
        vehiculoId,
        tipoMantenimiento,
        tipoTaller,
        descripcionServicio,
        costoManoObraPropia: parseFloat(costoManoObraPropia || 0),
        costoPiezasRepuestos: parseFloat(costoPiezasRepuestos || 0),
        costoOtros: parseFloat(costoOtros || 0),
        costoTotal: total,
        estado: "PENDIENTE",
        sectorSolicitante: "Mantenimiento Flota",
      },
    });

    return NextResponse.json(nuevaOrden);
  } catch (error: any) {
    console.error("Error al registrar orden de mantenimiento:", error);
    return NextResponse.json({ error: error.message }, { status: 550 });
  }
});

// PUT: Actualizar firma digital de una orden
export const PUT = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();
    const { id, firma, tipoFirma } = body;

    if (!id || !tipoFirma) {
      return NextResponse.json({ error: "Faltan campos: id y tipoFirma son requeridos" }, { status: 400 });
    }

    const camposFirma: Record<string, any> = {};
    if (tipoFirma === "encargado_taller") {
      camposFirma.firmaEncargadoTaller = firma || user.nombre;
    } else if (tipoFirma === "tecnico") {
      camposFirma.firmaTecnico = firma || user.nombre;
      camposFirma.fechaFirmaTecnico = new Date();
    } else if (tipoFirma === "jefe_mantenimiento") {
      camposFirma.firmaJefeMantenimiento = firma || user.nombre;
    } else {
      return NextResponse.json({ error: "tipoFirma inválido. Use: encargado_taller, tecnico, o jefe_mantenimiento" }, { status: 400 });
    }

    const prisma = getPrisma();
    const ordenActualizada = await prisma.ordenMantenimiento.update({
      where: { id },
      data: camposFirma,
    });

    return NextResponse.json(ordenActualizada);
  } catch (error: any) {
    console.error("Error al actualizar firma:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
