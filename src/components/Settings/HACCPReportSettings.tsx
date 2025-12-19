import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Clock, Users, Lock, Unlock, Save, Loader } from 'lucide-react';

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
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

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
      {/* Lock/Unlock Section */}
      {isLocked ? (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-8 h-8 text-red-600" />
            <div>
              <h3 className="text-xl font-bold text-slate-800">Innstillinger er låst</h3>
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
              className="flex-1 px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
            />
            <button
              onClick={handleUnlock}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold flex items-center gap-2"
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
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Unlock className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-xl font-bold text-slate-800">Innstillinger er låst opp</h3>
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
      )}

      {/* Settings Form */}
      <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8 text-blue-600" />
          <h3 className="text-2xl font-bold text-slate-800">HACCP Rapport Innstillinger</h3>
        </div>

        <div className="space-y-6">
          {/* Auto Generation */}
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
                disabled={isLocked}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Generation Time */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <label className="block text-lg font-bold text-slate-800 mb-2">
              <Clock className="w-5 h-5 inline mr-2" />
              Genererings tid
            </label>
            <input
              type="time"
              value={settings.generation_time}
              onChange={(e) => setSettings({ ...settings, generation_time: e.target.value })}
              disabled={isLocked}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
            />
            <p className="text-sm text-slate-600 mt-2">Tidspunkt for automatisk generering av rapport</p>
          </div>

          {/* Employee Counts */}
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
                disabled={isLocked}
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
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
                disabled={isLocked}
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
              />
              <p className="text-sm text-slate-600 mt-2">Antall ansatte i helger (4-5)</p>
            </div>
          </div>

          {/* Additional Settings */}
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
                  disabled={isLocked}
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
                  disabled={isLocked}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isLocked || saving}
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
              disabled={isLocked}
              className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Endre passord
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
