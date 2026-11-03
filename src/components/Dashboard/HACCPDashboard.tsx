import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  FlaskConical,
  Loader2,
  Sparkles,
  Thermometer,
  Users,
  XCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

interface TemperatureRow {
  id: string;
  equipment_id: string;
  temperature: number;
  status: string;
  log_time: string;
  created_at: string;
  equipmentName: string;
  zoneName: string;
}

interface CleaningRow {
  id: string;
  task_id: string;
  status: string;
  log_time: string | null;
  created_at: string;
  taskName: string;
}

interface ReportRow {
  id: string;
  report_date: string;
  report_type: string;
  overall_status: string;
}

interface DashboardData {
  reportCount: number;
  activeEmployees: number;
  temperatureViolations: number;
  criticalAlerts: number;
  todayTemperatures: TemperatureRow[];
  todayCleaning: CleaningRow[];
  cleaningTotal: number;
  recentTemperatures: TemperatureRow[];
  recentCleaning: CleaningRow[];
  recentReports: ReportRow[];
  lastSevenDays: { reports: number; temperatureViolations: number; cleaningTasks: number; criticalAlerts: number };
}

const emptyData: DashboardData = {
  reportCount: 0,
  activeEmployees: 0,
  temperatureViolations: 0,
  criticalAlerts: 0,
  todayTemperatures: [],
  todayCleaning: [],
  cleaningTotal: 0,
  recentTemperatures: [],
  recentCleaning: [],
  recentReports: [],
  lastSevenDays: { reports: 0, temperatureViolations: 0, cleaningTasks: 0, criticalAlerts: 0 },
};

