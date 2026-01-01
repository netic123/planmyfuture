import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../context/OnboardingContext';
import { Globe } from 'lucide-react';

interface OnboardingLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const API_URL = import.meta.env.VITE_API_URL || '';

export default function OnboardingLayout({ children, title, subtitle }: OnboardingLayoutProps) {
  const { currentStep, totalSteps } = useOnboarding();
  const { t, i18n } = useTranslation();

  const stepKeys = ['salary', 'expenses', 'mortgage', 'debts', 'assets', 'account'];

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'sv' ? 'en' : 'sv';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
    
    // If user is logged in, save to backend
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`${API_URL}/api/auth/language`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ language: newLang }),
        });
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header with login link and language switcher */}
      <div className="px-6 py-4 flex justify-end items-center">
        <div className="flex items-center gap-4">
          {/* Language switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
            title={i18n.language === 'sv' ? 'Switch to English' : 'Byt till svenska'}
          >
            <Globe className="h-4 w-4" />
            <span className="font-medium">{i18n.language === 'sv' ? 'EN' : 'SV'}</span>
          </button>
          {/* Login link */}
          <Link 
            to="/login" 
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            {t('onboarding.haveAccount')} <span className="font-medium underline">{t('onboarding.login')}</span>
          </Link>
        </div>
      </div>

      {/* Step indicator */}
      <div className="px-6 pb-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          {Array.from({ length: totalSteps }, (_, i) => {
            const stepNum = i + 1;
            const isActive = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;
            
            return (
              <div key={i} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-white text-black' 
                      : isCompleted 
                        ? 'bg-white text-black' 
                        : 'bg-neutral-800 text-neutral-500'
                  }`}
                >
                  {isCompleted ? '✓' : stepNum}
                </div>
                {i < totalSteps - 1 && (
                  <div 
                    className={`w-8 h-0.5 ${
                      isCompleted ? 'bg-white' : 'bg-neutral-800'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        <p className="text-center text-sm text-white/50">
          {t('onboarding.step')} {currentStep} {t('onboarding.of')} {totalSteps}: <span className="font-medium text-white">{t(`onboarding.steps.${stepKeys[currentStep - 1]}`)}</span>
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-white mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-white/50">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form content */}
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
