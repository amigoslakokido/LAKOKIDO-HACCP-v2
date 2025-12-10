import jsPDF from 'jspdf';

interface PDFConfig {
  title: string;
  subtitle?: string;
  companyName?: string;
  generatedDate?: Date;
}

interface Section {
  title: string;
  content: string | string[];
  type?: 'text' | 'list' | 'table';
  color?: string;
}

interface TableData {
  headers: string[];
  rows: string[][];
}

export class HMSPdfGenerator {
  private doc: jsPDF;
  private yPos: number;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private readonly primaryColor = [0, 102, 204];
  private readonly secondaryColor = [51, 51, 51];
  private readonly accentColor = [0, 153, 76];
  private readonly warningColor = [255, 153, 0];
  private readonly dangerColor = [220, 53, 69];

  constructor() {
    this.doc = new jsPDF();
    this.yPos = 20;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.margin = 15;
  }

  addHeader(config: PDFConfig) {
    this.doc.setFillColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
    this.doc.rect(0, 0, this.pageWidth, 45, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(22);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(config.title, this.margin, 20);

    if (config.subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(config.subtitle, this.margin, 28);
    }

    if (config.companyName) {
      this.doc.setFontSize(10);
      this.doc.text(config.companyName, this.margin, 36);
    }

    this.doc.setTextColor(100, 100, 100);
    this.doc.setFontSize(9);
    const dateText = `Generert: ${(config.generatedDate || new Date()).toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`;
    this.doc.text(dateText, this.pageWidth - this.margin, 36, { align: 'right' });

    this.yPos = 55;
  }

  addFooter() {
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(150, 150, 150);
      this.doc.text(
        `Side ${i} av ${pageCount}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );
    }
  }

  addSectionTitle(title: string, color?: 'primary' | 'success' | 'warning' | 'danger') {
    this.checkPageBreak(15);

    let bgColor = this.primaryColor;
    if (color === 'success') bgColor = this.accentColor;
    if (color === 'warning') bgColor = this.warningColor;
    if (color === 'danger') bgColor = this.dangerColor;

    this.doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    this.doc.roundedRect(this.margin, this.yPos, this.pageWidth - 2 * this.margin, 10, 2, 2, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin + 3, this.yPos + 7);

    this.yPos += 15;
    this.doc.setTextColor(0, 0, 0);
  }

  addText(text: string, options?: { bold?: boolean; fontSize?: number; color?: number[] }) {
    this.checkPageBreak(8);

    const fontSize = options?.fontSize || 10;
    const isBold = options?.bold || false;
    const color = options?.color || [0, 0, 0];

    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    this.doc.setTextColor(color[0], color[1], color[2]);

    const maxWidth = this.pageWidth - 2 * this.margin;
    const lines = this.doc.splitTextToSize(text, maxWidth);

    lines.forEach((line: string) => {
      this.checkPageBreak(6);
      this.doc.text(line, this.margin, this.yPos);
      this.yPos += 6;
    });

    this.yPos += 2;
  }

  addBulletList(items: string[]) {
    this.checkPageBreak(8 * items.length);

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);

    items.forEach(item => {
      this.checkPageBreak(8);

      this.doc.setFillColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
      this.doc.circle(this.margin + 2, this.yPos - 1.5, 1, 'F');

      const maxWidth = this.pageWidth - 2 * this.margin - 8;
      const lines = this.doc.splitTextToSize(item, maxWidth);

      lines.forEach((line: string, index: number) => {
        this.checkPageBreak(6);
        this.doc.text(line, this.margin + 6, this.yPos);
        this.yPos += 6;
      });

      this.yPos += 2;
    });
  }

  addNumberedList(items: string[]) {
    this.checkPageBreak(8 * items.length);

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);

    items.forEach((item, index) => {
      this.checkPageBreak(8);

      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
      this.doc.text(`${index + 1}.`, this.margin, this.yPos);

      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(0, 0, 0);

      const maxWidth = this.pageWidth - 2 * this.margin - 10;
      const lines = this.doc.splitTextToSize(item, maxWidth);

      lines.forEach((line: string) => {
        this.checkPageBreak(6);
        this.doc.text(line, this.margin + 8, this.yPos);
        this.yPos += 6;
      });

      this.yPos += 2;
    });
  }

  addInfoBox(title: string, content: string, type: 'info' | 'success' | 'warning' | 'danger' = 'info') {
    this.checkPageBreak(20);

    let bgColor, borderColor, textColor;

    switch (type) {
      case 'success':
        bgColor = [220, 255, 230];
        borderColor = this.accentColor;
        textColor = [0, 100, 50];
        break;
      case 'warning':
        bgColor = [255, 245, 220];
        borderColor = this.warningColor;
        textColor = [150, 80, 0];
        break;
      case 'danger':
        bgColor = [255, 230, 230];
        borderColor = this.dangerColor;
        textColor = [150, 0, 0];
        break;
      default:
        bgColor = [230, 240, 255];
        borderColor = this.primaryColor;
        textColor = [0, 50, 100];
    }

    const maxWidth = this.pageWidth - 2 * this.margin - 8;
    const titleLines = this.doc.splitTextToSize(title, maxWidth);
    const contentLines = this.doc.splitTextToSize(content, maxWidth);
    const boxHeight = 5 + (titleLines.length * 6) + (contentLines.length * 5) + 5;

    this.checkPageBreak(boxHeight);

    this.doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    this.doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(this.margin, this.yPos, this.pageWidth - 2 * this.margin, boxHeight, 3, 3, 'FD');

    this.yPos += 8;

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    titleLines.forEach((line: string) => {
      this.doc.text(line, this.margin + 4, this.yPos);
      this.yPos += 6;
    });

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    contentLines.forEach((line: string) => {
      this.doc.text(line, this.margin + 4, this.yPos);
      this.yPos += 5;
    });

    this.yPos += 8;
  }

  addTable(data: TableData) {
    const colWidth = (this.pageWidth - 2 * this.margin) / data.headers.length;
    const rowHeight = 8;

    this.checkPageBreak(rowHeight * (data.rows.length + 2));

    this.doc.setFillColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
    this.doc.rect(this.margin, this.yPos, this.pageWidth - 2 * this.margin, rowHeight, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    data.headers.forEach((header, i) => {
      this.doc.text(header, this.margin + 2 + i * colWidth, this.yPos + 5.5);
    });

    this.yPos += rowHeight;

    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'normal');

    data.rows.forEach((row, rowIndex) => {
      this.checkPageBreak(rowHeight + 5);

      if (rowIndex % 2 === 0) {
        this.doc.setFillColor(245, 245, 245);
        this.doc.rect(this.margin, this.yPos, this.pageWidth - 2 * this.margin, rowHeight, 'F');
      }

      row.forEach((cell, colIndex) => {
        const cellText = this.doc.splitTextToSize(cell, colWidth - 4);
        this.doc.text(cellText[0] || cell, this.margin + 2 + colIndex * colWidth, this.yPos + 5.5);
      });

      this.doc.setDrawColor(200, 200, 200);
      this.doc.line(this.margin, this.yPos + rowHeight, this.pageWidth - this.margin, this.yPos + rowHeight);

      this.yPos += rowHeight;
    });

    this.yPos += 5;
  }

  addSpacing(height: number = 5) {
    this.yPos += height;
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.yPos + requiredSpace > this.pageHeight - 20) {
      this.doc.addPage();
      this.yPos = 20;
    }
  }

  save(filename: string) {
    this.addFooter();
    this.doc.save(filename);
  }

  getBlob(): Blob {
    this.addFooter();
    return this.doc.output('blob');
  }
}

export function generateRiskAssessmentPDF(risks: any[]) {
  const pdf = new HMSPdfGenerator();

  pdf.addHeader({
    title: 'Risikovurdering',
    subtitle: 'Helhetlig oversikt over risikoer',
    companyName: 'LA Kokido',
    generatedDate: new Date()
  });

  pdf.addInfoBox(
    'Om risikovurdering',
    'Dette dokumentet inneholder en fullstendig oversikt over identifiserte risikoer i virksomheten, med tilhørende vurderinger og tiltak.',
    'info'
  );

  pdf.addSpacing(5);

  risks.forEach((risk, index) => {
    const riskColor =
      risk.risk_level === 'Kritisk' ? 'danger' :
      risk.risk_level === 'Høy' ? 'warning' :
      risk.risk_level === 'Middels' ? 'warning' : 'success';

    pdf.addSectionTitle(`${index + 1}. ${risk.hazard_type}`, riskColor as any);

    pdf.addText(risk.hazard_description);
    pdf.addSpacing(3);

    pdf.addText('Risikovurdering:', { bold: true, fontSize: 11 });
    pdf.addBulletList([
      `Sannsynlighet: ${risk.likelihood}/5`,
      `Konsekvens: ${risk.consequence}/5`,
      `Risikoscore: ${risk.risk_score}`,
      `Risikonivå: ${risk.risk_level}`
    ]);

    pdf.addInfoBox(
      'Forebyggende tiltak',
      risk.preventive_measures,
      'info'
    );

    pdf.addText('Oppfølging:', { bold: true, fontSize: 11 });
    pdf.addBulletList([
      `Ansvarlig: ${risk.responsible_person}`,
      `Status: ${risk.status}`,
      risk.deadline ? `Frist: ${new Date(risk.deadline).toLocaleDateString('nb-NO')}` : 'Ingen frist satt'
    ].filter(Boolean));

    if (risk.notes) {
      pdf.addText(`Merknader: ${risk.notes}`, { fontSize: 9, color: [100, 100, 100] });
    }

    pdf.addSpacing(8);
  });

  pdf.save('risikovurdering.pdf');
}

export function generateFirstAidPDF(data: { responsible: any; equipment: any[]; inspections: any[] }) {
  const pdf = new HMSPdfGenerator();

  pdf.addHeader({
    title: 'Førstehjelp',
    subtitle: 'Utstyr og rutiner for førstehjelp',
    companyName: 'LA Kokido',
    generatedDate: new Date()
  });

  if (data.responsible) {
    pdf.addSectionTitle('Førstehjelpsansvarlig', 'primary');
    pdf.addBulletList([
      `Navn: ${data.responsible.name}`,
      `Avdeling: ${data.responsible.department}`,
      data.responsible.phone ? `Telefon: ${data.responsible.phone}` : '',
      data.responsible.email ? `E-post: ${data.responsible.email}` : '',
      data.responsible.last_course_date ? `Siste kurs: ${new Date(data.responsible.last_course_date).toLocaleDateString('nb-NO')}` : '',
      data.responsible.certificate_valid_until ? `Gyldig til: ${new Date(data.responsible.certificate_valid_until).toLocaleDateString('nb-NO')}` : ''
    ].filter(Boolean));
    pdf.addSpacing(5);
  }

  pdf.addSectionTitle('Førstehjelpsplan', 'primary');
  pdf.addText('Ved ulykke eller akutt sykdom:', { bold: true, fontSize: 11 });
  pdf.addNumberedList([
    'Vurder situasjonen - Sikre området og unngå ytterligere fare',
    'Varsle - Ring 113 ved livstruende situasjoner eller 116 117 ved mindre alvorlige tilfeller',
    'Gi førstehjelp - Ytt nødvendig førstehjelp inntil profesjonell hjelp kommer',
    'Varsle leder - Informer daglig leder eller nærmeste leder umiddelbart',
    'Dokumenter - Registrer hendelsen i HMS-systemet'
  ]);

  pdf.addSpacing(5);

  pdf.addInfoBox(
    'Viktige telefonnumre',
    'Akutt (AMK): 113 • Brann: 110 • Politi: 112 • Legevakt: 116 117',
    'warning'
  );

  pdf.addSpacing(5);

  if (data.equipment.length > 0) {
    pdf.addSectionTitle('Førstehjelpssutstyr', 'success');

    const tableData: TableData = {
      headers: ['Utstyr', 'Antall', 'Tilstand', 'Plassering', 'Siste kontroll'],
      rows: data.equipment.map(eq => [
        eq.equipment_name,
        eq.quantity.toString(),
        eq.condition,
        eq.location || '-',
        eq.last_check_date ? new Date(eq.last_check_date).toLocaleDateString('nb-NO') : '-'
      ])
    };

    pdf.addTable(tableData);
  }

  if (data.inspections.length > 0) {
    pdf.addSectionTitle('Kontrollhistorikk', 'primary');

    data.inspections.slice(0, 10).forEach(insp => {
      pdf.addText(
        `${new Date(insp.inspection_date).toLocaleDateString('nb-NO')} - ${insp.inspection_type} - ${insp.inspected_by} - ${insp.status}`,
        { fontSize: 9 }
      );
    });
  }

  pdf.save('forstehjelp.pdf');
}

export function generateFireSafetyPDF(data: { responsible: any; equipment: any[]; inspections: any[] }) {
  const pdf = new HMSPdfGenerator();

  pdf.addHeader({
    title: 'Brannsikkerhet',
    subtitle: 'Oversikt over brannsikkerhetsrutiner og utstyr',
    companyName: 'LA Kokido',
    generatedDate: new Date()
  });

  if (data.responsible) {
    pdf.addSectionTitle('Brannansvarlig', 'danger');
    pdf.addBulletList([
      `Navn: ${data.responsible.name}`,
      data.responsible.phone ? `Telefon: ${data.responsible.phone}` : '',
      data.responsible.email ? `E-post: ${data.responsible.email}` : '',
      data.responsible.last_course_date ? `Siste kurs: ${new Date(data.responsible.last_course_date).toLocaleDateString('nb-NO')}` : ''
    ].filter(Boolean));
    pdf.addSpacing(5);
  }

  pdf.addSectionTitle('Rutiner ved brann', 'danger');
  pdf.addNumberedList([
    'Varsle - Aktiver brannalarmen og ring 110',
    'Redde - Hjelp personer i umiddelbar fare hvis det er trygt',
    'Slukke - Forsøk å slukke brannen kun hvis det er trygt',
    'Evakuer - Forlat bygget via nærmeste rømningsvei',
    'Møt opp - På oppsamlingsplassen utenfor bygget'
  ]);

  pdf.addSpacing(5);

  pdf.addInfoBox(
    'Viktig informasjon',
    'Ved brann: Ring 110 • Ikke benytt heis • Lukk dører bak deg • Ikke gå tilbake inn',
    'danger'
  );

  pdf.addSpacing(5);

  if (data.equipment.length > 0) {
    pdf.addSectionTitle('Brannslukningsutstyr', 'warning');

    const tableData: TableData = {
      headers: ['Type', 'Plassering', 'Status', 'Beskrivelse'],
      rows: data.equipment.map(eq => [
        eq.equipment_type,
        eq.location,
        eq.status,
        eq.description || '-'
      ])
    };

    pdf.addTable(tableData);
  }

  if (data.inspections.length > 0) {
    pdf.addSectionTitle('Kontrollhistorikk', 'primary');

    data.inspections.slice(0, 10).forEach(insp => {
      pdf.addText(
        `${new Date(insp.inspection_date).toLocaleDateString('nb-NO')} - ${insp.inspection_type} - ${insp.performed_by} - ${insp.status}`,
        { fontSize: 9 }
      );

      if (insp.notes) {
        pdf.addText(`Merknad: ${insp.notes}`, { fontSize: 8, color: [100, 100, 100] });
      }

      pdf.addSpacing(2);
    });
  }

  pdf.save('brannsikkerhet.pdf');
}
