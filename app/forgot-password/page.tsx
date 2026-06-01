'use client';

import { useState, type FormEvent } from 'react';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { authApi } from '@/lib/services/authApi';
import { formatAuthError } from '@/lib/utils/errorMessages';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const emailValue = String(formData.get('email') ?? '').trim();
    setEmail(emailValue);

    if (!emailValue) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      await authApi.resetPassword({ email: emailValue });
      setSuccess(true);
    } catch (err: unknown) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary to-[#283593] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/60 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">Reset your password</h2>
          <p className="max-w-md text-base text-blue-200 md:text-lg">
            Enter the email associated with your account and we&apos;ll send you a
            link to reset your password.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-card">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              Back to login
            </Link>

            {!success ? (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-2">
                    Forgot password?
                  </h1>
                  <p className="text-muted-foreground">
                    No worries, we&apos;ll send you reset instructions.
                  </p>
                </div>

                {error && (
                  <div className="mb-6">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 flex items-start gap-3 shadow-sm">
                      <AlertCircle size={18} className="text-destructive mt-0.5 shrink-0" />
                      <p className="text-sm text-destructive-foreground flex-1">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-semibold text-card-foreground">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="admin@school.edu"
                        defaultValue={email}
                        disabled={loading}
                        className="w-full pl-10 pr-3 py-2.5 border border-border rounded-xl focus:outline-none focus:border-primary transition-all text-sm bg-muted focus:bg-card disabled:opacity-60 text-card-foreground"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send reset link'
                    )}
                  </button>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="flex justify-center mb-6">
                  <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="h-7 w-7 text-emerald-600" />
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-2">
                  Check Your Email
                </h1>
                <p className="text-muted-foreground mb-2">
                  We sent a password reset link to
                </p>
                <p className="text-sm font-semibold text-card-foreground mb-6">{email}</p>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Check your inbox and click the reset link.</p>
                  <p>You&apos;ll be asked to enter a new password.</p>
                  <p>Then log in with your new password.</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
