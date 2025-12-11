import { useState } from 'react';
import { Users, Shield, ChefHat, Truck, Building2, UserCheck, AlertCircle, Edit3, CheckCircle2, Download, Printer } from 'lucide-react';
import { HMSPdfGenerator } from '../../utils/hmsPdfGenerator';

export function OrganizationChart() {
  const [activeTab, setActiveTab] = useState<'overview' | 'edit'>('overview');

  const downloadPDF = () => {
    const pdf = new HMSPdfGenerator();

    pdf.addHeader({
      title: 'Organisasjonskart',
      subtitle: 'HMS Organisasjonsstruktur',
      companyName: 'Amigos la Kokido AS',
      generatedDate: new Date(),
    });

    pdf.addSectionTitle('Om organisasjonskartet', 'info');
    pdf.addText(
      'Dette er en forenklet organisasjonsstruktur tilpasset fast food-bransjen. Den er utformet for å være klar, enkel å forstå, og i tråd med kravene fra Arbeidstilsynet.'
    );
    pdf.addSpacing(10);

    pdf.addSectionTitle('Ledelse', 'primary');
    pdf.addText('Daglig leder: Gourg Mounir Brsoum');
    pdf.addText('Overordnet ansvar for HMS, drift, økonomi og personalledelse');
    pdf.addSpacing(10);

    pdf.addSectionTitle('Hovedroller', 'success');

    pdf.addText('HMS-ansvarlig:');
    pdf.addBulletList([
      'Koordinere HMS-arbeidet',
      'Følge opp avvik og hendelser',
      'Sørge for opplæring og vernerunder',
      'Holde HMS-dokumentasjon oppdatert',
    ]);
    pdf.addSpacing(5);

    pdf.addText('Kjøkkensjef:');
    pdf.addBulletList([
      'Ansvar for matsikkerhet og HACCP',
      'Lede kjøkkenpersonalet',
      'Sørge for ryddighet og orden',
      'Bestille varer og følge opp leverandører',
    ]);
    pdf.addSpacing(5);

    pdf.addText('Servitører og Betjening:');
    pdf.addBulletList([
      'Gi god kundeservice',
      'Holde serveringsområdet rent',
      'Følge HMS-rutiner for servering',
      'Melde fra om avvik',
    ]);

    pdf.save('Organisasjonskart-Amigos-la-Kokido.pdf');
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
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Organisasjonskart</h1>
              <p className="text-sm text-slate-600">Amigos la Kokido AS</p>
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
            {/* Introduction */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-2">Om organisasjonskartet</h2>
                  <p className="text-slate-700 leading-relaxed">
                    Dette er en forenklet organisasjonsstruktur tilpasset fast food-bransjen.
                    Den er utformet for å være klar, enkel å forstå, og i tråd med kravene fra Arbeidstilsynet.
                  </p>
                </div>
              </div>
            </div>

            {/* Organization Chart */}
            <div className="space-y-4">
              {/* Level 1: Daglig leder */}
              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm opacity-90">Daglig leder</div>
                        <div className="font-bold text-lg">Gourg Mounir Brsoum</div>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 mt-3">
                      <p className="text-sm">
                        Overordnet ansvar for HMS, drift, økonomi og personalledelse
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connection Line */}
              <div className="flex justify-center">
                <div className="w-0.5 h-8 bg-slate-300"></div>
              </div>

              {/* Level 2: Three main roles */}
              <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {/* HMS-ansvarlig */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold">HMS-ansvarlig</div>
                      <div className="text-xs opacity-90">مسؤول HMS</div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-white rounded-full flex-shrink-0 mt-1.5"></div>
                      <p className="text-xs">Følge opp avvik</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-white rounded-full flex-shrink-0 mt-1.5"></div>
                      <p className="text-xs">Gjennomføre kontroller</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-white rounded-full flex-shrink-0 mt-1.5"></div>
                      <p className="text-xs">Dokumentere HMS-arbeid</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-white rounded-full flex-shrink-0 mt-1.5"></div>
                      <p className="text-xs">Rapportere til ledelsen</p>
                    </div>
                  </div>
                </div>

                {/* Verneombud */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold">Verneombud</div>
                      <div className="text-xs opacity-90">مندوب السلامة</div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-white rounded-full flex-shrink-0 mt-1.5"></div>
                      <p className="text-xs">Representere ansatte</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-white rounded-full flex-shrink-0 mt-1.5"></div>
                      <p className="text-xs">Delta i HMS-arbeid</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-white rounded-full flex-shrink-0 mt-1.5"></div>
                      <p className="text-xs">Melde HMS-bekymringer</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-white rounded-full flex-shrink-0 mt-1.5"></div>
                      <p className="text-xs">Kreves ved 10+ ansatte</p>
                    </div>
                  </div>
                </div>

                {/* Kjøkkensjef / Teamleder */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ChefHat className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold">Teamleder</div>
                      <div className="text-xs opacity-90">قائد الفريق</div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-white rounded-full flex-shrink-0 mt-1.5"></div>
                      <p className="text-xs">Organisere medarbeidere</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-white rounded-full flex-shrink-0 mt-1.5"></div>
                      <p className="text-xs">Fordele oppgaver</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-white rounded-full flex-shrink-0 mt-1.5"></div>
                      <p className="text-xs">Følge opp renhold</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-white rounded-full flex-shrink-0 mt-1.5"></div>
                      <p className="text-xs">Sikre daglig sikkerhet</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connection Line from Teamleder */}
              <div className="flex justify-center md:justify-end md:mr-[16%]">
                <div className="w-0.5 h-8 bg-slate-300"></div>
              </div>

              {/* Level 3: Staff */}
              <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto md:ml-auto md:mr-[8%]">
                {/* Medarbeidere */}
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-5 text-white shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold">Medarbeidere</div>
                      <div className="text-xs opacity-90">موظفو التحضير</div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-white rounded-full flex-shrink-0 mt-1.5"></div>
                      <p className="text-xs">Tilberedning av mat</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-white rounded-full flex-shrink-0 mt-1.5"></div>
                      <p className="text-xs">Servering og kundeservice</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-white rounded-full flex-shrink-0 mt-1.5"></div>
                      <p className="text-xs">Følge HMS-rutiner</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-white rounded-full flex-shrink-0 mt-1.5"></div>
                      <p className="text-xs">Melde avvik og farer</p>
                    </div>
                  </div>
                </div>

                {/* Sjåfører */}
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-5 text-white shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold">Sjåfører / Bud</div>
                      <div className="text-xs opacity-90">سائقو التوصيل</div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-white rounded-full flex-shrink-0 mt-1.5"></div>
                      <p className="text-xs">Levering av mat</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-white rounded-full flex-shrink-0 mt-1.5"></div>
                      <p className="text-xs">Kjøretøyvedlikehold</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-white rounded-full flex-shrink-0 mt-1.5"></div>
                      <p className="text-xs">Trafikksikkerhet</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-white rounded-full flex-shrink-0 mt-1.5"></div>
                      <p className="text-xs">Temperaturkontroll under transport</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Role Descriptions */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              {/* Daglig leder details */}
              <div className="bg-white rounded-xl border-2 border-slate-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">Daglig leder</h3>
                </div>
                <p className="text-sm text-slate-700 mb-3">
                  Høyeste ansvarlig i selskapet med overordnet ansvar for drift, økonomi og HMS.
                </p>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-900">Hovedoppgaver:</div>
                  <ul className="space-y-1.5 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Overordnet HMS-ansvar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Økonomi og budsjett</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Personalledelse</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Strategiske beslutninger</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* HMS-ansvarlig details */}
              <div className="bg-white rounded-xl border-2 border-slate-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">HMS-ansvarlig</h3>
                </div>
                <p className="text-sm text-slate-700 mb-3">
                  Ansvarlig for praktisk gjennomføring av HMS-arbeid og oppfølging av systemet.
                </p>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-900">Hovedoppgaver:</div>
                  <ul className="space-y-1.5 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span>Følge opp avvik og tiltak</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span>Gjennomføre kontroller</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span>Dokumentasjon og rapportering</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span>Bistå med risikovurderinger</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Verneombud details */}
              <div className="bg-white rounded-xl border-2 border-slate-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">Verneombud</h3>
                </div>
                <p className="text-sm text-slate-700 mb-3">
                  Representerer de ansatte i HMS-spørsmål. Lovpålagt når bedriften har 10 eller flere ansatte.
                </p>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-900">Hovedoppgaver:</div>
                  <ul className="space-y-1.5 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span>Ivareta ansattes sikkerhet</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span>Delta i HMS-møter og vernerunder</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span>Melde bekymringer til ledelsen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span>Bistå ved ulykker og hendelser</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Teamleder details */}
              <div className="bg-white rounded-xl border-2 border-slate-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ChefHat className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">Teamleder / Kjøkkensjef</h3>
                </div>
                <p className="text-sm text-slate-700 mb-3">
                  Leder for medarbeidere og sjåfører med ansvar for daglig drift og HMS-oppfølging.
                </p>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-900">Hovedoppgaver:</div>
                  <ul className="space-y-1.5 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      <span>Organisere og fordele arbeid</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      <span>Følge opp HMS-rutiner daglig</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      <span>Veilede og støtte medarbeidere</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      <span>Rapportere til daglig leder</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Fordeler med denne strukturen</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Enkel og tydelig</div>
                    <p className="text-sm text-slate-600">Lett å forstå for alle ansatte</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Tilpasset fast food</div>
                    <p className="text-sm text-slate-600">Skreddersydd for bransjen</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Lovpålagt struktur</div>
                    <p className="text-sm text-slate-600">Godkjent av Arbeidstilsynet</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Fleksibel</div>
                    <p className="text-sm text-slate-600">Kan tilpasses bedriftens størrelse</p>
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
              Redigeringsfunksjonalitet kommer snart. Dette vil tillate autoriserte brukere å oppdatere organisasjonskartet.
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
