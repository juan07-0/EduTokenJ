# 🎓 EduToken LMS · Plataforma Educativa Basada en Llaves

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Ready-3ECF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Gemini_AI-3.8_Flash-8E75B2?logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="License Apache 2.0" />
</p>

---

## 📖 Descripción General

**EduToken LMS** es una plataforma modular de gestión de aprendizaje (Learning Management System), diseñada para **cero costo de inicio** y máxima optimización de recursos. Elimina las contraseñas tradicionales sustituyéndolas por **llaves de acceso únicas (tokens)** parametrizables por alumno, e incorpora dos modos visuales adaptativos según el nivel escolar:

- 🎨 **Modo Primaria (Grados 1° a 5°):** Entorno cálido, lúdico e interactivo para niños desde los 6 años, con botones amplios, medallas de logro y microinteracciones fluidas.
- 📐 **Modo Secundaria y Media (Grados 6° a 11°):** Interfaz minimalista, sobria y profesional estilo dashboard académico/universitario, enfocada en productividad sin distracciones.

---

## 🚀 Despliegue en GitHub Pages (1 Clic)

El repositorio incluye el archivo de automatización [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) para publicar la aplicación gratis en GitHub Pages:

1. Ve a tu repositorio en GitHub $\to$ **Settings** $\to$ **Pages**.
2. En la sección **Build and deployment** $\to$ **Source**, selecciona **`GitHub Actions`**.
3. ¡Listo! Cada vez que hagas un `git push` a la rama `main`, tu aplicación se compilará y estará visible públicamente en:
   ```
   https://<tu-usuario>.github.io/<nombre-del-repositorio>/
   ```

---

## 🔑 Llaves de Prueba (Demo Tokens)

Usa cualquiera de estas llaves en la pantalla de inicio para probar cada perfil:

| Llave de Acceso | Estudiante / Docente | Grado Escolar | Modo Visual | Permisos Habilitados |
| :--- | :--- | :--- | :--- | :--- |
| `SOF-1P-4921` | **Sofía Gómez** | 3° Primaria | **Lúdico Primaria** | Todos los periodos (1, 2, 3) y las 5 materias |
| `MAT-1P-1044` | **Mateo Rivas** | 1° Primaria | **Lúdico Primaria** | Periodo 1 · Matemáticas, Lenguaje y Ciencias |
| `ALE-2P-8832` | **Alejandro Torres** | 9° Secundaria | **Académico Secundaria**| Todos los periodos y materias |
| `VAL-3P-9901` | **Valeria Castro** | 11° Media | **Académico Secundaria**| Periodos 1 y 2 · Matemáticas, Ciencias e Inglés |
| `ADM-MASTER-2026` | **Prof. Carlos Mendoza** | Rector / Admin | **Panel Administrador** | Acceso global: llaves, exámenes y reportes |

---

## ⚡ Estructura Curricular

- **11 Grados Escolares:** De 1° a 11°.
- **3 Periodos Académicos:** Periodo 1, Periodo 2 y Periodo 3.
- **5 Asignaturas Troncales por Periodo:**
  1. 🧮 **Matemáticas**: Operaciones, álgebra, pensamiento lógico y geometría.
  2. 📖 **Lenguaje y Comunicación**: Comprensión lectora, gramática y redacción.
  3. 🌿 **Ciencias Naturales**: Biología, física, química y medio ambiente.
  4. 🧭 **Ciencias Sociales**: Historia, geografía y convivencia ciudadana.
  5. 🌍 **Inglés Global**: Vocabulario, gramática y comunicación oral y escrita.

---

## 🛠️ Instalación y Ejecución Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/edutoken-lms.git
cd edutoken-lms

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (opcional)
cp .env.example .env

# 4. Iniciar servidor de desarrollo
npm run dev
```

Abre tu navegador en `http://localhost:3000`.

---

## 🗄️ Base de Datos Supabase (PostgreSQL)

La plataforma opera de forma local inmediata, pero está 100% preparada para conectarse con **Supabase** de manera gratuita:

1. El script SQL con las 5 tablas (`users`, `keys`, `exams`, `results`, `certificates`) está disponible en el archivo [`supabase_schema.sql`](supabase_schema.sql).
2. En tu proyecto de Supabase, entra a **`SQL Editor`** $\to$ **`+ New query`**, pega el contenido de `supabase_schema.sql` y presiona **`Run`**.
3. En Supabase ve a ⚙️ **`Project Settings`** $\to$ **`Data API`**, copia tu **`Project URL`** y tu **`anon public key`**, e ingrésalas en el panel de administración (Pestaña 5) de la app para sincronizar tus datos en tiempo real.

---

## 📂 Arquitectura de Archivos del Proyecto

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml            # Despliegue automático a GitHub Pages
├── server.ts                     # Servidor Express + API Gemini 3.8 Flash
├── supabase_schema.sql           # Esquema SQL oficial con las 5 tablas
├── index.html                    # Entrada HTML con tipografía y soporte de fetch
├── package.json                  # Dependencias y scripts
├── vite.config.ts                # Configuración de Vite con base relativa './'
├── README.md                     # Documentación principal
├── LICENSE                       # Licencia Apache 2.0
├── src/
│   ├── main.tsx                  # Bootstrap de React
│   ├── App.tsx                   # Enrutador principal según la llave
│   ├── index.css                 # Tailwind CSS v4 y estilos tipográficos
│   ├── types/
│   │   └── lms.ts                # Modelos de datos TypeScript
│   ├── data/
│   │   └── mockCurriculum.ts     # Semillas iniciales curriculares
│   ├── services/
│   │   ├── storageService.ts     # Persistencia reactiva local (cero costo)
│   │   ├── supabaseClient.ts     # Cliente y sincronizador oficial de Supabase
│   │   ├── aiEvaluator.ts        # Corrección de preguntas abiertas con IA
│   │   └── certificatePdf.ts     # Generador de certificados PDF oficiales
│   └── components/
│       ├── common/
│       │   └── TopBar.tsx        # Barra de navegación 3-Zone Contract
│       ├── student/
│       │   ├── PrimaryDashboard.tsx   # Modo Primaria (1°-5°) lúdico
│       │   ├── SecondaryDashboard.tsx # Modo Secundaria (6°-11°) académico
│       │   ├── ExamView.tsx           # Examen con calificación y confeti
│       │   └── CertificateModal.tsx   # Visualizador y descarga de diplomas PDF
│       └── admin/
│           └── AdminDashboard.tsx     # Panel de gestión, exámenes y alertas
```

---

## 📄 Licencia

Este proyecto está distribuido bajo la Licencia [Apache 2.0](LICENSE).
