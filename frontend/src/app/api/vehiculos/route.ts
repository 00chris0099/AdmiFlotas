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
        estado: true,
        anioFabricacion: true,
        tipoCombustible: true,
        capacidadPasajeros: true,
        capacidadCargaKg: true,
        valorAdquisicion: true,
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

export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();
    const {
      clasePatrimonial,
      categoriaPatrimonial,
      secuencial,
      placa,
      marca,
      modelo,
      anioFabricacion,
      color,
      numeroMotor,
      numeroChasis,
      potenciaHp,
      tipoCombustible,
      capacidadCargaKg,
      capacidadPasajeros,
      valorAdquisicion,
      vidaUtilAnios,
      seguroAnual,
      licenciamientoAnual,
      numeroEjes,
      totalLlantas,
      periodicidadMantenimientoKm,
    } = body;

    if (!placa || !marca || !modelo || !anioFabricacion || !tipoCombustible) {
      return NextResponse.json(
        { error: "Placa, marca, modelo, año y tipo de combustible son requeridos" },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    // Verificar placa duplicada
    const existPlaca = await prisma.vehiculo.findUnique({ where: { placa } });
    if (existPlaca) {
      return NextResponse.json({ error: "Ya existe un vehículo con esa placa" }, { status: 400 });
    }

    // Generar código patrimonial
    const clase = clasePatrimonial || "01";
    const catMap: Record<string, string> = { PASAJEROS: "01", CARGA: "02", ESPECIAL: "03" };
    const cat = catMap[categoriaPatrimonial || "PASAJEROS"] || "01";
    const sec = secuencial || String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
    const codigoPatrimonial = `${clase}-${cat}-${sec}`;

    const vehiculo = await prisma.vehiculo.create({
      data: {
        clasePatrimonial: clase,
        categoriaPatrimonial: (categoriaPatrimonial || "PASAJEROS") as any,
        secuencial: sec,
        codigoPatrimonial,
        placa,
        marca,
        modelo,
        anioFabricacion: parseInt(anioFabricacion),
        color: color || null,
        numeroMotor: numeroMotor || null,
        numeroChasis: numeroChasis || null,
        potenciaHp: potenciaHp ? parseInt(potenciaHp) : null,
        tipoCombustible: tipoCombustible as any,
        capacidadCargaKg: capacidadCargaKg ? parseFloat(capacidadCargaKg) : null,
        capacidadPasajeros: capacidadPasajeros ? parseInt(capacidadPasajeros) : null,
        valorAdquisicion: valorAdquisicion ? parseFloat(valorAdquisicion) : null,
        vidaUtilAnios: vidaUtilAnios ? parseInt(vidaUtilAnios) : null,
        seguroAnual: seguroAnual ? parseFloat(seguroAnual) : null,
        licenciamientoAnual: licenciamientoAnual ? parseFloat(licenciamientoAnual) : null,
        numeroEjes: numeroEjes ? parseInt(numeroEjes) : null,
        totalLlantas: totalLlantas ? parseInt(totalLlantas) : 4,
        periodicidadMantenimientoKm: periodicidadMantenimientoKm ? parseInt(periodicidadMantenimientoKm) : 5000,
        estado: "OPERATIVO",
      },
    });

    return NextResponse.json(vehiculo, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear vehículo:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, { requiredRoles: ["JEFE_PROCESO", "ADMINISTRATIVO"] });
