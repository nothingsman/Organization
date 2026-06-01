'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import {
  GraduationCap,
  Users,
  MessageSquare,
  Calendar,
  BarChart3,
  Bell,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Heart,
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { hydrated, isAuthenticated, onboardingComplete } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && isAuthenticated && onboardingComplete) {
      router.replace('/');
    }
  }, [hydrated, isAuthenticated, onboardingComplete, router]);

  if (!hydrated || (isAuthenticated && onboardingComplete)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-100/40 to-purple-100/20 blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-blue-50/60 to-indigo-100/30 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-blue-100/30 to-purple-50/20 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100/80 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-navy rounded-xl flex items-center justify-center shadow-lg shadow-primary-navy/20">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-primary-navy tracking-tight">Kelem</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-semibold text-gray-500 hover:text-primary-navy transition relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-navy rounded-full transition-all group-hover:w-full" />
              </a>
              <a href="#pricing" className="text-sm font-semibold text-gray-500 hover:text-primary-navy transition relative group">
                Pricing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-navy rounded-full transition-all group-hover:w-full" />
              </a>
              <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-primary-navy transition">
                Login
              </Link>
              <Link href="/onboarding" className="btn-primary text-sm shadow-lg shadow-primary-navy/25">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl"
          >
            <div className="px-4 py-6 space-y-4">
              <a href="#features" className="block text-sm font-semibold text-gray-600 hover:text-primary-navy" onClick={() => setMobileMenuOpen(false)}>
                Features
              </a>
              <a href="#pricing" className="block text-sm font-semibold text-gray-600 hover:text-primary-navy" onClick={() => setMobileMenuOpen(false)}>
                Pricing
              </a>
              <Link href="/login" className="block text-sm font-semibold text-gray-600 hover:text-primary-navy" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link href="/onboarding" className="btn-primary w-full text-center text-sm" onClick={() => setMobileMenuOpen(false)}>
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-navy/[0.03] via-blue-50/40 to-white" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-l from-blue-200/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-100/30 to-transparent rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-primary-navy px-5 py-2.5 rounded-full text-sm font-semibold mb-8 shadow-sm border border-blue-100/50">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Parent-School Engagement Platform
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-primary-navy mb-8 leading-[1.1] tracking-tight">
                Bridge the Gap Between
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-primary-navy">
                  {' '}Schools & Parents
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-500 mb-10 leading-relaxed max-w-xl">
                The all-in-one platform that transforms school-parent communication, streamlines operations, and builds stronger educational communities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/onboarding" className="btn-primary group text-base md:text-lg px-10 py-4">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                </Link>
                <a
                  href="#features"
                  className="px-10 py-4 rounded-full border-2 border-gray-200 text-gray-700 font-bold hover:border-primary-navy hover:text-primary-navy transition text-center hover:shadow-lg hover:shadow-primary-navy/5"
                >
                  Explore Features
                </a>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-medium">Guided onboarding</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-medium">Setup in 5 minutes</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-medium">Free to start</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary-navy/10">
                <Image
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop"
                  alt="Parents and teachers collaborating"
                  width={800}
                  height={600}
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="h-auto w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-navy/30 via-transparent to-transparent" />
              </div>
              {/* Decorative dots */}
              <div className="absolute -top-6 -right-6 w-24 h-24 opacity-20">
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(16)].map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-primary-navy" />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/20 to-white" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary-navy/5 text-primary-navy px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                <GraduationCap className="w-4 h-4" />
                Platform Features
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-primary-navy mb-6 tracking-tight">
                Everything You Need to Engage Parents
              </h2>
              <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
                Powerful features designed to strengthen the connection between schools and families
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: MessageSquare,
                title: 'Real-Time Messaging',
                description: 'Instant communication between teachers and parents with read receipts and smart notifications',
                gradient: 'from-blue-500 to-blue-600',
              },
              {
                icon: Calendar,
                title: 'Event Management',
                description: 'Schedule and manage school events, parent-teacher meetings, and important dates effortlessly',
                gradient: 'from-purple-500 to-purple-600',
              },
              {
                icon: BarChart3,
                title: 'Performance Analytics',
                description: 'Track student progress and share detailed reports with parents in real-time',
                gradient: 'from-green-500 to-green-600',
              },
              {
                icon: Bell,
                title: 'Smart Notifications',
                description: 'Automated alerts for attendance, grades, assignments, and school announcements',
                gradient: 'from-orange-500 to-orange-600',
              },
              {
                icon: Users,
                title: 'Parent Portal',
                description: 'Dedicated portal for parents to access all information about their children at any time',
                gradient: 'from-pink-500 to-pink-600',
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Bank-level encryption and GDPR compliance to protect sensitive student data',
                gradient: 'from-red-500 to-red-600',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="group relative bg-white rounded-2xl p-8 md:p-10 border border-gray-100/80 hover:border-gray-200 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-navy/5 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-primary-navy mb-3 md:text-xl">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-navy to-blue-900 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm border border-white/10">
                <Zap className="w-4 h-4" />
                Simple Setup
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                Get Started in 3 Simple Steps
              </h2>
              <p className="text-lg md:text-xl text-blue-200">From signup to full engagement in minutes</p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: '01',
                title: 'Create Your Account',
                description: 'Sign up with your school details and customize your profile in minutes',
                icon: GraduationCap,
              },
              {
                step: '02',
                title: 'Invite Parents',
                description: 'Send invitations to parents via email or SMS with unique access codes',
                icon: Users,
              },
              {
                step: '03',
                title: 'Start Engaging',
                description: 'Begin communicating, sharing updates, and building stronger connections',
                icon: Heart,
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="text-8xl md:text-9xl font-black text-white/5 absolute -top-10 -left-4 select-none pointer-events-none">
                  {step.step}
                </div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-white/10 hover:bg-white/[0.15] transition-all duration-300">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-blue-200 leading-relaxed">{step.description}</p>
                </div>
                {/* Connector line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/20 to-white pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-primary-navy/5 text-primary-navy px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                <BarChart3 className="w-4 h-4" />
                Pricing
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-primary-navy mb-6 tracking-tight">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg md:text-xl text-gray-500">Choose the plan that fits your school&apos;s needs</p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '$49',
                period: '/month',
                description: 'Perfect for small schools',
                features: [
                  'Up to 100 students',
                  'Basic messaging',
                  'Event calendar',
                  'Email support',
                  'Mobile app access',
                ],
                popular: false,
              },
              {
                name: 'Professional',
                price: '$149',
                period: '/month',
                description: 'Most popular choice',
                features: [
                  'Up to 500 students',
                  'Advanced messaging',
                  'Analytics dashboard',
                  'Priority support',
                  'Custom branding',
                  'API access',
                ],
                popular: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: '',
                description: 'For large institutions',
                features: [
                  'Unlimited students',
                  'All features included',
                  'Dedicated account manager',
                  '24/7 phone support',
                  'Custom integrations',
                  'SLA guarantee',
                ],
                popular: false,
              },
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className={`relative rounded-3xl p-8 md:p-10 transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-primary-navy to-blue-800 text-white shadow-2xl shadow-primary-navy/20 scale-105 hover:scale-[1.07]'
                    : 'bg-white border-2 border-gray-100 hover:border-primary-navy/20 hover:shadow-2xl hover:shadow-primary-navy/5'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className={`text-xl font-bold mb-2 md:text-2xl ${plan.popular ? 'text-white' : 'text-primary-navy'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-4 ${plan.popular ? 'text-blue-200' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                  <div className="flex items-end justify-center gap-1">
                    <span className={`text-4xl font-black md:text-5xl tracking-tight ${plan.popular ? 'text-white' : 'text-primary-navy'}`}>
                      {plan.price}
                    </span>
                    <span className={`mb-2 text-base md:text-lg ${plan.popular ? 'text-blue-200' : 'text-gray-500'}`}>
                      {plan.period}
                    </span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          plan.popular ? 'text-blue-300' : 'text-green-500'
                        }`}
                      />
                      <span className={plan.popular ? 'text-blue-100' : 'text-gray-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/onboarding"
                  className={`block text-center py-4 rounded-xl font-bold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-white text-primary-navy hover:bg-blue-50 hover:shadow-xl'
                      : 'bg-primary-navy text-white hover:bg-primary-navy/90 hover:shadow-xl hover:shadow-primary-navy/20'
                  }`}
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-navy via-blue-900 to-primary-navy" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-8 backdrop-blur-sm border border-white/10">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Start Your Journey
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
              Ready to Transform Your School Communication?
            </h2>
            <p className="text-lg md:text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
              Join schools already using Kelem to build stronger parent-school relationships
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/onboarding" className="bg-white text-primary-navy px-10 py-4 rounded-full font-bold text-base md:text-lg hover:bg-blue-50 transition-all shadow-2xl hover:shadow-white/20 group flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <a
                href="#pricing"
                className="px-10 py-4 rounded-full border-2 border-white/20 text-white font-bold hover:bg-white/10 transition text-center"
              >
                View Pricing
              </a>
            </div>
            <p className="text-sm text-blue-300/80 mt-8">Flexible plans &bull; Cancel anytime &bull; No hidden fees</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-navy text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-primary-navy" />
                </div>
                <span className="text-xl font-black tracking-tight">Kelem</span>
              </div>
              <p className="text-blue-200 text-sm leading-relaxed">
                Empowering schools and parents to build stronger educational communities together.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-5 text-sm tracking-wider uppercase text-blue-300">Product</h4>
              <ul className="space-y-3 text-sm text-blue-200">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
                <li><a href="#" className="hover:text-white transition">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-5 text-sm tracking-wider uppercase text-blue-300">Company</h4>
              <ul className="space-y-3 text-sm text-blue-200">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-5 text-sm tracking-wider uppercase text-blue-300">Legal</h4>
              <ul className="space-y-3 text-sm text-blue-200">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-blue-300">
            <p>&copy; 2026 Kelem. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
