import { useState, useEffect } from 'react';
import { hmsApi, HMSIncident, HMSCategory, HMSLocation, HMSEmployee } from '../../lib/hmsSupabase';
import { Plus, Save, X, AlertTriangle, Shield, Leaf, Heart, FileText } from 'lucide-react';

export function IncidentLogger() {
 const [incidents, setIncidents] = useState<HMSIncident[]>([]);
 const [categories, setCategories] = useState<HMSCategory[]>([]);
 const [locations, setLocations] = useState<HMSLocation[]>([]);
 const [employees, setEmployees] = useState<HMSEmployee[]>([]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [saving, setSaving] = useState(false);

 const [formData, setFormData] = useState({
 title: '',
 description: '',
 category_id: '',
 location_id: '',
 employee_id: '',
 severity: 'low' as 'low' | 'medium' | 'high' | 'critical',
 incident_date: new Date().toISOString().split('T')[0],
 incident_time: new Date().toTimeString().slice(0, 5),
 immediate_action: '',
 preventive_action: '',
 reported_by: '',
 });

 useEffect(() => {
 loadData();
 }, []);

 const loadData = async () => {
 setLoading(true);
 const [incidentsRes, categoriesRes, locationsRes, employeesRes] = await Promise.all([
 hmsApi.getIncidents(),
 hmsApi.getCategories(),
 hmsApi.getLocations(),
 hmsApi.getEmployees(),
 ]);

 if (incidentsRes.data) setIncidents(incidentsRes.data);
 if (categoriesRes.data) setCategories(categoriesRes.data);
 if (locationsRes.data) setLocations(locationsRes.data);
 if (employeesRes.data) setEmployees(employeesRes.data);
 setLoading(false);
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setSaving(true);

 const { error } = await hmsApi.createIncident({
 ...formData,
 status: 'open',
 requires_approval: true,
 ai_generated: false,
 });

 if (!error) {
 await loadData();
 setShowForm(false);
 resetForm();
 }
 setSaving(false);
 };

 const resetForm = () => {
 setFormData({
 title: '',
 description: '',
 category_id: '',
 location_id: '',
 employee_id: '',
 severity: 'low',
 incident_date: new Date().toISOString().split('T')[0],
 incident_time: new Date().toTimeString().slice(0, 5),
 immediate_action: '',
 preventive_action: '',
 reported_by: '',
 });
 };

 const getCategoryIcon = (type: string) => {
 switch (type) {
 case 'safety': return <Shield className="w-5 h-5" />;
 case 'environment': return <Leaf className="w-5 h-5" />;
 case 'health': return <Heart className="w-5 h-5" />;
 default: return <FileText className="w-5 h-5" />;
 }
 };

 const getSeverityColor = (severity: string) => {
 switch (severity) {
 case 'critical': return 'bg-red-100 text-red-800 border-red-300';
 case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
 case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
 default: return 'bg-blue-100 text-blue-800 border-blue-300';
 }
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center h-64">
 <div className="text-slate-600"> Laster...</div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-2xl font-bold text-slate-900">Hendelseslogg</h2>
 <p className="text-slate-600">Incident and Deviation Log</p>
 </div>
 <button
 onClick={() => setShowForm(true)}
 className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold"
 >
 <Plus className="w-5 h-5" />
 Ny hendelse
 </button>
 </div>

 {showForm && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
 <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-2xl font-bold text-slate-900">Registrer ny hendelse</h3>
 <button
 onClick={() => setShowForm(false)}
 className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
 >
 <X className="w-6 h-6" />
 </button>
 </div>

 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="grid md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Kategori / Category
 </label>
 <select
 value={formData.category_id}
 onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 required
 >
 <option value="">Velg kategori</option>
 {categories.map((cat) => (
 <option key={cat.id} value={cat.id}>
 {cat.name_no}{cat.name_ar}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Alvorlighetsgrad / Severity
 </label>
 <select
 value={formData.severity}
 onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 required
 >
 <option value="low">Lav / of</option>
 <option value="medium">Middels / Medium</option>
 <option value="high">Høy / High</option>
 <option value="critical">Kritisk / Critical</option>
 </select>
 </div>
 </div>

 <div className="grid md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Lokasjon / Location
 </label>
 <select
 value={formData.location_id}
 onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 required
 >
 <option value="">Velg lokasjon</option>
 {locations.map((loc) => (
 <option key={loc.id} value={loc.id}>
 {loc.name_no}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Ansatt / Employee
 </label>
 <select
 value={formData.employee_id}
 onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 required
 >
 <option value="">Velg ansatt</option>
 {employees.map((emp) => (
 <option key={emp.id} value={emp.id}>
 {emp.name}
 </option>
 ))}
 </select>
 </div>
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Tittel / 
 </label>
 <input
 type="text"
 value={formData.title}
 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 required
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Beskrivelse / Description
 </label>
 <textarea
 value={formData.description}
 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 rows={4}
 required
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Umiddelbar handling / Immediate Action
 </label>
 <textarea
 value={formData.immediate_action}
 onChange={(e) => setFormData({ ...formData, immediate_action: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 rows={3}
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Forebyggende tiltak / Preventive Action
 </label>
 <textarea
 value={formData.preventive_action}
 onChange={(e) => setFormData({ ...formData, preventive_action: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 rows={3}
 />
 </div>

 <div className="flex gap-4">
 <button
 type="submit"
 disabled={saving}
 className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold disabled:opacity-50"
 >
 <Save className="w-5 h-5 inline mr-2" />
 {saving ? 'Lagrer...' : 'Lagre hendelse'}
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
 </div>
 )}

 <div className="grid gap-4">
 {incidents.length === 0 ? (
 <div className="text-center py-12 bg-slate-50 rounded-2xl">
 <AlertTriangle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
 <p className="text-slate-600 text-lg">Ingen hendelser registrert ennå</p>
 <p className="text-slate-500">No incidents registered yet</p>
 </div>
 ) : (
 incidents.map((incident) => {
 const category = categories.find(c => c.id === incident.category_id);
 return (
 <div
 key={incident.id}
 className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-blue-300 transition-all"
 >
 <div className="flex items-start justify-between mb-4">
 <div className="flex items-center gap-3">
 {category && getCategoryIcon(category.type)}
 <div>
 <h3 className="text-lg font-bold text-slate-900">{incident.title}</h3>
 <p className="text-sm text-slate-500">
 {incident.incident_date}{incident.incident_time}
 </p>
 </div>
 </div>
 <span className={`px-4 py-2 rounded-lg border-2 text-sm font-bold ${getSeverityColor(incident.severity)}`}>
 {incident.severity}
 </span>
 </div>
 <p className="text-slate-700 mb-4">{incident.description}</p>
 {incident.immediate_action && (
 <div className="bg-blue-50 rounded-lg p-3 mb-2">
 <p className="text-sm font-bold text-blue-900 mb-1">Umiddelbar handling:</p>
 <p className="text-sm text-blue-800">{incident.immediate_action}</p>
 </div>
 )}
 </div>
 );
 })
 )}
 </div>
 </div>
 );
}
