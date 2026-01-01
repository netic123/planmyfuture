import { createContext, useContext, useState, ReactNode } from 'react';

export interface ExpenseItem {
  name: string;
  amount: number;
}

export interface DebtItem {
  type: string;
  amount: number;
  interestRate: number;
  name?: string;
}

export interface AssetItem {
  name: string;
  amount: number;
  type: string;
}

export interface OnboardingData {
  // Step 1: Salary & Age
  salary: number;
  birthYear: number;
  
  // Step 2: Expenses
  expenses: ExpenseItem[];
  
  // Step 3: Mortgage
  hasMortgage: boolean;
  mortgageAmount: number;
  mortgageInterestRate: number;
  mortgageAmortization: number;
  propertyValue: number;
  
  // Step 4: Other debts
  debts: DebtItem[];
  
  // Step 5: Assets
  assets: AssetItem[];
  
  // Step 6: Account
  email: string;
  password: string;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
}

const defaultData: OnboardingData = {
  salary: 0,
  birthYear: 0,
  expenses: [],
  hasMortgage: false,
  mortgageAmount: 0,
  mortgageInterestRate: 0,
  mortgageAmortization: 0,
  propertyValue: 0,
  debts: [],
  assets: [],
  email: '',
  password: '',
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  return (
    <OnboardingContext.Provider value={{ data, updateData, currentStep, setCurrentStep, totalSteps }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

