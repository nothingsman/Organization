"use client";

import { useEffect, useState, useRef } from "react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

const collaborators = [
  {
    name: "Nahom Teshome",
    github: "NahomTesM",
    role: "Product & Design",
  },
  {
    name: "Nahom Tensaebirhan",
    github: "oddegen",
    role: "Backend Development",
  },
  {
    name: "Natnael Fisseha",
    github: "fitiha",
    role: "Frontend Development",
  },
  {
    name: "Robel Daba",
    github: "RobelD420",
    role: "DevOps & Infrastructure",
  },
  {
    name: "Robel Sisay",
    github: "Tonetor777",
    role: "QA & Testing",
  },
];

export function CollaboratorsSection() {
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
    <section ref={sectionRef} className="relative py-24 lg:py-32 bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden border-t border-slate-200">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-slate-600 mb-6 justify-center">
            <span className="w-12 h-px bg-slate-400" />
            Built by 5 African developers
            <span className="w-12 h-px bg-slate-400" />
          </span>
          <h2 className={`text-5xl md:text-6xl lg:text-7xl font-display text-slate-900 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            The team behind
            <br />
            <span className="text-blue-600">Kelem</span>
          </h2>
        </div>

        {/* Collaborators Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {collaborators.map((collab, index) => (
            <a
              key={collab.github}
              href={`https://github.com/${collab.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`group p-6 border border-slate-200 bg-white rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-500 cursor-pointer ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-display text-lg mb-4">
                  {collab.name.charAt(0)}
                </div>
                <h3 className="text-lg font-display text-slate-900 group-hover:text-blue-600 transition-colors">
                  {collab.name}
                </h3>
                <p className="text-sm text-slate-600 mt-1">{collab.role}</p>
              </div>
              
              <div className="flex items-center gap-2 text-blue-600 group-hover:translate-x-1 transition-transform">
                <GithubIcon className="w-4 h-4" />
                <span className="text-xs font-mono">{collab.github}</span>
              </div>
            </a>
          ))}
        </div>

        {/* Call to action */}
        <div className={`mt-16 p-8 border border-slate-200 bg-white rounded-xl transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <p className="text-center text-slate-700">
            Kelem is built by a team of African developers passionate about improving education technology across the continent.
          </p>
        </div>
      </div>
    </section>
  );
}
