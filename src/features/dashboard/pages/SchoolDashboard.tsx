import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import SchoolCard from '../components/SchoolCard';
import Modal from '../components/Modal';
import { useSchools } from '@/lib/hooks/useSchools';
import { MediaUploader } from '@/components/MediaUploader';
import type { MediaUploaderState } from '@/components/MediaUploader';
import { CountrySearchInput } from '@/components/CountrySearchInput';
import { PhoneNumberField } from '@/components/PhoneNumberField';
import { ShieldCheck, School, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { deleteQueuedMedia } from '@/lib/media/deleteQueuedMedia';
import { organizationsApi } from '@/lib/services/organizationsApi';
import { branchesApi } from '@/lib/services/branchesApi';
import { branchAdminsApi } from '@/lib/services/branchAdminsApi';
import { normalizeCountryName, normalizeOptionalPhoneNumber } from '@/lib/utils/contactValidation';
import type { Organization } from '@/lib/types/organizations';
import type { CreateSchoolRequest, UpdateSchoolRequest } from '@/lib/types/schools';
import type { School as DashboardSchool } from '../types';

export default function SchoolDashboard() {
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<DashboardSchool | null>(null);
  const { schools, addSchool, updateSchool, loading: schoolsLoading, error: schoolsError } = useSchools();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [branchCounts, setBranchCounts] = useState<Record<string, number>>({});
  const [adminCounts, setAdminCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [uploadedLogoId, setUploadedLogoId] = useState<string | null | undefined>(undefined);
  const [pendingLogoDeletionIds, setPendingLogoDeletionIds] = useState<string[]>([]);
  const [country, setCountry] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const closeSchoolModal = () => {
    setIsSchoolModalOpen(false);
    setEditingSchool(null);
    setError(null);
    setUploadedLogoId(undefined);
    setPendingLogoDeletionIds([]);
    setMediaBusy(false);
    setCountry('');
    setContactPhone('');
  };

  const openAddModal = () => {
    setEditingSchool(null);
    setError(null);
    setUploadedLogoId(undefined);
    setPendingLogoDeletionIds([]);
    setMediaBusy(false);
    setCountry('');
    setContactPhone('');
    setIsSchoolModalOpen(true);
  };

  const openEditModal = (school: DashboardSchool) => {
    setEditingSchool(school);
    setError(null);
    setUploadedLogoId(undefined);
    setPendingLogoDeletionIds([]);
    setMediaBusy(false);
    setCountry(school.location);
    setContactPhone(school.contactPhone || '');
    setIsSchoolModalOpen(true);
  };

  const handleLogoStateChange = ({ hasChanges, mediaId, pendingRemovalIds }: MediaUploaderState) => {
    setUploadedLogoId(hasChanges ? mediaId : undefined);
    setPendingLogoDeletionIds(pendingRemovalIds);
  };

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const response = await organizationsApi.list();
        console.log('Fetched organizations:', response);
        setOrganizations(response.results);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch organizations:', err);
        
        // Check if it's a 404 error (no organizations exist yet)
        if (err && typeof err === 'object' && 'normalized' in err) {
          const apiError = err as { normalized: { code: string } };
          if (apiError.normalized.code === 'NOT_FOUND') {
            // 404 means no organizations exist yet
            setOrganizations([]);
            setError('No organization found. Please complete onboarding first.');
            setLoading(false);
            return;
          }
        }
        
        setError('Failed to load organizations');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  // Fetch branch and admin counts for each school.
  useEffect(() => {
    const fetchCounts = async () => {
      if (schools.length === 0) {
        setBranchCounts({});
        setAdminCounts({});
        return;
      }

      try {
        const [branchesResponse, branchAdmins] = await Promise.all([
          branchesApi.list(),
          branchAdminsApi.list(),
        ]);
        const nextBranchCounts: Record<string, number> = {};
        const nextAdminCounts: Record<string, number> = {};
        const branchToSchoolMap: Record<string, string> = {};

        branchesResponse.results.forEach((branch) => {
          nextBranchCounts[branch.school] = (nextBranchCounts[branch.school] || 0) + 1;
          branchToSchoolMap[branch.id] = branch.school;
        });

        branchAdmins.forEach((admin) => {
          const schoolId = branchToSchoolMap[admin.branch];
          if (!schoolId) {
            return;
          }

          nextAdminCounts[schoolId] = (nextAdminCounts[schoolId] || 0) + 1;
        });

        setBranchCounts(nextBranchCounts);
        setAdminCounts(nextAdminCounts);
      } catch (err) {
        console.error('Failed to fetch school counts:', err);
        // Silently fail - counts are helpful but should not block the page.
      }
    };

    void fetchCounts();
  }, [schools]);

  const handleSchoolSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editingSchool && organizations.length === 0) {
      setError('No organization found. Please complete onboarding to create an organization first.');
      return;
    }

    if (mediaBusy) {
      setError('Please wait for the logo upload to finish before saving.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const formData = new FormData(e.currentTarget);
      const normalizedCountry = normalizeCountryName(String(formData.get('country') ?? ''));
      const normalizedPhone = normalizeOptionalPhoneNumber(
        String(formData.get('contact_phone') ?? ''),
        'School contact phone'
      );
      const name = String(formData.get('name') ?? '');
      const description = String(formData.get('description') ?? '');
      const contactEmail = String(formData.get('contact_email') ?? '');
      const website = String(formData.get('website') ?? '');

      if (editingSchool) {
        const schoolData: UpdateSchoolRequest = {
          name,
          description,
          country: normalizedCountry,
          contact_email: contactEmail,
          contact_phone: normalizedPhone,
          website,
        };

        if (uploadedLogoId !== undefined) {
          schoolData.logo = uploadedLogoId;
        }

        await updateSchool(editingSchool.id, schoolData);
        void deleteQueuedMedia([...pendingLogoDeletionIds]);
      } else {
        const schoolData: CreateSchoolRequest = {
          organization: organizations[0].id,
          name,
          description,
          country: normalizedCountry,
          contact_email: contactEmail,
          contact_phone: normalizedPhone,
          website,
          status: 'ACTIVE',
        };

        if (uploadedLogoId) {
          schoolData.logo = uploadedLogoId;
        }

        await addSchool(schoolData);
      }

      closeSchoolModal();
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(`Failed to ${editingSchool ? 'update' : 'add'} school:`, err);
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
        setError(`Failed to ${editingSchool ? 'update' : 'add'} school. Please try again.`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = loading || schoolsLoading;
  
  // Show organization error if it exists and is not a "no schools" scenario
  const shouldShowError = error && error !== 'No organization found. Please complete onboarding first.';
  const displayError = shouldShowError ? error : schoolsError;

  return (
    <Layout 
      title="Educational Institution Management" 
      onAction={openAddModal}
      actionLabel="Add New School"
    >
      <div className="p-4 lg:p-8 pb-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-navy/20 border-t-primary-navy rounded-full animate-spin" />
          </div>
        ) : displayError ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-800 mb-4">{displayError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-sm text-primary-navy font-medium hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : schools.length === 0 ? (
          <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-dashed border-primary-navy/20 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 bg-primary-navy/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <School className="w-10 h-10 text-primary-navy" />
            </div>
            <h3 className="text-2xl font-bold text-primary-navy mb-3">No Schools Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started by adding your first school to the platform. You can manage multiple schools from this dashboard.
            </p>
            <button 
              onClick={openAddModal}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First School
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {schools.map((school, index) => (
              <motion.div
                key={school.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <SchoolCard 
                  school={school} 
                  branchCount={branchCounts[school.id] || 0}
                  adminCount={adminCounts[school.id] || 0}
                  onEdit={openEditModal}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal 
        isOpen={isSchoolModalOpen}
        onClose={closeSchoolModal}
        title={editingSchool ? `Edit ${editingSchool.name}` : 'Add New School'}
      >
        <form
          key={editingSchool?.id ?? 'new-school'}
          className="space-y-6"
          onSubmit={handleSchoolSubmit}
        >
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <MediaUploader
              imageOnly={true}
              accept="image/*"
              onUploaded={(mediaId) => setUploadedLogoId(mediaId)}
              onRemoved={() => setUploadedLogoId(null)}
              onStateChange={handleLogoStateChange}
              onBusyChange={setMediaBusy}
              initialMediaId={editingSchool?.logoMediaId ?? null}
              label="School Logo (Optional)"
              description={editingSchool ? 'Replace school logo here' : 'Drop school logo here'}
            />

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">School Name *</label>
              <input 
                name="name"
                type="text" 
                required
                defaultValue={editingSchool?.name ?? ''}
                placeholder="e.g. St. Andrews Excellence Academy"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Description</label>
              <textarea 
                name="description"
                defaultValue={editingSchool?.description ?? ''}
                placeholder="Briefly describe the school's mission and history..."
                rows={3}
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Contact Email *</label>
                <input 
                  name="contact_email"
                  type="email"
                  required
                  defaultValue={editingSchool?.contactEmail ?? ''}
                  placeholder="admin@school.edu"
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Website</label>
                <input 
                  name="website"
                  type="url" 
                  defaultValue={editingSchool?.website ?? ''}
                  placeholder="https://www.school.edu"
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Phone Number</label>
                <PhoneNumberField
                  name="contact_phone"
                  value={contactPhone}
                  onChange={setContactPhone}
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-3 text-sm focus-within:ring-2 focus-within:ring-primary-navy/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Country *</label>
                <CountrySearchInput
                  name="country"
                  value={country}
                  onChange={setCountry}
                  required
                  placeholder="Search for a country"
                  className="w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-3 text-sm focus-within:ring-2 focus-within:ring-primary-navy/20"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-4">
            <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-800 leading-relaxed">
                By {editingSchool ? 'updating' : 'adding'} this school, you confirm that all school data is encrypted and compliant with local educational regulations.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={submitting || mediaBusy}
              className="w-full bg-primary-navy text-white py-4 rounded-lg font-bold text-sm uppercase tracking-[0.1em] hover:opacity-90 transition-opacity mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting || mediaBusy ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mediaBusy ? 'Uploading Logo...' : editingSchool ? 'Saving Changes...' : 'Adding School...'}
                </div>
              ) : (
                editingSchool ? 'Save Changes' : 'Add School'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
