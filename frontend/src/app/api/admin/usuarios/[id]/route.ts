import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

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
