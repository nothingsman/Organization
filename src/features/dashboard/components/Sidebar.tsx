'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, 
  School, 
  ChevronsUpDown, 
  Check,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  User as UserIcon,
  Bell,
  Shield
} from 'lucide-react';
import { cn } from '../lib/utils';

const organizations = [
  { id: '1', name: 'Acme Academy', branches: 5, color: 'bg-[#6366F1]' },
  { id: '2', name: 'Zemen International', branches: 3, color: 'bg-[#10B981]' },
  { id: '3', name: 'Unity Preparatory', branches: 4, color: 'bg-[#FF7A00]' },
];

export default function Sidebar({ onNavClick, isMobile }: { onNavClick?: () => void; isMobile?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeOrg, setActiveOrg] = useState(organizations[0]);

  const handleSignOut = () => {
    logout();
    setIsProfileOpen(false);
    onNavClick?.();
    router.replace('/onboarding');
  };

  const navItems = [
    { icon: LayoutGrid, label: 'Schools', path: '/' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: CreditCard, label: 'Billing', path: '/billing' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className={cn(
      "w-full bg-[#F8FAFC] flex flex-col h-full overflow-y-auto",
      !isMobile && "border-r border-[#E2E8F0] fixed left-0 top-0 w-64 h-screen"
    )}>
      {/* Organization Switcher */}
      <div className="p-4 relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center gap-3 p-2 rounded-lg border border-[#E2E8F0] bg-white transition-all text-left",
            isOpen && "ring-1 ring-primary-navy border-primary-navy shadow-sm"
          )}
        >
          <div className={cn("w-10 h-10 rounded-sm flex items-center justify-center shrink-0", activeOrg.color)}>
            <School className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h2 className="font-bold text-primary-navy text-[13px] truncate leading-tight uppercase tracking-tight">{activeOrg.name}</h2>
            <p className="text-[9px] font-bold text-primary-navy/40 uppercase tracking-[0.05em] mt-0.5">ORG. OWNER</p>
          </div>
          <ChevronsUpDown className="w-3 h-3 text-primary-navy/20 shrink-0" />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-4 right-4 mt-1 bg-white border border-outline-variant rounded-lg shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="px-4 pb-2 border-b border-outline-variant/30 mb-1">
              <span className="text-[9px] font-bold text-primary-navy/40 uppercase tracking-[0.1em]">Switch School</span>
            </div>
            
            <div className="space-y-0.5">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    setActiveOrg(org);
                    setIsOpen(false);
                    onNavClick?.();
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                    activeOrg.id === org.id ? "bg-surface-container" : "hover:bg-surface"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-sm flex items-center justify-center shrink-0", org.color)}>
                    <School className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold text-primary-navy text-[12px] truncate">{org.name}</h3>
                    <p className="text-[9px] font-bold text-primary-navy/40 uppercase tracking-tighter">{org.branches} Branches</p>
                  </div>
                  {activeOrg.id === org.id && (
                    <Check className="w-3 h-3 text-primary-navy shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-[1px] bg-outline-variant mx-4 mb-4" />

      {/* Navigation */}
      <nav className="px-3 space-y-1 pb-8">
        {navItems.map((item) => {
          const isActive =
            (item.path === '/' &&
              (pathname === '/' || pathname.startsWith('/school'))) ||
            (item.path !== '/' && pathname.startsWith(item.path));

          return (
            <Link
              key={item.label}
              href={item.path}
              onClick={onNavClick}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-full transition-all duration-200 group',
                isActive
                  ? 'bg-[#DDE4FF] text-[#1D4ED8]'
                  : 'text-[#475569] hover:bg-white hover:text-[#1D4ED8]',
              )}
            >
              <item.icon
                className={cn('w-5 h-5 transition-colors', 'group-hover:text-[#1D4ED8]')}
              />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-outline-variant mt-auto relative">
        <AnimatePresence>
          {isProfileOpen && (
            <>
              {/* Backdrop for closing */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsProfileOpen(false)}
                className="fixed inset-0 z-[60]"
              />
              
              {/* Profile Popup */}
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-outline-variant rounded-xl shadow-2xl z-[70] overflow-hidden"
              >
                <div className="p-4 border-b border-outline-variant/30 bg-surface">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-outline-variant/50">
                      <img 
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&q=80" 
                        alt="Admin Profile" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-primary-navy truncate">Admin User</span>
                      <span className="text-[10px] font-bold text-primary-navy/40 uppercase tracking-tight">Org. Owner</span>
                    </div>
                  </div>
                </div>

                <div className="p-2 space-y-0.5">
                  <Link 
                    href="/settings" 
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavClick?.();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-primary-navy hover:bg-surface transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-primary-navy/40" />
                    My Profile
                  </Link>
                  <Link 
                    href="/settings" 
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavClick?.();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-primary-navy hover:bg-surface transition-colors"
                  >
                    <Shield className="w-4 h-4 text-primary-navy/40" />
                    Security
                  </Link>
                  <div className="h-[1px] bg-outline-variant/30 my-1 mx-2" />
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className={cn(
            "w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-all duration-300 group",
            isProfileOpen ? "bg-surface shadow-inner" : "hover:bg-surface"
          )}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant shadow-sm shrink-0 group-hover:scale-105 transition-transform">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&q=80" 
              alt="Org Owner" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          {!isMobile && (
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-[13px] font-bold text-primary-navy truncate group-hover:text-black transition-colors">Admin User</span>
              <span className="text-[10px] font-bold text-primary-navy/40 uppercase tracking-tight">Organization Owner</span>
            </div>
          )}
          {isMobile && (
             <div className="flex flex-col min-w-0 text-left flex-1">
              <span className="text-[13px] font-bold text-primary-navy truncate">Admin User</span>
              <span className="text-[10px] font-bold text-primary-navy/40 uppercase tracking-tight">Organization Owner</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
