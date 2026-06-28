import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { verifyPassword, getJwtSecret } from "@/lib/auth";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "El email y la contraseña son requeridos" },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario || !usuario.activo) {
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    if (!usuario.password) {
      return NextResponse.json(
        { message: "Debes confirmar tu cuenta y crear una contraseña. Revisa tu correo." },
        { status: 403 }
      );
    }

    if (usuario.bloqueadoHasta && usuario.bloqueadoHasta > new Date()) {
      const minutesLeft = Math.ceil((usuario.bloqueadoHasta.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { message: `Cuenta bloqueada. Intente de nuevo en ${minutesLeft} minutos` },
        { status: 423 }
      );
    }

    const passwordMatch = await verifyPassword(password, usuario.password!);

    if (!passwordMatch) {
      const newAttempts = usuario.intentosFallidos + 1;
      const updateData: { intentosFallidos: number; bloqueadoHasta?: Date } = {
        intentosFallidos: newAttempts,
      };
      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        updateData.bloqueadoHasta = new Date(Date.now() + LOCKOUT_MINUTES * 60000);
      }
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: updateData,
      });
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { intentosFallidos: 0, bloqueadoHasta: null, ultimoAcceso: new Date() },
    });

    const token = jwt.sign(
      {
        sub: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        nombre: `${usuario.nombre} ${usuario.apellido}`,
      },
      getJwtSecret(),
      { expiresIn: "8h" }
    );

    try {
      await prisma.auditoria.create({
        data: {
          usuarioId: usuario.id,
          accion: "LOGIN",
          modulo: "seguridad",
          entidad: "usuario",
          entidadId: usuario.id,
          descripcion: `Inicio de sesión exitoso para ${usuario.email}`,
        },
      });
    } catch (auditError) {
      console.error("Error al registrar auditoría de login:", auditError);
    }

    return NextResponse.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        licenciaConducir: usuario.licenciaConducir,
      },
    });
  } catch (error: unknown) {
    console.error("Error en endpoint /api/auth/login:", error);
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ message }, { status: 500 });
  }
}
