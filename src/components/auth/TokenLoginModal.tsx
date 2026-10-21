import React, { useState } from 'react';
import { AccessKey } from '../../types/lms';
import { storageService } from '../../services/storageService';
import { KeyRound, ShieldAlert, Sparkles, UserCheck, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface TokenLoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (key: AccessKey) => void;
  canDismiss?: boolean;
}

export const TokenLoginModal: React.FC<TokenLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  canDismiss = true,
}) => {
  const [keyCodeInput, setKeyCodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (codeToTest?: string) => {
    const raw = codeToTest || keyCodeInput;
    const clean = raw.trim().toUpperCase();

    if (!clean) {
      setErrorMsg('Por favor escribe tu llave de acceso.');
      return;
    }

    const found = storageService.getKeyByCode(clean);
    if (!found) {
      setErrorMsg(`La llave "${clean}" no fue encontrada en el sistema escolar. Verifica e intenta nuevamente.`);
      return;
    }

    if (!found.isActive) {
      setErrorMsg(`La llave "${clean}" está temporalmente inactiva o deshabilitada por la administración.`);
      return;
    }

    storageService.recordLogin(clean);
    storageService.setActiveKeyCode(clean);
    setErrorMsg(null);
    onSuccess(found);
  };

  const demoStudents = [
    {
      code: 'SOF-1P-4921',
      name: 'Sofía Gómez',
      grade: '3° Primaria',
      tag: 'Modo Lúdico (1°-5°)',
      color: 'border-amber-300 bg-amber-50 hover:bg-amber-100/80 text-amber-900',
      badge: 'bg-amber-500 text-white',
    },
    {
      code: 'ALE-2P-8832',
      name: 'Alejandro Torres',
      grade: '9° Secundaria',
      tag: 'Modo Académico (6°-11°)',
      color: 'border-blue-300 bg-blue-50 hover:bg-blue-100/80 text-blue-900',
      badge: 'bg-blue-600 text-white',
    },
    {
      code: 'ADM-MASTER-2026',
      name: 'Prof. Carlos Mendoza',
      grade: 'Admin General',
      tag: 'Panel Rector / Gestión',
      color: 'border-purple-300 bg-purple-50 hover:bg-purple-100/80 text-purple-900',
      badge: 'bg-purple-600 text-white',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header accent strip */}
        <div className="h-3 bg-gradient-to-r from-amber-400 via-blue-500 to-indigo-600" />

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Acceso a la Plataforma Educativa
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Ingresa tu llave única asignada por tu institución o docente
                </p>
              </div>
            </div>
            {canDismiss && onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="keyCodeInput"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2"
              >
                Llave de Acceso (Token)
              </label>
              <div className="relative">
                <input
                  id="keyCodeInput"
                  type="text"
                  value={keyCodeInput}
                  onChange={(e) => {
                    setKeyCodeInput(e.target.value.toUpperCase());
                    setErrorMsg(null);
                  }}
                  placeholder="Ej: SOF-1P-4921 o ADM-MASTER-2026"
                  className="w-full px-4 py-3.5 text-base sm:text-lg font-mono tracking-wider font-semibold bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-400 uppercase"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>Ingresar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs sm:text-sm">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Error de autenticación: </span>
                  {errorMsg}
                </div>
              </div>
            )}
          </form>

          {/* Demo Keys Quick Access */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Llaves de Demostración Inmediata
              </span>
              <span className="text-[11px] text-slate-400">Haz clic para probar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {demoStudents.map((demo) => (
                <button
                  key={demo.code}
                  type="button"
                  onClick={() => {
                    setKeyCodeInput(demo.code);
                    handleLogin(demo.code);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all hover:scale-[1.02] flex flex-col justify-between ${demo.color}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${demo.badge}`}>
                      {demo.grade}
                    </span>
                    {demo.code.startsWith('ADM') ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </div>
                  <div className="font-bold text-xs truncate">{demo.name}</div>
                  <div className="font-mono text-[11px] font-semibold opacity-75 mt-1">
                    {demo.code}
                  </div>
                  <div className="text-[10px] opacity-70 mt-1">{demo.tag}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy & Zero-Password note */}
          <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Acceso sin contraseñas · Privacidad protegida · Cero costo de servidor</span>
          </div>
        </div>
      </div>
    </div>
  );
};
