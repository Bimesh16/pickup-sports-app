import React, { useState } from 'react';
import { Button, Card, Input } from '../ui';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface KhaltiPaymentProps {
  amount: number;
  gameId: string;
  onSuccess: (transactionId: string) => void;
  onCancel?: () => void;
}

export const KhaltiPayment: React.FC<KhaltiPaymentProps> = ({
  amount,
  gameId,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mobileNumber || mobileNumber.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }
    
    setError(null);
    setLoading(true);
    setStep('processing');
    
    // Simulate API call to Khalti
    setTimeout(() => {
      // Generate a random transaction ID
      const transactionId = 'KHALTI' + Math.random().toString(36).substring(2, 10).toUpperCase();
      setLoading(false);
      setStep('success');
      
      // Call onSuccess with the transaction ID
      setTimeout(() => {
        onSuccess(transactionId);
      }, 1500);
    }, 2000);
  };
  
  if (step === 'processing') {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <div className="text-center py-8">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-[#5C2D91]" />
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Processing Khalti Payment
          </h3>
          <p className="text-[var(--text-muted)]">
            Please wait while we process your payment...
          </p>
        </div>
      </Card>
    );
  }
  
  if (step === 'success') {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-[#5C2D91] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-[#5C2D91] mb-2">
            Payment Successful!
          </h3>
          <p className="text-[var(--text-muted)]">
            Your Khalti payment has been processed successfully.
          </p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-[#5C2D91]/15 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">💳</span>
        </div>
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
          Khalti Payment
        </h3>
        <p className="text-[var(--text-muted)]">
          Complete your payment using Khalti
        </p>
      </div>
      
      <div className="bg-[var(--bg-muted)] rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-[var(--text-muted)]">Amount:</span>
          <span className="text-xl font-bold text-[#5C2D91]">
            NPR {amount.toLocaleString()}
          </span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="mobile" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#6b7280',
              marginBottom: '4px'
            }}>Khalti Mobile Number</label>
            <Input
              id="mobile"
              type="tel"
              placeholder="98XXXXXXXX"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          
          <div className="pt-2 space-y-2">
            <Button
              type="submit"
              className="w-full bg-[#5C2D91] hover:bg-[#5C2D91]/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Pay with Khalti'
              )}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </form>
      
      <div className="mt-4 text-xs text-center text-[var(--text-muted)]">
        Secure payment powered by Khalti
      </div>
    </Card>
  );
};