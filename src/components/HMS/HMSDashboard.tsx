import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
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
import {
 AlertTriangle,
 CheckCircle,
 Clock,
 TrendingUp,
 FileText,
 Shield,
 Leaf,
 Heart,
 AlertCircle,
 Activity,
 Target,
 Building2,
 Users,
 FileStack,
 Settings,
 ArrowRight
} from 'lucide-react';

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

interface DashboardStats {
 totalIncidents: number;
 openIncidents: number;
 criticalIncidents: number;
 reportsGenerated: number;
 avgComplianceScore: number;
}

interface AnalyticsData {
 weeklyTrend: number[];
 categoryDistribution: { [key: string]: number };
 severityDistribution: { [key: string]: number };
 monthlyComparison: { current: number; previous: number };
 topLocations: { location: string; count: number }[];
}

interface QuickAccessSection {
 id: string;
 name: string;
 description: string;
 icon: any;
 color: string;
 bgColor: string;
 borderColor: string;
}

export function HMSDashboard() {
 const [stats, setStats] = useState<DashboardStats>({
 totalIncidents: 0,
 openIncidents: 0,
 criticalIncidents: 0,
 reportsGenerated: 0,
 avgComplianceScore: 100,
 });
 const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 loadData();
 }, []);

 const loadData = async () => {
 setLoading(true);
 const statsData = await hmsApi.getDashboardStats();
 setStats(statsData);

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

 if (loading) {
 return (
 <div className="flex items-center justify-center h-64">
 <div className="text-slate-600"> Laster...</div>
 </div>
 );
 }

 const weeklyChartData = analyticsData ? {
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
 } : null;

 const severityChartData = analyticsData ? {
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
 } : null;

 const trend = analyticsData
 ? analyticsData.monthlyComparison.current - analyticsData.monthlyComparison.previous
 : 0;
 const trendPercentage = analyticsData && analyticsData.monthlyComparison.previous > 0
 ? ((trend / analyticsData.monthlyComparison.previous) * 100).toFixed(1)
 : '0';

 const quickAccessSections: QuickAccessSection[] = [
 {
 id: 'goals',
 name: 'Målsetting',
 description: 'HMS-mål og policyer',
 icon: Target,
 color: 'text-blue-600',
 bgColor: 'from-blue-50 to-blue-100',
 borderColor: 'border-blue-200'
 },
 {
 id: 'company',
 name: 'Bedrift',
 description: 'Firmaopplysninger',
 icon: Building2,
 color: 'text-cyan-600',
 bgColor: 'from-cyan-50 to-cyan-100',
 borderColor: 'border-cyan-200'
 },
 {
 id: 'employees',
 name: 'Ansatte',
 description: 'Personalliste',
 icon: Users,
 color: 'text-teal-600',
 bgColor: 'from-teal-50 to-teal-100',
 borderColor: 'border-teal-200'
 },
 {
 id: 'incidents',
 name: 'Hendelser',
 description: 'Hendelsesregistrering',
 icon: AlertTriangle,
 color: 'text-orange-600',
 bgColor: 'from-orange-50 to-orange-100',
 borderColor: 'border-orange-200'
 },
 {
 id: 'documents',
 name: 'Dokumenter',
 description: 'Dokumenthåndtering',
 icon: FileStack,
 color: 'text-indigo-600',
 bgColor: 'from-indigo-50 to-indigo-100',
 borderColor: 'border-indigo-200'
 },
 {
 id: 'settings',
 name: 'Innstillinger',
 description: 'Systeminnstillinger',
 icon: Settings,
 color: 'text-slate-600',
 bgColor: 'from-slate-50 to-slate-100',
 borderColor: 'border-slate-200'
 }
 ];

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-black text-slate-900">HMS Dashboard</h1>
 <p className="text-slate-600 mt-1">Helse, Miljø og Sikkerhet</p>
 </div>
 <div className="text-sm text-slate-500">
 Last update: {new Date().toLocaleString('nb-NO')}
 </div>
 </div>

 <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
 <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border-2 border-red-200">
 <div className="flex items-center justify-between mb-4">
 <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
 <AlertTriangle className="w-6 h-6 text-white" />
 </div>
 <span className="text-3xl font-black text-red-900">{stats.totalIncidents}</span>
 </div>
 <h3 className="text-lg font-bold text-red-900 mb-1">Totale hendelser</h3>
 <p className="text-sm text-red-700">Total incidents (7 days)</p>
 </div>

 <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border-2 border-amber-200">
 <div className="flex items-center justify-between mb-4">
 <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center">
 <Clock className="w-6 h-6 text-white" />
 </div>
 <span className="text-3xl font-black text-amber-900">{stats.openIncidents}</span>
 </div>
 <h3 className="text-lg font-bold text-amber-900 mb-1">Åpne saker</h3>
 <p className="text-sm text-amber-700">Open cases</p>
 </div>

 <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200">
 <div className="flex items-center justify-between mb-4">
 <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
 <AlertCircle className="w-6 h-6 text-white" />
 </div>
 <span className="text-3xl font-black text-purple-900">{stats.criticalIncidents}</span>
 </div>
 <h3 className="text-lg font-bold text-purple-900 mb-1">Kritiske hendelser</h3>
 <p className="text-sm text-purple-700">Critical incidents</p>
 </div>

 <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border-2 border-emerald-200">
 <div className="flex items-center justify-between mb-4">
 <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
 <CheckCircle className="w-6 h-6 text-white" />
 </div>
 <span className="text-3xl font-black text-emerald-900">{stats.avgComplianceScore}%</span>
 </div>
 <h3 className="text-lg font-bold text-emerald-900 mb-1">HMS Score</h3>
 <p className="text-sm text-emerald-700">Samlet vurdering</p>
 </div>
 </div>

 <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h2 className="text-2xl font-black text-slate-900">Hurtiglenker</h2>
 <p className="text-sm text-slate-600 mt-1">Tilgang til viktige moduler</p>
 </div>
 </div>
 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
 {quickAccessSections.map((section) => {
 const Icon = section.icon;
 return (
 <button
 key={section.id}
 onClick={() => {
 const viewMap: { [key: string]: string } = {
 'goals': 'goals-hms',
 'company': 'company-info',
 'employees': 'employees-list',
 'incidents': 'incidents-main',
 'documents': 'documents-manager',
 'settings': 'settings-ai-config'
 };
 (window as any).hmsNavigate?.(viewMap[section.id]);
 }}
 className={`bg-gradient-to-br ${section.bgColor} rounded-xl p-5 border-2 ${section.borderColor} hover:shadow-lg transition-all group`}
 >
 <div className="flex items-center justify-between mb-3">
 <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${section.color.replace('text-', 'bg-')}`}>
 <Icon className="w-6 h-6 text-white" />
 </div>
 <ArrowRight className={`w-5 h-5 ${section.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
 </div>
 <h3 className={`text-lg font-bold ${section.color.replace('-600', '-900')} mb-1`}>
 {section.name}
 </h3>
 <p className={`text-sm ${section.color.replace('-600', '-700')}`}>
 {section.description}
 </p>
 </button>
 );
 })}
 </div>
 </div>

 {analyticsData && (
 <>
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
 {weeklyChartData && (
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
 )}

 {severityChartData && (
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
 )}
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
 </>
 )}

 <div className="grid md:grid-cols-2 gap-6">
 <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
 <div className="flex items-center gap-3 mb-6">
 <FileText className="w-6 h-6 text-blue-600" />
 <h2 className="text-xl font-bold text-slate-900">Rapporter</h2>
 </div>
 <div className="space-y-3">
 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
 <span className="font-semibold text-slate-700">Genererte rapporter</span>
 <span className="text-2xl font-black text-blue-600">{stats.reportsGenerated}</span>
 </div>
 </div>
 </div>

 <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
 <div className="flex items-center gap-3 mb-6">
 <TrendingUp className="w-6 h-6 text-emerald-600" />
 <h2 className="text-xl font-bold text-slate-900">Kategorier</h2>
 </div>
 <div className="space-y-3">
 <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
 <Shield className="w-5 h-5 text-red-600" />
 <span className="font-semibold text-red-900">Sikkerhet</span>
 </div>
 <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
 <Leaf className="w-5 h-5 text-emerald-600" />
 <span className="font-semibold text-emerald-900">Miljø</span>
 </div>
 <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
 <Heart className="w-5 h-5 text-blue-600" />
 <span className="font-semibold text-blue-900">Helse</span>
 </div>
 </div>
 </div>
 </div>

 <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-2xl font-black mb-2">HMS Internkontroll System</h2>
 <p className="text-blue-100 text-lg">
 Safety 
 </p>
 <p className="text-blue-100 mt-2">
 I henhold til Arbeidstilsynet og Mattilsynet forskrifter
 </p>
 </div>
 <div className="hidden lg:block">
 <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
 <CheckCircle className="w-12 h-12 text-white" />
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
