export interface OnboardingDetailsRequest {
  tradeName: string;
  licenseNumber: string;
  taxId: string;
  displayName: string;
  ownerName: string;
  adminEmail: string;
  phoneNumber: string;
  region: string;
  city: string;
  address: string;
  licensePhoto?: string;
  coordinates?: { lat: number; lng: number };
}

export interface PlanSelectionRequest {
  planId: 'BASIC' | 'PRO' | 'UNLIMITED';
}

export interface OnboardingStatusResponse {
  step: 'details' | 'plan' | 'complete';
  organizationId?: string;
  referenceId?: string;
}
