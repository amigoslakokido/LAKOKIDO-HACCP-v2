import { useState, useEffect } from 'react';
import { FileText, Download, Trash2, Eye, Calendar, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { hmsApi } from '../../lib/hmsSupabase';
import { generateHMSReportPDF } from '../../utils/hmsReportPdfGenerator';

interface HMSReport {
 id: string;
 report_number: string;
 report_type: string;
 title: string;
 summary: string;
 start_date: string;
 end_date: string;
 total_incidents: number;
 safety_incidents: number;
 environment_incidents: number;
 health_incidents: number;
 deviations: number;
 compliance_score: number;
 ai_insights?: string;
 recommendations?: string;
 generated_by: string;
 status: string;
 created_at: string;
}

export function HMSReportsList() {
 const [reports, setReports] = useState<HMSReport[]>([]);
 const [loading, setLoading] = useState(true);
 const [viewingReport, setViewingReport] = useState<HMSReport | null>(null);
 const [reportDetails, setReportDetails] = useState<any>(null);

 useEffect(() => {
 loadReports();
 }, []);

 const loadReports = async () => {
 try {
 const { data, error } = await hmsApi.getReports();
 if (data) {
 setReports(data);
 }
 } catch (error) {
 console.error('Error loading reports:', error);
 } finally {
 setLoading(false);
 }
 };

 const viewReport = async (report: HMSReport) => {
 setViewingReport(report);

 // 
 const { data: incidents } = await hmsApi.getIncidents();
 const { data: training } = await hmsApi.getTrainingSessions();
 const riskAssessments = await hmsApi.getRiskAssessments();
 const workEnvAssessments = await hmsApi.getWorkEnvironmentAssessments();

 const startDate = new Date(report.start_date);
 const endDate = new Date(report.end_date);

 const filteredIncidents = incidents?.filter(inc => {
 const incDate = new Date(inc.incident_date);
 return incDate >= startDate && incDate <= endDate;
 }) || [];

 const filteredTraining = training?.filter(t => {
 const tDate = new Date(t.training_date || t.scheduled_date);
 return tDate >= startDate && tDate <= endDate;
 }) || [];

 setReportDetails({
 incidents: filteredIncidents,
 training: filteredTraining,
 riskAssessments: riskAssessments || [],
 workEnvAssessments: workEnvAssessments || [],
 });
 };

 const downloadPDF = async (report: HMSReport) => {
 try {
 // of
 let incidents: any[] = [];
 let training: any[] = [];
 let riskAssessments: any[] = [];

 try {
 const incidentsResult = await hmsApi.getIncidents();
 incidents = incidentsResult?.data || [];
 } catch (err) {
 console.warn('Could not fetch incidents:', err);
 }

 try {
 const trainingResult = await hmsApi.getTrainingSessions();
 training = trainingResult?.data || [];
 } catch (err) {
 console.warn('Could not fetch training:', err);
 }

 try {
 riskAssessments = await hmsApi.getRiskAssessments() || [];
 } catch (err) {
 console.warn('Could not fetch risk assessments:', err);
 }

 const startDate = new Date(report.start_date);
 const endDate = new Date(report.end_date);

 const filteredIncidents = incidents.filter(inc => {
 try {
 const incDate = new Date(inc.incident_date);
 return incDate >= startDate && incDate <= endDate;
 } catch {
 return false;
 }
 });

 const filteredTraining = training.filter(t => {
 try {
 const tDate = new Date(t.training_date || t.scheduled_date);
 return tDate >= startDate && tDate <= endDate;
 } catch {
 return false;
 }
 });

 const details = {
 incidents: filteredIncidents,
 training: filteredTraining,
 riskAssessments: riskAssessments,
 };

 await generateHMSReportPDF(report, details);
 } catch (error) {
 console.error('Error generating PDF:', error);
 alert('Feil ved generering av PDF: ' + (error as Error).message);
 }
 };

 const deleteReport = async (id: string) => {
 if (!confirm('Er du sikker på at du vil slette denne rapporten?')) return;

 try {
 await hmsApi.deleteReport(id);
 setReports(reports.filter(r => r.id !== id));
 } catch (error) {
 console.error('Error deleting report:', error);
 alert('Feil ved sletting av rapport');
 }
 };

 const getReportTypeLabel = (type: string) => {
 const labels: Record<string, string> = {
 daily: 'Daglig',
 weekly: 'Ukentlig',
 monthly: 'Månedlig',
 quarterly: 'Kvartalsvis',
 annual: 'Årlig',
 custom: 'Tilpasset',
 };
 return labels[type] || type;
 };

 const getStatusColor = (status: string) => {
 const colors: Record<string, string> = {
 draft: 'bg-gray-100 text-gray-800',
 pending: 'bg-yellow-100 text-yellow-800',
 final: 'bg-green-100 text-green-800',
 approved: 'bg-blue-100 text-blue-800',
 };
 return colors[status] || 'bg-gray-100 text-gray-800';
 };

 const getComplianceColor = (score: number) => {
 if (score >= 90) return 'text-green-600';
 if (score >= 75) return 'text-yellow-600';
 return 'text-red-600';
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center h-64">
 <div className="text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
 <p className="text-gray-600">Laster rapporter...</p>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-2xl font-bold text-gray-900">HMS Rapporter</h2>
 <p className="text-gray-600 mt-1">Oversikt over alle genererte HMS-rapporter</p>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-sm text-gray-500">
 {reports.length} {reports.length === 1 ? 'rapport' : 'rapporter'}
 </span>
 </div>
 </div>

 {reports.length === 0 ? (
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
 <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
 <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen rapporter ennå</h3>
 <p className="text-gray-600">Rapporter vil vises her når de genereres automatisk eller manuelt.</p>
 </div>
 ) : (
 <div className="grid gap-4">
 {reports.map((report) => (
 <div
 key={report.id}
 className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
 >
 <div className="p-6">
 <div className="flex items-start justify-between mb-4">
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-2">
 <FileText className="w-5 h-5 text-blue-600" />
 <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
 <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
 {report.status === 'final' ? 'Ferdig' : report.status === 'draft' ? 'Utkast' : 'Ventende'}
 </span>
 </div>
 <p className="text-sm text-gray-600 mb-3">{report.summary}</p>

 <div className="flex items-center gap-4 text-sm text-gray-500">
 <div className="flex items-center gap-1">
 <Calendar className="w-4 h-4" />
 <span>
 {new Date(report.start_date).toLocaleDateString('nb-NO')}{new Date(report.end_date).toLocaleDateString('nb-NO')}
 </span>
 </div>
 <span className="px-2 py-1 bg-gray-100 rounded text-xs">
 {getReportTypeLabel(report.report_type)}
 </span>
 <span className="text-xs text-gray-400">
 {report.report_number}
 </span>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <button
 onClick={() => viewReport(report)}
 className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
 title="Se rapport"
 >
 <Eye className="w-4 h-4" />
 <span>Forhåndsvisning</span>
 </button>
 <button
 onClick={() => downloadPDF(report)}
 className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
 title="Last ned PDF"
 >
 <Download className="w-4 h-4" />
 <span>Last ned</span>
 </button>
 <button
 onClick={() => deleteReport(report.id)}
 className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
 title="Slett rapport"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>

 {/* */}
 <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100">
 <div className="text-center">
 <div className="text-2xl font-bold text-gray-900">{report.total_incidents}</div>
 <div className="text-xs text-gray-500 mt-1">Hendelser totalt</div>
 </div>
 <div className="text-center">
 <div className="text-2xl font-bold text-red-600">{report.safety_incidents}</div>
 <div className="text-xs text-gray-500 mt-1">Sikkerhet</div>
 </div>
 <div className="text-center">
 <div className="text-2xl font-bold text-green-600">{report.environment_incidents}</div>
 <div className="text-xs text-gray-500 mt-1">Miljø</div>
 </div>
 <div className="text-center">
 <div className={`text-2xl font-bold ${getComplianceColor(report.compliance_score)}`}>
 {report.compliance_score}%
 </div>
 <div className="text-xs text-gray-500 mt-1">Etterlevelse</div>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* */}
 {viewingReport && (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
 <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
 <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
 <div>
 <h3 className="text-xl font-bold text-gray-900">{viewingReport.title}</h3>
 <p className="text-sm text-gray-600 mt-1">{viewingReport.report_number}</p>
 </div>
 <button
 onClick={() => {
 setViewingReport(null);
 setReportDetails(null);
 }}
 className="text-gray-400 hover:text-gray-600"
 >
 <span className="text-2xl">×</span>
 </button>
 </div>

 <div className="p-6 space-y-6">
 {/* */}
 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
 <h4 className="font-semibold text-blue-900 mb-2">Rapportinformasjon</h4>
 <div className="grid grid-cols-2 gap-4 text-sm">
 <div>
 <span className="text-blue-700">Type:</span>
 <span className="ml-2 text-blue-900 font-medium">{getReportTypeLabel(viewingReport.report_type)}</span>
 </div>
 <div>
 <span className="text-blue-700">Periode:</span>
 <span className="ml-2 text-blue-900 font-medium">
 {new Date(viewingReport.start_date).toLocaleDateString('nb-NO')}{new Date(viewingReport.end_date).toLocaleDateString('nb-NO')}
 </span>
 </div>
 <div>
 <span className="text-blue-700">Status:</span>
 <span className="ml-2 text-blue-900 font-medium">
 {viewingReport.status === 'final' ? 'Ferdig' : 'Utkast'}
 </span>
 </div>
 <div>
 <span className="text-blue-700">Etterlevelse:</span>
 <span className={`ml-2 font-bold ${getComplianceColor(viewingReport.compliance_score)}`}>
 {viewingReport.compliance_score}%
 </span>
 </div>
 </div>
 </div>

 {/* */}
 <div>
 <h4 className="font-semibold text-gray-900 mb-2">Sammendrag</h4>
 <p className="text-gray-700">{viewingReport.summary}</p>
 </div>

 {/* */}
 <div>
 <h4 className="font-semibold text-gray-900 mb-3">Statistikk</h4>
 <div className="grid grid-cols-2 gap-4">
 <div className="bg-gray-50 p-4 rounded-lg">
 <div className="text-sm text-gray-600 mb-1">Totalt antall hendelser</div>
 <div className="text-2xl font-bold text-gray-900">{viewingReport.total_incidents}</div>
 </div>
 <div className="bg-red-50 p-4 rounded-lg">
 <div className="text-sm text-red-600 mb-1">Sikkerhetshendelser</div>
 <div className="text-2xl font-bold text-red-600">{viewingReport.safety_incidents}</div>
 </div>
 <div className="bg-green-50 p-4 rounded-lg">
 <div className="text-sm text-green-600 mb-1">Miljøhendelser</div>
 <div className="text-2xl font-bold text-green-600">{viewingReport.environment_incidents}</div>
 </div>
 <div className="bg-blue-50 p-4 rounded-lg">
 <div className="text-sm text-blue-600 mb-1">Helsehendelser</div>
 <div className="text-2xl font-bold text-blue-600">{viewingReport.health_incidents}</div>
 </div>
 </div>
 </div>

 {/* */}
 {viewingReport.ai_insights && (
 <div>
 <h4 className="font-semibold text-gray-900 mb-2">Analyse</h4>
 <div className="bg-gray-50 p-4 rounded-lg">
 <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
 {viewingReport.ai_insights}
 </pre>
 </div>
 </div>
 )}

 {/* */}
 {viewingReport.recommendations && (
 <div>
 <h4 className="font-semibold text-gray-900 mb-2">Anbefalinger</h4>
 <div className="bg-green-50 p-4 rounded-lg border border-green-200">
 <pre className="whitespace-pre-wrap text-sm text-green-900 font-sans">
 {viewingReport.recommendations}
 </pre>
 </div>
 </div>
 )}

 {/* */}
 <div className="flex gap-3 pt-4 border-t border-gray-200">
 <button
 onClick={() => downloadPDF(viewingReport)}
 className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
 >
 <Download className="w-5 h-5" />
 <span>Last ned PDF</span>
 </button>
 <button
 onClick={() => {
 setViewingReport(null);
 setReportDetails(null);
 }}
 className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
 >
 Lukk
 </button>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
