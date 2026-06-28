# 🚛 Manual de Operación y Tutorial Completo — SAF ERP (Estándar F1T02)

Bienvenido al manual oficial de **SAF ERP**, un Sistema de Planificación de Recursos Empresariales diseñado para la **Administración de Flotas de Vehículos** bajo la estricta adherencia a los estándares operativos y financieros del manual técnico **F1T02**.

Este documento sirve como tutorial paso a paso y explicación arquitectónica de cómo interactúan las partes del software para gestionar el combustible, mantenimiento, seguridad vial, costos operativos y el ciclo de vida de los activos.

---

## 📋 Índice
1. [Estructura del Sistema y Roles (RBAC)](#1-estructura-del-sistema-y-roles-rbac)
2. [Módulo de Operaciones](#2-módulo-de-operaciones)
   * Control Pre-operacional de 15 Puntos (F1T02)
   * Gestión de Combustible y KPIs de Consumo (km/galón)
3. [Módulo de Mantenimiento](#3-módulo-de-mantenimiento)
   * Programación Preventiva Automática (+5,000 km)
   * Control y Rotación Dinámica de Llantas (Silueta Interactiva)
4. [Módulo Administrativo y Configuración de Metas](#4-módulo-administrativo-y-configuración-de-metas)
   * Panel de Configuración de Metas (Settings)
   * KPIs en Tiempo Real (CKV & IUV)
   * Algoritmo Predictivo de Sustitución Vehicular ($Cpa_n$)
5. [Exportación Contable (PDF & Excel)](#5-exportación-contable-pdf--excel)
6. [Cómo Ejecutar el Proyecto](#6-cómo-ejecutar-el-proyecto)

---

## 1. Estructura del Sistema y Roles (RBAC)

El acceso al sistema está controlado rigurosamente por perfiles de usuario almacenados en la base de datos (Supabase/PostgreSQL). Cada pantalla valida los permisos del usuario activo:

*   **Jefe de Proceso (JEFE_PROCESO)**: Acceso total al sistema. Puede configurar metas de la flota, aprobar Órdenes de Servicio, revisar análisis de sustitución vehicular y exportar reportes ejecutivos.
*   **Administrativo (ADMINISTRATIVO)**: Encargado de la gestión financiera. Tiene acceso al Módulo Administrativo, costos variables/fijos, reportes KPI y configuración de límites.
*   **Analista (ANALISTA)**: Acceso a reportes KPI y control de datos operativos sin permisos de edición crítica en configuraciones de metas.
*   **Inspector (INSPECTOR)**: Responsable de realizar checklists pre-operacionales de vehículos y derivar a talleres en caso de incidencias.
*   **Mecánico / Electricista (MECANICO/ELECTRICISTA)**: Visualiza y registra el avance en las Órdenes de Servicio y llena las tarjetas de tiempo de mano de obra.
*   **Conductor (CONDUCTOR)**: Permisos restringidos. Solo puede reportar movimientos diarios y rellenar su checklist previo a la salida del garaje.

---

## 2. Módulo de Operaciones

Ubicación en el ERP: `Menú Principal > Módulo Operaciones`

### A. Control Pre-operacional de 15 Puntos (Checklist F1T02)
*   **Propósito**: Garantizar la integridad física del conductor y el activo antes de iniciar cualquier viaje.
*   **Cómo funciona**:
    1. Al iniciar un nuevo viaje ("Crear Movimiento Diario"), el conductor o inspector debe calificar 15 puntos críticos del vehículo (`Frenos`, `Dirección`, `Neumáticos`, `Luces`, `Nivel de Aceite`, `Fugas`, `Fajas`, etc.) en tres estados: **OK**, **Observado** o **Malo/Fallado**.
    2. **Candado de Seguridad Vial (RBAC Automatizado)**: Si algún elemento clave para la seguridad (como Frenos o Neumáticos) es marcado como **Malo/Fallado**, el backend intercepta el guardado:
        *   Cambia inmediatamente el estado del vehículo en la base de datos a `INOPERATIVO`.
        *   Genera automáticamente una **Orden de Servicio Correctiva** prioritaria en el Módulo de Mantenimiento con el detalle de la falla.
        *   Prohíbe que el conductor inicie el viaje, bloqueando la salida del vehículo del almacén.

### B. Gestión de Combustible y KPIs de Consumo (MA 122 01 02)
*   **Propósito**: Controlar el gasto en combustible, detectar desvíos por robo o ineficiencia mecánica.
*   **Cómo funciona**:
    1. En `Operaciones > Control Combustible`, el usuario registra una orden de abastecimiento (Galones, Costo Total, Odómetro Actual, Tipo de Combustible).
    2. El sistema calcula reactivamente el **Rendimiento Promedio del Vehículo ($km/galón$)**:
        $$\text{Rendimiento} = \frac{\text{Kilometraje Actual} - \text{Kilometraje Anterior}}{\text{Galones Abastecidos}}$$
    3. Este resultado se compara automáticamente con el **Patrón de Fábrica** del vehículo registrado en el sistema. Los consumos eficientes se marcan en verde, mientras que los desvíos fuera de tolerancia aparecen destacados en rojo con alertas visuales de ineficiencia.

---

## 3. Módulo de Mantenimiento

Ubicación en el ERP: `Menú Principal > Módulo Mantenimiento`

### A. Programación Preventiva Automática (+5,000 km)
*   **Propósito**: Prevenir fallas graves realizando los mantenimientos de rutina de forma puntual.
*   **Cómo funciona**:
    1. Cuando un conductor finaliza un viaje, introduce el odómetro final del vehículo en Movimientos Diarios.
    2. El backend evalúa la diferencia contra el último odómetro del mantenimiento anterior.
    3. Al superar el umbral configurado (ej. **5,000 km**), el sistema activa un trigger automático:
        *   Crea una nueva **Orden de Servicio Preventiva** en estado `PENDIENTE`.
        *   Registra las tareas estándar (cambio de aceite, filtros, alineamiento) para que el Jefe de Mantenimiento las asigne a un taller/mecánico.

### B. Control y Rotación Dinámica de Llantas (Silueta Interactiva)
*   **Propósito**: Maximizar la vida útil de los neumáticos y controlar el desgaste de las cocadas.
*   **Cómo funciona**:
    1. Muestra una **silueta de chasis interactiva SVG** con las 7 posiciones del vehículo (Eje delantero izq/der, Eje trasero doble izq/der interno/externo, y Rueda de repuesto).
    2. Al hacer clic sobre cualquier rueda en el diagrama, se despliega la ficha técnica de la llanta actual (Profundidad de cocada en mm, presión PSI, número de reencauches e historial de rotación).
    3. Permite simular y guardar rotaciones (ej. pasar la rueda de repuesto al eje delantero) para equilibrar el desgaste, alertando con colores si la cocada cae por debajo del mínimo de seguridad legal (2 mm).

---

## 4. Módulo Administrativo y Configuración de Metas

Ubicación en el ERP: `Menú Principal > Módulo Administrativo`

### A. Panel de Configuración de Metas (Settings)
*   **Acceso**: Exclusivo para `JEFE_PROCESO` y `ADMINISTRATIVO`.
*   **Parámetros Modificables**:
    *   **Meta CKV Máxima (S/.)**: Costo por Kilómetro límite permitido para que la operación de un vehículo sea considerada rentable.
    *   **Recorrido Diario Esperado (km)**: Kilometraje ideal diario para el cálculo de utilización.
    *   **Horas de Uso Diario Esperado (hrs)**: Horas de motor encendido ideales por jornada.
    *   **Límites de Mantenimiento Preventivo (km)**: Frecuencia de revisión técnica obligatoria.
*   **Cómo funciona**: Estos límites se persisten en la tabla `ConfiguracionFlota` y vinculan dinámicamente todo el motor matemático de reportes y alertas del ERP.

### B. KPIs en Tiempo Real (CKV & IUV)
En `Administrativo > Reportes KPI (CKV/IUV)`, el sistema procesa los datos agregados:
*   **Costo por Kilómetro (CKV)**: Suma los Costos Fijos (seguros, depreciaciones de activos de la base de datos) y los Costos Variables (combustible, repuestos y mano de obra del historial de reparaciones) y los divide entre los kilómetros reales recorridos:
    $$CKV = \frac{\text{Costos Fijos} + \text{Costos Variables}}{\text{Kilómetros Recorridos}}$$
*   **Índice de Utilización Vehicular (IUV)**: Compara el tiempo operado contra la meta establecida en los Settings:
    $$IUV = \frac{\text{Horas Reales de Uso}}{\text{Horas Meta Configuradas}} \times 100$$
    *   *Alerta*: Si un vehículo mantiene un $IUV < 75\%$ consecutivamente por 3 meses, el software genera una recomendación de traspaso a la **"Flota de Uso Común"** para optimizar la inversión.

### C. Algoritmo Predictivo de Sustitución Vehicular ($Cpa_n$)
*   **Fórmula del Costo Promedio Anual**:
    $$Cpa_n = \frac{V_0 + \sum_{i=1}^{n} CC_i - R_n}{n}$$
    *   $V_0$: Valor de adquisición original del vehículo.
    *   $CC_i$: Costo de conservación/mantenimiento acumulado en el año $i$.
    *   $R_n$: Valor de rescate (recuperación) estimado del vehículo en el año $n$.
*   **Cómo funciona**: El algoritmo grafica la curva del $Cpa$ cruzando la depreciación del activo (que disminuye con el tiempo) contra los costos de conservación (que aumentan exponencialmente con los años de uso). El punto mínimo de la curva representa la **edad económica óptima** del vehículo. Si el activo actual supera esta edad, el ERP alerta con un mensaje de **RENOVACIÓN RECOMENDADA** para evitar pérdidas operativas.

---

## 5. Exportación Contable (PDF & Excel)

Ubicación en el ERP: `Reportes KPI > Botón Exportar Reportes` / `Sustitución Vehicular > Botón Exportar Datos`

Para facilitar las auditorías contables y presentaciones de gerencia, se ha integrado un modal interactivo de exportación local en el navegador:

1.  **PDF Ejecutivo Corporativo (Membrete Formal)**: Genera un reporte oficial de la flota con el logotipo de la empresa, clasificación de seguridad confidencial, fecha de generación y una tabla estructurada limpia. Ideal para ser impreso o enviado a directores.
2.  **Hoja de Cálculo Excel (XLSX)**: Descarga un archivo compatible con Microsoft Excel y Google Sheets que contiene la grilla de datos pura de la flota para que el área contable aplique fórmulas financieras personalizadas.
3.  **DataSet JSON**: Para integraciones avanzadas con otros sistemas externos de BI (PowerBI, Tableau).

---

## 6. Cómo Ejecutar el Proyecto

El proyecto está estructurado como una aplicación **Next.js** moderna utilizando **React**, **TypeScript** y **TailwindCSS** en el frontend, y **Prisma ORM** para las consultas a base de datos.

### Requisitos Previos
*   Node.js instalado (versión 18 o superior).
*   Base de datos PostgreSQL (local o instancia en Supabase).
*   Archivo `.env` configurado en el directorio del proyecto con la variable de entorno:
    ```env
    DATABASE_URL="postgresql://usuario:contraseña@servidor:puerto/nombre_bd"
    ```

### Pasos para Arrancar
1.  **Instalar dependencias**:
    ```bash
    npm install
    ```
2.  **Iniciar Servidor de Desarrollo**:
    ```bash
    npm run dev
    ```
3.  **Construir Compilación de Producción**:
    ```bash
    npm run build
    ```
