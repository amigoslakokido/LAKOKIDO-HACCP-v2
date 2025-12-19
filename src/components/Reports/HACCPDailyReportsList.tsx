import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, Loader, Calendar, CheckCircle, AlertTriangle, XCircle, Trash2 } from 'lucide-react';
import { HACCPReportViewer } from './HACCPReportViewer';

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

export function HACCPDailyReportsList() {
  const [reports, setReports] = useState<HACCPReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingReport, setViewingReport] = useState<HACCPReport | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('haccp_daily_reports')
        .select('*')
        .order('report_date', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (reportId: string, reportDate: string) => {
    if (!confirm(`Er du sikker på at du vil slette rapporten for ${new Date(reportDate).toLocaleDateString('no-NO')}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('haccp_daily_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
      alert('Rapport slettet!');
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Feil ved sletting av rapport');
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pass':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          text: 'Trygt',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
          text: 'Advarsel',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-700'
        };
      case 'fail':
        return {
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          text: 'Kritisk',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700'
        };
      default:
        return {
          icon: <CheckCircle className="w-5 h-5 text-slate-600" />,
          text: 'Ukjent',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          textColor: 'text-slate-700'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Ingen rapporter funnet</p>
            <p className="text-sm text-slate-500 mt-2">
              Opprett en ny rapport fra innstillinger
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => {
              const statusInfo = getStatusInfo(report.overall_status);
              const tempCount = report.temperature_data?.length || 0;
              const cleaningCount = report.cleaning_data?.length || 0;
              const hygieneCount = report.hygiene_data?.length || 0;

              return (
                <div
                  key={report.id}
                  className={`border-2 ${statusInfo.borderColor} ${statusInfo.bgColor} rounded-xl p-6 hover:shadow-lg transition-all`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {statusInfo.icon}
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">
                          {new Date(report.report_date).toLocaleDateString('no-NO', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h3>
                        <p className="text-sm text-slate-600">
                          Generert: {new Date(report.generated_at).toLocaleString('no-NO')} | {report.generated_by || 'System'}
                        </p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 ${statusInfo.bgColor} ${statusInfo.textColor} rounded-lg font-bold border-2 ${statusInfo.borderColor}`}>
                      {statusInfo.text}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white bg-opacity-50 rounded-lg p-3 border">
                      <p className="text-xs text-slate-600 mb-1">Temperaturmålinger</p>
                      <p className="text-2xl font-bold text-blue-600">{tempCount}</p>
                    </div>
                    <div className="bg-white bg-opacity-50 rounded-lg p-3 border">
                      <p className="text-xs text-slate-600 mb-1">Rengjøring</p>
                      <p className="text-2xl font-bold text-emerald-600">{cleaningCount}</p>
                    </div>
                    <div className="bg-white bg-opacity-50 rounded-lg p-3 border">
                      <p className="text-xs text-slate-600 mb-1">Hygienekontroller</p>
                      <p className="text-2xl font-bold text-purple-600">{hygieneCount}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewingReport(report)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold"
                    >
                      <Eye className="w-4 h-4" />
                      Vis rapport
                    </button>
                    <button
                      onClick={() => deleteReport(report.id, report.report_date)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-bold"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {viewingReport && (
        <HACCPReportViewer
          report={viewingReport}
          onClose={() => setViewingReport(null)}
        />
      )}
    </>
  );
}
