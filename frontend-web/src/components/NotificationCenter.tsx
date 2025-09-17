import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Card, Badge } from '@components/ui';
import { 
  Bell, 
  X, 
  CheckCircle, 
  Calendar, 
  Users, 
  UserPlus,
  UserMinus,
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
  Archive,
  ExternalLink
} from 'lucide-react';
import { useStompWebSocket } from '@context/StompWebSocketContext';
import { useAppState } from '@context/AppStateContext';
import { notificationsApi } from '@api/dashboard';
import { toast } from 'react-toastify';

interface Notification {
  id: string;
  type: 'game_invite' | 'game_reminder' | 'game_update' | 'team_update' | 'friend_request' | 'system' | 'achievement' | 'message' | 'player_joined' | 'player_left' | 'game_cancelled';
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

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const NOTIFICATION_ICONS = {
  game_invite: Gamepad2,
  game_reminder: Calendar,
  game_update: Gamepad2,
  team_update: Users,
  friend_request: Users,
  system: Info,
  achievement: Trophy,
  message: MessageCircle,
  player_joined: UserPlus,
  player_left: UserMinus,
  game_cancelled: AlertTriangle
};

const NOTIFICATION_COLORS = {
  game_invite: 'text-blue-500',
  game_reminder: 'text-orange-500',
  game_update: 'text-green-500',
  team_update: 'text-purple-500',
  friend_request: 'text-pink-500',
  system: 'text-gray-500',
  achievement: 'text-yellow-500',
  message: 'text-indigo-500',
  player_joined: 'text-green-600',
  player_left: 'text-red-500',
  game_cancelled: 'text-red-600'
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700'
};

export default function NotificationCenter({ isOpen, onClose, className = '' }: NotificationCenterProps) {
  const { profile, notifications, markNotificationAsRead, markAllNotificationsAsRead, getUnreadCount } = useAppState();
  const { isConnected } = useStompWebSocket();
  
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'game' | 'team' | 'system'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load notifications when component opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Notifications are already loaded by AppStateContext
      setLoading(false);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
  };

  // Mark all as read
  const markAllAsRead = async () => {
    await markAllNotificationsAsRead();
    toast.success('All notifications marked as read');
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.isRead) ||
      (filter === 'game' && ['game_invite', 'game_reminder', 'game_update', 'player_joined', 'player_left', 'game_cancelled'].includes(notification.type)) ||
      (filter === 'team' && ['team_update', 'friend_request'].includes(notification.type)) ||
      (filter === 'system' && ['system', 'achievement'].includes(notification.type));
    
    const matchesSearch = !searchQuery || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const displayedNotifications = showAll ? filteredNotifications : filteredNotifications.slice(0, 5);
  const unreadCount = getUnreadCount();

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className={`absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] z-50 ${className}`}
    >
      <Card className="bg-white/95 backdrop-blur-lg border border-gray-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="error" size="sm" className="bg-crimson-500 text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Mark All Read
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b border-gray-200">
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filter */}
            <div className="flex gap-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'game', label: 'Games' },
                { key: 'team', label: 'Teams' },
                { key: 'system', label: 'System' }
              ].map((option) => (
                <Button
                  key={option.key}
                  onClick={() => setFilter(option.key as any)}
                  variant={filter === option.key ? 'solid' : 'outline'}
                  size="sm"
                  className={`text-xs ${
                    filter === option.key 
                      ? 'bg-gradient-to-r from-blue-600 to-crimson-600 text-white' 
                      : 'text-gray-600'
                  }`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading notifications...</p>
            </div>
          ) : displayedNotifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {displayedNotifications.map((notification) => {
                const IconComponent = NOTIFICATION_ICONS[notification.type] || Info;
                const iconColor = NOTIFICATION_COLORS[notification.type] || 'text-gray-500';
                const priorityColor = PRIORITY_COLORS[notification.priority];
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-medium text-sm ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          {notification.priority === 'high' && (
                            <Badge className={`text-xs ${priorityColor}`}>
                              High
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 text-sm">No notifications found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredNotifications.length > 5 && (
          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={() => setShowAll(!showAll)}
              variant="outline"
              className="w-full text-sm"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Show All ({filteredNotifications.length})
                </>
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
