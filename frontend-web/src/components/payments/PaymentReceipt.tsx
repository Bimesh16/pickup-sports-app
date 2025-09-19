import React from 'react';
import { Button, Card } from '../ui';
import { Download, Share2 } from 'lucide-react';

export interface PaymentReceiptProps {
  transactionId: string;
  amount: number;
  paymentMethod: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
  gameDetails?: {
    title: string;
    location: string;
    date: Date;
    organizer: string;
  };
  playerName: string;
  onClose?: () => void;
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  transactionId,
  amount,
  paymentMethod,
  date,
  status,
  gameDetails,
  playerName,
  onClose,
}) => {
  const handleDownload = () => {
    // In a real implementation, this would generate a PDF receipt
    console.log('Downloading receipt for transaction:', transactionId);
    alert('Receipt download started');
  };

  const handleShare = () => {
    // In a real implementation, this would open a share dialog
    console.log('Sharing receipt for transaction:', transactionId);
    
    if (navigator.share) {
      navigator.share({
        title: `Payment Receipt - ${transactionId}`,
        text: `Payment receipt for ${gameDetails?.title || 'Game'} - NPR ${amount}`,
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      alert('Sharing is not supported on this browser');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'failed':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <Card className="max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-[var(--bg-muted)] rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🧾</span>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Payment Receipt</h2>
        <p className="text-[var(--text-muted)]">Thank you for your payment</p>
      </div>

      <div className="space-y-6">
        <div className="bg-[var(--bg-muted)] rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[var(--text-muted)]">Amount Paid:</span>
            <span className="text-xl font-bold text-[var(--text-primary)]">
              NPR {amount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--text-muted)]">Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Transaction ID:</span>
            <span className="font-medium text-[var(--text-primary)]">{transactionId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Payment Method:</span>
            <span className="font-medium text-[var(--text-primary)]">{paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Date:</span>
            <span className="font-medium text-[var(--text-primary)]">
              {date.toLocaleDateString()} {date.toLocaleTimeString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Player:</span>
            <span className="font-medium text-[var(--text-primary)]">{playerName}</span>
          </div>
        </div>

        {gameDetails && (
          <div className="border-t border-[var(--border)] pt-4 mt-4">
            <h3 className="font-medium text-[var(--text-primary)] mb-3">Game Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Game:</span>
                <span className="font-medium text-[var(--text-primary)]">{gameDetails.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Location:</span>
                <span className="font-medium text-[var(--text-primary)]">{gameDetails.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Date:</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {gameDetails.date.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Organizer:</span>
                <span className="font-medium text-[var(--text-primary)]">{gameDetails.organizer}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>

        {onClose && (
          <Button
            className="w-full mt-2"
            onClick={onClose}
          >
            Close
          </Button>
        )}
      </div>
    </Card>
  );
};