import { useState } from 'react';
import { Target, CheckCircle2, Leaf, Shield, TrendingUp, Users, FileText, AlertCircle, Download, Printer } from 'lucide-react';
import { HMSPdfGenerator } from '../../utils/hmsPdfGenerator';

export function Goals() {
  const [activeTab, setActiveTab] = useState<'overview' | 'edit'>('overview');

  const downloadPDF = () => {
    const pdf = new HMSPdfGenerator();

    pdf.addHeader({
      title: 'HMS-mål',
      subtitle: 'Helse, Miljø og Sikkerhet',
      companyName: 'Amigos la Kokido AS',
      generatedDate: new Date(),
    });

    pdf.addSectionTitle('Formål', 'primary');
    pdf.addText(
      'Formålet med HMS-arbeidet i Amigos la Kokido AS er å sikre et fullt forsvarlig arbeidsmiljø for alle ansatte, gjester og samarbeidspartnere. Virksomheten forplikter seg til å arbeide systematisk og kontinuerlig med helse, miljø og sikkerhet i tråd med kravene i Internkontrollforskriften og Arbeidsmiljøloven.'
    );
    pdf.addSpacing(10);

    pdf.addSectionTitle('Hovedmål', 'success');
    pdf.addBulletList([
      'Å forebygge ulykker, skader og helsesvekkelser ved hjelp av gode rutiner, opplæring og regelmessige kontroller.',
      'Å sikre et trygt og trivelig arbeidsmiljø som fremmer trivsel, samarbeid og respekt mellom ansatte.',
      'Å beskytte ytre miljøet gjennom ansvarlig håndtering av avfall, olje, fett, kjemikalier og energi.',
      'Å opprettholde kontinuerlig forbedring av HMS-arbeidet gjennom systematisk evaluering og justering.',
    ]);
    pdf.addSpacing(10);

    pdf.addSectionTitle('Konkrete mål for 2025', 'info');
    pdf.addNumberedList([
      'Null arbeidsulykker med fravær',
      'Maksimalt 5% korttidsfravær',
      '100% av ansatte gjennomfører obligatorisk HMS-opplæring',
      'Alle hendelser og avvik skal lukkes innen 30 dager',
      'Redusere avfallsmengde med 10%',
      'Gjennomføre minimum 4 brannøvelser i året',
      'Opprettholde mattrygghetsscore over 95%',
      'Alle medarbeidersamtaler gjennomføres innen Q1',
    ]);
    pdf.addSpacing(10);

    pdf.addSectionTitle('Oppfølging og evaluering', 'warning');
    pdf.addText(
      'HMS-målene skal evalueres kvartalsvis i ledermøter. Resultatene skal presenteres for alle ansatte og følges opp med konkrete tiltak ved avvik.'
    );

    pdf.save('HMS-Mal-Amigos-la-Kokido.pdf');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">HMS-mål</h1>
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
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Oversikt
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'edit'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Rediger
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Purpose Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-start gap-3 mb-4">
                <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">Formål</h2>
                  <p className="text-slate-700 leading-relaxed">
                    Formålet med HMS-arbeidet i Amigos la Kokido AS er å sikre et fullt forsvarlig arbeidsmiljø
                    for alle ansatte, gjester og samarbeidspartnere. Virksomheten forplikter seg til å arbeide
                    systematisk og kontinuerlig med helse, miljø og sikkerhet i tråd med kravene i
                    Internkontrollforskriften og Arbeidsmiljøloven.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Goals */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-slate-900">Hovedmål</h2>
              </div>

              <div className="grid gap-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    Å forebygge ulykker, skader og helsesvekkelser ved hjelp av gode rutiner, opplæring og regelmessige kontroller.
                  </p>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    Å sikre et trygt og trivelig arbeidsmiljø som fremmer trivsel, samarbeid og respekt mellom ansatte.
                  </p>
                </div>

                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    Å beskytte ytre miljøet gjennom ansvarlig håndtering av avfall, olje, fett, kjemikalier og energi.
                  </p>
                </div>

                <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-teal-600" />
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    Å redusere virksomhetens miljøavtrykk gjennom bruk av elektriske kjøretøy, energieffektivt utstyr og samarbeid med miljøsertifiserte leverandører.
                  </p>
                </div>

                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    Å sørge for orden, renhold og god internkontroll gjennom faste rutiner og tydelig fordeling av ansvar.
                  </p>
                </div>

                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    Å sikre korrekt dokumentasjon av avvik, opplæring, risikovurderinger, vedlikehold, brannvern og revisjoner.
                  </p>
                </div>

                <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-pink-600" />
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    Å sørge for at alle ansatte har nødvendig opplæring, inkludert HMS-opplæring for daglig leder og rutineopplæring for øvrige ansatte.
                  </p>
                </div>
              </div>
            </div>

            {/* Sub Goals */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-slate-900">Delmål</h2>
              </div>

              <div className="space-y-3">
                {[
                  'Alle avvik skal registreres, behandles og lukkes med tiltak innen rimelig tid.',
                  'Brannrutiner og sjekklister skal følges og dokumenteres hver uke.',
                  'Elektriske anlegg skal kontrolleres og dokumenteres regelmessig i samarbeid med autoriserte fagfolk.',
                  'Alt fett og olje fra kjøkkenet skal håndteres av godkjent ekstern leverandør (NORVA).',
                  'Gulvvask og rengjøring skal utføres med produkter og utstyr fra miljøsertifiserte aktører som LEKO Mater.',
                  'Det skal absolutt ikke forekomme farlige arbeidsforhold, dårlig renhold eller mangler som kan føre til skader eller sykdom.'
                ].map((goal, index) => (
                  <div
                    key={index}
                    className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-700 leading-relaxed">{goal}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Commitments */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-bold text-slate-900">Forpliktelser</h2>
              </div>

              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                <p className="font-semibold text-slate-900 mb-4">Bedriften forplikter seg til:</p>
                <ul className="space-y-3">
                  {[
                    'Å følge alle lover og forskrifter relatert til HMS.',
                    'Å utføre årlige revisjoner (HMS-runden) med dokumentert rapport.',
                    'Å vedlikeholde et levende HMS-system – ikke et system som ligger i en hylle.',
                    'Å involvere ansatte i HMS-arbeidet og sikre åpen kommunikasjon om risiko, tiltak og forbedringer.'
                  ].map((commitment, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-2" />
                      <p className="text-slate-700 leading-relaxed">{commitment}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Continuous Improvement */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">Kontinuerlig forbedring</h2>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <p className="text-slate-700 leading-relaxed">
                  Amigos la Kokido AS skal jobbe etter prinsippet om kontinuerlig forbedring, der innsamlede data,
                  avviksrapporter, medarbeiderinnspill og revisjoner brukes til å videreutvikle rutiner og
                  arbeidsmetoder for å sikre et stadig bedre arbeidsmiljø og lavere miljøpåvirkning.
                </p>
              </div>
            </div>

            {/* Footer Info */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Viktig informasjon</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Dette HMS-måldokumentet skal være kjent for alle ansatte og skal gjennomgås årlig i forbindelse
                    med HMS-runden. Dokumentet er en del av virksomhetens internkontrollsystem og skal være
                    tilgjengelig for Arbeidstilsynet ved forespørsel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'edit' && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Redigeringsfunksjon</h3>
            <p className="text-slate-600">
              Redigeringsfunksjonalitet kommer snart. Dette vil tillate autoriserte brukere å oppdatere HMS-mål.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
