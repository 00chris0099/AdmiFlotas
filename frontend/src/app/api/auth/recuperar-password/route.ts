import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { generateToken } from "@/lib/tokens";
import { sendEmail, buildRecuperarPasswordEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "El correo es requerido" }, { status: 400 });
    }

    const prisma = getPrisma();
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      return NextResponse.json({ message: "Si el correo existe, recibirás un enlace de recuperación." });
    }

    if (!usuario.activo) {
      return NextResponse.json({ message: "Si el correo existe, recibirás un enlace de recuperación." });
    }

    await prisma.tokenConfirmacion.updateMany({
      where: { usuarioId: usuario.id, tipo: "CAMBIO_PASSWORD", usadoEn: null },
      data: { usadoEn: new Date() },
    });

    const token = generateToken();
    const expiraEn = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.tokenConfirmacion.create({
      data: { usuarioId: usuario.id, token, tipo: "CAMBIO_PASSWORD", expiraEn },
    });

    const emailContent = buildRecuperarPasswordEmail(`${usuario.nombre} ${usuario.apellido}`, token);
    await sendEmail({ to: usuario.email, ...emailContent });

    return NextResponse.json({ message: "Si el correo existe, recibirás un enlace de recuperación." });
  } catch (error) {
    console.error("Error recuperando contraseña:", error);
    return NextResponse.json({ message: "Si el correo existe, recibirás un enlace de recuperación." });
  }
}
