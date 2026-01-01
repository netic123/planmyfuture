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
      {/* Onboarding flow */}
      <Route path="/onboarding/*" element={<OnboardingRoutes />} />
      
      {/* Main app */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Redirect old settings route to dashboard */}
      <Route path="/settings" element={<Navigate to="/dashboard" replace />} />
      
      {/* Default: redirect to onboarding or dashboard */}
      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function HomeRedirect() {
  const token = localStorage.getItem('token');
  
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/onboarding/salary" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
          <AppRoutes />
    </BrowserRouter>
  );
}
