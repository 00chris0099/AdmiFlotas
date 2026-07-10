# FASE 4 — Documentacion API, RBAC Fix, Limpieza Final

> **Fecha de creacion:** 2026-07-09
> **Estado:** IMPLEMENTADO

---

## Contexto

La Fase 3 completo todos los endpoints CRUD del backend (26 endpoints nuevos, 14 archivos de rutas reescritos, dead code eliminado). La Fase 4 se enfoca en los requisitos restantes de la evaluacion de ingenieria y la correccion de deuda tecnica identificada en la auditoria.

---

## Bloque A — Documentacion API (Swagger/OpenAPI)

**Problema:** No existe ninguna documentacion API. El sistema tiene ~50 endpoints REST sin documentacion. Esto es requisito obligatorio para la evaluacion de ingeneringia.

**Solucion:** `swagger-jsdoc` + `swagger-ui-express` en el backend, generando documentacion auto-descriptiva desde JSDoc comments en las rutas.

### Tareas

| ID  | Tarea | Archivo(s) | Descripcion |
|-----|-------|-----------|-------------|
| A1  | Instalar dependencias | `backend/package.json` | Instalar `swagger-jsdoc`, `swagger-ui-express` y sus tipos `@types/swagger-jsdoc`, `@types/swagger-ui-express` |
| A2  | Configuracion OpenAPI base | `backend/src/config/swagger.ts` (nuevo) | Definir info (titulo SAF, version, descripcion), servers (dev:3001, prod), components de seguridad JWT (Bearer auth), tags por modulo |
| A3  | Montar Swagger UI | `backend/src/server.ts` | Montar `/api/docs` con `swaggerUi.serve` y `swaggerUi.setup(spec)`. Agregar import de swagger config y dependencias |
| A4  | Documentar Auth routes | `backend/src/routes/auth.routes.ts` | Tags: Auth. Endpoints: POST /login, POST /logout, GET /me. Documentar request bodies, responses, esquemas de error |
| A5  | Documentar Vehiculos routes | `backend/src/routes/vehiculos.routes.ts` | Tags: Vehiculos. CRUD completo con paginacion, filtros, lookups |
| A6  | Documentar Movimientos routes | `backend/src/routes/movimientos.routes.ts` | Tags: Movimientos Diarios. GET /, GET /checklist, GET /:id, POST / (con checklist transaccional), PUT /:id, DELETE /:id |
| A7  | Documentar Combustible routes | `backend/src/routes/combustible.routes.ts` | Tags: Combustible. CRUD con numeroOrden auto-generado |
| A8  | Documentar Mantenimiento routes | `backend/src/routes/mantenimiento.routes.ts` | Tags: Mantenimiento. CRUD ordenes, POST / DELETE /mano-obra |
| A9  | Documentar Almacen routes | `backend/src/routes/almacen.routes.ts` | Tags: Almacen. CRUD repuestos, movimientos, lavados |
| A10 | Documentar Llantas routes | `backend/src/routes/llantas.routes.ts` | Tags: Llantas. CRUD control individualizado, rotacion, reencauche, baja |
| A11 | Documentar Costos routes | `backend/src/routes/costos.routes.ts` | Tags: Costos. Reportes KPI, costos fijo/variable, sustitucion CPA |
| A12 | Documentar Flota routes | `backend/src/routes/flota.routes.ts` | Tags: Flota. Asignaciones CRUD, documentos CRUD |
| A13 | Documentar Operaciones routes | `backend/src/routes/operaciones.routes.ts` | Tags: Operaciones. Rutas CRUD, programaciones CRUD |
| A14 | Documentar Usuarios routes | `backend/src/routes/usuarios.routes.ts` | Tags: Usuarios. CRUD administracion de usuarios |
| A15 | Documentar Configuracion routes | `backend/src/routes/configuracion.routes.ts` | Tags: Configuracion. Endpoints de configuracion del sistema |
| A16 | Documentar Lookup routes | `backend/src/routes/lookup.routes.ts` | Tags: Lookups. Datos de referencia (marcas, modelos, colores, etc.) |
| A17 | Documentar Reportes routes | `backend/src/routes/reportes.routes.ts` | Tags: Reportes. Exportacion Excel/PDF |
| A18 | Verificar docs cargan | `http://localhost:3001/api/docs` | Verificar que Swagger UI carga, muestra todos los endpoints, y permite probar llamadas |

