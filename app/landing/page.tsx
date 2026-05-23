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
  Star,
  Heart,
  TrendingUp,
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { hydrated, isAuthenticated, onboardingComplete } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users with verified organizations to dashboard
    if (hydrated && isAuthenticated && onboardingComplete) {
      router.replace('/');
    }
  }, [hydrated, isAuthenticated, onboardingComplete, router]);

  // Don't render landing page if user should be redirected
  if (!hydrated || (isAuthenticated && onboardingComplete)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-navy rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-primary-navy">Kelem.co</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-primary-navy transition">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-primary-navy transition">
                Pricing
              </a>
              <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-primary-navy transition">
                Testimonials
              </a>
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary-navy transition">
                Login
              </Link>
              <Link href="/onboarding" className="btn-primary text-sm">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-gray-100 bg-white"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-sm font-medium text-gray-600 hover:text-primary-navy">
                Features
              </a>
              <a href="#pricing" className="block text-sm font-medium text-gray-600 hover:text-primary-navy">
                Pricing
              </a>
              <a href="#testimonials" className="block text-sm font-medium text-gray-600 hover:text-primary-navy">
                Testimonials
              </a>
              <Link href="/login" className="block text-sm font-medium text-gray-600 hover:text-primary-navy">
                Login
              </Link>
              <Link href="/onboarding" className="btn-primary w-full text-center text-sm">
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-navy/5 via-blue-50/30 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-100 text-primary-navy px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Zap className="w-4 h-4" />
                Trusted by 500+ Schools Worldwide
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-primary-navy mb-6 leading-tight">
                Bridge the Gap Between
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-primary-navy">
                  {' '}Schools & Parents
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed md:text-xl">
                Kelem.co is the all-in-one parent-school engagement platform that transforms communication,
                streamlines operations, and builds stronger educational communities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/onboarding" className="btn-primary group text-base md:text-lg">
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                </Link>
                <a
                  href="#features"
                  className="px-8 py-4 rounded-xl border-2 border-primary-navy text-primary-navy font-bold hover:bg-primary-navy hover:text-white transition text-center"
                >
                  Explore Features
                </a>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Guided onboarding
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Setup in 5 minutes
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop"
                  alt="Parents and teachers collaborating"
                  width={800}
                  height={600}
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="h-auto w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-navy/20 to-transparent" />
              </div>
              {/* Floating Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary-navy">98%</div>
                    <div className="text-sm text-gray-600">Parent Satisfaction</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '500+', label: 'Schools' },
              { number: '50K+', label: 'Active Parents' },
              { number: '1M+', label: 'Messages Sent' },
              { number: '99.9%', label: 'Uptime' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-black text-white mb-2">{stat.number}</div>
                <div className="text-blue-200 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-primary-navy mb-4">
                Everything You Need to Engage Parents
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto md:text-xl">
                Powerful features designed to strengthen the connection between schools and families
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MessageSquare,
                title: 'Real-Time Messaging',
                description: 'Instant communication between teachers and parents with read receipts and notifications',
                color: 'bg-blue-100 text-blue-600',
              },
              {
                icon: Calendar,
                title: 'Event Management',
                description: 'Schedule and manage school events, parent-teacher meetings, and important dates',
                color: 'bg-purple-100 text-purple-600',
              },
              {
                icon: BarChart3,
                title: 'Performance Analytics',
                description: 'Track student progress and share detailed reports with parents in real-time',
                color: 'bg-green-100 text-green-600',
              },
              {
                icon: Bell,
                title: 'Smart Notifications',
                description: 'Automated alerts for attendance, grades, assignments, and school announcements',
                color: 'bg-orange-100 text-orange-600',
              },
              {
                icon: Users,
                title: 'Parent Portal',
                description: 'Dedicated portal for parents to access all information about their children',
                color: 'bg-pink-100 text-pink-600',
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Bank-level encryption and GDPR compliance to protect sensitive student data',
                color: 'bg-red-100 text-red-600',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-elevated group hover:shadow-2xl transition-all duration-300"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-primary-navy mb-3 md:text-xl">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-primary-navy mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-lg text-gray-600 md:text-xl">From signup to full engagement in minutes</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create Your Account',
                description: 'Sign up with your school details and customize your profile',
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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-8xl font-black text-primary-navy/5 absolute -top-8 -left-4">
                  {step.step}
                </div>
                <div className="relative bg-white rounded-3xl p-8 shadow-lg">
                  <div className="w-16 h-16 bg-primary-navy rounded-2xl flex items-center justify-center mb-6">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-primary-navy mb-3 md:text-2xl">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-primary-navy mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 md:text-xl">Choose the plan that fits your school&apos;s needs</p>
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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative rounded-3xl p-8 ${
                  plan.popular
                    ? 'bg-primary-navy text-white shadow-2xl scale-105'
                    : 'bg-white border-2 border-gray-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className={`text-xl font-bold mb-2 md:text-2xl ${plan.popular ? 'text-white' : 'text-primary-navy'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-4 ${plan.popular ? 'text-blue-200' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>
                  <div className="flex items-end justify-center gap-1">
                    <span className={`text-4xl font-black md:text-5xl ${plan.popular ? 'text-white' : 'text-primary-navy'}`}>
                      {plan.price}
                    </span>
                    <span className={`mb-2 text-base md:text-lg ${plan.popular ? 'text-blue-200' : 'text-gray-600'}`}>
                      {plan.period}
                    </span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          plan.popular ? 'text-blue-300' : 'text-green-600'
                        }`}
                      />
                      <span className={plan.popular ? 'text-blue-100' : 'text-gray-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/onboarding"
                  className={`block text-center py-4 rounded-xl font-bold transition ${
                    plan.popular
                      ? 'bg-white text-primary-navy hover:bg-blue-50'
                      : 'bg-primary-navy text-white hover:bg-primary-navy/90'
                  }`}
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-navy to-blue-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black mb-4 md:text-4xl">Loved by Schools Worldwide</h2>
            <p className="text-lg text-blue-200 md:text-xl">See what educators and parents are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Principal, Greenwood Academy',
                content:
                  'Kelem.co has transformed how we communicate with parents. The engagement rate has increased by 300% since we started using it.',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
              },
              {
                name: 'Michael Chen',
                role: 'Parent, Lincoln Elementary',
                content:
                  "As a busy parent, I love being able to stay connected with my child's education. The app is intuitive and keeps me informed in real-time.",
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
              },
              {
                name: 'Emily Rodriguez',
                role: 'Teacher, Riverside High',
                content:
                  'The analytics features help me track student progress and share meaningful insights with parents. It has made my job so much easier.',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-sm rounded-3xl p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-blue-100 mb-6 leading-relaxed">{testimonial.content}</p>
                <div className="flex items-center gap-4">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    sizes="48px"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-sm text-blue-300">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-primary-navy mb-6">
              Ready to Transform Your School Communication?
            </h2>
            <p className="text-lg text-gray-600 mb-8 md:text-xl">
              Join hundreds of schools already using Kelem.co to build stronger parent-school relationships
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/onboarding" className="btn-primary group text-base md:text-lg">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <a
                href="#pricing"
                className="px-10 py-5 rounded-xl border-2 border-primary-navy text-primary-navy font-bold hover:bg-primary-navy hover:text-white transition text-center"
              >
                View Pricing
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-6">Flexible plans • Cancel anytime</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-navy text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary-navy" />
                </div>
                <span className="text-xl font-black">Kelem.co</span>
              </div>
              <p className="text-blue-200 text-sm">
                Empowering schools and parents to build stronger educational communities together.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
                <li><a href="#" className="hover:text-white transition">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-blue-200">
            <p>&copy; 2026 Kelem.co. All rights reserved. Built with ❤️ for educators and parents.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
