import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (token) {
      try {
        const payload = jwt.verify(token, getJwtSecret()) as { sub: string };
        const prisma = getPrisma();

        await prisma.auditoria.create({
          data: {
            usuarioId: payload.sub,
            accion: "LOGOUT",
            modulo: "seguridad",
            entidad: "usuario",
            entidadId: payload.sub,
            descripcion: "Cierre de sesión",
          },
        });
      } catch {
        // Token already invalid, that's fine
      }
    }

    const response = NextResponse.json({ message: "Sesión cerrada" });
    response.cookies.delete("saf_token");
    response.cookies.delete("saf_role");
    return response;
  } catch (error: unknown) {
    console.error("Error en logout:", error);
    const response = NextResponse.json({ message: "Sesión cerrada" });
    response.cookies.delete("saf_token");
    response.cookies.delete("saf_role");
    return response;
  }
}
