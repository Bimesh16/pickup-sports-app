import { apiService } from './api';
import { 
  PaymentRequest, 
  PaymentResponse, 
  PaymentTransaction, 
  PaymentVerification, 
  ESewaPaymentRequest, 
  ESewaVerificationRequest, 
  KhaltiPaymentRequest, 
  KhaltiVerificationRequest 
} from '@/types/payment';

class PaymentService {
  // Generic Payment Methods
  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    return await apiService.post<PaymentResponse>('/payments/initiate', request);
  }

  async verifyPayment(paymentId: string): Promise<PaymentVerification> {
    return await apiService.get<PaymentVerification>(`/payments/${paymentId}/verify`);
  }

  async getPaymentHistory(): Promise<PaymentTransaction[]> {
    return await apiService.get<PaymentTransaction[]>('/payments/history');
  }

  async getGamePayments(gameId: number): Promise<PaymentTransaction[]> {
    return await apiService.get<PaymentTransaction[]>(`/games/${gameId}/payments`);
  }

  // eSewa Integration (Nepal)
  async initiateESewaPayment(request: ESewaPaymentRequest): Promise<PaymentResponse> {
    return await apiService.post<PaymentResponse>('/api/v1/nepal/payment/esewa/initiate', {
      gameId: request.gameId,
      amount: request.amount,
      currency: request.currency,
      description: request.description,
      successUrl: request.successUrl,
      failureUrl: request.failureUrl,
      productCode: request.productCode
    });
  }

  async verifyESewaPayment(request: ESewaVerificationRequest): Promise<PaymentVerification> {
    return await apiService.post<PaymentVerification>('/api/v1/nepal/payment/esewa/verify', request);
  }

  // Khalti Integration (Nepal)
  async initiateKhaltiPayment(request: KhaltiPaymentRequest): Promise<PaymentResponse> {
    return await apiService.post<PaymentResponse>('/api/v1/nepal/payment/khalti/initiate', {
      gameId: request.gameId,
      amount: request.amount,
      currency: request.currency,
      description: request.description,
      returnUrl: request.returnUrl,
      websiteUrl: request.websiteUrl,
      purchaseOrderId: request.purchaseOrderId,
      customerInfo: request.customerInfo
    });
  }

  async verifyKhaltiPayment(request: KhaltiVerificationRequest): Promise<PaymentVerification> {
    return await apiService.post<PaymentVerification>('/api/v1/nepal/payment/khalti/verify', request);
  }

  // Game-specific Payment Methods
  async payForGame(gameId: number, provider: 'ESEWA' | 'KHALTI'): Promise<PaymentResponse> {
    const request: PaymentRequest = {
      gameId,
      amount: 0, // Will be calculated by backend
      currency: 'NPR',
      provider,
      description: `Payment for Game #${gameId}`
    };

    if (provider === 'ESEWA') {
      return this.initiateESewaPayment({
        ...request,
        successUrl: `pickup-sports://payment/success`,
        failureUrl: `pickup-sports://payment/failure`,
        productCode: `GAME_${gameId}`
      } as ESewaPaymentRequest);
    } else {
      return this.initiateKhaltiPayment({
        ...request,
        returnUrl: `pickup-sports://payment/return`,
        websiteUrl: 'https://pickupsports.com.np',
        purchaseOrderId: `GAME_${gameId}_${Date.now()}`,
        customerInfo: {
          name: 'User', // This should come from user context
          email: 'user@example.com',
          phone: '9800000000'
        }
      } as KhaltiPaymentRequest);
    }
  }

  // Payment Status Tracking
  async getPaymentStatus(paymentId: string): Promise<PaymentVerification> {
    return await apiService.get<PaymentVerification>(`/payments/${paymentId}/status`);
  }

  // Refund Methods
  async requestRefund(transactionId: string, reason: string): Promise<void> {
    await apiService.post(`/payments/${transactionId}/refund`, {
      reason
    });
  }

  async getRefundStatus(transactionId: string): Promise<any> {
    return await apiService.get<any>(`/payments/${transactionId}/refund/status`);
  }

  // Payment Analytics
  async getPaymentAnalytics(): Promise<any> {
    return await apiService.get<any>('/payments/analytics');
  }

  async getGamePaymentSummary(gameId: number): Promise<any> {
    return await apiService.get<any>(`/games/${gameId}/payment-summary`);
  }
}

export const paymentService = new PaymentService();