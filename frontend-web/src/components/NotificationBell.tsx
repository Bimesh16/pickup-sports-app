import React, { useState, useEffect, useRef } from 'react';
import { Button, Badge } from '@components/ui';
import { Bell, BellRing } from 'lucide-react';
import { useAppState } from '@context/AppStateContext';
import { useStompWebSocket } from '@context/StompWebSocketContext';
import NotificationCenter from './NotificationCenter';

interface NotificationBellProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export default function NotificationBell({ 
  className = '', 
  size = 'md',
  variant = 'outline'
}: NotificationBellProps) {
  const { profile, getUnreadCount } = useAppState();
  const { isConnected } = useStompWebSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  
  const bellRef = useRef<HTMLButtonElement>(null);
  const unreadCount = getUnreadCount();

  // Check for new notifications (for animation)
  useEffect(() => {
    if (unreadCount > 0) {
      setHasNewNotifications(true);
      // Reset animation after 3 seconds
      const timer = setTimeout(() => {
        setHasNewNotifications(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const badgeSizes = {
    sm: 'text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5',
    md: 'text-xs px-2 py-1 min-w-[1.5rem] h-6',
    lg: 'text-sm px-2 py-1 min-w-[1.75rem] h-7'
  };

  const handleBellClick = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Don't render if no profile
  if (!profile) return null;

  return (
    <div className="relative">
      <Button
        ref={bellRef}
        onClick={handleBellClick}
        variant={variant}
        className={`relative ${sizeClasses[size]} ${className} ${
          variant === 'outline' 
            ? 'border-white/30 text-white hover:bg-white/10' 
            : 'bg-white/10 text-white hover:bg-white/20'
        } transition-all duration-200 ${
          hasNewNotifications ? 'animate-pulse' : ''
        }`}
        title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
      >
        {hasNewNotifications ? (
          <BellRing className={`${iconSizes[size]} text-crimson-400`} />
        ) : (
          <Bell className={iconSizes[size]} />
        )}
        
        {unreadCount > 0 && (
          <Badge 
            className={`absolute -top-1 -right-1 bg-gradient-to-r from-crimson-500 to-red-600 text-white border-2 border-white ${badgeSizes[size]} flex items-center justify-center font-bold`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
        
        {/* Connection status indicator */}
        {!isConnected && (
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full border border-white"></div>
        )}
      </Button>

      {/* Notification Center Dropdown */}
      <NotificationCenter
        isOpen={isOpen}
        onClose={handleClose}
        className="mt-2"
      />
    </div>
  );
}
