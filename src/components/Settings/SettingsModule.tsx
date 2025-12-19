import { useState, useEffect } from 'react';
import { supabase, Zone, Equipment, CleaningTask, Employee } from '../../lib/supabase';
import { Settings, Plus, Edit2, Trash2, Save, X, Users, Thermometer, Briefcase, Clock, Bell, BellRing, Mail, AlertTriangle, Volume2, Maximize2, Zap, Timer, Play, FileText } from 'lucide-react';
import { NOTIFICATION_SOUNDS, playSound } from '../../utils/notificationSounds';
import { HACCPReportSettings } from './HACCPReportSettings';

interface ScheduledReportConfig {
 id: string;
 is_enabled: boolean;
 schedule_time: string;
 last_run: string | null;
 next_run: string | null;
}

interface NotificationSettings {
 id: string;
 sound_enabled: boolean;
 in_app_alerts: boolean;
 email_notifications: boolean;
 warning_time: string;
 danger_time: string;
 critical_time: string;
 email_recipients: string[];
 sound_type: string;
 sound_volume: number;
 sound_repeat: number;
 sound_interval: number;
 alert_position: string;
 alert_size: string;
 alert_animation: string;
 alert_duration: number;
 alert_auto_dismiss: boolean;
 show_alert_sound_icon: boolean;
 vibrate_enabled: boolean;
 voice_message_ar: string;
 voice_message_no: string;
 voice_rate: number;
 voice_pitch: number;
}

