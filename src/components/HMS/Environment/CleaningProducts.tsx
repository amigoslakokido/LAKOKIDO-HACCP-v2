import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Sparkles, Plus, Save, Edit2, Trash2 } from 'lucide-react';
import { SmartAssistant } from '../SmartAssistant';

export function CleaningProducts() {
  const [records, setRecords] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    product_name: '',
    supplier: 'LEKO Mater',
    is_eco_friendly: true,
    description: '',
    usage_areas: '',
    safety_notes: '',
    notes: ''
  });

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    const { data } = await supabase.from('hms_environment_cleaning_products').select('*').order('product_name');
    if (data) setRecords(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await supabase.from('hms_environment_cleaning_products').update(formData).eq('id', editingId);
    } else {
      await supabase.from('hms_environment_cleaning_products').insert([formData]);
    }
    resetForm();
    loadRecords();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker?')) return;
    await supabase.from('hms_environment_cleaning_products').delete().eq('id', id);
    loadRecords();
  };

  const handleEdit = (record: any) => {
    setFormData({
      product_name: record.product_name,
      supplier: record.supplier,
      is_eco_friendly: record.is_eco_friendly,
      description: record.description,
      usage_areas: record.usage_areas,
      safety_notes: record.safety_notes,
      notes: record.notes
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ product_name: '', supplier: 'LEKO Mater', is_eco_friendly: true, description: '', usage_areas: '', safety_notes: '', notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleAutoGenerate = async (content: any) => {
    if (Array.isArray(content)) {
      for (const product of content) {
        await supabase.from('hms_environment_cleaning_products').insert([{
          product_name: product.name,
          supplier: product.supplier,
          is_eco_friendly: true,
          usage_areas: product.category,
          description: `Standard ${product.category.toLowerCase()} produkt`,
          safety_notes: product.hazard_level === 'Medium' ? 'Bruk hansker og god ventilasjon' : 'Følg instruksjoner på emballasjen'
        }]);
      }
      loadRecords();
      alert('Produkter lagt til!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="text-teal-600" /> Rengjøringsprodukter
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
          <Plus className="w-4 h-4" /> Nytt produkt
        </button>
      </div>

      <SmartAssistant
        section="cleaning-products"
        data={records}
        onAutoGenerate={handleAutoGenerate}
      />

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          <strong>Miljøvennlige produkter:</strong> Vi bruker miljøvennlige rengjøringsmidler fra LEKO Mater for å minimere miljøpåvirkning.
        </p>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produktnavn *</label>
                <input type="text" required value={formData.product_name} onChange={(e) => setFormData({ ...formData, product_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leverandør</label>
                <input type="text" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_eco_friendly} onChange={(e) => setFormData({ ...formData, is_eco_friendly: e.target.checked })} />
                <span className="text-sm font-medium text-gray-700">Miljøvennlig produkt</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={2} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bruksområder</label>
              <input type="text" value={formData.usage_areas} onChange={(e) => setFormData({ ...formData, usage_areas: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="f.eks. Kjøkken, toalett, gulv" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sikkerhetsnotater</label>
              <textarea value={formData.safety_notes} onChange={(e) => setFormData({ ...formData, safety_notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={2} />
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
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{record.product_name}</h3>
                  {record.is_eco_friendly && <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Miljøvennlig</span>}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Leverandør:</span> {record.supplier}</p>
                  {record.description && <p>{record.description}</p>}
                  {record.usage_areas && <p><span className="font-medium">Bruksområder:</span> {record.usage_areas}</p>}
                  {record.safety_notes && <p><span className="font-medium">Sikkerhet:</span> {record.safety_notes}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(record)} className="text-blue-600 hover:text-blue-800"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {records.length === 0 && <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">Ingen produkter registrert</div>}
      </div>
    </div>
  );
}
