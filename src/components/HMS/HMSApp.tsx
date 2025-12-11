import { useState } from 'react';
import { HMSDashboard } from './HMSDashboard';
import { IncidentsMain } from './IncidentsMain';
import { Reports } from './Reports';
import { Training } from './Training';
import { Maintenance } from './Maintenance';
import { CompanySettings } from './CompanySettings';
import { Goals } from './Goals';
import { Policies } from './Policies';
import { OrganizationChart } from './OrganizationChart';
import { SafetyRepresentative } from './SafetyRepresentative';
import { PersonalList } from './PersonalList';
import { Insurance } from './Insurance';
import { FirstAid } from './FirstAid';
import { RiskAssessment } from './RiskAssessment';
import { WorkEnvironment } from './WorkEnvironment';
import { FireSafety } from './FireSafety';
import { Evacuation } from './Evacuation';
import { HMSTraining } from './HMSTraining';
import { EnvironmentMain } from './EnvironmentMain';
import { DocumentsManager } from './DocumentsManager';
import { AIAnalytics } from './AIAnalytics';
import { AutoReportsGenerator } from '../Settings/AutoReportsGenerator';
import {
  LayoutDashboard,
  AlertTriangle,
  FileText,
  GraduationCap,
  Wrench,
  Menu,
  X,
  Shield,
  Building2,
  Target,
  Users,
  HeartPulse,
  Flame,
  ClipboardCheck,
  Search,
  Zap,
  Scale,
  Leaf,
  Mail,
  MapPin,
  FileStack,
  ChevronDown,
  ChevronRight,
  FileCheck,
  Heart,
  Package,
  Clock,
  AlertCircle,
  BookOpen,
  Calendar,
  CheckSquare,
  Briefcase,
  Globe,
  TrendingUp,
  BadgeCheck,
  ShieldCheck,
  Network,
  UserCheck,
  Brain
} from 'lucide-react';

