import React, { useState } from 'react';
import { Card } from '../../components/ui';
import { PaymentHistory as PaymentHistoryComponent } from '../../components/payments/PaymentHistory';

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
  {
    id: 'ESEWA987654',
    amount: 450,
    paymentMethod: 'eSewa',
    date: new Date(2023, 4, 28),
    status: 'completed' as const,
    gameTitle: 'Volleyball Game',
    playerName: 'Sarah Lee',
  },
  {
    id: 'KHALTI654321',
    amount: 600,
    paymentMethod: 'Khalti',
    date: new Date(2023, 4, 22),
    status: 'completed' as const,
    gameTitle: 'Tennis Match',
    playerName: 'David Kim',
  },
  {
    id: 'CASH112233',
    amount: 250,
    paymentMethod: 'Cash',
    date: new Date(2023, 4, 15),
    status: 'completed' as const,
    gameTitle: 'Badminton Game',
    playerName: 'Emily Chen',
  },
];

const PaymentHistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  const filteredTransactions = activeTab === 'all' 
    ? mockTransactions 
    : mockTransactions.filter(t => 
        activeTab === 'completed' 
          ? t.status === 'completed' 
          : t.status === 'pending'
      );
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-[var(--text-primary)]">Payment History</h1>
      
      <div className="mb-6">
        <div className="flex border-b border-[var(--border)]">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'text-[var(--brand-primary)] border-b-2 border-[var(--brand-primary)]' : 'text-[var(--text-muted)]'}`}
          >
            All Transactions
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 font-medium ${activeTab === 'completed' ? 'text-[var(--brand-primary)] border-b-2 border-[var(--brand-primary)]' : 'text-[var(--text-muted)]'}`}
          >
            Completed
          </button>
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-medium ${activeTab === 'pending' ? 'text-[var(--brand-primary)] border-b-2 border-[var(--brand-primary)]' : 'text-[var(--text-muted)]'}`}
          >
            Pending
          </button>
        </div>
      </div>
      
      <Card className="p-6">
        <PaymentHistoryComponent transactions={filteredTransactions} />
      </Card>
      
      <div className="mt-8">
        <Card className="p-6 bg-gradient-to-r from-[var(--brand-primary)]/5 to-[var(--brand-secondary)]/5">
          <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Payment Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--bg-surface)] p-4 rounded-lg border border-[var(--border)]">
              <p className="text-sm text-[var(--text-muted)]">Total Spent</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                NPR {mockTransactions.reduce((sum, t) => sum + t.amount, 0)}
              </p>
            </div>
            <div className="bg-[var(--bg-surface)] p-4 rounded-lg border border-[var(--border)]">
              <p className="text-sm text-[var(--text-muted)]">Transactions</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{mockTransactions.length}</p>
            </div>
            <div className="bg-[var(--bg-surface)] p-4 rounded-lg border border-[var(--border)]">
              <p className="text-sm text-[var(--text-muted)]">Pending Payments</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {mockTransactions.filter(t => t.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentHistoryPage;