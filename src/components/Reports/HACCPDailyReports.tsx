import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Download, Calendar, CheckCircle, XCircle, AlertTriangle, Loader, Search, Filter, Plus, Eye } from 'lucide-react';
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

interface ReportData {
  temperatures: any[];
  cleaning: any[];
  hygiene: any[];
  cooling: any[];
}

export function HACCPDailyReports() {
  const [reports, setReports] = useState<HACCPReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  const generateReport = async () => {
    try {
      setGenerating(true);

      // Fetch all data for the selected date
      const reportData = await fetchReportData(selectedDate);

      // Calculate overall status
      const overallStatus = calculateOverallStatus(reportData);

      // Check if report already exists for this date
      const { data: existing } = await supabase
        .from('haccp_daily_reports')
        .select('id')
        .eq('report_date', selectedDate)
        .single();

      if (existing) {
        alert('En rapport finnes allerede for denne datoen. Slett den først hvis du vil generere en ny.');
        return;
      }

      // Create report
      const { data: newReport, error } = await supabase
        .from('haccp_daily_reports')
        .insert({
          report_date: selectedDate,
          generated_by: 'Manuel generering',
          report_type: 'manual',
          overall_status: overallStatus,
          temperature_data: reportData.temperatures,
          cleaning_data: reportData.cleaning,
          hygiene_data: reportData.hygiene,
          cooling_data: reportData.cooling,
        })
        .select()
        .single();

      if (error) throw error;

      alert('Rapport generert!');
      fetchReports();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Feil ved generering av rapport');
    } finally {
      setGenerating(false);
    }
  };

  const fetchReportData = async (date: string): Promise<ReportData> => {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Fetch temperature logs
    const { data: temperatures } = await supabase
      .from('temperature_logs')
      .select(`
        *,
        zone:zones(name),
        equipment:equipment(name),
        employee:employees(name)
      `)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: false });

    // Fetch cleaning logs
    const { data: cleaning } = await supabase
      .from('cleaning_logs')
      .select(`
        *,
        task:cleaning_tasks(name, frequency),
        employee:employees(name)
      `)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: false });

    // Fetch hygiene checks
    const { data: hygiene } = await supabase
      .from('hygiene_logs')
      .select(`
        *,
        employee:employees(name)
      `)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: false });

    // Fetch cooling logs
    const { data: cooling } = await supabase
      .from('cooling_logs')
      .select(`
        *,
        employee:employees(name)
      `)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: false });

    return {
      temperatures: temperatures || [],
      cleaning: cleaning || [],
      hygiene: hygiene || [],
      cooling: cooling || [],
    };
  };

  const calculateOverallStatus = (data: ReportData): 'pass' | 'warning' | 'fail' => {
    // Check for any failures in temperature logs
    const tempFailures = data.temperatures.filter(t => t.status === 'danger');
    if (tempFailures.length > 0) return 'fail';

    // Check for warnings
    const tempWarnings = data.temperatures.filter(t => t.status === 'warning');
    const cleaningIssues = data.cleaning.filter(c => !c.completed);

    if (tempWarnings.length > 2 || cleaningIssues.length > 3) return 'warning';

    return 'pass';
  };

  const downloadPDF = async (report: HACCPReport) => {
    const pdf = new jsPDF();
    let yPos = 20;

    // Add logo
    try {
      const img = new Image();
      img.src = '/visas.jpg';
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      pdf.addImage(img, 'JPEG', 150, 10, 40, 20);
    } catch (error) {
      console.error('Error loading logo:', error);
    }

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('HACCP Daglig Rapport', 20, yPos);
    yPos += 10;

    // Date and metadata
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Dato: ${new Date(report.report_date).toLocaleDateString('no-NO')}`, 20, yPos);
    yPos += 7;
    pdf.text(`Generert: ${new Date(report.generated_at).toLocaleString('no-NO')}`, 20, yPos);
    yPos += 7;
    if (report.generated_by) {
      pdf.text(`Generert av: ${report.generated_by}`, 20, yPos);
      yPos += 7;
    }

    // Status
    const statusText = report.overall_status === 'pass' ? 'Bestått' :
                       report.overall_status === 'warning' ? 'Advarsel' : 'Feil';
    pdf.text(`Status: ${statusText}`, 20, yPos);
    yPos += 15;

    // Temperature data
    if (report.temperature_data && report.temperature_data.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Temperaturlogg', 20, yPos);
      yPos += 7;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      report.temperature_data.slice(0, 10).forEach((temp: any) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        const zoneName = temp.zone?.name || 'Ukjent';
        const tempValue = temp.temperature ? `${temp.temperature}°C` : 'N/A';
        pdf.text(`${zoneName}: ${tempValue}`, 25, yPos);
        yPos += 6;
      });
      yPos += 5;
    }

    // Cleaning data
    if (report.cleaning_data && report.cleaning_data.length > 0) {
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Rengjøringsoppgaver', 20, yPos);
      yPos += 7;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      report.cleaning_data.slice(0, 10).forEach((clean: any) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        const taskName = clean.task?.name || 'Ukjent oppgave';
        const status = clean.completed ? '✓' : '✗';
        pdf.text(`${status} ${taskName}`, 25, yPos);
        yPos += 6;
      });
      yPos += 5;
    }

    // Signature section
    if (yPos > 240) {
      pdf.addPage();
      yPos = 20;
    }
    yPos += 10;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Signatur', 20, yPos);
    yPos += 7;
    pdf.setFont('helvetica', 'normal');
    if (report.signed_by) {
      pdf.text(`Signert av: ${report.signed_by}`, 20, yPos);
      yPos += 7;
      pdf.text(`Dato: ${new Date(report.signed_at!).toLocaleString('no-NO')}`, 20, yPos);
    } else {
      pdf.text('Ikke signert', 20, yPos);
    }

    pdf.save(`HACCP_Rapport_${report.report_date}.pdf`);
  };

  const filteredReports = reports.filter(report => {
    if (filterStatus !== 'all' && report.overall_status !== filterStatus) return false;
    if (searchTerm && !report.report_date.includes(searchTerm)) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'fail': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="space-y-6">
      {/* Generate Report Section */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl p-6 border-2 border-blue-200">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Generer ny rapport</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Velg dato
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={generateReport}
            disabled={generating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold disabled:opacity-50 flex items-center gap-2"
          >
            {generating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Genererer...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Generer rapport
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Søk etter dato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-600" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Alle statuser</option>
            <option value="pass">Bestått</option>
            <option value="warning">Advarsel</option>
            <option value="fail">Feil</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Ingen rapporter funnet</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl border-2 border-slate-200 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  {getStatusIcon(report.overall_status)}
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">
                      {new Date(report.report_date).toLocaleDateString('no-NO', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h4>
                    <p className="text-sm text-slate-600">
                      Generert: {new Date(report.generated_at).toLocaleString('no-NO')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(report.overall_status)}`}>
                    {report.overall_status === 'pass' ? 'Bestått' :
                     report.overall_status === 'warning' ? 'Advarsel' : 'Feil'}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold">
                    {report.report_type === 'manual' ? 'Manuell' : 'Automatisk'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600 font-semibold mb-1">Temperatur</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {report.temperature_data?.length || 0}
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3">
                  <p className="text-xs text-emerald-600 font-semibold mb-1">Rengjøring</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {report.cleaning_data?.length || 0}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs text-purple-600 font-semibold mb-1">Hygiene</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {report.hygiene_data?.length || 0}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs text-orange-600 font-semibold mb-1">Nedkjøling</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {report.cooling_data?.length || 0}
                  </p>
                </div>
              </div>

              {report.signed_by && (
                <div className="bg-green-50 border-l-4 border-green-500 p-3 mb-4">
                  <p className="text-sm text-green-800">
                    <span className="font-bold">Signert av:</span> {report.signed_by} - {new Date(report.signed_at!).toLocaleString('no-NO')}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => downloadPDF(report)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold"
                >
                  <Download className="w-5 h-5" />
                  Last ned PDF
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
