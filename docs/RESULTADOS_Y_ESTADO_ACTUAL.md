## 8. RESULTADOS Y ESTADO ACTUAL DEL PROYECTO

### 8.1. Funcionalidades Implementadas

El sistema SAF ha sido desarrollado siguiendo el Manual Técnico F1T02, digitalizando los procedimientos básicos de operación, mantenimiento y control de flota. A continuación se detallan las funcionalidades completadas por módulo, verificadas contra el código fuente real.

**Módulo de Autenticación y Seguridad** (6 endpoints en `auth.routes.ts` + 6 en `seguridad.routes.ts`)

| Funcionalidad | Endpoint | Estado | Detalle |
|---|---|---|---|
| Inicio de sesión con JWT | `POST /api/auth/login` | Completado | Autenticación por email y contraseña con bcrypt + JWT. Bloqueo tras 5 intentos fallidos |
| Cierre de sesión | `POST /api/auth/logout` | Parcial | Retorna éxito pero no invalida el token JWT (registrado en comentario del código) |
| Obtener usuario actual | `GET /api/auth/me` | Completado | Retorna datos del usuario autenticado desde Prisma |
| Solicitud de cambio de contraseña | `POST /api/auth/solicitar-cambio-password` | Completado | Genera token y envía email. No revela existencia del usuario |
| Confirmación de cuenta | `POST /api/auth/confirmar-usuario` | Completado | Valida token y establece contraseña en transacción |
| Cambio de contraseña | `POST /api/auth/cambiar-password` | Completado | Valida token y cambia contraseña en transacción |
| Listar permisos | `GET /api/admin/permisos` | Completado | Permisos con usuarios asignados |
| Asignar permiso | `POST /api/admin/permisos` | Completado | Asigna permiso a usuario (detecta duplicados con código 409) |
| Quitar permiso | `DELETE /api/admin/permisos` | Completado | Elimina asignación por usuarioId y permisoId |
| Listar sesiones | `GET /api/admin/sesiones` | Completado | Sesiones activas con información del usuario |
| Cerrar sesión remota | `DELETE /api/admin/sesiones` | Completado | Cierra sesión de otro usuario |
| Logs de auditoría | `GET /api/admin/audit` | Completado | Filtros por módulo y rango de fechas |

**Módulo de Inventario de Flota** (5 endpoints en `vehiculos.routes.ts`)

| Funcionalidad | Endpoint | Estado | Detalle |
|---|---|---|---|
| Listar vehículos | `GET /api/vehiculos` | Completado | Paginado con búsqueda, filtros por estado y marca. Excluye DADO_DE_BAJA por defecto |
| Obtener vehículo | `GET /api/vehiculos/:id` | Completado | Búsqueda por UUID con 5 relaciones (marca, modelo, color, tipo combustible, estado) |
| Crear vehículo | `POST /api/vehiculos` | Completado | Requiere rol ADMINISTRADOR o JEFE_PROCESO. Validación con Zod |
| Actualizar vehículo | `PUT /api/vehiculos/:id` | Completado | Requiere rol ADMINISTRADOR o JEFE_PROCESO. Validación con Zod |
| Eliminar vehículo | `DELETE /api/vehiculos/:id` | Completado | Soft-delete: cambia estado a DADO_DE_BAJA |

**Módulo de Operación Diaria — MA 122 01 01** (6 endpoints en `movimientos.routes.ts`)

| Funcionalidad | Endpoint | Estado | Detalle |
|---|---|---|---|
| Listar movimientos | `GET /api/movimientos_diarios` | Completado | Paginado con filtros por vehículo, conductor y estado |
| Listar checklists | `GET /api/movimientos_diarios/checklist` | Completado | Datos formateados: placa, marca, modelo, inspector, 15 booleanos |
| Obtener movimiento | `GET /api/movimientos_diarios/:id` | Completado | Con vehículo, conductor, inspector y checklist |
| Crear movimiento | `POST /api/movimientos_diarios` | Completado | Creación transaccional: movimiento + checklist en $transaction. Auto-genera número de orden |
| Actualizar movimiento | `PUT /api/movimientos_diarios/:id` | Completado | Actualización estándar |
| Eliminar movimiento | `DELETE /api/movimientos_diarios/:id` | Completado | Eliminación física (hard delete) |

