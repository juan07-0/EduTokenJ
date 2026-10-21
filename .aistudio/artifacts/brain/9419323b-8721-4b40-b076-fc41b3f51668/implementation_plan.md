# EduToken LMS: Plataforma Educativa Basada en Llaves de Acceso

Sistema modular de gestión de aprendizaje (LMS) adaptativo y de cero costo operativo inicial, optimizado para 11 grados escolares, 3 periodos académicos y 5 materias troncales, con autenticación sin contraseña mediante tokens/llaves y adaptación visual integral para Primaria y Secundaria.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> A continuación se resumen las decisiones acordadas durante la fase de clarificación interactiva y los puntos clave de diseño:

- **Estrategia de Persistencia Híbrida**: Almacenamiento local reactivo e instantáneo listo para funcionar sin configuración inicial en AI Studio y GitHub, complementado con un esquema SQL DDL completo de Supabase listo para producción y panel de configuración de credenciales Supabase (URL y Anon Key) para sincronización en la nube.
- **Datos de Demostración Pre-cargados**: Incluye llaves activas para prueba inmediata (ej. `SOF-1P-4921` para 3° de Primaria, `ALE-2P-8832` para 9° de Secundaria y `ADM-MASTER-2026` para Administrador) con lecciones curriculares modelo y exámenes interactivos.
- **Estética Dual Adaptativa**:
  - **Modo Primaria (1° a 5°)**: Visualmente gamificado, colores cálidos y enérgicos, tarjetas amplias con bordes redondeados (`rounded-3xl`), microinteracciones fluidas, medallas de progreso e iconografía lúdica.
  - **Modo Secundaria (6° a 11°)**: Estilo dashboard académico minimalista y profesional, tipografía limpia, paleta sobria de alto contraste, enfocado en productividad y concentración.

---

### 1. Overview & Core Concept

- **Qué hace el sistema**: Permite a instituciones o tutores gestionar contenidos, exámenes y certificados para 11 grados (1° a 11°), organizados en 3 periodos y 5 asignaturas troncales (Matemáticas, Lenguaje, Ciencias Naturales, Ciencias Sociales e Inglés). El acceso de estudiantes y administradores se realiza mediante llaves alfanuméricas parametrizables que restringen grados, periodos y materias.
- **Público Objetivo**: Estudiantes de 6 a 17 años (Primaria y Secundaria) y docentes/administradores que buscan una solución sin fricción de contraseñas ni costos de infraestructura.
- **Valor Principal**: Simplicidad radical de acceso (1 llave = perfil configurado), evaluación automática inmediata en preguntas de opción múltiple, corrección asistida por IA (Gemini 3.8 Flash) en preguntas abiertas y generación instantánea de certificados PDF verificables sin sobrecargar servidores.

---

### 2. User Experience & Visual Design

#### A. Flujos Clave de Usuario
1. **Acceso Universal (Login por Llave)**:
   - Pantalla de inicio con un input central grande y amigable para ingresar el token (ej. `SOF-1P-4921` o `ADM-MASTER-2026`).
   - Acceso rápido con "Llaves de demostración" para evaluación inmediata con 1 clic.
2. **Dashboard del Estudiante (Modo Primaria: 1° a 5°)**:
   - Saludo entusiasta con avatar temático y nivel.
   - Selector de los 3 periodos (con indicadores claros de acceso habilitado o bloqueado).
   - 5 tarjetas de materias con colores distintivos e ilustraciones SVG domain-specific.
   - Visor de lecciones con tabs de contenido, enlaces interactivos y material multimedia.
   - Módulo de examen con feedback visual inmediato, barra de progreso y animación al aprobar.
3. **Dashboard del Estudiante (Modo Secundaria: 6° a 11°)**:
   - Navegación lateral o superior tipo SaaS académico con métricas de rendimiento y notas de periodos.
   - Vista de materias con desglose curricular estructurado y visor de lectura sin distracciones.
   - Examen con temporizador opcional, confirmación de respuestas y desglose analítico de puntajes.
4. **Certificación y Alerta de Reprobación**:
   - **Aprobado**: Despliegue de certificado digital oficial con código QR/hash de verificación, con descarga en PDF generada en el navegador vía Canvas/jsPDF.
   - **Reprobado**: Mensaje pedagógico constructivo con recomendación de temas específicos a repasar y registro automático en el buzón de alertas del administrador.
5. **Panel del Administrador**:
   - **Generador Rápido de Llaves**: Formulario con nombre, grado, selector múltiple de periodos permitidos y materias autorizadas; botón de copia rápida al portapapeles.
   - **Gestor de Contenidos & Exámenes**: Explorador en árbol (Grado $\to$ Periodo $\to$ Materia) para crear/editar lecciones y formular preguntas (cerradas y abiertas con rúbrica para Gemini).
   - **Editor Visual de Certificados**: Personalización de logo escolar, firmas de directivos, membrete institucional y margen ornamental.
   - **Monitor de Evaluaciones & Alertas**: Registro tabular en tiempo real de intentos, notas y alertas de estudiantes que necesitan refuerzo.

