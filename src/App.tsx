import { useState } from 'react';
import { SystemSwitcher } from './components/SystemSwitcher';
import { HACCPApp } from './components/HACCP/HACCPApp';
import { HMSApp } from './components/HMS/HMSApp';
import { CompanyProvider } from './contexts/CompanyContext';

export default function App() {
  const [activeSystem, setActiveSystem] = useState<'HACCP' | 'HMS'>('HACCP');

  return (
    <CompanyProvider>
      <div className="min-h-screen">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-center">
              <SystemSwitcher
                activeSystem={activeSystem}
                onSystemChange={setActiveSystem}
              />
            </div>
          </div>
        </div>

        {activeSystem === 'HACCP' ? <HACCPApp /> : <HMSApp />}
      </div>
    </CompanyProvider>
  );
}
