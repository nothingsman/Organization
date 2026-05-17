export interface BillingInfo {
  currentPlan: SubscriptionPlanInfo;
  paymentMethod: PaymentMethod;
  billingContact: BillingContact;
  nextRenewalDate: string;
}

export interface SubscriptionPlanInfo {
  id: string;
  name: string;
  priceMonthly: number | null;
}

export interface PaymentMethod {
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface BillingContact {
  email: string;
  taxId?: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl?: string;
}

export interface InvoicesResponse {
  invoices: Invoice[];
  total: number;
}

export interface UpdatePlanRequest {
  planId: string;
}
