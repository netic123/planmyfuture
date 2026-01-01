import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import OnboardingLayout from '../../components/OnboardingLayout';
import { ArrowLeft, Check, Loader2, Eye, EyeOff } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function SignupStep() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Calculate summary
  const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalAssets = data.assets.reduce((sum, a) => sum + a.amount, 0) + 
    (data.propertyValue > 0 ? data.propertyValue : 0);
  const totalDebts = data.mortgageAmount + data.debts.reduce((sum, d) => sum + d.amount, 0);
  const netWorth = totalAssets - totalDebts;
  const monthlyBalance = data.salary - totalExpenses;

  const handleBack = () => {
    navigate('/onboarding/assets');
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
      await fetch(`${API_URL}/api/personal/budget`, {
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
        await fetch(`${API_URL}/api/personal/budget`, {
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

    // Save mortgage as debt
    if (data.mortgageAmount > 0) {
      await fetch(`${API_URL}/api/personal/debts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 0, // Mortgage
          currentBalance: data.mortgageAmount,
          assetValue: data.propertyValue,
          interestRate: data.mortgageInterestRate,
        }),
      });
    }

    // Save other debts
    for (const debt of data.debts) {
      const debtTypeMap: Record<string, number> = {
        'Studielån': 1,
        'Billån': 2,
        'Privatlån': 3,
        'Kreditkort': 4,
        'Övrigt': 7,
      };
      await fetch(`${API_URL}/api/personal/debts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: debtTypeMap[debt.type] || 7,
          currentBalance: debt.amount,
          interestRate: debt.interestRate,
        }),
      });
    }

    // Save assets
    for (const asset of data.assets) {
      const categoryMap: Record<string, number> = {
        'Sparkonto': 2,
        'Investeringar': 3,
        'Pension': 4,
        'Kontanter': 0,
        'Övrigt': 8,
      };
      await fetch(`${API_URL}/api/personal/accounts`, {
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
      title="Spara din ekonomi"
      subtitle="Skapa ett konto för att se din översikt"
    >
      {/* Summary */}
      <div className="bg-neutral-900 text-white p-5 rounded-xl mb-2">
        <p className="text-neutral-400 text-sm mb-1">Din nettoförmögenhet</p>
        <p className="text-3xl font-semibold">{formatCurrency(netWorth)}</p>
        <div className="flex gap-6 mt-3 text-sm">
          <div>
            <p className="text-neutral-400">Tillgångar</p>
            <p className="font-medium">{formatCurrency(totalAssets)}</p>
          </div>
          <div>
            <p className="text-neutral-400">Skulder</p>
            <p className="font-medium">{formatCurrency(totalDebts)}</p>
          </div>
          <div>
            <p className="text-neutral-400">Kvar/mån</p>
            <p className="font-medium">{formatCurrency(monthlyBalance)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="text-sm text-neutral-600 mb-1 block">E-post</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            placeholder="din@email.se"
            required
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl"
          />
        </div>

        <div>
          <label className="text-sm text-neutral-600 mb-1 block">Lösenord</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={data.password}
              onChange={(e) => updateData({ password: e.target.value })}
              placeholder="Minst 6 tecken"
              required
              minLength={6}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl pr-12"
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

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center justify-center gap-2 py-4 px-6 border border-neutral-200 rounded-xl font-medium hover:bg-neutral-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="submit"
            disabled={loading || !data.email || !data.password}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-neutral-900 text-white rounded-xl font-medium text-lg hover:bg-neutral-800 transition-colors disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Skapa konto
                <Check className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </OnboardingLayout>
  );
}

