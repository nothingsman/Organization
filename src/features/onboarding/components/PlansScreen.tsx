
import { Check, ShieldCheck, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { SubscriptionPlan } from '../types';

interface PlansScreenProps {
  onComplete: () => void;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'BASIC',
    name: 'Basic Institutional',
    priceETB: 50000,
    features: [
      'Up to 500 Students',
      'Basic SMS Notifications',
      'Attendance Tracking',
      'Digital Report Cards',
      'Email Support'
    ]
  },
  {
    id: 'PRO',
    name: 'Educational Pro',
    priceETB: 120000,
    features: [
      'Up to 2,000 Students',
      'Advanced SMS Module',
      'LMS Integration',
      'Exam Management',
      'Parent Mobile App',
      'Priority Phone Support'
    ],
    isPopular: true
  },
  {
    id: 'UNLIMITED',
    name: 'Unlimited Enterprise',
    priceETB: 250000,
    features: [
      'Unlimited Students',
      'Full ERP Suite',
      'Multi-Campus Support',
      'Custom API Access',
      'Dedicated Account Manager',
      'On-site Training'
    ]
  }
];

export default function PlansScreen({ onComplete }: PlansScreenProps) {
  return (
    <div className="w-full max-w-5xl">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-primary-navy mb-3">Subscription Plans</h2>
        <p className="text-text-muted">Choose the plan that fits your institution's size and requirements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`card-elevated flex flex-col relative ${plan.isPopular ? 'border-primary-navy ring-1 ring-primary-navy' : ''}`}
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-navy text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-primary-navy">{plan.priceETB.toLocaleString()}</span>
                <span className="text-text-muted font-medium">ETB / year</span>
              </div>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-start gap-3 text-sm text-text-main">
                  <div className="pt-0.5">
                    <Check className="w-4 h-4 text-green-600 font-bold" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              onClick={onComplete}
              className={`w-full ${plan.isPopular ? 'btn-primary' : 'btn-secondary'}`}
            >
              {plan.isPopular ? (
                <>
                  Get Started Now
                  <Check className="w-5 h-5" />
                </>
              ) : (
                'Select Plan'
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Secure Payment Options */}
      <div className="bg-white rounded-[--radius-school] p-8 border border-gray-100 shadow-sm max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          <h4 className="font-semibold text-primary-navy">Secure Local Payment Options</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-6 items-center">
          {/* Telebirr Representation */}
          <div className="flex flex-col items-center gap-2 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
            <div className="h-10 px-4 bg-[#E8F5E9] border border-[#A5D6A7] rounded flex items-center justify-center">
              <span className="text-[#2E7D32] font-black italic tracking-tighter">tele<span className="text-[#00BCD4]">birr</span></span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Instant Payment</span>
          </div>

          {/* CBE Birr Representation */}
          <div className="flex flex-col items-center gap-2 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
            <div className="h-10 px-4 bg-[#FFF3E0] border border-[#FFCC80] rounded flex items-center justify-center">
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-[#6D4C41] rounded-full flex items-center justify-center text-[8px] text-white font-bold">CBE</div>
                <span className="text-[#6D4C41] font-bold text-sm tracking-tight">CBE Birr</span>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Interbank Wire</span>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-text-muted">
          <CreditCard className="w-3 h-3" />
          <span>Payment processing secure and PCI compliant</span>
        </div>
      </div>
    </div>
  );
}
