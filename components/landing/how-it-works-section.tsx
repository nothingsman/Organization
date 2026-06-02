"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "01",
    title: "Organization",
    subtitle: "Sign up & setup",
    description: "School administrators create their account, select a subscription plan, and configure branch settings. Multi-branch schools can manage all locations from one dashboard.",
    code: `Organization Setup:
✓ Create school account
✓ Select pricing plan
✓ Configure branches
✓ Invite branch admins`,
  },
  {
    number: "02",
    title: "Teachers",
    subtitle: "Track & engage",
    description: "Teachers add students, record attendance, input grades, assign homework, and communicate with parents directly. Real-time updates keep everyone informed.",
    code: `Teacher Actions:
✓ Manage attendance
✓ Post grades & feedback
✓ Assign homework
✓ Message parents
✓ View analytics`,
  },
  {
    number: "03",
    title: "Parents",
    subtitle: "Stay connected",
    description: "Parents access their child's complete academic profile, receive instant notifications, and communicate with teachers. Full visibility without the meetings.",
    code: `Parent Dashboard:
✓ View child's profile
✓ Check attendance
✓ See grades & feedback
✓ Track homework
✓ Message teachers`,
  },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900 overflow-hidden"
    >
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-500/[0.05] blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header — titre + image cerisier */}
        <div className="relative mb-0 lg:mb-0 grid lg:grid-cols-2 gap-4 lg:gap-12 items-end">
          {/* Titre colonne gauche */}
          <div className="overflow-hidden pb-0 lg:pb-32">
            <div className={`transition-all duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"}`}>
              <span className="inline-flex items-center gap-3 text-sm font-mono text-slate-600 mb-8">
                <span className="w-12 h-px bg-slate-400" />
                Process
              </span>
            </div>
            
            <h2 className={`text-4xl md:text-6xl lg:text-[128px] font-display tracking-tight leading-[0.85] transition-all duration-1000 delay-100 text-slate-900 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
            }`}>
              <span className="block">Setup.</span>
              <span className="block text-slate-600">Teach.</span>
              <span className="block text-blue-600">Connect.</span>
            </h2>
          </div>

            {/* Image cerisier — se colle en bas sur les blocs */}
          <div className={`relative h-[320px] lg:h-[640px] overflow-hidden transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}>
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tree-uAia6REvB137CQyHFCf0za3O6h2zKO.png"
              alt=""
              aria-hidden="true"
              className="absolute bottom-0 left-0 w-full h-full object-contain object-bottom"
            />
            {/* Fade sur le bord gauche */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Horizontal Steps Layout */}
        <div className="grid lg:grid-cols-3 gap-4">
          {steps.map((step, index) => (
            <button
              key={step.number}
              type="button"
              onClick={() => setActiveStep(index)}
              className={`relative text-left p-8 lg:p-12 border transition-all duration-500 rounded-xl ${
                activeStep === index 
                  ? "bg-white border-blue-300 shadow-md" 
                  : "bg-white/50 border-slate-300 hover:border-slate-400"
              }`}
            >
              {/* Step number with animated line */}
              <div className="flex items-center gap-4 mb-8">
                <span className={`text-4xl font-display transition-colors duration-300 ${
                  activeStep === index ? "text-blue-700" : "text-slate-400"
                }`}>
                  {step.number}
                </span>
                <div className="flex-1 h-px bg-slate-200 overflow-hidden">
                  {activeStep === index && (
                    <div className="h-full bg-blue-600 animate-progress" />
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-3xl lg:text-4xl font-display mb-2 text-slate-900">
                {step.title}
              </h3>
              <span className="text-xl text-emerald-600 font-display block mb-6">
                {step.subtitle}
              </span>

              {/* Description */}
              <p className={`text-slate-700 leading-relaxed transition-opacity duration-300 ${
                activeStep === index ? "opacity-100" : "opacity-70"
              }`}>
                {step.description}
              </p>

              {/* Active indicator */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-blue-600 transition-transform duration-500 origin-left rounded-b-xl ${
                activeStep === index ? "scale-x-100" : "scale-x-0"
              }`} />
            </button>
          ))}
        </div>

        {/* Code Preview - Large terminal */}
        
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 6s linear forwards;
        }
      `}</style>
    </section>
  );
}
