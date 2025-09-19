import React, { useState } from 'react';
import { Card } from '../../components/ui';
import { PaymentNotification, PaymentNotificationsList } from '../../components/payments/PaymentNotification';
import { useNavigate } from 'react-router-dom';

// Mock notification data
const mockNotifications: PaymentNotification[] = [
  {
    id: 'notif-1',
    type: 'reminder',
    title: 'Payment Due Soon',
    message: 'Your payment for Weekend Football is due in 2 days',
    amount: 500,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    gameId: 'game-1',
    gameTitle: 'Weekend Football',
    read: false
  },
  {
    id: 'notif-2',
    type: 'due',
    title: 'Payment Overdue',
    message: 'Your payment for Basketball Tournament is overdue',
    amount: 750,
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    gameId: 'game-2',
    gameTitle: 'Basketball Tournament',
    read: false
  },
  {
    id: 'notif-3',
    type: 'confirmation',
    title: 'Payment Successful',
    message: 'Your payment for Cricket Match has been received',
    amount: 300,
    gameId: 'game-3',
    gameTitle: 'Cricket Match',
    read: true
  }
];

const PaymentNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<PaymentNotification[]>(mockNotifications);
  
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };
  
  const handleAction = (notification: PaymentNotification) => {
    if (notification.type === 'reminder' || notification.type === 'due') {
      // Navigate to payment page
      navigate('/dashboard/payment-demo');
    } else {
      // Navigate to payment history
      navigate('/dashboard/payment-history');
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-[var(--text-primary)]">Payment Notifications</h1>
      
      <Card className="p-6">
        <PaymentNotificationsList 
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onAction={handleAction}
        />
      </Card>
    </div>
  );
};

export default PaymentNotificationsPage;