import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { authApi } from '../services/api';
import Logo from './Logo';
import { 
  LogOut,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { t, i18n } = useTranslation();
  const { user, logout, updateUserLanguage } = useAuth();
  const { companies, selectedCompany, selectCompany } = useCompany();
  const location = useLocation();
  const navigate = useNavigate();
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [financeMenuOpen, setFinanceMenuOpen] = useState(true); // Open by default
  const [companyMenuOpen, setCompanyMenuOpen] = useState(
    location.pathname.startsWith('/company')
  );
  const [gigMenuOpen, setGigMenuOpen] = useState(
    location.pathname.startsWith('/gig')
  );
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const personalNavigation = [
    { name: t('nav.myFinance'), href: '/' },
    { name: t('nav.budget'), href: '/budget' },
    { name: t('nav.assets'), href: '/assets' },
    { name: t('nav.debts'), href: '/debts' },
    { name: t('nav.taxPension'), href: '/tax-pension' },
  ];

  const companyNavigation = [
    { name: t('nav.overview'), href: '/company' },
    { name: t('nav.invoices'), href: '/company/invoices' },
    { name: t('nav.expenses'), href: '/company/expenses' },
    { name: t('nav.customers'), href: '/company/customers' },
    { name: t('nav.accounting'), href: '/company/vouchers' },
    { name: t('nav.employees'), href: '/company/employees' },
    { name: t('nav.salaries'), href: '/company/salaries' },
    { name: t('nav.vat'), href: '/company/vat' },
    { name: t('nav.reports'), href: '/company/reports' },
    { name: t('nav.yearEnd'), href: '/company/year-end' },
  ];

  const gigNavigation = [
    { name: t('gig.findGigs'), href: '/gig' },
    { name: t('gig.postGig'), href: '/gig/post' },
    { name: t('gig.myGigs'), href: '/gig/my-gigs' },
    { name: t('gig.myProfile'), href: '/gig/profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeLanguage = async (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    setLangDropdownOpen(false);
    
    // Save to user account in database
    try {
      await authApi.updateLanguage(lang);
      updateUserLanguage(lang);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-56 bg-neutral-900 text-white">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <h1 className="text-lg font-semibold tracking-tight text-white">
                Plan My Future
              </h1>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="px-4 py-3 border-b border-neutral-800">
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors text-sm"
              >
                <span className="text-neutral-200">{t(`language.${i18n.language}`)}</span>
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              </button>
              {langDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-800 rounded-md shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-700 transition-colors ${
                      i18n.language === 'en' ? 'bg-neutral-700 text-white' : 'text-neutral-300'
                    }`}
                  >
                    {t('language.en')}
                  </button>
                  <button
                    onClick={() => changeLanguage('sv')}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-700 transition-colors ${
                      i18n.language === 'sv' ? 'bg-neutral-700 text-white' : 'text-neutral-300'
                    }`}
                  >
                    {t('language.sv')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {/* My Finances - Dropdown */}
            <div className="mb-4">
              <button
                onClick={() => setFinanceMenuOpen(!financeMenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wider hover:text-neutral-300"
              >
                <span>My Finances</span>
                {financeMenuOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {financeMenuOpen && (
                <div className="space-y-0.5">
                  {personalNavigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`block px-3 py-2 ml-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-white text-neutral-900'
                            : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-800 my-3" />

            {/* Company Navigation */}
            <div>
              <button
                onClick={() => setCompanyMenuOpen(!companyMenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wider hover:text-neutral-300"
              >
                <span>My Business</span>
                {companyMenuOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {companyMenuOpen && (
                <>
                  {/* Company selector */}
                  <div className="px-3 py-2">
                    <div className="relative">
                      <button
                        onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors text-sm"
                      >
                        <span className="truncate text-neutral-200">
                          {selectedCompany?.name || t('nav.selectCompany')}
                        </span>
                        <ChevronDown className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                      </button>

                      {companyDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-800 rounded-md shadow-lg z-50 overflow-hidden">
                          {companies.map((company) => (
                            <button
                              key={company.id}
                              onClick={() => {
                                selectCompany(company);
                                setCompanyDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-700 transition-colors ${
                                selectedCompany?.id === company.id ? 'bg-neutral-700 text-white' : 'text-neutral-300'
                              }`}
                            >
                              {company.name}
                            </button>
                          ))}
                          <Link
                            to="/companies/new"
                            onClick={() => setCompanyDropdownOpen(false)}
                            className="block w-full text-left px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-700 hover:text-white border-t border-neutral-700"
                          >
                            {t('nav.addCompany')}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Company navigation items */}
                  {companyNavigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`block px-3 py-2 ml-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-white text-neutral-900'
                            : 'text-neutral-500 hover:bg-neutral-800 hover:text-white'
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-800 my-3" />

            {/* MyGig Section - Dropdown */}
            <div>
              <button
                onClick={() => setGigMenuOpen(!gigMenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wider hover:text-neutral-300"
              >
                <span>My Gig</span>
                {gigMenuOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {gigMenuOpen && (
                <div className="space-y-0.5">
                  {gigNavigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`block px-3 py-2 ml-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-white text-neutral-900'
                            : 'text-neutral-500 hover:bg-neutral-800 hover:text-white'
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* User */}
          <div className="p-4 border-t border-neutral-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-medium text-white">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
