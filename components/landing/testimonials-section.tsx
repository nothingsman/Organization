"use client";

import { useEffect, useState, useRef } from "react";
import { BookOpen } from "lucide-react";

const researchPoints = [
  {
    title: "Structured Communication Improves Learning",
    finding: "Research shows that sustained and structured parent-teacher communication improves parents' awareness of student progress and learning needs.",
    citation: "[4] Pennington et al., Education Sciences, 2024",
  },
  {
    title: "Dedicated Platforms Work Better Than Informal Tools",
    finding: "Purpose-built education systems are more effective than informal communication tools like email or WhatsApp for academic monitoring and collaboration.",
    citation: "[2][3] Aniegwu et al., 2022; Bakon et al., 2024",
  },
  {
    title: "Digital Platforms Reduce Physical Barriers",
    finding: "Digital communication platforms reduce logistical barriers such as time constraints and distance, enabling parents to stay informed without frequent physical school visits.",
    citation: "[6] Harwanto et al., 2024",
  },
  {
    title: "Usability Drives Adoption in Africa",
    finding: "Technology adoption in African contexts is shaped by digital literacy, internet access, and trust. Simple, easy-to-use platforms are critical for engagement.",
    citation: "[1] Abubakari, Journal of ATES, 2020",
  },
];

export function TestimonialsSection() {
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
    <section ref={sectionRef} className="relative py-16 lg:py-40 bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-10 lg:mb-20">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-slate-600 mb-8">
            <span className="w-12 h-px bg-slate-400" />
            Research & Evidence
          </span>
          <h2 className={`text-4xl md:text-6xl lg:text-[128px] font-display tracking-tight leading-[0.9] text-slate-900 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            Built on
            <br />
            <span className="text-blue-600">academic research.</span>
          </h2>
        </div>

        {/* Research findings grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {researchPoints.map((point, index) => (
            <div
              key={index}
              className={`p-8 lg:p-10 border border-slate-200 bg-white rounded-xl transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-display text-slate-900">{point.title}</h3>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">{point.finding}</p>
              <p className="text-sm text-blue-600 font-mono">{point.citation}</p>
            </div>
          ))}
        </div>

        {/* References note */}
        <div className={`mt-16 p-8 border-l-4 border-blue-600 bg-blue-50 rounded transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
        }`}>
          <p className="text-slate-700">
            These findings form the foundation of Kelem's design. We're building on proven research about how parent-teacher communication strengthens student outcomes across African schools.
          </p>
        </div>
      </div>
    </section>
  );
}
