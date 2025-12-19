import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  TrendingUp, TrendingDown, CheckCircle, AlertTriangle,
  ThermometerSun, Droplets, Users, Calendar, Clock,
  Award, Target, Activity, BarChart3
} from 'lucide-react';

interface DashboardStats {
  criticalIncidents: number;
  complianceRate: number;
  avgTemperature: number;
  tempViolations: number;
  hygieneChecks: number;
  cleaningTasks: number;
  employeesActive: number;
}

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10 * 60 * 1000);
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const loadStats = async () => {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];

      const [
        { count: criticalIncidents },
        { data: tempLogs },
        { data: hygieneData },
        { data: cleaningData },
        { data: employees }
      ] = await Promise.all([
        supabase.from('critical_incidents').select('*', { count: 'exact', head: true }).eq('severity', 'critical'),
        supabase.from('temperature_logs').select('temperature, status').limit(100),
        supabase.from('hygiene_checks').select('*', { count: 'exact', head: true }),
        supabase.from('cleaning_logs').select('*', { count: 'exact', head: true }),
        supabase.from('employees').select('*', { count: 'exact', head: true }).eq('active', true)
      ]);

      const avgTemp = tempLogs?.length
        ? tempLogs.reduce((sum, log) => sum + parseFloat(log.temperature), 0) / tempLogs.length
        : 0;

      const tempViolationsCount = tempLogs?.filter(log => log.status !== 'safe').length || 0;

      const totalChecks = (tempLogs?.length || 0) + (hygieneData || 0) + (cleaningData || 0);
      const violations = tempViolationsCount;
      const complianceRate = totalChecks > 0 ? ((totalChecks - violations) / totalChecks) * 100 : 100;

      setStats({
        criticalIncidents: criticalIncidents || 0,
        complianceRate: Math.round(complianceRate),
        avgTemperature: Math.round(avgTemp * 10) / 10,
        tempViolations: tempViolationsCount,
        hygieneChecks: hygieneData || 0,
        cleaningTasks: cleaningData || 0,
        employeesActive: employees || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  const getComplianceColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600 bg-green-50 border-green-200';
    if (rate >= 85) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('nb-NO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('nb-NO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">HACCP Dashboard</h1>
            <p className="text-blue-100 text-lg">{formatDate()}</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold mb-1">{formatTime()}</div>
            <div className="text-blue-200 text-sm">Oppdateres hvert 10. minutt</div>
          </div>
        </div>

        <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${getComplianceColor(stats.complianceRate)}`}>
          <Award className="w-12 h-12" />
          <div>
            <div className="text-3xl font-bold">{stats.complianceRate}%</div>
            <div className="text-sm font-medium">Etterlevelse av standarder</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className={`rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow ${
          stats.criticalIncidents > 0
            ? 'bg-gradient-to-br from-red-500 to-red-600'
            : 'bg-gradient-to-br from-gray-400 to-gray-500'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-10 h-10" />
            <div className="text-right">
              <div className="text-3xl font-bold">{stats.criticalIncidents}</div>
              <div className={`text-sm ${stats.criticalIncidents > 0 ? 'text-red-100' : 'text-gray-100'}`}>
                Kritiske hendelser
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {stats.criticalIncidents > 0 ? (
              <>
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm text-red-100">Krever oppfølging</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm text-gray-100">Ingen aktive</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <ThermometerSun className="w-10 h-10" />
            <div className="text-right">
              <div className="text-3xl font-bold">{stats.avgTemperature}°C</div>
              <div className="text-blue-100 text-sm">Gj.snitt temperatur</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-blue-100">
            <Activity className="w-4 h-4" />
            <span className="text-sm">{stats.tempViolations} avvik registrert</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-10 h-10" />
            <div className="text-right">
              <div className="text-3xl font-bold">{stats.employeesActive}</div>
              <div className="text-purple-100 text-sm">Aktive ansatte</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-purple-100">
            <Target className="w-4 h-4" />
            <span className="text-sm">I dag på jobb</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-cyan-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-cyan-100 rounded-lg">
              <Droplets className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.hygieneChecks}</div>
              <div className="text-sm text-gray-600">Hygienekontroller</div>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500" style={{ width: '85%' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.cleaningTasks}</div>
              <div className="text-sm text-gray-600">Renholdsoppgaver</div>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500" style={{ width: '92%' }}></div>
          </div>
        </div>

      </div>

      <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-300 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-400 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-amber-900 mb-2">Ytelsessammendrag</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-amber-700 font-medium">Kvalitetsscore</div>
                <div className="text-2xl font-bold text-amber-900">{stats.complianceRate}%</div>
              </div>
              <div>
                <div className="text-amber-700 font-medium">Gjennomføring</div>
                <div className="text-2xl font-bold text-amber-900">
                  {stats.complianceRate >= 95 ? 'Utmerket' : stats.complianceRate >= 85 ? 'God' : 'Trenger forbedring'}
                </div>
              </div>
              <div>
                <div className="text-amber-700 font-medium">Status</div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.criticalIncidents === 0 ? '✓ OK' : '⚠ Varsel'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
