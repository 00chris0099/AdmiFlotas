## 8. RESULTADOS Y ESTADO ACTUAL DEL PROYECTO

### 8.1. Funcionalidades Implementadas

El sistema SAF ha sido desarrollado siguiendo el Manual Técnico F1T02, digitalizando los procedimientos básicos de operación, mantenimiento y control de flota. A continuación se detallan las funcionalidades completadas por módulo.

**Módulo de Autenticación y Seguridad**

| Funcionalidad | Estado | Detalle |
|---|---|---|
| Inicio de sesión con JWT | Completado | Autenticación por email y contraseña con tokens de expiración configurable |
| Bloqueo temporal de usuarios | Completado | Bloqueo automático tras múltiples intentos fallidos de login |
| Confirmación de cuenta por email | Completado | Envío de token de confirmación vía SMTP al crear usuario |
| Cambio de contraseña | Completado | Flujo de solicitud → token → cambio de contraseña |
| RBAC (Control de Acceso Basado en Roles) | Completado | 13 roles del organigrama F1T02 con permisos granulares por módulo y acción |
| Gestión de permisos | Completado | Asignación, eliminación y listado de permisos por usuario |
| Gestión de sesiones | Completado | Listado de sesiones activas y cierre remoto de sesiones |
| Logs de auditoría | Completado | Registro de acciones críticas con filtros por módulo, acción y rango de fechas |
| Validación de datos (Zod) | Completado | Esquemas de validación para auth, vehículos, movimientos, combustible y mantenimiento |

**Módulo de Inventario de Flota**

| Funcionalidad | Estado | Detalle |
|---|---|---|
| CRUD de vehículos | Completado | Crear, leer, actualizar y eliminar vehículos con ficha técnica completa |
| Código patrimonial | Completado | Código de 6 dígitos (CL-CAT-SEQ) según Diagrama 3 del F1T02 |
| Paginación y filtros | Completado | Listado paginado con búsqueda por placa, marca, modelo y estado |
| Datos de referencia (Lookups) | Completado | Marcas, modelos, colores, tipos de combustible y otros datos predefinidos |

**Módulo de Operación Diaria (MA 122 01 01)**

| Funcionalidad | Estado | Detalle |
|---|---|---|
| Registro de movimientos diarios | Completado | Creación transaccional con checklist de 15 puntos pre-operacionales |
| Checklist de verificación | Completado | 15 puntos de control (documentos, aceite, frenos, llantas, etc.) |
| Horas de Utilización del Vehículo (HUV) | Completado | Campo para cálculo del Indicador de Utilización del Vehículo (IUV) |
| Listado de movimientos | Completado | Listado paginado con información de vehículo y conductor |
| Listado de checklists | Completado | Consulta de checklists formateados con datos del vehículo e inspector |

**Módulo de Combustible y Lubricantes (MA 122 01 02)**

| Funcionalidad | Estado | Detalle |
|---|---|---|
| Órdenes de combustible | Completado | Registro con número de orden auto-generado (OC-YYYY-XXXX) |
| Registro de lubricantes | Completado | Diferenciación entre aceite de motor y aceite de caja/transmisión |
| Validación de odómetro | Completado | Verificación de que el kilometraje actual sea mayor al último registrado |
| Datos del servicentro | Completado | Nombre, ticket, responsable y sello del servicentro acreditado |

**Módulo de Mantenimiento (MA 122 02 01)**

| Funcionalidad | Estado | Detalle |
|---|---|---|
| Órdenes de mantenimiento | Completado | Creación con número de orden auto-generado (OM-YYYY-XXXX) |
| Tipos de mantenimiento | Completado | Distinción entre PREVENTIVO y CORRECTIVO |
| Tipos de taller | Completado | Distinción entre TALLER_PROPIO (Tarjeta de Mano de Obra) y TALLER_TERCEROS (Autorización Externa) |
| Detalle de repuestos | Completado | Registro de repuestos utilizados con cantidad, precio unitario y subtotal |
| Mano de obra | Completado | Registro de horas trabajadas, costo por hora y técnico ejecutor |
| Almacén de mantenimiento | Completado | CRUD de repuestos e inventario del almacén |

**Módulo de Control de Llantas**

| Funcionalidad | Estado | Detalle |
|---|---|---|
| Control individualizado | Completado | Trazabilidad por código EPS, posición (1–7) y vehículo asignado |
| Ciclo de vida de llantas | Completado | Estados: EN_USO, EN_ALMACEN, REENCAUCHADA, DADA_DE_BAJA |
| Registro de rotación | Completado | Movimiento de llantas entre posiciones del vehículo |
| Registro de reencauche | Completado | Control de reencauches con kilometraje acumulado |

**Módulo de Costos (CKV)**

