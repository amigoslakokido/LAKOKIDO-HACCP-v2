import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'assist';
    const section = url.searchParams.get('section');
    const body = await req.json();

    let response;

    if (action === 'generate-report' && section) {
      response = await generateSectionReport(section, body);
    } else {
      const sectionPath = url.pathname.split('/').pop();
      response = await handleAssistant(sectionPath || section, body);
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

async function generateSectionReport(sectionCode: string, data: any) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data: knowledgeBase, error: kbError } = await supabase
    .from('hms_ai_knowledge_base')
    .select('*')
    .eq('section_code', sectionCode)
    .maybeSingle();

  if (kbError || !knowledgeBase) {
    return {
      success: false,
      error: 'Knowledge base not found for section: ' + sectionCode
    };
  }

  const sectionData: any = {};
  for (const table of knowledgeBase.related_tables) {
    const { data: tableData } = await supabase
      .from(table)
      .select('*')
      .limit(100);

    if (tableData) {
      sectionData[table] = tableData;
    }
  }

  let aiReport;
  if (OPENAI_API_KEY) {
    aiReport = await generateWithChatGPT(knowledgeBase, sectionData, data);
  } else {
    aiReport = await generateFallbackReport(knowledgeBase, sectionData, data);
  }

  return {
    success: true,
    report: aiReport,
    section: knowledgeBase.section_name_no,
    generatedAt: new Date().toISOString()
  };
}

async function generateWithChatGPT(knowledgeBase: any, sectionData: any, additionalContext: any) {
  const prompt = `
Du er en profesjonell HMS-rådgiver som lager detaljerte rapporter på norsk.

SEKSJON: ${knowledgeBase.section_name_no} (${knowledgeBase.section_name_en})
BESKRIVELSE: ${knowledgeBase.description}
RETNINGSLINJER: ${knowledgeBase.analysis_guidelines}

DATA FRA SYSTEMET:
${JSON.stringify(sectionData, null, 2)}

TILLEGGSKONTEKST:
${JSON.stringify(additionalContext, null, 2)}

Lag en profesjonell HMS-rapport som inkluderer:

1. **Sammendrag** (2-3 avsnitt)
   - Overordnet vurdering av situasjonen
   - Viktigste funn

2. **Detaljert analyse**
   - Analyse av data fra tabellene
   - Identifiser trender og mønstre
   - Vurder compliance med forskrifter: ${knowledgeBase.regulations?.join(', ')}

3. **Statistikk og nøkkeltall**
   - Presenter relevante tall og statistikk
   - Sammenlign med beste praksis

4. **Identifiserte risikoer og utfordringer**
   - List opp potensielle problemer
   - Vurder alvorlighetsgrad

5. **Anbefalinger og tiltak**
   - Konkrete, handlingsrettede anbefalinger
   - Prioriter etter viktighet
   - Foreslå tidslinje

6. **Konklusjon**
   - Oppsummering
   - Neste steg

Rapporten skal være profesjonell, grundig og bruke norsk terminologi.
Alle setninger skal være komplette og profesjonelt formulert.
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Du er en profesjonell HMS-rådgiver med dyp kunnskap om norsk arbeidsmiljølov og HMS-forskrifter. Du lager detaljerte, profesjonelle rapporter på norsk.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'OpenAI API error');
    }

    return {
      content: result.choices[0].message.content,
      source: 'chatgpt',
      model: 'gpt-4o-mini'
    };
  } catch (error) {
    console.error('ChatGPT error:', error);
    return await generateFallbackReport(knowledgeBase, sectionData, additionalContext);
  }
}

async function generateFallbackReport(knowledgeBase: any, sectionData: any, additionalContext: any) {
  const dataCount = Object.values(sectionData).reduce((acc: number, data: any) => acc + (data?.length || 0), 0);

  let summary = `# ${knowledgeBase.section_name_no} - Rapport\n\n`;
  summary += `## Sammendrag\n\n`;
  summary += `Denne rapporten gir en oversikt over ${knowledgeBase.section_name_no.toLowerCase()} i virksomheten. `;
  summary += `Totalt ${dataCount} registreringer er analysert fra ${knowledgeBase.related_tables.length} ulike tabeller.\n\n`;

  summary += `## Datagrunnlag\n\n`;
  for (const [table, data] of Object.entries(sectionData)) {
    const records = data as any[];
    summary += `- **${table}**: ${records.length} registreringer\n`;
  }

  summary += `\n## Analyseguide\n\n${knowledgeBase.analysis_guidelines}\n\n`;

  if (knowledgeBase.regulations && knowledgeBase.regulations.length > 0) {
    summary += `## Relevante forskrifter\n\n`;
    for (const reg of knowledgeBase.regulations) {
      summary += `- ${reg}\n`;
    }
    summary += '\n';
  }

  summary += `## Anbefalinger\n\n`;
  summary += `1. Oppretthold systematisk registrering av data\n`;
  summary += `2. Gjennomgå og oppdater rutiner regelmessig\n`;
  summary += `3. Sørg for at alle ansatte er kjent med prosedyrene\n`;
  summary += `4. Dokumenter alle avvik og tiltak\n\n`;

  summary += `## Konklusjon\n\n`;
  summary += `Basert på tilgjengelig data viser systemet ${dataCount} registreringer for ${knowledgeBase.section_name_no.toLowerCase()}. `;
  summary += `For mer detaljert analyse, vennligst konfigurer OpenAI API-nøkkel i systeminnstillingene.\n\n`;

  summary += `*Rapport generert: ${new Date().toLocaleString('nb-NO')}*\n`;

  return {
    content: summary,
    source: 'fallback',
    model: 'rule-based'
  };
}

