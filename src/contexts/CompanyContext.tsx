import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/hmsSupabase';

interface Company {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  org_number: string;
  is_active: boolean;
}

interface CompanyContextType {
  currentCompany: Company | null;
  companies: Company[];
  setCurrentCompany: (company: Company) => void;
  loading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [currentCompany, setCurrentCompanyState] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      setCompanies(data || []);

      // Load saved company from localStorage
      const savedCompanyId = localStorage.getItem('selectedCompanyId');
      if (savedCompanyId && data) {
        const savedCompany = data.find(c => c.id === savedCompanyId);
        if (savedCompany) {
          setCurrentCompanyState(savedCompany);
        } else if (data.length > 0) {
          setCurrentCompanyState(data[0]);
        }
      } else if (data && data.length > 0) {
        setCurrentCompanyState(data[0]);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  }

  const setCurrentCompany = (company: Company) => {
    setCurrentCompanyState(company);
    localStorage.setItem('selectedCompanyId', company.id);
  };

  return (
    <CompanyContext.Provider
      value={{
        currentCompany,
        companies,
        setCurrentCompany,
        loading,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
