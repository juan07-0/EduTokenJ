import React, { useState } from 'react';
import { AccessKey, IssuedCertificate, SubjectId } from './types/lms';
import { storageService, useLMSStore } from './services/storageService';
import { TopBar } from './components/common/TopBar';
import { PrimaryDashboard } from './components/student/PrimaryDashboard';
import { SecondaryDashboard } from './components/student/SecondaryDashboard';
import { ExamView } from './components/student/ExamView';
import { CertificateModal } from './components/student/CertificateModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { KeyRound, ArrowRight, ShieldAlert, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function App() {
  const store = useLMSStore();
  const activeKeyCode = store.getActiveKeyCode();
  const activeKey: AccessKey | undefined = activeKeyCode
    ? store.getKeyByCode(activeKeyCode)
    : undefined;

  const [activeCertModal, setActiveCertModal] = useState<IssuedCertificate | null>(null);

  // Login form state (used when no session is active)
  const [keyCodeInput, setKeyCodeInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Exam overlay state
  const [activeExamParams, setActiveExamParams] = useState<{
    grade: number;
    period: number;
    subject: SubjectId;
  } | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = keyCodeInput.trim().toUpperCase();

    if (!clean) {
      setLoginError('Por favor escribe tu llave de acceso.');
      return;
    }

    const found = store.getKeyByCode(clean);
    if (!found) {
      setLoginError(`La llave "${clean}" no fue encontrada en el sistema. Verifica e intenta nuevamente.`);
      return;
    }

    if (!found.isActive) {
      setLoginError(`La llave "${clean}" está temporalmente inactiva o deshabilitada.`);
      return;
    }

    store.recordLogin(clean);
    store.setActiveKeyCode(clean);
    setLoginError(null);
    setKeyCodeInput('');
    setActiveExamParams(null);
  };

  const handleLogout = () => {
    store.setActiveKeyCode(null);
    setActiveExamParams(null);
    setKeyCodeInput('');
    setLoginError(null);
  };

  const handleStartExam = (grade: number, period: number, subject: SubjectId) => {
    setActiveExamParams({ grade, period, subject });
  };

  const handleCloseExam = () => {
    setActiveExamParams(null);
  };

  const handleViewCertificate = (cert: IssuedCertificate) => {
    setActiveCertModal(cert);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
      {/* 3-Zone Top Navigation Bar */}
      <TopBar
        activeKey={activeKey || null}
        onLogout={handleLogout}
        onOpenKeyModal={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* If taking an exam, show ExamView */}
        {activeKey && activeExamParams && (
          <ExamView
            studentKey={activeKey}
            grade={activeExamParams.grade}
            period={activeExamParams.period}
            subject={activeExamParams.subject}
            onClose={handleCloseExam}
            onViewCertificate={handleViewCertificate}
          />
        )}

        {/* If not taking an exam, show appropriate Dashboard based on Role & Grade */}
        {activeKey && !activeExamParams && (
          <>
            {activeKey.role === 'admin' && (
              <AdminDashboard
                currentAdminKey={activeKey}
                onLogout={handleLogout}
                onSwitchToStudentView={(studentKey) => {
                  store.setActiveKeyCode(studentKey.keyCode);
                }}
              />
            )}

            {activeKey.role === 'student' && (activeKey.grade || 1) <= 5 && (
              <PrimaryDashboard
                studentKey={activeKey}
                onStartExam={handleStartExam}
                onViewCertificate={handleViewCertificate}
              />
            )}

            {activeKey.role === 'student' && (activeKey.grade || 1) > 5 && (
              <SecondaryDashboard
                studentKey={activeKey}
                onStartExam={handleStartExam}
                onViewCertificate={handleViewCertificate}
              />
            )}
          </>
        )}

        {/* ================= CLEAN LOGIN SCREEN (WHEN NO ACTIVE KEY) ================= */}
        {!activeKey && (
          <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-slate-50 via-slate-100/50 to-blue-50/20">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
              {/* Accent top gradient strip */}
              <div className="h-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

              <div className="p-8 sm:p-10 space-y-6">
                {/* Logo & Header */}
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                    <KeyRound className="w-7 h-7" />
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    EduToken <span className="text-blue-600">LMS</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Portal de acceso académico sin contraseñas
                  </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="tokenInput"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
                    >
                      Llave de Acceso (Token)
                    </label>

                    <div className="relative">
                      <input
                        id="tokenInput"
                        type="text"
                        autoFocus
                        value={keyCodeInput}
                        onChange={(e) => {
                          setKeyCodeInput(e.target.value.toUpperCase());
                          setLoginError(null);
                        }}
                        placeholder="Ej: SOF-1P-4921 o ADM-MASTER-2026"
                        className="w-full px-4 py-3.5 text-base font-mono font-bold tracking-wider uppercase rounded-2xl border-2 border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all bg-slate-50 placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal"
                      />
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Error: </strong>
                        <span>{loginError}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-blue-200 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>Ingresar a mi Aula</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Security Footer note */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-xs text-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Acceso seguro protegido · Privacidad garantizada</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Official Certificate PDF Modal */}
      <CertificateModal
        certificate={activeCertModal}
        onClose={() => setActiveCertModal(null)}
      />
    </div>
  );
}
