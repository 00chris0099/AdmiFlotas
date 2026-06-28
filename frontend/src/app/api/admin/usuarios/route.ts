import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { generateToken } from "@/lib/tokens";
import { sendEmail, buildConfirmarUsuarioEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const prisma = getPrisma();
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        activo: true,
        telefono: true,
        ultimoAcceso: true,
        creadoEn: true,
      },
      orderBy: { creadoEn: "desc" },
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error("Error listando usuarios:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}, { requiredRoles: ["JEFE_PROCESO"] });

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const { nombre, apellido, email, rol, telefono } = await request.json();

    if (!nombre || !apellido || !email || !rol) {
      return NextResponse.json(
        { message: "Nombre, apellido, email y rol son requeridos" },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    const existing = await prisma.usuario.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "Ya existe un usuario con ese correo" },
        { status: 409 }
      );
    }

    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        email,
        rol,
        telefono: telefono || null,
        activo: false,
        password: null,
      },
    });

    const token = generateToken();
    const expiraEn = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.tokenConfirmacion.create({
      data: {
        usuarioId: usuario.id,
        token,
        tipo: "CONFIRMACION_USUARIO",
        expiraEn,
      },
    });

    const emailContent = buildConfirmarUsuarioEmail(`${nombre} ${apellido}`, token);
    const emailSent = await sendEmail({
      to: email,
      ...emailContent,
    });

    await prisma.auditoria.create({
      data: {
        accion: "CREAR",
        modulo: "seguridad",
        entidad: "usuario",
        entidadId: usuario.id,
        descripcion: `Usuario ${email} creado por admin. Email enviado: ${emailSent}`,
      },
    });

    return NextResponse.json({
      message: emailSent
        ? "Usuario creado. Se envió correo de confirmación."
        : "Usuario creado. No se pudo enviar el correo (configura SMTP).",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
      },
      token: emailSent ? undefined : token,
    });
  } catch (error) {
    console.error("Error creando usuario:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}, { requiredRoles: ["JEFE_PROCESO"] });