export function SettingsModule() {
 const [activeSection, setActiveSection] = useState<'settings' | 'company' | 'reports'>('settings');
 const [zones, setZones] = useState<(Zone & { equipment: Equipment[] })[]>([]);
 const [tasks, setTasks] = useState<CleaningTask[]>([]);
 const [employees, setEmployees] = useState<Employee[]>([]);
 const [loading, setLoading] = useState(true);

 const [scheduleConfig, setScheduleConfig] = useState<ScheduledReportConfig | null>(null);
 const [isScheduleEnabled, setIsScheduleEnabled] = useState(true);
 const [scheduleTime, setScheduleTime] = useState('23:00');
 const [savingSchedule, setSavingSchedule] = useState(false);

 const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
 const [soundEnabled, setSoundEnabled] = useState(true);
 const [inAppAlerts, setInAppAlerts] = useState(true);
 const [emailNotifications, setEmailNotifications] = useState(false);
 const [warningTime, setWarningTime] = useState('09:00');
 const [dangerTime, setDangerTime] = useState('12:00');
 const [criticalTime, setCriticalTime] = useState('15:00');
 const [emailRecipients, setEmailRecipients] = useState<string[]>([]);
 const [newEmail, setNewEmail] = useState('');
 const [savingNotifications, setSavingNotifications] = useState(false);

 const [soundType, setSoundType] = useState<'bell' | 'chime' | 'alert' | 'alarm' | 'gentle' | 'urgent' | 'siren' | 'loud_beep' | 'voice_ar' | 'voice_no'>('siren');
 const [soundVolume, setSoundVolume] = useState(80);
 const [soundRepeat, setSoundRepeat] = useState(3);
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

 const [isLocked, setIsLocked] = useState(true);
 const [passwordInput, setPasswordInput] = useState('');
 const [showPasswordError, setShowPasswordError] = useState(false);
 const [authorizedEmail, setAuthorizedEmail] = useState('amigoslakokido@gmail.com');

 const [addingZone, setAddingZone] = useState(false);
 const [newZoneName, setNewZoneName] = useState('');
 const [newZoneDescription, setNewZoneDescription] = useState('');

 const [editingZone, setEditingZone] = useState<string | null>(null);
 const [editingZoneName, setEditingZoneName] = useState('');
 const [editingZoneDescription, setEditingZoneDescription] = useState('');

 const [addingEquipment, setAddingEquipment] = useState<string | null>(null);
 const [newEquipmentName, setNewEquipmentName] = useState('');
 const [newEquipmentType, setNewEquipmentType] = useState<'refrigerator' | 'freezer' | 'other'>('refrigerator');
 const [newEquipmentMinTemp, setNewEquipmentMinTemp] = useState('-18');
 const [newEquipmentMaxTemp, setNewEquipmentMaxTemp] = useState('4');

 const [editingEquipment, setEditingEquipment] = useState<string | null>(null);
 const [editingEquipmentName, setEditingEquipmentName] = useState('');
 const [editingEquipmentType, setEditingEquipmentType] = useState<'refrigerator' | 'freezer' | 'other'>('refrigerator');
 const [editingEquipmentMinTemp, setEditingEquipmentMinTemp] = useState('');
 const [editingEquipmentMaxTemp, setEditingEquipmentMaxTemp] = useState('');

 const [addingEmployee, setAddingEmployee] = useState(false);
 const [newEmployeeName, setNewEmployeeName] = useState('');
 const [newEmployeeRole, setNewEmployeeRole] = useState<'daglig_leder' | 'kontrollor' | 'medarbeider'>('medarbeider');

 const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
 const [editingEmployeeName, setEditingEmployeeName] = useState('');
 const [editingEmployeeRole, setEditingEmployeeRole] = useState<'daglig_leder' | 'kontrollor' | 'medarbeider'>('medarbeider');
 const [editingEmployeeStatus, setEditingEmployeeStatus] = useState<'active' | 'paused'>('active');

 const [addingTask, setAddingTask] = useState(false);
 const [editingTask, setEditingTask] = useState<string | null>(null);
 const [newTaskName, setNewTaskName] = useState('');
 const [newTaskDescription, setNewTaskDescription] = useState('');
 const [newTaskFrequency, setNewTaskFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
 const [newTaskZoneId, setNewTaskZoneId] = useState<string>('');
 const [editingTaskName, setEditingTaskName] = useState('');
 const [editingTaskDescription, setEditingTaskDescription] = useState('');
 const [editingTaskFrequency, setEditingTaskFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
 const [editingTaskZoneId, setEditingTaskZoneId] = useState<string>('');

 useEffect(() => {
 loadData();
 loadScheduleConfig();
 loadNotificationSettings();
 loadAuthorizedEmail();
 }, []);

 const loadAuthorizedEmail = async () => {
 try {
 const { data } = await supabase
 .from('settings_password')
 .select('authorized_email')
 .maybeSingle();

 if (data?.authorized_email) {
 setAuthorizedEmail(data.authorized_email);
 }
 } catch (error) {
 console.error('Error loading authorized email:', error);
 }
 };

 const loadScheduleConfig = async () => {
 try {
 const { data } = await supabase
 .from('scheduled_reports_config')
 .select('*')
 .maybeSingle();

 if (data) {
 setScheduleConfig(data);
 setIsScheduleEnabled(data.is_enabled);
 setScheduleTime(data.schedule_time.substring(0, 5));
 }
 } catch (error) {
 console.error('Error loading schedule config:', error);
 }
 };

 const loadNotificationSettings = async () => {
 try {
 const { data } = await supabase
 .from('notification_settings')
 .select('*')
 .maybeSingle();

 if (data) {
 setNotificationSettings(data);
 setSoundEnabled(data.sound_enabled);
 setInAppAlerts(data.in_app_alerts);
 setEmailNotifications(data.email_notifications);
 setWarningTime(data.warning_time.substring(0, 5));
 setDangerTime(data.danger_time.substring(0, 5));
 setCriticalTime(data.critical_time.substring(0, 5));
 setEmailRecipients(data.email_recipients || []);
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

 const updateNotificationSettings = async () => {
 if (!notificationSettings) return;

 setSavingNotifications(true);
 try {
 const { data } = await supabase
 .from('notification_settings')
 .update({
 sound_enabled: soundEnabled,
 in_app_alerts: inAppAlerts,
 email_notifications: emailNotifications,
 warning_time: warningTime + ':00',
 danger_time: dangerTime + ':00',
 critical_time: criticalTime + ':00',
 email_recipients: emailRecipients,
 sound_type: soundType,
 sound_volume: soundVolume,
 sound_repeat: soundRepeat,
 sound_interval: soundInterval,
 alert_position: alertPosition,
 alert_size: alertSize,
 alert_animation: alertAnimation,
 alert_duration: alertDuration,
 alert_auto_dismiss: alertAutoDismiss,
 show_alert_sound_icon: showAlertSoundIcon,
 vibrate_enabled: vibrateEnabled,
 voice_message_ar: voiceMessageAr,
 voice_message_no: voiceMessageNo,
 voice_rate: voiceRate,
 voice_pitch: voicePitch,
 })
 .eq('id', notificationSettings.id)
 .select()
 .single();

 if (data) {
 setNotificationSettings(data);
 alert(' !');
 }
 } catch (error) {
 console.error('Error updating notification settings:', error);
 alert(' Error ');
 } finally {
 setSavingNotifications(false);
 }
 };

 const addEmailRecipient = () => {
 const trimmedEmail = newEmail.trim();
 if (trimmedEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
 if (!emailRecipients.includes(trimmedEmail)) {
 setEmailRecipients([...emailRecipients, trimmedEmail]);
 setNewEmail('');
 } else {
 alert(' ');
 }
 } else {
 alert(' ');
 }
 };

 const removeEmailRecipient = (email: string) => {
 setEmailRecipients(emailRecipients.filter(e => e !== email));
 };

 const hashPassword = async (password: string): Promise<string> => {
 const encoder = new TextEncoder();
 const data = encoder.encode(password);
 const hashBuffer = await crypto.subtle.digest('SHA-256', data);
 const hashArray = Array.from(new Uint8Array(hashBuffer));
 const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
 return hashHex;
 };

 const handlePasswordSubmit = async () => {
 try {
 const { data: passwordData } = await supabase
 .from('settings_password')
 .select('password_hash')
 .maybeSingle();

 if (!passwordData) {
 setShowPasswordError(true);
 setTimeout(() => setShowPasswordError(false), 3000);
 return;
 }

 const inputHash = await hashPassword(passwordInput.trim());

 if (inputHash === passwordData.password_hash) {
 setIsLocked(false);
 setPasswordInput('');
 setShowPasswordError(false);
 } else {
 setShowPasswordError(true);
 setTimeout(() => setShowPasswordError(false), 3000);
 }
 } catch (error) {
 console.error('Error verifying password:', error);
 setShowPasswordError(true);
 setTimeout(() => setShowPasswordError(false), 3000);
 }
 };

 const handlePasswordReset = async () => {
 const userEmail = prompt(
 ' / Skriv inn din e-post for å bekrefte:'
 );

 if (userEmail?.trim().toLowerCase() === authorizedEmail.toLowerCase()) {
 const newPassword = prompt(
 '✅ of !\n' +
 'E-post bekreftet!\n\n' +
 ' / Skriv inn nytt passord:'
 );

 if (newPassword && newPassword.trim()) {
 try {
 const newPasswordHash = await hashPassword(newPassword.trim());

 const { error } = await supabase
 .from('settings_password')
 .update({
 password_hash: newPasswordHash,
 updated_at: new Date().toISOString()
 })
 .eq('authorized_email', authorizedEmail);

 if (error) throw error;

 alert(
 '✅ !\n' +
 'Passord endret!\n\n' +
 '⚠️ : ' + newPassword.trim() + '\n' +
 'Nytt passord: ' + newPassword.trim() + '\n\n' +
 ' of / Vennligst lagre det på et trygt sted'
 );
 } catch (error) {
 console.error('Error updating password:', error);
 alert(
 '❌ Error \n' +
 'En feil oppstod ved endring av passord'
 );
 }
 }
 } else if (userEmail) {
 alert(
 '❌ \n' +
 'Feil e-post\n\n' +
 ' :\n' +
 'For å få passordet, kontakt:\n\n' +
 '📧 ' + authorizedEmail
 );
 }
 };

 const updateScheduleConfig = async () => {
 if (!scheduleConfig) return;

 setSavingSchedule(true);
 try {
 const { data } = await supabase
 .from('scheduled_reports_config')
 .update({
 is_enabled: isScheduleEnabled,
 schedule_time: scheduleTime + ':00',
 })
 .eq('id', scheduleConfig.id)
 .select()
 .single();

 if (data) {
 setScheduleConfig(data);
 }
 } catch (error) {
 console.error('Error updating schedule config:', error);
 alert('Det oppstod en feil ved oppdatering av innstillingene');
 } finally {
 setSavingSchedule(false);
 }
 };

 const loadData = async () => {
 try {
 const { data: zonesData } = await supabase
 .from('zones')
 .select('*')
 .order('name');

 if (zonesData) {
 const zonesWithEquipment = await Promise.all(
 zonesData.map(async (zone) => {
 const { data: equipmentItems } = await supabase
 .from('equipment')
 .select('*')
 .eq('zone_id', zone.id)
 .order('name');

 return { ...zone, equipment: equipmentItems || [] };
 })
 );

 setZones(zonesWithEquipment);
 }

 const { data: tasksData } = await supabase
 .from('cleaning_tasks')
 .select('*')
 .order('task_name');

 if (tasksData) {
 setTasks(tasksData);
 }

 const { data: employeesData } = await supabase
 .from('employees')
 .select('*')
 .order('role', { ascending: false })
 .order('name');

 if (employeesData) {
 setEmployees(employeesData);
 }
 } catch (error) {
 console.error('Error loading data:', error);
 } finally {
 setLoading(false);
 }
 };

 const addZone = async () => {
 if (!newZoneName.trim()) {
 alert('Vennligst skriv inn et navn for sonen');
 return;
 }

 try {
 const { data } = await supabase
 .from('zones')
 .insert({
 name: newZoneName,
 description: newZoneDescription,
 })
 .select()
 .single();

 if (data) {
 setZones([...zones, { ...data, equipment: [] }]);
 setAddingZone(false);
 setNewZoneName('');
 setNewZoneDescription('');
 }
 } catch (error) {
 console.error('Error adding zone:', error);
 alert('Det oppstod en feil ved opprettelse av sone');
 }
 };

 const updateZone = async (zoneId: string) => {
 if (!editingZoneName.trim()) {
 alert('Vennligst skriv inn et navn for sonen');
 return;
 }

 try {
 const { data } = await supabase
 .from('zones')
 .update({
 name: editingZoneName,
 description: editingZoneDescription,
 })
 .eq('id', zoneId)
 .select()
 .single();

 if (data) {
 setZones(zones.map(z => z.id === zoneId ? { ...z, ...data } : z));
 setEditingZone(null);
 setEditingZoneName('');
 setEditingZoneDescription('');
 }
 } catch (error) {
 console.error('Error updating zone:', error);
 }
 };

 const deleteZone = async (zoneId: string) => {
 if (!confirm('Er du sikker på at du vil slette denne sonen?')) return;

 try {
 await supabase.from('zones').delete().eq('id', zoneId);
 setZones(zones.filter(z => z.id !== zoneId));
 } catch (error) {
 console.error('Error deleting zone:', error);
 }
 };

 const addEquipment = async (zoneId: string) => {
 if (!newEquipmentName.trim()) {
 alert('Vennligst skriv inn et navn for utstyret');
 return;
 }

 const minTemp = parseFloat(newEquipmentMinTemp);
 const maxTemp = parseFloat(newEquipmentMaxTemp);

 if (isNaN(minTemp) || isNaN(maxTemp)) {
 alert('Vennligst skriv inn gyldige temperaturer');
 return;
 }

 try {
 const { data } = await supabase
 .from('equipment')
 .insert({
 name: newEquipmentName,
 type: newEquipmentType,
 zone_id: zoneId,
 min_temp: minTemp,
 max_temp: maxTemp,
 active: true,
 })
 .select()
 .single();

 if (data) {
 setZones(zones.map(z =>
 z.id === zoneId
 ? { ...z, equipment: [...z.equipment, data] }
 : z
 ));
 setAddingEquipment(null);
 setNewEquipmentName('');
 setNewEquipmentType('refrigerator');
 setNewEquipmentMinTemp('-18');
 setNewEquipmentMaxTemp('4');
 }
 } catch (error) {
 console.error('Error adding equipment:', error);
 alert('Det oppstod en feil ved opprettelse av utstyr');
 }
 };

 const updateEquipment = async (equipmentId: string, zoneId: string) => {
 if (!editingEquipmentName.trim()) {
 alert('Vennligst skriv inn et navn for utstyret');
 return;
 }

 const minTemp = parseFloat(editingEquipmentMinTemp);
 const maxTemp = parseFloat(editingEquipmentMaxTemp);

 if (isNaN(minTemp) || isNaN(maxTemp)) {
 alert('Vennligst skriv inn gyldige temperaturer');
 return;
 }

 try {
 const { data } = await supabase
 .from('equipment')
 .update({
 name: editingEquipmentName,
 type: editingEquipmentType,
 min_temp: minTemp,
 max_temp: maxTemp,
 })
 .eq('id', equipmentId)
 .select()
 .single();

 if (data) {
 setZones(zones.map(z =>
 z.id === zoneId
 ? { ...z, equipment: z.equipment.map(e => e.id === equipmentId ? data : e) }
 : z
 ));
 setEditingEquipment(null);
 }
 } catch (error) {
 console.error('Error updating equipment:', error);
 }
 };

 const deleteEquipment = async (equipmentId: string, zoneId: string) => {
 if (!confirm('Er du sikker på at du vil slette dette utstyret?')) return;

 try {
 await supabase.from('equipment').delete().eq('id', equipmentId);
 setZones(zones.map(z =>
 z.id === zoneId
 ? { ...z, equipment: z.equipment.filter(e => e.id !== equipmentId) }
 : z
 ));
 } catch (error) {
 console.error('Error deleting equipment:', error);
 }
 };

 const addEmployee = async () => {
 if (!newEmployeeName.trim()) {
 alert('Vennligst skriv inn et navn for ansatt');
 return;
 }

 try {
 const { data } = await supabase
 .from('employees')
 .insert({
 name: newEmployeeName,
 role: newEmployeeRole,
 status: 'active',
 active: true,
 })
 .select()
 .single();

 if (data) {
 setEmployees([...employees, data]);
 setAddingEmployee(false);
 setNewEmployeeName('');
 setNewEmployeeRole('medarbeider');
 }
 } catch (error) {
 console.error('Error adding employee:', error);
 alert('Det oppstod en feil ved opprettelse av ansatt');
 }
 };

 const startEditingEmployee = (employee: Employee) => {
 setEditingEmployee(employee.id);
 setEditingEmployeeName(employee.name);
 setEditingEmployeeRole(employee.role as 'daglig_leder' | 'kontrollor' | 'medarbeider');
 setEditingEmployeeStatus(employee.status as 'active' | 'paused');
 };

 const saveEmployee = async () => {
 if (!editingEmployee || !editingEmployeeName.trim()) return;

 try {
 const { data } = await supabase
 .from('employees')
 .update({
 name: editingEmployeeName,
 role: editingEmployeeRole,
 status: editingEmployeeStatus,
 })
 .eq('id', editingEmployee)
 .select()
 .single();

 if (data) {
 setEmployees(employees.map(e => e.id === editingEmployee ? data : e));
 setEditingEmployee(null);
 }
 } catch (error) {
 console.error('Error updating employee:', error);
 alert('Det oppstod en feil ved oppdatering av ansatt');
 }
 };

 const toggleEmployeeStatus = async (employeeId: string, currentStatus: string) => {
 const newStatus = currentStatus === 'active' ? 'paused' : 'active';
 const confirmMsg = newStatus === 'paused'
 ? 'Er du sikker på at du vil pause denne ansatte? Ansatte vil fortsatt vises i tidligere rapporter.'
 : 'Vil du aktivere denne ansatte igjen?';

 if (!confirm(confirmMsg)) return;

 try {
 const { data } = await supabase
 .from('employees')
 .update({ status: newStatus })
 .eq('id', employeeId)
 .select()
 .single();

 if (data) {
 setEmployees(employees.map(e => e.id === employeeId ? data : e));
 }
 } catch (error) {
 console.error('Error toggling employee status:', error);
 alert('Det oppstod en feil ved endring av status');
 }
 };

 const deleteEmployee = async (employeeId: string) => {
 if (!confirm('Er du sikker på at du vil slette denne ansatte? Ansatte vil fortsatt vises i tidligere rapporter.')) return;

 try {
 const { data } = await supabase
 .from('employees')
 .update({
 active: false,
 status: 'paused',
 })
 .eq('id', employeeId)
 .select()
 .single();

 if (data) {
 setEmployees(employees.filter(e => e.id !== employeeId));
 }
 } catch (error) {
 console.error('Error deleting employee:', error);
 alert('Det oppstod en feil ved sletting av ansatt');
 }
 };

 const addTask = async () => {
 if (!newTaskName.trim()) {
 alert('Vennligst skriv inn et navn for oppgaven');
 return;
 }

 try {
 const { data } = await supabase
 .from('cleaning_tasks')
 .insert({
 task_name: newTaskName,
 description: newTaskDescription,
 frequency: newTaskFrequency,
 zone_id: newTaskZoneId || null,
 active: true,
 })
 .select()
 .single();

 if (data) {
 setTasks([...tasks, data]);
 setAddingTask(false);
 setNewTaskName('');
 setNewTaskDescription('');
 setNewTaskFrequency('daily');
 setNewTaskZoneId('');
 }
 } catch (error) {
 console.error('Error adding task:', error);
 alert('Det oppstod en feil ved opprettelse av oppgave');
 }
 };

 const startEditingTask = (task: CleaningTask) => {
 setEditingTask(task.id);
 setEditingTaskName(task.task_name);
 setEditingTaskDescription(task.description || '');
 setEditingTaskFrequency(task.frequency as 'daily' | 'weekly' | 'monthly');
 setEditingTaskZoneId(task.zone_id || '');
 };

 const updateTask = async (taskId: string) => {
 if (!editingTaskName.trim()) {
 alert('Vennligst skriv inn et navn for oppgaven');
 return;
 }

 try {
 const { data } = await supabase
 .from('cleaning_tasks')
 .update({
 task_name: editingTaskName,
 description: editingTaskDescription,
 frequency: editingTaskFrequency,
 zone_id: editingTaskZoneId || null,
 })
 .eq('id', taskId)
 .select()
 .single();

 if (data) {
 setTasks(tasks.map(t => t.id === taskId ? data : t));
 setEditingTask(null);
 setEditingTaskName('');
 setEditingTaskDescription('');
 setEditingTaskFrequency('daily');
 setEditingTaskZoneId('');
 }
 } catch (error) {
 console.error('Error updating task:', error);
 alert('Det oppstod en feil ved oppdatering av oppgave');
 }
 };

 const deleteTask = async (taskId: string) => {
 if (!confirm('Er du sikker på at du vil slette denne oppgaven?')) return;

 try {
 await supabase.from('cleaning_tasks').delete().eq('id', taskId);
 setTasks(tasks.filter(t => t.id !== taskId));
 } catch (error) {
 console.error('Error deleting task:', error);
 }
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center h-64">
 <div className="text-slate-600">Laster...</div>
 </div>
 );
 }

 if (isLocked) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-700 via-blue-800 to-teal-700 flex items-center justify-center p-4">
 <div className="bg-gradient-to-br from-slate-100 to-white rounded-3xl shadow-2xl p-8 md:p-10 max-w-md w-full">
 <div className="text-center mb-8">
 <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
 <Settings className="w-12 h-12 text-white" />
 </div>
 <h2 className="text-4xl font-black text-gray-800 mb-2" style={{direction: 'rtl'}}></h2>
 <p className="text-2xl font-bold text-gray-700 mb-4">Innstillinger</p>
 <p className="text-sm text-gray-600 mt-3" style={{direction: 'rtl'}}> </p>
 <p className="text-sm text-gray-600">Vennligst skriv inn passordet</p>
 </div>

 <div className="space-y-5">
 <div>
 <label className="block text-base font-bold text-gray-700 mb-3 text-center">
 <span style={{direction: 'rtl', display: 'block'}}> </span>
 <span className="text-gray-600">Passord</span>
 </label>
 <input
 type="text"
 value={passwordInput}
 onChange={(e) => setPasswordInput(e.target.value)}
 onKeyPress={(e) => {
 if (e.key === 'Enter') {
 e.preventDefault();
 handlePasswordSubmit();
 }
 }}
 className="w-full px-5 py-4 border-3 border-blue-300 rounded-2xl focus:ring-4 focus:ring-blue-400 focus:border-blue-500 transition-all text-xl text-center font-bold text-gray-700 shadow-sm"
 placeholder="••••••••"
 autoFocus
 autoComplete="off"
 />
 {showPasswordError && (
 <p className="text-red-600 text-sm mt-3 font-semibold text-center animate-pulse">
 ❌ / Feil passord
 </p>
 )}
 </div>

 <button
 onClick={handlePasswordSubmit}
 disabled={!passwordInput.trim()}
 className="w-full px-6 py-5 bg-gradient-to-r from-blue-500 to-teal-500 text-white text-2xl font-black rounded-2xl hover:shadow-2xl hover:from-blue-600 hover:to-teal-600 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center justify-center gap-3"
 >
 <span className="text-3xl">🔓</span>
 <span style={{direction: 'rtl'}}></span>
 <span>/</span>
 <span>Åpne</span>
 </button>

 <button
 onClick={handlePasswordReset}
 className="w-full px-6 py-3 bg-amber-50 text-amber-700 text-base font-bold rounded-xl hover:bg-amber-100 transition-all border-2 border-amber-200 flex items-center justify-center gap-2"
 >
 <span className="text-lg">🔑</span>
 <span style={{direction: 'rtl'}}> </span>
 <span>/</span>
 <span>Glemt passord</span>
 </button>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div className="flex items-center gap-3 mb-6">
 <div className="w-12 h-12 bg-slate-600 rounded-xl flex items-center justify-center">
 <Settings className="w-6 h-6 text-white" />
 </div>
 <div>
 <h2 className="text-2xl font-bold text-slate-900">Innstillinger</h2>
 <p className="text-slate-600">Administrer soner, utstyr og ansatte</p>
 </div>
 <div className="ml-auto flex gap-2">
 <button
 onClick={() => setActiveSection('settings')}
 className={`px-4 py-2 rounded-lg transition-all font-bold text-sm ${
 activeSection === 'settings'
 ? 'bg-blue-600 text-white'
 : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
 }`}
 >
 <Settings className="w-4 h-4 inline mr-1" />
 Innstillinger
 </button>
 <button
 onClick={() => setActiveSection('report-settings')}
 className={`px-4 py-2 rounded-lg transition-all font-bold text-sm ${
 activeSection === 'report-settings'
 ? 'bg-emerald-600 text-white'
 : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
 }`}
 >
 <FileText className="w-4 h-4 inline mr-1" />
 Rapport innstillinger
 </button>
 <button
 onClick={() => setIsLocked(true)}
 className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-bold text-sm"
 >
 🔒 / Lås
 </button>
 </div>
 </div>

 {activeSection === 'settings' && (
 <>
 {/* Notification Settings Section */}
 <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-3xl shadow-xl border-2 border-blue-200/50 overflow-hidden">
 <div className="bg-gradient-to-r from-blue-600 to-emerald-600 px-6 py-5 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
 <Bell className="w-6 h-6 text-white" />
 </div>
 <div>
 <h3 className="font-black text-xl text-white"> </h3>
 <p className="text-sm text-white/80">Varslingsinnstillinger</p>
 </div>
 </div>
 <button
 onClick={updateNotificationSettings}
 disabled={savingNotifications}
 className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
 >
 <Save className="w-5 h-5" />
 {savingNotifications ? ' ...' : ' '}
 </button>
 </div>

 <div className="p-8 space-y-6">
 {/* Sound & In-App Settings */}
 <div className="grid md:grid-cols-2 gap-6">
 {/* Sound Toggle */}
 <div className="bg-white rounded-2xl p-6 border-2 border-blue-200/50 shadow-lg hover:shadow-xl transition-all">
 <div className="flex items-start justify-between mb-4">
 <div className="flex items-center gap-3">
 <div className={`p-3 rounded-xl ${soundEnabled ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gray-300'}`}>
 {soundEnabled ? <Bell className="w-6 h-6 text-white" /> : <BellRing className="w-6 h-6 text-gray-600" />}
 </div>
 <div>
 <h4 className="font-bold text-lg text-gray-800"> </h4>
 <p className="text-sm text-gray-600">Lydvarsler</p>
 </div>
 </div>
 <button
 onClick={() => setSoundEnabled(!soundEnabled)}
 className={`relative w-16 h-8 rounded-full transition-all ${
 soundEnabled ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gray-300'
 }`}
 >
 <div
 className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${
 soundEnabled ? 'transform translate-x-8' : ''
 }`}
 />
 </button>
 </div>
 <p className="text-sm text-gray-600">
 {soundEnabled
 ? ' '
 : ' '}
 </p>

 {soundEnabled && (
 <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
 {/* Sound Type Selection */}
 <div>
 <label className="block text-sm font-bold text-gray-700 mb-2">
 🔊 / Lydtype
 </label>
 <div className="grid grid-cols-2 gap-2">
 {(Object.keys(NOTIFICATION_SOUNDS) as Array<keyof typeof NOTIFICATION_SOUNDS>).map((sound) => (
 <button
 key={sound}
 onClick={() => setSoundType(sound)}
 className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
 soundType === sound
 ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
 }`}
 >
 {NOTIFICATION_SOUNDS[sound].name}
 </button>
 ))}
 </div>
 <button
 onClick={() => {
 console.log('Testing sound:', soundType, 'at volume:', soundVolume);
 const customText = soundType === 'voice_ar' ? voiceMessageAr : soundType === 'voice_no' ? voiceMessageNo : undefined;
 playSound(soundType, soundVolume, 1, 0, undefined, customText, voiceRate, voicePitch);
 }}
 className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all font-semibold"
 >
 <Play className="w-4 h-4" />
 / Test lyd
 </button>
 </div>

 {/* Volume Control */}
 <div>
 <div className="flex items-center justify-between mb-2">
 <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
 <Volume2 className="w-4 h-4" />
 / Volum
 </label>
 <span className="text-lg font-black text-green-600">{soundVolume}%</span>
 </div>
 <input
 type="range"
 min="0"
 max="100"
 value={soundVolume}
 onChange={(e) => setSoundVolume(parseInt(e.target.value))}
 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
 />
 </div>

 {/* Repeat Control */}
 <div>
 <div className="flex items-center justify-between mb-2">
 <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
 <Zap className="w-4 h-4" />
 / Gjentakelser
 </label>
 <span className="text-lg font-black text-green-600">{soundRepeat}x</span>
 </div>
 <input
 type="range"
 min="1"
 max="5"
 value={soundRepeat}
 onChange={(e) => setSoundRepeat(parseInt(e.target.value))}
 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
 />
 </div>

 {/* Interval Control */}
 {soundRepeat > 1 && (
 <div>
 <div className="flex items-center justify-between mb-2">
 <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
 <Timer className="w-4 h-4" />
 / Intervall
 </label>
 <span className="text-lg font-black text-green-600">{soundInterval}s</span>
 </div>
 <input
 type="range"
 min="1"
 max="10"
 value={soundInterval}
 onChange={(e) => setSoundInterval(parseInt(e.target.value))}
 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
 />
 </div>
 )}

 {/* Voice Message Settings */}
 {(soundType === 'voice_ar' || soundType === 'voice_no') && (
 <div className="pt-4 border-t-2 border-gray-200 space-y-4">
 <h4 className="font-bold text-gray-800 flex items-center gap-2">
 🗣️ / Taleinnstillinger
 </h4>

 {/* Arabic Message */}
 {soundType === 'voice_ar' && (
 <div>
 <label className="block text-sm font-bold text-gray-700 mb-2">
 📝 Arabic / Arabisk melding
 </label>
 <textarea
 value={voiceMessageAr}
 onChange={(e) => setVoiceMessageAr(e.target.value)}
 rows={3}
 className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
 placeholder="! "
 />
 <p className="text-xs text-gray-500 mt-1">
 💡 Arabic voice
 </p>
 </div>
 )}

 {/* Norwegian Message */}
 {soundType === 'voice_no' && (
 <div>
 <label className="block text-sm font-bold text-gray-700 mb-2">
 📝 / Norsk melding
 </label>
 <textarea
 value={voiceMessageNo}
 onChange={(e) => setVoiceMessageNo(e.target.value)}
 rows={3}
 className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
 placeholder="Advarsel! Vennligst fullfør de daglige rutineoppgavene"
 />
 <p className="text-xs text-gray-500 mt-1">
 💡 Denne teksten vil bli lest opp med menneskelig stemme
 </p>
 </div>
 )}

 {/* Voice Rate */}
 <div>
 <div className="flex items-center justify-between mb-2">
 <label className="text-sm font-bold text-gray-700">
 ⚡ / Lesehastighet
 </label>
 <span className="text-sm font-black text-blue-600">{voiceRate.toFixed(1)}x</span>
 </div>
 <input
 type="range"
 min="0.5"
 max="1.5"
 step="0.1"
 value={voiceRate}
 onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
 />
 <div className="flex justify-between text-xs text-gray-500 mt-1">
 <span> / Sakte (0.5x)</span>
 <span> / Normal (1.0x)</span>
 <span> / Rask (1.5x)</span>
 </div>
 </div>

 {/* Voice Pitch */}
 <div>
 <div className="flex items-center justify-between mb-2">
 <label className="text-sm font-bold text-gray-700">
 🎵 / Tonehøyde
 </label>
 <span className="text-sm font-black text-purple-600">{voicePitch.toFixed(1)}</span>
 </div>
 <input
 type="range"
 min="0.5"
 max="1.5"
 step="0.1"
 value={voicePitch}
 onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
 />
 <div className="flex justify-between text-xs text-gray-500 mt-1">
 <span>of / Lav (0.5)</span>
 <span> / Normal (1.0)</span>
 <span>High / Høy (1.5)</span>
 </div>
 </div>
 </div>
 )}
 </div>
 )}
 </div>

 {/* In-App Alerts Toggle */}
 <div className="bg-white rounded-2xl p-6 border-2 border-blue-200/50 shadow-lg hover:shadow-xl transition-all">
 <div className="flex items-start justify-between mb-4">
 <div className="flex items-center gap-3">
 <div className={`p-3 rounded-xl ${inAppAlerts ? 'bg-gradient-to-br from-blue-400 to-cyan-500' : 'bg-gray-300'}`}>
 <AlertTriangle className="w-6 h-6 text-white" />
 </div>
 <div>
 <h4 className="font-bold text-lg text-gray-800"> </h4>
 <p className="text-sm text-gray-600">Visuelle varsler</p>
 </div>
 </div>
 <button
 onClick={() => setInAppAlerts(!inAppAlerts)}
 className={`relative w-16 h-8 rounded-full transition-all ${
 inAppAlerts ? 'bg-gradient-to-r from-blue-400 to-cyan-500' : 'bg-gray-300'
 }`}
 >
 <div
 className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${
 inAppAlerts ? 'transform translate-x-8' : ''
 }`}
 />
 </button>
 </div>
 <p className="text-sm text-gray-600">
 {inAppAlerts
 ? ' '
 : ' '}
 </p>

 {inAppAlerts && (
 <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
 {/* Position Selection */}
 <div>
 <label className="block text-sm font-bold text-gray-700 mb-2">
 📍 / Plassering
 </label>
 <div className="grid grid-cols-3 gap-2">
 {[
 { value: 'top-right', label: ' / Øvre høyre' },
 { value: 'top-center', label: ' / Øvre midten' },
 { value: 'top-left', label: ' / Øvre venstre' },
 { value: 'bottom-right', label: ' / Nedre høyre' },
 { value: 'bottom-center', label: ' / Nedre midten' },
 { value: 'bottom-left', label: ' / Nedre venstre' }
 ].map((pos) => (
 <button
 key={pos.value}
 onClick={() => setAlertPosition(pos.value as any)}
 className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all ${
 alertPosition === pos.value
 ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
 }`}
 >
 {pos.label}
 </button>
 ))}
 </div>
 </div>

 {/* Size Selection */}
 <div>
 <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
 <Maximize2 className="w-4 h-4" />
 / Størrelse
 </label>
 <div className="grid grid-cols-3 gap-2">
 {[
 { value: 'small', label: ' / Liten', icon: '📱' },
 { value: 'medium', label: 'Medium / Middels', icon: '💻' },
 { value: 'large', label: ' / Stor', icon: '🖥️' }
 ].map((size) => (
 <button
 key={size.value}
 onClick={() => setAlertSize(size.value as any)}
 className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
 alertSize === size.value
 ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
 }`}
 >
 {size.icon} {size.label}
 </button>
 ))}
 </div>
 </div>

 {/* Animation Selection */}
 <div>
 <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
 <Zap className="w-4 h-4" />
 / Animasjon
 </label>
 <div className="grid grid-cols-3 gap-2">
 {[
 { value: 'slide', label: ' / Gli', emoji: '➡️' },
 { value: 'fade', label: ' / Fade', emoji: '🌫️' },
 { value: 'bounce', label: ' / Sprette', emoji: '⚡' },
 { value: 'zoom', label: ' / Zoom', emoji: '🔍' },
 { value: 'shake', label: ' / Shake', emoji: '📳' }
 ].map((anim) => (
 <button
 key={anim.value}
 onClick={() => setAlertAnimation(anim.value as any)}
 className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all ${
 alertAnimation === anim.value
 ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
 }`}
 >
 {anim.emoji} {anim.label}
 </button>
 ))}
 </div>
 </div>

 {/* Duration Control */}
 <div>
 <div className="flex items-center justify-between mb-2">
 <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
 <Timer className="w-4 h-4" />
 / Varighet
 </label>
 <span className="text-lg font-black text-blue-600">{alertDuration}s</span>
 </div>
 <input
 type="range"
 min="3"
 max="30"
 value={alertDuration}
 onChange={(e) => setAlertDuration(parseInt(e.target.value))}
 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
 />
 </div>

 {/* Additional Options */}
 <div className="space-y-2 pt-2 border-t border-gray-200">
 <label className="flex items-center gap-3 cursor-pointer group">
 <input
 type="checkbox"
 checked={alertAutoDismiss}
 onChange={(e) => setAlertAutoDismiss(e.target.checked)}
 className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
 />
 <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
 ⏱️ / Auto-lukk etter varighet
 </span>
 </label>

 <label className="flex items-center gap-3 cursor-pointer group">
 <input
 type="checkbox"
 checked={showAlertSoundIcon}
 onChange={(e) => setShowAlertSoundIcon(e.target.checked)}
 className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
 />
 <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
 🔊 / Vis lydikon
 </span>
 </label>

 <label className="flex items-center gap-3 cursor-pointer group">
 <input
 type="checkbox"
 checked={vibrateEnabled}
 onChange={(e) => setVibrateEnabled(e.target.checked)}
 className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
 />
 <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
 📳 () / Vibrasjon (mobil)
 </span>
 </label>
 </div>

 {/* Test Alert Button */}
 <button
 onClick={() => {
 const testMessage = ' / Dette er en test';
 const testAlert = document.createElement('div');
 testAlert.className = `fixed z-[9999] backdrop-blur-xl rounded-2xl shadow-2xl flex items-start gap-3 border-2 bg-amber-500/95 border-amber-400 text-white ${
 alertSize === 'small' ? 'p-3 max-w-xs' :
 alertSize === 'large' ? 'p-6 max-w-2xl' :
 'p-4 max-w-md'
 } ${
 alertPosition === 'top-right' ? 'top-4 right-4' :
 alertPosition === 'top-left' ? 'top-4 left-4' :
 alertPosition === 'top-center' ? 'top-4 left-1/2 -translate-x-1/2' :
 alertPosition === 'bottom-right' ? 'bottom-4 right-4' :
 alertPosition === 'bottom-left' ? 'bottom-4 left-4' :
 'bottom-4 left-1/2 -translate-x-1/2'
 }`;

 const animationClass =
 alertAnimation === 'slide' ? 'animate-slide-in-right' :
 alertAnimation === 'fade' ? 'animate-fade-in' :
 alertAnimation === 'bounce' ? 'animate-bounce-in' :
 alertAnimation === 'zoom' ? 'animate-zoom-in' :
 'animate-shake';

 testAlert.classList.add(animationClass);

 testAlert.innerHTML = `
 <svg class="flex-shrink-0 ${alertSize === 'small' ? 'w-6 h-6' : alertSize === 'large' ? 'w-10 h-10' : 'w-8 h-8'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
 </svg>
 <div class="flex-1">
 <p class="font-bold leading-tight ${alertSize === 'small' ? 'text-base' : alertSize === 'large' ? 'text-2xl' : 'text-lg'}">
 ${showAlertSoundIcon && soundEnabled ? '🔊 ' : ''}${testMessage}
 </p>
 <p class="opacity-90 mt-1 ${alertSize === 'small' ? 'text-xs' : alertSize === 'large' ? 'text-base' : 'text-sm'}">
 ${new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
 </p>
 </div>
 `;

 document.body.appendChild(testAlert);

 if (soundEnabled) {
 playSound(soundType, soundVolume, 1, 0);
 }

 if (vibrateEnabled && 'vibrate' in navigator) {
 navigator.vibrate([200, 100, 200]);
 }

 setTimeout(() => {
 testAlert.remove();
 }, alertDuration * 1000);
 }}
 className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all font-bold"
 >
 <Play className="w-5 h-5" />
 / Test full varsling
 </button>
 </div>
 )}
 </div>
 </div>

 {/* Time Settings */}
 <div className="bg-white rounded-2xl p-6 border-2 border-amber-200/50 shadow-lg">
 <div className="flex items-center gap-3 mb-6">
 <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
 <Clock className="w-6 h-6 text-white" />
 </div>
 <div>
 <h4 className="font-bold text-lg text-gray-800"> </h4>
 <p className="text-sm text-gray-600">Varslingstider</p>
 </div>
 </div>
 <div className="grid md:grid-cols-3 gap-4">
 <div>
 <label className="block text-sm font-bold text-gray-700 mb-2">
 🟡 / Gul advarsel
 </label>
 <input
 type="time"
 value={warningTime}
 onChange={(e) => setWarningTime(e.target.value)}
 className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-4 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-semibold text-lg"
 />
 </div>
 <div>
 <label className="block text-sm font-bold text-gray-700 mb-2">
 🟠 / Oransje advarsel
 </label>
 <input
 type="time"
 value={dangerTime}
 onChange={(e) => setDangerTime(e.target.value)}
 className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-4 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-semibold text-lg"
 />
 </div>
 <div>
 <label className="block text-sm font-bold text-gray-700 mb-2">
 🔴 / Rød advarsel
 </label>
 <input
 type="time"
 value={criticalTime}
 onChange={(e) => setCriticalTime(e.target.value)}
 className="w-full px-4 py-3 border-2 border-red-300 rounded-xl focus:ring-4 focus:ring-red-500/50 focus:border-red-500 transition-all font-semibold text-lg"
 />
 </div>
 </div>
 </div>

 {/* Email Settings */}
 <div className="bg-white rounded-2xl p-6 border-2 border-purple-200/50 shadow-lg">
 <div className="flex items-start justify-between mb-6">
 <div className="flex items-center gap-3">
 <div className={`p-3 rounded-xl ${emailNotifications ? 'bg-gradient-to-br from-purple-400 to-pink-500' : 'bg-gray-300'}`}>
 <Mail className="w-6 h-6 text-white" />
 </div>
 <div>
 <h4 className="font-bold text-lg text-gray-800"> </h4>
 <p className="text-sm text-gray-600">E-postvarsler</p>
 </div>
 </div>
 <button
 onClick={() => setEmailNotifications(!emailNotifications)}
 className={`relative w-16 h-8 rounded-full transition-all ${
 emailNotifications ? 'bg-gradient-to-r from-purple-400 to-pink-500' : 'bg-gray-300'
 }`}
 >
 <div
 className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${
 emailNotifications ? 'transform translate-x-8' : ''
 }`}
 />
 </button>
 </div>

 {emailNotifications && (
 <div className="space-y-4 mt-4 pt-4 border-t-2 border-purple-100">
 <div className="flex gap-2">
 <input
 type="email"
 value={newEmail}
 onChange={(e) => setNewEmail(e.target.value)}
 onKeyPress={(e) => e.key === 'Enter' && addEmailRecipient()}
 placeholder=" / Skriv inn e-post"
 className="flex-1 px-4 py-3 border-2 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
 />
 <button
 onClick={addEmailRecipient}
 className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-bold"
 >
 <Plus className="w-5 h-5" />
 </button>
 </div>

 {emailRecipients.length > 0 && (
 <div className="space-y-2">
 <p className="text-sm font-bold text-gray-700"> / Mottakere:</p>
 {emailRecipients.map((email) => (
 <div
 key={email}
 className="flex items-center justify-between bg-purple-50 px-4 py-2 rounded-lg border border-purple-200"
 >
 <span className="font-semibold text-gray-800">{email}</span>
 <button
 onClick={() => removeEmailRecipient(email)}
 className="text-red-600 hover:bg-red-100 p-1 rounded transition-all"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 ))}
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 </div>

 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
 <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Thermometer className="w-5 h-5 text-slate-600" />
 <h3 className="font-semibold text-slate-900">Soner og Utstyr</h3>
 </div>
 <button
 onClick={() => setAddingZone(true)}
 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
 >
 <Plus className="w-4 h-4" />
 Legg til sone
 </button>
 </div>

 <div className="p-6 space-y-4">
 {addingZone && (
 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
 <h4 className="font-semibold text-slate-900 mb-3">Ny sone</h4>
 <div className="space-y-3">
 <input
 type="text"
 value={newZoneName}
 onChange={(e) => setNewZoneName(e.target.value)}
 placeholder="Sonenavn (f.eks. Kjøkken, Lager)"
 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
 />
 <input
 type="text"
 value={newZoneDescription}
 onChange={(e) => setNewZoneDescription(e.target.value)}
 placeholder="Beskrivelse (valgfritt)"
 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
 />
 <div className="flex gap-2">
 <button
 onClick={addZone}
 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
 >
 <Save className="w-4 h-4" />
 Lagre
 </button>
 <button
 onClick={() => {
 setAddingZone(false);
 setNewZoneName('');
 setNewZoneDescription('');
 }}
 className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
 >
 Avbryt
 </button>
 </div>
 </div>
 </div>
 )}

 {zones.length === 0 && !addingZone && (
 <div className="text-center py-8 text-slate-500">
 Ingen soner ennå. Klikk "Legg til sone" for å komme i gang.
 </div>
 )}

 {zones.map((zone) => (
 <div key={zone.id} className="border border-slate-200 rounded-lg overflow-hidden">
 <div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
 {editingZone === zone.id ? (
 <div className="flex-1 flex items-center gap-2">
 <input
 type="text"
 value={editingZoneName}
 onChange={(e) => setEditingZoneName(e.target.value)}
 className="flex-1 px-3 py-1 border border-slate-300 rounded"
 />
 <input
 type="text"
 value={editingZoneDescription}
 onChange={(e) => setEditingZoneDescription(e.target.value)}
 placeholder="Beskrivelse"
 className="flex-1 px-3 py-1 border border-slate-300 rounded"
 />
 <button
 onClick={() => updateZone(zone.id)}
 className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
 >
 <Save className="w-4 h-4" />
 </button>
 <button
 onClick={() => setEditingZone(null)}
 className="p-2 bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 ) : (
 <>
 <div>
 <h4 className="font-semibold text-slate-900">{zone.name}</h4>
 {zone.description && (
 <p className="text-sm text-slate-600">{zone.description}</p>
 )}
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={() => setAddingEquipment(zone.id)}
 className="px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700 text-sm flex items-center gap-1"
 >
 <Plus className="w-3 h-3" />
 Utstyr
 </button>
 <button
 onClick={() => {
 setEditingZone(zone.id);
 setEditingZoneName(zone.name);
 setEditingZoneDescription(zone.description);
 }}
 className="p-2 hover:bg-slate-200 rounded"
 >
 <Edit2 className="w-4 h-4 text-slate-600" />
 </button>
 <button
 onClick={() => deleteZone(zone.id)}
 className="p-2 hover:bg-red-100 rounded"
 >
 <Trash2 className="w-4 h-4 text-red-600" />
 </button>
 </div>
 </>
 )}
 </div>

 <div className="p-4 space-y-2">
 {addingEquipment === zone.id && (
 <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 mb-2">
 <h5 className="font-semibold text-slate-900 mb-2 text-sm">Nytt utstyr</h5>
 <div className="space-y-2">
 <input
 type="text"
 value={newEquipmentName}
 onChange={(e) => setNewEquipmentName(e.target.value)}
 placeholder="Utstyrsnavn (f.eks. Kjøleskap 1)"
 className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
 />
 <select
 value={newEquipmentType}
 onChange={(e) => setNewEquipmentType(e.target.value as any)}
 className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
 >
 <option value="refrigerator">Kjøleskap</option>
 <option value="freezer">Fryser</option>
 <option value="other">Annet</option>
 </select>
 <div className="grid grid-cols-2 gap-2">
 <input
 type="number"
 step="0.1"
 value={newEquipmentMinTemp}
 onChange={(e) => setNewEquipmentMinTemp(e.target.value)}
 placeholder="Min temp (°C)"
 className="px-3 py-2 border border-slate-300 rounded text-sm"
 />
 <input
 type="number"
 step="0.1"
 value={newEquipmentMaxTemp}
 onChange={(e) => setNewEquipmentMaxTemp(e.target.value)}
 placeholder="Max temp (°C)"
 className="px-3 py-2 border border-slate-300 rounded text-sm"
 />
 </div>
 <div className="flex gap-2">
 <button
 onClick={() => addEquipment(zone.id)}
 className="px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700 text-sm"
 >
 Lagre
 </button>
 <button
 onClick={() => {
 setAddingEquipment(null);
 setNewEquipmentName('');
 setNewEquipmentType('refrigerator');
 setNewEquipmentMinTemp('-18');
 setNewEquipmentMaxTemp('4');
 }}
 className="px-3 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 text-sm"
 >
 Avbryt
 </button>
 </div>
 </div>
 </div>
 )}

 {zone.equipment.length === 0 && addingEquipment !== zone.id && (
 <div className="text-sm text-slate-500 text-center py-2">
 Ingen utstyr i denne sonen
 </div>
 )}

 {zone.equipment.map((equipment) => (
 <div key={equipment.id} className="flex items-center justify-between bg-slate-50 p-3 rounded">
 {editingEquipment === equipment.id ? (
 <div className="flex-1 grid grid-cols-4 gap-2">
 <input
 type="text"
 value={editingEquipmentName}
 onChange={(e) => setEditingEquipmentName(e.target.value)}
 className="px-2 py-1 border border-slate-300 rounded text-sm"
 />
 <select
 value={editingEquipmentType}
 onChange={(e) => setEditingEquipmentType(e.target.value as any)}
 className="px-2 py-1 border border-slate-300 rounded text-sm"
 >
 <option value="refrigerator">Kjøleskap</option>
 <option value="freezer">Fryser</option>
 <option value="other">Annet</option>
 </select>
 <input
 type="number"
 step="0.1"
 value={editingEquipmentMinTemp}
 onChange={(e) => setEditingEquipmentMinTemp(e.target.value)}
 className="px-2 py-1 border border-slate-300 rounded text-sm"
 />
 <input
 type="number"
 step="0.1"
 value={editingEquipmentMaxTemp}
 onChange={(e) => setEditingEquipmentMaxTemp(e.target.value)}
 className="px-2 py-1 border border-slate-300 rounded text-sm"
 />
 </div>
 ) : (
 <div className="flex-1">
 <div className="font-medium text-slate-900 text-sm">{equipment.name}</div>
 <div className="text-xs text-slate-600">
 {equipment.type === 'refrigerator' ? 'Kjøleskap' : equipment.type === 'freezer' ? 'Fryser' : 'Annet'} -
 {' '}{equipment.min_temp}°C til {equipment.max_temp}°C
 </div>
 </div>
 )}
 <div className="flex items-center gap-1">
 {editingEquipment === equipment.id ? (
 <>
 <button
 onClick={() => updateEquipment(equipment.id, zone.id)}
 className="p-1 bg-green-600 text-white rounded hover:bg-green-700"
 >
 <Save className="w-3 h-3" />
 </button>
 <button
 onClick={() => setEditingEquipment(null)}
 className="p-1 bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
 >
 <X className="w-3 h-3" />
 </button>
 </>
 ) : (
 <>
 <button
 onClick={() => {
 setEditingEquipment(equipment.id);
 setEditingEquipmentName(equipment.name);
 setEditingEquipmentType(equipment.type);
 setEditingEquipmentMinTemp(equipment.min_temp.toString());
 setEditingEquipmentMaxTemp(equipment.max_temp.toString());
 }}
 className="p-1 hover:bg-slate-200 rounded"
 >
 <Edit2 className="w-3 h-3 text-slate-600" />
 </button>
 <button
 onClick={() => deleteEquipment(equipment.id, zone.id)}
 className="p-1 hover:bg-red-100 rounded"
 >
 <Trash2 className="w-3 h-3 text-red-600" />
 </button>
 </>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
 <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Users className="w-5 h-5 text-slate-600" />
 <h3 className="font-semibold text-slate-900">Ansatte</h3>
 </div>
 <button
 onClick={() => setAddingEmployee(true)}
 className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
 >
 <Plus className="w-4 h-4" />
 Legg til ansatt
 </button>
 </div>

 <div className="p-6 space-y-3">
 {addingEmployee && (
 <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
 <h4 className="font-semibold text-slate-900 mb-3">Ny ansatt</h4>
 <div className="space-y-3">
 <input
 type="text"
 value={newEmployeeName}
 onChange={(e) => setNewEmployeeName(e.target.value)}
 placeholder="Navn"
 className="w-full px-3 py-2 border border-slate-300 rounded-lg"
 />
 <select
 value={newEmployeeRole}
 onChange={(e) => setNewEmployeeRole(e.target.value as any)}
 className="w-full px-3 py-2 border border-slate-300 rounded-lg"
 >
 <option value="medarbeider">Medarbeider</option>
 <option value="kontrollor">Kontrollør</option>
 <option value="daglig_leder">Daglig leder</option>
 </select>
 <div className="flex gap-2">
 <button
 onClick={addEmployee}
 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
 >
 Lagre
 </button>
 <button
 onClick={() => {
 setAddingEmployee(false);
 setNewEmployeeName('');
 setNewEmployeeRole('medarbeider');
 }}
 className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
 >
 Avbryt
 </button>
 </div>
 </div>
 </div>
 )}

 {employees.length === 0 && !addingEmployee && (
 <div className="text-center py-8 text-slate-500">
 Ingen ansatte ennå. Klikk "Legg til ansatt" for å komme i gang.
 </div>
 )}

 {employees.map((employee) => (
 <div key={employee.id} className="bg-slate-50 p-4 rounded-lg">
 {editingEmployee === employee.id ? (
 <div className="space-y-3">
 <input
 type="text"
 value={editingEmployeeName}
 onChange={(e) => setEditingEmployeeName(e.target.value)}
 className="w-full px-3 py-2 border border-slate-300 rounded-lg"
 />
 <select
 value={editingEmployeeRole}
 onChange={(e) => setEditingEmployeeRole(e.target.value as any)}
 className="w-full px-3 py-2 border border-slate-300 rounded-lg"
 >
 <option value="medarbeider">Medarbeider</option>
 <option value="kontrollor">Kontrollør</option>
 <option value="daglig_leder">Daglig leder</option>
 </select>
 <select
 value={editingEmployeeStatus}
 onChange={(e) => setEditingEmployeeStatus(e.target.value as any)}
 className="w-full px-3 py-2 border border-slate-300 rounded-lg"
 >
 <option value="active">Aktiv</option>
 <option value="paused">Pause</option>
 </select>
 <div className="flex gap-2">
 <button
 onClick={saveEmployee}
 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
 >
 Lagre
 </button>
 <button
 onClick={() => setEditingEmployee(null)}
 className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
 >
 Avbryt
 </button>
 </div>
 </div>
 ) : (
 <div className="flex items-center justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-2">
 <div className="font-semibold text-slate-900">{employee.name}</div>
 {employee.status === 'paused' && (
 <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">Pause</span>
 )}
 </div>
 <div className="text-sm text-slate-600">
 {employee.role === 'daglig_leder' && '👔 Daglig leder'}
 {employee.role === 'kontrollor' && '🔍 Kontrollør'}
 {employee.role === 'medarbeider' && '👤 Medarbeider'}
 </div>
 </div>
 <div className="flex items-center gap-1">
 <button
 onClick={() => startEditingEmployee(employee)}
 className="p-2 hover:bg-blue-100 rounded"
 title="Rediger"
 >
 <Edit2 className="w-4 h-4 text-blue-600" />
 </button>
 <button
 onClick={() => toggleEmployeeStatus(employee.id, employee.status || 'active')}
 className="p-2 hover:bg-amber-100 rounded"
 title={employee.status === 'paused' ? 'Aktiver' : 'Pause'}
 >
 {employee.status === 'paused' ? '▶️' : '⏸️'}
 </button>
 <button
 onClick={() => deleteEmployee(employee.id)}
 className="p-2 hover:bg-red-100 rounded"
 title="Slett"
 >
 <Trash2 className="w-4 h-4 text-red-600" />
 </button>
 </div>
 </div>
 )}
 </div>
 ))}
 </div>
 </div>


 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
 <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Briefcase className="w-5 h-5 text-slate-600" />
 <h3 className="font-semibold text-slate-900">Rengjøringsoppgaver</h3>
 </div>
 <button
 onClick={() => setAddingTask(true)}
 className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
 >
 <Plus className="w-4 h-4" />
 Legg til oppgave
 </button>
 </div>

 <div className="p-6 space-y-3">
 {addingTask && (
 <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-3">
 <h4 className="font-semibold text-slate-900 mb-3">Ny oppgave</h4>
 <div className="space-y-3">
 <input
 type="text"
 value={newTaskName}
 onChange={(e) => setNewTaskName(e.target.value)}
 placeholder="Oppgavenavn"
 className="w-full px-3 py-2 border border-slate-300 rounded-lg"
 />
 <input
 type="text"
 value={newTaskDescription}
 onChange={(e) => setNewTaskDescription(e.target.value)}
 placeholder="Beskrivelse (valgfritt)"
 className="w-full px-3 py-2 border border-slate-300 rounded-lg"
 />
 <select
 value={newTaskZoneId}
 onChange={(e) => setNewTaskZoneId(e.target.value)}
 className="w-full px-3 py-2 border border-slate-300 rounded-lg"
 >
 <option value="">Ingen sone</option>
 {zones.map((zone) => (
 <option key={zone.id} value={zone.id}>{zone.name}</option>
 ))}
 </select>
 <select
 value={newTaskFrequency}
 onChange={(e) => setNewTaskFrequency(e.target.value as any)}
 className="w-full px-3 py-2 border border-slate-300 rounded-lg"
 >
 <option value="daily">Daglig</option>
 <option value="weekly">Ukentlig</option>
 <option value="monthly">Månedlig</option>
 </select>
 <div className="flex gap-2">
 <button
 onClick={addTask}
 className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
 >
 Lagre
 </button>
 <button
 onClick={() => {
 setAddingTask(false);
 setNewTaskName('');
 setNewTaskDescription('');
 setNewTaskFrequency('daily');
 setNewTaskZoneId('');
 }}
 className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
 >
 Avbryt
 </button>
 </div>
 </div>
 </div>
 )}

 {tasks.length === 0 && !addingTask && (
 <div className="text-center py-8 text-slate-500">
 Ingen oppgaver ennå. Klikk "Legg til oppgave" for å komme i gang.
 </div>
 )}

 {tasks.map((task) => (
 <div key={task.id} className="bg-slate-50 p-4 rounded-lg">
 {editingTask === task.id ? (
 <div className="space-y-3">
 <input
 type="text"
 value={editingTaskName}
 onChange={(e) => setEditingTaskName(e.target.value)}
 placeholder="Oppgavenavn"
 className="w-full px-3 py-2 border border-slate-300 rounded-lg"
 />
 <input
 type="text"
 value={editingTaskDescription}
 onChange={(e) => setEditingTaskDescription(e.target.value)}
 placeholder="Beskrivelse (valgfritt)"
 className="w-full px-3 py-2 border border-slate-300 rounded-lg"
 />
 <select
 value={editingTaskZoneId}
 onChange={(e) => setEditingTaskZoneId(e.target.value)}
 className="w-full px-3 py-2 border border-slate-300 rounded-lg"
 >
 <option value="">Ingen sone</option>
 {zones.map((zone) => (
 <option key={zone.id} value={zone.id}>{zone.name}</option>
 ))}
 </select>
 <select
 value={editingTaskFrequency}
 onChange={(e) => setEditingTaskFrequency(e.target.value as any)}
 className="w-full px-3 py-2 border border-slate-300 rounded-lg"
 >
 <option value="daily">Daglig</option>
 <option value="weekly">Ukentlig</option>
 <option value="monthly">Månedlig</option>
 </select>
 <div className="flex gap-2">
 <button
 onClick={() => updateTask(task.id)}
 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
 >
 <Save className="w-4 h-4" />
 Lagre
 </button>
 <button
 onClick={() => setEditingTask(null)}
 className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
 >
 Avbryt
 </button>
 </div>
 </div>
 ) : (
 <div className="flex items-center justify-between">
 <div className="flex-1">
 <div className="font-semibold text-slate-900">{task.task_name}</div>
 {task.description && (
 <div className="text-sm text-slate-600">{task.description}</div>
 )}
 <div className="text-xs text-slate-500 mt-1">
 {task.frequency === 'daily' ? 'Daglig' : task.frequency === 'weekly' ? 'Ukentlig' : 'Månedlig'}
 </div>
 </div>
 <div className="flex items-center gap-1">
 <button
 onClick={() => startEditingTask(task)}
 className="p-2 hover:bg-blue-100 rounded"
 title="Rediger"
 >
 <Edit2 className="w-4 h-4 text-blue-600" />
 </button>
 <button
 onClick={() => deleteTask(task.id)}
 className="p-2 hover:bg-red-100 rounded"
 title="Slett"
 >
 <Trash2 className="w-4 h-4 text-red-600" />
 </button>
 </div>
 </div>
 )}
 </div>
 ))}
 </div>
 </div>
 </>
 )}

 {activeSection === 'report-settings' && (
 <HACCPReportSettings />
 )}
 </div>
 );
}
