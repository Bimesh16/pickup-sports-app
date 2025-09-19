import React, { useState } from 'react';
import { Card, Button } from '../ui';
import { ChevronDown, ChevronUp, Download, Filter } from 'lucide-react';
import { PaymentReceipt } from './PaymentReceipt';

interface Transaction {
  id: string;
  amount: number;
  paymentMethod: string;
  gameTitle: string;
  gameDate?: string;
  playerName: string;
  timestamp?: string;
  date?: Date;
  status: 'completed' | 'pending' | 'failed';
}

interface PaymentHistoryProps {
  transactions?: Transaction[];
  loading?: boolean;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  transactions = [],
  loading = false,
}) => {
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  
  // Format date for display
  const formatDate = (dateInput: string | Date | undefined) => {
    if (!dateInput) return '-';
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return date.toLocaleDateString('en-NP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-amber-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };
  
  // Get payment method color
  const getPaymentMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'esewa':
        return '#60BB46';
      case 'khalti':
        return '#5C2D91';
      case 'cash':
        return '#4CAF50';
      default:
        return 'var(--brand-primary)';
    }
  };
  
  // Filter transactions based on status
  const filteredTransactions = filterStatus 
    ? transactions.filter(t => t.status === filterStatus)
    : transactions;
  
  // Handle download receipt
  const handleDownload = (transaction: Transaction) => {
    console.log('Downloading receipt for transaction:', transaction.id);
    alert('Receipt download started');
  };
  
  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Payment History</h2>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Card>
    );
  }
  
  if (transactions.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Payment History</h2>
        </div>
        <div className="text-center py-12 text-[var(--text-muted)]">
          <p>No payment history found</p>
        </div>
      </Card>
    );
  }
  
  if (showReceipt) {
    const transaction = transactions.find(t => t.id === showReceipt);
    if (!transaction) return null;
    
    return (
      <div className="p-4">
        <PaymentReceipt
          transactionId={transaction.id}
          amount={transaction.amount}
          paymentMethod={transaction.paymentMethod}
          date={transaction.date || new Date(transaction.timestamp || Date.now())}
          status={transaction.status}
          gameDetails={{
            title: transaction.gameTitle,
            location: 'Game Location',
            date: transaction.date || new Date(transaction.timestamp || Date.now()),
            organizer: 'Sports Nepal'
          }}
          playerName={transaction.playerName}
          onClose={() => setShowReceipt(null)}
        />
        <div className="mt-4 flex justify-center">
          <Button onClick={() => setShowReceipt(null)} variant="outline">
            Back to History
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Payment History</h2>
        <div className="relative">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setFilterStatus(filterStatus ? null : 'completed')}
          >
            <Filter size={16} />
            {filterStatus ? `Filter: ${filterStatus}` : 'Filter'}
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        {filteredTransactions.map((transaction) => (
          <div 
            key={transaction.id}
            className="border border-[var(--border)] rounded-lg overflow-hidden"
          >
            <div 
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-[var(--bg-muted)]"
              onClick={() => setExpandedTransaction(
                expandedTransaction === transaction.id ? null : transaction.id
              )}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: `${getPaymentMethodColor(transaction.paymentMethod)}15` }}
                >
                  <span className="text-lg">
                    {transaction.paymentMethod === 'eSewa' ? '💳' : 
                     transaction.paymentMethod === 'Khalti' ? '📱' : '💵'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{transaction.gameTitle}</p>
                  <p className="text-sm text-[var(--text-muted)]">{formatDate(transaction.timestamp)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-[var(--text-primary)]">NPR {transaction.amount}</p>
                  <p className={`text-sm ${getStatusColor(transaction.status)}`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </p>
                </div>
                {expandedTransaction === transaction.id ? 
                  <ChevronUp size={20} /> : 
                  <ChevronDown size={20} />
                }
              </div>
            </div>
            
            {expandedTransaction === transaction.id && (
              <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-muted)]">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Transaction ID</p>
                    <p className="font-medium text-[var(--text-primary)]">{transaction.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Payment Method</p>
                    <p className="font-medium text-[var(--text-primary)]">{transaction.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Date</p>
                    <p className="font-medium text-[var(--text-primary)]">{formatDate(transaction.timestamp)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Player</p>
                    <p className="font-medium text-[var(--text-primary)]">{transaction.playerName}</p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => handleDownload(transaction)}
                  >
                    <Download size={16} />
                    Download
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setShowReceipt(transaction.id)}
                  >
                    View Receipt
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};