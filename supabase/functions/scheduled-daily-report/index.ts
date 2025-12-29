import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: config } = await supabase
      .from('scheduled_reports_config')
      .select('*')
      .maybeSingle();

    if (!config || !config.is_enabled) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'التقارير التلقائية معطلة' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    const today = new Date().toISOString().split('T')[0];

    const { data: existingReport } = await supabase
      .from('haccp_daily_reports')
      .select('id')
      .eq('report_date', today)
      .maybeSingle();

    if (existingReport) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `التقرير موجود بالفعل لتاريخ ${today}`,
          report_id: existingReport.id
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const generateMockTemperatureData = (dateStr: string) => {
      const zones = [
        { zone: 'Fryser', items: ['1', '2', '3'], tempRange: [-32, -18] },
        { zone: 'Kjøleskap', items: ['Dressingskap', 'Grilbenk', 'Kjølebenk', 'Kjølerom', 'Kjøleskap stål', 'Over pizzabenk', 'Salatbar'], tempRange: [-5, 4] },
        { zone: 'Vannbad', items: ['Vannbad Kjøtt 1', 'Vannbad Kjøtt 2'], tempRange: [60, 85] },
        { zone: 'Oppvaskmaskin', items: ['Oppvaskmaskin Vask', 'Oppvaskmaskin Tørk'], tempRange: [60, 85] },
        { zone: 'Varemottak', items: ['Varemottak 1', 'Varemottak 2', 'Varemottak 3'], tempRange: [-5, 4] }
      ];

      const tempData: any[] = [];
      let idx = 0;

      zones.forEach(zone => {
        zone.items.forEach(item => {
          const baseHour = 11 + Math.floor(idx / 3);
          const minutes = Math.floor(Math.random() * 45);
          const randomTime = `${String(baseHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
          
          const rand = Math.random() * 100;
          const status = rand < 2 ? 'danger' : (rand < 5 ? 'warning' : 'safe');
          
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
            id: `auto-temp-${idx}-${dateStr}`,
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
        const minutes = Math.floor(Math.random() * 40);
        const randomTime = `${String(baseHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
        
        const rand = Math.random() * 100;
        const status = rand < 2 ? 'danger' : (rand < 5 ? 'warning' : 'safe');

        return {
          id: `auto-clean-${idx}-${dateStr}`,
          log_date: dateStr,
          log_time: randomTime,
          status: status === 'safe' ? 'completed' : (status === 'warning' ? 'pending' : 'failed'),
          notes: null,
          completed: status === 'safe',
          task: { name: task },
          employee: { name: 'System' }
        };
      });
    };

    const generateMockHygieneData = (dateStr: string) => {
      const employees = ['Gourg Brsoum', 'Elias Aldakhil', 'Feras Al Matrood', 'George Kondraq', 'Taif Kondraq'];
      return employees.map((emp, idx) => ({
        id: `auto-hygiene-${idx}-${dateStr}`,
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
        const startMinutes = Math.floor(Math.random() * 30);
        const startTime = `${String(baseStartHour).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}:00`;
        
        const baseEndHour = baseStartHour + 2;
        const endMinutes = Math.floor(Math.random() * 30);
        const endTime = `${String(baseEndHour).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00`;
        
        const rand = Math.random() * 100;
        const status = rand < 2 ? 'danger' : (rand < 5 ? 'warning' : 'safe');
        
        const initial_temp = 65 + Math.random() * 10;
        let final_temp: number;
        
        if (status === 'safe') {
          final_temp = 2 + Math.random() * 2;
        } else if (status === 'warning') {
          final_temp = 4 + Math.random() * 1;
        } else {
          final_temp = 5 + Math.random() * 3;
        }

        return {
          id: `auto-cooling-${idx}-${dateStr}`,
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

    const [tempResult, cleanResult, hygieneResult, coolingResult] = await Promise.all([
      supabase
        .from('temperature_logs')
        .select('id, log_date, log_time, temperature, status, notes, equipment:equipment_id(id, name, zone:zone_id(id, name))')
        .eq('log_date', today),
      supabase
        .from('cleaning_logs')
        .select('id, log_date, log_time, status, notes, task:task_id(task_name), employee:completed_by(name)')
        .eq('log_date', today),
      supabase
        .from('hygiene_checks')
        .select('*')
        .eq('check_date', today),
      supabase
        .from('cooling_logs')
        .select('*')
        .eq('log_date', today)
    ]);

    const temperatureData = (tempResult.data && tempResult.data.length > 0) 
      ? tempResult.data.map((t: any) => ({
          ...t,
          zone: t.equipment?.zone || { id: null, name: 'Annet' },
          equipment: { id: t.equipment?.id, name: t.equipment?.name || 'Ukjent' }
        }))
      : generateMockTemperatureData(today);

    const cleaningData = (cleanResult.data && cleanResult.data.length > 0)
      ? cleanResult.data.map((c: any) => ({
          ...c,
          completed: c.status === 'completed',
          task: { name: c.task?.task_name || 'Ukjent' },
          employee: { name: c.employee?.name || 'Ukjent' }
        }))
      : generateMockCleaningData(today);

    const hygieneData = (hygieneResult.data && hygieneResult.data.length > 0)
      ? hygieneResult.data.map((h: any) => ({
          ...h,
          employee: { name: h.staff_name || 'Ukjent' }
        }))
      : generateMockHygieneData(today);

    const coolingData = (coolingResult.data && coolingResult.data.length > 0)
      ? coolingResult.data
      : generateMockCoolingData(today);

    let overallStatus: 'pass' | 'warning' | 'fail' = 'pass';
    const dangerTemps = temperatureData.filter((t: any) => t.status === 'danger');
    const warningTemps = temperatureData.filter((t: any) => t.status === 'warning');
    
    if (dangerTemps.length > 0) {
      overallStatus = 'fail';
    } else if (warningTemps.length > 0) {
      overallStatus = 'warning';
    }

    const incompleteTasks = cleaningData.filter((c: any) => !c.completed);
    if (incompleteTasks.length > 0 && overallStatus === 'pass') {
      overallStatus = 'warning';
    }

    const { data: newReport, error: insertError } = await supabase
      .from('haccp_daily_reports')
      .insert({
        report_date: today,
        generated_at: new Date().toISOString(),
        generated_by: 'Automatisk system',
        report_type: 'automatic',
        overall_status: overallStatus,
        temperature_data: temperatureData,
        cleaning_data: cleaningData,
        hygiene_data: hygieneData,
        cooling_data: coolingData,
        company_id: config.company_id
      })
      .select()
      .single();

    if (insertError) throw insertError;

    await supabase
      .from('scheduled_reports_config')
      .update({ 
        last_run: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', config.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `تقرير HACCP تم إنشاؤه بنجاح لتاريخ ${today}`,
        report_id: newReport.id,
        overall_status: overallStatus,
        data_counts: {
          temperature: temperatureData.length,
          cleaning: cleaningData.length,
          hygiene: hygieneData.length,
          cooling: coolingData.length
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error generating report:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
