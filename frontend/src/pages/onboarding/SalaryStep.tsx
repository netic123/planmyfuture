import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../../context/OnboardingContext';
import OnboardingLayout from '../../components/OnboardingLayout';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import { ArrowRight } from 'lucide-react';

export default function SalaryStep() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data, updateData, setCurrentStep } = useOnboarding();

  const currentYear = new Date().getFullYear();
  const currentAge = data.birthYear > 0 ? currentYear - data.birthYear : 0;

  const handleNext = () => {
    if (data.salary > 0 && data.birthYear > 1920 && data.birthYear <= currentYear) {
      setCurrentStep(2);
      navigate('/onboarding/expenses');
    }
  };

  const isValid = data.salary > 0 && data.birthYear > 1920 && data.birthYear <= currentYear;

  return (
    <OnboardingLayout 
      title={t('onboarding.salary.title')}
      subtitle={t('onboarding.salary.subtitle')}
    >
      <div className="space-y-6">
        {/* Age / Birth Year */}
        <div>
          <label className="block text-sm text-neutral-500 mb-2 text-center">
            {t('onboarding.salary.birthYear')}
          </label>
          <input
            type="number"
            value={data.birthYear || ''}
            onChange={(e) => updateData({ birthYear: parseInt(e.target.value) || 0 })}
            placeholder={t('onboarding.salary.birthYearPlaceholder')}
            className="w-full px-4 py-4 text-center text-2xl font-medium border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            min={1920}
            max={currentYear}
          />
          {currentAge > 0 && (
            <p className="text-center text-sm text-neutral-500 mt-2">
              {t('onboarding.salary.currentAge')}: {currentAge} {t('onboarding.salary.years')}
            </p>
          )}
        </div>

        {/* Salary */}
        <div>
          <label className="block text-sm text-neutral-500 mb-2 text-center">
            {t('onboarding.salary.monthlyIncome')}
          </label>
          <FormattedNumberInput
            value={data.salary}
            onChange={(value) => updateData({ salary: value })}
            placeholder={t('onboarding.salary.placeholder')}
            suffix="kr/mån"
            className="text-center text-2xl font-medium"
          />
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={!isValid}
        className="w-full flex items-center justify-center gap-2 py-4 bg-neutral-900 text-white rounded-xl font-medium text-lg hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t('onboarding.salary.continue')}
        <ArrowRight className="h-5 w-5" />
      </button>
    </OnboardingLayout>
  );
}