const norwegianDate = (date: Date) => date.toLocaleDateString('nb-NO', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

const timeLabel = (value: string | null | undefined) => {
  if (!value) return '--:--';
  if (value.includes('T')) return new Date(value).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
  return value.slice(0, 5);
};

const statusLabel = (status: string) => {
  if (status === 'safe' || status === 'completed') return 'Trygt';
  if (status === 'warning') return 'Advarsel';
  if (status === 'danger' || status === 'fail') return 'Kritisk';
  return status === 'incomplete' ? 'Gjenstår' : 'Ukjent';
};

const statusTone = (status: string) => {
  if (status === 'safe' || status === 'completed') return 'bg-emerald-50 text-emerald-700';
  if (status === 'warning') return 'bg-amber-50 text-amber-700';
  if (status === 'danger' || status === 'fail') return 'bg-red-50 text-red-700';
  return 'bg-slate-100 text-slate-600';
};

export function HACCPDashboard({ onNavigate }: DashboardProps) {
  const [data, setData] = useState<DashboardData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    void loadDashboard();
    const refresh = window.setInterval(() => void loadDashboard(), 10 * 60 * 1000);
    const clock = window.setInterval(() => setNow(new Date()), 60 * 1000);
    return () => {
      window.clearInterval(refresh);
      window.clearInterval(clock);
    };
  }, []);

  const loadDashboard = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      const startDate = sevenDaysAgo.toISOString().split('T')[0];

      const [
        reportsCount,
        employeesCount,
        todayTemps,
        recentTemps,
        equipmentResult,
        zonesResult,
        todayCleaning,
        recentCleaning,
        cleaningTasks,
        recentReports,
        weekReports,
        openIncidents,
        weekIncidents,
      ] = await Promise.all([
        supabase.from('haccp_daily_reports').select('id', { count: 'exact', head: true }),
        supabase.from('employees').select('id', { count: 'exact', head: true }).eq('active', true).eq('status', 'active'),
        supabase.from('temperature_logs').select('*').eq('log_date', today).order('log_time', { ascending: false }),
        supabase.from('temperature_logs').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('equipment').select('id, name, zone_id'),
        supabase.from('zones').select('id, name'),
        supabase.from('cleaning_logs').select('*').eq('log_date', today).order('created_at', { ascending: false }),
        supabase.from('cleaning_logs').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('cleaning_tasks').select('id, task_name, name_no').eq('active', true),
        supabase.from('haccp_daily_reports').select('id, report_date, report_type, overall_status').order('report_date', { ascending: false }).limit(5),
        supabase.from('haccp_daily_reports').select('id', { count: 'exact', head: true }).gte('report_date', startDate),
        supabase.from('critical_incidents').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('critical_incidents').select('id', { count: 'exact', head: true }).gte('incident_date', startDate),
      ]);

      const equipmentMap = new Map((equipmentResult.data || []).map((item) => [item.id, item]));
      const zoneMap = new Map((zonesResult.data || []).map((zone) => [zone.id, zone.name]));
      const taskMap = new Map((cleaningTasks.data || []).map((task) => [task.id, task.task_name || task.name_no || 'Oppgave']));

      const decorateTemperature = (row: Record<string, unknown>): TemperatureRow => {
        const equipment = equipmentMap.get(String(row.equipment_id));
        return {
          id: String(row.id),
          equipment_id: String(row.equipment_id),
          temperature: Number(row.temperature),
          status: String(row.status),
          log_time: String(row.log_time || ''),
          created_at: String(row.created_at || ''),
          equipmentName: equipment?.name || 'Ukjent utstyr',
          zoneName: equipment?.zone_id ? zoneMap.get(equipment.zone_id) || 'Ukjent sone' : 'Ukjent sone',
        };
      };

      const decorateCleaning = (row: Record<string, unknown>): CleaningRow => ({
        id: String(row.id),
        task_id: String(row.task_id),
        status: String(row.status || (row.is_completed ? 'completed' : 'incomplete')),
        log_time: row.log_time ? String(row.log_time) : null,
        created_at: String(row.created_at || ''),
        taskName: taskMap.get(String(row.task_id)) || 'Rengjøringsoppgave',
      });

      const todayTemperatureRows = (todayTemps.data || []).map((row) => decorateTemperature(row as Record<string, unknown>));
      const recentTemperatureRows = (recentTemps.data || []).map((row) => decorateTemperature(row as Record<string, unknown>));
      const todayCleaningRows = (todayCleaning.data || []).map((row) => decorateCleaning(row as Record<string, unknown>));
      const recentCleaningRows = (recentCleaning.data || []).map((row) => decorateCleaning(row as Record<string, unknown>));
      const weekTemperatureViolations = todayTemperatureRows.filter((row) => row.status !== 'safe').length;

      setData({
        reportCount: reportsCount.count || 0,
        activeEmployees: employeesCount.count || 0,
        temperatureViolations: weekTemperatureViolations,
        criticalAlerts: openIncidents.count || 0,
        todayTemperatures: todayTemperatureRows,
        todayCleaning: todayCleaningRows,
        cleaningTotal: cleaningTasks.data?.length || 0,
        recentTemperatures: recentTemperatureRows,
        recentCleaning: recentCleaningRows,
        recentReports: (recentReports.data || []) as ReportRow[],
        lastSevenDays: {
          reports: weekReports.count || 0,
          temperatureViolations: weekTemperatureViolations,
          cleaningTasks: recentCleaningRows.length,
          criticalAlerts: weekIncidents.count || 0,
        },
      });
    } catch (error) {
      console.error('Error loading HACCP dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedCleaning = useMemo(
    () => data.todayCleaning.filter((log) => log.status === 'completed').length,
    [data.todayCleaning],
  );
  const cleaningPercent = data.cleaningTotal ? Math.round((completedCleaning / data.cleaningTotal) * 100) : 0;
  const temperatureGroups = useMemo(() => {
    const groups = new Map<string, { total: number; safe: number }>();
    data.todayTemperatures.forEach((row) => {
      const current = groups.get(row.zoneName) || { total: 0, safe: 0 };
      current.total += 1;
      if (row.status === 'safe') current.safe += 1;
      groups.set(row.zoneName, current);
    });
    return Array.from(groups.entries());
  }, [data.todayTemperatures]);

  if (loading) {
    return <div className="flex min-h-[520px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }

  const statCards = [
    { label: 'Totale rapporter', value: data.reportCount, note: 'Alle rapporter', icon: FileText, tone: 'emerald' },
    { label: 'Aktive ansatte', value: data.activeEmployees, note: 'Med tilgang', icon: Users, tone: 'blue' },
    { label: 'Temperaturavvik', value: data.temperatureViolations, note: 'I dag', icon: Thermometer, tone: 'amber' },
    { label: 'Kritiske varsler', value: data.criticalAlerts, note: 'Krever oppfølging', icon: AlertTriangle, tone: 'red' },
  ];
  const toneClasses: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-700', blue: 'bg-blue-100 text-blue-700', amber: 'bg-amber-100 text-amber-700', red: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">Sanntidsoversikt</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">HACCP Dashboard</h1>
          <p className="mt-2 text-slate-500">Sann­tidsoversikt over matsikkerhet og daglige oppgaver</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <CalendarDays className="h-4 w-4 text-blue-600" />
          <span className="capitalize">{norwegianDate(now)}</span>
          <span className="hidden text-slate-300 sm:inline">·</span>
          <span className="hidden sm:inline">Kl. {now.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-start justify-between"><div className={`rounded-xl p-3 ${toneClasses[card.tone]}`}><Icon className="h-6 w-6" /></div><span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" /></div>
            <p className="mt-5 text-sm font-semibold text-slate-500">{card.label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">{card.value}</p>
            <p className="mt-1 text-xs text-slate-400">{card.note}</p>
          </div>;
        })}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="mb-4"><h2 className="text-lg font-bold text-slate-950">Hurtighandlinger</h2><p className="text-sm text-slate-500">Vanlige oppgaver – klikk for å komme i gang</p></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <button onClick={() => onNavigate('temperature')} className="flex items-center gap-3 rounded-xl bg-emerald-600 px-4 py-3 text-left text-white transition hover:bg-emerald-700"><Thermometer className="h-7 w-7" /><span><strong className="block">Ny temperaturmåling</strong><small className="text-emerald-100">Registrer temperatur</small></span></button>
          <button onClick={() => onNavigate('cleaning')} className="flex items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-left text-white transition hover:bg-blue-700"><Sparkles className="h-7 w-7" /><span><strong className="block">Ny rengjøringsoppgave</strong><small className="text-blue-100">Logg rengjøring</small></span></button>
          <button onClick={() => onNavigate('reports')} className="flex items-center gap-3 rounded-xl bg-orange-500 px-4 py-3 text-left text-white transition hover:bg-orange-600"><FileText className="h-7 w-7" /><span><strong className="block">Opprett rapport</strong><small className="text-orange-100">Åpne rapporter</small></span></button>
          <button onClick={() => void loadDashboard()} className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-left text-blue-700 transition hover:bg-blue-100"><BarChart3 className="h-7 w-7" /><span><strong className="block">Se dagens status</strong><small className="text-blue-500">Oppdater oversikten</small></span></button>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><SectionHeading icon={Thermometer} title="Temperaturstatus i dag" onClick={() => onNavigate('temperature')} />
          <div className="mt-4 space-y-3">{temperatureGroups.length === 0 ? <EmptyState text="Ingen målinger registrert i dag" /> : temperatureGroups.slice(0, 5).map(([zone, values]) => <div key={zone} className="flex items-center justify-between text-sm"><span className="text-slate-600">{zone}</span><span className="flex items-center gap-2 font-semibold text-slate-700">{values.safe} / {values.total}<span className={`rounded-full p-1 ${values.safe === values.total ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>{values.safe === values.total ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}</span></span></div>)}</div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><SectionHeading icon={Sparkles} title="Rengjøringsoppgaver i dag" onClick={() => onNavigate('cleaning')} />
          <div className="mt-4 flex items-center gap-5"><div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#10b981 ${cleaningPercent}%, #e2e8f0 0)` }}><div className="grid h-20 w-20 place-items-center rounded-full bg-white"><span className="text-xl font-bold text-slate-900">{cleaningPercent}%</span></div></div><div className="space-y-3 text-sm"><p className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />{completedCleaning} Fullført</p><p className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-slate-400" />{Math.max(data.cleaningTotal - completedCleaning, 0)} Gjenstår</p></div></div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><SectionHeading icon={BarChart3} title="Siste 7 dager" onClick={() => onNavigate('reports')} /><div className="mt-3 divide-y divide-slate-100">{[['Rapporter', data.lastSevenDays.reports, FileText], ['Temperaturavvik', data.lastSevenDays.temperatureViolations, Thermometer], ['Rengjøringsoppgaver', data.lastSevenDays.cleaningTasks, Sparkles], ['Kritiske varsler', data.lastSevenDays.criticalAlerts, AlertTriangle]].map(([label, value, Icon]) => <div key={String(label)} className="flex items-center justify-between py-2.5 text-sm"><span className="flex items-center gap-2 text-slate-600"><Icon className="h-4 w-4 text-slate-400" />{label}</span><strong className="text-slate-900">{value}</strong></div>)}</div></section>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <RecentTemperatures rows={data.recentTemperatures} />
        <RecentCleaning rows={data.recentCleaning} />
        <RecentReports rows={data.recentReports} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

function SectionHeading({ icon: Icon, title, onClick }: { icon: typeof Thermometer; title: string; onClick: () => void }) {
  return <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-base font-bold text-slate-950"><Icon className="h-5 w-5 text-blue-600" />{title}</h2><button onClick={onClick} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600"><ArrowRight className="h-5 w-5" /></button></div>;
}

function EmptyState({ text }: { text: string }) { return <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">{text}</p>; }

function RecentTemperatures({ rows }: { rows: TemperatureRow[] }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><SectionHeading icon={Thermometer} title="Siste temperaturmålinger" onClick={() => {}} /><div className="mt-4 space-y-2">{rows.length === 0 ? <EmptyState text="Ingen temperaturmålinger funnet" /> : rows.map((row) => <div key={row.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm"><span className="min-w-0 truncate font-medium text-slate-700">{row.equipmentName}</span><span className="whitespace-nowrap font-semibold text-slate-800">{row.temperature}°C</span><span className="whitespace-nowrap text-xs text-slate-400">{timeLabel(row.log_time)}</span><span className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${statusTone(row.status)}`}>{statusLabel(row.status)}</span></div>)}</div></section>;
}

function RecentCleaning({ rows }: { rows: CleaningRow[] }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><SectionHeading icon={Sparkles} title="Siste rengjøringsoppgaver" onClick={() => {}} /><div className="mt-4 space-y-2">{rows.length === 0 ? <EmptyState text="Ingen rengjøringsoppgaver funnet" /> : rows.map((row) => <div key={row.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm"><span className="min-w-0 truncate font-medium text-slate-700">{row.taskName}</span><span className="text-xs text-slate-400">{timeLabel(row.log_time || row.created_at)}</span><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusTone(row.status)}`}>{statusLabel(row.status)}</span></div>)}</div></section>;
}

function RecentReports({ rows, onNavigate }: { rows: ReportRow[]; onNavigate: (view: string) => void }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><SectionHeading icon={FileText} title="Siste rapporter" onClick={() => onNavigate('reports')} /><div className="mt-4 space-y-2">{rows.length === 0 ? <EmptyState text="Ingen rapporter funnet" /> : rows.map((row) => <div key={row.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm"><div className="min-w-0"><p className="truncate font-medium text-slate-700">{row.report_type === 'automatic' ? 'Automatisk HACCP-rapport' : 'HACCP-rapport'}</p><p className="text-xs text-slate-400">{new Date(row.report_date).toLocaleDateString('nb-NO')}</p></div><button onClick={() => onNavigate('reports')} className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100">Vis</button></div>)}</div></section>;
}
