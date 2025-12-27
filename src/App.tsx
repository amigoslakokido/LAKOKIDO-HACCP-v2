import { useState } from 'react';
import { SystemSwitcher } from './components/SystemSwitcher';
import { HACCPApp } from './components/HACCP/HACCPApp';
import { HMSApp } from './components/HMS/HMSApp';

export default function App() {
  const [activeSystem, setActiveSystem] = useState<'HACCP' | 'HMS'>('HACCP');

  return (
    <div className="min-h-screen">
      <SystemSwitcher
        activeSystem={activeSystem}
        onSystemChange={setActiveSystem}
      />

      {activeSystem === 'HACCP' ? <HACCPApp /> : <HMSApp />}
    </div>
  );
}
