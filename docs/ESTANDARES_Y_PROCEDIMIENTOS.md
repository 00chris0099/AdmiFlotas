## 5.2. Estándares de Codificación

El proyecto SAF (Sistema de Administración de Flotas) sigue los siguientes estándares y convenciones de codificación para garantizar consistencia, legibilidad y mantenibilidad del código a lo largo del equipo de desarrollo.

**Lenguajes y tecnologías principales:**
- **Backend:** TypeScript (Node.js) con el framework Express.
- **Frontend:** TypeScript con Next.js (React).
- **Base de datos:** PostgreSQL 16 administrada mediante Prisma ORM.
- **Infraestructura:** Docker y Docker Compose para la containerización.

**Convenciones de estilo y formato:**
- Se utiliza **TypeScript en modo estricto** (`"strict": true` en `tsconfig.json`), lo que obliga a declarar tipos explícitos, valida retornos de funciones y previene errores comunes en tiempo de compilación.
- Los nombres de archivos y carpetas siguen un esquema **kebab-case** para archivos (por ejemplo, `auth-middleware.ts`) y **camelCase** para variables y funciones internas.
- Los nombres de componentes React en el frontend siguen el convencionalismo **PascalCase** (por ejemplo, `VehicleForm`, `DashboardLayout`).
- Las rutas de la API REST se definen en plural y en inglés (`/api/vehicles`, `/api/users`).
- Se aplica una estructura de carpetas clara y consistente en ambos módulos:
  - `backend/src/`: `config/`, `middleware/`, `routes/`, `schemas/`, `services/`, `types/`, `utils/`.
  - `frontend/`: componentes organizados por dominio funcional.

**Validación y seguridad:**
- La validación de datos de entrada se realiza mediante **Zod** en el backend, definiendo esquemas de validación reutilizables en la carpeta `schemas/`.
- Se aplican middlewares de seguridad como **Helmet** (protección de cabeceras HTTP), **CORS** (control de origen), y **express-rate-limit** (limitación de tasa de peticiones).
- Las contraseñas se cifran con **bcryptjs** antes de almacenarlas en la base de datos.
- La autenticación se gestiona mediante **JWT** (JSON Web Tokens) con tiempo de expiración configurable.

**Gestión de dependencias compartidas:**
- El módulo `shared/` contiene tipos TypeScript y constantes reutilizables entre el backend y el frontend, evitando duplicación de definiciones.

**Herramientas de desarrollo:**
- **ESLint** para el análisis estático del código (`npm run lint`).
- **TypeScript Compiler** para verificación de tipos sin generación de salida (`npm run typecheck`).
- **Vitest** como framework de pruebas unitarias y de integración.

---

## 5.3. Gestión del Control de Versiones

El sistema de control de versiones utilizado es **Git**, alojado en un repositorio remoto para facilitar la colaboración entre los miembros del equipo.

**Estrategia de branching:**

El proyecto adopta una estrategia de branching basada en el modelo **trunk-based development** adaptada, con las siguientes ramas principales:

- **`main` (o `master`):** Rama principal de producción. Solo se fusionan cambios que han sido revisados y aprobados. Representa el estado estable y desplegable del sistema en todo momento.
- **`develop`:** Rama de integración donde se consolidan las funcionalidades en desarrollo antes de su合并 a `main`. sirve como base para las ramas de carácter.
- **Ramas de carácter (`feature/`):** Se crean a partir de `develop` para el desarrollo de funcionalidades específicas (por ejemplo, `feature/vehicle-report`, `feature/auth-reset`). Se fusionan en `develop` mediante pull request tras la revisión del código.
- **Ramas de corrección (`fix/`):** Se utilizan para corregir errores reportados en producción o en desarrollo (por ejemplo, `fix/prisma-connection-timeout`).
- **Ramas de despliegue (`deploy/`):** Se emplean para preparar cambios orientados a entornos específicos de despliegue.

**Flujo de trabajo:**
1. El desarrollador crea una rama de carácter a partir de `develop`.
2. Realiza los cambios necesarios y realiza commits con mensajes descriptivos.
3. Al finalizar, crea un Pull Request (PR) hacia `develop`.
4. Se realiza una revisión del código y se verifican las pruebas automatizadas.
5. Tras la aprobación, se fusiona la rama y se elimina.

