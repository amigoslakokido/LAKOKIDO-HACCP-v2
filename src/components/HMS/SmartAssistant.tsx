import { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  TrendingUp,
  Zap,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { hmsAiApi } from '../../lib/hmsAiApi';

interface SmartAssistantProps {
  section: string;
  data?: any;
  onAutoGenerate?: (content: any) => void;
  customChecks?: (data: any) => AssistantMessage[];
}

interface AssistantMessage {
  type: 'error' | 'warning' | 'info' | 'success' | 'suggestion';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoGenerateAction?: {
    label: string;
    type: string;
  };
}

export function SmartAssistant({ section, data, onAutoGenerate, customChecks }: SmartAssistantProps) {
  const [expanded, setExpanded] = useState(true);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    checkAIStatus();
    analyzeSection();
  }, [section, data]);

  const checkAIStatus = async () => {
    const config = await hmsAiApi.getConfig();
    setAiEnabled(config?.enabled || false);
  };

  const analyzeSection = () => {
    const newMessages: AssistantMessage[] = [];

    if (customChecks) {
      newMessages.push(...customChecks(data));
    }

    if (section === 'cleaning-products') {
      analyzeCleaningProducts(data, newMessages);
    } else if (section === 'waste-management') {
      analyzeWasteManagement(data, newMessages);
    } else if (section === 'first-aid') {
      analyzeFirstAid(data, newMessages);
    } else if (section === 'fire-safety') {
      analyzeFireSafety(data, newMessages);
    } else if (section === 'risk-assessment') {
      analyzeRiskAssessment(data, newMessages);
    } else if (section === 'environmental-goals') {
      analyzeEnvironmentalGoals(data, newMessages);
    } else if (section === 'transport') {
      analyzeTransport(data, newMessages);
    } else if (section === 'oil-management') {
      analyzeOilManagement(data, newMessages);
    } else if (section === 'grease-trap') {
      analyzeGreaseTrap(data, newMessages);
    }

    setMessages(newMessages);
  };

  const analyzeCleaningProducts = (products: any[], messages: AssistantMessage[]) => {
    if (!products || products.length === 0) {
      messages.push({
        type: 'warning',
        title: 'Manglende informasjon',
        message: 'Ingen rengjøringsprodukter er registrert. Start med å legge til produkter du bruker.',
        autoGenerateAction: {
          label: 'Generer eksempelliste',
          type: 'cleaning-products-template'
        }
      });
      return;
    }

    const productsWithoutDataSheet = products.filter(p => !p.data_sheet_url);
    if (productsWithoutDataSheet.length > 0) {
      messages.push({
        type: 'warning',
        title: 'Manglende datablad',
        message: `${productsWithoutDataSheet.length} produkter mangler datablad. Dette er lovpålagt dokumentasjon.`,
        autoGenerateAction: {
          label: 'Last opp datablad automatisk',
          type: 'fetch-data-sheets'
        }
      });
    }

    const expiredProducts = products.filter(p => {
      if (!p.expiry_date) return false;
      return new Date(p.expiry_date) < new Date();
    });

    if (expiredProducts.length > 0) {
      messages.push({
        type: 'error',
        title: 'Utgåtte produkter',
        message: `${expiredProducts.length} produkter har utgått på dato og bør kasseres.`
      });
    }

    const lowStockProducts = products.filter(p => p.current_stock && p.minimum_stock && p.current_stock < p.minimum_stock);
    if (lowStockProducts.length > 0) {
      messages.push({
        type: 'info',
        title: 'Lavt lager',
        message: `${lowStockProducts.length} produkter har lavt lager. Vurder å bestille mer.`
      });
    }

    if (messages.length === 0) {
      messages.push({
        type: 'success',
        title: 'Alt ser bra ut!',
        message: 'Rengjøringsproduktene er godt dokumentert og oppdatert.'
      });
    }
  };

  const analyzeWasteManagement = (wasteData: any, messages: AssistantMessage[]) => {
    if (!wasteData || !wasteData.plan) {
      messages.push({
        type: 'error',
        title: 'Manglende avfallsplan',
        message: 'Avfallsplan må opprettes. Dette er et lovkrav for restauranter.',
        autoGenerateAction: {
          label: 'Generer avfallsplan',
          type: 'waste-plan'
        }
      });
      return;
    }

    if (!wasteData.categories || wasteData.categories.length === 0) {
      messages.push({
        type: 'warning',
        title: 'Ingen avfallskategorier',
        message: 'Legg til avfallskategorier (matavfall, plast, papp, etc.)',
        autoGenerateAction: {
          label: 'Legg til standard kategorier',
          type: 'waste-categories'
        }
      });
    }

    if (!wasteData.lastReview ||
        new Date(wasteData.lastReview) < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)) {
      messages.push({
        type: 'warning',
        title: 'Avfallsplan trenger oppdatering',
        message: 'Avfallsplanen bør gjennomgås minst årlig.'
      });
    }

    if (messages.length === 0) {
      messages.push({
        type: 'success',
        title: 'Godt avfallshåndteringssystem',
        message: 'Avfallsplanen er oppdatert og fullstendig.'
      });
    }
  };

  const analyzeFirstAid = (firstAidData: any, messages: AssistantMessage[]) => {
    if (!firstAidData?.responsible) {
      messages.push({
        type: 'error',
        title: 'Mangler førstehjelpsansvarlig',
        message: 'Du må utpeke en førstehjelpsansvarlig. Dette er lovpålagt.',
        autoGenerateAction: {
          label: 'Opprett førstehjelpsansvarlig',
          type: 'first-aid-responsible'
        }
      });
    }

    if (!firstAidData?.equipment || firstAidData.equipment.length === 0) {
      messages.push({
        type: 'warning',
        title: 'Mangler førstehjelpssutstyr',
        message: 'Registrer førstehjelpssutstyr (førstehjelpsskrinet, osv.)',
        autoGenerateAction: {
          label: 'Legg til standard utstyr',
          type: 'first-aid-equipment'
        }
      });
    }

    const defectEquipment = firstAidData?.equipment?.filter((e: any) =>
      e.status === 'Defekt' || e.status === 'Trenger utskifting'
    );

    if (defectEquipment && defectEquipment.length > 0) {
      messages.push({
        type: 'error',
        title: 'Defekt utstyr',
        message: `${defectEquipment.length} enheter trenger utskifting eller reparasjon.`
      });
    }

    const expiredTraining = firstAidData?.responsible?.training_expiry &&
      new Date(firstAidData.responsible.training_expiry) < new Date();

    if (expiredTraining) {
      messages.push({
        type: 'warning',
        title: 'Opplæring har utløpt',
        message: 'Førstehjelpsansvarlig trenger oppdatert opplæring.'
      });
    }

    if (messages.length === 0) {
      messages.push({
        type: 'success',
        title: 'Førstehjelp i orden',
        message: 'Alt førstehjelpssutstyr er registrert og oppdatert.'
      });
    }
  };

  const analyzeFireSafety = (fireData: any, messages: AssistantMessage[]) => {
    if (!fireData?.responsible) {
      messages.push({
        type: 'error',
        title: 'Mangler brannsikkerhetsansvarlig',
        message: 'Opprett brannsikkerhetsansvarlig.',
        autoGenerateAction: {
          label: 'Opprett ansvarlig',
          type: 'fire-responsible'
        }
      });
    }

    const defectEquipment = fireData?.equipment?.filter((e: any) =>
      e.status === 'Defekt' || e.status === 'Trenger service'
    );

    if (defectEquipment && defectEquipment.length > 0) {
      messages.push({
        type: 'error',
        title: 'Kritisk: Brannsikkerhetsutstyr',
        message: `${defectEquipment.length} enheter trenger umiddelbar service.`
      });
    }

    if (messages.length === 0) {
      messages.push({
        type: 'success',
        title: 'Brannsikkerhet OK',
        message: 'Alt brannsikkerhetsutstyr fungerer som det skal.'
      });
    }
  };

  const analyzeRiskAssessment = (risks: any[], messages: AssistantMessage[]) => {
    if (!risks || risks.length === 0) {
      messages.push({
        type: 'warning',
        title: 'Ingen risikovurderinger',
        message: 'Start med å identifisere risikoer i arbeidsområdene.',
        autoGenerateAction: {
          label: 'Generer standard risikoer',
          type: 'risk-template'
        }
      });
      return;
    }

    const highRisks = risks.filter(r => r.risk_level === 'Høy' || r.risk_level === 'Kritisk');
    if (highRisks.length > 0) {
      messages.push({
        type: 'error',
        title: `${highRisks.length} høyrisiko-områder`,
        message: 'Disse krever umiddelbar oppmerksomhet og handling.'
      });
    }

    const openRisks = risks.filter(r => r.status === 'Åpen');
    if (openRisks.length > 5) {
      messages.push({
        type: 'warning',
        title: 'Mange åpne risikovurderinger',
        message: `${openRisks.length} risikovurderinger venter på oppfølging.`
      });
    }

    if (messages.length === 0) {
      messages.push({
        type: 'success',
        title: 'Risikoer under kontroll',
        message: 'Alle identifiserte risikoer har tiltak og oppfølging.'
      });
    }
  };

  const analyzeEnvironmentalGoals = (goals: any[], messages: AssistantMessage[]) => {
    if (!goals || goals.length === 0) {
      messages.push({
        type: 'info',
        title: 'Ingen miljømål satt',
        message: 'Sett konkrete miljømål for bedriften.',
        autoGenerateAction: {
          label: 'Foreslå miljømål',
          type: 'environmental-goals'
        }
      });
      return;
    }

    const overdueGoals = goals.filter(g =>
      g.deadline && new Date(g.deadline) < new Date() && g.status !== 'Fullført'
    );

    if (overdueGoals.length > 0) {
      messages.push({
        type: 'warning',
        title: 'Utgåtte miljømål',
        message: `${overdueGoals.length} mål har passert fristen.`
      });
    }

    const completedGoals = goals.filter(g => g.status === 'Fullført');
    if (completedGoals.length > 0) {
      messages.push({
        type: 'success',
        title: 'Flott fremgang!',
        message: `${completedGoals.length} miljømål er fullført.`
      });
    }
  };

  const analyzeTransport = (transport: any, messages: AssistantMessage[]) => {
    if (!transport || !transport.vehicles || transport.vehicles.length === 0) {
      messages.push({
        type: 'info',
        title: 'Grønn transport',
        message: 'Vurder å legge til informasjon om transportmidler og miljøvennlige alternativer.'
      });
    }
  };

  const analyzeOilManagement = (oil: any, messages: AssistantMessage[]) => {
    if (!oil || !oil.logs || oil.logs.length === 0) {
      messages.push({
        type: 'info',
        title: 'Frityroljehåndtering',
        message: 'Registrer frityroljeskift for å følge med på forbruk og miljøpåvirkning.'
      });
    }
  };

  const analyzeGreaseTrap = (trap: any, messages: AssistantMessage[]) => {
    if (!trap || !trap.logs || trap.logs.length === 0) {
      messages.push({
        type: 'warning',
        title: 'Fettutskiller vedlikehold',
        message: 'Registrer tømminger og vedlikehold av fettutskiller. Dette er lovpålagt.',
        autoGenerateAction: {
          label: 'Opprett vedlikeholdsplan',
          type: 'grease-trap-plan'
        }
      });
    }
  };

  const handleAutoGenerate = async (actionType: string) => {
    if (!onAutoGenerate) return;

    setLoading(true);
    try {
      let generatedContent;

      switch (actionType) {
        case 'cleaning-products-template':
          generatedContent = generateCleaningProductsTemplate();
          break;
        case 'waste-plan':
          generatedContent = await generateWastePlan();
          break;
        case 'waste-categories':
          generatedContent = generateWasteCategories();
          break;
        case 'first-aid-equipment':
          generatedContent = generateFirstAidEquipment();
          break;
        case 'risk-template':
          generatedContent = generateRiskTemplate();
          break;
        case 'environmental-goals':
          generatedContent = await generateEnvironmentalGoals();
          break;
        case 'grease-trap-plan':
          generatedContent = generateGreaseTrapPlan();
          break;
        default:
          generatedContent = null;
      }

      if (generatedContent) {
        onAutoGenerate(generatedContent);
        setTimeout(analyzeSection, 1000);
      }
    } catch (error) {
      console.error('Error auto-generating:', error);
      alert('Kunne ikke generere innhold automatisk');
    }
    setLoading(false);
  };

  const runAIAnalysis = async () => {
    if (!aiEnabled) {
      alert('AI-systemet er ikke aktivert. Gå til Dashboard → AI Analytics for å aktivere.');
      return;
    }

    setAnalyzing(true);
    try {
      const result = await hmsAiApi.analyzeSection(section, data);
      if (result.success && result.analysis) {
        const aiMessages: AssistantMessage[] = [];

        if (result.analysis.issues && result.analysis.issues.length > 0) {
          result.analysis.issues.forEach((issue: string, idx: number) => {
            aiMessages.push({
              type: result.analysis.severity === 'critical' || result.analysis.severity === 'high' ? 'error' : 'warning',
              title: `AI Analyse ${idx + 1}`,
              message: issue
            });
          });
        }

        if (result.analysis.solutions && result.analysis.solutions.length > 0) {
          result.analysis.solutions.forEach((solution: string, idx: number) => {
            aiMessages.push({
              type: 'suggestion',
              title: `Anbefaling ${idx + 1}`,
              message: solution
            });
          });
        }

        setMessages([...messages, ...aiMessages]);
      }
    } catch (error) {
      console.error('AI analysis error:', error);
    }
    setAnalyzing(false);
  };

  const generateCleaningProductsTemplate = () => {
    return [
      { name: 'Oppvaskmiddel', supplier: 'Diverse', category: 'Kjøkken', hazard_level: 'Lav' },
      { name: 'Gulvvask', supplier: 'Diverse', category: 'Gulv', hazard_level: 'Lav' },
      { name: 'Desinfeksjonsmiddel', supplier: 'Diverse', category: 'Overflater', hazard_level: 'Medium' },
      { name: 'Avfettingsmiddel', supplier: 'Diverse', category: 'Kjøkken', hazard_level: 'Medium' },
      { name: 'WC-rens', supplier: 'Diverse', category: 'Sanitær', hazard_level: 'Medium' }
    ];
  };

  const generateWasteCategories = () => {
    return [
      { name: 'Matavfall', container_type: 'Brun beholder', collection_frequency: 'Daglig' },
      { name: 'Papp og papir', container_type: 'Grønn beholder', collection_frequency: 'Ukentlig' },
      { name: 'Plastemballasje', container_type: 'Blå beholder', collection_frequency: 'Ukentlig' },
      { name: 'Restavfall', container_type: 'Grå beholder', collection_frequency: '2x per uke' },
      { name: 'Glass og metall', container_type: 'Flerbruksbeholder', collection_frequency: 'Månedlig' }
    ];
  };

  const generateFirstAidEquipment = () => {
    return [
      { name: 'Førstehjelpsskrinet', location: 'Kjøkken', status: 'Fungerer' },
      { name: 'Brannslukker', location: 'Ved inngangsdør', status: 'Fungerer' },
      { name: 'Brannteppe', location: 'Kjøkken', status: 'Fungerer' },
      { name: 'Øyeskylleflaske', location: 'Kjøkken', status: 'Fungerer' }
    ];
  };

  const generateRiskTemplate = () => {
    return [
      { hazard: 'Varme overflater', area: 'Kjøkken', risk_level: 'Høy', measures: 'Bruk vernehansker, oppmerksomhetsskilt' },
      { hazard: 'Glatte gulv', area: 'Kjøkken/Restaurant', risk_level: 'Medium', measures: 'Anti-skli matter, umiddelbar rengjøring ved søl' },
      { hazard: 'Tunge løft', area: 'Lager', risk_level: 'Medium', measures: 'To-persons løft, bruk hjelpemidler' },
      { hazard: 'Knivskader', area: 'Kjøkken', risk_level: 'Høy', measures: 'Opplæring, sikre skjærebrett, oppbevaring' },
      { hazard: 'Kjemikalier', area: 'Rengjøring', risk_level: 'Medium', measures: 'Datablad tilgjengelig, verneutstyr' }
    ];
  };

  const generateWastePlan = async () => {
    return {
      plan: {
        created_date: new Date().toISOString(),
        responsible: 'Daglig leder',
        description: 'Plan for avfallshåndtering i henhold til miljølovgivning',
        review_frequency: 'Årlig'
      },
      categories: generateWasteCategories()
    };
  };

  const generateEnvironmentalGoals = async () => {
    return [
      { title: 'Reduser matsvinn med 20%', target_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), description: 'Implementer bedre lagerstyring og porsjonkontroll' },
      { title: 'Øk kildesortering til 90%', target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), description: 'Opplæring og tydelig merking av avfallsbeholdere' },
      { title: 'Reduser energiforbruk med 15%', target_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), description: 'LED-lys, energieffektive maskiner' }
    ];
  };

  const generateGreaseTrapPlan = () => {
    return {
      schedule: 'Månedlig',
      responsible: 'Kjøkkensjef',
      next_service: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Registrer hver tømming og inspeksjon'
    };
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-5 h-5" />;
      case 'warning': return <Info className="w-5 h-5" />;
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'suggestion': return <Lightbulb className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'suggestion': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (messages.length === 0 && !aiEnabled) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg shadow-lg mb-6">
      <div className="w-full flex items-center justify-between p-4 hover:bg-white/50 transition-colors rounded-t-lg">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-3 flex-1"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900">Smart Assistent</h3>
            <p className="text-sm text-gray-600">
              {messages.length} {messages.length === 1 ? 'melding' : 'meldinger'}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-2">
          {aiEnabled && (
            <button
              onClick={runAIAnalysis}
              disabled={analyzing}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyserer...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  AI Analyse
                </>
              )}
            </button>
          )}
          <button onClick={() => setExpanded(!expanded)} className="p-1">
            {expanded ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 pt-0 space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-4 border-2 rounded-lg ${getColorForType(msg.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getIconForType(msg.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{msg.title}</h4>
                  <p className="text-sm mb-2">{msg.message}</p>
                  {msg.autoGenerateAction && (
                    <button
                      onClick={() => handleAutoGenerate(msg.autoGenerateAction!.type)}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-current rounded-lg hover:bg-opacity-20 font-medium text-sm disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Genererer...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          {msg.autoGenerateAction.label}
                        </>
                      )}
                    </button>
                  )}
                  {msg.action && (
                    <button
                      onClick={msg.action.onClick}
                      className="px-4 py-2 bg-white border-2 border-current rounded-lg hover:bg-opacity-20 font-medium text-sm"
                    >
                      {msg.action.label}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {messages.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="font-medium">Ingen varsler for øyeblikket</p>
              <p className="text-sm">Alt ser bra ut!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
