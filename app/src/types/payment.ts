export interface PaymentProvider {
  id: string;
  name: string;
  nameNepali?: string;
  icon: string;
  enabled: boolean;
  supportedCurrencies: string[];
  fees: PaymentFees;
}

export interface PaymentFees {
  fixed: number;
  percentage: number;
  minimum: number;
  maximum: number;
}

export interface PaymentRequest {
  gameId: number;
  amount: number;
  currency: string;
  provider: 'ESEWA' | 'KHALTI';
  description?: string;
}

export interface PaymentResponse {
  paymentId: string;
  status: PaymentStatus;
  redirectUrl?: string;
  qrCode?: string;
  instructions?: string;
  expiresAt: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export interface PaymentTransaction {
  id: string;
  gameId: number;
  userId: number;
  amount: number;
  currency: string;
  provider: string;
  status: PaymentStatus;
  referenceNumber?: string;
  failureReason?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PaymentVerification {
  paymentId: string;
  status: PaymentStatus;
  transaction?: PaymentTransaction;
  receiptUrl?: string;
}

// eSewa Specific Types
export interface ESewaPaymentRequest extends PaymentRequest {
  successUrl: string;
  failureUrl: string;
  productCode: string;
}

export interface ESewaVerificationRequest {
  oid: string;
  amt: number;
  refId: string;
}

// Khalti Specific Types
export interface KhaltiPaymentRequest extends PaymentRequest {
  returnUrl: string;
  websiteUrl: string;
  purchaseOrderId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface KhaltiVerificationRequest {
  pidx: string;
}