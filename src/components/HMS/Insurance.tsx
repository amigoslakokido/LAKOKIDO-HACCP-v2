import { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, Save, X, Building2, Phone, Mail, User, Hash, Calendar, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { hmsApi } from '../../lib/hmsSupabase';

interface InsuranceCompany {
  id?: string;
  company_name: string;
  insurance_type: string;
  policy_number: string;
  contact_person: string;
  phone: string;
  email: string;
  coverage_amount: number;
  premium_amount: number;
  start_date: string;
  end_date: string;
  notes: string;
}

export function Insurance() {
  const [insurances, setInsurances] = useState<InsuranceCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<InsuranceCompany>({
    company_name: '',
    insurance_type: '',
    policy_number: '',
    contact_person: '',
    phone: '',
    email: '',
    coverage_amount: 0,
    premium_amount: 0,
    start_date: '',
    end_date: '',
    notes: '',
  });

  useEffect(() => {
    loadInsurances();
  }, []);

  const loadInsurances = async () => {
    setLoading(true);
    const { data, error } = await hmsApi.getInsuranceCompanies();
    if (error) {
      console.error('Error loading insurances:', error);
    }
    if (data) {
      setInsurances(data);
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setFormData({
      company_name: '',
      insurance_type: '',
      policy_number: '',
      contact_person: '',
      phone: '',
      email: '',
      coverage_amount: 0,
      premium_amount: 0,
      start_date: '',
      end_date: '',
      notes: '',
    });
    setEditingId(null);
    setShowAddForm(true);
  };

  const handleEdit = (insurance: InsuranceCompany) => {
    setFormData(insurance);
    setEditingId(insurance.id || null);
    setShowAddForm(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await hmsApi.updateInsuranceCompany(editingId, formData);
      } else {
        await hmsApi.createInsuranceCompany(formData);
      }
      setShowAddForm(false);
      setEditingId(null);
      loadInsurances();
    } catch (error) {
      console.error('Error saving insurance:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Er du sikker på at du vil slette dette forsikringsselskapet?')) {
      try {
        await hmsApi.deleteInsuranceCompany(id);
        loadInsurances();
      } catch (error) {
        console.error('Error deleting insurance:', error);
      }
    }
  };

  const getExpiryStatus = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { status: 'expired', text: 'Utløpt', color: 'text-red-600 bg-red-50 border-red-200' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', text: `${daysUntilExpiry} dager igjen`, color: 'text-orange-600 bg-orange-50 border-orange-200' };
    } else {
      return { status: 'active', text: 'Aktiv', color: 'text-green-600 bg-green-50 border-green-200' };
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
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Forsikringer</h1>
              <p className="text-sm text-slate-600">Administrer forsikringsselskaper</p>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Legg til forsikring
          </button>
        </div>

        {showAddForm && (
          <div className="bg-slate-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? 'Rediger forsikring' : 'Ny forsikring'}
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Forsikringsselskap *
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="F.eks. If Skadeforsikring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Type forsikring *
                </label>
                <select
                  value={formData.insurance_type}
                  onChange={(e) => setFormData({ ...formData, insurance_type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Velg type</option>
                  <option value="Ansvarsforsikring">Ansvarsforsikring</option>
                  <option value="Yrkesskadeforsikring">Yrkesskadeforsikring</option>
                  <option value="Brannforsikring">Brannforsikring</option>
                  <option value="Innboforsikring">Innboforsikring</option>
                  <option value="Bilforsikring">Bilforsikring</option>
                  <option value="Bygningsforsikring">Bygningsforsikring</option>
                  <option value="Reiseforsikring">Reiseforsikring</option>
                  <option value="Annet">Annet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-2" />
                  Polisenummer
                </label>
                <input
                  type="text"
                  value={formData.policy_number}
                  onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Kontaktperson
                </label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Navn på kontaktperson"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+47 XXX XX XXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  E-post
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="epost@eksempel.no"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Dekningsbeløp (kr)
                </label>
                <input
                  type="number"
                  value={formData.coverage_amount}
                  onChange={(e) => setFormData({ ...formData, coverage_amount: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Årlig premie (kr)
                </label>
                <input
                  type="number"
                  value={formData.premium_amount}
                  onChange={(e) => setFormData({ ...formData, premium_amount: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Fra dato
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Til dato
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Notater
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Tilleggsnotater..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Lagre
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Avbryt
              </button>
            </div>
          </div>
        )}

        {insurances.length === 0 ? (
          <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-12 text-center">
            <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Ingen forsikringer registrert</h3>
            <p className="text-slate-600 mb-4">Legg til forsikringsselskaper for å holde oversikt</p>
            <button
              onClick={handleAdd}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Legg til første forsikring
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {insurances.map((insurance) => {
              const expiryStatus = insurance.end_date ? getExpiryStatus(insurance.end_date) : null;

              return (
                <div
                  key={insurance.id}
                  className="bg-white border-2 border-slate-200 rounded-xl p-5 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Shield className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{insurance.company_name}</h3>
                          <p className="text-sm text-slate-600">{insurance.insurance_type}</p>
                        </div>
                      </div>

                      {expiryStatus && (
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium border-2 ${expiryStatus.color}`}>
                          {expiryStatus.status === 'expired' && <AlertCircle className="w-4 h-4" />}
                          {expiryStatus.text}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(insurance)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => insurance.id && handleDelete(insurance.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    {insurance.policy_number && (
                      <div>
                        <span className="text-slate-500">Polisenr:</span>
                        <span className="ml-2 font-medium text-slate-900">{insurance.policy_number}</span>
                      </div>
                    )}
                    {insurance.contact_person && (
                      <div>
                        <span className="text-slate-500">Kontakt:</span>
                        <span className="ml-2 font-medium text-slate-900">{insurance.contact_person}</span>
                      </div>
                    )}
                    {insurance.phone && (
                      <div>
                        <span className="text-slate-500">Telefon:</span>
                        <span className="ml-2 font-medium text-slate-900">{insurance.phone}</span>
                      </div>
                    )}
                    {insurance.email && (
                      <div>
                        <span className="text-slate-500">E-post:</span>
                        <span className="ml-2 font-medium text-slate-900">{insurance.email}</span>
                      </div>
                    )}
                    {insurance.coverage_amount > 0 && (
                      <div>
                        <span className="text-slate-500">Dekningsbeløp:</span>
                        <span className="ml-2 font-medium text-slate-900">
                          {insurance.coverage_amount.toLocaleString('nb-NO')} kr
                        </span>
                      </div>
                    )}
                    {insurance.premium_amount > 0 && (
                      <div>
                        <span className="text-slate-500">Årlig premie:</span>
                        <span className="ml-2 font-medium text-slate-900">
                          {insurance.premium_amount.toLocaleString('nb-NO')} kr
                        </span>
                      </div>
                    )}
                    {insurance.start_date && (
                      <div>
                        <span className="text-slate-500">Fra:</span>
                        <span className="ml-2 font-medium text-slate-900">
                          {new Date(insurance.start_date).toLocaleDateString('nb-NO')}
                        </span>
                      </div>
                    )}
                    {insurance.end_date && (
                      <div>
                        <span className="text-slate-500">Til:</span>
                        <span className="ml-2 font-medium text-slate-900">
                          {new Date(insurance.end_date).toLocaleDateString('nb-NO')}
                        </span>
                      </div>
                    )}
                  </div>

                  {insurance.notes && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-sm text-slate-600">{insurance.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
