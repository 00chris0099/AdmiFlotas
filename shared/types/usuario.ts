// ============================================================
// SAF - Tipos compartidos: Usuario
// ============================================================

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string | null;
  rolId: string;
  activo: boolean;
  telefono: string | null;
  licenciaConducir: string | null;
  categoriaLicencia: string | null;
  vencimientoLicencia: Date | null;
  especialidad: string | null;
  ultimoAcceso: Date | null;
  creadoEn: Date;
  actualizadoEn: Date;
  bloqueadoHasta: Date | null;
  intentosFallidos: number;
  // Relaciones
  rol?: Rol;
}

export interface Rol {
  id: string;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  activo: boolean;
}

export interface Permiso {
  id: string;
  modulo: string;
  accion: string;
  descripcion: string | null;
}

export interface PermisoUsuario {
  id: string;
  usuarioId: string;
  permisoId: string;
}

export interface SesionAuth {
  id: string;
  usuarioId: string;
  token: string;
  ipAddress: string | null;
  userAgent: string | null;
  estado: EstadoSesionAuth;
  iniciadaEn: Date;
  expiraEn: Date;
  cerradaEn: Date | null;
}

export interface Auditoria {
  id: string;
  usuarioId: string | null;
  accion: TipoAccionAuditoria;
  modulo: string;
  entidad: string;
  entidadId: string | null;
  datosAntes: string | null;
  datosDespues: string | null;
  ipAddress: string | null;
  descripcion: string | null;
  creadoEn: Date;
}

export interface TokenConfirmacion {
  id: string;
  usuarioId: string;
  token: string;
  tipo: TipoToken;
  expiraEn: Date;
  usadoEn: Date | null;
  creadoEn: Date;
}

export type EstadoSesionAuth = "ACTIVA" | "EXPIRADA" | "CERRADA" | "BLOQUEADA";
export type TipoAccionAuditoria = "LOGIN" | "LOGOUT" | "CREAR" | "ACTUALIZAR" | "ELIMINAR" | "CONSULTAR" | "EXPORTAR" | "CONFIGURAR" | "ALERTA_MANTENIMIENTO";
export type TipoToken = "CONFIRMACION_USUARIO" | "CAMBIO_PASSWORD";

export type UsuarioCreateInput = Omit<Usuario, "id" | "creadoEn" | "actualizadoEn" | "rol">;
export type UsuarioUpdateInput = Partial<Omit<Usuario, "id" | "creadoEn" | "actualizadoEn">>;

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  rol: string;
  nombre: string;
  apellido: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: Omit<Usuario, "password">;
}

export interface AuthPayload {
  userId: string;
  email: string;
  rol: string;
}
