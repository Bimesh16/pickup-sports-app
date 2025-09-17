import React, { useState } from 'react';
import { Card, Button } from '@components/ui';
import { 
  Calendar,
  Users,
  Trophy,
  Gamepad2,
  MessageCircle,
  Share2,
  UserPlus,
  Bell,
  Settings,
  Gift,
  Star,
  Zap,
  Target,
  Heart,
  MapPin,
  Clock
} from 'lucide-react';

interface QuickActionsWidgetProps {
  onAction: (action: string) => void;
  unreadInvites?: number;
  upcomingGames?: number;
  friendRequests?: number;
}

const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  onAction,
  unreadInvites = 3,
  upcomingGames = 2, 
  friendRequests = 1
}) => {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const quickActions = [
    {
      id: 'create-game',
      label: 'Create Game',
      icon: Gamepad2,
      color: 'text-blue-500',
      bg: 'bg-blue-50 hover:bg-blue-100',
      description: 'Start a new pickup game'
    },
    {
      id: 'find-games',
      label: 'Find Games',
      icon: Target,
      color: 'text-green-500',
      bg: 'bg-green-50 hover:bg-green-100',
      description: 'Discover games near you',
      count: upcomingGames
    },
    {
      id: 'invite-friends',
      label: 'Invite Friends',
      icon: UserPlus,
      color: 'text-purple-500',
      bg: 'bg-purple-50 hover:bg-purple-100',
      description: 'Invite friends to join'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      color: 'text-orange-500',
      bg: 'bg-orange-50 hover:bg-orange-100',
      description: 'Check your messages',
      count: unreadInvites
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: Trophy,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50 hover:bg-yellow-100',
      description: 'View your achievements'
    },
    {
      id: 'friend-requests',
      label: 'Friend Requests',
      icon: Users,
      color: 'text-pink-500',
      bg: 'bg-pink-50 hover:bg-pink-100',
      description: 'Pending friend requests',
      count: friendRequests
    }
  ];

  const socialActions = [
    {
      id: 'share-profile',
      label: 'Share Profile',
      icon: Share2,
      color: 'text-indigo-500',
      description: 'Share your sports profile'
    },
    {
      id: 'rate-players',
      label: 'Rate Players',
      icon: Star,
      color: 'text-amber-500',
      description: 'Rate recent teammates'
    },
    {
      id: 'send-gift',
      label: 'Send Gift',
      icon: Gift,
      color: 'text-red-500',
      description: 'Send virtual gifts'
    }
  ];

  const handleActionClick = (actionId: string) => {
    onAction(actionId);
    // Add some visual feedback
    const button = document.querySelector(`[data-action="${actionId}"]`);
    if (button) {
      button.classList.add('animate-pulse');
      setTimeout(() => {
        button.classList.remove('animate-pulse');
      }, 500);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-[var(--brand-primary)]" />
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Quick Actions</h3>
      </div>
      
      {/* Main Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {quickActions.map((action) => (
          <button
            key={action.id}
            data-action={action.id}
            onClick={() => handleActionClick(action.id)}
            onMouseEnter={() => setHoveredAction(action.id)}
            onMouseLeave={() => setHoveredAction(null)}
            className={`relative p-3 rounded-lg transition-all duration-200 ${action.bg} group`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <action.icon className={`w-6 h-6 ${action.color} transition-transform group-hover:scale-110`} />
                {action.count && action.count > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
                    {action.count > 9 ? '9+' : action.count}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-[var(--text-primary)] text-center">
                {action.label}
              </span>
              
              {/* Removed tooltip to avoid pop-ups */}
            </div>
          </button>
        ))}
      </div>

      {/* Social Actions */}
      <div className="border-t border-[var(--border)] pt-4">
        <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4 text-[var(--brand-primary)]" />
          Social
        </h4>
        <div className="flex gap-2">
          {socialActions.map((action) => (
            <button
              key={action.id}
              data-action={action.id}
              onClick={() => handleActionClick(action.id)}
              onMouseEnter={() => setHoveredAction(action.id)}
              onMouseLeave={() => setHoveredAction(null)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--bg-contrast)] transition-colors group"
            >
              <action.icon className={`w-4 h-4 ${action.color} transition-transform group-hover:scale-110`} />
              <span className="text-xs font-medium text-[var(--text-primary)] hidden sm:inline">
                {action.label}
              </span>
              
              {/* Tooltip for mobile */}
              {hoveredAction === action.id && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 animate-fadeIn sm:hidden">
                  {action.description}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="border-t border-[var(--border)] pt-4 mt-4">
        <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--brand-primary)]" />
          Today
        </h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-xl font-bold text-[var(--brand-primary)]">{upcomingGames}</div>
            <div className="text-xs text-[var(--text-muted)]">Upcoming</div>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold text-[var(--brand-primary)]">{unreadInvites}</div>
            <div className="text-xs text-[var(--text-muted)]">Invites</div>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold text-[var(--brand-primary)]">{friendRequests}</div>
            <div className="text-xs text-[var(--text-muted)]">Requests</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default QuickActionsWidget;
