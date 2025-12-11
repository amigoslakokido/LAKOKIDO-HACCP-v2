import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  TrendingUp, AlertTriangle, CheckCircle, ThermometerSun,
  Activity, Award, Target, Clock, BarChart3, Shield,
  Users, ClipboardCheck, Droplets, Flame, FileText
} from 'lucide-react';

interface DashboardStats {
  complianceRate: number;
  tasksCompleted: number;
  tasksTotal: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  dailyReports: number;
  criticalAlerts: number;
  avgTemperature: number;
  tempViolations: number;
  hygieneScore: number;
  cleaningScore: number;
  lastUpdate: string;
}

const themes = [
  {
    name: 'Ocean',
    gradient: 'from-blue-600 via-cyan-600 to-teal-600',
    cardFrom: 'from-blue-500',
    cardTo: 'to-blue-600',
    accent: 'blue'
  },
  {
    name: 'Sunset',
    gradient: 'from-orange-500 via-pink-500 to-purple-600',
    cardFrom: 'from-orange-500',
    cardTo: 'to-pink-600',
    accent: 'orange'
  },
  {
    name: 'Forest',
    gradient: 'from-green-600 via-emerald-600 to-teal-600',
    cardFrom: 'from-green-500',
    cardTo: 'to-emerald-600',
    accent: 'green'
  },
  {
    name: 'Night',
    gradient: 'from-indigo-600 via-purple-600 to-pink-600',
    cardFrom: 'from-indigo-500',
    cardTo: 'to-purple-600',
    accent: 'indigo'
  }
];

