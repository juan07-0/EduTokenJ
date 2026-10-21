import React, { useState } from 'react';
import { IssuedCertificate } from '../../types/lms';
import { storageService } from '../../services/storageService';
import { downloadCertificatePdf } from '../../services/certificatePdf';
import { Download, Award, Check, Copy, ExternalLink, ShieldCheck } from 'lucide-react';

interface CertificateModalProps {
  certificate: IssuedCertificate | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!certificate) return null;

  const settings = storageService.getSettings();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(certificate.verificationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadCertificatePdf(certificate, settings);
  };

  const dateFormatted = new Date(certificate.issuedAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Control Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm tracking-wide">
              Acreditación Académica Oficial · Documento Verificable
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-transform hover:scale-105 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Descargar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-lg font-bold p-1 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Certificate Visual Canvas Simulation */}
        <div className="p-6 sm:p-10 bg-[#FFFDF9] overflow-x-auto">
          <div className="min-w-[680px] border-4 border-double border-amber-600/80 p-8 sm:p-12 rounded-2xl relative shadow-inner bg-gradient-to-b from-[#FFFDF9] via-[#FFFDF5] to-[#FFFBF0]">
            {/* Watermark Crest */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <span className="text-[180px] font-black">🎓</span>
            </div>

            {/* Header */}
            <div className="text-center space-y-1 relative z-10">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center text-3xl shadow-sm mb-3 border border-amber-200">
                {settings.logoEmoji || '🎓'}
              </div>
              <h2 className="text-2xl font-black tracking-tight text-blue-950 uppercase">
                {settings.name}
              </h2>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                SISTEMA INTEGRAL DE CERTIFICACIÓN ACADÉMICA Y VALIDACIÓN CURRICULAR
              </p>
            </div>

            {/* Title */}
            <div className="text-center my-6 relative z-10">
              <div className="w-24 h-0.5 bg-amber-500 mx-auto mb-3" />
              <h3 className="font-serif italic font-extrabold text-3xl text-slate-900 tracking-wide">
                Certificado de Excelencia
              </h3>
              <div className="text-amber-500 text-sm tracking-widest mt-1">★ ★ ★</div>
            </div>

            {/* Narrative */}
            <div className="text-center space-y-4 max-w-xl mx-auto relative z-10 text-slate-700">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Se otorga el presente reconocimiento de acreditación académica a:
              </p>

              <div className="border-b-2 border-slate-300 pb-2">
                <span className="text-2xl sm:text-3xl font-black text-blue-900 uppercase tracking-wide">
                  {certificate.studentName}
                </span>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed">
                Por haber cursado, demostrado suficiencia y aprobado satisfactoriamente los contenidos y competencias evaluativas del{' '}
                <strong>Grado {certificate.grade}°</strong> de Educación{' '}
                {certificate.grade <= 5 ? 'Básica Primaria' : 'Básica Secundaria y Media'}, en la asignatura de:
              </p>

              <div className="py-2">
                <span className="text-lg sm:text-xl font-extrabold text-slate-950 uppercase tracking-wider bg-amber-100/60 px-4 py-1 rounded-xl border border-amber-200">
                  {certificate.subjectName} — Periodo {certificate.period}
                </span>
              </div>

              <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold text-xs">
                CALIFICACIÓN FINAL OBTENIDA: {certificate.score.toFixed(1)} / 100 PUNTOS
              </div>

              <p className="text-[11px] text-slate-500 italic mt-3 max-w-lg mx-auto">
                {settings.legalText}
              </p>
            </div>

            {/* Footer with Verification and Signature */}
            <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 items-end relative z-10">
              {/* Verification Code Box */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Código Oficial de Verificación</span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-900 tracking-wider">
                  {certificate.verificationCode}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Fecha de expedición: {dateFormatted}
                </div>
              </div>

              {/* Digital Signature */}
              <div className="text-center">
                <div className="w-48 h-0.5 bg-slate-800 mx-auto mb-2" />
                <div className="font-bold text-xs text-slate-900 uppercase">
                  {settings.rectorName}
                </div>
                <div className="text-[11px] text-slate-600">{settings.rectorTitle}</div>
                <div className="text-[10px] text-slate-400 italic mt-0.5">
                  {settings.signatureText}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Código:</span>
            <code className="font-mono font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">
              {certificate.verificationCode}
            </code>
            <button
              onClick={handleCopyCode}
              className="p-1 text-slate-500 hover:text-slate-800 transition-colors"
              title="Copiar código de verificación"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Documento PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-medium border border-slate-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
