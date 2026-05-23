'use client';

import Image from 'next/image';
import { useState, type FormEvent, useEffect } from 'react';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LegalModal, TermsOfService, PrivacyPolicy } from '@/components/LegalModal';
import { formatAuthError } from '@/lib/utils/errorMessages';

export default function LoginPage() {
  const { directLogin, hydrated, isAuthenticated, onboardingComplete, completeOnboarding } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingOrgs, setCheckingOrgs] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const activated = searchParams.get('activated') === 'true';
  const reset = searchParams.get('reset') === 'true';

  useEffect(() => {
    if (hydrated && isAuthenticated && onboardingComplete && !checkingOrgs) {
      router.replace('/');
    }
  }, [hydrated, isAuthenticated, onboardingComplete, checkingOrgs, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCheckingOrgs(true);
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    try {
      await directLogin(email, password);
      
      const { organizationsApi } = await import('@/lib/services/organizationsApi');
      const orgsResponse = await organizationsApi.list();
      
      if (orgsResponse.results.length > 0) {
        completeOnboarding();
        await new Promise(resolve => setTimeout(resolve, 100));
        router.push('/');
      } else {
        router.push('/onboarding');
      }
    } catch (err: unknown) {
      setError(formatAuthError(err));
      setCheckingOrgs(false);
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=1200&fit=crop&q=80"
            alt="Classroom learning"
            fill
            priority
            sizes="50vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent" />
        </div>
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Welcome back</h2>
          <p className="max-w-md text-base text-slate-300 md:text-lg">
            Manage your educational institutions with powerful tools designed for modern school administration.
          </p>
          <div className="mt-8 flex items-center gap-2 text-sm text-slate-400">
            <span>Photo by</span>
            <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">
              Unsplash
            </a>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary-navy mb-2">Welcome back</h1>
              <p className="text-slate-600">
                Enter your email below to sign in or{' '}
                <Link href="/onboarding" className="text-primary-navy font-medium hover:underline">
                  Create an account
                </Link>
              </p>
            </div>

            {activated && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-emerald-800">
                  ✓ Your account has been activated! You can now login.
                </p>
              </div>
            )}

            {reset && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-emerald-800">
                  ✓ Your password has been reset! You can now login with your new password.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="org@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary-navy font-medium hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign in with email
                    <LogIn className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-600">
              By clicking continue, you agree to our{' '}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="underline hover:text-slate-900 font-medium"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => setShowPrivacy(true)}
                className="underline hover:text-slate-900 font-medium"
              >
                Privacy Policy
              </button>
              .
            </p>
          </motion.div>
        </div>
      </div>

      {/* Legal Modals */}
      <LegalModal isOpen={showTerms} onClose={() => setShowTerms(false)} title="Terms of Service">
        <TermsOfService />
      </LegalModal>

      <LegalModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} title="Privacy Policy">
        <PrivacyPolicy />
      </LegalModal>
    </div>
  );
}