async function handleAssistant(section: string | null, data: any) {
  switch (section) {
    case 'brann':
      return handleBrannAssistant(data);
    case 'forstehjelp':
      return handleForstehjelpAssistant(data);
    case 'risikoanalyse':
      return handleRisikoanalyseAssistant(data);
    case 'arbeidsmiljo':
      return handleArbeidsmiljoAssistant(data);
    case 'hendelser':
      return handleHendelserAssistant(data);
    case 'avvik':
      return handleAvvikAssistant(data);
    case 'opplaering':
      return handleOpplaeringAssistant(data);
    case 'dokumenter':
      return handleDokumenterAssistant(data);
    case 'rapport':
      return handleRapportAssistant(data);
    case 'miljo':
      return handleMiljoAssistant(data);
    default:
      return handleGeneralAssistant(data);
  }
}

function handleBrannAssistant(data: any) {
  const forslag = [];
  const tiltak = [];
  const kommentarer = [];
  const manglende = [];

  if (!data.slokkeutstyr || data.slokkeutstyr.length === 0) {
    manglende.push('Slokkeutstyr må registreres');
    tiltak.push('Registrer alle brannslokningsapparater med plassering og kontrolldato');
  }

  if (!data.rømningsveier || data.rømningsveier.length === 0) {
    manglende.push('Rømningsveier må dokumenteres');
    tiltak.push('Kartlegg og dokumenter alle rømningsveier med tydelig merking');
  }

  if (!data.nestekontroll) {
    forslag.push('Planlegg neste brannkontroll for å sikre overholdelse av forskrifter');
  }

  if (data.opplaeringStatus === 'mangler') {
    tiltak.push('Gjennomfør brannøvelse for alle ansatte');
    kommentarer.push('Brannøvelse anbefales minst én gang per år');
  }

  forslag.push('Kontroller at alle nødutganger er lett tilgjengelige');
  forslag.push('Sørg for at brannalarmen testes regelmessig');
  kommentarer.push('Basert på registrerte opplysninger er det viktig å holde god oversikt over alt brannsikkerhetsutstyr');

  return { forslag, tiltak, kommentarer, manglende };
}

