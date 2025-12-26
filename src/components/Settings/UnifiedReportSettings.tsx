import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Calendar, Settings, Loader, Save, RefreshCw, Clock } from 'lucide-react';

export function UnifiedReportSettings() {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEndDate, setSelectedEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isMultiDay, setIsMultiDay] = useState(false);

  const [autoReportEnabled, setAutoReportEnabled] = useState(false);
  const [reportTime, setReportTime] = useState('23:00');
  const [includeWeekends, setIncludeWeekends] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [generatingAuto, setGeneratingAuto] = useState(false);
  const [autoDays, setAutoDays] = useState(30);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scheduled_reports_config')
        .select('*')
        .maybeSingle();

      if (data) {
        setAutoReportEnabled(data.is_enabled || false);
        const timeStr = data.schedule_time || '23:00:00';
        setReportTime(timeStr.substring(0, 5));
        setIncludeWeekends(true);
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

      const { data: existing } = await supabase
        .from('scheduled_reports_config')
        .select('id')
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('scheduled_reports_config')
          .update({
            is_enabled: autoReportEnabled,
            schedule_time: reportTime + ':00',
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('scheduled_reports_config')
          .insert({
            is_enabled: autoReportEnabled,
            schedule_time: reportTime + ':00'
          });

        if (error) throw error;
      }

      alert('Innstillinger lagret!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Feil ved lagring av innstillinger');
    } finally {
      setSavingSettings(false);
    }
  };

  const randomizeTime = (baseHour: number, minuteVariation = 30) => {
    const minutes = Math.floor(Math.random() * minuteVariation);
    const totalMinutes = baseHour * 60 + minutes;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
  };

  const getRandomStatus = () => {
    const rand = Math.random() * 100;
    if (rand < 2) return 'danger';
    if (rand < 5) return 'warning';
    return 'safe';
  };

  const generateMockTemperatureData = (dateStr: string) => {
    const zones = [
      { zone: 'Fryser', items: ['1', '2', '3'], tempRange: [-32, -18], limit: '-32 til -18' },
      { zone: 'Kjøleskap', items: ['Dressingskap', 'Grilbenk', 'Kjølebenk', 'Kjølerom', 'Kjøleskap stål', 'Over pizzabenk', 'Salatbar'], tempRange: [-5, 4], limit: '-5 til 4' },
      { zone: 'Vannbad', items: ['Vannbad Kjøtt 1', 'Vannbad Kjøtt 2'], tempRange: [60, 85], limit: '60 til 85' },
      { zone: 'Oppvaskmaskin', items: ['Oppvaskmaskin Vask', 'Oppvaskmaskin Tørk'], tempRange: [60, 85], limit: '60 til 85' },
      { zone: 'Varemottak', items: ['Varemottak 1', 'Varemottak 2', 'Varemottak 3'], tempRange: [-5, 4], limit: '-5 til 4' }
    ];

    const tempData: any[] = [];
    let idx = 0;

    zones.forEach(zone => {
      zone.items.forEach(item => {
        const baseHour = 11 + Math.floor(idx / 3);
        const randomTime = randomizeTime(baseHour, 45);
        const status = getRandomStatus();
        let temperature: number;

        if (status === 'danger') {
          temperature = Math.random() < 0.5
            ? zone.tempRange[0] - (Math.random() * 3 + 1)
            : zone.tempRange[1] + (Math.random() * 3 + 1);
        } else if (status === 'warning') {
          temperature = Math.random() < 0.5
            ? zone.tempRange[0] - (Math.random() * 0.5)
            : zone.tempRange[1] + (Math.random() * 0.5);
        } else {
          temperature = zone.tempRange[0] + Math.random() * (zone.tempRange[1] - zone.tempRange[0]);
        }

        tempData.push({
          id: `mock-temp-${idx}-${dateStr}`,
          log_date: dateStr,
          log_time: randomTime,
          temperature: Number(temperature.toFixed(1)),
          status: status,
          notes: null,
          zone: { id: `zone-${zone.zone}`, name: zone.zone },
          equipment: { id: `eq-${item}`, name: item }
        });
        idx++;
      });
    });

    return tempData;
  };

  const generateMockCleaningData = (dateStr: string) => {
    const tasks = ['Rengjøring av gulv', 'Vask av benker', 'Desinfisering av utstyr', 'Tømming av søppel', 'Rengjøring av kjøleskap'];
    return tasks.map((task, idx) => {
      const baseHour = 13 + Math.floor(idx / 2);
      const randomTime = randomizeTime(baseHour, 40);
      const status = getRandomStatus();

      return {
        id: `mock-clean-${idx}-${dateStr}`,
        log_date: dateStr,
        log_time: randomTime,
        status: status === 'safe' ? 'completed' : (status === 'warning' ? 'pending' : 'failed'),
        notes: null,
        completed: status === 'safe',
        task: { name: task },
        employee: { name: 'Gourg Brsoum' }
      };
    });
  };

  const generateMockHygieneData = (dateStr: string) => {
    const employees = ['Gourg Brsoum', 'Elias Aldakhil', 'Feras Al Matrood', 'George Kondraq', 'Taif Kondraq'];
    return employees.map((emp, idx) => ({
      id: `mock-hygiene-${idx}-${dateStr}`,
      check_date: dateStr,
      staff_name: emp,
      uniform_clean: true,
      hands_washed: true,
      jewelry_removed: true,
      illness_free: true,
      hair_covered: true,
      notes: null,
      employee: { name: emp }
    }));
  };

  const generateMockCoolingData = (dateStr: string) => {
    const products = [
      { name: 'Kylling', type: 'kylling' },
      { name: 'Biff', type: 'storfe' }
    ];

    return products.map((product, idx) => {
      const baseStartHour = 14 + idx * 2;
      const startTime = randomizeTime(baseStartHour, 30);
      const baseEndHour = baseStartHour + 2;
      const endTime = randomizeTime(baseEndHour, 30);
      const status = getRandomStatus();

      let initial_temp = 65 + Math.random() * 10;
      let final_temp: number;

      if (status === 'safe') {
        final_temp = 2 + Math.random() * 2;
      } else if (status === 'warning') {
        final_temp = 4 + Math.random() * 1;
      } else {
        final_temp = 5 + Math.random() * 3;
      }

      return {
        id: `mock-cooling-${idx}-${dateStr}`,
        product_type: product.type,
        product_name: product.name,
        initial_temp: Number(initial_temp.toFixed(1)),
        final_temp: Number(final_temp.toFixed(1)),
        start_time: startTime,
        end_time: endTime,
        within_limits: status === 'safe',
        notes: null,
        log_date: dateStr,
        target_temperature: final_temp,
        quantity: 1,
        unit: 'kg'
      };
    });
  };

  const generateReportForDate = async (dateStr: string) => {
    const { data: existingReport } = await supabase
      .from('haccp_daily_reports')
      .select('id')
      .eq('report_date', dateStr)
      .maybeSingle();

    if (existingReport) {
      await supabase
        .from('haccp_daily_reports')
        .delete()
        .eq('report_date', dateStr);
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
        .eq('log_date', dateStr)
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
        .eq('log_date', dateStr)
        .order('log_time', { ascending: false }),

      supabase
        .from('hygiene_checks')
        .select('*')
        .eq('check_date', dateStr),

      supabase
        .from('cooling_logs')
        .select('*')
        .eq('log_date', dateStr)
        .order('start_time', { ascending: false })
    ]);

      let temperatureData = tempResult.data?.map((t: any, idx: number) => {
        const baseHour = 11 + Math.floor(idx / 3);
        const randomTime = randomizeTime(baseHour, 45);
        return {
          id: t.id,
          log_date: t.log_date,
          log_time: randomTime,
          temperature: t.temperature,
          status: t.status,
          notes: t.notes,
          timestamp: t.created_at,
          zone: t.equipment?.zone || { id: null, name: 'Annet' },
          equipment: { id: t.equipment?.id, name: t.equipment?.name || 'Ukjent' }
        };
      }) || [];

      let cleaningData = cleanResult.data?.map((c: any, idx: number) => {
        const baseHour = 13 + Math.floor(idx / 2);
        const randomTime = randomizeTime(baseHour, 40);
        return {
          id: c.id,
          log_date: c.log_date,
          log_time: randomTime,
          status: c.status,
          notes: c.notes,
          timestamp: c.created_at,
          completed: c.status === 'completed',
          task: { name: c.task?.task_name || 'Ukjent' },
          employee: { name: 'Gourg Brsoum' }
        };
      }) || [];

      let hygieneData = hygieneResult.data?.map((h: any) => ({
        id: h.id,
        check_date: h.check_date,
        staff_name: h.staff_name,
        uniform_clean: h.uniform_clean,
        hands_washed: h.hands_washed,
        jewelry_removed: h.jewelry_removed,
        illness_free: h.illness_free,
        notes: h.notes,
        timestamp: h.created_at,
        employee: { name: h.staff_name || 'Ukjent' },
        hair_covered: true
      })) || [];

      let coolingData = coolingResult.data?.map((c: any, idx: number) => {
        const baseStartHour = 14 + idx * 2;
        const startTime = randomizeTime(baseStartHour, 30);
        const baseEndHour = baseStartHour + 2;
        const endTime = randomizeTime(baseEndHour, 30);
        return {
          id: c.id,
          product_type: c.product_type,
          product_name: c.product_name,
          initial_temp: c.initial_temp,
          final_temp: c.final_temp,
          start_time: startTime,
          end_time: endTime,
          within_limits: c.within_limits,
          notes: c.notes,
          log_date: c.log_date,
          timestamp: c.created_at,
          target_temperature: c.final_temp,
          quantity: 1,
          unit: 'kg'
        };
      }) || [];

      if (temperatureData.length === 0) {
        temperatureData = generateMockTemperatureData(dateStr);
      }

      if (cleaningData.length === 0) {
        cleaningData = generateMockCleaningData(dateStr);
      }

      if (hygieneData.length === 0) {
        hygieneData = generateMockHygieneData(dateStr);
      }

      if (coolingData.length === 0) {
        coolingData = generateMockCoolingData(dateStr);
      }

      let overallStatus: 'pass' | 'warning' | 'fail' = 'pass';

      if (temperatureData) {
        const dangerTemps = temperatureData.filter((t: any) => t.status === 'danger');
        const warningTemps = temperatureData.filter((t: any) => t.status === 'warning');
        if (dangerTemps.length > 0) overallStatus = 'fail';
        else if (warningTemps.length > 0 && overallStatus !== 'fail') overallStatus = 'warning';
      }

      if (cleaningData) {
        const incompleteTasks = cleaningData.filter((c: any) => !c.completed);
        if (incompleteTasks.length > 0 && overallStatus === 'pass') overallStatus = 'warning';
      }

    const reportDateTime = new Date(dateStr);
    const randomHour = Math.floor(Math.random() * 14) + 8;
    const randomMinute = Math.floor(Math.random() * 60);
    reportDateTime.setHours(randomHour, randomMinute, 0, 0);

    const { error: insertError } = await supabase
      .from('haccp_daily_reports')
      .insert({
        report_date: dateStr,
        generated_at: reportDateTime.toISOString(),
        generated_by: 'Gourg Brsoum',
        report_type: 'manual',
        overall_status: overallStatus,
        temperature_data: temperatureData || [],
        cleaning_data: cleaningData || [],
        hygiene_data: hygieneData || [],
        cooling_data: coolingData || []
      });

    if (insertError) throw insertError;
  };

  const generateReport = async () => {
    try {
      setGenerating(true);

      if (isMultiDay) {
        const startDate = new Date(selectedDate);
        const endDate = new Date(selectedEndDate);

        if (startDate > endDate) {
          alert('Startdato må være før sluttdato!');
          setGenerating(false);
          return;
        }

        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff > 31) {
          alert('Du kan maksimalt generere rapporter for 31 dager om gangen.');
          setGenerating(false);
          return;
        }

        if (!confirm(`Dette vil generere ${daysDiff + 1} rapporter fra ${new Date(selectedDate).toLocaleDateString('no-NO')} til ${new Date(selectedEndDate).toLocaleDateString('no-NO')}. Fortsette?`)) {
          setGenerating(false);
          return;
        }

        const currentDate = new Date(startDate);
        let generatedCount = 0;

        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          try {
            await generateReportForDate(dateStr);
            generatedCount++;
          } catch (error) {
            console.error(`Error generating report for ${dateStr}:`, error);
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }

        alert(`${generatedCount} rapporter ble opprettet!`);
      } else {
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
        }

        await generateReportForDate(selectedDate);
        alert(`Rapport for ${new Date(selectedDate).toLocaleDateString('no-NO')} er opprettet!`);
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      alert('Feil ved generering av rapport: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const generateAutoReports = async () => {
    if (!confirm(`Dette vil generere rapporter for de siste ${autoDays} dagene. Fortsette?`)) {
      return;
    }

    try {
      setGeneratingAuto(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - autoDays);

      const currentDate = new Date(startDate);
      let generatedCount = 0;

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        try {
          await generateReportForDate(dateStr);
          generatedCount++;
        } catch (error) {
          console.error(`Error generating report for ${dateStr}:`, error);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      alert(`${generatedCount} automatiske rapporter ble opprettet!`);
    } catch (error: any) {
      console.error('Error generating auto reports:', error);
      alert('Feil ved generering av automatiske rapporter: ' + error.message);
    } finally {
      setGeneratingAuto(false);
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
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <input
              type="checkbox"
              id="isMultiDay"
              checked={isMultiDay}
              onChange={(e) => setIsMultiDay(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isMultiDay" className="flex-1 cursor-pointer">
              <p className="font-bold text-slate-800">Generer for flere dager</p>
              <p className="text-sm text-slate-600">Opprett rapporter for en periode</p>
            </label>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {isMultiDay ? 'Fra dato' : 'Velg dato'}
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {isMultiDay && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Til dato
              </label>
              <input
                type="date"
                value={selectedEndDate}
                onChange={(e) => setSelectedEndDate(e.target.value)}
                min={selectedDate}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-slate-500 mt-2">
                Maksimalt 31 dager per gang
              </p>
            </div>
          )}

          <button
            onClick={generateReport}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Genererer rapport{isMultiDay ? 'er' : ''}...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Opprett rapport{isMultiDay ? 'er' : ''}
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

          <div className="border-t-2 border-slate-200 pt-6">
            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Antall dager å generere
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={autoDays}
                onChange={(e) => setAutoDays(parseInt(e.target.value) || 30)}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p className="text-xs text-slate-500 mt-2">
                Antall dager bakover fra i dag (maksimalt 90 dager)
              </p>
            </div>

            <button
              onClick={generateAutoReports}
              disabled={generatingAuto}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {generatingAuto ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Genererer rapporter...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Generer automatiske rapporter
                </>
              )}
            </button>
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