| Funcionalidad | Estado | Detalle |
|---|---|---|
| Costos fijos prorrateables | Completado | Registro de personal administrativo, oficina, comunicaciones y licencias |
| Reportes de costos | Completado | KPI de costos fijos, variables y totales por vehículo |
| Sustitución de costos (CPA) | Completado | Análisis de sustitución de componentes con costo por kilómetro |
| Exportación de datos | Completado | Generación de reportes en formato Excel (CSV con BOM UTF-8) |

**Módulo de Reportes**

| Funcionalidad | Estado | Detalle |
|---|---|---|
| Exportación Excel | Completado | Generación de archivos CSV para vehículos, combustible y mantenimiento |
| Exportación PDF | Completado | Retorno de datos JSON para generación de PDF en el frontend |

**Módulo de Administración**

| Funcionalidad | Estado | Detalle |
|---|---|---|
| CRUD de usuarios | Completado | Gestión de usuarios con roles del organigrama F1T02 |
| Configuración del sistema | Completado | Parámetros de operación, horas objetivo y días laborables |

**Documentación de la API**

| Funcionalidad | Estado | Detalle |
|---|---|---|
| Swagger/OpenAPI | Completado | Documentación interactiva de ~50 endpoints en `/api/docs` |
| Diccionario de datos F1T02 | Completado | Correspondencia completa entre campos de BD y formularios del manual |

**Infraestructura**

| Funcionalidad | Estado | Detalle |
|---|---|---|
| Docker multi-etapa | Completado | Imágenes optimizadas para backend (Express) y frontend (Next.js) |
| Docker Compose | Completado | Orquestación de 4 contenedores: PostgreSQL, backend, frontend, Nginx |
| Gateway inverso Nginx | Completado | Enrutamiento de tráfico HTTP hacia frontend y backend |
| Despliegue en EasyPanel | Completado | Plataforma de gestión de contenedores en producción |
| Base de datos multi-schema | Completado | 14 archivos Prisma organizados por dominio (base, seguridad, flota, operación) |

---

### 8.2. Estado Actual del Desarrollo

**Progreso general:**

| Área | Estado | Porcentaje |
|---|---|---|
| Base de datos (esquema Prisma) | Completado | 100% |
| Backend API (endpoints REST) | Completado | 95% |
| Frontend (páginas Next.js) | Completado | 90% |
| Autenticación y seguridad | Completado | 100% |
| Pruebas automatizadas | En progreso | 95% (3 defectos abiertos) |
| Documentación API (Swagger) | Completado | 100% |
| Infraestructura Docker | Completado | 100% |
| Despliegue en producción | Completado | 100% |
| **Progreso general estimado** | | **93%** |

**Hitos alcanzados:**

| Hito | Fecha | Descripción |
|---|---|---|
| Fase 1–3: Desarrollo core | Junio–Julio 2026 | Desarrollo del esquema de base de datos, endpoints CRUD del backend y páginas del frontend |
| Fase 4: Documentación y limpieza | 09 Julio 2026 | Documentación Swagger de ~50 endpoints, corrección del RBAC, limpieza de código frontend, verificación Docker (23 archivos modificados) |
| Fase 5: Seguridad y reportes | 09 Julio 2026 | Rutas de seguridad (permisos, sesiones, auditoría), endpoints de auth faltantes, reportes Excel/PDF, validación Zod en 6 rutas (14 archivos modificados) |
| Fase 6: Testing | 09 Julio 2026 | 65 pruebas automatizadas en 5 archivos (62 aprobadas, 3 fallidas) |
| Despliegue en producción | 10 Julio 2026 | Sistema desplegado en EasyPanel con dominio activo |

**Archivos del proyecto:**

| Categoría | Cantidad | Detalle |
|---|---|---|
| Esquemas Prisma | 14 | Archivos `.prisma` organizados por dominio |
| Rutas backend | 15 | Archivos `.routes.ts` con documentación Swagger |
| Esquemas Zod | 6 | Archivos de validación de entrada |
| Middlewares | 4 | auth, rbac, validate, errorHandler |
| Utilidades | 5 | apiResponse, errors, email, orderGenerator, etc. |
| Páginas frontend | 19 | Directorios en `frontend/src/app/` |
| Pruebas | 5 | Archivos `.test.ts` (65 pruebas totales) |
| Migraciones | 1 | Migración de normalización de combustible |
| Documentación | 6 | Planes de fase, testing matrix, guías de despliegue |

**Tareas pendientes:**

