import React, { useState } from 'react';
import { Button, Card } from '../ui';
import { PaymentReceipt } from './PaymentReceipt';
import { AlertCircle, Check } from 'lucide-react';

interface ESewaConfirmationProps {
  transactionId: string;
  amount: number;
  playerName: string;
  gameDetails?: {
    title: string;
    location: string;
    date: Date;
    organizer: string;
  };
  onClose?: () => void;
}

export const ESewaConfirmation: React.FC<ESewaConfirmationProps> = ({
  transactionId,
  amount,
  playerName,
  gameDetails,
  onClose,
}) => {
  return (
    <PaymentReceipt
      transactionId={transactionId}
      amount={amount}
      paymentMethod="eSewa"
      date={new Date()}
      status="completed"
      gameDetails={gameDetails}
      playerName={playerName}
      onClose={onClose}
    />
  );
};