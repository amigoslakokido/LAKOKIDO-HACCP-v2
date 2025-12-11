import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  CheckCircle2, XCircle, ChevronLeft, ChevronRight,
  User, MessageSquare
} from 'lucide-react';

interface RoutineTask {
  id: string;
  name_ar: string;
  name_no: string;
  icon: string;
  sort_order: number;
}

interface Employee {
  id: string;
  name: string;
}

interface CompactDailyRoutineProps {
  language?: 'ar' | 'no';
}

export function CompactDailyRoutine({ language: propLanguage }: CompactDailyRoutineProps) {
  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [language, setLanguage] = useState<'ar' | 'no'>(propLanguage || 'no');
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [tasksRes, employeesRes, logsRes] = await Promise.all([
        supabase.from('routine_tasks').select('*').eq('active', true).order('sort_order'),
        supabase.from('employees').select('id, name').eq('active', true).order('name'),
        supabase.from('routine_task_logs').select('task_id').eq('log_date', today)
      ]);

      if (tasksRes.data) setTasks(tasksRes.data);
      if (employeesRes.data) setEmployees(employeesRes.data);
      if (logsRes.data) {
        setCompletedToday(new Set(logsRes.data.map(log => log.task_id)));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskComplete = async (status: 'completed' | 'not_completed') => {
    if (!selectedEmployee) {
      alert(language === 'ar' ? 'Choose employee' : 'Velg ansatt');
      return;
    }

    try {
      const task = tasks[currentTaskIndex];
      const today = new Date().toISOString().split('T')[0];

      await supabase.from('routine_task_logs').insert({
        task_id: task.id,
        log_date: today,
        completed_by: selectedEmployee,
        status,
        notes
      });

      const newCompleted = new Set(completedToday);
      if (status === 'completed') {
        newCompleted.add(task.id);
      }
      setCompletedToday(newCompleted);
      setNotes('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      if (currentTaskIndex < tasks.length - 1) {
        setCurrentTaskIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Feil / Error');
    }
  };

  if (loading) return <div className="text-center py-8">Laster...</div>;
  if (tasks.length === 0) return <div className="text-center py-8">Ingen oppgaver</div>;

  const currentTask = tasks[currentTaskIndex];
  const progress = ((completedToday.size / tasks.length) * 100).toFixed(0);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Success */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold">Fullført!</span>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="bg-white rounded-lg p-3 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            {language === 'ar' ? 'Progress' : 'Fremdrift'}
          </span>
          <span className="text-sm font-bold text-blue-600">
            {completedToday.size}/{tasks.length} ({progress}%)
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Task Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Navigation */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-emerald-50 border-b">
          <button
            onClick={() => setCurrentTaskIndex(prev => Math.max(0, prev - 1))}
            disabled={currentTaskIndex === 0}
            className="p-2 bg-white rounded-lg hover:shadow-md disabled:opacity-30 transition-all"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>

          <div className="text-center">
            <p className="text-sm font-bold text-gray-700">
              {language === 'ar'
                ? `Task ${currentTaskIndex + 1} of ${tasks.length}`
                : `Oppgave ${currentTaskIndex + 1} av ${tasks.length}`}
            </p>
          </div>

          <button
            onClick={() => setCurrentTaskIndex(prev => Math.min(tasks.length - 1, prev + 1))}
            disabled={currentTaskIndex === tasks.length - 1}
            className="p-2 bg-white rounded-lg hover:shadow-md disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Task Display */}
        <div className="p-6 text-center">
          <div className="relative inline-block mb-3">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative text-5xl md:text-6xl transform hover:scale-110 transition-all duration-300 drop-shadow-2xl">
              <span className="inline-block animate-wiggle">{currentTask.icon}</span>
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-3">
            {language === 'ar' ? currentTask.name_ar : currentTask.name_no}
          </h2>

          {completedToday.has(currentTask.id) && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border-2 border-emerald-300 animate-pulse">
              <CheckCircle2 className="w-4 h-4 animate-spin-slow" />
              {language === 'ar' ? 'Completed' : 'Fullført'}
            </div>
          )}
        </div>

        {/* Form */}
        {!completedToday.has(currentTask.id) && (
          <div className="p-4 space-y-3 bg-gray-50">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 text-blue-600 animate-pulse" />
                {language === 'ar' ? 'Who performs?' : 'Hvem utfører?'}
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 text-sm font-medium border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              >
                <option value="">{language === 'ar' ? 'Choose...' : 'Velg...'}</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 text-amber-600 animate-pulse" />
                {language === 'ar' ? 'Notes (optional)' : 'Notater (valgfritt)'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 transition-all"
                placeholder={language === 'ar' ? 'Add note...' : 'Legg til notat...'}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleTaskComplete('completed')}
                disabled={!selectedEmployee}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-base font-bold rounded-lg hover:shadow-lg disabled:opacity-50 transition-all transform hover:scale-105 flex items-center justify-center gap-2 group"
              >
                <CheckCircle2 className="w-5 h-5 group-hover:animate-spin-slow" />
                <span>{language === 'ar' ? 'Done ✅' : 'Fullført ✅'}</span>
              </button>

              <button
                onClick={() => handleTaskComplete('not_completed')}
                disabled={!selectedEmployee}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white text-base font-bold rounded-lg hover:shadow-lg disabled:opacity-50 transition-all transform hover:scale-105 flex items-center justify-center gap-2 group"
              >
                <XCircle className="w-5 h-5 group-hover:animate-pulse" />
                <span>{language === 'ar' ? 'Not done ❌' : 'Ikke fullført ❌'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
