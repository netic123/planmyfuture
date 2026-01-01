import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../../context/OnboardingContext';
import OnboardingLayout from '../../components/OnboardingLayout';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import { ArrowRight, ArrowLeft, Plus } from 'lucide-react';

export default function MortgageStep() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data, updateData, setCurrentStep } = useOnboarding();

  const handleNext = () => {
    setCurrentStep(4);
    navigate('/debts');
  };

  const handleBack = () => {
    setCurrentStep(2);
    navigate('/expenses');
  };

  const hasMortgageData = data.mortgageAmount > 0 || data.hasMortgage;

  return (
    <OnboardingLayout 
      title={t('onboarding.mortgage.title')}
      subtitle={t('onboarding.mortgage.subtitle')}
    >
      <div className="space-y-4">
        {!hasMortgageData ? (
          // Show "Add mortgage" button when no data
          <button
            onClick={() => updateData({ hasMortgage: true })}
            className="w-full flex items-center justify-center gap-2 p-4 border border-dashed border-neutral-600 rounded-xl text-white/60 hover:border-white/50 hover:text-white transition-colors"
          >
            <Plus className="h-5 w-5" />
            {t('onboarding.mortgage.yes')}
          </button>
        ) : (
          // Mortgage form
          <>
            <div>
              <label className="text-sm text-white/70 mb-1 block">{t('onboarding.mortgage.remainingLoan')}</label>
              <FormattedNumberInput
                value={data.mortgageAmount}
                onChange={(value) => updateData({ mortgageAmount: value })}
                placeholder="2 000 000"
                suffix="kr"
              />
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">{t('onboarding.mortgage.propertyValue')}</label>
              <FormattedNumberInput
                value={data.propertyValue}
                onChange={(value) => updateData({ propertyValue: value })}
                placeholder="3 500 000"
                suffix="kr"
              />
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">{t('onboarding.mortgage.interestRate')}</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={data.mortgageInterestRate || ''}
                  onChange={(e) => updateData({ mortgageInterestRate: parseFloat(e.target.value) || 0 })}
                  placeholder="3.5"
                  className="w-full px-4 py-2.5 bg-black border border-neutral-700 text-white rounded-xl pr-12 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50">%</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">{t('onboarding.mortgage.amortization')}</label>
              <FormattedNumberInput
                value={data.mortgageAmortization}
                onChange={(value) => updateData({ mortgageAmortization: value })}
                placeholder="3 000"
                suffix="kr/mån"
              />
            </div>

            {data.propertyValue > 0 && data.mortgageAmount > 0 && (
              <div className="bg-neutral-800 border border-neutral-700 p-4 rounded-xl">
                <p className="text-sm text-white/50">{t('onboarding.mortgage.equity')}</p>
                <p className="text-xl font-semibold text-white">
                  {(data.propertyValue - data.mortgageAmount).toLocaleString('sv-SE')} kr
                </p>
              </div>
            )}
          </>
        )}
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
          {t('onboarding.mortgage.continue')}
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </OnboardingLayout>
  );
}