### Esquemas OpenAPI a definir en swagger.ts

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Usuario:
      type: object
      properties: { id, email, nombre, apellido, rol }
    Vehiculo:
      type: object
      properties: { id, placa, codigoPatrimonial, marca, modelo, estado }
    MovimientoDiario:
      type: object
      properties: { id, numeroOrden, fecha, vehiculoId, conductorId, estado }
    OrdenCombustible:
      type: object
      properties: { id, numeroOrden, fecha, vehiculoId, tipoCombustible, costoTotal }
    OrdenMantenimiento:
      type: object
      properties: { id, numeroOrden, fechaEmision, vehiculoId, tipoMantenimiento, estado }
    Error:
      type: object
      properties: { success: false, error: string }
```

### Tags planificados

| Tag | Modulo | Rutas |
|-----|--------|-------|
| Auth | Autenticacion | `/api/auth/*` |
| Vehiculos | Gestion de flota vehicular | `/api/vehiculos/*` |
| Movimientos Diarios | Control operativo diario | `/api/movimientos_diarios/*` |
| Combustible | Control de combustible y lubricantes | `/api/control_combustible/*` |
| Mantenimiento | Control de mantenimiento preventivo/correctivo | `/api/control_mantenimiento/*` |
| Almacen | Almacen de mantenimiento | `/api/mantenimiento/almacen/*` |
| Llantas | Control individualizado de llantas | `/api/control_llantas/*` |
| Costos | Totalizacion y analisis de costos | `/api/control_costos/*` |
| Flota | Asignacion y documentos de vehiculos | `/api/flota/*` |
| Operaciones | Rutas y programacion de viajes | `/api/operaciones/*` |
| Usuarios | Administracion de usuarios y roles | `/api/usuarios/*` |
| Configuracion | Configuracion del sistema | `/api/configuracion/*` |
| Lookups | Datos de referencia | `/api/lookup/*` |
| Reportes | Exportacion Excel y PDF | `/api/reportes/*` |

---

## Bloque B — Fix RBAC Middleware

**Problema:** El middleware `rbac.ts` tiene 2 problemas criticos:

1. El tipo `Rol` usa valores genericos (`ADMINISTRADOR`, `GERENTE`) que **no coinciden** con los roles reales del sistema F1T02 (`JEFE_PROCESO`, `CONDUCTOR`, `INSPECTOR`, etc.)
2. `requirePermission()` tiene 2 TODOs sin implementar — los permisos no se verifican真的 para usuarios no-admin

### Tareas

| ID  | Tarea | Archivo(s) | Descripcion |
|-----|-------|-----------|-------------|
| B1  | Actualizar tipo Rol | `backend/src/middleware/rbac.ts:8` | Reemplazar `type Rol = "ADMINISTRADOR" \| "GERENTE" \| ...` con los 13 roles reales: `JEFE_PROCESO`, `CONDUCTOR`, `INSPECTOR`, `MECANICO`, `ELECTRICISTA`, `ENCARGADO_TALLER`, `LAVADOR`, `JEFE_MANTENIMIENTO`, `JEFE_OPERACION`, `CONTROLADOR_TRANSITO`, `ANALISTA`, `ADMINISTRATIVO`, `ADMINISTRADOR` |
| B2  | Implementar requirePermission | `backend/src/middleware/rbac.ts:24-44` | Descomentar y completar la consulta `permisoUsuario` a la BD. Verificar que el usuario tenga un PermisoUsuario con el modulo y accion solicitados. Los ADMINISTRADOR pasan sin verificacion |
| B3  | Fix requireRole en routes | `backend/src/routes/vehiculos.routes.ts`, `backend/src/routes/usuarios.routes.ts` | Asegurar que los arrays de roles pasados a `requireRole()` usen los codigos F1T02 correctos |

### Implementacion de requirePermission (B2)

```typescript
export const requirePermission = (modulo: string, accion: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      if (req.user.rol === "ADMINISTRADOR") return next();

      const permiso = await prisma.permisoUsuario.findFirst({
        where: {
          usuarioId: req.user.userId,
          permiso: { modulo, accion },
        },
        include: { permiso: true },
      });

      if (!permiso) {
        throw new ForbiddenError("No tiene permisos para esta accion");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
```

---

## Bloque C — Limpieza Frontend

### Tareas

| ID  | Tarea | Archivo(s) | Linea(s) | Cambio |
|-----|-------|-----------|----------|--------|
| C1  | Fix texto "Supabase" | `frontend/src/app/movimientos_diarios/page.tsx` | 369 | `"Cargando movimientos reales de Supabase..."` → `"Cargando movimientos diarios..."` |
| C2  | Fix texto "Supabase" | `frontend/src/app/movimientos_diarios/page.tsx` | 676 | `"Guardando en Supabase..."` → `"Guardando..."` |
| C3  | Fix texto "Supabase" | `frontend/src/app/control_llantas/page.tsx` | 562 | `"Registrando en Supabase..."` → `"Registrando..."` |
| C4  | Fix texto "Supabase" | `frontend/src/app/control_costos/sustitucion/page.tsx` | 256 | `"...en Supabase"` → `"...en la base de datos"` |
| C5  | Migrar raw fetch | `frontend/src/app/movimientos_diarios/page.tsx` | 119 | Reemplazar `fetch(...)` con `api.getRutas()` |
| C6  | Migrar raw fetch | `frontend/src/app/control_costos/sustitucion/page.tsx` | 41 | Reemplazar `fetch(...)` con `api.getSustitucion()` |
| C7  | Migrar raw fetch | `frontend/src/app/control_mantenimiento/page.tsx` | 288 | Reemplazar `fetch(...)` con `api.request("/reportes/pdf?tipo=orden_mantenimiento&id=${ordenId}")` |
| C8  | Eliminar archivo | `gateway-nginx.conf` (raiz) | - | Archivo huerfano, no montado por docker-compose, usa puerto backend incorrecto (3000 en vez de 3001) |
| C9  | Eliminar archivo | `Dockerfile` (raiz) | - | Archivo huerfano, duplica logica de `frontend/Dockerfile`, no referenciado por docker-compose |

---

## Bloque D — Verificacion Docker

### Tareas

| ID  | Tarea | Comando | Resultado esperado |
|-----|-------|---------|-------------------|
| D1  | Build de imagenes | `docker-compose build` | Las 4 imagenes (db, backend, frontend, nginx) se construyen sin errores |
| D2  | Levantar servicios | `docker-compose up -d` | Los 4 servicios arrancan. Verificar con `docker-compose ps` que todos estan "Up" |
| D3  | Verificar health check | `curl http://localhost/api/health` | Respuesta 200 OK |
| D4  | Verificar frontend | `curl -I http://localhost` | Redirige o responde con HTML de Next.js |
| D5  | Verificar Swagger UI | `curl http://localhost/api/docs` | Retorna HTML de Swagger UI |
| D6  | Verificar login | POST `/api/auth/login` via curl | Retorna token JWT |

---

## Orden de ejecucion

```
A1 → A2 → A3 → A4~A17 (en paralelo) → A18
  ↓
B1 → B2 → B3
  ↓
C1~C9 (en paralelo)
  ↓
D1 → D2 → D3~D6
```

---

## Archivos totales

| Tipo | Cantidad | Detalle |
|------|----------|---------|
| Crear | 1 | `backend/src/config/swagger.ts` |
| Modificar | 17 | 14 route files + rbac.ts + server.ts + movimientos_diarios/page.tsx |
| Modificar (textos) | 2 | control_llantas/page.tsx, control_costos/sustitucion/page.tsx |
| Modificar (fetch) | 1 | control_mantenimiento/page.tsx |
| Eliminar | 2 | `gateway-nginx.conf`, root `Dockerfile` |

**Total: 23 archivos**
