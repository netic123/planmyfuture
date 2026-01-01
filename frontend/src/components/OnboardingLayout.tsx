import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';

interface OnboardingLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const stepLabels = [
  'Lön',
  'Utgifter', 
  'Bostadslån',
  'Skulder',
  'Tillgångar',
  'Konto'
];

export default function OnboardingLayout({ children, title, subtitle }: OnboardingLayoutProps) {
  const { currentStep, totalSteps } = useOnboarding();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header with login link */}
      <div className="px-6 py-4 flex justify-between items-center">
        <span className="text-lg font-semibold text-neutral-900">Min Ekonomi</span>
        <Link 
          to="/login" 
          className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          Har du redan ett konto? <span className="font-medium underline">Logga in</span>
        </Link>
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
                      ? 'bg-neutral-900 text-white' 
                      : isCompleted 
                        ? 'bg-neutral-900 text-white' 
                        : 'bg-neutral-200 text-neutral-500'
                  }`}
                >
                  {isCompleted ? '✓' : stepNum}
                </div>
                {i < totalSteps - 1 && (
                  <div 
                    className={`w-8 h-0.5 ${
                      isCompleted ? 'bg-neutral-900' : 'bg-neutral-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        <p className="text-center text-sm text-neutral-500">
          Steg {currentStep} av {totalSteps}: <span className="font-medium text-neutral-700">{stepLabels[currentStep - 1]}</span>
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-neutral-900 mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-neutral-500">
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
