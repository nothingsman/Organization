
import { Clock, CheckCircle2, ChevronRight, FileText, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface StatusScreenProps {
  onProceed?: () => void;
}

export default function StatusScreen({ onProceed }: StatusScreenProps) {
  const referenceId = `EDU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  return (
    <div className="w-full max-w-2xl px-4">
      <motion.div 
        className="card-elevated text-center py-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <div className="flex justify-center mb-6">
          <div className="relative">
            <motion.div 
              className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-primary-navy"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Clock className="w-10 h-10" />
            </motion.div>
            <motion.div 
              className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-4 border-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <CheckCircle2 className="w-5 h-5 text-white" />
            </motion.div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-primary-navy mb-4">Verification Under Review</h2>
        <p className="text-sm text-primary-navy/60 font-semibold mb-2">ማረጋገጫ በሂደት ላይ ነው</p>
        <p className="text-text-muted mb-8 max-w-md mx-auto">
          Your institutional application has been successfully submitted and is now being processed by our verification team.
        </p>

        <div className="bg-bg-grey rounded-[--radius-school] p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-4 border border-zinc-100 shadow-inner">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm">
              <FileText className="w-6 h-6 text-primary-navy" />
            </div>
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-1">Reference ID</p>
              <p className="font-mono text-lg text-primary-navy font-black">{referenceId}</p>
            </div>
          </div>
          <button className="text-sm font-bold text-primary-navy bg-white/50 border border-primary-navy/20 hover:bg-white hover:border-primary-navy/40 px-6 py-2.5 rounded-full transition-all shadow-sm">
            Download Copy
          </button>
        </div>

        <div className="space-y-8 text-left border-t border-gray-100 pt-10">
          <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
            What happens next?
            <span className="text-sm font-medium text-text-muted">(Estimated 48h)</span>
          </h3>
          <div className="space-y-6">
            <div className="flex gap-5 font-sans">
              <div className="w-10 h-10 bg-primary-navy/10 text-primary-navy text-xs font-black rounded-2xl flex items-center justify-center shrink-0 mt-1">1</div>
              <div>
                <p className="text-base font-bold text-primary-navy">Review & Billing</p>
                <p className="text-sm text-text-muted leading-relaxed">Review your submission details and proceed to select a subscription plan.</p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="w-10 h-10 bg-gray-100 text-text-muted text-xs font-black rounded-2xl flex items-center justify-center shrink-0 mt-1">2</div>
              <div>
                <p className="text-base font-bold text-gray-500">Official Verification</p>
                <p className="text-sm text-text-muted leading-relaxed">Once you choose a plan, our team will verify your license documents (Estimated 24-48h).</p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="w-10 h-10 bg-gray-100 text-text-muted text-xs font-black rounded-2xl flex items-center justify-center shrink-0 mt-1">3</div>
              <div>
                <p className="text-base font-bold text-gray-500">System Activation</p>
                <p className="text-sm text-text-muted leading-relaxed">Login to your new institutional portal and begin your digital transformation.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col md:flex-row gap-6 items-center justify-center">
          <button 
            onClick={onProceed}
            className="btn-primary w-full md:w-auto px-10 group"
          >
            Proceed to Billing
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
          <button className="btn-secondary w-full md:w-auto px-10 group">
            <HelpCircle className="w-5 h-5" />
            Contact Support
          </button>
        </div>
      </motion.div>

      <p className="text-center mt-8 text-xs text-text-muted">
        System Auto-Generated Receipt. No signature required.
      </p>
    </div>
  );
}
