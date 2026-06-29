import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo");
    const id = searchParams.get("id");

    if (!tipo || !id) {
      return NextResponse.json({ error: "Se requieren los parametros 'tipo' e 'id'." }, { status: 400 });
    }

    const prisma = getPrisma();

    if (tipo === "movimiento_diario") {
      const movimiento = await prisma.movimientoDiario.findUnique({
        where: { id },
        include: { vehiculo: true, conductor: true, checklist: true },
      });

      if (!movimiento) {
        return NextResponse.json({ error: "Movimiento no encontrado." }, { status: 404 });
      }

      return NextResponse.json({
        id: movimiento.id,
        fecha: movimiento.fecha.toISOString().split("T")[0],
        vehiculo: `${movimiento.vehiculo.marca} ${movimiento.vehiculo.modelo}`,
        placa: movimiento.vehiculo.placa,
        conductor: `${movimiento.conductor.nombre} ${movimiento.conductor.apellido}`,
        destino: movimiento.destino,
        kilometrajeSalida: movimiento.kilometrajeSalida,
        kilometrajeLlegada: movimiento.kilometrajeLlegada,
        horasUtilizacion: movimiento.horasUtilizacion ? parseFloat(movimiento.horasUtilizacion.toString()) : null,
        estado: movimiento.estado,
        documentos: movimiento.checklist?.documentos,
        aceiteMotor: movimiento.checklist?.aceiteMotor,
        agua: movimiento.checklist?.agua,
        bateria: movimiento.checklist?.bateria,
        frenos: movimiento.checklist?.frenos,
        embrague: movimiento.checklist?.embrague,
        fajas: movimiento.checklist?.fajas,
        faros: movimiento.checklist?.faros,
        lunas: movimiento.checklist?.lunas,
        plumillas: movimiento.checklist?.plumillas,
        llantas: movimiento.checklist?.llantas,
        espejos: movimiento.checklist?.espejos,
        herramientas: movimiento.checklist?.herramientas,
        extintorBotiquin: movimiento.checklist?.extintorBotiquin,
        manchasFugas: movimiento.checklist?.manchasFugas,
        firmaConductor: movimiento.firmaConductor,
        firmaInspector: movimiento.firmaInspector,
        firmaEncargadoGaraje: movimiento.firmaEncargadoGaraje,
        fechaFirmaConductor: movimiento.fechaFirmaConductor?.toISOString() || null,
        fechaFirmaInspector: movimiento.fechaFirmaInspector?.toISOString() || null,
      });
    }

    if (tipo === "orden_abastecimiento") {
      const orden = await prisma.ordenCombustible.findUnique({
        where: { id },
        include: { vehiculo: true, conductor: true },
      });

      if (!orden) {
        return NextResponse.json({ error: "Orden no encontrada." }, { status: 404 });
      }

      return NextResponse.json({
        id: orden.id,
        numeroOrden: orden.numeroOrden,
        fecha: orden.fecha.toISOString().split("T")[0],
        codigoPatrimonial: orden.vehiculo.codigoPatrimonial,
        placa: orden.vehiculo.placa,
        vehiculoLabel: `${orden.vehiculo.marca} ${orden.vehiculo.modelo}`,
        conductor: `${orden.conductor.nombre} ${orden.conductor.apellido}`,
        sectorSolicitante: orden.sectorSolicitante,
        localidadSolicitante: orden.localidadSolicitante || "",
        tipoCombustible: orden.tipoCombustible,
        cantidadGalones: orden.cantidadGalones ? parseFloat(orden.cantidadGalones.toString()) : 0,
        costoGalon: orden.costoGalon ? parseFloat(orden.costoGalon.toString()) : 0,
        costoTotal: parseFloat(orden.costoTotal.toString()),
        kilometrajeActual: orden.kilometrajeActual,
        nombreServiccentro: orden.nombreServiccentro || "",
        numeroTicketServiccentro: orden.numeroTicketServiccentro || "",
        responsableServiccentro: orden.responsableServiccentro || "",
        selloServiccentro: orden.selloServiccentro,
        incluyeAceiteMotor: orden.incluyeAceiteMotor,
        cantidadAceiteMotorLt: orden.cantidadAceiteMotorLt ? parseFloat(orden.cantidadAceiteMotorLt.toString()) : 0,
        firmaEncargadoGaraje: orden.firmaEncargadoGaraje || "",
        firmaConductor: orden.firmaConductor || "",
        firmaServicentro: orden.firmaServicentro || "",
      });
    }

    if (tipo === "orden_mantenimiento") {
      const orden = await prisma.ordenMantenimiento.findUnique({
        where: { id },
        include: { vehiculo: true, manoDeObra: true },
      });

      if (!orden) {
        return NextResponse.json({ error: "Orden no encontrada." }, { status: 404 });
      }

      return NextResponse.json({
        id: orden.id,
        numeroOrden: orden.numeroOrden,
        fecha: orden.fechaEmision.toISOString().split("T")[0],
        placa: orden.vehiculo.placa,
        vehiculoLabel: `${orden.vehiculo.marca} ${orden.vehiculo.modelo}`,
        tipoMantenimiento: orden.tipoMantenimiento,
        tipoTaller: orden.tipoTaller,
        descripcionServicio: orden.descripcionServicio,
        sectorSolicitante: orden.sectorSolicitante || "",
        costoManoObraPropia: orden.costoManoObraPropia ? parseFloat(orden.costoManoObraPropia.toString()) : 0,
        costoPiezasRepuestos: orden.costoPiezasRepuestos ? parseFloat(orden.costoPiezasRepuestos.toString()) : 0,
        costoOtros: orden.costoOtros ? parseFloat(orden.costoOtros.toString()) : 0,
        costoTotal: orden.costoTotal ? parseFloat(orden.costoTotal.toString()) : 0,
        estado: orden.estado,
        firmaEncargadoTaller: orden.firmaEncargadoTaller,
        firmaTecnico: orden.firmaTecnico,
        firmaJefeMantenimiento: orden.firmaJefeMantenimiento,
        fechaFirmaTecnico: orden.fechaFirmaTecnico?.toISOString() || null,
        manoDeObra: orden.manoDeObra.map((mo) => ({
          id: mo.id,
          descripcionTarea: mo.descripcionTarea,
          horasTrabajadas: parseFloat(mo.horasTrabajadas.toString()),
          costoHora: parseFloat(mo.costoHora.toString()),
          subtotal: parseFloat(mo.subtotal.toString()),
          nombreTecnico: mo.nombreTecnico || "",
        })),
      });
    }

    return NextResponse.json({ error: `Tipo de formulario no valido: ${tipo}` }, { status: 400 });
  } catch (error: any) {
    console.error("Error al obtener datos para PDF:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
