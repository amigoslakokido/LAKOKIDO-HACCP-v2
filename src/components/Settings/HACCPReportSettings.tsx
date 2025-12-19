import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Clock, Users, Lock, Unlock, Save, Loader, Calendar, Plus, CheckCircle, AlertTriangle } from 'lucide-react';

interface ReportSettings {
  id: string;
  auto_generation_enabled: boolean;
  generation_time: string;
  weekend_employees_count: number;
  weekday_employees_count: number;
  require_signature: boolean;
  include_logo: boolean;
  settings_password: string;
}

export function HACCPReportSettings() {
  const [settings, setSettings] = useState<ReportSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [isManualLocked, setIsManualLocked] = useState(true);
  const [password, setPassword] = useState('');
  const [manualPassword, setManualPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [manualPasswordError, setManualPasswordError] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('haccp_report_settings')
        .select('*')
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = () => {
    if (!settings) return;

    if (password === settings.settings_password) {
      setIsLocked(false);
      setPasswordError('');
    } else {
      setPasswordError('Feil passord');
    }
  };

  const handleManualUnlock = () => {
    if (!settings) return;

    if (manualPassword === settings.settings_password) {
      setIsManualLocked(false);
      setManualPasswordError('');
    } else {
      setManualPasswordError('Feil passord');
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('haccp_report_settings')
        .update({
          auto_generation_enabled: settings.auto_generation_enabled,
          generation_time: settings.generation_time,
          weekend_employees_count: settings.weekend_employees_count,
          weekday_employees_count: settings.weekday_employees_count,
          require_signature: settings.require_signature,
          include_logo: settings.include_logo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) throw error;

      alert('Innstillinger lagret!');
      setIsLocked(true);
      setPassword('');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Feil ved lagring av innstillinger');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!settings) return;

    const newPassword = prompt('Skriv inn nytt passord:');
    if (!newPassword) return;

    try {
      const { error } = await supabase
        .from('haccp_report_settings')
        .update({
          settings_password: newPassword,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) throw error;

      setSettings({ ...settings, settings_password: newPassword });
      alert('Passord endret!');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Feil ved endring av passord');
    }
  };

  const generateManualReport = async () => {
    try {
      setGenerating(true);

      const reportDate = new Date().toISOString().split('T')[0];

      const { data: existingReport } = await supabase
        .from('haccp_daily_reports')
        .select('id')
        .eq('report_date', reportDate)
        .maybeSingle();

      if (existingReport) {
        alert('Det finnes allerede en rapport for dagens dato!');
        setGenerating(false);
        return;
      }

      // Fetch data using correct date/time columns
      const [tempResult, cleanResult, hygieneResult, coolingResult] = await Promise.all([
        supabase
          .from('temperature_logs')
          .select(`
            id,
            log_date,
            log_time,
            temperature,
            status,
            notes,
            equipment:equipment_id (
              id,
              name,
              zone:zone_id (
                id,
                name
              )
            )
          `)
          .eq('log_date', reportDate)
          .order('log_time', { ascending: false }),

        supabase
          .from('cleaning_logs')
          .select(`
            id,
            log_date,
            log_time,
            status,
            notes,
            task:task_id (
              task_name
            ),
            employee:completed_by (
              name
            )
          `)
          .eq('log_date', reportDate)
          .order('log_time', { ascending: false }),

        supabase
          .from('hygiene_checks')
          .select('*')
          .eq('check_date', reportDate),

        supabase
          .from('cooling_logs')
          .select('*')
          .eq('log_date', reportDate)
          .order('start_time', { ascending: false })
      ]);

      // Transform data to match expected format
      const temperatureData = {
        data: tempResult.data?.map((t: any) => ({
          ...t,
          zone: t.equipment?.zone || { name: 'Annet' },
          equipment: { name: t.equipment?.name || 'Ukjent' }
        })) || [],
        error: tempResult.error
      };

      const cleaningData = {
        data: cleanResult.data?.map((c: any) => ({
          ...c,
          completed: c.status === 'completed',
          task: { name: c.task?.task_name || 'Ukjent' },
          employee: c.employee || { name: 'Ukjent' }
        })) || [],
        error: cleanResult.error
      };

      const hygieneData = {
        data: hygieneResult.data?.map((h: any) => ({
          ...h,
          check_time: '08:00:00',
          employee: { name: h.staff_name || 'Ukjent' }
        })) || [],
        error: hygieneResult.error
      };

      const coolingData = coolingResult;

      let overallStatus: 'pass' | 'warning' | 'fail' = 'pass';

      if (temperatureData.data) {
        const dangerTemps = temperatureData.data.filter((t: any) => t.status === 'danger');
        const warningTemps = temperatureData.data.filter((t: any) => t.status === 'warning');
        if (dangerTemps.length > 0) overallStatus = 'fail';
        else if (warningTemps.length > 0 && overallStatus !== 'fail') overallStatus = 'warning';
      }

      if (cleaningData.data) {
        const incompleteTasks = cleaningData.data.filter((c: any) => !c.completed);
        if (incompleteTasks.length > 0 && overallStatus === 'pass') overallStatus = 'warning';
      }

      const { error: insertError } = await supabase
        .from('haccp_daily_reports')
        .insert({
          report_date: reportDate,
          generated_at: new Date().toISOString(),
          generated_by: 'Manuell',
          report_type: 'manual',
          overall_status: overallStatus,
          temperature_data: temperatureData.data || [],
          cleaning_data: cleaningData.data || [],
          hygiene_data: hygieneData.data || [],
          cooling_data: coolingData.data || [],
        });

      if (insertError) throw insertError;

      alert('Rapport generert!');
      setIsManualLocked(true);
      setManualPassword('');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Feil ved generering av rapport');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Kunne ikke laste innstillinger</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Manual Report Section */}
      <div className="bg-white rounded-xl border-2 border-slate-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8" />
            <div>
              <h3 className="text-2xl font-bold">Rapportbehandling</h3>
              <p className="text-emerald-100">Opprett daglige rapporter manuelt</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isManualLocked ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="w-8 h-8 text-orange-600" />
                  <div>
                    <h4 className="text-xl font-bold text-slate-800">Rapportbehandling er låst</h4>
                    <p className="text-slate-600">Skriv inn passord for å få tilgang</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <input
                    type="password"
                    value={manualPassword}
                    onChange={(e) => {
                      setManualPassword(e.target.value);
                      setManualPasswordError('');
                    }}
                    placeholder="Passord"
                    className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
                    onKeyPress={(e) => e.key === 'Enter' && handleManualUnlock()}
                  />
                  <button
                    onClick={handleManualUnlock}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-bold flex items-center gap-2 text-lg"
                  >
                    <Unlock className="w-5 h-5" />
                    Lås opp
                  </button>
                </div>
                {manualPasswordError && (
                  <p className="mt-2 text-red-600 font-semibold">{manualPasswordError}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Unlock className="w-8 h-8 text-emerald-600" />
                    <div>
                      <h4 className="text-xl font-bold text-slate-800">Rapportbehandling er låst opp</h4>
                      <p className="text-slate-600">Du kan nå opprette rapporter manuelt</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsManualLocked(true);
                      setManualPassword('');
                    }}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-bold flex items-center gap-2"
                  >
                    <Lock className="w-5 h-5" />
                    Lås
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <h4 className="text-xl font-bold text-slate-800">Opprett daglig rapport</h4>
                    <p className="text-slate-600">Generer en komplett HACCP rapport for dagens dato</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 mb-4 border-2 border-slate-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                    <div className="space-y-2">
                      <p className="text-sm text-slate-700 font-semibold">Rapporten vil inneholde:</p>
                      <ul className="text-sm text-slate-600 space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Alle temperaturmålinger for dagens dato
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Rengjøringsoppgaver og status
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Hygienekontroller
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Nedkjølingslogg
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={generateManualReport}
                  disabled={generating}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg"
                >
                  {generating ? (
                    <>
                      <Loader className="w-6 h-6 animate-spin" />
                      Oppretter rapport...
                    </>
                  ) : (
                    <>
                      <Plus className="w-6 h-6" />
                      Opprett rapport for i dag
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Automatic Generation Settings */}
      <div className="bg-white rounded-xl border-2 border-slate-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8" />
            <div>
              <h3 className="text-2xl font-bold">Automatiske rapporter innstillinger</h3>
              <p className="text-blue-100">Konfigurer automatisk generering av rapporter</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLocked ? (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-8 h-8 text-red-600" />
                <div>
                  <h4 className="text-xl font-bold text-slate-800">Innstillinger er låst</h4>
                  <p className="text-slate-600">Skriv inn passord for å endre innstillinger</p>
                </div>
              </div>
              <div className="flex gap-3">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Passord"
                  className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                />
                <button
                  onClick={handleUnlock}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold flex items-center gap-2 text-lg"
                >
                  <Unlock className="w-5 h-5" />
                  Lås opp
                </button>
              </div>
              {passwordError && (
                <p className="mt-2 text-red-600 font-semibold">{passwordError}</p>
              )}
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Unlock className="w-8 h-8 text-green-600" />
                    <div>
                      <h4 className="text-xl font-bold text-slate-800">Innstillinger er låst opp</h4>
                      <p className="text-slate-600">Du kan nå endre innstillingene</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsLocked(true);
                      setPassword('');
                    }}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-bold flex items-center gap-2"
                  >
                    <Lock className="w-5 h-5" />
                    Lås
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <label className="text-lg font-bold text-slate-800">Automatisk generering</label>
                    <p className="text-sm text-slate-600">Generer rapporter automatisk hver dag</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.auto_generation_enabled}
                      onChange={(e) => setSettings({ ...settings, auto_generation_enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <label className="block text-lg font-bold text-slate-800 mb-2">
                    <Clock className="w-5 h-5 inline mr-2" />
                    Genererings tid
                  </label>
                  <input
                    type="time"
                    value={settings.generation_time}
                    onChange={(e) => setSettings({ ...settings, generation_time: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-slate-600 mt-2">Tidspunkt for automatisk generering av rapport</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <label className="block text-lg font-bold text-slate-800 mb-2">
                      <Users className="w-5 h-5 inline mr-2" />
                      Ansatte (Man-Tors)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={settings.weekday_employees_count}
                      onChange={(e) => setSettings({ ...settings, weekday_employees_count: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-slate-600 mt-2">Antall ansatte på hverdager</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg">
                    <label className="block text-lg font-bold text-slate-800 mb-2">
                      <Users className="w-5 h-5 inline mr-2" />
                      Ansatte (Fre-Søn)
                    </label>
                    <input
                      type="number"
                      min="4"
                      max="5"
                      value={settings.weekend_employees_count}
                      onChange={(e) => setSettings({ ...settings, weekend_employees_count: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-slate-600 mt-2">Antall ansatte i helger (4-5)</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <label className="text-lg font-bold text-slate-800">Krev signatur</label>
                      <p className="text-sm text-slate-600">Rapporter må signeres av Daglig leder</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.require_signature}
                        onChange={(e) => setSettings({ ...settings, require_signature: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <label className="text-lg font-bold text-slate-800">Inkluder logo</label>
                      <p className="text-sm text-slate-600">Vis restaurantlogo i rapporter</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.include_logo}
                        onChange={(e) => setSettings({ ...settings, include_logo: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Lagrer...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Lagre innstillinger
                      </>
                    )}
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all font-bold"
                  >
                    Endre passord
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
