-- ═══════════════════════════════════════════════════════════
--  SCHEMA
-- ═══════════════════════════════════════════════════════════

DO $$ BEGIN
  CREATE TYPE estado_bus_estado_operativo_enum AS ENUM (
    'DISPONIBLE','EN_COLA','EN_RUTA','FINALIZADO','FUERA_DE_SERVICIO','EN_MANTENIMIENTO'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reporte_estado_reporte_enum AS ENUM ('EN_COLA','EN_RUTA','FINALIZADO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS bus (
    id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo                VARCHAR NOT NULL UNIQUE,
    capacidad             INTEGER NOT NULL,
    usuario_creacion      BIGINT NOT NULL,
    usuario_actualizacion BIGINT NOT NULL,
    fecha_creacion        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado                BOOLEAN NOT NULL DEFAULT true,
    eliminado             BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS estado_bus (
    id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    bus_id                BIGINT NOT NULL REFERENCES bus(id),
    estado_operativo      estado_bus_estado_operativo_enum NOT NULL,
    usuario_creacion      BIGINT NOT NULL,
    usuario_actualizacion BIGINT NOT NULL,
    fecha_creacion        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado                BOOLEAN NOT NULL DEFAULT true,
    eliminado             BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS reporte (
    id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    bus_id                BIGINT NOT NULL REFERENCES bus(id),
    estado_reporte        reporte_estado_reporte_enum NOT NULL DEFAULT 'EN_COLA',
    cantidad_pasajeros    INTEGER NOT NULL,
    latitud_inicio        DECIMAL(10,7) NOT NULL,
    longitud_inicio       DECIMAL(10,7) NOT NULL,
    latitud_fin           DECIMAL(10,7),
    longitud_fin          DECIMAL(10,7),
    inicio_en             TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fin_en                TIMESTAMP WITH TIME ZONE,
    usuario_creacion      BIGINT NOT NULL,
    usuario_actualizacion BIGINT NOT NULL,
    fecha_creacion        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado                BOOLEAN NOT NULL DEFAULT true,
    eliminado             BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS seguimiento (
    id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reporte_id            BIGINT NOT NULL REFERENCES reporte(id),
    latitud               DECIMAL(10,7) NOT NULL,
    longitud              DECIMAL(10,7) NOT NULL,
    usuario_creacion      BIGINT NOT NULL,
    usuario_actualizacion BIGINT NOT NULL,
    fecha_creacion        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado                BOOLEAN NOT NULL DEFAULT true,
    eliminado             BOOLEAN NOT NULL DEFAULT false
);

BEGIN;

-- ═══════════════════════════════════════════════════════════
--  BUSES  (capacidad 200 pasajeros c/u)
-- ═══════════════════════════════════════════════════════════
INSERT INTO bus (codigo, capacidad, usuario_creacion, usuario_actualizacion, fecha_creacion, fecha_actualizacion, estado, eliminado)
VALUES
  ('BUS-001', 200, 1, 1, '2026-04-24 08:00:00-05', '2026-04-24 08:00:00-05', true, false),
  ('BUS-002', 200, 1, 1, '2026-04-24 08:00:00-05', '2026-04-24 08:00:00-05', true, false),
  ('BUS-003', 200, 1, 1, '2026-04-24 08:00:00-05', '2026-04-24 08:00:00-05', true, false);

-- ═══════════════════════════════════════════════════════════
--  HISTORIAL DE ESTADOS OPERATIVOS
--  Coordenadas reales del Metropolitano Lima (UTC-5)
-- ═══════════════════════════════════════════════════════════

-- ── BUS-001 ─ DÍA 1 (25 Abr): turno mañana + tarde + incidente
INSERT INTO estado_bus (bus_id, estado_operativo, usuario_creacion, usuario_actualizacion, fecha_creacion, fecha_actualizacion, estado, eliminado)
VALUES
  (1, 'DISPONIBLE',        1, 1, '2026-04-25 05:50:00-05', '2026-04-25 05:50:00-05', true, false),
  (1, 'EN_COLA',           1, 1, '2026-04-25 06:25:00-05', '2026-04-25 06:25:00-05', true, false),
  (1, 'EN_RUTA',           1, 1, '2026-04-25 06:30:00-05', '2026-04-25 06:30:00-05', true, false),
  (1, 'FINALIZADO',        1, 1, '2026-04-25 07:45:00-05', '2026-04-25 07:45:00-05', true, false),
  (1, 'DISPONIBLE',        1, 1, '2026-04-25 07:55:00-05', '2026-04-25 07:55:00-05', true, false),
  (1, 'EN_COLA',           1, 1, '2026-04-25 08:00:00-05', '2026-04-25 08:00:00-05', true, false),
  (1, 'EN_RUTA',           1, 1, '2026-04-25 08:05:00-05', '2026-04-25 08:05:00-05', true, false),
  (1, 'FINALIZADO',        1, 1, '2026-04-25 09:20:00-05', '2026-04-25 09:20:00-05', true, false),
  (1, 'DISPONIBLE',        1, 1, '2026-04-25 09:30:00-05', '2026-04-25 09:30:00-05', true, false),
  (1, 'EN_COLA',           1, 1, '2026-04-25 16:55:00-05', '2026-04-25 16:55:00-05', true, false),
  (1, 'EN_RUTA',           1, 1, '2026-04-25 17:00:00-05', '2026-04-25 17:00:00-05', true, false),
  (1, 'FINALIZADO',        1, 1, '2026-04-25 18:30:00-05', '2026-04-25 18:30:00-05', true, false),
  (1, 'FUERA_DE_SERVICIO', 1, 1, '2026-04-25 19:00:00-05', '2026-04-25 19:00:00-05', true, false);

-- ── BUS-001 ─ DÍA 2 (26 Abr): mantenimiento luego retoma servicio
INSERT INTO estado_bus (bus_id, estado_operativo, usuario_creacion, usuario_actualizacion, fecha_creacion, fecha_actualizacion, estado, eliminado)
VALUES
  (1, 'EN_MANTENIMIENTO', 1, 1, '2026-04-26 07:00:00-05', '2026-04-26 07:00:00-05', true, false),
  (1, 'DISPONIBLE',       1, 1, '2026-04-26 10:00:00-05', '2026-04-26 10:00:00-05', true, false),
  (1, 'EN_COLA',          1, 1, '2026-04-26 10:30:00-05', '2026-04-26 10:30:00-05', true, false),
  (1, 'EN_RUTA',          1, 1, '2026-04-26 10:35:00-05', '2026-04-26 10:35:00-05', true, false),
  (1, 'FINALIZADO',       1, 1, '2026-04-26 11:55:00-05', '2026-04-26 11:55:00-05', true, false),
  (1, 'DISPONIBLE',       1, 1, '2026-04-26 12:00:00-05', '2026-04-26 12:00:00-05', true, false);

-- ── BUS-002 ─ DÍA 1 (25 Abr): turno completo sin incidentes
INSERT INTO estado_bus (bus_id, estado_operativo, usuario_creacion, usuario_actualizacion, fecha_creacion, fecha_actualizacion, estado, eliminado)
VALUES
  (2, 'DISPONIBLE',  1, 1, '2026-04-25 06:55:00-05', '2026-04-25 06:55:00-05', true, false),
  (2, 'EN_COLA',     1, 1, '2026-04-25 06:58:00-05', '2026-04-25 06:58:00-05', true, false),
  (2, 'EN_RUTA',     1, 1, '2026-04-25 07:00:00-05', '2026-04-25 07:00:00-05', true, false),
  (2, 'FINALIZADO',  1, 1, '2026-04-25 07:40:00-05', '2026-04-25 07:40:00-05', true, false),
  (2, 'DISPONIBLE',  1, 1, '2026-04-25 07:45:00-05', '2026-04-25 07:45:00-05', true, false),
  (2, 'EN_COLA',     1, 1, '2026-04-25 17:25:00-05', '2026-04-25 17:25:00-05', true, false),
  (2, 'EN_RUTA',     1, 1, '2026-04-25 17:30:00-05', '2026-04-25 17:30:00-05', true, false),
  (2, 'FINALIZADO',  1, 1, '2026-04-25 19:00:00-05', '2026-04-25 19:00:00-05', true, false),
  (2, 'DISPONIBLE',  1, 1, '2026-04-25 19:05:00-05', '2026-04-25 19:05:00-05', true, false);

-- ── BUS-002 ─ DÍA 2 (26 Abr): EN RUTA actualmente (Naranjal → Matellini)
INSERT INTO estado_bus (bus_id, estado_operativo, usuario_creacion, usuario_actualizacion, fecha_creacion, fecha_actualizacion, estado, eliminado)
VALUES
  (2, 'EN_COLA',  1, 1, '2026-04-26 13:55:00-05', '2026-04-26 13:55:00-05', true, false),
  (2, 'EN_RUTA',  1, 1, '2026-04-26 14:00:00-05', '2026-04-26 14:00:00-05', true, false);

-- ── BUS-003 ─ DÍA 1 (25 Abr): fuera de servicio por incidente mecánico
INSERT INTO estado_bus (bus_id, estado_operativo, usuario_creacion, usuario_actualizacion, fecha_creacion, fecha_actualizacion, estado, eliminado)
VALUES
  (3, 'FUERA_DE_SERVICIO', 1, 1, '2026-04-25 06:00:00-05', '2026-04-25 06:00:00-05', true, false);

-- ── BUS-003 ─ DÍA 2 (26 Abr): reparado, en cola esperando salir
INSERT INTO estado_bus (bus_id, estado_operativo, usuario_creacion, usuario_actualizacion, fecha_creacion, fecha_actualizacion, estado, eliminado)
VALUES
  (3, 'EN_MANTENIMIENTO', 1, 1, '2026-04-26 07:00:00-05', '2026-04-26 07:00:00-05', true, false),
  (3, 'DISPONIBLE',       1, 1, '2026-04-26 09:00:00-05', '2026-04-26 09:00:00-05', true, false),
  (3, 'EN_COLA',          1, 1, '2026-04-26 13:30:00-05', '2026-04-26 13:30:00-05', true, false);

-- ═══════════════════════════════════════════════════════════
--  REPORTES DE VIAJE
--  Rutas reales del Metropolitano de Lima
-- ═══════════════════════════════════════════════════════════

-- ── Reporte 1: BUS-001 | Naranjal → Central | 25 Abr AM | 180 pas (90%)
INSERT INTO reporte (bus_id, estado_reporte, cantidad_pasajeros, latitud_inicio, longitud_inicio, latitud_fin, longitud_fin, inicio_en, fin_en, usuario_creacion, usuario_actualizacion, fecha_creacion, fecha_actualizacion, estado, eliminado)
VALUES (1, 'FINALIZADO', 180, -11.9594, -77.0619, -12.0464, -77.0320,
        '2026-04-25 06:30:00-05', '2026-04-25 07:45:00-05',
        1, 1, '2026-04-25 06:30:00-05', '2026-04-25 07:45:00-05', true, false);

-- ── Reporte 2: BUS-001 | Central → Naranjal (retorno) | 25 Abr media mañana | 120 pas (60%)
INSERT INTO reporte (bus_id, estado_reporte, cantidad_pasajeros, latitud_inicio, longitud_inicio, latitud_fin, longitud_fin, inicio_en, fin_en, usuario_creacion, usuario_actualizacion, fecha_creacion, fecha_actualizacion, estado, eliminado)
VALUES (1, 'FINALIZADO', 120, -12.0464, -77.0320, -11.9594, -77.0619,
        '2026-04-25 08:05:00-05', '2026-04-25 09:20:00-05',
        1, 1, '2026-04-25 08:05:00-05', '2026-04-25 09:20:00-05', true, false);

-- ── Reporte 3: BUS-001 | Naranjal → Matellini (ruta completa) | 25 Abr hora punta | 200 pas (100%)
INSERT INTO reporte (bus_id, estado_reporte, cantidad_pasajeros, latitud_inicio, longitud_inicio, latitud_fin, longitud_fin, inicio_en, fin_en, usuario_creacion, usuario_actualizacion, fecha_creacion, fecha_actualizacion, estado, eliminado)
VALUES (1, 'FINALIZADO', 200, -11.9594, -77.0619, -12.1851, -76.9921,
        '2026-04-25 17:00:00-05', '2026-04-25 18:30:00-05',
        1, 1, '2026-04-25 17:00:00-05', '2026-04-25 18:30:00-05', true, false);

-- ── Reporte 4: BUS-001 | Naranjal → Central | 26 Abr mañana | 140 pas (70%)
INSERT INTO reporte (bus_id, estado_reporte, cantidad_pasajeros, latitud_inicio, longitud_inicio, latitud_fin, longitud_fin, inicio_en, fin_en, usuario_creacion, usuario_actualizacion, fecha_creacion, fecha_actualizacion, estado, eliminado)
VALUES (1, 'FINALIZADO', 140, -11.9594, -77.0619, -12.0464, -77.0320,
        '2026-04-26 10:35:00-05', '2026-04-26 11:55:00-05',
        1, 1, '2026-04-26 10:35:00-05', '2026-04-26 11:55:00-05', true, false);

-- ── Reporte 5: BUS-002 | Central → Javier Prado | 25 Abr AM | 150 pas (75%)
INSERT INTO reporte (bus_id, estado_reporte, cantidad_pasajeros, latitud_inicio, longitud_inicio, latitud_fin, longitud_fin, inicio_en, fin_en, usuario_creacion, usuario_actualizacion, fecha_creacion, fecha_actualizacion, estado, eliminado)
VALUES (2, 'FINALIZADO', 150, -12.0464, -77.0320, -12.0886, -77.0272,
        '2026-04-25 07:00:00-05', '2026-04-25 07:40:00-05',
        1, 1, '2026-04-25 07:00:00-05', '2026-04-25 07:40:00-05', true, false);

-- ── Reporte 6: BUS-002 | Javier Prado → Naranjal (retorno) | 25 Abr hora punta | 200 pas (100%)
INSERT INTO reporte (bus_id, estado_reporte, cantidad_pasajeros, latitud_inicio, longitud_inicio, latitud_fin, longitud_fin, inicio_en, fin_en, usuario_creacion, usuario_actualizacion, fecha_creacion, fecha_actualizacion, estado, eliminado)
VALUES (2, 'FINALIZADO', 200, -12.0886, -77.0272, -11.9594, -77.0619,
        '2026-04-25 17:30:00-05', '2026-04-25 19:00:00-05',
        1, 1, '2026-04-25 17:30:00-05', '2026-04-25 19:00:00-05', true, false);

-- ── Reporte 7: BUS-002 | Naranjal → Matellini | 26 Abr tarde | 175 pas (87.5%) | EN RUTA AHORA
INSERT INTO reporte (bus_id, estado_reporte, cantidad_pasajeros, latitud_inicio, longitud_inicio, latitud_fin, longitud_fin, inicio_en, fin_en, usuario_creacion, usuario_actualizacion, fecha_creacion, fecha_actualizacion, estado, eliminado)
VALUES (2, 'EN_RUTA', 175, -11.9594, -77.0619, NULL, NULL,
        '2026-04-26 14:00:00-05', NULL,
        1, 1, '2026-04-26 14:00:00-05', '2026-04-26 14:00:00-05', true, false);

-- ── Reporte 8: BUS-003 | Naranjal → Central | 26 Abr tarde | 50 pas (25%) | EN COLA
INSERT INTO reporte (bus_id, estado_reporte, cantidad_pasajeros, latitud_inicio, longitud_inicio, latitud_fin, longitud_fin, inicio_en, fin_en, usuario_creacion, usuario_actualizacion, fecha_creacion, fecha_actualizacion, estado, eliminado)
VALUES (3, 'EN_COLA', 50, -11.9594, -77.0619, NULL, NULL,
        '2026-04-26 13:30:00-05', NULL,
        1, 1, '2026-04-26 13:30:00-05', '2026-04-26 13:30:00-05', true, false);

-- ═══════════════════════════════════════════════════════════
--  SEGUIMIENTOS GPS
--  Estaciones reales del Metropolitano de Lima
--
--  Naranjal    (-11.9594, -77.0619) → terminal norte
--  Independencia (-11.9762, -77.0617)
--  Los Jazmines  (-11.9853, -77.0573)
--  El Milagro    (-12.0040, -77.0498)
--  Caquetá       (-12.0162, -77.0441)
--  Bolognesi     (-12.0278, -77.0388)
--  Quilca        (-12.0399, -77.0347)
--  Central       (-12.0464, -77.0320) → estación central
--  Estadio       (-12.0643, -77.0299)
--  Javier Prado  (-12.0886, -77.0272)
--  Angamos       (-12.1108, -77.0152)
--  Benavides     (-12.1308, -77.0052)
--  Higuereta     (-12.1456, -77.0012)
--  Aramburú      (-12.1579, -76.9968)
--  Matellini     (-12.1851, -76.9921) → terminal sur
-- ═══════════════════════════════════════════════════════════

-- Reporte 1 | BUS-001 | Naranjal → Central | 06:30 – 07:45
INSERT INTO seguimiento (reporte_id, latitud, longitud, usuario_creacion, usuario_actualizacion, fecha_creacion, fecha_actualizacion, estado, eliminado)
VALUES
  (1, -11.9594, -77.0619, 1, 1, '2026-04-25 06:30:00-05', '2026-04-25 06:30:00-05', true, false),
  (1, -11.9762, -77.0617, 1, 1, '2026-04-25 06:41:00-05', '2026-04-25 06:41:00-05', true, false),
  (1, -11.9853, -77.0573, 1, 1, '2026-04-25 06:52:00-05', '2026-04-25 06:52:00-05', true, false),
  (1, -12.0040, -77.0498, 1, 1, '2026-04-25 07:03:00-05', '2026-04-25 07:03:00-05', true, false),
  (1, -12.0162, -77.0441, 1, 1, '2026-04-25 07:14:00-05', '2026-04-25 07:14:00-05', true, false),
  (1, -12.0278, -77.0388, 1, 1, '2026-04-25 07:25:00-05', '2026-04-25 07:25:00-05', true, false),
  (1, -12.0399, -77.0347, 1, 1, '2026-04-25 07:36:00-05', '2026-04-25 07:36:00-05', true, false),
  (1, -12.0464, -77.0320, 1, 1, '2026-04-25 07:45:00-05', '2026-04-25 07:45:00-05', true, false);

-- Reporte 2 | BUS-001 | Central → Naranjal (retorno) | 08:05 – 09:20
INSERT INTO seguimiento (reporte_id, latitud, longitud, usuario_creacion, usuario_actualizacion, fecha_creacion, fecha_actualizacion, estado, eliminado)
VALUES
  (2, -12.0464, -77.0320, 1, 1, '2026-04-25 08:05:00-05', '2026-04-25 08:05:00-05', true, false),
  (2, -12.0399, -77.0347, 1, 1, '2026-04-25 08:16:00-05', '2026-04-25 08:16:00-05', true, false),
  (2, -12.0278, -77.0388, 1, 1, '2026-04-25 08:27:00-05', '2026-04-25 08:27:00-05', true, false),
  (2, -12.0162, -77.0441, 1, 1, '2026-04-25 08:38:00-05', '2026-04-25 08:38:00-05', true, false),
  (2, -11.9853, -77.0573, 1, 1, '2026-04-25 08:55:00-05', '2026-04-25 08:55:00-05', true, false),
  (2, -11.9762, -77.0617, 1, 1, '2026-04-25 09:08:00-05', '2026-04-25 09:08:00-05', true, false),
  (2, -11.9594, -77.0619, 1, 1, '2026-04-25 09:20:00-05', '2026-04-25 09:20:00-05', true, false);

-- Reporte 3 | BUS-001 | Naranjal → Matellini (ruta completa) | 17:00 – 18:30
INSERT INTO seguimiento (reporte_id, latitud, longitud, usuario_creacion, usuario_actualizacion, fecha_creacion, fecha_actualizacion, estado, eliminado)
VALUES
  (3, -11.9594, -77.0619, 1, 1, '2026-04-25 17:00:00-05', '2026-04-25 17:00:00-05', true, false),
  (3, -11.9762, -77.0617, 1, 1, '2026-04-25 17:09:00-05', '2026-04-25 17:09:00-05', true, false),
  (3, -12.0040, -77.0498, 1, 1, '2026-04-25 17:18:00-05', '2026-04-25 17:18:00-05', true, false),
  (3, -12.0162, -77.0441, 1, 1, '2026-04-25 17:27:00-05', '2026-04-25 17:27:00-05', true, false),
  (3, -12.0399, -77.0347, 1, 1, '2026-04-25 17:36:00-05', '2026-04-25 17:36:00-05', true, false),
  (3, -12.0464, -77.0320, 1, 1, '2026-04-25 17:45:00-05', '2026-04-25 17:45:00-05', true, false),
  (3, -12.0643, -77.0299, 1, 1, '2026-04-25 17:54:00-05', '2026-04-25 17:54:00-05', true, false),
  (3, -12.0886, -77.0272, 1, 1, '2026-04-25 18:03:00-05', '2026-04-25 18:03:00-05', true, false),
  (3, -12.1308, -77.0052, 1, 1, '2026-04-25 18:15:00-05', '2026-04-25 18:15:00-05', true, false),
  (3, -12.1851, -76.9921, 1, 1, '2026-04-25 18:30:00-05', '2026-04-25 18:30:00-05', true, false);

-- Reporte 4 | BUS-001 | Naranjal → Central | 26 Abr | 10:35 – 11:55
INSERT INTO seguimiento (reporte_id, latitud, longitud, usuario_creacion, usuario_actualizacion, fecha_creacion, fecha_actualizacion, estado, eliminado)
VALUES
  (4, -11.9594, -77.0619, 1, 1, '2026-04-26 10:35:00-05', '2026-04-26 10:35:00-05', true, false),
  (4, -11.9762, -77.0617, 1, 1, '2026-04-26 10:46:00-05', '2026-04-26 10:46:00-05', true, false),
  (4, -11.9853, -77.0573, 1, 1, '2026-04-26 10:57:00-05', '2026-04-26 10:57:00-05', true, false),
  (4, -12.0040, -77.0498, 1, 1, '2026-04-26 11:08:00-05', '2026-04-26 11:08:00-05', true, false),
  (4, -12.0162, -77.0441, 1, 1, '2026-04-26 11:19:00-05', '2026-04-26 11:19:00-05', true, false),
  (4, -12.0278, -77.0388, 1, 1, '2026-04-26 11:30:00-05', '2026-04-26 11:30:00-05', true, false),
  (4, -12.0399, -77.0347, 1, 1, '2026-04-26 11:43:00-05', '2026-04-26 11:43:00-05', true, false),
  (4, -12.0464, -77.0320, 1, 1, '2026-04-26 11:55:00-05', '2026-04-26 11:55:00-05', true, false);

-- Reporte 5 | BUS-002 | Central → Javier Prado | 25 Abr AM | 07:00 – 07:40
INSERT INTO seguimiento (reporte_id, latitud, longitud, usuario_creacion, usuario_actualizacion, fecha_creacion, fecha_actualizacion, estado, eliminado)
VALUES
  (5, -12.0464, -77.0320, 1, 1, '2026-04-25 07:00:00-05', '2026-04-25 07:00:00-05', true, false),
  (5, -12.0643, -77.0299, 1, 1, '2026-04-25 07:10:00-05', '2026-04-25 07:10:00-05', true, false),
  (5, -12.0760, -77.0285, 1, 1, '2026-04-25 07:20:00-05', '2026-04-25 07:20:00-05', true, false),
  (5, -12.0886, -77.0272, 1, 1, '2026-04-25 07:30:00-05', '2026-04-25 07:30:00-05', true, false),
  (5, -12.0886, -77.0272, 1, 1, '2026-04-25 07:40:00-05', '2026-04-25 07:40:00-05', true, false);

-- Reporte 6 | BUS-002 | Javier Prado → Naranjal (retorno hora punta) | 17:30 – 19:00
INSERT INTO seguimiento (reporte_id, latitud, longitud, usuario_creacion, usuario_actualizacion, fecha_creacion, fecha_actualizacion, estado, eliminado)
VALUES
  (6, -12.0886, -77.0272, 1, 1, '2026-04-25 17:30:00-05', '2026-04-25 17:30:00-05', true, false),
  (6, -12.0643, -77.0299, 1, 1, '2026-04-25 17:41:00-05', '2026-04-25 17:41:00-05', true, false),
  (6, -12.0464, -77.0320, 1, 1, '2026-04-25 17:52:00-05', '2026-04-25 17:52:00-05', true, false),
  (6, -12.0399, -77.0347, 1, 1, '2026-04-25 18:02:00-05', '2026-04-25 18:02:00-05', true, false),
  (6, -12.0278, -77.0388, 1, 1, '2026-04-25 18:12:00-05', '2026-04-25 18:12:00-05', true, false),
  (6, -12.0162, -77.0441, 1, 1, '2026-04-25 18:22:00-05', '2026-04-25 18:22:00-05', true, false),
  (6, -12.0040, -77.0498, 1, 1, '2026-04-25 18:32:00-05', '2026-04-25 18:32:00-05', true, false),
  (6, -11.9853, -77.0573, 1, 1, '2026-04-25 18:42:00-05', '2026-04-25 18:42:00-05', true, false),
  (6, -11.9762, -77.0617, 1, 1, '2026-04-25 18:51:00-05', '2026-04-25 18:51:00-05', true, false),
  (6, -11.9594, -77.0619, 1, 1, '2026-04-25 19:00:00-05', '2026-04-25 19:00:00-05', true, false);

-- Reporte 7 | BUS-002 | Naranjal → Matellini | 26 Abr tarde | EN RUTA AHORA
-- Seguimientos hasta Angamos (bus avanzando hacia Matellini)
INSERT INTO seguimiento (reporte_id, latitud, longitud, usuario_creacion, usuario_actualizacion, fecha_creacion, fecha_actualizacion, estado, eliminado)
VALUES
  (7, -11.9594, -77.0619, 1, 1, '2026-04-26 14:00:00-05', '2026-04-26 14:00:00-05', true, false),
  (7, -11.9762, -77.0617, 1, 1, '2026-04-26 14:10:00-05', '2026-04-26 14:10:00-05', true, false),
  (7, -11.9853, -77.0573, 1, 1, '2026-04-26 14:20:00-05', '2026-04-26 14:20:00-05', true, false),
  (7, -12.0040, -77.0498, 1, 1, '2026-04-26 14:30:00-05', '2026-04-26 14:30:00-05', true, false),
  (7, -12.0162, -77.0441, 1, 1, '2026-04-26 14:40:00-05', '2026-04-26 14:40:00-05', true, false),
  (7, -12.0278, -77.0388, 1, 1, '2026-04-26 14:50:00-05', '2026-04-26 14:50:00-05', true, false),
  (7, -12.0464, -77.0320, 1, 1, '2026-04-26 15:02:00-05', '2026-04-26 15:02:00-05', true, false),
  (7, -12.0643, -77.0299, 1, 1, '2026-04-26 15:14:00-05', '2026-04-26 15:14:00-05', true, false),
  (7, -12.0886, -77.0272, 1, 1, '2026-04-26 15:26:00-05', '2026-04-26 15:26:00-05', true, false),
  (7, -12.1108, -77.0152, 1, 1, '2026-04-26 15:38:00-05', '2026-04-26 15:38:00-05', true, false);

-- Reporte 8 | BUS-003 | EN_COLA — sin seguimientos aún

COMMIT;
