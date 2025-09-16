import React, { useState, useEffect } from 'react';
import { Button, Card, Badge } from '@components/ui';
import { 
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  MoreVertical,
  Calendar,
  Users,
  Trophy,
  Gamepad2,
  MapPin,
  X,
  ChevronDown
} from 'lucide-react';
import { apiClient } from '@lib/apiClient';
import { Notification } from '@types/api';

// Types
interface NotificationWithActions extends Notification {
  actions?: {
    markAsRead: () => void;
    delete: () => void;
  };
}

// Notification Item Component
const NotificationItem: React.FC<{ 
  notification: NotificationWithActions; 
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ notification, onMarkAsRead, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'game_invite':
        return <Gamepad2 className="w-5 h-5 text-blue-600" />;
      case 'game_reminder':
        return <Calendar className="w-5 h-5 text-orange-600" />;
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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card 
      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
        !notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white'
      }`}
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {notification.message}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">
                  {formatTimestamp(notification.createdAt)}
                </span>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {!notification.isRead && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  variant="outline"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Check className="w-3 h-3" />
                </Button>
              )}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(!showActions);
                }}
                variant="outline"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Menu */}
      {showActions && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
                setShowActions(false);
              }}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Check className="w-3 h-3 mr-1" />
              Mark as Read
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
                setShowActions(false);
              }}
              variant="outline"
              size="sm"
              className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

// Filter Component
const NotificationFilter: React.FC<{
  filter: string;
  onFilterChange: (filter: string) => void;
}> = ({ filter, onFilterChange }) => {
  const filters = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'game_invite', label: 'Invites' },
    { key: 'game_reminder', label: 'Reminders' },
    { key: 'achievement', label: 'Achievements' },
    { key: 'team_update', label: 'Teams' }
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {filters.map((filterOption) => (
        <button
          key={filterOption.key}
          onClick={() => onFilterChange(filterOption.key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === filterOption.key
              ? 'bg-[var(--brand-primary)] text-white'
              : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:bg-[var(--brand-primary)]/10'
          }`}
        >
          {filterOption.label}
        </button>
      ))}
    </div>
  );
};

// Empty State Component
const EmptyState: React.FC = () => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Bell className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
    <p className="text-gray-600 mb-4">
      You're all caught up! New notifications will appear here.
    </p>
    <Button variant="outline" size="sm">
      Refresh
    </Button>
  </div>
);

// Mobile Bottom Sheet Component
const MobileBottomSheet: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <Button onClick={onClose} variant="outline" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

// Main Notifications Page Component
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationWithActions[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showMobileSheet, setShowMobileSheet] = useState(false);

  // Mock data for development
  const mockNotifications: NotificationWithActions[] = [
    {
      id: '1',
      type: 'game_invite',
      title: 'Game Invitation',
      message: 'John Doe invited you to join "Friday Night Futsal" at Tundikhel Court',
      isRead: false,
      createdAt: '2024-01-15T10:30:00Z',
      userId: 'user123'
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Badge Earned!',
      message: 'Congratulations! You\'ve earned the "Team Player" badge',
      isRead: false,
      createdAt: '2024-01-15T09:15:00Z',
      userId: 'user123'
    },
    {
      id: '3',
      type: 'game_reminder',
      title: 'Game Reminder',
      message: 'Your basketball game starts in 2 hours at City Arena',
      isRead: true,
      createdAt: '2024-01-14T16:45:00Z',
      userId: 'user123'
    },
    {
      id: '4',
      type: 'team_update',
      title: 'Team Update',
      message: 'New member Sarah joined your team "Thunder Bolts"',
      isRead: true,
      createdAt: '2024-01-14T14:20:00Z',
      userId: 'user123'
    },
    {
      id: '5',
      type: 'location_update',
      title: 'New Venue',
      message: 'A new sports venue "Sports Complex" opened near you',
      isRead: true,
      createdAt: '2024-01-13T11:00:00Z',
      userId: 'user123'
    }
  ];

  useEffect(() => {
    loadNotifications();
  }, [page, filter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // In development, use mock data
      const filteredNotifications = mockNotifications.filter(notification => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notification.isRead;
        return notification.type === filter;
      });

      setNotifications(filteredNotifications);
      setHasMore(false); // Mock data is limited
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.put(`/api/v1/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.put('/api/v1/notifications/read-all');
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/api/v1/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Notifications</h1>
          <p className="text-[var(--text-muted)]">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark All Read
            </Button>
          )}
          <Button 
            onClick={() => setShowMobileSheet(true)}
            variant="outline" 
            size="sm"
            className="md:hidden"
          >
            <Bell className="w-4 h-4 mr-1" />
            {unreadCount > 0 && (
              <Badge variant="error" size="sm" className="ml-1">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Filter */}
      <NotificationFilter filter={filter} onFilterChange={setFilter} />

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState />
        ) : (
          filteredNotifications.map((notification) => (
            <div key={notification.id} className="group">
              <NotificationItem
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && !loading && (
        <div className="text-center">
          <Button 
            onClick={() => setPage(prev => prev + 1)}
            variant="outline"
            size="sm"
          >
            Load More
          </Button>
        </div>
      )}

      {/* Mobile Bottom Sheet */}
      <MobileBottomSheet 
        isOpen={showMobileSheet} 
        onClose={() => setShowMobileSheet(false)}
      >
        <div className="p-4 space-y-3">
          {filteredNotifications.map((notification) => (
            <div key={notification.id} className="group">
              <NotificationItem
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      </MobileBottomSheet>
    </div>
  );
}