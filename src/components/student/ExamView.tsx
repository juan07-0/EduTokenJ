import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AccessKey,
  Exam,
  ExamSubmission,
  IssuedCertificate,
  SubjectId,
  AiQuestionEvaluation,
} from '../../types/lms';
import { SUBJECTS } from '../../data/mockCurriculum';
import { storageService } from '../../services/storageService';
import { evaluateOpenQuestionWithAI } from '../../services/aiEvaluator';
import {
  saveResultToSupabase,
  saveCertificateToSupabase,
} from '../../services/supabaseClient';
import {
  CheckCircle2,
  XCircle,
  Award,
  ArrowLeft,
  Sparkles,
  Download,
  RotateCcw,
  Bot,
  Brain,
  HelpCircle,
} from 'lucide-react';

interface ExamViewProps {
  studentKey: AccessKey;
  grade: number;
  period: number;
  subject: SubjectId;
  onClose: () => void;
  onViewCertificate: (cert: IssuedCertificate) => void;
}

export const ExamView: React.FC<ExamViewProps> = ({
  studentKey,
  grade,
  period,
  subject,
  onClose,
  onViewCertificate,
}) => {
  const isPrimary = grade <= 5;
  const exam: Exam = storageService.getExam(grade, period, subject);
  const subjectMeta = SUBJECTS.find((s) => s.id === subject)!;

  // Answers state: questionId -> chosen index (number) or text string
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<ExamSubmission | null>(null);
  const [issuedCert, setIssuedCert] = useState<IssuedCertificate | null>(null);
  const [evalStepMessage, setEvalStepMessage] = useState<string>('');

  const handleSelectOption = (qId: string, optionIndex: number) => {
    if (submissionResult) return;
    setAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
  };

  const handleTextAnswer = (qId: string, text: string) => {
    if (submissionResult) return;
    setAnswers((prev) => ({ ...prev, [qId]: text }));
  };

  // Submit and grade the exam
  const handleSubmitExam = async () => {
    setIsSubmitting(true);
    setEvalStepMessage('Calificando respuestas cerradas...');

    let totalPointsEarned = 0;
    let totalPointsPossible = 0;
    const aiFeedbackMap: Record<string, AiQuestionEvaluation> = {};

    // 1. Evaluate questions
    for (let i = 0; i < exam.questions.length; i++) {
      const q = exam.questions[i];
      totalPointsPossible += q.points;
      const studentAns = answers[q.id];

      if (q.type === 'multiple_choice') {
        if (studentAns !== undefined && Number(studentAns) === q.correctOptionIndex) {
          totalPointsEarned += q.points;
        }
      } else if (q.type === 'open') {
        setEvalStepMessage(
          `Evaluando pregunta abierta con IA según rúbrica (${i + 1}/${exam.questions.length})...`
        );
        const textAnswer = typeof studentAns === 'string' ? studentAns : '';

        const aiResult = await evaluateOpenQuestionWithAI({
          prompt: q.prompt,
          studentAnswer: textAnswer,
          rubricCriteria: q.rubricCriteria,
          maxPoints: q.points,
          studentGrade: grade,
          subject: subjectMeta.name,
        });

        aiFeedbackMap[q.id] = aiResult;
        totalPointsEarned += aiResult.pointsAwarded;
      }
    }

    setEvalStepMessage('Calculando puntaje final y umbral de aprobación...');

    const percentageScore = totalPointsPossible > 0
      ? (totalPointsEarned / totalPointsPossible) * 100
      : 0;

    const passed = percentageScore >= exam.passingScore;

    const submissionId = `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const submission: ExamSubmission = {
      id: submissionId,
      examId: exam.id,
      keyCode: studentKey.keyCode,
      studentName: studentKey.studentName || 'Estudiante',
      grade,
      period,
      subject,
      score: percentageScore,
      totalPointsEarned,
      totalPointsPossible,
      passed,
      answers,
      aiFeedback: aiFeedbackMap,
      submittedAt: new Date().toISOString(),
    };

    // Save to local database
    storageService.saveSubmission(submission);
    // Asynchronously sync to Supabase if connected
    saveResultToSupabase(submission).catch((e) => console.log('Supabase result sync note:', e));

    // If passed, issue and register certificate permanently
    if (passed) {
      const settings = storageService.getSettings();
      const codeSuffix = Math.floor(1000 + Math.random() * 9000);
      const studentInitials = (studentKey.studentName || 'EST')
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 3);

      const verificationCode = `CERT-${new Date().getFullYear()}-${studentInitials}-G${grade}P${period}-${codeSuffix}`;

      const certificate: IssuedCertificate = {
        id: `cert-${Date.now()}`,
        verificationCode,
        submissionId,
        studentName: studentKey.studentName || 'Estudiante',
        grade,
        period,
        subject,
        subjectName: subjectMeta.name,
        score: percentageScore,
        institutionName: settings.name,
        rectorName: settings.rectorName,
        issuedAt: new Date().toISOString(),
      };

      storageService.saveCertificate(certificate);
      // Asynchronously sync certificate to Supabase if connected
      saveCertificateToSupabase(certificate).catch((e) => console.log('Supabase cert sync note:', e));
      setIssuedCert(certificate);

      // Trigger Celebration Confetti!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563EB', '#F59E0B', '#10B981', '#EC4899'],
        });
      } catch (e) {
        console.log('Confetti effect:', e);
      }
    }

    setSubmissionResult(submission);
    setIsSubmitting(false);
  };

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount >= exam.questions.length;

  return (
    <div className={`min-h-screen pb-20 ${isPrimary ? 'bg-[#FFFDF7]' : 'bg-slate-50'}`}>
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Contenido</span>
          </button>

          <div className="text-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              {subjectMeta.shortName} · Periodo {period} · Grado {grade}°
            </span>
            <span className="text-sm font-bold text-slate-900 truncate max-w-xs block">
              {exam.title}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 block">Umbral de Aprobación</span>
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              {exam.passingScore}%
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Banner with Result if already submitted */}
        {submissionResult && (
          <div
            className={`p-6 sm:p-8 rounded-3xl border-2 transition-all shadow-lg ${
              submissionResult.passed
                ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 border-emerald-300 text-emerald-950'
                : 'bg-gradient-to-br from-amber-50 via-rose-50 to-amber-100/50 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                    submissionResult.passed ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                  }`}
                >
                  {submissionResult.passed ? <Award className="w-9 h-9" /> : <RotateCcw className="w-9 h-9" />}
                </div>

                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        submissionResult.passed
                          ? 'bg-emerald-200 text-emerald-800'
                          : 'bg-amber-200 text-amber-800'
                      }`}
                    >
                      {submissionResult.passed ? '¡Aprobado con Éxito!' : 'Necesita Refuerzo'}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black">
                    {submissionResult.passed
                      ? `¡Felicitaciones, ${studentKey.studentName}! 🎉`
                      : `¡Buen esfuerzo, ${studentKey.studentName}!`}
                  </h3>

                  <p className="text-xs sm:text-sm mt-1 opacity-90">
                    {submissionResult.passed
                      ? 'Has demostrado dominio satisfactorio de los logros curriculares de este periodo.'
                      : 'No alcanzaste el porcentaje mínimo requerido (70%). Te recomendamos repasar los contenidos.'}
                  </p>
                </div>
              </div>

              {/* Score Metric */}
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/60 text-center shrink-0 min-w-[130px]">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Calificación
                </span>
                <span
                  className={`text-3xl font-black font-mono tabular-nums ${
                    submissionResult.passed ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {submissionResult.score.toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Mínimo: {exam.passingScore}%
                </span>
              </div>
            </div>

            {/* Action Buttons for Result */}
            <div className="mt-6 pt-6 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3">
              {submissionResult.passed && issuedCert && (
                <button
                  onClick={() => onViewCertificate(issuedCert)}
                  className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Certificado Oficial (PDF)</span>
                </button>
              )}

              {!submissionResult.passed && (
                <button
                  onClick={() => {
                    setSubmissionResult(null);
                    setAnswers({});
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Intentar de Nuevo</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/60 hover:bg-white rounded-lg border border-slate-200"
              >
                Cerrar y Regresar al Panel
              </button>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-6">
          {exam.questions.map((q, idx) => {
            const chosenAnswer = answers[q.id];
            const isAnswered = chosenAnswer !== undefined && chosenAnswer !== '';
            const openFeedback = submissionResult?.aiFeedback?.[q.id];

            return (
              <div
                key={q.id}
                className={`p-6 sm:p-7 rounded-3xl border-2 transition-all bg-white shadow-sm ${
                  isPrimary ? 'border-amber-100 hover:border-amber-200' : 'border-slate-200'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                        isPrimary
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-900 text-white'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {q.type === 'multiple_choice'
                          ? 'Pregunta Cerrada (Opción Múltiple)'
                          : 'Pregunta Abierta (Evaluación con IA)'}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {q.points} Puntos
                  </span>
                </div>

                {/* Question Prompt */}
                <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-5 leading-snug">
                  {q.prompt}
                </h4>

                {/* Multiple Choice Options */}
                {q.type === 'multiple_choice' && q.options && (
                  <div className="space-y-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = chosenAnswer === optIdx;
                      const isCorrect = q.correctOptionIndex === optIdx;

                      // Colors if submitted
                      let itemBorder = 'border-slate-200 hover:border-slate-300';
                      let itemBg = 'bg-slate-50 hover:bg-slate-100';

                      if (submissionResult) {
                        if (isCorrect) {
                          itemBorder = 'border-emerald-500 ring-2 ring-emerald-500';
                          itemBg = 'bg-emerald-50 text-emerald-950 font-semibold';
                        } else if (isSelected && !isCorrect) {
                          itemBorder = 'border-red-400';
                          itemBg = 'bg-red-50 text-red-900 line-through';
                        } else {
                          itemBg = 'bg-slate-50 opacity-60';
                        }
                      } else if (isSelected) {
                        itemBorder = isPrimary
                          ? 'border-amber-500 ring-2 ring-amber-400'
                          : 'border-blue-600 ring-2 ring-blue-500';
                        itemBg = isPrimary ? 'bg-amber-50 text-amber-950' : 'bg-blue-50 text-blue-950';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={Boolean(submissionResult)}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`w-full p-3.5 rounded-2xl border-2 text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${itemBorder} ${itemBg}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-white border border-slate-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 text-slate-600">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>

                          {submissionResult && isCorrect && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          )}
                          {submissionResult && isSelected && !isCorrect && (
                            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Open Ended Textarea */}
                {q.type === 'open' && (
                  <div className="space-y-3">
                    <div className="relative">
                      <textarea
                        rows={4}
                        disabled={Boolean(submissionResult)}
                        value={typeof chosenAnswer === 'string' ? chosenAnswer : ''}
                        onChange={(e) => handleTextAnswer(q.id, e.target.value)}
                        placeholder="Redacta aquí tu respuesta reflexiva con tus propias palabras..."
                        className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none text-sm transition-all bg-slate-50 placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-600"
                      />
                      <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Bot className="w-3.5 h-3.5 text-blue-500" />
                          Evaluación asistida por IA con rúbrica pedagógica
                        </span>
                        <span>
                          {typeof chosenAnswer === 'string' ? chosenAnswer.trim().split(/\s+/).filter(Boolean).length : 0} palabras
                        </span>
                      </div>
                    </div>

                    {/* Teacher Rubric Info Pill */}
                    {q.rubricCriteria && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2">
                        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-700">Rúbrica del Profesor: </strong>
                          {q.rubricCriteria}
                        </div>
                      </div>
                    )}

                    {/* AI Feedback Display if submitted */}
                    {openFeedback && (
                      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1.5 text-blue-900">
                            <Brain className="w-4 h-4 text-blue-600" />
                            Calificación IA Obtenida:
                          </span>
                          <span className="font-mono font-bold text-sm text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                            {openFeedback.pointsAwarded} / {q.points} Puntos
                          </span>
                        </div>
                        <p className="text-blue-900 leading-relaxed font-medium">
                          {openFeedback.feedback}
                        </p>
                        {openFeedback.criteriaAnalysis && (
                          <div className="text-[11px] text-blue-700 italic border-t border-blue-200/60 pt-1.5">
                            Análisis de rúbrica: {openFeedback.criteriaAnalysis}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Submission Action Bar */}
        {!submissionResult && (
          <div className="p-6 bg-white rounded-3xl border-2 border-slate-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600 text-center sm:text-left">
              Has contestado <strong>{answeredCount}</strong> de <strong>{exam.questions.length}</strong> preguntas.
              {!isComplete && (
                <span className="text-amber-600 block mt-0.5">
                  Completa todas las preguntas para un mejor resultado.
                </span>
              )}
            </div>

            <button
              onClick={handleSubmitExam}
              disabled={isSubmitting || answeredCount === 0}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${
                isSubmitting
                  ? 'bg-slate-400 cursor-wait'
                  : isPrimary
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-200'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{evalStepMessage || 'Procesando evaluación...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Finalizar y Calificar Examen</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
