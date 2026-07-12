# Explicación del Proyecto SAF — Sistema de Administración de Flotas

Este documento presenta, a modo de exposición técnica, qué contiene cada carpeta principal del repositorio y qué responsabilidad cumple dentro del sistema. El objetivo es entender la arquitectura sin entrar en el detalle línea por línea de cada archivo.

---

## 1. Visión General

El sistema digitaliza el manual **F1T02** (Procedimientos Básicos de Operación y Control de Flotas) usando:

- **Backend:** Node.js + Express + Prisma ORM (Hono/Express) sobre PostgreSQL.
- **Frontend:** Next.js 13 (App Router) + Tailwind CSS.
- **Base de Datos:** PostgreSQL, definida con esquemas Prisma modulares.

```
/
├── backend/      API REST (lógica de negocio)
├── frontend/     Interfaz de usuario (Next.js)
├── prisma/      Esquema y migraciones de la BD
├── shared/       Tipos/código compartido entre front y back
├── generated/    Cliente Prisma generado automáticamente
├── nginx/        Configuración del proxy inverso
├── docs/         Documentación técnica
└── (raíz)      Docker, .env, configuración global
```

---

## 2. Carpeta `backend/`

Es el corazón del sistema. Expone una API REST que el frontend consume.

### Estructura

```
backend/
├── src/
│   ├── config/          Configuración (env, database, swagger)
│   ├── middleware/      Intermediarios (auth, rbac, validate, errorHandler)
│   ├── routes/          Definición de endpoints por módulo
│   ├── schemas/         Validación de datos con Zod
│   ├── utils/           Funciones auxiliares (respuestas, emails, fechas)
│   ├── __tests__/       Pruebas automatizadas (Vitest)
│   └── server.ts        Punto de entrada del servidor
├── scripts/             Scripts de apoyo (ej. link-prisma)
├── Dockerfile           Imagen de producción del backend
├── package.json         Dependencias y scripts (dev, build, test, db:*)
└── tsconfig.json        Configuración de TypeScript
```

### Qué hace cada parte

- **`config/`**
  - `env.ts`: Carga y valida variables de entorno con *Zod* (DATABASE_URL, JWT_SECRET, SMTP, etc.). Si falta algo, el servidor no arranca.
  - `database.ts`: Crea un *singleton* de `PrismaClient` usando el adapter `PrismaPg` para PostgreSQL.
  - `swagger.ts`: Genera la documentación interactiva de la API (`/api-docs`).

- **`middleware/`**
  - `auth.ts`: Verifica el token JWT y popula `req.usuario`.
  - `rbac.ts`: Control de acceso por rol (ej. solo `ADMINISTRADOR` puede eliminar).
  - `validate.ts`: Ejecuta los esquemas *Zod* antes de llegar al controlador.
  - `errorHandler.ts`: Captura excepciones y responde con formato uniforme.

- **`routes/`**
  Cada archivo agrupa los endpoints de un dominio: `vehiculos.routes.ts`, `movimientos.routes.ts`, `combustible.routes.ts`, `mantenimiento.routes.ts`, `seguridad.routes.ts`, `flota.routes.ts`, `almacen.routes.ts`, `operaciones.routes.ts`, `configuracion.routes.ts`, `usuarios.routes.ts`, `auth.routes.ts`, `reportes.routes.ts`, `lookup.routes.ts` (tablas de catálogo).

- **`schemas/`**
  Definen con *Zod* la forma que deben tener los cuerpos de las peticiones (ej. `vehiculo.schema.ts`, `movimiento.schema.ts`, `auth.schema.ts`).

- **`server.ts`**
  Orquesta todo: aplica *helmet*, *cors*, *rate-limit*, monta las rutas bajo `/api` y registra *Swagger*.

---

## 3. Carpeta `frontend/`

Es la cara visible del sistema. Una SPA (Single Page Application) construida con Next.js 13 en modo *App Router*.

### Estructura relevante

```
frontend/
├── src/
│   ├── app/              Rutas y páginas (una carpeta por módulo)
│   │   ├── vehiculos/
│   │   ├── movimientos_diarios/
│   │   ├── control_combustible/
│   │   ├── control_mantenimiento/
│   │   ├── control_llantas/
│   │   ├── conductores/
│   │   ├── flota/        (asignación, documentos)
│   │   ├── mantenimiento/ (almacén, lavado)
│   │   ├── seguridad/     (permisos, sesiones, auditoría)
│   │   ├── configuracion/
│   │   ├── login/ cambiar-password/ confirmar-usuario/
│   │   └── page.tsx      Dashboard principal
│   ├── components/
│   │   ├── ui/           Tabla, modal, toast, select, etc.
│   │   ├── layout/       Sidebar, DashboardLayout
│   │   └── providers/    AuthProvider, ThemeProvider
│   ├── lib/             api.ts (fetch con JWT), constants.ts, orderGenerator.ts
│   ├── utils/           Generación de PDF, exportación Excel
│   ├── features/         Módulos de negocio (motor-económico, operación)
│   └── middleware.ts     Protege rutas según el rol del usuario
├── public/              Recursos estáticos
├── package.json         Dependencias y scripts (dev, build, start)
└── next.config.js       Configuración de Next.js
```

### Qué hace cada parte

- **`app/`**: Cada subcarpeta es una sección de la aplicación. El archivo `page.tsx` dentro de cada una renderiza la pantalla. Por ejemplo, `movimientos_diarios/page.tsx` lista los movimientos y `movimientos_diarios/checklist/page.tsx` muestra el formulario de verificación pre-operacional.

