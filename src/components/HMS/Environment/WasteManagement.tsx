import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Recycle, Plus, Save, Edit2, Trash2 } from 'lucide-react';
import { SmartAssistant } from '../SmartAssistant';

export function WasteManagement() {
  const [records, setRecords] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    waste_type: 'rest',
    description: '',
    collection_company: '',
    collection_frequency: '',
    last_collection_date: '',
    notes: ''
  });

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    const { data } = await supabase.from('hms_environment_waste').select('*').order('waste_type');
    if (data) setRecords(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await supabase.from('hms_environment_waste').update(formData).eq('id', editingId);
    } else {
      await supabase.from('hms_environment_waste').insert([formData]);
    }
    resetForm();
    loadRecords();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker?')) return;
    await supabase.from('hms_environment_waste').delete().eq('id', id);
    loadRecords();
  };

  const handleEdit = (record: any) => {
    setFormData({
      waste_type: record.waste_type,
      description: record.description,
      collection_company: record.collection_company,
      collection_frequency: record.collection_frequency,
      last_collection_date: record.last_collection_date || '',
      notes: record.notes
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ waste_type: 'rest', description: '', collection_company: '', collection_frequency: '', last_collection_date: '', notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const getWasteTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      rest: 'Restavfall',
      plast: 'Plast',
      papp: 'Papp/Papir',
      glass: 'Glass',
      metal: 'Metall',
      matavfall: 'Matavfall',
      other: 'Annet'
    };
    return labels[type] || type;
  };

  const handleAutoGenerate = async (content: any) => {
    if (content.categories && Array.isArray(content.categories)) {
      for (const category of content.categories) {
        await supabase.from('hms_environment_waste').insert([{
          waste_type: category.name.toLowerCase().includes('mat') ? 'matavfall' :
                      category.name.toLowerCase().includes('plast') ? 'plast' :
                      category.name.toLowerCase().includes('papp') || category.name.toLowerCase().includes('papir') ? 'papp' :
                      category.name.toLowerCase().includes('glass') ? 'glass' : 'rest',
          description: category.name,
          collection_company: 'Local waste management',
          collection_frequency: category.collection_frequency,
          notes: `Beholder: ${category.container_type}`
        }]);
      }
      loadRecords();
      alert('Avfallskategorier lagt til!');
    } else if (content.plan) {
      alert('Avfallsplan opprettet! Legg til kategorier ved å klikke "Generer eksempelkategorier".');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Recycle className="text-green-600" /> Avfallshåndtering
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Plus className="w-4 h-4" /> Ny avfallstype
        </button>
      </div>

      <SmartAssistant
        section="waste-management"
        data={{
          plan: records.length > 0 ? { exists: true } : null,
          categories: records,
          lastReview: records.length > 0 ? records[0].updated_at : null
        }}
        onAutoGenerate={handleAutoGenerate}
      />

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type avfall *</label>
              <select required value={formData.waste_type} onChange={(e) => setFormData({ ...formData, waste_type: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                <option value="rest">Restavfall</option>
                <option value="plast">Plast</option>
                <option value="papp">Papp/Papir</option>
                <option value="glass">Glass</option>
                <option value="metal">Metall</option>
                <option value="matavfall">Matavfall</option>
                <option value="other">Annet</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={2} placeholder="Ekstra detaljer om denne avfallstypen..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Firma som henter</label>
                <input type="text" value={formData.collection_company} onChange={(e) => setFormData({ ...formData, collection_company: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hentingsfrekvens</label>
                <input type="text" value={formData.collection_frequency} onChange={(e) => setFormData({ ...formData, collection_frequency: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="f.eks. ukentlig" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Siste henting</label>
              <input type="date" value={formData.last_collection_date} onChange={(e) => setFormData({ ...formData, last_collection_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Save className="w-4 h-4" /> Lagre
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Avbryt</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {records.map((record) => (
          <div key={record.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{getWasteTypeLabel(record.waste_type)}</h3>
                {record.description && <p className="text-sm text-gray-600 mb-2">{record.description}</p>}
                <div className="text-sm text-gray-600 space-y-1">
                  {record.collection_company && <p><span className="font-medium">Firma:</span> {record.collection_company}</p>}
                  {record.collection_frequency && <p><span className="font-medium">Frekvens:</span> {record.collection_frequency}</p>}
                  {record.last_collection_date && <p><span className="font-medium">Siste henting:</span> {new Date(record.last_collection_date).toLocaleDateString('nb-NO')}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(record)} className="text-blue-600 hover:text-blue-800"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {records.length === 0 && <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">Ingen avfallstyper registrert</div>}
      </div>
    </div>
  );
}
