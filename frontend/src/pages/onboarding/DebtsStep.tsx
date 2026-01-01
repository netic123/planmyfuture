import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../../context/OnboardingContext';
import OnboardingLayout from '../../components/OnboardingLayout';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import { ArrowRight, ArrowLeft, Plus, X, CreditCard } from 'lucide-react';

const debtTypeKeys = [
  'studentLoan',
  'carLoan',
  'personalLoan',
  'creditCard',
  'taxAuthority',
  'toPerson',
  'other',
] as const;

export default function DebtsStep() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data, updateData, setCurrentStep } = useOnboarding();
  const [debts, setDebts] = useState(data.debts);
  const [showForm, setShowForm] = useState(false);
  const [newDebt, setNewDebt] = useState({ type: 'studentLoan', amount: 0, interestRate: 0, name: '' });

  const addDebt = () => {
    if (newDebt.amount > 0) {
      const debtToAdd = {
        ...newDebt,
        name: newDebt.name || (newDebt.type === 'toPerson' ? t('onboarding.debts.types.toPerson') : t(`onboarding.debts.types.${newDebt.type}`)),
      };
      setDebts([...debts, debtToAdd]);
      setNewDebt({ type: 'studentLoan', amount: 0, interestRate: 0, name: '' });
      setShowForm(false);
    }
  };

  const removeDebt = (index: number) => {
    setDebts(debts.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    updateData({ debts });
    setCurrentStep(5);
    navigate('/onboarding/assets');
  };

  const handleBack = () => {
    setCurrentStep(3);
    navigate('/onboarding/mortgage');
  };

  const handleNoDebts = () => {
    updateData({ debts: [] });
    setCurrentStep(5);
    navigate('/onboarding/assets');
  };

  return (
    <OnboardingLayout 
      title={t('onboarding.debts.title')}
      subtitle={t('onboarding.debts.subtitle')}
    >
      {debts.length === 0 && !showForm ? (
        // Initial choice
        <div className="space-y-3">
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center gap-4 p-4 border border-neutral-200 rounded-xl hover:border-neutral-400 transition-colors"
          >
            <div className="h-12 w-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-neutral-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-neutral-900">{t('onboarding.debts.yes')}</p>
              <p className="text-sm text-neutral-500">{t('onboarding.debts.yesDesc')}</p>
            </div>
          </button>

          <button
            onClick={handleNoDebts}
            className="w-full p-4 text-center text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            {t('onboarding.debts.no')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* List of debts */}
          {debts.map((debt, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
              <div>
                <p className="font-medium text-neutral-900">
                  {debt.name || debt.type}
                </p>
                <p className="text-sm text-neutral-500">
                  {debt.amount.toLocaleString('sv-SE')} kr
                  {debt.interestRate > 0 && ` • ${debt.interestRate}% ${t('onboarding.debts.interest')}`}
                </p>
              </div>
              <button
                onClick={() => removeDebt(index)}
                className="p-2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}

          {/* Add new debt form */}
          {showForm ? (
            <div className="space-y-3 p-4 border border-neutral-200 rounded-xl">
              <div>
                <label className="text-sm text-neutral-600 mb-1 block">{t('onboarding.debts.debtType')}</label>
                <select
                  value={newDebt.type}
                  onChange={(e) => setNewDebt({ ...newDebt, type: e.target.value, name: '' })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl"
                >
                  {debtTypeKeys.map(typeKey => (
                    <option key={typeKey} value={typeKey}>{t(`onboarding.debts.types.${typeKey}`)}</option>
                  ))}
                </select>
              </div>
              {(newDebt.type === 'toPerson' || newDebt.type === 'other') && (
                <div>
                  <label className="text-sm text-neutral-600 mb-1 block">
                    {t('onboarding.debts.personName')}
                  </label>
                  <input
                    type="text"
                    value={newDebt.name}
                    onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                    placeholder={newDebt.type === 'toPerson' ? 'T.ex. Mamma, Kompis...' : 'Beskriv skulden'}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl"
                  />
                </div>
              )}
              <div>
                <label className="text-sm text-neutral-600 mb-1 block">{t('onboarding.debts.amount')}</label>
                <FormattedNumberInput
                  value={newDebt.amount}
                  onChange={(value) => setNewDebt({ ...newDebt, amount: value })}
                  placeholder="100 000"
                  suffix="kr"
                />
              </div>
              <div>
                <label className="text-sm text-neutral-600 mb-1 block">{t('onboarding.debts.interest')} (0 om ingen)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={newDebt.interestRate || ''}
                    onChange={(e) => setNewDebt({ ...newDebt, interestRate: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">%</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 text-neutral-600 hover:text-neutral-900"
                >
                  {t('onboarding.debts.cancel')}
                </button>
                <button
                  onClick={addDebt}
                  disabled={newDebt.amount <= 0}
                  className="flex-1 py-2.5 bg-neutral-900 text-white rounded-xl font-medium disabled:opacity-40"
                >
                  {t('onboarding.debts.add')}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-neutral-300 rounded-xl text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 transition-colors"
            >
              <Plus className="h-5 w-5" />
              {t('onboarding.debts.addAnother')}
            </button>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          onClick={handleBack}
          className="flex items-center justify-center gap-2 py-4 px-6 border border-neutral-200 rounded-xl font-medium hover:bg-neutral-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        {(debts.length > 0 || showForm) && (
          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-neutral-900 text-white rounded-xl font-medium text-lg hover:bg-neutral-800 transition-colors"
          >
            {t('onboarding.debts.continue')}
            <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </OnboardingLayout>
  );
}
