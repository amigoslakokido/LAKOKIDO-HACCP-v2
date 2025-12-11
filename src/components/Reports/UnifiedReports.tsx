import { useState } from 'react';
import { FileText, ListChecks, AlertTriangle } from 'lucide-react';
import { ReportsList } from './ReportsList';
import { CompactRoutineReportsList } from '../RoutineTasks/CompactRoutineReportsList';
import { CriticalIncidentReports } from './CriticalIncidentReports';

type ReportCategory = 'haccp' | 'routine' | 'critical';

export function UnifiedReports() {
 const [activeCategory, setActiveCategory] = useState<ReportCategory>('haccp');

 const categories = [
 {
 id: 'haccp' as ReportCategory,
 name: 'HACCP Rapporter',
 nameAr: 'HACCP Reports',
 icon: FileText,
 color: 'blue',
 gradient: 'from-blue-500 to-blue-600'
 },
 {
 id: 'routine' as ReportCategory,
 name: 'Daglig rutiner rapport',
 nameAr: ' Daily tasks',
 icon: ListChecks,
 color: 'emerald',
 gradient: 'from-emerald-500 to-teal-600'
 },
 {
 id: 'critical' as ReportCategory,
 name: 'Kritiske hendelser rapport',
 nameAr: ' Dangerous Incidents',
 icon: AlertTriangle,
 color: 'red',
 gradient: 'from-red-500 to-pink-600'
 }
 ];

 const renderContent = () => {
 switch (activeCategory) {
 case 'haccp':
 return <ReportsList />;
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
 {/* Category Tabs */}
 <div className="bg-white rounded-xl shadow-lg overflow-hidden">
 <div className="flex flex-col md:flex-row border-b">
 {categories.map((category) => {
 const Icon = category.icon;
 const isActive = activeCategory === category.id;

 return (
 <button
 key={category.id}
 onClick={() => setActiveCategory(category.id)}
 className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 font-bold text-base md:text-lg transition-all relative ${
 isActive
 ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg`
 : 'text-gray-600 hover:bg-gray-50'
 }`}
 >
 <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
 <span className="hidden md:inline">{category.name}</span>
 <span className="md:hidden">{category.name.split(' ')[0]}</span>

 {isActive && (
 <div className="absolute bottom-0 left-0 right-0 h-1 bg-white"></div>
 )}
 </button>
 );
 })}
 </div>

 {/* Arabic Translation Bar */}
 <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-2 text-center border-b">
 <p className="text-sm text-gray-600" style={{ direction: 'rtl' }}>
 {categories.find(c => c.id === activeCategory)?.nameAr}
 </p>
 </div>
 </div>

 {/* Content Area */}
 <div className="animate-fadeIn">
 {renderContent()}
 </div>
 </div>
 );
}
