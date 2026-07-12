## 7. DESPLIEGUE Y PUESTA EN PRODUCCIÓN

### 7.1. Entorno de Despliegue

El sistema SAF se despliega en un entorno de nube utilizando la plataforma **EasyPanel**, una interfaz de gestión de contenedores Docker que simplifica el despliegue y administración de aplicaciones en servidores VPS (Virtual Private Server).

**Arquitectura del entorno de producción:**

| Componente | Tecnología | Especificación |
|---|---|---|
| **Servidor** | VPS (proveedor cloud) | Sistema operativo Linux con Docker instalado |
| **Plataforma de despliegue** | EasyPanel | Gestión de contenedores Docker vía interfaz web |
| **Dominio** | DNS configurado | `aimachristian-administraciondeflotas.ajcxjb.easypanel.host` |
| **Puertos expuestos** | HTTP | Puerto 80 (Nginx gateway) |

**Servicios desplegados:**

El sistema está compuesto por cuatro contenedores Docker orquestados mediante Docker Compose:

| Contenedor | Imagen Base | Función | Puerto |
|---|---|---|---|
| `saf_db` | `postgres:16-alpine` | Base de datos PostgreSQL | 5432 (interno) |
| `saf_backend` | `node:20-alpine` | API REST (Express + TypeScript) | 3001 (interno) |
| `saf_frontend` | `node:20-alpine` | Aplicación web (Next.js) | 3000 (interno) |
| `saf_nginx` | `nginx:alpine` | Gateway inverso y proxy | 80 (externo) |

**Configuración de red:**

Nginx actúa como punto de entrada único del sistema, recibiendo todas las peticiones HTTP en el puerto 80 y enrutándolas según la ruta:
- `/*` → Frontend Next.js (puerto 3000)
- `/api/*` → Backend Express (puerto 3001)
- `/api/health` → Health check del backend (sin acceso de logs)
- `*.jpg, *.css, *.js, ...` → Archivos estáticos del frontend con cache de 7 días

**Persistencia de datos:**

El contenedor de PostgreSQL utiliza un volumen Docker nombrado (`pgdata`) que mantiene los datos de la base de datos de forma persistente, sobreviviendo a reinicios y reconstrucciones de contenedores.

**Variables de entorno de producción:**

Las variables sensibles se inyectan desde EasyPanel y no se almacenan en el repositorio:

| Variable | Propósito | Ejemplo |
|---|---|---|
| `DB_PASSWORD` | Contraseña de PostgreSQL | *(generada por el equipo)* |
| `JWT_SECRET` | Clave para firmar tokens JWT | *(mínimo 32 caracteres)* |
| `CORS_ORIGIN` | Dominio permitido para CORS | `https://aimachristian-administraciondeflotas.ajcxjb.easypanel.host` |
| `SMTP_HOST` | Servidor de correo saliente | `smtp.gmail.com` |
| `SMTP_PORT` | Puerto del servidor SMTP | `587` |
| `SMTP_USER` | Usuario del servidor SMTP | *(correo del equipo)* |
| `SMTP_PASS` | Contraseña de aplicación SMTP | *(generada desde Gmail)* |
| `NEXT_PUBLIC_API_URL` | Ruta base de la API en el frontend | `/api` |

---

### 7.2. Proceso de Despliegue

El proceso de despliegue se ejecuta de forma automatizada mediante el pipeline de EasyPanel, que construye las imágenes Docker y levanta los contenedores en el servidor de producción.

**Pasos del proceso de despliegue:**

**Paso 1: Preparación del código fuente**
1. El desarrollador finaliza los cambios en la rama de desarrollo.
2. Ejecuta las pruebas localmente (`npm run test`) y la verificación de tipos (`npm run typecheck`).
3. Crea un Pull Request hacia la rama `main`.
4. Tras la revisión y aprobación del código, se fusiona la rama.

**Paso 2: Push al repositorio remoto**
```bash
git add .
git commit -m "feat: descripción del cambio"
git push origin main
```
EasyPanel está conectado al repositorio de GitHub y detecta automáticamente los cambios en la rama `main`.

**Paso 3: Construcción de imágenes Docker**

EasyPanel ejecuta el build de las imágenes Docker definidas en `docker-compose.prod.yml`:

- **Backend:** El Dockerfile multi-etapa ejecuta:
  - Etapa `builder`: Instala dependencias, copia el código fuente, ejecuta `npm run build` (compilación TypeScript).
  - Etapa `runner`: Copia solo los artefactos de producción (`dist/`, dependencias mínimas), reduciendo el tamaño de la imagen final.

- **Frontend:** El Dockerfile de Next.js construye la aplicación con las variables de entorno definidas en `NEXT_PUBLIC_API_URL=/api`.

- **Nginx:** Se utiliza la imagen oficial `nginx:alpine` con la configuración personalizada en `nginx/default.conf`.

**Paso 4: Levantamiento de contenedores**
1. EasyPanel detiene los contenedores de la versión anterior.
2. Levanta los nuevos contenedores en el siguiente orden:
   - PostgreSQL (con healthcheck que verifica la disponibilidad del servicio).
   - Backend (espera a que PostgreSQL esté saludable antes de iniciar).
   - Frontend (depende del backend).
   - Nginx (depende de frontend y backend).
3. Verifica que todos los servicios estén operativos.