function handleForstehjelpAssistant(data: any) {
  const forslag = [];
  const tiltak = [];
  const kommentarer = [];
  const manglende = [];

  if (!data.utstyr || data.utstyr.length === 0) {
    manglende.push('Førstehjelpssutstyr må registreres');
    tiltak.push('Registrer alle førstehjelpsskap og kontroller innhold');
  }

  if (!data.opplartePersoner || data.opplartePersoner === 0) {
    tiltak.push('Sørg for at minst to ansatte har gyldig førstehjelpsopplæring');
    kommentarer.push('Det anbefales at 10% av de ansatte har førstehjelpsopplæring');
  }

  if (data.utlopsdato && new Date(data.utlopsdato) < new Date()) {
    tiltak.push('Fornye førstehjelpsopplæring for ansatte med utgått sertifikat');
  }

  forslag.push('Kontroller at førstehjelpsskap er lett tilgjengelig og godt merket');
  forslag.push('Sørg for at nødnummer er godt synlige på arbeidsplassen');
  kommentarer.push('God beredskap med oppdatert førstehjelpssutstyr er viktig for sikkerheten');

  return { forslag, tiltak, kommentarer, manglende };
}

function handleRisikoanalyseAssistant(data: any) {
  const forslag = [];
  const tiltak = [];
  const kommentarer = [];
  const manglende = [];

  if (!data.risikoområder || data.risikoområder.length === 0) {
    manglende.push('Risikoområder må identifiseres');
    tiltak.push('Gjennomfør en systematisk gjennomgang av arbeidsplassen');
  }

  if (data.høyRisiko && data.høyRisiko.length > 0) {
    tiltak.push('Prioriter tiltak for områder med høy risiko umiddelbart');
    kommentarer.push('Høyrisikoområder krever ekstra oppmerksomhet og dokumentasjon');
  }

  if (!data.sistOppdatert || (new Date() - new Date(data.sistOppdatert)) > 365 * 24 * 60 * 60 * 1000) {
    tiltak.push('Oppdater risikoanalysen - den bør gjennomgås minst årlig');
  }

  forslag.push('Involver ansatte i identifisering av risikoområder');
  forslag.push('Dokumenter alle gjennomførte risikovurderinger');
  kommentarer.push('En oppdatert risikoanalyse er grunnlaget for et trygt arbeidsmiljø');

  return { forslag, tiltak, kommentarer, manglende };
}

function handleArbeidsmiljoAssistant(data: any) {
  const forslag = [];
  const tiltak = [];
  const kommentarer = [];
  const manglende = [];

  if (!data.verneombud) {
    manglende.push('Verneombud må registreres');
    tiltak.push('Oppnevn verneombud i henhold til arbeidsmiljøloven');
  }

  if (!data.arbeidsmiljøundersokelse) {
    forslag.push('Gjennomfør en arbeidsmiljøundersøkelse for å kartlegge de ansattes opplevelse');
  }

  if (data.sykefravær && data.sykefravær > 5) {
    tiltak.push('Høyt sykefravær kan indikere utfordringer i arbeidsmiljøet - vurder tiltak');
    kommentarer.push('Kartlegg årsaker til sykefravær og iverksett forebyggende tiltak');
  }

  forslag.push('Hold regelmessige arbeidsmiljømøter med ansatte');
  forslag.push('Dokumenter alle tiltak som er iverksatt for bedre arbeidsmiljø');
  kommentarer.push('Et godt arbeidsmiljø bidrar til trivsel og produktivitet');

  return { forslag, tiltak, kommentarer, manglende };
}

