import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Download, Save, X, Phone, Mail, Calendar, Briefcase, Award, Clock, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { hmsApi } from '../../lib/hmsSupabase';

interface Employee {
 id?: string;
 full_name: string;
 position: string;
 phone: string;
 email: string;
 hire_date: string;
 employment_type: 'Heltid' | 'Deltid' | 'Vikar' | 'Lærling';
 department: string;
 emergency_contact_name: string;
 emergency_contact_phone: string;
 notes: string;
 status: 'Aktiv' | 'Permisjon' | 'Sluttet';
 created_at?: string;
}

export function PersonalList() {
 const [employees, setEmployees] = useState<Employee[]>([]);
 const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [editingId, setEditingId] = useState<string | null>(null);
 const [searchTerm, setSearchTerm] = useState('');
 const [filterStatus, setFilterStatus] = useState<'all' | 'Aktiv' | 'Permisjon' | 'Sluttet'>('all');
 const [saved, setSaved] = useState(false);

 const [formData, setFormData] = useState<Employee>({
 full_name: '',
 position: '',
 phone: '',
 email: '',
 hire_date: new Date().toISOString().split('T')[0],
 employment_type: 'Heltid',
 department: '',
 emergency_contact_name: '',
 emergency_contact_phone: '',
 notes: '',
 status: 'Aktiv',
 });

 useEffect(() => {
 loadEmployees();
 }, []);

 useEffect(() => {
 filterEmployeesList();
 }, [employees, searchTerm, filterStatus]);

 const loadEmployees = async () => {
 setLoading(true);
 const { data, error } = await hmsApi.getPersonnel();
 if (error) {
 console.error('Error loading personnel:', error);
 }
 if (data) {
 setEmployees(data);
 }
 setLoading(false);
 };

 const filterEmployeesList = () => {
 let filtered = employees;

 if (filterStatus !== 'all') {
 filtered = filtered.filter(emp => emp.status === filterStatus);
 }

 if (searchTerm) {
 const term = searchTerm.toLowerCase();
 filtered = filtered.filter(emp =>
 emp.full_name.toLowerCase().includes(term) ||
 emp.position.toLowerCase().includes(term) ||
 emp.department.toLowerCase().includes(term)
 );
 }

 setFilteredEmployees(filtered);
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();

 try {
 if (editingId) {
 await hmsApi.updatePersonnel(editingId, formData);
 } else {
 await hmsApi.createPersonnel(formData);
 }

 setSaved(true);
 setTimeout(() => setSaved(false), 3000);
 resetForm();
 loadEmployees();
 } catch (error) {
 console.error('Error saving employee:', error);
 }
 };

 const handleEdit = (employee: Employee) => {
 setFormData(employee);
 setEditingId(employee.id || null);
 setShowForm(true);
 };

 const handleDelete = async (id: string) => {
 if (!confirm('Er du sikker på at du vil slette denne ansatte?')) return;

 try {
 await hmsApi.deletePersonnel(id);
 loadEmployees();
 } catch (error) {
 console.error('Error deleting employee:', error);
 }
 };

 const resetForm = () => {
 setFormData({
 full_name: '',
 position: '',
 phone: '',
 email: '',
 hire_date: new Date().toISOString().split('T')[0],
 employment_type: 'Heltid',
 department: '',
 emergency_contact_name: '',
 emergency_contact_phone: '',
 notes: '',
 status: 'Aktiv',
 });
 setEditingId(null);
 setShowForm(false);
 };

 const handleDownloadCSV = () => {
 const headers = [
 'Navn', 'Stilling', 'Telefon', 'E-post', 'Ansettelsesdato',
 'Ansettelsestype', 'Avdeling', 'Nødkontakt Navn', 'Nødkontakt Telefon', 'Status', 'Notater'
 ];

 const rows = filteredEmployees.map(emp => [
 emp.full_name,
 emp.position,
 emp.phone,
 emp.email,
 emp.hire_date,
 emp.employment_type,
 emp.department,
 emp.emergency_contact_name,
 emp.emergency_contact_phone,
 emp.status,
 emp.notes.replace(/\n/g, ' ')
 ]);

 const csvContent = [
 headers.join(','),
 ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
 ].join('\n');

 const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
 const link = document.createElement('a');
 link.href = URL.createObjectURL(blob);
 link.download = `personalliste_${new Date().toISOString().split('T')[0]}.csv`;
 link.click();
 };

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'Aktiv': return 'bg-green-100 text-green-800';
 case 'Permisjon': return 'bg-yellow-100 text-yellow-800';
 case 'Sluttet': return 'bg-slate-100 text-slate-600';
 default: return 'bg-slate-100 text-slate-600';
 }
 };

 const getEmploymentTypeColor = (type: string) => {
 switch (type) {
 case 'Heltid': return 'bg-blue-100 text-blue-800';
 case 'Deltid': return 'bg-purple-100 text-purple-800';
 case 'Vikar': return 'bg-orange-100 text-orange-800';
 case 'Lærling': return 'bg-pink-100 text-pink-800';
 default: return 'bg-slate-100 text-slate-600';
 }
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center h-64">
 <div className="text-slate-600">Laster...</div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
 <Users className="w-6 h-6 text-white" />
 </div>
 <div>
 <h1 className="text-2xl font-bold text-slate-900">Personalliste</h1>
 <p className="text-sm text-slate-600">
 {filteredEmployees.length} ansatte
 </p>
 </div>
 </div>
 <div className="flex gap-3">
 {saved && (
 <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
 <CheckCircle className="w-5 h-5" />
 <span className="font-medium">Lagret!</span>
 </div>
 )}
 <button
 onClick={handleDownloadCSV}
 className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
 >
 <Download className="w-4 h-4" />
 Last ned CSV
 </button>
 <button
 onClick={() => setShowForm(true)}
 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
 >
 <Plus className="w-4 h-4" />
 Ny ansatt
 </button>
 </div>
 </div>

 {/* Filters */}
 <div className="grid md:grid-cols-2 gap-4 mb-6">
 <div>
 <input
 type="text"
 placeholder="Søk etter navn, stilling eller avdeling..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
 />
 </div>
 <div className="flex gap-2">
 {(['all', 'Aktiv', 'Permisjon', 'Sluttet'] as const).map((status) => (
 <button
 key={status}
 onClick={() => setFilterStatus(status)}
 className={`px-4 py-2 rounded-lg font-medium transition-colors ${
 filterStatus === status
 ? 'bg-blue-600 text-white'
 : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
 }`}
 >
 {status === 'all' ? 'Alle' : status}
 </button>
 ))}
 </div>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
 <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
 <div className="text-2xl font-bold text-green-700">
 {employees.filter(e => e.status === 'Aktiv').length}
 </div>
 <div className="text-sm text-slate-600">Aktive ansatte</div>
 </div>
 <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
 <div className="text-2xl font-bold text-blue-700">
 {employees.filter(e => e.employment_type === 'Heltid').length}
 </div>
 <div className="text-sm text-slate-600">Heltid</div>
 </div>
 <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
 <div className="text-2xl font-bold text-purple-700">
 {employees.filter(e => e.employment_type === 'Deltid').length}
 </div>
 <div className="text-sm text-slate-600">Deltid</div>
 </div>
 <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200">
 <div className="text-2xl font-bold text-yellow-700">
 {employees.filter(e => e.status === 'Permisjon').length}
 </div>
 <div className="text-sm text-slate-600">Permisjon</div>
 </div>
 </div>

 {/* Employee List */}
 {filteredEmployees.length === 0 ? (
 <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-12 text-center">
 <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
 <h3 className="text-lg font-bold text-slate-900 mb-2">Ingen ansatte funnet</h3>
 <p className="text-slate-600 mb-4">
 {searchTerm || filterStatus !== 'all'
 ? 'Prøv å justere søket eller filteret ditt'
 : 'Legg til din første ansatt for å komme i gang'}
 </p>
 </div>
 ) : (
 <div className="grid gap-4">
 {filteredEmployees.map((employee) => (
 <div
 key={employee.id}
 className="bg-white border-2 border-slate-200 rounded-xl p-5 hover:border-blue-300 transition-all"
 >
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-3">
 <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
 <span className="text-xl font-bold text-blue-600">
 {employee.full_name.charAt(0)}
 </span>
 </div>
 <div>
 <h3 className="text-lg font-bold text-slate-900">{employee.full_name}</h3>
 <p className="text-sm text-slate-600">{employee.position}</p>
 </div>
 <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
 {employee.status}
 </span>
 <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEmploymentTypeColor(employee.employment_type)}`}>
 {employee.employment_type}
 </span>
 </div>

 <div className="grid md:grid-cols-3 gap-4 text-sm">
 <div className="flex items-center gap-2 text-slate-700">
 <Phone className="w-4 h-4 text-blue-600" />
 <span>{employee.phone}</span>
 </div>
 <div className="flex items-center gap-2 text-slate-700">
 <Mail className="w-4 h-4 text-blue-600" />
 <span>{employee.email}</span>
 </div>
 <div className="flex items-center gap-2 text-slate-700">
 <Briefcase className="w-4 h-4 text-blue-600" />
 <span>{employee.department}</span>
 </div>
 <div className="flex items-center gap-2 text-slate-700">
 <Calendar className="w-4 h-4 text-blue-600" />
 <span>Ansatt: {new Date(employee.hire_date).toLocaleDateString('nb-NO')}</span>
 </div>
 {employee.emergency_contact_name && (
 <>
 <div className="flex items-center gap-2 text-slate-700">
 <AlertCircle className="w-4 h-4 text-orange-600" />
 <span>Nødkontakt: {employee.emergency_contact_name}</span>
 </div>
 <div className="flex items-center gap-2 text-slate-700">
 <Phone className="w-4 h-4 text-orange-600" />
 <span>{employee.emergency_contact_phone}</span>
 </div>
 </>
 )}
 </div>

 {employee.notes && (
 <div className="mt-3 p-3 bg-slate-50 rounded-lg">
 <div className="flex items-start gap-2 text-sm text-slate-700">
 <FileText className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
 <span>{employee.notes}</span>
 </div>
 </div>
 )}
 </div>

 <div className="flex gap-2 ml-4">
 <button
 onClick={() => handleEdit(employee)}
 className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
 >
 <Edit2 className="w-4 h-4" />
 </button>
 <button
 onClick={() => handleDelete(employee.id!)}
 className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Form Modal */}
 {showForm && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
 <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
 <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
 <h2 className="text-2xl font-bold text-slate-900">
 {editingId ? 'Rediger ansatt' : 'Ny ansatt'}
 </h2>
 <button
 onClick={resetForm}
 className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
 >
 <X className="w-6 h-6 text-slate-600" />
 </button>
 </div>

 <form onSubmit={handleSubmit} className="p-6 space-y-6">
 <div className="grid md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">
 Fullt navn *
 </label>
 <input
 type="text"
 required
 value={formData.full_name}
 onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">
 Stilling *
 </label>
 <input
 type="text"
 required
 value={formData.position}
 onChange={(e) => setFormData({ ...formData, position: e.target.value })}
 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">
 Telefon *
 </label>
 <input
 type="tel"
 required
 value={formData.phone}
 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">
 E-post *
 </label>
 <input
 type="email"
 required
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">
 Ansettelsesdato *
 </label>
 <input
 type="date"
 required
 value={formData.hire_date}
 onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">
 Ansettelsestype *
 </label>
 <select
 value={formData.employment_type}
 onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as any })}
 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
 >
 <option value="Heltid">Heltid</option>
 <option value="Deltid">Deltid</option>
 <option value="Vikar">Vikar</option>
 <option value="Lærling">Lærling</option>
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">
 Avdeling *
 </label>
 <input
 type="text"
 required
 value={formData.department}
 onChange={(e) => setFormData({ ...formData, department: e.target.value })}
 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
 placeholder="F.eks. Kjøkken, Service, Levering"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">
 Status *
 </label>
 <select
 value={formData.status}
 onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
 >
 <option value="Aktiv">Aktiv</option>
 <option value="Permisjon">Permisjon</option>
 <option value="Sluttet">Sluttet</option>
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">
 Nødkontakt navn
 </label>
 <input
 type="text"
 value={formData.emergency_contact_name}
 onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">
 Nødkontakt telefon
 </label>
 <input
 type="tel"
 value={formData.emergency_contact_phone}
 onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
 />
 </div>

 <div className="md:col-span-2">
 <label className="block text-sm font-medium text-slate-700 mb-2">
 Notater
 </label>
 <textarea
 value={formData.notes}
 onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
 rows={4}
 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
 placeholder="Sertifiseringer, kompetanser, merknader..."
 />
 </div>
 </div>

 <div className="flex gap-3 pt-4 border-t border-slate-200">
 <button
 type="submit"
 className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
 >
 <Save className="w-5 h-5" />
 {editingId ? 'Oppdater' : 'Lagre'}
 </button>
 <button
 type="button"
 onClick={resetForm}
 className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
 >
 Avbryt
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
