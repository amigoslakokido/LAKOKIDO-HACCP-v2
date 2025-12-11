import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Check, X, Plus, Calendar, User, AlertCircle } from 'lucide-react';

interface Profile {
 id: string;
 full_name: string;
}

interface HygieneCheck {
 id: string;
 check_date: string;
 checked_by: string;
 checker_id: string;
 uniform_ok: boolean;
 gloves_ok: boolean;
 handwashing_ok: boolean;
 nails_ok: boolean;
 hair_ok: boolean;
 overall_status: string;
 notes: string;
 created_at: string;
 profiles?: Profile;
 checker?: Profile;
}

export default function HygieneChecks() {
 const defaultUserId = 'bc7a8fb9-c6c3-4ce0-9cd6-b4c07cf64ac5';
 const [checks, setChecks] = useState<HygieneCheck[]>([]);
 const [staff, setStaff] = useState<Profile[]>([]);
 const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [formData, setFormData] = useState({
 checked_by: '',
 uniform_ok: false,
 gloves_ok: false,
 handwashing_ok: false,
 nails_ok: false,
 hair_ok: false,
 notes: ''
 });

 useEffect(() => {
 loadStaff();
 loadChecks();
 }, [selectedDate]);

 const loadStaff = async () => {
 const { data } = await supabase
 .from('profiles')
 .select('id, full_name')
 .order('full_name');

 if (data) setStaff(data);
 };

 const loadChecks = async () => {
 setLoading(true);
 const { data, error } = await supabase
 .from('hygiene_checks')
 .select(`
 *,
 profiles:checked_by(id, full_name),
 checker:checker_id(id, full_name)
 `)
 .eq('check_date', selectedDate)
 .order('created_at', { ascending: false });

 console.log('Hygiene checks data:', data);
 console.log('Hygiene checks error:', error);
 console.log('Selected date:', selectedDate);

 if (data) {
 // Keep only the most recent check per person
 const uniqueChecks = data.filter((check, index, self) =>
 index === self.findIndex((c) => c.checked_by === check.checked_by)
 );
 setChecks(uniqueChecks as any);
 }
 setLoading(false);
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!formData.checked_by) return;

 const allOk = formData.uniform_ok && formData.gloves_ok &&
 formData.handwashing_ok && formData.nails_ok && formData.hair_ok;

 try {
 // Check if hygiene check already exists for this person on this date
 const { data: existingCheck } = await supabase
 .from('hygiene_checks')
 .select('*')
 .eq('checked_by', formData.checked_by)
 .eq('check_date', selectedDate)
 .maybeSingle();

 if (existingCheck) {
 alert(' . .');
 return;
 }

 const { error } = await supabase
 .from('hygiene_checks')
 .insert({
 check_date: selectedDate,
 checked_by: formData.checked_by,
 checker_id: defaultUserId,
 uniform_ok: formData.uniform_ok,
 gloves_ok: formData.gloves_ok,
 handwashing_ok: formData.handwashing_ok,
 nails_ok: formData.nails_ok,
 hair_ok: formData.hair_ok,
 overall_status: allOk ? 'OK' : 'Ikke OK',
 notes: formData.notes
 });

 if (!error) {
 setShowForm(false);
 setFormData({
 checked_by: '',
 uniform_ok: false,
 gloves_ok: false,
 handwashing_ok: false,
 nails_ok: false,
 hair_ok: false,
 notes: ''
 });
 loadChecks();
 } else {
 alert(' Error . .');
 }
 } catch (error) {
 console.error('Error saving hygiene check:', error);
 alert(' Error . .');
 }
 };

 const toggleCheck = (field: keyof typeof formData) => {
 if (typeof formData[field] === 'boolean') {
 setFormData({ ...formData, [field]: !formData[field] });
 }
 };

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-end mb-6">
 <button
 onClick={() => setShowForm(!showForm)}
 className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
 >
 <Plus className="w-5 h-5" />
 Ny Kontroll
 </button>
 </div>

 <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
 <div className="flex items-center gap-3 mb-4">
 <Calendar className="w-5 h-5 text-slate-600" />
 <label className="text-sm font-medium text-slate-700">Velg dato:</label>
 <input
 type="date"
 value={selectedDate}
 onChange={(e) => setSelectedDate(e.target.value)}
 className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
 />
 </div>
 </div>

 {showForm && (
 <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
 <h2 className="text-xl font-semibold text-slate-800 mb-4">Ny Hygienekontroll</h2>
 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">
 <User className="w-4 h-4 inline mr-2" />
 Ansatt som kontrolleres
 </label>
 <select
 value={formData.checked_by}
 onChange={(e) => setFormData({ ...formData, checked_by: e.target.value })}
 className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
 required
 >
 <option value="">Velg ansatt...</option>
 {staff.map(s => (
 <option key={s.id} value={s.id}>{s.full_name}</option>
 ))}
 </select>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
 <CheckboxField
 label="Uniform / Dress Code"
 checked={formData.uniform_ok}
 onChange={() => toggleCheck('uniform_ok')}
 />
 <CheckboxField
 label="Hansker (Gloves)"
 checked={formData.gloves_ok}
 onChange={() => toggleCheck('gloves_ok')}
 />
 <CheckboxField
 label="Håndvask (Handwashing)"
 checked={formData.handwashing_ok}
 onChange={() => toggleCheck('handwashing_ok')}
 />
 <CheckboxField
 label="Negler (Nails)"
 checked={formData.nails_ok}
 onChange={() => toggleCheck('nails_ok')}
 />
 <CheckboxField
 label="Hår (Hair)"
 checked={formData.hair_ok}
 onChange={() => toggleCheck('hair_ok')}
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">
 Merknader
 </label>
 <textarea
 value={formData.notes}
 onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
 className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
 rows={3}
 placeholder="Valgfri merknader..."
 />
 </div>

 <div className="flex gap-3">
 <button
 type="submit"
 className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
 >
 Lagre Kontroll
 </button>
 <button
 type="button"
 onClick={() => setShowForm(false)}
 className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors"
 >
 Avbryt
 </button>
 </div>
 </form>
 </div>
 )}

 <div className="bg-white rounded-lg shadow-lg overflow-hidden">
 <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
 <h2 className="text-xl font-semibold">Hygienekontroller{new Date(selectedDate).toLocaleDateString('nb-NO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
 </div>

 {loading ? (
 <div className="p-8 text-center text-slate-500">Laster...</div>
 ) : checks.length === 0 ? (
 <div className="p-8 text-center">
 <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
 <p className="text-slate-500">Ingen hygienekontroller registrert for denne datoen</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="bg-slate-50 border-b border-slate-200">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Ansatt</th>
 <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">Uniform</th>
 <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">Hansker</th>
 <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">Håndvask</th>
 <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">Negler</th>
 <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">Hår</th>
 <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Kontrollør</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-slate-200">
 {checks.map((check) => (
 <tr key={check.id} className="hover:bg-slate-50 transition-colors">
 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
 {check.profiles?.full_name || 'Ukjent'}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-center">
 <StatusIcon ok={check.uniform_ok} />
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-center">
 <StatusIcon ok={check.gloves_ok} />
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-center">
 <StatusIcon ok={check.handwashing_ok} />
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-center">
 <StatusIcon ok={check.nails_ok} />
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-center">
 <StatusIcon ok={check.hair_ok} />
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-center">
 <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
 check.overall_status === 'OK'
 ? 'bg-green-100 text-green-800'
 : 'bg-red-100 text-red-800'
 }`}>
 {check.overall_status}
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
 {check.checker?.full_name || 'Ukjent'}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </div>
 );
}

function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
 return (
 <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-slate-200 rounded-lg hover:border-blue-400 transition-colors">
 <input
 type="checkbox"
 checked={checked}
 onChange={onChange}
 className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
 />
 <span className="text-sm font-medium text-slate-700">{label}</span>
 </label>
 );
}

function StatusIcon({ ok }: { ok: boolean }) {
 return ok ? (
 <Check className="w-6 h-6 text-green-600 mx-auto" />
 ) : (
 <X className="w-6 h-6 text-red-600 mx-auto" />
 );
}
