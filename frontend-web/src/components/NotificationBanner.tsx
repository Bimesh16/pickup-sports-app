import React, { useState, useEffect } from 'react';
import { X, Bell, Gamepad2, Users, Trophy, MapPin } from 'lucide-react';
import { useWebSocket } from '@context/WebSocketContext';

interface NotificationBannerProps {
  onDismiss: (id: string) => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ onDismiss }) => {
  const { notifications } = useWebSocket();
  const [visibleNotifications, setVisibleNotifications] = useState<Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: number;
  }>>([]);

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      const notification = {
        id: latestNotification.id,
        type: latestNotification.type,
        title: latestNotification.title,
        message: latestNotification.message,
        timestamp: Date.now()
      };

      setVisibleNotifications(prev => [notification, ...prev.slice(0, 2)]); // Show max 3 banners

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        onDismiss(notification.id);
      }, 5000);
    }
  }, [notifications, onDismiss]);

  const handleDismiss = (id: string) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== id));
    onDismiss(id);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'game_invite':
        return <Gamepad2 className="w-5 h-5 text-blue-600" />;
      case 'game_reminder':
        return <Bell className="w-5 h-5 text-orange-600" />;
      case 'team_update':
        return <Users className="w-5 h-5 text-green-600" />;
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-600" />;
      case 'location_update':
        return <MapPin className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'game_invite':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'game_reminder':
        return 'bg-orange-50 border-orange-200 text-orange-900';
      case 'team_update':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'achievement':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'location_update':
        return 'bg-purple-50 border-purple-200 text-purple-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border shadow-lg animate-in slide-in-from-right duration-300 ${getNotificationColor(notification.type)}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1">
                {notification.title}
              </h4>
              <p className="text-sm opacity-90 line-clamp-2">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => handleDismiss(notification.id)}
              className="flex-shrink-0 p-1 hover:bg-black/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationBanner;
