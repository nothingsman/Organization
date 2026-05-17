
import { motion } from 'motion/react';
import { OnboardingStep } from '../types';
import { Check } from 'lucide-react';

interface StepperProps {
  currentStep: OnboardingStep;
}

export default function Stepper({ currentStep }: StepperProps) {
  const steps = [
    { id: OnboardingStep.DETAILS, label: 'Institutional Details' },
    { id: OnboardingStep.STATUS, label: 'Document Review' },
    { id: OnboardingStep.PLANS, label: 'Choose Plan' },
    { id: 'FINAL', label: 'Completion' },
  ];

  const getStepStatus = (stepId: string) => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    const targetIndex = steps.findIndex(s => s.id === stepId);

    if (targetIndex < currentIndex && currentIndex !== -1) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className="w-full flex items-center justify-between mb-8 px-4">
      {steps.map((step, index) => {
        const status = getStepStatus(step.id);
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
            <div className="flex flex-col items-center relative">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: status === 'completed' || status === 'current' ? '#1A237E' : '#E5E7EB',
                  scale: status === 'current' ? 1.1 : 1,
                }}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white z-10 shadow-sm`}
              >
                {status === 'completed' ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span className="text-sm font-black">{index + 1}</span>
                )}
              </motion.div>
              <span className={`absolute top-14 whitespace-nowrap text-[10px] uppercase font-bold tracking-widest ${status === 'current' ? 'text-primary-navy' : 'text-text-muted/60'}`}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className="flex-1 h-[6px] mx-4 bg-gray-100 rounded-full relative overflow-hidden">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: status === 'completed' ? 1 : 0 }}
                  className="absolute inset-0 bg-primary-navy origin-left"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
