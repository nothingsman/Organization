'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingModule from '@/features/onboarding/OnboardingModule';
import { useAuth } from '@/context/AuthContext';

export default function OnboardingPage() {
  const { hydrated, isAuthenticated, onboardingComplete } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (isAuthenticated && onboardingComplete) {
      router.replace('/');
    }
  }, [hydrated, isAuthenticated, onboardingComplete, router]);

  if (!hydrated || (isAuthenticated && onboardingComplete)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-grey">
        <div className="w-10 h-10 border-4 border-primary-navy/20 border-t-primary-navy rounded-full animate-spin" />
      </div>
    );
  }

  return <OnboardingModule />;
}
