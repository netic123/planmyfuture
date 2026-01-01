import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, Eye, EyeOff, Globe } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'sv' ? 'en' : 'sv';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(t('login.invalidCredentials'));
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      
      // Set language from user's saved preference
      if (data.preferredLanguage) {
        i18n.changeLanguage(data.preferredLanguage);
        localStorage.setItem('language', data.preferredLanguage);
      }
      
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header with language switcher */}
      <div className="px-6 py-4 flex justify-end items-center">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          title={i18n.language === 'sv' ? 'Switch to English' : 'Byt till svenska'}
        >
          <Globe className="h-4 w-4" />
          <span className="font-medium">{i18n.language === 'sv' ? 'EN' : 'SV'}</span>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-neutral-900">
              {t('login.signInToAccount')}
            </h1>
          </div>

          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="text-sm text-neutral-600 mb-1 block">{t('auth.email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl"
                  placeholder={t('placeholders.email')}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-neutral-600 mb-1 block">{t('auth.password')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-neutral-600 hover:text-neutral-900">
                  {t('login.forgotPassword')}
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  t('auth.login')
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-500">
              {t('auth.noAccount')}{' '}
              <Link to="/onboarding/salary" className="text-neutral-900 hover:underline font-medium">
                {t('auth.createAccount')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
