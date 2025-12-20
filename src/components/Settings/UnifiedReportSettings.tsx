import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Calendar, Settings, Loader, Save, RefreshCw, Clock } from 'lucide-react';

export function UnifiedReportSettings() {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [autoReportEnabled, setAutoReportEnabled] = useState(false);
  const [reportTime, setReportTime] = useState('23:00');
  const [includeWeekends, setIncludeWeekends] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scheduled_reports')
        .select('*')
        .eq('report_type', 'haccp_daily')
        .maybeSingle();

      if (data) {
        setAutoReportEnabled(data.enabled);
        setReportTime(data.schedule_time || '23:00');
        setIncludeWeekends(data.include_weekends ?? true);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSavingSettings(true);

      const { error } = await supabase
        .from('scheduled_reports')
        .upsert({
          report_type: 'haccp_daily',
          enabled: autoReportEnabled,
          schedule_time: reportTime,
          include_weekends: includeWeekends,
          last_run: null
        });

      if (error) throw error;
      alert('Innstillinger lagret!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Feil ved lagring av innstillinger');
    } finally {
      setSavingSettings(false);
    }
  };

  const generateReport = async () => {
    try {
      setGenerating(true);

      const { data: existingReport } = await supabase
        .from('haccp_daily_reports')
        .select('id')
        .eq('report_date', selectedDate)
        .maybeSingle();

      if (existingReport) {
        if (!confirm('Det finnes allerede en rapport for denne datoen. Vil du oppdatere den?')) {
          setGenerating(false);
          return;
        }
        await supabase
          .from('haccp_daily_reports')
          .delete()
          .eq('report_date', selectedDate);
      }

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
          .eq('log_date', selectedDate)
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
          .eq('log_date', selectedDate)
          .order('log_time', { ascending: false }),

        supabase
          .from('hygiene_checks')
          .select('*')
          .eq('check_date', selectedDate),

        supabase
          .from('cooling_logs')
          .select('*')
          .eq('log_date', selectedDate)
          .order('start_time', { ascending: false })
      ]);

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
          report_date: selectedDate,
          generated_at: new Date().toISOString(),
          generated_by: 'Manual',
          report_type: 'manual',
          overall_status: overallStatus,
          temperature_data: temperatureData.data || [],
          cleaning_data: cleaningData.data || [],
          hygiene_data: hygieneData.data || [],
          cooling_data: coolingData.data || []
        });

      if (insertError) throw insertError;

      alert(`Rapport for ${new Date(selectedDate).toLocaleDateString('no-NO')} er opprettet!`);

    } catch (error: any) {
      console.error('Error generating report:', error);
      alert('Feil ved generering av rapport: ' + error.message);
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Manuell rapportgenerering</h3>
            <p className="text-sm text-slate-600">Opprett HACCP-rapport for en spesifikk dato</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Velg dato
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={generateReport}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Genererer rapport...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Opprett rapport
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-xl">
            <Settings className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Automatiske rapporter</h3>
            <p className="text-sm text-slate-600">Konfigurer automatisk daglig rapportgenerering</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-slate-600" />
              <div>
                <p className="font-bold text-slate-800">Aktiver automatiske rapporter</p>
                <p className="text-sm text-slate-600">Generer rapport automatisk hver dag</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoReportEnabled}
                onChange={(e) => setAutoReportEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <Clock className="w-4 h-4" />
              Tidspunkt for generering
            </label>
            <input
              type="time"
              value={reportTime}
              onChange={(e) => setReportTime(e.target.value)}
              disabled={!autoReportEnabled}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-2">
              Rapporten vil bli generert automatisk hver dag kl. {reportTime}
            </p>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <input
              type="checkbox"
              id="includeWeekends"
              checked={includeWeekends}
              onChange={(e) => setIncludeWeekends(e.target.checked)}
              disabled={!autoReportEnabled}
              className="w-5 h-5 text-green-600 border-slate-300 rounded focus:ring-green-500 disabled:opacity-50"
            />
            <label htmlFor="includeWeekends" className="flex-1 cursor-pointer">
              <p className="font-bold text-slate-800">Inkluder helger</p>
              <p className="text-sm text-slate-600">Generer også rapporter på lørdager og søndager</p>
            </label>
          </div>

          <button
            onClick={saveSettings}
            disabled={savingSettings}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingSettings ? (
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
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-700 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-blue-900 mb-1">Om HACCP-rapporter</h4>
            <p className="text-sm text-blue-800">
              HACCP-rapporten samler alle temperaturmålinger, rengjøringsoppgaver, hygienekontroller og nedkjølingslogger for en dag.
              Rapporten genereres automatisk basert på dataene som er registrert i systemet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
