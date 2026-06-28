import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const prisma = getPrisma();
    const conductores = await prisma.usuario.findMany({
      where: {
        rol: "CONDUCTOR",
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        vencimientoLicencia: true,
        licenciaConducir: true,
        categoriaLicencia: true,
        telefono: true,
      },
      orderBy: {
        nombre: "asc",
      },
    });

    // Si no hay conductores explícitos, devolver todos los usuarios activos
    if (conductores.length === 0) {
      const todos = await prisma.usuario.findMany({
        where: { activo: true },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          vencimientoLicencia: true,
          licenciaConducir: true,
          categoriaLicencia: true,
          telefono: true,
        },
      });
      return NextResponse.json(todos);
    }

    return NextResponse.json(conductores);
  } catch (error: any) {
    console.error("Error al obtener conductores:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const prisma = getPrisma();
    const body = await request.json();
    const {
      nombre,
      apellido,
      email,
      licenciaConducir,
      categoriaLicencia,
      vencimientoLicencia,
      telefono,
    } = body;

    if (!nombre || !apellido || !email || !licenciaConducir || !categoriaLicencia || !vencimientoLicencia) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios para registrar el conductor." },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existEmail = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existEmail) {
      return NextResponse.json(
        { error: "El correo electrónico ingresado ya está registrado." },
        { status: 400 }
      );
    }

    // Crear el nuevo conductor
    const nuevoConductor = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        email,
        password: "saf123", // Contraseña inicial por defecto
        rol: "CONDUCTOR",
        activo: true,
        licenciaConducir,
        categoriaLicencia,
        vencimientoLicencia: new Date(vencimientoLicencia),
        telefono: telefono || null,
      },
    });

    return NextResponse.json(nuevoConductor, { status: 201 });
  } catch (error: any) {
    console.error("Error al registrar conductor:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
