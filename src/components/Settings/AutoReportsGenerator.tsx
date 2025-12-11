import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Plus,
  Sparkles,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { hmsApi, supabase } from '../../lib/hmsSupabase';
import { LocalAssistant } from './LocalAssistant';
import jsPDF from 'jspdf';

interface ReportTemplate {
  id: string;
  report_type: string;
  template_name: string;
  description: string;
  frequency: string;
  icon: string;
  color: string;
  sections: any[];
}

interface Report {
  id: string;
  report_type: string;
  title: string;
  start_date: string;
  end_date: string;
  status: string;
  compliance_score?: number;
  created_at: string;
  pdf_path?: string;
}

export function AutoReportsGenerator() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadTemplates();
    loadReports();
  }, []);

  const loadTemplates = async () => {
    const { data } = await supabase
      .from('hms_report_templates')
      .select('*')
      .eq('is_active', true)
      .order('template_name');

    if (data) setTemplates(data);
  };

  const loadReports = async () => {
    const { data } = await supabase
      .from('hms_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) setReports(data);
  };

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 border-blue-300 text-blue-800',
      red: 'bg-red-100 border-red-300 text-red-800',
      green: 'bg-green-100 border-green-300 text-green-800',
      orange: 'bg-orange-100 border-orange-300 text-orange-800',
      purple: 'bg-purple-100 border-purple-300 text-purple-800',
      teal: 'bg-teal-100 border-teal-300 text-teal-800',
      indigo: 'bg-indigo-100 border-indigo-300 text-indigo-800',
      yellow: 'bg-yellow-100 border-yellow-300 text-yellow-800'
    };
    return colors[color] || colors.blue;
  };

  const getButtonColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      red: 'bg-red-600 hover:bg-red-700',
      green: 'bg-green-600 hover:bg-green-700',
      orange: 'bg-orange-600 hover:bg-orange-700',
      purple: 'bg-purple-600 hover:bg-purple-700',
      teal: 'bg-teal-600 hover:bg-teal-700',
      indigo: 'bg-indigo-600 hover:bg-indigo-700',
      yellow: 'bg-yellow-600 hover:bg-yellow-700'
    };
    return colors[color] || colors.blue;
  };

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      weekly: 'Ukentlig',
      monthly: 'Månedlig',
      quarterly: 'Kvartalsvis',
      yearly: 'Årlig',
      on_demand: 'På forespørsel'
    };
    return labels[freq] || freq;
  };

  const calculateNextDue = (template: ReportTemplate) => {
    const lastReport = reports.find(r => r.report_type === template.report_type);
    if (!lastReport) return 'Ingen rapport generert ennå';

    const lastDate = new Date(lastReport.created_at);
    const today = new Date();

    let nextDate = new Date(lastDate);
    switch (template.frequency) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        return 'På forespørsel';
    }

    const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) return `Forfalt (${Math.abs(daysUntil)} dager siden)`;
    if (daysUntil === 0) return 'Forfaller i dag';
    if (daysUntil === 1) return 'Forfaller i morgen';
    if (daysUntil <= 7) return `Forfaller om ${daysUntil} dager`;
    if (daysUntil <= 30) return `Forfaller om ${Math.ceil(daysUntil / 7)} uker`;
    return `Forfaller om ${Math.ceil(daysUntil / 30)} måneder`;
  };

  const isOverdue = (template: ReportTemplate) => {
    const status = calculateNextDue(template);
    return status.includes('Forfalt') || status.includes('i dag') || status.includes('i morgen');
  };

  const generateReport = async (template: ReportTemplate) => {
    setGenerating(true);
    try {
      const endDate = new Date();
      const startDate = new Date();

      switch (template.frequency) {
        case 'weekly':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'monthly':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'quarterly':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case 'yearly':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const reportData = await collectReportData(template, startDate, endDate);

      const pdfBlob = await generatePDF(template, reportData, startDate, endDate);

      const reportNumber = `HMS-${Date.now()}`;

      const { data: report, error } = await supabase
        .from('hms_reports')
        .insert([{
          report_number: reportNumber,
          report_type: 'monthly',
          title: `${template.template_name} - ${endDate.toLocaleDateString('nb-NO')}`,
          summary: reportData.summary || 'Automatisk generert rapport',
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          total_incidents: reportData.total_incidents || 0,
          safety_incidents: 0,
          environment_incidents: 0,
          health_incidents: 0,
          deviations: 0,
          compliance_score: reportData.compliance_score || 85,
          ai_insights: '',
          recommendations: reportData.recommendations || '',
          generated_by: 'automatic',
          status: 'final'
        }])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      loadReports();
      alert(`Rapport "${template.template_name}" er generert!`);
    } catch (error: any) {
      console.error('Error generating report:', error);
      alert(`Kunne ikke generere rapport: ${error.message || 'Ukjent feil'}`);
    }
    setGenerating(false);
  };

  const collectReportData = async (template: ReportTemplate, startDate: Date, endDate: Date) => {
    const data: any = {
      template_name: template.template_name,
      report_type: template.report_type,
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      compliance_score: 85,
      total_incidents: 0,
      recommendations: '',
      summary: '',
      sections: {}
    };

    try {
      switch (template.report_type) {
        case 'arbeidstilsynet':
          data.sections = await collectArbeidstilsynetData(startDate, endDate);
          break;
        case 'fire_safety':
          data.sections = await collectFireSafetyData(startDate, endDate);
          break;
        case 'training':
          data.sections = await collectTrainingData(startDate, endDate);
          break;
        case 'incidents':
          data.sections = await collectIncidentsData(startDate, endDate);
          break;
        case 'environment':
          data.sections = await collectEnvironmentData(startDate, endDate);
          break;
        case 'risk_assessment':
          data.sections = await collectRiskAssessmentData(startDate, endDate);
          break;
      }
    } catch (error) {
      console.error('Error collecting data:', error);
    }

    return data;
  };

  const collectArbeidstilsynetData = async (startDate: Date, endDate: Date) => {
    try {
      const [company, risks, incidents, training] = await Promise.all([
        supabase.from('hms_company_settings').select('*').maybeSingle(),
        supabase.from('hms_risk_assessments').select('*'),
        supabase.from('hms_incidents').select('*').gte('incident_date', startDate.toISOString().split('T')[0]).lte('incident_date', endDate.toISOString().split('T')[0]),
        supabase.from('hms_training_records').select('*').gte('training_date', startDate.toISOString().split('T')[0]).lte('training_date', endDate.toISOString().split('T')[0])
      ]);

      return {
        company: company.data,
        risk_count: risks.data?.length || 0,
        high_risks: risks.data?.filter((r: any) => r.risk_level === 'Høy' || r.risk_level === 'Kritisk').length || 0,
        incident_count: incidents.data?.length || 0,
        training_count: training.data?.length || 0
      };
    } catch (error) {
      console.error('Error collecting Arbeidstilsynet data:', error);
      return {
        company: null,
        risk_count: 0,
        high_risks: 0,
        incident_count: 0,
        training_count: 0
      };
    }
  };

  const collectFireSafetyData = async (startDate: Date, endDate: Date) => {
    try {
      const equipment = await supabase.from('hms_fire_safety_equipment').select('*');

      return {
        total_equipment: equipment.data?.length || 0,
        defect_equipment: equipment.data?.filter((e: any) => e.status === 'Defekt' || e.status === 'Trenger service').length || 0,
        operational: equipment.data?.filter((e: any) => e.status === 'Operativ').length || 0
      };
    } catch (error) {
      console.error('Error collecting fire safety data:', error);
      return {
        total_equipment: 0,
        defect_equipment: 0,
        operational: 0
      };
    }
  };

  const collectTrainingData = async (startDate: Date, endDate: Date) => {
    try {
      const training = await supabase
        .from('hms_training_records')
        .select('*')
        .gte('training_date', startDate.toISOString().split('T')[0])
        .lte('training_date', endDate.toISOString().split('T')[0]);

      return {
        total_sessions: training.data?.length || 0,
        total_participants: training.data?.reduce((sum: number, t: any) => sum + (t.participants?.length || 0), 0) || 0,
        completion_rate: 95
      };
    } catch (error) {
      console.error('Error collecting training data:', error);
      return {
        total_sessions: 0,
        total_participants: 0,
        completion_rate: 0
      };
    }
  };

  const collectIncidentsData = async (startDate: Date, endDate: Date) => {
    try {
      const incidents = await supabase
        .from('hms_incidents')
        .select('*')
        .gte('incident_date', startDate.toISOString().split('T')[0])
        .lte('incident_date', endDate.toISOString().split('T')[0]);

      return {
        total: incidents.data?.length || 0,
        critical: incidents.data?.filter((i: any) => i.severity === 'critical').length || 0,
        high: incidents.data?.filter((i: any) => i.severity === 'high').length || 0,
        medium: incidents.data?.filter((i: any) => i.severity === 'medium').length || 0,
        low: incidents.data?.filter((i: any) => i.severity === 'low').length || 0
      };
    } catch (error) {
      console.error('Error collecting incidents data:', error);
      return {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      };
    }
  };

  const collectEnvironmentData = async (startDate: Date, endDate: Date) => {
    try {
      const [waste, products, goals] = await Promise.all([
        supabase.from('hms_environment_waste').select('*'),
        supabase.from('hms_environment_cleaning_products').select('*'),
        supabase.from('hms_environment_goals').select('*')
      ]);

      return {
        waste_categories: waste.data?.length || 0,
        cleaning_products: products.data?.length || 0,
        eco_friendly: products.data?.filter((p: any) => p.is_eco_friendly).length || 0,
        active_goals: goals.data?.filter((g: any) => g.status === 'Aktiv').length || 0,
        completed_goals: goals.data?.filter((g: any) => g.status === 'Fullført').length || 0
      };
    } catch (error) {
      console.error('Error collecting environment data:', error);
      return {
        waste_categories: 0,
        cleaning_products: 0,
        eco_friendly: 0,
        active_goals: 0,
        completed_goals: 0
      };
    }
  };

  const collectRiskAssessmentData = async (startDate: Date, endDate: Date) => {
    try {
      const risks = await supabase.from('hms_risk_assessments').select('*');

      return {
        total: risks.data?.length || 0,
        critical: risks.data?.filter((r: any) => r.risk_level === 'Kritisk').length || 0,
        high: risks.data?.filter((r: any) => r.risk_level === 'Høy').length || 0,
        medium: risks.data?.filter((r: any) => r.risk_level === 'Middels').length || 0,
        low: risks.data?.filter((r: any) => r.risk_level === 'Lav').length || 0,
        with_measures: risks.data?.filter((r: any) => r.measures && r.measures.length > 0).length || 0
      };
    } catch (error) {
      console.error('Error collecting risk assessment data:', error);
      return {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        with_measures: 0
      };
    }
  };

  const generatePDF = async (template: ReportTemplate, data: any, startDate: Date, endDate: Date) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    doc.setFillColor(240, 240, 245);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setFontSize(24);
    doc.setTextColor(30, 30, 80);
    doc.text(template.template_name, pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 120);
    const periodText = `${startDate.toLocaleDateString('nb-NO')} - ${endDate.toLocaleDateString('nb-NO')}`;
    doc.text(periodText, pageWidth / 2, 30, { align: 'center' });

    yPos = 50;

    doc.setFontSize(14);
    doc.setTextColor(50, 50, 80);
    doc.text('📊 Oppsummering', 15, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 100);

    if (data.sections) {
      const summaryItems = Object.entries(data.sections).slice(0, 5);
      summaryItems.forEach(([key, value]: [string, any]) => {
        if (typeof value === 'object' && value !== null) {
          const entries = Object.entries(value).slice(0, 3);
          entries.forEach(([subKey, subValue]) => {
            doc.text(`• ${subKey}: ${subValue}`, 20, yPos);
            yPos += 6;
          });
        }
      });
    }

    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 140);
    doc.text(`Generert: ${new Date().toLocaleString('nb-NO')}`, 15, pageHeight - 10);
    doc.text('HMS System - Auto-generert rapport', pageWidth - 15, pageHeight - 10, { align: 'right' });

    return doc.output('blob');
  };

  const downloadReport = async (report: Report) => {
    const template = templates.find(t => t.report_type === report.report_type);
    if (!template) return;

    const startDate = new Date(report.start_date);
    const endDate = new Date(report.end_date);
    const data = await collectReportData(template, startDate, endDate);
    const pdfBlob = await generatePDF(template, data, startDate, endDate);

    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.template_name}_${report.end_date}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteReport = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne rapporten?')) return;

    await supabase.from('hms_reports').delete().eq('id', id);
    loadReports();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600" />
            Automatisk Rapportgenerering
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Generer profesjonelle HMS-rapporter automatisk basert på systemdata
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const reportsCount = reports.filter(r => r.report_type === template.report_type).length;
          const nextDue = calculateNextDue(template);
          const overdue = isOverdue(template);

          return (
            <div
              key={template.id}
              className={`border-2 rounded-xl p-6 ${getColorClass(template.color)} transition-all hover:shadow-lg`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{template.icon}</div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  overdue ? 'bg-red-500 text-white' : 'bg-white/50'
                }`}>
                  {getFrequencyLabel(template.frequency)}
                </span>
              </div>

              <h3 className="font-bold text-lg mb-2">{template.template_name}</h3>
              <p className="text-sm opacity-80 mb-4">{template.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4" />
                  <span>{reportsCount} rapporter generert</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${overdue ? 'font-semibold' : ''}`}>
                  {overdue ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  <span>{nextDue}</span>
                </div>
              </div>

              <LocalAssistant
                hints={(() => {
                  const hints = [];
                  const lastReport = reports.filter(r => r.report_type === template.report_type)[0];

                  if (!lastReport) {
                    hints.push({
                      type: 'warning' as const,
                      title: 'Ingen rapport',
                      message: 'Ingen rapport er generert ennå. Klikk "Generer rapport" for å starte.'
                    });
                  } else if (overdue) {
                    hints.push({
                      type: 'error' as const,
                      title: 'Forfalt rapport',
                      message: `Neste rapport skulle vært generert. Generer en ny rapport nå.`
                    });
                  } else if (nextDue.includes('7 dager') || nextDue.includes('i morgen') || nextDue.includes('i dag')) {
                    hints.push({
                      type: 'warning' as const,
                      title: 'Nærmer seg',
                      message: `Neste rapport ${nextDue.toLowerCase()}. Forbered data.`
                    });
                  } else {
                    hints.push({
                      type: 'success' as const,
                      title: 'Alt ser bra ut',
                      message: nextDue
                    });
                  }

                  return hints;
                })()}
              />

              <button
                onClick={() => generateReport(template)}
                disabled={generating}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 ${getButtonColor(template.color)} text-white rounded-lg font-semibold disabled:opacity-50 transition-colors`}
              >
                {generating ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
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
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="text-blue-600" />
          Genererte rapporter
        </h3>

        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="font-medium">Ingen rapporter ennå</p>
              <p className="text-sm">Generer din første rapport ved å klikke på en av malene ovenfor</p>
            </div>
          ) : (
            reports.map((report) => {
              const template = templates.find(t => t.report_type === report.report_type);

              return (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{template?.icon || '📄'}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{report.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(report.created_at).toLocaleDateString('nb-NO')}
                        </span>
                        {report.compliance_score && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {report.compliance_score}% etterlevelse
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          report.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.status === 'completed' ? 'Fullført' : 'Utkast'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadReport(report)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Last ned PDF"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteReport(report.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Slett rapport"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
