"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Features",      href: "#features"      },
  { name: "How it works",  href: "#how-it-works"  },
  { name: "Pricing",       href: "#pricing"        },
  { name: "Security",      href: "#security"      },
];

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header
      className="fixed z-50 top-4 left-4 right-4 transition-all duration-500"
    >
      <nav 
        className={`mx-auto transition-all duration-500 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-full shadow-lg max-w-[1200px] ${
          isMobileMenuOpen ? "shadow-xl" : ""
        }`}
      >
        <div 
          className="flex items-center justify-between transition-all duration-500 px-6 lg:px-8 h-14"
        >
          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-2 group">
            <span className="font-display tracking-tight transition-all duration-500 font-bold text-xl text-blue-700">Kelem</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm transition-colors duration-300 relative group text-slate-600 hover:text-blue-700"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full bg-blue-700" />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition-all duration-500">
              Sign in
            </Link>
            <Link href="/onboarding">
              <Button
                className="rounded-full transition-all duration-500 font-semibold bg-blue-700 hover:bg-blue-800 text-white px-6 h-10 text-sm"
              >
                Get started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 transition-colors duration-500 ${isMobileMenuOpen ? "text-slate-900" : "text-slate-800"}`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

      </nav>
      
      {/* Mobile Menu - Full Screen Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-white z-40 transition-all duration-500 ${
          isMobileMenuOpen 
            ? "opacity-100 pointer-events-auto" 
            : "opacity-0 pointer-events-none"
        }`}
        style={{ top: 0 }}
      >
        <div className="flex flex-col h-full px-8 pt-28 pb-8">
          {/* Close Button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors duration-300 z-50"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-slate-900" />
          </button>

          {/* Navigation Links */}
          <div className="flex-1 flex flex-col justify-center gap-8">
            {navLinks.map((link, i) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-5xl font-display text-slate-900 hover:text-blue-700 transition-all duration-500 ${
                  isMobileMenuOpen 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? `${i * 75}ms` : "0ms" }}
              >
                {link.name}
              </a>
            ))}
          </div>
          
          {/* Bottom CTAs */}
          <div className={`flex gap-4 pt-8 border-t border-slate-200 transition-all duration-500 ${
            isMobileMenuOpen 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: isMobileMenuOpen ? "300ms" : "0ms" }}
          >
            <Link href="/login" className="flex-1">
              <Button 
                variant="outline" 
                className="w-full rounded-full h-14 text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign in
              </Button>
            </Link>
            <Link href="/onboarding" className="flex-1">
              <Button 
                className="w-full bg-blue-700 text-white rounded-full h-14 text-base hover:bg-blue-800 font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
