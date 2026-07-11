import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir login y APIs de autenticación de forma libre
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes("favicon.ico") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/confirmar-usuario") ||
    pathname.startsWith("/cambiar-password")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("saf_token")?.value;

  // Si no está logueado, redirigir al login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Decodificar el payload del JWT de forma segura en Edge Runtime (sin dependencias Node)
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Token mal formado");
    }
    const payload = JSON.parse(atob(parts[1]));
    const userRole = payload.rol;

    // Control de acceso basado en roles (RBAC)
    // 0. Vehículos (Inventario de Flota)
    if (pathname.startsWith("/vehiculos")) {
      if (
        userRole !== "JEFE_PROCESO" &&
        userRole !== "ADMINISTRATIVO" &&
        userRole !== "ANALISTA"
      ) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    // 1. Configuración & Costos Fijos/Variables (Módulo Administrativo/Settings)
    if (pathname.startsWith("/configuracion")) {
      if (userRole !== "JEFE_PROCESO" && userRole !== "ADMINISTRATIVO") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    if (pathname.startsWith("/control_costos")) {
      if (userRole !== "JEFE_PROCESO" && userRole !== "ADMINISTRATIVO" && userRole !== "ANALISTA") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    // 2. Mantenimiento & Llantas
    if (pathname.startsWith("/control_mantenimiento")) {
      if (
        userRole !== "JEFE_PROCESO" &&
        userRole !== "MECANICO" &&
        userRole !== "ELECTRICISTA" &&
        userRole !== "ADMINISTRATIVO"
      ) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    if (pathname.startsWith("/control_llantas")) {
      if (
        userRole !== "JEFE_PROCESO" &&
        userRole !== "MECANICO" &&
        userRole !== "ELECTRICISTA" &&
        userRole !== "INSPECTOR" &&
        userRole !== "ADMINISTRATIVO"
      ) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    // 3. Operaciones & Conductores & Movimientos Diarios
    if (pathname.startsWith("/movimientos_diarios") || pathname.startsWith("/control_combustible")) {
      if (
        userRole !== "JEFE_PROCESO" &&
        userRole !== "CONDUCTOR" &&
        userRole !== "INSPECTOR" &&
        userRole !== "ANALISTA" &&
        userRole !== "ADMINISTRATIVO"
      ) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    if (pathname.startsWith("/conductores")) {
      if (
        userRole !== "JEFE_PROCESO" &&
        userRole !== "ANALISTA" &&
        userRole !== "ADMINISTRATIVO" &&
        userRole !== "INSPECTOR"
      ) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    // 4. Mantenimiento - Almacén
    if (pathname.startsWith("/mantenimiento/almacen")) {
      if (
        userRole !== "JEFE_PROCESO" &&
        userRole !== "JEFE_MANTENIMIENTO" &&
        userRole !== "ENCARGADO_TALLER" &&
        userRole !== "MECANICO" &&
        userRole !== "ADMINISTRATIVO"
      ) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    // 5. Mantenimiento - Lavado
    if (pathname.startsWith("/mantenimiento/lavado")) {
      if (
        userRole !== "JEFE_PROCESO" &&
        userRole !== "JEFE_MANTENIMIENTO" &&
        userRole !== "LAVADOR" &&
        userRole !== "ADMINISTRATIVO"
      ) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    // 6. Operaciones - Rutas
    if (pathname.startsWith("/operaciones/rutas")) {
      if (
        userRole !== "JEFE_PROCESO" &&
        userRole !== "JEFE_OPERACION" &&
        userRole !== "CONTROLADOR_TRANSITO" &&
        userRole !== "ADMINISTRATIVO"
      ) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    // 7. Flota - Asignación
    if (pathname.startsWith("/flota/asignacion")) {
      if (
        userRole !== "JEFE_PROCESO" &&
        userRole !== "JEFE_OPERACION" &&
        userRole !== "ADMINISTRATIVO"
      ) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    // 8. Flota - Documentos
    if (pathname.startsWith("/flota/documentos")) {
      if (
        userRole !== "JEFE_PROCESO" &&
        userRole !== "ADMINISTRATIVO"
      ) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    // 9. Seguridad - solo JEFE_PROCESO
    if (pathname.startsWith("/seguridad")) {
      if (userRole !== "JEFE_PROCESO") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  } catch (error) {
    console.error("Middleware Auth Decode Error:", error);
    // En caso de token inválido, borrar cookies y redirigir al login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("saf_token");
    response.cookies.delete("saf_role");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas de solicitud excepto las que comiencen con:
     * - api (algunos endpoints específicos de auth)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (icono)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
