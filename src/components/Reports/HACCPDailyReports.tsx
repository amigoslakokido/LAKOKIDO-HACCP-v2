import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Download, CheckCircle, XCircle, AlertTriangle, Loader, Search, Filter, Edit2, Trash2, Save, X, User, Thermometer, Droplet, Sparkles, Wind, Clock, Calendar as CalendarIcon } from 'lucide-react';
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
  const [editingReport, setEditingReport] = useState<HACCPReport | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editSignedBy, setEditSignedBy] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'fail': return <XCircle className="w-6 h-6 text-red-600" />;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">HACCP Daglige Rapporter</h2>
        <p className="text-blue-100">Oversikt over alle genererte rapporter</p>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Søk etter dato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-600" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
          >
            <option value="all">Alle statuser</option>
            <option value="pass">Bestått</option>
            <option value="warning">Advarsel</option>
            <option value="fail">Feil</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {filteredReports.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-slate-200">
            <FileText className="w-20 h-20 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-xl font-semibold">Ingen rapporter funnet</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all overflow-hidden"
            >
              {editingReport?.id === report.id ? (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold text-slate-800">
                      Rediger rapport - {new Date(report.report_date).toLocaleDateString('no-NO')}
                    </h4>
                    <button
                      onClick={cancelEditing}
                      className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                      <X className="w-6 h-6 text-slate-600" />
                    </button>
                  </div>

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

                  {!report.signed_by && (
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
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold disabled:opacity-50 text-lg"
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
                  </div>
                </div>
              ) : (
                <>
                  <div className={`p-6 border-b-4 ${getStatusColor(report.overall_status)}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(report.overall_status)}
                        <div>
                          <h4 className="text-2xl font-bold text-slate-800">
                            {new Date(report.report_date).toLocaleDateString('no-NO', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h4>
                          <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4" />
                            Generert: {new Date(report.generated_at).toLocaleString('no-NO')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-full text-base font-bold border-2 ${getStatusColor(report.overall_status)}`}>
                          {report.overall_status === 'pass' ? 'Bestått' :
                           report.overall_status === 'warning' ? 'Advarsel' : 'Feil'}
                        </span>
                        <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-base font-semibold border-2 border-slate-300">
                          {report.report_type === 'manual' ? 'Manuell' : 'Automatisk'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Thermometer className="w-5 h-5 text-blue-600" />
                          <p className="text-xs text-blue-700 font-bold uppercase">Temperatur</p>
                        </div>
                        <p className="text-3xl font-bold text-blue-800">
                          {report.temperature_data?.length || 0}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">målinger</p>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border-2 border-emerald-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5 text-emerald-600" />
                          <p className="text-xs text-emerald-700 font-bold uppercase">Rengjøring</p>
                        </div>
                        <p className="text-3xl font-bold text-emerald-800">
                          {report.cleaning_data?.length || 0}
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">oppgaver</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Droplet className="w-5 h-5 text-purple-600" />
                          <p className="text-xs text-purple-700 font-bold uppercase">Hygiene</p>
                        </div>
                        <p className="text-3xl font-bold text-purple-800">
                          {report.hygiene_data?.length || 0}
                        </p>
                        <p className="text-xs text-purple-600 mt-1">kontroller</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Wind className="w-5 h-5 text-orange-600" />
                          <p className="text-xs text-orange-700 font-bold uppercase">Nedkjøling</p>
                        </div>
                        <p className="text-3xl font-bold text-orange-800">
                          {report.cooling_data?.length || 0}
                        </p>
                        <p className="text-xs text-orange-600 mt-1">logger</p>
                      </div>
                    </div>
                  </div>

                  {expandedReport === report.id && (
                    <div className="p-6 bg-slate-50 space-y-6">
                      {report.temperature_data && report.temperature_data.length > 0 && (
                        <div className="bg-white rounded-xl p-6 border-2 border-blue-200">
                          <div className="flex items-center gap-3 mb-4">
                            <Thermometer className="w-6 h-6 text-blue-600" />
                            <h5 className="text-lg font-bold text-blue-800">Temperaturmålinger</h5>
                          </div>
                          <div className="grid gap-3">
                            {report.temperature_data.map((temp: any, idx: number) => (
                              <div key={idx} className={`p-3 rounded-lg border-2 ${getTempStatusColor(temp.status)}`}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-bold">{temp.zone?.name || 'Ukjent sone'}</p>
                                    <p className="text-sm text-slate-600">
                                      {temp.equipment?.name || ''}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-2xl font-bold">{temp.temperature}°C</p>
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

                      {report.cleaning_data && report.cleaning_data.length > 0 && (
                        <div className="bg-white rounded-xl p-6 border-2 border-emerald-200">
                          <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="w-6 h-6 text-emerald-600" />
                            <h5 className="text-lg font-bold text-emerald-800">Rengjøringsoppgaver</h5>
                          </div>
                          <div className="grid gap-3">
                            {report.cleaning_data.map((clean: any, idx: number) => (
                              <div key={idx} className={`p-3 rounded-lg border-2 ${clean.completed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {clean.completed ? (
                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                    ) : (
                                      <XCircle className="w-5 h-5 text-red-600" />
                                    )}
                                    <div>
                                      <p className="font-bold">{clean.task?.name || 'Ukjent oppgave'}</p>
                                      <p className="text-sm text-slate-600">
                                        {clean.employee?.name || ''}
                                      </p>
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

                      {report.hygiene_data && report.hygiene_data.length > 0 && (
                        <div className="bg-white rounded-xl p-6 border-2 border-purple-200">
                          <div className="flex items-center gap-3 mb-4">
                            <Droplet className="w-6 h-6 text-purple-600" />
                            <h5 className="text-lg font-bold text-purple-800">Hygienekontroller</h5>
                          </div>
                          <div className="grid gap-3">
                            {report.hygiene_data.map((hygiene: any, idx: number) => (
                              <div key={idx} className="p-3 rounded-lg border-2 bg-purple-50 border-purple-200">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-bold">{hygiene.employee?.name || 'Ukjent'}</p>
                                    <div className="flex gap-4 mt-2">
                                      <span className={`text-sm ${hygiene.hands_washed ? 'text-green-700' : 'text-red-700'}`}>
                                        Hender: {hygiene.hands_washed ? 'OK' : 'Mangler'}
                                      </span>
                                      <span className={`text-sm ${hygiene.uniform_clean ? 'text-green-700' : 'text-red-700'}`}>
                                        Uniform: {hygiene.uniform_clean ? 'OK' : 'Mangler'}
                                      </span>
                                      <span className={`text-sm ${hygiene.hair_covered ? 'text-green-700' : 'text-red-700'}`}>
                                        Hår: {hygiene.hair_covered ? 'OK' : 'Mangler'}
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

                      {report.cooling_data && report.cooling_data.length > 0 && (
                        <div className="bg-white rounded-xl p-6 border-2 border-orange-200">
                          <div className="flex items-center gap-3 mb-4">
                            <Wind className="w-6 h-6 text-orange-600" />
                            <h5 className="text-lg font-bold text-orange-800">Nedkjølingslogg</h5>
                          </div>
                          <div className="grid gap-3">
                            {report.cooling_data.map((cooling: any, idx: number) => (
                              <div key={idx} className="p-3 rounded-lg border-2 bg-orange-50 border-orange-200">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-bold">{cooling.product_name || cooling.product_type || 'Ukjent produkt'}</p>
                                    <p className="text-sm text-slate-600">
                                      Mengde: {cooling.quantity} {cooling.unit}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xl font-bold text-orange-800">
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
                    </div>
                  )}

                  <div className="p-6 space-y-4">
                    {report.notes && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <p className="text-sm text-blue-900">
                          <span className="font-bold">Merknader:</span> {report.notes}
                        </p>
                      </div>
                    )}

                    {report.signed_by && (
                      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg flex items-center gap-3">
                        <User className="w-5 h-5 text-green-700" />
                        <p className="text-sm text-green-900">
                          <span className="font-bold">Signert av:</span> {report.signed_by} - {new Date(report.signed_at!).toLocaleString('no-NO')}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                        className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all font-bold text-lg"
                      >
                        <FileText className="w-5 h-5" />
                        {expandedReport === report.id ? 'Skjul detaljer' : 'Vis detaljer'}
                      </button>
                      <button
                        onClick={() => startEditing(report)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold text-lg"
                      >
                        <Edit2 className="w-5 h-5" />
                        Rediger
                      </button>
                      <button
                        onClick={() => downloadPDF(report)}
                        className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-bold text-lg"
                      >
                        <Download className="w-5 h-5" />
                        Last ned PDF
                      </button>
                      <button
                        onClick={() => deleteReport(report.id, report.report_date)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-bold text-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                        Slett
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
