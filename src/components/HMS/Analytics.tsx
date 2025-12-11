import { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { hmsApi } from '../../lib/hmsSupabase';
import { TrendingUp, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsData {
  weeklyTrend: number[];
  categoryDistribution: { [key: string]: number };
  severityDistribution: { [key: string]: number };
  monthlyComparison: { current: number; previous: number };
  topLocations: { location: string; count: number }[];
}

export function Analytics() {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);

    const { data: incidents } = await hmsApi.getIncidents();

    if (incidents) {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const weeklyTrend = last7Days.map(date =>
        incidents.filter(inc => inc.incident_date === date).length
      );

      const categoryDist: { [key: string]: number } = {};
      const severityDist: { [key: string]: number } = {};

      incidents.forEach(inc => {
        categoryDist[inc.category_id] = (categoryDist[inc.category_id] || 0) + 1;
        severityDist[inc.severity] = (severityDist[inc.severity] || 0) + 1;
      });

      const currentMonth = new Date().getMonth();
      const currentMonthIncidents = incidents.filter(inc =>
        new Date(inc.incident_date).getMonth() === currentMonth
      ).length;

      const previousMonthIncidents = incidents.filter(inc =>
        new Date(inc.incident_date).getMonth() === currentMonth - 1
      ).length;

      setAnalyticsData({
        weeklyTrend,
        categoryDistribution: categoryDist,
        severityDistribution: severityDist,
        monthlyComparison: {
          current: currentMonthIncidents,
          previous: previousMonthIncidents
        },
        topLocations: []
      });
    }

    setLoading(false);
  };

  if (loading || !analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Laster analyser...</div>
      </div>
    );
  }

  const weeklyChartData = {
    labels: ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'I går', 'I dag'],
    datasets: [
      {
        label: 'Hendelser',
        data: analyticsData.weeklyTrend,
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const severityChartData = {
    labels: ['Lav', 'Middels', 'Høy', 'Kritisk'],
    datasets: [
      {
        label: 'Antall hendelser',
        data: [
          analyticsData.severityDistribution.low || 0,
          analyticsData.severityDistribution.medium || 0,
          analyticsData.severityDistribution.high || 0,
          analyticsData.severityDistribution.critical || 0,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      },
    ],
  };

  const trend = analyticsData.monthlyComparison.current - analyticsData.monthlyComparison.previous;
  const trendPercentage = analyticsData.monthlyComparison.previous > 0
    ? ((trend / analyticsData.monthlyComparison.previous) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Analyser og Innsikt</h2>
        <p className="text-slate-600">Analytics and Insights</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-8 h-8 text-purple-600" />
            <div>
              <h3 className="text-lg font-bold text-purple-900">Ukentlig trend</h3>
              <p className="text-sm text-purple-700">Weekly Trend</p>
            </div>
          </div>
          <div className="text-3xl font-black text-purple-900">
            {analyticsData.weeklyTrend.reduce((a, b) => a + b, 0)}
          </div>
          <p className="text-sm text-purple-700 mt-2">hendelser siste 7 dager</p>
        </div>

        <div className={`bg-gradient-to-br ${trend > 0 ? 'from-red-50 to-red-100' : 'from-emerald-50 to-emerald-100'} rounded-2xl p-6 border-2 ${trend > 0 ? 'border-red-200' : 'border-emerald-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className={`w-8 h-8 ${trend > 0 ? 'text-red-600' : 'text-emerald-600'}`} />
            <div>
              <h3 className={`text-lg font-bold ${trend > 0 ? 'text-red-900' : 'text-emerald-900'}`}>Månedlig endring</h3>
              <p className={`text-sm ${trend > 0 ? 'text-red-700' : 'text-emerald-700'}`}>Monthly Change</p>
            </div>
          </div>
          <div className={`text-3xl font-black ${trend > 0 ? 'text-red-900' : 'text-emerald-900'}`}>
            {trend > 0 ? '+' : ''}{trendPercentage}%
          </div>
          <p className={`text-sm ${trend > 0 ? 'text-red-700' : 'text-emerald-700'} mt-2`}>
            sammenlignet med forrige måned
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-bold text-blue-900">Løste saker</h3>
              <p className="text-sm text-blue-700">Resolved Cases</p>
            </div>
          </div>
          <div className="text-3xl font-black text-blue-900">
            {analyticsData.monthlyComparison.current}
          </div>
          <p className="text-sm text-blue-700 mt-2">denne måneden</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Ukentlig hendelsesutvikling</h3>
          <div className="h-64">
            <Line
              data={weeklyChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Alvorlighetsfordeling</h3>
          <div className="h-64">
            <Bar
              data={severityChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-6">
          <AlertTriangle className="w-12 h-12" />
          <div>
            <h3 className="text-2xl font-black">Smart Innsikt</h3>
            <p className="text-purple-100">Smart Insights from AI</p>
          </div>
        </div>
        <div className="space-y-4">
          {trend > 0 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white font-bold mb-2">⚠️ Økning i hendelser</p>
              <p className="text-purple-100">
                Det har vært en økning på {trendPercentage}% i hendelser denne måneden.
                Vurder å gjennomføre ekstra sikkerhetstrening.
              </p>
            </div>
          )}
          {analyticsData.severityDistribution.critical > 0 && (
            <div className="bg-red-500/30 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white font-bold mb-2">🚨 Kritiske hendelser registrert</p>
              <p className="text-red-100">
                {analyticsData.severityDistribution.critical} kritiske hendelser krever umiddelbar oppfølging.
              </p>
            </div>
          )}
          {trend <= 0 && (
            <div className="bg-emerald-500/30 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white font-bold mb-2">✅ Positiv utvikling</p>
              <p className="text-emerald-100">
                Antall hendelser har gått ned. Godt jobbet med forebyggende tiltak!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
