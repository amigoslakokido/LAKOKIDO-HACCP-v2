import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Brain,
  FileText,
  Sparkles,
  BarChart3,
  Save,
  CheckCircle,
  AlertCircle,
  Key,
  Zap,
  TrendingUp,
  Shield
} from 'lucide-react';

interface AISettings {
  ai_recommendations_enabled: boolean;
  report_generator_enabled: boolean;
  chatgpt_enabled: boolean;
  chatgpt_api_key: string;
  ai_analytics_enabled: boolean;
}

export function AISettings() {
  const [settings, setSettings] = useState<AISettings>({
    ai_recommendations_enabled: true,
    report_generator_enabled: true,
    chatgpt_enabled: false,
    chatgpt_api_key: '',
    ai_analytics_enabled: true,
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('hms_ai_settings')
      .select('*')
      .maybeSingle();

    if (data) {
      setSettings(data);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaveSuccess(false);

    const { data: existing } = await supabase
      .from('hms_ai_settings')
      .select('id')
      .maybeSingle();

    if (existing) {
      await supabase
        .from('hms_ai_settings')
        .update(settings)
        .eq('id', existing.id);
    } else {
      await supabase
        .from('hms_ai_settings')
        .insert([settings]);
    }

    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const SettingCard = ({
    icon: Icon,
    title,
    description,
    enabled,
    onToggle,
    gradient
  }: any) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 border-2 border-opacity-50 transition-all hover:shadow-xl`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
            <Icon className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
            <p className="text-sm text-slate-700">{description}</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`relative w-16 h-8 rounded-full transition-all shadow-inner ${
            enabled
              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
              : 'bg-slate-300'
          }`}
        >
          <div
            className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${
              enabled ? 'right-1' : 'left-1'
            }`}
          />
        </button>
      </div>
      <div className={`text-sm font-bold px-4 py-2 rounded-lg inline-flex items-center gap-2 ${
        enabled
          ? 'bg-green-100 text-green-800 border-2 border-green-300'
          : 'bg-slate-100 text-slate-600 border-2 border-slate-300'
      }`}>
        {enabled ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Aktiv
          </>
        ) : (
          <>
            <AlertCircle className="w-4 h-4" />
            Inaktiv
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AI Innstillinger</h2>
          <p className="text-slate-600">Konfigurer HMS AI-funksjoner og integrasjoner</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
            saveSuccess
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
          } disabled:opacity-50`}
        >
          {saveSuccess ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Lagret!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {saving ? 'Lagrer...' : 'Lagre innstillinger'}
            </>
          )}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <SettingCard
          icon={Sparkles}
          title="AI Anbefalinger"
          description="Intelligente tips og analyse"
          enabled={settings.ai_recommendations_enabled}
          onToggle={() => setSettings({
            ...settings,
            ai_recommendations_enabled: !settings.ai_recommendations_enabled
          })}
          gradient="from-purple-50 to-pink-50"
        />

        <SettingCard
          icon={FileText}
          title="Rapport Generator"
          description="Generer HMS-rapporter"
          enabled={settings.report_generator_enabled}
          onToggle={() => setSettings({
            ...settings,
            report_generator_enabled: !settings.report_generator_enabled
          })}
          gradient="from-blue-50 to-cyan-50"
        />

        <SettingCard
          icon={BarChart3}
          title="AI Smart Analyse"
          description="Avansert dataanalyse og prediktiv modellering"
          enabled={settings.ai_analytics_enabled}
          onToggle={() => setSettings({
            ...settings,
            ai_analytics_enabled: !settings.ai_analytics_enabled
          })}
          gradient="from-emerald-50 to-teal-50"
        />

        <SettingCard
          icon={Brain}
          title="OpenAI ChatGPT"
          description="Koble til ChatGPT API"
          enabled={settings.chatgpt_enabled}
          onToggle={() => setSettings({
            ...settings,
            chatgpt_enabled: !settings.chatgpt_enabled
          })}
          gradient="from-orange-50 to-amber-50"
        />
      </div>

      {settings.chatgpt_enabled && (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <Key className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">OpenAI API Nøkkel</h3>
              <p className="text-sm text-slate-700">Legg inn din OpenAI API-nøkkel for ChatGPT-integrasjon</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">API Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.chatgpt_api_key}
                  onChange={(e) => setSettings({ ...settings, chatgpt_api_key: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 pr-24 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-all text-sm font-bold"
                >
                  {showApiKey ? 'Skjul' : 'Vis'}
                </button>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-orange-200">
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-600" />
                Hvordan få API-nøkkel:
              </h4>
              <ol className="text-sm text-slate-700 space-y-1 list-decimal list-inside">
                <li>Gå til <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-orange-600 font-bold hover:underline">platform.openai.com</a></li>
                <li>Logg inn eller opprett en konto</li>
                <li>Naviger til "API Keys"</li>
                <li>Klikk "Create new secret key"</li>
                <li>Kopier og lim inn nøkkelen her</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-blue-300 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-600 uppercase">Total Analyser</p>
              <p className="text-2xl font-black text-slate-900">247</p>
            </div>
          </div>
          <div className="text-xs text-slate-500">Siden oppstart</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-green-300 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-600 uppercase">AI Rapporter</p>
              <p className="text-2xl font-black text-slate-900">52</p>
            </div>
          </div>
          <div className="text-xs text-slate-500">Generert denne måneden</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-purple-300 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-600 uppercase">Presisjon</p>
              <p className="text-2xl font-black text-slate-900">97%</p>
            </div>
          </div>
          <div className="text-xs text-slate-500">AI Nøyaktighet</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">AI-drevne Funksjoner</h3>
            <p className="text-sm text-slate-700">Oversikt over tilgjengelige AI-kapabiliteter</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-bold text-slate-900">Automatisk Risikoanalyse</span>
            </div>
            <p className="text-sm text-slate-600">Identifiser potensielle risikoer automatisk</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-bold text-slate-900">Prediktiv Vedlikehold</span>
            </div>
            <p className="text-sm text-slate-600">Forutse vedlikeholdsbehov før problemer oppstår</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-bold text-slate-900">Hendelsesmønster Gjenkjenning</span>
            </div>
            <p className="text-sm text-slate-600">Oppdag tilbakevendende mønstre i hendelser</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-bold text-slate-900">Compliance Overvåking</span>
            </div>
            <p className="text-sm text-slate-600">Automatisk sjekk av regelverksetterlevelse</p>
          </div>
        </div>
      </div>
    </div>
  );
}
