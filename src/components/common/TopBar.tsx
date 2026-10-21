import React from 'react';
import { AccessKey } from '../../types/lms';
import { GraduationCap, LogOut, KeyRound, Sparkles, ShieldCheck } from 'lucide-react';

interface TopBarProps {
  activeKey: AccessKey | null;
  onLogout: () => void;
  onOpenKeyModal: () => void;
  onNavigateTab?: (tab: string) => void;
  currentTab?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeKey,
  onLogout,
  onOpenKeyModal,
}) => {
  const isStudent = activeKey?.role === 'student';
  const isAdmin = activeKey?.role === 'admin';
  const isPrimary = isStudent && (activeKey?.grade || 1) <= 5;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm transition-transform hover:scale-105 ${
              isPrimary
                ? 'bg-amber-500 shadow-amber-200'
                : 'bg-slate-900 shadow-slate-200'
            }`}
          >
            {isAdmin ? (
              <ShieldCheck className="w-5 h-5" />
            ) : isPrimary ? (
              <Sparkles className="w-5 h-5 text-amber-100" />
            ) : (
              <GraduationCap className="w-5 h-5 text-blue-200" />
            )}
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              EduToken<span className="text-blue-600">LMS</span>
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation / Info */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {activeKey ? (
            <div className="flex items-center gap-3">
              <span className="text-slate-500">Sesión:</span>
              <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                {activeKey.studentName || 'Usuario'}
              </span>
              <span className="text-slate-300">·</span>
              <span
                className={`font-mono text-xs px-2 py-0.5 rounded-md font-semibold ${
                  isAdmin
                    ? 'bg-purple-100 text-purple-800'
                    : isPrimary
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-blue-100 text-blue-900'
                }`}
              >
                {isAdmin
                  ? 'ADMINISTRADOR'
                  : `GRADO ${activeKey.grade}° (${isPrimary ? 'PRIMARIA' : 'SECUNDARIA'})`}
              </span>
              <span className="text-slate-300">·</span>
              <span className="font-mono text-xs text-slate-500">
                Llave: {activeKey.keyCode}
              </span>
            </div>
          ) : (
            <span className="text-slate-500 text-xs">
              Plataforma Escolar 1° a 11° · 3 Periodos · 5 Materias Troncales
            </span>
          )}
        </div>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {activeKey ? (
            <>
              <button
                onClick={onOpenKeyModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                title="Cambiar o verificar llave"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Cambiar Llave</span>
              </button>
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors whitespace-nowrap"
                title="Salir de la sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </>
          ) : (
            <button
              onClick={onOpenKeyModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all whitespace-nowrap"
            >
              <KeyRound className="w-4 h-4" />
              Ingresar con Llave
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
