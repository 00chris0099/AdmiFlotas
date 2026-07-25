## 9. LECCIONES APRENDIDAS

### 9.1. Lo que funcionó bien

**Adopción temprana de TypeScript con Prisma ORM**

La elección de TypeScript en modo estricto junto con Prisma ORM desde la fase inicial del proyecto eliminó una categoría completa de errores de tipos en la capa de acceso a datos. El esquema multi-archivo de Prisma, distribuido en 14 archivos `.prisma` organizados por dominio de negocio (base, seguridad, flota, operación, normalización), permitió mantener la legibilidad del modelo de datos a pesar de gestionar aproximadamente 30 tablas. Cada archivo es autocontenido y modificable sin afectar a los demás, lo que facilitó el trabajo paralelo entre los integrantes del equipo.

Esta decisión se reflejó directamente en la calidad del código: no se registraron errores de tipo en la capa de acceso a datos durante todo el ciclo de desarrollo. Las 65 pruebas automatizadas implementadas no requirieron simulación de consultas SQL porque Prisma ya valida los tipos en tiempo de compilación, lo que redujo significativamente el tiempo de depuración.

**Separación clara de responsabilidades en el backend**

La estructura del proyecto, definida desde la fase 1, separó inequívocamente las capas de la aplicación: `routes/` para la definición de endpoints HTTP, `schemas/` para la validación de datos con Zod, `middleware/` para autenticación y control de acceso, `config/` para la configuración de base de datos y documentación, y `utils/` para funciones auxiliares reutilizables. Esta arquitectura permitió que los miembros del equipo trabajaran en módulos diferentes simultáneamente sin generar conflictos de fusión significativos.

El módulo `shared/`, que contiene tipos TypeScript compartidos entre el backend y el frontend, evitó la duplicación de definiciones y garantizó la coherencia entre ambas capas de la aplicación. Este patrón resultó especialmente valioso durante las fases de integración, donde los cambios en un esquema del backend se propagaban automáticamente al frontend a través de los tipos compartidos.

**Documentación de la API generada automáticamente**

La integración de Swagger, mediante las bibliotecas `swagger-jsdoc` y `swagger-ui-express`, documentó 83 endpoints de forma automática a partir de comentarios JSDoc insertados en el código fuente. Esta estrategia eliminó la necesidad de mantener documentación externa y garantizó que la documentación siempre refleje el estado real de la API. Durante las demostraciones del proyecto, la interfaz interactiva de Swagger en `/api/docs` permitió validar los endpoints en tiempo real, lo que facilitó las pruebas manuales y la retroalimentación del usuario.

**Datos iniciales comprehensivos y realistas**

El script `seed.ts` cargó un conjunto completo de datos de referencia que incluyó 30 marcas de vehículos, 149 modelos, 14 roles del organigrama F1T02, 20 sectores organizacionales, 13 localidades, 11 centros de servicio, 10 fabricantes de llantas, 8 dimensiones de llantas, 16 categorías de repuestos y 32 permisos granulares. Estos datos permitieron probar el sistema con información que refleja la realidad del dominio desde el primer día de desarrollo, eliminando la necesidad de crear registros ficticios para cada prueba manual.

La inversión en un `seed.ts` completo durante la fase 1 fue una de las decisiones más productivas del proyecto. Los datos de referencia resultaron ser tan importantes como el esquema de la base de datos, ya que permitieron validar formularios, filtros, reportes y flujos de negocio con escenarios reales.

**Containerización completa con Docker multi-etapa**

El Dockerfile implementó un patrón multi-etapa con una fase de compilación (`builder`) y una fase de ejecución (`runner`). Este enfoque garantizó que la imagen de producción no contenga herramientas de desarrollo, código fuente sin compilar ni dependencias de build, lo que redujo tanto el tamaño de la imagen como la superficie de ataque. Docker Compose orquestó 4 contenedores (PostgreSQL, backend, frontend y Nginx) con mecanismos de verificación de disponibilidad que aseguraron el orden correcto de arranque.

El despliegue exitoso en EasyPanel con dominio activo validó que la containerización cumple con los requisitos de un entorno de producción, y el patrón multi-etapa se estableció como estándar para futuros proyectos del equipo.

**Validación robusta de entrada con doble capa**

La combinación de Zod para validación en runtime y TypeScript en modo estricto para validación en compilación creó una doble capa de protección contra datos inválidos. Los esquemas definidos en `schemas/` rechazaron datos malformados antes de que llegaran a la lógica de negocio, lo que redujo errores en tiempo de ejecución y mejoró la experiencia del usuario al recibir mensajes de error claros y específicos.

---

### 9.2. Lo que no funcionó o presentó limitaciones

**Pruebas automatizadas dejadas para la fase final**

El error más costoso del proyecto fue postergar la implementación de pruebas automatizadas hasta la fase 6. Cuando se intentó agregar pruebas a módulos que ya tenían miles de líneas de código, se descubrió que la arquitectura de algunos manejadores de rutas no facilitaba el testing debido al acoplamiento directo con Prisma sin inyección de dependencias. Solo 5 de los 15 módulos del backend recibieron cobertura de pruebas, dejando un 67% del código sin validación automatizada.

