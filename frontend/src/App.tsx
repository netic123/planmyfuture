import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingProvider } from './context/OnboardingContext';
import ProtectedRoute from './components/ProtectedRoute';

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
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function OnboardingRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SalaryStep />} />
      <Route path="/expenses" element={<ExpensesStep />} />
      <Route path="/mortgage" element={<MortgageStep />} />
      <Route path="/debts" element={<DebtsStep />} />
      <Route path="/assets" element={<AssetsStep />} />
      <Route path="/signup" element={<SignupStep />} />
    </Routes>
  );
}

function HomeRoute() {
  const token = localStorage.getItem('token');
  
  // If logged in, redirect to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Show onboarding with shared provider
  return (
    <OnboardingProvider>
      <OnboardingRoutes />
    </OnboardingProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main app - protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Redirect old routes */}
        <Route path="/settings" element={<Navigate to="/dashboard" replace />} />
        <Route path="/onboarding/*" element={<Navigate to="/" replace />} />
        
        {/* Onboarding flow at base URL */}
        <Route path="/*" element={<HomeRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