- **`components/ui/`**: Componentes reutilizables (tablas, diálogos de confirmación, notificaciones *toast*, selectores con búsqueda).

- **`components/layout/`**: La estructura visual común: barra lateral (`Sidebar`) y contenedor principal (`DashboardLayout`).

- **`lib/api.ts`**: Wrapper de `fetch` que inyecta automáticamente el token JWT en cada petición al backend.

- **`middleware.ts`**: Se ejecuta en el servidor antes de cada navegación y redirige al login si el usuario no está autenticado o no tiene el rol necesario.

---

## 4. Carpeta `prisma/` — La Base de Datos

Define toda la estructura de la base de datos PostgreSQL usando el lenguaje de esquemas de Prisma, dividido en archivos por contexto para facilitar el mantenimiento.

### Estructura

```
prisma/
├── schema/             Archivos .prisma con los modelos
│   ├── base.prisma              Datasource y generator
│   ├── vehiculos.prisma        Modelo Vehiculo
│   ├── conductores.prisma      Modelo Usuario (personal)
│   ├── movimientos_diarios.prisma  MovimientoDiario + Checklist
│   ├── control_combustible.prisma  OrdenCombustible
│   ├── control_mantenimiento.prisma OrdenMantenimiento + Detalles
│   ├── control_llantas.prisma  ControlLlanta + vista DesempenoLlantas
│   ├── control_costos.prisma   Vistas de reportes KPI
│   ├── flota.prisma            AsignacionVehiculo, DocumentoVehiculo
│   ├── mantenimiento.prisma    Lavado
│   ├── seguridad.prisma        Permisos, Sesiones, Auditoría, Tokens
│   ├── normalizacion.prisma    Tablas catálogo (marcas, colores, etc.)
│   ├── operacion.prisma        ProgramacionRuta
│   └── configuracion.prisma   Configuración del sistema
├── migrations/         SQL generado por cada cambio de esquema
└── seed.ts             Datos de ejemplo para poblar la BD
```

### Modelos Principales

| Modelo | Responsabilidad |
|--------|-----------------|
| `Vehiculo` | Patrimonio vehicular: placas, motor, chasis, costos, estado operativo. |
| `Usuario` | Personal (conductores, inspectores, admins) con roles y licencias. |
| `MovimientoDiario` | Registro diario de uso del vehículo (odómetro, horas, firmas). |
| `ChecklistVerificacion` | 15 puntos de revisión pre-operacional por movimiento. |
| `OrdenCombustible` | Abastecimiento de combustible y lubricantes. |
| `OrdenMantenimiento` | Mantenimiento preventivo/correctivo con repuestos y mano de obra. |
| `ControlLlanta` | Seguimiento de llantas por vehículo. |
| `Permiso` / `PermisoUsuario` | Control granular de accesos por módulo y acción. |
| `Auditoria` | Bitácora de todas las acciones críticas del sistema. |

### Tablas de Normalización (`normalizacion.prisma`)

Evitan texto libre y usan claves foráneas: `MarcaVehiculo`, `ModeloVehiculo`, `ColorVehiculo`, `TipoCombustible`, `EstadoVehiculo`, `CategoriaVehiculo`, `Rol`, `SectorOrganizacional`, `Localidad`, `CentroServicio`, `FabricanteLlanta`, `DimensionLlanta`, `CategoriaRepuesto`, `TipoLavado`, `TipoMovimientoAlmacen`.

### Enums

Definen valores fijos del dominio F1T02: `EstadoFisico` (BUENO/REGULAR/MALO), `EstadoMovimiento`, `EstadoChecklist` (OK/OBSERVADO/FALLADO), `TipoMantenimiento`, `TipoTaller`, `EstadoMantenimiento`, `EstadoSesionAuth`, `TipoAccionAuditoria`, `TipoToken`.

---

## 5. Otras Carpetas Importantes

### `shared/`
Código (tipos TypeScript, constantes) compartido entre `backend` y `frontend` para evitar duplicación. Se enlaza como dependencia local (`saf-shared`).

### `generated/prisma/`
Cliente Prisma generado automáticamente a partir de los esquemas. **No se edita manualmente**; se regenera con `npm run db:generate`.

### `nginx/`
Configuración del servidor proxy inverso (Nginx) que en producción termina SSL y redirige el tráfico hacia el backend y el frontend.

### `docs/`
Documentación técnica: planes por fase, estándares, pruebas, y los resúmenes de arquitectura (`frontend.md`, `backend.md`, `prisma.md`, `configuracion.md`).

### Raíz
- `docker-compose.yml` / `Dockerfile`: Orquestación de contenedores.
- `.env` / `.env.example`: Variables de entorno (base de datos, JWT, SMTP).
- `package.json` (raíz): Scripts globales de Prisma para todo el monorepo.
- `ERD.svg`: Diagrama entidad-relación de la base de datos.

---

## 6. Resumen de Flujo

1. El usuario accede al **frontend** (Next.js) y se autentica vía `login`.
2. El **middleware** del frontend valida el JWT y el **backend** lo verifica en cada petición.
3. Las rutas del **backend** consultan/escriben en **PostgreSQL** a través de **Prisma**.
4. Cada acción sensible queda registrada en la tabla `Auditoria`.
5. La información normalizada (marcas, estados, etc.) se sirve desde las tablas de catálogo para mantener consistencia.
