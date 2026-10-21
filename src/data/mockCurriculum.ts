import {
  AccessKey,
  Exam,
  InstitutionSettings,
  Lesson,
  SubjectId,
  SubjectMeta,
} from '../types/lms';

export const SUBJECTS: SubjectMeta[] = [
  {
    id: 'matematicas',
    name: 'Matemáticas',
    shortName: 'Matemáticas',
    iconName: 'Calculator',
    color: '#2563EB', // Blue
    lightBg: '#EFF6FF',
    borderColor: '#BFDBFE',
    description: 'Pensamiento lógico, operaciones numéricas, geometría y resolución de problemas.',
  },
  {
    id: 'lenguaje',
    name: 'Lenguaje y Comunicación',
    shortName: 'Lenguaje',
    iconName: 'BookOpen',
    color: '#D97706', // Amber / Orange
    lightBg: '#FEF3C7',
    borderColor: '#FDE68A',
    description: 'Comprensión lectora, expresión escrita, análisis textual y gramática.',
  },
  {
    id: 'ciencias_naturales',
    name: 'Ciencias Naturales',
    shortName: 'Ciencias',
    iconName: 'Leaf',
    color: '#059669', // Emerald
    lightBg: '#ECFDF5',
    borderColor: '#A7F3D0',
    description: 'Ecosistemas, biología, procesos físicos y cuidado del medio ambiente.',
  },
  {
    id: 'ciencias_sociales',
    name: 'Ciencias Sociales',
    shortName: 'Sociales',
    iconName: 'Compass',
    color: '#DC2626', // Red / Coral
    lightBg: '#FEF2F2',
    borderColor: '#FECACA',
    description: 'Historia, geografía, convivencia ciudadana y pensamiento crítico.',
  },
  {
    id: 'ingles',
    name: 'Inglés Global',
    shortName: 'Inglés',
    iconName: 'Languages',
    color: '#7C3AED', // Violet
    lightBg: '#F5F3FF',
    borderColor: '#DDD6FE',
    description: 'Vocabulario, lectura comprensiva, gramática y comunicación intercultural.',
  },
];

