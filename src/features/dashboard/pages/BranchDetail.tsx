'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import StatCard from '../components/StatCard';
import PerformanceChart from '../components/PerformanceChart';
import Modal from '../components/Modal';
import Layout from '../components/Layout';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { 
  MOCK_SCHOOLS, 
  MOCK_BRANCHES, 
  MOCK_ADMINS 
} from '../constants';
import { useBranchDetail } from '@/lib/hooks/useBranchDetail';
import { 
  Users, 
  GraduationCap, 
  Activity, 
  MapPin, 
  MoreVertical,
  Mail,
  Shield,
  Search,
  ChevronRight,
  Home,
  Plus,
  Trash2,
  UserPlus,
  Menu,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_PLATFORM_KEY || '';

export default function BranchDetail() {
  const params = useParams();
  const schoolId = typeof params.schoolId === 'string' ? params.schoolId : params.schoolId?.[0];
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [isBranchListOpen, setIsBranchListOpen] = useState(false);

  const {
    school,
    branches,
    admins,
    setAdmins,
  } = useBranchDetail(schoolId ?? '');

  React.useEffect(() => {
    if (branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].id);
    }
  }, [branches, selectedBranchId]);

  const selectedBranch = useMemo(() => 
    branches.find(b => b.id === selectedBranchId), 
    [branches, selectedBranchId]
  );

  const branchAdmins = useMemo(() => 
    admins.filter(a => a.branchId === selectedBranchId), 
    [selectedBranchId, admins]
  );

  const handleRemoveAdmin = (adminId: string) => {
    setAdmins(prev => prev.filter(a => a.id !== adminId));
  };

  const handleAddAdmin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAdmin = {
      id: `a${Date.now()}`,
      branchId: selectedBranchId!,
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      email: formData.get('email') as string,
      status: 'active' as const
    };
    
    setAdmins(prev => [...prev, newAdmin]);
    setIsAddAdminOpen(false);
    
    // Simulate sending invitation
    console.log(`Invitation link sent to ${newAdmin.email}`);
  };

  if (!school) return <div className="p-8">School not found</div>;

  return (
    <Layout 
      title={school.name}
      onAction={() => setIsAddBranchOpen(true)}
      actionLabel="New Branch"
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Breadcrumbs - Responsive visibility/scroll */}
        <div className="px-4 lg:px-8 py-3 bg-white/50 backdrop-blur-md border-b border-outline-variant flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary-navy/40 overflow-x-auto whitespace-nowrap no-scrollbar sticky top-0 z-20">
          <Link href="/" className="hover:text-primary-navy flex items-center gap-1 transition-colors shrink-0">
            <Home className="w-3 h-3" />
            Org
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-primary-navy/60 shrink-0">{school.name}</span>
          {selectedBranch && (
            <>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <span className="text-primary-navy truncate">{selectedBranch.name}</span>
            </>
          )}
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Branch Selector - Hidden on mobile, Sidebar on desktop */}
          <div className="hidden lg:flex w-80 border-r border-outline-variant bg-white flex-col shrink-0 overflow-y-auto">
            <div className="p-6 border-b border-outline-variant">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/40">Campus Branches</h3>
                <span className="bg-surface-container px-2 py-0.5 rounded text-[10px] font-bold text-primary-navy">{branches.length}</span>
              </div>
              <div className="space-y-2">
                {branches.map(branch => (
                  <button
                    key={branch.id}
                    onClick={() => setSelectedBranchId(branch.id)}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border transition-all duration-300 group flex items-center justify-between relative overflow-hidden",
                      selectedBranchId === branch.id 
                        ? "bg-primary-navy border-primary-navy text-white shadow-xl translate-x-2" 
                        : "bg-surface border-outline-variant text-primary-navy hover:border-primary-navy/40 hover:bg-surface-container"
                    )}
                  >
                    <div className="flex flex-col relative z-10">
                      <span className="font-bold text-sm tracking-tight">{branch.name}</span>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider mt-0.5",
                        selectedBranchId === branch.id ? "text-white/60" : "text-primary-navy/40"
                      )}>{branch.city}</span>
                    </div>
                    {selectedBranchId === branch.id && (
                      <Activity className="w-4 h-4 text-white animate-pulse relative z-10" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-primary-navy" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/40">Verified Location</h3>
              </div>
              <div className="rounded-xl overflow-hidden h-48 border border-outline-variant group cursor-crosshair">
                {MAPS_KEY ? (
                  <APIProvider apiKey={MAPS_KEY}>
                    <Map
                      defaultCenter={{ lat: 51.5074, lng: -0.1278 }}
                      defaultZoom={11}
                      gestureHandling={'none'}
                      disableDefaultUI={true}
                      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <AdvancedMarker position={{ lat: 51.5074, lng: -0.1278 }} />
                    </Map>
                  </APIProvider>
                ) : (
                  <div className="w-full h-full bg-surface-container flex flex-col items-center justify-center p-6 text-center group-hover:bg-primary-navy/5 transition-colors">
                    <MapPin className="w-6 h-6 text-primary-navy/20 mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/40">Geographic Verification System</span>
                  </div>
                )}
              </div>
              <div className="mt-4 p-4 bg-surface-container rounded-lg border border-outline-variant">
                <p className="text-[10px] font-medium leading-relaxed text-primary-navy/60 italic text-center">
                  "Map verification ensures demographic accuracy for regional educational reporting."
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Branch Selector */}
          <div className="lg:hidden p-4 bg-white border-b border-outline-variant flex items-center gap-3 overflow-x-auto no-scrollbar">
            {branches.map(branch => (
              <button
                key={branch.id}
                onClick={() => setSelectedBranchId(branch.id)}
                className={cn(
                  "p-3 px-4 rounded-xl border transition-all shrink-0 text-xs font-bold whitespace-nowrap",
                  selectedBranchId === branch.id 
                    ? "bg-primary-navy border-primary-navy text-white shadow-lg" 
                    : "bg-surface border-outline-variant text-primary-navy"
                )}
              >
                {branch.name}
              </button>
            ))}
          </div>

          {/* Branch Detail Content */}
          <div className="flex-1 p-4 lg:p-8 overflow-y-auto bg-surface">
            {selectedBranch ? (
              <motion.div
                key={selectedBranch.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 lg:space-y-8"
              >
                {/* Header Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  <StatCard 
                    label="Active Students" 
                    value={selectedBranch.studentCount.toLocaleString()} 
                    icon={GraduationCap}
                    trend={{ value: 4.2, isPositive: true }}
                  />
                  <StatCard 
                    label="Certified Teachers" 
                    value={selectedBranch.teacherCount} 
                    icon={Users}
                  />
                  <StatCard 
                    label="Campus Capacity" 
                    value={`${Math.round((selectedBranch.studentCount / selectedBranch.capacity) * 100)}%`} 
                    icon={Activity}
                    trend={{ value: 2.1, isPositive: true }}
                    className="sm:col-span-2 lg:col-span-1"
                  />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                  {/* Left Column: Academic Performance */}
                  <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                    <div className="bg-white p-6 lg:p-8 rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-4">
                        <div>
                          <h3 className="text-xs lg:text-sm font-bold uppercase tracking-[0.15em] text-primary-navy">Academic Performance Index</h3>
                          <p className="text-[10px] lg:text-xs text-primary-navy/40 mt-1 font-medium italic">Standardized performance trends</p>
                        </div>
                        <div className="flex gap-2 p-1 bg-surface-container rounded-lg w-fit">
                          <button className="px-3 py-1.5 bg-white shadow-sm rounded-md text-[10px] font-bold uppercase tracking-wider">Annual</button>
                          <button className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary-navy/40">Quarterly</button>
                        </div>
                      </div>
                      <div className="h-[250px] lg:h-[300px]">
                        <PerformanceChart data={selectedBranch.performance} />
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                      <div className="px-6 lg:px-8 py-4 lg:py-6 border-b border-outline-variant flex items-center justify-between">
                        <h3 className="text-xs lg:text-sm font-bold uppercase tracking-[0.15em] text-primary-navy">Branch Administrators</h3>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => setIsAddAdminOpen(true)}
                            className="p-2 bg-primary-navy text-white rounded-lg hover:opacity-90 transition-opacity active:scale-95"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="divide-y divide-outline-variant">
                        {branchAdmins.length > 0 ? (
                          branchAdmins.map(admin => (
                            <div key={admin.id} className="px-4 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-surface transition-colors gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-10 lg:w-12 h-10 lg:h-12 rounded-full bg-primary-navy/5 flex items-center justify-center font-bold text-primary-navy shrink-0">
                                  {admin.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-sm font-bold truncate">{admin.name}</span>
                                  <span className="text-xs text-primary-navy/40 font-medium truncate">{admin.role}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-6">
                                <div className="flex flex-col items-end shrink-0">
                                  <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                                    admin.status === 'active' ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
                                  )}>
                                    {admin.status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button className="p-2 text-primary-navy/40 hover:text-primary-navy hover:bg-surface-container rounded-lg transition-all active:scale-95">
                                    <Mail className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleRemoveAdmin(admin.id)}
                                    className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-95"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-12 text-center text-primary-navy/20">
                            <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-xs font-bold uppercase tracking-widest">No branch admins assigned</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Information & Actions */}
                  <div className="space-y-6">
                    <div className="bg-primary-navy text-white p-6 lg:p-8 rounded-xl relative overflow-hidden shadow-xl">
                      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <button className="w-full bg-white/10 hover:bg-white/20 transition-colors py-3.5 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-3 active:scale-95">
                          Generate Report
                        </button>
                        <button className="w-full bg-white/10 hover:bg-white/20 transition-colors py-3.5 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-3 active:scale-95">
                          Manage Staff Access
                        </button>
                        <button className="w-full bg-white text-primary-navy py-3.5 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95">
                          Branch Settings
                        </button>
                      </div>
                    </div>

                    <div className="bg-white p-6 lg:p-8 rounded-xl border border-outline-variant space-y-6 shadow-sm">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary-navy">Infrastructure</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-primary-navy/40 mt-1 shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-primary-navy">Physical Address</span>
                            <span className="text-[11px] lg:text-xs text-primary-navy/60 font-medium leading-relaxed mt-1">
                              {selectedBranch.address},<br /> {selectedBranch.city}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between pt-4 border-t border-outline-variant">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-primary-navy/40">Facility Class</span>
                            <span className="text-xs font-bold mt-1">Standard Academy</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-primary-navy/40">Certification</span>
                            <span className="text-xs font-bold mt-1 text-emerald-600">Verified</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Map - Only show map on mobile if desired, or hidden in Sidebar */}
                    <div className="lg:hidden bg-white p-4 rounded-xl border border-outline-variant shadow-sm aspect-video overflow-hidden">
                       <MapPin className="w-4 h-4 text-primary-navy mb-2" />
                       <div className="h-full w-full bg-surface-container rounded-lg flex items-center justify-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/40">Geolocation Active</span>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full text-primary-navy/20 flex-col gap-4">
                <MoreVertical className="w-8 h-8" />
                <span className="font-bold uppercase tracking-[0.2em]">Select a branch to view data</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Modal 
        isOpen={isAddBranchOpen} 
        onClose={() => setIsAddBranchOpen(false)} 
        title="Add Campus Branch"
      >
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Branch Name</label>
            <input 
              type="text" 
              placeholder="e.g. South Campus"
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Physical Address</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-navy/40" />
              <input 
                type="text" 
                placeholder="Search address for verification..."
                className="w-full bg-surface-container border border-outline-variant rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">City</label>
              <input 
                type="text" 
                placeholder="London"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Branch Type</label>
              <select className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 appearance-none">
                <option>Primary School</option>
                <option>Secondary School</option>
                <option>Vocational</option>
                <option>Pre-K</option>
              </select>
            </div>
          </div>

          <div className="h-px bg-outline-variant my-6" />

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-navy/80">Administrative Lead</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Admin Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Dr. Jane Smith"
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Admin Contact Email</label>
                <input 
                  type="email" 
                  placeholder="jane.smith@school.edu"
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <div className="w-5 h-5 border-2 border-outline-variant rounded transition-all peer-checked:bg-primary-navy peer-checked:border-primary-navy" />
                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs font-bold text-primary-navy/60 group-hover:text-primary-navy transition-colors">Send automated invitation email immediately</span>
            </label>
          </div>

          <div className="h-40 bg-surface-container rounded-xl border border-outline-variant flex items-center justify-center p-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <MapPin className="w-6 h-6 text-primary-navy/20" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/40 italic">Geographic accuracy verification active</span>
            </div>
          </div>

          <button className="w-full bg-primary-navy text-white py-4 rounded-lg font-bold text-sm uppercase tracking-[0.1em] hover:opacity-90 transition-opacity">
            Provision Branch
          </button>
        </form>
      </Modal>

      <Modal 
        isOpen={isAddAdminOpen} 
        onClose={() => setIsAddAdminOpen(false)} 
        title="Add Branch Administrator"
      >
        <form className="space-y-6" onSubmit={handleAddAdmin}>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Full Name</label>
            <input 
              name="name"
              type="text" 
              required
              placeholder="e.g. Dr. Robert Wilson"
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Email Address</label>
            <input 
              name="email"
              type="email" 
              required
              placeholder="r.wilson@school.edu"
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Administrative Role</label>
            <select name="role" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 appearance-none">
              <option>Principal</option>
              <option>Vice Principal</option>
              <option>Branch Manager</option>
              <option>Dean of Students</option>
              <option>Academic Coordinator</option>
            </select>
          </div>

          <div className="p-4 bg-primary-navy/5 rounded-lg border border-primary-navy/10">
            <div className="flex gap-3">
              <Mail className="w-4 h-4 text-primary-navy mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-primary-navy">Invitation Simulation</span>
                <p className="text-[10px] font-medium text-primary-navy/60 leading-relaxed">
                  Upon clicking "Send Invitation", an automated onboarding link will be generated and dispatched to the specified email address.
                </p>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-primary-navy text-white py-4 rounded-lg font-bold text-sm uppercase tracking-[0.1em] hover:opacity-90 transition-opacity">
            Send Invitation
          </button>
        </form>
      </Modal>
    </Layout>
  );
}
