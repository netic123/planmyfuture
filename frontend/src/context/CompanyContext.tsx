import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Company } from '../types';
import { companiesApi } from '../services/api';
import { useAuth } from './AuthContext';

interface CompanyContextType {
  companies: Company[];
  selectedCompany: Company | null;
  selectCompany: (company: Company) => void;
  refreshCompanies: () => Promise<void>;
  loading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCompanies = async () => {
    if (!isAuthenticated) {
      setCompanies([]);
      setSelectedCompany(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const data = await companiesApi.getAll();
      setCompanies(data);
      
      // Restore selected company from localStorage
      const savedId = localStorage.getItem('selectedCompanyId');
      if (savedId) {
        const saved = data.find(c => c.id === parseInt(savedId));
        if (saved) {
          setSelectedCompany(saved);
        } else if (data.length > 0) {
          setSelectedCompany(data[0]);
        }
      } else if (data.length > 0) {
        setSelectedCompany(data[0]);
      }
    } catch (error) {
      console.error('Failed to load companies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCompanies();
  }, [isAuthenticated]);

  const selectCompany = (company: Company) => {
    setSelectedCompany(company);
    localStorage.setItem('selectedCompanyId', company.id.toString());
  };

  return (
    <CompanyContext.Provider value={{ companies, selectedCompany, selectCompany, refreshCompanies, loading }}>
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

