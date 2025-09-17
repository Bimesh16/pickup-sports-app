import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NotificationCenter from '../NotificationCenter';
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
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      isRead: false,
      priority: 'medium',
      metadata: { gameId: '123' }
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message',
      message: '💬 New message in game Futsal Friday',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isRead: false,
      priority: 'low',
      metadata: { gameId: '456' }
    },
    {
      id: '3',
      type: 'game_reminder',
      title: 'Game Reminder',
      message: 'Your game starts in 1 hour!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      isRead: true,
      priority: 'high',
      metadata: { gameId: '789' }
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

describe('NotificationCenter Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders notification center when open', () => {
    renderWithProviders(
      <NotificationCenter isOpen={true} onClose={jest.fn()} />
    );
    
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Unread count
  });

  it('does not render when closed', () => {
    renderWithProviders(
      <NotificationCenter isOpen={false} onClose={jest.fn()} />
    );
    
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  it('displays notifications correctly', () => {
    renderWithProviders(
      <NotificationCenter isOpen={true} onClose={jest.fn()} />
    );
    
    expect(screen.getByText('New Player Joined')).toBeInTheDocument();
    expect(screen.getByText('JohnDoe joined your game Sunday Basketball')).toBeInTheDocument();
    expect(screen.getByText('New Message')).toBeInTheDocument();
    expect(screen.getByText('💬 New message in game Futsal Friday')).toBeInTheDocument();
  });

  it('shows unread count badge', () => {
    renderWithProviders(
      <NotificationCenter isOpen={true} onClose={jest.fn()} />
    );
    
    const badge = screen.getByText('2');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-crimson-500');
  });

  it('filters notifications by type', () => {
    renderWithProviders(
      <NotificationCenter isOpen={true} onClose={jest.fn()} />
    );
    
    // Click on "Games" filter
    fireEvent.click(screen.getByText('Games'));
    
    // Should show game-related notifications
    expect(screen.getByText('New Player Joined')).toBeInTheDocument();
    expect(screen.queryByText('New Message')).not.toBeInTheDocument();
  });

  it('searches notifications', () => {
    renderWithProviders(
      <NotificationCenter isOpen={true} onClose={jest.fn()} />
    );
    
    const searchInput = screen.getByPlaceholderText('Search notifications...');
    fireEvent.change(searchInput, { target: { value: 'Basketball' } });
    
    expect(screen.getByText('New Player Joined')).toBeInTheDocument();
    expect(screen.queryByText('New Message')).not.toBeInTheDocument();
  });

  it('marks notification as read when clicked', async () => {
    renderWithProviders(
      <NotificationCenter isOpen={true} onClose={jest.fn()} />
    );
    
    const notification = screen.getByText('New Player Joined');
    fireEvent.click(notification);
    
    await waitFor(() => {
      expect(mockAppState.markNotificationAsRead).toHaveBeenCalledWith('1');
    });
  });

  it('marks all notifications as read', async () => {
    renderWithProviders(
      <NotificationCenter isOpen={true} onClose={jest.fn()} />
    );
    
    const markAllButton = screen.getByText('Mark All Read');
    fireEvent.click(markAllButton);
    
    await waitFor(() => {
      expect(mockAppState.markAllNotificationsAsRead).toHaveBeenCalled();
    });
  });

  it('shows priority badges for high priority notifications', () => {
    renderWithProviders(
      <NotificationCenter isOpen={true} onClose={jest.fn()} />
    );
    
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('shows unread indicator for unread notifications', () => {
    renderWithProviders(
      <NotificationCenter isOpen={true} onClose={jest.fn()} />
    );
    
    const unreadIndicators = screen.getAllByRole('generic');
    expect(unreadIndicators.some(el => el.classList.contains('bg-blue-50'))).toBe(true);
  });

  it('handles empty state', () => {
    const emptyAppState = {
      ...mockAppState,
      notifications: [],
      getUnreadCount: jest.fn(() => 0)
    };

    jest.mocked(require('@context/AppStateContext').useAppState).mockReturnValue(emptyAppState);

    renderWithProviders(
      <NotificationCenter isOpen={true} onClose={jest.fn()} />
    );
    
    expect(screen.getByText('No notifications found')).toBeInTheDocument();
  });

  it('shows show more/less functionality', () => {
    // Mock more than 5 notifications
    const manyNotifications = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      type: 'system' as const,
      title: `Notification ${i + 1}`,
      message: `Message ${i + 1}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      priority: 'medium' as const,
      metadata: {}
    }));

    const manyNotificationsAppState = {
      ...mockAppState,
      notifications: manyNotifications
    };

    jest.mocked(require('@context/AppStateContext').useAppState).mockReturnValue(manyNotificationsAppState);

    renderWithProviders(
      <NotificationCenter isOpen={true} onClose={jest.fn()} />
    );
    
    expect(screen.getByText('Show All (10)')).toBeInTheDocument();
  });
});
