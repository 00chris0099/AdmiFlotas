## 6. PRUEBAS Y CALIDAD

### 6.1. Estrategia de Pruebas

El proyecto SAF implementa una estrategia de pruebas de software orientada a validar la correcta funcionalidad, seguridad e integridad de los datos en cada capa de la aplicación. Las pruebas se clasifican en los siguientes niveles:

**Pruebas unitarias:**
Se enfocan en validar componentes individuales del sistema de forma aislada. Verifican el comportamiento correcto de funciones utilitarias, clases de manejo de errores, generadores de plantillas HTML para correos electrónicos, y esquemas de validación con Zod. Estas pruebas se ejecutan de forma rápida y frecuente durante el desarrollo.

- *Ejemplo:* Pruebas de la clase `AppError` y sus subclases (`BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`), validando que cada una retorna el código HTTP correcto.
- *Ejemplo:* Pruebas de los esquemas Zod (`loginSchema`, `createVehiculoSchema`, `createMovimientoSchema`, `createOrdenCombustibleSchema`) para confirmar que aceptan datos válidos y rechazan datos inválidos.
- *Ejemplo:* Pruebas de las funciones `sendSuccess`, `sendCreated`, `sendNoContent`, `sendError`, `sendPaginated` del módulo `apiResponse`, verificando el formato de respuesta y el cálculo de paginación.

**Pruebas de integración:**
Validan la correcta interacción entre múltiples componentes del sistema, incluyendo la capa de rutas HTTP, middlewares de autenticación y autorización, y las consultas a la base de datos (simuladas mediante mocks). Utilizan el framework **Supertest** para realizar peticiones HTTP reales a la aplicación Express montada en un servidor de prueba.

- *Auth:* Pruebas de login con credenciales válidas, credenciales inválidas, usuario inactivo, usuario bloqueado temporalmente, solicitud de cambio de contraseña y confirmación de cuenta.
- *Vehículos:* Pruebas CRUD de vehículos (listar con paginación, obtener por ID, crear, actualizar, eliminar) y validación de permisos RBAC.
- *Movimientos diarios:* Pruebas de creación de movimientos con y sin checklist de verificación, listado paginado de movimientos, consulta de checklists y eliminación.
- *Seguridad:* Pruebas de administración de permisos (asignar, eliminar, listar), gestión de sesiones (listar, cerrar remotamente), y consulta de logs de auditoría con filtros por módulo y rango de fechas.
- *Middleware RBAC:* Pruebas unitarias del middleware `requireRole` verificando el acceso para roles coincidentes, rechazo para roles no coincidentes y rechazo para usuarios no autenticados.

**Pruebas de validación de contratos (Contract Testing):**
Verifican que los DTOs de TypeScript en el backend coincidan exactamente con las propiedades que el frontend Next.js espera recibir, utilizando tipos auto-generados.

**Pruebas de transaccionalidad:**
Simulan escenarios donde una operación compuesta falla a mitad de camino para confirmar que la transacción se revierte correctamente (rollback) y no deja datos inconsistentes en la base de datos.

**Pruebas de integridad referencial:**
Validan que la base de datos rechace operaciones que violarían restricciones de claves foráneas (por ejemplo, intentar eliminar un vehículo con órdenes de combustible asociadas).

**Configuración del entorno de pruebas:**
- Las pruebas se ejecutan en un entorno aislado con variables de entorno definidas en `.env.test`.
- Se utiliza un archivo `setup.ts` que carga las variables de entorno antes de cada ejecución de pruebas.
- Los mocks de Prisma y middlewares se configuran por cada suite de pruebas para aislar las dependencias externas.

---

### 6.2. Resultados de las Pruebas

**Resumen general de ejecución:**

| Métrica | Valor |
|---|---|
| Total de pruebas ejecutadas | **65** |
| Pruebas aprobadas | **62** (95,4%) |
| Pruebas fallidas | **3** (4,6%) |
| Archivos de prueba totales | **5** |
| Archivos aprobados | **4** (80%) |
| Archivos con fallos | **1** (vehiculos.test.ts) |
| Duración total de ejecución | **~2,66 segundos** |

