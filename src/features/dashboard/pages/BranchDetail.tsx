'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PhoneNumberField } from '@/components/PhoneNumberField';
import StatCard from '../components/StatCard';
import PerformanceChart from '../components/PerformanceChart';
import Modal from '../components/Modal';
import Layout from '../components/Layout';
import { useBranchDetail } from '@/lib/hooks/useBranchDetail';
import { branchAdminsApi } from '@/lib/services/branchAdminsApi';
import type { UpdateBranchRequest } from '@/lib/types/branches';
import { normalizeOptionalPhoneNumber } from '@/lib/utils/contactValidation';
import { 
  Users, 
  GraduationCap, 
  Activity, 
  MapPin, 
  MoreVertical,
  Mail,
  ChevronRight,
  Home,
  Plus,
  UserPlus,
  School,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function BranchDetail() {
  const params = useParams();
  const schoolId = typeof params.schoolId === 'string' ? params.schoolId : params.schoolId?.[0];
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [isEditBranchOpen, setIsEditBranchOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branchContactPhone, setBranchContactPhone] = useState('');
  const [editBranchContactPhone, setEditBranchContactPhone] = useState('');

  const {
    school,
    branches,
    admins,
    branchAdminsMap,
    setAdmins,
    loading,
    addBranch,
    updateBranch,
    refreshBranchAdmins,
  } = useBranchDetail(schoolId ?? '');

  const activeBranchId =
    selectedBranchId && branches.some((branch) => branch.id === selectedBranchId)
      ? selectedBranchId
      : branches[0]?.id ?? null;

  const selectedBranch = useMemo(() => 
    branches.find(b => b.id === activeBranchId), 
    [activeBranchId, branches]
  );

  const branchAdmins = useMemo(() => {
    if (!activeBranchId) return [];
    
    if (branchAdminsMap[activeBranchId]) {
      const adminsData = branchAdminsMap[activeBranchId];
      
      // Ensure it's an array before mapping
      if (!Array.isArray(adminsData)) {
        console.error('Branch admins data is not an array:', adminsData);
        return [];
      }
      
      // Convert BranchAdmin to Admin format for display
      return adminsData.map(admin => ({
        id: admin.id,
        branchId: admin.branch,
        name: admin.name,
        role: admin.role_title,
        email: admin.email,
        status: admin.status.toLowerCase() as 'active' | 'inactive',
        lastLogin: admin.last_login,
      }));
    }
    
    return [];
  }, [activeBranchId, branchAdminsMap]);

  const handleRemoveAdmin = (adminId: string) => {
    setAdmins(prev => prev.filter(a => a.id !== adminId));
  };

  const closeEditBranchModal = () => {
    setIsEditBranchOpen(false);
    setError(null);
    setEditBranchContactPhone('');
  };

  const openEditBranchModal = () => {
    if (!selectedBranch) {
      setError('No branch selected');
      return;
    }

    setError(null);
    setEditBranchContactPhone(selectedBranch.contactPhone ?? '');
    setIsEditBranchOpen(true);
  };

  const handleAddBranch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!school) {
      setError('School information not available');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);

      const formData = new FormData(e.currentTarget);
      
      const branchData = {
        name: formData.get('name') as string,
        address: formData.get('address') as string,
        city: formData.get('city') as string,
        region: formData.get('region') as string || '',
        contact_phone: normalizeOptionalPhoneNumber(
          String(formData.get('contact_phone') ?? ''),
          'Branch contact phone'
        ),
        contact_email: formData.get('contact_email') as string || '',
      };
      
      await addBranch(branchData);
      setIsAddBranchOpen(false);
      (e.target as HTMLFormElement).reset();
      setBranchContactPhone('');
    } catch (err) {
      console.error('Failed to create branch:', err);
      if (err && typeof err === 'object' && 'normalized' in err) {
        const apiError = err as { normalized: { message: string; fieldErrors?: Array<{ field: string; message: string }> } };
        if (apiError.normalized.fieldErrors && apiError.normalized.fieldErrors.length > 0) {
          setError(apiError.normalized.fieldErrors.map(e => `${e.field}: ${e.message}`).join(', '));
        } else {
          setError(apiError.normalized.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create branch. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!activeBranchId) {
      setError('No branch selected');
      return;
    }

    const formData = new FormData(e.currentTarget);
    
    try {
      setSubmitting(true);
      setError(null);

      // Always use real API
      await branchAdminsApi.invite({
        email: formData.get('email') as string,
        name: formData.get('name') as string,
        father_name: formData.get('father_name') as string,
        grandfather_name: formData.get('grandfather_name') as string,
        role_title: formData.get('role_title') as string,
        branch: activeBranchId,
      });
      
      setIsAddAdminOpen(false);
      (e.target as HTMLFormElement).reset();
      
      // Refresh the branch admins list
      await refreshBranchAdmins(activeBranchId);
      
      // Show success message
      console.log('Invitation sent successfully to', formData.get('email'));
    } catch (err) {
      console.error('Failed to invite admin:', err);
      if (err && typeof err === 'object' && 'normalized' in err) {
        const apiError = err as { normalized: { message: string; fieldErrors?: Array<{ field: string; message: string }> } };
        if (apiError.normalized.fieldErrors && apiError.normalized.fieldErrors.length > 0) {
          setError(apiError.normalized.fieldErrors.map(e => `${e.field}: ${e.message}`).join(', '));
        } else {
          setError(apiError.normalized.message);
        }
      } else {
        setError('Failed to send invitation. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditBranch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedBranch) {
      setError('No branch selected');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const formData = new FormData(e.currentTarget);
      const branchData: UpdateBranchRequest = {
        name: String(formData.get('name') ?? ''),
        address: String(formData.get('address') ?? ''),
        city: String(formData.get('city') ?? ''),
        region: String(formData.get('region') ?? ''),
        contact_phone: normalizeOptionalPhoneNumber(
          String(formData.get('contact_phone') ?? ''),
          'Branch contact phone'
        ),
        contact_email: String(formData.get('contact_email') ?? ''),
      };

      await updateBranch(selectedBranch.id, branchData);
      closeEditBranchModal();
    } catch (err) {
      console.error('Failed to update branch:', err);
      if (err && typeof err === 'object' && 'normalized' in err) {
        const apiError = err as { normalized: { message: string; fieldErrors?: Array<{ field: string; message: string }> } };
        if (apiError.normalized.fieldErrors && apiError.normalized.fieldErrors.length > 0) {
          setError(apiError.normalized.fieldErrors.map(e => `${e.field}: ${e.message}`).join(', '));
        } else {
          setError(apiError.normalized.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update branch. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Loading...">
        <div className="flex items-center justify-center h-full">
          <div className="w-10 h-10 border-4 border-primary-navy/20 border-t-primary-navy rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!school) {
    return (
      <Layout title="School Not Found">
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
            <School className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-primary-navy mb-3">School Not Found</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            The school you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Link href="/" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title={school.name}
      onAction={() => setIsAddBranchOpen(true)}
      actionLabel="New Branch"
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Breadcrumbs */}
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

        {/* Modern Branch Selector - Compact Tabs */}
        <div className="px-4 lg:px-8 py-4 bg-white border-b border-outline-variant">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-primary-navy/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary-navy" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/40">Branches</span>
                <span className="text-xs font-bold text-primary-navy">{branches.length} Location{branches.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            
            <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {branches.map(branch => (
                <button
                  key={branch.id}
                  onClick={() => setSelectedBranchId(branch.id)}
                  className={cn(
                    "relative px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 border",
                    activeBranchId === branch.id 
                      ? "bg-primary-navy text-white border-primary-navy shadow-md" 
                      : "bg-white text-primary-navy/60 border-outline-variant hover:border-primary-navy/30 hover:text-primary-navy hover:bg-surface"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>{branch.name}</span>
                    {activeBranchId === branch.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </div>
                  <span className={cn(
                    "text-[9px] font-medium",
                    activeBranchId === branch.id ? "text-white/70" : "text-primary-navy/40"
                  )}>
                    {branch.city}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {/* Branch Detail Content */}
          <div className="h-full p-4 lg:p-8 overflow-y-auto bg-surface">
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
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="w-10 lg:w-12 h-10 lg:h-12 rounded-full bg-primary-navy/5 flex items-center justify-center font-bold text-primary-navy shrink-0">
                                  {admin.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="text-sm font-bold truncate">{admin.name}</span>
                                  <span className="text-xs text-primary-navy/40 font-medium truncate">{admin.role}</span>
                                  <span className="text-[10px] text-primary-navy/30 font-medium truncate mt-0.5">{admin.email}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                                <div className="flex flex-col items-end shrink-0 gap-1">
                                  <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                                    admin.status === 'active' ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
                                  )}>
                                    {admin.status}
                                  </span>
                                  {admin.lastLogin ? (
                                    <span className="text-[9px] text-primary-navy/30 font-medium">
                                      Last: {new Date(admin.lastLogin).toLocaleDateString()}
                                    </span>
                                  ) : (
                                    <span className="text-[9px] text-primary-navy/20 font-medium italic">
                                      Never logged in
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button 
                                    onClick={() => window.location.href = `mailto:${admin.email}`}
                                    className="p-2 text-primary-navy/40 hover:text-primary-navy hover:bg-surface-container rounded-lg transition-all active:scale-95"
                                    title={`Email ${admin.email}`}
                                  >
                                    <Mail className="w-4 h-4" />
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
                        <button
                          onClick={() => {
                            if (selectedBranch) {
                              navigator.clipboard.writeText(`${selectedBranch.name} (${selectedBranch.id})`);
                            }
                          }}
                          className="w-full bg-white/10 hover:bg-white/20 transition-colors py-3.5 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-3 active:scale-95"
                        >
                          <Copy className="w-4 h-4" />
                          Copy Branch ID
                        </button>
                        <button
                          onClick={() => {
                            if (selectedBranch?.contactEmail) {
                              window.location.href = `mailto:${selectedBranch.contactEmail}`;
                            }
                          }}
                          className="w-full bg-white/10 hover:bg-white/20 transition-colors py-3.5 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-3 active:scale-95"
                        >
                          <Mail className="w-4 h-4" />
                          Email Branch
                        </button>
                        <button
                          onClick={openEditBranchModal}
                          className="w-full bg-white text-primary-navy py-3.5 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95"
                        >
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
        onClose={() => {
          setIsAddBranchOpen(false);
          setError(null);
          setBranchContactPhone('');
        }} 
        title="Add Campus Branch"
      >
        <form className="space-y-6" onSubmit={handleAddBranch}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Branch Name *</label>
            <input 
              name="name"
              type="text"
              required
              placeholder="e.g. South Campus"
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Physical Address *</label>
            <input 
              name="address"
              type="text"
              required
              placeholder="Street address"
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">City *</label>
              <input 
                name="city"
                type="text"
                required
                placeholder="e.g. Addis Ababa"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Region</label>
              <input 
                name="region"
                type="text"
                placeholder="e.g. Addis Ababa"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Contact Phone</label>
              <PhoneNumberField
                name="contact_phone"
                value={branchContactPhone}
                onChange={setBranchContactPhone}
                placeholder="+251911234567"
                className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-3 text-sm focus-within:ring-2 focus-within:ring-primary-navy/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Contact Email</label>
              <input 
                name="contact_email"
                type="email"
                placeholder="branch@school.edu"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
              />
            </div>
          </div>

          <div className="h-px bg-outline-variant my-6" />

          <button 
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-navy text-white py-4 rounded-lg font-bold text-sm uppercase tracking-[0.1em] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Branch...
              </div>
            ) : (
              'Provision Branch'
            )}
          </button>
        </form>
      </Modal>

      <Modal 
        isOpen={isAddAdminOpen} 
        onClose={() => {
          setIsAddAdminOpen(false);
          setError(null);
        }} 
        title="Add Branch Administrator"
      >
        <form className="space-y-5" onSubmit={handleAddAdmin}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Name *</label>
              <input 
                name="name"
                type="text" 
                required
                placeholder="Robert"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Father Name *</label>
              <input 
                name="father_name"
                type="text" 
                required
                placeholder="Wilson"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Grandfather Name *</label>
            <input 
              name="grandfather_name"
              type="text" 
              required
              placeholder="James"
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Email Address *</label>
            <input 
              name="email"
              type="email" 
              required
              placeholder="r.wilson@school.edu"
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
            />
          </div>

          {/* Hidden field for role_title - default to Branch Administrator */}
          <input type="hidden" name="role_title" value="Branch Administrator" />

          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="flex gap-3">
              <Mail className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-emerald-900">Invitation Email</span>
                <p className="text-[10px] font-medium text-emerald-700 leading-relaxed">
                  An invitation email will be sent to the administrator with instructions to create their account and access the branch management portal.
                </p>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-primary-navy text-white py-4 rounded-lg font-bold text-sm uppercase tracking-[0.1em] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending Invitation...
              </div>
            ) : (
              'Send Invitation'
            )}
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={isEditBranchOpen}
        onClose={closeEditBranchModal}
        title={selectedBranch ? `Edit ${selectedBranch.name}` : 'Edit Branch'}
      >
        <form
          key={selectedBranch?.id ?? 'edit-branch'}
          className="space-y-6"
          onSubmit={handleEditBranch}
        >
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Branch Name *</label>
            <input
              name="name"
              type="text"
              required
              defaultValue={selectedBranch?.name ?? ''}
              placeholder="e.g. South Campus"
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Physical Address *</label>
            <input
              name="address"
              type="text"
              required
              defaultValue={selectedBranch?.address ?? ''}
              placeholder="Street address"
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">City *</label>
              <input
                name="city"
                type="text"
                required
                defaultValue={selectedBranch?.city ?? ''}
                placeholder="e.g. Addis Ababa"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Region</label>
              <input
                name="region"
                type="text"
                defaultValue={selectedBranch?.region ?? ''}
                placeholder="e.g. Addis Ababa"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Contact Phone</label>
              <PhoneNumberField
                name="contact_phone"
                value={editBranchContactPhone}
                onChange={setEditBranchContactPhone}
                placeholder="+251911234567"
                className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-3 text-sm focus-within:ring-2 focus-within:ring-primary-navy/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Contact Email</label>
              <input
                name="contact_email"
                type="email"
                defaultValue={selectedBranch?.contactEmail ?? ''}
                placeholder="branch@school.edu"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-navy text-white py-4 rounded-lg font-bold text-sm uppercase tracking-[0.1em] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving Changes...
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </Modal>
    </Layout>
  );
}
