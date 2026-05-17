import React, { useState } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { CreditCard, CheckCircle2, AlertCircle, FileText, Download, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Billing() {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('Enterprise');

  const handleUpgrade = (planName: string) => {
    setSelectedPlan(planName);
    setIsUpgradeModalOpen(false);
    console.log(`Plan upgraded to: ${planName}`);
  };

  const invoices = [
    { id: 'INV-2024-001', date: 'May 01, 2024', amount: '$1,200.00', status: 'paid' },
    { id: 'INV-2024-002', date: 'Apr 01, 2024', amount: '$1,200.00', status: 'paid' },
    { id: 'INV-2024-003', date: 'Mar 01, 2024', amount: '$1,200.00', status: 'paid' },
  ];

  return (
    <Layout title="Billing & Subscription">
      <div className="p-4 lg:p-8 max-w-5xl space-y-6 lg:space-y-8">
        {/* Active Plan */}
        <div className="bg-primary-navy rounded-xl p-6 lg:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-xl relative overflow-hidden group gap-6">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
            <CreditCard className="w-48 lg:w-64 h-48 lg:h-64" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-white/10 px-2 py-1 rounded">{selectedPlan} Plan</span>
              {selectedPlan === 'Enterprise' && <Shield className="w-3 h-3 text-emerald-400" />}
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold">Institutional Capacity</h2>
            <p className="mt-1 lg:mt-2 text-white/60 text-xs lg:text-sm font-medium">Billed monthly • Next renewal: June 01, 2024</p>
          </div>
          <div className="relative z-10 flex flex-col items-start sm:items-end w-full sm:w-auto">
            <span className="text-3xl lg:text-4xl font-bold">
              {selectedPlan === 'Enterprise' ? 'Custom' : selectedPlan === 'Professional' ? '$499' : '$1,299'}
              <span className="text-lg opacity-40">/mo</span>
            </span>
            <button 
              onClick={() => setIsUpgradeModalOpen(true)}
              className="mt-4 w-full sm:w-auto bg-white text-primary-navy px-6 py-2.5 rounded-lg font-bold text-xs lg:text-sm uppercase tracking-wide hover:bg-white/90 transition-colors shadow-lg active:scale-95"
            >
              Upgrade Plan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Payment Method */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 lg:p-8 shadow-sm">
            <h3 className="text-xs lg:text-sm font-bold uppercase tracking-widest text-primary-navy mb-6">Payment Method</h3>
            <div className="flex items-center gap-4 p-4 border border-outline-variant rounded-lg bg-surface">
              <div className="w-10 lg:w-12 h-6 lg:h-8 bg-black rounded-md flex items-center justify-center text-white font-bold text-[8px] lg:text-[10px] shrink-0">VISA</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">•••• •••• •••• 4242</p>
                <p className="text-xs text-primary-navy/40 font-medium">Expires 12/26</p>
              </div>
              <button className="text-xs font-bold text-primary-navy hover:underline shrink-0">Edit</button>
            </div>
            <p className="mt-4 text-xs text-primary-navy/40 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Automatic billing is enabled.
            </p>
          </div>

          {/* Quick Summary */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 lg:p-8 shadow-sm">
            <h3 className="text-xs lg:text-sm font-bold uppercase tracking-widest text-primary-navy mb-6">Billing Contact</h3>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="text-[10px] text-primary-navy/40 font-medium uppercase tracking-wider">Email</span>
                <span className="text-xs font-bold truncate">finance@acmeacademy.com</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="text-[10px] text-primary-navy/40 font-medium uppercase tracking-wider">Tax ID</span>
                <span className="text-xs font-bold">VAT GB-123456789</span>
              </div>
              <div className="pt-4 border-t border-outline-variant">
                <button className="text-xs font-bold text-primary-navy flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <FileText className="w-4 h-4" />
                  Update Tax Information
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice History */}
        <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 lg:px-8 py-4 lg:py-6 border-b border-outline-variant">
            <h3 className="text-xs lg:text-sm font-bold uppercase tracking-widest text-primary-navy">Invoice History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="bg-surface border-b border-outline-variant">
                  <th className="px-6 lg:px-8 py-4 text-[10px] font-bold text-primary-navy/40 uppercase tracking-widest">Invoice Date</th>
                  <th className="px-6 lg:px-8 py-4 text-[10px] font-bold text-primary-navy/40 uppercase tracking-widest">Amount</th>
                  <th className="px-6 lg:px-8 py-4 text-[10px] font-bold text-primary-navy/40 uppercase tracking-widest">Status</th>
                  <th className="px-6 lg:px-8 py-4 text-[10px] font-bold text-primary-navy/40 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-surface transition-colors">
                    <td className="px-6 lg:px-8 py-4">
                      <p className="text-sm font-bold">{inv.id}</p>
                      <p className="text-xs text-primary-navy/40 font-medium">{inv.date}</p>
                    </td>
                    <td className="px-6 lg:px-8 py-4 text-sm font-bold">{inv.amount}</td>
                    <td className="px-6 lg:px-8 py-4">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded">
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 lg:px-8 py-4 text-right">
                      <button className="p-2 text-primary-navy/40 hover:text-primary-navy transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        title="Select Institutional Tier"
      >
        <div className="grid grid-cols-1 gap-4">
          {[
            {
              name: 'Professional',
              price: '$499/mo',
              features: ['Up to 5 Branches', 'Basic Reporting', 'Standard Support', '50 Staff Accounts'],
              color: 'bg-surface-container'
            },
            {
              name: 'Academic Elite',
              price: '$1,299/mo',
              features: ['Up to 20 Branches', 'Advanced Analytics', 'Priority Support', '200 Staff Accounts'],
              color: 'bg-primary-navy/5 border-primary-navy/20',
              recommended: true
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              features: ['Unlimited Branches', 'Full Data Control', 'Dedicated Manager', 'API Access'],
              color: 'bg-white border-outline-variant'
            }
          ].map((plan) => (
            <div 
              key={plan.name}
              className={cn(
                "p-4 lg:p-6 rounded-2xl border transition-all hover:shadow-md cursor-pointer group relative",
                plan.color,
                selectedPlan === plan.name ? "ring-2 ring-primary-navy border-transparent" : "border-transparent"
              )}
              onClick={() => handleUpgrade(plan.name)}
            >
              {plan.recommended && (
                <span className="absolute -top-2 left-6 bg-emerald-600 text-white text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded">Most Popular</span>
              )}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-bold text-primary-navy uppercase tracking-widest">{plan.name}</h3>
                  <p className="text-xl font-bold mt-1 text-primary-navy">{plan.price}</p>
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                  selectedPlan === plan.name ? "bg-primary-navy border-primary-navy" : "border-outline-variant"
                )}>
                  {selectedPlan === plan.name && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
              </div>
              <div className="space-y-2">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary-navy/40 rounded-full" />
                    <span className="text-xs font-medium text-primary-navy/60 leading-tight">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <p className="text-[10px] font-medium text-primary-navy/40 text-center mt-4 px-4 leading-relaxed">
            All plans include security updates and basic maintenance as standard.
          </p>
        </div>
      </Modal>
    </Layout>
  );
}
