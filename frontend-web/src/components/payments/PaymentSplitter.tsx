import React, { useState, useEffect } from 'react';
import { Button, Card } from '../ui';
import { Plus, Minus, Users, DollarSign, Calculator } from 'lucide-react';

interface Participant {
  id: number;
  username: string;
  displayName: string;
  avatar?: string;
  isHost?: boolean;
}

interface PaymentSplitterProps {
  totalAmount: number;
  participants: Participant[];
  currentUserId: number;
  onSplitConfirm: (splitDetails: SplitDetail[]) => void;
  onCancel: () => void;
}

export interface SplitDetail {
  userId: number;
  username: string;
  displayName: string;
  amount: number;
  isPaying: boolean;
}

export const PaymentSplitter: React.FC<PaymentSplitterProps> = ({
  totalAmount,
  participants,
  currentUserId,
  onSplitConfirm,
  onCancel
}) => {
  const [splitDetails, setSplitDetails] = useState<SplitDetail[]>([]);
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [currentUserAmount, setCurrentUserAmount] = useState(0);

  // Initialize split details
  useEffect(() => {
    const equalShare = Math.round((totalAmount / participants.length) * 100) / 100;
    
    const initialSplitDetails = participants.map(participant => ({
      userId: participant.id,
      username: participant.username,
      displayName: participant.displayName,
      amount: equalShare,
      isPaying: participant.id === currentUserId
    }));
    
    setSplitDetails(initialSplitDetails);
    calculateRemainingAmount(initialSplitDetails);
  }, [totalAmount, participants, currentUserId]);

  const calculateRemainingAmount = (details: SplitDetail[]) => {
    const totalPaid = details.reduce((sum, detail) => {
      return detail.isPaying ? sum + detail.amount : sum;
    }, 0);
    
    setRemainingAmount(Math.round((totalAmount - totalPaid) * 100) / 100);
    
    const currentUserDetail = details.find(detail => detail.userId === currentUserId);
    if (currentUserDetail) {
      setCurrentUserAmount(currentUserDetail.amount);
    }
  };

  const handleToggleParticipantPayment = (userId: number) => {
    const updatedDetails = splitDetails.map(detail => {
      if (detail.userId === userId) {
        return { ...detail, isPaying: !detail.isPaying };
      }
      return detail;
    });
    
    setSplitDetails(updatedDetails);
    calculateRemainingAmount(updatedDetails);
  };

  const handleAmountChange = (userId: number, amount: number) => {
    if (amount < 0) amount = 0;
    if (amount > totalAmount) amount = totalAmount;
    
    const updatedDetails = splitDetails.map(detail => {
      if (detail.userId === userId) {
        return { ...detail, amount };
      }
      return detail;
    });
    
    setSplitDetails(updatedDetails);
    calculateRemainingAmount(updatedDetails);
  };

  const handleSplitTypeChange = (type: 'equal' | 'custom') => {
    setSplitType(type);
    
    if (type === 'equal') {
      const equalShare = Math.round((totalAmount / participants.length) * 100) / 100;
      const updatedDetails = splitDetails.map(detail => ({
        ...detail,
        amount: equalShare
      }));
      
      setSplitDetails(updatedDetails);
      calculateRemainingAmount(updatedDetails);
    }
  };

  const handleConfirm = () => {
    onSplitConfirm(splitDetails);
  };

  return (
    <div className="p-4">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold mb-2">Split Payment</h3>
        <p className="text-[var(--text-muted)]">
          Divide the game fee among participants
        </p>
      </div>
      
      <div className="flex justify-between mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[var(--brand-primary)]" />
          <span className="font-semibold">Total: NPR {totalAmount}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[var(--text-muted)]" />
          <span>{participants.length} participants</span>
        </div>
      </div>
      
      <div className="flex gap-3 mb-6">
        <Button 
          variant={splitType === 'equal' ? 'primary' : 'outline'}
          onClick={() => handleSplitTypeChange('equal')}
          className="flex-1"
        >
          Equal Split
        </Button>
        <Button 
          variant={splitType === 'custom' ? 'primary' : 'outline'}
          onClick={() => handleSplitTypeChange('custom')}
          className="flex-1"
        >
          Custom Split
        </Button>
      </div>
      
      <Card className="mb-6">
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Participant</span>
            <span className="font-semibold">Amount (NPR)</span>
          </div>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {splitDetails.map((detail) => (
            <div 
              key={detail.userId} 
              className={`p-4 border-b border-[var(--border)] flex justify-between items-center ${
                detail.userId === currentUserId ? 'bg-[var(--bg-muted)]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={detail.isPaying}
                    onChange={() => handleToggleParticipantPayment(detail.userId)}
                    disabled={detail.userId === currentUserId}
                    className="w-4 h-4 accent-[var(--brand-primary)]"
                  />
                </div>
                <div>
                  <div className="font-medium">{detail.displayName}</div>
                  <div className="text-xs text-[var(--text-muted)]">@{detail.username}</div>
                </div>
                {detail.userId === currentUserId && (
                  <span className="text-xs bg-[var(--brand-primary)] text-white px-2 py-0.5 rounded-full ml-2">
                    You
                  </span>
                )}
              </div>
              
              {splitType === 'custom' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAmountChange(detail.userId, detail.amount - 10)}
                    disabled={!detail.isPaying || detail.amount <= 10}
                    className="w-6 h-6 rounded-full border border-[var(--border)] flex items-center justify-center disabled:opacity-50"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  
                  <input
                    type="number"
                    value={detail.amount}
                    onChange={(e) => handleAmountChange(detail.userId, Number(e.target.value))}
                    disabled={!detail.isPaying}
                    className="w-16 text-center border border-[var(--border)] rounded p-1 disabled:opacity-50"
                  />
                  
                  <button
                    onClick={() => handleAmountChange(detail.userId, detail.amount + 10)}
                    disabled={!detail.isPaying || detail.amount >= totalAmount}
                    className="w-6 h-6 rounded-full border border-[var(--border)] flex items-center justify-center disabled:opacity-50"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="font-medium">
                  {detail.isPaying ? detail.amount : 0}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
      
      <div className="bg-[var(--bg-muted)] rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[var(--text-muted)]">Your contribution:</span>
          <span className="font-bold text-lg">NPR {currentUserAmount}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-[var(--text-muted)]">Remaining amount:</span>
          <span className={`font-bold ${remainingAmount > 0 ? 'text-red-500' : 'text-green-500'}`}>
            NPR {remainingAmount}
          </span>
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          disabled={remainingAmount > 0}
          className="flex-1 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white"
        >
          Confirm Split
        </Button>
      </div>
    </div>
  );
};