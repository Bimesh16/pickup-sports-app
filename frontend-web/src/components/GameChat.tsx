import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Card } from '@components/ui';
import { 
  MessageCircle,
  Send,
  Users,
  MoreVertical,
  Smile,
  Image,
  ArrowDown,
  X,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { useStompWebSocket } from '@context/StompWebSocketContext';
import { useAppState } from '@context/AppStateContext';
import ErrorBoundary from '@components/ErrorBoundary';

// Types for chat messages
interface ChatMessage {
  id: string;
  gameId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  timestamp: string;
  type: 'message' | 'system' | 'join' | 'leave';
}

interface TypingIndicator {
  userId: string;
  userName: string;
  timestamp: number;
}

interface GameChatProps {
  gameId: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

// Simple time formatting without external deps
const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const messageTime = new Date(timestamp);
  const diff = Math.floor((now.getTime() - messageTime.getTime()) / 1000);
  
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// User Avatar Component
const UserAvatar: React.FC<{ 
  name: string; 
  avatar?: string; 
  size?: 'sm' | 'md' | 'lg';
  isOnline?: boolean;
}> = ({ name, avatar, size = 'md', isOnline = false }) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} rounded-full flex-shrink-0`}>
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-full flex items-center justify-center text-white font-bold">
          {initials}
        </div>
      )}
      {isOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
    </div>
  );
};

// Message Bubble Component
const MessageBubble: React.FC<{ 
  message: ChatMessage; 
  isOwnMessage: boolean;
  showAvatar?: boolean;
}> = ({ message, isOwnMessage, showAvatar = true }) => {
  const timeAgo = formatTimeAgo(message.timestamp);

  if (message.type === 'system' || message.type === 'join' || message.type === 'leave') {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-[var(--bg-muted)] px-3 py-1 rounded-full text-xs text-[var(--text-muted)] max-w-xs text-center">
          {message.message}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 mb-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwnMessage && showAvatar && (
        <UserAvatar name={message.senderName} avatar={message.senderAvatar} size="sm" />
      )}
      
      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-xs`}>
        {!isOwnMessage && (
          <div className="text-xs text-[var(--text-muted)] mb-1 px-1">
            {message.senderName}
          </div>
        )}
        
        <div
          className={`px-3 py-2 rounded-lg text-sm max-w-full break-words ${
            isOwnMessage
              ? 'bg-gradient-to-r from-blue-600 to-crimson-600 text-white' // Nepal flag colors
              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300' // Subtle gradient for others
          }`}
        >
          {message.message}
        </div>
        
        <div className={`text-xs text-[var(--text-muted)] mt-1 px-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
          {timeAgo}
        </div>
      </div>
    </div>
  );
};

// Typing Indicator Component
const TypingIndicator: React.FC<{ typingUsers: TypingIndicator[] }> = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;

  const typingText = typingUsers.length === 1
    ? `${typingUsers[0].userName} is typing...`
    : `${typingUsers.length} users are typing...`;

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)]">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span>{typingText}</span>
    </div>
  );
};

export default function GameChat({ gameId, isCollapsed = false, onToggleCollapse, className = '' }: GameChatProps) {
  const { profile } = useAppState();
  const { isConnected, subscribe, unsubscribe, send } = useStompWebSocket();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const chatSubscriptionRef = useRef<any>(null);
  const typingSubscriptionRef = useRef<any>(null);

  // Scroll to bottom
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? 'smooth' : 'auto' 
    });
  };

  // Handle scroll events
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    setIsAtBottom(isNearBottom);
    
    if (isNearBottom) {
      setHasNewMessages(false);
    }
  };

  // Handle new chat message from STOMP
  const handleChatMessage = useCallback((message: any) => {
    const data = JSON.parse(message.body);
    if (data.gameId !== gameId) return;

    const chatMessage: ChatMessage = {
      id: data.id || Date.now().toString(),
      gameId: data.gameId,
      senderId: data.senderId,
      senderName: data.senderName,
      senderAvatar: data.senderAvatar,
      message: data.content || data.message,
      timestamp: data.sentAt || data.timestamp || new Date().toISOString(),
      type: (data.type as ChatMessage['type']) || 'message'
    };

    setMessages(prev => [...prev, chatMessage]);
    
    // Show notification for new messages if not at bottom
    if (!isAtBottom && data.senderId !== profile?.id.toString()) {
      setHasNewMessages(true);
      
      // Play sound notification if not muted
      if (!isMuted) {
        try {
          const audio = new Audio('data:audio/wav;base64,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');
          audio.volume = 0.3;
          audio.play().catch(() => {
            // Ignore if audio can't play
          });
        } catch (error) {
          // Ignore audio errors
        }
      }
    }
  }, [gameId, isAtBottom, profile?.id, isMuted]);

  // Handle typing indicator from STOMP
  const handleUserTyping = useCallback((message: any) => {
    const data = JSON.parse(message.body);
    if (data.gameId !== gameId || data.userId === profile?.id.toString()) return;
    
    setTypingUsers(prev => {
      const filtered = prev.filter(user => user.userId !== data.userId);
      return [...filtered, { 
        userId: data.userId, 
        userName: data.userName,
        timestamp: Date.now() 
      }];
    });
  }, [gameId, profile?.id]);

  // Send typing indicator
  const handleTyping = () => {
    if (!isConnected || !profile) return;
    
    send(`/app/games/${gameId}/typing`, {
      gameId,
      userId: profile.id.toString(),
      userName: profile.firstName || profile.username
    });
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending || !isConnected || !profile) return;
    
    setIsSending(true);
    
    const message = {
      gameId: parseInt(gameId),
      sender: profile.firstName || profile.username,
      content: newMessage.trim(),
      clientId: `temp_${Date.now()}`
    };
    
    // Add optimistic message
    const optimisticMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
      gameId,
      senderId: profile.id.toString(),
      senderName: profile.firstName || profile.username,
      senderAvatar: profile.avatarUrl,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'message' as const
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    
    // Send via STOMP
    send(`/app/games/${gameId}/chat`, message);
    
    // Clear typing indicator
    clearTimeout(typingTimeoutRef.current);
    
    setTimeout(() => {
      setIsSending(false);
      scrollToBottom();
    }, 100);
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Initialize STOMP subscriptions
  useEffect(() => {
    if (isConnected) {
      // Subscribe to chat messages
      chatSubscriptionRef.current = subscribe(`/topic/games/${gameId}/chat`, handleChatMessage);
      // Subscribe to typing indicators
      typingSubscriptionRef.current = subscribe(`/topic/games/${gameId}/typing`, handleUserTyping);
    }
    
    return () => {
      if (chatSubscriptionRef.current) {
        unsubscribe(chatSubscriptionRef.current);
        chatSubscriptionRef.current = null;
      }
      if (typingSubscriptionRef.current) {
        unsubscribe(typingSubscriptionRef.current);
        typingSubscriptionRef.current = null;
      }
    };
  }, [isConnected, gameId, subscribe, unsubscribe, handleChatMessage, handleUserTyping]);

  // Join game chat room
  useEffect(() => {
    if (isConnected && profile) {
      // Send welcome message
      setTimeout(() => {
        const welcomeMessage: ChatMessage = {
          id: `welcome_${Date.now()}`,
          gameId,
          senderId: 'system',
          senderName: 'System',
          message: `Welcome to the game chat! Introduce yourself 😊 धन्यवाद!`,
          timestamp: new Date().toISOString(),
          type: 'system'
        };
        setMessages(prev => [welcomeMessage, ...prev]);
        setIsLoading(false);
      }, 1000);
    }
  }, [isConnected, gameId, profile]);

  // Clean up typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => prev.filter(user => now - user.timestamp < 3000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle typing input
  useEffect(() => {
    if (newMessage) {
      handleTyping();
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout
      typingTimeoutRef.current = setTimeout(() => {
        // Stop typing indicator
      }, 1000);
    }
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [newMessage]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom(false);
    }
  }, [messages, isAtBottom]);

  if (isCollapsed) {
    return (
      <div className={`${className}`}>
        <Button
          onClick={onToggleCollapse}
          className="bg-gradient-to-r from-blue-600 to-crimson-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 relative hover:from-blue-700 hover:to-crimson-700"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Chat
          {hasNewMessages && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </Button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Card className={`flex flex-col h-96 ${className}`}>
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-[var(--text-primary)]">Game Chat</h3>
            <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <Users className="w-3 h-3" />
              <span>{messages.filter(m => m.type !== 'system').length > 0 ? 'Active' : 'Empty'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              onClick={() => setIsMuted(!isMuted)}
              variant="outline"
              size="sm"
              className="p-2"
              title={isMuted ? 'Unmute notifications' : 'Mute notifications'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            
            {onToggleCollapse && (
              <Button
                onClick={onToggleCollapse}
                variant="outline"
                size="sm"
                className="p-2"
                title="Minimize chat"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-2"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-[var(--text-muted)]">Loading chat...</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                const isOwnMessage = message.senderId === profile?.id.toString();
                const prevMessage = messages[index - 1];
                const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;
                
                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwnMessage={isOwnMessage}
                    showAvatar={showAvatar}
                  />
                );
              })}
              
              <TypingIndicator typingUsers={typingUsers} />
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* New Message Notification */}
        {hasNewMessages && !isAtBottom && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10">
            <Button
              onClick={() => scrollToBottom()}
              className="bg-gradient-to-r from-blue-600 to-crimson-600 text-white shadow-lg flex items-center gap-2 animate-bounce hover:from-blue-700 hover:to-crimson-700"
              size="sm"
            >
              <ArrowDown className="w-4 h-4" />
              New messages
            </Button>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-[var(--border)]">
          {!isConnected && (
            <div className="text-center text-sm text-red-500 mb-2">
              Reconnecting to chat...
            </div>
          )}
          
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message... (Enter to send)"
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent resize-none"
                disabled={!isConnected || isSending}
                maxLength={500}
              />
              {newMessage.length > 400 && (
                <div className="absolute -top-6 right-0 text-xs text-[var(--text-muted)]">
                  {500 - newMessage.length} left
                </div>
              )}
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending || !isConnected}
              className="bg-gradient-to-r from-blue-600 to-crimson-600 text-white px-4 py-2 hover:from-blue-700 hover:to-crimson-700"
              title="Send message"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {typingUsers.length > 0 && (
            <div className="mt-2 text-xs text-[var(--text-muted)]">
              {typingUsers.length === 1
                ? `${typingUsers[0].userName} is typing...`
                : `${typingUsers.length} people are typing...`}
            </div>
          )}
        </div>
      </Card>
    </ErrorBoundary>
  );
}
