import { useState, useEffect } from 'react';
import { HACCPDashboard } from '../Dashboard/HACCPDashboard';
import { CompactDailyRoutine } from '../RoutineTasks/CompactDailyRoutine';
import RoutineReportsList from '../RoutineTasks/RoutineReportsList';
import { TemperatureControl } from '../Temperature/TemperatureControl';
import { CleaningTasks } from '../Cleaning/CleaningTasks';
import { SettingsModule } from '../Settings/SettingsModule';
import { CriticalIncidents } from '../Incidents/CriticalIncidents';
import { Home, ClipboardCheck, Thermometer, Sparkles, Settings, Menu, X, AlertTriangle, FileBarChart } from 'lucide-react';

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
        'rengjoring': 'cleaning',
        'rapporter': 'reports',
        'rutinerapporter': 'routine-reports',
        'innstillinger': 'settings',
      };

      if (hash && viewMap[hash]) {
        setCurrentView(viewMap[hash]);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'routine', name: 'Daglige rutiner', icon: ClipboardCheck },
    { id: 'temperature', name: 'Temperaturkontroll', icon: Thermometer },
    { id: 'cleaning', name: 'Rengjøring', icon: Sparkles },
    { id: 'incidents', name: 'Kritiske hendelser', icon: AlertTriangle },
    { id: 'settings', name: 'Innstillinger', icon: Settings },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <HACCPDashboard />;
      case 'routine':
        return <CompactDailyRoutine language="no" />;
      case 'temperature':
        return <TemperatureControl />;
      case 'cleaning':
        return <CleaningTasks />;
      case 'incidents':
        return <CriticalIncidents />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <HACCPDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/visas.jpg" alt="LA kokido" className="w-12 h-12 object-contain" />
              <div>
                <h1 className="text-lg font-bold text-slate-900">HACCP System</h1>
                <p className="text-xs text-slate-600 hidden sm:block">LA kokido</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    currentView === item.id
                      ? 'bg-emerald-100 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    currentView === item.id
                      ? 'bg-emerald-100 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-slate-600">
            <p>HACCP Digital Control System - LA kokido</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
