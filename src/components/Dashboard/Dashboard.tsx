import { useState, useEffect } from 'react';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { DailyRoutine } from '../RoutineTasks/DailyRoutine';
import { ListTodo, BarChart3 } from 'lucide-react';

export function Dashboard() {
 const [activeTab, setActiveTab] = useState<'analytics' | 'tasks'>('analytics');
 const [language, setLanguage] = useState<'no' | 'ar'>('no');

 useEffect(() => {
 const savedLang = localStorage.getItem('dashboard_language');
 if (savedLang === 'ar') setLanguage('ar');
 }, []);

 const toggleLanguage = () => {
 const newLang = language === 'no' ? 'ar' : 'no';
 setLanguage(newLang);
 localStorage.setItem('dashboard_language', newLang);
 };

 return (
 <div className="space-y-6">
 <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
 <div className="flex items-center justify-between p-2 border-b">
 <div className="flex gap-1">
 <button
 onClick={() => setActiveTab('analytics')}
 className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
 activeTab === 'analytics'
 ? 'bg-blue-600 text-white'
 : 'text-gray-600 hover:bg-gray-100'
 }`}
 >
 <BarChart3 className="w-4 h-4" />
 {language === 'no' ? 'Analyse' : 'Analytics'}
 </button>
 <button
 onClick={() => setActiveTab('tasks')}
 className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
 activeTab === 'tasks'
 ? 'bg-blue-600 text-white'
 : 'text-gray-600 hover:bg-gray-100'
 }`}
 >
 <ListTodo className="w-4 h-4" />
 {language === 'no' ? 'Daglige oppgaver' : 'Daily tasks'}
 </button>
 </div>
 <button
 onClick={toggleLanguage}
 className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
 >
 {language === 'no' ? 'Arabic' : 'Norsk'}
 </button>
 </div>
 </div>

 {activeTab === 'analytics' ? (
 <AnalyticsDashboard />
 ) : (
 <div className="bg-white rounded-xl shadow-lg p-6">
 <DailyRoutine language={language} />
 </div>
 )}
 </div>
 );
}
