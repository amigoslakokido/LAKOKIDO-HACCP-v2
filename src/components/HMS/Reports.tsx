import { useState, useEffect } from 'react';
import { hmsApi, HMSReport } from '../../lib/hmsSupabase';
import { FileText, Plus, Download, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import jsPDF from 'jspdf';

export function Reports() {
  const [reports, setReports] = useState<HMSReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState({
    report_type: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly',
    title: '',
    summary: '',
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    const { data } = await hmsApi.getReports();
    if (data) setReports(data);
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

    const safetyIncidents = filteredIncidents.filter(inc => {
      return inc.category_id && inc.category_id.includes('safety');
    }).length;

    const environmentIncidents = filteredIncidents.filter(inc => {
      return inc.category_id && inc.category_id.includes('environment');
    }).length;

    const healthIncidents = filteredIncidents.filter(inc => {
      return inc.category_id && inc.category_id.includes('health');
    }).length;

    const criticalCount = filteredIncidents.filter(inc => inc.severity === 'critical').length;
    const complianceScore = Math.max(0, 100 - (criticalCount * 10) - (filteredIncidents.length * 2));

    const aiInsights = generateAIInsights(filteredIncidents);
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
      ai_insights: aiInsights,
      recommendations: recommendations,
      generated_by: 'HMS System',
      created_by: 'system',
      status: 'pending',
    };

    const { data: newReport } = await hmsApi.createReport(reportData);

    if (newReport) {
      generatePDF(newReport, filteredIncidents);
      await loadReports();
      setShowCreateForm(false);
      resetForm();
    }

    setGenerating(false);
  };

  const generateAIInsights = (incidents: any[]) => {
    const insights: string[] = [];

    if (incidents.length === 0) {
      return 'Ingen hendelser registrert i denne perioden. Utmerket sikkerhetsresultat!';
    }

    const criticalCount = incidents.filter(inc => inc.severity === 'critical').length;
    if (criticalCount > 0) {
      insights.push(`⚠️ ${criticalCount} kritiske hendelser krever umiddelbar oppfølging.`);
    }

    const openIncidents = incidents.filter(inc => inc.status === 'open').length;
    if (openIncidents > 0) {
      insights.push(`📋 ${openIncidents} hendelser er fortsatt åpne og venter på løsning.`);
    }

    if (incidents.length > 10) {
      insights.push('📈 Høyt antall hendelser kan indikere behov for ytterligere sikkerhetstiltak.');
    }

    return insights.join('\n') || 'Generelt godt sikkerhetsnivå i denne perioden.';
  };

  const generateRecommendations = (incidents: any[]) => {
    const recommendations: string[] = [];

    const criticalCount = incidents.filter(inc => inc.severity === 'critical').length;
    if (criticalCount > 0) {
      recommendations.push('• Gjennomfør umiddelbar risikoevaluering for kritiske hendelser');
      recommendations.push('• Implementer korrigerende tiltak innen 48 timer');
    }

    if (incidents.length > 5) {
      recommendations.push('• Vurder ekstra sikkerhetstrening for ansatte');
      recommendations.push('• Gjennomgå og oppdater HMS-prosedyrer');
    }

    recommendations.push('• Fortsett med regelmessige sikkerhetsinspeksjoner');
    recommendations.push('• Oppretthold god kommunikasjon om sikkerhet');

    return recommendations.join('\n');
  };

  const generatePDF = (report: HMSReport, incidents: any[]) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('HMS RAPPORT', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rapport Nr: ${report.report_number}`, 20, 40);
    doc.text(`Type: ${report.report_type}`, 20, 50);
    doc.text(`Periode: ${report.start_date} til ${report.end_date}`, 20, 60);
    doc.text(`Dato generert: ${new Date().toLocaleDateString('nb-NO')}`, 20, 70);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SAMMENDRAG', 20, 90);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(report.summary, 170);
    doc.text(summaryLines, 20, 100);

    let yPosition = 100 + (summaryLines.length * 7) + 10;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('STATISTIKK', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Totalt antall hendelser: ${report.total_incidents}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Sikkerhetshendelser: ${report.safety_incidents}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Miljøhendelser: ${report.environment_incidents}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Helsehendelser: ${report.health_incidents}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Avvik: ${report.deviations}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Compliance Score: ${report.compliance_score}%`, 20, yPosition);
    yPosition += 15;

    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('AI INNSIKT', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const insightLines = doc.splitTextToSize(report.ai_insights || '', 170);
    doc.text(insightLines, 20, yPosition);
    yPosition += (insightLines.length * 5) + 10;

    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ANBEFALINGER', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const recLines = doc.splitTextToSize(report.recommendations || '', 170);
    doc.text(recLines, 20, yPosition);

    doc.addPage();
    doc.setFontSize(10);
    doc.text('I henhold til Arbeidstilsynet og Mattilsynet forskrifter', 105, 280, { align: 'center' });

    doc.save(`HMS_Rapport_${report.report_number}.pdf`);
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
          <p className="text-slate-600">Official Reports</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-bold"
        >
          <Plus className="w-5 h-5" />
          Ny rapport
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-2xl p-6 border-2 border-purple-200">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Generer HMS Rapport</h3>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Rapporttype</label>
              <select
                value={formData.report_type}
                onChange={(e) => setFormData({ ...formData, report_type: e.target.value as any })}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                placeholder="HMS Rapport - Januar 2025"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Fra dato</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Til dato</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">Sammendrag</label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              rows={4}
              placeholder="Beskriv hovedpunktene i rapporten..."
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={generateReport}
              disabled={generating}
              className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-bold disabled:opacity-50"
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

      <div className="grid gap-4">
        {reports.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Ingen rapporter ennå</p>
            <p className="text-slate-500">No reports yet</p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-purple-300 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{report.title}</h3>
                    <p className="text-sm text-slate-500">
                      {report.start_date} - {report.end_date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-4 py-2 rounded-lg border-2 text-sm font-bold flex items-center gap-2 ${getStatusColor(report.status)}`}>
                    {getStatusIcon(report.status)}
                    {report.status}
                  </span>
                </div>
              </div>

              <p className="text-slate-700 mb-4">{report.summary}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-600 mb-1">Totalt</p>
                  <p className="text-2xl font-black text-slate-900">{report.total_incidents}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-red-600 mb-1">Sikkerhet</p>
                  <p className="text-2xl font-black text-red-900">{report.safety_incidents}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3">
                  <p className="text-xs text-emerald-600 mb-1">Miljø</p>
                  <p className="text-2xl font-black text-emerald-900">{report.environment_incidents}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600 mb-1">Compliance</p>
                  <p className="text-2xl font-black text-blue-900">{report.compliance_score}%</p>
                </div>
              </div>

              <button
                onClick={() => generatePDF(report, [])}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-bold text-sm"
              >
                <Download className="w-4 h-4" />
                Last ned PDF
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