**Desglose por archivo de prueba:**

| Archivo de Prueba | Tipo | Aprobadas | Fallidas | Total | Módulo |
|---|---|---|---|---|---|
| `auth.test.ts` | Integración | 11 | 0 | 11 | Autenticación |
| `vehiculos.test.ts` | Integración | 4 | 3 | 7 | Vehículos |
| `movimientos.test.ts` | Integración | 5 | 0 | 5 | Movimientos Diarios |
| `seguridad.test.ts` | Integración + Unitaria | 14 | 0 | 14 | Seguridad y RBAC |
| `utils.test.ts` | Unitaria | 28 | 0 | 28 | Utilidades y Esquemas |
| **Total** | | **62** | **3** | **65** | |

**Escenarios aprobados más significativos:**

- **Login con usuario bloqueado temporalmente (403):** Se verifica que un usuario con `bloqueadoHasta` en una fecha futura no pueda autenticarse, independientemente de que su contraseña sea correcta.
- **Creación transaccional de movimiento con checklist:** Se valida que la creación de un movimiento diario junto con su checklist de verificación se ejecute dentro de una transacción de base de datos, asegurando atomicidad.
- **RBAC - Rechazo de usuario no autenticado:** Se confirma que el middleware `requireRole` rechaza correctamente solicitudes donde no existe un usuario autenticado en la sesión.
- **Paginación con cálculo de total de páginas:** Se valida que la función `sendPaginated` calcule correctamente el número total de páginas (por ejemplo, 55 registros con 20 por página = 3 páginas).
- **Validación de esquemas Zod - Rechazo de datos inválidos:** Se verifica que los esquemas de validación rechacen emails con formato incorrecto, contraseñas demasiado cortas, placas faltantes y valores negativos para campos numéricos.
- **Gestión de permisos RBAC:** Se validan las operaciones de asignación, eliminación y listado de permisos, incluyendo detección de duplicados (código 409).
- **Cierre remoto de sesiones:** Se verifica que un administrador pueda cerrar sesiones activas de otros usuarios.
- **Logs de auditoría con filtros:** Se confirma el filtrado por módulo y rango de fechas en los registros de auditoría.

**Defectos encontrados durante la ejecución de pruebas:**

| ID | Descripción | Severidad | Estado |
|---|---|---|---|
| DEF-01 | El endpoint `GET /api/vehiculos` retorna HTTP 500 en lugar de 200 al listar vehículos con paginación | Alta | Abierto |
| DEF-02 | El endpoint `GET /api/vehiculos?page=2&limit=10` retorna HTTP 500 al recibir parámetros de paginación | Alta | Abierto |
| DEF-03 | El endpoint `DELETE /api/vehiculos/:id` retorna HTTP 500 en lugar de 200 al eliminar un vehículo | Alta | Abierto |

**Análisis de los defectos:**

Los tres defectos identificados se encuentran en el archivo `vehiculos.test.ts` y comparten una causa raíz probable: los handlers de las rutas HTTP para listado paginado y eliminación de vehículos están lanzando una excepción no controlada que el middleware de errores no está capturando correctamente, resultando en una respuesta HTTP 500 (Internal Server Error) en lugar del código esperado.

Los escenarios afectados son:
- **Listado de vehículos con paginación** (GET con query params `page` y `limit`).
- **Eliminación de vehículo** (DELETE con parámetro `:id`).

Los demás módulos del sistema (autenticación, movimientos diarios, seguridad/RBAC, utilidades) funcionan correctamente con una tasa de éxito del 100%.

**Métricas de cobertura de pruebas:**

La configuración de **Vitest** define cobertura mediante el proveedor **v8**, con los siguientes parámetros:
- **Archivos incluidos:** Todos los archivos `.ts` en `src/`.
- **Archivos excluidos:** La carpeta `src/__tests__/` y el archivo `src/config/database.ts` (capa de acceso a datos que se evalúa a través de mocks en pruebas de integración).
- **Timeout de ejecución:** 10 segundos por prueba.
- **Proveedor de cobertura:** V8 (integrado en Vitest).
- **Comando de ejecución:** `npm run test:coverage`.

