"use client";

import { useState } from "react";
import Link from "next/link";
import { LegalModal, TermsOfService, PrivacyPolicy } from "@/src/components/LegalModal";

const productLinks = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "How it works", href: "#how-it-works" },
];

const legalLinks = [
  { name: "Privacy Policy", action: "privacy" as const },
  { name: "Terms of Service", action: "terms" as const },
];

export function FooterSection() {
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="relative bg-gradient-to-b from-white to-slate-50 border-t border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="py-16 lg:py-20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
              {/* Brand Column */}
              <div className="md:col-span-2">
                <Link href="/landing" className="inline-flex items-center gap-2 mb-6">
                  <span className="text-2xl font-display text-slate-900 font-bold">Kelem</span>
                </Link>
                <p className="text-slate-700 leading-relaxed mb-8 text-sm">
                  School-parent engagement built on research. Supports communication in Amharic, making education accessible to all families.
                </p>
              </div>

              {/* Product Links */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-6">Product</h3>
                <ul className="space-y-3">
                  {productLinks.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal Links */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-6">Legal</h3>
                <ul className="space-y-3">
                  {legalLinks.map((link) => (
                    <li key={link.name}>
                      <button
                        onClick={() => setLegalModal(link.action)}
                        className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="py-8 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              &copy; {currentYear} Kelem. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <LegalModal
        isOpen={legalModal === "terms"}
        onClose={() => setLegalModal(null)}
        title="Terms of Service"
      >
        <TermsOfService />
      </LegalModal>

      <LegalModal
        isOpen={legalModal === "privacy"}
        onClose={() => setLegalModal(null)}
        title="Privacy Policy"
      >
        <PrivacyPolicy />
      </LegalModal>
    </>
  );
}
