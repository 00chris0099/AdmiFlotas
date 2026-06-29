-- Migration: Add subtipo_combustible field to vehiculos and ordenes_combustible
-- Date: 2025-01-01
-- Description: Agrega campo subtipo_combustible para tipos específicos de combustible (ej. DIESEL_UBA, GASOLINA_95)

-- Agregar campo subtipo_combustible a la tabla vehiculos
ALTER TABLE vehiculos 
ADD COLUMN IF NOT EXISTS subtipo_combustible VARCHAR(50);

-- Agregar campo subtipo_combustible a la tabla ordenes_combustible
ALTER TABLE ordenes_combustible 
ADD COLUMN IF NOT EXISTS subtipo_combustible VARCHAR(50);

-- Crear índice para búsquedas por subtipo
CREATE INDEX IF NOT EXISTS idx_vehiculos_subtipo_combustible ON vehiculos(subtipo_combustible);
CREATE INDEX IF NOT EXISTS idx_ordenes_combustible_subtipo ON ordenes_combustible(subtipo_combustible);

-- Comentarios de las columnas
COMMENT ON COLUMN vehiculos.subtipo_combustible IS 'Subtipo de combustible (ej. DIESEL_UBA, GASOLINA_95) - Variaciones según estándar Peruano';
COMMENT ON COLUMN ordenes_combustible.subtipo_combustible IS 'Subtipo de combustible en la orden de abastecimiento';
