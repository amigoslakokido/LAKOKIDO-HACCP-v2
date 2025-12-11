import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, Settings, Sparkles, User, MessageSquare, Bell, BellRing, AlertTriangle, FileText, Save } from 'lucide-react';
import TaskManagement from './TaskManagement';
import { playSound } from '../../utils/notificationSounds';
import { QRButton } from '../Dashboard/QRButton';

interface RoutineTask {
 id: string;
 name_ar: string;
 name_no: string;
 icon: string;
 sort_order: number;
}

interface Employee {
 id: string;
 name: string;
}

interface DailyRoutineProps {
 language?: 'ar' | 'no';
}

export function DailyRoutine({ language: propLanguage }: DailyRoutineProps) {
 const [tasks, setTasks] = useState<RoutineTask[]>([]);
 const [employees, setEmployees] = useState<Employee[]>([]);
 const [selectedEmployee, setSelectedEmployee] = useState<string>('');
 const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
 const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
 const [showSuccess, setShowSuccess] = useState(false);
 const [successMessage, setSuccessMessage] = useState('');
 const [language, setLanguage] = useState<'ar' | 'no'>(propLanguage || 'no');
 const [loading, setLoading] = useState(true);
 const [notes, setNotes] = useState('');
 const [showManagement, setShowManagement] = useState(false);
 const [alerts, setAlerts] = useState<Array<{id: string, message: string, type: 'warning' | 'danger' | 'info', timestamp: Date}>>([]);
 const [soundEnabled, setSoundEnabled] = useState(true);
 const [inAppAlerts, setInAppAlerts] = useState(true);
 const [warningHour, setWarningHour] = useState(9);
 const [dangerHour, setDangerHour] = useState(12);
 const [criticalHour, setCriticalHour] = useState(15);
 const [soundType, setSoundType] = useState<'bell' | 'chime' | 'alert' | 'alarm' | 'gentle'>('bell');
 const [soundVolume, setSoundVolume] = useState(30);
 const [soundRepeat, setSoundRepeat] = useState(1);
 const [soundInterval, setSoundInterval] = useState(2);
 const [alertPosition, setAlertPosition] = useState<'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center'>('top-right');
 const [alertSize, setAlertSize] = useState<'small' | 'medium' | 'large'>('medium');
 const [alertAnimation, setAlertAnimation] = useState<'slide' | 'fade' | 'bounce' | 'zoom' | 'shake'>('slide');
 const [alertDuration, setAlertDuration] = useState(10);
 const [alertAutoDismiss, setAlertAutoDismiss] = useState(false);
 const [showAlertSoundIcon, setShowAlertSoundIcon] = useState(true);
 const [vibrateEnabled, setVibrateEnabled] = useState(false);
 const [voiceMessageAr, setVoiceMessageAr] = useState('! ');
 const [voiceMessageNo, setVoiceMessageNo] = useState('Advarsel! Vennligst fullfør de daglige rutineoppgavene');
 const [voiceRate, setVoiceRate] = useState(0.9);
 const [voicePitch, setVoicePitch] = useState(1.0);
 const audioRef = useRef<HTMLAudioElement | null>(null);
 const [reportNotes, setReportNotes] = useState('');
 const [flashScreen, setFlashScreen] = useState(false);
 const [shakeScreen, setShakeScreen] = useState(false);
 const [showReportDialog, setShowReportDialog] = useState(false);
 const [generatingReport, setGeneratingReport] = useState(false);
 const [canAccessTasks, setCanAccessTasks] = useState(true);
 const [lockMessage, setLockMessage] = useState('');
 const [showResetDialog, setShowResetDialog] = useState(false);

 useEffect(() => {
 loadData();
 loadNotificationSettings();
 }, []);

 useEffect(() => {
 if (tasks.length > 0) {
 checkOverdueTasks();
 const interval = setInterval(checkOverdueTasks, 60000);
 return () => clearInterval(interval);
 }
 }, [tasks, completedToday, warningHour, dangerHour, criticalHour]);

 useEffect(() => {
 if (audioRef.current) {
 audioRef.current.volume = 0.3;
 }
 }, []);

 const loadNotificationSettings = async () => {
 try {
 const { data } = await supabase
 .from('notification_settings')
 .select('*')
 .maybeSingle();

 if (data) {
 setSoundEnabled(data.sound_enabled);
 setInAppAlerts(data.in_app_alerts);
 setWarningHour(parseInt(data.warning_time.split(':')[0]));
 setDangerHour(parseInt(data.danger_time.split(':')[0]));
 setCriticalHour(parseInt(data.critical_time.split(':')[0]));
 setSoundType(data.sound_type || 'bell');
 setSoundVolume(data.sound_volume || 30);
 setSoundRepeat(data.sound_repeat || 1);
 setSoundInterval(data.sound_interval || 2);
 setAlertPosition(data.alert_position || 'top-right');
 setAlertSize(data.alert_size || 'medium');
 setAlertAnimation(data.alert_animation || 'slide');
 setAlertDuration(data.alert_duration || 10);
 setAlertAutoDismiss(data.alert_auto_dismiss || false);
 setShowAlertSoundIcon(data.show_alert_sound_icon ?? true);
 setVibrateEnabled(data.vibrate_enabled || false);
 setVoiceMessageAr(data.voice_message_ar || '! ');
 setVoiceMessageNo(data.voice_message_no || 'Advarsel! Vennligst fullfør de daglige rutineoppgavene');
 setVoiceRate(data.voice_rate || 0.9);
 setVoicePitch(data.voice_pitch || 1.0);
 }
 } catch (error) {
 console.error('Error loading notification settings:', error);
 }
 };

 const playNotificationSound = () => {
 if (soundEnabled) {
 const customText = soundType === 'voice_ar' ? voiceMessageAr : soundType === 'voice_no' ? voiceMessageNo : undefined;
 playSound(soundType, soundVolume, soundRepeat, soundInterval, undefined, customText, voiceRate, voicePitch);

 if (vibrateEnabled && 'vibrate' in navigator) {
 navigator.vibrate([200, 100, 200]);
 }
 }
 };

 const addAlert = (message: string, type: 'warning' | 'danger' | 'info') => {
 if (!inAppAlerts) return;

 const newAlert = {
 id: Date.now().toString(),
 message,
 type,
 timestamp: new Date()
 };
 setAlerts(prev => [newAlert, ...prev].slice(0, 5));

 // EXTREME Visual effects for urgent alerts
 if (type === 'danger') {
 setFlashScreen(true);
 setTimeout(() => setFlashScreen(false), 2400);

 setShakeScreen(true);
 setTimeout(() => setShakeScreen(false), 2000);
 }

 if (type === 'danger' || type === 'warning') {
 playNotificationSound();
 }

 if (alertAutoDismiss) {
 setTimeout(() => {
 dismissAlert(newAlert.id);
 }, alertDuration * 1000);
 }
 };

 const dismissAlert = (id: string) => {
 setAlerts(prev => prev.filter(alert => alert.id !== id));
 };

 const checkOverdueTasks = () => {
 const now = new Date();
 const currentHour = now.getHours();
 const incompleteCount = tasks.lengthcompletedToday.size;

 console.log('🔔 Checking overdue tasks:', {
 currentHour,
 warningHour,
 dangerHour,
 criticalHour,
 totalTasks: tasks.length,
 completedTasks: completedToday.size,
 incompleteCount,
 soundEnabled,
 inAppAlerts
 });

 if (incompleteCount === 0) {
 console.log('✅ All tasks completed, no alerts needed');
 return;
 }

 if (currentHour >= warningHour && currentHour < dangerHour && incompleteCount > 0) {
 const message = language === 'ar'
 ? `⚠️ ${incompleteCount} `
 : `⚠️ Du har ${incompleteCount} ufullførte oppgaver`;
 if (!alerts.some(a => a.message.includes(incompleteCount.toString()))) {
 console.log('⚠️ Adding WARNING alert:', message);
 addAlert(message, 'warning');
 }
 } else if (currentHour >= dangerHour && currentHour < criticalHour && incompleteCount > 0) {
 const message = language === 'ar'
 ? `🔴 : ${incompleteCount} !`
 : `🔴 Haster: ${incompleteCount} oppgaver må fullføres før skiftet slutter!`;
 if (!alerts.some(a => a.type === 'danger')) {
 console.log('🔴 Adding DANGER alert:', message);
 addAlert(message, 'danger');
 }
 } else if (currentHour >= criticalHour && incompleteCount > 0) {
 const message = language === 'ar'
 ? `❌ : ${incompleteCount} !`
 : `❌ Svært forsinket: ${incompleteCount} oppgaver ikke fullført!`;
 if (!alerts.some(a => a.message.includes('') || a.message.includes('forsinket'))) {
 console.log('❌ Adding CRITICAL alert:', message);
 addAlert(message, 'danger');
 }
 } else {
 console.log('ℹ️ Current hour not in alert range');
 }
 };

 const getTaskUrgencyColor = () => {
 const now = new Date();
 const currentHour = now.getHours();
 const incompleteCount = tasks.lengthcompletedToday.size;

 if (incompleteCount === 0) return 'success';
 if (currentHour >= criticalHour) return 'critical';
 if (currentHour >= dangerHour) return 'danger';
 if (currentHour >= warningHour) return 'warning';
 return 'normal';
 };

 const checkAccessPermission = async () => {
 const now = new Date();
 const currentHour = now.getHours();
 const today = now.toISOString().split('T')[0];

 const { data: todayReport } = await supabase
 .from('daily_routine_reports')
 .select('*')
 .eq('report_date', today)
 .maybeSingle();

 if (todayReport && currentHour < 11) {
 setCanAccessTasks(false);
 setLockMessage(
 language === 'ar'
 ? `🔒 . 11:00 `
 : `🔒 Alle dagens oppgaver er fullført. Du kan starte nye oppgaver i morgen kl. 11:00`
 );
 return false;
 } else {
 setCanAccessTasks(true);
 setLockMessage('');
 return true;
 }
 };

 const loadData = async () => {
 try {
 const hasAccess = await checkAccessPermission();

 if (!hasAccess) {
 setLoading(false);
 return;
 }

 const today = new Date().toISOString().split('T')[0];

 const [tasksRes, employeesRes, logsRes] = await Promise.all([
 supabase
 .from('routine_tasks')
 .select('*')
 .eq('active', true)
 .order('sort_order'),
 supabase
 .from('employees')
 .select('id, name')
 .eq('active', true)
 .order('name'),
 supabase
 .from('routine_task_logs')
 .select('task_id')
 .eq('log_date', today)
 ]);

 if (tasksRes.data) setTasks(tasksRes.data);
 if (employeesRes.data) setEmployees(employeesRes.data);

 if (logsRes.data) {
 const completed = new Set(logsRes.data.map(log => log.task_id));
 setCompletedToday(completed);
 }

 setLoading(false);
 } catch (error) {
 console.error('Error loading data:', error);
 setLoading(false);
 }
 };

 const handleTaskComplete = async (status: 'completed' | 'not_completed') => {
 if (!selectedEmployee) {
 alert(language === 'ar' ? ' Employee ' : 'Vennligst velg ansatt først');
 return;
 }

 const currentTask = tasks[currentTaskIndex];
 if (!currentTask) return;

 try {
 const { error } = await supabase
 .from('routine_task_logs')
 .insert({
 task_id: currentTask.id,
 completed_by: selectedEmployee,
 status: status,
 notes: notes
 });

 if (error) throw error;

 const newCompletedSet = new Set([...completedToday, currentTask.id]);
 setCompletedToday(newCompletedSet);

 const allTasksCompleted = newCompletedSet.size === tasks.length;

 console.log('Task completed:', {
 taskId: currentTask.id,
 allCompleted: allTasksCompleted,
 completedCount: newCompletedSet.size,
 totalCount: tasks.length
 });

 if (allTasksCompleted) {
 setSuccessMessage(
 language === 'ar'
 ? '🎉 ! ...'
 : '🎉 Alle oppgaver fullført! Lagrer rapport...'
 );
 setShowSuccess(true);

 await autoSaveReport(newCompletedSet);

 setTimeout(() => {
 setSuccessMessage(
 language === 'ar'
 ? '✅ ! 11:00 '
 : '✅ Rapport lagret! Systemet er låst til kl. 11:00'
 );
 }, 1500);

 setTimeout(() => {
 setShowSuccess(false);
 }, 5000);

 } else {
 setSuccessMessage(
 status === 'completed'
 ? (language === 'ar' ? '✅ Task !' : '✅ Oppgave registrert!')
 : (language === 'ar' ? '❌ ' : '❌ Ikke fullført registrert')
 );
 setShowSuccess(true);

 setTimeout(() => {
 setShowSuccess(false);
 goToNextIncomplete();
 }, 2000);
 }

 setNotes('');

 } catch (error) {
 console.error('Error saving task:', error);
 alert(language === 'ar' ? ' Error Task' : 'Feil ved lagring av oppgave');
 }
 };

 const goToNextIncomplete = () => {
 const nextIncomplete = tasks.findIndex((t, i) =>
 i > currentTaskIndex && !completedToday.has(t.id)
 );

 if (nextIncomplete !== -1) {
 setCurrentTaskIndex(nextIncomplete);
 } else {
 const firstIncomplete = tasks.findIndex(t => !completedToday.has(t.id));
 if (firstIncomplete !== -1) {
 setCurrentTaskIndex(firstIncomplete);
 } else {
 setCurrentTaskIndex(0);
 }
 }
 };

 const goToPrevious = () => {
 setCurrentTaskIndex(prev => (prev > 0 ? prev1 : tasks.length1));
 };

 const goToNext = () => {
 setCurrentTaskIndex(prev => (prev < tasks.length1 ? prev + 1 : 0));
 };

 const autoSaveReport = async (newCompletedSet: Set<string>) => {
 console.log('=== AUTO SAVE REPORT CALLED ===');
 console.log('Selected Employee:', selectedEmployee);
 console.log('New Completed Set:', Array.from(newCompletedSet));
 console.log('Tasks:', tasks);

 if (!selectedEmployee) {
 console.error('❌ No employee selected for auto-save');
 alert('Error: No employee selected');
 return;
 }

 try {
 console.log('✅ Starting auto-save report...');
 const today = new Date().toISOString().split('T')[0];
 console.log('📅 Today:', today);

 const { data: existingReport, error: checkError } = await supabase
 .from('daily_routine_reports')
 .select('*')
 .eq('report_date', today)
 .maybeSingle();

 if (checkError) {
 console.error('❌ Check error:', checkError);
 throw checkError;
 }

 if (existingReport) {
 console.log('⚠️ Deleting existing report for today...', existingReport);
 const { error: deleteError } = await supabase
 .from('daily_routine_reports')
 .delete()
 .eq('id', existingReport.id);

 if (deleteError) {
 console.error('❌ Delete error:', deleteError);
 throw deleteError;
 }
 console.log('✅ Old report deleted');
 }

 const completedCount = newCompletedSet.size;
 const totalCount = tasks.length;
 const notCompletedCount = totalCountcompletedCount;
 const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

 const reportData = {
 report_date: today,
 generated_by: selectedEmployee,
 total_tasks: totalCount,
 completed_tasks: completedCount,
 not_completed_tasks: notCompletedCount,
 completion_percentage: completionPercentage,
 notes: ` / Automatisk lagret ved fullføring av alle oppgaver`
 };

 console.log('📝 Inserting new report:', reportData);

 const { data: newReport, error: insertError } = await supabase
 .from('daily_routine_reports')
 .insert(reportData)
 .select()
 .single();

 if (insertError) {
 console.error('❌ Insert error:', insertError);
 alert(`Error saving report: ${insertError.message}`);
 throw insertError;
 }

 console.log('✅ Report saved successfully:', newReport);

 console.log('📋 Saving task details...');
 const taskDetails = tasks.map(task => ({
 report_id: newReport.id,
 task_id: task.id,
 task_name_ar: task.name_ar,
 task_name_no: task.name_no,
 task_icon: task.icon,
 completed: newCompletedSet.has(task.id),
 completed_at: newCompletedSet.has(task.id) ? new Date().toISOString() : null
 }));

 const { error: detailsError } = await supabase
 .from('routine_report_task_details')
 .insert(taskDetails);

 if (detailsError) {
 console.error('❌ Task details error:', detailsError);
 } else {
 console.log('✅ Task details saved successfully');
 }

 alert('✅ Report saved successfully!');

 const { data: allReports, error: fetchError } = await supabase
 .from('daily_routine_reports')
 .select('id, created_at')
 .order('created_at', { ascending: true });

 if (fetchError) {
 console.error('❌ Fetch error:', fetchError);
 } else {
 console.log(`📊 Total reports: ${allReports?.length || 0}`);

 if (allReports && allReports.length > 15) {
 const reportsToDelete = allReports.slice(0, allReports.length15);
 const idsToDelete = reportsToDelete.map(r => r.id);

 console.log(`🗑️ Deleting ${idsToDelete.length} old reports...`);

 const { error: batchDeleteError } = await supabase
 .from('daily_routine_reports')
 .delete()
 .in('id', idsToDelete);

 if (batchDeleteError) {
 console.error('❌ Batch delete error:', batchDeleteError);
 } else {
 console.log('✅ Old reports deleted successfully');
 }
 }
 }

 setCanAccessTasks(false);
 setLockMessage(
 language === 'ar'
 ? `🔒 . 11:00 `
 : `🔒 Alle dagens oppgaver er fullført. Du kan starte nye oppgaver i morgen kl. 11:00`
 );

 console.log('=== AUTO SAVE COMPLETE ===');

 } catch (error: any) {
 console.error('💥 FATAL Error auto-saving report:', error);
 console.error('Error details:', {
 message: error?.message,
 details: error?.details,
 hint: error?.hint,
 code: error?.code
 });
 alert(`Fatal error: ${error?.message || 'Unknown error'}`);
 }
 };

 const handleResetToday = async () => {
 const confirmed = window.confirm(
 language === 'ar'
 ? '⚠️ of !'
 : '⚠️ Er du sikker på at du vil slette alle dagens registreringer og rapport? Dette kan ikke angres!'
 );

 if (!confirmed) return;

 try {
 const today = new Date().toISOString().split('T')[0];

 const { error: logsError } = await supabase
 .from('routine_task_logs')
 .delete()
 .eq('log_date', today);

 if (logsError) {
 console.error('Error deleting logs:', logsError);
 throw logsError;
 }

 const { error: reportError } = await supabase
 .from('daily_routine_reports')
 .delete()
 .eq('report_date', today);

 if (reportError) {
 console.error('Error deleting report:', reportError);
 throw reportError;
 }

 alert(
 language === 'ar'
 ? '✅ ! ...'
 : '✅ Alle registreringer og rapport er slettet! Laster inn på nytt...'
 );

 window.location.reload();

 } catch (error) {
 console.error('Error resetting today:', error);
 alert(
 language === 'ar'
 ? '❌ Error '
 : '❌ Feil ved sletting'
 );
 }
 };

 const handleGenerateReport = async () => {
 if (!selectedEmployee) {
 alert(language === 'ar' ? ' Employee ' : 'Vennligst velg ansatt først');
 return;
 }

 setGeneratingReport(true);

 try {
 const today = new Date().toISOString().split('T')[0];

 const { data: existingReport } = await supabase
 .from('daily_routine_reports')
 .select('*')
 .eq('report_date', today)
 .maybeSingle();

 if (existingReport) {
 const confirm = window.confirm(
 language === 'ar'
 ? ' . '
 : 'Det finnes allerede en rapport for i dag. Vil du erstatte den?'
 );
 if (!confirm) {
 setGeneratingReport(false);
 return;
 }

 await supabase
 .from('daily_routine_reports')
 .delete()
 .eq('id', existingReport.id);
 }

 const completedCount = completedToday.size;
 const totalCount = tasks.length;
 const notCompletedCount = totalCountcompletedCount;
 const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

 const { error } = await supabase
 .from('daily_routine_reports')
 .insert({
 report_date: today,
 generated_by: selectedEmployee,
 total_tasks: totalCount,
 completed_tasks: completedCount,
 not_completed_tasks: notCompletedCount,
 completion_percentage: completionPercentage,
 notes: reportNotes
 });

 if (error) throw error;

 const { data: allReports, error: fetchError } = await supabase
 .from('daily_routine_reports')
 .select('id, created_at')
 .order('created_at', { ascending: true });

 if (fetchError) throw fetchError;

 if (allReports && allReports.length > 15) {
 const reportsToDelete = allReports.slice(0, allReports.length15);
 const idsToDelete = reportsToDelete.map(r => r.id);

 await supabase
 .from('daily_routine_reports')
 .delete()
 .in('id', idsToDelete);
 }

 setSuccessMessage(
 language === 'ar'
 ? '✅ Daily tasks !'
 : '✅ Daglig rutinerapport opprettet!'
 );
 setShowSuccess(true);
 setShowReportDialog(false);
 setReportNotes('');

 setTimeout(() => {
 setShowSuccess(false);
 }, 3000);

 } catch (error) {
 console.error('Error generating report:', error);
 alert(language === 'ar' ? ' Error ' : 'Feil ved oppretting av rapport');
 } finally {
 setGeneratingReport(false);
 }
 };

 if (showManagement) {
 return <TaskManagement onBack={() => {
 setShowManagement(false);
 loadData();
 }} />;
 }

 if (!canAccessTasks && !loading) {
 const now = new Date();

 const tomorrow11AM = new Date();
 tomorrow11AM.setDate(tomorrow11AM.getDate() + 1);
 tomorrow11AM.setHours(11, 0, 0, 0);

 const timeUntilUnlock = tomorrow11AM.getTime()now.getTime();
 const hoursUntilUnlock = Math.floor(timeUntilUnlock / (1000 * 60 * 60));
 const minutesUntilUnlock = Math.floor((timeUntilUnlock % (1000 * 60 * 60)) / (1000 * 60));

 return (
 <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 p-6">
 <div className="relative max-w-3xl w-full">
 <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
 <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-white/20 text-center">
 <div className="mb-8">
 <div className="w-32 h-32 mx-auto bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl">
 <span className="text-7xl">🔒</span>
 </div>
 </div>
 <h1 className="text-5xl font-black mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
 {language === 'ar' ? ' ' : 'Dagens oppgaver fullført'}
 </h1>
 <p className="text-2xl text-gray-700 mb-8 leading-relaxed">
 {lockMessage}
 </p>
 <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 mb-4">
 <p className="text-lg text-gray-600 mb-2">
 {language === 'ar' ? '📅 :' : '📅 Systemet åpner:'}
 </p>
 <p className="text-3xl font-black text-blue-600">
 {tomorrow11AM.toLocaleString(language === 'ar' ? 'ar-EG' : 'nb-NO', {
 calendar: 'gregory',
 weekday: 'long',
 year: 'numeric',
 month: 'long',
 day: 'numeric',
 hour: '2-digit',
 minute: '2-digit'
 })}
 </p>
 </div>
 <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200 mb-8">
 <p className="text-lg text-gray-600 mb-2">
 {language === 'ar' ? '⏰ :' : '⏰ Tid igjen:'}
 </p>
 <p className="text-4xl font-black text-orange-600">
 {hoursUntilUnlock} {language === 'ar' ? '' : 'timer'} {minutesUntilUnlock} {language === 'ar' ? '' : 'minutter'}
 </p>
 </div>
 <div className="flex flex-col gap-4">
 <button
 onClick={handleResetToday}
 className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white text-xl font-bold rounded-2xl hover:shadow-xl transition-all hover:scale-105"
 >
 {language === 'ar' ? '🔄 ()' : '🔄 Reset dag (for testing)'}
 </button>
 <div className="flex gap-4">
 <button
 onClick={() => setLanguage(language === 'ar' ? 'no' : 'ar')}
 className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-bold rounded-2xl hover:shadow-xl transition-all"
 >
 {language === 'ar' ? 'NO' : ''}
 </button>
 <button
 onClick={() => window.location.href = '/'}
 className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-xl font-bold rounded-2xl hover:shadow-xl transition-all"
 >
 {language === 'ar' ? '🏠 ' : '🏠 Hjem'}
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
 }

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

 const currentTask = tasks[currentTaskIndex];
 const completedCount = completedToday.size;
 const totalCount = tasks.length;
 const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

 if (!currentTask) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
 <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 text-center border border-white/20">
 <p className="text-3xl font-bold text-gray-800 mb-8">
 {language === 'ar' ? ' ' : 'Ingen oppgaver'}
 </p>
 <button
 onClick={() => setShowManagement(true)}
 className="px-10 py-5 bg-gradient-to-r from-blue-600 to-emerald-600 text-white text-xl font-bold rounded-2xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
 >
 {language === 'ar' ? ' ' : 'Legg til oppgaver'}
 </button>
 </div>
 </div>
 );
 }

 return (
 <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8 relative overflow-hidden ${flashScreen ? 'flash-multi-color' : ''} ${shakeScreen ? 'shake-extreme' : ''}`}>
 {/* Flash OverlayEXTREME */}
 {flashScreen && (
 <>
 <div className="fixed inset-0 z-50 pointer-events-none bg-gradient-to-br from-red-500/50 via-orange-500/50 to-red-500/50 animate-pulse"></div>
 <div className="fixed inset-0 z-50 pointer-events-none border-8 animate-border-rainbow"></div>
 </>
 )}

 {/* Animated Background Elements */}
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent"></div>
 {/* Audio Element */}
 <audio ref={audioRef} preload="auto">
 <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE" type="audio/wav" />
 </audio>

 {/* Alerts Panel */}
 {alerts.length > 0 && (
 <div
 className={`fixed z-50 space-y-2 ${
 alertPosition === 'top-right' ? 'top-4 right-4' :
 alertPosition === 'top-left' ? 'top-4 left-4' :
 alertPosition === 'top-center' ? 'top-4 left-1/2 -translate-x-1/2' :
 alertPosition === 'bottom-right' ? 'bottom-4 right-4' :
 alertPosition === 'bottom-left' ? 'bottom-4 left-4' :
 'bottom-4 left-1/2 -translate-x-1/2'
 } ${
 alertSize === 'small' ? 'max-w-xs' :
 alertSize === 'large' ? 'max-w-2xl' :
 'max-w-md'
 }`}
 >
 {alerts.map(alert => (
 <div
 key={alert.id}
 className={`backdrop-blur-xl rounded-2xl shadow-2xl flex items-start gap-3 border-8 ${
 alert.type === 'danger'
 ? 'bg-red-600/95 text-white animate-border-rainbow animate-glow-extreme animate-scale-pulse-extreme'
 : alert.type === 'warning'
 ? 'bg-amber-600/95 border-amber-400 text-white animate-pulse animate-glow-danger'
 : 'bg-blue-600/95 border-blue-400 text-white'
 } ${
 alertSize === 'small' ? 'p-3' :
 alertSize === 'large' ? 'p-6' :
 'p-4'
 } ${
 alertAnimation === 'slide' ? 'animate-slide-in-right' :
 alertAnimation === 'fade' ? 'animate-fade-in' :
 alertAnimation === 'bounce' ? 'animate-bounce-in' :
 alertAnimation === 'zoom' ? 'animate-zoom-in' :
 'animate-shake'
 }`}
 >
 {alert.type === 'danger' && <AlertTriangle className={`animate-rotate-pulse flex-shrink-0 ${alertSize === 'small' ? 'w-6 h-6' : alertSize === 'large' ? 'w-10 h-10' : 'w-8 h-8'}`} />}
 {alert.type === 'warning' && <BellRing className={`animate-bounce flex-shrink-0 ${alertSize === 'small' ? 'w-6 h-6' : alertSize === 'large' ? 'w-10 h-10' : 'w-8 h-8'}`} />}
 {alert.type === 'info' && <Bell className={`flex-shrink-0 ${alertSize === 'small' ? 'w-6 h-6' : alertSize === 'large' ? 'w-10 h-10' : 'w-8 h-8'}`} />}
 <div className="flex-1">
 <p className={`font-bold leading-tight ${alertSize === 'small' ? 'text-base' : alertSize === 'large' ? 'text-2xl' : 'text-lg'}`}>
 {showAlertSoundIcon && soundEnabled && '🔊 '}
 {alert.message}
 </p>
 <p className={`opacity-90 mt-1 ${alertSize === 'small' ? 'text-xs' : alertSize === 'large' ? 'text-base' : 'text-sm'}`}>
 {alert.timestamp.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'nb-NO', { hour: '2-digit', minute: '2-digit' })}
 </p>
 </div>
 {!alertAutoDismiss && (
 <button
 onClick={() => dismissAlert(alert.id)}
 className="text-white hover:bg-white/20 rounded-lg p-1 transition-all"
 >
 <XCircle className={alertSize === 'small' ? 'w-4 h-4' : alertSize === 'large' ? 'w-6 h-6' : 'w-5 h-5'} />
 </button>
 )}
 </div>
 ))}
 </div>
 )}

 {/* Success Notification */}
 {showSuccess && (
 <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
 <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 flex items-center gap-4 border-2 border-emerald-400/50">
 <CheckCircle2 className="w-12 h-12 text-emerald-500" />
 <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{successMessage}</span>
 </div>
 </div>
 )}

 <div className="max-w-7xl mx-auto relative">
 {/* Header */}
 <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-4 md:p-5 mb-4 border border-white/20">
 <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4">
 <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-blue-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
 {language === 'ar' ? '🎯 ' : '🎯 Daglige Rutineoppgaver'}
 </h1>
 <div className="flex gap-2">
 <button
 onClick={handleResetToday}
 className="p-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 border border-white/20"
 title={language === 'ar' ? ' ' : 'Reset dag'}
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
 </svg>
 </button>
 <button
 onClick={() => setSoundEnabled(!soundEnabled)}
 className={`p-2 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 border border-white/20 ${
 soundEnabled
 ? 'bg-gradient-to-r from-green-500 to-emerald-600'
 : 'bg-gradient-to-r from-gray-500 to-gray-600'
 }`}
 title={language === 'ar' ? (soundEnabled ? ' ' : ' ') : (soundEnabled ? 'Demp lyd' : 'Aktiver lyd')}
 >
 {soundEnabled ? <Bell className="w-5 h-5" /> : <BellRing className="w-5 h-5 opacity-50" />}
 </button>
 <button
 onClick={() => setShowManagement(true)}
 className="p-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 border border-white/20"
 title={language === 'ar' ? ' ' : 'Administrer oppgaver'}
 >
 <Settings className="w-5 h-5" />
 </button>
 <QRButton language={language} />
 <button
 onClick={() => setLanguage(language === 'ar' ? 'no' : 'ar')}
 className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-bold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 border border-white/20"
 >
 {language === 'ar' ? 'NO' : ''}
 </button>
 </div>
 </div>

 {/* Progress Bar */}
 <div className="relative">
 <div className="flex justify-between items-center mb-3">
 <span className="text-lg font-bold text-gray-700 flex items-center gap-2">
 {getTaskUrgencyColor() === 'critical' && <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />}
 {getTaskUrgencyColor() === 'danger' && <BellRing className="w-5 h-5 text-orange-600 animate-bounce" />}
 {language === 'ar' ? '📊 Progress ' : '📊 Daglig fremgang'}
 </span>
 <span className={`text-3xl font-black bg-gradient-to-r bg-clip-text text-transparent ${
 getTaskUrgencyColor() === 'success' ? 'from-emerald-600 to-teal-600' :
 getTaskUrgencyColor() === 'critical' ? 'from-red-600 to-pink-600' :
 getTaskUrgencyColor() === 'danger' ? 'from-orange-600 to-red-600' :
 getTaskUrgencyColor() === 'warning' ? 'from-amber-600 to-orange-600' :
 'from-blue-600 to-emerald-600'
 }`}>
 {completedCount} / {totalCount}
 </span>
 </div>
 <div className={`relative w-full h-6 rounded-xl shadow-inner overflow-hidden border-2 ${
 getTaskUrgencyColor() === 'critical' ? 'bg-gradient-to-r from-red-200 to-red-300 border-red-400 animate-pulse' :
 getTaskUrgencyColor() === 'danger' ? 'bg-gradient-to-r from-orange-200 to-orange-300 border-orange-400' :
 getTaskUrgencyColor() === 'warning' ? 'bg-gradient-to-r from-amber-200 to-amber-300 border-amber-400' :
 'bg-gradient-to-r from-gray-200 to-gray-300 border-gray-300/50'
 }`}>
 <div
 className="h-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-xl transition-all duration-1000 ease-out relative overflow-hidden"
 style={{ width: `${completionPercentage}%` }}
 >
 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
 {completionPercentage > 15 && (
 <div className="absolute inset-0 flex items-center justify-end pr-3">
 <span className="text-white text-sm font-bold drop-shadow-lg">{Math.round(completionPercentage)}%</span>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>

 {/* Main Task Card */}
 {currentTask && (
 <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-6 md:p-8 mb-4 border border-white/20">
 {/* Navigation */}
 <div className="flex items-center justify-between mb-6">
 <button
 onClick={goToPrevious}
 className="group p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 border border-white/30"
 >
 <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
 </button>

 <div className="text-center px-4 py-2 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl border border-blue-200/50">
 <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
 {language === 'ar'
 ? `Task ${currentTaskIndex + 1} of ${totalCount}`
 : `Oppgave ${currentTaskIndex + 1} av ${totalCount}`}
 </p>
 </div>

 <button
 onClick={goToNext}
 className="group p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 border border-white/30"
 >
 <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
 </button>
 </div>

 {/* Task Display */}
 <div className="text-center mb-6">
 <div className="relative inline-block mb-4">
 <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
 <div className="relative text-7xl transform hover:scale-105 transition-transform duration-300 drop-shadow-xl">
 {currentTask.icon}
 </div>
 </div>
 <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-4 leading-tight">
 {language === 'ar' ? currentTask.name_ar : currentTask.name_no}
 </h2>

 {completedToday.has(currentTask.id) && (
 <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 rounded-2xl text-xl font-bold border-2 border-emerald-300/50 shadow-lg">
 <CheckCircle2 className="w-7 h-7" />
 {language === 'ar' ? 'Completed' : 'Fullført'}
 </div>
 )}
 </div>

 {/* Employee Selection & Actions */}
 {!completedToday.has(currentTask.id) && (
 <div className="max-w-3xl mx-auto space-y-6">
 {/* Employee Selection */}
 <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-2xl p-6 border-2 border-blue-200/50 shadow-lg">
 <label className="flex items-center justify-center gap-3 text-xl font-bold text-gray-800 mb-4">
 <User className="w-6 h-6 text-blue-600" />
 {language === 'ar' ? 'of Task' : 'Hvem utfører oppgaven?'}
 </label>
 <select
 value={selectedEmployee}
 onChange={(e) => setSelectedEmployee(e.target.value)}
 className="w-full px-6 py-5 text-xl font-semibold border-2 border-blue-300 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all bg-white shadow-inner text-center cursor-pointer hover:border-blue-400"
 >
 <option value="">{language === 'ar' ? ' Employee...' : 'Velg ansatt...'}</option>
 {employees.map((emp) => (
 <option key={emp.id} value={emp.id}>
 {emp.name}
 </option>
 ))}
 </select>
 </div>

 {/* Notes Field */}
 <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200/50 shadow-lg">
 <label className="flex items-center justify-center gap-3 text-xl font-bold text-gray-800 mb-4">
 <MessageSquare className="w-6 h-6 text-amber-600" />
 {language === 'ar' ? ' ()' : 'Notater (valgfritt)'}
 </label>
 <textarea
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 rows={4}
 className="w-full px-6 py-4 text-lg border-2 border-amber-300 rounded-2xl focus:ring-4 focus:ring-amber-500/50 focus:border-amber-500 transition-all shadow-inner bg-white placeholder-gray-400"
 placeholder={language === 'ar' ? 'Add note...' : 'Legg til notat...'}
 />
 </div>

 {/* Action Buttons */}
 <div className="flex flex-col md:flex-row gap-6">
 <button
 onClick={() => handleTaskComplete('completed')}
 disabled={!selectedEmployee}
 className="group flex-1 px-8 py-7 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-2xl md:text-3xl font-black rounded-2xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-4 border-2 border-white/30 relative overflow-hidden"
 >
 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer"></div>
 <CheckCircle2 className="w-10 h-10 relative z-10" />
 <span className="relative z-10">{language === 'ar' ? ' ✅' : 'Fullført ✅'}</span>
 </button>

 <button
 onClick={() => handleTaskComplete('not_completed')}
 disabled={!selectedEmployee}
 className="group flex-1 px-8 py-7 bg-gradient-to-r from-red-500 to-pink-600 text-white text-2xl md:text-3xl font-black rounded-2xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-4 border-2 border-white/30 relative overflow-hidden"
 >
 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer"></div>
 <XCircle className="w-10 h-10 relative z-10" />
 <span className="relative z-10">{language === 'ar' ? 'Not done ❌' : 'Ikke fullført ❌'}</span>
 </button>
 </div>
 </div>
 )}
 </div>
 )}

 {/* All Tasks Overview */}
 <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border border-white/20">
 <h3 className="text-2xl md:text-3xl font-black text-gray-800 mb-6 flex items-center gap-3">
 <span className="text-3xl">📋</span>
 {language === 'ar' ? ' ' : 'Alle oppgaver i dag'}
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {tasks.map((task, index) => (
 <button
 key={task.id}
 onClick={() => setCurrentTaskIndex(index)}
 className={`group p-6 rounded-2xl border-2 transition-all transform hover:scale-105 text-left shadow-lg relative overflow-hidden ${
 completedToday.has(task.id)
 ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-400 shadow-emerald-200/50'
 : currentTaskIndex === index
 ? 'bg-gradient-to-br from-blue-50 to-emerald-50 border-blue-500 shadow-blue-200/50'
 : 'bg-white border-gray-300 hover:border-blue-400 hover:shadow-xl'
 }`}
 >
 <div className="flex items-center gap-4 relative z-10">
 <span className="text-5xl transform group-hover:scale-110 transition-transform">{task.icon}</span>
 <div className="flex-1">
 <p className="font-bold text-gray-800 text-lg leading-tight mb-1">
 {language === 'ar' ? task.name_ar : task.name_no}
 </p>
 {completedToday.has(task.id) && (
 <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
 <CheckCircle2 className="w-4 h-4" />
 {language === 'ar' ? ' ✓' : 'Fullført ✓'}
 </div>
 )}
 </div>
 </div>
 {currentTaskIndex === index && (
 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 animate-pulse"></div>
 )}
 </button>
 ))}
 </div>

 {/* Generate Report Button */}
 <div className="mt-8 flex justify-center">
 <button
 onClick={() => setShowReportDialog(true)}
 className="group px-8 py-6 bg-gradient-to-r from-purple-500 via-blue-600 to-emerald-600 text-white text-xl md:text-2xl font-black rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-4 border-2 border-white/30 relative overflow-hidden"
 >
 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer"></div>
 <FileText className="w-8 h-8 relative z-10" />
 <span className="relative z-10">
 {language === 'ar' ? '📊 ' : '📊 Opprett daglig rapport'}
 </span>
 <Sparkles className="w-6 h-6 relative z-10 group-hover:rotate-180 transition-transform duration-500" />
 </button>
 </div>
 </div>
 </div>

 {/* Report Generation Dialog */}
 {showReportDialog && (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
 <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full border-2 border-purple-200/50 transform animate-zoom-in">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
 <FileText className="w-8 h-8 text-purple-600" />
 {language === 'ar' ? ' Daily tasks' : 'Opprett daglig rutinerapport'}
 </h2>
 <button
 onClick={() => setShowReportDialog(false)}
 className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
 >
 <XCircle className="w-6 h-6 text-gray-600" />
 </button>
 </div>

 {/* Report Summary */}
 <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 mb-6 border-2 border-purple-200/50">
 <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
 <Sparkles className="w-5 h-5 text-purple-600" />
 {language === 'ar' ? ' ' : 'Dagens sammendrag'}
 </h3>
 <div className="grid grid-cols-2 gap-4">
 <div className="bg-white rounded-xl p-4 border border-purple-200">
 <p className="text-sm text-gray-600 mb-1">
 {language === 'ar' ? ' ' : 'Totalt oppgaver'}
 </p>
 <p className="text-3xl font-black text-gray-800">{totalCount}</p>
 </div>
 <div className="bg-white rounded-xl p-4 border border-emerald-200">
 <p className="text-sm text-gray-600 mb-1">
 {language === 'ar' ? 'of' : 'Fullført'}
 </p>
 <p className="text-3xl font-black text-emerald-600">{completedCount}</p>
 </div>
 <div className="bg-white rounded-xl p-4 border border-red-200">
 <p className="text-sm text-gray-600 mb-1">
 {language === 'ar' ? ' of' : 'Ikke fullført'}
 </p>
 <p className="text-3xl font-black text-red-600">{totalCountcompletedCount}</p>
 </div>
 <div className="bg-white rounded-xl p-4 border border-blue-200">
 <p className="text-sm text-gray-600 mb-1">
 {language === 'ar' ? ' ' : 'Fullførelsesrate'}
 </p>
 <p className="text-3xl font-black text-blue-600">{Math.round(completionPercentage)}%</p>
 </div>
 </div>
 </div>

 {/* Report Notes */}
 <div className="mb-6">
 <label className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
 <MessageSquare className="w-5 h-5 text-purple-600" />
 {language === 'ar' ? ' ()' : 'Rapportnotater (valgfritt)'}
 </label>
 <textarea
 value={reportNotes}
 onChange={(e) => setReportNotes(e.target.value)}
 rows={4}
 className="w-full px-4 py-3 text-lg border-2 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
 placeholder={language === 'ar' ? ' ...' : 'Legg til notater om dagens ytelse...'}
 />
 </div>

 {/* Action Buttons */}
 <div className="flex gap-4">
 <button
 onClick={() => setShowReportDialog(false)}
 className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 text-lg font-bold rounded-xl hover:bg-gray-300 transition-all"
 >
 {language === 'ar' ? '' : 'Avbryt'}
 </button>
 <button
 onClick={handleGenerateReport}
 disabled={generatingReport}
 className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white text-lg font-bold rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
 >
 {generatingReport ? (
 <>
 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 {language === 'ar' ? ' ...' : 'Oppretter...'}
 </>
 ) : (
 <>
 <Save className="w-5 h-5" />
 {language === 'ar' ? ' ' : 'Opprett rapport'}
 </>
 )}
 </button>
 </div>
 </div>
 </div>
 )}

 <style>{`
 @keyframes shimmer {
 0% { transform: translateX(-100%); }
 100% { transform: translateX(100%); }
 }
 .animate-shimmer {
 animation: shimmer 2s infinite;
 }
 @keyframes slide-in-right {
 0% {
 transform: translateX(100%);
 opacity: 0;
 }
 100% {
 transform: translateX(0);
 opacity: 1;
 }
 }
 .animate-slide-in-right {
 animation: slide-in-right 0.4s ease-out;
 }
 @keyframes fade-in {
 0% {
 opacity: 0;
 }
 100% {
 opacity: 1;
 }
 }
 .animate-fade-in {
 animation: fade-in 0.5s ease-in;
 }
 @keyframes bounce-in {
 0% {
 transform: scale(0.3);
 opacity: 0;
 }
 50% {
 transform: scale(1.05);
 }
 70% {
 transform: scale(0.9);
 }
 100% {
 transform: scale(1);
 opacity: 1;
 }
 }
 .animate-bounce-in {
 animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
 }
 @keyframes zoom-in {
 0% {
 transform: scale(0);
 opacity: 0;
 }
 100% {
 transform: scale(1);
 opacity: 1;
 }
 }
 .animate-zoom-in {
 animation: zoom-in 0.4s ease-out;
 }
 @keyframes shake {
 0%, 100% {
 transform: translateX(0);
 }
 10%, 30%, 50%, 70%, 90% {
 transform: translateX(-5px);
 }
 20%, 40%, 60%, 80% {
 transform: translateX(5px);
 }
 }
 .animate-shake {
 animation: shake 0.5s ease-in-out;
 }
 `}</style>
 </div>
 );
}
