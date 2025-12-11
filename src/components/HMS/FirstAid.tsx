import { useState, useEffect } from 'react';
import { Heart, Plus, Edit2, Trash2, Save, X, User, Mail, Phone, Building2, Calendar, FileText, Package, CheckCircle, AlertCircle, Download, Image as ImageIcon } from 'lucide-react';
import { hmsApi } from '../../lib/hmsSupabase';
import { generateFirstAidPDF } from '../../utils/hmsPdfGenerator';
import { AssistantPanel } from './AssistantPanel';

interface FirstAidResponsible {
  id?: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  last_course_date: string;
  certificate_url: string;
  certificate_valid_until: string;
  status: string;
}

interface Equipment {
  id?: string;
  equipment_name: string;
  quantity: number;
  condition: string;
  notes: string;
  last_check_date: string;
  checked_by: string;
  image_url: string;
  location: string;
}

interface Inspection {
  id?: string;
  inspection_date: string;
  inspection_type: string;
  inspected_by: string;
  missing_items: string;
  replaced_items: string;
  comments: string;
  image_url: string;
  status: string;
}

export function FirstAid() {
  console.log('🏥 FirstAid component rendered');

  const [activeTab, setActiveTab] = useState<'plan' | 'responsible' | 'equipment' | 'inspections'>('plan');
  const [responsible, setResponsible] = useState<FirstAidResponsible | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingResponsible, setEditingResponsible] = useState(false);
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [showAddInspection, setShowAddInspection] = useState(false);
  const [editingEquipmentId, setEditingEquipmentId] = useState<string | null>(null);

  const [responsibleForm, setResponsibleForm] = useState<FirstAidResponsible>({
    name: '',
    email: '',
    phone: '',
    department: '',
    last_course_date: '',
    certificate_url: '',
    certificate_valid_until: '',
    status: 'Gyldig',
  });

  const [equipmentForm, setEquipmentForm] = useState<Equipment>({
    equipment_name: '',
    quantity: 0,
    condition: 'OK',
    notes: '',
    last_check_date: '',
    checked_by: '',
    image_url: '',
    location: '',
  });

  const [inspectionForm, setInspectionForm] = useState<Inspection>({
    inspection_date: new Date().toISOString().split('T')[0],
    inspection_type: 'Ukentlig',
    inspected_by: '',
    missing_items: '',
    replaced_items: '',
    comments: '',
    image_url: '',
    status: 'OK',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    console.log('🏥 Loading First Aid data...');

    const [respData, equipData, inspData] = await Promise.all([
      hmsApi.getFirstAidResponsible(),
      hmsApi.getFirstAidEquipment(),
      hmsApi.getFirstAidInspections(),
    ]);

    console.log('📊 First Aid data loaded:', { respData, equipData, inspData });

    if (respData.data) {
      setResponsible(respData.data);
      setResponsibleForm(respData.data);
    }
    if (equipData.data) setEquipment(equipData.data);
    if (inspData.data) setInspections(inspData.data);
    setLoading(false);
  };

  const handleSaveResponsible = async () => {
    try {
      if (responsible?.id) {
        await hmsApi.updateFirstAidResponsible(responsible.id, responsibleForm);
      } else {
        await hmsApi.createFirstAidResponsible(responsibleForm);
      }
      setEditingResponsible(false);
      loadData();
    } catch (error) {
      console.error('Error saving responsible:', error);
    }
  };

  const handleSaveEquipment = async () => {
    try {
      if (editingEquipmentId) {
        await hmsApi.updateFirstAidEquipment(editingEquipmentId, equipmentForm);
      } else {
        await hmsApi.createFirstAidEquipment(equipmentForm);
      }
      setShowAddEquipment(false);
      setEditingEquipmentId(null);
      loadData();
    } catch (error) {
      console.error('Error saving equipment:', error);
    }
  };

  const handleDeleteEquipment = async (id: string) => {
    if (confirm('Er du sikker på at du vil slette dette utstyret?')) {
      await hmsApi.deleteFirstAidEquipment(id);
      loadData();
    }
  };

  const handleEditEquipment = (equip: Equipment) => {
    setEquipmentForm(equip);
    setEditingEquipmentId(equip.id || null);
    setShowAddEquipment(true);
  };

  const handleSaveInspection = async () => {
    try {
      await hmsApi.createFirstAidInspection(inspectionForm);
      setShowAddInspection(false);
      setInspectionForm({
        inspection_date: new Date().toISOString().split('T')[0],
        inspection_type: 'Ukentlig',
        inspected_by: '',
        missing_items: '',
        replaced_items: '',
        comments: '',
        image_url: '',
        status: 'OK',
      });
      loadData();
    } catch (error) {
      console.error('Error saving inspection:', error);
    }
  };

  const handleDeleteInspection = async (id: string) => {
    if (confirm('Er du sikker på at du vil slette denne kontrollen?')) {
      await hmsApi.deleteFirstAidInspection(id);
      loadData();
    }
  };

  const exportToPDF = () => {
    generateFirstAidPDF({
      responsible,
      equipment,
      inspections
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Gyldig':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Utløper snart':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Utløpt':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getExecuteActions = () => {
    const actions = [];

    if (equipment.length === 0) {
      actions.push({
        action: 'create-first-aid-equipment',
        label: 'Opprett førstehjelpsskap',
        data: { equipment_name: 'Førstehjelpsskap' }
      });
    }

    return actions;
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
      <AssistantPanel
        seksjon="forstehjelp"
        data={{
          utstyr: equipment,
          opplartePersoner: responsible ? 1 : 0,
          utlopsdato: responsible?.certificate_valid_until || null
        }}
        executeActions={getExecuteActions()}
        onExecuteSuccess={() => {
          loadData();
        }}
      />
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Førstehjelp</h1>
              <p className="text-sm text-slate-600">First Aid Management</p>
            </div>
          </div>
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Eksporter PDF
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'plan' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Førstehjelpsplan
          </button>
          <button
            onClick={() => setActiveTab('responsible')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'responsible' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Ansvarlig
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'equipment' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Utstyr
          </button>
          <button
            onClick={() => setActiveTab('inspections')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'inspections' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Kontroller
          </button>
        </div>

        {activeTab === 'plan' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-8 border-2 border-red-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-600" />
                Førstehjelpsplan
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">1. Formål</h3>
                  <p className="text-slate-700">
                    Førstehjelpsplanen skal sikre at alle ansatte vet hva som skal gjøres ved ulykker og akutte sykdomstilfeller.
                    Planen skal være tilgjengelig for alle og oppdateres jevnlig.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">2. Ved ulykke eller akutt sykdom</h3>
                  <ol className="list-decimal list-inside space-y-2 text-slate-700 ml-4">
                    <li><strong>Vurder situasjonen</strong> - Sikre området og unngå ytterligere fare</li>
                    <li><strong>Varsle</strong> - Ring 113 ved livstruende situasjoner eller 116 117 ved mindre alvorlige tilfeller</li>
                    <li><strong>Gi førstehjelp</strong> - Ytt nødvendig førstehjelp inntil profesjonell hjelp kommer</li>
                    <li><strong>Varsle leder</strong> - Informer daglig leder eller nærmeste leder umiddelbart</li>
                    <li><strong>Dokumenter</strong> - Registrer hendelsen i HMS-systemet</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">3. Viktige telefonnumre</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border-2 border-slate-200">
                      <strong className="text-red-600">Nødnummer:</strong>
                      <ul className="mt-2 space-y-1 text-slate-700">
                        <li>• Akutt (AMK): <strong>113</strong></li>
                        <li>• Brann: <strong>110</strong></li>
                        <li>• Politi: <strong>112</strong></li>
                        <li>• Legevakt: <strong>116 117</strong></li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-2 border-slate-200">
                      <strong className="text-blue-600">Interne kontakter:</strong>
                      <ul className="mt-2 space-y-1 text-slate-700">
                        {responsible && (
                          <>
                            <li>• Førstehjelpsansvarlig: <strong>{responsible.name}</strong></li>
                            <li>• Telefon: <strong>{responsible.phone}</strong></li>
                          </>
                        )}
                        <li>• Daglig leder: <strong>Gourg Mounir Brsoum</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">4. Lokalisering av førstehjelp</h3>
                  <p className="text-slate-700 mb-3">
                    Førstehjelpskoffer og utstyr skal være tilgjengelig og merket med grønt kors.
                  </p>
                  <ul className="space-y-2 text-slate-700 ml-4">
                    {equipment.map((item, index) => (
                      item.location && (
                        <li key={index}>• <strong>{item.equipment_name}:</strong> {item.location}</li>
                      )
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">5. Kontroll og vedlikehold</h3>
                  <ul className="space-y-2 text-slate-700 ml-4">
                    <li>• Ukentlig kontroll av førstehjelpskoffer</li>
                    <li>• Månedlig kontroll av alt utstyr og utløpsdatoer</li>
                    <li>• Umiddelbar utskiftning av brukte/utløpte artikler</li>
                    <li>• Årlig gjennomgang av førstehjelpsplan</li>
                  </ul>
                </div>

                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2">Viktig informasjon</h4>
                      <p className="text-sm text-slate-700">
                        Alle ansatte skal gjøres kjent med førstehjelpsplanen ved oppstart og ved revisjoner.
                        Førstehjelpsopplæring skal gis til minimum én person i virksomheten.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'responsible' && (
          <div className="space-y-6">
            {!editingResponsible && responsible ? (
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border-2 border-red-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <User className="w-8 h-8 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-slate-900 mb-1">{responsible.name}</h2>
                      <p className="text-red-700 font-medium">{responsible.department}</p>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium border-2 mt-3 ${getStatusColor(responsible.status)}`}>
                        {responsible.status === 'Gyldig' && <CheckCircle className="w-4 h-4" />}
                        {responsible.status !== 'Gyldig' && <AlertCircle className="w-4 h-4" />}
                        {responsible.status}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingResponsible(true)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-4 h-4 text-red-600" />
                    <span>{responsible.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-red-600" />
                    <span>{responsible.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-4 h-4 text-red-600" />
                    <span>Siste kurs: {new Date(responsible.last_course_date).toLocaleDateString('nb-NO')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-4 h-4 text-red-600" />
                    <span>Gyldig til: {new Date(responsible.certificate_valid_until).toLocaleDateString('nb-NO')}</span>
                  </div>
                </div>

                {responsible.certificate_url && (
                  <div className="mt-4">
                    <a
                      href={responsible.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <FileText className="w-4 h-4" />
                      Se kursbevis
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-6 border-2 border-red-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  {responsible ? 'Rediger ansvarlig' : 'Registrer ansvarlig'}
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Navn *
                    </label>
                    <input
                      type="text"
                      value={responsibleForm.name}
                      onChange={(e) => setResponsibleForm({ ...responsibleForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Fullt navn"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Building2 className="w-4 h-4 inline mr-2" />
                      Avdeling *
                    </label>
                    <input
                      type="text"
                      value={responsibleForm.department}
                      onChange={(e) => setResponsibleForm({ ...responsibleForm, department: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Avdeling"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      E-post
                    </label>
                    <input
                      type="email"
                      value={responsibleForm.email}
                      onChange={(e) => setResponsibleForm({ ...responsibleForm, email: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="epost@eksempel.no"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={responsibleForm.phone}
                      onChange={(e) => setResponsibleForm({ ...responsibleForm, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="+47 XXX XX XXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Siste kursdato
                    </label>
                    <input
                      type="date"
                      value={responsibleForm.last_course_date}
                      onChange={(e) => setResponsibleForm({ ...responsibleForm, last_course_date: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Gyldig til
                    </label>
                    <input
                      type="date"
                      value={responsibleForm.certificate_valid_until}
                      onChange={(e) => setResponsibleForm({ ...responsibleForm, certificate_valid_until: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Kursbevis URL
                    </label>
                    <input
                      type="url"
                      value={responsibleForm.certificate_url}
                      onChange={(e) => setResponsibleForm({ ...responsibleForm, certificate_url: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Status
                    </label>
                    <select
                      value={responsibleForm.status}
                      onChange={(e) => setResponsibleForm({ ...responsibleForm, status: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="Gyldig">Gyldig</option>
                      <option value="Utløper snart">Utløper snart</option>
                      <option value="Utløpt">Utløpt</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSaveResponsible}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Lagre
                  </button>
                  <button
                    onClick={() => setEditingResponsible(false)}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            )}

            {!responsible && !editingResponsible && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
                <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Ingen ansvarlig registrert</h3>
                <p className="text-slate-600 mb-4">
                  Registrer førstehjelpsansvarlig for virksomheten
                </p>
                <button
                  onClick={() => setEditingResponsible(true)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Registrer ansvarlig
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'equipment' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Førstehjelpsutstyr</h2>
              <button
                onClick={() => {
                  setEquipmentForm({
                    equipment_name: '',
                    quantity: 0,
                    condition: 'OK',
                    notes: '',
                    last_check_date: '',
                    checked_by: '',
                    image_url: '',
                    location: '',
                  });
                  setEditingEquipmentId(null);
                  setShowAddEquipment(true);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Legg til utstyr
              </button>
            </div>

            {showAddEquipment && (
              <div className="bg-slate-50 rounded-xl p-6 border-2 border-red-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingEquipmentId ? 'Rediger utstyr' : 'Nytt utstyr'}
                  </h3>
                  <button
                    onClick={() => setShowAddEquipment(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Package className="w-4 h-4 inline mr-2" />
                      Utstyrsnavn *
                    </label>
                    <input
                      type="text"
                      value={equipmentForm.equipment_name}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, equipment_name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="F.eks. Bandasjer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Antall
                    </label>
                    <input
                      type="number"
                      value={equipmentForm.quantity}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, quantity: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tilstand
                    </label>
                    <select
                      value={equipmentForm.condition}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, condition: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="OK">OK</option>
                      <option value="Trenger utskiftning">Trenger utskiftning</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Plassering
                    </label>
                    <input
                      type="text"
                      value={equipmentForm.location}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, location: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="F.eks. Kjøkken, ved inngang"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Siste kontroll
                    </label>
                    <input
                      type="date"
                      value={equipmentForm.last_check_date}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, last_check_date: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Kontrollert av
                    </label>
                    <input
                      type="text"
                      value={equipmentForm.checked_by}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, checked_by: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Navn"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <ImageIcon className="w-4 h-4 inline mr-2" />
                      Bilde URL
                    </label>
                    <input
                      type="url"
                      value={equipmentForm.image_url}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, image_url: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Notater
                    </label>
                    <textarea
                      value={equipmentForm.notes}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      rows={2}
                      placeholder="Tilleggsnotater..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSaveEquipment}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Lagre
                  </button>
                  <button
                    onClick={() => setShowAddEquipment(false)}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            )}

            {equipment.length === 0 ? (
              <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-12 text-center">
                <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Ingen utstyr registrert</h3>
                <p className="text-slate-600">Legg til førstehjelpsutstyr for å holde oversikt</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b-2 border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-slate-900">Utstyr</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-slate-900">Antall</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-slate-900">Tilstand</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-slate-900">Plassering</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-slate-900">Siste kontroll</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-slate-900">Kontrollert av</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-slate-900">Handlinger</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {equipment.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {item.image_url && (
                              <img
                                src={item.image_url}
                                alt={item.equipment_name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium text-slate-900">{item.equipment_name}</div>
                              {item.notes && (
                                <div className="text-xs text-slate-500">{item.notes}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{item.quantity}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-lg ${
                              item.condition === 'OK'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-orange-50 text-orange-700 border border-orange-200'
                            }`}
                          >
                            {item.condition}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{item.location}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {item.last_check_date
                            ? new Date(item.last_check_date).toLocaleDateString('nb-NO')
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{item.checked_by || '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleEditEquipment(item)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => item.id && handleDeleteEquipment(item.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'inspections' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Kontrollrutiner</h2>
              <button
                onClick={() => setShowAddInspection(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ny kontroll
              </button>
            </div>

            {showAddInspection && (
              <div className="bg-slate-50 rounded-xl p-6 border-2 border-red-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Ny kontroll</h3>
                  <button
                    onClick={() => setShowAddInspection(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Dato *
                    </label>
                    <input
                      type="date"
                      value={inspectionForm.inspection_date}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, inspection_date: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Type *
                    </label>
                    <select
                      value={inspectionForm.inspection_type}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, inspection_type: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="Ukentlig">Ukentlig</option>
                      <option value="Månedlig">Månedlig</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Kontrollert av *
                    </label>
                    <input
                      type="text"
                      value={inspectionForm.inspected_by}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, inspected_by: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Navn"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Status
                    </label>
                    <select
                      value={inspectionForm.status}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, status: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="OK">OK</option>
                      <option value="Mangler">Mangler</option>
                      <option value="Kritisk">Kritisk</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Mangler
                    </label>
                    <input
                      type="text"
                      value={inspectionForm.missing_items}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, missing_items: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Hva mangler?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Utskiftede artikler
                    </label>
                    <input
                      type="text"
                      value={inspectionForm.replaced_items}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, replaced_items: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Hva ble skiftet?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <ImageIcon className="w-4 h-4 inline mr-2" />
                      Bilde URL
                    </label>
                    <input
                      type="url"
                      value={inspectionForm.image_url}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, image_url: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Kommentarer
                    </label>
                    <textarea
                      value={inspectionForm.comments}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, comments: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      rows={3}
                      placeholder="Kommentarer..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSaveInspection}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Lagre
                  </button>
                  <button
                    onClick={() => setShowAddInspection(false)}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            )}

            {inspections.length === 0 ? (
              <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-12 text-center">
                <CheckCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Ingen kontroller registrert</h3>
                <p className="text-slate-600">Legg til kontroller for å holde oversikt</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inspections.map((inspection) => (
                  <div
                    key={inspection.id}
                    className="bg-white border-2 border-slate-200 rounded-xl p-5 hover:border-red-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">
                              {inspection.inspection_type} kontroll
                            </h3>
                            <p className="text-sm text-slate-600">
                              {new Date(inspection.inspection_date).toLocaleDateString('nb-NO')} - {inspection.inspected_by}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex px-3 py-1 text-xs font-medium rounded-lg ${
                            inspection.status === 'OK'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : inspection.status === 'Mangler'
                              ? 'bg-orange-50 text-orange-700 border border-orange-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {inspection.status}
                        </span>
                      </div>

                      <button
                        onClick={() => inspection.id && handleDeleteInspection(inspection.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      {inspection.missing_items && (
                        <div>
                          <span className="text-slate-500">Mangler:</span>
                          <span className="ml-2 font-medium text-slate-900">{inspection.missing_items}</span>
                        </div>
                      )}
                      {inspection.replaced_items && (
                        <div>
                          <span className="text-slate-500">Utskiftet:</span>
                          <span className="ml-2 font-medium text-slate-900">{inspection.replaced_items}</span>
                        </div>
                      )}
                    </div>

                    {inspection.comments && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-sm text-slate-600">{inspection.comments}</p>
                      </div>
                    )}

                    {inspection.image_url && (
                      <div className="mt-4">
                        <img
                          src={inspection.image_url}
                          alt="Inspection"
                          className="max-w-xs rounded-lg border-2 border-slate-200"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
