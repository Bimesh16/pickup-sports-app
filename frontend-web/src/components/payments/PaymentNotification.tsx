import React from 'react';
import { Bell, AlertCircle, Calendar } from 'lucide-react';
import { Card, Badge, Button } from '../ui';

export interface PaymentNotification {
  id: string;
  type: 'reminder' | 'due' | 'confirmation';
  title: string;
  message: string;
  amount?: number;
  dueDate?: Date;
  gameId?: string;
  gameTitle?: string;
  read: boolean;
}

interface PaymentNotificationProps {
  notification: PaymentNotification;
  onMarkAsRead: (id: string) => void;
  onAction?: (notification: PaymentNotification) => void;
}

export const PaymentNotificationItem: React.FC<PaymentNotificationProps> = ({
  notification,
  onMarkAsRead,
  onAction
}) => {
  const { id, type, title, message, amount, dueDate, read } = notification;

  const getIcon = () => {
    switch (type) {
      case 'reminder':
        return <Calendar className="h-5 w-5 text-[var(--warning)]" />;
      case 'due':
        return <AlertCircle className="h-5 w-5 text-[var(--error)]" />;
      case 'confirmation':
        return <Bell className="h-5 w-5 text-[var(--success)]" />;
      default:
        return <Bell className="h-5 w-5 text-[var(--text-muted)]" />;
    }
  };

  const getActionButton = () => {
    switch (type) {
      case 'reminder':
      case 'due':
        return (
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => onAction && onAction(notification)}
          >
            Pay Now
          </Button>
        );
      case 'confirmation':
        return (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onAction && onAction(notification)}
          >
            View Details
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Card 
      className={`p-4 mb-3 border-l-4 ${
        type === 'reminder' 
          ? 'border-l-[var(--warning)]' 
          : type === 'due' 
            ? 'border-l-[var(--error)]' 
            : 'border-l-[var(--success)]'
      } ${!read ? 'bg-[var(--bg-hover)]' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-[var(--bg-muted)]">
          {getIcon()}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-[var(--text-primary)]">{title}</h4>
              <p className="text-sm text-[var(--text-muted)]">{message}</p>
              {amount && (
                <p className="text-sm font-medium mt-1">
                  Amount: NPR {amount}
                </p>
              )}
              {dueDate && (
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Due: {dueDate.toLocaleDateString()}
                </p>
              )}
            </div>
            {!read && (
              <Badge variant="default" size="sm">New</Badge>
            )}
          </div>
          <div className="flex justify-between items-center mt-3">
            {getActionButton()}
            {!read && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onMarkAsRead(id)}
              >
                Mark as read
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

interface PaymentNotificationsListProps {
  notifications: PaymentNotification[];
  onMarkAsRead: (id: string) => void;
  onAction?: (notification: PaymentNotification) => void;
}

export const PaymentNotificationsList: React.FC<PaymentNotificationsListProps> = ({
  notifications,
  onMarkAsRead,
  onAction
}) => {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-muted)]">
        <Bell className="h-12 w-12 mx-auto mb-2 opacity-30" />
        <p>No payment notifications</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map(notification => (
        <PaymentNotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onAction={onAction}
        />
      ))}
    </div>
  );
};