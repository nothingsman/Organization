import React, { useState } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import Drawer from '../components/Drawer';
import { MediaUploader } from '@/components/MediaUploader';
import type { MediaUploaderState } from '@/components/MediaUploader';
import { PhoneNumberField } from '@/components/PhoneNumberField';
import { Shield, Bell, Mail, MessageSquare, Phone, ChevronRight, Building2, FileText } from 'lucide-react';
import { deleteQueuedMedia } from '@/lib/media/deleteQueuedMedia';
import { useOrganization } from '@/lib/hooks/useOrganization';
import { normalizeRequiredPhoneNumber } from '@/lib/utils/contactValidation';
import type { UpdateOrganizationRequest } from '@/lib/types/organizations';

export default function Settings() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const { organization, loading, error: fetchError, updateOrganization } = useOrganization();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [uploadedLicenseId, setUploadedLicenseId] = useState<string | null | undefined>(undefined);
  const [pendingLicenseDeletionIds, setPendingLicenseDeletionIds] = useState<string[]>([]);
  const [businessPhoneNumber, setBusinessPhoneNumber] = useState('');
  const [clientPhoneNumber, setClientPhoneNumber] = useState('');

  const handleLicenseStateChange = ({ hasChanges, mediaId, pendingRemovalIds }: MediaUploaderState) => {
    setUploadedLicenseId(hasChanges ? mediaId : undefined);
    setPendingLicenseDeletionIds(pendingRemovalIds);
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!organization) {
      setError('No organization found');
      return;
    }

    if (mediaBusy) {
      setError('Please wait for the license upload to finish before saving.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);

      const formData = new FormData(e.currentTarget);
      const updateData: UpdateOrganizationRequest = {
        name: formData.get('name') as string,
        trade_name: formData.get('trade_name') as string,
        tin_number: formData.get('tin_number') as string,
        license_no: formData.get('license_no') as string,
        client_full_name: formData.get('client_full_name') as string,
        business_address: formData.get('business_address') as string,
        business_phone_number: normalizeRequiredPhoneNumber(
          String(formData.get('business_phone_number') ?? ''),
          'Business phone'
        ),
        client_phone_number: normalizeRequiredPhoneNumber(
          String(formData.get('client_phone_number') ?? ''),
          'Client phone'
        ),
      };

      if (uploadedLicenseId !== undefined) {
        updateData.business_license_image = uploadedLicenseId;
      }

      await updateOrganization(updateData);
      void deleteQueuedMedia([...pendingLicenseDeletionIds]);
      setIsEditModalOpen(false);
      setUploadedLicenseId(undefined);
      setPendingLicenseDeletionIds([]);
    } catch (err) {
      console.error('Failed to update organization:', err);
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
        setError('Failed to update organization. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOrganization = () => {
    console.log(`Deleting organization: ${organization?.name}`);
    setIsDeleteModalOpen(false);
  };

  const settingsSections = [
    { icon: Bell, title: 'Notifications', desc: 'Control alerts for enrollment, billing, and system updates' },
  ];

  if (loading) {
    return (
      <Layout title="Organization Settings">
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-navy/20 border-t-primary-navy rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (fetchError && !organization) {
    return (
      <Layout title="Organization Settings">
        <div className="p-4 lg:p-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-800 mb-4">{fetchError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-sm text-primary-navy font-medium hover:underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Organization Settings">
      <div className="p-4 lg:p-8 max-w-4xl space-y-6 lg:space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:gap-8">
          <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 lg:p-8 border-b border-outline-variant flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-16 lg:w-20 h-16 lg:h-20 rounded-xl bg-surface-container flex items-center justify-center border border-outline-variant shrink-0">
                <Building2 className="w-8 lg:w-10 h-8 lg:h-10 text-primary-navy/20" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg lg:text-xl font-bold text-primary-navy truncate">{organization?.name}</h2>
                <p className="text-xs lg:text-sm text-primary-navy/40 font-medium">
                  {organization?.verification_status === 'verified' ? 'Verified' : 'Pending Verification'} Organization • 
                  Status: {organization?.status}
                </p>
              </div>
              <button 
                onClick={() => {
                  setBusinessPhoneNumber(organization?.business_phone_number || '');
                  setClientPhoneNumber(organization?.client_phone_number || '');
                  setUploadedLicenseId(undefined);
                  setPendingLicenseDeletionIds([]);
                  setIsEditModalOpen(true);
                }}
                className="w-full sm:w-auto bg-surface border border-outline-variant px-6 py-2.5 rounded-lg text-[10px] lg:text-xs font-bold uppercase tracking-wide hover:bg-surface-container transition-colors active:scale-95"
              >
                Edit Profile
              </button>
            </div>

            <div className="divide-y divide-outline-variant">
              {settingsSections.map((section) => (
                <button 
                  key={section.title}
                  onClick={() => {
                    if (section.title === 'Notifications') setIsNotificationsOpen(true);
                  }}
                  className="w-full p-6 flex items-center gap-6 hover:bg-surface transition-all group"
                >
                  <div className="p-3 bg-surface-container rounded-lg group-hover:bg-white border border-transparent group-hover:border-outline-variant transition-all shrink-0">
                    <section.icon className="w-6 h-6 text-primary-navy" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h4 className="text-sm font-bold text-primary-navy">{section.title}</h4>
                    <p className="text-xs text-primary-navy/40 font-medium mt-0.5 line-clamp-1">{section.desc}</p>
                  </div>
                  <div className="text-primary-navy/20 group-hover:text-primary-navy transition-colors shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-outline-variant rounded-xl p-6 lg:p-8 shadow-sm">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs lg:text-sm font-bold uppercase tracking-[0.15em] text-primary-navy mb-1">Organization Details</h3>
                  <p className="text-[10px] lg:text-xs text-primary-navy/40 font-medium">Business information and contact details</p>
                </div>
                <FileText className="w-5 h-5 text-primary-navy/20" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/40 mb-1">Trade Name</p>
                  <p className="text-sm font-medium text-primary-navy">{organization?.trade_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/40 mb-1">TIN Number</p>
                  <p className="text-sm font-medium text-primary-navy">{organization?.tin_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/40 mb-1">License No</p>
                  <p className="text-sm font-medium text-primary-navy">{organization?.license_no || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/40 mb-1">Business Phone</p>
                  <p className="text-sm font-medium text-primary-navy">{organization?.business_phone_number || 'N/A'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/40 mb-1">Business Address</p>
                  <p className="text-sm font-medium text-primary-navy">{organization?.business_address || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-outline-variant rounded-xl p-6 lg:p-8 shadow-sm">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs lg:text-sm font-bold uppercase tracking-[0.15em] text-primary-navy mb-1">Primary Contact</h3>
                  <p className="text-[10px] lg:text-xs text-primary-navy/40 font-medium">Organization owner information</p>
                </div>
                <Shield className="w-5 h-5 text-primary-navy/20" />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary-navy/5 flex items-center justify-center font-bold text-primary-navy shrink-0">
                    {organization?.client_full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'NA'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-primary-navy truncate">{organization?.client_full_name || 'N/A'}</h3>
                    <p className="text-xs text-primary-navy/40 font-medium truncate">{organization?.client_phone_number || 'No phone'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setError(null);
          setMediaBusy(false);
          setUploadedLicenseId(undefined);
          setPendingLicenseDeletionIds([]);
          setBusinessPhoneNumber(organization?.business_phone_number || '');
          setClientPhoneNumber(organization?.client_phone_number || '');
        }} 
        title="Edit Organization Profile"
      >
        <form className="space-y-6" onSubmit={handleUpdateProfile}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <MediaUploader
            key={`${organization?.business_license_image ?? 'none'}-${isEditModalOpen ? 'open' : 'closed'}`}
            imageOnly={true}
            accept="image/*"
            onUploaded={(mediaId) => setUploadedLicenseId(mediaId)}
            onRemoved={() => setUploadedLicenseId(null)}
            onStateChange={handleLicenseStateChange}
            onBusyChange={setMediaBusy}
            label="Business License Image (Optional)"
            description="Drop business license image here"
            initialMediaId={uploadedLicenseId === undefined ? organization?.business_license_image : uploadedLicenseId}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Organization Name *</label>
              <input 
                name="name"
                type="text" 
                required
                defaultValue={organization?.name}
                placeholder="e.g. Acme Academy"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Trade Name *</label>
              <input 
                name="trade_name"
                type="text" 
                required
                defaultValue={organization?.trade_name}
                placeholder="e.g. Acme Education Group"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">TIN Number *</label>
              <input 
                name="tin_number"
                type="text" 
                required
                defaultValue={organization?.tin_number}
                placeholder="e.g. 123456789"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">License Number *</label>
              <input 
                name="license_no"
                type="text" 
                required
                defaultValue={organization?.license_no}
                placeholder="e.g. LIC-2024-001"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Client Full Name *</label>
              <input 
                name="client_full_name"
                type="text" 
                required
                defaultValue={organization?.client_full_name}
                placeholder="e.g. John Doe"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Business Address *</label>
              <textarea 
                name="business_address"
                required
                defaultValue={organization?.business_address}
                placeholder="e.g. 123 Main St, City, Country"
                rows={2}
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Business Phone *</label>
              <PhoneNumberField
                name="business_phone_number"
                value={businessPhoneNumber}
                onChange={setBusinessPhoneNumber}
                required
                placeholder="+1 (555) 000-0000"
                className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-3 text-sm focus-within:ring-2 focus-within:ring-primary-navy/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Client Phone *</label>
              <PhoneNumberField
                name="client_phone_number"
                value={clientPhoneNumber}
                onChange={setClientPhoneNumber}
                required
                placeholder="+1 (555) 000-0000"
                className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-3 text-sm focus-within:ring-2 focus-within:ring-primary-navy/20"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting || mediaBusy}
            className="w-full bg-primary-navy text-white py-4 rounded-lg font-bold text-sm uppercase tracking-[0.1em] hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting || mediaBusy ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {mediaBusy ? 'Uploading License...' : 'Saving Changes...'}
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </Modal>

      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Confirm Offboarding"
      >
        <div className="space-y-6">
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-rose-900">Irreversible Action</span>
                <p className="text-xs font-medium text-rose-700/70 leading-relaxed">
                  By offboarding <strong>{organization?.name}</strong>, you will permanently terminate access for all associated entities.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Type &quot;CONFIRM&quot; to proceed</p>
            <input 
              type="text" 
              placeholder="CONFIRM"
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="w-full bg-surface border border-outline-variant text-primary-navy font-bold py-3 rounded-lg text-[10px] uppercase tracking-widest hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleDeleteOrganization}
              className="w-full bg-rose-600 text-white font-bold py-3 rounded-lg text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
            >
              Offboard Now
            </button>
          </div>
        </div>
      </Modal>

      <Drawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        title="Notification Settings"
      >
        <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-navy/40">Primary Channels</h3>
              <button className="text-[10px] font-bold text-primary-navy hover:underline">Mute All</button>
            </div>
            
            <div className="space-y-3">
              {[
                { icon: Mail, title: 'Email Digest', desc: 'Summary of daily branch activities', active: true },
                { icon: MessageSquare, title: 'SMS Critical', desc: 'Urgent emergency & safety alerts', active: false },
                { icon: Phone, title: 'System Push', desc: 'Real-time billing & enrollment updates', active: true }
              ].map((item) => (
                <label key={item.title} className="flex items-center gap-4 p-4 bg-surface-container/50 border border-outline-variant rounded-xl hover:bg-surface-container transition-all cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-white border border-outline-variant flex items-center justify-center shadow-sm shrink-0">
                    <item.icon className="w-5 h-5 text-primary-navy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-primary-navy truncate">{item.title}</h4>
                    <p className="text-[10px] font-medium text-primary-navy/40 uppercase tracking-wide truncate">{item.desc}</p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" className="sr-only peer" defaultChecked={item.active} />
                    <div className="w-8 h-4 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary-navy"></div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="h-px bg-outline-variant" />

          <div className="space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-navy/40">Event Subscriptions</h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: 'Financial Transactions', category: 'Billing' },
                { label: 'New Staff Applications', category: 'HR' },
                { label: 'Security Policy Changes', category: 'Admin' },
                { label: 'Branch Target Achievements', category: 'Progress' },
                { label: 'Maintenance Scheduling', category: 'Ops' }
              ].map((event) => (
                <label key={event.label} className="flex items-center justify-between p-3 px-4 bg-surface rounded-lg border border-transparent hover:border-outline-variant transition-all cursor-pointer group">
                  <div className="flex flex-col min-w-0 pr-4">
                    <span className="text-xs font-bold text-primary-navy/80 group-hover:text-primary-navy truncate">{event.label}</span>
                    <span className="text-[8px] font-bold text-primary-navy/30 uppercase tracking-[0.1em]">{event.category}</span>
                  </div>
                  <input type="checkbox" className="w-4 h-4 rounded border-outline-variant text-primary-navy focus:ring-primary-navy/20 shrink-0" defaultChecked />
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              onClick={() => setIsNotificationsOpen(false)}
              className="flex-1 bg-primary-navy text-white font-bold py-4 rounded-xl text-[10px] lg:text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-opacity active:scale-95"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </Drawer>
    </Layout>
  );
}
