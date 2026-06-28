import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { generateToken } from "@/lib/tokens";
import { sendEmail, buildCambioPasswordEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const prisma = getPrisma();

    const usuario = await prisma.usuario.findUnique({ where: { id: user.sub } });
    if (!usuario) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    await prisma.tokenConfirmacion.updateMany({
      where: {
        usuarioId: usuario.id,
        tipo: "CAMBIO_PASSWORD",
        usadoEn: null,
      },
      data: { usadoEn: new Date() },
    });

    const token = generateToken();
    const expiraEn = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.tokenConfirmacion.create({
      data: {
        usuarioId: usuario.id,
        token,
        tipo: "CAMBIO_PASSWORD",
        expiraEn,
      },
    });

    const emailContent = buildCambioPasswordEmail(user.nombre, token);
    const emailSent = await sendEmail({
      to: usuario.email,
      ...emailContent,
    });

    if (!emailSent) {
      return NextResponse.json(
        { message: "No se pudo enviar el correo. Verifica la configuración SMTP." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Se envió un correo con las instrucciones para cambiar tu contraseña.",
    });
  } catch (error) {
    console.error("Error solicitando cambio de contraseña:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
});
