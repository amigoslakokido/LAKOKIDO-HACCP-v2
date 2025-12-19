import { useState } from 'react';
import { FileText, Calendar, AlertTriangle } from 'lucide-react';
import { HACCPDailyReports } from './HACCPDailyReports';
import RoutineReportsList from '../RoutineTasks/RoutineReportsList';
import { CriticalIncidentReports } from './CriticalIncidentReports';

export function HACCPReportsMain() {
  const [activeSection, setActiveSection] = useState<'haccp' | 'routine' | 'critical'>('haccp');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800">Rapporter</h1>
              <p className="text-slate-600">Administrer og generer rapporter</p>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveSection('haccp')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeSection === 'haccp'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-5 h-5" />
              HACCP Rapporter
            </button>
            <button
              onClick={() => setActiveSection('routine')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeSection === 'routine'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Calendar className="w-5 h-5" />
              Daglig rutiner rapport
            </button>
            <button
              onClick={() => setActiveSection('critical')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeSection === 'critical'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
              Kritiske hendelser rapport
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {activeSection === 'haccp' && <HACCPDailyReports />}
          {activeSection === 'routine' && <RoutineReportsList />}
          {activeSection === 'critical' && <CriticalIncidentReports />}
        </div>
      </div>
    </div>
  );
}
