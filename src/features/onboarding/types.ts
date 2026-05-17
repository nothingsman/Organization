export enum OnboardingStep {
  AUTH = 'AUTH',
  DETAILS = 'DETAILS',
  PLANS = 'PLANS',
  STATUS = 'STATUS'
}

export interface OrganizationDetails {
  // Business Identity
  tradeName: string;
  licenseNumber: string;
  taxId: string;
  displayName: string;
  licensePhoto?: string;
  
  // Contact Information
  ownerName: string;
  adminEmail: string;
  phoneNumber: string;
  
  // Business Location
  region: string;
  city: string;
  address: string;
  coordinates?: { lat: number; lng: number };
}

export type SubscriptionTier = 'BASIC' | 'PRO' | 'UNLIMITED';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  priceETB: number;
  features: string[];
  isPopular?: boolean;
}
