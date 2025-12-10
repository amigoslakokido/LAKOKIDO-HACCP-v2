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
      .single();

    if (!config || !config.enabled) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'AI system is not enabled. Please configure API key in settings.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
  const analysisPrompt = buildAnalysisPrompt(section, sectionData, config.language);

  let analysisResult;
  if (config.openai_api_key) {
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
  const { data: analyses } = await supabase
    .from('hms_ai_analysis')
    .select('*')
    .eq('section_name', section)
    .order('analyzed_at', { ascending: false })
    .limit(10);

  const reportPrompt = buildReportPrompt(section, sectionData, analyses, config.language);

  let reportContent;
  if (config.openai_api_key) {
    reportContent = await callOpenAI(reportPrompt, config);
  } else {
    reportContent = generateLocalReport(section, sectionData, analyses);
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
  const dataMap: any = {
    'risk-assessment': async () => {
      const { data } = await supabase.from('hms_risk_assessments').select('*');
      return data || [];
    },
    'first-aid': async () => {
      const [responsible, equipment, inspections] = await Promise.all([
        supabase.from('hms_first_aid_responsible').select('*').single(),
        supabase.from('hms_first_aid_equipment').select('*'),
        supabase.from('hms_first_aid_inspections').select('*'),
      ]);
      return { responsible: responsible.data, equipment: equipment.data, inspections: inspections.data };
    },
    'fire-safety': async () => {
      const [responsible, equipment, inspections] = await Promise.all([
        supabase.from('hms_fire_responsible').select('*').single(),
        supabase.from('hms_fire_equipment').select('*'),
        supabase.from('hms_fire_inspections').select('*'),
      ]);
      return { responsible: responsible.data, equipment: equipment.data, inspections: inspections.data };
    },
    'work-environment': async () => {
      const { data } = await supabase.from('hms_work_environment').select('*');
      return data || [];
    },
  };

  if (dataMap[section]) {
    return await dataMap[section]();
  }
  return [];
}

function buildAnalysisPrompt(section: string, data: any, language: string) {
  const sectionNames: any = {
    'risk-assessment': 'Risikovurdering',
    'first-aid': 'Førstehjelp',
    'fire-safety': 'Brannsikkerhet',
    'work-environment': 'Arbeidsmiljø',
  };

  return `Du er en HMS-ekspert som analyserer ${sectionNames[section]} for en restaurant.

Data: ${JSON.stringify(data, null, 2)}

Analyser dataene og identifiser:
1. Potensielle problemer eller risikoer
2. Områder som trenger forbedring
3. Kritiske mangler eller avvik
4. Forebyggende tiltak som bør implementeres

Svar i følgende JSON-format:
{
  "severity": "low|medium|high|critical",
  "title": "Kort tittel på analysen",
  "description": "Detaljert beskrivelse av situasjonen",
  "issues": ["problem 1", "problem 2"],
  "solutions": ["løsning 1", "løsning 2"],
  "risk_score": 0-100,
  "priority": "low|medium|high|urgent"
}`;
}

function buildReportPrompt(section: string, data: any, analyses: any[], language: string) {
  return `Generer en omfattende HMS-rapport for ${section}.

Data: ${JSON.stringify(data, null, 2)}
Tidligere analyser: ${JSON.stringify(analyses, null, 2)}

Rapporten skal inneholde:
1. Sammendrag av nåværende status
2. Statistikk og nøkkeltall
3. Identifiserte problemer og risik oer
4. Anbefalinger for forbedring
5. Handlingsplan

Svar i JSON-format med strukturert innhold.`;
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
  const dataArray = Array.isArray(data) ? data : data.equipment || [];
  const issues: string[] = [];
  const solutions: string[] = [];
  let riskScore = 0;

  if (section === 'risk-assessment') {
    const highRisks = dataArray.filter((r: any) => r.risk_level === 'Høy' || r.risk_level === 'Kritisk');
    const openRisks = dataArray.filter((r: any) => r.status === 'Åpen');

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
  }

  if (section === 'fire-safety') {
    const defectEquipment = dataArray.filter((e: any) => e.status === 'Defekt' || e.status === 'Trenger service');
    if (defectEquipment.length > 0) {
      issues.push(`${defectEquipment.length} enheter brannsikkerhetsutstyr trenger service`);
      solutions.push('Planlegg umiddelbar service eller utskifting av defekt utstyr');
      riskScore += defectEquipment.length * 20;
    }
  }

  if (section === 'first-aid') {
    if (!data.responsible) {
      issues.push('Ingen førstehjelpsansvarlig registrert');
      solutions.push('Utpek og opplær førstehjelpsansvarlig umiddelbart');
      riskScore += 30;
    }

    if (data.equipment && data.equipment.length === 0) {
      issues.push('Ingen førstehjelpssutstyr registrert');
      solutions.push('Skaff og registrer nødvendig førstehjelpssutstyr');
      riskScore += 25;
    }
  }

  const severity = riskScore > 70 ? 'critical' : riskScore > 40 ? 'high' : riskScore > 20 ? 'medium' : 'low';
  const priority = riskScore > 70 ? 'urgent' : riskScore > 40 ? 'high' : riskScore > 20 ? 'medium' : 'low';

  return {
    severity,
    title: `${section} - Analyse`,
    description: issues.length > 0 ? `Identifisert ${issues.length} problemer som krever oppmerksomhet.` : 'Ingen kritiske problemer identifisert.',
    issues,
    solutions,
    risk_score: Math.min(riskScore, 100),
    priority,
  };
}

function generateLocalReport(section: string, data: any, analyses: any[]) {
  const dataArray = Array.isArray(data) ? data : data.equipment || [];
  const criticalFindings = analyses.filter((a: any) => a.severity === 'critical' || a.severity === 'high').length;
  const warningsCount = analyses.filter((a: any) => a.severity === 'medium').length;

  return {
    title: `${section} - Rapport`,
    summary: `Omfattende rapport for ${section}. ${criticalFindings} kritiske funn, ${warningsCount} advarsler.`,
    content: {
      overview: `Totalt ${dataArray.length} registreringer`,
      recent_analyses: analyses.slice(0, 5),
      key_metrics: {
        total_items: dataArray.length,
        critical_issues: criticalFindings,
        warnings: warningsCount,
      },
    },
    statistics: {
      total_entries: dataArray.length,
      critical_count: criticalFindings,
      warning_count: warningsCount,
    },
    recommendations: analyses.flatMap((a: any) => a.suggested_solutions || []).slice(0, 10),
    critical_findings: criticalFindings,
    warnings_count: warningsCount,
    compliance_score: Math.max(0, 100 - (criticalFindings * 15) - (warningsCount * 5)),
  };
}
