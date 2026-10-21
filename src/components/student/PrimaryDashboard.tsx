import React, { useState } from 'react';
import { AccessKey, IssuedCertificate, Lesson, SubjectId } from '../../types/lms';
import { SUBJECTS } from '../../data/mockCurriculum';
import { storageService } from '../../services/storageService';
import {
  Sparkles,
  BookOpen,
  Calculator,
  Leaf,
  Compass,
  Languages,
  Lock,
  CheckCircle,
  PlayCircle,
  Award,
  Video,
  ChevronRight,
  Smile,
  Heart,
  Star,
  Download,
} from 'lucide-react';

interface PrimaryDashboardProps {
  studentKey: AccessKey;
  onStartExam: (grade: number, period: number, subject: SubjectId) => void;
  onViewCertificate: (cert: IssuedCertificate) => void;
}

export const PrimaryDashboard: React.FC<PrimaryDashboardProps> = ({
  studentKey,
  onStartExam,
  onViewCertificate,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(studentKey.allowedPeriods[0] || 1);
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('matematicas');
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);

  const grade = studentKey.grade || 3;
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

  const getSubjectIcon = (id: SubjectId) => {
    switch (id) {
      case 'matematicas':
        return <Calculator className="w-8 h-8" />;
      case 'lenguaje':
        return <BookOpen className="w-8 h-8" />;
      case 'ciencias_naturales':
        return <Leaf className="w-8 h-8" />;
      case 'ciencias_sociales':
        return <Compass className="w-8 h-8" />;
      case 'ingles':
        return <Languages className="w-8 h-8" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-800 pb-20 selection:bg-amber-200">
      {/* Playful Welcome Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-amber-300/30 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-5 z-10">
            <div className="w-20 h-20 rounded-3xl bg-white text-amber-500 shadow-md flex items-center justify-center shrink-0 border-4 border-amber-200/50">
              <Smile className="w-12 h-12" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-100" />
                <span>¡Modo Primaria Divertido!</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                ¡Hola de nuevo, {studentKey.studentName || 'Estudiante'}! 👋
              </h1>
              <p className="text-amber-50 text-sm sm:text-base font-medium mt-1">
                Grado {grade}° de Primaria · ¿Qué gran aventura aprenderemos hoy?
              </p>
            </div>
          </div>

          {/* Gamified Badges Strip */}
          <div className="flex items-center gap-3 z-10 shrink-0 bg-white/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/30">
            <div className="text-center">
              <div className="text-xl font-black text-white flex items-center justify-center gap-1">
                <Star className="w-5 h-5 text-yellow-200 fill-yellow-200" />
                <span>Nivel {grade}</span>
              </div>
              <div className="text-[11px] text-amber-100 font-semibold">Grado Escolar</div>
            </div>
            <div className="w-px h-8 bg-white/30" />
            <div className="text-center">
              <div className="text-xl font-black text-white flex items-center justify-center gap-1">
                <Heart className="w-5 h-5 text-rose-200 fill-rose-200" />
                <span>5/5</span>
              </div>
              <div className="text-[11px] text-amber-100 font-semibold">Materias</div>
            </div>
          </div>
        </div>
      </section>

      {/* Period Selector Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Elige tu Periodo Académico</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                3 Periodos
              </span>
            </h2>
            <p className="text-xs text-slate-500">Selecciona el trimestre en el que estás trabajando</p>
          </div>

          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
            {[1, 2, 3].map((periodNum) => {
              const isAllowed = allowedPeriods.includes(periodNum);
              const isSelected = selectedPeriod === periodNum;

              return (
                <button
                  key={periodNum}
                  onClick={() => {
                    if (isAllowed) setSelectedPeriod(periodNum);
                  }}
                  disabled={!isAllowed}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-200 scale-105'
                      : isAllowed
                      ? 'bg-white text-slate-700 hover:bg-amber-50'
                      : 'bg-slate-200/60 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {!isAllowed ? (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  ) : isSelected ? (
                    <Sparkles className="w-3.5 h-3.5 text-amber-100" />
                  ) : null}
                  <span>Periodo {periodNum}</span>
                  {!isAllowed && <span className="text-[10px] font-normal">(Bloqueado)</span>}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Grid: 5 Subject Cards & Active Lesson Deck */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: 5 Subject Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 px-1">
            Asignaturas Troncales
          </h3>

          <div className="space-y-3">
            {SUBJECTS.map((sub) => {
              const isAllowed = allowedSubjects.includes(sub.id);
              const isSelected = selectedSubject === sub.id;

              // Check if completed/passed
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
                  style={{
                    borderColor: isSelected ? sub.color : undefined,
                  }}
                  className={`w-full p-4 rounded-3xl border-2 text-left transition-all relative overflow-hidden flex items-center gap-4 ${
                    isSelected
                      ? 'bg-white shadow-lg shadow-blue-50/50 scale-[1.02]'
                      : isAllowed
                      ? 'bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300'
                      : 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div
                    style={{ backgroundColor: isSelected ? sub.color : sub.lightBg, color: isSelected ? '#fff' : sub.color }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors shadow-sm"
                  >
                    {getSubjectIcon(sub.id)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-base truncate">
                        {sub.shortName}
                      </span>
                      {subState?.passed && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5" />
                          ¡Aprobada!
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {sub.description}
                    </p>
                  </div>

                  {!isAllowed ? (
                    <Lock className="w-5 h-5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight className={`w-5 h-5 shrink-0 ${isSelected ? 'text-amber-500' : 'text-slate-300'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Subject Content & Lesson Deck (8 cols) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border-2 border-slate-200/80 shadow-md overflow-hidden">
            {/* Subject Banner */}
            {(() => {
              const currentSub = SUBJECTS.find((s) => s.id === selectedSubject)!;
              return (
                <div
                  style={{ backgroundColor: currentSub.lightBg }}
                  className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      style={{ backgroundColor: currentSub.color }}
                      className="w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-md shrink-0"
                    >
                      {getSubjectIcon(currentSub.id)}
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Periodo {selectedPeriod} · Grado {grade}°
                      </span>
                      <h2 className="text-2xl font-black text-slate-900">{currentSub.name}</h2>
                    </div>
                  </div>

                  {/* Top Exam Trigger Button */}
                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => onStartExam(grade, selectedPeriod, selectedSubject)}
                      className="px-5 py-3 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-200 hover:shadow-lg transition-all flex items-center gap-2 transform active:scale-95"
                    >
                      <Award className="w-5 h-5" />
                      <span>¡Presentar Evaluación!</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* If approved before, show congratulations and Certificate Button */}
            {submission?.passed && certificate && (
              <div className="m-6 p-5 rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-emerald-900 text-base">
                      ¡Felicidades, {studentKey.studentName}! Ya aprobaste esta materia 🎉
                    </h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Nota alcanzada: <strong>{submission.score.toFixed(1)} / 100</strong> · Certificado oficial emitido
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onViewCertificate(certificate)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-2 transition-transform hover:scale-105 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Ver / Descargar Diploma</span>
                </button>
              </div>
            )}

            {/* If failed before, show friendly constructive note */}
            {submission && !submission.passed && (
              <div className="m-6 p-5 rounded-3xl bg-amber-50 border-2 border-amber-200 flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Smile className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-amber-900 text-sm">
                    ¡Casi lo logras! Tu nota anterior fue de {submission.score.toFixed(1)} / 100
                  </h4>
                  <p className="text-xs text-amber-800 mt-1">
                    Repasa con atención las lecciones de abajo para recordar los conceptos y vuelve a presentar tu evaluación cuando estés listo. ¡Tú puedes!
                  </p>
                </div>
              </div>
            )}

            {/* Lessons Selector Bar if more than 1 lesson */}
            {lessons.length > 1 && (
              <div className="px-6 pt-4 flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
                {lessons.map((les, idx) => (
                  <button
                    key={les.id}
                    onClick={() => setActiveLessonIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      activeLessonIndex === idx
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Lección {idx + 1}: {les.title.slice(0, 24)}...</span>
                  </button>
                ))}
              </div>
            )}

            {/* Lesson Content Area */}
            {activeLesson ? (
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                    {activeLesson.title}
                  </h3>
                  {activeLesson.summary && (
                    <p className="text-slate-600 text-sm mt-2 italic bg-amber-50/60 p-3 rounded-2xl border border-amber-100">
                      💡 {activeLesson.summary}
                    </p>
                  )}
                </div>

                {/* Lesson Video Resource if available */}
                {activeLesson.videoUrl && (
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-blue-900">Video Explicativo de Apoyo</div>
                        <div className="text-[11px] text-blue-700">Mira la explicación animada de esta lección</div>
                      </div>
                    </div>
                    <a
                      href={activeLesson.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shrink-0"
                    >
                      Abrir Video
                    </a>
                  </div>
                )}

                {/* Markdown Prose */}
                <div className="prose prose-slate max-w-none text-base leading-relaxed bg-slate-50/50 p-6 rounded-3xl border border-slate-100 whitespace-pre-line">
                  {activeLesson.contentMarkdown}
                </div>

                {/* Bottom CTA to present evaluation */}
                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 text-center sm:text-left">
                    ¿Terminaste de leer y practicar? Demuestra lo que aprendiste y obtén tu diploma oficial.
                  </div>
                  <button
                    onClick={() => onStartExam(grade, selectedPeriod, selectedSubject)}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Award className="w-5 h-5" />
                    <span>Presentar Evaluación de {SUBJECTS.find((s) => s.id === selectedSubject)?.shortName}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-semibold">No hay lecciones registradas aún para este periodo.</p>
                <button
                  onClick={() => onStartExam(grade, selectedPeriod, selectedSubject)}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Presentar Examen de Diagnóstico
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
