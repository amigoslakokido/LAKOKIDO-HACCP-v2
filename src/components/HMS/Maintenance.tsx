import { useState, useEffect } from 'react';
import { hmsApi, HMSMaintenance } from '../../lib/hmsSupabase';
import { Wrench, Plus, Calendar, CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react';

export function Maintenance() {
 const [maintenance, setMaintenance] = useState<HMSMaintenance[]>([]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [saving, setSaving] = useState(false);

 const [formData, setFormData] = useState({
 equipment_name: '',
 equipment_location: '',
 maintenance_type: 'preventive' as 'preventive' | 'corrective' | 'inspection' | 'emergency',
 scheduled_date: new Date().toISOString().split('T')[0],
 description: '',
 cost: '',
 notes: '',
 });

 useEffect(() => {
 loadMaintenance();
 }, []);

 const loadMaintenance = async () => {
 setLoading(true);
 const { data } = await hmsApi.getMaintenance();
 if (data) setMaintenance(data);
 setLoading(false);
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setSaving(true);

 const { error } = await hmsApi.createMaintenance({
 ...formData,
 cost: formData.cost ? parseFloat(formData.cost) : undefined,
 status: 'scheduled',
 });

 if (!error) {
 await loadMaintenance();
 setShowForm(false);
 resetForm();
 }

 setSaving(false);
 };

 const resetForm = () => {
 setFormData({
 equipment_name: '',
 equipment_location: '',
 maintenance_type: 'preventive',
 scheduled_date: new Date().toISOString().split('T')[0],
 description: '',
 cost: '',
 notes: '',
 });
 };

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
 case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
 case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
 default: return 'bg-amber-100 text-amber-800 border-amber-300';
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'completed': return <CheckCircle className="w-4 h-4" />;
 case 'in_progress': return <Clock className="w-4 h-4" />;
 case 'cancelled': return <XCircle className="w-4 h-4" />;
 default: return <Calendar className="w-4 h-4" />;
 }
 };

 const getTypeColor = (type: string) => {
 switch (type) {
 case 'emergency': return 'text-red-600 bg-red-50';
 case 'corrective': return 'text-orange-600 bg-orange-50';
 case 'inspection': return 'text-blue-600 bg-blue-50';
 default: return 'text-emerald-600 bg-emerald-50';
 }
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center h-64">
 <div className="text-slate-600"> Laster vedlikehold...</div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-2xl font-bold text-slate-900">Vedlikehold</h2>
 <p className="text-slate-600">Maintenance </p>
 </div>
 <button
 onClick={() => setShowForm(true)}
 className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all font-bold"
 >
 <Plus className="w-5 h-5" />
 Ny vedlikehold
 </button>
 </div>

 {showForm && (
 <div className="bg-white rounded-2xl p-6 border-2 border-orange-200">
 <h3 className="text-xl font-bold text-slate-900 mb-6">Planlegg vedlikehold</h3>
 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="grid md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Utstyr</label>
 <input
 type="text"
 value={formData.equipment_name}
 onChange={(e) => setFormData({ ...formData, equipment_name: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
 required
 placeholder="F.eks: Komfyr, Kjøleskap, Ventilasjon..."
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Plassering</label>
 <input
 type="text"
 value={formData.equipment_location}
 onChange={(e) => setFormData({ ...formData, equipment_location: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
 required
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
 <select
 value={formData.maintenance_type}
 onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value as any })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
 required
 >
 <option value="preventive">Forebyggende</option>
 <option value="corrective">Korrigerende</option>
 <option value="inspection">Inspeksjon</option>
 <option value="emergency">Nødsituasjon</option>
 </select>
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Planlagt dato</label>
 <input
 type="date"
 value={formData.scheduled_date}
 onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
 required
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Beskrivelse</label>
 <textarea
 value={formData.description}
 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
 rows={3}
 required
 />
 </div>

 <div className="grid md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Estimert kostnad (NOK)</label>
 <input
 type="number"
 value={formData.cost}
 onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
 min="0"
 step="0.01"
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Notater</label>
 <input
 type="text"
 value={formData.notes}
 onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
 />
 </div>
 </div>

 <div className="flex gap-4">
 <button
 type="submit"
 disabled={saving}
 className="flex-1 px-6 py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all font-bold disabled:opacity-50"
 >
 {saving ? 'Lagrer...' : 'Planlegg vedlikehold'}
 </button>
 <button
 type="button"
 onClick={() => setShowForm(false)}
 className="px-6 py-4 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all font-bold"
 >
 Avbryt
 </button>
 </div>
 </form>
 </div>
 )}

 <div className="grid md:grid-cols-4 gap-6">
 {['scheduled', 'in_progress', 'completed', 'cancelled'].map((status) => {
 const count = maintenance.filter(m => m.status === status).length;
 const colors = {
 scheduled: 'from-amber-50 to-amber-100 border-amber-200 text-amber-900',
 in_progress: 'from-blue-50 to-blue-100 border-blue-200 text-blue-900',
 completed: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-900',
 cancelled: 'from-red-50 to-red-100 border-red-200 text-red-900',
 };
 return (
 <div key={status} className={`bg-gradient-to-br ${colors[status as keyof typeof colors]} rounded-2xl p-6 border-2`}>
 <div className="text-3xl font-black mb-2">{count}</div>
 <p className="font-bold capitalize">{status.replace('_', ' ')}</p>
 </div>
 );
 })}
 </div>

 <div className="grid gap-4">
 {maintenance.length === 0 ? (
 <div className="text-center py-12 bg-slate-50 rounded-2xl">
 <Wrench className="w-16 h-16 text-slate-400 mx-auto mb-4" />
 <p className="text-slate-600 text-lg">Ingen vedlikehold planlagt</p>
 <p className="text-slate-500">No scheduled maintenance</p>
 </div>
 ) : (
 maintenance.map((item) => (
 <div
 key={item.id}
 className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-orange-300 transition-all"
 >
 <div className="flex items-start justify-between mb-4">
 <div className="flex items-center gap-3">
 <Wrench className="w-6 h-6 text-orange-600" />
 <div>
 <h3 className="text-lg font-bold text-slate-900">{item.equipment_name}</h3>
 <p className="text-sm text-slate-600">{item.equipment_location}</p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getTypeColor(item.maintenance_type)}`}>
 {item.maintenance_type}
 </span>
 <span className={`px-3 py-1 rounded-lg border-2 text-xs font-bold flex items-center gap-1 ${getStatusColor(item.status)}`}>
 {getStatusIcon(item.status)}
 {item.status}
 </span>
 </div>
 </div>

 <p className="text-slate-700 mb-4">{item.description}</p>

 <div className="grid md:grid-cols-3 gap-4">
 <div className="bg-slate-50 rounded-lg p-3">
 <p className="text-xs text-slate-600 mb-1">Planlagt</p>
 <p className="text-sm font-bold text-slate-900">{item.scheduled_date}</p>
 </div>
 {item.completed_date && (
 <div className="bg-emerald-50 rounded-lg p-3">
 <p className="text-xs text-emerald-600 mb-1">Fullført</p>
 <p className="text-sm font-bold text-emerald-900">{item.completed_date}</p>
 </div>
 )}
 {item.cost && (
 <div className="bg-blue-50 rounded-lg p-3">
 <div className="flex items-center gap-2">
 <DollarSign className="w-4 h-4 text-blue-600" />
 <p className="text-sm font-bold text-blue-900">{item.cost} NOK</p>
 </div>
 </div>
 )}
 </div>

 {item.notes && (
 <div className="mt-4 bg-amber-50 rounded-lg p-3">
 <p className="text-xs text-amber-600 mb-1">Notater</p>
 <p className="text-sm text-amber-900">{item.notes}</p>
 </div>
 )}
 </div>
 ))
 )}
 </div>
 </div>
 );
}
