import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "./auth";

export interface AuthUser {
  sub: string;
  email: string;
  rol: string;
  nombre: string;
}

type RouteHandler = (
  request: NextRequest,
  context: { user: AuthUser }
) => Promise<NextResponse> | NextResponse;

export function withAuth(
  handler: RouteHandler,
  options?: { requiredRoles?: string[] }
) {
  return async (request: NextRequest) => {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
      const payload = jwt.verify(token, getJwtSecret()) as AuthUser;

      if (options?.requiredRoles && !options.requiredRoles.includes(payload.rol)) {
        return NextResponse.json({ error: "No tiene permisos para esta acción" }, { status: 403 });
      }

      return handler(request, { user: payload });
    } catch {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 });
    }
  };
}
