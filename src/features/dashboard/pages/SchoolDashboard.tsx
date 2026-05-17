import React, { useState } from 'react';
import Layout from '../components/Layout';
import SchoolCard from '../components/SchoolCard';
import Modal from '../components/Modal';
import { MOCK_SCHOOLS } from '../constants';
import { useSchools } from '@/lib/hooks/useSchools';
import { Upload, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function SchoolDashboard() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { schools, addSchool } = useSchools();

  const handleAddSchool = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newSchool = {
      id: `s${Date.now()}`,
      name: formData.get('name') as string,
      logo: `https://picsum.photos/seed/${Date.now()}/800/600`,
      location: formData.get('country') as string,
      studentCount: 0,
      staffCount: 0,
      description: formData.get('description') as string,
      website: formData.get('website') as string
    };

    addSchool(newSchool);
    setIsAddModalOpen(false);
  };

  return (
    <Layout 
      title="Educational Institution Management" 
      onAction={() => setIsAddModalOpen(true)}
      actionLabel="Add New School"
    >
      <div className="p-4 lg:p-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {schools.map((school, index) => (
            <motion.div
              key={school.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <SchoolCard school={school} />
            </motion.div>
          ))}
        </div>
      </div>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Add New Institution"
      >
        <form className="space-y-6" onSubmit={handleAddSchool}>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Institutional Logo</label>
              <div className="border-2 border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center bg-surface-container/50 hover:bg-surface-container transition-colors cursor-pointer group">
                <Upload className="w-8 h-8 text-primary-navy/40 group-hover:text-primary-navy transition-colors mb-4" />
                <span className="text-sm font-bold">Drop institution logo here</span>
                <span className="text-xs text-primary-navy/40 mt-1">PNG, JPG up to 10MB</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">School Name</label>
              <input 
                name="name"
                type="text" 
                required
                placeholder="e.g. St. Andrews Excellence Academy"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Description</label>
              <textarea 
                name="description"
                placeholder="Briefly describe the institution's mission and history..."
                rows={3}
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Contact Email</label>
                <input 
                  type="email" 
                  placeholder="admin@school.edu"
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Website (Optional)</label>
                <input 
                  name="website"
                  type="url" 
                  placeholder="https://www.school.edu"
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Country</label>
                <select name="country" className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 appearance-none">
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>United States</option>
                  <option>Australia</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-4">
            <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-800 leading-relaxed">
                By adding this institution, you confirm that all school data is encrypted and compliant with local educational regulations.
              </p>
            </div>

            <button type="submit" className="w-full bg-primary-navy text-white py-4 rounded-lg font-bold text-sm uppercase tracking-[0.1em] hover:opacity-90 transition-opacity mt-2">
              Finalize Onboarding
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
