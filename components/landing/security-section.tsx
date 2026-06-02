"use client";

import { useEffect, useState, useRef } from "react";
import { Shield, Lock, Eye, FileCheck } from "lucide-react";

const securityFeatures = [
  {
    icon: Shield,
    title: "Data privacy",
    description: "Student and parent data protected with enterprise encryption.",
  },
  {
    icon: Lock,
    title: "Secure communication",
    description: "All messages encrypted end-to-end between parents and teachers.",
  },
  {
    icon: Eye,
    title: "Compliance",
    description: "Meeting international data protection and education standards.",
  },
  {
    icon: FileCheck,
    title: "Access control",
    description: "Role-based permissions ensure users see only what they should.",
  },
];

export function SecuritySection() {
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
    <section id="security" ref={sectionRef} className="relative py-16 lg:py-40 bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-10 lg:mb-20">
          <span className={`inline-flex items-center gap-4 text-sm font-mono text-slate-600 mb-8 transition-all duration-700 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}>
            <span className="w-12 h-px bg-slate-400" />
            Security & Privacy
          </span>
          
          {/* Title — full width */}
          <h2 className={`text-4xl md:text-6xl lg:text-[128px] font-display tracking-tight leading-[0.9] mb-12 text-slate-900 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            Your data
            <br />
            <span className="text-blue-600">always protected.</span>
          </h2>
          
          {/* Description — below title */}
          <div className={`transition-all duration-1000 delay-100 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}>
            <p className="text-xl text-slate-700 leading-relaxed max-w-2xl">
              Student and parent information is protected with enterprise-grade encryption and compliance frameworks.
            </p>
          </div>
        </div>

        {/* Main content - Feature grid */}
        <div className="grid lg:grid-cols-2 gap-6">
            {securityFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`p-8 border border-slate-200 bg-white rounded-xl transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-blue-600 text-white">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-slate-900">{feature.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
