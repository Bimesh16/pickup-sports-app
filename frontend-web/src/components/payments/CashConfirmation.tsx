import React from 'react';
import { PaymentReceipt } from './PaymentReceipt';

interface CashConfirmationProps {
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

export const CashConfirmation: React.FC<CashConfirmationProps> = ({
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
      paymentMethod="Cash"
      date={new Date()}
      status="pending"
      gameDetails={gameDetails}
      playerName={playerName}
      onClose={onClose}
    />
  );
};