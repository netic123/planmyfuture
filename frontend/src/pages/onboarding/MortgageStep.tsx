import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../../context/OnboardingContext';
import OnboardingLayout from '../../components/OnboardingLayout';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import { ArrowRight, ArrowLeft, Home } from 'lucide-react';

export default function MortgageStep() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data, updateData, setCurrentStep } = useOnboarding();

  const handleNext = () => {
    setCurrentStep(4);
    navigate('/onboarding/debts');
  };

  const handleBack = () => {
    setCurrentStep(2);
    navigate('/onboarding/expenses');
  };

  const handleNoMortgage = () => {
    updateData({ hasMortgage: false, mortgageAmount: 0, mortgageInterestRate: 0, mortgageAmortization: 0, propertyValue: 0 });
    setCurrentStep(4);
    navigate('/onboarding/debts');
  };

  return (
    <OnboardingLayout 
      title={t('onboarding.mortgage.title')}
      subtitle={t('onboarding.mortgage.subtitle')}
    >
      {!data.hasMortgage && data.mortgageAmount === 0 ? (
        // Initial choice
        <div className="space-y-3">
          <button
            onClick={() => updateData({ hasMortgage: true })}
            className="w-full flex items-center gap-4 p-4 border border-neutral-200 rounded-xl hover:border-neutral-400 transition-colors"
          >
            <div className="h-12 w-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Home className="h-6 w-6 text-neutral-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-neutral-900">{t('onboarding.mortgage.yes')}</p>
              <p className="text-sm text-neutral-500">{t('onboarding.mortgage.yesDesc')}</p>
            </div>
          </button>

          <button
            onClick={handleNoMortgage}
            className="w-full p-4 text-center text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            {t('onboarding.mortgage.no')}
          </button>
        </div>
      ) : (
        // Mortgage form
        <div className="space-y-4">
          <div>
            <label className="text-sm text-neutral-600 mb-1 block">{t('onboarding.mortgage.remainingLoan')}</label>
            <FormattedNumberInput
              value={data.mortgageAmount}
              onChange={(value) => updateData({ mortgageAmount: value })}
              placeholder="2 000 000"
              suffix="kr"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-600 mb-1 block">{t('onboarding.mortgage.propertyValue')}</label>
            <FormattedNumberInput
              value={data.propertyValue}
              onChange={(value) => updateData({ propertyValue: value })}
              placeholder="3 500 000"
              suffix="kr"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-600 mb-1 block">{t('onboarding.mortgage.interestRate')}</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={data.mortgageInterestRate || ''}
                onChange={(e) => updateData({ mortgageInterestRate: parseFloat(e.target.value) || 0 })}
                placeholder="3.5"
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">%</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-neutral-600 mb-1 block">{t('onboarding.mortgage.amortization')}</label>
            <FormattedNumberInput
              value={data.mortgageAmortization}
              onChange={(value) => updateData({ mortgageAmortization: value })}
              placeholder="3 000"
              suffix="kr/mån"
            />
          </div>

          {data.propertyValue > 0 && data.mortgageAmount > 0 && (
            <div className="bg-neutral-100 p-4 rounded-xl">
              <p className="text-sm text-neutral-600">{t('onboarding.mortgage.equity')}</p>
              <p className="text-xl font-semibold text-neutral-900">
                {(data.propertyValue - data.mortgageAmount).toLocaleString('sv-SE')} kr
              </p>
            </div>
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
        {data.hasMortgage && (
          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-neutral-900 text-white rounded-xl font-medium text-lg hover:bg-neutral-800 transition-colors"
          >
            {t('onboarding.mortgage.continue')}
            <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </OnboardingLayout>
  );
}
