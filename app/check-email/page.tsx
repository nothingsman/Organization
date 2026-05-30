'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ArrowRight, Building2 } from 'lucide-react';
import { motion } from 'motion/react';
import { authApi } from '@/lib/services/authApi';
import { formatAuthError } from '@/lib/utils/errorMessages';

function CheckEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) {
      router.push('/onboarding');
    }
  }, [email, router]);

  const handleResend = async () => {
    if (!email) return;
    
    setResending(true);
    setError(null);
    setResent(false);

    try {
      await authApi.resendActivation(email);
      setResent(true);
    } catch (err: unknown) {
      setError(formatAuthError(err));
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-grey p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="inline-block p-5 bg-primary-navy/5 rounded-[--radius-school] mb-6">
            <Building2 className="w-10 h-10 text-primary-navy" />
          </div>
          <h1 className="text-3xl font-black text-primary-navy mb-3 tracking-tight sm:text-4xl">
            Check Your Email
          </h1>
          <p className="text-xs text-primary-navy/40 font-bold uppercase tracking-[0.3em] mb-4">
            Institutional Portal
          </p>
        </div>

        <motion.div
          className="card-elevated"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-primary-navy/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-primary-navy" />
            </div>

            <h2 className="text-2xl font-bold text-text-main mb-4">
              Verify Your Email Address
            </h2>

            <p className="text-text-muted mb-2">
              We&apos;ve sent an activation link to:
            </p>
            <p className="text-primary-navy font-semibold mb-6">
              {email}
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 text-left">
              <p className="text-sm text-blue-900 mb-2">
                <strong>Next steps:</strong>
              </p>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Check your email inbox</li>
                <li>Click the activation link in the email</li>
                <li>Return here to login</li>
              </ol>
            </div>

            {resent && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
                <p className="text-sm text-green-800">
                  ✓ Activation email resent successfully!
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="btn-primary w-full group"
              >
                Go to Login
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={handleResend}
                disabled={resending}
                className="btn-secondary w-full"
              >
                {resending ? (
                  <div className="w-5 h-5 border-2 border-primary-navy/30 border-t-primary-navy rounded-full animate-spin" />
                ) : (
                  'Resend Activation Email'
                )}
              </button>
            </div>

            <p className="text-xs text-text-muted mt-6">
              Didn&apos;t receive the email? Check your spam folder or click resend.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={null}>
      <CheckEmailContent />
    </Suspense>
  );
}