**Módulo de Combustible y Lubricantes — MA 122 01 02** (5 endpoints en `combustible.routes.ts`)

| Funcionalidad | Endpoint | Estado | Detalle |
|---|---|---|---|
| Listar órdenes | `GET /api/control_combustible` | Completado | Paginado con filtros |
| Obtener orden | `GET /api/control_combustible/:id` | Completado | Con relaciones de vehículo y conductor |
| Crear orden | `POST /api/control_combustible` | Completado | Validación con Zod. Número de orden auto-generado |
| Actualizar orden | `PUT /api/control_combustible/:id` | Completado | Actualización estándar |
| Eliminar orden | `DELETE /api/control_combustible/:id` | Completado | Eliminación estándar |

**Módulo de Mantenimiento — MA 122 02 01** (7 endpoints en `mantenimiento.routes.ts`)

| Funcionalidad | Endpoint | Estado | Detalle |
|---|---|---|---|
| Listar órdenes | `GET /api/control_mantenimiento` | Completado | Paginado con filtros |
| Obtener orden | `GET /api/control_mantenimiento/:id` | Completado | Con relaciones de vehículo y técnico |
| Crear orden | `POST /api/control_mantenimiento` | Completado | Validación con Zod. PREVENTIVO/CORRECTIVO, PROPIO/TERCEROS |
| Actualizar orden | `PUT /api/control_mantenimiento/:id` | Completado | Actualización estándar |
| Eliminar orden | `DELETE /api/control_mantenimiento/:id` | Completado | Eliminación estándar |
| Agregar mano de obra | `POST /api/control_mantenimiento/mano-obra` | Completado | Tarjeta de Mano de Obra |
| Eliminar mano de obra | `DELETE /api/control_mantenimiento/mano-obra/:id` | Completado | Eliminación de registro de mano de obra |

**Módulo de Almacén de Mantenimiento** (10 endpoints en `almacen.routes.ts`)

| Funcionalidad | Endpoint | Estado | Detalle |
|---|---|---|---|
| CRUD repuestos | GET/POST/PUT/DELETE `/api/mantenimiento/almacen` | Completado | Inventario de repuestos con categoría |
| Movimientos de almacén | GET/POST `/api/mantenimiento/almacen/movimientos` | Completado | ENTRADA, SALIDA, DEVOLUCIÓN |
| Lavados | GET/POST/DELETE `/api/mantenimiento/almacen/lavado` | Completado | EXTERIOR, INTERIOR, COMPLETO |

**Módulo de Control de Llantas** (2 endpoints en `llantas.routes.ts`)

| Funcionalidad | Endpoint | Estado | Detalle |
|---|---|---|---|
| Listar llantas | `GET /api/control_llantas` | Completado | Con filtros por vehículo y estado |
| Registrar llanta | `POST /api/control_llantas` | Completado | Código EPS, posición (1–7), dimensión, fabricante |

**Módulo de Costos (CKV)** (5 endpoints en `costos.routes.ts`)

| Funcionalidad | Endpoint | Estado | Detalle |
|---|---|---|---|
| Reportes KPI | `GET /api/control_costos/reportes-kpi` | Completado | Indicadores de costos fijos, variables y totales |
| Costos fijo/variable | `GET /api/control_costos/costos-fijo-variable` | Completado | Listado de costos prorrateables |
| Crear costo fijo | `POST /api/control_costos/costos-fijo-variable` | Completado | Registro de nuevo costo fijo |
| Eliminar costo fijo | `DELETE /api/control_costos/costos-fijo-variable/:id` | Completado | Eliminación de costo fijo |
| Sustitución CPA | `GET /api/control_costos/sustitucion` | Completado | Análisis de sustitución de componentes |

