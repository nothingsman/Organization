import React, { useState } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import Drawer from '../components/Drawer';
import { Settings as SettingsIcon, Shield, Bell, User, Globe, Lock, Camera, Mail, MessageSquare, Phone, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Settings() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [orgName, setOrgName] = useState('Acme Academy');
  const [orgId, setOrgId] = useState('19420-OR');

  const [ownerName, setOwnerName] = useState('Sarah Jenkins');
  const [ownerTitle, setOwnerTitle] = useState('Chief Executive Officer');
  const [ownerEmail, setOwnerEmail] = useState('sarah.jenkins@acmeacademy.edu');

  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setOrgName(formData.get('name') as string);
    setOrgId(formData.get('id') as string);
    setIsEditModalOpen(false);
  };

  const handleUpdateOwner = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setOwnerName(formData.get('name') as string);
    setOwnerTitle(formData.get('title') as string);
    setOwnerEmail(formData.get('email') as string);
    setIsOwnerModalOpen(false);
  };

  const handleDeleteOrganization = () => {
    console.log(`Deleting organization: ${orgName}`);
    setIsDeleteModalOpen(false);
  };

  const settingsSections = [
    { icon: Bell, title: 'Notifications', desc: 'Control alerts for enrollment, billing, and system updates' },
  ];

  return (
    <Layout title="Organization Settings">
      <div className="p-4 lg:p-8 max-w-4xl space-y-6 lg:space-y-8">
        <div className="grid grid-cols-1 gap-6 lg:gap-8">
          <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 lg:p-8 border-b border-outline-variant flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-16 lg:w-20 h-16 lg:h-20 rounded-xl bg-surface-container flex items-center justify-center border border-outline-variant shrink-0">
                <SettingsIcon className="w-8 lg:w-10 h-8 lg:h-10 text-primary-navy/20" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg lg:text-xl font-bold text-primary-navy truncate">{orgName}</h2>
                <p className="text-xs lg:text-sm text-primary-navy/40 font-medium">Enterprise Organization • ID: {orgId}</p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(true)}
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
                  <h3 className="text-xs lg:text-sm font-bold uppercase tracking-[0.15em] text-primary-navy mb-1">Organization Owner</h3>
                  <p className="text-[10px] lg:text-xs text-primary-navy/40 font-medium">Primary administrative contact</p>
                </div>
                <Shield className="w-5 h-5 text-primary-navy/20" />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary-navy/5 flex items-center justify-center font-bold text-primary-navy shrink-0">
                    {ownerName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-primary-navy truncate">{ownerName}</h3>
                    <p className="text-xs text-primary-navy/40 font-medium truncate">{ownerTitle}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOwnerModalOpen(true)}
                  className="w-full sm:w-auto text-primary-navy/40 hover:text-primary-navy text-[10px] font-bold uppercase tracking-widest transition-colors text-left sm:text-right"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex gap-4 w-full md:w-auto">
              <div className="p-3 bg-white rounded-lg shrink-0">
                <Lock className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-900">Danger Zone</h4>
                <p className="text-xs text-rose-700/60 font-medium mt-0.5 line-clamp-2">Permanent actions related to your organization data</p>
              </div>
            </div>
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full md:w-auto bg-rose-600 text-white px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 active:scale-95"
            >
              Offboard Organization
            </button>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Edit Organization Profile"
      >
        <form className="space-y-6" onSubmit={handleUpdateProfile}>
          <div className="flex flex-col items-center gap-4 mb-4 lg:mb-8">
            <div className="relative group">
              <div className="w-20 lg:w-24 h-20 lg:h-24 rounded-2xl bg-surface-container flex items-center justify-center border border-outline-variant overflow-hidden">
                <SettingsIcon className="w-10 lg:w-12 h-10 lg:h-12 text-primary-navy/20" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <button type="button" className="absolute -bottom-2 -right-2 p-2 bg-white border border-outline-variant rounded-lg shadow-sm hover:bg-surface-container transition-colors">
                <Camera className="w-4 h-4 text-primary-navy" />
              </button>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/40">Institution Logo</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Organization Name</label>
              <input 
                name="name"
                type="text" 
                required
                defaultValue={orgName}
                placeholder="e.g. Acme Academy"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Organization ID</label>
              <input 
                name="id"
                type="text" 
                required
                defaultValue={orgId}
                placeholder="e.g. 19420-OR"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Contact Email</label>
              <input 
                type="email" 
                placeholder="admin@acmeacademy.edu"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-primary-navy text-white py-4 rounded-lg font-bold text-sm uppercase tracking-[0.1em] hover:opacity-90 transition-opacity active:scale-95">
            Save Changes
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
                  By offboarding <strong>{orgName}</strong>, you will permanently terminate access for all associated entities.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Type "CONFIRM" to proceed</p>
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

      <Modal 
        isOpen={isOwnerModalOpen} 
        onClose={() => setIsOwnerModalOpen(false)} 
        title="Edit Owner Profile"
      >
        <form className="space-y-6" onSubmit={handleUpdateOwner}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Full Name</label>
              <input 
                name="name"
                type="text" 
                required
                defaultValue={ownerName}
                placeholder="e.g. Sarah Jenkins"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Professional Title</label>
              <input 
                name="title"
                type="text" 
                required
                defaultValue={ownerTitle}
                placeholder="e.g. CEO"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary-navy/60">Email Address</label>
              <input 
                name="email"
                type="email" 
                required
                defaultValue={ownerEmail}
                placeholder="sarah.jenkins@acmeacademy.edu"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-primary-navy text-white py-4 rounded-lg font-bold text-sm uppercase tracking-[0.1em] hover:opacity-90 transition-opacity active:scale-95">
            Update Owner Details
          </button>
        </form>
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