function handleHendelserAssistant(data: any) {
  const forslag = [];
  const tiltak = [];
  const kommentarer = [];
  const manglende = [];

  if (!data.hendelsestype) {
    manglende.push('Hendelsestype må spesifiseres');
  }

  if (!data.beskrivelse || data.beskrivelse.length < 20) {
    manglende.push('Beskrivelse av hendelsen må være mer detaljert');
    tiltak.push('Forklar hva som skjedde, hvor og når');
  }

  if (!data.tiltak || data.tiltak.length === 0) {
    tiltak.push('Beskriv hvilke umiddelbare tiltak som ble iverksatt');
  }

  if (data.alvorlighetsgrad === 'høy' && !data.varsleParter) {
    tiltak.push('Ved alvorlige hendelser må relevante parter varsles');
    kommentarer.push('Alvorlige hendelser kan kreve varsling til Arbeidstilsynet');
  }

  forslag.push('Dokumenter læringspunkter fra hendelsen');
  forslag.push('Del erfaringer med alle ansatte for å forebygge lignende hendelser');
  kommentarer.push('God hendelsesrapportering bidrar til læring og forebygging');

  return { forslag, tiltak, kommentarer, manglende };
}

function handleAvvikAssistant(data: any) {
  const forslag = [];
  const tiltak = [];
  const kommentarer = [];
  const manglende = [];

  if (!data.avvikstype) {
    manglende.push('Type avvik må spesifiseres');
  }

  if (!data.årsak) {
    manglende.push('Årsak til avviket må identifiseres');
    tiltak.push('Gjennomfør en årsaksanalyse for å finne rot-årsaken');
  }

  if (!data.korrigerende_tiltak) {
    tiltak.push('Definer korrigerende tiltak for å rette opp avviket');
  }

  if (!data.forebyggende_tiltak) {
    tiltak.push('Definer forebyggende tiltak for å unngå gjentakelse');
  }

  if (!data.ansvarlig) {
    manglende.push('Ansvarlig for oppfølging må tildeles');
  }

  if (!data.frist) {
    forslag.push('Sett en frist for når tiltakene skal være gjennomført');
  }

  forslag.push('Følg opp at tiltak gjennomføres innen fristen');
  kommentarer.push('Systematisk avvikshåndtering bidrar til kontinuerlig forbedring');

  return { forslag, tiltak, kommentarer, manglende };
}

function handleOpplaeringAssistant(data: any) {
  const forslag = [];
  const tiltak = [];
  const kommentarer = [];
  const manglende = [];

  if (!data.opplæringsplan) {
    manglende.push('Opplæringsplan må opprettes');
    tiltak.push('Lag en oversikt over nødvendig opplæring for alle ansatte');
  }

  if (data.manglendeSertifikater && data.manglendeSertifikater > 0) {
    tiltak.push('Sørg for at ansatte med utgåtte sertifikater får fornyet opplæring');
  }

  if (!data.introduksjonsprogram) {
    forslag.push('Opprett et strukturert introduksjonsprogram for nye ansatte');
  }

  if (data.sistOppdatert && (new Date() - new Date(data.sistOppdatert)) > 180 * 24 * 60 * 60 * 1000) {
    tiltak.push('Oppdater opplæringsregisteret - det bør gjennomgås jevnlig');
  }

  forslag.push('Dokumenter all gjennomført opplæring med dato og deltakere');
  forslag.push('Vurder behov for oppfriskningskurs basert på endringer i rutiner');
  kommentarer.push('Systematisk opplæring sikrer kompetente og trygge medarbeidere');

  return { forslag, tiltak, kommentarer, manglende };
}

function handleDokumenterAssistant(data: any) {
  const forslag = [];
  const tiltak = [];
  const kommentarer = [];
  const manglende = [];

  if (!data.hmsHaandbok) {
    manglende.push('HMS-håndbok må opprettes');
    tiltak.push('Utarbeid en HMS-håndbok som beskriver virksomhetens HMS-system');
  }

  if (!data.prosedyrer || data.prosedyrer.length < 3) {
    tiltak.push('Utvikle prosedyrer for kritiske HMS-områder som brann, førstehjelpog rømning');
  }

  if (!data.tegninger) {
    forslag.push('Last opp rømningskart og plantegninger');
  }

  if (!data.kontrakter) {
    forslag.push('Registrer viktige HMS-kontrakter som NORVA, brannservice og BHT');
  }

  if (data.utgåtteDokumenter && data.utgåtteDokumenter > 0) {
    tiltak.push('Gjennomgå og oppdater utgåtte dokumenter');
    kommentarer.push('Hold dokumentasjonen oppdatert for å sikre etterlevelse');
  }

  forslag.push('Organiser dokumenter i klare kategorier for enkel gjenfinning');
  forslag.push('Sørg for at alle ansatte har tilgang til relevant HMS-dokumentasjon');
  kommentarer.push('God dokumentasjon er grunnlaget for et velfungerende HMS-system');

  return { forslag, tiltak, kommentarer, manglende };
}

