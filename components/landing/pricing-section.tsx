"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Check, Zap } from "lucide-react";

const plans = [
  {
    name: "Starter",
    description: "For single branch schools",
    price: { monthly: 2500, annual: 2500 },
    currency: "ETB",
    features: [
      "1 school branch",
      "Up to 500 students",
      "Teacher dashboards",
      "Parent app access",
      "Attendance tracking",
      "Grades & feedback",
      "Email support",
      "Basic analytics",
    ],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Growth",
    description: "For growing school networks",
    price: { monthly: 5000, annual: 5000 },
    currency: "ETB",
    features: [
      "2 school branches",
      "Up to 1,500 students",
      "All Starter features",
      "Multi-branch dashboard",
      "Branch admin controls",
      "Homework management",
      "Messaging system",
      "Priority support",
      "Advanced analytics",
    ],
    cta: "Get started",
    highlight: true,
  },
  {
    name: "Professional",
    description: "For established school groups",
    price: { monthly: 8750, annual: 8750 },
    currency: "ETB",
    features: [
      "5 school branches",
      "Up to 5,000 students",
      "All Growth features",
      "Exam & quiz tracking",
      "Behavioral notes",
      "Attendance reports",
      "Performance analytics",
      "Parent messaging",
      "Phone & email support",
      "Custom integrations",
    ],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Enterprise",
    description: "For large education networks",
    price: { monthly: 15000, annual: 15000 },
    currency: "ETB",
    features: [
      "Unlimited branches",
      "Unlimited students",
      "All features included",
      "Dedicated account manager",
      "24/7 premium support",
      "Custom integrations",
      "Data backup & recovery",
      "Advanced security",
      "SLA guarantee",
      "On-premise option",
    ],
    cta: "Contact sales",
    highlight: false,
  },
];

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  return (
    <section id="pricing" ref={sectionRef} className="relative py-16 lg:py-40">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header - Dramatic offset */}
        <div className="grid lg:grid-cols-12 gap-8 mb-10 lg:mb-20">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-slate-600 mb-8">
              <span className="w-12 h-px bg-slate-400" />
              Pricing
            </span>
            <h2 className={`text-4xl md:text-6xl lg:text-[128px] font-display tracking-tight leading-[0.9] transition-all duration-1000 text-slate-900 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
              Plans for every
              <br />
              <span className="text-emerald-600">school size.</span>
            </h2>
          </div>
        </div>

        {/* Pricing cards - Horizontal layout with overlap */}
        <div className="relative">
          <div className="grid lg:grid-cols-4 gap-4 lg:gap-0">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative bg-white border transition-all duration-700 rounded-xl ${
                  plan.highlight 
                    ? "border-blue-300 lg:-mx-2 lg:z-10 lg:scale-105 shadow-lg" 
                    : "border-slate-200 lg:first:-mr-2 lg:last:-ml-2"
                } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Popular badge */}
                {plan.highlight && (
                  <div className="absolute -top-4 left-8 right-8 flex justify-center">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-mono uppercase tracking-widest rounded-full">
                      <Zap className="w-3 h-3" />
                      Recommended
                    </span>
                  </div>
                )}

                <div className="p-8 lg:p-10">
                  {/* Plan header */}
                  <div className="mb-8 pb-8 border-b border-slate-200">
                    <span className="font-mono text-xs text-blue-600 font-semibold">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-2xl lg:text-3xl font-display mt-2 text-slate-900">{plan.name}</h3>
                    <p className="text-sm text-slate-600 mt-2">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    {plan.price.monthly !== null ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl lg:text-5xl font-display text-slate-900">
                          {plan.price.monthly.toLocaleString()}
                        </span>
                        <span className="text-slate-600 text-sm flex flex-col">
                          <span>{plan.currency}</span>
                          <span>/month</span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-4xl font-display text-slate-900">Custom</span>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-10">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {plan.cta === "Contact sales" ? (
                    <button
                      className="w-full py-4 flex items-center justify-center gap-2 text-sm font-semibold transition-all group rounded-lg border border-slate-300 text-slate-900 hover:border-slate-400 hover:bg-slate-50"
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  ) : (
                    <Link
                      href="/onboarding"
                      className={`w-full py-4 flex items-center justify-center gap-2 text-sm font-semibold transition-all group rounded-lg ${
                        plan.highlight
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "border border-slate-300 text-slate-900 hover:border-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note with icons */}
        <div className={`mt-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 pt-12 border-t border-slate-200 transition-all duration-1000 delay-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}>
          <div className="flex flex-wrap gap-6 text-sm text-slate-700">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              End-to-end encryption
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              Data privacy compliant
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              Always available support
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .text-stroke {
          -webkit-text-stroke: 1.5px currentColor;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </section>
  );
}