export function HACCPDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentTheme, setCurrentTheme] = useState(0);
  const [aiSuggestion, setAiSuggestion] = useState('');

  useEffect(() => {
    loadStats();

    const statsInterval = setInterval(loadStats, 10 * 60 * 1000);
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    const themeInterval = setInterval(() => {
      setCurrentTheme(prev => (prev + 1) % themes.length);
      generateAISuggestion();
    }, 10 * 60 * 1000);

    generateAISuggestion();

    return () => {
      clearInterval(statsInterval);
      clearInterval(timeInterval);
      clearInterval(themeInterval);
    };
  }, []);

  const loadStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [
        { data: reports, count: reportsCount },
        { data: tempLogs },
        { data: cleaningData, count: cleaningCompleted },
        { count: cleaningTotal },
        { data: hygieneData },
        { data: incidents },
        { data: routineTasks }
      ] = await Promise.all([
        supabase.from('daily_reports').select('*', { count: 'exact' }).gte('report_date', today),
        supabase.from('temperature_logs').select('temperature, status').eq('log_date', today),
        supabase.from('cleaning_logs').select('*', { count: 'exact' }).eq('log_date', today).eq('status', 'completed'),
        supabase.from('cleaning_tasks').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('hygiene_checks').select('*').eq('check_date', today),
        supabase.from('critical_incidents').select('*').eq('status', 'open'),
        supabase.from('routine_task_logs').select('*').eq('completed_date', today)
      ]);

      const avgTemp = tempLogs?.length
        ? tempLogs.reduce((sum, log) => sum + parseFloat(log.temperature), 0) / tempLogs.length
        : 0;

      const tempViolations = tempLogs?.filter(log => log.status !== 'safe').length || 0;

      const hygienePass = hygieneData?.filter(h =>
        h.uniform_clean && h.hands_washed && h.jewelry_removed && h.illness_free
      ).length || 0;
      const hygieneScore = hygieneData?.length ? (hygienePass / hygieneData.length) * 100 : 100;

      const cleaningScore = cleaningTotal ? ((cleaningCompleted || 0) / cleaningTotal) * 100 : 100;

      const totalTasks = (cleaningTotal || 0) + (hygieneData?.length || 0);
      const completedTasks = (cleaningCompleted || 0) + hygienePass;

      const totalChecks = totalTasks + (tempLogs?.length || 0);
      const violations = tempViolations + (totalTasks - completedTasks);
      const complianceRate = totalChecks > 0 ? ((totalChecks - violations) / totalChecks) * 100 : 100;

      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (incidents && incidents.length > 0) riskLevel = 'critical';
      else if (tempViolations > 5) riskLevel = 'high';
      else if (complianceRate < 85) riskLevel = 'medium';

      setStats({
        complianceRate: Math.round(complianceRate),
        tasksCompleted: completedTasks,
        tasksTotal: totalTasks,
        riskLevel,
        dailyReports: reportsCount || 0,
        criticalAlerts: incidents?.length || 0,
        avgTemperature: Math.round(avgTemp * 10) / 10,
        tempViolations,
        hygieneScore: Math.round(hygieneScore),
        cleaningScore: Math.round(cleaningScore),
        lastUpdate: new Date().toLocaleTimeString('nb-NO')
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAISuggestion = () => {
    const suggestions = [
      'Øk temperatursjekkfrekvensen i kjølere for bedre kontroll',
      'Planlegg ekstra rengjøringsrunde i helgen for optimal hygiene',
      'Vurder å oppdatere HACCP-prosedyrer basert på siste rapporter',
      'Sjekk at alle ansatte har oppdatert hygieneopplæring',
      'Gjennomgå og optimaliser arbeidsflyt for temperaturtesting',
      'Planlegg intern audit av kritiske kontrollpunkter'
    ];
    setAiSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-green-600 text-white';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'critical': return 'KRITISK';
      case 'high': return 'HØY';
      case 'medium': return 'MIDDELS';
      default: return 'LAV';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Laster dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const theme = themes[currentTheme];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className={`bg-gradient-to-br ${theme.gradient} rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden`}>
        <div className="absolute inset-0 bg-white opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-10 h-10" />
                <h1 className="text-4xl font-bold">HACCP Dashboard</h1>
              </div>
              <p className="text-lg opacity-90">
                {currentTime.toLocaleDateString('nb-NO', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-6xl font-bold mb-1 tracking-tight">
                {currentTime.toLocaleTimeString('nb-NO', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <div className="text-sm opacity-75">Oppdateres automatisk</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
              <div className="flex items-center justify-between mb-4">
                <Award className="w-12 h-12" />
                <div className="text-right">
                  <div className="text-5xl font-bold">{stats.complianceRate}%</div>
                  <div className="text-sm opacity-90">Etterlevelse</div>
                </div>
              </div>
              <div className="h-3 bg-white bg-opacity-20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000"
                  style={{ width: `${stats.complianceRate}%` }}
                ></div>
              </div>
            </div>

            <div className={`${getRiskColor(stats.riskLevel)} rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-transform`}>
              <div className="flex items-center justify-between mb-4">
                <Flame className="w-12 h-12" />
                <div className="text-right">
                  <div className="text-4xl font-bold">{getRiskLabel(stats.riskLevel)}</div>
                  <div className="text-sm opacity-90">Risikonivå</div>
                </div>
              </div>
              {stats.criticalAlerts > 0 && (
                <div className="text-sm font-medium">
                  ⚠️ {stats.criticalAlerts} aktive varsler
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`bg-gradient-to-br ${theme.cardFrom} ${theme.cardTo} rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all transform hover:scale-105`}>
          <div className="flex items-center gap-3 mb-3">
            <ClipboardCheck className="w-8 h-8" />
            <div className="text-3xl font-bold">{stats.tasksCompleted}/{stats.tasksTotal}</div>
          </div>
          <div className="text-sm opacity-90">Oppgaver fullført</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all transform hover:scale-105">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-8 h-8" />
            <div className="text-3xl font-bold">{stats.dailyReports}</div>
          </div>
          <div className="text-sm opacity-90">Rapporter i dag</div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all transform hover:scale-105">
          <div className="flex items-center gap-3 mb-3">
            <ThermometerSun className="w-8 h-8" />
            <div className="text-3xl font-bold">{stats.avgTemperature}°C</div>
          </div>
          <div className="text-sm opacity-90">Gj.snitt temp</div>
        </div>

        <div className={`bg-gradient-to-br ${stats.criticalAlerts > 0 ? 'from-red-500 to-red-700' : 'from-gray-400 to-gray-600'} rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all transform hover:scale-105`}>
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-8 h-8" />
            <div className="text-3xl font-bold">{stats.criticalAlerts}</div>
          </div>
          <div className="text-sm opacity-90">Kritiske varsler</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-cyan-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-100 rounded-xl">
                <Droplets className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.hygieneScore}%</div>
                <div className="text-sm text-gray-600">Hygienescore</div>
              </div>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-1000"
              style={{ width: `${stats.hygieneScore}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.cleaningScore}%</div>
                <div className="text-sm text-gray-600">Rengjøring</div>
              </div>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-1000"
              style={{ width: `${stats.cleaningScore}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-indigo-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.tempViolations}</div>
                <div className="text-sm text-gray-600">Temp-avvik</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-500 rounded-xl">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-purple-900 mb-2">🤖 AI-forslag for forbedring</h3>
            <p className="text-purple-800">{aiSuggestion}</p>
            <div className="mt-3 text-xs text-purple-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Oppdatert: {stats.lastUpdate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
