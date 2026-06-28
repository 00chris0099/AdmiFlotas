# 🐳 Guía de Despliegue en la Nube con Docker — SAF ERP

Esta guía detalla el procedimiento técnico para empaquetar, construir y desplegar la aplicación **SAF ERP** en entornos de producción en la nube (VPS, AWS, DigitalOcean, Render, etc.) utilizando contenedores **Docker** y **Docker Compose**.

---

## 🛠️ Requisitos Previos

Antes de iniciar el despliegue, asegúrate de tener instalado en tu servidor local o en la nube:
1.  **Docker** (versión 20.10 o superior).
2.  **Docker Compose** (versión 2.0 o superior).
3.  Una base de datos de producción (por ejemplo, PostgreSQL en **Supabase** o una base de datos autohospedada).

---

## 📦 Archivos de Configuración Creados

*   [frontend/Dockerfile](file:///c:/Users/chris/OneDrive/Escritorio/Administraci%C3%B3n%20de%2520flotas/frontend/Dockerfile): Define la construcción multi-stage de la aplicación de Next.js (optimiza el peso de la imagen final instalando solo las dependencias de producción).
*   [docker-compose.yml](file:///c:/Users/chris/OneDrive/Escritorio/Administraci%C3%B3n%20de%2520flotas/docker-compose.yml): Define los servicios de la aplicación de Next.js y un contenedor PostgreSQL local opcional con persistencia de datos.

---

## 🚀 Despliegue en 4 Pasos

### Paso 1: Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto (donde está el archivo `docker-compose.yml`) con los siguientes parámetros:

```env
DATABASE_URL="postgresql://usuario:contraseña@servidor:puerto/nombre_bd"
JWT_SECRET="clave_secreta_para_firmar_tokens_jwt_2026"
```

> [!NOTE]  
> Si vas a usar la base de datos PostgreSQL local levantada por Docker Compose, tu `DATABASE_URL` debe apuntar al servicio `db`:
> `DATABASE_URL="postgresql://saf_admin:saf_secure_password_2026@db:5432/saf_flotas_db"`

### Paso 2: Copiar el Esquema de Prisma al Contenedor
Antes de compilar, asegúrate de que el backend tenga acceso al cliente de base de datos de Prisma. El builder del `Dockerfile` lo gestionará de manera automática si sincronizas el esquema o lo dejas pre-compilado en el despliegue local:
```bash
npx prisma generate
```

### Paso 3: Construir y Levantar los Contenedores
Ejecuta el siguiente comando en la terminal desde el directorio raíz del proyecto:

```bash
docker-compose up -d --build
```

*   `--build`: Fuerza a Docker a compilar la imagen de Next.js con los cambios recientes de código.
*   `-d`: Ejecuta los contenedores en segundo plano (modo *detached*).

### Paso 4: Ejecutar Migraciones y Cargar Semilla (Seeding)
Una vez que el contenedor de la aplicación esté arriba, debes ejecutar las migraciones iniciales y cargar los datos de los 8 perfiles de usuario en la base de datos:

```bash
# Ejecutar migraciones de base de datos
docker exec -it saf_erp_app npx prisma db push

# Cargar usuarios iniciales y configuraciones
docker exec -it saf_erp_app npx prisma db seed
```

---

## ☁️ Opciones de Despliegue en la Nube

### Opción A: Servidor VPS de bajo costo (DigitalOcean / Linode / AWS EC2)
1.  Instala Docker y Git en el VPS.
2.  Clona el repositorio.
3.  Crea el archivo `.env`.
4.  Ejecuta `docker-compose up -d --build`.
5.  *(Recomendado)* Configura **Nginx** como Proxy Inverso en el VPS para proveer certificados SSL (HTTPS) gratuitos con **Certbot / Let's Encrypt**.

### Opción B: Servicios PaaS Gestionados (Render / Railway / App Platform)
Si prefieres no administrar el sistema operativo del VPS:
1.  Conecta tu repositorio de GitHub a la plataforma (por ejemplo, **Render**).
2.  Crea una aplicación de tipo **Web Service**.
3.  Configura el `Dockerfile Path` como `frontend/Dockerfile`.
4.  Agrega las variables de entorno `DATABASE_URL` y `JWT_SECRET` en la sección de configuraciones del servicio.
5.  La plataforma compilará y desplegará la imagen automáticamente en cada `git push`.