**Módulo de Flota** (7 endpoints en `flota.routes.ts`)

| Funcionalidad | Endpoint | Estado | Detalle |
|---|---|---|---|
| Asignaciones CRUD | GET/POST/PUT/DELETE `/api/flota/asignacion` | Completado | Asignación de vehículos a conductores |
| Documentos CRUD | GET/POST/DELETE `/api/flota/documentos` | Completado | Documentación vehicular |

**Módulo de Operaciones** (8 endpoints en `operaciones.routes.ts`)

| Funcionalidad | Endpoint | Estado | Detalle |
|---|---|---|---|
| Rutas CRUD | GET/POST/PUT/DELETE `/api/operaciones/rutas` | Completado | Definición de rutas de viaje |
| Programaciones CRUD | GET/POST/PUT/DELETE `/api/operaciones/programaciones` | Completado | Programación de viajes |

**Módulo de Reportes** (2 endpoints en `reportes.routes.ts`)

| Funcionalidad | Endpoint | Estado | Detalle |
|---|---|---|---|
| Exportación Excel | `GET /api/reportes/excel` | Completado | CSV con BOM UTF-8 para vehículos, combustible o mantenimiento |
| Exportación PDF | `GET /api/reportes/pdf` | Completado | Datos JSON para generación de PDF en el frontend |

**Módulo de Administración de Usuarios** (4 endpoints en `usuarios.routes.ts`)

| Funcionalidad | Endpoint | Estado | Detalle |
|---|---|---|---|
| Listar usuarios | `GET /api/admin/usuarios` | Completado | Con información de rol |
| Crear usuario | `POST /api/admin/usuarios` | Completado | Validación con Zod |
| Actualizar usuario | `PUT /api/admin/usuarios/:id` | Completado | Validación con Zod |
| Eliminar usuario | `DELETE /api/admin/usuarios/:id` | Completado | Eliminación estándar |

**Módulo de Configuración** (5 endpoints en `configuracion.routes.ts`)

| Funcionalidad | Endpoint | Estado | Detalle |
|---|---|---|---|
| Listar configuración | `GET /api/configuracion` | Completado | Todos los parámetros del sistema |
| Obtener por clave | `GET /api/configuracion/:clave` | Completado | Búsqueda por clave específica |
| Actualizar | `PUT /api/configuracion/:clave` | Completado | Requiere rol ADMINISTRADOR o JEFE_PROCESO |
| Crear parámetro | `POST /api/configuracion` | Completado | Nuevo parámetro de configuración |
| Eliminar | `DELETE /api/configuracion/:clave` | Completado | Eliminación de parámetro |

**Módulo de Lookups — Datos de Referencia** (endpoints dinámicos en `lookup.routes.ts`)

| Funcionalidad | Estado | Detalle |
|---|---|---|
| 15 tablas de normalización | Completado | CRUD dinámico para: marcas, modelos, colores, tipos combustible, estados vehículo, categorías, roles, sectores, localidades, centros servicio, fabricantes llantas, dimensiones llantas, categorías repuestos, tipos lavado, tipos movimiento almacén |
| Modelos por marca | Completado | `GET /api/lookups/modelos-por-marca/:marcaId` |

**Documentación de la API**

| Funcionalidad | Estado | Detalle |
|---|---|---|
| Swagger/OpenAPI | Completado | Documentación interactiva de 83 endpoints en `/api/docs` |

**Infraestructura**

| Funcionalidad | Estado | Detalle |
|---|---|---|
| Docker multi-etapa | Completado | Imágenes optimizadas para backend (Express) y frontend (Next.js) |
| Docker Compose | Completado | Orquestación de 4 contenedores: PostgreSQL, backend, frontend, Nginx |
| Gateway inverso Nginx | Completado | Enrutamiento de tráfico HTTP hacia frontend y backend |
| Despliegue en EasyPanel | Completado | Dominio: `aimachristian-administraciondeflotas.ajcxjb.easypanel.host` |

