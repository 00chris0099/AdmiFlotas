// ============================================================
// SAF Frontend - API Client para comunicarse con el Backend
// ============================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

// Client-side flatten: convierte objetos Prisma anidados a strings primitivos
// para evitar React error #31 (Objects are not valid as React child)
function safeStr(v: any): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") return v.codigo ?? v.nombre ?? v.placa ?? v.email ?? v.label ?? "";
  return String(v);
}

function flattenResponse(obj: any): any {
  if (obj == null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(flattenResponse);
  if (obj instanceof Date) return obj.toISOString();

  const LOOKUP_KEYS = new Set(["marca", "modelo", "color", "tipoCombustible", "estado",
    "categoriaVehiculo", "sectorOrganizacional", "fabricante", "dimension", "tipoLavado",
    "rol", "centroServicio", "sectorSolicitante"]);
  const PRESERVE_KEYS = new Set(["vehiculo"]);

  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      if (LOOKUP_KEYS.has(key)) {
        result[key] = safeStr(value);
      } else if (key === "vehiculo") {
        const v = flattenResponse(value);
        result[key] = v;
        result.vehiculoLabel = `${safeStr(v.marca)} ${safeStr(v.modelo)}`.trim();
        result.placa = v.placa ?? "";
        result.marcaVehiculo = safeStr(v.marca);
        result.modeloVehiculo = safeStr(v.modelo);
        result.codigoPatrimonial = v.codigoPatrimonial ?? "";
      } else if (PRESERVE_KEYS.has(key)) {
        result[key] = flattenResponse(value);
      } else if ("id" in value && ("nombre" in value || "codigo" in value)) {
        // Cualquier objeto con id+nombre → extraer string (sin límite de campos)
        result[key] = safeStr(value);
      } else {
        result[key] = flattenResponse(value);
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("saf_token", token);
    } else {
      localStorage.removeItem("saf_token");
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("saf_token");
    }
    return this.token;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMs: number = 15000
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Timeout con AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        let errorMsg = `Error ${res.status}`;
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch {
          // Respuesta no-JSON (ej: HTML de proxy/gateway)
          if (res.status === 502 || res.status === 503) {
            errorMsg = "Servidor no disponible. Intente nuevamente.";
          }
        }

        if (res.status === 401 && !endpoint.includes("/auth/login")) {
          this.setToken(null);
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
        throw new Error(errorMsg);
      }

      if (res.status === 204) return undefined as T;

      const data = await res.json();
      const payload = data.data ?? data;
      return flattenResponse(payload) as T;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new Error("Tiempo de espera agotado. Verifique su conexión.");
      }
      if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
        throw new Error("Error de conexión. Verifique su red.");
      }
      throw err;
    }
  }

  // ─── Auth ───
  async login(email: string, password: string) {
    const data = await this.request<{ token: string; usuario: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async logout() {
    await this.request("/auth/logout", { method: "POST" });
    this.setToken(null);
  }

  async getMe() {
    return this.request("/auth/me");
  }

  // ─── Usuarios ───
  async getUsuarios(params?: { page?: number; limit?: number; search?: string; rolId?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.rolId) query.set("rolId", params.rolId);
    return this.request(`/admin/usuarios?${query}`);
  }

  async createUsuario(data: any) {
    return this.request("/admin/usuarios", { method: "POST", body: JSON.stringify(data) });
  }

  async updateUsuario(id: string, data: any) {
    return this.request(`/admin/usuarios/${id}`, { method: "PUT", body: JSON.stringify(data) });
  }

  async deleteUsuario(id: string) {
    return this.request(`/admin/usuarios/${id}`, { method: "DELETE" });
  }

  // ─── Vehículos ───
  async getVehiculos(params?: { page?: number; limit?: number; search?: string; estadoId?: string; marcaId?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.estadoId) query.set("estadoId", params.estadoId);
    if (params?.marcaId) query.set("marcaId", params.marcaId);
    return this.request(`/vehiculos?${query}`);
  }

  async getVehiculo(id: string) {
    return this.request(`/vehiculos/${id}`);
  }

  async createVehiculo(data: any) {
    return this.request("/vehiculos", { method: "POST", body: JSON.stringify(data) });
  }

  async updateVehiculo(id: string, data: any) {
    return this.request(`/vehiculos/${id}`, { method: "PUT", body: JSON.stringify(data) });
  }

  async deleteVehiculo(id: string) {
    return this.request(`/vehiculos/${id}`, { method: "DELETE" });
  }

  // ─── Movimientos Diarios ───
  async getMovimientos(params?: { page?: number; limit?: number; vehiculoId?: string; conductorId?: string; estado?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.vehiculoId) query.set("vehiculoId", params.vehiculoId);
    if (params?.conductorId) query.set("conductorId", params.conductorId);
    if (params?.estado) query.set("estado", params.estado);
    return this.request(`/movimientos_diarios?${query}`);
  }

  async createMovimiento(data: any) {
    return this.request("/movimientos_diarios", { method: "POST", body: JSON.stringify(data) });
  }

  async updateMovimiento(id: string, data: any) {
    return this.request(`/movimientos_diarios/${id}`, { method: "PUT", body: JSON.stringify(data) });
  }

  async deleteMovimiento(id: string) {
    return this.request(`/movimientos_diarios/${id}`, { method: "DELETE" });
  }

  async getChecklists() {
    return this.request("/movimientos_diarios/checklist");
  }

  // ─── Combustible ───
  async getOrdenesCombustible(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    return this.request(`/control_combustible?${query}`);
  }

  async createOrdenCombustible(data: any) {
    return this.request("/control_combustible", { method: "POST", body: JSON.stringify(data) });
  }

  async updateOrdenCombustible(id: string, data: any) {
    return this.request(`/control_combustible/${id}`, { method: "PUT", body: JSON.stringify(data) });
  }

  async deleteOrdenCombustible(id: string) {
    return this.request(`/control_combustible/${id}`, { method: "DELETE" });
  }

  // ─── Mantenimiento ───
  async getOrdenesMantenimiento(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    return this.request(`/control_mantenimiento?${query}`);
  }

  async createOrdenMantenimiento(data: any) {
    return this.request("/control_mantenimiento", { method: "POST", body: JSON.stringify(data) });
  }

  async updateOrdenMantenimiento(id: string, data: any) {
    return this.request(`/control_mantenimiento/${id}`, { method: "PUT", body: JSON.stringify(data) });
  }

  async deleteOrdenMantenimiento(id: string) {
    return this.request(`/control_mantenimiento/${id}`, { method: "DELETE" });
  }

  async addManoDeObra(data: any) {
    return this.request("/control_mantenimiento/mano-obra", { method: "POST", body: JSON.stringify(data) });
  }

  async deleteManoDeObra(id: string) {
    return this.request(`/control_mantenimiento/mano-obra/${id}`, { method: "DELETE" });
  }

  // ─── Llantas ───
  async getControlLlantas(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    return this.request(`/control_llantas?${query}`);
  }

  async createControlLlanta(data: any) {
    return this.request("/control_llantas", { method: "POST", body: JSON.stringify(data) });
  }

  async rotarLlantas(llantaId1: string, llantaId2: string) {
    return this.request("/control_llantas", {
      method: "PATCH",
      body: JSON.stringify({ action: "ROTAR", llantaId1, llantaId2 }),
    });
  }

  async reencaucharLlanta(llantaId: string) {
    return this.request("/control_llantas", {
      method: "PATCH",
      body: JSON.stringify({ action: "REENCAUCHAR", llantaId }),
    });
  }

  async bajaLlanta(llantaId: string) {
    return this.request("/control_llantas", {
      method: "PATCH",
      body: JSON.stringify({ action: "DAR_DE_BAJA", llantaId }),
    });
  }

  // ─── Costos ───
  async getKpis() {
    return this.request("/control_costos/reportes-kpi");
  }

  async getCostos(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    return this.request(`/control_costos/costos-fijo-variable?${query}`);
  }

  async createCosto(data: any) {
    return this.request("/control_costos/costos-fijo-variable", { method: "POST", body: JSON.stringify(data) });
  }

  async deleteCosto(id: string) {
    return this.request(`/control_costos/costos-fijo-variable/${id}`, { method: "DELETE" });
  }

  async getSustitucion() {
    return this.request("/control_costos/sustitucion");
  }

  // ─── Flota ───
  async getAsignaciones() {
    return this.request("/flota/asignacion");
  }

  async createAsignacion(data: any) {
    return this.request("/flota/asignacion", { method: "POST", body: JSON.stringify(data) });
  }

  async updateAsignacion(id: string, data: any) {
    return this.request(`/flota/asignacion/${id}`, { method: "PUT", body: JSON.stringify(data) });
  }

  async deleteAsignacion(id: string) {
    return this.request(`/flota/asignacion/${id}`, { method: "DELETE" });
  }

  async getDocumentos(params?: { vehiculoId?: string }) {
    const query = new URLSearchParams();
    if (params?.vehiculoId) query.set("vehiculoId", params.vehiculoId);
    const qs = query.toString();
    return this.request(`/flota/documentos${qs ? `?${qs}` : ""}`);
  }

  async createDocumento(data: any) {
    return this.request("/flota/documentos", { method: "POST", body: JSON.stringify(data) });
  }

  async deleteDocumento(id: string) {
    return this.request(`/flota/documentos/${id}`, { method: "DELETE" });
  }

  // ─── Almacén ───
  async getRepuestos() {
    return this.request("/mantenimiento/almacen");
  }

  async createRepuesto(data: any) {
    return this.request("/mantenimiento/almacen", { method: "POST", body: JSON.stringify(data) });
  }

  async getMovimientosAlmacen(repuestoId?: string) {
    const query = repuestoId ? `?repuestoId=${repuestoId}` : "";
    return this.request(`/mantenimiento/almacen/movimientos${query}`);
  }

  async createMovimientoAlmacen(data: any) {
    return this.request("/mantenimiento/almacen/movimientos", { method: "POST", body: JSON.stringify(data) });
  }

  async updateRepuesto(id: string, data: any) {
    return this.request(`/mantenimiento/almacen/${id}`, { method: "PUT", body: JSON.stringify(data) });
  }

  async deleteRepuesto(id: string) {
    return this.request(`/mantenimiento/almacen/${id}`, { method: "DELETE" });
  }

  async getLavados() {
    return this.request("/mantenimiento/lavado");
  }

  async createLavado(data: any) {
    return this.request("/mantenimiento/lavado", { method: "POST", body: JSON.stringify(data) });
  }

  async deleteLavado(id: string) {
    return this.request(`/mantenimiento/lavado/${id}`, { method: "DELETE" });
  }

  // ─── Operaciones ───
  async getRutas() {
    return this.request("/operaciones/rutas");
  }

  async createRuta(data: any) {
    return this.request("/operaciones/rutas", { method: "POST", body: JSON.stringify(data) });
  }

  async updateRuta(id: string, data: any) {
    return this.request(`/operaciones/rutas/${id}`, { method: "PUT", body: JSON.stringify(data) });
  }

  async deleteRuta(id: string) {
    return this.request(`/operaciones/rutas/${id}`, { method: "DELETE" });
  }

  async getProgramaciones() {
    return this.request("/operaciones/programaciones");
  }

  async createProgramacion(data: any) {
    return this.request("/operaciones/programaciones", { method: "POST", body: JSON.stringify(data) });
  }

  async updateProgramacion(id: string, data: any) {
    return this.request(`/operaciones/programaciones/${id}`, { method: "PUT", body: JSON.stringify(data) });
  }

  async deleteProgramacion(id: string) {
    return this.request(`/operaciones/programaciones/${id}`, { method: "DELETE" });
  }

  // ─── Seguridad (Admin) ───
  async getPermisos() {
    return this.request("/admin/permisos");
  }

  async assignPermiso(usuarioId: string, permisoId: string) {
    return this.request("/admin/permisos", {
      method: "POST",
      body: JSON.stringify({ usuarioId, permisoId }),
    });
  }

  async removePermiso(usuarioId: string, permisoId: string) {
    return this.request(`/admin/permisos?usuarioId=${usuarioId}&permisoId=${permisoId}`, {
      method: "DELETE",
    });
  }

  async getSesiones() {
    return this.request("/admin/sesiones");
  }

  async cerrarSesion(id: string) {
    return this.request(`/admin/sesiones?id=${id}`, { method: "DELETE" });
  }

  async getAuditLogs(params?: { modulo?: string; fechaInicio?: string; fechaFin?: string }) {
    const query = new URLSearchParams();
    if (params?.modulo) query.set("modulo", params.modulo);
    if (params?.fechaInicio) query.set("fechaInicio", params.fechaInicio);
    if (params?.fechaFin) query.set("fechaFin", params.fechaFin);
    const qs = query.toString();
    return this.request(`/admin/audit${qs ? `?${qs}` : ""}`);
  }

  // ─── Configuración ───
  async getConfiguracion(grupo?: string) {
    const query = grupo ? `?grupo=${grupo}` : "";
    return this.request(`/configuracion${query}`);
  }

  async saveConfiguracion(data: Record<string, string>) {
    return this.request("/configuracion", { method: "POST", body: JSON.stringify(data) });
  }

  async updateConfiguracion(clave: string, data: any) {
    return this.request(`/configuracion/${clave}`, { method: "PUT", body: JSON.stringify(data) });
  }

  // ─── Auth (público / token-based) ───
  async solicitarCambioPassword() {
    return this.request("/auth/solicitar-cambio-password", { method: "POST" });
  }

  async confirmarUsuario(token: string, password: string) {
    return this.request("/auth/confirmar-usuario", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  }

  async cambiarPassword(token: string, password: string) {
    return this.request("/auth/cambiar-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  }

  // ─── Lookups ───
  async getLookups(type: string) {
    return this.request(`/lookups/${type}`);
  }

  async createLookup(type: string, data: any) {
    return this.request(`/lookups/${type}`, { method: "POST", body: JSON.stringify(data) });
  }

  async updateLookup(type: string, id: string, data: any) {
    return this.request(`/lookups/${type}/${id}`, { method: "PUT", body: JSON.stringify(data) });
  }

  async deleteLookup(type: string, id: string) {
    return this.request(`/lookups/${type}/${id}`, { method: "DELETE" });
  }

  async getModelosPorMarca(marcaId: string) {
    return this.request(`/lookups/modelos-por-marca/${marcaId}`);
  }

  // ─── Reportes ───
  async exportExcel() {
    return this.request("/reportes/excel");
  }

  async exportPdf() {
    return this.request("/reportes/pdf");
  }
}

export const api = new ApiClient();
export default api;