**Protocolos de commit:**
- Los mensajes de commit siguen un formato descriptivo en inglés.
- Se utiliza el patrón: `tipo(corto): descripción` (por ejemplo, `feat(auth): add password reset endpoint`).
- Los tipos comunes incluyen: `feat` (funcionalidad nueva), `fix` (corrección de error), `refactor` (refactorización sin cambio funcional), `docs` (documentación), `test` (pruebas), `chore` (tareas de mantenimiento).

**Archivos excluidos del control de versiones:**
- Variables de entorno (`.env`, `.env.local`, `.env.production`).
- Dependencias de Node (`node_modules/`).
- Archivos generados del sistema operativo (`.DS_Store`, `Thumbs.db`).
- Configuraciones de editores IDE (`.vscode/`, `.idea/`).

---

## 5.4. Integración Continua y Entrega Continua (CI/CD)

El proyecto SAF implementa un proceso de Integración Continua y Entrega Continua (CI/CD) mediante **Docker** y **EasyPanel**, una plataforma de despliegue que gestiona contenedores de forma simplificada.

**Descripción del proceso CI/CD:**

El flujo de CI/CD se estructura en las siguientes etapas:

1. **Integración Continua (CI):**
   - Cada Pull Request hacia `develop` o `main` activa la verificación automática del código.
   - Se ejecutan las pruebas unitarias y de integración definidas con **Vitest** (`npm run test`).
   - Se realiza la verificación de tipos con TypeScript (`npm run typecheck`) para detectar errores de tipo antes de la fusión.
   - Se ejecuta el análisis estático con ESLint (`npm run lint`) para mantener la consistencia del código.
   - El proceso de build de TypeScript (`npm run build`) se ejecuta como paso de verificación para asegurar que el código compila correctamente.

2. **Construcción de imágenes Docker:**
   - El proyecto define un **Dockerfile multi-etapa** (`builder` y `runner`) que optimiza el tamaño de la imagen final.
   - En la etapa `builder` se instalan las dependencias, se copia el código fuente y se genera el build de TypeScript.
   - En la etapa `runner` se copian solo los artefactos de producción (carpeta `dist/` y dependencias minimizadas), reduciendo significativamente el tamaño de la imagen desplegada.
   - Las variables de entorno sensibles (base de datos, JWT, SMTP) se pasan como **build args** y se inyectan en tiempo de ejecución, manteniéndolas fuera del código fuente.

3. **Entrega Continua (CD):**
   - EasyPanel recibe la imagen Docker construida y la despliegue en el entorno de producción.
   - El sistema está compuesto por cuatro contenedores orquestados mediante Docker Compose:
     - **PostgreSQL 16** (base de datos con persistencia en volumen).
     - **Backend API** (servidor Express en el puerto 3001).
     - **Frontend** (aplicación Next.js en el puerto 3000).
     - **Nginx** (gateway inverso en el puerto 80, que enruta tráfico hacia frontend y backend).
   - Los contenedores se reinician automáticamente (`restart: always`) para garantizar disponibilidad.
   - Se incluyen **healthchecks** en el contenedor de PostgreSQL para确保 que el backend solo se inicia cuando la base de datos está lista.

**Herramientas utilizadas:**

| Herramienta       | Función                                     |
|-------------------|---------------------------------------------|
| **Docker**        | Containerización de la aplicación completa  |
| **Docker Compose**| Orquestación de múltiples contenedores       |
| **EasyPanel**     | Plataforma de despliegue y gestión de contenedores |
| **GitHub/Git**    | Control de versiones y gestión de código fuente |
| **Vitest**        | Ejecución de pruebas automatizadas          |
| **TypeScript**    | Verificación de tipos                       |
| **ESLint**        | Análisis estático del código                |

**Configuración de entornos:**
- **Desarrollo:** Docker Compose local con variables de entorno por defecto.
- **Producción:** Docker Compose para EasyPanel (`docker-compose.prod.yml`) con variables de entorno inyectadas desde la plataforma, sin exponer valores sensibles en el repositorio.
