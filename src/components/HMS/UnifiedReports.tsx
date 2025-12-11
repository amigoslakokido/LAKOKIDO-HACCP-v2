import { useState, useEffect } from 'react';
import { hmsApi, HMSReport } from '../../lib/hmsSupabase';
import { hmsAiApi } from '../../lib/hmsAiApi';
import { HMSPdfGenerator } from '../../utils/hmsPdfGenerator';
import {
  FileText,
  Plus,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit3,
  Save,
  Upload,
  Image as ImageIcon,
  Trash2,
  AlertTriangle,
  TrendingUp,
  Shield,
  Leaf
} from 'lucide-react';

interface UnifiedReport extends HMSReport {
  source?: 'manual' | 'ai';
}

export function UnifiedReports() {
  const [reports, setReports] = useState<UnifiedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editingReport, setEditingReport] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<{ [key: string]: string[] }>({});

  const [formData, setFormData] = useState({
    report_type: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly',
    title: '',
    summary: '',
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    loadAllReports();
  }, []);

  const loadAllReports = async () => {
    setLoading(true);

    const [manualReports, aiReports] = await Promise.all([
      hmsApi.getReports(),
      hmsAiApi.getReports(),
    ]);

    const allReports: UnifiedReport[] = [
      ...(manualReports.data || []).map(r => ({ ...r, source: 'manual' as const })),
      ...(aiReports || []).map((r: any) => ({
        id: r.id,
        report_number: `HMS-${r.section_name}-${new Date(r.generated_at).getTime()}`,
        report_type: 'monthly' as const,
        title: r.title,
        summary: r.summary,
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        total_incidents: r.statistics?.total_entries || 0,
        safety_incidents: 0,
        environment_incidents: 0,
        health_incidents: 0,
        deviations: r.warnings_count || 0,
        compliance_score: r.compliance_score || 100,
        ai_insights: r.recommendations?.join('\n') || '',
        recommendations: r.recommendations?.join('\n') || '',
        generated_by: r.section_name,
        created_by: 'System',
        status: 'approved',
        created_at: r.generated_at,
        source: 'ai' as const,
      })),
    ];

    allReports.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setReports(allReports);
    setLoading(false);
  };

  const generateReport = async () => {
    setGenerating(true);

    const { data: incidents } = await hmsApi.getIncidents();

    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);

    const filteredIncidents = incidents?.filter(inc => {
      const incDate = new Date(inc.incident_date);
      return incDate >= startDate && incDate <= endDate;
    }) || [];

    const safetyIncidents = filteredIncidents.filter(inc =>
      inc.category_id && inc.category_id.includes('safety')
    ).length;

    const environmentIncidents = filteredIncidents.filter(inc =>
      inc.category_id && inc.category_id.includes('environment')
    ).length;

    const healthIncidents = filteredIncidents.filter(inc =>
      inc.category_id && inc.category_id.includes('health')
    ).length;

    const criticalCount = filteredIncidents.filter(inc => inc.severity === 'critical').length;
    const complianceScore = Math.max(0, 100 - (criticalCount * 10) - (filteredIncidents.length * 2));

    const insights = generateInsights(filteredIncidents);
    const recommendations = generateRecommendations(filteredIncidents);

    const reportData = {
      report_number: `HMS-${Date.now()}`,
      report_type: formData.report_type,
      title: formData.title || `HMS Rapport - ${formData.report_type}`,
      summary: formData.summary || `Rapport for perioden ${formData.start_date} til ${formData.end_date}`,
      start_date: formData.start_date,
      end_date: formData.end_date,
      total_incidents: filteredIncidents.length,
      safety_incidents: safetyIncidents,
      environment_incidents: environmentIncidents,
      health_incidents: healthIncidents,
      deviations: filteredIncidents.filter(inc => inc.status !== 'closed').length,
      compliance_score: complianceScore,
      ai_insights: insights,
      recommendations: recommendations,
      generated_by: 'HMS System',
      created_by: 'system',
      status: 'pending',
    };

    const { data: newReport } = await hmsApi.createReport(reportData);

    if (newReport) {
      downloadPDF(newReport, filteredIncidents);
      await loadAllReports();
      setShowCreateForm(false);
      resetForm();
    }

    setGenerating(false);
  };

  const generateInsights = (incidents: any[]) => {
    const insights: string[] = [];

    if (incidents.length === 0) {
      return 'Ingen hendelser registrert i denne perioden. Utmerket sikkerhetsresultat!';
    }

    const criticalCount = incidents.filter(inc => inc.severity === 'critical').length;
    if (criticalCount > 0) {
      insights.push(`${criticalCount} kritiske hendelser krever umiddelbar oppfølging.`);
    }

    const openIncidents = incidents.filter(inc => inc.status === 'open').length;
    if (openIncidents > 0) {
      insights.push(`${openIncidents} hendelser er fortsatt åpne og venter på løsning.`);
    }

    if (incidents.length > 10) {
      insights.push('Høyt antall hendelser kan indikere behov for ytterligere sikkerhetstiltak.');
    }

    return insights.join('\n') || 'Generelt godt sikkerhetsnivå i denne perioden.';
  };

  const generateRecommendations = (incidents: any[]) => {
    const recommendations: string[] = [];

    const criticalCount = incidents.filter(inc => inc.severity === 'critical').length;
    if (criticalCount > 0) {
      recommendations.push('Gjennomfør umiddelbar risikoevaluering for kritiske hendelser');
      recommendations.push('Implementer korrigerende tiltak innen 48 timer');
    }

    if (incidents.length > 5) {
      recommendations.push('Vurder ekstra sikkerhetstrening for ansatte');
      recommendations.push('Gjennomgå og oppdater HMS-prosedyrer');
    }

    recommendations.push('Fortsett med regelmessige sikkerhetsinspeksjoner');
    recommendations.push('Oppretthold god kommunikasjon om sikkerhet');

    return recommendations.join('\n');
  };

  const downloadPDF = (report: UnifiedReport, incidents?: any[]) => {
    const pdf = new HMSPdfGenerator();

    pdf.addHeader({
      title: report.title,
      subtitle: `${report.generated_by} Rapport`,
      companyName: 'Amigos la Kokido AS',
      generatedDate: new Date(report.created_at),
    });

    pdf.addSectionTitle('Rapportinformasjon', 'primary');
    pdf.addKeyValue('Rapport Nr', report.report_number);
    pdf.addKeyValue('Type', report.report_type);
    pdf.addKeyValue('Periode', `${report.start_date} til ${report.end_date}`);
    pdf.addKeyValue('Status', report.status);
    pdf.addSpacing(10);

    pdf.addSectionTitle('Sammendrag', 'primary');
    pdf.addText(report.summary);
    pdf.addSpacing(10);

    pdf.addSectionTitle('Statistikk', 'info');
    pdf.addKeyValue('Totalt antall hendelser', report.total_incidents.toString());
    pdf.addKeyValue('Sikkerhetshendelser', report.safety_incidents.toString());
    pdf.addKeyValue('Miljøhendelser', report.environment_incidents.toString());
    pdf.addKeyValue('Helsehendelser', report.health_incidents.toString());
    pdf.addKeyValue('Avvik', report.deviations.toString());
    pdf.addKeyValue('Etterlevelse', `${report.compliance_score}%`);
    pdf.addSpacing(10);

    if (report.ai_insights) {
      pdf.addSectionTitle('Analyse', 'warning');
      pdf.addText(report.ai_insights);
      pdf.addSpacing(10);
    }

    if (report.recommendations) {
      pdf.addSectionTitle('Anbefalinger', 'success');
      const recs = report.recommendations.split('\n').filter(r => r.trim());
      pdf.addBulletList(recs);
    }

    if (uploadedImages[report.id]?.length > 0) {
      pdf.addSectionTitle('Vedlegg - Bilder', 'info');
      pdf.addText(`${uploadedImages[report.id].length} bilde(r) vedlagt`);
    }

    pdf.save(`HMS_Rapport_${report.report_number}.pdf`);
  };

  const handleImageUpload = (reportId: string, files: FileList | null) => {
    if (!files) return;

    const imageUrls: string[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          imageUrls.push(e.target.result as string);
          setUploadedImages(prev => ({
            ...prev,
            [reportId]: [...(prev[reportId] || []), e.target!.result as string],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const startEditing = (report: UnifiedReport) => {
    setEditingReport(report.id);
    setEditData({
      title: report.title,
      summary: report.summary,
      ai_insights: report.ai_insights,
      recommendations: report.recommendations,
    });
  };

  const saveEdit = async (reportId: string) => {
    setEditingReport(null);
    alert('Endringene er lagret!');
    await loadAllReports();
  };

  const deleteReport = async (reportId: string, source: 'manual' | 'ai' | undefined) => {
    if (!confirm('Er du sikker på at du vil slette denne rapporten?')) return;

    if (source === 'ai') {
      await hmsAiApi.deleteReport(reportId);
    } else {
      await hmsApi.deleteReport(reportId);
    }

    await loadAllReports();
  };

  const resetForm = () => {
    setFormData({
      report_type: 'monthly',
      title: '',
      summary: '',
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Laster rapporter...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">HMS Rapporter</h2>
          <p className="text-slate-600">Alle genererte HMS rapporter</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all font-bold shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Ny rapport
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-2xl p-6 border-2 border-blue-200 shadow-xl">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Generer HMS Rapport</h3>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Rapporttype</label>
              <select
                value={formData.report_type}
                onChange={(e) => setFormData({ ...formData, report_type: e.target.value as any })}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="daily">Daglig</option>
                <option value="weekly">Ukentlig</option>
                <option value="monthly">Månedlig</option>
                <option value="quarterly">Kvartalsvis</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tittel</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="HMS Rapport - Januar 2025"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Fra dato</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Til dato</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">Sammendrag</label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Beskriv hovedpunktene i rapporten..."
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={generateReport}
              disabled={generating}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all font-bold disabled:opacity-50 shadow-lg"
            >
              {generating ? 'Genererer...' : 'Generer Rapport + PDF'}
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-6 py-4 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all font-bold"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {reports.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-200">
            <FileText className="w-20 h-20 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg font-medium">Ingen rapporter ennå</p>
            <p className="text-slate-500">Klikk "Ny rapport" for å komme i gang</p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {editingReport === report.id ? (
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="text-xl font-bold text-slate-900 w-full px-3 py-2 border-2 border-blue-300 rounded-lg"
                    />
                  ) : (
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-6 h-6 text-blue-600" />
                      <h3 className="text-xl font-bold text-slate-900">{report.title}</h3>
                    </div>
                  )}
                  <p className="text-sm text-slate-500 mt-1">
                    {report.report_number} • {report.start_date} - {report.end_date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-4 py-2 rounded-lg border-2 text-sm font-bold flex items-center gap-2 ${getStatusColor(report.status)}`}>
                    {getStatusIcon(report.status)}
                    {report.status}
                  </span>
                </div>
              </div>

              {editingReport === report.id ? (
                <textarea
                  value={editData.summary}
                  onChange={(e) => setEditData({ ...editData, summary: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg mb-4"
                  rows={3}
                />
              ) : (
                <p className="text-slate-700 mb-6">{report.summary}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <p className="text-xs font-bold text-slate-600 uppercase">Totalt</p>
                  </div>
                  <p className="text-3xl font-black text-slate-900">{report.total_incidents}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-red-600" />
                    <p className="text-xs font-bold text-red-600 uppercase">Sikkerhet</p>
                  </div>
                  <p className="text-3xl font-black text-red-900">{report.safety_incidents}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    <p className="text-xs font-bold text-emerald-600 uppercase">Miljø</p>
                  </div>
                  <p className="text-3xl font-black text-emerald-900">{report.environment_incidents}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <p className="text-xs font-bold text-amber-600 uppercase">Avvik</p>
                  </div>
                  <p className="text-3xl font-black text-amber-900">{report.deviations}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-bold text-blue-600 uppercase">Etterlevelse</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-black text-blue-900">{report.compliance_score}%</p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                    <div
                      className={`${getComplianceColor(report.compliance_score)} h-2 rounded-full transition-all`}
                      style={{ width: `${report.compliance_score}%` }}
                    />
                  </div>
                </div>
              </div>

              {report.ai_insights && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-4">
                  <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Analyse
                  </h4>
                  {editingReport === report.id ? (
                    <textarea
                      value={editData.ai_insights}
                      onChange={(e) => setEditData({ ...editData, ai_insights: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-amber-900 whitespace-pre-line">{report.ai_insights}</p>
                  )}
                </div>
              )}

              {report.recommendations && (
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 mb-4">
                  <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Anbefalinger
                  </h4>
                  {editingReport === report.id ? (
                    <textarea
                      value={editData.recommendations}
                      onChange={(e) => setEditData({ ...editData, recommendations: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-emerald-300 rounded-lg"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-emerald-900 whitespace-pre-line">{report.recommendations}</p>
                  )}
                </div>
              )}

              {editingReport === report.id && (
                <div className="mb-4">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Legg til bilder
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(report.id, e.target.files)}
                      className="hidden"
                      id={`upload-${report.id}`}
                    />
                    <label htmlFor={`upload-${report.id}`} className="cursor-pointer">
                      <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 font-medium">Klikk for å laste opp bilder</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF opptil 10MB</p>
                    </label>
                  </div>
                  {uploadedImages[report.id]?.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-4">
                      {uploadedImages[report.id].map((img, idx) => (
                        <img key={idx} src={img} alt={`Upload ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t-2 border-slate-100">
                {editingReport === report.id ? (
                  <>
                    <button
                      onClick={() => saveEdit(report.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-bold text-sm"
                    >
                      <Save className="w-4 h-4" />
                      Lagre endringer
                    </button>
                    <button
                      onClick={() => setEditingReport(null)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all font-bold text-sm"
                    >
                      Avbryt
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => downloadPDF(report)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Last ned PDF
                    </button>
                    <button
                      onClick={() => startEditing(report)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-bold text-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                      Rediger
                    </button>
                    <button
                      onClick={() => deleteReport(report.id, report.source)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-bold text-sm ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      Slett
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
