'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { authApi } from '@/src/lib/services/authApi';
import { formatAuthError } from '@/src/lib/utils/errorMessages';

export default function OrganizationApprovalPage() {
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const exchange = async () => {
      const uid = params.uid as string;
      const token = params.token as string;

      if (!uid || !token) {
        setStatus('error');
        setError('Invalid approval link.');
        return;
      }

      try {
        const tokens = await authApi.organizationApprovalExchange({ uid, token });
        if (tokens?.access) {
          setStatus('success');
          setTimeout(() => {
            router.push('/login?activated=true');
          }, 2500);
        } else {
          setStatus('error');
          setError('Approval completed but unable to authenticate. Please try logging in.');
        }
      } catch (err: unknown) {
        setStatus('error');
        setError(formatAuthError(err));
      }
    };

    exchange();
  }, [params.uid, params.token, router]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary to-[#283593] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1523050854058-8df90110c8f1?w=1200&h=1200&fit=crop&q=80"
            alt="School collaboration"
            fill
            priority
            sizes="50vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/60 to-transparent" />
        </div>
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Organization Approved</h2>
          <p className="max-w-md text-base text-blue-200 md:text-lg">
            Your school organization has been approved. Access your dashboard to manage
            teachers, students, and parent communication.
          </p>
          <div className="mt-8 flex items-center gap-2 text-sm text-blue-300/60">
            <span>Photo by</span>
            <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">
              Unsplash
            </a>
          </div>
        </div>
      </div>

      {/* Right Side - Status Card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Logo */}
            <div className="mb-8">
              <Link href="/landing" className="inline-flex items-center gap-2">
                <span className="text-2xl font-display font-bold text-primary-navy">Kelem</span>
              </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              {/* Loading State */}
              {status === 'loading' && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-primary-navy/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Loader2 className="w-10 h-10 text-primary-navy animate-spin" />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-3">
                    Activating Your Organization
                  </h1>
                  <p className="text-slate-600">
                    Verifying your approval link...
                  </p>
                </div>
              )}

              {/* Success State */}
              {status === 'success' && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                  </motion.div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-3">
                    Organization Activated!
                  </h1>
                  <p className="text-slate-600 mb-6">
                    Your organization has been approved and activated successfully.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirecting to login...
                  </div>
                </div>
              )}

              {/* Error State */}
              {status === 'error' && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-red-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-3">
                    Activation Failed
                  </h1>
                  <p className="text-slate-600 mb-8">
                    {error || 'Unable to activate your organization. The link may have expired or already been used.'}
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-primary-navy text-white font-semibold hover:opacity-90 transition"
                  >
                    Go to Login
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            <p className="mt-6 text-center text-xs text-slate-500">
              Need help? Contact your school administrator.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
