import { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, Save, X, Users, Clock } from 'lucide-react';
import { companyApi } from '../../lib/companyApi';

interface Employee {
  id: string;
  name: string;
}

interface Schedule {
  id: string;
  employee_id: string;
  schedule_name: string;
  day_of_week: number;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  notes: string;
  employees: { id: string; name: string };
}

const DAYS = [
  { value: 0, label: 'Sunday', labelNo: 'Søndag' },
  { value: 1, label: 'Monday', labelNo: 'Mandag' },
  { value: 2, label: 'Tuesday', labelNo: 'Tirsdag' },
  { value: 3, label: 'Wednesday', labelNo: 'Onsdag' },
  { value: 4, label: 'Thursday', labelNo: 'Torsdag' },
  { value: 5, label: 'Friday', labelNo: 'Fredag' },
  { value: 6, label: 'Saturday', labelNo: 'Lørdag' }
];

export function EmployeeScheduler() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    employee_id: '',
    schedule_name: 'Hovedplan',
    days: [] as number[],
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [empRes, schedRes] = await Promise.all([
        companyApi.getActiveEmployees(),
        companyApi.getEmployeeSchedules()
      ]);

      if (empRes.data) setEmployees(empRes.data);
      if (schedRes.data) setSchedules(schedRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (formData.days.length === 0) {
        alert('Velg minst en dag');
        return;
      }

      const schedulesToCreate = formData.days.map(day => ({
        employee_id: formData.employee_id,
        schedule_name: formData.schedule_name,
        day_of_week: day,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        notes: formData.notes
      }));

      await companyApi.bulkCreateSchedules(schedulesToCreate);

      resetForm();
      await loadData();
      alert('Turnus opprettet!');
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Kunne ikke lagre turnus');
    }
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm('Slett denne turnusen?')) return;

    try {
      await companyApi.deleteEmployeeSchedule(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      schedule_name: 'Hovedplan',
      days: [],
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getSchedulesByDay = () => {
    const byDay: { [key: number]: Schedule[] } = {};
    DAYS.forEach(day => {
      byDay[day.value] = schedules.filter(s => s.day_of_week === day.value);
    });
    return byDay;
  };

  const quickSetup = (type: 'weekdays' | 'weekend') => {
    if (type === 'weekdays') {
      setFormData(prev => ({ ...prev, days: [1, 2, 3, 4] }));
    } else {
      setFormData(prev => ({ ...prev, days: [5, 6, 0] }));
    }
  };

  if (loading) {
    return <div className="text-center py-8">Laster...</div>;
  }

  const schedulesByDay = getSchedulesByDay();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-blue-600" />
            Turnusplan for ansatte
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Planlegg hvilke ansatte som skal være på jobb hver dag
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Ny turnus
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Opprett turnusplan</h3>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Velg ansatt *
              </label>
              <select
                required
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Velg ansatt...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Turnus navn
              </label>
              <input
                type="text"
                value={formData.schedule_name}
                onChange={(e) => setFormData({ ...formData, schedule_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="f.eks. Uke 1-2, Sommerturnus, osv."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Velg dager *
              </label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => quickSetup('weekdays')}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Man-Tors
                </button>
                <button
                  type="button"
                  onClick={() => quickSetup('weekend')}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Fre-Søn
                </button>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                      formData.days.includes(day.value)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <div>{day.labelNo.slice(0, 3)}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fra dato *
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Til dato (valgfritt)
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">La stå tom for ingen sluttdato</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notater
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
                placeholder="Ekstra informasjon..."
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                Lagre turnus
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Ukeoversikt
          </h3>
        </div>
        <div className="grid grid-cols-7 divide-x">
          {DAYS.map(day => (
            <div key={day.value} className="p-4">
              <div className="text-center mb-3">
                <div className="font-bold text-gray-900">{day.labelNo}</div>
                <div className="text-xs text-gray-500">{day.label}</div>
              </div>
              <div className="space-y-2">
                {schedulesByDay[day.value]?.length > 0 ? (
                  schedulesByDay[day.value].map(schedule => (
                    <div
                      key={schedule.id}
                      className="bg-blue-50 border border-blue-200 rounded p-2 text-xs"
                    >
                      <div className="font-medium text-blue-900 mb-1">
                        {schedule.employees.name}
                      </div>
                      <div className="text-blue-700 text-[10px]">
                        {schedule.schedule_name}
                      </div>
                      <div className="flex gap-1 mt-2">
                        <button
                          onClick={() => deleteSchedule(schedule.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Slett"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 text-xs py-4">
                    Ingen turnus
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Bruk "Man-Tors" for ansatte som jobber mandag til torsdag</li>
          <li>• Bruk "Fre-Søn" for helgeansatte (4-5 personer)</li>
          <li>• Du kan sette sluttdato for midlertidige turnuser</li>
          <li>• Turnusen gjelder automatisk for rapporter fra startdatoen</li>
        </ul>
      </div>
    </div>
  );
}
