import { useState, useEffect } from 'react';
import { supabase, CleaningTask, CleaningLog } from '../../lib/supabase';
import { Sparkles, Check, X, Users, MessageSquare } from 'lucide-react';
import HygieneChecks from '../Hygiene/HygieneChecks';
import { useCompany } from '../../contexts/CompanyContext';

export function CleaningTasks() {
 const { currentCompany, loading: companyLoading } = useCompany();
 const [activeTab, setActiveTab] = useState<'cleaning' | 'hygiene'>('cleaning');
 const [tasks, setTasks] = useState<CleaningTask[]>([]);
 const [logs, setLogs] = useState<Record<string, CleaningLog>>({});
 const [loading, setLoading] = useState(true);
 const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
 const [notesModal, setNotesModal] = useState<{ taskId: string; date: string; currentNotes: string } | null>(null);
 const [notes, setNotes] = useState('');

 useEffect(() => {
 if (currentCompany) {
  loadData();
 }
 }, [selectedMonth, currentCompany]);

 const loadData = async () => {
 if (!currentCompany) return;

 try {
 const { data: tasksData } = await supabase
 .from('cleaning_tasks')
 .select('*')
 .eq('company_id', currentCompany.id)
 .eq('active', true)
 .order('frequency', { ascending: true });

 if (tasksData) {
 setTasks(tasksData);
 }

 const startDate = `${selectedMonth}-01`;
 const endDate = new Date(selectedMonth + '-01');
 endDate.setMonth(endDate.getMonth() + 1);
 const endDateStr = endDate.toISOString().split('T')[0];

 const { data: logsData } = await supabase
 .from('cleaning_logs')
 .select('*')
 .eq('company_id', currentCompany.id)
 .gte('log_date', startDate)
 .lt('log_date', endDateStr);

 if (logsData) {
 const logsMap: Record<string, CleaningLog> = {};
 // Keep only the most recent log per task per date
 logsData.forEach((log) => {
 const key = `${log.task_id}-${log.log_date}`;
 const existingLog = logsMap[key];
 if (!existingLog || new Date(log.completed_at || log.created_at || '') > new Date(existingLog.completed_at || existingLog.created_at || '')) {
 logsMap[key] = log;
 }
 });
 setLogs(logsMap);
 }
 } catch (error) {
 console.error('Error loading data:', error);
 } finally {
 setLoading(false);
 }
 };

 const getDaysInMonth = (yearMonth: string) => {
 const [year, month] = yearMonth.split('-').map(Number);
 return new Date(year, month, 0).getDate();
 };

 const openNotesModal = (taskId: string, date: string) => {
 const key = `${taskId}-${date}`;
 const existingLog = logs[key];
 setNotes(existingLog?.notes || '');
 setNotesModal({ taskId, date, currentNotes: existingLog?.notes || '' });
 };

 const saveNotes = async () => {
 if (!notesModal || !currentCompany) return;

 const { taskId, date } = notesModal;
 const key = `${taskId}-${date}`;
 const existingLog = logs[key];

 try {
 if (existingLog) {
 const { data } = await supabase
 .from('cleaning_logs')
 .update({
 notes: notes.trim(),
 })
 .eq('id', existingLog.id)
 .eq('company_id', currentCompany.id)
 .select()
 .single();

 if (data) {
 setLogs({ ...logs, [key]: data });
 }
 } else {
 // Check if log already exists for this task and date
 const { data: checkData } = await supabase
 .from('cleaning_logs')
 .select('*')
 .eq('task_id', taskId)
 .eq('company_id', currentCompany.id)
 .eq('log_date', date)
 .maybeSingle();

 if (checkData) {
 // Update existing log
 const { data } = await supabase
 .from('cleaning_logs')
 .update({
 notes: notes.trim(),
 })
 .eq('id', checkData.id)
 .eq('company_id', currentCompany.id)
 .select()
 .single();

 if (data) {
 setLogs({ ...logs, [key]: data });
 }
 } else {
 // Insert new log
 const { data } = await supabase
 .from('cleaning_logs')
 .insert({
 task_id: taskId,
 log_date: date,
 is_completed: false,
 completed_by: '00000000-0000-0000-0000-000000000000',
 notes: notes.trim(),
 company_id: currentCompany.id,
 })
 .select()
 .single();

 if (data) {
 setLogs({ ...logs, [key]: data });
 }
 }
 }
 setNotesModal(null);
 } catch (error) {
 console.error('Error saving notes:', error);
 alert(' Error . .');
 }
 };

 const toggleTask = async (taskId: string, date: string, currentStatus: boolean) => {
 if (!currentCompany) return;

 const key = `${taskId}-${date}`;
 const existingLog = logs[key];

 try {
 if (existingLog) {
 const { data } = await supabase
 .from('cleaning_logs')
 .update({
 is_completed: !currentStatus,
 completed_by: '00000000-0000-0000-0000-000000000000',
 completed_at: !currentStatus ? new Date().toISOString() : null,
 })
 .eq('id', existingLog.id)
 .eq('company_id', currentCompany.id)
 .select()
 .single();

 if (data) {
 setLogs({ ...logs, [key]: data });
 }
 } else {
 // Check if log already exists for this task and date
 const { data: checkData } = await supabase
 .from('cleaning_logs')
 .select('*')
 .eq('task_id', taskId)
 .eq('company_id', currentCompany.id)
 .eq('log_date', date)
 .maybeSingle();

 if (checkData) {
 // Update existing log
 const { data } = await supabase
 .from('cleaning_logs')
 .update({
 is_completed: true,
 completed_by: '00000000-0000-0000-0000-000000000000',
 completed_at: new Date().toISOString(),
 })
 .eq('id', checkData.id)
 .eq('company_id', currentCompany.id)
 .select()
 .single();

 if (data) {
 setLogs({ ...logs, [key]: data });
 }
 } else {
 // Insert new log
 const { data } = await supabase
 .from('cleaning_logs')
 .insert({
 task_id: taskId,
 log_date: date,
 is_completed: true,
 completed_by: '00000000-0000-0000-0000-000000000000',
 completed_at: new Date().toISOString(),
 company_id: currentCompany.id,
 })
 .select()
 .single();

 if (data) {
 setLogs({ ...logs, [key]: data });
 }
 }
 }
 } catch (error) {
 console.error('Error toggling task:', error);
 alert(' Error . .');
 }
 };

 const getTasksForFrequency = (frequency: string) => {
 return tasks.filter(t => t.frequency === frequency);
 };

 const renderTaskRow = (task: CleaningTask) => {
 const daysInMonth = getDaysInMonth(selectedMonth);
 const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

 return (
 <div key={task.id} className="border-b border-slate-200 last:border-b-0">
 <div className="flex">
 <div className="w-64 px-4 py-3 bg-slate-50 border-r border-slate-200 flex-shrink-0">
 <div className="font-medium text-sm text-slate-700">{task.name_no}</div>
 {task.description && (
 <div className="text-xs text-slate-500 mt-1">{task.description}</div>
 )}
 </div>
 <div className="flex flex-1 overflow-x-auto">
 {days.map((day) => {
 const date = `${selectedMonth}-${day.toString().padStart(2, '0')}`;
 const key = `${task.id}-${date}`;
 const log = logs[key];
 const isCompleted = log?.is_completed ?? false;

 const hasNotes = log?.notes && log.notes.trim().length > 0;

 return (
 <div key={day} className="relative w-10 h-10 flex-shrink-0 border-r border-slate-200">
 <button
 onClick={() => toggleTask(task.id, date, isCompleted)}
 className={`w-full h-full flex items-center justify-center transition-colors hover:bg-slate-100 ${
 isCompleted
 ? 'bg-emerald-100 text-emerald-700'
 : 'bg-white text-slate-400'
 }`}
 title={`Dag ${day}: ${isCompleted ? 'Fullført' : 'Ikke fullført'}`}
 >
 {isCompleted ? (
 <Check className="w-5 h-5" />
 ) : (
 <X className="w-5 h-5" />
 )}
 </button>
 <button
 onClick={(e) => {
 e.stopPropagation();
 openNotesModal(task.id, date);
 }}
 className={`absolute bottom-0 right-0 p-0.5 ${
 hasNotes ? 'bg-blue-500 text-white' : 'bg-slate-300 text-slate-600'
 } rounded-tl hover:opacity-80 transition-opacity`}
 title={hasNotes ? 'Vis/rediger merknad' : 'Legg til merknad'}
 >
 <MessageSquare className="w-3 h-3" />
 </button>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 );
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center h-64">
 <div className="text-slate-600">Laster...</div>
 </div>
 );
 }

 const dailyTasks = getTasksForFrequency('daily');
 const weeklyTasks = getTasksForFrequency('weekly');
 const monthlyTasks = getTasksForFrequency('monthly');

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center">
 <Sparkles className="w-6 h-6 text-white" />
 </div>
 <div>
 <h2 className="text-2xl font-bold text-slate-900">Rengjøringsoppgaver</h2>
 <p className="text-slate-600">Daglig, ukentlig og månedlig kontroll</p>
 </div>
 </div>

 {activeTab === 'cleaning' && (
 <input
 type="month"
 value={selectedMonth}
 onChange={(e) => setSelectedMonth(e.target.value)}
 className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
 />
 )}
 </div>

 <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 shadow-sm border border-slate-200">
 <button
 onClick={() => setActiveTab('cleaning')}
 className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
 activeTab === 'cleaning'
 ? 'bg-cyan-500 text-white shadow-md'
 : 'text-slate-600 hover:bg-slate-100'
 }`}
 >
 <Sparkles className="w-5 h-5" />
 Rengjøringsoppgaver
 </button>
 <button
 onClick={() => setActiveTab('hygiene')}
 className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
 activeTab === 'hygiene'
 ? 'bg-blue-500 text-white shadow-md'
 : 'text-slate-600 hover:bg-slate-100'
 }`}
 >
 <Users className="w-5 h-5" />
 Personlig Hygiene
 </button>
 </div>

 {activeTab === 'hygiene' ? (
 <HygieneChecks />
 ) : (
 <>

 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
 <div className="bg-emerald-50 px-6 py-3 border-b border-slate-200">
 <h3 className="font-semibold text-emerald-900">Daglige oppgaver</h3>
 </div>
 <div className="overflow-x-auto">
 <div className="min-w-max">
 <div className="flex border-b border-slate-200 bg-slate-50">
 <div className="w-64 px-4 py-2 text-xs font-semibold text-slate-600 border-r border-slate-200">
 OPPGAVE
 </div>
 <div className="flex flex-1">
 {Array.from({ length: getDaysInMonth(selectedMonth) }, (_, i) => (
 <div key={i + 1} className="w-10 px-2 py-2 text-xs font-semibold text-slate-600 text-center border-r border-slate-200 flex-shrink-0">
 {i + 1}
 </div>
 ))}
 </div>
 </div>
 {dailyTasks.map(renderTaskRow)}
 </div>
 </div>
 </div>

 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
 <div className="bg-blue-50 px-6 py-3 border-b border-slate-200">
 <h3 className="font-semibold text-blue-900">Ukentlige oppgaver</h3>
 </div>
 <div className="overflow-x-auto">
 <div className="min-w-max">
 <div className="flex border-b border-slate-200 bg-slate-50">
 <div className="w-64 px-4 py-2 text-xs font-semibold text-slate-600 border-r border-slate-200">
 OPPGAVE
 </div>
 <div className="flex flex-1">
 {Array.from({ length: getDaysInMonth(selectedMonth) }, (_, i) => (
 <div key={i + 1} className="w-10 px-2 py-2 text-xs font-semibold text-slate-600 text-center border-r border-slate-200 flex-shrink-0">
 {i + 1}
 </div>
 ))}
 </div>
 </div>
 {weeklyTasks.map(renderTaskRow)}
 </div>
 </div>
 </div>

 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
 <div className="bg-amber-50 px-6 py-3 border-b border-slate-200">
 <h3 className="font-semibold text-amber-900">Månedlige oppgaver</h3>
 </div>
 <div className="overflow-x-auto">
 <div className="min-w-max">
 <div className="flex border-b border-slate-200 bg-slate-50">
 <div className="w-64 px-4 py-2 text-xs font-semibold text-slate-600 border-r border-slate-200">
 OPPGAVE
 </div>
 <div className="flex flex-1">
 {Array.from({ length: getDaysInMonth(selectedMonth) }, (_, i) => (
 <div key={i + 1} className="w-10 px-2 py-2 text-xs font-semibold text-slate-600 text-center border-r border-slate-200 flex-shrink-0">
 {i + 1}
 </div>
 ))}
 </div>
 </div>
 {monthlyTasks.map(renderTaskRow)}
 </div>
 </div>
 </div>
 </>
 )}

 {notesModal && (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
 <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
 <h3 className="text-lg font-semibold text-slate-900 mb-4">Merknad for oppgave</h3>
 <textarea
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 placeholder="Skriv en kort merknad..."
 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
 maxLength={200}
 />
 <div className="text-xs text-slate-500 mt-1 text-right">
 {notes.length}/200 tegn
 </div>
 <div className="flex gap-3 mt-4">
 <button
 onClick={() => setNotesModal(null)}
 className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
 >
 Avbryt
 </button>
 <button
 onClick={saveNotes}
 className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
 >
 Lagre
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
