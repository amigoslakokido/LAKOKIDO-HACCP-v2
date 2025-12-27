import { useState, useEffect } from 'react';
import { supabase, Zone, Equipment, TemperatureLog, Employee } from '../../lib/supabase';
import { Thermometer, Save, Edit2, AlertTriangle, Snowflake } from 'lucide-react';
import CoolingLog from '../Cooling/CoolingLog';
import { useCompany } from '../../contexts/CompanyContext';

export function TemperatureControl() {
  const { currentCompany, loading: companyLoading } = useCompany();
  const [activeTab, setActiveTab] = useState<'temperature' | 'cooling'>('temperature');
  const [zones, setZones] = useState<(Zone & { equipment: Equipment[] })[]>([]);
  const [logs, setLogs] = useState<Record<string, TemperatureLog>>({});
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [temperatures, setTemperatures] = useState<Record<string, string>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (currentCompany) {
      loadData();
    }
  }, [currentCompany]);

  const loadData = async () => {
    if (!currentCompany) return;

    try {
      const { data: zonesData, error: zonesError } = await supabase
        .from('zones')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('name');

      console.log('Zones data:', zonesData, 'Error:', zonesError);

      const { data: employeesData } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('active', true);

      if (employeesData) {
        setEmployees(employeesData);
      }

      if (zonesData) {
        const zonesWithEquipment = await Promise.all(
          zonesData.map(async (zone) => {
            const { data: equipmentItems, error: equipmentError } = await supabase
              .from('equipment')
              .select('*')
              .eq('zone_id', zone.id)
              .eq('company_id', currentCompany.id)
              .eq('active', true)
              .order('name');

            console.log(`Equipment for zone ${zone.name}:`, equipmentItems, 'Error:', equipmentError);

            return { ...zone, equipment: equipmentItems || [] };
          })
        );

        console.log('Final zones with equipment:', zonesWithEquipment);
        setZones(zonesWithEquipment);

        const today = new Date().toISOString().split('T')[0];
        const { data: logsData } = await supabase
          .from('temperature_logs')
          .select('*')
          .eq('company_id', currentCompany.id)
          .eq('log_date', today);

        if (logsData) {
          const logsMap: Record<string, TemperatureLog> = {};
          logsData.forEach((log) => {
            const existingLog = logsMap[log.equipment_id];
            if (!existingLog || new Date(log.created_at) > new Date(existingLog.created_at)) {
              logsMap[log.equipment_id] = log;
            }
          });
          setLogs(logsMap);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatus = (temp: number, equipment: Equipment): 'safe' | 'warning' | 'danger' => {
    const min = equipment.min_temp;
    const max = equipment.max_temp;
    const isFreezer = equipment.type === 'freezer';
    const isRefrigerator = equipment.type === 'refrigerator';

    // Check if temperature is within standard range
    if (temp >= min && temp <= max) return 'safe';

    // Check extended safe ranges for specific equipment types
    if (isFreezer) {
      // Freezers: -25 to -32 is acceptable (7 degrees below min is safe)
      if (temp >= min - 7 && temp < min) return 'safe';
      // Warning range: slightly outside extended range
      if (temp >= min - 10 && temp < min - 7) return 'warning';
      if (temp > max && temp <= max + 2) return 'warning';
    } else if (isRefrigerator) {
      // Refrigerators: -2 to -3 is acceptable (1 degree below min is safe)
      if (temp >= min - 1 && temp < min) return 'safe';
      // Warning range: slightly outside extended range
      if (temp >= min - 2 && temp < min - 1) return 'warning';
      if (temp > max && temp <= max + 2) return 'warning';
    } else {
      // Other equipment: standard warning range
      if (temp >= min - 2 && temp < min) return 'warning';
      if (temp > max && temp <= max + 2) return 'warning';
    }

    // Everything else is danger
    return 'danger';
  };

  const saveTemperature = async (equipmentId: string, equipment: Equipment) => {
    if (!currentCompany) return;

    const temp = parseFloat(temperatures[equipmentId]);
    if (isNaN(temp)) return;

    const status = calculateStatus(temp, equipment);
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0];

    const defaultEmployeeId = employees.length > 0 ? employees[0].id : '00000000-0000-0000-0000-000000000000';

    try {
      const existingLog = logs[equipmentId];

      if (existingLog) {
        const { data } = await supabase
          .from('temperature_logs')
          .update({
            temperature: temp,
            status,
          })
          .eq('id', existingLog.id)
          .eq('company_id', currentCompany.id)
          .select()
          .single();

        if (data) {
          setLogs({ ...logs, [equipmentId]: data });
        }
      } else {
        const { data: checkData } = await supabase
          .from('temperature_logs')
          .select('*')
          .eq('equipment_id', equipmentId)
          .eq('company_id', currentCompany.id)
          .eq('log_date', today)
          .maybeSingle();

        if (checkData) {
          const { data } = await supabase
            .from('temperature_logs')
            .update({
              temperature: temp,
              status,
            })
            .eq('id', checkData.id)
            .eq('company_id', currentCompany.id)
            .select()
            .single();

          if (data) {
            setLogs({ ...logs, [equipmentId]: data });
          }
        } else {
          const { data } = await supabase
            .from('temperature_logs')
            .insert({
              equipment_id: equipmentId,
              temperature: temp,
              status,
              recorded_by: defaultEmployeeId,
              log_date: today,
              log_time: timeString,
              company_id: currentCompany.id,
            })
            .select()
            .single();

          if (data) {
            setLogs({ ...logs, [equipmentId]: data });
          }
        }
      }

      setEditingItem(null);
      setTemperatures({ ...temperatures, [equipmentId]: '' });
    } catch (error) {
      console.error('Error saving temperature:', error);
      alert('Det oppstod en feil ved lagring av temperaturen');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'warning': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'danger': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'warning' || status === 'danger') {
      return <AlertTriangle className="w-4 h-4" />;
    }
    return null;
  };

  if (companyLoading || loading || !currentCompany) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Laster...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
          <Thermometer className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Temperaturkontroll</h2>
          <p className="text-slate-600">Registrer og overvåk temperaturer</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 shadow-sm border border-slate-200">
        <button
          onClick={() => setActiveTab('temperature')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'temperature'
              ? 'bg-blue-500 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Thermometer className="w-5 h-5" />
          Temperaturlogg
        </button>
        <button
          onClick={() => setActiveTab('cooling')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'cooling'
              ? 'bg-cyan-500 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Snowflake className="w-5 h-5" />
          Nedkjølingslogg
        </button>
      </div>

      {activeTab === 'cooling' ? (
        <CoolingLog />
      ) : (
        <>
          {zones.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Ingen soner funnet</h3>
              <p className="text-amber-700">
                Gå til Innstillinger for å legge til soner og utstyr først.
              </p>
            </div>
          )}

          {zones.map((zone) => {
            const zoneEquipment = zone.equipment || [];

            if (zoneEquipment.length === 0) {
              return null;
            }

            return (
              <div key={zone.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">{zone.name}</h3>
                  {zone.description && (
                    <p className="text-sm text-slate-600">{zone.description}</p>
                  )}
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {zoneEquipment.map((item) => {
                      const log = logs[item.id];
                      const isEditing = editingItem === item.id;

                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            log ? getStatusColor(log.status) : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <span className="font-medium text-slate-900">{item.name}</span>
                              {log && getStatusIcon(log.status)}
                              <span className="text-xs text-slate-500">
                                ({item.min_temp}°C til {item.max_temp}°C)
                              </span>
                            </div>

                            {log && !isEditing && (
                              <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold">
                                  {log.temperature}°C
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingItem(item.id);
                                    setTemperatures({ ...temperatures, [item.id]: log.temperature.toString() });
                                  }}
                                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}

                            {(!log || isEditing) && (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={temperatures[item.id] || ''}
                                  onChange={(e) => setTemperatures({ ...temperatures, [item.id]: e.target.value })}
                                  placeholder="°C"
                                  className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                  onClick={() => saveTemperature(item.id, item)}
                                  disabled={!temperatures[item.id]}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                  <Save className="w-4 h-4" />
                                  Lagre
                                </button>
                              </div>
                            )}
                          </div>

                          {log && (
                            <div className="mt-2 text-xs text-slate-600">
                              Registrert: {new Date(log.created_at).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
