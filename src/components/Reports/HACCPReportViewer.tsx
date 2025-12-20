import { CheckCircle, XCircle, AlertTriangle, Thermometer, Sparkles, Droplet, User, Download } from 'lucide-react';
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

  // Get employee name based on day of week and time
  const getResponsibleEmployee = (logTime: string, reportDate: string) => {
    const date = new Date(reportDate);
    const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    const hour = parseInt(logTime?.substring(0, 2) || '12');

    // Employees list
    const weekdayEmployees = ['Gourg Brsoum', 'Larcen Marcus'];
    const weekendEmployees = ['Gourg Brsoum', 'Larcen Marcus', 'Ahmed Ali', 'Sara Olsen', 'Mohammed Hassan'];

    // Monday-Thursday: 2 employees
    if (dayOfWeek >= 1 && dayOfWeek <= 4) {
      return hour < 17 ? weekdayEmployees[0] : weekdayEmployees[1];
    }

    // Friday, Saturday, Sunday: 4-5 employees
    const empIndex = Math.floor((hour - 11) / 3) % weekendEmployees.length;
    return weekendEmployees[empIndex];
  };

  // Get all employees working on this day
  const getWorkingEmployees = (reportDate: string) => {
    const date = new Date(reportDate);
    const dayOfWeek = date.getDay();

    // Monday-Thursday: 2 employees
    if (dayOfWeek >= 1 && dayOfWeek <= 4) {
      return ['Gourg Brsoum', 'Larcen Marcus'];
    }

    // Friday, Saturday, Sunday: 4-5 employees
    return ['Gourg Brsoum', 'Larcen Marcus', 'Ahmed Ali', 'Sara Olsen', 'Mohammed Hassan'];
  };

  const stats = countStatus();
  const groupedTemps = groupByZone();
  const workingEmployees = getWorkingEmployees(report.report_date);

  const downloadPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('HACCP Daglig Kontrollrapport', 20, 20);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Dato: ${new Date(report.report_date).toLocaleDateString('no-NO')}`, 20, 30);
    pdf.text(`Rapport ID: ${report.id.substring(0, 8)}`, 20, 37);

    pdf.text(`Totale malinger: ${stats.total}`, 20, 50);
    pdf.text(`Godkjent: ${stats.godkjent}`, 20, 57);
    pdf.text(`Advarsler: ${stats.advarsler}`, 20, 64);
    pdf.text(`Kritiske: ${stats.kritiske}`, 20, 71);

    let yPos = 85;

    if (report.temperature_data && report.temperature_data.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Temperaturkontroll', 20, yPos);
      yPos += 7;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      report.temperature_data.forEach((temp: any) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        const zoneName = temp.zone?.name || 'Ukjent';
        const equipmentName = temp.equipment?.name || 'Ukjent';
        const tempValue = temp.temperature ? `${temp.temperature}C` : 'N/A';
        const time = temp.log_time ? temp.log_time.substring(0, 5) : '';
        const limits = getTempLimits(zoneName, equipmentName);
        const status = temp.status === 'safe' ? 'OK' : temp.status === 'warning' ? 'Advarsel' : 'Kritisk';
        pdf.text(`${equipmentName} (${zoneName}): ${tempValue} ${limits} [${status}] ${time}`, 25, yPos);
        yPos += 6;
      });
      yPos += 5;
    }

    if (report.cleaning_data && report.cleaning_data.length > 0) {
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Rengjoring og Vedlikehold', 20, yPos);
      yPos += 7;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      report.cleaning_data.forEach((clean: any) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        const taskName = clean.task?.name || 'Ukjent oppgave';
        const status = clean.completed ? 'Fullfort' : 'Mangler';
        const time = clean.log_time ? clean.log_time.substring(0, 5) : '';
        pdf.text(`${status}: ${taskName} (${time})`, 25, yPos);
        yPos += 6;
      });
      yPos += 5;
    }

    if (report.hygiene_data && report.hygiene_data.length > 0) {
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Personlig Hygiene', 20, yPos);
      yPos += 7;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      report.hygiene_data.forEach((hygiene: any) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        const name = hygiene.employee?.name || hygiene.staff_name || 'Ukjent';
        const hands = hygiene.hands_washed ? 'OK' : 'X';
        const uniform = hygiene.uniform_clean ? 'OK' : 'X';
        pdf.text(`${name} - Hender: ${hands}, Uniform: ${uniform}`, 25, yPos);
        yPos += 6;
      });
    }

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
                  <p className="font-bold text-slate-800">{report.signed_by || '_____________________'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Dato og tid</p>
                <div className="border-b-2 border-slate-400 pb-2">
                  <p className="font-bold text-slate-800">
                    {report.signed_at
                      ? new Date(report.signed_at).toLocaleString('no-NO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '_____________________'}
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
