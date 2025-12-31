import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { Loader2, Globe, ChevronDown } from 'lucide-react';
import Logo from '../components/Logo';

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }

    setLoading(true);

    try {
      const data = await authApi.register(email, password, firstName, lastName);
      login(data);
      navigate('/');
    } catch {
      setError(i18n.language === 'sv' 
        ? 'Kunde inte skapa konto. Email kanske redan finns.' 
        : 'Could not create account. Email might already exist.');
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    setLangDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <div className="relative">
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors text-sm"
          >
            <Globe className="h-4 w-4" />
            {t(`language.${i18n.language}`)}
            <ChevronDown className="h-3 w-3" />
          </button>
          {langDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 bg-neutral-800 rounded-md shadow-lg z-50 overflow-hidden min-w-[120px]">
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
      
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-semibold text-white">
            Plan My Future
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {i18n.language === 'sv' ? 'Skapa ett nytt konto' : 'Create a new account'}
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-md bg-neutral-100 border border-neutral-300 text-neutral-700 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="label">{t('auth.firstName')}</label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input"
                  placeholder={i18n.language === 'sv' ? 'Johan' : 'John'}
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="label">{t('auth.lastName')}</label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input"
                  placeholder={i18n.language === 'sv' ? 'Svensson' : 'Smith'}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="label">{t('auth.email')}</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder={i18n.language === 'sv' ? 'din@email.se' : 'your@email.com'}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="label">{t('auth.password')}</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                {t('auth.confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
                minLength={6}
              />
              {password && confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-sm text-neutral-600">
                  {t('auth.passwordsDoNotMatch')}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {i18n.language === 'sv' ? 'Skapar konto...' : 'Creating account...'}
                </>
              ) : (
                t('auth.createAccount')
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-neutral-900 hover:underline font-medium">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
