import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Download, CheckCircle, XCircle, AlertTriangle, Loader, Search, Filter, Edit2, Trash2, Save, X, User, Thermometer, Droplet, Sparkles, Wind, Clock, Calendar as CalendarIcon, Eye, ChevronRight } from 'lucide-react';
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

export function HACCPDailyReports() {
  const [reports, setReports] = useState<HACCPReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingReport, setViewingReport] = useState<HACCPReport | null>(null);
  const [editingReport, setEditingReport] = useState<HACCPReport | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editSignedBy, setEditSignedBy] = useState('');
  const [saving, setSaving] = useState(false);

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

  const startEditing = (report: HACCPReport) => {
    setEditingReport(report);
    setEditNotes(report.notes || '');
    setEditSignedBy(report.signed_by || '');
  };

  const cancelEditing = () => {
    setEditingReport(null);
    setEditNotes('');
    setEditSignedBy('');
  };

  const saveReport = async () => {
    if (!editingReport) return;

    try {
      setSaving(true);
      const updateData: any = {
        notes: editNotes || null,
      };

      if (editSignedBy && !editingReport.signed_by) {
        updateData.signed_by = editSignedBy;
        updateData.signed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('haccp_daily_reports')
        .update(updateData)
        .eq('id', editingReport.id);

      if (error) throw error;

      alert('Rapport oppdatert!');
      cancelEditing();
      fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Feil ved oppdatering av rapport');
    } finally {
      setSaving(false);
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

  const downloadPDF = async (report: HACCPReport) => {
    const pdf = new jsPDF();
    let yPos = 20;

    try {
      const img = new Image();
      img.src = '/visas.jpg';
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
      pdf.addImage(img, 'JPEG', 150, 10, 40, 20);
    } catch (error) {
      console.error('Error loading logo:', error);
    }

    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('HACCP Daglig Rapport', 20, yPos);
    yPos += 10;

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

    const statusText = report.overall_status === 'pass' ? 'Bestatt' :
                       report.overall_status === 'warning' ? 'Advarsel' : 'Feil';
    pdf.text(`Status: ${statusText}`, 20, yPos);
    yPos += 15;

    if (report.temperature_data && report.temperature_data.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Temperaturlogg', 20, yPos);
      yPos += 7;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      report.temperature_data.forEach((temp: any) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        const zoneName = temp.zone?.name || 'Ukjent';
        const tempValue = temp.temperature ? `${temp.temperature}C` : 'N/A';
        const time = temp.timestamp ? new Date(temp.timestamp).toLocaleTimeString('no-NO') : '';
        pdf.text(`${zoneName}: ${tempValue} (${time})`, 25, yPos);
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
      pdf.text('Rengjoringsoppgaver', 20, yPos);
      yPos += 7;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      report.cleaning_data.forEach((clean: any) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        const taskName = clean.task?.name || 'Ukjent oppgave';
        const status = clean.completed ? 'OK' : 'Mangler';
        const time = clean.timestamp ? new Date(clean.timestamp).toLocaleTimeString('no-NO') : '';
        pdf.text(`${status} ${taskName} (${time})`, 25, yPos);
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
      pdf.text('Hygienekontroller', 20, yPos);
      yPos += 7;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      report.hygiene_data.forEach((hygiene: any) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        const time = hygiene.timestamp ? new Date(hygiene.timestamp).toLocaleTimeString('no-NO') : '';
        const hands = hygiene.hands_washed ? 'OK' : 'Mangler';
        const uniform = hygiene.uniform_clean ? 'OK' : 'Mangler';
        pdf.text(`${time} - Hender: ${hands}, Uniform: ${uniform}`, 25, yPos);
        yPos += 6;
      });
      yPos += 5;
    }

    if (report.cooling_data && report.cooling_data.length > 0) {
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Nedkjolingslogg', 20, yPos);
      yPos += 7;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      report.cooling_data.forEach((cooling: any) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        const product = cooling.product_name || cooling.product_type || 'Ukjent';
        const temp = cooling.target_temperature ? `${cooling.target_temperature}C` : 'N/A';
        pdf.text(`${product}: ${temp}`, 25, yPos);
        yPos += 6;
      });
      yPos += 5;
    }

    if (report.notes) {
      if (yPos > 240) {
        pdf.addPage();
        yPos = 20;
      }
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Merknader', 20, yPos);
      yPos += 7;
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(report.notes, 170);
      pdf.text(lines, 20, yPos);
      yPos += lines.length * 6 + 5;
    }

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

  const getStatusIcon = (status: string, size: string = 'w-5 h-5') => {
    switch (status) {
      case 'pass': return <CheckCircle className={`${size} text-green-600`} />;
      case 'warning': return <AlertTriangle className={`${size} text-yellow-600`} />;
      case 'fail': return <XCircle className={`${size} text-red-600`} />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800 border-green-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'fail': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTempStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-50 border-green-200 text-green-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'danger': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  const openViewModal = (report: HACCPReport) => {
    setViewingReport(report);
  };

  const closeViewModal = () => {
    setViewingReport(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl p-4 text-white">
        <h2 className="text-xl font-bold mb-1">HACCP Daglige Rapporter</h2>
        <p className="text-blue-100 text-sm">Oversikt over alle genererte rapporter</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Søk etter dato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-600" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold"
          >
            <option value="all">Alle statuser</option>
            <option value="pass">Bestått</option>
            <option value="warning">Advarsel</option>
            <option value="fail">Feil</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12 bg-slate-50">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 text-lg font-semibold">Ingen rapporter funnet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="p-4 hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(report.overall_status, 'w-8 h-8')}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-base font-bold text-slate-800">
                          {new Date(report.report_date).toLocaleDateString('no-NO', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(report.overall_status)}`}>
                          {report.overall_status === 'pass' ? 'Bestått' :
                           report.overall_status === 'warning' ? 'Advarsel' : 'Feil'}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                          {report.report_type === 'manual' ? 'Manuell' : 'Auto'}
                        </span>
                        {report.signed_by && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Signert
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Thermometer className="w-3 h-3" />
                          {report.temperature_data?.length || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {report.cleaning_data?.length || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Droplet className="w-3 h-3" />
                          {report.hygiene_data?.length || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Wind className="w-3 h-3" />
                          {report.cooling_data?.length || 0}
                        </span>
                        <span className="text-slate-500">
                          {new Date(report.generated_at).toLocaleString('no-NO', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openViewModal(report)}
                      className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                      title="Vis detaljer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startEditing(report)}
                      className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all"
                      title="Rediger"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => downloadPDF(report)}
                      className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all"
                      title="Last ned PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteReport(report.id, report.report_date)}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                      title="Slett"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
        )}
      </div>

      {/* View Modal */}
      {viewingReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className={`p-6 border-b-4 ${getStatusColor(viewingReport.overall_status)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getStatusIcon(viewingReport.overall_status, 'w-8 h-8')}
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">
                      {new Date(viewingReport.report_date).toLocaleDateString('no-NO', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4" />
                      Generert: {new Date(viewingReport.generated_at).toLocaleString('no-NO')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeViewModal}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-slate-600" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3 mt-4">
                <div className="bg-white bg-opacity-50 rounded-lg p-3 border">
                  <div className="flex items-center gap-2 mb-1">
                    <Thermometer className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-slate-700 font-bold">Temperatur</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{viewingReport.temperature_data?.length || 0}</p>
                </div>
                <div className="bg-white bg-opacity-50 rounded-lg p-3 border">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <p className="text-xs text-slate-700 font-bold">Rengjøring</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{viewingReport.cleaning_data?.length || 0}</p>
                </div>
                <div className="bg-white bg-opacity-50 rounded-lg p-3 border">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplet className="w-4 h-4 text-purple-600" />
                    <p className="text-xs text-slate-700 font-bold">Hygiene</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{viewingReport.hygiene_data?.length || 0}</p>
                </div>
                <div className="bg-white bg-opacity-50 rounded-lg p-3 border">
                  <div className="flex items-center gap-2 mb-1">
                    <Wind className="w-4 h-4 text-orange-600" />
                    <p className="text-xs text-slate-700 font-bold">Nedkjøling</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{viewingReport.cooling_data?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {viewingReport.temperature_data && viewingReport.temperature_data.length > 0 && (
                <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Thermometer className="w-6 h-6 text-blue-600" />
                    <h5 className="text-lg font-bold text-blue-800">Temperaturmålinger</h5>
                  </div>
                  <div className="grid gap-2 max-h-64 overflow-y-auto">
                    {viewingReport.temperature_data.map((temp: any, idx: number) => (
                      <div key={idx} className={`p-2 rounded-lg border ${getTempStatusColor(temp.status)}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-sm">{temp.zone?.name || 'Ukjent sone'}</p>
                            <p className="text-xs text-slate-600">{temp.equipment?.name || ''}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold">{temp.temperature}°C</p>
                            <p className="text-xs text-slate-600">
                              {new Date(temp.timestamp).toLocaleTimeString('no-NO')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingReport.cleaning_data && viewingReport.cleaning_data.length > 0 && (
                <div className="bg-white rounded-xl p-4 border-2 border-emerald-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-6 h-6 text-emerald-600" />
                    <h5 className="text-lg font-bold text-emerald-800">Rengjøringsoppgaver</h5>
                  </div>
                  <div className="grid gap-2 max-h-64 overflow-y-auto">
                    {viewingReport.cleaning_data.map((clean: any, idx: number) => (
                      <div key={idx} className={`p-2 rounded-lg border ${clean.completed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {clean.completed ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <div>
                              <p className="font-bold text-sm">{clean.task?.name || 'Ukjent oppgave'}</p>
                              <p className="text-xs text-slate-600">{clean.employee?.name || ''}</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600">
                            {new Date(clean.timestamp).toLocaleTimeString('no-NO')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingReport.hygiene_data && viewingReport.hygiene_data.length > 0 && (
                <div className="bg-white rounded-xl p-4 border-2 border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Droplet className="w-6 h-6 text-purple-600" />
                    <h5 className="text-lg font-bold text-purple-800">Hygienekontroller</h5>
                  </div>
                  <div className="grid gap-2 max-h-64 overflow-y-auto">
                    {viewingReport.hygiene_data.map((hygiene: any, idx: number) => (
                      <div key={idx} className="p-2 rounded-lg border bg-purple-50 border-purple-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-sm">{hygiene.employee?.name || 'Ukjent'}</p>
                            <div className="flex gap-3 mt-1">
                              <span className={`text-xs ${hygiene.hands_washed ? 'text-green-700' : 'text-red-700'}`}>
                                Hender: {hygiene.hands_washed ? 'OK' : 'X'}
                              </span>
                              <span className={`text-xs ${hygiene.uniform_clean ? 'text-green-700' : 'text-red-700'}`}>
                                Uniform: {hygiene.uniform_clean ? 'OK' : 'X'}
                              </span>
                              <span className={`text-xs ${hygiene.hair_covered ? 'text-green-700' : 'text-red-700'}`}>
                                Hår: {hygiene.hair_covered ? 'OK' : 'X'}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600">
                            {new Date(hygiene.timestamp).toLocaleTimeString('no-NO')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingReport.cooling_data && viewingReport.cooling_data.length > 0 && (
                <div className="bg-white rounded-xl p-4 border-2 border-orange-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Wind className="w-6 h-6 text-orange-600" />
                    <h5 className="text-lg font-bold text-orange-800">Nedkjølingslogg</h5>
                  </div>
                  <div className="grid gap-2 max-h-64 overflow-y-auto">
                    {viewingReport.cooling_data.map((cooling: any, idx: number) => (
                      <div key={idx} className="p-2 rounded-lg border bg-orange-50 border-orange-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-sm">{cooling.product_name || cooling.product_type || 'Ukjent produkt'}</p>
                            <p className="text-xs text-slate-600">
                              Mengde: {cooling.quantity} {cooling.unit}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-orange-800">
                              {cooling.target_temperature}°C
                            </p>
                            <p className="text-xs text-slate-600">
                              {new Date(cooling.timestamp).toLocaleTimeString('no-NO')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingReport.notes && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <p className="text-sm text-blue-900">
                    <span className="font-bold">Merknader:</span> {viewingReport.notes}
                  </p>
                </div>
              )}

              {viewingReport.signed_by && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg flex items-center gap-3">
                  <User className="w-5 h-5 text-green-700" />
                  <p className="text-sm text-green-900">
                    <span className="font-bold">Signert av:</span> {viewingReport.signed_by} - {new Date(viewingReport.signed_at!).toLocaleString('no-NO')}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-slate-50 flex gap-3">
              <button
                onClick={() => {
                  closeViewModal();
                  startEditing(viewingReport);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold"
              >
                <Edit2 className="w-4 h-4" />
                Rediger
              </button>
              <button
                onClick={() => {
                  downloadPDF(viewingReport);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-bold"
              >
                <Download className="w-4 h-4" />
                Last ned PDF
              </button>
              <button
                onClick={closeViewModal}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all font-bold"
              >
                Lukk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  Rediger rapport - {new Date(editingReport.report_date).toLocaleDateString('no-NO')}
                </h3>
                <button
                  onClick={cancelEditing}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Merknader
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Legg til merknader..."
                />
              </div>

              {!editingReport.signed_by && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Signatur (Daglig leder)
                  </label>
                  <input
                    type="text"
                    value={editSignedBy}
                    onChange={(e) => setEditSignedBy(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Navn på Daglig leder..."
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={saveReport}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Lagrer...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Lagre endringer
                    </>
                  )}
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all font-bold"
                >
                  Avbryt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
