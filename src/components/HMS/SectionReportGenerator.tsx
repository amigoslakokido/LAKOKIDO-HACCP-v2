import { useState } from 'react';
import { FileText, Download, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { HMSPdfGenerator } from '../../utils/hmsPdfGenerator';

interface SectionReportGeneratorProps {
  sectionCode: string;
  sectionName: string;
  onClose?: () => void;
}

export function SectionReportGenerator({
  sectionCode,
  sectionName,
  onClose,
}: SectionReportGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState('');

  const generateReport = async () => {
    setLoading(true);
    setError('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/hms-assistant?action=generate-report&section=${sectionCode}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reportDate: new Date().toISOString(),
            includeAnalysis: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Feil ved generering av rapport');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Ukjent feil');
      }

      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Kunne ikke generere rapport');
      console.error('Report generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!report) return;

    const pdf = new HMSPdfGenerator();

    pdf.addHeader({
      title: `${sectionName} Rapport`,
      subtitle: 'HMS System Rapport',
      companyName: 'Amigos la Kokido AS',
      generatedDate: new Date(report.generatedAt),
    });

    const content = report.report.content;
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.trim() === '') {
        pdf.addSpacing(3);
      } else if (line.startsWith('# ')) {
        pdf.addSectionTitle(line.substring(2), 'primary');
      } else if (line.startsWith('## ')) {
        pdf.addSectionTitle(line.substring(3), 'primary');
      } else if (line.startsWith('- ')) {
        pdf.addText(line.substring(2));
      } else if (line.match(/^\d+\. /)) {
        pdf.addText(line);
      } else if (line.startsWith('**') && line.endsWith('**')) {
        pdf.addText(line.replace(/\*\*/g, ''), { bold: true });
      } else {
        pdf.addText(line);
      }
    }

    pdf.addSpacing(10);
    pdf.addInfoBox(
      'Rapportinformasjon',
      `Generert: ${new Date(report.generatedAt).toLocaleString('nb-NO')}\nKilde: ${report.report.source === 'chatgpt' ? 'AI-drevet analyse (ChatGPT)' : 'Regelbasert analyse'}\nModell: ${report.report.model}`,
      'info'
    );

    const filename = `${sectionName.replace(/\s+/g, '_')}_Rapport_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{sectionName} Rapport</h2>
                <p className="text-sm text-slate-600">AI-drevet rapportgenerator</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!report && !loading && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Klar til å generere rapport
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Systemet vil analysere alle data for {sectionName.toLowerCase()} og lage en
                detaljert rapport med anbefalinger og tiltak.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-left text-sm text-blue-900">
                    <p className="font-semibold mb-1">AI-analyse tilgjengelig</p>
                    <p>
                      Hvis OpenAI API-nøkkel er konfigurert, får du en detaljert AI-drevet
                      analyse. Ellers får du en regelbasert rapport.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={generateReport}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
              >
                Generer rapport
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Genererer rapport...
              </h3>
              <p className="text-slate-600">
                Analyserer data og lager en omfattende rapport
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Feil</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={generateReport}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Prøv igjen
              </button>
            </div>
          )}

          {report && !loading && (
            <div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-slate-900">
                        Rapport generert
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {new Date(report.generatedAt).toLocaleString('nb-NO')} •{' '}
                      {report.report.source === 'chatgpt'
                        ? 'AI-drevet analyse'
                        : 'Regelbasert analyse'}{' '}
                      • {report.report.model}
                    </p>
                  </div>
                  <button
                    onClick={downloadPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    Last ned PDF
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-6 prose prose-slate max-w-none">
                <div className="whitespace-pre-wrap font-sans text-slate-800">
                  {report.report.content}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
