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

  const handleNext = () => {
    if (data.salary > 0) {
      setCurrentStep(2);
      navigate('/onboarding/expenses');
    }
  };

  return (
    <OnboardingLayout 
      title={t('onboarding.salary.title')}
      subtitle={t('onboarding.salary.subtitle')}
    >
      <div>
        <FormattedNumberInput
          value={data.salary}
          onChange={(value) => updateData({ salary: value })}
          placeholder={t('onboarding.salary.placeholder')}
          suffix="kr/mån"
          className="text-center text-2xl font-medium"
        />
      </div>

      <button
        onClick={handleNext}
        disabled={data.salary <= 0}
        className="w-full flex items-center justify-center gap-2 py-4 bg-neutral-900 text-white rounded-xl font-medium text-lg hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t('onboarding.salary.continue')}
        <ArrowRight className="h-5 w-5" />
      </button>
    </OnboardingLayout>
  );
}
