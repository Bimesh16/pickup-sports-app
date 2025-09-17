import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NotificationBell from '../NotificationBell';
import { StompWebSocketProvider } from '@context/StompWebSocketContext';
import { AppStateProvider } from '@context/AppStateContext';

// Mock the STOMP WebSocket context
const mockStompWebSocket = {
  isConnected: true,
  connectionStatus: 'connected' as const,
  reconnectAttempts: 0,
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  send: jest.fn(),
  reconnect: jest.fn(),
};

// Mock the App State context
const mockAppState = {
  profile: {
    id: 1,
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    avatarUrl: 'https://example.com/avatar.jpg',
  },
  notifications: [
    {
      id: '1',
      type: 'player_joined',
      title: 'New Player Joined',
      message: 'JohnDoe joined your game Sunday Basketball',
      timestamp: new Date().toISOString(),
      isRead: false,
      priority: 'medium',
      metadata: { gameId: '123' }
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message',
      message: '💬 New message in game Futsal Friday',
      timestamp: new Date().toISOString(),
      isRead: false,
      priority: 'low',
      metadata: { gameId: '456' }
    }
  ],
  isLoading: false,
  refreshProfile: jest.fn(),
  refreshNotifications: jest.fn(),
  addNotification: jest.fn(),
  markNotificationAsRead: jest.fn(),
  markAllNotificationsAsRead: jest.fn(),
  getUnreadCount: jest.fn(() => 2)
};

// Mock the STOMP WebSocket context
jest.mock('@context/StompWebSocketContext', () => ({
  useStompWebSocket: () => mockStompWebSocket,
  StompWebSocketProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the App State context
jest.mock('@context/AppStateContext', () => ({
  useAppState: () => mockAppState,
  AppStateProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AppStateProvider>
        <StompWebSocketProvider>
          {component}
        </StompWebSocketProvider>
      </AppStateProvider>
    </QueryClientProvider>
  );
};

describe('NotificationBell Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders notification bell button', () => {
    renderWithProviders(<NotificationBell />);
    
    const bellButton = screen.getByRole('button');
    expect(bellButton).toBeInTheDocument();
    expect(bellButton).toHaveAttribute('title', '2 unread notifications');
  });

  it('shows unread count badge', () => {
    renderWithProviders(<NotificationBell />);
    
    const badge = screen.getByText('2');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gradient-to-r', 'from-crimson-500', 'to-red-600');
  });

  it('does not render when no profile', () => {
    const noProfileAppState = {
      ...mockAppState,
      profile: null
    };

    jest.mocked(require('@context/AppStateContext').useAppState).mockReturnValue(noProfileAppState);

    const { container } = renderWithProviders(<NotificationBell />);
    expect(container.firstChild).toBeNull();
  });

  it('shows connection status indicator when disconnected', () => {
    const disconnectedStompWebSocket = {
      ...mockStompWebSocket,
      isConnected: false
    };

    jest.mocked(require('@context/StompWebSocketContext').useStompWebSocket).mockReturnValue(disconnectedStompWebSocket);

    renderWithProviders(<NotificationBell />);
    
    // Should show yellow indicator for disconnected state
    const indicator = screen.getByRole('button').querySelector('.bg-yellow-400');
    expect(indicator).toBeInTheDocument();
  });

  it('opens notification center when clicked', () => {
    renderWithProviders(<NotificationBell />);
    
    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);
    
    // Notification center should be visible
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('closes notification center when clicked again', () => {
    renderWithProviders(<NotificationBell />);
    
    const bellButton = screen.getByRole('button');
    
    // Open
    fireEvent.click(bellButton);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    
    // Close
    fireEvent.click(bellButton);
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = renderWithProviders(<NotificationBell size="sm" />);
    
    let bellButton = screen.getByRole('button');
    expect(bellButton).toHaveClass('w-8', 'h-8');
    
    rerender(<NotificationBell size="md" />);
    bellButton = screen.getByRole('button');
    expect(bellButton).toHaveClass('w-10', 'h-10');
    
    rerender(<NotificationBell size="lg" />);
    bellButton = screen.getByRole('button');
    expect(bellButton).toHaveClass('w-12', 'h-12');
  });

  it('applies correct variant classes', () => {
    const { rerender } = renderWithProviders(<NotificationBell variant="outline" />);
    
    let bellButton = screen.getByRole('button');
    expect(bellButton).toHaveClass('border-white/30', 'text-white');
    
    rerender(<NotificationBell variant="ghost" />);
    bellButton = screen.getByRole('button');
    expect(bellButton).toHaveClass('bg-white/10', 'text-white');
  });

  it('shows animation when has new notifications', () => {
    renderWithProviders(<NotificationBell />);
    
    const bellButton = screen.getByRole('button');
    expect(bellButton).toHaveClass('animate-pulse');
  });

  it('shows correct icon based on notification state', () => {
    renderWithProviders(<NotificationBell />);
    
    // Should show BellRing icon when has notifications
    const bellIcon = screen.getByRole('button').querySelector('svg');
    expect(bellIcon).toBeInTheDocument();
  });

  it('handles zero unread count', () => {
    const zeroUnreadAppState = {
      ...mockAppState,
      getUnreadCount: jest.fn(() => 0)
    };

    jest.mocked(require('@context/AppStateContext').useAppState).mockReturnValue(zeroUnreadAppState);

    renderWithProviders(<NotificationBell />);
    
    const bellButton = screen.getByRole('button');
    expect(bellButton).toHaveAttribute('title', 'Notifications');
    
    // Should not show badge
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('handles large unread count', () => {
    const largeUnreadAppState = {
      ...mockAppState,
      getUnreadCount: jest.fn(() => 150)
    };

    jest.mocked(require('@context/AppStateContext').useAppState).mockReturnValue(largeUnreadAppState);

    renderWithProviders(<NotificationBell />);
    
    expect(screen.getByText('99+')).toBeInTheDocument();
  });
});