function handleRapportAssistant(data: any) {
  const forslag = [];
  const tiltak = [];
  const kommentarer = [];
  const manglende = [];

  if (data.rapportType === 'dag') {
    forslag.push('Dagsrapporten bør inkludere temperaturkontroller, renhold og eventuelle avvik');
  } else if (data.rapportType === 'uke') {
    forslag.push('Ukesrapporten kan inkludere oppsummering av daglige kontroller og planlagte aktiviteter');
  } else if (data.rapportType === 'måned') {
    forslag.push('Månedsrapporten bør inneholde statistikk over hendelser, opplæring og vedlikehold');
    tiltak.push('Vurder trender og identifiser områder som trenger ekstra oppmerksomhet');
  } else if (data.rapportType === 'halvår' || data.rapportType === 'år') {
    forslag.push('Årsrapporten skal gi en helhetlig oversikt over HMS-arbeidet');
    tiltak.push('Oppsummer resultater, læringspunkter og mål for neste periode');
    kommentarer.push('Bruk rapporten som grunnlag for ledelsens gjennomgang av HMS');
  }

  if (!data.datagrunnlag || Object.keys(data.datagrunnlag).length === 0) {
    manglende.push('Manglende data for rapportperioden');
    tiltak.push('Sikre at all relevant informasjon er registrert i systemet');
  }

  forslag.push('Inkluder både positive resultater og forbedringsområder');
  kommentarer.push('Regelmessig rapportering sikrer god oversikt og oppfølging');

  return { forslag, tiltak, kommentarer, manglende };
}

function handleMiljoAssistant(data: any) {
  const forslag = [];
  const tiltak = [];
  const kommentarer = [];
  const manglende = [];

  if (!data.avfallsplan) {
    manglende.push('Avfallsplan må opprettes');
    tiltak.push('Lag en plan for sortering og håndtering av ulike avfallstyper');
  }

  if (!data.miljømål || data.miljømål.length === 0) {
    forslag.push('Sett konkrete miljømål for virksomheten');
  }

  if (data.frityrOlje && !data.frityrOljeLeverandør) {
    tiltak.push('Registrer leverandør for henting av frityrolje');
  }

  if (!data.fettutskiller || !data.fettutskiller.sisteTomming) {
    tiltak.push('Planlegg og dokumenter tømming av fettutskiller');
  }

  if (!data.miljovennligeProdukter) {
    forslag.push('Vurder å bruke miljøvennlige rengjøringsprodukter');
    kommentarer.push('Miljøvennlige produkter reduserer påvirkning på miljøet');
  }

  forslag.push('Følg opp miljømål og dokumenter fremgang');
  kommentarer.push('Systematisk miljøarbeid viser samfunnsansvar og kan gi kostnadsbesparelser');

  return { forslag, tiltak, kommentarer, manglende };
}

function handleGeneralAssistant(data: any) {
  return {
    forslag: [
      'Systemet anbefaler å holde all HMS-dokumentasjon oppdatert',
      'Gjennomfør regelmessige kontroller og dokumenter funnene',
      'Involver ansatte i HMS-arbeidet for bedre forankring'
    ],
    tiltak: [
      'Gjennomgå HMS-systemet for å identifisere forbedringsområder'
    ],
    kommentarer: [
      'Et godt HMS-system krever systematisk arbeid og oppfølging'
    ],
    manglende: []
  };
}
