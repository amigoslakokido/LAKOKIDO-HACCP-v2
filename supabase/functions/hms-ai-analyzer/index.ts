import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AnalysisRequest {
  section: string;
  action: 'analyze' | 'generate_report' | 'get_insights';
  data?: any;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { section, action, data }: AnalysisRequest = await req.json();

    const { data: config } = await supabase
      .from('hms_ai_config')
      .select('*')
      .maybeSingle();

    if (action === 'analyze') {
      const analysis = await analyzeSection(section, data, config, supabase);
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'generate_report') {
      const report = await generateReport(section, data, config, supabase);
      return new Response(JSON.stringify(report), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get_insights') {
      const insights = await getInsights(section, config, supabase);
      return new Response(JSON.stringify(insights), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  } catch (error) {
    console.error('Error in HMS AI Analyzer:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function analyzeSection(section: string, data: any, config: any, supabase: any) {
  const sectionData = await fetchSectionData(section, supabase);
  const analysisPrompt = buildAnalysisPrompt(section, sectionData, config?.language || 'no');

  let analysisResult;
  if (config?.openai_api_key && config?.enabled) {
    analysisResult = await callOpenAI(analysisPrompt, config);
  } else {
    analysisResult = await performLocalAnalysis(section, sectionData);
  }

  await supabase.from('hms_ai_analysis').insert({
    section_name: section,
    analysis_type: 'comprehensive',
    severity: analysisResult.severity,
    title: analysisResult.title,
    description: analysisResult.description,
    detected_issues: analysisResult.issues,
    suggested_solutions: analysisResult.solutions,
    risk_score: analysisResult.risk_score,
    priority: analysisResult.priority,
  });

  return { success: true, analysis: analysisResult };
}

async function generateReport(section: string, data: any, config: any, supabase: any) {
  const sectionData = await fetchSectionData(section, supabase);
  const { data: knowledge } = await supabase
    .from('hms_ai_knowledge_base')
    .select('*')
    .eq('section_code', section)
    .maybeSingle();

  const { data: analyses } = await supabase
    .from('hms_ai_analysis')
    .select('*')
    .eq('section_name', section)
    .order('analyzed_at', { ascending: false })
    .limit(10);

  const reportPrompt = buildReportPrompt(section, sectionData, analyses, config?.language || 'no');

  let reportContent;
  if (config?.openai_api_key && config?.enabled) {
    reportContent = await callOpenAI(reportPrompt, config);
  } else {
    reportContent = generateLocalReport(section, sectionData, analyses, knowledge);
  }

  const report = {
    report_type: 'comprehensive',
    section_name: section,
    title: reportContent.title,
    summary: reportContent.summary,
    content: reportContent.content,
    statistics: reportContent.statistics,
    recommendations: reportContent.recommendations,
    critical_findings: reportContent.critical_findings,
    warnings_count: reportContent.warnings_count,
    compliance_score: reportContent.compliance_score,
    period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    period_end: new Date().toISOString(),
  };

  const { data: savedReport } = await supabase
    .from('hms_ai_reports')
    .insert(report)
    .select()
    .single();

  return { success: true, report: savedReport };
}

async function getInsights(section: string, config: any, supabase: any) {
  const { data: insights } = await supabase
    .from('hms_ai_insights')
    .select('*')
    .or(`section_name.eq.${section},section_name.is.null`)
    .eq('status', 'new')
    .order('created_at', { ascending: false });

  return { success: true, insights };
}

async function fetchSectionData(section: string, supabase: any) {
  try {
    const dataMap: any = {
      'incidents': async () => {
        const [incidents, deviations, followup] = await Promise.all([
          supabase.from('hms_incidents').select('*'),
          supabase.from('hms_deviations').select('*'),
          supabase.from('hms_followup').select('*'),
        ]);
        return {
          incidents: incidents.data || [],
          deviations: deviations.data || [],
          followup: followup.data || []
        };
      },
      'risk_assessment': async () => {
        const { data } = await supabase.from('hms_risk_assessments').select('*');
        return { assessments: data || [] };
      },
      'fire_safety': async () => {
        const [responsible, equipment, inspections, deviations] = await Promise.all([
          supabase.from('hms_fire_responsible').select('*'),
          supabase.from('hms_fire_equipment').select('*'),
          supabase.from('hms_fire_inspections').select('*'),
          supabase.from('hms_fire_deviations').select('*'),
        ]);
        return {
          responsible: responsible.data || [],
          equipment: equipment.data || [],
          inspections: inspections.data || [],
          deviations: deviations.data || []
        };
      },
      'first_aid': async () => {
        const [responsible, equipment, inspections] = await Promise.all([
          supabase.from('hms_first_aid_responsible').select('*'),
          supabase.from('hms_first_aid_equipment').select('*'),
          supabase.from('hms_first_aid_inspections').select('*'),
        ]);
        return {
          responsible: responsible.data || [],
          equipment: equipment.data || [],
          inspections: inspections.data || []
        };
      },
      'evacuation': async () => {
        const [plan, drills, roles, routes] = await Promise.all([
          supabase.from('hms_evacuation_plan').select('*'),
          supabase.from('hms_evacuation_drills').select('*'),
          supabase.from('hms_evacuation_roles').select('*'),
          supabase.from('hms_escape_routes').select('*'),
        ]);
        return {
          plan: plan.data || [],
          drills: drills.data || [],
          roles: roles.data || [],
          routes: routes.data || []
        };
      },
      'training': async () => {
        const [training, attendees, history] = await Promise.all([
          supabase.from('hms_training').select('*'),
          supabase.from('hms_training_attendees').select('*'),
          supabase.from('hms_training_history').select('*'),
        ]);
        return {
          training: training.data || [],
          attendees: attendees.data || [],
          history: history.data || []
        };
      },
      'work_environment': async () => {
        const [assessments, deviations, items] = await Promise.all([
          supabase.from('hms_work_environment_assessments').select('*'),
          supabase.from('hms_work_environment_deviations').select('*'),
          supabase.from('hms_work_environment_items').select('*'),
        ]);
        return {
          assessments: assessments.data || [],
          deviations: deviations.data || [],
          items: items.data || []
        };
      },
      'environment': async () => {
        const [waste, products, oil, grease, transport, goals] = await Promise.all([
          supabase.from('hms_environment_waste').select('*'),
          supabase.from('hms_environment_cleaning_products').select('*'),
          supabase.from('hms_environment_frying_oil').select('*'),
          supabase.from('hms_environment_grease_trap').select('*'),
          supabase.from('hms_environment_green_transport').select('*'),
          supabase.from('hms_environment_goals').select('*'),
        ]);
        return {
          waste: waste.data || [],
          products: products.data || [],
          oil: oil.data || [],
          grease: grease.data || [],
          transport: transport.data || [],
          goals: goals.data || []
        };
      },
      'maintenance': async () => {
        const { data } = await supabase.from('hms_maintenance').select('*');
        return { maintenance: data || [] };
      },
      'personnel': async () => {
        const [personnel, employees, safety_rep] = await Promise.all([
          supabase.from('hms_personnel').select('*'),
          supabase.from('hms_employees').select('*'),
          supabase.from('hms_safety_representative').select('*'),
        ]);
        return {
          personnel: personnel.data || [],
          employees: employees.data || [],
          safety_rep: safety_rep.data || []
        };
      },
      'insurance': async () => {
        const { data } = await supabase.from('hms_insurance_companies').select('*');
        return { insurance: data || [] };
      },
      'documents': async () => {
        const [documents, categories] = await Promise.all([
          supabase.from('hms_documents').select('*'),
          supabase.from('hms_categories').select('*'),
        ]);
        return {
          documents: documents.data || [],
          categories: categories.data || []
        };
      },
    };

    if (dataMap[section]) {
      return await dataMap[section]();
    }
    return {};
  } catch (error) {
    console.error(`Error fetching data for section ${section}:`, error);
    return {};
  }
}

function buildAnalysisPrompt(section: string, data: any, language: string) {
  const sectionNames: any = {
    'incidents': 'Hendelser og Avvik',
    'risk_assessment': 'Risikovurdering',
    'first_aid': 'Førstehjelp',
    'fire_safety': 'Brannsikkerhet',
    'evacuation': 'Evakuering',
    'training': 'Opplæring',
    'work_environment': 'Arbeidsmiljø',
    'environment': 'Miljø',
    'maintenance': 'Vedlikehold',
    'personnel': 'Personell',
    'insurance': 'Forsikring',
    'documents': 'Dokumenter',
  };

  return `Du er en HMS-ekspert som analyserer ${sectionNames[section]} for en restaurant.\n\nData: ${JSON.stringify(data, null, 2)}\n\nAnalyser dataene og identifiser:\n1. Potensielle problemer eller risikoer\n2. Områder som trenger forbedring\n3. Kritiske mangler eller avvik\n4. Forebyggende tiltak som bør implementeres\n\nSvar i følgende JSON-format:\n{\n  "severity": "low|medium|high|critical",\n  "title": "Kort tittel på analysen",\n  "description": "Detaljert beskrivelse av situasjonen",\n  "issues": ["problem 1", "problem 2"],\n  "solutions": ["løsning 1", "løsning 2"],\n  "risk_score": 0-100,\n  "priority": "low|medium|high|urgent"\n}`;
}

function buildReportPrompt(section: string, data: any, analyses: any[], language: string) {
  return `Generer en omfattende HMS-rapport for ${section}.\n\nData: ${JSON.stringify(data, null, 2)}\nTidligere analyser: ${JSON.stringify(analyses, null, 2)}\n\nRapporten skal inneholde:\n1. Sammendrag av nåværende status\n2. Statistikk og nøkkeltall\n3. Identifiserte problemer og risikoer\n4. Anbefalinger for forbedring\n5. Handlingsplan\n\nSvar i JSON-format med strukturert innhold.`;
}

async function callOpenAI(prompt: string, config: any) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openai_api_key}`,
      },
      body: JSON.stringify({
        model: config.ai_model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Du er en HMS-ekspert for restaurantbransjen i Norge.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    const result = await response.json();
    return JSON.parse(result.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}

async function performLocalAnalysis(section: string, data: any) {
  const issues: string[] = [];
  const solutions: string[] = [];
  let riskScore = 0;

  if (section === 'incidents') {
    const incidents = data.incidents || [];
    const criticalIncidents = incidents.filter((i: any) => i.severity === 'critical' || i.severity === 'høy');
    const openFollowups = data.followup?.filter((f: any) => f.status === 'Åpen') || [];

    if (criticalIncidents.length > 0) {
      issues.push(`${criticalIncidents.length} kritiske hendelser registrert`);
      solutions.push('Prioriter umiddelbar oppfølging av kritiske hendelser');
      riskScore += criticalIncidents.length * 20;
    }

    if (openFollowups.length > 0) {
      issues.push(`${openFollowups.length} åpne oppfølginger som venter på lukking`);
      solutions.push('Fullfør og dokumenter alle åpne oppfølginger');
      riskScore += openFollowups.length * 10;
    }

    if (incidents.length === 0) {
      solutions.push('Sørg for at alle hendelser blir rapportert og dokumentert');
    }
  }

  if (section === 'risk_assessment') {
    const assessments = data.assessments || [];
    const highRisks = assessments.filter((r: any) => r.risk_level === 'Høy' || r.risk_level === 'Kritisk');
    const openRisks = assessments.filter((r: any) => r.status === 'Åpen');

    if (highRisks.length > 0) {
      issues.push(`${highRisks.length} høy-risiko elementer identifisert`);
      solutions.push('Prioriter umiddelbare tiltak for høy-risiko områder');
      riskScore += highRisks.length * 15;
    }

    if (openRisks.length > 0) {
      issues.push(`${openRisks.length} åpne risikovurderinger som trenger oppfølging`);
      solutions.push('Tildel ansvarlige og sett frister for alle åpne risikovurderinger');
      riskScore += openRisks.length * 10;
    }

    if (assessments.length === 0) {
      issues.push('Ingen risikovurderinger registrert');
      solutions.push('Gjennomfør systematisk risikovurdering av alle arbeidsområder');
      riskScore += 40;
    }
  }

  if (section === 'fire_safety') {
    const equipment = data.equipment || [];
    const inspections = data.inspections || [];
    const defectEquipment = equipment.filter((e: any) => e.status === 'Defekt' || e.status === 'Trenger service');

    if (defectEquipment.length > 0) {
      issues.push(`${defectEquipment.length} enheter brannsikkerhetsutstyr trenger service`);
      solutions.push('Planlegg umiddelbar service eller utskifting av defekt utstyr');
      riskScore += defectEquipment.length * 20;
    }

    if (equipment.length === 0) {
      issues.push('Ingen brannsikkerhetsutstyr registrert');
      solutions.push('Registrer alt brannsikkerhetsutstyr med plassering og kontrolldatoer');
      riskScore += 35;
    }

    if (inspections.length === 0) {
      solutions.push('Gjennomfør regelmessige branninspeksjoner og dokumenter resultater');
      riskScore += 15;
    }
  }

  if (section === 'first_aid') {
    const equipment = data.equipment || [];
    const responsible = data.responsible || [];

    if (responsible.length === 0) {
      issues.push('Ingen førstehjelpsansvarlig registrert');
      solutions.push('Utpek og opplær førstehjelpsansvarlig umiddelbart');
      riskScore += 30;
    }

    if (equipment.length === 0) {
      issues.push('Ingen førstehjelpssutstyr registrert');
      solutions.push('Skaff og registrer nødvendig førstehjelpssutstyr');
      riskScore += 25;
    }

    const expiredItems = equipment.filter((e: any) => e.expiry_date && new Date(e.expiry_date) < new Date());
    if (expiredItems.length > 0) {
      issues.push(`${expiredItems.length} førstehjelpsartikler har utgått på dato`);
      solutions.push('Erstatt utgåtte førstehjelpsartikler umiddelbart');
      riskScore += expiredItems.length * 10;
    }
  }

  if (section === 'training') {
    const training = data.training || [];
    const attendees = data.attendees || [];

    if (training.length === 0) {
      issues.push('Ingen opplæringer registrert i systemet');
      solutions.push('Opprett opplæringsplan og gjennomfør nødvendig opplæring');
      riskScore += 30;
    }

    const completionRate = attendees.filter((a: any) => a.completed).length / Math.max(1, attendees.length);
    if (completionRate < 0.8) {
      issues.push('Lav gjennomføringsgrad på opplæring');
      solutions.push('Følg opp ansatte som mangler påkrevd opplæring');
      riskScore += 15;
    }
  }

  if (section === 'environment') {
    const waste = data.waste || [];
    const goals = data.goals || [];
    const oil = data.oil || [];

    if (goals.length === 0) {
      solutions.push('Sett konkrete miljømål for virksomheten');
      riskScore += 10;
    }

    if (waste.length === 0) {
      solutions.push('Opprett avfallsplan og dokumenter avfallshåndtering');
      riskScore += 15;
    }

    if (oil.length === 0) {
      solutions.push('Dokumenter håndtering og avhending av frityrolje');
      riskScore += 10;
    }
  }

  if (section === 'personnel') {
    const personnel = data.personnel || [];
    const employees = data.employees || [];
    const safetyRep = data.safety_rep || [];

    if (safetyRep.length === 0) {
      issues.push('Ingen verneombud registrert');
      solutions.push('Oppnevn verneombud i henhold til arbeidsmiljøloven');
      riskScore += 25;
    }

    if (employees.length === 0) {
      solutions.push('Registrer alle ansatte i systemet');
      riskScore += 15;
    }
  }

  if (issues.length === 0 && solutions.length === 0) {
    solutions.push('Fortsett det gode HMS-arbeidet og oppdater dokumentasjon regelmessig');
    solutions.push('Gjennomfør jevnlige kontroller og vurderinger');
  }

  const severity = riskScore > 70 ? 'critical' : riskScore > 40 ? 'high' : riskScore > 20 ? 'medium' : 'low';
  const priority = riskScore > 70 ? 'urgent' : riskScore > 40 ? 'high' : riskScore > 20 ? 'medium' : 'low';

  return {
    severity,
    title: `${section} - Analyse`,
    description: issues.length > 0 ? `Identifisert ${issues.length} problemer som krever oppmerksomhet.` : 'God HMS-praksis observert. Fortsett det systematiske arbeidet.',
    issues,
    solutions,
    risk_score: Math.min(riskScore, 100),
    priority,
  };
}

function generateLocalReport(section: string, data: any, analyses: any[], knowledge: any) {
  const sectionNames: any = {
    'incidents': 'Hendelser og Avvik',
    'risk_assessment': 'Risikovurdering',
    'first_aid': 'Førstehjelp',
    'fire_safety': 'Brannsikkerhet',
    'evacuation': 'Evakuering',
    'training': 'Opplæring',
    'work_environment': 'Arbeidsmiljø',
    'environment': 'Miljø',
    'maintenance': 'Vedlikehold',
    'personnel': 'Personell',
    'insurance': 'Forsikring',
    'documents': 'Dokumenter',
  };

  const title = `${sectionNames[section]} - HMS Rapport`;
  let totalEntries = 0;
  let summary = '';
  const recommendations: string[] = [];

  Object.values(data).forEach((value: any) => {
    if (Array.isArray(value)) {
      totalEntries += value.length;
    }
  });

  const criticalFindings = (analyses || []).filter((a: any) => a.severity === 'critical' || a.severity === 'high').length;
  const warningsCount = (analyses || []).filter((a: any) => a.severity === 'medium').length;

  if (totalEntries > 0) {
    summary = `Rapporten dekker ${sectionNames[section]} med totalt ${totalEntries} registreringer i perioden. `;
    if (criticalFindings > 0) {
      summary += `Det er identifisert ${criticalFindings} kritiske funn som krever umiddelbar oppmerksomhet. `;
    }
    if (warningsCount > 0) {
      summary += `I tillegg er det ${warningsCount} advarsler som bør følges opp. `;
    }
    if (criticalFindings === 0 && warningsCount === 0) {
      summary += 'Ingen kritiske avvik eller advarsler registrert. ';
    }
    summary += 'Se detaljert analyse og anbefalinger nedenfor.';
  } else {
    summary = `Ingen data registrert for ${sectionNames[section]} i perioden. Det anbefales å starte systematisk registrering for å sikre god HMS-praksis og etterlevelse av regelverket.`;
    recommendations.push(`Start systematisk registrering i ${sectionNames[section]}`);
    recommendations.push('Opprett rutiner for regelmessig dokumentasjon');
    recommendations.push('Gjennomfør nødvendig opplæring av ansatte');
  }

  if (analyses && analyses.length > 0) {
    analyses.forEach((a: any) => {
      if (a.suggested_solutions) {
        (a.suggested_solutions as string[]).forEach((sol: string) => {
          if (!recommendations.includes(sol)) {
            recommendations.push(sol);
          }
        });
      }
    });
  }

  if (recommendations.length === 0) {
    recommendations.push('Fortsett det systematiske HMS-arbeidet');
    recommendations.push('Gjennomfør regelmessige kontroller og oppdateringer');
    recommendations.push('Hold dokumentasjonen oppdatert');
  }

  const compliance_score = Math.max(0, 100 - (criticalFindings * 15) - (warningsCount * 5));

  return {
    title,
    summary,
    content: {
      overview: `Totalt ${totalEntries} registreringer`,
      data_summary: data,
      recent_analyses: analyses?.slice(0, 5) || [],
      key_metrics: {
        total_items: totalEntries,
        critical_issues: criticalFindings,
        warnings: warningsCount,
      },
      knowledge_base: knowledge ? {
        regulations: knowledge.regulations || [],
        best_practices: knowledge.best_practices || '',
      } : null,
    },
    statistics: {
      total_entries: totalEntries,
      critical_count: criticalFindings,
      warning_count: warningsCount,
      compliance_rate: compliance_score,
    },
    recommendations: recommendations.slice(0, 10),
    critical_findings: criticalFindings,
    warnings_count: warningsCount,
    compliance_score,
  };
}
