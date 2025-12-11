import { useState, useEffect } from 'react';
import { UserCheck, Shield, FileText, Calendar, Phone, Mail, User, Building2, Hash, MapPin, CheckCircle, AlertCircle, Download, Save } from 'lucide-react';
import { hmsApi } from '../../lib/hmsSupabase';

interface SafetyRep {
 id?: string;
 name: string;
 position: string;
 phone: string;
 email: string;
 appointed_date: string;
 term_years: number;
 manager_name: string;
 manager_signature_date: string;
 rep_signature_date: string;
 company_name: string;
 company_org_number: string;
 company_address: string;
}

export function SafetyRepresentative() {
 const [activeTab, setActiveTab] = useState<'view' | 'edit' | 'agreement'>('view');
 const [safetyRep, setSafetyRep] = useState<SafetyRep>({
 name: '',
 position: '',
 phone: '',
 email: '',
 appointed_date: new Date().toISOString().split('T')[0],
 term_years: 2,
 manager_name: 'Gourg Mounir Brsoum',
 manager_signature_date: '',
 rep_signature_date: '',
 company_name: 'Amigos la Kokido AS',
 company_org_number: '',
 company_address: 'Hollendergata 2, 1607 Fredrikstad',
 });
 const [loading, setLoading] = useState(true);
 const [saved, setSaved] = useState(false);

 useEffect(() => {
 loadSafetyRep();
 }, []);

 const loadSafetyRep = async () => {
 setLoading(true);
 const { data, error } = await hmsApi.getSafetyRepresentative();

 if (error) {
 console.error('Error loading safety representative:', error);
 }

 if (data) {
 setSafetyRep(data);
 }
 setLoading(false);
 };

 const handleSave = async () => {
 try {
 if (safetyRep.id) {
 await hmsApi.updateSafetyRepresentative(safetyRep.id, safetyRep);
 } else {
 await hmsApi.createSafetyRepresentative(safetyRep);
 }
 setSaved(true);
 setTimeout(() => setSaved(false), 3000);
 loadSafetyRep();
 setActiveTab('view');
 } catch (error) {
 console.error('Error saving safety representative:', error);
 }
 };

 const handleDownloadPDF = () => {
 window.print();
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
 <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
 <UserCheck className="w-6 h-6 text-white" />
 </div>
 <div>
 <h1 className="text-2xl font-bold text-slate-900">Verneombud</h1>
 <p className="text-sm text-slate-600">Avtale og Utnevnelse</p>
 </div>
 </div>
 {saved && (
 <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
 <CheckCircle className="w-5 h-5" />
 <span className="font-medium">Lagret!</span>
 </div>
 )}
 </div>

 <div className="flex gap-2 mb-6">
 <button
 onClick={() => setActiveTab('view')}
 className={`px-4 py-2 rounded-lg font-medium transition-colors ${
 activeTab === 'view'
 ? 'bg-green-600 text-white'
 : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
 }`}
 >
 Oversikt
 </button>
 <button
 onClick={() => setActiveTab('edit')}
 className={`px-4 py-2 rounded-lg font-medium transition-colors ${
 activeTab === 'edit'
 ? 'bg-green-600 text-white'
 : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
 }`}
 >
 Rediger
 </button>
 <button
 onClick={() => setActiveTab('agreement')}
 className={`px-4 py-2 rounded-lg font-medium transition-colors ${
 activeTab === 'agreement'
 ? 'bg-green-600 text-white'
 : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
 }`}
 >
 Avtale
 </button>
 {safetyRep.name && (
 <button
 onClick={handleDownloadPDF}
 className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
 >
 <Download className="w-4 h-4" />
 Last ned PDF
 </button>
 )}
 </div>

 {activeTab === 'view' && (
 <div className="space-y-6">
 {!safetyRep.name ? (
 <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
 <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
 <h3 className="text-lg font-bold text-slate-900 mb-2">Ingen verneombud registrert</h3>
 <p className="text-slate-600 mb-4">
 Virksomheter med 10 eller flere ansatte skal ha verneombud.
 </p>
 <button
 onClick={() => setActiveTab('edit')}
 className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
 >
 Registrer verneombud
 </button>
 </div>
 ) : (
 <>
 <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
 <div className="flex items-start gap-4">
 <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
 <UserCheck className="w-8 h-8 text-green-600" />
 </div>
 <div className="flex-1">
 <h2 className="text-2xl font-bold text-slate-900 mb-1">{safetyRep.name}</h2>
 <p className="text-green-700 font-medium">{safetyRep.position}</p>
 <div className="grid md:grid-cols-2 gap-3 mt-4">
 <div className="flex items-center gap-2 text-slate-700">
 <Phone className="w-4 h-4 text-green-600" />
 <span>{safetyRep.phone}</span>
 </div>
 <div className="flex items-center gap-2 text-slate-700">
 <Mail className="w-4 h-4 text-green-600" />
 <span>{safetyRep.email}</span>
 </div>
 <div className="flex items-center gap-2 text-slate-700">
 <Calendar className="w-4 h-4 text-green-600" />
 <span>Utnevnt: {new Date(safetyRep.appointed_date).toLocaleDateString('nb-NO')}</span>
 </div>
 <div className="flex items-center gap-2 text-slate-700">
 <Calendar className="w-4 h-4 text-green-600" />
 <span>Periode: {safetyRep.term_years} år</span>
 </div>
 </div>
 </div>
 </div>
 </div>

 <div className="grid md:grid-cols-2 gap-6">
 <div className="bg-white rounded-xl border-2 border-slate-200 p-5">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
 <Shield className="w-5 h-5 text-blue-600" />
 </div>
 <h3 className="font-bold text-slate-900">Hovedoppgaver</h3>
 </div>
 <ul className="space-y-2 text-sm text-slate-700">
 <li className="flex items-start gap-2">
 <span className="text-green-600 mt-1">•</span>
 <span>Følge med på at arbeidsmiljøet er fullt forsvarlig</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-green-600 mt-1">•</span>
 <span>Delta i HMS-arbeidet og melde fra om farlige forhold</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-green-600 mt-1">•</span>
 <span>Delta på vernerunder og interne inspeksjoner</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-green-600 mt-1">•</span>
 <span>Følge opp avvik og rapportere behov for tiltak</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-green-600 mt-1">•</span>
 <span>Ha dialog med daglig leder og ansatte om HMS</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-green-600 mt-1">•</span>
 <span>Sikre at arbeidstakere får nødvendig opplæring</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-green-600 mt-1">•</span>
 <span>Ha innsikt i relevante dokumenter, avvik og rapporter</span>
 </li>
 </ul>
 </div>

 <div className="bg-white rounded-xl border-2 border-slate-200 p-5">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
 <CheckCircle className="w-5 h-5 text-orange-600" />
 </div>
 <h3 className="font-bold text-slate-900">Rettigheter</h3>
 </div>
 <ul className="space-y-2 text-sm text-slate-700">
 <li className="flex items-start gap-2">
 <span className="text-orange-600 mt-1">•</span>
 <span>Nødvendig tid til å utføre vervet</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-orange-600 mt-1">•</span>
 <span>Opplæring i HMS iht. lovverket</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-orange-600 mt-1">•</span>
 <span>Innsyn i alle saker som påvirker arbeidsmiljøet</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-orange-600 mt-1">•</span>
 <span><strong>Å stanse farlig arbeid</strong> (Arbeidsmiljøloven § 6-3) dersom det er akutt fare for liv og helse</span>
 </li>
 </ul>
 </div>
 </div>

 <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
 <div className="flex items-start gap-3">
 <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
 <div>
 <h3 className="font-bold text-slate-900 mb-2">Lovkrav</h3>
 <p className="text-slate-700 text-sm leading-relaxed">
 Iht. Arbeidsmiljøloven § 6-1 skal virksomheter med 10 eller flere ansatte ha verneombud.
 Verneombudet skal velges av og blant arbeidstakerne, og tjenesteperioden er vanligvis 2 år.
 </p>
 </div>
 </div>
 </div>
 </>
 )}
 </div>
 )}

 {activeTab === 'edit' && (
 <div className="space-y-6">
 <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
 <p className="text-sm text-slate-700">
 <strong>Viktig:</strong> Verneombudet skal velges av og blant de ansatte. Dette dokumentet bekrefter valget.
 </p>
 </div>

 <div className="grid md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">
 <User className="w-4 h-4 inline mr-2" />
 Navn på verneombud *
 </label>
 <input
 type="text"
 value={safetyRep.name}
 onChange={(e) => setSafetyRep({ ...safetyRep, name: e.target.value })}
 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
 placeholder="Fullt navn"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">
 <Building2 className="w-4 h-4 inline mr-2" />
 Stilling *
 </label>
 <input
 type="text"
 value={safetyRep.position}
 onChange={(e) => setSafetyRep({ ...safetyRep, position: e.target.value })}
 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
 placeholder="F.eks. Medarbeider"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">
 <Phone className="w-4 h-4 inline mr-2" />
 Telefon *
 </label>
 <input
 type="tel"
 value={safetyRep.phone}
 onChange={(e) => setSafetyRep({ ...safetyRep, phone: e.target.value })}
 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
 placeholder="+47 XXX XX XXX"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">
 <Mail className="w-4 h-4 inline mr-2" />
 E-post *
 </label>
 <input
 type="email"
 value={safetyRep.email}
 onChange={(e) => setSafetyRep({ ...safetyRep, email: e.target.value })}
 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
 placeholder="epost@eksempel.no"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">
 <Calendar className="w-4 h-4 inline mr-2" />
 Utnevnt dato *
 </label>
 <input
 type="date"
 value={safetyRep.appointed_date}
 onChange={(e) => setSafetyRep({ ...safetyRep, appointed_date: e.target.value })}
 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">
 <Calendar className="w-4 h-4 inline mr-2" />
 Periode (år)
 </label>
 <input
 type="number"
 value={safetyRep.term_years}
 onChange={(e) => setSafetyRep({ ...safetyRep, term_years: parseInt(e.target.value) })}
 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
 min="1"
 max="4"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">
 <Hash className="w-4 h-4 inline mr-2" />
 Organisasjonsnummer
 </label>
 <input
 type="text"
 value={safetyRep.company_org_number}
 onChange={(e) => setSafetyRep({ ...safetyRep, company_org_number: e.target.value })}
 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
 placeholder="XXX XXX XXX"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">
 <User className="w-4 h-4 inline mr-2" />
 Daglig leder
 </label>
 <input
 type="text"
 value={safetyRep.manager_name}
 onChange={(e) => setSafetyRep({ ...safetyRep, manager_name: e.target.value })}
 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">
 <Calendar className="w-4 h-4 inline mr-2" />
 Signert av leder (dato)
 </label>
 <input
 type="date"
 value={safetyRep.manager_signature_date}
 onChange={(e) => setSafetyRep({ ...safetyRep, manager_signature_date: e.target.value })}
 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-2">
 <Calendar className="w-4 h-4 inline mr-2" />
 Signert av verneombud (dato)
 </label>
 <input
 type="date"
 value={safetyRep.rep_signature_date}
 onChange={(e) => setSafetyRep({ ...safetyRep, rep_signature_date: e.target.value })}
 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
 />
 </div>
 </div>

 <div className="flex gap-3">
 <button
 onClick={handleSave}
 className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
 >
 <Save className="w-5 h-5" />
 Lagre
 </button>
 <button
 onClick={() => setActiveTab('view')}
 className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
 >
 Avbryt
 </button>
 </div>
 </div>
 )}

 {activeTab === 'agreement' && (
 <div className="space-y-6 bg-white p-8 rounded-xl border-2 border-slate-300" id="agreement-print">
 <div className="text-center border-b-2 border-slate-300 pb-6">
 <h1 className="text-3xl font-bold text-slate-900 mb-2">VERNEOMBUD – AVTALE / UTNEVNELSE</h1>
 <p className="text-slate-600"></p>
 </div>

 <div className="grid grid-cols-2 gap-4 text-sm">
 <div>
 <strong>Dokumenttype:</strong> Utnevnelse av verneombud
 </div>
 <div>
 <strong>Dato:</strong> {new Date().toLocaleDateString('nb-NO')}
 </div>
 <div>
 <strong>Virksomhet:</strong> {safetyRep.company_name}
 </div>
 <div>
 <strong>Org.nr:</strong> {safetyRep.company_org_number || '___________'}
 </div>
 <div className="col-span-2">
 <strong>Adresse:</strong> {safetyRep.company_address}
 </div>
 </div>

 <div className="space-y-4">
 <div>
 <h2 className="text-xl font-bold text-slate-900 mb-2">🧑‍🏫 1. Formål med verneombud</h2>
 <p className="text-slate-700">
 Verneombudet skal ivareta arbeidstakernes interesser i saker som gjelder arbeidsmiljøet,
 og bidra til at arbeidsplassen oppfyller kravene i Arbeidsmiljøloven og Internkontrollforskriften.
 </p>
 </div>

 <div>
 <h2 className="text-xl font-bold text-slate-900 mb-2">🧩 2. Utnevnelse</h2>
 <p className="text-slate-700 mb-3">
 Virksomheten {safetyRep.company_name} utnevner herved følgende person som Verneombud:
 </p>
 <div className="bg-slate-50 rounded-lg p-4 space-y-2">
 <div><strong>Navn:</strong> {safetyRep.name || '________________________________________'}</div>
 <div><strong>Stilling:</strong> {safetyRep.position || '________________________________________'}</div>
 <div><strong>Telefon:</strong> {safetyRep.phone || '________________________________________'}</div>
 <div><strong>E-post:</strong> {safetyRep.email || '________________________________________'}</div>
 </div>
 <p className="text-slate-700 mt-3">
 Verneombudet velges for en periode på {safetyRep.term_years} år, med mulighet for forlengelse.
 </p>
 </div>

 <div>
 <h2 className="text-xl font-bold text-slate-900 mb-2">🔧 3. Verneombudets oppgaver</h2>
 <p className="text-slate-700 mb-2">Verneombudet skal:</p>
 <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
 <li>Følge med på at arbeidsmiljøet er fullt forsvarlig</li>
 <li>Delta i HMS-arbeidet og melde fra om farlige forhold</li>
 <li>Delta på vernerunder og interne inspeksjoner</li>
 <li>Følge opp avvik og rapportere behov for tiltak</li>
 <li>Ha dialog med daglig leder og ansatte om HMS</li>
 <li>Sikre at arbeidstakere får nødvendig opplæring</li>
 <li>Ha innsikt i relevante dokumenter, avvik og rapporter</li>
 </ul>
 </div>

 <div>
 <h2 className="text-xl font-bold text-slate-900 mb-2">📘 4. Rettigheter</h2>
 <p className="text-slate-700 mb-2">Verneombudet har rett til:</p>
 <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
 <li>Nødvendig tid til å utføre vervet</li>
 <li>Opplæring i HMS iht. lovverket</li>
 <li>Innsyn i alle saker som påvirker arbeidsmiljøet</li>
 <li><strong>Å stanse farlig arbeid</strong> (Arbeidsmiljøloven § 6-3) dersom det er akutt fare for liv og helse</li>
 </ul>
 </div>

 <div>
 <h2 className="text-xl font-bold text-slate-900 mb-2">🤝 5. Samarbeidsplikt</h2>
 <p className="text-slate-700">
 Daglig leder og alle ansatte plikter å samarbeide med verneombudet
 for å sikre et trygt og godt arbeidsmiljø.
 </p>
 </div>

 <div>
 <h2 className="text-xl font-bold text-slate-900 mb-2">📝 6. Bekreftelse</h2>
 <p className="text-slate-700 mb-4">
 Begge parter signerer denne avtalen og forplikter seg til å følge lovverket.
 </p>

 <div className="grid md:grid-cols-2 gap-8 mt-6">
 <div className="border-2 border-slate-300 rounded-lg p-4">
 <h3 className="font-bold text-slate-900 mb-3">Daglig leder:</h3>
 <div className="space-y-3">
 <div>
 <div className="text-sm text-slate-600">Navn:</div>
 <div className="font-medium">{safetyRep.manager_name}</div>
 </div>
 <div>
 <div className="text-sm text-slate-600">Signatur:</div>
 <div className="border-b-2 border-slate-300 h-12"></div>
 </div>
 <div>
 <div className="text-sm text-slate-600">Dato:</div>
 <div className="font-medium">
 {safetyRep.manager_signature_date
 ? new Date(safetyRep.manager_signature_date).toLocaleDateString('nb-NO')
 : '___ / ___ / 20___'}
 </div>
 </div>
 </div>
 </div>

 <div className="border-2 border-slate-300 rounded-lg p-4">
 <h3 className="font-bold text-slate-900 mb-3">Verneombud:</h3>
 <div className="space-y-3">
 <div>
 <div className="text-sm text-slate-600">Navn:</div>
 <div className="font-medium">{safetyRep.name || '___________________________________________'}</div>
 </div>
 <div>
 <div className="text-sm text-slate-600">Signatur:</div>
 <div className="border-b-2 border-slate-300 h-12"></div>
 </div>
 <div>
 <div className="text-sm text-slate-600">Dato:</div>
 <div className="font-medium">
 {safetyRep.rep_signature_date
 ? new Date(safetyRep.rep_signature_date).toLocaleDateString('nb-NO')
 : '___ / ___ / 20___'}
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>

 <style>{`
 @media print {
 body * {
 visibility: hidden;
 }
 #agreement-print, #agreement-print * {
 visibility: visible;
 }
 #agreement-print {
 position: absolute;
 left: 0;
 top: 0;
 width: 100%;
 }
 }
 `}</style>
 </div>
 );
}
