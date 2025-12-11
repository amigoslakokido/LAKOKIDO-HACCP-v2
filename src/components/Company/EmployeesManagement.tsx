import { useState, useEffect } from 'react';
import { companyApi, Employee, Department } from '../../lib/companyApi';
import { Users, Plus, Edit2, Trash2, RotateCcw, Save, X, UserCheck, UserX } from 'lucide-react';

export function EmployeesManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    phone: '',
    email: '',
    position_no: '',
    position_ar: '',
    department_id: '',
    hire_date: new Date().toISOString().split('T')[0],
    notes: '',
    active: true
  });

  useEffect(() => {
    loadData();
  }, [showDeleted]);

  const loadData = async () => {
    setLoading(true);
    const [empRes, deptRes] = await Promise.all([
      companyApi.getEmployees(showDeleted),
      companyApi.getDepartments()
    ]);

    if (empRes.data) setEmployees(empRes.data);
    if (deptRes.data) setDepartments(deptRes.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editingId) {
      await companyApi.updateEmployee(editingId, formData);
    } else {
      await companyApi.createEmployee(formData);
    }

    await loadData();
    resetForm();
    setSaving(false);
  };

  const handleEdit = (employee: Employee) => {
    setFormData({
      name: employee.name,
      phone: employee.phone || '',
      email: employee.email || '',
      position_no: employee.position_no || employee.role || '',
      position_ar: employee.position_ar || '',
      department_id: employee.department_id || '',
      hire_date: employee.hire_date || new Date().toISOString().split('T')[0],
      notes: employee.notes || '',
      active: employee.active
    });
    setEditingId(employee.id);
    setShowForm(true);
  };

  const handleSoftDelete = async (id: string) => {
    if (confirm('Er du sikker på at du vil deaktivere denne ansatte?')) {
      await companyApi.softDeleteEmployee(id);
      await loadData();
    }
  };

  const handleRestore = async (id: string) => {
    await companyApi.restoreEmployee(id);
    await loadData();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      position_no: '',
      position_ar: '',
      department_id: '',
      hire_date: new Date().toISOString().split('T')[0],
      notes: '',
      active: true
    });
    setEditingId(null);
    setShowForm(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Ansatte</h2>
          <p className="text-slate-600">Administrer medarbeidere</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              showDeleted
                ? 'bg-slate-700 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {showDeleted ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            {showDeleted ? 'Vis aktive' : 'Vis deaktiverte'}
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold"
          >
            <Plus className="w-5 h-5" />
            Ny ansatt
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">
                {editingId ? 'Rediger ansatt' : 'Ny ansatt'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Navn *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
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
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Stilling (Norsk) *
                  </label>
                  <input
                    type="text"
                    value={formData.position_no}
                    onChange={(e) => setFormData({ ...formData, position_no: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Kokk, Servitør, etc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Stilling (English)
                  </label>
                  <input
                    type="text"
                    value={formData.position_ar}
                    onChange={(e) => setFormData({ ...formData, position_ar: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Cook, Waiter, etc."
                  />
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
                    <option value="">Velg avdeling</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name_no} - {dept.name_ar}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Ansettelsesdato
                  </label>
                  <input
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Notater
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold disabled:opacity-50"
                >
                  <Save className="w-5 h-5 inline mr-2" />
                  {saving ? 'Lagrer...' : editingId ? 'Oppdater' : 'Lagre'}
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
        {employees.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl">
            <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Ingen ansatte registrert</p>
            <p className="text-slate-500">No employees registered</p>
          </div>
        ) : (
          employees.map((employee: any) => (
            <div
              key={employee.id}
              className={`bg-white rounded-xl p-6 border-2 transition-all ${
                employee.deleted_at
                  ? 'border-red-200 bg-red-50/50'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{employee.name}</h3>
                    {employee.deleted_at && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                        DEAKTIVERT
                      </span>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    {employee.position_no && (
                      <p className="text-slate-600">
                        <span className="font-bold">Stilling:</span> {employee.position_no}
                        {employee.position_ar && ` - ${employee.position_ar}`}
                      </p>
                    )}
                    {employee.departments && (
                      <p className="text-slate-600">
                        <span className="font-bold">Avdeling:</span> {employee.departments.name_no}
                      </p>
                    )}
                    {employee.phone && (
                      <p className="text-slate-600">
                        <span className="font-bold">Telefon:</span> {employee.phone}
                      </p>
                    )}
                    {employee.email && (
                      <p className="text-slate-600">
                        <span className="font-bold">E-post:</span> {employee.email}
                      </p>
                    )}
                    {employee.hire_date && (
                      <p className="text-slate-600">
                        <span className="font-bold">Ansatt:</span>{' '}
                        {new Date(employee.hire_date).toLocaleDateString('nb-NO')}
                      </p>
                    )}
                  </div>
                  {employee.notes && (
                    <p className="text-sm text-slate-500 mt-3 italic">{employee.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {!employee.deleted_at ? (
                    <>
                      <button
                        onClick={() => handleEdit(employee)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Rediger"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleSoftDelete(employee.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Deaktiver"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleRestore(employee.id)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      title="Aktiver igjen"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
