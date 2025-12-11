import { useState } from 'react';
import { FileText, ListChecks, AlertTriangle, Shield, Brain, TrendingUp } from 'lucide-react';
import { ReportsList } from './ReportsList';
import { CompactRoutineReportsList } from '../RoutineTasks/CompactRoutineReportsList';
import { CriticalIncidentReports } from './CriticalIncidentReports';
import { UnifiedReports as HMSReports } from '../HMS/UnifiedReports';

type ReportCategory = 'haccp' | 'routine' | 'critical' | 'hms';

export function AllReportsHub() {
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('haccp');

  const categories = [
    {
      id: 'haccp' as ReportCategory,
      name: 'HACCP Rapporter',
      nameAr: 'تقارير HACCP',
      icon: FileText,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'hms' as ReportCategory,
      name: 'HMS Rapporter',
      nameAr: 'تقارير HMS',
      icon: Shield,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      id: 'routine' as ReportCategory,
      name: 'Daglig rutiner',
      nameAr: 'المهام اليومية',
      icon: ListChecks,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'critical' as ReportCategory,
      name: 'Kritiske hendelser',
      nameAr: 'الحوادث الخطرة',
      icon: AlertTriangle,
      color: 'red',
      gradient: 'from-red-500 to-pink-600'
    }
  ];

  const renderContent = () => {
    switch (activeCategory) {
      case 'haccp':
        return <ReportsList />;
      case 'hms':
        return <HMSReports />;
      case 'routine':
        return <CompactRoutineReportsList />;
      case 'critical':
        return <CriticalIncidentReports />;
      default:
        return <ReportsList />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-10 h-10" />
              <h1 className="text-4xl font-bold">Alle Rapporter</h1>
            </div>
            <p className="text-lg opacity-90">Komplett oversikt over alle systemrapporter</p>
            <p className="text-sm opacity-75 mt-1" style={{ direction: 'rtl' }}>
              جميع التقارير في مكان واحد
            </p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl px-6 py-4 border border-white border-opacity-20">
            <div className="text-3xl font-bold">{categories.length}</div>
            <div className="text-sm opacity-90">Kategorier</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`p-4 rounded-2xl transition-all border-2 ${
                  isActive
                    ? 'bg-white text-slate-900 border-white shadow-xl scale-105'
                    : 'bg-white bg-opacity-10 border-white border-opacity-20 text-white hover:bg-opacity-20'
                }`}
              >
                <Icon className={`w-8 h-8 mx-auto mb-2 ${isActive ? 'animate-pulse' : ''}`} />
                <div className="font-bold text-sm">{category.name}</div>
                <div className="text-xs opacity-75 mt-1" style={{ direction: 'rtl' }}>
                  {category.nameAr}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-200">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-100">
          {(() => {
            const category = categories.find(c => c.id === activeCategory);
            const Icon = category?.icon || FileText;
            return (
              <>
                <div className={`p-3 bg-gradient-to-br ${category?.gradient} rounded-xl`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{category?.name}</h2>
                  <p className="text-sm text-slate-600" style={{ direction: 'rtl' }}>
                    {category?.nameAr}
                  </p>
                </div>
              </>
            );
          })()}
        </div>

        <div className="animate-fadeIn">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