export function HMSApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['dashboard']);

  const navigationItems = [
    {
      id: 'dashboard',
      name: '📊 Dashboard',
      icon: LayoutDashboard,
      items: [
        { id: 'dashboard-overview', name: 'Oversikt', icon: TrendingUp },
        { id: 'dashboard-ai', name: 'AI Analytics', icon: Brain },
      ]
    },
    {
      id: 'goals',
      name: '🎯 Målsetting',
      icon: Target,
      items: [
        { id: 'goals-hms', name: 'HMS-mål', icon: Target },
        { id: 'goals-policies', name: 'Policyer', icon: FileCheck },
        { id: 'goals-orgchart', name: 'Organisasjonskart', icon: Network },
      ]
    },
    {
      id: 'company',
      name: '🏢 Bedrift',
      icon: Building2,
      items: [
        { id: 'company-info', name: 'Firmaopplysninger', icon: Building2 },
        { id: 'company-insurance', name: 'Forsikringer', icon: Shield },
      ]
    },
    {
      id: 'employees',
      name: '👥 Ansatte',
      icon: Users,
      items: [
        { id: 'employees-list', name: 'Personalliste', icon: Users },
        { id: 'employees-verneombud', name: 'Verneombud', icon: ShieldCheck },
      ]
    },
    {
      id: 'health-safety',
      name: '🏥 Helse & Sikkerhet',
      icon: HeartPulse,
      items: [
        { id: 'health-bht', name: 'BHT-avtale', icon: HeartPulse },
        { id: 'health-firstaid', name: 'Førstehjelp', icon: Heart },
        { id: 'health-risk', name: 'Risikoanalyse', icon: AlertCircle },
        { id: 'health-work-env', name: 'Arbeidsmiljø', icon: Shield },
      ]
    },
    {
      id: 'emergency',
      name: '🔥 Beredskap',
      icon: Flame,
      items: [
        { id: 'emergency-fire', name: 'Brannsikkerhet', icon: Flame },
        { id: 'emergency-evacuation', name: 'Evakuering', icon: AlertCircle },
      ]
    },
    {
      id: 'training',
      name: '🎓 Opplæring',
      icon: GraduationCap,
      items: [
        { id: 'hms-training', name: 'HMS opplæring', icon: GraduationCap },
      ]
    },
    {
      id: 'incidents',
      name: '⚠️ Hendelser',
      icon: AlertTriangle,
      items: [
        { id: 'incidents-main', name: 'Hendelser', icon: AlertTriangle },
      ]
    },
    {
      id: 'internal-control',
      name: '✅ Internkontroll',
      icon: Search,
      items: [
        { id: 'control-audit', name: 'Internrevisjon', icon: Search },
        { id: 'control-electrical', name: 'Elektrisk anlegg', icon: Zap },
        { id: 'control-maintenance', name: 'Vedlikehold', icon: Wrench },
        { id: 'control-checklist', name: 'Sjekklister', icon: CheckSquare },
      ]
    },
    {
      id: 'environment',
      name: '🌍 Miljø',
      icon: Leaf,
      items: [
        { id: 'environment-main', name: 'Miljøstyring', icon: Leaf },
      ]
    },
    {
      id: 'documents',
      name: '📁 Dokumenter',
      icon: FileStack,
      items: [
        { id: 'documents-manager', name: 'Dokumenter', icon: FileStack },
      ]
    },
    {
      id: 'compliance',
      name: '⚖️ Compliance',
      icon: Scale,
      items: [
        { id: 'compliance-laws', name: 'Lovverk', icon: Scale },
        { id: 'compliance-gdpr', name: 'GDPR', icon: Shield },
        { id: 'compliance-checklists', name: 'Sjekklister', icon: CheckSquare },
        { id: 'compliance-certificates', name: 'Godkjenninger', icon: BadgeCheck },
      ]
    },
    {
      id: 'reports',
      name: '📊 Rapporter',
      icon: FileText,
      items: [
        { id: 'reports-generate', name: 'Generer rapport', icon: FileText },
        { id: 'reports-archive', name: 'Rapportarkiv', icon: FileStack },
        { id: 'reports-statistics', name: 'Statistikk', icon: TrendingUp },
        { id: 'reports-export', name: 'Eksporter', icon: FileCheck },
      ]
    },
    {
      id: 'settings',
      name: '⚙️ Innstillinger',
      icon: Wrench,
      items: [
        { id: 'settings-reports', name: 'Automatiske rapporter', icon: FileText },
      ]
    },
  ];

  const toggleItem = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const PlaceholderView = ({ icon: Icon, name }: any) => (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Icon className="w-10 h-10 text-purple-600" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-2">{name}</h2>
      <div className="mt-8">
        <p className="text-sm text-slate-400">Kommer snart</p>
      </div>
    </div>
  );

  const renderView = () => {
    switch (currentView) {
      case 'dashboard-overview':
      case 'dashboard':
        return <HMSDashboard />;
      case 'dashboard-ai':
        return <AIAnalytics />;
      case 'goals-hms':
        return <Goals />;
      case 'goals-policies':
        return <Policies />;
      case 'goals-orgchart':
        return <OrganizationChart />;
      case 'employees-list':
        return <PersonalList />;
      case 'employees-verneombud':
        return <SafetyRepresentative />;
      case 'company-info':
        return <CompanySettings />;
      case 'company-insurance':
        return <Insurance />;
      case 'hms-training':
        return <HMSTraining />;
      case 'incidents-main':
        return <IncidentsMain />;
      case 'environment-main':
        return <EnvironmentMain />;
      case 'health-firstaid':
        return <FirstAid />;
      case 'health-risk':
        return <RiskAssessment />;
      case 'health-work-env':
        return <WorkEnvironment />;
      case 'emergency-fire':
        return <FireSafety />;
      case 'emergency-evacuation':
        return <Evacuation />;
      case 'reports-generate':
      case 'reports-archive':
        return <Reports />;
      case 'control-maintenance':
        return <Maintenance />;
      case 'documents-manager':
        return <DocumentsManager />;
      case 'settings-reports':
        return <AutoReportsGenerator />;

      default:
        const currentItem = navigationItems
          .flatMap(group => group.items)
          .find(item => item.id === currentView);

        return currentItem ? (
          <PlaceholderView
            icon={currentItem.icon}
            name={currentItem.name}
          />
        ) : <HMSDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 overflow-y-auto`}>
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">HMS System</h1>
              <p className="text-xs text-slate-600">Internkontroll</p>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navigationItems.map((group) => {
            const isExpanded = expandedItems.includes(group.id);
            return (
              <div key={group.id}>
                <button
                  onClick={() => toggleItem(group.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{group.name.split(' ')[0]}</span>
                    <span className="font-bold text-sm">{group.name.substring(3)}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="ml-8 mt-1 space-y-0.5">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentView(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left text-sm ${
                          currentView === item.id
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 mt-auto">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <span className="font-bold text-purple-900 text-sm">HMS Compliance</span>
            </div>
            <p className="text-xs text-purple-700">
              Arbeidstilsynet & Mattilsynet
            </p>
          </div>
        </div>
      </aside>

      <div className="flex-1 lg:ml-72">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex-1 lg:flex-none">
              <h2 className="text-lg font-bold text-slate-900 lg:hidden">HMS System</h2>
            </div>

            <div className="text-sm text-slate-500">
              {new Date().toLocaleDateString('nb-NO', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {renderView()}
        </main>

        <footer className="bg-white border-t border-slate-200 mt-12">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-slate-600">
              <p className="font-bold">HMS System - Helse, Miljø og Sikkerhet</p>
              <p className="text-xs mt-1">
                I henhold til Arbeidstilsynet og Mattilsynet forskrifter
              </p>
            </div>
          </div>
        </footer>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
