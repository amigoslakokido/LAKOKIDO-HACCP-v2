import React from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import { useCompany } from '../../contexts/CompanyContext';

export default function CompanySwitcher() {
  const { currentCompany, companies, setCurrentCompany, loading } = useCompany();
  const [isOpen, setIsOpen] = React.useState(false);

  if (loading || !currentCompany) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg animate-pulse">
        <Building2 className="w-5 h-5 text-gray-400" />
        <div className="h-4 w-32 bg-gray-300 rounded"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
      >
        <Building2 className="w-5 h-5 text-indigo-600" />
        <div className="text-left">
          <div className="font-semibold text-gray-900">{currentCompany.name}</div>
          <div className="text-xs text-gray-500">{currentCompany.org_number}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-indigo-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">
                Velg Selskap
              </div>
              {companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => {
                    setCurrentCompany(company);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-3 rounded-lg hover:bg-indigo-50 transition-colors ${
                    currentCompany.id === company.id ? 'bg-indigo-100' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Building2 className={`w-5 h-5 mt-0.5 ${
                      currentCompany.id === company.id ? 'text-indigo-600' : 'text-gray-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold ${
                        currentCompany.id === company.id ? 'text-indigo-900' : 'text-gray-900'
                      }`}>
                        {company.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {company.address}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Org.nr: {company.org_number}
                      </div>
                    </div>
                    {currentCompany.id === company.id && (
                      <div className="flex items-center justify-center w-5 h-5 bg-indigo-600 rounded-full">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
