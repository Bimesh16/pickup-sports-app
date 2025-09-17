import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GameChat from '../GameChat';
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
  setProfile: jest.fn(),
  clearProfile: jest.fn(),
  isAuthenticated: true,
  setIsAuthenticated: jest.fn(),
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

describe('GameChat Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders chat component with proper header', () => {
    renderWithProviders(<GameChat gameId="123" />);
    
    expect(screen.getByText('Game Chat')).toBeInTheDocument();
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('shows welcome message when connected', async () => {
    renderWithProviders(<GameChat gameId="123" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome to the game chat! Introduce yourself/)).toBeInTheDocument();
    });
  });

  it('allows typing and sending messages', async () => {
    renderWithProviders(<GameChat gameId="123" />);
    
    const input = screen.getByPlaceholderText('Type a message... (Enter to send)');
    const sendButton = screen.getByTitle('Send message');
    
    // Type a message
    fireEvent.change(input, { target: { value: 'Hello everyone!' } });
    expect(input).toHaveValue('Hello everyone!');
    
    // Send the message
    fireEvent.click(sendButton);
    
    // Verify the message was sent via STOMP
    expect(mockStompWebSocket.send).toHaveBeenCalledWith(
      '/app/games/123/chat',
      expect.objectContaining({
        gameId: 123,
        sender: 'Test',
        content: 'Hello everyone!',
        clientId: expect.any(String),
      })
    );
  });

  it('handles Enter key to send messages', async () => {
    renderWithProviders(<GameChat gameId="123" />);
    
    const input = screen.getByPlaceholderText('Type a message... (Enter to send)');
    
    // Type a message and press Enter
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
    
    // Verify the message was sent
    expect(mockStompWebSocket.send).toHaveBeenCalledWith(
      '/app/games/123/chat',
      expect.objectContaining({
        content: 'Test message',
      })
    );
  });

  it('shows typing indicator when typing', async () => {
    renderWithProviders(<GameChat gameId="123" />);
    
    const input = screen.getByPlaceholderText('Type a message... (Enter to send)');
    
    // Start typing
    fireEvent.change(input, { target: { value: 'T' } });
    
    // Verify typing indicator was sent
    expect(mockStompWebSocket.send).toHaveBeenCalledWith(
      '/app/games/123/typing',
      expect.objectContaining({
        gameId: '123',
        userId: '1',
        userName: 'Test',
      })
    );
  });

  it('subscribes to chat and typing topics on mount', () => {
    renderWithProviders(<GameChat gameId="123" />);
    
    expect(mockStompWebSocket.subscribe).toHaveBeenCalledWith(
      '/topic/games/123/chat',
      expect.any(Function)
    );
    expect(mockStompWebSocket.subscribe).toHaveBeenCalledWith(
      '/topic/games/123/typing',
      expect.any(Function)
    );
  });

  it('shows connection status when disconnected', () => {
    mockStompWebSocket.isConnected = false;
    mockStompWebSocket.connectionStatus = 'disconnected';
    
    renderWithProviders(<GameChat gameId="123" />);
    
    expect(screen.getByText('Reconnecting to chat...')).toBeInTheDocument();
  });

  it('renders collapsed state correctly', () => {
    const mockToggleCollapse = jest.fn();
    renderWithProviders(
      <GameChat 
        gameId="123" 
        isCollapsed={true} 
        onToggleCollapse={mockToggleCollapse} 
      />
    );
    
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.queryByText('Game Chat')).not.toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(screen.getByText('Chat'));
    expect(mockToggleCollapse).toHaveBeenCalled();
  });
});
