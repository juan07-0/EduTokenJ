import { jsPDF } from 'jspdf';
import { InstitutionSettings, IssuedCertificate } from '../types/lms';

export function generateCertificatePdf(cert: IssuedCertificate, settings: InstitutionSettings): jsPDF {
  // A4 Landscape: 297mm x 210mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;

  // Background
  doc.setFillColor(254, 253, 249);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Double Decorative Border
  doc.setDrawColor(30, 58, 138); // Deep Navy
  doc.setLineWidth(2);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  doc.setDrawColor(217, 119, 6); // Gold / Amber
  doc.setLineWidth(0.8);
  doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

  // Corner Ornaments
  const corners = [
    [15, 15],
    [pageWidth - 15, 15],
    [15, pageHeight - 15],
    [pageWidth - 15, pageHeight - 15],
  ];
  doc.setFillColor(217, 119, 6);
  corners.forEach(([x, y]) => {
    doc.circle(x, y, 1.8, 'F');
  });

  // Institution Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(30, 58, 138);
  doc.text(settings.name.toUpperCase(), pageWidth / 2, 32, { align: 'center' });

  // Subtitle / Accreditation
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('SISTEMA INTEGRAL DE CERTIFICACIÓN ACADÉMICA Y VALIDACIÓN CURRICULAR', pageWidth / 2, 39, {
    align: 'center',
  });

  // Certificate Title
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(30);
  doc.setTextColor(15, 23, 42);
  doc.text('CERTIFICADO DE EXCELENCIA', pageWidth / 2, 56, { align: 'center' });

  // Divider Line with Star
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.6);
  doc.line(pageWidth / 2 - 60, 62, pageWidth / 2 + 60, 62);
  doc.setFontSize(14);
  doc.setTextColor(217, 119, 6);
  doc.text('★ ★ ★', pageWidth / 2, 64, { align: 'center' });

  // Conferment text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105);
  doc.text('Se otorga el presente reconocimiento de acreditación académica a:', pageWidth / 2, 75, {
    align: 'center',
  });

  // Student Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(30, 58, 138);
  doc.text(cert.studentName.toUpperCase(), pageWidth / 2, 90, { align: 'center' });

  // Underline for student name
  const nameWidth = Math.min(doc.getTextWidth(cert.studentName.toUpperCase()) + 20, 180);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - nameWidth / 2, 93, pageWidth / 2 + nameWidth / 2, 93);

  // Body Narrative
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(51, 65, 85);

  const narrativeText =
    `Por haber cursado, demostrado suficiencia y aprobado satisfactoriamente los contenidos y competencias evaluativas del Grado ${cert.grade}° de Educación ${cert.grade <= 5 ? 'Básica Primaria' : 'Básica Secundaria y Media'}, en la asignatura de:`;
  doc.text(narrativeText, pageWidth / 2, 104, { align: 'center', maxWidth: 220 });

  // Subject Name & Period
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(`${cert.subjectName.toUpperCase()} — PERIODO ${cert.period}`, pageWidth / 2, 118, {
    align: 'center',
  });

  // Score Badge Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(5, 150, 105); // Emerald Green
  doc.text(`CALIFICACIÓN FINAL OBTENIDA: ${cert.score.toFixed(1)} / 100 PUNTOS`, pageWidth / 2, 128, {
    align: 'center',
  });

  // Legal Text
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(settings.legalText, pageWidth / 2, 140, { align: 'center', maxWidth: 220 });

  // Verification Box (Bottom Left)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(25, 156, 95, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 58, 138);
  doc.text('CÓDIGO OFICIAL DE VERIFICACIÓN:', 29, 163);

  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(cert.verificationCode, 29, 171);

  const dateStr = new Date(cert.issuedAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Fecha de Emisión: ${dateStr}`, 29, 179);

  // Signatures Section (Bottom Right)
  const sigX = pageWidth - 75;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.6);
  doc.line(sigX - 45, 172, sigX + 45, 172);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(settings.rectorName, sigX, 178, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(settings.rectorTitle, sigX, 183, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(settings.signatureText, sigX, 187, { align: 'center' });

  return doc;
}

export function downloadCertificatePdf(cert: IssuedCertificate, settings: InstitutionSettings): void {
  const doc = generateCertificatePdf(cert, settings);
  const cleanName = cert.studentName.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanSub = cert.subject.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Certificado_${cleanName}_${cleanSub}_P${cert.period}.pdf`);
}
