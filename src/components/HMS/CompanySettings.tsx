import { useState, useEffect } from 'react';
import { hmsCompanyApi, HMSCompanySettings, EnvironmentalPartner } from '../../lib/hmsCompanyApi';
import { Building2, Mail, Phone, Globe, User, MapPin, Save, Edit2, X, Plus, Trash2, CheckCircle, Leaf } from 'lucide-react';

export function CompanySettings() {
 const [settings, setSettings] = useState<HMSCompanySettings | null>(null);
 const [partners, setPartners] = useState<EnvironmentalPartner[]>([]);
 const [isEditing, setIsEditing] = useState(false);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [showSuccess, setShowSuccess] = useState(false);
 const [showPartnerForm, setShowPartnerForm] = useState(false);
 const [formData, setFormData] = useState<Partial<HMSCompanySettings>>({});

 const [partnerFormData, setPartnerFormData] = useState({
 name: '',
 service: '',
 contact_person: '',
 phone: '',
 email: ''
 });

 useEffect(() => {
 loadData();
 }, []);

 const loadData = async () => {
 setLoading(true);
 const [settingsRes, partnersRes] = await Promise.all([
 hmsCompanyApi.getCompanySettings(),
 hmsCompanyApi.getEnvironmentalPartners()
 ]);

 if (settingsRes.data) {
 setSettings(settingsRes.data);
 setFormData(settingsRes.data);
 }
 if (partnersRes.data) setPartners(partnersRes.data);
 setLoading(false);
 };

 const handleSave = async () => {
 setSaving(true);
 const { error } = await hmsCompanyApi.updateCompanySettings(formData);
 if (!error) {
 await loadData();
 setIsEditing(false);
 setShowSuccess(true);
 setTimeout(() => setShowSuccess(false), 3000);
 }
 setSaving(false);
 };

 const handleCancel = () => {
 setFormData(settings || {});
 setIsEditing(false);
 };

 const handleAddPartner = async (e: React.FormEvent) => {
 e.preventDefault();
 const { error } = await hmsCompanyApi.createPartner(partnerFormData);
 if (!error) {
 await loadData();
 setShowPartnerForm(false);
 setPartnerFormData({ name: '', service: '', contact_person: '', phone: '', email: '' });
 }
 };

 const handleDeletePartner = async (id: string) => {
 if (confirm('Er du sikker på at du vil slette denne partneren?')) {
 await hmsCompanyApi.softDeletePartner(id);
 await loadData();
 }
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center h-64">
 <div className="text-slate-600"> Laster...</div>
 </div>
 );
 }

 if (!settings && !isEditing) {
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
 {showSuccess && (
 <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-center gap-3">
 <CheckCircle className="w-6 h-6 text-green-600" />
 <div>
 <p className="font-bold text-green-900">✓ Endringer lagret!</p>
 <p className="text-sm text-green-700">Bedriftsinformasjonen er oppdatert</p>
 </div>
 </div>
 )}

 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-2xl font-bold text-slate-900">Bedriftsinformasjon</h2>
 <p className="text-slate-600">Administrer firmaopplysninger og miljøpartnere</p>
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
 </button>
 </div>
 )}
 </div>

 {!isEditing ? (
 <div className="space-y-6">
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
 <p className="text-lg font-bold text-slate-800">{settings?.company_name}</p>
 <p className="text-sm text-slate-600 mt-1">Org.nr: {settings?.org_number}</p>
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
 <p className="text-lg font-bold text-slate-800">{settings?.manager_name}</p>
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
 <p className="text-lg font-bold text-slate-800">{settings?.phone}</p>
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
 <p className="text-lg font-bold text-slate-800">{settings?.email}</p>
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
 <p className="text-lg font-bold text-slate-800">{settings?.website}</p>
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
 <p className="text-lg font-bold text-slate-800">{settings?.address}</p>
 </div>
 </div>

 {settings?.description_no && (
 <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
 <h3 className="font-bold text-blue-900 mb-3 text-lg">📋 Om bedriften</h3>
 <p className="text-blue-800 leading-relaxed">{settings.description_no}</p>
 </div>
 )}

 <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border-2 border-green-200">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-bold text-green-900 text-lg">
 {settings?.environmental_title_no || '♻️ Miljøpartnere'}
 </h3>
 <button
 onClick={() => setShowPartnerForm(true)}
 className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-bold"
 >
 <Plus className="w-4 h-4" />
 Partner
 </button>
 </div>
 <div className="space-y-3">
 {partners.map((partner) => (
 <div key={partner.id} className="bg-white rounded-xl p-4 flex items-start justify-between">
 <div className="flex items-start gap-3">
 <Leaf className="w-5 h-5 text-green-600 mt-1" />
 <div>
 <p className="font-bold text-slate-900">{partner.name}</p>
 <p className="text-sm text-slate-600">{partner.service}</p>
 {partner.contact_person && (
 <p className="text-xs text-slate-500 mt-1">Kontakt: {partner.contact_person}</p>
 )}
 </div>
 </div>
 <button
 onClick={() => handleDeletePartner(partner.id)}
 className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 ))}
 </div>
 </div>
 </div>
 ) : (
 <div className="bg-white rounded-2xl p-8 border-2 border-slate-200">
 <div className="grid md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Firmanavn *
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
 ofOrganisasjonsnummer *
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
 Daglig leder *
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
 Telefon *
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
E-post *
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
 Adresse *
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
 📋 Om bedriften (Norsk)
 </label>
 <textarea
 value={formData.description_no || ''}
 onChange={(e) => setFormData({ ...formData, description_no: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 rows={4}
 placeholder="Beskriv bedriftens profil og HMS-engasjement..."
 />
 </div>

 <div className="md:col-span-2">
 <label className="block text-sm font-bold text-slate-700 mb-2">
 ♻️ Tittel for miljøseksjon (Norsk)
 </label>
 <input
 type="text"
 value={formData.environmental_title_no || ''}
 onChange={(e) => setFormData({ ...formData, environmental_title_no: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 placeholder="♻️ "
 />
 </div>

 <div className="md:col-span-2">
 <label className="block text-sm font-bold text-slate-700 mb-2">
 🧍‍♂️ Tittel for HMS-engasjement (Norsk)
 </label>
 <input
 type="text"
 value={formData.hms_commitment_title_no || ''}
 onChange={(e) => setFormData({ ...formData, hms_commitment_title_no: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 placeholder="🧍‍♂️ Employees "
 />
 </div>
 </div>
 </div>
 )}

 {showPartnerForm && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
 <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-2xl font-bold text-slate-900">Legg til miljøpartner</h3>
 <button
 onClick={() => setShowPartnerForm(false)}
 className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
 >
 <X className="w-6 h-6" />
 </button>
 </div>

 <form onSubmit={handleAddPartner} className="space-y-4">
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Navn *
 </label>
 <input
 type="text"
 value={partnerFormData.name}
 onChange={(e) => setPartnerFormData({ ...partnerFormData, name: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 required
 placeholder="F.eks. LEKO Mater AS"
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Tjeneste *
 </label>
 <input
 type="text"
 value={partnerFormData.service}
 onChange={(e) => setPartnerFormData({ ...partnerFormData, service: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 required
 placeholder="F.eks. Gulvrengjøring"
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Kontaktperson
 </label>
 <input
 type="text"
 value={partnerFormData.contact_person}
 onChange={(e) => setPartnerFormData({ ...partnerFormData, contact_person: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 />
 </div>

 <div className="grid md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 Telefon
 </label>
 <input
 type="text"
 value={partnerFormData.phone}
 onChange={(e) => setPartnerFormData({ ...partnerFormData, phone: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 E-post
 </label>
 <input
 type="email"
 value={partnerFormData.email}
 onChange={(e) => setPartnerFormData({ ...partnerFormData, email: e.target.value })}
 className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
 />
 </div>
 </div>

 <div className="flex gap-4 pt-4">
 <button
 type="submit"
 className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold"
 >
 Legg til
 </button>
 <button
 type="button"
 onClick={() => setShowPartnerForm(false)}
 className="px-6 py-4 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all font-bold"
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
