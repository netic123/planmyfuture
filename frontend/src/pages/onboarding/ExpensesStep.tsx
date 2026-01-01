import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../../context/OnboardingContext';
import OnboardingLayout from '../../components/OnboardingLayout';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import { ArrowRight, ArrowLeft, Plus, X } from 'lucide-react';

export default function ExpensesStep() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { data, updateData, setCurrentStep } = useOnboarding();
  
  const getDefaultExpenses = () => [
    { name: t('onboarding.expenses.housingFee'), amount: 0 },
    { name: t('onboarding.expenses.food'), amount: 0 },
    { name: t('onboarding.expenses.transport'), amount: 0 },
    { name: t('onboarding.expenses.entertainment'), amount: 0 },
  ];
  
  const [expenses, setExpenses] = useState(
    data.expenses.length > 0 ? data.expenses : getDefaultExpenses()
  );
  const [newExpenseName, setNewExpenseName] = useState('');

  // Update default expense names when language changes
  useEffect(() => {
    if (data.expenses.length === 0) {
      setExpenses(getDefaultExpenses());
    }
  }, [i18n.language]);

  const handleExpenseChange = (index: number, amount: number) => {
    const updated = [...expenses];
    updated[index].amount = amount;
    setExpenses(updated);
  };

  const addExpense = () => {
    if (newExpenseName.trim()) {
      setExpenses([...expenses, { name: newExpenseName.trim(), amount: 0 }]);
      setNewExpenseName('');
    }
  };

  const removeExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    updateData({ expenses: expenses.filter(e => e.amount > 0) });
    setCurrentStep(3);
    navigate('/mortgage');
  };

  const handleBack = () => {
    setCurrentStep(1);
    navigate('/');
  };

  return (
    <OnboardingLayout 
      title={t('onboarding.expenses.title')}
      subtitle={t('onboarding.expenses.subtitle')}
    >
      <div className="space-y-3">
        {expenses.map((expense, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-sm text-white/70 mb-1 block">{expense.name}</label>
              <FormattedNumberInput
                value={expense.amount}
                onChange={(value) => handleExpenseChange(index, value)}
                placeholder="0"
                suffix="kr"
              />
            </div>
            {index >= 4 && (
              <button
                onClick={() => removeExpense(index)}
                className="mt-6 p-2 text-white/40 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}

        {/* Add new expense */}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={newExpenseName}
            onChange={(e) => setNewExpenseName(e.target.value)}
            placeholder={t('onboarding.expenses.addExpense')}
            className="flex-1 px-4 py-2.5 bg-black border border-neutral-700 text-white rounded-xl text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white"
            onKeyDown={(e) => e.key === 'Enter' && addExpense()}
          />
          <button
            onClick={addExpense}
            disabled={!newExpenseName.trim()}
            className="p-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white/60 hover:bg-neutral-700 hover:text-white disabled:opacity-40"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={handleBack}
          className="flex items-center justify-center gap-2 py-4 px-6 border border-neutral-700 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          onClick={handleNext}
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-black rounded-xl font-medium text-lg hover:bg-neutral-200 transition-colors"
        >
          {t('onboarding.expenses.continue')}
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </OnboardingLayout>
  );
}
