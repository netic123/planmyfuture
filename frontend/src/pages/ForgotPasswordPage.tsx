import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../services/api';
import { Loader2, Globe, ChevronDown, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import Logo from '../components/Logo';

export default function ForgotPasswordPage() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      setSent(true);
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
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-neutral-100 mb-4">
                <CheckCircle className="h-7 w-7 text-neutral-600" />
              </div>
              <h2 className="text-lg font-medium text-neutral-900 mb-2">
                {i18n.language === 'sv' ? 'Kolla din email!' : 'Check your email!'}
              </h2>
              <p className="text-sm text-neutral-500 mb-6">
                {i18n.language === 'sv' 
                  ? 'Om ett konto finns med den emailen har vi skickat en länk för att återställa ditt lösenord.'
                  : 'If an account exists with that email, we\'ve sent a link to reset your password.'}
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-medium text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                {i18n.language === 'sv' ? 'Tillbaka till inloggning' : 'Back to login'}
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-neutral-100 mb-3">
                  <Mail className="h-5 w-5 text-neutral-600" />
                </div>
                <h2 className="text-lg font-medium text-neutral-900">
                  {i18n.language === 'sv' ? 'Glömt lösenord?' : 'Forgot password?'}
                </h2>
                <p className="text-neutral-500 text-sm mt-1">
                  {i18n.language === 'sv' 
                    ? 'Ange din email så skickar vi en återställningslänk'
                    : 'Enter your email and we\'ll send you a reset link'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    i18n.language === 'sv' ? 'Skicka återställningslänk' : 'Send reset link'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {i18n.language === 'sv' ? 'Tillbaka till inloggning' : 'Back to login'}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
