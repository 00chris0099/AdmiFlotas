import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

// GET: Listar todas las órdenes de combustible (MA 122 01 02)
export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const prisma = getPrisma();
    const ordenes = await prisma.ordenCombustible.findMany({
      include: {
        vehiculo: true,
        conductor: true,
      },
      orderBy: {
        fecha: "desc",
      },
    });

    const plainOrdenes = ordenes.map((ord) => ({
      id: ord.id,
      numeroOrden: ord.numeroOrden,
      fecha: ord.fecha.toISOString().split("T")[0],
      codigoPatrimonial: ord.vehiculo.codigoPatrimonial,
      placa: ord.vehiculo.placa,
      vehiculoLabel: `${ord.vehiculo.marca} ${ord.vehiculo.modelo}`,
      vehiculoId: ord.vehiculoId,
      conductor: `${ord.conductor.nombre} ${ord.conductor.apellido}`,
      conductorId: ord.conductorId,
      sectorSolicitante: ord.sectorSolicitante,
      localidadSolicitante: ord.localidadSolicitante || "",
      tipoCombustible: ord.tipoCombustible,
      cantidadGalones: ord.cantidadGalones ? parseFloat(ord.cantidadGalones.toString()) : 0,
      costoGalon: ord.costoGalon ? parseFloat(ord.costoGalon.toString()) : 0,
      costoTotal: parseFloat(ord.costoTotal.toString()),
      kilometrajeActual: ord.kilometrajeActual,
      nombreServiccentro: ord.nombreServiccentro || "",
      numeroTicketServiccentro: ord.numeroTicketServiccentro || "",
      responsableServiccentro: ord.responsableServiccentro || "",
      selloServiccentro: ord.selloServiccentro,
      incluyeAceiteMotor: ord.incluyeAceiteMotor,
      cantidadAceiteMotorLt: ord.cantidadAceiteMotorLt ? parseFloat(ord.cantidadAceiteMotorLt.toString()) : 0,
      firmaEncargadoGaraje: ord.firmaEncargadoGaraje || "",
      firmaConductor: ord.firmaConductor || "",
      firmaServicentro: ord.firmaServicentro || "",
    }));

    return NextResponse.json(plainOrdenes);
  } catch (error: any) {
    console.error("Error al obtener ordenes de combustible:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// POST: Registrar abastecimiento de combustible (MA 122 01 02)
export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();
    const {
      numeroOrden,
      vehiculoId,
      conductorId,
      sectorSolicitante,
      localidadSolicitante,
      tipoCombustible,
      cantidadGalones,
      costoGalon,
      kilometrajeActual,
      nombreServiccentro,
      numeroTicketServiccentro,
      responsableServiccentro,
      selloServiccentro,
      incluyeAceiteMotor,
      cantidadAceiteMotorLt,
      firmaEncargadoGaraje,
      firmaConductor,
      firmaServicentro,
    } = body;

    const prisma = getPrisma();

    // 1. Validaciones básicas
    if (!numeroOrden || !vehiculoId || !conductorId || !kilometrajeActual) {
      return NextResponse.json({ error: "Faltan campos obligatorios: N° Orden, Vehículo, Conductor y Kilometraje son requeridos." }, { status: 400 });
    }

    // Validar firmas requeridas
    if (!firmaEncargadoGaraje || !firmaConductor) {
      return NextResponse.json({ error: "Las firmas del Encargado del Garaje y del Conductor son obligatorias." }, { status: 400 });
    }

    const odoActual = parseInt(kilometrajeActual);

    // 2. Validar odómetro coherente
    const ultimoViaje = await prisma.movimientoDiario.findFirst({
      where: {
        vehiculoId,
        estado: "COMPLETADO"
      },
      orderBy: {
        fecha: "desc"
      }
    });

    if (ultimoViaje && ultimoViaje.kilometrajeLlegada && odoActual < ultimoViaje.kilometrajeLlegada) {
      return NextResponse.json({
        error: `Inconsistencia: El odómetro ingresado (${odoActual} km) no puede ser menor al odómetro del último viaje finalizado (${ultimoViaje.kilometrajeLlegada} km).`
      }, { status: 400 });
    }

    const galones = parseFloat(cantidadGalones) || 0;
    const precioUnitario = parseFloat(costoGalon) || 0;
    const totalCombustible = galones * precioUnitario;

    const totalOrden = incluyeAceiteMotor
      ? totalCombustible + (parseFloat(cantidadAceiteMotorLt || 0) * 35)
      : totalCombustible;

    const nuevaOrden = await prisma.ordenCombustible.create({
      data: {
        numeroOrden,
        fecha: new Date(),
        vehiculoId,
        conductorId,
        sectorSolicitante: sectorSolicitante || "Operaciones Generales",
        localidadSolicitante: localidadSolicitante || null,
        tipoCombustible: tipoCombustible || "DIESEL",
        cantidadGalones: galones || null,
        costoGalon: precioUnitario || null,
        costoCombustible: totalCombustible || null,
        costoTotal: totalOrden,
        kilometrajeActual: odoActual,
        nombreServiccentro: nombreServiccentro || null,
        numeroTicketServiccentro: numeroTicketServiccentro || null,
        responsableServiccentro: responsableServiccentro || null,
        selloServiccentro: selloServiccentro || false,
        incluyeAceiteMotor: incluyeAceiteMotor || false,
        cantidadAceiteMotorLt: incluyeAceiteMotor ? parseFloat(cantidadAceiteMotorLt || 0) : null,
        firmaEncargadoGaraje: firmaEncargadoGaraje || null,
        firmaConductor: firmaConductor || null,
        firmaServicentro: firmaServicentro || null,
      },
    });

    // Actualizar odómetro del vehículo si el campo existe
    // Nota: El campo kilometrajeActual no existe en el schema actual del Vehiculo
    // Se puede agregar si es necesario para el seguimiento de odómetro

    return NextResponse.json(nuevaOrden, { status: 201 });
  } catch (error: any) {
    console.error("Error al registrar combustible:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
});
