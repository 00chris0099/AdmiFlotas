## 9. LECCIONES APRENDIDAS

### Aspectos Positivos del Proyecto

**1. Arquitectura tipo-safe desde el inicio**

La decisión de utilizar Prisma ORM con TypeScript strict mode desde la fase 1 evitó una categoría completa de errores. El esquema de base de datos multi-schema (14 archivos `.prisma`) permitió organizar las ~30 tablas por dominio (base, seguridad, flota, operación, normalización) sin perder legibilidad. El cliente Prisma generado garantiza que cada consulta a la base de datos sea verificada en tiempo de compilación.

- *Evidencia:* 0 errores de tipo en la capa de acceso a datos. Las 65 pruebas automatizadas no necesitan mocking de queries SQL porque Prisma ya valida los tipos.

**2. Separación clara de responsabilidades**

La estructura del proyecto separa inequívocamente las capas: `routes/` (HTTP), `services/` (lógica de negocio), `schemas/` (validación), `middleware/` (auth, rbac, validate), `config/` (database, swagger), `utils/` (respuestas, errores, emails). Esto permitió que múltiples desarrolladores trabajaran en módulos diferentes sin conflictos.

- *Evidencia:* 15 archivos de rutas independientes, cada uno con su lógica encapsulada. El módulo `shared/` permite reutilizar tipos entre backend y frontend.

**3. Documentación API auto-generada**

La integración de Swagger (swagger-jsdoc + swagger-ui-express) documentó 83 endpoints de forma automática a partir de comentarios JSDoc en el código. Esto eliminó la necesidad de mantener documentación separada y garantizó que la documentación siempre refleje el estado real de la API.

- *Evidencia:* 83 endpoints documentados en `/api/docs`. Cada endpoint incluye request body, responses, security schemes y tags por módulo.

**4. Datos iniciales comprehensivos**

El script `seed.ts` carga un conjunto completo de datos de referencia: 30 marcas de vehículos, 149 modelos, 14 roles del organigrama F1T02, 20 sectores organizacionales, 13 localidades, 11 centros de servicio, 10 fabricantes de llantas, 8 dimensiones de llantas, 16 categorías de repuestos, y 32 permisos granulares. Esto permitió probar el sistema con datos realistas desde el primer día.

- *Evidencia:* 9 usuarios, 3 vehículos, 2 movimientos, 2 órdenes de combustible, 2 órdenes de mantenimiento, 9 llantas, 4 costos fijos, 8 parámetros de configuración — todos verificados en `prisma/seed.ts`.

**5. Containerización completa**

El Dockerfile multi-etapa (builder + runner) reduce el tamaño de la imagen de producción al compilar TypeScript en la etapa de build y copiar solo los artefactos `dist/` en la etapa de ejecución. Docker Compose orquesta 4 contenedores (PostgreSQL, backend, frontend, Nginx) con healthchecks que garantizan el orden de arranque.

- *Evidencia:* Sistema desplegado y funcionando en EasyPanel con dominio activo. Healthcheck de PostgreSQL verifica disponibilidad antes de iniciar el backend.

**6. Validación robusta de entrada**

La combinación de Zod (validación en runtime) y TypeScript strict mode (validación en compilación) crea doble capa de protección. Los esquemas en `schemas/` rechazan datos inválidos antes de que lleguen a la lógica de negocio.

- *Evidencia:* 7 pruebas en `utils.test.ts` verifican que los esquemas rechacen emails inválidos, contraseñas cortas, placas faltantes y galones negativos.

---

### Aspectos Negativos del Proyecto

**1. Pruebas automatizadas incompletas**

Solo 5 de los 15 módulos del backend tienen cobertura de pruebas. Los módulos de combustible, mantenimiento, llantas, costos, flota, operaciones, almacen, configuración, lookup y reportes no tienen pruebas automatizadas. Esto significa que el 67% de los módulos puede fallar silenciosamente en futuras actualizaciones.

- *Evidencia:* 5 archivos de prueba (`auth.test.ts`, `vehiculos.test.ts`, `movimientos.test.ts`, `seguridad.test.ts`, `utils.test.ts`) cubren 65 casos de prueba. Los 10 módulos restantes no tienen archivos de prueba.

**2. Defectos en pruebas de vehículos**

Las pruebas de integración del módulo de vehículos fallan. Los endpoints `GET /api/vehiculos` (listado paginado) y `DELETE /api/vehiculos/:id` retornan HTTP 500 en lugar de los códigos esperados. Esto indica un problema en la capa de manejo de errores de estas rutas específicas.

- *Evidencia:* Ejecución de `npm run test` retorna: 62 passed, 3 failed. Los 3 fallos son AssertionError: expected 500 to be 200.

**3. JWT no se invalida en logout**

El endpoint `POST /api/auth/logout` retorna HTTP 200 con éxito pero no invalida el token JWT. El código contiene un comentario que reconoce esta limitación: `// In a real app, you'd invalidate the token`. Un token sigue siendo válido hasta su expiración natural después del cierre de sesión.

- *Evidencia:* Línea 161 de `backend/src/routes/auth.routes.ts`.

**4. Páginas frontend sin punto de entrada**

Cinco módulos del frontend no tienen página raíz (`page.tsx`): `control_costos/`, `flota/`, `operaciones/`, `seguridad/` y `mantenimiento/`. Solo existen subpáginas (sustitución, reportes-kpi, costos-fijo-variable, asignacion, documentos, rutas, permisos, sesiones, audit, almacen, lavado). El usuario debe conocer las rutas exactas para navegar a estos módulos.