---

### 6.3. Aseguramiento de la Calidad

El aseguramiento de la calidad del software en el proyecto SAF se garantiza mediante la combinación de procesos técnicos, herramientas automatizadas y revisiones manuales del código.

**Procesos de aseguramiento:**

1. **Verificación estática del código (Linting):**
   - Se utiliza **ESLint** para el análisis estático del código TypeScript, detectando errores comunes, código no utilizado, patrones inseguros y violaciones de las convenciones del equipo.
   - El comando `npm run lint` se ejecuta como parte del flujo de desarrollo y se integra en el proceso de CI/CD.

2. **Verificación de tipos en tiempo de compilación:**
   - **TypeScript en modo estricto** (`strict: true`) actúa como una primera línea de defensa contra errores de tipos, argumentos faltantes, retornos incorrectos y asignaciones inválidas.
   - El comando `npm run typecheck` ejecuta la verificación de tipos sin generar archivos de salida, lo que lo hace ideal para integración en procesos de verificación continua.

3. **Pruebas automatizadas:**
   - Las pruebas se ejecutan con **Vitest** mediante `npm run test` antes de cada fusión de código.
   - La ejecución de pruebas se integra en el pipeline de CI/CD para阻断 la integración de código que rompa funcionalidad existente.

4. **Revisión de código (Code Review):**
   - Toda función, corrección o refactorización pasa por un proceso de revisión mediante Pull Request antes de ser fusionada a la rama `develop`.
   - La revisión verifica la correcta implementación, la adherencia a los estándares de codificación, la ausencia de vulnerabilidades de seguridad y la inclusión de pruebas cuando aplica.

5. **Validación de esquemas de entrada:**
   - Todos los endpoints de la API validan los datos de entrada mediante **Zod** antes de procesarlos, previniendo errores de tipo, campos faltantes y valores fuera de rango.
   - Los esquemas se definen en la carpeta `schemas/` y se reutilizan entre rutas.

6. **Seguridad de la aplicación:**
   - Se implementan middlewares de seguridad: **Helmet** (protección de cabeceras HTTP), **CORS** (control de origen de peticiones), y **express-rate-limit** (limitación de tasa para prevenir abuso).
   - Las contraseñas se almacenan cifradas con **bcryptjs** (factor de costo estándar).
   - La autenticación se gestiona mediante **JWT** con tiempo de expiración configurable (`JWT_EXPIRES_IN`).
   - Se implementa control de bloqueo temporal de usuarios tras múltiples intentos fallidos de login.

7. **Auditoría y trazabilidad:**
   - El sistema registra logs de auditoría para acciones críticas (login, cambios de permisos, eliminación de usuarios), permitiendo la trazabilidad de operaciones sensibles.
   - Los logs se almacenan en la base de datos y se consultan desde un panel de administración con filtros por módulo, acción y rango de fechas.

8. **Documentación de la API:**
   - Se utiliza **Swagger (OpenAPI)** mediante `swagger-jsdoc` y `swagger-ui-express` para documentar los endpoints de la API de forma interactiva y autogenerada.

**Herramientas de aseguramiento de calidad:**

| Herramienta | Función | Ejecución |
|---|---|---|
| **ESLint** | Análisis estático y detección de errores de código | `npm run lint` |
| **TypeScript Compiler** | Verificación de tipos | `npm run typecheck` |
| **Vitest v4.1.10** | Ejecución de pruebas unitarias e de integración | `npm run test` |
| **@vitest/coverage-v8** | Generación de métricas de cobertura de código | `npm run test:coverage` |
| **Zod** | Validación de esquemas de entrada en runtime | Integrado en rutas |
| **Supertest** | Ejecución de pruebas HTTP de integración | Integrado en pruebas |
| **Helmet** | Seguridad de cabeceras HTTP | Middleware global |
| **express-rate-limit** | Limitación de tasa de peticiones | Middleware global |
| **Swagger** | Documentación interactiva de la API | Disponible en `/api-docs` |
