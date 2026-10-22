import React, { useState } from 'react';
import {
  AccessKey,
  Exam,
  ExamQuestion,
  InstitutionSettings,
  Lesson,
  QuestionType,
  SubjectId,
  SupabaseConfig,
} from '../../types/lms';
import { SUBJECTS } from '../../data/mockCurriculum';
import { storageService, useLMSStore } from '../../services/storageService';
import {
  testSupabaseConnection,
  syncLocalKeysToSupabase,
  resetSupabaseClient,
} from '../../services/supabaseClient';
import {
  KeyRound,
  Users,
  BookOpen,
  FileText,
  Award,
  AlertTriangle,
  Database,
  Plus,
  Trash2,
  Copy,
  Check,
  ToggleLeft,
  ToggleRight,
  Save,
  ShieldCheck,
  Video,
  Download,
  Upload,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';

interface AdminDashboardProps {
  currentAdminKey: AccessKey;
  onLogout: () => void;
  onSwitchToStudentView?: (key: AccessKey) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentAdminKey,
  onLogout,
  onSwitchToStudentView,
}) => {
  const store = useLMSStore();
  const [activeTab, setActiveTab] = useState<
    'keys' | 'curriculum' | 'certificate_template' | 'alerts' | 'database'
  >('keys');

  // KEY GENERATOR STATE
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState<number>(3);
  const [newAllowedPeriods, setNewAllowedPeriods] = useState<number[]>([1, 2, 3]);
  const [newAllowedSubjects, setNewAllowedSubjects] = useState<SubjectId[]>([
    'matematicas',
    'lenguaje',
    'ciencias_naturales',
    'ciencias_sociales',
    'ingles',
  ]);
  const [generatedKeyResult, setGeneratedKeyResult] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // ADMIN KEY GENERATOR STATE
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminCode, setNewAdminCode] = useState('');

  // CURRICULUM & EXAM EXPLORER STATE
  const [currGrade, setCurrGrade] = useState<number>(3);
  const [currPeriod, setCurrPeriod] = useState<number>(1);
  const [currSubject, setCurrSubject] = useState<SubjectId>('matematicas');

  // LESSON EDITOR MODAL / FORM
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [lessonFormTitle, setLessonFormTitle] = useState('');
  const [lessonFormSummary, setLessonFormSummary] = useState('');
  const [lessonFormMarkdown, setLessonFormMarkdown] = useState('');
  const [lessonFormVideo, setLessonFormVideo] = useState('');
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  // EXAM EDITOR STATE
  const currentExam = store.getExam(currGrade, currPeriod, currSubject);
  const [examPassingScore, setExamPassingScore] = useState<number>(currentExam.passingScore || 70);
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>(currentExam.questions || []);
  const [examSavedToast, setExamSavedToast] = useState(false);

  // CERTIFICATE TEMPLATE STATE
  const currentSettings = store.getSettings();
  const [instName, setInstName] = useState(currentSettings.name);
  const [rectorName, setRectorName] = useState(currentSettings.rectorName);
  const [rectorTitle, setRectorTitle] = useState(currentSettings.rectorTitle);
  const [legalText, setLegalText] = useState(currentSettings.legalText);
  const [sigText, setSigText] = useState(currentSettings.signatureText);
  const [logoEmoji, setLogoEmoji] = useState(currentSettings.logoEmoji);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // SUPABASE CONFIG STATE
  const supabaseConfig = store.getSupabaseConfig();
  const [sbUrl, setSbUrl] = useState(supabaseConfig.supabaseUrl);
  const [sbKey, setSbKey] = useState(supabaseConfig.anonKey);
  const [copiedSql, setCopiedSql] = useState(false);
  const [supabaseSavedToast, setSupabaseSavedToast] = useState(false);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [supabaseTestMsg, setSupabaseTestMsg] = useState<{
    success: boolean;
    text: string;
  } | null>(null);
  const [backupToast, setBackupToast] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // SEARCH FILTERS
  const [keySearchFilter, setKeySearchFilter] = useState('');

  // 1. GENERATE STUDENT KEY
  const handleGenerateStudentKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const nameParts = newStudentName.trim().split(/\s+/);
    const prefix = nameParts[0].slice(0, 3).toUpperCase();
    const periodsLabel = newAllowedPeriods.length === 3 ? 'ALL' : `${newAllowedPeriods.join('')}P`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    const generatedCode = `${prefix}-${periodsLabel}-${randomSuffix}`;

    const newKey: AccessKey = {
      id: `key-${Date.now()}`,
      keyCode: generatedCode,
      role: 'student',
      studentName: newStudentName.trim(),
      grade: newStudentGrade,
      allowedPeriods: [...newAllowedPeriods].sort(),
      allowedSubjects: [...newAllowedSubjects],
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    store.saveKey(newKey);
    setGeneratedKeyResult(generatedCode);
    setNewStudentName('');
  };

  // 2. CREATE ADMIN KEY
  const handleCreateAdminKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim()) return;

    const code = newAdminCode.trim().toUpperCase() || `ADM-${Math.floor(1000 + Math.random() * 9000)}`;

    const newKey: AccessKey = {
      id: `key-adm-${Date.now()}`,
      keyCode: code,
      role: 'admin',
      studentName: newAdminName.trim(),
      allowedPeriods: [1, 2, 3],
      allowedSubjects: ['matematicas', 'lenguaje', 'ciencias_naturales', 'ciencias_sociales', 'ingles'],
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    store.saveKey(newKey);
    setNewAdminName('');
    setNewAdminCode('');
  };

  // 3. LESSON ACTIONS
  const handleOpenNewLesson = () => {
    setEditingLessonId(null);
    setLessonFormTitle('');
    setLessonFormSummary('');
    setLessonFormMarkdown('### Introducción al tema\n\nContenido formativo...');
    setLessonFormVideo('');
    setIsEditingLesson(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setLessonFormTitle(lesson.title);
    setLessonFormSummary(lesson.summary);
    setLessonFormMarkdown(lesson.contentMarkdown);
    setLessonFormVideo(lesson.videoUrl || '');
    setIsEditingLesson(true);
  };

  const handleSaveLesson = () => {
    if (!lessonFormTitle.trim()) return;

    const existingLessons = store.getLessons(currGrade, currPeriod, currSubject);

    const saved: Lesson = {
      id: editingLessonId || `les-${currGrade}-${currPeriod}-${currSubject}-${Date.now()}`,
      grade: currGrade,
      period: currPeriod,
      subject: currSubject,
      title: lessonFormTitle.trim(),
      summary: lessonFormSummary.trim(),
      contentMarkdown: lessonFormMarkdown.trim(),
      videoUrl: lessonFormVideo.trim() || undefined,
      orderIndex: editingLessonId
        ? existingLessons.find((l) => l.id === editingLessonId)?.orderIndex || 1
        : existingLessons.length + 1,
    };

    store.saveLesson(saved);
    setIsEditingLesson(false);
  };

  // 4. EXAM ACTIONS
  const handleAddQuestion = (type: QuestionType) => {
    const newQ: ExamQuestion = {
      id: `q-${Date.now()}`,
      type,
      prompt: type === 'multiple_choice' ? 'Enunciado de la nueva pregunta de selección:' : 'Enunciado de la nueva pregunta abierta:',
      options: type === 'multiple_choice' ? ['Opción A', 'Opción B', 'Opción C', 'Opción D'] : undefined,
      correctOptionIndex: type === 'multiple_choice' ? 0 : undefined,
      points: 25,
      rubricCriteria: type === 'open' ? 'El alumno debe explicar la fundamentación teórica y aplicación práctica.' : undefined,
    };
    setExamQuestions([...examQuestions, newQ]);
  };

  const handleSaveExam = () => {
    const updated: Exam = {
      id: currentExam.id,
      grade: currGrade,
      period: currPeriod,
      subject: currSubject,
      title: currentExam.title,
      passingScore: Number(examPassingScore) || 70,
      questions: examQuestions,
    };

    store.saveExam(updated);
    setExamSavedToast(true);
    setTimeout(() => setExamSavedToast(false), 2500);
  };

  // 5. SETTINGS SAVE
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: InstitutionSettings = {
      name: instName,
      rectorName,
      rectorTitle,
      legalText,
      signatureText: sigText,
      logoEmoji,
      accentColor: '#1E3A8A',
    };
    store.saveSettings(updated);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 2500);
  };

  // 6. SUPABASE SAVE & TEST CONNECTION
  const handleSaveAndTestSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingSupabase(true);
    setSupabaseTestMsg(null);

    let cleanUrl = sbUrl.trim();
    if (cleanUrl.endsWith('/')) {
      cleanUrl = cleanUrl.slice(0, -1);
    }
    if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    const cleanKey = sbKey.trim();

    // Reset client instance
    resetSupabaseClient();

    // Save locally
    store.saveSupabaseConfig({
      supabaseUrl: cleanUrl,
      anonKey: cleanKey,
      isConnected: false,
    });
    setSbUrl(cleanUrl);

    if (!cleanUrl || !cleanKey) {
      setIsTestingSupabase(false);
      setSupabaseTestMsg({
        success: false,
        text: 'Debes ingresar tanto el "Project URL" como la "anon public key" de Supabase.',
      });
      return;
    }

    const testRes = await testSupabaseConnection(cleanUrl, cleanKey);
    setIsTestingSupabase(false);
    setSupabaseTestMsg({
      success: testRes.success,
      text: testRes.message,
    });

    if (testRes.success) {
      store.saveSupabaseConfig({
        supabaseUrl: cleanUrl,
        anonKey: cleanKey,
        isConnected: true,
      });
    }
  };

  const handleSyncKeysToSupabase = async () => {
    setIsSyncingSupabase(true);
    const res = await syncLocalKeysToSupabase();
    setIsSyncingSupabase(false);
    if (res.success) {
      setSupabaseTestMsg({
        success: true,
        text: `¡Éxito! Se sincronizaron ${res.count} llaves de acceso en la tabla "access_keys" de Supabase.`,
      });
    } else {
      setSupabaseTestMsg({
        success: false,
        text: `Error al sincronizar: ${res.error || 'Verifica que la tabla access_keys exista en Supabase'}.`,
      });
    }
  };

  // DATA
  const allKeys = store.getKeys();
  const filteredKeys = allKeys.filter(
    (k) =>
      k.keyCode.toLowerCase().includes(keySearchFilter.toLowerCase()) ||
      (k.studentName && k.studentName.toLowerCase().includes(keySearchFilter.toLowerCase()))
  );

  const failedSubmissions = store.getFailedSubmissions();
  const currentLessons = store.getLessons(currGrade, currPeriod, currSubject);

  const supabaseSqlScript = `-- ==============================================================================
-- EDUTOKEN LMS: ESQUEMA OFICIAL SUPABASE (POSTGRESQL)
-- Tablas: users, keys, exams, results, certificates
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA USERS
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

-- 2. TABLA KEYS (Llaves de Acceso)
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

-- 3. TABLA EXAMS (Exámenes)
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 11),
    period INTEGER NOT NULL CHECK (period BETWEEN 1 AND 3),
    subject VARCHAR(32) NOT NULL,
    title VARCHAR(200) NOT NULL,
    passing_score INTEGER DEFAULT 70 CHECK (passing_score BETWEEN 1 AND 100),
    questions JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_exam_grade_period_subject UNIQUE (grade, period, subject)
);

-- 4. TABLA RESULTS (Resultados e Intentos)
CREATE TABLE IF NOT EXISTS results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    key_code VARCHAR(32) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    grade INTEGER NOT NULL,
    period INTEGER NOT NULL,
    subject VARCHAR(32) NOT NULL,
    score NUMERIC(5, 2) NOT NULL,
    total_points_earned NUMERIC(6, 2) DEFAULT 0,
    total_points_possible NUMERIC(6, 2) DEFAULT 100,
    passed BOOLEAN NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}'::JSONB,
    ai_feedback JSONB DEFAULT '{}'::JSONB,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA CERTIFICATES (Diplomas Oficiales)
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

-- Vistas de compatibilidad
CREATE OR REPLACE VIEW access_keys AS SELECT * FROM keys;
CREATE OR REPLACE VIEW exam_submissions AS SELECT * FROM results;
CREATE OR REPLACE VIEW issued_certificates AS SELECT * FROM certificates;

-- Índices
CREATE INDEX IF NOT EXISTS idx_keys_code ON keys(key_code);
CREATE INDEX IF NOT EXISTS idx_exams_lookup ON exams(grade, period, subject);
CREATE INDEX IF NOT EXISTS idx_results_alerts ON results(passed, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON certificates(verification_code);`;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-28">
      {/* Top Banner */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                  Panel de Administración Central
                </div>
                <h1 className="text-2xl font-black tracking-tight">
                  Gestión Escolar y Curricular · EduToken LMS
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Sesión:</span>
              <span className="font-mono text-xs font-bold bg-slate-800 px-2.5 py-1 rounded-lg text-purple-300 border border-slate-700">
                {currentAdminKey.keyCode} ({currentAdminKey.studentName || 'Rector'})
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto border-t border-slate-800 pt-4 pb-1">
            <button
              onClick={() => setActiveTab('keys')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'keys'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>1. Generador de Llaves ({allKeys.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('curriculum')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'curriculum'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>2. Editor de Contenidos & Exámenes</span>
            </button>

            <button
              onClick={() => setActiveTab('certificate_template')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'certificate_template'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>3. Plantilla de Certificados</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap relative ${
                activeTab === 'alerts'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>4. Alertas de Reprobados ({failedSubmissions.length})</span>
              {failedSubmissions.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'database'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>5. Supabase SQL & Respaldos</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Tab Panels */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ================= TAB 1: KEY GENERATOR & MANAGEMENT ================= */}
        {activeTab === 'keys' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Quick Student Key Generator Form (5 cols) */}
              <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-purple-700 text-xs font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Generador Rápido de Llaves de Alumno</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Nueva Llave de Estudiante
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Configura las restricciones de grado, periodos y materias para el alumno.
                  </p>
                </div>

                <form onSubmit={handleGenerateStudentKey} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nombre Completo del Estudiante
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Sofía Gómez o Mateo Rivas"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Grado Escolar (1° a 11°)
                    </label>
                    <select
                      value={newStudentGrade}
                      onChange={(e) => setNewStudentGrade(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 font-medium"
                    >
                      {Array.from({ length: 11 }, (_, i) => i + 1).map((g) => (
                        <option key={g} value={g}>
                          Grado {g}° ({g <= 5 ? 'Primaria - Modo Lúdico' : 'Secundaria/Media - Modo Académico'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Period Restrictions Checkboxes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Periodos Habilitados
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((pNum) => {
                        const checked = newAllowedPeriods.includes(pNum);
                        return (
                          <label
                            key={pNum}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                              checked
                                ? 'bg-purple-50 border-purple-400 text-purple-900'
                                : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewAllowedPeriods([...newAllowedPeriods, pNum]);
                                } else {
                                  if (newAllowedPeriods.length > 1) {
                                    setNewAllowedPeriods(newAllowedPeriods.filter((p) => p !== pNum));
                                  }
                                }
                              }}
                              className="rounded text-purple-600"
                            />
                            <span>Periodo {pNum}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Subject Restrictions Checkboxes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Materias Habilitadas ({newAllowedSubjects.length}/5)
                    </label>
                    <div className="space-y-1.5">
                      {SUBJECTS.map((sub) => {
                        const checked = newAllowedSubjects.includes(sub.id);
                        return (
                          <label
                            key={sub.id}
                            className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer ${
                              checked
                                ? 'bg-purple-50/50 border-purple-300 text-slate-900'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center gap-2 font-semibold">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewAllowedSubjects([...newAllowedSubjects, sub.id]);
                                  } else {
                                    if (newAllowedSubjects.length > 1) {
                                      setNewAllowedSubjects(newAllowedSubjects.filter((s) => s !== sub.id));
                                    }
                                  }
                                }}
                                className="rounded text-purple-600"
                              />
                              <span>{sub.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {sub.id}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Generar Llave Única Automática</span>
                  </button>
                </form>

                {/* Result Alert Box */}
                {generatedKeyResult && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-2 animate-in fade-in">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      ¡Llave Creada Exitosamente!
                    </div>
                    <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-emerald-200">
                      <code className="font-mono font-bold text-base text-emerald-900">
                        {generatedKeyResult}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedKeyResult);
                          setCopiedKey(true);
                          setTimeout(() => setCopiedKey(false), 2000);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                      >
                        {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey ? 'Copiada' : 'Copiar'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      Entrega esta llave al estudiante. Podrá ingresar directamente desde la pantalla de inicio sin contraseñas.
                    </p>
                  </div>
                )}

                {/* Sub-section: Create Co-Admin Key */}
                <div className="pt-6 border-t border-slate-200">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Crear Nuevo Co-Administrador</span>
                  </div>
                  <form onSubmit={handleCreateAdminKey} className="space-y-3">
                    <input
                      type="text"
                      required
                      placeholder="Nombre del Docente / Rector"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Código opcional (Ej: ADM-DOCENTE-2026)"
                        value={newAdminCode}
                        onChange={(e) => setNewAdminCode(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono uppercase"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shrink-0"
                      >
                        Crear Admin
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column: Active Keys Directory (7 cols) */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Directorio de Llaves de Acceso ({allKeys.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Administra permisos, bloquea accesos o prueba cualquier perfil
                    </p>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Buscar por código o nombre..."
                      value={keySearchFilter}
                      onChange={(e) => setKeySearchFilter(e.target.value)}
                      className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600 w-full sm:w-56"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                        <th className="py-2.5 px-3">Llave / Token</th>
                        <th className="py-2.5 px-3">Usuario / Grado</th>
                        <th className="py-2.5 px-3">Periodos</th>
                        <th className="py-2.5 px-3">Estado</th>
                        <th className="py-2.5 px-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredKeys.map((k) => (
                        <tr key={k.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <code className="font-mono font-bold text-slate-900">
                                {k.keyCode}
                              </code>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(k.keyCode);
                                }}
                                title="Copiar llave"
                                className="text-slate-400 hover:text-slate-700"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {k.role === 'admin' ? 'Rol Admin' : `Grado ${k.grade}°`}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900 truncate max-w-[140px]">
                              {k.studentName || 'Sin Nombre'}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {k.role === 'admin'
                                ? 'Coordinación'
                                : k.grade! <= 5
                                ? 'Primaria (Lúdico)'
                                : 'Secundaria (Académico)'}
                            </span>
                          </td>

                          <td className="py-3 px-3 font-mono">
                            {k.allowedPeriods ? k.allowedPeriods.map((p) => `P${p}`).join(', ') : 'Todos'}
                          </td>

                          <td className="py-3 px-3">
                            <button
                              onClick={() => {
                                store.saveKey({ ...k, isActive: !k.isActive });
                              }}
                              className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-full ${
                                k.isActive
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {k.isActive ? (
                                <>
                                  <ToggleRight className="w-4 h-4 text-emerald-600" />
                                  <span>Activa</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-4 h-4 text-rose-600" />
                                  <span>Inactiva</span>
                                </>
                              )}
                            </button>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {onSwitchToStudentView && k.role === 'student' && (
                                <button
                                  onClick={() => onSwitchToStudentView(k)}
                                  className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-[11px] font-semibold"
                                  title="Entrar como este estudiante"
                                >
                                  Probar
                                </button>
                              )}
                              {k.id !== currentAdminKey.id && (
                                <button
                                  onClick={() => {
                                    store.deleteKey(k.id);
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                  title="Eliminar llave"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: CURRICULUM & EXAM BUILDER ================= */}
        {activeTab === 'curriculum' && (
          <div className="space-y-8">
            {/* Navigational Filter Selector (Grade -> Period -> Subject) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Navegación Curricular Central
                  </h3>
                  <p className="text-xs text-slate-500">
                    Selecciona Grado, Periodo y Materia para gestionar contenidos y configurar el cuestionario
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Grade Selector */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                    <span className="text-xs text-slate-500 font-semibold px-2">Grado:</span>
                    <select
                      value={currGrade}
                      onChange={(e) => setCurrGrade(Number(e.target.value))}
                      className="bg-white text-xs font-bold px-2 py-1.5 rounded-lg border border-slate-200"
                    >
                      {Array.from({ length: 11 }, (_, i) => i + 1).map((g) => (
                        <option key={g} value={g}>
                          {g}° ({g <= 5 ? 'Primaria' : 'Secundaria'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Period Selector */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                    <span className="text-xs text-slate-500 font-semibold px-2">Periodo:</span>
                    <select
                      value={currPeriod}
                      onChange={(e) => setCurrPeriod(Number(e.target.value))}
                      className="bg-white text-xs font-bold px-2 py-1.5 rounded-lg border border-slate-200"
                    >
                      {[1, 2, 3].map((p) => (
                        <option key={p} value={p}>
                          Periodo {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subject Selector */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                    <span className="text-xs text-slate-500 font-semibold px-2">Materia:</span>
                    <select
                      value={currSubject}
                      onChange={(e) => setCurrSubject(e.target.value as SubjectId)}
                      className="bg-white text-xs font-bold px-2 py-1.5 rounded-lg border border-slate-200"
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Split View: Lessons vs Exam Builder */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Lessons Manager (5 cols) */}
              <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                      Lecciones del Módulo ({currentLessons.length})
                    </h4>
                    <span className="text-xs text-slate-500">
                      Grado {currGrade}° · P{currPeriod} · {SUBJECTS.find((s) => s.id === currSubject)?.shortName}
                    </span>
                  </div>

                  <button
                    onClick={handleOpenNewLesson}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nueva Lección</span>
                  </button>
                </div>

                {/* Lesson Form if Editing */}
                {isEditingLesson && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-purple-200 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                      <span>{editingLessonId ? 'Editar Lección' : 'Crear Nueva Lección'}</span>
                      <button
                        onClick={() => setIsEditingLesson(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Título de la Lección"
                      value={lessonFormTitle}
                      onChange={(e) => setLessonFormTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold"
                    />

                    <input
                      type="text"
                      placeholder="Resumen corto o idea clave"
                      value={lessonFormSummary}
                      onChange={(e) => setLessonFormSummary(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                    />

                    <input
                      type="text"
                      placeholder="URL de Video (opcional: YouTube o Vimeo)"
                      value={lessonFormVideo}
                      onChange={(e) => setLessonFormVideo(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                    />

                    <textarea
                      rows={5}
                      placeholder="Contenido formativo en Markdown..."
                      value={lessonFormMarkdown}
                      onChange={(e) => setLessonFormMarkdown(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsEditingLesson(false)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveLesson}
                        className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold"
                      >
                        Guardar Lección
                      </button>
                    </div>
                  </div>
                )}

                {/* Lessons List */}
                <div className="space-y-2">
                  {currentLessons.map((l) => (
                    <div
                      key={l.id}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-3 bg-white"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {l.title}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {l.summary || l.contentMarkdown.slice(0, 50)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEditLesson(l)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 rounded-lg"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            store.deleteLesson(l.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {currentLessons.length === 0 && !isEditingLesson && (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No hay lecciones creadas aún para este periodo. Haz clic en "Nueva Lección" para agregar contenido.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Central Exam Form Builder (7 cols) */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                      Constructor de Exámenes
                    </h4>
                    <span className="text-xs text-slate-500">
                      {currentExam.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <span>Umbral de Aprobación:</span>
                      <input
                        type="number"
                        min={10}
                        max={100}
                        value={examPassingScore}
                        onChange={(e) => setExamPassingScore(Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded-lg border border-slate-300 font-mono font-bold text-center"
                      />
                      <span>%</span>
                    </div>

                    <button
                      onClick={handleSaveExam}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>{examSavedToast ? '¡Guardado!' : 'Guardar Examen'}</span>
                    </button>
                  </div>
                </div>

                {/* Add Questions Bar */}
                <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-purple-50/60 border border-purple-200">
                  <span className="text-xs font-bold text-purple-900">
                    Agregar Pregunta:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddQuestion('multiple_choice')}
                      className="px-3 py-1.5 bg-white text-purple-700 hover:bg-purple-100 border border-purple-300 rounded-xl text-xs font-bold"
                    >
                      + Opción Múltiple (Cerrada)
                    </button>
                    <button
                      onClick={() => handleAddQuestion('open')}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>+ Pregunta Abierta (IA)</span>
                    </button>
                  </div>
                </div>

                {/* Question Items Editor */}
                <div className="space-y-4">
                  {examQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl border border-slate-200 space-y-3 bg-slate-50/50"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 uppercase">
                          Pregunta #{idx + 1} ({q.type === 'multiple_choice' ? 'Cerrada' : 'Abierta con Rúbrica IA'})
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] text-slate-500 font-semibold">Puntos:</label>
                          <input
                            type="number"
                            value={q.points}
                            onChange={(e) => {
                              const pts = Number(e.target.value) || 0;
                              setExamQuestions(
                                examQuestions.map((item) => (item.id === q.id ? { ...item, points: pts } : item))
                              );
                            }}
                            className="w-14 px-2 py-0.5 rounded border border-slate-300 text-center font-mono font-bold"
                          />
                          <button
                            onClick={() => {
                              setExamQuestions(examQuestions.filter((item) => item.id !== q.id));
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Enunciado de la pregunta"
                        value={q.prompt}
                        onChange={(e) => {
                          const val = e.target.value;
                          setExamQuestions(
                            examQuestions.map((item) => (item.id === q.id ? { ...item, prompt: val } : item))
                          );
                        }}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white"
                      />

                      {/* Options Editor for Multiple Choice */}
                      {q.type === 'multiple_choice' && q.options && (
                        <div className="space-y-1.5 pt-2">
                          <div className="text-[11px] font-bold text-slate-500">
                            Opciones (Selecciona la casilla circular para marcar la respuesta correcta):
                          </div>
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${q.id}`}
                                checked={q.correctOptionIndex === optIdx}
                                onChange={() => {
                                  setExamQuestions(
                                    examQuestions.map((item) =>
                                      item.id === q.id ? { ...item, correctOptionIndex: optIdx } : item
                                    )
                                  );
                                }}
                                className="text-emerald-600"
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const newOpts = [...q.options!];
                                  newOpts[optIdx] = e.target.value;
                                  setExamQuestions(
                                    examQuestions.map((item) =>
                                      item.id === q.id ? { ...item, options: newOpts } : item
                                    )
                                  );
                                }}
                                className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Rubric Criteria for Open Question */}
                      {q.type === 'open' && (
                        <div className="pt-2 space-y-1">
                          <label className="text-[11px] font-bold text-purple-900 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            Rúbrica de Corrección para Gemini IA:
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Describe qué conceptos clave debe responder el alumno para obtener el puntaje completo..."
                            value={q.rubricCriteria || ''}
                            onChange={(e) => {
                              const rub = e.target.value;
                              setExamQuestions(
                                examQuestions.map((item) =>
                                  item.id === q.id ? { ...item, rubricCriteria: rub } : item
                                )
                              );
                            }}
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-purple-200 bg-white"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: CERTIFICATE TEMPLATE & SETTINGS ================= */}
        {activeTab === 'certificate_template' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Settings (5 cols) */}
              <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Editor de Plantilla de Diplomas
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configura los datos oficiales que aparecerán en los certificados emitidos en PDF.
                  </p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nombre de la Institución Educativa
                    </label>
                    <input
                      type="text"
                      required
                      value={instName}
                      onChange={(e) => setInstName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nombre del Rector/Director
                      </label>
                      <input
                        type="text"
                        required
                        value={rectorName}
                        onChange={(e) => setRectorName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Cargo Oficial
                      </label>
                      <input
                        type="text"
                        required
                        value={rectorTitle}
                        onChange={(e) => setRectorTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Texto de Acreditación Legal
                    </label>
                    <textarea
                      rows={3}
                      value={legalText}
                      onChange={(e) => setLegalText(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Texto de Firma Digital
                    </label>
                    <input
                      type="text"
                      value={sigText}
                      onChange={(e) => setSigText(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{settingsSavedToast ? '¡Cambios Guardados!' : 'Guardar Parámetros de Diploma'}</span>
                  </button>
                </form>
              </div>

              {/* Live Certificate Preview (7 cols) */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Vista Previa del Certificado Dinámico
                  </h4>
                  <span className="text-xs text-purple-600 font-semibold">
                    Generación Vectorial 300 DPI
                  </span>
                </div>

                <div className="border-2 border-double border-amber-600/60 p-6 rounded-2xl bg-[#FFFDF9] text-center space-y-3">
                  <div className="text-3xl">{logoEmoji || '🎓'}</div>
                  <h2 className="text-lg font-black text-blue-950 uppercase">{instName}</h2>
                  <div className="w-16 h-0.5 bg-amber-500 mx-auto" />
                  <h3 className="font-serif italic font-bold text-xl text-slate-900">
                    Certificado de Excelencia
                  </h3>
                  <p className="text-xs text-slate-600">
                    Acredita a: <strong className="text-blue-900">SOFÍA GÓMEZ</strong>
                  </p>
                  <div className="text-xs font-bold text-slate-800 bg-amber-100/50 py-1 rounded-lg">
                    MATEMÁTICAS — PERIODO 1 (GRADO 3°)
                  </div>
                  <p className="text-[10px] text-slate-500 italic max-w-md mx-auto">
                    {legalText}
                  </p>

                  <div className="pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-500">
                    <div className="text-left font-mono">
                      CÓDIGO: CERT-2026-SOF-G3P1-9482
                    </div>
                    <div className="text-right">
                      <strong>{rectorName}</strong>
                      <div className="text-[9px]">{rectorTitle}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: FAILED ATTEMPTS ALERTS ================= */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <span>Monitor de Alertas de Reprobación ({failedSubmissions.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Registro de estudiantes que no alcanzaron el porcentaje mínimo para intervención y refuerzo pedagógico oportuno.
                  </p>
                </div>
              </div>

              {failedSubmissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                        <th className="py-2.5 px-3">Fecha</th>
                        <th className="py-2.5 px-3">Estudiante</th>
                        <th className="py-2.5 px-3">Grado</th>
                        <th className="py-2.5 px-3">Asignatura</th>
                        <th className="py-2.5 px-3">Periodo</th>
                        <th className="py-2.5 px-3">Puntaje</th>
                        <th className="py-2.5 px-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {failedSubmissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-amber-50/40 transition-colors">
                          <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                            {new Date(sub.submittedAt).toLocaleString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900">
                            {sub.studentName}
                            <span className="text-[10px] text-slate-400 block font-mono">
                              Llave: {sub.keyCode}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold">
                            Grado {sub.grade}°
                          </td>
                          <td className="py-3 px-3 uppercase text-slate-700 font-semibold">
                            {SUBJECTS.find((s) => s.id === sub.subject)?.shortName || sub.subject}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold">
                            Periodo {sub.period}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-mono font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                              {sub.score.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                              Alerta de Refuerzo
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <Check className="w-10 h-10 mx-auto text-emerald-500" />
                  <div className="text-sm font-bold text-slate-700">Sin Alertas Pendientes</div>
                  <p className="text-xs text-slate-500">
                    Todos los intentos de evaluación registrados hasta ahora han alcanzado el umbral aprobatorio.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 5: SUPABASE & RESPALDOS (SIMPLIFICADO) ================= */}
        {activeTab === 'database' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Supabase Connection Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
                    <Database className="w-4 h-4" />
                    <span>Persistencia en la Nube</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Conexión con Supabase
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Conecta tu base de datos PostgreSQL gratuita de Supabase para respaldo en la nube.
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      supabaseConfig.isConnected
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        supabaseConfig.isConnected ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    {supabaseConfig.isConnected ? 'Conectado a Supabase' : 'Modo Local Activo'}
                  </span>
                </div>
              </div>

              {/* Quick Visual 3-Step Guide (English UI mapping) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Paso a Paso Rápido (Interfaz en Inglés de Supabase)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="font-bold text-emerald-700 block mb-0.5">Paso 1: Tablas</span>
                    <p className="text-slate-600 text-[11px] leading-tight">
                      Copia el script SQL abajo, ve a <strong>"SQL Editor"</strong> en Supabase, haz clic en <strong>"New query"</strong>, pega y presiona <strong>"Run"</strong>.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="font-bold text-blue-700 block mb-0.5">Paso 2: Credenciales</span>
                    <p className="text-slate-600 text-[11px] leading-tight">
                      En Supabase ve al engranaje ⚙️ <strong>"Project Settings"</strong> → <strong>"API"</strong> (o <strong>"Data API"</strong>) y copia el <strong>Project URL</strong> y la key <strong>anon public</strong>.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="font-bold text-purple-700 block mb-0.5">Paso 3: Conectar</span>
                    <p className="text-slate-600 text-[11px] leading-tight">
                      Pega ambos valores aquí abajo, haz clic en <strong>"Guardar y Probar"</strong> y luego en <strong>"Sincronizar Llaves"</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Connection Form */}
              <form onSubmit={handleSaveAndTestSupabase} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Supabase Project URL <span className="text-[11px] font-normal text-slate-500">(Settings → API → Project URL)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="https://abcdefghijklmno.supabase.co"
                      value={sbUrl}
                      onChange={(e) => setSbUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-mono focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Supabase Anon Key <span className="text-[11px] font-normal text-slate-500">(Settings → API → anon public)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={sbKey}
                      onChange={(e) => setSbKey(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-mono focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Feedback Message */}
                {supabaseTestMsg && (
                  <div
                    className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                      supabaseTestMsg.success
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'bg-rose-50 text-rose-900 border border-rose-200'
                    }`}
                  >
                    {supabaseTestMsg.success ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{supabaseTestMsg.text}</span>
                  </div>
                )}

                {/* Main Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isTestingSupabase}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                  >
                    {isTestingSupabase ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isTestingSupabase ? 'Verificando...' : 'Guardar y Probar Conexión'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={!sbUrl || !sbKey || isSyncingSupabase}
                    onClick={handleSyncKeysToSupabase}
                    className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span>
                      {isSyncingSupabase ? 'Sincronizando...' : 'Sincronizar Llaves a Supabase'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(supabaseSqlScript);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    {copiedSql ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-500" />
                    )}
                    <span>{copiedSql ? '¡Script SQL Copiado!' : 'Copiar Script SQL para Supabase'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Backups & Portability Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-base font-bold text-slate-900">
                Copias de Seguridad Locales
              </h4>
              <p className="text-xs text-slate-500">
                Exporta o restaura todo el estado de la plataforma (llaves, lecciones, exámenes y notas) en un archivo JSON portátil.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    const json = store.exportFullBackup();
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `EduToken_LMS_Backup_${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                  }}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Copia de Seguridad (JSON)</span>
                </button>

                <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Restaurar desde JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        if (content && store.importFullBackup(content)) {
                          setBackupToast('¡Copia de seguridad restaurada exitosamente!');
                          setTimeout(() => setBackupToast(null), 3000);
                        } else {
                          setBackupToast('Error al leer el archivo JSON.');
                          setTimeout(() => setBackupToast(null), 3000);
                        }
                      };
                      reader.readAsText(file);
                    }}
                  />
                </label>

                {!showResetConfirm ? (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="px-4 py-2.5 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ml-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reiniciar a Fábrica</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 ml-auto p-1.5 bg-rose-50 border border-rose-200 rounded-xl text-xs">
                    <span className="text-rose-800 font-medium">¿Seguro?</span>
                    <button
                      onClick={() => {
                        store.resetAllToFactory();
                        setShowResetConfirm(false);
                        setBackupToast('Sistema restablecido a los valores iniciales');
                        setTimeout(() => setBackupToast(null), 3000);
                      }}
                      className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700"
                    >
                      Sí, reiniciar
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              {backupToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{backupToast}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