#### B. Identidad Visual y Paleta de Color
- **Primaria**:
  - *Fondo*: `#FFFDF7` (Crema suave cálido).
  - *Acentos*: Azul cielo `#0284C7`, Ámbar radiante `#F59E0B`, Verde bosque `#10B981`, Índigo alegre `#6366F1`.
  - *Bordes y Radios*: `rounded-2xl` a `rounded-3xl` con sombras suaves de color.
- **Secundaria**:
  - *Fondo*: `#F8FAFC` (Slate neutro limpio) con superficies en blanco puro `#FFFFFF`.
  - *Acentos*: Azul marino institucional `#1E293B`, Azul cobalto `#2563EB`, Gris de línea `#E2E8F0`.
  - *Bordes y Radios*: `rounded-lg` a `rounded-xl`, tipografía estructurada con cifras tabulares.
- **Tipografía**:
  - Títulos y encabezados: `Plus Jakarta Sans` y `Outfit` con pesos 600/700.
  - Cuerpo: `DM Sans` (15-16px, excelente legibilidad para lectura escolar).
  - Cifras y códigos de llaves: `IBM Plex Mono` / `font-mono tabular-nums`.

---

### 3. Key Product Decisions & Trade-Offs

- **Persistencia Dual (IndexedDB / LocalStorage + Supabase PostgreSQL)**:
  - *Decisión*: El sistema inicia en modo autosuficiente con persistencia local robusta e instantánea para garantizar que la aplicación funcione al 100% en AI Studio, previsualizaciones compartidas y despliegues estáticos de GitHub Pages / Vercel sin requerir setup forzado de base de datos externa. Al mismo tiempo, incluye el esquema SQL completo y un puente opcional de configuración de cliente Supabase (`@supabase/supabase-js`).
  - *Beneficio*: Cero fricción de inicio, cero fallos por falta de variables de entorno, y camino directo a producción empresarial.
- **Generación de Certificados en Cliente (`html2canvas` / `jspdf`)**:
  - *Decisión*: Generar el PDF y la imagen del certificado enteramente en el navegador del usuario utilizando renderizado de canvas vectorial de alta resolución (300 DPI).
  - *Beneficio*: Cero costo de CPU en el servidor, descarga instantánea e infalible incluso con conexiones inestables.
- **Evaluación Asistida por IA con Gemini 3.8 Flash**:
  - *Decisión*: Evaluación de respuestas abiertas mediante endpoint seguro en servidor Express (`POST /api/eval-open-question`) utilizando el SDK `@google/genai` con el modelo `gemini-3.8-flash`, pasando la respuesta del estudiante junto con la rúbrica pedagógica del profesor y devolviendo calificación numérica y retroalimentación formativa en JSON estructurado.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                         │
│                                                                        │
│  ┌───────────────────────┐             ┌────────────────────────────┐  │
│  │   Auth / Token Gate   │             │   Top Bar (Brand / Key)    │  │
│  └───────────┬───────────┘             └─────────────┬──────────────┘  │
│              │                                       │                 │
│              ▼                                       ▼                 │
│  ┌───────────────────────┐             ┌────────────────────────────┐  │
│  │  Estudiante (Primaria)│             │  Estudiante (Secundaria)   │  │
│  │  (Grados 1° - 5°)     │             │  (Grados 6° - 11°)         │  │
│  │  - Modo Lúdico        │             │  - Dashboard Minimalista   │  │
│  │  - 3 Periodos / 5 Mat │             │  - 3 Periodos / 5 Mat      │  │
│  │  - Examen & Diploma   │             │  - Examen & Diploma        │  │
│  └───────────┬───────────┘             └─────────────┬──────────────┘  │
│              │                                       │                 │
│              ▼                                       ▼                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              Panel de Administración (Gestor Único)              │  │
│  │   • Generador Llaves  • Editor Curricular  • Exámenes & Rúbricas │  │
│  │   • Plantilla Diploma • Monitor Reprobados • Config Supabase     │  │
│  └───────────────────────────────────┬──────────────────────────────┘  │
└──────────────────────────────────────┼─────────────────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
        ┌───────────────────────┐             ┌───────────────────────┐
        │  Local Database Engine│             │  Express Server API   │
        │  (LocalStorage/Local) │             │  POST /api/eval-exam  │
        │  + Supabase Sync Ready│             │  (Gemini 3.8 Flash)   │
        └───────────────────────┘             └───────────────────────┘
