import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

export const PUT = withAuth(async (request: NextRequest, { user }) => {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ message: "ID requerido" }, { status: 400 });
    }

    const body = await request.json();
    const prisma = getPrisma();

    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    // No permitir cambiar el email del superadmin
    if (usuario.email === "anchillo00@gmail.com" && body.email && body.email !== usuario.email) {
      return NextResponse.json({ message: "No se puede cambiar el email del superadmin" }, { status: 403 });
    }

    const updated = await prisma.usuario.update({
      where: { id },
      data: {
        ...(body.nombre && { nombre: body.nombre }),
        ...(body.apellido && { apellido: body.apellido }),
        ...(body.email && { email: body.email }),
        ...(body.rol && { rol: body.rol }),
        ...(body.telefono !== undefined && { telefono: body.telefono || null }),
        ...(body.activo !== undefined && { activo: body.activo }),
        ...(body.especialidad !== undefined && { especialidad: body.especialidad || null }),
        ...(body.licenciaConducir !== undefined && { licenciaConducir: body.licenciaConducir || null }),
        ...(body.categoriaLicencia !== undefined && { categoriaLicencia: body.categoriaLicencia || null }),
        ...(body.vencimientoLicencia !== undefined && { vencimientoLicencia: body.vencimientoLicencia ? new Date(body.vencimientoLicencia) : null }),
      },
    });

    await prisma.auditoria.create({
      data: {
        accion: "ACTUALIZAR",
        modulo: "seguridad",
        entidad: "usuario",
        entidadId: id,
        descripcion: `Usuario ${usuario.email} actualizado por ${user.email}`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}, { requiredRoles: ["JEFE_PROCESO"] });

export const DELETE = withAuth(async (request: NextRequest, { user }) => {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ message: "ID requerido" }, { status: 400 });
    }

    const prisma = getPrisma();

    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    if (usuario.email === "anchillo00@gmail.com") {
      return NextResponse.json({ message: "No se puede eliminar al superadmin" }, { status: 403 });
    }

    await prisma.usuario.delete({ where: { id } });

    await prisma.auditoria.create({
      data: {
        accion: "ELIMINAR",
        modulo: "seguridad",
        entidad: "usuario",
        entidadId: id,
        descripcion: `Usuario ${usuario.email} eliminado por ${user.email}`,
      },
    });

    return NextResponse.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}, { requiredRoles: ["JEFE_PROCESO"] });
