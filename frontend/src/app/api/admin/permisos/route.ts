import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

export const GET = withAuth(async () => {
  try {
    const prisma = getPrisma();

    const permisos = await prisma.permiso.findMany({
      include: {
        usuarios: {
          select: {
            id: true,
            usuarioId: true,
            otorgadoEn: true,
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [{ modulo: "asc" }, { accion: "asc" }],
    });

    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        activo: true,
      },
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json({ permisos, usuarios });
  } catch (error) {
    console.error("Error consultando permisos:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}, { requiredRoles: ["JEFE_PROCESO"] });

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const { usuarioId, permisoId } = await request.json();

    if (!usuarioId || !permisoId) {
      return NextResponse.json(
        { message: "usuarioId y permisoId son requeridos" },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    const permiso = await prisma.permiso.findUnique({ where: { id: permisoId } });
    if (!permiso) {
      return NextResponse.json({ message: "Permiso no encontrado" }, { status: 404 });
    }

    const existing = await prisma.permisoUsuario.findUnique({
      where: { usuarioId_permisoId: { usuarioId, permisoId } },
    });

    if (existing) {
      return NextResponse.json(
        { message: "El usuario ya tiene este permiso asignado" },
        { status: 409 }
      );
    }

    const asignacion = await prisma.permisoUsuario.create({
      data: { usuarioId, permisoId },
    });

    await prisma.auditoria.create({
      data: {
        accion: "CONFIGURAR",
        modulo: "seguridad",
        entidad: "permiso",
        entidadId: permisoId,
        descripcion: `Permiso "${permiso.modulo}:${permiso.accion}" asignado a usuario ${usuario.email}`,
      },
    });

    return NextResponse.json({ message: "Permiso asignado exitosamente", asignacion });
  } catch (error) {
    console.error("Error asignando permiso:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}, { requiredRoles: ["JEFE_PROCESO"] });

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get("usuarioId");
    const permisoId = searchParams.get("permisoId");

    if (!usuarioId || !permisoId) {
      return NextResponse.json(
        { message: "usuarioId y permisoId son requeridos" },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    const existing = await prisma.permisoUsuario.findUnique({
      where: { usuarioId_permisoId: { usuarioId, permisoId } },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Asignación de permiso no encontrada" },
        { status: 404 }
      );
    }

    await prisma.permisoUsuario.delete({
      where: { usuarioId_permisoId: { usuarioId, permisoId } },
    });

    const permiso = await prisma.permiso.findUnique({ where: { id: permisoId } });
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });

    await prisma.auditoria.create({
      data: {
        accion: "CONFIGURAR",
        modulo: "seguridad",
        entidad: "permiso",
        entidadId: permisoId,
        descripcion: `Permiso "${permiso?.modulo}:${permiso?.accion}" removido de usuario ${usuario?.email}`,
      },
    });

    return NextResponse.json({ message: "Permiso removido exitosamente" });
  } catch (error) {
    console.error("Error removiendo permiso:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}, { requiredRoles: ["JEFE_PROCESO"] });
