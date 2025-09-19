import React, { useState } from 'react';
import { Button, Card, Tabs } from '../../components/ui';
import { ESewaPayment } from '../../components/payments/ESewaPayment';
import { KhaltiPayment } from '../../components/payments/KhaltiPayment';
import { PaymentHistory } from '../../components/payments/PaymentHistory';
import { ESewaConfirmation } from '../../components/payments/ESewaConfirmation';
import { KhaltiConfirmation } from '../../components/payments/KhaltiConfirmation';
import { CashConfirmation } from '../../components/payments/CashConfirmation';
import { PaymentSplitter, SplitDetail } from '../../components/payments/PaymentSplitter';

// Mock transaction data
const mockTransactions = [
  {
    id: 'ESEWA123456',
    amount: 500,
    paymentMethod: 'eSewa',
    date: new Date(2023, 5, 15),
    status: 'completed' as const,
    gameTitle: 'Weekend Football',
    playerName: 'John Doe',
  },
  {
    id: 'KHALTI789012',
    amount: 750,
    paymentMethod: 'Khalti',
    date: new Date(2023, 5, 10),
    status: 'completed' as const,
    gameTitle: 'Basketball Tournament',
    playerName: 'Jane Smith',
  },
  {
    id: 'CASH345678',
    amount: 300,
    paymentMethod: 'Cash',
    date: new Date(2023, 5, 5),
    status: 'pending' as const,
    gameTitle: 'Cricket Match',
    playerName: 'Mike Johnson',
  },
];

// Mock participants data
const mockParticipants = [
  {
    id: 1,
    username: 'johndoe',
    displayName: 'John Doe',
    avatar: '/images/avatars/john.jpg',
    isHost: true,
  },
  {
    id: 2,
    username: 'janesmith',
    displayName: 'Jane Smith',
    avatar: '/images/avatars/jane.jpg',
  },
  {
    id: 3,
    username: 'mikejohnson',
    displayName: 'Mike Johnson',
  },
  {
    id: 4,
    username: 'saralee',
    displayName: 'Sara Lee',
  }
];

const PaymentDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('payment-flow');
  const [paymentStep, setPaymentStep] = useState<'provider-selection' | 'payment-form' | 'success' | 'split-payment'>('provider-selection');
  const [selectedProviderId, setSelectedProviderId] = useState<'esewa' | 'khalti' | 'cash' | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [splitDetails, setSplitDetails] = useState<SplitDetail[]>([]);
  const [showSplitOption, setShowSplitOption] = useState(false);
  
  const handleProviderSelect = (providerId: 'esewa' | 'khalti' | 'cash') => {
    setSelectedProviderId(providerId);
    
    // If split option is enabled, go to split payment step first
    if (showSplitOption) {
      setPaymentStep('split-payment');
    } else {
      setPaymentStep('payment-form');
    }
  };
  
  const handlePaymentSuccess = (txnId: string) => {
    setTransactionId(txnId);
    setPaymentStep('success');
  };
  
  const handleCashPayment = (txnId: string) => {
    setTransactionId(txnId);
    setPaymentStep('success');
  };
  
  const handleBack = () => {
    if (paymentStep === 'payment-form') {
      if (showSplitOption) {
        setPaymentStep('split-payment');
      } else {
        setPaymentStep('provider-selection');
        setSelectedProviderId(null);
      }
    } else if (paymentStep === 'split-payment') {
      setPaymentStep('provider-selection');
      setSelectedProviderId(null);
    } else if (paymentStep === 'success') {
      setPaymentStep('provider-selection');
      setSelectedProviderId(null);
      setTransactionId(null);
    }
  };
  
  const handleReset = () => {
    setPaymentStep('provider-selection');
    setSelectedProviderId(null);
    setTransactionId(null);
    setSplitDetails([]);
  };
  
  const handleSplitConfirm = (details: SplitDetail[]) => {
    setSplitDetails(details);
    setPaymentStep('payment-form');
  };
  
  const handleToggleSplitOption = () => {
    setShowSplitOption(!showSplitOption);
  };
  
  const tabsData = [
    {
      id: 'payment-flow',
      label: 'Payment Flow',
      content: (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {paymentStep === 'provider-selection' && 'Select Payment Method'}
                {paymentStep === 'payment-form' && 'Complete Payment'}
                {paymentStep === 'split-payment' && 'Split Payment'}
                {paymentStep === 'success' && 'Payment Confirmation'}
              </h2>
              
              {paymentStep === 'provider-selection' && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-[var(--text-muted)]">Enable Split Payment</label>
                  <input 
                    type="checkbox" 
                    checked={showSplitOption}
                    onChange={handleToggleSplitOption}
                    className="w-4 h-4 accent-[var(--brand-primary)]"
                  />
                </div>
              )}
            </div>
            
            {/* Payment provider selection */}
            {paymentStep === 'provider-selection' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-[#60BB46]"
                  onClick={() => handleProviderSelect('esewa')}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-[#60BB46]/15 rounded-full flex items-center justify-center mb-3">
                      <span className="text-3xl">💳</span>
                    </div>
                    <h3 className="font-medium text-[var(--text-primary)]">eSewa</h3>
                    <p className="text-sm text-[var(--text-muted)]">Pay with eSewa wallet</p>
                  </div>
                </Card>
                
                <Card 
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-[#5C2D91]"
                  onClick={() => handleProviderSelect('khalti')}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-[#5C2D91]/15 rounded-full flex items-center justify-center mb-3">
                      <span className="text-3xl">📱</span>
                    </div>
                    <h3 className="font-medium text-[var(--text-primary)]">Khalti</h3>
                    <p className="text-sm text-[var(--text-muted)]">Pay with Khalti wallet</p>
                  </div>
                </Card>
                
                <Card 
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-green-500"
                  onClick={() => handleProviderSelect('cash')}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-3">
                      <span className="text-3xl">💵</span>
                    </div>
                    <h3 className="font-medium text-[var(--text-primary)]">Cash</h3>
                    <p className="text-sm text-[var(--text-muted)]">Pay with cash</p>
                  </div>
                </Card>
              </div>
            )}

            {/* Split payment step */}
            {paymentStep === 'split-payment' && (
              <div className="max-w-2xl mx-auto">
                <PaymentSplitter
                  totalAmount={500}
                  participants={mockParticipants}
                  currentUserId={1}
                  onSplitConfirm={handleSplitConfirm}
                  onCancel={handleBack}
                />
              </div>
            )}

            {/* Payment forms */}
            {paymentStep === 'payment-form' && selectedProviderId === 'esewa' && (
              <div className="max-w-md mx-auto">
                <ESewaPayment
                  amount={splitDetails.length > 0 
                    ? splitDetails.find(d => d.userId === 1)?.amount || 500 
                    : 500}
                  gameId="DEMO123"
                  onSuccess={handlePaymentSuccess}
                  onCancel={handleBack}
                />
              </div>
            )}

            {paymentStep === 'payment-form' && selectedProviderId === 'khalti' && (
              <div className="max-w-md mx-auto">
                <KhaltiPayment
                  amount={splitDetails.length > 0 
                    ? splitDetails.find(d => d.userId === 1)?.amount || 500 
                    : 500}
                  gameId="DEMO123"
                  onSuccess={handlePaymentSuccess}
                  onCancel={handleBack}
                />
              </div>
            )}

            {paymentStep === 'payment-form' && selectedProviderId === 'cash' && (
              <div className="max-w-md mx-auto">
                <div className="text-center">
                  <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">💵</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-[var(--text-primary)]">Cash Payment</h3>
                  <p className="text-[var(--text-muted)] mb-6">
                    Please pay NPR {splitDetails.length > 0 
                      ? splitDetails.find(d => d.userId === 1)?.amount || 500 
                      : 500} in cash to the organizer.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleBack}>
                      Back
                    </Button>
                    <Button onClick={() => handleCashPayment('CASH' + Date.now())}>
                      Confirm Payment
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Success confirmations */}
            {paymentStep === 'success' && selectedProviderId === 'esewa' && transactionId && (
              <div className="max-w-md mx-auto">
                <ESewaConfirmation
                  transactionId={transactionId}
                  amount={splitDetails.length > 0 
                    ? splitDetails.find(d => d.userId === 1)?.amount || 500 
                    : 500}
                  playerName="John Doe"
                  gameDetails={{
                    title: "Weekend Football",
                    location: "Kathmandu Stadium",
                    date: new Date(),
                    organizer: "Sports Nepal"
                  }}
                  onClose={handleReset}
                />
              </div>
            )}
            
            {paymentStep === 'success' && selectedProviderId === 'khalti' && transactionId && (
              <div className="max-w-md mx-auto">
                <KhaltiConfirmation
                  transactionId={transactionId}
                  amount={splitDetails.length > 0 
                    ? splitDetails.find(d => d.userId === 1)?.amount || 500 
                    : 500}
                  playerName="John Doe"
                  gameDetails={{
                    title: "Weekend Football",
                    location: "Kathmandu Stadium",
                    date: new Date(),
                    organizer: "Sports Nepal"
                  }}
                  onClose={handleReset}
                />
              </div>
            )}
            
            {paymentStep === 'success' && selectedProviderId === 'cash' && transactionId && (
              <div className="max-w-md mx-auto">
                <CashConfirmation
                  transactionId={transactionId}
                  amount={splitDetails.length > 0 
                    ? splitDetails.find(d => d.userId === 1)?.amount || 500 
                    : 500}
                  playerName="John Doe"
                  gameDetails={{
                    title: "Weekend Football",
                    location: "Kathmandu Stadium",
                    date: new Date(),
                    organizer: "Sports Nepal"
                  }}
                  onClose={handleReset}
                />
              </div>
            )}
          </Card>
        </div>
      )
    },
    {
      id: 'payment-history',
      label: 'Payment History',
      content: <PaymentHistory transactions={mockTransactions} />
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-[var(--text-primary)]">Payment Integration Demo</h1>
      
      <Tabs tabs={tabsData} defaultTab="payment-flow" />
    </div>
  );
};

export default PaymentDemo;