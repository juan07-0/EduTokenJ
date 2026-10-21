export type Role = 'student' | 'admin';

export type SubjectId =
  | 'matematicas'
  | 'lenguaje'
  | 'ciencias_naturales'
  | 'ciencias_sociales'
  | 'ingles';

export interface SubjectMeta {
  id: SubjectId;
  name: string;
  shortName: string;
  iconName: string;
  color: string;
  lightBg: string;
  borderColor: string;
  description: string;
}

export interface AccessKey {
  id: string;
  keyCode: string;
  role: Role;
  studentName?: string;
  grade?: number; // 1 to 11
  allowedPeriods: number[]; // e.g. [1, 2, 3]
  allowedSubjects: SubjectId[];
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Lesson {
  id: string;
  grade: number;
  period: number;
  subject: SubjectId;
  title: string;
  summary: string;
  contentMarkdown: string;
  videoUrl?: string;
  resources?: { title: string; url: string }[];
  orderIndex: number;
}

export type QuestionType = 'multiple_choice' | 'open';

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[]; // for multiple_choice (at least 3-4 options)
  correctOptionIndex?: number;
  points: number; // e.g. 25
  rubricCriteria?: string; // guidance for Gemini AI evaluation on open questions
}

export interface Exam {
  id: string;
  grade: number;
  period: number;
  subject: SubjectId;
  title: string;
  passingScore: number; // 0 - 100, default 70
  questions: ExamQuestion[];
}

export interface AiQuestionEvaluation {
  pointsAwarded: number;
  maxPoints: number;
  feedback: string;
  criteriaAnalysis?: string;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  keyCode: string;
  studentName: string;
  grade: number;
  period: number;
  subject: SubjectId;
  score: number; // percentage 0 - 100
  totalPointsEarned: number;
  totalPointsPossible: number;
  passed: boolean;
  answers: Record<string, string | number>;
  aiFeedback?: Record<string, AiQuestionEvaluation>;
  submittedAt: string;
}

export interface IssuedCertificate {
  id: string;
  verificationCode: string; // e.g. "CERT-2026-SOF-M3P1-9482"
  submissionId: string;
  studentName: string;
  grade: number;
  period: number;
  subject: SubjectId;
  subjectName: string;
  score: number;
  institutionName: string;
  rectorName: string;
  issuedAt: string;
}

export interface InstitutionSettings {
  name: string;
  rectorName: string;
  rectorTitle: string;
  signatureText: string;
  legalText: string;
  logoEmoji: string;
  accentColor: string;
}

export interface SupabaseConfig {
  supabaseUrl: string;
  anonKey: string;
  isConnected: boolean;
}
