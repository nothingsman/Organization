'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { Mail, Lock, LogIn, Building2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { directLogin, hydrated, isAuthenticated, onboardingComplete } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && isAuthenticated && onboardingComplete) {
      router.replace('/');
    }
  }, [hydrated, isAuthenticated, onboardingComplete, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    try {
      await directLogin(email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-grey p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="inline-block p-5 bg-primary-navy/5 rounded-[--radius-school] mb-6">
            <Building2 className="w-10 h-10 text-primary-navy" />
          </div>
          <h1 className="text-4xl font-black text-primary-navy mb-3 tracking-tight">School Administration</h1>
          <p className="text-xs text-primary-navy/40 font-bold uppercase tracking-[0.3em] mb-4">Institutional Portal</p>
          <p className="text-text-muted text-lg">Enter your credentials to login to the dashboard.</p>
        </div>

        <motion.div 
          className="card-elevated"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-main flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-navy" />
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="admin@school.edu"
                className="input-field"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-main flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary-navy" />
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Login to Dashboard
                  <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/onboarding"
              className="text-sm text-primary-navy font-medium hover:underline"
            >
              Don't have an account? Sign up
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-text-muted">
              Secure Institutional Portal. Encrypted with high-grade security protocols.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
