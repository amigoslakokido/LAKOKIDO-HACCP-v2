import { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Edit2, Trash2, Save, X, Calendar, User, FileText, Image as ImageIcon, Download } from 'lucide-react';
import { hmsApi } from '../../lib/hmsSupabase';
import { generateRiskAssessmentPDF } from '../../utils/hmsPdfGenerator';
import { AssistantPanel } from './AssistantPanel';

interface RiskAssessment {
  id: string;
  hazard_type: string;
  hazard_description: string;
  likelihood: number;
  consequence: number;
  risk_score: number;
  risk_level: string;
  preventive_measures: string;
  responsible_person: string;
  deadline: string | null;
  status: string;
  image_before_url: string | null;
  image_after_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  last_reviewed_date: string | null;
}

export function RiskAssessment() {
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'matrix'>('list');

  const [formData, setFormData] = useState({
    hazard_type: '',
    hazard_description: '',
    likelihood: 3,
    consequence: 3,
    preventive_measures: '',
    responsible_person: '',
    deadline: '',
    status: 'Åpen',
    notes: ''
  });

  useEffect(() => {
    loadRisks();
  }, []);

  const loadRisks = async () => {
    try {
      const data = await hmsApi.getRiskAssessments();
      setRisks(data || []);
    } catch (error) {
      console.error('Error loading risks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await hmsApi.updateRiskAssessment(editingId, formData);
      } else {
        await hmsApi.createRiskAssessment({
          ...formData,
          created_by: 'Admin'
        });
      }
      await loadRisks();
      resetForm();
    } catch (error) {
      console.error('Error saving risk:', error);
      alert('Kunne ikke lagre risikovurdering');
    }
  };

  const handleEdit = (risk: RiskAssessment) => {
    setEditingId(risk.id);
    setFormData({
      hazard_type: risk.hazard_type,
      hazard_description: risk.hazard_description,
      likelihood: risk.likelihood,
      consequence: risk.consequence,
      preventive_measures: risk.preventive_measures,
      responsible_person: risk.responsible_person,
      deadline: risk.deadline || '',
      status: risk.status,
      notes: risk.notes || ''
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne risikovurderingen?')) return;
    try {
      await hmsApi.deleteRiskAssessment(id);
      await loadRisks();
    } catch (error) {
      console.error('Error deleting risk:', error);
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      hazard_type: '',
      hazard_description: '',
      likelihood: 3,
      consequence: 3,
      preventive_measures: '',
      responsible_person: '',
      deadline: '',
      status: 'Åpen',
      notes: ''
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Lav': return 'bg-green-100 text-green-800 border-green-300';
      case 'Middels': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Høy': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Kritisk': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Åpen': return 'bg-red-100 text-red-800';
      case 'Under arbeid': return 'bg-yellow-100 text-yellow-800';
      case 'Ferdig': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generatePDF = () => {
    generateRiskAssessmentPDF(risks);
  };

  const getExecuteActions = () => {
    const actions = [];

    if (risks.length === 0) {
      actions.push({
        action: 'create-risk-assessment',
        label: 'Opprett risikovurdering',
        data: { hazard_type: 'Faremoment' }
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
        seksjon="risikoanalyse"
        data={{
          risikoområder: risks,
          høyRisiko: risks.filter(a => a.risk_level === 'høy'),
          sistOppdatert: risks.length > 0 ? risks.created_at : null
        }}
        executeActions={getExecuteActions()}
        onExecuteSuccess={() => {
          loadRisks();
        }}
      />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-orange-600" />
            Risikovurdering / Risikoanalyse
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Identifiser, vurder og håndter risikoer i henhold til Arbeidstilsynet
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <Download className="w-4 h-4" />
            Last ned PDF
          </button>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Ny risikovurdering
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'list'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Liste
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'matrix'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Risikomatrise
        </button>
      </div>

      {activeTab === 'matrix' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Risikomatrise (Risk Matrix)</h3>
          <p className="text-sm text-gray-600 mb-4">
            Risiko = Sannsynlighet × Konsekvens
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 bg-gray-100"></th>
                  <th className="border border-gray-300 p-2 bg-gray-100" colSpan={5}>
                    Konsekvens (Severity)
                  </th>
                </tr>
                <tr>
                  <th className="border border-gray-300 p-2 bg-gray-100">Sannsynlighet</th>
                  <th className="border border-gray-300 p-2 bg-gray-100">1<br/>Ubetydelig</th>
                  <th className="border border-gray-300 p-2 bg-gray-100">2<br/>Mindre alvorlig</th>
                  <th className="border border-gray-300 p-2 bg-gray-100">3<br/>Alvorlig</th>
                  <th className="border border-gray-300 p-2 bg-gray-100">4<br/>Svært alvorlig</th>
                  <th className="border border-gray-300 p-2 bg-gray-100">5<br/>Katastrofal</th>
                </tr>
              </thead>
              <tbody>
                {[5, 4, 3, 2, 1].map((likelihood) => (
                  <tr key={likelihood}>
                    <td className="border border-gray-300 p-2 bg-gray-100 font-semibold">
                      {likelihood}<br/>
                      <span className="text-xs">
                        {likelihood === 5 ? 'Svært sannsynlig' :
                         likelihood === 4 ? 'Sannsynlig' :
                         likelihood === 3 ? 'Mulig' :
                         likelihood === 2 ? 'Lite sannsynlig' : 'Sjelden'}
                      </span>
                    </td>
                    {[1, 2, 3, 4, 5].map((consequence) => {
                      const score = likelihood * consequence;
                      const level = score <= 4 ? 'Lav' : score <= 9 ? 'Middels' : score <= 15 ? 'Høy' : 'Kritisk';
                      const color = level === 'Lav' ? 'bg-green-200' :
                                   level === 'Middels' ? 'bg-yellow-200' :
                                   level === 'Høy' ? 'bg-orange-200' : 'bg-red-200';
                      return (
                        <td key={consequence} className={`border border-gray-300 p-3 text-center ${color}`}>
                          <div className="font-bold text-lg">{score}</div>
                          <div className="text-xs">{level}</div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="p-3 bg-green-200 rounded border border-green-400">
              <div className="font-semibold">Lav (1-4)</div>
              <div className="text-sm">Akseptabelt, overvåk</div>
            </div>
            <div className="p-3 bg-yellow-200 rounded border border-yellow-400">
              <div className="font-semibold">Middels (5-9)</div>
              <div className="text-sm">Vurder tiltak</div>
            </div>
            <div className="p-3 bg-orange-200 rounded border border-orange-400">
              <div className="font-semibold">Høy (10-15)</div>
              <div className="text-sm">Tiltak nødvendig</div>
            </div>
            <div className="p-3 bg-red-200 rounded border border-red-400">
              <div className="font-semibold">Kritisk (16-25)</div>
              <div className="text-sm">Umiddelbar handling</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <>
          {isAdding && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingId ? 'Rediger risikovurdering' : 'Ny risikovurdering'}
                </h3>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type fare / Hazard Type *
                    </label>
                    <input
                      type="text"
                      value={formData.hazard_type}
                      onChange={(e) => setFormData({ ...formData, hazard_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="f.eks. Glatt gulv, Varm olje, Elektrisk panel"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ansvarlig *
                    </label>
                    <input
                      type="text"
                      value={formData.responsible_person}
                      onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Navn på ansvarlig person"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beskrivelse av risiko *
                  </label>
                  <textarea
                    value={formData.hazard_description}
                    onChange={(e) => setFormData({ ...formData, hazard_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Beskriv situasjonen som kan forårsake skade..."
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sannsynlighet (1-5) *
                    </label>
                    <select
                      value={formData.likelihood}
                      onChange={(e) => setFormData({ ...formData, likelihood: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value={1}>1 - Sjelden</option>
                      <option value={2}>2 - Lite sannsynlig</option>
                      <option value={3}>3 - Mulig</option>
                      <option value={4}>4 - Sannsynlig</option>
                      <option value={5}>5 - Svært sannsynlig</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Konsekvens (1-5) *
                    </label>
                    <select
                      value={formData.consequence}
                      onChange={(e) => setFormData({ ...formData, consequence: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value={1}>1 - Ubetydelig</option>
                      <option value={2}>2 - Mindre alvorlig</option>
                      <option value={3}>3 - Alvorlig</option>
                      <option value={4}>4 - Svært alvorlig</option>
                      <option value={5}>5 - Katastrofal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Risiko (Automatisk)
                    </label>
                    <div className={`px-3 py-2 border rounded-lg text-center font-bold ${
                      getRiskColor(
                        (formData.likelihood * formData.consequence) <= 4 ? 'Lav' :
                        (formData.likelihood * formData.consequence) <= 9 ? 'Middels' :
                        (formData.likelihood * formData.consequence) <= 15 ? 'Høy' : 'Kritisk'
                      )
                    }`}>
                      {formData.likelihood * formData.consequence} - {
                        (formData.likelihood * formData.consequence) <= 4 ? 'Lav' :
                        (formData.likelihood * formData.consequence) <= 9 ? 'Middels' :
                        (formData.likelihood * formData.consequence) <= 15 ? 'Høy' : 'Kritisk'
                      }
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiltak / Preventive Measures *
                  </label>
                  <textarea
                    value={formData.preventive_measures}
                    onChange={(e) => setFormData({ ...formData, preventive_measures: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Hva skal gjøres for å redusere risikoen?"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frist
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Åpen">Åpen</option>
                      <option value="Under arbeid">Under arbeid</option>
                      <option value="Ferdig">Ferdig</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notater
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Tilleggsnotater..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    {editingId ? 'Oppdater' : 'Lagre'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid gap-4">
            {risks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Ingen risikovurderinger registrert ennå</p>
              </div>
            ) : (
              risks.map((risk) => (
                <div key={risk.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {risk.hazard_type}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(risk.risk_level)}`}>
                          {risk.risk_level} ({risk.risk_score})
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(risk.status)}`}>
                          {risk.status}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{risk.hazard_description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(risk)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(risk.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Sannsynlighet × Konsekvens</div>
                      <div className="text-lg font-semibold">{risk.likelihood} × {risk.consequence} = {risk.risk_score}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Ansvarlig
                      </div>
                      <div className="font-medium">{risk.responsible_person}</div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <div className="text-sm font-medium text-blue-900 mb-2">Tiltak:</div>
                    <p className="text-blue-800 whitespace-pre-line">{risk.preventive_measures}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {risk.deadline && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Frist: {new Date(risk.deadline).toLocaleDateString('nb-NO')}
                      </div>
                    )}
                    {risk.notes && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {risk.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