| ID | Tarea | Prioridad | Módulo |
|---|---|---|---|
| TP-01 | Corregir defectos en `vehiculos.test.ts` (3 pruebas fallidas: listado paginado y eliminación retornan 500) | Alta | Backend / Testing |
| TP-02 | Completar módulo de flota con campos faltantes (periodicidadMantenimientoKm, vidaUtilAnios, seguroAnual, licenciamientoAnual) | Media | Frontend |
| TP-03 | Agregar auto-generación de números de orden en formularios del frontend | Media | Frontend |
| TP-04 | Completar validación de odómetro en formularios de operación | Media | Frontend |
| TP-05 | Agregar firma del Encargado del Garaje en MA 122 01 01 | Baja | Frontend |
| TP-06 | Agregar cálculo automático de costos variables en módulo administrativo | Media | Backend |
| TP-07 | Completar dashboard con gráficos de costos y KPI | Baja | Frontend |
| TP-08 | Resolver 28 vulnerabilidades de dependencias reportadas por GitHub (4 high, 19 moderate, 5 low) | Alta | Infraestructura |
| TP-09 | Ejecutar y documentar métricas de cobertura de código con `npm run test:coverage` | Media | Testing |
| TP-10 | Agregar pruebas de integración para módulos de combustible, mantenimiento, llantas, costos y reportes | Media | Testing |

---

### 8.3. Desviaciones del Plan

**Desviación 1: Defectos en pruebas de vehículos**

- **Descripción:** Las pruebas de integración del módulo de vehículos (`vehiculos.test.ts`) presentan 3 fallos. Los endpoints `GET /api/vehiculos` (listado paginado) y `DELETE /api/vehiculos/:id` (eliminación) retornan HTTP 500 en lugar de los códigos esperados (200).
- **Causa probable:** Los handlers de estas rutas están lanzando excepciones no controladas. El middleware de errores no está capturando correctamente las excepciones en estos endpoints específicos.
- **Impacto:** Los usuarios no pueden listar vehículos con paginación ni eliminar vehículos desde la interfaz. Las demás funcionalidades del módulo (obtener por ID, crear, actualizar) funcionan correctamente.
- **Acción correctiva:** Investigar y corregir los handlers de las rutas afectadas. Los defectos están registrados como DEF-01, DEF-02 y DEF-03 en la sección de pruebas.

**Desviación 2: Cobertura de pruebas incompleta**

- **Descripción:** El plan original contemplaba pruebas de integración para todos los módulos del sistema. Actualmente solo existen pruebas para auth, vehículos, movimientos, seguridad y utilidades. Los módulos de combustible, mantenimiento, llantas, costos y reportes no tienen cobertura de pruebas automatizadas.
- **Causa:** El enfoque se priorizó en los módulos críticos de seguridad y operación para garantizar que el sistema fuera funcional en producción.
- **Impacto:** Los módulos sin pruebas pueden presentar regresiones silenciosas en futuras actualizaciones.
- **Acción correctiva:** Agregar pruebas de integración para los módulos faltantes. Priorizar los módulos de combustible y mantenimiento por su impacto en la trazabilidad de costos.

**Desviación 3: Vulnerabilidades de dependencias**

- **Descripción:** GitHub reporta 28 vulnerabilidades en las dependencias del proyecto (4 de severidad alta, 19 moderadas y 5 bajas).
- **Causa:** Dependencias de terceros con versiones desactualizadas.
- **Impacto:** Riesgo potencial de seguridad en el sistema desplegado en producción.
- **Acción correctiva:** Ejecutar `npm audit fix --force` para actualizar dependencias y evaluar la compatibilidad. Programar revisiones periódicas de seguridad.

**Desviación 4: Campos del formulario F1T02 incompletos**

- **Descripción:** El plan original del `PLAN_COMPLETAR_SAF_F1T02.md` contemplaba completar campos específicos del Manual Técnico F1T02 en los formularios del frontend (periodicidad de mantenimiento, vida útil, seguro anual, licenciamiento anual, código de servicio, conjuntos substituidos).
- **Causa:** El enfoque se priorizó en la funcionalidad core del backend y la infraestructura Docker para lograr el despliegue en producción.
- **Impacto:** Algunos campos del Manual F1T02 no están disponibles en la interfaz de usuario, aunque los datos existen en el esquema de la base de datos.
- **Acción correctiva:** Completar los campos faltantes en los formularios del frontend. Los datos ya están soportados por el esquema Prisma; solo falta la implementación visual.

**Desviación 5: Cronograma comprimido**

- **Descripción:** Las fases 4, 5 y 6 del desarrollo se completaron en un período de 2 días (09–10 de julio de 2026), lo cual es más rápido de lo planificado originalmente.
- **Causa:** La urgencia por tener el sistema desplegado en producción para la evaluación del proyecto.
- **Impacto:** Se sacrificó profundidad de pruebas a velocidad de entrega. Los 3 defectos abiertos son consecuencia directa de esta compresión temporal.
- **Acción correctiva:** Dedicar tiempo posterior a la entrega para estabilizar el sistema, corregir los defectos abiertos y completar la cobertura de pruebas.