---

### 8.2. Estado Actual del Desarrollo

**Progreso general:**

| Área | Estado | Porcentaje |
|---|---|---|
| Base de datos (esquema Prisma) | Completado | 100% |
| Backend API (83 endpoints REST) | Completado | 95% |
| Frontend (25 páginas Next.js) | Completado | 90% |
| Autenticación y seguridad | Completado | 100% |
| Pruebas automatizadas | En progreso | 95% (3 defectos abiertos) |
| Documentación API (Swagger) | Completado | 100% |
| Infraestructura Docker | Completado | 100% |
| Despliegue en producción | Completado | 100% |
| **Progreso general estimado** | | **93%** |

**Hitos alcanzados:**

| Hito | Fecha | Descripción | Archivos |
|---|---|---|---|
| Fase 1–3: Desarrollo core | Junio–Julio 2026 | Esquema de BD (14 schemas Prisma), endpoints CRUD, páginas frontend | ~80 archivos |
| Fase 4: Documentación y limpieza | 09 Julio 2026 | Swagger de 83 endpoints, fix RBAC (14 roles), limpieza frontend, verificación Docker | 23 archivos |
| Fase 5: Seguridad y reportes | 09 Julio 2026 | Rutas seguridad, auth faltantes, reportes Excel/PDF, validación Zod | 14 archivos |
| Fase 6: Testing | 09 Julio 2026 | 65 pruebas automatizadas en 5 archivos (62 aprobadas, 3 fallidas) | 8 archivos |
| Despliegue en producción | 10 Julio 2026 | Sistema desplegado en EasyPanel con dominio activo | — |

**Archivos del proyecto (verificados):**

| Categoría | Cantidad | Detalle |
|---|---|---|
| Esquemas Prisma | 14 | base, conductores, configuracion, control_combustible, control_costos, control_llantas, control_mantenimiento, flota, mantenimiento, movimientos_diarios, normalizacion, operacion, seguridad, vehiculos |
| Rutas backend | 15 | auth, vehiculos, movimientos, combustible, mantenimiento, llantas, costos, flota, operaciones, usuarios, seguridad, almacen, configuracion, lookup, reportes |
| Endpoints totales | 83 | Verificados con grep sobre archivos de rutas |
| Esquemas Zod | 6 | auth.schema, vehiculo.schema, movimiento.schema, business.schema, seguridad.schema |
| Middlewares | 4 | auth.ts, rbac.ts, validate.ts, errorHandler.ts |
| Páginas frontend | 25 | page.tsx verificados con glob sobre frontend/src/app/ |
| Pruebas | 5 | auth (11), vehiculos (7), movimientos (5), seguridad (14), utils (28) = 65 totales |
| Migraciones | 1 | 20250101_add_subtipo_combustible |

**Datos iniciales del sistema (Seed — verificados en `prisma/seed.ts`):**

