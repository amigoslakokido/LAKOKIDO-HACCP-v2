import { useEffect, useState } from 'react';
import { CalendarDays, ChevronDown, ClipboardCheck, Hotel, ShieldCheck } from 'lucide-react';
import { COMPANY_DISPLAY_NAME, REPORT_COMPANY_NAME } from '../lib/companyBranding';

interface SystemSwitcherProps {
  activeSystem: 'HACCP' | 'HMS';
  onSystemChange: (system: 'HACCP' | 'HMS') => void;
}

export function SystemSwitcher({ activeSystem, onSystemChange }: SystemSwitcherProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
      <div className="flex h-[78px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <img src="/logo.png" alt={COMPANY_DISPLAY_NAME} className="h-12 w-12 rounded-full object-contain" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
          <div className="hidden min-w-0 sm:block"><p className="truncate text-base font-bold text-slate-900">{COMPANY_DISPLAY_NAME}</p><p className="text-xs text-slate-500">Management Systems</p></div>
        </div>
        <div className="ml-4 flex items-center gap-2 rounded-xl bg-slate-100 p-1">
          <button onClick={() => onSystemChange('HACCP')} className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${activeSystem === 'HACCP' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-white'}`}><ClipboardCheck className="h-4 w-4" />HACCP</button>
          <button onClick={() => onSystemChange('HMS')} className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${activeSystem === 'HMS' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-white'}`}><Hotel className="h-4 w-4" />HMS</button>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-2 border-r border-slate-200 pr-5 text-right"><CalendarDays className="h-4 w-4 text-slate-500" /><div><p className="text-xs font-semibold capitalize text-slate-700">{now.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p><p className="text-xs text-slate-400">Kl. {now.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}</p></div></div>
          <div className="flex items-center gap-2"><div className="grid h-9 w-9 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white">AH</div><div><p className="text-sm font-bold text-slate-800">Admin</p><p className="text-[11px] text-slate-400">{REPORT_COMPANY_NAME}</p></div><ChevronDown className="h-4 w-4 text-slate-500" /></div>
        </div>
        <div className="md:hidden"><ShieldCheck className="h-6 w-6 text-blue-600" /></div>
      </div>
    </header>
  );
}
