import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingProvider } from './context/OnboardingContext';

// Onboarding Pages
import {
  SalaryStep,
  ExpensesStep,
  MortgageStep,
  DebtsStep,
  AssetsStep,
  SignupStep,
} from './pages/onboarding';

// Main Pages
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';

function OnboardingRoutes() {
  return (
    <OnboardingProvider>
      <Routes>
        <Route path="salary" element={<SalaryStep />} />
        <Route path="expenses" element={<ExpensesStep />} />
        <Route path="mortgage" element={<MortgageStep />} />
        <Route path="debts" element={<DebtsStep />} />
        <Route path="assets" element={<AssetsStep />} />
        <Route path="signup" element={<SignupStep />} />
        <Route path="*" element={<Navigate to="salary" replace />} />
      </Routes>
    </OnboardingProvider>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Main app */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Redirect old settings route to dashboard */}
      <Route path="/settings" element={<Navigate to="/dashboard" replace />} />
      
      {/* Legacy onboarding routes - redirect to base URL */}
      <Route path="/onboarding/salary" element={<Navigate to="/" replace />} />
      <Route path="/onboarding/*" element={<OnboardingRoutes />} />
      
      {/* Base URL: show onboarding (salary step) or redirect to dashboard if logged in */}
      <Route path="/" element={<HomeRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function HomeRoute() {
  const token = localStorage.getItem('token');
  
  // If logged in, redirect to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Show onboarding (salary step) at base URL
  return (
    <OnboardingProvider>
      <SalaryStep />
    </OnboardingProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
          <AppRoutes />
    </BrowserRouter>
  );
}
