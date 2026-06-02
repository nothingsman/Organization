'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { SecuritySection } from "@/components/landing/security-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { CtaSection } from "@/components/landing/cta-section";
import { CollaboratorsSection } from "@/components/landing/collaborators-section";
import { FooterSection } from "@/components/landing/footer-section";

export default function LandingPage() {
  const { hydrated, isAuthenticated, onboardingComplete } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && isAuthenticated && onboardingComplete) {
      router.replace('/');
    }
  }, [hydrated, isAuthenticated, onboardingComplete, router]);

  return (
    <main className="relative min-h-screen overflow-x-hidden font-sans">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SecuritySection />
      <TestimonialsSection />
      <PricingSection />
      <CtaSection />
      <CollaboratorsSection />
      <FooterSection />
    </main>
  );
}
