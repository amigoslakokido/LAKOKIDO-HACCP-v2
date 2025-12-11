import { useState } from 'react';
import { FileCheck, Shield, Users, AlertTriangle, Leaf, MessageSquare, Building2, CheckCircle2, Edit3, Save, X, Download, Printer } from 'lucide-react';
import { HMSPdfGenerator } from '../../utils/hmsPdfGenerator';

export function Policies() {
  const [activeTab, setActiveTab] = useState<'overview' | 'edit'>('overview');
  const [isEditing, setIsEditing] = useState(false);

  const downloadPDF = () => {
    const pdf = new HMSPdfGenerator();

    pdf.addHeader({
      title: 'HMS-Policyer',
      subtitle: 'Retningslinjer og ansvar',
      companyName: 'Amigos la Kokido AS',
      generatedDate: new Date(),
    });

    pdf.addSectionTitle('HMS-Policy', 'primary');
    pdf.addText(
      'Amigos la Kokido AS er forpliktet til å sikre et trygt, sunt og miljøvennlig arbeidsmiljø for alle ansatte, gjester og samarbeidspartnere. Vi skal drive vårt serveringssted i tråd med gjeldende lover og forskrifter, med særlig fokus på helse, miljø og sikkerhet.'
    );
    pdf.addSpacing(5);

    pdf.addSectionTitle('Grunnprinsipper', 'success');
    pdf.addBulletList([
      'Alle ulykker og arbeidsrelaterte sykdommer kan og skal forebygges',
      'HMS-arbeid er en integrert del av den daglige driften',
      'Ledelsen har det overordnede ansvaret for HMS-arbeidet',
      'Alle ansatte har ansvar for å følge HMS-rutiner og melde fra om avvik',
      'Åpen kommunikasjon og kontinuerlig forbedring er nøkkelen til suksess',
    ]);
    pdf.addSpacing(10);

    pdf.addSectionTitle('Ledelsens Ansvar', 'warning');
    pdf.addText('Daglig leder har ansvar for:');
    pdf.addBulletList([
      'Å sikre at HMS-systemet er etablert, vedlikeholdt og fungerer effektivt',
      'Å tildele ressurser og tid til HMS-arbeid',
      'Å gjennomføre årlige HMS-revisjoner',
      'Å følge opp avvik, ulykker og nestenulykker',
      'Å sikre at alle ansatte får nødvendig opplæring',
    ]);
    pdf.addSpacing(10);

    pdf.addSectionTitle('Ansattes Ansvar', 'info');
    pdf.addBulletList([
      'Følge HMS-rutiner og prosedyrer',
      'Bruke riktig verneutstyr',
      'Melde fra om risiko, avvik eller farlige situasjoner',
      'Delta aktivt i HMS-arbeidet',
      'Ta vare på egen og andres sikkerhet',
    ]);

    pdf.save('HMS-Policyer-Amigos-la-Kokido.pdf');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">HMS-Policyer</h1>
              <p className="text-sm text-slate-600">Retningslinjer og ansvar</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm"
            >
              <Download className="w-4 h-4" />
              Last ned PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all font-medium text-sm"
            >
              <Printer className="w-4 h-4" />
              Skriv ut
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Oversikt
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'edit'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Rediger
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* General HMS Policy */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900 mb-3">HMS-Policy</h2>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    <strong>Amigos la Kokido AS</strong> er forpliktet til å sikre et trygt, sunt og miljøvennlig arbeidsmiljø
                    for alle ansatte, gjester og samarbeidspartnere. Vi skal drive vårt serveringssted i tråd med
                    gjeldende lover og forskrifter, med særlig fokus på helse, miljø og sikkerhet.
                  </p>
                  <div className="bg-white rounded-lg p-4 space-y-2">
                    <h3 className="font-semibold text-slate-900 mb-2">Våre grunnprinsipper:</h3>
                    <div className="space-y-2">
                      {[
                        'Alle ulykker og arbeidsrelaterte sykdommer kan og skal forebygges',
                        'HMS-arbeid er en integrert del av den daglige driften',
                        'Ledelsen har det overordnede ansvaret for HMS-arbeidet',
                        'Alle ansatte har ansvar for å følge HMS-rutiner og melde fra om avvik',
                        'Åpen kommunikasjon og kontinuerlig forbedring er nøkkelen til suksess'
                      ].map((principle, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-slate-700">{principle}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Management Responsibilities */}
            <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Ledelsens Ansvar</h2>

                  <div className="space-y-4">
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 mb-3">Daglig leder har ansvar for:</h3>
                      <ul className="space-y-2">
                        {[
                          'Å sikre at HMS-systemet er etablert, vedlikeholdt og fungerer effektivt',
                          'Å tildele ressurser og tid til HMS-arbeid',
                          'Å gjennomføre årlige HMS-revisjoner (HMS-runden)',
                          'Å følge opp avvik, ulykker og nestenulykker',
                          'Å sikre at alle ansatte får nødvendig opplæring',
                          'Å være tilgjengelig for HMS-relaterte spørsmål og bekymringer',
                          'Å samarbeide med verneombud om HMS-tiltak',
                          'Å rapportere alvorlige hendelser til Arbeidstilsynet'
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0 mt-2" />
                            <p className="text-slate-700">{item}</p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 mb-3">Ledelsen forplikter seg til å:</h3>
                      <ul className="space-y-2">
                        {[
                          'Gå foran som et godt eksempel i HMS-arbeidet',
                          'Ta medarbeideres HMS-bekymringer på alvor',
                          'Involvere ansatte i risikovurderinger og HMS-forbedringer',
                          'Sørge for at ingen blir straffet for å melde fra om farlige forhold',
                          'Kontinuerlig forbedre arbeidsforholdene basert på erfaring og tilbakemeldinger'
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0 mt-2" />
                            <p className="text-slate-700">{item}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Responsibilities */}
            <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Ansattes Ansvar</h2>

                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 mb-3">Alle ansatte har plikt til å:</h3>
                      <ul className="space-y-2">
                        {[
                          'Følge etablerte HMS-rutiner og prosedyrer',
                          'Bruke påkrevd verneutstyr (hansker, sko, etc.)',
                          'Delta aktivt i HMS-opplæring og kurs',
                          'Melde fra om farlige forhold, avvik og nestenulykker',
                          'Ta vare på eget og andres sikkerhet og helse',
                          'Holde arbeidsområdet rent og ryddig',
                          'Rapportere defekt utstyr eller maskiner umiddelbart',
                          'Stoppe arbeid ved umiddelbar fare og varsle leder',
                          'Bidra til et godt og inkluderende arbeidsmiljø'
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0 mt-2" />
                            <p className="text-slate-700">{item}</p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 mb-3">Ansatte har rett til å:</h3>
                      <ul className="space-y-2">
                        {[
                          'Få nødvendig opplæring i HMS og arbeidsprosedyrer',
                          'Få utlevert nødvendig verneutstyr kostnadsfritt',
                          'Bli hørt når de melder fra om HMS-bekymringer',
                          'Delta i HMS-arbeidet gjennom verneombud',
                          'Nekte å utføre arbeid som medfører umiddelbar fare'
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0 mt-2" />
                            <p className="text-slate-700">{item}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Procedures */}
            <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Sikkerhetsrutiner</h2>

                  <div className="space-y-4">
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 mb-3">Generelle sikkerhetsregler:</h3>
                      <ul className="space-y-2">
                        {[
                          'Bruk alltid riktig verneutstyr (hansker, sklisikre sko, etc.)',
                          'Følg HACCP-rutiner for mattrygghet og temperaturkontroll',
                          'Rapporter alle ulykker, skader og nestenulykker umiddelbart',
                          'Kjenn til rømningsveier og samlingsplass ved evakuering',
                          'Bruk maskiner og utstyr kun etter opplæring',
                          'Løft og bær riktig for å unngå belastningsskader',
                          'Hold gulv tørre og fri for hindringer',
                          'Oppbevar kjemikalier forskriftsmessig og bruk databladene',
                          'Slå av og koble fra elektrisk utstyr ved problemer'
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0 mt-2" />
                            <p className="text-slate-700">{item}</p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 mb-3">Ved ulykke eller nødsituasjon:</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-3">
                          <div className="font-bold text-red-600 mb-2">1. STOPP</div>
                          <p className="text-sm text-slate-700">Stopp arbeidet og sikre området</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <div className="font-bold text-red-600 mb-2">2. VURDER</div>
                          <p className="text-sm text-slate-700">Vurder situasjonen og behovet for hjelp</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <div className="font-bold text-red-600 mb-2">3. VARSLE</div>
                          <p className="text-sm text-slate-700">Ring 110/112/113 og varsle leder</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 mb-2">Viktige telefonnummer:</h3>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className="bg-white rounded p-2">
                          <div className="text-xs text-slate-600">Brann</div>
                          <div className="font-bold text-slate-900">110</div>
                        </div>
                        <div className="bg-white rounded p-2">
                          <div className="text-xs text-slate-600">Politi</div>
                          <div className="font-bold text-slate-900">112</div>
                        </div>
                        <div className="bg-white rounded p-2">
                          <div className="text-xs text-slate-600">Ambulanse</div>
                          <div className="font-bold text-slate-900">113</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Environment and Sustainability */}
            <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Miljø og Bærekraft</h2>

                  <div className="space-y-4">
                    <div className="bg-emerald-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 mb-3">Miljøpolicy:</h3>
                      <p className="text-slate-700 mb-3">
                        Amigos la Kokido AS er forpliktet til å minimere vår miljøpåvirkning og arbeide mot
                        en mer bærekraftig drift. Vi tar ansvar for vårt miljøavtrykk og jobber kontinuerlig
                        med å forbedre våre miljøprosedyrer.
                      </p>
                      <ul className="space-y-2">
                        {[
                          'Kildesortering av avfall (mat, papp, plast, glass, restavfall)',
                          'Profesjonell håndtering av fett og oljeavfall via NORVA',
                          'Bruk av miljøvennlige rengjøringsprodukter fra LEKO Mater',
                          'Energieffektivt utstyr og LED-belysning',
                          'Elektriske leveringskjøretøy for redusert utslipp',
                          'Samarbeid med miljøsertifiserte leverandører',
                          'Minimering av matsvinn gjennom god planlegging',
                          'Ansvarlig vannforbruk og vedlikehold av installasjoner',
                          'Korrekt håndtering av kjemikalier og farlig avfall'
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0 mt-2" />
                            <p className="text-slate-700">{item}</p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-emerald-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 mb-3">Alle ansatte skal:</h3>
                      <ul className="space-y-2">
                        {[
                          'Sortere avfall i henhold til kildesorteringssystemet',
                          'Slå av lys og utstyr som ikke er i bruk',
                          'Rapportere lekkasjer og svinn umiddelbart',
                          'Bruke rengjøringsmidler i henhold til anvisninger',
                          'Bidra til å redusere matsvinn'
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0 mt-2" />
                            <p className="text-slate-700">{item}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Communication and Reporting */}
            <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Kommunikasjon og Varsling</h2>

                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 mb-3">Åpen kommunikasjonskultur:</h3>
                      <p className="text-slate-700 mb-3">
                        HMS-arbeid forutsetter åpen og ærlig kommunikasjon. Alle skal kunne si fra om HMS-bekymringer
                        uten frykt for negative konsekvenser.
                      </p>
                      <ul className="space-y-2">
                        {[
                          'Meld fra om farlige forhold, nestenulykker og avvik',
                          'Foreslå forbedringstiltak til ledelsen eller verneombud',
                          'Delta aktivt i HMS-møter og vernerunder',
                          'Bruk HMS-systemet for dokumentasjon av avvik',
                          'Ta kontakt med daglig leder ved alvorlige bekymringer',
                          'Varsle verneombud om systematiske problemer'
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                            <p className="text-slate-700">{item}</p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 mb-3">Varslingsprosedyre:</h3>
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-3">
                          <div className="font-semibold text-slate-900 mb-1">1. Umiddelbar fare</div>
                          <p className="text-sm text-slate-700">Stopp arbeid, sikre området, varsle leder og nødetater (110/112/113)</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <div className="font-semibold text-slate-900 mb-1">2. Farlige forhold</div>
                          <p className="text-sm text-slate-700">Registrer avvik i HMS-systemet og informer daglig leder</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <div className="font-semibold text-slate-900 mb-1">3. Forbedringsforslag</div>
                          <p className="text-sm text-slate-700">Ta det opp på HMS-møte eller direkte med ledelsen</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 mb-2">Viktig å huske:</h3>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-slate-700 font-medium">
                          Ingen skal oppleve negative konsekvenser for å melde fra om HMS-bekymringer.
                          Tvert imot - det er en forventet og ønsket del av arbeidshverdagen.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Policy Commitment */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-3">Forpliktelse og signering</h3>
              <p className="mb-4 opacity-90">
                Denne HMS-policyen er godkjent av ledelsen og gjelder for hele virksomheten.
                Den skal gjennomgås årlig og revideres ved behov.
              </p>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm opacity-75 mb-1">Godkjent dato</div>
                    <div className="font-semibold">01.01.2025</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-75 mb-1">Neste revisjon</div>
                    <div className="font-semibold">01.01.2026</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'edit' && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
            <Edit3 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Redigeringsfunksjon</h3>
            <p className="text-slate-600 mb-4">
              Redigeringsfunksjonalitet kommer snart. Dette vil tillate autoriserte brukere å oppdatere HMS-policyer.
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Kommende funksjon
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