export const INITIAL_KEYS: AccessKey[] = [
  {
    id: 'key-1',
    keyCode: 'SOF-1P-4921',
    role: 'student',
    studentName: 'Sofía Gómez',
    grade: 3,
    allowedPeriods: [1, 2, 3],
    allowedSubjects: ['matematicas', 'lenguaje', 'ciencias_naturales', 'ciencias_sociales', 'ingles'],
    isActive: true,
    createdAt: '2026-02-10T10:00:00.000Z',
    lastLoginAt: '2026-10-20T14:30:00.000Z',
  },
  {
    id: 'key-2',
    keyCode: 'MAT-1P-1044',
    role: 'student',
    studentName: 'Mateo Rivas',
    grade: 1,
    allowedPeriods: [1],
    allowedSubjects: ['matematicas', 'lenguaje', 'ciencias_naturales'],
    isActive: true,
    createdAt: '2026-03-01T08:00:00.000Z',
  },
  {
    id: 'key-3',
    keyCode: 'LUC-2P-5512',
    role: 'student',
    studentName: 'Lucía Morales',
    grade: 5,
    allowedPeriods: [1, 2],
    allowedSubjects: ['matematicas', 'lenguaje', 'ciencias_naturales', 'ciencias_sociales', 'ingles'],
    isActive: true,
    createdAt: '2026-03-15T09:20:00.000Z',
  },
  {
    id: 'key-4',
    keyCode: 'ALE-2P-8832',
    role: 'student',
    studentName: 'Alejandro Torres',
    grade: 9,
    allowedPeriods: [1, 2, 3],
    allowedSubjects: ['matematicas', 'lenguaje', 'ciencias_naturales', 'ciencias_sociales', 'ingles'],
    isActive: true,
    createdAt: '2026-01-20T11:00:00.000Z',
    lastLoginAt: '2026-10-18T16:45:00.000Z',
  },
  {
    id: 'key-5',
    keyCode: 'VAL-3P-9901',
    role: 'student',
    studentName: 'Valeria Castro',
    grade: 11,
    allowedPeriods: [1, 2],
    allowedSubjects: ['matematicas', 'ingles', 'ciencias_naturales'],
    isActive: true,
    createdAt: '2026-02-05T12:00:00.000Z',
  },
  {
    id: 'key-admin',
    keyCode: 'ADM-MASTER-2026',
    role: 'admin',
    studentName: 'Prof. Carlos Mendoza (Admin)',
    allowedPeriods: [1, 2, 3],
    allowedSubjects: ['matematicas', 'lenguaje', 'ciencias_naturales', 'ciencias_sociales', 'ingles'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLoginAt: '2026-10-20T17:00:00.000Z',
  },
];

export const INITIAL_LESSONS: Lesson[] = [
  // 3° Primaria - Periodo 1 - Matemáticas
  {
    id: 'les-3-1-mat-1',
    grade: 3,
    period: 1,
    subject: 'matematicas',
    title: 'Aventura con las Multiplicaciones y Tablas Mágicas',
    summary: 'Aprende qué es multiplicar: sumar grupos iguales de manera súper rápida y divertida.',
    contentMarkdown: `### ¡Bienvenidos al Reino de las Multiplicaciones! 🌟

Multiplicar es como tener un superpoder matemático: en lugar de sumar el mismo número una y otra vez, ¡lo calculamos en un solo segundo!

#### ¿Qué es en realidad multiplicar?
Imagina que tienes **4 canastas de manzanas** y en cada canasta hay **3 deliciosas manzanas rojas**.

- **Método largo (sumar):** 3 + 3 + 3 + 3 = 12 manzanas.
- **Método superrápido (multiplicar):** 4 × 3 = 12 manzanas.

> **Regla de oro:** El primer número indica los grupos, y el segundo cuántos objetos hay en cada grupo.

#### El truco del Cero y el Uno:
1. **El Uno es un espejo:** Cualquier número multiplicado por 1 da el mismo número (ejemplo: 7 × 1 = 7).
2. **El Cero es el devorador:** Cualquier número multiplicado por 0 se convierte en 0 (ejemplo: 100 × 0 = 0).

¡Practiquemos juntos mentalmente: ¿Cuánto es 3 × 5? Tres grupos de cinco son 15!`,
    videoUrl: 'https://www.youtube.com/watch?v=YFtEaVw5k1A',
    orderIndex: 1,
  },
  {
    id: 'les-3-1-mat-2',
    grade: 3,
    period: 1,
    subject: 'matematicas',
    title: 'Geometría Secreta: Figuras Planas y sus Lados',
    summary: 'Descubre los triángulos, cuadrados, rectángulos y círculos a tu alrededor.',
    contentMarkdown: `### Las Formas del Mundo 📐

Todo lo que ves a tu alrededor está hecho de figuras geométricas:

- **Triángulo:** Tiene 3 lados y 3 esquinas puntiagudas (vértices).
- **Cuadrado:** Tiene 4 lados exactamente iguales.
- **Rectángulo:** Tiene 4 lados, 2 largos y 2 cortos.
- **Círculo:** ¡No tiene esquinas! Es una línea curva cerrada continua.

Mira la pantalla de tu computador o celular: ¿es un rectángulo? ¡Exactamente!`,
    orderIndex: 2,
  },

  // 3° Primaria - Periodo 1 - Ciencias Naturales
  {
    id: 'les-3-1-nat-1',
    grade: 3,
    period: 1,
    subject: 'ciencias_naturales',
    title: 'Los Reinos de la Naturaleza y Seres Vivos',
    summary: 'Explora cómo se clasifican los seres vivos: plantas, animales, hongos y bacterias.',
    contentMarkdown: `### ¿Qué hace que algo esté vivo? 🌱🐾

Todos los seres vivos cumplimos el ciclo vital: nacemos, crecemos, nos alimentamos, nos reproducimos y nos relacionamos con nuestro entorno.

#### Los Cinco Reinos Principales:
1. **Reino Animal:** Pueden moverse por sí mismos (aves, peces, mamíferos, insectos).
2. **Reino Vegetal:** Fabrican su propio alimento mediante la fotosíntesis con ayuda del sol.
3. **Reino Fungi (Hongos):** Como los champiñones y las levaduras del pan.
4. **Reino Mónera y Protista:** Microorganismos diminutos que solo se ven con microscopio.

¡Recuerda cuidar siempre el agua y los árboles de tu parque!`,
    orderIndex: 1,
  },

  // 9° Secundaria - Periodo 1 - Matemáticas
  {
    id: 'les-9-1-mat-1',
    grade: 9,
    period: 1,
    subject: 'matematicas',
    title: 'Sistemas de Ecuaciones Lineales 2x2 y Método Gráfico',
    summary: 'Resolución de sistemas de ecuaciones de primer grado con dos incógnitas por sustitución e igualación.',
    contentMarkdown: `## Sistemas de Ecuaciones Lineales 2x2

Un sistema de ecuaciones lineales simultáneas con dos incógnitas representa geométricamente dos rectas en el plano cartesiano $R^2$.

### Estructura General
$$\\begin{cases} a_1 x + b_1 y = c_1 \\\\ a_2 x + b_2 y = c_2 \\end{cases}$$

### Métodos Algebraicos de Solución:
1. **Método de Sustitución:**
   - Se despeja una variable de una de las ecuaciones (ej. $x = \\frac{c_1 - b_1 y}{a_1}$).
   - Se sustituye esta expresión en la segunda ecuación, obteniendo una ecuación con una sola incógnita.
   - Se halla el valor y se reemplaza en el despeje inicial.

2. **Método de Reducción (Eliminación):**
   - Se multiplican las ecuaciones por coeficientes adecuados para que los coeficientes de una variable sean opuestos aditivos.
   - Se suman algebraicamente ambas ecuaciones para anular una incógnita.

### Interpretación Geométrica del Resultado:
- **Punto de intersección único $(x, y)$:** Sistema consistente determinado (rectas secantes).
- **Rectas paralelas:** Sistema inconsistente (sin solución).
- **Rectas coincidentes:** Sistema indeterminado (infinitas soluciones).`,
    orderIndex: 1,
  },

  // 9° Secundaria - Periodo 1 - Ciencias Naturales
  {
    id: 'les-9-1-nat-1',
    grade: 9,
    period: 1,
    subject: 'ciencias_naturales',
    title: 'Genética Mendeliana, Leyes de la Herencia y ADN',
    summary: 'Estructura del ácido desoxirribonucleico, alelos dominantes y recesivos, y cuadros de Punnett.',
    contentMarkdown: `## Fundamentos de Genética y Herencia Mendeliana

Gregor Mendel estableció en el siglo XIX los principios básicos que rigen la transmisión de caracteres hereditarios de una generación a otra mediante sus experimentos con *Pisum sativum* (guisantes).

### Conceptos Clave:
- **Genotipo:** La constitución genética de un individuo (conjunto de alelos).
- **Fenotipo:** La manifestación física o bioquímica observable del genotipo en interacción con el ambiente.
- **Alelo Dominante ($A$):** Se expresa tanto en homocigosis ($AA$) como en heterocigosis ($Aa$).
- **Alelo Recesivo ($a$):** Únicamente se manifiesta fenotípicamente en homocigosis recesiva ($aa$).

### Leyes de Mendel:
1. **Ley de la Uniformidad de los Híbridos de la F1:** El cruce de dos líneas puras para un carácter da descendencia fenotípicamente uniforme.
2. **Ley de la Segregación de Caracteres:** Durante la formación de gametos, los alelos de un mismo gen se separan independientemente.
3. **Ley de la Transmisión Independiente:** Los genes ubicados en cromosomas no homólogos se heredan de manera independiente.`,
    orderIndex: 1,
  },

  // 9° Secundaria - Periodo 1 - Lenguaje
  {
    id: 'les-9-1-len-1',
    grade: 9,
    period: 1,
    subject: 'lenguaje',
    title: 'El Ensayo Argumentativo: Tesis, Premisas y Refutación',
    summary: 'Estructura formal, conectores lógicos y construcción de argumentos sólidos para textos de opinión.',
    contentMarkdown: `## El Ensayo Argumentativo: Estructura y Rigor Crítico

El ensayo argumentativo es un género discursivo en prosa donde el autor defiende una postura (tesis) frente a un tema polémico fundamentándola con argumentos lógicos, datos verificables y contraargumentos refutados.

### Componentes Estructurales:
1. **Introducción:**
   - *Contextualización:* Presentación del problema en su ámbito histórico, social o científico.
   - *Tesis explícita:* Oración declarativa clara y debatible que resume la postura del autor.
2. **Cuerpo Argumentativo:**
   - Argumentos de autoridad, datos estadísticos y analogías.
   - *Contraargumentación:* Anticipación de objeciones válidas para refutarlas con evidencia.
3. **Conclusión:**
   - Síntesis de los puntos demostrados y proyección o llamado a la reflexión del lector.`,
    orderIndex: 1,
  },
];

export const INITIAL_EXAMS: Exam[] = [
  // Examen 3° Primaria - Matemáticas Periodo 1
  {
    id: 'exam-3-1-mat',
    grade: 3,
    period: 1,
    subject: 'matematicas',
    title: 'Evaluación del Saber: Multiplicación y Figuras (3° Grado)',
    passingScore: 70,
    questions: [
      {
        id: 'q3-m-1',
        type: 'multiple_choice',
        prompt: '¿Cuánto es el resultado de multiplicar 5 × 4?',
        options: ['15', '20', '25', '9'],
        correctOptionIndex: 1,
        points: 25,
      },
      {
        id: 'q3-m-2',
        type: 'multiple_choice',
        prompt: 'Si tengo 3 cajas y en cada una guardé 6 lápices de colores, ¿cuántos lápices tengo en total?',
        options: ['9 lápices', '18 lápices', '12 lápices', '24 lápices'],
        correctOptionIndex: 1,
        points: 25,
      },
      {
        id: 'q3-m-3',
        type: 'multiple_choice',
        prompt: '¿Cuál de las siguientes figuras geométricas tiene exactamente 3 lados y 3 esquinas?',
        options: ['Cuadrado', 'Círculo', 'Triángulo', 'Rectángulo'],
        correctOptionIndex: 2,
        points: 25,
      },
      {
        id: 'q3-m-4',
        type: 'open',
        prompt: 'Explica con tus propias palabras qué significa multiplicar y da un ejemplo de tu vida diaria (por ejemplo con juguetes, frutas o dulces).',
        points: 25,
        rubricCriteria: 'El estudiante debe comprender que multiplicar es sumar grupos de cantidades iguales rápidamente. Otorga los 25 puntos completos si menciona la idea de grupos repetidos y da un ejemplo coherente (ej: 3 paquetes de 4 galletas son 12 galletas). Otorga entre 10 y 20 puntos si la idea es parcialmente clara.',
      },
    ],
  },

  // Examen 9° Secundaria - Matemáticas Periodo 1
  {
    id: 'exam-9-1-mat',
    grade: 9,
    period: 1,
    subject: 'matematicas',
    title: 'Evaluación de Rendimiento: Sistemas de Ecuaciones Lineales 2x2',
    passingScore: 70,
    questions: [
      {
        id: 'q9-m-1',
        type: 'multiple_choice',
        prompt: 'Dado el sistema x + y = 10 y x - y = 4, ¿cuál es el valor del par ordenado (x, y)?',
        options: ['(5, 5)', '(7, 3)', '(8, 2)', '(6, 4)'],
        correctOptionIndex: 1,
        points: 25,
      },
      {
        id: 'q9-m-2',
        type: 'multiple_choice',
        prompt: '¿Qué ocurre geométricamente cuando dos ecuaciones lineales representan dos rectas paralelas que nunca se cruzan?',
        options: [
          'El sistema tiene infinitas soluciones',
          'El sistema es inconsistente y carece de solución',
          'El sistema tiene una solución única en el origen (0,0)',
          'El sistema es dependiente',
        ],
        correctOptionIndex: 1,
        points: 25,
      },
      {
        id: 'q9-m-3',
        type: 'multiple_choice',
        prompt: 'En el método de sustitución para resolver un sistema 2x2, ¿cuál es el primer paso metodológico?',
        options: [
          'Sumar las dos ecuaciones de forma directa',
          'Despejar una incógnita en una de las ecuaciones para reemplazarla en la otra',
          'Graficar los puntos en el plano polar',
          'Multiplicar ambas ecuaciones por cero',
        ],
        correctOptionIndex: 1,
        points: 25,
      },
      {
        id: 'q9-m-4',
        type: 'open',
        prompt: 'Un comerciante vende 3 cuadernos y 2 bolígrafos por $23. Otro cliente compra 2 cuadernos y 4 bolígrafos por $26. Plantea el sistema de ecuaciones 2x2 y explica brevemente cómo resolverías el valor de cada artículo.',
        points: 25,
        rubricCriteria: 'Criterios de evaluación: 1) Planteamiento formal del sistema: 3c + 2b = 23 y 2c + 4b = 26 (10 puntos). 2) Explicación del método analítico (sustitución, reducción o igualación) (10 puntos). 3) Coherencia matemática y solución correcta c = 5, b = 4 (5 puntos adicionales). Asigna puntaje proporcional según la solidez de la justificación.',
      },
    ],
  },
];

export const INITIAL_SETTINGS: InstitutionSettings = {
  name: 'Colegio Departamental San Francisco de Asís',
  rectorName: 'Dra. Elena Vargas Solano',
  rectorTitle: 'Rectora General & Vicerrectoría Académica',
  signatureText: 'Firma Digital Autorizada - Resolución MEN N° 4812-2024',
  legalText: 'Certifica formalmente que el(la) estudiante culminó y aprobó con éxito los logros curriculares correspondientes a la asignatura evaluada, de acuerdo a las directrices pedagógicas oficiales.',
  logoEmoji: '🎓',
  accentColor: '#1E3A8A',
};
