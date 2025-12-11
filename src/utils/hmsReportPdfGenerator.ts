import jsPDF from 'jspdf';

interface HMSReport {
  id: string;
  report_number: string;
  report_type: string;
  title: string;
  summary: string;
  start_date: string;
  end_date: string;
  total_incidents: number;
  safety_incidents: number;
  environment_incidents: number;
  health_incidents: number;
  deviations: number;
  compliance_score: number;
  ai_insights?: string;
  recommendations?: string;
  generated_by: string;
  status: string;
  created_at: string;
}

interface ReportDetails {
  incidents?: any[];
  training?: any[];
  riskAssessments?: any[];
}

export async function generateHMSReportPDF(report: HMSReport, details: ReportDetails) {
  const doc = new jsPDF();
  let yPos = 20;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const maxWidth = pageWidth - 2 * margin;

  // دالة للتحقق من الحاجة لصفحة جديدة
  const checkNewPage = (requiredSpace: number = 20) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  // دالة لإضافة نص متعدد الأسطر
  const addWrappedText = (text: string, x: number, fontSize: number = 10, maxWidth: number = pageWidth - 2 * margin) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      checkNewPage();
      doc.text(line, x, yPos);
      yPos += fontSize * 0.5;
    });
  };

  // === رأس الصفحة ===
  doc.setFillColor(0, 102, 204);
  doc.rect(0, 0, pageWidth, 50, 'F');

  // العنوان الرئيسي
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(report.title, margin, 25);

  // العنوان الفرعي
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Rapport Nr: ${report.report_number}`, margin, 35);

  // اسم الشركة والتاريخ
  doc.setFontSize(10);
  doc.text('Amigos la Kokido AS', margin, 43);

  const generatedDate = new Date(report.created_at).toLocaleDateString('nb-NO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Generert: ${generatedDate}`, pageWidth - margin, 43, { align: 'right' });

  yPos = 60;

  // === معلومات التقرير ===
  doc.setFillColor(240, 248, 255);
  doc.rect(margin, yPos, maxWidth, 35, 'F');

  doc.setTextColor(0, 102, 204);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Rapportinformasjon', margin + 5, yPos + 8);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const reportInfo = [
    `Type: ${getReportTypeLabel(report.report_type)}`,
    `Periode: ${new Date(report.start_date).toLocaleDateString('nb-NO')} til ${new Date(report.end_date).toLocaleDateString('nb-NO')}`,
    `Status: ${report.status === 'final' ? 'Ferdig' : 'Utkast'}`,
    `Etterlevelse: ${report.compliance_score}%`
  ];

  reportInfo.forEach((info, index) => {
    doc.text(info, margin + 5, yPos + 18 + (index * 5));
  });

  yPos += 45;

  // === الملخص ===
  checkNewPage(30);
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin, yPos, maxWidth, 'auto', 'S');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 102, 204);
  doc.text('Sammendrag', margin + 5, yPos + 8);

  yPos += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  addWrappedText(report.summary, margin + 5, 10, maxWidth - 10);

  yPos += 10;

  // === الإحصائيات ===
  checkNewPage(50);
  doc.setFillColor(240, 248, 255);
  doc.rect(margin, yPos, maxWidth, 40, 'F');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 102, 204);
  doc.text('Statistikk', margin + 5, yPos + 8);

  yPos += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  const stats = [
    { label: 'Totalt antall hendelser', value: report.total_incidents, color: [0, 0, 0] },
    { label: 'Sikkerhetshendelser', value: report.safety_incidents, color: [220, 53, 69] },
    { label: 'Miljøhendelser', value: report.environment_incidents, color: [0, 153, 76] },
    { label: 'Helsehendelser', value: report.health_incidents, color: [0, 102, 204] },
    { label: 'Avvik', value: report.deviations, color: [255, 153, 0] }
  ];

  stats.forEach((stat, index) => {
    const x = margin + 5 + (index % 2) * (maxWidth / 2);
    const y = yPos + Math.floor(index / 2) * 10;

    doc.setTextColor(100, 100, 100);
    doc.text(`${stat.label}:`, x, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
    doc.text(stat.value.toString(), x + 70, y);
    doc.setFont('helvetica', 'normal');
  });

  yPos += 35;

  // === التحليل ===
  if (report.ai_insights) {
    checkNewPage(30);

    doc.setFillColor(250, 250, 250);
    doc.rect(margin, yPos, maxWidth, 'auto', 'F');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text('Analyse', margin + 5, yPos + 8);

    yPos += 15;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);

    // تنظيف النص من الأحرف الخاصة
    const cleanInsights = report.ai_insights
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '  ');

    const insightLines = cleanInsights.split('\n');
    insightLines.forEach((line) => {
      if (line.trim()) {
        checkNewPage();
        if (line.startsWith('•')) {
          doc.setFont('helvetica', 'bold');
          doc.text('•', margin + 5, yPos);
          doc.setFont('helvetica', 'normal');
          const textLines = doc.splitTextToSize(line.substring(1).trim(), maxWidth - 15);
          textLines.forEach((textLine: string) => {
            doc.text(textLine, margin + 10, yPos);
            yPos += 5;
          });
        } else {
          addWrappedText(line, margin + 5, 9, maxWidth - 10);
        }
        yPos += 2;
      }
    });

    yPos += 10;
  }

  // === التوصيات ===
  if (report.recommendations) {
    checkNewPage(30);

    doc.setFillColor(240, 255, 240);
    doc.rect(margin, yPos, maxWidth, 'auto', 'F');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 153, 76);
    doc.text('Anbefalinger', margin + 5, yPos + 8);

    yPos += 15;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 100, 0);

    const cleanRecommendations = report.recommendations
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '  ');

    const recLines = cleanRecommendations.split('\n');
    recLines.forEach((line) => {
      if (line.trim()) {
        checkNewPage();
        if (line.startsWith('•')) {
          doc.text('•', margin + 5, yPos);
          const textLines = doc.splitTextToSize(line.substring(1).trim(), maxWidth - 15);
          textLines.forEach((textLine: string) => {
            doc.text(textLine, margin + 10, yPos);
            yPos += 5;
          });
        } else {
          addWrappedText(line, margin + 5, 9, maxWidth - 10);
        }
        yPos += 2;
      }
    });

    yPos += 10;
  }

  // === الحوادث التفصيلية ===
  if (details.incidents && details.incidents.length > 0) {
    checkNewPage(30);

    doc.setFillColor(255, 240, 240);
    doc.rect(margin, yPos, maxWidth, 'auto', 'F');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 53, 69);
    doc.text('Detaljert hendelseslogg', margin + 5, yPos + 8);

    yPos += 15;

    details.incidents.forEach((incident, index) => {
      checkNewPage(25);

      doc.setFillColor(250, 250, 250);
      doc.rect(margin + 5, yPos, maxWidth - 10, 20, 'F');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`${index + 1}. ${incident.title}`, margin + 8, yPos + 6);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Dato: ${new Date(incident.incident_date).toLocaleDateString('nb-NO')}`, margin + 8, yPos + 11);
      doc.text(`Alvorlighetsgrad: ${incident.severity}`, margin + 8, yPos + 16);

      yPos += 25;
    });
  }

  // === التذييل ===
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Side ${i} av ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      'Amigos la Kokido AS - HMS Rapport',
      margin,
      pageHeight - 10
    );
  }

  // حفظ الملف
  const fileName = `hms_rapport_${report.report_number.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
  doc.save(fileName);
}

function getReportTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    daily: 'Daglig rapport',
    weekly: 'Ukentlig rapport',
    monthly: 'Månedlig rapport',
    quarterly: 'Kvartalsrapport',
    annual: 'Årsrapport',
    custom: 'Tilpasset rapport',
  };
  return labels[type] || type;
}
