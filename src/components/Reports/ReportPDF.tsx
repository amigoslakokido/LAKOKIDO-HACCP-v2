import { DailyReport } from '../../lib/supabase';
import { companyApi, CompanyInfo } from '../../lib/companyApi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useEffect, useState } from 'react';

interface ReportPDFProps {
  report: DailyReport;
  tempLogs: any[];
  cleaningLogs: any[];
  hygieneChecks?: any[];
  coolingLogs?: any[];
}

export function ReportPDF({ report, tempLogs, cleaningLogs, hygieneChecks = [], coolingLogs = [] }: ReportPDFProps) {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = async () => {
    const { data } = await companyApi.getCompanyInfo();
    if (data) setCompanyInfo(data);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-report');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `HACCP_Rapport_${formatDate(report.report_date).replace(/\s/g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Det oppstod en feil ved opprettelse av PDF');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const safeCount = tempLogs?.filter(l => l.status === 'safe').length || 0;
  const warningCount = tempLogs?.filter(l => l.status === 'warning').length || 0;
  const dangerCount = tempLogs?.filter(l => l.status === 'danger').length || 0;
  const totalTemp = tempLogs?.length || 0;

  const completedCleaning = cleaningLogs?.filter(l => l.status === 'completed').length || 0;
  const totalCleaning = cleaningLogs?.length || 0;

  // Get Daglig leder from temperature logs (only daglig_leder signs reports)
  let dagligLeder = 'Kontrollør';

  // Try to find daglig_leder from temperature logs
  const dagligLederFromLogs = tempLogs?.find(log =>
    log.employees?.role === 'daglig_leder'
  );

  if (dagligLederFromLogs) {
    dagligLeder = dagligLederFromLogs.employees.name;
  } else {
    // Try to find from cleaning logs
    const dagligLederFromCleaning = cleaningLogs?.find(log =>
      log.employees?.role === 'daglig_leder'
    );
    if (dagligLederFromCleaning) {
      dagligLeder = dagligLederFromCleaning.employees.name;
    }
  }

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="mb-4 no-print">
        <button
          onClick={handleDownloadPDF}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Last ned som PDF
        </button>
      </div>

      <div id="printable-report" className="bg-white p-8 max-w-5xl mx-auto">
        <div className="border-4 border-slate-800 p-8">
          <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-slate-300">
            <div className="flex items-center gap-4">
              <img src="/visas.jpg" alt="Company Logo" className="w-24 h-24 object-contain" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {companyInfo?.company_name || 'Amigos la Kokido AS'}
                </h1>
                <p className="text-slate-600 mt-1">HACCP Daglig Kontrollrapport</p>
                {companyInfo && (
                  <p className="text-sm text-slate-500 mt-1">
                    Org.nr: {companyInfo.org_number} | {companyInfo.phone}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">Rapport ID</div>
              <div className="font-mono text-lg font-semibold">{report.id.slice(0, 8)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8 bg-slate-50 p-6 rounded-lg">
            <div>
              <div className="text-sm text-slate-600 font-medium">📅 Dato</div>
              <div className="text-lg font-semibold text-slate-900 mt-1">{formatDate(report.report_date)}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 font-medium">📝 Utarbeidet</div>
              <div className="text-lg font-semibold text-slate-900 mt-1">
                {formatDate(report.report_date)}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-600 font-medium">🏢 Bedrift</div>
              <div className="text-lg font-semibold text-slate-900 mt-1">
                {companyInfo?.company_name || 'Amigos la Kokido AS'}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {companyInfo?.address || 'Trondheimsveien 2, 0560 Oslo'}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-600 font-medium">📊 Status</div>
              <div className={`text-lg font-bold mt-1 ${
                report.overall_status === 'safe' ? 'text-emerald-600' :
                report.overall_status === 'warning' ? 'text-amber-600' : 'text-red-600'
              }`}>
                {report.overall_status === 'safe' ? '✓ Trygt' :
                 report.overall_status === 'warning' ? '⚠ Advarsel' : '✕ Kritisk'}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-blue-500">
              📊 Rapportsammendrag
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">🌡️ Temperaturkontroll</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-slate-100 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-slate-900">{totalTemp}</div>
                    <div className="text-sm text-slate-600 mt-1">Totale målinger</div>
                  </div>
                  <div className="bg-emerald-100 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-emerald-700">{safeCount}</div>
                    <div className="text-sm text-emerald-700 mt-1">Godkjent</div>
                  </div>
                  <div className="bg-amber-100 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-amber-700">{warningCount}</div>
                    <div className="text-sm text-amber-700 mt-1">Advarsler</div>
                  </div>
                  <div className="bg-red-100 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-red-700">{dangerCount}</div>
                    <div className="text-sm text-red-700 mt-1">Kritiske</div>
                  </div>
                </div>
              </div>
              {coolingLogs && coolingLogs.length > 0 && (() => {
                const totalCooling = coolingLogs.length;
                const coolingApproved = coolingLogs.filter(log => log.within_limits).length;
                const coolingRejected = totalCooling - coolingApproved;

                return (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">❄️ Nedkjølingslogg</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-slate-100 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-slate-900">{totalCooling}</div>
                        <div className="text-sm text-slate-600 mt-1">Totale nedkjølinger</div>
                      </div>
                      <div className="bg-emerald-100 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-emerald-700">{coolingApproved}</div>
                        <div className="text-sm text-emerald-700 mt-1">Godkjent</div>
                      </div>
                      <div className="bg-red-100 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-red-700">{coolingRejected}</div>
                        <div className="text-sm text-red-700 mt-1">Ikke godkjent</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-blue-500">
              🌡️ Temperaturkontroll
            </h2>
            {!tempLogs || tempLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
                Ingen temperaturregistreringer
              </div>
            ) : (
              (() => {
                const groupedByZone = tempLogs.reduce((acc, log) => {
                  const zoneName = log.equipment?.zones?.name || 'Ukjent';
                  if (!acc[zoneName]) acc[zoneName] = [];
                  acc[zoneName].push(log);
                  return acc;
                }, {} as Record<string, typeof tempLogs>);

                const zoneOrder = ['Kjøleskap', 'Fryser', 'Varemottak', 'Nedkjøling'];
                const sortedEntries = Object.entries(groupedByZone).sort((a, b) => {
                  const indexA = zoneOrder.indexOf(a[0]);
                  const indexB = zoneOrder.indexOf(b[0]);
                  if (indexA === -1 && indexB === -1) return 0;
                  if (indexA === -1) return 1;
                  if (indexB === -1) return -1;
                  return indexA - indexB;
                });

                return (
                  <div className="space-y-6">
                    {sortedEntries.map(([zoneName, logs]) => (
                      <div key={zoneName}>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3 bg-slate-100 p-2 rounded">
                          {zoneName}
                        </h3>
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-slate-200">
                              <th className="border border-slate-400 p-3 text-left text-sm font-semibold">Utstyr</th>
                              <th className="border border-slate-400 p-3 text-center text-sm font-semibold">Tid</th>
                              <th className="border border-slate-400 p-3 text-center text-sm font-semibold">Temp (°C)</th>
                              <th className="border border-slate-400 p-3 text-center text-sm font-semibold">Grense</th>
                              <th className="border border-slate-400 p-3 text-center text-sm font-semibold">Status</th>
                              <th className="border border-slate-400 p-3 text-left text-sm font-semibold">Ansvarlig</th>
                            </tr>
                          </thead>
                          <tbody>
                            {logs.map((log, index) => (
                              <tr key={log.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className="border border-slate-300 p-3 text-sm">{log.equipment?.name}</td>
                                <td className="border border-slate-300 p-3 text-center text-sm font-mono">{log.log_time}</td>
                                <td className={`border border-slate-300 p-3 text-center text-sm font-bold ${
                                  log.status === 'safe' ? 'text-emerald-600' :
                                  log.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                                }`}>
                                  {log.temperature}°C
                                </td>
                                <td className="border border-slate-300 p-3 text-center text-sm">
                                  {log.equipment?.min_temp}° til {log.equipment?.max_temp}°
                                </td>
                                <td className={`border border-slate-300 p-3 text-center text-sm font-semibold ${
                                  log.status === 'safe' ? 'text-emerald-600' :
                                  log.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                                }`}>
                                  {log.status === 'safe' ? '✓ OK' : log.status === 'warning' ? '⚠ Advarsel' : '✕ Kritisk'}
                                </td>
                                <td className="border border-slate-300 p-3 text-sm">{log.employees?.name || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-cyan-500">
              🧼 Rengjøring og Vedlikehold
            </h2>
            {!cleaningLogs || cleaningLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
                Ingen rengjøringsregistreringer
              </div>
            ) : (
              <>
                <div className="mb-4 bg-cyan-50 p-4 rounded-lg">
                  <div className="text-sm text-cyan-900">
                    <span className="font-semibold">{completedCleaning}</span> av <span className="font-semibold">{totalCleaning}</span> oppgaver fullført
                    ({Math.round((completedCleaning / totalCleaning) * 100)}%)
                  </div>
                </div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-200">
                      <th className="border border-slate-400 p-3 text-left text-sm font-semibold">Oppgave</th>
                      <th className="border border-slate-400 p-3 text-center text-sm font-semibold">Tid</th>
                      <th className="border border-slate-400 p-3 text-center text-sm font-semibold">Status</th>
                      <th className="border border-slate-400 p-3 text-left text-sm font-semibold">Utført av</th>
                      <th className="border border-slate-400 p-3 text-left text-sm font-semibold">Kommentar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cleaningLogs.map((log, index) => (
                      <tr key={log.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="border border-slate-300 p-3 text-sm">{log.cleaning_tasks?.task_name}</td>
                        <td className="border border-slate-300 p-3 text-center text-sm font-mono">
                          {log.log_time || '—'}
                        </td>
                        <td className={`border border-slate-300 p-3 text-center text-sm font-semibold ${
                          log.status === 'completed' ? 'text-emerald-600' : 'text-slate-600'
                        }`}>
                          {log.status === 'completed' ? '✓ Fullført' : '○ Ikke utført'}
                        </td>
                        <td className="border border-slate-300 p-3 text-sm">{log.employees?.name || '—'}</td>
                        <td className="border border-slate-300 p-3 text-sm italic text-slate-600">
                          {log.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>

          {coolingLogs && coolingLogs.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-purple-500">
                ❄️ Nedkjølingslogg
              </h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-200">
                    <th className="border border-slate-400 p-3 text-left text-sm font-semibold">Produkt</th>
                    <th className="border border-slate-400 p-3 text-left text-sm font-semibold">Type</th>
                    <th className="border border-slate-400 p-3 text-center text-sm font-semibold">Start Temp</th>
                    <th className="border border-slate-400 p-3 text-center text-sm font-semibold">Slutt Temp</th>
                    <th className="border border-slate-400 p-3 text-center text-sm font-semibold">Starttid</th>
                    <th className="border border-slate-400 p-3 text-center text-sm font-semibold">Sluttid</th>
                    <th className="border border-slate-400 p-3 text-center text-sm font-semibold">Status</th>
                    <th className="border border-slate-400 p-3 text-left text-sm font-semibold">Merknad</th>
                  </tr>
                </thead>
                <tbody>
                  {coolingLogs.map((log, index) => {
                    const startTime = new Date(log.start_time).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
                    const endTime = new Date(log.end_time).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
                    const isWithinLimits = log.within_limits;

                    const productTypeMap: Record<string, string> = {
                      'meat': 'Kjøtt',
                      'poultry': 'Kylling',
                      'fish': 'Fisk',
                      'other': 'Annet'
                    };

                    return (
                      <tr key={log.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="border border-slate-300 p-3 text-sm font-medium">{log.product_name}</td>
                        <td className="border border-slate-300 p-3 text-sm">{productTypeMap[log.product_type] || log.product_type}</td>
                        <td className="border border-slate-300 p-3 text-center text-sm font-mono">{log.initial_temp}°C</td>
                        <td className={`border border-slate-300 p-3 text-center text-sm font-mono font-bold ${
                          isWithinLimits ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {log.final_temp}°C
                        </td>
                        <td className="border border-slate-300 p-3 text-center text-sm font-mono">{startTime}</td>
                        <td className="border border-slate-300 p-3 text-center text-sm font-mono">{endTime}</td>
                        <td className={`border border-slate-300 p-3 text-center text-sm font-semibold ${
                          isWithinLimits ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {isWithinLimits ? '✓ Godkjent' : '✗ Ikke godkjent'}
                        </td>
                        <td className="border border-slate-300 p-3 text-sm italic text-slate-600">{log.notes || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {hygieneChecks && hygieneChecks.length > 0 && (
            <div className="border-t-2 border-slate-300 pt-6 mt-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-blue-600">👤</span> Personlig Hygiene
              </h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-200">
                    <th className="border border-slate-400 p-3 text-left text-sm font-semibold">Ansatt</th>
                    <th className="border border-slate-400 p-3 text-center text-sm font-semibold">Uniform ren</th>
                    <th className="border border-slate-400 p-3 text-center text-sm font-semibold">Hender vasket</th>
                    <th className="border border-slate-400 p-3 text-center text-sm font-semibold">Smykker fjernet</th>
                    <th className="border border-slate-400 p-3 text-center text-sm font-semibold">Sykdomsfri</th>
                    <th className="border border-slate-400 p-3 text-left text-sm font-semibold">Merknader</th>
                  </tr>
                </thead>
                <tbody>
                  {hygieneChecks.map((check, index) => (
                    <tr key={check.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="border border-slate-300 p-3 text-sm font-medium">{check.staff_name || 'Ukjent'}</td>
                      <td className="border border-slate-300 p-3 text-center text-sm">{check.uniform_clean ? '✓' : '✗'}</td>
                      <td className="border border-slate-300 p-3 text-center text-sm">{check.hands_washed ? '✓' : '✗'}</td>
                      <td className="border border-slate-300 p-3 text-center text-sm">{check.jewelry_removed ? '✓' : '✗'}</td>
                      <td className="border border-slate-300 p-3 text-center text-sm">{check.illness_free ? '✓' : '✗'}</td>
                      <td className="border border-slate-300 p-3 text-sm italic text-slate-600">{check.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t-2 border-slate-300 pt-6 mt-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Underskrift</h3>
              <p className="text-sm text-slate-600 mb-4">
                Dette dokumentet er godkjent av {dagligLeder === 'Kontrollør' ? 'Kontrollør' : 'Daglig leder: ' + dagligLeder}
              </p>
            </div>
            <div className="max-w-md">
              <div>
                <div className="text-sm text-slate-600 mb-2">
                  Underskrift {dagligLeder === 'Kontrollør' ? 'Kontrollør' : 'Daglig leder'}:
                </div>
                <div className="border-b-2 border-slate-400 h-16 flex items-end pb-2">
                  <span className="text-slate-700 font-medium italic">{dagligLeder}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">{formatDate(report.report_date)}</div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-slate-500 border-t pt-4">
            <p>Dette dokumentet er godkjent av Daglig leder i {companyInfo?.company_name || 'Amigos la Kokido AS'}</p>
            {companyInfo?.manager_name && (
              <p className="mt-1 font-semibold text-slate-700">Daglig leder: {companyInfo.manager_name}</p>
            )}
            <p className="mt-1 font-semibold text-slate-600">HACCP-HMS System v1.0.0</p>
            <p className="mt-1">For spørsmål, kontakt: {companyInfo?.email || 'order@amigoslakokido.com'}</p>
            {companyInfo?.website && (
              <p className="mt-1">{companyInfo.website}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
