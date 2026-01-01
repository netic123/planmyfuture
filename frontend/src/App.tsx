import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';

import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CreateCompanyPage from './pages/CreateCompanyPage';

// Personal Finance Pages
import PersonalDashboard from './pages/PersonalDashboard';
import EnterDataPage from './pages/EnterDataPage';
import BudgetPage from './pages/BudgetPage';
import AssetsPage from './pages/AssetsPage';
import DebtsPage from './pages/DebtsPage';
import TaxPensionPage from './pages/TaxPensionPage';

// MyGig Pages
import { GigBrowsePage, GigDetailsPage, PostGigPage, MyProfilePage, MyGigsPage } from './pages/gig';

// Company Pages
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import InvoicesPage from './pages/InvoicesPage';
import VouchersPage from './pages/VouchersPage';
import ExpensesPage from './pages/ExpensesPage';
import EmployeesPage from './pages/EmployeesPage';
import SalariesPage from './pages/SalariesPage';
import ReportsPage from './pages/ReportsPage';
import YearEndPage from './pages/YearEndPage';
import VatPage from './pages/VatPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPasswordPage />
        </PublicRoute>
      } />
      <Route path="/reset-password" element={
        <PublicRoute>
          <ResetPasswordPage />
        </PublicRoute>
      } />
      
      {/* Protected routes */}
      <Route path="/companies/new" element={
        <ProtectedRoute>
          <CreateCompanyPage />
        </ProtectedRoute>
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        {/* Personal Finance Routes */}
        <Route index element={<PersonalDashboard />} />
        <Route path="enter-data" element={<EnterDataPage />} />
        <Route path="budget" element={<BudgetPage />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="debts" element={<DebtsPage />} />
        <Route path="tax-pension" element={<TaxPensionPage />} />
        
        {/* Company Routes */}
        <Route path="company" element={<DashboardPage />} />
        <Route path="company/customers" element={<CustomersPage />} />
        <Route path="company/invoices" element={<InvoicesPage />} />
        <Route path="company/expenses" element={<ExpensesPage />} />
        <Route path="company/vouchers" element={<VouchersPage />} />
        <Route path="company/employees" element={<EmployeesPage />} />
        <Route path="company/salaries" element={<SalariesPage />} />
        <Route path="company/reports" element={<ReportsPage />} />
        <Route path="company/vat" element={<VatPage />} />
        <Route path="company/year-end" element={<YearEndPage />} />
        
        {/* MyGig Routes */}
        <Route path="gig" element={<GigBrowsePage />} />
        <Route path="gig/post" element={<PostGigPage />} />
        <Route path="gig/my-gigs" element={<MyGigsPage />} />
        <Route path="gig/profile" element={<MyProfilePage />} />
        <Route path="gig/:id" element={<GigDetailsPage />} />
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompanyProvider>
          <AppRoutes />
        </CompanyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