```

#### Esquema SQL de Supabase (PostgreSQL DDL)
El esquema completo incluye integridad referencial, índices de búsqueda rápida y Row Level Security (RLS):

```sql
-- 1. Tabla de Llaves de Acceso (Estudiantes y Administradores)
CREATE TABLE access_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_code VARCHAR(32) UNIQUE NOT NULL,
    role VARCHAR(16) NOT NULL CHECK (role IN ('student', 'admin')),
    student_name VARCHAR(120),
    grade INTEGER CHECK (grade BETWEEN 1 AND 11),
    allowed_periods INTEGER[] DEFAULT '{1,2,3}',
    allowed_subjects TEXT[] DEFAULT '{"matematicas","lenguaje","ciencias_naturales","ciencias_sociales","ingles"}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- 2. Tabla de Lecciones y Material Curricular
CREATE TABLE curriculum_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 11),
    period INTEGER NOT NULL CHECK (period BETWEEN 1 AND 3),
    subject VARCHAR(32) NOT NULL,
    title VARCHAR(200) NOT NULL,
    summary TEXT,
    content_markdown TEXT NOT NULL,
    video_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Exámenes y Cuestionarios
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 11),
    period INTEGER NOT NULL CHECK (period BETWEEN 1 AND 3),
    subject VARCHAR(32) NOT NULL,
    title VARCHAR(200) NOT NULL,
    passing_score INTEGER DEFAULT 70 CHECK (passing_score BETWEEN 1 AND 100),
    questions JSONB NOT NULL, -- Array de preguntas: tipo (multiple_choice, open), enunciado, opciones, respuesta correcta, rúbrica
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Intentos y Resultados de Exámenes
CREATE TABLE exam_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    key_code VARCHAR(32) NOT NULL,
    student_name VARCHAR(120) NOT NULL,
    grade INTEGER NOT NULL,
    period INTEGER NOT NULL,
    subject VARCHAR(32) NOT NULL,
    score NUMERIC(5,2) NOT NULL,
    passed BOOLEAN NOT NULL,
    answers JSONB NOT NULL,
    ai_feedback JSONB, -- Retroalimentación detallada por pregunta abierta
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Certificados Emitidos
CREATE TABLE issued_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_code VARCHAR(64) UNIQUE NOT NULL,
    submission_id UUID REFERENCES exam_submissions(id),
    student_name VARCHAR(120) NOT NULL,
    grade INTEGER NOT NULL,
    period INTEGER NOT NULL,
    subject VARCHAR(32) NOT NULL,
    score NUMERIC(5,2) NOT NULL,
    institution_name VARCHAR(150) DEFAULT 'Instituto Educativo Modelo',
    issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Configuración Institucional y Plantilla de Certificado
CREATE TABLE institution_settings (
    id VARCHAR(32) PRIMARY KEY DEFAULT 'main',
    name VARCHAR(150) NOT NULL,
    logo_url TEXT,
    rector_name VARCHAR(120),
    rector_title VARCHAR(120),
    theme_signature_url TEXT,
    legal_text TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de consulta rápida
CREATE INDEX idx_access_keys_code ON access_keys(key_code);
CREATE INDEX idx_curriculum_lookup ON curriculum_lessons(grade, period, subject);
CREATE INDEX idx_exam_lookup ON exams(grade, period, subject);
CREATE INDEX idx_submissions_alerts ON exam_submissions(passed, submitted_at);
```

#### Estructura Modular de Archivos
- `src/types/lms.ts`: Definición de interfaces TypeScript para Llaves, Lecciones, Exámenes, Resultados y Certificados.
- `src/data/mockCurriculum.ts`: Semilla exhaustiva con datos iniciales para los 11 grados, 3 periodos y 5 materias, más llaves de prueba.
- `src/services/storageService.ts`: Gestor de datos unificado (interfaz CRUD reactiva sobre almacenamiento local con adaptador listo para Supabase).
- `src/services/geminiEvaluator.ts`: Cliente de evaluación de preguntas abiertas asistida por IA.
- `src/components/auth/TokenLoginModal.tsx`: Pantalla de ingreso y selector de llaves demo.
- `src/components/student/PrimaryDashboard.tsx`: Vista interactiva y lúdica para Grados 1° a 5°.
- `src/components/student/SecondaryDashboard.tsx`: Vista minimalista y académica para Grados 6° a 11°.
- `src/components/student/ExamView.tsx`: Cuestionario interactivo con corrección automática y evaluación IA.
- `src/components/student/CertificateModal.tsx`: Visualizador y generador PDF de diplomas verificables.
- `src/components/admin/AdminDashboard.tsx`: Panel de control general con pestañas de:
  - Generador y lista de Llaves
  - Editor Curricular y Creador de Exámenes
  - Editor de Plantilla de Diplomas
  - Monitor de Reprobados y Alertas
  - Visor/Exportador del Esquema SQL y Configuración Supabase
- `server.ts`: Servidor backend Express para llamadas a la API de Gemini 3.8 Flash para la corrección pedagógica de preguntas abiertas y servicio de la app.