Los 3 defectos detectados en `vehiculos.test.ts` no correspondieron a errores del código de producción — los endpoints funcionaron correctamente en el entorno desplegado — sino a mocks de Prisma que no simularon fielmente el comportamiento real de la base de datos. Esta situación evidenció la necesidad de validar los mocks contra el comportamiento real antes de confiar en los resultados de las pruebas.

**Invalidación incompleta del token JWT en cierre de sesión**

El endpoint `POST /api/auth/logout` retornó HTTP 200 con éxito pero no invalidó el token JWT emitido. El código contiene un comentario que reconoce explícitamente esta limitación. Un token sigue siendo válido hasta su expiración natural después del cierre de sesión, lo que representa un riesgo de seguridad en escenarios donde un usuario cierre sesión en un dispositivo compartido o comprometido.

Esta limitación se documentó como deuda técnica, pero la falta de un mecanismo de seguimiento formal (como un archivo de deuda técnica o un registro en el sistema de gestión de proyectos) hizo que la decisión quedara registrada solo en el código fuente, donde tiende a pasarse por alto durante las revisiones futuras.

**Páginas frontend sin punto de entrada**

Cinco módulos del frontend no incluyeron página raíz (`page.tsx`): `control_costos/`, `flota/`, `operaciones/`, `seguridad/` y `mantenimiento/`. Solo existieron subpáginas específicas dentro de cada directorio, lo que obligó al usuario a conocer y memorizar rutas exactas para navegar a funcionalidades completas. Esta situación generó una experiencia de usuario inconsistente, donde algunos módulos estaban accesibles desde el panel de control y otros requerían conocimiento previo de la estructura de URLs.

**Vulnerabilidades de dependencias sin resolver antes del despliegue**

El análisis de seguridad mediante `npm audit` identificó 28 vulnerabilidades en las dependencias del proyecto (4 de severidad alta, 19 moderadas y 5 bajas). Las más críticas afectaron a librerías fundamentales como `hono` (path traversal, bypass de CORS), `ws` (agotamiento de memoria por denegación de servicio) y `dompurify` (bypass de XSS). Estas vulnerabilidades estuvieron presentes durante el despliegue en producción, lo que incrementó innecesariamente la superficie de ataque del sistema.

**Cronograma comprimido que sacrificó calidad**

Las fases 4, 5 y 6 del desarrollo se completaron en un período de 2 días, modificando un total de 45 archivos entre documentación, seguridad, reportes y pruebas. Esta compresión temporal forzó decisiones de priorización que sacrificaron la profundidad de las pruebas y la completitud de algunos módulos del frontend. El ritmo de trabajo no fue sostenible y generó fatiga que afectó la atención al detalle en las últimas fases.

---

### 9.3. Lecciones para futuros proyectos

**Lección 1: Implementar pruebas desde la primera fase, no al final del proyecto**

Las pruebas automatizadas deben escribirse junto con cada endpoint o componente, no como una tarea posterior. Cuando las pruebas se dejan para el final, la deuda técnica acumulada dificulta su implementación y los mocks se vuelven más complejos de mantener. La regla recomendada es que cada endpoint nuevo debe incluir al menos una prueba de integración antes de ser fusionado a la rama de desarrollo principal.

**Lección 2: Documentar la deuda técnica en un archivo dedicado, no en comentarios del código**

Las decisiones de seguridad pendientes y las funcionalidades a medio implementar deben registrarse en un archivo visible y accesible (como `DEBT.md` o una tabla en la documentación del proyecto), no como comentarios en el código fuente. Un comentario en el código se pierde con el tiempo; un registro formal de deuda técnica se revisa periódicamente y permite priorizar su resolución.

**Lección 3: Definir criterios de completitud antes del despliegue**

Establecer una lista de verificación de "desplegabilidad" que incluya la existencia de puntos de entrada para todos los módulos visibles en el panel de control, la resolución de vulnerabilidades de severidad alta y media, y una cobertura mínima de pruebas en los módulos críticos. Desplegar un sistema con módulos incompletos genera una experiencia de usuario fragmentada y dificulta la adopción.

**Lección 4: Ejecutar auditoría de seguridad como paso obligatorio del pipeline**

Incluir `npm audit` (o la herramienta equivalente para el ecosistema utilizado) como paso obligatorio antes del despliegue en producción. Las vulnerabilidades de dependencias de terceros son difíciles de controlar, pero al menos deben identificarse y documentarse antes de que el sistema esté expuesto a usuarios finales.

**Lección 5: Invertir en datos de referencia realistas desde el inicio**

Un script de inicialización de datos completo y realista es una inversión que se recompensa durante todo el ciclo de desarrollo. Los datos de referencia permiten probar formularios, filtros, reportes y flujos de negocio sin crear registros ficticios para cada prueba. Esta inversión se amortiza rápidamente y mejora significativamente la calidad de las pruebas manuales y automatizadas.

**Lección 6: Mantener un ritmo de desarrollo sostenible**

Comprimir múltiples fases en un período muy corto genera fatiga, reduce la atención al detalle y fuerza decisiones de priorización que afectan la calidad del producto final. Un cronograma realista debe incluir márgenes de buffer para imprevistos y revisiones de calidad entre fases.