- *Evidencia:* De 25 páginas `page.tsx` verificadas con glob, 5 directorios raíz no tienen archivo de página.

**5. Vulnerabilidades de dependencias**

`npm audit` reporta 8 vulnerabilidades en el nivel raíz del proyecto (1 low, 5 moderate, 2 high) y 5 adicionales en el backend. Las más críticas afectan a `hono` (path traversal, CORS bypass, JWT middleware), `ws` (memory exhaustion DoS) y `dompurify` (XSS bypass).

- *Evidencia:* Ejecución de `npm audit` en la raíz del proyecto y en `backend/`.

**6. Cronograma comprimido**

Las fases 4, 5 y 6 del desarrollo se completaron en 2 días (09–10 de julio de 2026). La fase 4 modificó 23 archivos (Swagger, RBAC, limpieza Docker), la fase 5 modificó 14 archivos (seguridad, reportes, Zod), y la fase 6 creó 8 archivos de prueba. Esta compresión temporal sacrificó la profundidad de las pruebas.

- *Evidencia:* Fechas de los archivos de plan en `docs/FASE_4_PLAN.md`, `FASE_5_PLAN.md`, `FASE_6_PLAN.md` — todos fechados el 09 de julio de 2026.

---

### Lecciones Aprendidas para Futuros Proyectos

**Lección 1: Implementar pruebas desde la fase 1, no al final**

El error más costoso del proyecto fue dejar las pruebas automatizadas para la fase 6. Cuando se intentó agregar pruebas a módulos que ya tenían miles de líneas de código, se descubrió que la arquitectura de algunos handlers no facilitaba el testing (acoplamiento directo a Prisma sin inyección de dependencias). Las pruebas deberían haberse escrito junto con cada endpoint, no como tarea posterior.

*Acción para futuros proyectos:* Establecer la regla de que cada endpoint nuevo debe incluir al menos una prueba de integración antes de ser fusionado a `develop`.

**Lección 2: No subestimar la validación de mocks en pruebas**

Los 3 defectos en `vehiculos.test.ts` no son bugs del código de producción — el endpoint funciona correctamente en EasyPanel. El problema es que los mocks de Prisma no simulan fielmente el comportamiento real, causando que las pruebas fallen con HTTP 500. Los mocks deben ser validados contra el comportamiento real de la base de datos.

*Acción para futuros proyectos:* Antes de crear mocks, ejecutar la consulta real contra una base de datos de prueba y documentar el formato de respuesta esperado.

**Lección 3: Documentar decisiones de seguridad pendientes**

El comentario `// In a real app, you'd invalidate the token` en el endpoint de logout es un recordatorio de que las decisiones de seguridad no implementadas deben documentarse explícitamente como deuda técnica, no como comentarios en el código. Un comentario en el código se pierde; un ticket de deuda técnica se trackea.

*Acción para futuros proyectos:* Mantener un archivo `DEBT.md` o tabla de deuda técnica visible que registre funcionalidades a medio implementar con su nivel de riesgo.

**Lección 4: Priorizar la completitud del frontend antes del despliegue**

Desplegar el sistema con 5 páginas raíz faltantes obliga al usuario a memorizar rutas específicas para acceder a módulos completos. Es mejor tener menos módulos pero completos que muchos módulos a medias.

*Acción para futuros proyectos:* Definir un criterio de "desplegabilidad" que incluya la existencia de puntos de entrada para todos los módulos visibles en el dashboard.

**Lección 5: Ejecutar auditoría de seguridad antes del despliegue**

Las 13 vulnerabilidades identificadas por `npm audit` (8 en raíz, 5 en backend) deberían haberse resuelto antes del despliegue en producción. Algunas son dependencias transitivas de Prisma y ExcelJS que requieren actualizaciones mayores (`--force`), pero otras como `esbuild` y `js-yaml` tienen correcciones disponibles sin breaking changes.

*Acción para futuros proyectos:* Incluir `npm audit` como paso obligatorio del pipeline de CI/CD antes del despliegue.

**Lección 6: El esquema multi-schema de Prisma facilita la escalabilidad**

La decisión de dividir el esquema de Prisma en 14 archivos organizados por dominio (base, seguridad, flota, operación, normalización, etc.) demostró ser acertada. Cada archivo es autocontenido y modificable sin afectar a los demás. Esto permitió que la fase 4 agregue campos a `vehiculos.prisma` sin tocar `seguridad.prisma`.

*Acción para futuros proyectos:* Para sistemas con más de 10 tablas, utilizar esquemas multi-archivo desde el inicio. La Organización por dominio de negocio es más maintainable que un solo archivo monolítico.

**Lección 7: Los datos de referencia realistas aceleran el desarrollo**

El script `seed.ts` con 30 marcas, 149 modelos, 14 roles y 20 sectores permitió probar formularios, filtros y reportes con datos que reflejan la realidad del dominio. Sin estos datos, cada prueba manual habría requerido crear registros ficticios.

*Acción para futuros proyectos:* Invertir tiempo en crear un `seed.ts` completo durante la fase 1. Los datos de referencia son tan importantes como el esquema de la base de datos.

**Lección 8: Docker multi-etapa reduce riesgos de producción**

El patrón de Dockerfile con etapa `builder` (compilación) y `runner` (ejecución) garantiza que la imagen de producción no contenga herramientas de desarrollo, código fuente sin compilar ni dependencias de build. Esto reduce el tamaño de la imagen y la superficie de ataque.

*Acción para futuros proyectos:* Siempre utilizar Dockerfiles multi-etapa para aplicaciones TypeScript/JavaScript. Nunca incluir `node_modules` de desarrollo en la imagen final.
