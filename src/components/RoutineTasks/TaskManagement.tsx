import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, ChevronLeft, Save, X, Eye, EyeOff } from 'lucide-react';

interface RoutineTask {
 id: string;
 name_ar: string;
 name_no: string;
 icon: string;
 sort_order: number;
 active: boolean;
 schedule_type?: 'daily' | 'every_x_days' | 'weekly' | 'monthly';
 schedule_config?: {
 interval_days?: number;
 last_completed?: string;
 days?: number[];
 day?: number;
 };
}

interface TaskManagementProps {
 onBack: () => void;
}

export default function TaskManagement({ onBack }: TaskManagementProps) {
 const [tasks, setTasks] = useState<RoutineTask[]>([]);
 const [editingTask, setEditingTask] = useState<RoutineTask | null>(null);
 const [showAddForm, setShowAddForm] = useState(false);
 const [language, setLanguage] = useState<'ar' | 'no'>('ar');
 const [loading, setLoading] = useState(true);

 const [formData, setFormData] = useState({
 name_ar: '',
 name_no: '',
 icon: '📋',
 schedule_type: 'daily' as 'daily' | 'every_x_days' | 'weekly' | 'monthly',
 interval_days: 1
 });

 useEffect(() => {
 loadTasks();
 }, []);

 const loadTasks = async () => {
 try {
 const { data, error } = await supabase
 .from('routine_tasks')
 .select('*')
 .order('sort_order');

 if (error) throw error;
 if (data) setTasks(data);
 setLoading(false);
 } catch (error) {
 console.error('Error loading tasks:', error);
 setLoading(false);
 }
 };

 const handleAdd = async () => {
 if (!formData.name_ar || !formData.name_no) {
 alert(language === 'ar' ? ' ' : 'Vennligst fyll ut alle felt');
 return;
 }

 try {
 console.log('➕ Adding new task:', formData);

 const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.sort_order)) : 0;

 const scheduleConfig = formData.schedule_type === 'every_x_days'
 ? { interval_days: formData.interval_days, last_completed: new Date().toISOString().split('T')[0] }
 : {};

 const insertData = {
 name_ar: formData.name_ar,
 name_no: formData.name_no,
 icon: formData.icon,
 sort_order: maxOrder + 1,
 active: true,
 schedule_type: formData.schedule_type,
 schedule_config: scheduleConfig
 };

 console.log('💾 Inserting:', insertData);

 const { data, error } = await supabase
 .from('routine_tasks')
 .insert(insertData)
 .select();

 if (error) {
 console.error('❌ Insert error:', error);
 throw error;
 }

 console.log('✅ Insert successful:', data);

 setFormData({ name_ar: '', name_no: '', icon: '📋', schedule_type: 'daily', interval_days: 1 });
 setShowAddForm(false);
 await loadTasks();

 alert(language === 'ar' ? ' ! ✅' : 'Lagt til! ✅');
 } catch (error) {
 console.error('❌ Error adding task:', error);
 alert(language === 'ar' ? ' Error Task:\n' + JSON.stringify(error) : 'Feil ved å legge til oppgave:\n' + JSON.stringify(error));
 }
 };

 const handleUpdate = async () => {
 if (!editingTask) return;

 if (!formData.name_ar || !formData.name_no) {
 alert(language === 'ar' ? ' ' : 'Vennligst fyll ut alle felt');
 return;
 }

 try {
 console.log('🔄 Updating task:', editingTask.id);
 console.log('📝 New data:', formData);

 const scheduleConfig = formData.schedule_type === 'every_x_days'
 ? { interval_days: formData.interval_days, last_completed: editingTask.schedule_config?.last_completed || new Date().toISOString().split('T')[0] }
 : {};

 const updateData = {
 name_ar: formData.name_ar,
 name_no: formData.name_no,
 icon: formData.icon,
 schedule_type: formData.schedule_type,
 schedule_config: scheduleConfig
 };

 console.log('💾 Sending update:', updateData);

 const { data, error } = await supabase
 .from('routine_tasks')
 .update(updateData)
 .eq('id', editingTask.id)
 .select();

 if (error) {
 console.error('❌ Update error:', error);
 throw error;
 }

 console.log('✅ Update successful:', data);

 setEditingTask(null);
 setFormData({ name_ar: '', name_no: '', icon: '📋', schedule_type: 'daily', interval_days: 1 });
 await loadTasks();

 alert(language === 'ar' ? ' ! ✅' : 'Endringer lagret! ✅');
 } catch (error) {
 console.error('❌ Error updating task:', error);
 alert(language === 'ar' ? ' Error Task:\n' + JSON.stringify(error) : 'Feil ved å oppdatere oppgave:\n' + JSON.stringify(error));
 }
 };

 const handleDelete = async (id: string) => {
 if (!confirm(language === 'ar' ? ' of Task' : 'Er du sikker på at du vil slette denne oppgaven?')) {
 return;
 }

 try {
 const { error } = await supabase
 .from('routine_tasks')
 .delete()
 .eq('id', id);

 if (error) throw error;
 loadTasks();
 } catch (error) {
 console.error('Error deleting task:', error);
 alert(language === 'ar' ? ' Error Task' : 'Feil ved å slette oppgave');
 }
 };

 const handleToggleActive = async (id: string, currentActive: boolean) => {
 try {
 const { error } = await supabase
 .from('routine_tasks')
 .update({ active: !currentActive })
 .eq('id', id);

 if (error) throw error;
 loadTasks();
 } catch (error) {
 console.error('Error toggling active:', error);
 }
 };

 const startEdit = (task: RoutineTask) => {
 setEditingTask(task);
 setFormData({
 name_ar: task.name_ar,
 name_no: task.name_no,
 icon: task.icon,
 schedule_type: task.schedule_type || 'daily',
 interval_days: task.schedule_config?.interval_days || 1
 });
 setShowAddForm(false);
 };

 const cancelEdit = () => {
 setEditingTask(null);
 setFormData({ name_ar: '', name_no: '', icon: '📋', schedule_type: 'daily', interval_days: 1 });
 };

 const popularIcons = ['✅', '🧹', '🗑️', '📦', '🚪', '🪟', '🚰', '🧼', '🧽', '🔧', '💡', '🌡️', '❄️', '🔥', '⚡', '💧', '🍽️', '🥤', '🍴'];

 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
 <div className="relative">
 <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
 <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 border border-white/20">
 <div className="relative w-20 h-20 mx-auto mb-6">
 <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping"></div>
 <div className="absolute inset-0 border-4 border-t-blue-600 border-r-emerald-600 rounded-full animate-spin"></div>
 </div>
 <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
 {language === 'ar' ? '' : 'Laster...'}
 </p>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8 relative overflow-hidden">
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent"></div>
 <div className="max-w-7xl mx-auto relative">
 {/* Header */}
 <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 mb-6 border border-white/20">
 <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
 <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
 {language === 'ar' ? '⚙️ ' : '⚙️ Administrer rutineoppgaver'}
 </h1>
 <div className="flex gap-3">
 <button
 onClick={() => setLanguage(language === 'ar' ? 'no' : 'ar')}
 className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-bold rounded-2xl hover:shadow-xl transform hover:scale-110 transition-all duration-300 border-2 border-white/20"
 >
 {language === 'ar' ? 'NO' : ''}
 </button>
 <button
 onClick={onBack}
 className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-xl font-bold rounded-2xl hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center gap-2 border-2 border-white/20"
 >
 <ChevronLeft className="w-5 h-5" />
 {language === 'ar' ? '' : 'Tilbake'}
 </button>
 </div>
 </div>

 {/* Add Button */}
 {!showAddForm && !editingTask && (
 <button
 onClick={() => setShowAddForm(true)}
 className="group w-full px-8 py-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-2xl font-black rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 border-2 border-white/30 relative overflow-hidden"
 >
 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer"></div>
 <Plus className="w-8 h-8 relative z-10" />
 <span className="relative z-10">{language === 'ar' ? ' ' : 'Legg til ny oppgave'}</span>
 </button>
 )}

 {/* Add/Edit Form */}
 {(showAddForm || editingTask) && (
 <div className="bg-gradient-to-br from-blue-50 to-emerald-50 p-6 rounded-3xl border-2 border-blue-200/50 shadow-xl">
 <h3 className="text-2xl font-black text-gray-800 mb-4">
 {editingTask
 ? (language === 'ar' ? ' Task' : 'Rediger oppgave')
 : (language === 'ar' ? ' ' : 'Legg til ny oppgave')}
 </h3>

 <div className="space-y-4">
 <div>
 <label className="block text-lg font-bold text-gray-800 mb-2">
 {language === 'ar' ? ' Task ()' : 'Oppgavenavn (arabisk)'}
 </label>
 <input
 type="text"
 value={formData.name_ar}
 onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
 className="w-full px-6 py-4 text-xl font-semibold border-2 border-blue-300 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner bg-white"
 placeholder={language === 'ar' ? ': ' : 'Eksempel: Rengjøre bordene'}
 />
 </div>

 <div>
 <label className="block text-lg font-bold text-gray-800 mb-2">
 {language === 'ar' ? ' Task ()' : 'Oppgavenavn (norsk)'}
 </label>
 <input
 type="text"
 value={formData.name_no}
 onChange={(e) => setFormData({ ...formData, name_no: e.target.value })}
 className="w-full px-6 py-4 text-xl font-semibold border-2 border-blue-300 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner bg-white"
 placeholder={language === 'ar' ? ': Rengjøre bordene' : 'Eksempel: Rengjøre bordene'}
 />
 </div>

 <div>
 <label className="block text-lg font-bold text-gray-800 mb-2">
 {language === 'ar' ? '' : 'Ikon'}
 </label>
 <input
 type="text"
 value={formData.icon}
 onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
 className="w-full px-6 py-4 text-5xl text-center border-4 border-purple-300 rounded-2xl focus:ring-4 focus:ring-purple-500 focus:border-purple-600 transition-all shadow-lg"
 />
 <div className="mt-3 flex flex-wrap gap-2">
 {popularIcons.map((icon) => (
 <button
 key={icon}
 onClick={() => setFormData({ ...formData, icon })}
 className="text-4xl p-3 bg-white rounded-xl hover:bg-purple-100 transition-all border-2 border-purple-200 hover:border-purple-400"
 >
 {icon}
 </button>
 ))}
 </div>
 </div>

 {/* Scheduling Section */}
 <div className="p-5 bg-white rounded-2xl border-2 border-amber-300">
 <label className="block text-lg font-bold text-gray-800 mb-3">
 {language === 'ar' ? '📅 Task' : '📅 Oppgavefrekvens'}
 </label>

 <div className="space-y-3">
 <select
 value={formData.schedule_type}
 onChange={(e) => setFormData({ ...formData, schedule_type: e.target.value as any })}
 className="w-full px-4 py-3 text-lg font-semibold border-2 border-amber-300 rounded-xl focus:ring-4 focus:ring-amber-500/50 focus:border-amber-500 transition-all bg-white"
 >
 <option value="daily">{language === 'ar' ? '🗓️ ' : '🗓️ Hver dag'}</option>
 <option value="every_x_days">{language === 'ar' ? '🔢 X ' : '🔢 Hver X dag'}</option>
 <option value="weekly">{language === 'ar' ? '📅 ' : '📅 Ukentlig'}</option>
 <option value="monthly">{language === 'ar' ? '📆 ' : '📆 Månedlig'}</option>
 </select>

 {formData.schedule_type === 'every_x_days' && (
 <div>
 <label className="block text-sm font-bold text-gray-700 mb-2">
 {language === 'ar' ? ' ' : 'Hvor mange dager?'}
 </label>
 <input
 type="number"
 min="1"
 max="365"
 value={formData.interval_days}
 onChange={(e) => setFormData({ ...formData, interval_days: parseInt(e.target.value) || 1 })}
 className="w-full px-4 py-3 text-xl font-bold text-center border-2 border-amber-300 rounded-xl focus:ring-4 focus:ring-amber-500/50 focus:border-amber-500 transition-all bg-white"
 />
 <p className="mt-2 text-sm text-gray-600">
 {language === 'ar'
 ? `Task ${formData.interval_days} ${formData.interval_days === 1 ? '' : formData.interval_days === 2 ? '' : ''}`
 : `Oppgaven vil vises hver ${formData.interval_days} ${formData.interval_days === 1 ? 'dag' : 'dager'}`
 }
 </p>
 <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
 <p className="text-sm text-blue-800 font-semibold">
 {language === 'ar' ? '💡 :' : '💡 Eksempler:'}
 </p>
 <ul className="mt-2 space-y-1 text-sm text-blue-700">
 <li>• {language === 'ar' ? '3 = 3 ( )' : '3 = Hver 3. dag (rengjøre hyller)'}</li>
 <li>• {language === 'ar' ? '7 = ( )' : '7 = Hver uke (rengjøre filtre)'}</li>
 <li>• {language === 'ar' ? '30 = ( )' : '30 = Hver måned (månedlig vedlikehold)'}</li>
 </ul>
 </div>
 </div>
 )}
 </div>
 </div>

 <div className="flex gap-3 pt-4">
 <button
 onClick={editingTask ? handleUpdate : handleAdd}
 className="group flex-1 px-8 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xl font-black rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 border-2 border-white/30 relative overflow-hidden"
 >
 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer"></div>
 <Save className="w-6 h-6 relative z-10" />
 <span className="relative z-10">{language === 'ar' ? '' : 'Lagre'}</span>
 </button>
 <button
 onClick={() => {
 setShowAddForm(false);
 cancelEdit();
 }}
 className="group flex-1 px-8 py-5 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xl font-black rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 border-2 border-white/30 relative overflow-hidden"
 >
 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer"></div>
 <X className="w-6 h-6 relative z-10" />
 <span className="relative z-10">{language === 'ar' ? '' : 'Avbryt'}</span>
 </button>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Tasks List */}
 <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border border-white/20">
 <h3 className="text-2xl md:text-3xl font-black text-gray-800 mb-6">
 {language === 'ar' ? '📋 ' : '📋 Alle oppgaver'}
 </h3>

 {tasks.length === 0 ? (
 <div className="text-center py-12 text-gray-500">
 <p className="text-xl">
 {language === 'ar' ? ' . !' : 'Ingen oppgaver. Legg til en ny oppgave!'}
 </p>
 </div>
 ) : (
 <div className="space-y-4">
 {tasks.map((task) => (
 <div
 key={task.id}
 className={`group p-6 rounded-2xl border-2 transition-all transform hover:scale-[1.02] shadow-lg relative overflow-hidden ${
 task.active
 ? 'bg-gradient-to-br from-white to-blue-50 border-blue-300 hover:border-blue-400'
 : 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400 opacity-70'
 }`}
 >
 <div className="flex items-center justify-between gap-4">
 <div className="flex items-center gap-4 flex-1 relative z-10">
 <span className="text-6xl transform group-hover:scale-110 transition-transform">{task.icon}</span>
 <div className="flex-1">
 <p className="font-black text-xl text-gray-800">
 {language === 'ar' ? task.name_ar : task.name_no}
 </p>
 <p className="text-sm text-gray-600 font-semibold">
 {language === 'ar' ? task.name_no : task.name_ar}
 </p>
 <p className="text-xs text-gray-500 mt-1">
 {task.active
 ? (language === 'ar' ? '✅ ' : '✅ Aktiv')
 : (language === 'ar' ? '❌ ' : '❌ Inaktiv')}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <button
 onClick={() => handleToggleActive(task.id, task.active)}
 className={`px-5 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-110 flex items-center gap-2 shadow-md ${
 task.active
 ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 hover:shadow-lg'
 : 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 hover:shadow-lg'
 }`}
 >
 {task.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 {task.active
 ? (language === 'ar' ? '' : 'Deaktiver')
 : (language === 'ar' ? '' : 'Aktiver')}
 </button>
 <button
 onClick={() => startEdit(task)}
 className="p-3 bg-gradient-to-r from-blue-100 to-sky-100 text-blue-700 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-110"
 >
 <Edit2 className="w-5 h-5" />
 </button>
 <button
 onClick={() => handleDelete(task.id)}
 className="p-3 bg-gradient-to-r from-red-100 to-pink-100 text-red-700 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-110"
 >
 <Trash2 className="w-5 h-5" />
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 <style>{`
 @keyframes shimmer {
 0% { transform: translateX(-100%); }
 100% { transform: translateX(100%); }
 }
 .animate-shimmer {
 animation: shimmer 2s infinite;
 }
 `}</style>
 </div>
 );
}
