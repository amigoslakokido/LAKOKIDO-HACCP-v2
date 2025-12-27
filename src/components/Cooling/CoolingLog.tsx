import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Snowflake, Plus, Calendar, Clock, AlertCircle, Thermometer } from 'lucide-react';

interface CoolingLog {
  id: string;
  log_date: string;
  product_type: 'kebab' | 'chicken' | 'kjottsaus' | 'kjottdeig' | 'bacon';
  product_name: string;
  initial_temp: number;
  final_temp: number;
  start_time: string;
  end_time: string;
  within_limits: boolean;
  notes: string;
  created_at: string;
}

export default function CoolingLog() {
  const [logs, setLogs] = useState<CoolingLog[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    product_type: '' as 'kebab' | 'chicken' | 'kjottsaus' | 'kjottdeig' | 'bacon' | '',
    product_name: '',
    initial_temp: '',
    final_temp: '',
    start_time: '',
    duration_hours: '6',
    notes: ''
  });

  const productTypes = [
    { value: 'kebab', label: 'Kjøtt / Kebab' },
    { value: 'chicken', label: 'Kylling' },
    { value: 'kjottsaus', label: 'Kjøttsaus' },
    { value: 'kjottdeig', label: 'Kjøttdeig' },
    { value: 'bacon', label: 'Bacon' }
  ];

  useEffect(() => {
    loadLogs();
  }, [selectedDate]);

  const loadLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cooling_logs')
      .select('*')
      .eq('log_date', selectedDate)
      .order('created_at', { ascending: false });

    if (data) {
      setLogs(data as any);
    }
    setLoading(false);
  };

  const calculateEndTime = (startTime: string, duration: number): string => {
    const start = new Date(`${selectedDate}T${startTime}`);
    start.setHours(start.getHours() + duration);
    return start.toISOString();
  };

  const checkWithinLimits = (initialTemp: number, finalTemp: number): boolean => {
    if (initialTemp < 60) return false;
    if (finalTemp > 4) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const initialTemp = parseFloat(formData.initial_temp);
    const finalTemp = parseFloat(formData.final_temp);
    const startTime = `${selectedDate}T${formData.start_time}:00`;
    const endTime = calculateEndTime(formData.start_time, parseFloat(formData.duration_hours));
    const withinLimits = checkWithinLimits(initialTemp, finalTemp);

    try {
      const { error } = await supabase
        .from('cooling_logs')
        .insert({
          log_date: selectedDate,
          product_type: formData.product_type,
          product_name: formData.product_name,
          initial_temp: initialTemp,
          final_temp: finalTemp,
          start_time: startTime,
          end_time: endTime,
          within_limits: withinLimits,
          notes: formData.notes || (withinLimits ? 'Godkjent nedkjøling' : 'Ikke godkjent – For langsom nedkjøling')
        });

      if (!error) {
        setShowForm(false);
        setFormData({
          product_type: '',
          product_name: '',
          initial_temp: '',
          final_temp: '',
          start_time: '',
          duration_hours: '4',
          notes: ''
        });
        loadLogs();
      } else {
        alert('Feil ved lagring: ' + error.message);
      }
    } catch (error) {
      console.error('Error saving cooling log:', error);
      alert('Feil ved lagring');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Snowflake className="w-7 h-7 text-cyan-600" />
          Nedkjølingslogg
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Ny Nedkjøling
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-slate-600" />
          <label className="text-sm font-medium text-slate-700">Velg dato:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        <div className="bg-cyan-50 border-l-4 border-cyan-500 rounded-lg p-5 mt-4">
          <h3 className="font-semibold text-cyan-900 mb-3 flex items-center gap-2 text-lg">
            <Thermometer className="w-5 h-5" />
            Mattilsynet Standard for Nedkjøling
          </h3>
          <div className="space-y-3 text-sm text-cyan-900">
            <div className="bg-white bg-opacity-60 rounded-lg p-3">
              <div className="font-semibold text-cyan-800 mb-2">⏱️ Sikker nedkjølingsgrenser:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-4">
                <div>
                  <span className="font-medium">Fase 1 (innen 2 timer):</span>
                  <br/>
                  <span className="text-green-700 font-semibold">+60°C → +10°C</span>
                  <br/>
                  <span className="text-xs text-slate-600">(rask nedkjøling)</span>
                </div>
                <div>
                  <span className="font-medium">Fase 2 (totalt 6 timer):</span>
                  <br/>
                  <span className="text-green-700 font-semibold">+10°C → +4°C eller lavere</span>
                  <br/>
                  <span className="text-xs text-slate-600">(klar for lagring)</span>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-red-700">Viktig:</span>
                <span className="text-slate-700"> Maten må være ≤+4°C innen 6 timer totalt. Hvis ikke, må den kasseres.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Ny Nedkjølingslogg</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type Mat
                </label>
                <select
                  value={formData.product_type}
                  onChange={(e) => setFormData({ ...formData, product_type: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                >
                  <option value="">Velg type...</option>
                  {productTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Produkt / Rett
                </label>
                <input
                  type="text"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="F.eks. Kebabkjøtt, Grillet kylling..."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Temp. Start (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.initial_temp}
                  onChange={(e) => setFormData({ ...formData, initial_temp: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="65-75"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Temp. Slutt (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.final_temp}
                  onChange={(e) => setFormData({ ...formData, final_temp: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="2-4"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Starttid
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Varighet (timer)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.duration_hours}
                  onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="6"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Merknader (valgfritt)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                rows={3}
                placeholder="Valgfri merknader..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
              >
                Lagre Logg
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white px-6 py-4">
          <h2 className="text-xl font-semibold">Nedkjølinger - {new Date(selectedDate).toLocaleDateString('nb-NO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Laster...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500">Ingen nedkjølinger registrert for denne datoen</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Produkt</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">Start (°C)</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">Slutt (°C)</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">Starttid</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">Sluttid</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Merknad</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {logs.map((log) => {
                  const productTypeMap: Record<string, string> = {
                    'meat': 'Kjøtt',
                    'poultry': 'Kylling',
                    'fish': 'Fisk',
                    'other': 'Annet'
                  };

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {productTypeMap[log.product_type]}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {log.product_name}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-slate-700 font-mono">
                        {log.initial_temp.toFixed(1)}°
                      </td>
                      <td className={`px-6 py-4 text-center text-sm font-mono font-bold ${
                        log.within_limits ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {log.final_temp.toFixed(1)}°
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-mono">
                        {new Date(log.start_time).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-mono">
                        {new Date(log.end_time).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          log.within_limits
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {log.within_limits ? '✓ Godkjent' : '✗ Ikke godkjent'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {log.notes}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
