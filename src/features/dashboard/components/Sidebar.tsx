'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useOrganizationContext } from '@/context/OrganizationContext';
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
  Shield,
  Plus,
  X,
  Type,
  Contrast,
  Moon,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { Organization } from '@/lib/types/organizations';

const STORAGE_KEY = "org-accessibility-settings"

interface AccessibilitySettings {
  fontSize: "small" | "normal" | "large"
  highContrast: boolean
  reducedMotion: boolean
}

const FONT_SIZE_VALUES: Record<AccessibilitySettings["fontSize"], string> = {
  small: "14px",
  normal: "16px",
  large: "20px",
}

const defaultSettings: AccessibilitySettings = {
  fontSize: "normal",
  highContrast: false,
  reducedMotion: false,
}

function loadSettings(): AccessibilitySettings {
  if (typeof window === "undefined") return defaultSettings
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

function applySettings(settings: AccessibilitySettings) {
  const root = document.documentElement
  root.style.fontSize = FONT_SIZE_VALUES[settings.fontSize]
  root.classList.toggle("high-contrast", settings.highContrast)
  root.classList.toggle("reduced-motion", settings.reducedMotion)
}

export default function Sidebar({ onNavClick, isMobile }: { onNavClick?: () => void; isMobile?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const { organizations, organization, setOrganization, loading } = useOrganizationContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(loadSettings);

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setAccessibilitySettings((prev) => {
      const next = { ...prev, [key]: value }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      applySettings(next)
      return next
    })
  }

  // Get owner name from organization context
  const ownerName = organization?.client_full_name || organization?.name || 'Admin User';
  const handleOrganizationSelect = (selectedOrganization: Organization) => {
    setOrganization(selectedOrganization);
    setIsOpen(false);
    router.push('/');
    onNavClick?.();
  };

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navItems = [
    { icon: LayoutGrid, label: 'Schools', path: '/' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: CreditCard, label: 'Billing', path: '/billing' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <>
    <aside className={cn(
      "w-full bg-[#F8FAFC] flex flex-col h-full overflow-y-auto",
      !isMobile && "border-r border-[#E2E8F0] fixed left-0 top-0 w-64 h-screen"
    )}>
      {/* Organization Switcher */}
      <div className="p-4 relative">
        {loading ? (
          <div className="w-full flex items-center justify-center p-4">
            <div className="w-6 h-6 border-2 border-primary-navy/20 border-t-primary-navy rounded-full animate-spin" />
          </div>
        ) : organizations.length === 0 ? (
          <button 
            onClick={() => {
              router.push('/');
              onNavClick?.();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-primary-navy/20 bg-white hover:bg-primary-navy/5 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-sm flex items-center justify-center shrink-0 bg-primary-navy/10">
              <Plus className="w-6 h-6 text-primary-navy" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-primary-navy text-[13px] leading-tight">Add Organization</h2>
              <p className="text-[9px] font-bold text-primary-navy/40 uppercase tracking-[0.05em] mt-0.5">No organizations yet</p>
            </div>
          </button>
        ) : (
          <>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-lg border border-[#E2E8F0] bg-white transition-all text-left",
                isOpen && "ring-1 ring-primary-navy border-primary-navy shadow-sm"
              )}
            >
              <div className="w-10 h-10 rounded-sm flex items-center justify-center shrink-0 bg-primary-navy">
                <School className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h2 className="font-bold text-primary-navy text-[13px] truncate leading-tight uppercase tracking-tight">
                  {organization?.name || 'Select Organization'}
                </h2>
                <p className="text-[9px] font-bold text-primary-navy/40 uppercase tracking-[0.05em] mt-0.5">
                  {organization?.trade_name || organization?.business_address || 'No details'}
                </p>
              </div>
              <ChevronsUpDown className="w-3 h-3 text-primary-navy/20 shrink-0" />
            </button>

            {/* Dropdown */}
            {isOpen && (
              <div className="absolute top-full left-4 right-4 mt-1 bg-white border border-outline-variant rounded-lg shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="px-4 pb-2 border-b border-outline-variant/30 mb-1">
                  <span className="text-[9px] font-bold text-primary-navy/40 uppercase tracking-[0.1em]">Switch Organization</span>
                </div>
                
                <div className="space-y-0.5 max-h-64 overflow-y-auto">
                  {organizations.map((organizationItem) => (
                    <button
                      key={organizationItem.id}
                      onClick={() => handleOrganizationSelect(organizationItem)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                        organization?.id === organizationItem.id ? "bg-surface-container" : "hover:bg-surface"
                      )}
                    >
                      <div className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0 bg-primary-navy">
                        <School className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h3 className="font-bold text-primary-navy text-[12px] truncate">{organizationItem.name}</h3>
                        <p className="text-[9px] font-bold text-primary-navy/40 uppercase tracking-tighter">
                          {organizationItem.trade_name || organizationItem.business_address || 'No details'}
                        </p>
                      </div>
                      {organization?.id === organizationItem.id && (
                        <Check className="w-3 h-3 text-primary-navy shrink-0" />
                      )}
                    </button>
                  ))}
                </div>


              </div>
            )}
          </>
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
                    <div className="w-12 h-12 rounded-full bg-primary-navy/10 flex items-center justify-center font-bold text-primary-navy shrink-0 ring-2 ring-white shadow-sm">
                      {ownerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AU'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-primary-navy truncate">{ownerName}</span>
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
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsSettingsOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-primary-navy hover:bg-surface transition-colors"
                  >
                    <Settings className="w-4 h-4 text-primary-navy/40" />
                    Accessibility
                  </button>
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
          <div className="w-10 h-10 rounded-full bg-primary-navy/10 flex items-center justify-center font-bold text-primary-navy shrink-0 border border-outline-variant group-hover:scale-105 transition-transform">
            {ownerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AU'}
          </div>
          {!isMobile && (
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-[13px] font-bold text-primary-navy truncate group-hover:text-black transition-colors">{ownerName}</span>
              <span className="text-[10px] font-bold text-primary-navy/40 uppercase tracking-tight">Organization Owner</span>
            </div>
          )}
          {isMobile && (
             <div className="flex flex-col min-w-0 text-left flex-1">
              <span className="text-[13px] font-bold text-primary-navy truncate">{ownerName}</span>
              <span className="text-[10px] font-bold text-primary-navy/40 uppercase tracking-tight">Organization Owner</span>
            </div>
          )}
        </button>
      </div>

    </aside>

      {/* Accessibility Settings Modal — rendered outside fixed sidebar for proper stacking */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                      <Settings size={18} className="text-muted-foreground" />
                    </div>
                    <h2 className="text-lg font-bold text-card-foreground">Accessibility Settings</h2>
                  </div>
                  <button type="button" onClick={() => setIsSettingsOpen(false)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <div className="px-6 py-5 space-y-6">
                  <SettingRow
                    icon={<Type size={18} />}
                    label="Font Size"
                    description="Adjust text size across the dashboard"
                  >
                    <div className="flex gap-1.5">
                      {(["small", "normal", "large"] as const).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => updateSetting("fontSize", size)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            accessibilitySettings.fontSize === size
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          {size === "small" ? "Small" : size === "normal" ? "Normal" : "Large"}
                        </button>
                      ))}
                    </div>
                  </SettingRow>

                  <SettingRow
                    icon={<Contrast size={18} />}
                    label="High Contrast"
                    description="Increase color contrast for better visibility"
                  >
                    <ToggleButton
                      enabled={accessibilitySettings.highContrast}
                      onToggle={() => updateSetting("highContrast", !accessibilitySettings.highContrast)}
                    />
                  </SettingRow>

                  <SettingRow
                    icon={<Moon size={18} />}
                    label="Reduced Motion"
                    description="Minimize animations and transitions"
                  >
                    <ToggleButton
                      enabled={accessibilitySettings.reducedMotion}
                      onToggle={() => updateSetting("reducedMotion", !accessibilitySettings.reducedMotion)}
                    />
                  </SettingRow>
                </div>

                <div className="px-6 py-4 bg-muted/50 border-t border-border">
                  <p className="text-[10px] font-medium text-muted-foreground text-center">
                    Settings are saved locally and persist across sessions.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SettingRow({
  icon,
  label,
  description,
  children,
}: {
  icon: React.ReactNode
  label: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-card-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function ToggleButton({
  enabled,
  onToggle,
}: {
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? "bg-primary" : "bg-border"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  )
}