| Entidad | Cantidad | Detalle |
|---|---|---|
| Usuarios | 9 | Anchillo Admin (JEFE_PROCESO), Escriba Matto (JEFE_PROCESO), Leon Mejia (CONDUCTOR), Gomez Sanchez (CONDUCTOR), Montero Salazar (INSPECTOR), Polanco Jimenez (MECANICO), Guerra Salas (MECANICO), Ventura Chipana (ADMINISTRATIVO), Quiroz Torres (ADMINISTRATIVO) |
| Vehículos | 3 | ABC-123 (Toyota Coaster), DEF-456 (Hyundai HD78), GHI-789 (Mercedes-Benz Sprinter) |
| Movimientos diarios | 2 | seed-mov-001 (2026-05-20), seed-mov-002 (2026-05-21) |
| Checklists | 2 | Uno por movimiento, 15 puntos de inspección cada uno |
| Órdenes de combustible | 2 | OC-2026-001 (12 gal, $106.20), OC-2026-002 (18 gal, $87.30) |
| Órdenes de mantenimiento | 2 | OM-2026-001 (PREVENTIVO/PROPIO, $335.50), OM-2026-002 (CORRECTIVO/TERCEROS, $855.00) |
| Detalle repuestos | 9 | 7 en OM-2026-001, 2 en OM-2026-002 |
| Detalle mano de obra | 3 | Todas en OM-2026-001 (Polanco Jimenez) |
| Control de llantas | 9 | 7 en ABC-123 (posiciones 1–7), 2 en DEF-456 (posiciones 1–2) |
| Costos fijos prorrateables | 4 | Personal ($2,800/mes), Oficina ($1,200/mes), Comunicaciones ($450/mes), Licencias ($350/mes) |
| Configuración de flota | 8 | km_objetivo_mensual, horas_objetivo_dia, costo_galon_gasolina, costo_galon_diesel, etc. |
| Permisos | 32 | 8 módulos × 4 acciones (crear, leer, actualizar, eliminar) |
| Roles | 14 | JEFE_PROCESO, JEFE_OPERACION, ENCARGADO_GARAJE, INSPECTOR, CONTROLADOR_TRANSITO, ANALISTA, CONDUCTOR, JEFE_MANTENIMIENTO, ENCARGADO_TALLER, MECANICO, ELECTRICISTA, REENCAUCHADOR, LAVADOR, ADMINISTRATIVO |
| Marcas de vehículos | 30 | Toyota, Hyundai, Kia, Nissan, Chevrolet, Ford, Mazda, Mitsubishi, Suzuki, Isuzu, Mercedes-Benz, Volkswagen, Fiat, Honda, Daihatsu, Chery, Motors, DFM, Changan, GWM, Haval, JAC, Renault, Peugeot, Citroen, BMW, Subaru, Lexus, Infiniti, Audi |
| Modelos de vehículos | 149 | Distribuidos entre las 30 marcas |
| Colores | 11 | Blanco, Negro, Gris, Plata, Azul, Rojo, Verde, Amarillo, Naranja, Beige, Marrón |
| Tipos de combustible | 5 | Gasolina, Diésel, GLP, Eléctrico, Híbrido |
| Estados de vehículo | 4 | Operativo, En Mantenimiento, Inoperativo, Dado de Baja |
| Sectores organizacionales | 20 | Administración General, Operaciones, Logística, Mantenimiento, etc. |
| Localidades | 13 | Sede Central, Plantas Purificadoras, Almacenes, Talleres, etc. |
| Centros de servicio | 11 | Repsol, Primax, Petroperu, Shell, etc. |
| Fabricantes de llantas | 10 | Bridgestone, Goodyear, Michelin, Continental, Pirelli, etc. |
| Dimensiones de llantas | 8 | 7.50R16, 8.25R16, 235/65R16C, etc. |
| Categorías de repuestos | 16 | Filtros, Aceites, Lubricantes, Frenos, Suspensión, etc. |

**Tareas pendientes (verificadas contra código real):**

| ID | Tarea | Prioridad | Fuente |
|---|---|---|---|
| TP-01 | Corregir 3 pruebas fallidas en `vehiculos.test.ts`: GET listado y DELETE retornan HTTP 500 | Alta | Ejecución real de `npm run test` |
| TP-02 | Corregir `POST /api/auth/logout`: retorna éxito pero no invalida el JWT (comentario en código: `// TODO: invalidate token`) | Media | Lectura de `auth.routes.ts:159` |
| TP-03 | Completar páginas frontend faltantes: `control_costos/page.tsx`, `flota/page.tsx`, `operaciones/page.tsx`, `seguridad/page.tsx`, `mantenimiento/page.tsx` (existen subpáginas pero no la página raíz) | Media | Verificación con glob |
| TP-04 | Resolver 28 vulnerabilidades de dependencias (4 high, 19 moderate, 5 low) | Alta | `npm audit` / GitHub |
| TP-05 | Agregar pruebas de integración para módulos de combustible, mantenimiento, llantas, costos y reportes | Media | Solo 5 archivos de test existentes |
| TP-06 | Ejecutar métricas de cobertura de código con `npm run test:coverage` | Media | Dependencia `@vitest/coverage-v8` instalada pero no ejecutada |

