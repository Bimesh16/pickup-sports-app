/**
 * WebSocket Integration Test
 * 
 * This test verifies that the STOMP WebSocket implementation
 * can connect to the backend and handle chat messages properly.
 * 
 * Note: This test requires the backend to be running on localhost:8080
 */

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Mock localStorage for testing
const mockLocalStorage = {
  getItem: jest.fn(() => 'mock-jwt-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('WebSocket Integration', () => {
  let stompClient: Client;
  const testGameId = '123';
  const testMessage = {
    gameId: parseInt(testGameId),
    sender: 'Test User',
    content: 'Hello from test!',
    clientId: 'test-client-123'
  };

  beforeAll(() => {
    // Set up STOMP client
    stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
  });

  afterAll(() => {
    if (stompClient && stompClient.connected) {
      stompClient.deactivate();
    }
  });

  it('should connect to STOMP WebSocket', (done) => {
    let connected = false;

    stompClient.onConnect = (frame) => {
      console.log('Connected:', frame);
      connected = true;
      expect(connected).toBe(true);
      done();
    };

    stompClient.onStompError = (frame) => {
      console.error('STOMP Error:', frame);
      done(new Error('Failed to connect to STOMP WebSocket'));
    };

    stompClient.onWebSocketError = (error) => {
      console.error('WebSocket Error:', error);
      done(new Error('WebSocket connection failed'));
    };

    // Set authentication headers
    stompClient.connectHeaders = {
      'Authorization': 'Bearer mock-jwt-token'
    };

    // Activate the client
    stompClient.activate();

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!connected) {
        done(new Error('Connection timeout'));
      }
    }, 10000);
  }, 15000);

  it('should subscribe to chat topic', (done) => {
    if (!stompClient.connected) {
      done(new Error('STOMP client not connected'));
      return;
    }

    const subscription = stompClient.subscribe(`/topic/games/${testGameId}/chat`, (message) => {
      console.log('Received message:', message.body);
      subscription.unsubscribe();
      done();
    });

    // Send a test message
    setTimeout(() => {
      stompClient.publish({
        destination: `/app/games/${testGameId}/chat`,
        body: JSON.stringify(testMessage),
      });
    }, 1000);
  }, 10000);

  it('should send chat message successfully', (done) => {
    if (!stompClient.connected) {
      done(new Error('STOMP client not connected'));
      return;
    }

    // Subscribe to receive the message back
    const subscription = stompClient.subscribe(`/topic/games/${testGameId}/chat`, (message) => {
      const receivedMessage = JSON.parse(message.body);
      expect(receivedMessage.content).toBe(testMessage.content);
      subscription.unsubscribe();
      done();
    });

    // Send the message
    stompClient.publish({
      destination: `/app/games/${testGameId}/chat`,
      body: JSON.stringify(testMessage),
    });
  }, 10000);

  it('should handle typing indicators', (done) => {
    if (!stompClient.connected) {
      done(new Error('STOMP client not connected'));
      return;
    }

    const typingEvent = {
      gameId: testGameId,
      userId: 'test-user-123',
      userName: 'Test User',
      at: new Date().toISOString()
    };

    // Subscribe to typing topic
    const subscription = stompClient.subscribe(`/topic/games/${testGameId}/typing`, (message) => {
      const receivedEvent = JSON.parse(message.body);
      expect(receivedEvent.userName).toBe(typingEvent.userName);
      subscription.unsubscribe();
      done();
    });

    // Send typing event
    setTimeout(() => {
      stompClient.publish({
        destination: `/app/games/${testGameId}/typing`,
        body: JSON.stringify(typingEvent),
      });
    }, 1000);
  }, 10000);
});
