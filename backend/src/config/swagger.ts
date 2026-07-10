// ============================================================
// SAF Backend - Swagger/OpenAPI Configuration
// ============================================================

import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SAF - Sistema de Administración de Flotas",
      version: "1.0.0",
      description: "API REST para la gestión integral de flotas vehiculares, combustible, mantenimiento, llantas, costos, operaciones y seguridad.",
      contact: {
        name: "SAF Team",
      },
    },
    servers: [
      {
        url: "/api",
        description: "API Gateway (nginx)",
      },
      {
        url: "http://localhost:3001/api",
        description: "Backend directo (desarrollo)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string" },
          },
        },
        Usuario: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            nombre: { type: "string" },
            apellido: { type: "string" },
            activo: { type: "boolean" },
            rol: {
              type: "object",
              properties: {
                id: { type: "string" },
                nombre: { type: "string" },
                codigo: { type: "string" },
              },
            },
          },
        },
        Vehiculo: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            placa: { type: "string" },
            codigoPatrimonial: { type: "string" },
            marca: { type: "object" },
            modelo: { type: "object" },
            color: { type: "object" },
            tipoCombustible: { type: "object" },
            estado: { type: "object" },
          },
        },
        MovimientoDiario: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            numeroOrden: { type: "string" },
            fecha: { type: "string", format: "date-time" },
            vehiculoId: { type: "string" },
            conductorId: { type: "string" },
            estado: { type: "string", enum: ["EN_RUTA", "COMPLETADO", "CANCELADO"] },
          },
        },
        OrdenCombustible: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            numeroOrden: { type: "string" },
            fecha: { type: "string", format: "date-time" },
            vehiculoId: { type: "string" },
            tipoCombustible: { type: "string" },
            costoTotal: { type: "number" },
          },
        },
        OrdenMantenimiento: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            numeroOrden: { type: "string" },
            fechaEmision: { type: "string", format: "date-time" },
            vehiculoId: { type: "string" },
            tipoMantenimiento: { type: "string" },
            estado: { type: "string", enum: ["PENDIENTE", "EN_PROCESO", "COMPLETADO"] },
          },
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            data: { type: "array", items: {} },
            pagination: {
              type: "object",
              properties: {
                total: { type: "integer" },
                page: { type: "integer" },
                limit: { type: "integer" },
                totalPages: { type: "integer" },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Autenticación y sesiones" },
      { name: "Vehiculos", description: "Gestión de flota vehicular" },
      { name: "Movimientos Diarios", description: "Control operativo diario" },
      { name: "Combustible", description: "Control de combustible y lubricantes" },
      { name: "Mantenimiento", description: "Control de mantenimiento preventivo/correctivo" },
      { name: "Almacen", description: "Almacén de mantenimiento" },
      { name: "Llantas", description: "Control individualizado de llantas" },
      { name: "Costos", description: "Totalización y análisis de costos" },
      { name: "Flota", description: "Asignación y documentos de vehículos" },
      { name: "Operaciones", description: "Rutas y programación de viajes" },
      { name: "Usuarios", description: "Administración de usuarios y roles" },
      { name: "Configuracion", description: "Configuración del sistema" },
      { name: "Lookups", description: "Datos de referencia" },
      { name: "Reportes", description: "Exportación Excel y PDF" },
      { name: "Seguridad", description: "Permisos, sesiones y auditoría" },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
