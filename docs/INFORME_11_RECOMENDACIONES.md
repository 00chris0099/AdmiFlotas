## 11. RECOMENDACIONES

### 11.1. Recomendaciones para la mejora del sistema actual

**R1: Completar la cobertura de pruebas automatizadas**

Priorizar la implementación de pruebas de integración para los 10 módulos del backend que actualmente carecen de cobertura: combustible, mantenimiento, llantas, costos, flota, operaciones, almacén, configuración, lookup y reportes. Establecer como criterio de calidad mínimo que cada endpoint tenga al menos una prueba de integración que valide el flujo completo desde la HTTP request hasta la respuesta de la base de datos.

*Justificación:* Los módulos sin pruebas representan un riesgo de regresión silenciosa. Las 65 pruebas actuales solo cubren el 33% de los módulos, lo que deja expuesta la mayoría de la lógica de negocio a fallos no detectados en futuras actualizaciones.

**R2: Resolver las vulnerabilidades de dependencias**

Ejecutar `npm audit fix` para corregir las vulnerabilidades con correcciones disponibles sin breaking changes. Para las vulnerabilidades transitivas que requieren actualizaciones mayores (Prisma, ExcelJS), evaluar la compatibilidad y planificar la migración en un sprint dedicado. Implementar `npm audit` como paso obligatorio del pipeline de CI/CD para detectar vulnerabilidades nuevas antes del despliegue.

*Justificación:* Las 28 vulnerabilidades identificadas (4 de severidad alta) incrementan innecesariamente la superficie de ataque del sistema desplegado en producción.

**R3: Implementar la invalidación de tokens JWT en cierre de sesión**

Crear una tabla `tokens_revocados` en Prisma que almacene el identificador del token (JTI) y la fecha de expiración. Modificar el endpoint `POST /api/auth/logout` para registrar el token en esta tabla antes de retornar éxito. Agregar un middleware que verifique si el token está revocado antes de procesar cada request autenticada.

*Justificación:* El cierre de sesión actual no invalida el token, lo que permite que un usuario mantenga acceso después de cerrar sesión. Esta es una brecha de seguridad que debe cerrarse en un entorno de producción.

**R4: Crear las páginas frontend faltantes**

Desarrollar las 5 páginas raíz (`page.tsx`) para los módulos `control_costos/`, `flota/`, `operaciones/`, `seguridad/` y `mantenimiento/`. Cada página debe funcionar como punto de entrada que permita navegar a las subpáginas existentes dentro de cada módulo.

*Justificación:* La ausencia de puntos de entrada obliga al usuario a memorizar rutas específicas, lo que genera una experiencia de usuario inconsistente y dificulta la adopción del sistema.

**R5: Implementar invalidación de tokens en backend**

Crear un mecanismo de blocklist de tokens (usando Redis o una tabla en PostgreSQL) que permita invalidar tokens JWT antes de su expiración natural. Esto complementa la invalidación en logout y permite revocar tokens de usuarios suspendidos o comprometidos.

*Justificación:* Sin blocklist, un token comprometido sigue siendo válido hasta su expiración, independientemente de las acciones tomadas por el administrador.

### 11.2. Recomendaciones para la gestión del proyecto

**R6: Establecer un proceso de revisión de código**

Implementar revisiones de código obligatorias antes de fusionar cambios a la rama principal. Utilizar pull requests con al menos una aprobación de un miembro del equipo que no sea el autor del cambio. Definir una lista de verificación de revisión que incluya: tipos correctos, validación de entrada, manejo de errores, y cobertura de pruebas.

*Justificación:* Las revisiones de código mejoran la calidad del software, comparten conocimiento entre el equipo, y previenen la introducción de defectos que podrían haberse detectado antes de la fusión.

**R7: Documentar la deuda técnica en un archivo dedicado**

Crear y mantener un archivo `DEBT.md` en la raíz del proyecto que registre todas las funcionalidades a medio implementar, las limitaciones conocidas, y las decisiones pendientes. Cada entrada debe incluir: descripción, nivel de riesgo (alto/medio/bajo), esfuerzo estimado para resolverlo, y fecha de registro.

*Justificación:* Los comentarios en el código fuente tienden a pasarse por alto. Un archivo dedicado de deuda técnica es visible, mantenible, y permite priorizar su resolución de forma estructurada.

**R8: Implementar un pipeline de CI/CD básico**

Configurar un pipeline automatizado (GitHub Actions, GitLab CI, o similar) que ejecute: (1) verificación de tipos con TypeScript, (2) pruebas automatizadas con Vitest, (3) auditoría de dependencias con npm audit, y (4) construcción del Dockerfile. Este pipeline debe ejecutarse automáticamente en cada push a la rama principal.

*Justificación:* Un pipeline automatizado detecta errores antes de que lleguen a producción, reduce el tiempo de integración, y proporciona confianza en cada despliegue.

**R9: Establecer un calendario de mantenimiento de dependencias**

