import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../services/api';
import { Loader2, Globe, ChevronDown, ArrowLeft, Lock, CheckCircle, XCircle } from 'lucide-react';
import Logo from '../components/Logo';

export default function ResetPasswordPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(i18n.language === 'sv' ? 'Lösenorden matchar inte' : 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError(i18n.language === 'sv' ? 'Lösenordet måste vara minst 6 tecken' : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch {
      setError(i18n.language === 'sv' 
        ? 'Ogiltig eller utgången återställningslänk'
        : 'Invalid or expired reset link');
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    setLangDropdownOpen(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <div className="card p-8 max-w-sm text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-neutral-100 mb-4">
            <XCircle className="h-7 w-7 text-neutral-600" />
          </div>
          <h2 className="text-lg font-medium text-neutral-900 mb-2">
            {i18n.language === 'sv' ? 'Ogiltig länk' : 'Invalid link'}
          </h2>
          <p className="text-sm text-neutral-500 mb-6">
            {i18n.language === 'sv' 
              ? 'Återställningslänken saknas eller är ogiltig.'
              : 'The reset link is missing or invalid.'}
          </p>
          <Link to="/forgot-password" className="btn-primary inline-block">
            {i18n.language === 'sv' ? 'Begär ny länk' : 'Request new link'}
          </Link>
        </div>
      </div>
    );
  }

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
          {success ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-neutral-100 mb-4">
                <CheckCircle className="h-7 w-7 text-neutral-600" />
              </div>
              <h2 className="text-lg font-medium text-neutral-900 mb-2">
                {i18n.language === 'sv' ? 'Lösenord ändrat!' : 'Password changed!'}
              </h2>
              <p className="text-sm text-neutral-500 mb-6">
                {i18n.language === 'sv' 
                  ? 'Ditt lösenord har ändrats. Du kommer att omdirigeras till inloggningen...'
                  : 'Your password has been changed. Redirecting to login...'}
              </p>
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-neutral-400" />
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-neutral-100 mb-3">
                  <Lock className="h-5 w-5 text-neutral-600" />
                </div>
                <h2 className="text-lg font-medium text-neutral-900">
                  {i18n.language === 'sv' ? 'Ange nytt lösenord' : 'Set new password'}
                </h2>
                <p className="text-neutral-500 text-sm mt-1">
                  {i18n.language === 'sv' 
                    ? 'Välj ett starkt lösenord för ditt konto'
                    : 'Choose a strong password for your account'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-md bg-neutral-100 border border-neutral-300 text-neutral-700 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="password" className="label">
                    {i18n.language === 'sv' ? 'Nytt lösenord' : 'New password'}
                  </label>
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
                    {i18n.language === 'sv' ? 'Bekräfta lösenord' : 'Confirm password'}
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input"
                    placeholder="••••••••"
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
                    i18n.language === 'sv' ? 'Ändra lösenord' : 'Change password'
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
