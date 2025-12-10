import { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Download,
  Settings,
  RefreshCw,
  FileText,
  Eye,
  Trash2,
  Clock,
  Target,
  BarChart3,
  Shield,
  Zap
} from 'lucide-react';
import { hmsAiApi } from '../../lib/hmsAiApi';
import { HMSPdfGenerator } from '../../utils/hmsPdfGenerator';

interface AIConfig {
  openai_api_key?: string;
  ai_model: string;
  analysis_frequency: string;
  enabled: boolean;
  auto_generate_reports: boolean;
  analysis_depth: string;
  language: string;
}

export function AIAnalytics() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analyses' | 'reports' | 'insights' | 'settings'>('dashboard');
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [configForm, setConfigForm] = useState({
    openai_api_key: '',
    ai_model: 'gpt-4o-mini',
    analysis_frequency: 'daily',
    enabled: false,
    auto_generate_reports: true,
    analysis_depth: 'detailed',
    language: 'no',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [configData, analysesData, reportsData, insightsData] = await Promise.all([
      hmsAiApi.getConfig(),
      hmsAiApi.getAnalyses(),
      hmsAiApi.getReports(),
      hmsAiApi.getInsights(),
    ]);

    if (configData) {
      setConfig(configData);
      setConfigForm({
        openai_api_key: configData.openai_api_key || '',
        ai_model: configData.ai_model,
        analysis_frequency: configData.analysis_frequency,
        enabled: configData.enabled,
        auto_generate_reports: configData.auto_generate_reports,
        analysis_depth: configData.analysis_depth,
        language: configData.language,
      });
    }

    setAnalyses(analysesData);
    setReports(reportsData);
    setInsights(insightsData);
    setLoading(false);
  };

  const handleSaveConfig = async () => {
    const success = await hmsAiApi.updateConfig(configForm);
    if (success) {
      alert('AI-konfigurasjon lagret!');
      setShowSettings(false);
      loadData();
    } else {
      alert('Kunne ikke lagre konfigurasjon');
    }
  };

  const handleAnalyzeAll = async () => {
    if (!config?.enabled) {
      alert('AI-systemet er ikke aktivert. Vennligst konfigurer API-nøkkel i innstillinger.');
      setShowSettings(true);
      return;
    }

    setAnalyzing(true);
    try {
      await hmsAiApi.analyzeAllSections();
      alert('Analyse fullført for alle seksjoner!');
      await loadData();
    } catch (error) {
      alert('Feil under analyse');
    }
    setAnalyzing(false);
  };

  const handleGenerateAllReports = async () => {
    if (!config?.enabled) {
      alert('AI-systemet er ikke aktivert. Vennligst konfigurer API-nøkkel i innstillinger.');
      setShowSettings(true);
      return;
    }

    setGenerating(true);
    try {
      await hmsAiApi.generateAllReports();
      alert('Rapporter generert for alle seksjoner!');
      await loadData();
    } catch (error) {
      alert('Feil under rapportgenerering');
    }
    setGenerating(false);
  };

  const handleDownloadReport = (report: any) => {
    const pdf = new HMSPdfGenerator();

    pdf.addHeader({
      title: report.title,
      subtitle: `AI-generert rapport for ${report.section_name}`,
      companyName: 'LA Kokido',
      generatedDate: new Date(report.generated_at),
    });

    pdf.addSectionTitle('Sammendrag', 'primary');
    pdf.addText(report.summary);
    pdf.addSpacing(5);

    pdf.addSectionTitle('Statistikk', 'primary');
    const stats = report.statistics;
    pdf.addBulletList([
      `Totale oppføringer: ${stats.total_entries || 0}`,
      `Kritiske funn: ${report.critical_findings}`,
      `Advarsler: ${report.warnings_count}`,
      `Etterlevelsesscore: ${report.compliance_score}%`,
    ]);
    pdf.addSpacing(5);

    if (report.recommendations && report.recommendations.length > 0) {
      pdf.addSectionTitle('Anbefalinger', 'success');
      pdf.addNumberedList(report.recommendations.slice(0, 10));
    }

    pdf.save(`${report.section_name}-rapport-${new Date(report.generated_at).toISOString().split('T')[0]}.pdf`);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Laster AI Analytics...</div>;
  }

  const criticalCount = analyses.filter(a => a.severity === 'critical' || a.severity === 'high').length;
  const avgCompliance = reports.length > 0
    ? Math.round(reports.reduce((sum, r) => sum + r.compliance_score, 0) / reports.length)
    : 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="text-blue-600" />
            AI Analytics & Rapporter
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Intelligent analyse og rapportgenerering for alle HMS-seksjoner
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <Settings className="w-4 h-4" />
            Innstillinger
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            AI-konfigurasjon
          </h3>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900">OpenAI API Integration</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    For å aktivere avansert AI-analyse, trenger du en OpenAI API-nøkkel.
                    Gå til <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com</a> for å opprette en.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OpenAI API Key (valgfritt)
              </label>
              <input
                type="password"
                value={configForm.openai_api_key}
                onChange={(e) => setConfigForm({ ...configForm, openai_api_key: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="sk-..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Hvis ingen nøkkel er oppgitt, vil systemet bruke lokal analyse med begrenset funksjonalitet.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AI-modell
                </label>
                <select
                  value={configForm.ai_model}
                  onChange={(e) => setConfigForm({ ...configForm, ai_model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gpt-4o-mini">GPT-4o Mini (Rask & Rimelig)</option>
                  <option value="gpt-4o">GPT-4o (Beste kvalitet)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Økonomisk)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Analysedybde
                </label>
                <select
                  value={configForm.analysis_depth}
                  onChange={(e) => setConfigForm({ ...configForm, analysis_depth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">Grunnleggende</option>
                  <option value="detailed">Detaljert</option>
                  <option value="comprehensive">Omfattende</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={configForm.enabled}
                  onChange={(e) => setConfigForm({ ...configForm, enabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Aktiver AI-system</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={configForm.auto_generate_reports}
                  onChange={(e) => setConfigForm({ ...configForm, auto_generate_reports: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Auto-generer rapporter</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Avbryt
              </button>
              <button
                onClick={handleSaveConfig}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <CheckCircle className="w-4 h-4" />
                Lagre konfigurasjon
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{analyses.length}</span>
          </div>
          <div className="text-sm font-medium opacity-90">Totale analyser</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{criticalCount}</span>
          </div>
          <div className="text-sm font-medium opacity-90">Kritiske funn</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{avgCompliance}%</span>
          </div>
          <div className="text-sm font-medium opacity-90">Etterlevelse</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{reports.length}</span>
          </div>
          <div className="text-sm font-medium opacity-90">Genererte rapporter</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Hurtighandlinger</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleAnalyzeAll}
            disabled={analyzing || !config?.enabled}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Analyserer...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Analyser alle seksjoner
              </>
            )}
          </button>

          <button
            onClick={handleGenerateAllReports}
            disabled={generating || !config?.enabled}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Genererer...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Generer alle rapporter
              </>
            )}
          </button>
        </div>

        {!config?.enabled && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">AI-systemet er ikke aktivert</p>
                <p className="mt-1">
                  Klikk på "Innstillinger" for å konfigurere OpenAI API-nøkkel og aktivere systemet.
                  Uten API-nøkkel vil du få begrenset funksjonalitet med lokal analyse.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        {[
          { id: 'reports', label: 'Rapporter', icon: FileText },
          { id: 'analyses', label: 'Analyser', icon: Target },
          { id: 'insights', label: 'Innsikter', icon: Sparkles },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 font-medium ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Ingen rapporter generert ennå</p>
              <button
                onClick={handleGenerateAllReports}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Generer rapporter
              </button>
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{report.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        report.compliance_score >= 90 ? 'bg-green-100 text-green-800' :
                        report.compliance_score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.compliance_score}% etterlevelse
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{report.summary}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        {report.critical_findings} kritiske
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        {report.warnings_count} advarsler
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(report.generated_at).toLocaleDateString('nb-NO')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadReport(report)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Last ned PDF"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('Er du sikker på at du vil slette denne rapporten?')) {
                          await hmsAiApi.deleteReport(report.id);
                          loadData();
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Slett"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {report.recommendations && report.recommendations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Viktigste anbefalinger:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {report.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'analyses' && (
        <div className="space-y-4">
          {analyses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Ingen analyser utført ennå</p>
            </div>
          ) : (
            analyses.map((analysis) => (
              <div key={analysis.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{analysis.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(analysis.severity)}`}>
                        {analysis.severity}
                      </span>
                      <span className="text-sm text-gray-500">{analysis.section_name}</span>
                    </div>
                    <p className="text-gray-700">{analysis.description}</p>
                  </div>
                </div>

                {analysis.detected_issues && analysis.detected_issues.length > 0 && (
                  <div className="mb-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-medium text-red-900 mb-2">Identifiserte problemer:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                      {analysis.detected_issues.map((issue: string, idx: number) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.suggested_solutions && analysis.suggested_solutions.length > 0 && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2">Foreslåtte løsninger:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                      {analysis.suggested_solutions.map((solution: string, idx: number) => (
                        <li key={idx}>{solution}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span>Risikoscore: {analysis.risk_score}/100</span>
                  <span>Prioritet: {analysis.priority}</span>
                  <span>{new Date(analysis.analyzed_at).toLocaleString('nb-NO')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Ingen innsikter tilgjengelig ennå</p>
            </div>
          ) : (
            insights.map((insight) => (
              <div key={insight.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-semibold">{insight.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact_level)}`}>
                        {insight.impact_level}
                      </span>
                    </div>
                    <p className="text-gray-700">{insight.description}</p>
                  </div>
                  {insight.status === 'new' && (
                    <button
                      onClick={async () => {
                        await hmsAiApi.updateInsightStatus(insight.id, 'acknowledged');
                        loadData();
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      Merk som lest
                    </button>
                  )}
                </div>

                {insight.action_items && insight.action_items.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Handlinger:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                      {insight.action_items.map((action: string, idx: number) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
