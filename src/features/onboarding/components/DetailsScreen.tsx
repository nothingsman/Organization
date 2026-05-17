
import { useState, type FormEvent, type ChangeEvent, useRef } from 'react';
import { Building2, User, MapPin, ChevronRight, Briefcase, Phone, Globe, Upload, FileUp, X, Check } from 'lucide-react';
import { OrganizationDetails } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY);

interface DetailsScreenProps {
  onSubmit: (data: OrganizationDetails) => void;
}

export default function DetailsScreen({ onSubmit }: DetailsScreenProps) {
  const [formData, setFormData] = useState<OrganizationDetails>({
    tradeName: '',
    licenseNumber: '',
    taxId: '',
    displayName: '',
    licensePhoto: undefined,
    ownerName: '',
    adminEmail: '',
    phoneNumber: '',
    region: '',
    city: '',
    address: '',
    coordinates: { lat: 9.03, lng: 38.74 } // Default to Addis Ababa
  });

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof OrganizationDetails) => (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, licensePhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, licensePhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const onMapClick = (e: any) => {
    if (e.detail?.latLng) {
      setFormData(prev => ({
        ...prev,
        coordinates: { lat: e.detail.latLng.lat, lng: e.detail.latLng.lng }
      }));
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary-navy">Institutional Details</h2>
        <p className="text-text-muted">Provide the official identity and contact information for your school.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        {/* Business Identity */}
        <div className="card-elevated space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
            <div className="p-3 bg-blue-50 rounded-[--radius-school]">
              <Briefcase className="w-6 h-6 text-primary-navy" />
            </div>
            <h3 className="text-xl font-bold text-primary-navy">Business Identity</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Trade Name</label>
              <input 
                className="input-field" 
                required 
                value={formData.tradeName}
                onChange={updateField('tradeName')}
                placeholder="e.g. Addis Ababa Academy"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">License Number</label>
              <input 
                className="input-field" 
                required 
                value={formData.licenseNumber}
                onChange={updateField('licenseNumber')}
                placeholder="REG-2024-XXXX"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Display Name</label>
              <input 
                className="input-field" 
                required 
                value={formData.displayName}
                onChange={updateField('displayName')}
                placeholder="Alternative name for app UI"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Tax Identification Number (TIN)</label>
              <input 
                className="input-field" 
                required 
                value={formData.taxId}
                onChange={updateField('taxId')}
                placeholder="10-digit TIN"
              />
            </div>
          </div>
        </div>

        {/* Business Verification (New Section) */}
        <div className="card-elevated space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
            <div className="p-3 bg-blue-50 rounded-[--radius-school]">
              <FileUp className="w-6 h-6 text-primary-navy" />
            </div>
            <h3 className="text-xl font-bold text-primary-navy">Business Verification</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-text-muted">Please upload a clear photo or PDF scan of your current business license.</p>
            
            <div 
              className={`relative border-2 border-dashed rounded-[--radius-school] p-8 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer ${
                dragActive ? 'border-primary-navy bg-primary-navy/5' : 'border-gray-200 hover:border-primary-navy hover:bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept="image/*,application/pdf"
                onChange={handleFileChange}
              />
              
              {formData.licensePhoto ? (
                <div className="w-full flex flex-col items-center gap-4">
                  {formData.licensePhoto.startsWith('data:image') ? (
                    <img src={formData.licensePhoto} alt="License Preview" className="h-48 object-contain rounded border" />
                  ) : (
                    <div className="p-4 bg-green-50 text-green-700 rounded-full flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      Document Uploaded
                    </div>
                  )}
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({ ...prev, licensePhoto: undefined }));
                    }}
                    className="text-xs text-red-600 hover:underline flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Remove file
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-gray-100 rounded-full">
                    <Upload className="w-8 h-8 text-text-muted" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-text-main">Click or drag license photo here</p>
                    <p className="text-xs text-text-muted mt-1">PNG, JPG or PDF up to 10MB</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card-elevated space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
            <div className="p-3 bg-blue-50 rounded-[--radius-school]">
              <User className="w-6 h-6 text-primary-navy" />
            </div>
            <h3 className="text-xl font-bold text-primary-navy">Contact Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Owner Name</label>
              <input 
                className="input-field" 
                required 
                value={formData.ownerName}
                onChange={updateField('ownerName')}
                placeholder="Full legal name of owner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Official Email Address</label>
              <input 
                type="email"
                className="input-field" 
                required 
                value={formData.adminEmail}
                onChange={updateField('adminEmail')}
                placeholder="info@school.edu"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-text-muted">Contact Phone Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">+251</span>
                <input 
                  type="tel"
                  className="input-field pl-16" 
                  required 
                  value={formData.phoneNumber}
                  onChange={updateField('phoneNumber')}
                  placeholder="9XXXXXXXX"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Business Location */}
        <div className="card-elevated space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
            <div className="p-3 bg-blue-50 rounded-[--radius-school]">
              <MapPin className="w-6 h-6 text-primary-navy" />
            </div>
            <h3 className="text-xl font-bold text-primary-navy">Business Location</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Region</label>
              <input 
                className="input-field" 
                required 
                value={formData.region}
                onChange={updateField('region')}
                placeholder="e.g. Addis Ababa"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">City / Sub-city</label>
              <input 
                className="input-field" 
                required 
                value={formData.city}
                onChange={updateField('city')}
                placeholder="e.g. Bole"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-text-muted">Specific Address / Building</label>
              <input 
                className="input-field" 
                required 
                value={formData.address}
                onChange={updateField('address')}
                placeholder="Street name, Building No."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Google Map Location</label>
            <p className="text-xs text-text-muted mb-2">Click on the map to pin your exact location.</p>
            <div className="w-full h-80 rounded-[--radius-school] overflow-hidden border border-gray-200 relative">
              {!hasValidKey ? (
                <div className="absolute inset-0 bg-gray-50 flex items-center justify-center p-8 text-center flex-col gap-4">
                  <div className="p-3 bg-white rounded-full shadow-sm">
                    <MapPin className="w-8 h-8 text-gray-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-main">Maps API Key Required</p>
                    <p className="text-xs text-text-muted mt-1 max-w-[280px]">Please enter your <code>GOOGLE_MAPS_PLATFORM_KEY</code> in the Secrets panel to enable the location picker.</p>
                  </div>
                </div>
              ) : (
                <APIProvider apiKey={API_KEY} version="weekly">
                  <Map
                    defaultCenter={formData.coordinates}
                    defaultZoom={15}
                    onClick={onMapClick}
                    mapId="DEMO_MAP_ID"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: '100%', height: '100%' }}
                  >
                    {formData.coordinates && (
                      <AdvancedMarker position={formData.coordinates}>
                        <Pin background="#1A237E" glyphColor="#fff" borderColor="#1A237E" />
                      </AdvancedMarker>
                    )}
                  </Map>
                </APIProvider>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="btn-primary px-10">
            Submit Details
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </form>
    </div>
  );
}
