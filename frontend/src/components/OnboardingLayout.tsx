import { ReactNode } from 'react';
import { useOnboarding } from '../context/OnboardingContext';

interface OnboardingLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function OnboardingLayout({ children, title, subtitle }: OnboardingLayoutProps) {
  const { currentStep, totalSteps } = useOnboarding();
  
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-neutral-200">
        <div 
          className="h-full bg-neutral-900 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicator */}
      <div className="px-6 py-4">
        <span className="text-sm text-neutral-400">
          Steg {currentStep} av {totalSteps}
        </span>
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

