import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../../context/OnboardingContext';
import OnboardingLayout from '../../components/OnboardingLayout';
import { ArrowLeft, Check, Loader2, Eye, EyeOff } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL || '';

export default function SignupStep() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data, updateData } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleBack = () => {
    navigate('/assets');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.email || !data.password) return;

    setLoading(true);
    setError('');

    try {
      // Register user
      const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: '',
          lastName: '',
          birthYear: data.birthYear > 0 ? data.birthYear : null,
        }),
      });

      if (!registerResponse.ok) {
        throw new Error('Kunde inte skapa konto. E-post kanske redan finns.');
      }

      const authData = await registerResponse.json();
      const token = authData.token;

      // Save all financial data
      await saveFinancialData(token);

      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(authData));

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    } finally {
      setLoading(false);
    }
  };

  const saveFinancialData = async (token: string) => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    // Save salary as income
    if (data.salary > 0) {
      await fetch(`${API_URL}/api/personal-finance/budget/items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: 'Lön',
          amount: data.salary,
          type: 0, // Income
          category: 0, // Salary
          isRecurring: true,
        }),
      });
    }

    // Save expenses
    for (const expense of data.expenses) {
      if (expense.amount > 0) {
        await fetch(`${API_URL}/api/personal-finance/budget/items`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: expense.name,
            amount: expense.amount,
            type: 1, // Expense
            category: 10, // Other
            isRecurring: true,
          }),
        });
      }
    }

    // Save mortgage-related expenses (interest and amortization)
    if (data.mortgageAmount > 0 && data.mortgageInterestRate > 0) {
      const monthlyInterest = (data.mortgageAmount * data.mortgageInterestRate / 100) / 12;
      await fetch(`${API_URL}/api/personal-finance/budget/items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: 'Ränta bolån',
          amount: Math.round(monthlyInterest),
          type: 1, // Expense
          category: 10,
          isRecurring: true,
        }),
      });
    }
    
    if (data.mortgageAmortization > 0) {
      await fetch(`${API_URL}/api/personal-finance/budget/items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: 'Amortering',
          amount: data.mortgageAmortization,
          type: 1, // Expense
          category: 10,
          isRecurring: true,
        }),
      });
    }

    // Save mortgage as debt (without assetValue - property is saved separately)
    if (data.mortgageAmount > 0) {
      await fetch(`${API_URL}/api/personal-finance/debts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 0, // Mortgage
          originalAmount: data.mortgageAmount,
          currentBalance: data.mortgageAmount,
          interestRate: data.mortgageInterestRate,
          monthlyAmortization: data.mortgageAmortization,
        }),
      });
    }

    // Save property value as asset
    if (data.propertyValue > 0) {
      await fetch(`${API_URL}/api/personal-finance/accounts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: 'Bostadsvärde',
          balance: data.propertyValue,
          category: 1, // RealEstate
        }),
      });
    }

    // Save other debts
    for (const debt of data.debts) {
      const debtTypeMap: Record<string, number> = {
        'studentLoan': 1,
        'carLoan': 2,
        'personalLoan': 3,
        'creditCard': 4,
        'taxAuthority': 5,
        'toPerson': 3, // Uses PersonalLoan type, name field has the person
        'other': 7,
      };
      await fetch(`${API_URL}/api/personal-finance/debts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: debt.name || debt.type,
          type: debtTypeMap[debt.type] || 7,
          originalAmount: debt.amount,
          currentBalance: debt.amount,
          interestRate: debt.interestRate,
        }),
      });
    }

    // Save assets
    for (const asset of data.assets) {
      const categoryMap: Record<string, number> = {
        'savings': 2,
        'investments': 3,
        'pension': 4,
        'cash': 0,
        'other': 8,
      };
      await fetch(`${API_URL}/api/personal-finance/accounts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: asset.name,
          balance: asset.amount,
          category: categoryMap[asset.type] || 8,
        }),
      });
    }
  };

  return (
    <OnboardingLayout 
      title={t('onboarding.signup.title')}
      subtitle={t('onboarding.signup.subtitle')}
    >
      <form onSubmit={handleSignup} className="space-y-4">
        {/* Birth Year - for future projections */}
        <div>
          <label className="text-sm text-white/70 mb-1 block">{t('onboarding.signup.birthYear')}</label>
          <input
            type="number"
            value={data.birthYear || ''}
            onChange={(e) => updateData({ birthYear: parseInt(e.target.value) || 0 })}
            placeholder={t('onboarding.signup.birthYearPlaceholder')}
            className="w-full px-4 py-3 bg-black border border-neutral-700 text-white rounded-xl placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
          />
          <p className="text-xs text-white/40 mt-1.5">
            {t('onboarding.signup.birthYearExplanation')}
          </p>
        </div>

        <div>
          <label className="text-sm text-white/70 mb-1 block">{t('onboarding.signup.email')}</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            placeholder={t('onboarding.signup.emailPlaceholder')}
            required
            className="w-full px-4 py-3 bg-black border border-neutral-700 text-white rounded-xl placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
          />
        </div>

        <div>
          <label className="text-sm text-white/70 mb-1 block">{t('onboarding.signup.password')}</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={data.password}
              onChange={(e) => updateData({ password: e.target.value })}
              placeholder={t('onboarding.signup.passwordPlaceholder')}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-black border border-neutral-700 text-white rounded-xl placeholder:text-neutral-500 pr-12 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* GDPR Notice */}
        <p className="text-xs text-white/40 text-center">
          {t('onboarding.signup.gdprNotice')}
        </p>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center justify-center gap-2 py-4 px-6 border border-neutral-700 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="submit"
            disabled={loading || !data.email || !data.password}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-black rounded-xl font-medium text-lg hover:bg-neutral-200 transition-colors disabled:bg-neutral-600 disabled:text-neutral-400"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {t('onboarding.signup.createAccount')}
                <Check className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </OnboardingLayout>
  );
}
