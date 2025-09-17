import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Modal } from '@components/ui';
import { 
  Bell, 
  CheckCircle, 
  X, 
  Calendar, 
  Users, 
  Gamepad2, 
  MessageCircle, 
  Star, 
  Trophy, 
  AlertTriangle, 
  Info, 
  Heart,
  Zap,
  Shield,
  Target,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Filter,
  Search,
  MoreVertical,
  Trash2,
  Archive
} from 'lucide-react';
import { apiClient } from '@lib/apiClient';
import { toast } from 'react-toastify';

interface Notification {
  id: string;
  type: 'game_invite' | 'game_reminder' | 'game_update' | 'team_update' | 'friend_request' | 'system' | 'achievement' | 'message';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  metadata?: {
    gameId?: string;
    teamId?: string;
    userId?: string;
    actionUrl?: string;
    imageUrl?: string;
  };
}

const NOTIFICATION_ICONS = {
  game_invite: Gamepad2,
  game_reminder: Calendar,
  game_update: Gamepad2,
  team_update: Users,
  friend_request: Users,
  system: Info,
  achievement: Trophy,
  message: MessageCircle
};

const NOTIFICATION_COLORS = {
  game_invite: 'text-blue-500',
  game_reminder: 'text-orange-500',
  game_update: 'text-green-500',
  team_update: 'text-purple-500',
  friend_request: 'text-pink-500',
  system: 'text-gray-500',
  achievement: 'text-yellow-500',
  message: 'text-indigo-500'
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700'
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'game' | 'team' | 'system'>('all');
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load notifications
  const loadNotifications = useCallback(async (pageNum: number = 0, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        // Try real API first
        const response = await apiClient.get('/api/v1/notifications', {
          params: {
            page: pageNum,
            size: 10,
            filter: filter === 'all' ? undefined : filter,
            search: searchQuery || undefined
          }
        });

        const newNotifications = response.data.content.map((notif: any) => ({
          id: notif.id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          timestamp: notif.timestamp,
          isRead: notif.isRead,
          priority: notif.priority || 'medium',
          metadata: notif.metadata || {}
        }));

        if (reset) {
          setNotifications(newNotifications);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
        }

        setHasMore(!response.data.last);
      } catch (apiError) {
        console.warn('API call failed, using mock data:', apiError);
        
        // Fallback to mock data
        const mockNotifications: Notification[] = [
          {
            id: '1',
            type: 'game_invite',
            title: 'Game Invitation',
            message: 'You\'ve been invited to join "Evening Futsal Match" tomorrow at 6 PM',
            timestamp: '2024-01-20T10:30:00Z',
            isRead: false,
            priority: 'high',
            metadata: { gameId: '123', actionUrl: '/games/123' }
          },
          {
            id: '2',
            type: 'game_reminder',
            title: 'Game Reminder',
            message: 'Your Basketball game starts in 2 hours at Kathmandu Sports Complex',
            timestamp: '2024-01-20T08:00:00Z',
            isRead: false,
            priority: 'medium',
            metadata: { gameId: '456', actionUrl: '/games/456' }
          },
          {
            id: '3',
            type: 'achievement',
            title: 'New Badge Earned!',
            message: 'Congratulations! You\'ve earned the "Team Player" badge',
            timestamp: '2024-01-19T15:45:00Z',
            isRead: true,
            priority: 'low',
            metadata: { actionUrl: '/profile?tab=badges' }
          },
          {
            id: '4',
            type: 'team_update',
            title: 'Team Update',
            message: 'New member "Sarah Wilson" joined Thunder Basketball team',
            timestamp: '2024-01-19T14:20:00Z',
            isRead: true,
            priority: 'low',
            metadata: { teamId: '789', actionUrl: '/teams/789' }
          },
          {
            id: '5',
            type: 'friend_request',
            title: 'Friend Request',
            message: 'Mike Johnson sent you a friend request',
            timestamp: '2024-01-19T12:10:00Z',
            isRead: false,
            priority: 'medium',
            metadata: { userId: '101', actionUrl: '/profile/101' }
          },
          {
            id: '6',
            type: 'system',
            title: 'App Update',
            message: 'New features available! Check out the improved game discovery',
            timestamp: '2024-01-18T16:30:00Z',
            isRead: true,
            priority: 'low',
            metadata: { actionUrl: '/settings' }
          },
          {
            id: '7',
            type: 'message',
            title: 'New Message',
            message: 'You have 3 new messages in Thunder Basketball team chat',
            timestamp: '2024-01-18T14:15:00Z',
            isRead: false,
            priority: 'medium',
            metadata: { teamId: '789', actionUrl: '/teams/789/chat' }
          },
          {
            id: '8',
            type: 'game_update',
            title: 'Game Update',
            message: 'Your Futsal game tomorrow has been moved to 7 PM',
            timestamp: '2024-01-18T11:00:00Z',
            isRead: true,
            priority: 'high',
            metadata: { gameId: '123', actionUrl: '/games/123' }
          }
        ];

        // Filter mock data based on current filter
        let filteredNotifications = mockNotifications;
        if (filter !== 'all') {
          const filterMap = {
            unread: (n: Notification) => !n.isRead,
            game: (n: Notification) => ['game_invite', 'game_reminder', 'game_update'].includes(n.type),
            team: (n: Notification) => ['team_update', 'message'].includes(n.type),
            system: (n: Notification) => ['system', 'achievement'].includes(n.type)
          };
          filteredNotifications = mockNotifications.filter(filterMap[filter]);
        }

        // Search filter
        if (searchQuery) {
          filteredNotifications = filteredNotifications.filter(notif =>
            notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            notif.message.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // Simulate pagination
        const startIndex = pageNum * 10;
        const endIndex = startIndex + 10;
        const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

        if (reset) {
          setNotifications(paginatedNotifications);
        } else {
          setNotifications(prev => [...prev, ...paginatedNotifications]);
        }

        setHasMore(endIndex < filteredNotifications.length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter, searchQuery]);

  // Load more notifications
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadNotifications(nextPage, false);
    }
  };

  // Filter change
  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    setPage(0);
    loadNotifications(0, true);
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.put(`/api/v1/notifications/${notificationId}/read`);
      
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Update UI anyway for better UX
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      ));
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await apiClient.put('/api/v1/notifications/read-all');
      
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await apiClient.delete(`/api/v1/notifications/${notificationId}`);
      
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (notification.metadata?.actionUrl) {
      window.location.href = notification.metadata.actionUrl;
    }
  };

  // Initial load
  useEffect(() => {
    loadNotifications(0, true);
  }, [loadNotifications]);

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    const IconComponent = NOTIFICATION_ICONS[type as keyof typeof NOTIFICATION_ICONS] || Bell;
    return <IconComponent className="w-5 h-5" />;
  };

  // Get notification color
  const getNotificationColor = (type: string) => {
    return NOTIFICATION_COLORS[type as keyof typeof NOTIFICATION_COLORS] || 'text-gray-500';
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || 'bg-gray-100 text-gray-700';
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filterOptions = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'game', label: 'Games', count: notifications.filter(n => ['game_invite', 'game_reminder', 'game_update'].includes(n.type)).length },
    { value: 'team', label: 'Teams', count: notifications.filter(n => ['team_update', 'message'].includes(n.type)).length },
    { value: 'system', label: 'System', count: notifications.filter(n => ['system', 'achievement'].includes(n.type)).length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-[var(--brand-primary)]" />
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Notifications</h1>
              <p className="text-[var(--text-muted)]">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark All Read
            </Button>
          )}
        </div>
      </Card>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
            />
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange(option.value as typeof filter)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-[var(--brand-primary)] text-white'
                    : 'bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--bg-contrast)]'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[var(--bg-muted)] rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[var(--bg-muted)] rounded w-1/3"></div>
                    <div className="h-3 bg-[var(--bg-muted)] rounded w-2/3"></div>
                    <div className="h-3 bg-[var(--bg-muted)] rounded w-1/4"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => {
            const IconComponent = getNotificationIcon(notification.type);
            const colorClass = getNotificationColor(notification.type);
            const priorityClass = getPriorityColor(notification.priority);

            return (
              <Card 
                key={notification.id} 
                className={`p-4 hover:bg-[var(--bg-muted)] transition-colors cursor-pointer ${
                  !notification.isRead ? 'border-l-4 border-l-[var(--brand-primary)]' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full bg-[var(--bg-muted)] flex items-center justify-center ${colorClass}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-[var(--text-primary)]">{notification.title}</h4>
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-[var(--brand-primary)] rounded-full"></div>
                        )}
                        <Badge variant="outline" className={`text-xs ${priorityClass}`}>
                          {notification.priority}
                        </Badge>
                        <span className="text-xs text-[var(--text-muted)]">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-[var(--text-muted)] mb-2">{notification.message}</p>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="text-xs text-[var(--brand-primary)] hover:text-[var(--brand-secondary)]"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)] opacity-50" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Notifications</h3>
            <p className="text-[var(--text-muted)]">
              {filter === 'all' 
                ? "You're all caught up! No notifications to show."
                : `No ${filter} notifications found. Try a different filter.`
              }
            </p>
          </Card>
        )}

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="text-center">
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              variant="outline"
              className="w-full"
            >
              {loadingMore ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MoreHorizontal className="w-4 h-4" />
                  Load More Notifications
                </div>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Modal (for mobile devices) */}
      {showMobileModal && (
        <Modal isOpen={showMobileModal} onClose={() => setShowMobileModal(false)} size="full">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Notifications</h2>
              <Button
                onClick={() => setShowMobileModal(false)}
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {/* Same notification content as desktop */}
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card key={notification.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full bg-[var(--bg-muted)] flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[var(--text-primary)]">{notification.title}</h4>
                        <p className="text-sm text-[var(--text-muted)]">{notification.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-[var(--text-muted)]">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-[var(--brand-primary)] rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}