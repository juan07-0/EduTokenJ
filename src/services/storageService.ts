import {
  INITIAL_EXAMS,
  INITIAL_KEYS,
  INITIAL_LESSONS,
  INITIAL_SETTINGS,
  SUBJECTS,
} from '../data/mockCurriculum';
import {
  AccessKey,
  Exam,
  ExamSubmission,
  InstitutionSettings,
  IssuedCertificate,
  Lesson,
  SubjectId,
  SupabaseConfig,
} from '../types/lms';

const STORAGE_KEYS = {
  KEYS: 'edutoken_access_keys_v1',
  LESSONS: 'edutoken_lessons_v1',
  EXAMS: 'edutoken_exams_v1',
  SUBMISSIONS: 'edutoken_submissions_v1',
  CERTIFICATES: 'edutoken_certificates_v1',
  SETTINGS: 'edutoken_settings_v1',
  SUPABASE: 'edutoken_supabase_config_v1',
  CURRENT_USER_KEY: 'edutoken_active_key_code',
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error notifying storage listener:', e);
    }
  });
}

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Helper to safely read from localStorage
function safeRead<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Failed to read ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function safeWrite<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (err) {
    console.error(`Failed to write ${key} to localStorage:`, err);
  }
}

// Initialize seed data if not present
export function initializeStorageIfEmpty(): void {
  if (!localStorage.getItem(STORAGE_KEYS.KEYS)) {
    safeWrite(STORAGE_KEYS.KEYS, INITIAL_KEYS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.LESSONS)) {
    safeWrite(STORAGE_KEYS.LESSONS, INITIAL_LESSONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.EXAMS)) {
    safeWrite(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    safeWrite(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
    safeWrite(STORAGE_KEYS.SUBMISSIONS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CERTIFICATES)) {
    safeWrite(STORAGE_KEYS.CERTIFICATES, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUPABASE)) {
    safeWrite(STORAGE_KEYS.SUPABASE, {
      supabaseUrl: '',
      anonKey: '',
      isConnected: false,
    });
  }
}

// Key Management
export const storageService = {
  // KEYS
  getKeys(): AccessKey[] {
    return safeRead<AccessKey[]>(STORAGE_KEYS.KEYS, INITIAL_KEYS);
  },

  getKeyByCode(code: string): AccessKey | undefined {
    const clean = code.trim().toUpperCase();
    const keys = this.getKeys();
    return keys.find((k) => k.keyCode.toUpperCase() === clean);
  },

  saveKey(key: AccessKey): void {
    const keys = this.getKeys();
    const idx = keys.findIndex((k) => k.id === key.id || k.keyCode === key.keyCode);
    if (idx >= 0) {
      keys[idx] = key;
    } else {
      keys.unshift(key);
    }
    safeWrite(STORAGE_KEYS.KEYS, keys);
  },

  deleteKey(id: string): void {
    const keys = this.getKeys().filter((k) => k.id !== id);
    safeWrite(STORAGE_KEYS.KEYS, keys);
  },

  recordLogin(keyCode: string): void {
    const keys = this.getKeys();
    const found = keys.find((k) => k.keyCode === keyCode);
    if (found) {
      found.lastLoginAt = new Date().toISOString();
      safeWrite(STORAGE_KEYS.KEYS, keys);
    }
  },

  // ACTIVE SESSION
  getActiveKeyCode(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_KEY);
  },

  setActiveKeyCode(code: string | null): void {
    if (code) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_KEY, code.toUpperCase());
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_KEY);
    }
    notifyListeners();
  },

  // LESSONS
  getLessons(grade?: number, period?: number, subject?: SubjectId): Lesson[] {
    const all = safeRead<Lesson[]>(STORAGE_KEYS.LESSONS, INITIAL_LESSONS);
    return all.filter((les) => {
      if (grade !== undefined && les.grade !== grade) return false;
      if (period !== undefined && les.period !== period) return false;
      if (subject !== undefined && les.subject !== subject) return false;
      return true;
    }).sort((a, b) => a.orderIndex - b.orderIndex);
  },

  saveLesson(lesson: Lesson): void {
    const lessons = safeRead<Lesson[]>(STORAGE_KEYS.LESSONS, INITIAL_LESSONS);
    const idx = lessons.findIndex((l) => l.id === lesson.id);
    if (idx >= 0) {
      lessons[idx] = lesson;
    } else {
      lessons.push(lesson);
    }
    safeWrite(STORAGE_KEYS.LESSONS, lessons);
  },

  deleteLesson(id: string): void {
    const lessons = safeRead<Lesson[]>(STORAGE_KEYS.LESSONS, INITIAL_LESSONS).filter((l) => l.id !== id);
    safeWrite(STORAGE_KEYS.LESSONS, lessons);
  },

  // EXAMS
  getExams(): Exam[] {
    return safeRead<Exam[]>(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
  },

  getExam(grade: number, period: number, subject: SubjectId): Exam {
    const exams = this.getExams();
    const match = exams.find((e) => e.grade === grade && e.period === period && e.subject === subject);
    if (match) return match;

    // Autogenerate a template exam if none exists yet
    const subMeta = SUBJECTS.find((s) => s.id === subject);
    const subName = subMeta ? subMeta.name : subject;
    const isPrimary = grade <= 5;

    const autoExam: Exam = {
      id: `exam-${grade}-${period}-${subject}`,
      grade,
      period,
      subject,
      title: `Evaluación de ${subName} - Grado ${grade}° (Periodo ${period})`,
      passingScore: 70,
      questions: [
        {
          id: `q-auto-${grade}-${period}-${subject}-1`,
          type: 'multiple_choice',
          prompt: isPrimary
            ? `¿Cuál es el concepto principal aprendido en ${subName}?`
            : `Seleccione la premisa teórica fundamental desarrollada en ${subName}:`,
          options: [
            'Opción fundamental A: Aplicación directa del método',
            'Opción fundamental B: Verificación empírica de resultados',
            'Opción fundamental C: Deducción de principios básicos',
            'Opción fundamental D: Ninguna de las anteriores',
          ],
          correctOptionIndex: 0,
          points: 50,
        },
        {
          id: `q-auto-${grade}-${period}-${subject}-2`,
          type: 'open',
          prompt: isPrimary
            ? `Describe con tus palabras por qué es importante este tema de ${subName} en tu vida cotidiana.`
            : `Sustente analíticamente la importancia y aplicación práctica de los contenidos estudiados en ${subName}.`,
          points: 50,
          rubricCriteria:
            'Calificar claridad conceptual, coherencia expositiva y relación con ejemplos prácticos. Otorgar hasta 50 puntos según fundamentación.',
        },
      ],
    };

    return autoExam;
  },

  saveExam(exam: Exam): void {
    const exams = this.getExams();
    const idx = exams.findIndex((e) => e.id === exam.id || (e.grade === exam.grade && e.period === exam.period && e.subject === exam.subject));
    if (idx >= 0) {
      exams[idx] = exam;
    } else {
      exams.push(exam);
    }
    safeWrite(STORAGE_KEYS.EXAMS, exams);
  },

  // SUBMISSIONS
  getSubmissions(): ExamSubmission[] {
    return safeRead<ExamSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []);
  },

  getFailedSubmissions(): ExamSubmission[] {
    return this.getSubmissions().filter((s) => !s.passed).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  },

  saveSubmission(submission: ExamSubmission): void {
    const list = this.getSubmissions();
    list.unshift(submission);
    safeWrite(STORAGE_KEYS.SUBMISSIONS, list);
  },

  getLatestSubmission(keyCode: string, grade: number, period: number, subject: SubjectId): ExamSubmission | undefined {
    const list = this.getSubmissions();
    return list.find(
      (s) => s.keyCode === keyCode && s.grade === grade && s.period === period && s.subject === subject
    );
  },

  // CERTIFICATES
  getCertificates(): IssuedCertificate[] {
    return safeRead<IssuedCertificate[]>(STORAGE_KEYS.CERTIFICATES, []);
  },

  getCertificateByCode(code: string): IssuedCertificate | undefined {
    const clean = code.trim().toUpperCase();
    return this.getCertificates().find((c) => c.verificationCode.toUpperCase() === clean);
  },

  getCertificateForSubmission(submissionId: string): IssuedCertificate | undefined {
    return this.getCertificates().find((c) => c.submissionId === submissionId);
  },

  saveCertificate(cert: IssuedCertificate): void {
    const certs = this.getCertificates();
    const idx = certs.findIndex((c) => c.verificationCode === cert.verificationCode || c.submissionId === cert.submissionId);
    if (idx >= 0) {
      certs[idx] = cert;
    } else {
      certs.unshift(cert);
    }
    safeWrite(STORAGE_KEYS.CERTIFICATES, certs);
  },

  // SETTINGS
  getSettings(): InstitutionSettings {
    return safeRead<InstitutionSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  saveSettings(settings: InstitutionSettings): void {
    safeWrite(STORAGE_KEYS.SETTINGS, settings);
  },

  // SUPABASE CONFIG
  getSupabaseConfig(): SupabaseConfig {
    return safeRead<SupabaseConfig>(STORAGE_KEYS.SUPABASE, {
      supabaseUrl: '',
      anonKey: '',
      isConnected: false,
    });
  },

  saveSupabaseConfig(config: SupabaseConfig): void {
    safeWrite(STORAGE_KEYS.SUPABASE, config);
  },

  // BACKUP & RESET
  resetAllToFactory(): void {
    localStorage.clear();
    initializeStorageIfEmpty();
    notifyListeners();
  },

  exportFullBackup(): string {
    const dump = {
      keys: this.getKeys(),
      lessons: safeRead<Lesson[]>(STORAGE_KEYS.LESSONS, INITIAL_LESSONS),
      exams: this.getExams(),
      submissions: this.getSubmissions(),
      certificates: this.getCertificates(),
      settings: this.getSettings(),
      supabase: this.getSupabaseConfig(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(dump, null, 2);
  },

  importFullBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.keys) safeWrite(STORAGE_KEYS.KEYS, data.keys);
      if (data.lessons) safeWrite(STORAGE_KEYS.LESSONS, data.lessons);
      if (data.exams) safeWrite(STORAGE_KEYS.EXAMS, data.exams);
      if (data.submissions) safeWrite(STORAGE_KEYS.SUBMISSIONS, data.submissions);
      if (data.certificates) safeWrite(STORAGE_KEYS.CERTIFICATES, data.certificates);
      if (data.settings) safeWrite(STORAGE_KEYS.SETTINGS, data.settings);
      if (data.supabase) safeWrite(STORAGE_KEYS.SUPABASE, data.supabase);
      notifyListeners();
      return true;
    } catch (err) {
      console.error('Failed to import backup:', err);
      return false;
    }
  },
};

// React hook for auto-sync
import { useEffect, useState } from 'react';

export function useLMSStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    initializeStorageIfEmpty();
    const unsub = subscribeToStore(() => {
      setTick((t) => t + 1);
    });
    return unsub;
  }, []);

  return storageService;
}

// Pre-initialize immediately
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  initializeStorageIfEmpty();
}
