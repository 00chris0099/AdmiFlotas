import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { validatePassword } from "@/lib/tokens";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const validation = validatePassword(password);
    if (!validation.valid) {
      return NextResponse.json(
        { message: "La contraseña no cumple los requisitos", errors: validation.errors },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    const tokenRecord = await prisma.tokenConfirmacion.findUnique({
      where: { token },
      include: { usuario: true },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { message: "Token inválido" },
        { status: 400 }
      );
    }

    if (tokenRecord.tipo !== "CAMBIO_PASSWORD") {
      return NextResponse.json(
        { message: "Token inválido" },
        { status: 400 }
      );
    }

    if (tokenRecord.usadoEn) {
      return NextResponse.json(
        { message: "Este token ya fue utilizado" },
        { status: 400 }
      );
    }

    if (tokenRecord.expiraEn < new Date()) {
      return NextResponse.json(
        { message: "Este token ha expirado. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    await prisma.$transaction([
      prisma.usuario.update({
        where: { id: tokenRecord.usuarioId },
        data: {
          password: hashedPassword,
          intentosFallidos: 0,
          bloqueadoHasta: null,
        },
      }),
      prisma.tokenConfirmacion.update({
        where: { id: tokenRecord.id },
        data: { usadoEn: new Date() },
      }),
    ]);

    await prisma.auditoria.create({
      data: {
        usuarioId: tokenRecord.usuarioId,
        accion: "ACTUALIZAR",
        modulo: "seguridad",
        entidad: "usuario",
        entidadId: tokenRecord.usuarioId,
        descripcion: `Contraseña cambiada para ${tokenRecord.usuario.email}`,
      },
    });

    return NextResponse.json({
      message: "Contraseña actualizada correctamente. Ya puedes iniciar sesión.",
    });
  } catch (error) {
    console.error("Error cambiando contraseña:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