Programar revisiones mensuales de las dependencias del proyecto utilizando `npm outdated` y `npm audit`. Actualizar las dependencias de forma incremental, evitando acumulaciones grandes que dificulten la migración. Mantener un registro de las actualizaciones realizadas y sus impactos.

*Justificación:* Las dependencias desactualizadas acumulan vulnerabilidades y perd compatibilidad con nuevas funcionalidades de las bibliotecas.

### 11.3. Recomendaciones para la escalabilidad

**R10: Implementar caché de consultas frecuentes**

Introducir una capa de caché (Redis o caché en memoria) para las consultas que se ejecutan frecuentemente: listado de vehículos, datos de referencia (marcas, modelos, colores), y reportes KPI. Establecer políticas de invalidación de caché basadas en el tipo de datos (datos estáticos vs. datos transaccionales).

*Justificación:* Las consultas frecuentes a la base de datos generan carga innecesaria. Una capa de caché reduce la latencia de respuesta y disminuye la presión sobre PostgreSQL.

**R11: Preparar la arquitectura para microservicios**

Documentar los límites de contexto de cada módulo (autenticación, flota, combustible, mantenimiento) y definir las interfaces de comunicación entre ellos. Esta documentación servirá como base para una eventual migración a microservicios si el volumen de usuarios o la complejidad del sistema lo requiere.

*Justificación:* La arquitectura monolítica actual es adecuada para el volumen actual, pero la documentación de límites de contexto facilita una migración futura sin rediseñar desde cero.

**R12: Implementar monitoreo y métricas de producción**

Configurar herramientas de monitoreo (Prometheus, Grafana, o similar) que capturen métricas de la aplicación: tiempo de respuesta de endpoints, tasa de errores, uso de memoria, y conexión a la base de datos. Establecer alertas para condiciones anormales (tiempos de respuesta superiores a 2 segundos, tasa de errores superior al 1%).

*Justificación:* Sin monitoreo, los problemas de producción solo se detectan cuando los usuarios reportan fallos. Las métricas permiten identificar cuellos de botella y problemas de rendimiento de forma proactiva.

### 11.4. Recomendaciones para el equipo

**R13: Establecer sesiones de conocimiento compartido**

Organizar sesiones semanales donde los miembros del equipo compartan: (1) problemas encontrados y soluciones aplicadas, (2) nuevas funcionalidades o mejoras implementadas, (3) lecciones aprendidas de errores. Documentar los acuerdos y action items en un archivo compartido.

*Justificación:* El conocimiento compartido reduce la dependencia de un solo miembro del equipo, acelera la resolución de problemas, y mejora la calidad colectiva del código.

**R14: Crear una guía de estilos de código**

Documentar las convenciones de código utilizadas en el proyecto: nomenclatura de variables y funciones, estructura de archivos, patrones de diseño utilizados, y configuración de herramientas (ESLint, Prettier). Esta guía debe estar disponible para nuevos miembros del equipo.

*Justificación:* Una guía de estilos consistente reduce la fricción en las revisiones de código, mejora la legibilidad, y facilita la incorporación de nuevos desarrolladores.

**R15: Implementar pair programming selectivo**

Utilizar pair programming para tareas de alta complejidad o alto riesgo: (1) corrección de vulnerabilidades de seguridad, (2) modificaciones al esquema de base de datos, (3) implementación de funcionalidades críticas de negocio. Esta práctica combina conocimiento y reduce la probabilidad de errores en secciones sensibles del sistema.

*Justificación:* El pair programming en tareas críticas mejora la calidad del código, comparte el conocimiento del dominio, y reduce el riesgo de defectos en funcionalidades sensibles.

### 11.5. Resumen de prioridades

| Prioridad | Recomendación | Esfuerzo estimado | Impacto |
|---|---|---|---|
| Crítica | R3: Invalidación JWT en logout | 2-3 días | Seguridad |
| Crítica | R2: Vulnerabilidades de dependencias | 1-2 días | Seguridad |
| Alta | R1: Cobertura de pruebas | 1-2 semanas | Calidad |
| Alta | R4: Páginas frontend faltantes | 3-5 días | UX |
| Alta | R8: Pipeline CI/CD | 2-3 días | Proceso |
| Media | R5: Blocklist de tokens | 2-3 días | Seguridad |
| Media | R6: Revisiones de código | 1 día (setup) | Proceso |
| Media | R7: Archivo DEBT.md | 1 día (setup) | Gestión |
| Media | R9: Mantenimiento de dependencias | 1 día/mes | Mantenimiento |
| Baja | R10: Capa de caché | 3-5 días | Rendimiento |
| Baja | R11: Documentación de microservicios | 2-3 días | Escalabilidad |
| Baja | R12: Monitoreo en producción | 2-3 días | Operaciones |
| Baja | R13: Sesiones de conocimiento | 1 hora/semana | Equipo |
| Baja | R14: Guía de estilos | 1 día (setup) | Equipo |
| Baja | R15: Pair programming selectivo | Continuo | Equipo |
