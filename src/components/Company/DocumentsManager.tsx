import { useState, useEffect } from 'react';
import { companyApi, CompanyDocument, Department, Employee } from '../../lib/companyApi';
import {
 FileText,
 Upload,
 Download,
 Trash2,
 Filter,
 Search,
 X,
 FileCheck,
 Calendar,
 User,
 Building2,
 Tag
} from 'lucide-react';

const CATEGORIES = [
 { value: 'maintenance', label_no: 'Vedlikehold', label_ar: 'Maintenance' },
 { value: 'cleaning', label_no: 'Rengjøring', label_ar: 'Cleaning' },
 { value: 'safety', label_no: 'Sikkerhet', label_ar: 'Safety' },
 { value: 'training', label_no: 'Opplæring', label_ar: 'Training' },
 { value: 'contract', label_no: 'Kontrakter', label_ar: 'Contracts' },
 { value: 'certificate', label_no: 'Sertifikater', label_ar: 'Certificates' },
 { value: 'inspection', label_no: 'Inspeksjon', label_ar: 'Inspection' },
 { value: 'report', label_no: 'Rapporter', label_ar: 'Reports' },
 { value: 'other', label_no: 'Annet', label_ar: 'Other' }
];

export function DocumentsManager() {
 const [documents, setDocuments] = useState<CompanyDocument[]>([]);
 const [departments, setDepartments] = useState<Department[]>([]);
 const [employees, setEmployees] = useState<Employee[]>([]);
 const [loading, setLoading] = useState(true);
 const [showUploadForm, setShowUploadForm] = useState(false);
 const [uploading, setUploading] = useState(false);
 const [selectedFile, setSelectedFile] = useState<File | null>(null);

 const [filters, setFilters] = useState({
 department_id: '',
 category: '',
 search: ''
 });

 const [formData, setFormData] = useState({
 title: '',
 description: '',
 category: 'other' as CompanyDocument['category'],
 department_id: '',
 uploaded_by: '',
 document_date: new Date().toISOString().split('T')[0],
 is_public: true,
 tags: [] as string[]
 });

 useEffect(() => {
 loadData();
 }, [filters]);

 const loadData = async () => {
 setLoading(true);
 const [docsRes, deptRes, empRes] = await Promise.all([
 companyApi.getDocuments(filters),
 companyApi.getDepartments(),
 companyApi.getActiveEmployees()
 ]);

 if (docsRes.data) setDocuments(docsRes.data as any);
 if (deptRes.data) setDepartments(deptRes.data);
 if (empRes.data) setEmployees(empRes.data);
 setLoading(false);
 };

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.files && e.target.files[0]) {
 const file = e.target.files[0];
 setSelectedFile(file);
 if (!formData.title) {
 setFormData({ ...formData, title: file.name.replace(/\.[^/.]+$/, '') });
 }
 }
 };

 const handleUpload = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!selectedFile) return;

 setUploading(true);
 try {
 const uploadResult = await companyApi.uploadFile(selectedFile, 'documents');

 await companyApi.createDocument({
 ...formData,
 file_path: uploadResult.path,
 file_type: selectedFile.type,
 file_size: selectedFile.size
 });

 await loadData();
 resetForm();
 } catch (error) {
 console.error('Upload error:', error);
 alert('Feil ved opplasting. Sjekk at lagringsområdet er konfigurert.');
 }
 setUploading(false);
 };

 const handleDelete = async (id: string) => {
 if (confirm('Er du sikker på at du vil slette dette dokumentet?')) {
 await companyApi.deleteDocument(id);
 await loadData();
 }
 };

 const handleDownload = async (doc: any) => {
 try {
 const url = await companyApi.getFileUrl(doc.file_path);
 window.open(url, '_blank');
 } catch (error) {
 console.error('Download error:', error);
 }
 };

 const resetForm = () => {
 setFormData({
 title: '',
 description: '',
 category: 'other',
 department_id: '',
 uploaded_by: '',
 document_date: new Date().toISOString().split('T')[0],
 is_public: true,
 tags: []
 });
 setSelectedFile(null);
 setShowUploadForm(false);
 };

 const getCategoryLabel = (value: string) => {
 const cat = CATEGORIES.find(c => c.value === value);
 return cat ? `${cat.label_no}${cat.label_ar}` : value;
 };

 const formatFileSize = (bytes?: number) => {
 if (!bytes) return '0 KB';
 const kb = bytes / 1024;
 if (kb < 1024) return `${kb.toFixed(1)} KB`;
 return `${(kb / 1024).toFixed(1)} MB`;
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
 <h2 className="text-2xl font-bold text-slate-900">Dokumentarkiv</h2>
 <p className="text-slate-600">Administrer bedriftsdokumenter</p>
 </div>
 <button
 onClick={() => setShowUploadForm(true)}
 className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold"
 >
 <Upload className="w-5 h-5" />
 Last opp dokument
 </button>
 </div>

 <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
 <div className="flex items-center gap-3 mb-4">
 <Filter className="w-5 h-5 text-slate-600" />
 <h3 className="font-bold text-slate-900">Filtre / </h3>
 </div>
 <div className="grid md:grid-cols-3 gap-4">
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Avdeling
 </label>
 <select
 value={filters.department_id}
 onChange={(e) => setFilters({ ...filters, department_id: e.target.value })}
 className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
 >
 <option value="">Alle avdelinger</option>
 {departments.map((dept) => (
 <option key={dept.id} value={dept.id}>
 {dept.name_no}{dept.name_ar}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Kategori
 </label>
 <select
 value={filters.category}
 onChange={(e) => setFilters({ ...filters, category: e.target.value })}
 className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
 >
 <option value="">Alle kategorier</option>
 {CATEGORIES.map((cat) => (
 <option key={cat.value} value={cat.value}>
 {cat.label_no}{cat.label_ar}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Søk
 </label>
 <div className="relative">
 <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
 <input
 type="text"
 value={filters.search}
 onChange={(e) => setFilters({ ...filters, search: e.target.value })}
 className="w-full pl-10 pr-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
 placeholder="Søk i tittel eller beskrivelse..."
 />
 </div>
 </div>
 </div>
 </div>

 {showUploadForm && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
 <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-2xl font-bold text-slate-900">Last opp nytt dokument</h3>
 <button
 onClick={resetForm}
 className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
 >
 <X className="w-6 h-6" />
 </button>
 </div>

 <form onSubmit={handleUpload} className="space-y-6">
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Fil *
 </label>
 <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
 <input
 type="file"
 onChange={handleFileChange}
 accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
 className="hidden"
 id="file-upload"
 required
 />
 <label htmlFor="file-upload" className="cursor-pointer">
 <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
 <p className="text-slate-600 font-bold">
 {selectedFile ? selectedFile.name : 'Klikk for å velge fil'}
 </p>
 <p className="text-sm text-slate-500 mt-1">PDF, JPG, PNG, DOC (maks 10MB)</p>
 </label>
 </div>
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Tittel *
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
 Beskrivelse
 </label>
 <textarea
 value={formData.description}
 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 rows={3}
 />
 </div>

 <div className="grid md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Kategori *
 </label>
 <select
 value={formData.category}
 onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 required
 >
 {CATEGORIES.map((cat) => (
 <option key={cat.value} value={cat.value}>
 {cat.label_no}{cat.label_ar}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Avdeling
 </label>
 <select
 value={formData.department_id}
 onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 >
 <option value="">Ingen spesifikk avdeling</option>
 {departments.map((dept) => (
 <option key={dept.id} value={dept.id}>
 {dept.name_no}{dept.name_ar}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Dokumentdato
 </label>
 <input
 type="date"
 value={formData.document_date}
 onChange={(e) => setFormData({ ...formData, document_date: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Lastet opp av
 </label>
 <select
 value={formData.uploaded_by}
 onChange={(e) => setFormData({ ...formData, uploaded_by: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
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

 <div className="flex gap-4">
 <button
 type="submit"
 disabled={uploading || !selectedFile}
 className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold disabled:opacity-50"
 >
 <Upload className="w-5 h-5 inline mr-2" />
 {uploading ? 'Laster opp...' : 'Last opp'}
 </button>
 <button
 type="button"
 onClick={resetForm}
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
 {documents.length === 0 ? (
 <div className="text-center py-12 bg-slate-50 rounded-2xl">
 <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
 <p className="text-slate-600 text-lg">Ingen dokumenter funnet</p>
 <p className="text-slate-500">No documents</p>
 </div>
 ) : (
 documents.map((doc: any) => (
 <div
 key={doc.id}
 className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-blue-300 transition-all"
 >
 <div className="flex items-start justify-between">
 <div className="flex gap-4 flex-1">
 <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
 <FileCheck className="w-7 h-7 text-blue-600" />
 </div>
 <div className="flex-1">
 <h3 className="text-lg font-bold text-slate-900 mb-2">{doc.title}</h3>
 {doc.description && (
 <p className="text-sm text-slate-600 mb-3">{doc.description}</p>
 )}
 <div className="flex flex-wrap gap-4 text-sm text-slate-600">
 <div className="flex items-center gap-1">
 <Tag className="w-4 h-4" />
 <span>{getCategoryLabel(doc.category)}</span>
 </div>
 {doc.departments && (
 <div className="flex items-center gap-1">
 <Building2 className="w-4 h-4" />
 <span>{doc.departments.name_no}</span>
 </div>
 )}
 <div className="flex items-center gap-1">
 <Calendar className="w-4 h-4" />
 <span>{new Date(doc.upload_date).toLocaleDateString('nb-NO')}</span>
 </div>
 {doc.employees && (
 <div className="flex items-center gap-1">
 <User className="w-4 h-4" />
 <span>{doc.employees.name}</span>
 </div>
 )}
 <span className="text-slate-500">{formatFileSize(doc.file_size)}</span>
 </div>
 </div>
 </div>
 <div className="flex gap-2">
 <button
 onClick={() => handleDownload(doc)}
 className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
 title="Last ned"
 >
 <Download className="w-5 h-5" />
 </button>
 <button
 onClick={() => handleDelete(doc.id)}
 className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
 title="Slett"
 >
 <Trash2 className="w-5 h-5" />
 </button>
 </div>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 );
}
