import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import Logo from './Logo';
import { 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { t, i18n } = useTranslation();
  const { user, logout, updateUserLanguage } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const personalNavigation = [
    { name: t('nav.overview'), href: '/dashboard' },
    { name: t('nav.myDetails'), href: '/settings' },
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
            {/* My Finances */}
            <div className="mb-4">
              <div className="px-3 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                {t('nav.myFinance')}
              </div>
              <div className="space-y-0.5">
                {personalNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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
