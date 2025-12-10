import { useState, useEffect } from 'react';
import { Flame, Plus, Edit2, Trash2, Save, X, Download, AlertTriangle, CheckCircle, Upload, FileText, MapPin, Calendar } from 'lucide-react';
import { hmsApi } from '../../lib/hmsSupabase';
import { generateFireSafetyPDF } from '../../utils/hmsPdfGenerator';
import { AssistantPanel } from './AssistantPanel';

interface FireResponsible {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  last_course_date: string | null;
  course_certificate_url: string | null;
  notes: string | null;
}

interface FireEquipment {
  id: string;
  equipment_type: string;
  location: string;
  description: string | null;
  installation_date: string | null;
  last_service_date: string | null;
  next_service_date: string | null;
  status: string;
  serial_number: string | null;
  notes: string | null;
}

interface FireInspection {
  id: string;
  inspection_type: string;
  inspection_date: string;
  performed_by: string;
  status: string;
  notes: string | null;
  checklist_items: any;
  external_company: string | null;
  report_url: string | null;
}

interface FireDocument {
  id: string;
  document_type: string;
  document_name: string;
  document_url: string;
  document_date: string;
  performed_by: string | null;
  notes: string | null;
}

interface FireInstruction {
  id: string;
  title: string;
  content: string;
  order_number: number;
}

interface FireDeviation {
  id: string;
  equipment_id: string | null;
  deviation_type: string;
  description: string;
  severity: string | null;
  corrective_action: string | null;
  responsible_person: string | null;
  deadline: string | null;
  status: string;
  completed_date: string | null;
  notes: string | null;
}

