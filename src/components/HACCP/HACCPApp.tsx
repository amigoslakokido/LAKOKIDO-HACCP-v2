import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  ClipboardList,
  FileBarChart,
  Home,
  Menu,
  Settings,
  Sparkles,
  Thermometer,
  Users,
  X,
} from 'lucide-react';
import { HACCPDashboard } from '../Dashboard/HACCPDashboard';
import { CompactDailyRoutine } from '../RoutineTasks/CompactDailyRoutine';
import RoutineReportsList from '../RoutineTasks/RoutineReportsList';
import { TemperatureControl } from '../Temperature/TemperatureControl';
import { CleaningTasks } from '../Cleaning/CleaningTasks';
import { SettingsModule } from '../Settings/SettingsModule';
import { CriticalIncidents } from '../Incidents/CriticalIncidents';
import { HACCPReportsMain } from '../Reports/HACCPReportsMain';

export function HACCPApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const viewMap: Record<string, string> = {
        'kritiske-hendelser': 'incidents',
        'daglige-rutiner': 'routine',
        'temperaturkontroll': 'temperature',
        rengjoring: 'cleaning',
        rapporter: 'reports',
        rutinerapporter: 'routine-reports',
        innstillinger: 'settings',
      };
      if (hash && viewMap[hash]) setCurrentView(viewMap[hash]);
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (view: string) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'temperature', name: 'Temperaturkontroll', icon: Thermometer },
    { id: 'cleaning', name: 'Rengjøringsoppgaver', icon: Sparkles },
    { id: 'reports', name: 'Rapporter', icon: FileBarChart },
    { id: 'statistics', name: 'Statistikk', icon: BarChart3, target: 'dashboard' },
    { id: 'employees', name: 'Ansatte', icon: Users, target: 'settings' },
    { id: 'settings', name: 'Innstillinger', icon: Settings },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'routine': return <CompactDailyRoutine language="no" />;
      case 'routine-reports': return <RoutineReportsList />;
      case 'temperature': return <TemperatureControl />;
      case 'cleaning': return <CleaningTasks />;
      case 'incidents': return <CriticalIncidents />;
      case 'reports': return <HACCPReportsMain />;
      case 'settings': return <SettingsModule />;
      default: return <HACCPDashboard onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-78px)] bg-[#f5f7fb] text-slate-900">
      <div className="flex">
        <aside className={`fixed inset-y-0 left-0 z-40 mt-[78px] w-64 border-r border-slate-200 bg-white px-4 py-6 transition-transform duration-300 lg:sticky lg:top-[78px] lg:mt-0 lg:h-[calc(100vh-78px)] lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="mb-8 px-3"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Management Systems</p><p className="mt-2 text-sm text-slate-500">Mattrygghet og drift</p></div>
          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const target = item.target || item.id;
              const active = currentView === target || (item.id === 'statistics' && currentView === 'dashboard');
              return <button key={item.id} onClick={() => navigate(target)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}><Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'}`} /><span>{item.name}</span></button>;
            })}
          </nav>
          <div className="mt-auto hidden border-t border-slate-100 pt-6 lg:block"><button onClick={() => navigate('incidents')} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-700"><AlertTriangle className="h-5 w-5" />Kritiske hendelser</button></div>
        </aside>

        {mobileMenuOpen && <button aria-label="Lukk meny" onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-30 mt-[78px] bg-slate-950/30 lg:hidden" />}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{currentView === 'dashboard' || currentView === 'statistics' ? <HACCPDashboard onNavigate={navigate} /> : renderView()}</main>
      </div>
      <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="fixed bottom-5 right-5 z-50 grid h-12 w-12 place-items-center rounded-full bg-blue-600 text-white shadow-xl lg:hidden" aria-label="Åpne meny">{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
    </div>
  );
}