**Paso 5: Migraciones de base de datos**
```bash
# Ejecutar migraciones pendientes de Prisma
npx prisma migrate deploy --schema prisma/schema
```
Este paso se ejecuta manualmente o se incluye como script de inicio del contenedor backend cuando hay cambios en el esquema de la base de datos.

**Paso 6: Verificación post-despliegue**
```bash
# Verificar health check del backend
curl https://aimachristian-administraciondeflotas.ajcxjb.easypanel.host/api/health

# Respuesta esperada:
# {"status":"ok","timestamp":"2026-07-12T..."}
```

Se verifica que:
- El endpoint `/api/health` retorne estado `ok`.
- La página principal (`/`) cargue correctamente.
- Los logs de cada contenedor no muestren errores críticos.

**Comandos de administración:**
```bash
# Ver logs en tiempo real
docker compose logs -f nginx
docker compose logs -f backend
docker compose logs -f frontend

# Reiniciar un servicio específico
docker compose restart backend

# Acceder a un contenedor para depuración
docker exec -it saf_backend sh
docker exec -it saf_frontend sh
```

---

### 7.3. Estrategia de Rollback

El proyecto implementa una estrategia de rollback basada en Docker y Git que permite revertir a una versión anterior del sistema en caso de problemas durante o después del despliegue.

**Causas que pueden requerir un rollback:**
- Errores críticos en la aplicación que afecten la funcionalidad principal.
- Regresiones en la base de datos que provoquen pérdida de integridad referencial.
- Problemas de rendimiento que degraden la experiencia del usuario.
- Vulnerabilidades de seguridad descubiertas después del despliegue.

**Estrategia de rollback por niveles:**

**Nivel 1 — Rollback de contenedor (reinicio rápido):**
Si el problema está aislado a un servicio específico, se puede reiniciar ese contenedor con la imagen anterior:
```bash
# Detener el contenedor problemático
docker stop saf_backend

# Ejecutar la imagen de la versión anterior (si EasyPanel mantiene el historial)
docker run -d --name saf_backend saf-backend:<version-anterior>
```
Este nivel se utiliza para fallos puntuales que no afectan la estructura de datos.

**Nivel 2 — Rollback de Docker Compose (revertir todos los servicios):**
Si el problema afecta múltiples servicios, se revierte el archivo `docker-compose.prod.yml` a la versión anterior y se reconstruyen los contenedores:
```bash
# Restaurar la versión anterior del archivo de configuración
git checkout <commit-anterior> -- docker-compose.prod.yml Dockerfile backend/Dockerfile frontend/Dockerfile

# Reconstruir y levantar con la versión anterior
docker compose -f docker-compose.prod.yml up -d --build
```
Este nivel se utiliza cuando los cambios afectan la configuración de infraestructura o las dependencias.

**Nivel 3 — Rollback de base de datos (revertir migraciones):**
Si los cambios incluyen migraciones de base de datos que causan problemas:
```bash
# Revertir la última migración de Prisma
npx prisma migrate reset --schema prisma/schema

# O ejecutar una migración de reversión manual si existe
npx prisma migrate dev --schema prisma/schema --create-only
```
Este nivel requiere precaución ya que puede afectar los datos existentes. Se recomienda:
- Realizar un backup de la base de datos antes de ejecutar la reversión.
- Verificar que no haya datos nuevos dependientes de la migración revertida.
- Coordinar el rollback con los usuarios del sistema.

**Nivel 4 — Rollback completo (revertir al último estado funcional):**
En caso de fallo catastrófico, se revierte todo el repositorio al último commit funcional conocido:
```bash
# Identificar el último commit funcional
git log --oneline -10

# Crear una rama de rollback desde ese commit
git checkout -b rollback/urgent <commit-funcional>

# Forzar el push (requiere autorización del equipo)
git push origin rollback/urgent --force

# En EasyPanel, apuntar el despliegue a la rama de rollback
```
Este nivel se utiliza como último recurso y requiere la intervención del equipo de desarrollo.

**Protocolo de comunicación durante rollback:**

1. **Notificación:** El responsable del despliegue notifica al equipo sobre el problema detectado.
2. **Evaluación:** Se determina el nivel de rollback necesario según la gravedad del problema.
3. **Ejecución:** Se ejecuta el rollback correspondiente y se verifican los servicios.
4. **Verificación:** Se confirma que el sistema funcione correctamente con la versión revertida.
5. **Investigación:** Se analiza la causa raíz del problema para evitar su recurrencia.
6. **Corrección:** Se desarrolla una corrección y se despliega nuevamente siguiendo el proceso estándar.

**Prevención de problemas:**

- **Healthchecks automáticos:** Los contenedores incluyen verificaciones de salud que reinician automáticamente los servicios que fallen.
- **Persistencia de datos:** Los volúmenes Docker mantienen los datos de PostgreSQL separados de los contenedores, evitando pérdida de información durante reconstrucciones.
- **Variables de entorno aisladas:** Las credenciales y configuraciones sensibles se gestionan desde EasyPanel, no desde el código fuente.
- **Dockerfile multi-etapa:** Las imágenes de producción contienen solo los artefactos necesarios, reduciendo la superficie de ataque y los posibles puntos de fallo.
- **Logs centralizados:** EasyPanel permite acceder a los logs de cada contenedor en tiempo real para diagnosticar problemas rápidamente.
