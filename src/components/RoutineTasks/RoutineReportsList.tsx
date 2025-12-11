import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Calendar, User, TrendingUp, CheckCircle2, XCircle, Trash2, Download, ArrowLeft, Eye } from 'lucide-react';

interface TaskDetail {
 id: string;
 task_name_ar: string;
 task_name_no: string;
 task_icon: string;
 completed: boolean;
 completed_at: string | null;
}

interface RoutineReport {
 id: string;
 report_date: string;
 generated_by: string;
 total_tasks: number;
 completed_tasks: number;
 not_completed_tasks: number;
 completion_percentage: number;
 notes: string;
 created_at: string;
 employee?: {
 name: string;
 };
 task_details?: TaskDetail[];
}

interface RoutineReportsListProps {
 onBack?: () => void;
}

export default function RoutineReportsList({ onBack }: RoutineReportsListProps) {
 const [reports, setReports] = useState<RoutineReport[]>([]);
 const [loading, setLoading] = useState(true);
 const [selectedReport, setSelectedReport] = useState<RoutineReport | null>(null);
 const [language, setLanguage] = useState<'ar' | 'no'>('ar');

 useEffect(() => {
 loadReports();
 }, []);

 const loadReports = async () => {
 try {
 const { data, error } = await supabase
 .from('daily_routine_reports')
 .select(`
 *,
 employee:employees!daily_routine_reports_generated_by_fkey(name),
 task_details:routine_report_task_details(
 id,
 task_name_ar,
 task_name_no,
 task_icon,
 completed,
 completed_at
 )
 `)
 .order('report_date', { ascending: false });

 if (error) throw error;

 setReports(data || []);
 } catch (error) {
 console.error('Error loading reports:', error);
 } finally {
 setLoading(false);
 }
 };

 const handleDelete = async (id: string) => {
 const confirm = window.confirm(
 language === 'ar'
 ? ' of '
 : 'Er du sikker på at du vil slette denne rapporten?'
 );

 if (!confirm) return;

 try {
 const { error } = await supabase
 .from('daily_routine_reports')
 .delete()
 .eq('id', id);

 if (error) throw error;

 setReports(reports.filter(r => r.id !== id));
 if (selectedReport?.id === id) {
 setSelectedReport(null);
 }
 } catch (error) {
 console.error('Error deleting report:', error);
 alert(language === 'ar' ? ' Error ' : 'Feil ved sletting av rapport');
 }
 };

 const formatDate = (dateString: string) => {
 const date = new Date(dateString);
 return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'nb-NO', {
 calendar: 'gregory',
 year: 'numeric',
 month: 'long',
 day: 'numeric',
 weekday: 'long'
 });
 };

 const getPercentageColor = (percentage: number) => {
 if (percentage >= 90) return 'text-emerald-600';
 if (percentage >= 70) return 'text-blue-600';
 if (percentage >= 50) return 'text-amber-600';
 return 'text-red-600';
 };

 const getPercentageBg = (percentage: number) => {
 if (percentage >= 90) return 'from-emerald-50 to-teal-50 border-emerald-200';
 if (percentage >= 70) return 'from-blue-50 to-cyan-50 border-blue-200';
 if (percentage >= 50) return 'from-amber-50 to-orange-50 border-amber-200';
 return 'from-red-50 to-pink-50 border-red-200';
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
 <div className="relative">
 <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
 <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 border border-white/20">
 <div className="relative w-20 h-20 mx-auto mb-6">
 <div className="absolute inset-0 border-4 border-purple-200 rounded-full animate-ping"></div>
 <div className="absolute inset-0 border-4 border-t-purple-600 border-r-blue-600 rounded-full animate-spin"></div>
 </div>
 <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
 {language === 'ar' ? '' : 'Laster...'}
 </p>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
 <div className="max-w-7xl mx-auto">
 {/* Header */}
 <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 mb-6 border border-white/20">
 <div className="flex flex-col md:flex-row justify-between items-center gap-4">
 <div className="flex items-center gap-4">
 {onBack && (
 <button
 onClick={onBack}
 className="p-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:shadow-xl transform hover:scale-110 transition-all duration-300"
 >
 <ArrowLeft className="w-6 h-6" />
 </button>
 )}
 <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
 <FileText className="w-10 h-10 text-purple-600" />
 {language === 'ar' ? ' Daily tasks' : 'Daglige rutinerapporter'}
 </h1>
 </div>
 <div className="flex gap-3">
 <button
 onClick={() => setLanguage(language === 'ar' ? 'no' : 'ar')}
 className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl font-bold rounded-2xl hover:shadow-xl transform hover:scale-110 transition-all duration-300"
 >
 {language === 'ar' ? 'NO' : ''}
 </button>
 </div>
 </div>

 {/* Warning about old reports */}
 {reports.some(r => !r.task_details || r.task_details.length === 0) && (
 <div className="mt-4 p-4 bg-amber-100 border-2 border-amber-400 rounded-2xl">
 <p className="text-amber-800 font-bold mb-2">
 {language === 'ar' ? '⚠️ :' : '⚠️ Advarsel:'}
 </p>
 <p className="text-amber-700 mb-3">
 {language === 'ar'
 ? ' Reports . .'
 : 'Noen gamle rapporter mangler oppgavedetaljer. Slett dem og opprett nye rapporter for å få fullstendige detaljer.'}
 </p>
 <button
 onClick={async () => {
 const confirm = window.confirm(
 language === 'ar'
 ? ' of Reports '
 : 'Er du sikker på at du vil slette alle gamle rapporter uten detaljer?'
 );
 if (!confirm) return;

 try {
 const reportsWithoutDetails = reports.filter(r => !r.task_details || r.task_details.length === 0);
 const idsToDelete = reportsWithoutDetails.map(r => r.id);

 const { error } = await supabase
 .from('daily_routine_reports')
 .delete()
 .in('id', idsToDelete);

 if (error) throw error;

 alert(language === 'ar' ? '✅ Reports ' : '✅ Gamle rapporter slettet');
 loadReports();
 } catch (error) {
 console.error('Error:', error);
 alert(language === 'ar' ? '❌ Error' : '❌ Feil oppstod');
 }
 }}
 className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all"
 >
 {language === 'ar' ? '🗑️ Reports ' : '🗑️ Slett gamle rapporter'}
 </button>
 </div>
 )}
 </div>

 {reports.length === 0 ? (
 <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center border border-white/20">
 <FileText className="w-24 h-24 text-gray-300 mx-auto mb-4" />
 <p className="text-2xl font-bold text-gray-600">
 {language === 'ar' ? 'No reports yet' : 'Ingen rapporter ennå'}
 </p>
 <p className="text-lg text-gray-500 mt-2">
 {language === 'ar'
 ? ' of Daily tasks'
 : 'Opprett en rapport fra daglige rutineoppgaver-siden'}
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {reports.map((report) => (
 <div
 key={report.id}
 className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02]"
 >
 {/* Date Header */}
 <div className={`bg-gradient-to-r ${getPercentageBg(report.completion_percentage)} rounded-2xl p-4 mb-4 border-2`}>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <Calendar className="w-6 h-6 text-gray-700" />
 <div>
 <p className="text-sm text-gray-600 font-semibold">
 {language === 'ar' ? '' : 'Dato'}
 </p>
 <p className="text-lg font-black text-gray-800">
 {formatDate(report.report_date)}
 </p>
 </div>
 </div>
 <div className="text-right">
 <p className="text-sm text-gray-600 font-semibold">
 {language === 'ar' ? ' ' : 'Fullføring'}
 </p>
 <p className={`text-3xl font-black ${getPercentageColor(report.completion_percentage)}`}>
 {Math.round(report.completion_percentage)}%
 </p>
 </div>
 </div>
 </div>

 {/* Stats Grid */}
 <div className="grid grid-cols-3 gap-3 mb-4">
 <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200 text-center">
 <p className="text-xs text-gray-600 mb-1">
 {language === 'ar' ? '' : 'Totalt'}
 </p>
 <p className="text-2xl font-black text-blue-600">{report.total_tasks}</p>
 </div>
 <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 border border-emerald-200 text-center">
 <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
 <p className="text-2xl font-black text-emerald-600">{report.completed_tasks}</p>
 </div>
 <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200 text-center">
 <XCircle className="w-4 h-4 text-red-600 mx-auto mb-1" />
 <p className="text-2xl font-black text-red-600">{report.not_completed_tasks}</p>
 </div>
 </div>

 {/* Employee Info */}
 {report.employee && (
 <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
 <User className="w-5 h-5 text-gray-600" />
 <div>
 <p className="text-xs text-gray-600">
 {language === 'ar' ? ' ' : 'Opprettet av'}
 </p>
 <p className="font-bold text-gray-800">{report.employee.name}</p>
 </div>
 </div>
 )}

 {/* Notes */}
 {report.notes && (
 <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
 <p className="text-xs text-gray-600 mb-1 font-semibold">
 {language === 'ar' ? ':' : 'Notater:'}
 </p>
 <p className="text-sm text-gray-700">{report.notes}</p>
 </div>
 )}

 {/* Actions */}
 <div className="flex gap-2">
 <button
 onClick={() => setSelectedReport(report)}
 className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
 >
 <Eye className="w-4 h-4" />
 {language === 'ar' ? '' : 'Vis'}
 </button>
 <button
 onClick={() => handleDelete(report.id)}
 className="px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Detail Modal */}
 {selectedReport && (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
 <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-200/50">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
 <FileText className="w-8 h-8 text-purple-600" />
 {language === 'ar' ? ' ' : 'Rapportdetaljer'}
 </h2>
 <button
 onClick={() => setSelectedReport(null)}
 className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
 >
 <XCircle className="w-6 h-6 text-gray-600" />
 </button>
 </div>

 <div className={`bg-gradient-to-r ${getPercentageBg(selectedReport.completion_percentage)} rounded-2xl p-6 mb-6 border-2`}>
 <div className="text-center mb-4">
 <p className="text-lg text-gray-600 font-semibold mb-2">
 {formatDate(selectedReport.report_date)}
 </p>
 <div className="flex items-center justify-center gap-2">
 <TrendingUp className={`w-8 h-8 ${getPercentageColor(selectedReport.completion_percentage)}`} />
 <p className={`text-6xl font-black ${getPercentageColor(selectedReport.completion_percentage)}`}>
 {Math.round(selectedReport.completion_percentage)}%
 </p>
 </div>
 <p className="text-gray-600 font-semibold mt-2">
 {language === 'ar' ? ' ' : 'Fullførelsesrate'}
 </p>
 </div>

 <div className="grid grid-cols-3 gap-4">
 <div className="bg-white rounded-xl p-4 text-center border-2 border-blue-300">
 <p className="text-sm text-gray-600 mb-2">
 {language === 'ar' ? ' ' : 'Totalt oppgaver'}
 </p>
 <p className="text-4xl font-black text-blue-600">{selectedReport.total_tasks}</p>
 </div>
 <div className="bg-white rounded-xl p-4 text-center border-2 border-emerald-300">
 <p className="text-sm text-gray-600 mb-2">
 {language === 'ar' ? 'of' : 'Fullført'}
 </p>
 <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
 <p className="text-4xl font-black text-emerald-600">{selectedReport.completed_tasks}</p>
 </div>
 <div className="bg-white rounded-xl p-4 text-center border-2 border-red-300">
 <p className="text-sm text-gray-600 mb-2">
 {language === 'ar' ? ' of' : 'Ikke fullført'}
 </p>
 <XCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
 <p className="text-4xl font-black text-red-600">{selectedReport.not_completed_tasks}</p>
 </div>
 </div>
 </div>

 {selectedReport.employee && (
 <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 mb-4 border-2 border-blue-200">
 <div className="flex items-center gap-3">
 <User className="w-8 h-8 text-blue-600" />
 <div>
 <p className="text-sm text-gray-600 font-semibold">
 {language === 'ar' ? ' ' : 'Opprettet av'}
 </p>
 <p className="text-xl font-black text-gray-800">{selectedReport.employee.name}</p>
 </div>
 </div>
 </div>
 )}

 {selectedReport.notes && (
 <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 mb-4 border-2 border-amber-200">
 <p className="text-sm text-gray-600 font-bold mb-2">
 {language === 'ar' ? '📝 :' : '📝 Notater:'}
 </p>
 <p className="text-gray-700 leading-relaxed">{selectedReport.notes}</p>
 </div>
 )}

 {/* Task Details */}
 {selectedReport.task_details && selectedReport.task_details.length > 0 && (
 <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-4 mb-4 border-2 border-gray-300">
 <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
 <CheckCircle2 className="w-6 h-6 text-purple-600" />
 {language === 'ar' ? ' ' : 'Oppgavedetaljer'}
 </h3>
 <div className="space-y-2">
 {selectedReport.task_details.map((task, index) => (
 <div
 key={task.id}
 className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
 task.completed
 ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300'
 : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-300'
 }`}
 >
 <div className="flex items-center gap-3 flex-1">
 <span className="text-3xl">{task.task_icon}</span>
 <div className="flex-1">
 <p className={`font-bold ${task.completed ? 'text-emerald-800' : 'text-red-800'}`}>
 {language === 'ar' ? task.task_name_ar : task.task_name_no}
 </p>
 <p className="text-xs text-gray-600">
 {language === 'ar' ? task.task_name_no : task.task_name_ar}
 </p>
 {task.completed && task.completed_at && (
 <p className="text-xs text-emerald-600 font-semibold mt-1">
 ✅ {new Date(task.completed_at).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'nb-NO', {
 hour: '2-digit',
 minute: '2-digit'
 })}
 </p>
 )}
 </div>
 </div>
 <div className="text-right">
 {task.completed ? (
 <CheckCircle2 className="w-8 h-8 text-emerald-600" />
 ) : (
 <XCircle className="w-8 h-8 text-red-600" />
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
 <p className="text-xs text-gray-500">
 {language === 'ar' ? ' :' : 'Opprettet:'}{' '}
 {new Date(selectedReport.created_at).toLocaleString(language === 'ar' ? 'ar-EG' : 'nb-NO', {
 calendar: 'gregory'
 })}
 </p>
 </div>

 <button
 onClick={() => setSelectedReport(null)}
 className="mt-6 w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white text-lg font-bold rounded-xl hover:shadow-xl transition-all"
 >
 {language === 'ar' ? '' : 'Lukk'}
 </button>
 </div>
 </div>
 )}
 </div>
 );
}