export function FireSafety() {
  const [activeTab, setActiveTab] = useState<'overview' | 'equipment' | 'inspections' | 'documents' | 'instructions' | 'deviations'>('overview');
  const [loading, setLoading] = useState(true);

  const [fireResponsible, setFireResponsible] = useState<FireResponsible | null>(null);
  const [equipment, setEquipment] = useState<FireEquipment[]>([]);
  const [inspections, setInspections] = useState<FireInspection[]>([]);
  const [documents, setDocuments] = useState<FireDocument[]>([]);
  const [instructions, setInstructions] = useState<FireInstruction[]>([]);
  const [deviations, setDeviations] = useState<FireDeviation[]>([]);

  const [isEditingResponsible, setIsEditingResponsible] = useState(false);
  const [isAddingEquipment, setIsAddingEquipment] = useState(false);
  const [isAddingInspection, setIsAddingInspection] = useState(false);
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [isAddingDeviation, setIsAddingDeviation] = useState(false);

  const [editingEquipmentId, setEditingEquipmentId] = useState<string | null>(null);
  const [editingInspectionId, setEditingInspectionId] = useState<string | null>(null);
  const [editingDeviationId, setEditingDeviationId] = useState<string | null>(null);

  const [responsibleForm, setResponsibleForm] = useState({
    name: '',
    phone: '',
    email: '',
    last_course_date: '',
    notes: ''
  });

  const [equipmentForm, setEquipmentForm] = useState({
    equipment_type: 'Brannslukker',
    location: '',
    description: '',
    installation_date: '',
    status: 'OK',
    serial_number: '',
    notes: ''
  });

  const [inspectionForm, setInspectionForm] = useState({
    inspection_type: 'Ukentlig',
    inspection_date: new Date().toISOString().split('T')[0],
    performed_by: '',
    status: 'OK',
    notes: '',
    external_company: ''
  });

  const defaultChecklistItems = [
    { name: 'Brannslukkere er på plass', status: 'OK' },
    { name: 'Trykkindikator i grønn sone', status: 'OK' },
    { name: 'Brannteppe er tilgjengelig', status: 'OK' },
    { name: 'Rømningsveier er åpne og fri', status: 'OK' },
    { name: 'Dører er ikke låst med nøkkel', status: 'OK' },
    { name: 'Nødlys fungerer', status: 'OK' },
    { name: 'Brannalarm fungerer ved test', status: 'OK' },
    { name: 'Kjøkkenavtrekk er rent og ikke tett', status: 'OK' },
    { name: 'Fettfilter er rengjort', status: 'OK' },
    { name: 'Ingen blottlagte elektriske ledninger', status: 'OK' },
    { name: 'Steking/olje under oppsyn', status: 'OK' },
    { name: 'Alle ansatte kjenner branninstruks', status: 'OK' }
  ];

  const [checklistItems, setChecklistItems] = useState(defaultChecklistItems);

  const [documentForm, setDocumentForm] = useState({
    document_type: 'Service-rapport brannslukker',
    document_name: '',
    document_url: '',
    document_date: new Date().toISOString().split('T')[0],
    performed_by: '',
    notes: ''
  });

  const [deviationForm, setDeviationForm] = useState({
    equipment_id: '',
    deviation_type: '',
    description: '',
    severity: 'Middels',
    corrective_action: '',
    responsible_person: '',
    deadline: '',
    status: 'Åpen'
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [resp, equip, insp, docs, instr, dev] = await Promise.all([
        hmsApi.getFireResponsible(),
        hmsApi.getFireEquipment(),
        hmsApi.getFireInspections(),
        hmsApi.getFireDocuments(),
        hmsApi.getFireInstructions(),
        hmsApi.getFireDeviations()
      ]);

      setFireResponsible(resp || null);
      setEquipment(equip || []);
      setInspections(insp || []);
      setDocuments(docs || []);
      setInstructions(instr || []);
      setDeviations(dev || []);
    } catch (error) {
      console.error('Error loading fire safety data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveResponsible = async () => {
    try {
      if (fireResponsible && fireResponsible.id) {
        await hmsApi.updateFireResponsible(fireResponsible.id, responsibleForm);
      }
      setIsEditingResponsible(false);
      await loadAllData();
    } catch (error) {
      console.error('Error saving responsible:', error);
      alert('Kunne ikke lagre brannansvarlig');
    }
  };

  const saveEquipment = async () => {
    try {
      if (editingEquipmentId) {
        await hmsApi.updateFireEquipment(editingEquipmentId, equipmentForm);
      } else {
        await hmsApi.createFireEquipment(equipmentForm);
      }
      setIsAddingEquipment(false);
      setEditingEquipmentId(null);
      setEquipmentForm({
        equipment_type: 'Brannslukker',
        location: '',
        description: '',
        installation_date: '',
        status: 'OK',
        serial_number: '',
        notes: ''
      });
      await loadAllData();
    } catch (error) {
      console.error('Error saving equipment:', error);
      alert('Kunne ikke lagre utstyr');
    }
  };

  const deleteEquipment = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette dette utstyret?')) return;
    try {
      await hmsApi.deleteFireEquipment(id);
      await loadAllData();
    } catch (error) {
      console.error('Error deleting equipment:', error);
    }
  };

  const saveInspection = async () => {
    try {
      const inspectionData = {
        ...inspectionForm,
        checklist_items: { items: checklistItems }
      };

      if (editingInspectionId) {
        await hmsApi.updateFireInspection(editingInspectionId, inspectionData);
      } else {
        await hmsApi.createFireInspection(inspectionData);
      }
      setIsAddingInspection(false);
      setEditingInspectionId(null);
      setInspectionForm({
        inspection_type: 'Ukentlig',
        inspection_date: new Date().toISOString().split('T')[0],
        performed_by: '',
        status: 'OK',
        notes: '',
        external_company: ''
      });
      setChecklistItems(defaultChecklistItems);
      await loadAllData();
    } catch (error) {
      console.error('Error saving inspection:', error);
      alert('Kunne ikke lagre sjekkliste');
    }
  };

  const deleteInspection = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne sjekklisten?')) return;
    try {
      await hmsApi.deleteFireInspection(id);
      await loadAllData();
    } catch (error) {
      console.error('Error deleting inspection:', error);
    }
  };

  const saveDocument = async () => {
    try {
      await hmsApi.createFireDocument(documentForm);
      setIsAddingDocument(false);
      setDocumentForm({
        document_type: 'Service-rapport brannslukker',
        document_name: '',
        document_url: '',
        document_date: new Date().toISOString().split('T')[0],
        performed_by: '',
        notes: ''
      });
      await loadAllData();
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Kunne ikke lagre dokument');
    }
  };

  const deleteDocument = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette dette dokumentet?')) return;
    try {
      await hmsApi.deleteFireDocument(id);
      await loadAllData();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const saveDeviation = async () => {
    try {
      const formData = {
        ...deviationForm,
        equipment_id: deviationForm.equipment_id || null,
        deadline: deviationForm.deadline || null
      };

      if (editingDeviationId) {
        await hmsApi.updateFireDeviation(editingDeviationId, formData);
      } else {
        await hmsApi.createFireDeviation(formData);
      }
      setIsAddingDeviation(false);
      setEditingDeviationId(null);
      setDeviationForm({
        equipment_id: '',
        deviation_type: '',
        description: '',
        severity: 'Middels',
        corrective_action: '',
        responsible_person: '',
        deadline: '',
        status: 'Åpen'
      });
      await loadAllData();
    } catch (error) {
      console.error('Error saving deviation:', error);
      alert('Kunne ikke lagre avvik');
    }
  };

  const deleteDeviation = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette dette avviket?')) return;
    try {
      await hmsApi.deleteFireDeviation(id);
      await loadAllData();
    } catch (error) {
      console.error('Error deleting deviation:', error);
    }
  };

  const startEditingResponsible = () => {
    if (fireResponsible) {
      setResponsibleForm({
        name: fireResponsible.name,
        phone: fireResponsible.phone || '',
        email: fireResponsible.email || '',
        last_course_date: fireResponsible.last_course_date || '',
        notes: fireResponsible.notes || ''
      });
      setIsEditingResponsible(true);
    }
  };

  const startEditingEquipment = (equip: FireEquipment) => {
    setEditingEquipmentId(equip.id);
    setEquipmentForm({
      equipment_type: equip.equipment_type,
      location: equip.location,
      description: equip.description || '',
      installation_date: equip.installation_date || '',
      status: equip.status,
      serial_number: equip.serial_number || '',
      notes: equip.notes || ''
    });
    setIsAddingEquipment(true);
  };

  const startEditingInspection = (insp: FireInspection) => {
    setEditingInspectionId(insp.id);
    setInspectionForm({
      inspection_type: insp.inspection_type,
      inspection_date: insp.inspection_date,
      performed_by: insp.performed_by,
      status: insp.status,
      notes: insp.notes || '',
      external_company: insp.external_company || ''
    });
    if (insp.checklist_items && insp.checklist_items.items) {
      setChecklistItems(insp.checklist_items.items);
    } else {
      setChecklistItems(defaultChecklistItems);
    }
    setIsAddingInspection(true);
  };

  const updateChecklistItem = (index: number, status: string) => {
    const newItems = [...checklistItems];
    newItems[index].status = status;
    setChecklistItems(newItems);

    const hasNonOK = newItems.some(item => item.status !== 'OK');
    setInspectionForm({ ...inspectionForm, status: hasNonOK ? 'Ikke OK' : 'OK' });
  };

  const startEditingDeviation = (dev: FireDeviation) => {
    setEditingDeviationId(dev.id);
    setDeviationForm({
      equipment_id: dev.equipment_id || '',
      deviation_type: dev.deviation_type,
      description: dev.description,
      severity: dev.severity || 'Middels',
      corrective_action: dev.corrective_action || '',
      responsible_person: dev.responsible_person || '',
      deadline: dev.deadline || '',
      status: dev.status
    });
    setIsAddingDeviation(true);
  };

  const generatePDF = () => {
    generateFireSafetyPDF({
      responsible: fireResponsible,
      equipment,
      inspections
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'bg-green-100 text-green-800';
      case 'Ikke OK': return 'bg-red-100 text-red-800';
      case 'Trenger service': return 'bg-yellow-100 text-yellow-800';
      case 'Defekt': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeviationStatusColor = (status: string) => {
    switch (status) {
      case 'Åpen': return 'bg-red-100 text-red-800';
      case 'Under arbeid': return 'bg-yellow-100 text-yellow-800';
      case 'Ferdig': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExecuteActions = () => {
    const actions = [];

    if (equipment.length === 0) {
      actions.push({
        action: 'create-fire-equipment',
        label: 'Opprett slokkeutstyr',
        data: { equipment_type: 'Brannslukker' }
      });
    }

    return actions;
  };

  if (loading) {
    return <div className="text-center py-8">Laster...</div>;
  }

  return (
    <div className="space-y-6">
      <AssistantPanel
        seksjon="brann"
        data={{
          slokkeutstyr: equipment,
          rømningsveier: instructions,
          nestekontroll: inspections.length > 0 ? inspections[0].inspection_date : null,
          opplaeringStatus: fireResponsible?.last_course_date ? 'ok' : 'mangler'
        }}
        executeActions={getExecuteActions()}
        onExecuteSuccess={() => {
          loadAllData();
        }}
      />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Flame className="text-red-600" />
            Brannsikkerhet
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Håndtering av brannsikkerhet og brannvernsutstyr
          </p>
        </div>
        <button
          onClick={generatePDF}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          <Download className="w-4 h-4" />
          Last ned PDF
        </button>
      </div>

      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'overview', label: 'Oversikt' },
          { id: 'equipment', label: 'Utstyr' },
          { id: 'inspections', label: 'Sjekkliste' },
          { id: 'documents', label: 'Dokumenter' },
          { id: 'instructions', label: 'Branninstruks' },
          { id: 'deviations', label: 'Avvik' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Brannansvarlig</h3>
              <button
                onClick={startEditingResponsible}
                className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
                Rediger
              </button>
            </div>

            {isEditingResponsible ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Navn *</label>
                    <input
                      type="text"
                      value={responsibleForm.name}
                      onChange={(e) => setResponsibleForm({ ...responsibleForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                    <input
                      type="tel"
                      value={responsibleForm.phone}
                      onChange={(e) => setResponsibleForm({ ...responsibleForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
                    <input
                      type="email"
                      value={responsibleForm.email}
                      onChange={(e) => setResponsibleForm({ ...responsibleForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Siste kursdato</label>
                    <input
                      type="date"
                      value={responsibleForm.last_course_date}
                      onChange={(e) => setResponsibleForm({ ...responsibleForm, last_course_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notater</label>
                  <textarea
                    value={responsibleForm.notes}
                    onChange={(e) => setResponsibleForm({ ...responsibleForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingResponsible(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={saveResponsible}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    Lagre
                  </button>
                </div>
              </div>
            ) : fireResponsible ? (
              <div className="space-y-2">
                <p><strong>Navn:</strong> {fireResponsible.name}</p>
                {fireResponsible.phone && <p><strong>Telefon:</strong> {fireResponsible.phone}</p>}
                {fireResponsible.email && <p><strong>E-post:</strong> {fireResponsible.email}</p>}
                {fireResponsible.last_course_date && (
                  <p><strong>Siste kurs:</strong> {new Date(fireResponsible.last_course_date).toLocaleDateString('nb-NO')}</p>
                )}
                {fireResponsible.notes && <p><strong>Notater:</strong> {fireResponsible.notes}</p>}
              </div>
            ) : null}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Brannslukningsutstyr - Oversikt</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipment.map((eq) => (
                <div key={eq.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{eq.equipment_type}</h4>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {eq.location}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(eq.status)}`}>
                      {eq.status}
                    </span>
                  </div>
                  {eq.description && <p className="text-sm text-gray-600 mt-2">{eq.description}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Siste sjekklister</h3>
            <div className="space-y-3">
              {inspections.slice(0, 5).map((insp) => (
                <div key={insp.id} className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <div>
                    <div className="font-medium">{insp.inspection_type}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(insp.inspection_date).toLocaleDateString('nb-NO')} - {insp.performed_by}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(insp.status)}`}>
                    {insp.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'equipment' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Brannslukningsutstyr</h3>
            <button
              onClick={() => setIsAddingEquipment(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Legg til utstyr
            </button>
          </div>

          {isAddingEquipment && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">{editingEquipmentId ? 'Rediger utstyr' : 'Nytt utstyr'}</h4>
                <button
                  onClick={() => {
                    setIsAddingEquipment(false);
                    setEditingEquipmentId(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type utstyr *</label>
                    <select
                      value={equipmentForm.equipment_type}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, equipment_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Brannslukker">Brannslukker</option>
                      <option value="Brannteppe">Brannteppe</option>
                      <option value="Brannalarm">Brannalarm</option>
                      <option value="Nødlys">Nødlys</option>
                      <option value="Røykvarsler">Røykvarsler</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plassering *</label>
                    <input
                      type="text"
                      value={equipmentForm.location}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="F.eks. Kjøkken - ved hovedinngang"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse</label>
                  <input
                    type="text"
                    value={equipmentForm.description}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="F.eks. 6kg pulverslukker"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Installeringsdato</label>
                    <input
                      type="date"
                      value={equipmentForm.installation_date}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, installation_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={equipmentForm.status}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="OK">OK</option>
                      <option value="Trenger service">Trenger service</option>
                      <option value="Defekt">Defekt</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Serienummer</label>
                    <input
                      type="text"
                      value={equipmentForm.serial_number}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, serial_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notater</label>
                  <textarea
                    value={equipmentForm.notes}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsAddingEquipment(false);
                      setEditingEquipmentId(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={saveEquipment}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    Lagre
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {equipment.map((eq) => (
              <div key={eq.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold">{eq.equipment_type}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(eq.status)}`}>
                        {eq.status}
                      </span>
                    </div>
                    <p className="text-gray-600 flex items-center gap-1 mb-2">
                      <MapPin className="w-4 h-4" />
                      {eq.location}
                    </p>
                    {eq.description && <p className="text-gray-700 mb-2">{eq.description}</p>}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {eq.installation_date && (
                        <span>Installert: {new Date(eq.installation_date).toLocaleDateString('nb-NO')}</span>
                      )}
                      {eq.serial_number && <span>S/N: {eq.serial_number}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditingEquipment(eq)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteEquipment(eq.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'inspections' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Sjekklister</h3>
            <button
              onClick={() => setIsAddingInspection(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Ny sjekkliste
            </button>
          </div>

          {isAddingInspection && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">{editingInspectionId ? 'Rediger sjekkliste' : 'Ny sjekkliste'}</h4>
                <button
                  onClick={() => {
                    setIsAddingInspection(false);
                    setEditingInspectionId(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type sjekkliste *</label>
                    <select
                      value={inspectionForm.inspection_type}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, inspection_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Ukentlig">Ukentlig</option>
                      <option value="Månedlig">Månedlig</option>
                      <option value="Årlig">Årlig</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dato *</label>
                    <input
                      type="date"
                      value={inspectionForm.inspection_date}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, inspection_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Utført av *</label>
                    <input
                      type="text"
                      value={inspectionForm.performed_by}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, performed_by: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select
                      value={inspectionForm.status}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="OK">OK</option>
                      <option value="Ikke OK">Ikke OK</option>
                    </select>
                  </div>
                </div>

                {inspectionForm.inspection_type === 'Årlig' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Eksternt firma</label>
                    <input
                      type="text"
                      value={inspectionForm.external_company}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, external_company: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Navn på firma som utførte sjekklisten"
                    />
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-semibold text-gray-900">Sjekkliste</h5>
                    <button
                      type="button"
                      onClick={() => setChecklistItems(defaultChecklistItems)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Tilbakestill alle til OK
                    </button>
                  </div>
                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                    {checklistItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                        <span className="text-sm text-gray-700">{item.name}</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => updateChecklistItem(index, 'OK')}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              item.status === 'OK'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            ✓ OK
                          </button>
                          <button
                            type="button"
                            onClick={() => updateChecklistItem(index, 'Ikke OK')}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              item.status === 'Ikke OK'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            ✗ Ikke OK
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kommentarer</label>
                  <textarea
                    value={inspectionForm.notes}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Eventuelle kommentarer eller tilleggsinformasjon..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsAddingInspection(false);
                      setEditingInspectionId(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={saveInspection}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    Lagre
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {inspections.map((insp) => (
              <div key={insp.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold">{insp.inspection_type}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(insp.status)}`}>
                        {insp.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(insp.inspection_date).toLocaleDateString('nb-NO')}
                      </span>
                      <span>Utført av: {insp.performed_by}</span>
                    </div>
                    {insp.external_company && (
                      <p className="text-sm text-gray-600 mb-2">Firma: {insp.external_company}</p>
                    )}

                    {insp.checklist_items && insp.checklist_items.items && (
                      <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                        <h6 className="text-xs font-semibold text-gray-700 mb-2">Sjekkliste:</h6>
                        <div className="grid grid-cols-2 gap-2">
                          {insp.checklist_items.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">{item.name}</span>
                              <span className={`px-2 py-0.5 rounded-full font-medium ${
                                item.status === 'OK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {insp.notes && <p className="text-gray-700 mt-2">{insp.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditingInspection(insp)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteInspection(insp.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Dokumentasjon</h3>
            <button
              onClick={() => setIsAddingDocument(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Last opp dokument
            </button>
          </div>

          {isAddingDocument && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Nytt dokument</h4>
                <button onClick={() => setIsAddingDocument(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type dokument *</label>
                  <select
                    value={documentForm.document_type}
                    onChange={(e) => setDocumentForm({ ...documentForm, document_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Service-rapport brannslukker">Service-rapport brannslukker</option>
                    <option value="Test brannalarm">Test brannalarm</option>
                    <option value="Rengjøring avtrekk">Rengjøring avtrekk</option>
                    <option value="NORVA-rapport">NORVA-rapport</option>
                    <option value="Annet">Annet</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dokumentnavn *</label>
                    <input
                      type="text"
                      value={documentForm.document_name}
                      onChange={(e) => setDocumentForm({ ...documentForm, document_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="F.eks. Service-rapport 2024"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dato *</label>
                    <input
                      type="date"
                      value={documentForm.document_date}
                      onChange={(e) => setDocumentForm({ ...documentForm, document_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dokument URL *</label>
                  <input
                    type="text"
                    value={documentForm.document_url}
                    onChange={(e) => setDocumentForm({ ...documentForm, document_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="URL til dokument (f.eks. fra Google Drive eller annen lagringstjeneste)"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Last opp dokumentet til en sky-tjeneste og lim inn lenken her
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Utført av</label>
                  <input
                    type="text"
                    value={documentForm.performed_by}
                    onChange={(e) => setDocumentForm({ ...documentForm, performed_by: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Person eller firma"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notater</label>
                  <textarea
                    value={documentForm.notes}
                    onChange={(e) => setDocumentForm({ ...documentForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsAddingDocument(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={saveDocument}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    Lagre
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h4 className="text-lg font-semibold">{doc.document_name}</h4>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {doc.document_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span>{new Date(doc.document_date).toLocaleDateString('nb-NO')}</span>
                      {doc.performed_by && <span>Utført av: {doc.performed_by}</span>}
                    </div>
                    {doc.notes && <p className="text-gray-700 mb-2">{doc.notes}</p>}
                    <a
                      href={doc.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Åpne dokument →
                    </a>
                  </div>
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'instructions' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Branninstruks</h3>

          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-6 h-6 text-red-600" />
              <h4 className="text-xl font-bold text-red-900">RUTINER VED BRANN</h4>
            </div>

            <div className="space-y-6">
              {instructions.map((instr) => (
                <div key={instr.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <h5 className="font-bold text-lg text-gray-900 mb-2">{instr.title}</h5>
                  <div className="text-gray-700 whitespace-pre-line">{instr.content}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-semibold text-yellow-900">
                Viktig: Alle ansatte må kjenne til branninstruksen og vite hvor brannslukningsutstyr er plassert!
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'deviations' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Avvik relatert til brannsikkerhet</h3>
            <button
              onClick={() => setIsAddingDeviation(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Registrer avvik
            </button>
          </div>

          {isAddingDeviation && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">{editingDeviationId ? 'Rediger avvik' : 'Nytt avvik'}</h4>
                <button
                  onClick={() => {
                    setIsAddingDeviation(false);
                    setEditingDeviationId(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type avvik *</label>
                    <input
                      type="text"
                      value={deviationForm.deviation_type}
                      onChange={(e) => setDeviationForm({ ...deviationForm, deviation_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="F.eks. Defekt brannslukker"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alvorlighetsgrad</label>
                    <select
                      value={deviationForm.severity}
                      onChange={(e) => setDeviationForm({ ...deviationForm, severity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Lav">Lav</option>
                      <option value="Middels">Middels</option>
                      <option value="Høy">Høy</option>
                      <option value="Kritisk">Kritisk</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse *</label>
                  <textarea
                    value={deviationForm.description}
                    onChange={(e) => setDeviationForm({ ...deviationForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Beskriv avviket..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Korrigerende tiltak</label>
                  <textarea
                    value={deviationForm.corrective_action}
                    onChange={(e) => setDeviationForm({ ...deviationForm, corrective_action: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Hva skal gjøres?"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ansvarlig</label>
                    <input
                      type="text"
                      value={deviationForm.responsible_person}
                      onChange={(e) => setDeviationForm({ ...deviationForm, responsible_person: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frist</label>
                    <input
                      type="date"
                      value={deviationForm.deadline}
                      onChange={(e) => setDeviationForm({ ...deviationForm, deadline: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={deviationForm.status}
                      onChange={(e) => setDeviationForm({ ...deviationForm, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Åpen">Åpen</option>
                      <option value="Under arbeid">Under arbeid</option>
                      <option value="Ferdig">Ferdig</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsAddingDeviation(false);
                      setEditingDeviationId(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={saveDeviation}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    Lagre
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {deviations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Ingen avvik registrert</p>
              </div>
            ) : (
              deviations.map((dev) => (
                <div key={dev.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold">{dev.deviation_type}</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDeviationStatusColor(dev.status)}`}>
                          {dev.status}
                        </span>
                        {dev.severity && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            dev.severity === 'Kritisk' ? 'bg-red-100 text-red-800' :
                            dev.severity === 'Høy' ? 'bg-orange-100 text-orange-800' :
                            dev.severity === 'Middels' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {dev.severity}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-3">{dev.description}</p>
                      {dev.corrective_action && (
                        <div className="bg-blue-50 p-3 rounded-lg mb-3">
                          <p className="text-sm font-medium text-blue-900 mb-1">Korrigerende tiltak:</p>
                          <p className="text-blue-800">{dev.corrective_action}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {dev.responsible_person && <span>Ansvarlig: {dev.responsible_person}</span>}
                        {dev.deadline && <span>Frist: {new Date(dev.deadline).toLocaleDateString('nb-NO')}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditingDeviation(dev)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteDeviation(dev.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