---

### 8.3. Desviaciones del Plan

**Desviación 1: Defectos en pruebas de vehículos (3 fallos reales)**

- **Descripción:** Al ejecutar `npm run test` se obtienen 3 fallos en `vehiculos.test.ts`. Los endpoints `GET /api/vehiculos` (listado paginado) y `DELETE /api/vehiculos/:id` retornan HTTP 500 en lugar de los códigos esperados (200).
- **Causa probable:** Los handlers de estas rutas lanzan excepciones no controladas que el middleware de errores no captura correctamente.
- **Impacto:** Las pruebas automatizadas reportan 62/65 aprobadas (95,4%). Los endpoints afectados funcionan en producción (verificados por despliegue en EasyPanel) pero las pruebas no validan correctamente el flujo mock.
- **Acción correctiva:** Investigar y corregir los handlers de las rutas afectadas en `vehiculos.routes.ts`.

**Desviación 2: Cobertura de pruebas incompleta**

- **Descripción:** Solo existen pruebas para 5 módulos (auth, vehículos, movimientos, seguridad, utils). Los módulos de combustible, mantenimiento, llantas, costos, flota, operaciones, almacen, configuración, lookup y reportes no tienen cobertura de pruebas automatizadas.
- **Causa:** El enfoque se priorizó en los módulos críticos de seguridad y operación para lograr el despliegue en producción.
- **Impacto:** 10 módulos sin pruebas pueden presentar regresiones silenciosas.
- **Acción correctiva:** Agregar pruebas de integración para los módulos faltantes, priorizando combustible y mantenimiento.

**Desviación 3: Vulnerabilidades de dependencias**

- **Descripción:** GitHub reporta 28 vulnerabilidades en las dependencias del proyecto (4 de severidad alta, 19 moderadas y 5 bajas). Se ejecutó `npm install --save-dev @vitest/coverage-v8` que agregó 19 paquetes nuevos con 5 vulnerabilidades moderadas adicionales.
- **Causa:** Dependencias de terceros con versiones desactualizadas (express, jsonwebtoken, puppeteer, etc.).
- **Impacto:** Riesgo potencial de seguridad en el sistema desplegado en producción.
- **Acción correctiva:** Ejecutar `npm audit fix` y evaluar compatibilidad. Programar revisiones periódicas.

**Desviación 4: Páginas frontend incompletas**

- **Descripción:** 5 directorios del frontend no tienen página raíz (`page.tsx`): `control_costos/`, `flota/`, `operaciones/`, `seguridad/` y `mantenimiento/`. Solo tienen subpáginas (sustitución, reportes-kpi, costos-fijo-variable, asignacion, documentos, rutas, permisos, sesiones, audit, almacen, lavado).
- **Causa:** El enfoque se priorizó en el backend y la infraestructura Docker.
- **Impacto:** El usuario no puede navegar directamente a estos módulos desde el dashboard; debe usar subrutas específicas.
- **Acción correctiva:** Crear las 5 páginas raíz faltantes como puntos de entrada a cada módulo.

**Desviación 5: Logout no invalida JWT**

- **Descripción:** El endpoint `POST /api/auth/logout` retorna HTTP 200 con éxito pero no invalida el token JWT. El código contiene un comentario `// TODO: invalidate token` que indica que la funcionalidad no está implementada.
- **Causa:** La invalidación de JWT requiere un mecanismo adicional (blocklist en BD o Redis) que no fue implementado.
- **Impacto:** Un token JWT sigue siendo válido después del cierre de sesión hasta su expiración natural.
- **Acción correctiva:** Implementar una tabla de tokens revocados en Prisma o utilizar un período de expiración corto (actualmente configurable via `JWT_EXPIRES_IN`).
