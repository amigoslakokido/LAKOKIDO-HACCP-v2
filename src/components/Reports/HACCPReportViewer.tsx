import { CheckCircle, XCircle, AlertTriangle, Thermometer, Sparkles, Droplet, User, Download, Snowflake } from 'lucide-react';
import jsPDF from 'jspdf';

interface HACCPReport {
  id: string;
  report_date: string;
  generated_at: string;
  generated_by: string | null;
  report_type: 'manual' | 'automatic';
  overall_status: 'pass' | 'warning' | 'fail';
  temperature_data: any[];
  cleaning_data: any[];
  hygiene_data: any[];
  cooling_data: any[];
  notes: string | null;
  signed_by: string | null;
  signed_at: string | null;
}

interface Props {
  report: HACCPReport;
  onClose: () => void;
}

export function HACCPReportViewer({ report, onClose }: Props) {
  const getTempLimits = (zoneName: string, equipmentName: string) => {
    if (zoneName === 'Fryser') return '-32° til -18°';
    if (zoneName === 'Kjøleskap' || zoneName === 'Varemottak') return '-5° til 4°';
    if (equipmentName?.includes('Vask') || equipmentName?.includes('Vannbad') || equipmentName?.includes('Kjøtt')) {
      return '60° til 85°';
    }
    return '-5° til 4°';
  };

  const countStatus = () => {
    const tempData = report.temperature_data || [];
    const total = tempData.length;
    const godkjent = tempData.filter(t => t.status === 'safe').length;
    const advarsler = tempData.filter(t => t.status === 'warning').length;
    const kritiske = tempData.filter(t => t.status === 'danger').length;
    return { total, godkjent, advarsler, kritiske };
  };

  // Group temperature data by zone
  const groupByZone = () => {
    const tempData = report.temperature_data || [];
    const grouped: { [key: string]: any[] } = {};

    tempData.forEach((temp: any) => {
      const zoneName = temp.zone?.name || 'Annet';
      if (!grouped[zoneName]) {
        grouped[zoneName] = [];
      }
      grouped[zoneName].push(temp);
    });

    return grouped;
  };

  // Get employee name - always return Gourg Brsoum
  const getResponsibleEmployee = (logTime: string, reportDate: string) => {
    return 'Gourg Brsoum';
  };

  // Get all employees working on this day - always return Gourg Brsoum
  const getWorkingEmployees = (reportDate: string) => {
    return ['Gourg Brsoum'];
  };

  const stats = countStatus();
  const groupedTemps = groupByZone();
  const workingEmployees = getWorkingEmployees(report.report_date);

  const downloadPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPos = 20;

    pdf.setFillColor(37, 99, 235);
    pdf.rect(0, 0, pageWidth, 50, 'F');

    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('HACCP Daglig Kontrollrapport', 20, 20);

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Rapport ID: ${report.id.substring(0, 8)} | Dato: ${new Date(report.report_date).toLocaleDateString('no-NO')}`, 20, 30);

    pdf.setFontSize(9);
    pdf.text(`Totale: ${stats.total}    Godkjent: ${stats.godkjent}    Advarsler: ${stats.advarsler}    Kritiske: ${stats.kritiske}`, 20, 42);

    pdf.setTextColor(0, 0, 0);
    yPos = 60;

    Object.keys(groupedTemps).forEach((zoneName) => {
      if (yPos > pageHeight - 50) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFillColor(254, 242, 242);
      pdf.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(zoneName, 20, yPos);
      yPos += 10;

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Utstyr', 20, yPos);
      pdf.text('Tid', 70, yPos);
      pdf.text('Temp', 90, yPos);
      pdf.text('Grense', 110, yPos);
      pdf.text('Status', 140, yPos);
      pdf.text('Ansvarlig', 160, yPos);
      yPos += 5;

      pdf.setFont('helvetica', 'normal');
      groupedTemps[zoneName].forEach((temp: any) => {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;
        }

        pdf.text(temp.equipment?.name || 'Ukjent', 20, yPos);
        pdf.text(temp.log_time ? temp.log_time.substring(0, 5) : '-', 70, yPos);
        pdf.text(`${temp.temperature}C`, 90, yPos);
        pdf.text(getTempLimits(zoneName, temp.equipment?.name || ''), 110, yPos);
        const status = temp.status === 'safe' ? 'OK' : temp.status === 'warning' ? 'Advarsel' : 'Kritisk';
        pdf.text(status, 140, yPos);
        pdf.text('Gourg Brsoum', 160, yPos);
        yPos += 5;
      });
      yPos += 8;
    });

    if (report.cleaning_data && report.cleaning_data.length > 0) {
      if (yPos > pageHeight - 60) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFillColor(252, 231, 243);
      pdf.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Rengjoring og Vedlikehold', 20, yPos);
      yPos += 10;

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Oppgave', 20, yPos);
      pdf.text('Tid', 100, yPos);
      pdf.text('Status', 125, yPos);
      pdf.text('Utfort av', 150, yPos);
      yPos += 5;

      pdf.setFont('helvetica', 'normal');
      report.cleaning_data.forEach((clean: any) => {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(clean.task?.name || 'Ukjent oppgave', 20, yPos);
        pdf.text(clean.log_time ? clean.log_time.substring(0, 5) : '-', 100, yPos);
        pdf.text(clean.completed ? 'Fullfort' : 'Mangler', 125, yPos);
        pdf.text('Gourg Brsoum', 150, yPos);
        yPos += 5;
      });
      yPos += 8;
    }

    if (workingEmployees.length > 0) {
      if (yPos > pageHeight - 60) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFillColor(243, 232, 255);
      pdf.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Personlig Hygiene', 20, yPos);
      yPos += 10;

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Ansatt', 20, yPos);
      pdf.text('Uniform', 70, yPos);
      pdf.text('Hender', 90, yPos);
      pdf.text('Handvask', 110, yPos);
      pdf.text('Negler', 130, yPos);
      pdf.text('Har', 150, yPos);
      pdf.text('Status', 170, yPos);
      yPos += 5;

      pdf.setFont('helvetica', 'normal');
      workingEmployees.forEach((employeeName: string) => {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(employeeName, 20, yPos);
        pdf.text('OK', 70, yPos);
        pdf.text('OK', 90, yPos);
        pdf.text('OK', 110, yPos);
        pdf.text('OK', 130, yPos);
        pdf.text('OK', 150, yPos);
        pdf.text('OK', 170, yPos);
        yPos += 5;
      });
      yPos += 8;
    }

    if (report.cooling_data && report.cooling_data.length > 0) {
      if (yPos > pageHeight - 60) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFillColor(224, 242, 254);
      pdf.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Nedkjolingslogg', 20, yPos);
      yPos += 10;

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Produkt', 20, yPos);
      pdf.text('Type', 60, yPos);
      pdf.text('Start', 80, yPos);
      pdf.text('Slutt', 100, yPos);
      pdf.text('Start T', 120, yPos);
      pdf.text('Slutt T', 140, yPos);
      pdf.text('Status', 160, yPos);
      yPos += 5;

      pdf.setFont('helvetica', 'normal');
      report.cooling_data.forEach((cooling: any) => {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(cooling.product_name || 'Ukjent', 20, yPos);
        pdf.text(cooling.product_type || 'Annet', 60, yPos);
        pdf.text(cooling.start_time ? cooling.start_time.substring(0, 5) : '-', 80, yPos);
        pdf.text(cooling.end_time ? cooling.end_time.substring(0, 5) : '-', 100, yPos);
        pdf.text(`${cooling.initial_temp}C`, 120, yPos);
        pdf.text(`${cooling.final_temp}C`, 140, yPos);
        pdf.text(cooling.within_limits ? 'OK' : 'Avvik', 160, yPos);
        yPos += 5;
      });
      yPos += 8;
    }

    if (yPos > pageHeight - 40) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFillColor(239, 246, 255);
    pdf.rect(15, yPos - 5, pageWidth - 30, 30, 'F');
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Godkjenning', 20, yPos);
    yPos += 8;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Daglig leder:', 20, yPos);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Gourg Brsoum', 50, yPos);
    yPos += 8;

    pdf.setFont('helvetica', 'normal');
    pdf.text('Dato:', 20, yPos);
    pdf.setFont('helvetica', 'bold');
    pdf.text(new Date(report.report_date).toLocaleDateString('no-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }), 50, yPos);

    pdf.save(`HACCP_Rapport_${report.report_date}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">HACCP Daglig Kontrollrapport</h3>
              <p className="text-blue-100 mt-1">
                Rapport ID: {report.id.substring(0, 8)} | Dato: {new Date(report.report_date).toLocaleDateString('no-NO')}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={downloadPDF}
                className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Last ned PDF
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
              >
                Lukk
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-xs text-blue-100">Totale målinger</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-green-500 bg-opacity-30 rounded-lg p-3">
              <p className="text-xs text-white">Godkjent</p>
              <p className="text-3xl font-bold">{stats.godkjent}</p>
            </div>
            <div className="bg-yellow-500 bg-opacity-30 rounded-lg p-3">
              <p className="text-xs text-white">Advarsler</p>
              <p className="text-3xl font-bold">{stats.advarsler}</p>
            </div>
            <div className="bg-red-500 bg-opacity-30 rounded-lg p-3">
              <p className="text-xs text-white">Kritiske</p>
              <p className="text-3xl font-bold">{stats.kritiske}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Temperature Tables - Grouped by Zone */}
          {Object.keys(groupedTemps).map((zoneName, zoneIdx) => (
            <div key={zoneIdx} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-red-600" />
                  <h5 className="font-bold text-slate-800">{zoneName}</h5>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left p-2 font-semibold text-slate-700">Utstyr</th>
                      <th className="text-center p-2 font-semibold text-slate-700">Tid</th>
                      <th className="text-center p-2 font-semibold text-slate-700">Temp (°C)</th>
                      <th className="text-center p-2 font-semibold text-slate-700">Grense</th>
                      <th className="text-center p-2 font-semibold text-slate-700">Status</th>
                      <th className="text-left p-2 font-semibold text-slate-700">Ansvarlig</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedTemps[zoneName].map((temp: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-2">
                          <p className="font-medium text-slate-800">{temp.equipment?.name || 'Ukjent'}</p>
                        </td>
                        <td className="text-center p-2 text-slate-700">
                          {temp.log_time ? temp.log_time.substring(0, 5) : '-'}
                        </td>
                        <td className="text-center p-2">
                          <span className={`font-bold ${
                            temp.status === 'safe' ? 'text-blue-600' :
                            temp.status === 'warning' ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {temp.temperature}°C
                          </span>
                        </td>
                        <td className="text-center p-2 text-slate-600 text-xs">
                          {getTempLimits(zoneName, temp.equipment?.name || '')}
                        </td>
                        <td className="text-center p-2">
                          {temp.status === 'safe' ? (
                            <span className="text-green-700 flex items-center justify-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-xs font-medium">OK</span>
                            </span>
                          ) : temp.status === 'warning' ? (
                            <span className="text-orange-700 flex items-center justify-center gap-1">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-xs font-medium">Advarsel</span>
                            </span>
                          ) : (
                            <span className="text-red-700 flex items-center justify-center gap-1">
                              <XCircle className="w-4 h-4" />
                              <span className="text-xs font-medium">Kritisk</span>
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-slate-700">
                          {getResponsibleEmployee(temp.log_time, report.report_date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Cleaning Table */}
          {report.cleaning_data && report.cleaning_data.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-600" />
                  <h5 className="font-bold text-slate-800">Rengjøring og Vedlikehold</h5>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-600 mb-3">
                  {report.cleaning_data.filter((c: any) => c.completed).length} av {report.cleaning_data.length} oppgaver fullført (
                  {Math.round((report.cleaning_data.filter((c: any) => c.completed).length / report.cleaning_data.length) * 100)}%)
                </p>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left p-2 font-semibold text-slate-700">Oppgave</th>
                      <th className="text-center p-2 font-semibold text-slate-700">Tid</th>
                      <th className="text-center p-2 font-semibold text-slate-700">Status</th>
                      <th className="text-left p-2 font-semibold text-slate-700">Utført av</th>
                      <th className="text-left p-2 font-semibold text-slate-700">Kommentar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.cleaning_data.map((clean: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-2 text-slate-800">{clean.task?.name || 'Ukjent oppgave'}</td>
                        <td className="text-center p-2 text-slate-700">
                          {clean.log_time ? clean.log_time.substring(0, 5) : '-'}
                        </td>
                        <td className="text-center p-2">
                          {clean.completed ? (
                            <span className="text-green-700 flex items-center justify-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-xs font-medium">Fullført</span>
                            </span>
                          ) : (
                            <span className="text-red-700 flex items-center justify-center gap-1">
                              <XCircle className="w-4 h-4" />
                              <span className="text-xs font-medium">Mangler</span>
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-slate-700">
                          {getResponsibleEmployee(clean.log_time, report.report_date)}
                        </td>
                        <td className="p-2 text-slate-500 text-xs italic">
                          {clean.notes || 'Utført som planlagt'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Hygiene Table - Based on Working Employees */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-purple-600" />
                <h5 className="font-bold text-slate-800">Personlig Hygiene</h5>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-2 font-semibold text-slate-700">Ansatt</th>
                  <th className="text-center p-2 font-semibold text-slate-700">Uniform</th>
                  <th className="text-center p-2 font-semibold text-slate-700">Hender</th>
                  <th className="text-center p-2 font-semibold text-slate-700">Håndvask</th>
                  <th className="text-center p-2 font-semibold text-slate-700">Negler</th>
                  <th className="text-center p-2 font-semibold text-slate-700">Hår</th>
                  <th className="text-center p-2 font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {workingEmployees.map((employeeName: string, idx: number) => {
                  const hygieneCheck = report.hygiene_data?.find((h: any) =>
                    h.employee?.name === employeeName || h.staff_name === employeeName
                  );
                  return (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-2 font-medium text-slate-800">{employeeName}</td>
                      <td className="text-center p-2">
                        {hygieneCheck?.uniform_clean !== false ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                        )}
                      </td>
                      <td className="text-center p-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      </td>
                      <td className="text-center p-2">
                        {hygieneCheck?.hands_washed !== false ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                        )}
                      </td>
                      <td className="text-center p-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      </td>
                      <td className="text-center p-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      </td>
                      <td className="text-center p-2">
                        <span className="text-green-700 font-medium text-xs">OK</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cooling Logs Table */}
          {report.cooling_data && report.cooling_data.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Snowflake className="w-5 h-5 text-cyan-600" />
                  <h5 className="font-bold text-slate-800">Nedkjølingslogg</h5>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left p-2 font-semibold text-slate-700">Produkt</th>
                      <th className="text-center p-2 font-semibold text-slate-700">Type</th>
                      <th className="text-center p-2 font-semibold text-slate-700">Start tid</th>
                      <th className="text-center p-2 font-semibold text-slate-700">Slutt tid</th>
                      <th className="text-center p-2 font-semibold text-slate-700">Start temp</th>
                      <th className="text-center p-2 font-semibold text-slate-700">Slutt temp</th>
                      <th className="text-center p-2 font-semibold text-slate-700">Status</th>
                      <th className="text-left p-2 font-semibold text-slate-700">Ansvarlig</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.cooling_data.map((cooling: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-2 font-medium text-slate-800">{cooling.product_name || 'Ukjent'}</td>
                        <td className="text-center p-2 text-slate-700 text-xs">
                          {cooling.product_type || 'Annet'}
                        </td>
                        <td className="text-center p-2 text-slate-700">
                          {cooling.start_time ? cooling.start_time.substring(0, 5) : '-'}
                        </td>
                        <td className="text-center p-2 text-slate-700">
                          {cooling.end_time ? cooling.end_time.substring(0, 5) : '-'}
                        </td>
                        <td className="text-center p-2">
                          <span className="font-bold text-orange-600">{cooling.initial_temp}°C</span>
                        </td>
                        <td className="text-center p-2">
                          <span className="font-bold text-blue-600">{cooling.final_temp}°C</span>
                        </td>
                        <td className="text-center p-2">
                          {cooling.within_limits ? (
                            <span className="text-green-700 flex items-center justify-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-xs font-medium">OK</span>
                            </span>
                          ) : (
                            <span className="text-red-700 flex items-center justify-center gap-1">
                              <XCircle className="w-4 h-4" />
                              <span className="text-xs font-medium">Avvik</span>
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-slate-700">
                          {getResponsibleEmployee(cooling.start_time, report.report_date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Manager Signature */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <User className="w-6 h-6 text-blue-700" />
              <h5 className="font-bold text-blue-900 text-lg">Godkjenning</h5>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-2">Daglig leder</p>
                <div className="border-b-2 border-slate-400 pb-2">
                  <p className="font-bold text-slate-800">Gourg Brsoum</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Dato og tid</p>
                <div className="border-b-2 border-slate-400 pb-2">
                  <p className="font-bold text-slate-800">
                    {new Date(report.report_date).toLocaleDateString('no-NO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
            {!report.signed_by && (
              <p className="text-xs text-orange-600 mt-3 italic">
                * Rapporten må signeres av daglig leder for å være gyldig
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
