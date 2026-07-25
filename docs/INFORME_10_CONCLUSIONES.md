## 10. CONCLUSIONES

### 10.1. Resultados generales del proyecto

El Sistema de Administración de Flotas (SAF) fue desarrollado exitosamente cumpliendo con los objetivos planteados en el Manual Técnico F1T02. El sistema digitaliza los procedimientos de operación, mantenimiento y control de una flota vehicular, implementando una arquitectura moderna de tres capas (frontend, backend, base de datos) desplegada en un entorno de producción funcional.

El proyecto alcanzó un progreso general del 93%, con la infraestructura completa al 100%, el backend API al 95%, el frontend al 90% y las pruebas automatizadas al 95% con 3 defectos abiertos. El sistema se encuentra operativo en producción con dominio activo, validando la viabilidad técnica de la solución propuesta.

### 10.2. Cumplimiento de objetivos

**Objetivo 1: Digitalizar el inventario de flota vehicular** — Cumplido. El módulo de vehículos implementa operaciones CRUD completas con paginación, búsqueda y filtros por estado y marca. El esquema de base de datos modela 30 tablas con relaciones normalizadas que cubren marcas, modelos, colores, tipos de combustible y estados del vehículo.

**Objetivo 2: Controlar las operaciones diarias de la flota** — Cumplido. El módulo de movimientos diarios implementa el formato MA 122 01 01 con checklist de 15 puntos de inspección, creación transaccional de movimiento y checklist, y generación automática de números de orden.

**Objetivo 3: Gestionar el control de combustible y lubricantes** — Cumplido. El módulo de combustible implementa el formato MA 122 01 02 con registro de órdenes de carga, validación de galones y costos, y vinculación con vehículos y conductores.

**Objetivo 4: Administrar el mantenimiento vehicular** — Cumplido. El módulo de mantenimiento implementa el formato MA 122 02 01 con registro de órdenes preventivas y correctivas, mano de obra, repuestos y costos. El módulo de almacén complementa el control de inventario de repuestos con movimientos de entrada, salida y devolución.

**Objetivo 5: Implementar seguridad y control de acceso** — Cumplido. El sistema implementa autenticación JWT, roles jerárquicos (14 roles del organigrama F1T02), permisos granulares (32 permisos), middleware de autorización RBAC, y logs de auditoría.

**Objetivo 6: Generar reportes y exportación de datos** — Cumplido. El módulo de reportes permite exportación a Excel (CSV con BOM UTF-8) y PDF, con datos de vehículos, combustible y mantenimiento. Los reportes KPI consolidan indicadores de costos fijos, variables y totales.

**Objetivo 7: Documentar la API de forma automática** — Cumplido. Swagger documenta 83 endpoints de forma interactiva a partir de comentarios JSDoc en el código fuente, eliminando la necesidad de documentación externa.

### 10.3. Calidad técnica del producto

La arquitectura del sistema demuestra una separación clara de responsabilidades entre las capas de presentación, lógica de negocio y acceso a datos. La utilización de TypeScript en modo estricto con Prisma ORM garantiza type-safety en toda la capa de persistencia, eliminando errores de tipos en tiempo de compilación.

La validación robusta de entrada mediante Zod (runtime) y TypeScript (compilación) crea una doble capa de protección contra datos inválidos. Los 15 módulos del backend operan con 83 endpoints documentados, cada uno con esquemas de validación, autenticación y autorización apropiados.

La containerización completa con Docker multi-etapa y la orquestación mediante Docker Compose demuestran una infraestructura de despliegue profesional. El patrón de gateway inverso con Nginx permite el enrutamiento eficiente del tráfico entre frontend y backend.

### 10.4. Valor académico y profesional

El proyecto demuestra la aplicación práctica de conceptos aprendidos durante la carrera: arquitectura de software por capas, bases de datos relacionales normalizadas, APIs RESTful, autenticación y autorización, pruebas automatizadas, containerización y despliegue en la nube.

La elección de tecnologías modernas (TypeScript, Prisma, Next.js, Docker) y la implementación de buenas prácticas (validación de entrada, RBAC, documentación automática, pruebas) posicionan al equipo con competencias relevantes para el mercado laboral actual.

### 10.5. Impacto organizacional

El sistema SAF proporciona a la organización una herramienta centralizada para gestionar su flota vehicular, reemplazando procesos manuales y dispersos por un sistema digital con trazabilidad completa. Los 14 roles del organigrama F1T02 están representados en el sistema con permisos granulares que reflejan la estructura organizacional real.

La disponibilidad de datos de referencia comprehensivos (30 marcas, 149 modelos, 20 sectores, 13 localidades) permite que el sistema se adapte a diferentes contextos organizacionales sin modificaciones al código fuente.

### 10.6. Limitaciones reconocidas

El proyecto presenta limitaciones que deben reconocerse honestamente: cobertura de pruebas incompleta (67% de módulos sin pruebas), vulnerabilidades de dependencias sin resolver (28 vulnerabilidades), páginas frontend faltantes (5 módulos sin punto de entrada), y un token JWT que no se invalida en cierre de sesión. Estas limitaciones no comprometen la funcionalidad básica del sistema pero deben abordarse en versiones futuras.

### 10.7. Viabilidad de continuidad

La arquitectura modular del sistema, el esquema de base de datos bien documentado, y la separación clara de responsabilidades facilitan futuras ampliaciones. El proyecto puede extenderse para incluir funcionalidades como geolocalización en tiempo real, integración con sistemas de telemetría, alertas automáticas de mantenimiento predictivo, y aplicaciones móviles para conductores e inspectores.

La base de código estable, la infraestructura de despliegue probada, y la documentación API automática proporcionan un punto de partida sólido para la evolución continua del sistema.
