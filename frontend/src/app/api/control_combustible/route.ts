import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

// GET: Listar todas las órdenes de combustible con relaciones reales
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
      placa: ord.vehiculo.placa,
      vehiculoLabel: `${ord.vehiculo.marca} ${ord.vehiculo.modelo}`,
      vehiculoId: ord.vehiculoId,
      conductor: `${ord.conductor.nombre} ${ord.conductor.apellido}`,
      cantidadGalones: ord.cantidadGalones ? parseFloat(ord.cantidadGalones.toString()) : 0,
      costoTotal: parseFloat(ord.costoTotal.toString()),
      kilometrajeActual: ord.kilometrajeActual,
      servicentro: ord.nombreServiccentro || "Servicentro Acreditado",
      tipoCombustible: ord.tipoCombustible,
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
      tipoCombustible,
      cantidadGalones,
      costoGalon,
      kilometrajeActual,
      nombreServiccentro,
      incluyeAceiteMotor,
      cantidadAceiteMotorLt,
    } = body;

    const prisma = getPrisma();

    // 1. Validaciones básicas
    if (!numeroOrden || !vehiculoId || !conductorId || !cantidadGalones || !costoGalon || !kilometrajeActual) {
      return NextResponse.json({ error: "Faltan campos obligatorios para registrar el abastecimiento." }, { status: 400 });
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
    
    // Costo adicional estimado de aceite
    const totalOrden = incluyeAceiteMotor 
      ? totalCombustible + (parseFloat(cantidadAceiteMotorLt || 0) * 35) 
      : totalCombustible;

    const nuevaOrden = await prisma.ordenCombustible.create({
      data: {
        numeroOrden,
        fecha: new Date(),
        vehiculoId,
        conductorId,
        sectorSolicitante: "Operaciones Generales",
        tipoCombustible: tipoCombustible || "DIESEL",
        cantidadGalones: galones,
        costoGalon: precioUnitario,
        costoCombustible: totalCombustible,
        costoTotal: totalOrden,
        kilometrajeActual: odoActual,
        nombreServiccentro: nombreServiccentro || "Servicentro Acreditado",
        incluyeAceiteMotor: incluyeAceiteMotor || false,
        cantidadAceiteMotorLt: incluyeAceiteMotor ? parseFloat(cantidadAceiteMotorLt) : null,
      },
    });

    return NextResponse.json(nuevaOrden, { status: 201 });
  } catch (error: any) {
    console.error("Error al registrar combustible:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
});
