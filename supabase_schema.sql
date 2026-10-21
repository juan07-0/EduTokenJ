-- ==============================================================================
-- EDUTOKEN LMS: ESQUEMA OFICIAL DE BASE DE DATOS PARA SUPABASE (POSTGRESQL)
-- Tablas: users, keys, exams, results, certificates
-- ==============================================================================

-- Habilitar extensión para UUIDs automáticos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: USERS (Usuarios del Sistema: Estudiantes, Docentes y Administradores)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'teacher')),
    grade INTEGER CHECK (grade BETWEEN 1 AND 11),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: KEYS (Llaves / Tokens de Acceso Parametrizables)
CREATE TABLE IF NOT EXISTS keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    key_code VARCHAR(32) UNIQUE NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'teacher')),
    grade INTEGER CHECK (grade BETWEEN 1 AND 11),
    allowed_periods INTEGER[] DEFAULT '{1,2,3}',
    allowed_subjects TEXT[] DEFAULT '{"matematicas","lenguaje","ciencias_naturales","ciencias_sociales","ingles"}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- 3. TABLA: EXAMS (Cuestionarios y Evaluaciones por Grado, Periodo y Materia)
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 11),
    period INTEGER NOT NULL CHECK (period BETWEEN 1 AND 3),
    subject VARCHAR(32) NOT NULL,
    title VARCHAR(200) NOT NULL,
    passing_score INTEGER DEFAULT 70 CHECK (passing_score BETWEEN 1 AND 100),
    questions JSONB NOT NULL DEFAULT '[]'::JSONB, -- Array de preguntas (opción múltiple y abiertas con rúbrica)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_exam_grade_period_subject UNIQUE (grade, period, subject)
);

-- 4. TABLA: RESULTS (Resultados e Intentos de Exámenes con Alerta de Reprobación)
CREATE TABLE IF NOT EXISTS results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    key_code VARCHAR(32) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 11),
    period INTEGER NOT NULL CHECK (period BETWEEN 1 AND 3),
    subject VARCHAR(32) NOT NULL,
    score NUMERIC(5, 2) NOT NULL,
    total_points_earned NUMERIC(6, 2) DEFAULT 0,
    total_points_possible NUMERIC(6, 2) DEFAULT 100,
    passed BOOLEAN NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}'::JSONB,
    ai_feedback JSONB DEFAULT '{}'::JSONB,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: CERTIFICATES (Diplomas y Acreditaciones Oficiales Emitidas)
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_code VARCHAR(64) UNIQUE NOT NULL,
    result_id UUID REFERENCES results(id) ON DELETE CASCADE,
    student_name VARCHAR(150) NOT NULL,
    grade INTEGER NOT NULL,
    period INTEGER NOT NULL,
    subject VARCHAR(32) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    score NUMERIC(5, 2) NOT NULL,
    institution_name VARCHAR(150) DEFAULT 'Instituto Educativo Modelo',
    rector_name VARCHAR(150) DEFAULT 'Rectoría General',
    issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- VISTAS DE COMPATIBILIDAD (Para soportar tanto la nomenclatura simple como compuesta)
-- ==============================================================================
CREATE OR REPLACE VIEW access_keys AS SELECT * FROM keys;
CREATE OR REPLACE VIEW exam_submissions AS SELECT * FROM results;
CREATE OR REPLACE VIEW issued_certificates AS SELECT * FROM certificates;

-- ==============================================================================
-- ÍNDICES DE RENDIMIENTO Y CONSULTA RÁPIDA
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_keys_code ON keys(key_code);
CREATE INDEX IF NOT EXISTS idx_exams_lookup ON exams(grade, period, subject);
CREATE INDEX IF NOT EXISTS idx_results_alerts ON results(passed, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON certificates(verification_code);

-- ==============================================================================
-- DATOS SEMILLA INICIALES (Para pruebas inmediatas en Supabase)
-- ==============================================================================
INSERT INTO keys (key_code, student_name, role, grade, allowed_periods, allowed_subjects, is_active)
VALUES
    ('SOF-1P-4921', 'Sofía Gómez', 'student', 3, '{1,2,3}', '{"matematicas","lenguaje","ciencias_naturales","ciencias_sociales","ingles"}', true),
    ('MAT-1P-1044', 'Mateo Rivas', 'student', 1, '{1}', '{"matematicas","lenguaje","ciencias_naturales"}', true),
    ('ALE-2P-8832', 'Alejandro Torres', 'student', 9, '{1,2,3}', '{"matematicas","lenguaje","ciencias_naturales","ciencias_sociales","ingles"}', true),
    ('VAL-3P-9901', 'Valeria Castro', 'student', 11, '{1,2}', '{"matematicas","ingles","ciencias_naturales"}', true),
    ('ADM-MASTER-2026', 'Prof. Carlos Mendoza', 'admin', 11, '{1,2,3}', '{"matematicas","lenguaje","ciencias_naturales","ciencias_sociales","ingles"}', true)
ON CONFLICT (key_code) DO NOTHING;
