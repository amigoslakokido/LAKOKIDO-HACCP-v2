import { useState, useEffect } from 'react';
import { companyApi, CompanyInfo as CompanyInfoType } from '../../lib/companyApi';
import { Building2, Mail, Phone, Globe, User, MapPin, Save, Edit2, X } from 'lucide-react';

export function CompanyInfo() {
 const [companyInfo, setCompanyInfo] = useState<CompanyInfoType | null>(null);
 const [isEditing, setIsEditing] = useState(false);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [formData, setFormData] = useState<Partial<CompanyInfoType>>({});

 useEffect(() => {
 loadCompanyInfo();
 }, []);

 const loadCompanyInfo = async () => {
 setLoading(true);
 const { data, error } = await companyApi.getCompanyInfo();
 if (!error && data) {
 setCompanyInfo(data);
 setFormData(data);
 }
 setLoading(false);
 };

 const handleSave = async () => {
 setSaving(true);
 const { error } = await companyApi.updateCompanyInfo(formData);
 if (!error) {
 await loadCompanyInfo();
 setIsEditing(false);
 }
 setSaving(false);
 };

 const handleCancel = () => {
 setFormData(companyInfo || {});
 setIsEditing(false);
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center h-64">
 <div className="text-slate-600"> Laster...</div>
 </div>
 );
 }

 if (!companyInfo && !isEditing) {
 return (
 <div className="text-center py-12">
 <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
 <h3 className="text-xl font-bold text-slate-700 mb-2">Ingen firmainfo funnet</h3>
 <p className="text-slate-500 mb-6"> </p>
 <button
 onClick={() => setIsEditing(true)}
 className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold"
 >
 Legg til firmainfo
 </button>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-2xl font-bold text-slate-900">Firmaopplysninger</h2>
 <p className="text-slate-600">Informasjon om bedriften</p>
 </div>
 {!isEditing ? (
 <button
 onClick={() => setIsEditing(true)}
 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
 >
 <Edit2 className="w-4 h-4" />
 Rediger
 </button>
 ) : (
 <div className="flex gap-2">
 <button
 onClick={handleSave}
 disabled={saving}
 className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all disabled:opacity-50"
 >
 <Save className="w-4 h-4" />
 {saving ? 'Lagrer...' : 'Lagre'}
 </button>
 <button
 onClick={handleCancel}
 className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all"
 >
 <X className="w-4 h-4" />
 Avbryt
 </button>
 </div>
 )}
 </div>

 {!isEditing ? (
 <div className="grid md:grid-cols-2 gap-6">
 <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
 <Building2 className="w-6 h-6 text-blue-600" />
 </div>
 <div>
 <h3 className="font-bold text-slate-900"></h3>
 <p className="text-sm text-slate-600">Firmanavn</p>
 </div>
 </div>
 <p className="text-lg font-bold text-slate-800">{companyInfo?.company_name}</p>
 <p className="text-sm text-slate-600 mt-1">Org.nr: {companyInfo?.org_number}</p>
 </div>

 <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
 <User className="w-6 h-6 text-green-600" />
 </div>
 <div>
 <h3 className="font-bold text-slate-900"></h3>
 <p className="text-sm text-slate-600">Daglig leder</p>
 </div>
 </div>
 <p className="text-lg font-bold text-slate-800">{companyInfo?.manager_name}</p>
 </div>

 <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
 <Phone className="w-6 h-6 text-purple-600" />
 </div>
 <div>
 <h3 className="font-bold text-slate-900"> </h3>
 <p className="text-sm text-slate-600">Telefon</p>
 </div>
 </div>
 <p className="text-lg font-bold text-slate-800">{companyInfo?.phone}</p>
 </div>

 <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
 <Mail className="w-6 h-6 text-orange-600" />
 </div>
 <div>
 <h3 className="font-bold text-slate-900"> </h3>
 <p className="text-sm text-slate-600">E-post</p>
 </div>
 </div>
 <p className="text-lg font-bold text-slate-800">{companyInfo?.email}</p>
 </div>

 <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
 <Globe className="w-6 h-6 text-cyan-600" />
 </div>
 <div>
 <h3 className="font-bold text-slate-900"></h3>
 <p className="text-sm text-slate-600">Nettside</p>
 </div>
 </div>
 <p className="text-lg font-bold text-slate-800">{companyInfo?.website}</p>
 </div>

 <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
 <MapPin className="w-6 h-6 text-red-600" />
 </div>
 <div>
 <h3 className="font-bold text-slate-900"></h3>
 <p className="text-sm text-slate-600">Adresse</p>
 </div>
 </div>
 <p className="text-lg font-bold text-slate-800">{companyInfo?.address}</p>
 </div>

 {companyInfo?.environmental_policy && (
 <div className="md:col-span-2 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border-2 border-green-200">
 <h3 className="font-bold text-green-900 mb-3">♻️ Miljøpolicy</h3>
 <p className="text-green-800 leading-relaxed">{companyInfo.environmental_policy}</p>
 </div>
 )}
 </div>
 ) : (
 <div className="bg-white rounded-2xl p-8 border-2 border-slate-200">
 <div className="grid md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Firmanavn
 </label>
 <input
 type="text"
 value={formData.company_name || ''}
 onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 ofOrganisasjonsnummer
 </label>
 <input
 type="text"
 value={formData.org_number || ''}
 onChange={(e) => setFormData({ ...formData, org_number: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Daglig leder
 </label>
 <input
 type="text"
 value={formData.manager_name || ''}
 onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Telefon
 </label>
 <input
 type="text"
 value={formData.phone || ''}
 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
E-post
 </label>
 <input
 type="email"
 value={formData.email || ''}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Nettside
 </label>
 <input
 type="text"
 value={formData.website || ''}
 onChange={(e) => setFormData({ ...formData, website: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 />
 </div>

 <div className="md:col-span-2">
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Adresse
 </label>
 <input
 type="text"
 value={formData.address || ''}
 onChange={(e) => setFormData({ ...formData, address: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 />
 </div>

 <div className="md:col-span-2">
 <label className="block text-sm font-bold text-slate-700 mb-2">
 ♻️ Miljøpolicy
 </label>
 <textarea
 value={formData.environmental_policy || ''}
 onChange={(e) => setFormData({ ...formData, environmental_policy: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 rows={4}
 placeholder="Beskriv bedriftens miljøengasjement og grønne initiativ..."
 />
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
