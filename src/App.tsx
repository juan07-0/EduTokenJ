import React, { useState } from 'react';
import { AccessKey, IssuedCertificate, SubjectId } from './types/lms';
import { storageService, useLMSStore } from './services/storageService';
import { TopBar } from './components/common/TopBar';
import { PrimaryDashboard } from './components/student/PrimaryDashboard';
import { SecondaryDashboard } from './components/student/SecondaryDashboard';
import { ExamView } from './components/student/ExamView';
import { CertificateModal } from './components/student/CertificateModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { KeyRound, ArrowRight, ShieldAlert, CheckCircle2, ShieldCheck, Sparkles, X } from 'lucide-react';

export default function App() {
  const store = useLMSStore();
  const activeKeyCode = store.getActiveKeyCode();
  const activeKey: AccessKey | undefined = activeKeyCode
    ? store.getKeyByCode(activeKeyCode)
    : undefined;

  const [activeCertModal, setActiveCertModal] = useState<IssuedCertificate | null>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);

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

                {/* Discrete Demo Keys Link */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setShowDemoModal(true)}
                    className="text-xs text-slate-400 hover:text-blue-600 underline underline-offset-4 transition-colors"
                  >
                    ¿Necesitas llaves de prueba? Haz clic aquí
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Demo Keys Modal (Separated & Clean) */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Llaves de Prueba Disponibles</h3>
                  <p className="text-xs text-slate-500">Haz clic en cualquiera para ingresar de inmediato</p>
                </div>
              </div>
              <button
                onClick={() => setShowDemoModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Primaria Demo */}
              <button
                onClick={() => {
                  setKeyCodeInput('SOF-1P-4921');
                  setShowDemoModal(false);
                  store.recordLogin('SOF-1P-4921');
                  store.setActiveKeyCode('SOF-1P-4921');
                }}
                className="w-full text-left p-3.5 rounded-2xl border-2 border-amber-200 bg-amber-50/70 hover:bg-amber-100/80 transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">Sofía Gómez</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">3° Primaria</span>
                    </div>
                    <span className="font-mono text-xs text-amber-800 font-semibold">SOF-1P-4921</span>
                    <p className="text-[11px] text-amber-700 mt-0.5">Modo infantil y lúdico con medallas</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-800 group-hover:translate-x-1 transition-transform">Ingresar →</span>
              </button>

              {/* Secundaria Demo */}
              <button
                onClick={() => {
                  setKeyCodeInput('ALE-2P-8832');
                  setShowDemoModal(false);
                  store.recordLogin('ALE-2P-8832');
                  store.setActiveKeyCode('ALE-2P-8832');
                }}
                className="w-full text-left p-3.5 rounded-2xl border-2 border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">Alejandro Torres</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-200 text-blue-900">9° Secundaria</span>
                    </div>
                    <span className="font-mono text-xs text-blue-800 font-semibold">ALE-2P-8832</span>
                    <p className="text-[11px] text-blue-700 mt-0.5">Modo sobrio, minimalista y académico</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-800 group-hover:translate-x-1 transition-transform">Ingresar →</span>
              </button>

              {/* Admin Demo */}
              <button
                onClick={() => {
                  setKeyCodeInput('ADM-MASTER-2026');
                  setShowDemoModal(false);
                  store.recordLogin('ADM-MASTER-2026');
                  store.setActiveKeyCode('ADM-MASTER-2026');
                }}
                className="w-full text-left p-3.5 rounded-2xl border-2 border-purple-200 bg-purple-50/70 hover:bg-purple-100/80 transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">Administrador Rectoría</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-200 text-purple-900">Control Total</span>
                    </div>
                    <span className="font-mono text-xs text-purple-800 font-semibold">ADM-MASTER-2026</span>
                    <p className="text-[11px] text-purple-700 mt-0.5">Generador de llaves, exámenes, alertas y Supabase</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-800 group-hover:translate-x-1 transition-transform">Ingresar →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Certificate PDF Modal */}
      <CertificateModal
        certificate={activeCertModal}
        onClose={() => setActiveCertModal(null)}
      />
    </div>
  );
}
