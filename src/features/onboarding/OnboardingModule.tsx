'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { OnboardingStep, type OrganizationDetails } from './types';
import { useAuth } from '@/context/AuthContext';
import AuthScreen from './components/AuthScreen';
import DetailsScreen from './components/DetailsScreen';
import PlansScreen from './components/PlansScreen';
import StatusScreen from './components/StatusScreen';
import Stepper from './components/Stepper';

export default function OnboardingModule() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [step, setStep] = useState<OnboardingStep>(OnboardingStep.AUTH);
  const [, setDetails] = useState<OrganizationDetails | null>(null);

  const handleAuthSuccess = () => {
    setStep(OnboardingStep.DETAILS);
  };

  const handleDetailsSubmit = (data: OrganizationDetails) => {
    setDetails(data);
    setStep(OnboardingStep.STATUS);
  };

  const handleStatusProceed = () => {
    setStep(OnboardingStep.PLANS);
  };

  const handlePlanSelect = () => {
    completeOnboarding();
    router.replace('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-bg-grey relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] bg-primary-navy/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[50%] bg-primary-navy/[0.02] rounded-full blur-3xl" />
      </div>

      <main className="w-full max-w-4xl mx-auto flex flex-col gap-8 relative z-10">
        {step !== OnboardingStep.AUTH && <Stepper currentStep={step} />}

        <div className="relative w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-full flex justify-center"
            >
              {step === OnboardingStep.AUTH && (
                <AuthScreen onSuccess={handleAuthSuccess} />
              )}
              {step === OnboardingStep.DETAILS && (
                <DetailsScreen onSubmit={handleDetailsSubmit} />
              )}
              {step === OnboardingStep.STATUS && (
                <StatusScreen onProceed={handleStatusProceed} />
              )}
              {step === OnboardingStep.PLANS && (
                <PlansScreen onComplete={handlePlanSelect} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
