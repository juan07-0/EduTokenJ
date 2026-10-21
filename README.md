# EduToken LMS · Plataforma Educativa Basada en Llaves de Acceso

Plataforma educativa modular (LMS), de cero costo de inicio y ultra-optimizada en recursos, con autenticación sin contraseñas mediante **llaves de acceso (tokens)**, doble interfaz estética adaptativa (**Modo Primaria** lúdico vs. **Modo Secundaria** minimalista/universitario), evaluación asistida por IA mediante rúbricas pedagógicas y generación de certificados digitales oficiales verificables en PDF.

---

## 🌟 Características Principales

### 1. Autenticación Universal por Llaves (Tokens)
- Acceso sin contraseñas para mayor privacidad y cero fricción.
- Llaves con permisos parametrizables por alumno (ej. `SOF-1P-4921`):
  - Grado asignado (1° a 11°).
  - Periodos académicos autorizados (Periodos 1, 2 y 3).
  - Asignaturas troncales habilitadas.
- Llaves administrativas exclusivas para docentes y rectores (ej. `ADM-MASTER-2026`).

### 2. Doble Experiencia Visual Adaptativa (UI/UX)
- **Modo Primaria (Grados 1° a 5°):**
  - Diseño interactivo, amigable y lúdico para niños desde los 6 años.
  - Botones amplios con microinteracciones y medallas de progreso.
  - Paleta cálida y enérgica con bordes redondeados (`rounded-3xl`).
- **Modo Secundaria/Media (Grados 6° a 11°):**
  - Interfaz minimalista, sobria y profesional estilo SaaS / campus universitario.
  - Métricas de rendimiento escolar con cifras tabulares (`font-mono tabular-nums`).
  - Modo lectura enfocado y libre de distracciones infantiles.

### 3. Estructura Curricular
- **11 Grados Escolares:** De 1° a 11°.
- **3 Periodos Académicos:** Periodo 1, Periodo 2 y Periodo 3.
- **5 Asignaturas Troncales:** Matemáticas, Lenguaje, Ciencias Naturales, Ciencias Sociales e Inglés.

### 4. Constructor Central de Exámenes & Evaluación con IA
- Preguntas cerradas (opción múltiple) con calificación automática instantánea.
- Preguntas abiertas con corrección pedagógica asistida por **Gemini 3.8 Flash** (`@google/genai`) contrastada con la rúbrica del profesor.
- Umbral de aprobación configurable (ej. 70%, 80%).

### 5. Certificados Oficiales en PDF & Alertas en Tiempo Real
- **Al aprobar:** Celebración inmediata con confeti y botón para generar y descargar el **Certificado Oficial en PDF** (300 DPI vectorial con `jspdf`), dotado de código hash de verificación, firmas directivas y registro permanente.
- **Al reprobar:** Mensaje pedagógico constructivo y emisión de **Alerta de Refuerzo** en tiempo real visible en el panel de administración.

### 6. Persistencia Híbrida & Supabase Ready
- Almacenamiento reactivo local de cero costo de inicio (funciona al clonar sin bases de datos obligatorias).
- Esquema SQL DDL de **Supabase (PostgreSQL)** listo para producción con 1 clic y respaldo/restauración en formato JSON.

---

## 🚀 Inicio Rápido (Local)

### Requisitos
- Node.js 18+ o superior
- npm o pnpm

### Instalación
```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/edutoken-lms.git
cd edutoken-lms

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (opcional para IA)
cp .env.example .env
# Añade tu GEMINI_API_KEY si deseas evaluación por IA en vivo

# 4. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

---

## 🔑 Llaves de Demostración Pre-cargadas

Para pruebas inmediatas sin necesidad de crear llaves primero:

| Llave | Usuario | Perfil / Grado | Modo Visual |
| :--- | :--- | :--- | :--- |
| `SOF-1P-4921` | Sofía Gómez | 3° Primaria | **Modo Lúdico** (Primaria) |
| `MAT-1P-1044` | Mateo Rivas | 1° Primaria | **Modo Lúdico** (Primaria) |
| `ALE-2P-8832` | Alejandro Torres | 9° Secundaria | **Modo Académico** (Secundaria) |
| `VAL-3P-9901` | Valeria Castro | 11° Media | **Modo Académico** (Secundaria) |
| `ADM-MASTER-2026`| Prof. Carlos Mendoza| Administrador / Rector | **Panel de Administración** |

---

## 🗄️ Esquema SQL de Supabase (PostgreSQL)

Copia y pega este script en el **SQL Editor** de tu proyecto en [Supabase](https://supabase.com):

```sql
CREATE TABLE IF NOT EXISTS access_keys (
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

CREATE TABLE IF NOT EXISTS curriculum_lessons (
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

CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 11),
    period INTEGER NOT NULL CHECK (period BETWEEN 1 AND 3),
    subject VARCHAR(32) NOT NULL,
    title VARCHAR(200) NOT NULL,
    passing_score INTEGER DEFAULT 70 CHECK (passing_score BETWEEN 1 AND 100),
    questions JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_submissions (
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
    ai_feedback JSONB,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS issued_certificates (
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
```

---

## 📦 Estructura del Proyecto

```
.
├── server.ts                    # Servidor Express + API Gemini 3.8 Flash
├── index.html                   # Entry point con fuentes tipográficas Google
├── metadata.json                # Metadatos del applet AI Studio
├── package.json                 # Dependencias y scripts
├── vite.config.ts               # Configuración Vite + Tailwind CSS v4
├── src/
│   ├── main.tsx                 # Montaje de React 19
│   ├── App.tsx                  # Enrutador principal según rol y grado
│   ├── index.css                # Estilos globales y tokens tipográficos
│   ├── types/
│   │   └── lms.ts               # Tipos TypeScript para toda la plataforma
│   ├── data/
│   │   └── mockCurriculum.ts    # Datos iniciales para 11 grados, 3 periodos y 5 materias
│   ├── services/
│   │   ├── storageService.ts    # Almacenamiento reactivo local + sync
│   │   ├── aiEvaluator.ts       # Cliente de evaluación pedagógica con IA
│   │   └── certificatePdf.ts    # Generador de diplomas PDF con jsPDF
│   └── components/
│       ├── common/
│       │   └── TopBar.tsx       # Barra de navegación 3-Zone Contract
│       ├── auth/
│       │   └── TokenLoginModal.tsx # Acceso por llave con perfiles demo
│       ├── student/
│       │   ├── PrimaryDashboard.tsx   # Modo Primaria (1°-5°) lúdico
│       │   ├── SecondaryDashboard.tsx # Modo Secundaria (6°-11°) académico
│       │   ├── ExamView.tsx           # Exámenes con IA, confeti y resultados
│       │   └── CertificateModal.tsx   # Diploma oficial con código verificador
│       └── admin/
│           └── AdminDashboard.tsx     # Panel de gestión de llaves, contenidos y alertas
```

---

## 📄 Licencia
Este proyecto está bajo la licencia [Apache 2.0](LICENSE).
