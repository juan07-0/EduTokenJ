import React, { useState } from 'react';
import { AccessKey, IssuedCertificate, Lesson, SubjectId } from '../../types/lms';
import { SUBJECTS } from '../../data/mockCurriculum';
import { storageService } from '../../services/storageService';
import {
  BookOpen,
  Calculator,
  Leaf,
  Compass,
  Languages,
  Lock,
  CheckCircle2,
  ChevronRight,
  FileText,
  Video,
  Download,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface SecondaryDashboardProps {
  studentKey: AccessKey;
  onStartExam: (grade: number, period: number, subject: SubjectId) => void;
  onViewCertificate: (cert: IssuedCertificate) => void;
}

export const SecondaryDashboard: React.FC<SecondaryDashboardProps> = ({
  studentKey,
  onStartExam,
  onViewCertificate,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(studentKey.allowedPeriods[0] || 1);
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('matematicas');
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);

  const grade = studentKey.grade || 9;
  const allowedPeriods = studentKey.allowedPeriods || [1, 2, 3];
  const allowedSubjects = studentKey.allowedSubjects || ['matematicas', 'lenguaje', 'ciencias_naturales', 'ciencias_sociales', 'ingles'];

  // Current lessons
  const lessons = storageService.getLessons(grade, selectedPeriod, selectedSubject);
  const activeLesson: Lesson | undefined = lessons[activeLessonIndex] || lessons[0];

  // Latest exam submission for this subject & period
  const submission = storageService.getLatestSubmission(
    studentKey.keyCode,
    grade,
    selectedPeriod,
    selectedSubject
  );
  const certificate = submission ? storageService.getCertificateForSubmission(submission.id) : undefined;

  // General academic progress calculations for the period
  const periodSubmissions = storageService
    .getSubmissions()
    .filter((s) => s.keyCode === studentKey.keyCode && s.grade === grade && s.period === selectedPeriod);

  const passedCount = periodSubmissions.filter((s) => s.passed).length;
  const averageScore =
    periodSubmissions.length > 0
      ? periodSubmissions.reduce((acc, curr) => acc + curr.score, 0) / periodSubmissions.length
      : 0;

  const getSubjectIcon = (id: SubjectId) => {
    switch (id) {
      case 'matematicas':
        return <Calculator className="w-5 h-5" />;
      case 'lenguaje':
        return <BookOpen className="w-5 h-5" />;
      case 'ciencias_naturales':
        return <Leaf className="w-5 h-5" />;
      case 'ciencias_sociales':
        return <Compass className="w-5 h-5" />;
      case 'ingles':
        return <Languages className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24">
      {/* Top Academic Sub-Header */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <span>Educación Secundaria y Media</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-blue-700">Grado {grade}°</span>
                <span aria-hidden="true">·</span>
                <span>Periodo Académico {selectedPeriod}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Panel Curricular · {studentKey.studentName || 'Estudiante'}
              </h1>
            </div>

            {/* Academic KPIs (Tabular Numbers) */}
            <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Aprobadas</span>
                <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                  {passedCount} / {allowedSubjects.length}
                </span>
              </div>
              <div className="w-px h-7 bg-slate-200" />
              <div>
                <span className="text-slate-500 block">Promedio Periodo</span>
                <span className="text-sm font-bold font-mono text-blue-600 tabular-nums">
                  {averageScore > 0 ? `${averageScore.toFixed(1)}/100` : '—'}
                </span>
              </div>
              <div className="w-px h-7 bg-slate-200" />
              <div>
                <span className="text-slate-500 block">Estado Llave</span>
                <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Activa
                </span>
              </div>
            </div>
          </div>

          {/* Period Segmented Control */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {[1, 2, 3].map((pNum) => {
                const isAllowed = allowedPeriods.includes(pNum);
                const isSelected = selectedPeriod === pNum;

                return (
                  <button
                    key={pNum}
                    onClick={() => {
                      if (isAllowed) setSelectedPeriod(pNum);
                    }}
                    disabled={!isAllowed}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-sm font-semibold'
                        : isAllowed
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {!isAllowed && <Lock className="w-3 h-3 text-slate-400" />}
                    <span>Periodo {pNum}</span>
                    {!isAllowed && <span className="text-[10px] text-slate-400">(Restringido)</span>}
                  </button>
                );
              })}
            </div>

            <span className="text-xs text-slate-400 hidden sm:inline">
              5 Asignaturas troncales evaluables
            </span>
          </div>
        </div>
      </section>

      {/* Main Grid: Subjects Explorer & Reading Stage */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: 5 Subject Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">
            Plan de Estudio
          </div>

          <div className="space-y-2">
            {SUBJECTS.map((sub) => {
              const isAllowed = allowedSubjects.includes(sub.id);
              const isSelected = selectedSubject === sub.id;

              const subState = storageService.getLatestSubmission(
                studentKey.keyCode,
                grade,
                selectedPeriod,
                sub.id
              );

              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    if (isAllowed) {
                      setSelectedSubject(sub.id);
                      setActiveLessonIndex(0);
                    }
                  }}
                  disabled={!isAllowed}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-white border-blue-600 shadow-sm ring-1 ring-blue-600'
                      : isAllowed
                      ? 'bg-white border-slate-200 hover:border-slate-300'
                      : 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {getSubjectIcon(sub.id)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {sub.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {subState?.passed ? (
                          <span className="text-emerald-600 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Aprobado ({subState.score.toFixed(0)}%)
                          </span>
                        ) : subState ? (
                          <span className="text-amber-600">
                            Nota previa: {subState.score.toFixed(0)}%
                          </span>
                        ) : (
                          'Pendiente de evaluación'
                        )}
                      </div>
                    </div>
                  </div>

                  {!isAllowed ? (
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Reading Stage & Exam Launcher (8 cols) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Subject Header */}
            {(() => {
              const currentSub = SUBJECTS.find((s) => s.id === selectedSubject)!;
              return (
                <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      {getSubjectIcon(currentSub.id)}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {currentSub.shortName} · Periodo {selectedPeriod}
                      </span>
                      <h2 className="text-xl font-bold text-slate-900">{currentSub.name}</h2>
                    </div>
                  </div>

                  <button
                    onClick={() => onStartExam(grade, selectedPeriod, selectedSubject)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Presentar Evaluación Formal</span>
                  </button>
                </div>
              );
            })()}

            {/* Approved Certificate Notification */}
            {submission?.passed && certificate && (
              <div className="m-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-900">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-xs sm:text-sm">
                    <span className="font-semibold">Evaluación Aprobada con {submission.score.toFixed(1)} / 100.</span>
                    <span className="text-emerald-700 block">Tu certificado digital se encuentra respaldado y verificado.</span>
                  </div>
                </div>
                <button
                  onClick={() => onViewCertificate(certificate)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Certificado Oficial</span>
                </button>
              </div>
            )}

            {/* Failed Prior Attempt Warning */}
            {submission && !submission.passed && (
              <div className="m-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <span className="font-semibold">Último intento: {submission.score.toFixed(1)} / 100 (Umbral mínimo no alcanzado).</span>
                  <p className="text-amber-800 mt-0.5">
                    Se recomienda repasar los fundamentos teóricos detallados a continuación antes de presentar nuevamente el cuestionario.
                  </p>
                </div>
              </div>
            )}

            {/* Lesson Navigation Strip */}
            {lessons.length > 1 && (
              <div className="px-6 pt-3 flex items-center gap-2 border-b border-slate-100 overflow-x-auto pb-3">
                {lessons.map((les, idx) => (
                  <button
                    key={les.id}
                    onClick={() => setActiveLessonIndex(idx)}
                    className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                      activeLessonIndex === idx
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Unidad {idx + 1}: {les.title.slice(0, 30)}...
                  </button>
                ))}
              </div>
            )}

            {/* Active Lesson Reader */}
            {activeLesson ? (
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {activeLesson.title}
                  </h3>
                  {activeLesson.summary && (
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                      <strong>Resumen Ejecutivo:</strong> {activeLesson.summary}
                    </p>
                  )}
                </div>

                {activeLesson.videoUrl && (
                  <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-100 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-2.5">
                      <Video className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-medium text-blue-900">Material Audiovisual Complementario</span>
                    </div>
                    <a
                      href={activeLesson.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1"
                    >
                      <span>Ver Fuente</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Markdown Prose */}
                <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed bg-white whitespace-pre-line text-slate-700">
                  {activeLesson.contentMarkdown}
                </div>

                {/* Bottom CTA to start assessment */}
                <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500">
                    La evaluación incluye preguntas de selección múltiple y preguntas abiertas con rúbrica analítica.
                  </div>
                  <button
                    onClick={() => onStartExam(grade, selectedPeriod, selectedSubject)}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Iniciar Evaluación de {SUBJECTS.find((s) => s.id === selectedSubject)?.shortName}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 text-sm">
                <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                No hay unidades cargadas para esta combinación curricular.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
