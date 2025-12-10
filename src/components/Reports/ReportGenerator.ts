import { supabase } from '../../lib/supabase';

interface GenerateReportOptions {
  date: string;
  includeViolations?: boolean;
  violationCount?: number;
}

export async function generateIntelligentReport(options: GenerateReportOptions) {
  const { date, includeViolations = true, violationCount = 2 } = options;

  try {
    const { data: zones } = await supabase
      .from('zones')
      .select('*');

    const { data: items } = await supabase
      .from('equipment')
      .select('*, zones(*)')
      .eq('active', true);

    const { data: tasks } = await supabase
      .from('cleaning_tasks')
      .select('*')
      .eq('active', true);

    const { data: profiles } = await supabase
      .from('employees')
      .select('*')
      .eq('status', 'active');

    if (!items || !tasks || !profiles || profiles.length === 0) {
      throw new Error('Mangler nødvendige data for å opprette rapport');
    }

    // Count existing reports to determine violation frequency
    const { count: totalReports } = await supabase
      .from('daily_reports')
      .select('*', { count: 'exact', head: true });

    const reportNumber = (totalReports || 0) + 1;

    // Critical violations: 1 every 10 reports (reduced from every 6)
    const shouldHaveCriticalViolation = reportNumber % 10 === 0;
    // Warning violations: 1 every 8 reports (reduced from every 4)
    const shouldHaveWarningViolation = reportNumber % 8 === 0 || reportNumber % 8 === 4;

    // Separate managers (daglig_leder + kontrollor) from regular staff
    const managers = profiles.filter(p => p.role === 'daglig_leder' || p.role === 'kontrollor');
    const allStaff = profiles;

    const timeSlots = ['11:00', '13:00', '15:00', '17:00', '19:00', '21:00'];
    const tempLogs = [];
    const cleaningLogs = [];
    const hygieneChecks = [];
    const coolingLogs = [];

    let criticalViolationsAdded = 0;
    let warningViolationsAdded = 0;
    const maxCriticalViolations = shouldHaveCriticalViolation ? 1 : 0;
    const maxWarningViolations = shouldHaveWarningViolation ? 1 : 0;

    for (const item of items) {
      const minTemp = parseFloat(item.min_temp);
      const maxTemp = parseFloat(item.max_temp);
      const isFreezer = item.type === 'freezer';
      const isRefrigerator = item.type === 'refrigerator';

      const time = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      let temp: number;
      let status: 'safe' | 'warning' | 'danger';

      // Try critical violation first (reduced probability from 0.4 to 0.2)
      const shouldHaveCritical = includeViolations &&
                                criticalViolationsAdded < maxCriticalViolations &&
                                Math.random() < 0.2;

      // Then try warning violation (reduced probability from 0.4 to 0.25)
      const shouldHaveWarning = !shouldHaveCritical &&
                               includeViolations &&
                               warningViolationsAdded < maxWarningViolations &&
                               Math.random() < 0.25;

      if (shouldHaveCritical) {
        // Critical violations: temperature way outside acceptable range
        if (Math.random() < 0.5) {
          // Too high
          temp = parseFloat((maxTemp + 2 + Math.random() * 2).toFixed(1));
        } else {
          // Too low (beyond extended safe range)
          if (isFreezer) {
            // For freezers: below -32 is critical
            temp = parseFloat((-32 - Math.random() * 3).toFixed(1));
          } else if (isRefrigerator) {
            // For refrigerators: below -4 is critical
            temp = parseFloat((-4 - Math.random() * 2).toFixed(1));
          } else {
            temp = parseFloat((minTemp - 3 - Math.random() * 2).toFixed(1));
          }
        }
        status = 'danger';
        criticalViolationsAdded++;
      } else if (shouldHaveWarning) {
        // Warning violations: slightly outside range
        if (Math.random() < 0.5) {
          // Too high
          temp = parseFloat((maxTemp + 0.5 + Math.random() * 1.5).toFixed(1));
        } else {
          // Too low (but still acceptable for some equipment types)
          temp = parseFloat((minTemp - 0.5 - Math.random() * 1).toFixed(1));
        }
        status = 'warning';
        warningViolationsAdded++;
      } else {
        // Safe range - includes extended safe ranges for specific equipment types
        if (isFreezer) {
          // Freezers: safe from minTemp (e.g., -25) to -32
          // Generate mostly in the standard range, occasionally in extended range
          if (Math.random() < 0.7) {
            // Standard range: minTemp to maxTemp
            const range = maxTemp - minTemp;
            const safeRange = range * 0.7;
            const offset = range * 0.15;
            temp = parseFloat((minTemp + offset + Math.random() * safeRange).toFixed(1));
          } else {
            // Extended safe range: minTemp to -32
            temp = parseFloat((minTemp - Math.random() * 7).toFixed(1));
          }
        } else if (isRefrigerator) {
          // Refrigerators: safe from minTemp (e.g., -2) to -3
          if (Math.random() < 0.8) {
            // Standard range: minTemp to maxTemp
            const range = maxTemp - minTemp;
            const safeRange = range * 0.7;
            const offset = range * 0.15;
            temp = parseFloat((minTemp + offset + Math.random() * safeRange).toFixed(1));
          } else {
            // Extended safe range: minTemp to -3
            temp = parseFloat((minTemp - Math.random() * 1).toFixed(1));
          }
        } else {
          // Other equipment: standard range only
          const range = maxTemp - minTemp;
          const safeRange = range * 0.7;
          const offset = range * 0.15;
          temp = parseFloat((minTemp + offset + Math.random() * safeRange).toFixed(1));
        }
        status = 'safe';
      }

      // 70% of temperature readings by managers
      const useManager = Math.random() < 0.7 && managers.length > 0;
      const staffPool = useManager ? managers : allStaff;
      const randomProfile = staffPool[Math.floor(Math.random() * staffPool.length)];

      tempLogs.push({
        equipment_id: item.id,
        temperature: temp,
        log_date: date,
        log_time: time,
        status: status,
        recorded_by: randomProfile.id,
        notes: '',
      });
    }

    // Filter tasks based on frequency and date
    const dateObj = new Date(date + 'T12:00:00');
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayOfMonth = dateObj.getDate();
    const isFirstDayOfMonth = dayOfMonth === 1;
    const isMonday = dayOfWeek === 1;

    const tasksForToday = tasks.filter(task => {
      if (task.frequency === 'daily') {
        return true;
      } else if (task.frequency === 'weekly') {
        return isMonday;
      } else if (task.frequency === 'monthly') {
        return isFirstDayOfMonth;
      }
      return true;
    });

    for (const task of tasksForToday) {
      const shouldComplete = Math.random() > 0.1;
      const time = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      const randomProfile = profiles[Math.floor(Math.random() * profiles.length)];

      let notes = '';
      if (!shouldComplete) {
        notes = ['Mangler tid', 'Utstyr ikke tilgjengelig', 'Planlagt senere'][Math.floor(Math.random() * 3)];
      } else {
        const completedComments = [
          'Utført som planlagt',
          'Gjennomført OK',
          'Fullført uten problemer',
          'Alt i orden',
          'Utført grundig',
          'Gjennomført i henhold til prosedyre'
        ];
        notes = completedComments[Math.floor(Math.random() * completedComments.length)];
      }

      cleaningLogs.push({
        task_id: task.id,
        log_date: date,
        log_time: time,
        status: shouldComplete ? 'completed' : 'incomplete',
        notes: notes,
        completed_by: randomProfile.id,
      });
    }

    await supabase.from('temperature_logs').delete().eq('log_date', date);
    await supabase.from('cleaning_logs').delete().eq('log_date', date);
    await supabase.from('hygiene_checks').delete().eq('check_date', date);
    await supabase.from('cooling_logs').delete().eq('log_date', date);

    if (tempLogs.length > 0) {
      await supabase.from('temperature_logs').insert(tempLogs);
    }

    if (cleaningLogs.length > 0) {
      await supabase.from('cleaning_logs').insert(cleaningLogs);
    }

    // Hygiene checks - get scheduled employees for this day
    const { data: scheduledEmployees } = await supabase
      .rpc('get_scheduled_employees_for_date', { target_date: date });

    let selectedEmployees = [];

    if (scheduledEmployees && scheduledEmployees.length > 0) {
      // Use scheduled employees
      selectedEmployees = scheduledEmployees.map((se: any) => ({
        id: se.employee_id,
        name: se.employee_name
      }));
    } else {
      // Fallback: use random employees if no schedule exists
      let numEmployeesForDay;
      if (dayOfWeek >= 1 && dayOfWeek <= 4) {
        // Monday-Thursday: 2-3 employees
        numEmployeesForDay = Math.random() < 0.5 ? 2 : 3;
      } else {
        // Friday-Sunday: 3-4 employees
        numEmployeesForDay = Math.floor(Math.random() * 2) + 3;
      }

      const shuffledEmployees = [...allStaff].sort(() => Math.random() - 0.5);
      selectedEmployees = shuffledEmployees.slice(0, Math.min(numEmployeesForDay, allStaff.length));
    }

    for (const employee of selectedEmployees) {
      const allOk = Math.random() > 0.1;
      hygieneChecks.push({
        check_date: date,
        staff_name: employee.name,
        uniform_clean: allOk || Math.random() > 0.2,
        hands_washed: allOk || Math.random() > 0.1,
        jewelry_removed: allOk || Math.random() > 0.2,
        illness_free: allOk || Math.random() > 0.1,
        notes: allOk ? 'Alt i orden' : 'Se merknader'
      });
    }

    if (hygieneChecks.length > 0) {
      await supabase.from('hygiene_checks').insert(hygieneChecks);
    }

    const productTypes = [
      { type: 'kebab', name: 'Fersk kebabkjøtt' },
      { type: 'chicken', name: 'Grillet kylling' },
      { type: 'kjottsaus', name: 'Tomatkjøttsaus' },
      { type: 'kjottdeig', name: 'Kjøttdeig' },
      { type: 'bacon', name: 'Bacon' }
    ];

    const numCoolingItems = Math.floor(Math.random() * 2) + 2;
    const shuffledProducts = [...productTypes].sort(() => Math.random() - 0.5);
    const selectedProducts = shuffledProducts.slice(0, numCoolingItems);

    let coolingViolationsAdded = 0;
    const maxCoolingViolations = shouldHaveCriticalViolation || shouldHaveWarningViolation ? 1 : 0;

    for (const product of selectedProducts) {
      const shouldViolate = includeViolations &&
                           coolingViolationsAdded < maxCoolingViolations &&
                           Math.random() < 0.05;

      let initialTemp: number;
      let finalTemp: number;
      let withinLimits: boolean;
      let notes = '';

      if (shouldViolate) {
        initialTemp = parseFloat((65 + Math.random() * 10).toFixed(1));
        finalTemp = parseFloat((5 + Math.random() * 15).toFixed(1));
        notes = 'Ikke godkjent – For langsom nedkjøling';
        withinLimits = false;
        coolingViolationsAdded++;
      } else {
        initialTemp = parseFloat((65 + Math.random() * 10).toFixed(1));
        finalTemp = Math.random() < 0.5 ? 3 : 4;
        withinLimits = true;
        notes = 'Utmerket nedkjøling';
      }

      const coolingStartSlots = ['11:00', '12:00', '13:00', '14:00', '15:00'];
      const startTime = coolingStartSlots[Math.floor(Math.random() * coolingStartSlots.length)];
      const startHour = parseInt(startTime.split(':')[0]);
      const endHour = startHour + 6;
      const endTimeStr = `${endHour.toString().padStart(2, '0')}:00`;

      coolingLogs.push({
        log_date: date,
        product_type: product.type,
        product_name: product.name,
        initial_temp: initialTemp,
        final_temp: finalTemp,
        start_time: `${date}T${startTime}:00`,
        end_time: `${date}T${endTimeStr}:00`,
        within_limits: withinLimits,
        notes: notes
      });
    }

    console.log('🧊 Cooling logs to insert:', coolingLogs.length, 'records');
    console.log('🧊 Cooling logs data:', JSON.stringify(coolingLogs, null, 2));

    if (coolingLogs.length > 0) {
      const { data: insertedCooling, error: coolingError } = await supabase.from('cooling_logs').insert(coolingLogs).select();
      console.log('🧊 Cooling logs inserted:', insertedCooling?.length || 0);
      if (coolingError) console.error('❌ Cooling logs error:', coolingError);
    }

    const totalViolations = tempLogs.filter(l => l.status === 'danger' || l.status === 'warning').length;
    const overallStatus = totalViolations >= 5
      ? 'danger'
      : totalViolations >= 3
      ? 'warning'
      : 'safe';

    const { data: existingReport } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('report_date', date)
      .maybeSingle();

    const generatorId = profiles[0].id;

    if (existingReport) {
      const { data: report } = await supabase
        .from('daily_reports')
        .update({
          overall_status: overallStatus,
          generated_by: generatorId,
        })
        .eq('id', existingReport.id)
        .select()
        .single();

      return report;
    } else {
      const { data: report } = await supabase
        .from('daily_reports')
        .insert({
          report_date: date,
          overall_status: overallStatus,
          generated_by: generatorId,
          content: {},
        })
        .select()
        .single();

      return report;
    }
  } catch (error) {
    console.error('Error generating intelligent report:', error);
    throw error;
  }
}
