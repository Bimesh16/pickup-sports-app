// Mock WebSocket for development when backend is not available
export class MockWebSocket {
  public readyState: number = WebSocket.CONNECTING;
  public onopen: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;

  constructor(url: string) {
    console.log('Mock WebSocket created for:', url);
    
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
      
      // Simulate some mock notifications for testing
      this.simulateMockNotifications();
    }, 1000);
  }

  send(data: string) {
    console.log('Mock WebSocket send:', data);
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code: 1000, reason: 'Normal closure' }));
    }
  }

  private simulateMockNotifications() {
    // Send a welcome notification once after connection
    setTimeout(() => {
      if (this.onmessage && this.readyState === WebSocket.OPEN) {
        const welcomeNotification = {
          type: 'notification_created',
          payload: {
            id: Date.now().toString(),
            type: 'game_invite',
            title: 'Welcome to Pickup Sports! 🎮',
            message: 'Your account is ready. Start exploring games and connect with players in your area!',
            priority: 'normal'
          }
        };
        
        this.onmessage(new MessageEvent('message', {
          data: JSON.stringify(welcomeNotification)
        }));
      }
    }, 2000);

    // Optionally send occasional notifications (much less frequent)
    // Only uncomment for testing purposes
    /*
    const mockNotifications = [
      {
        type: 'game_updated',
        payload: {
          gameId: '123',
          playerCount: 8,
          maxPlayers: 10,
          status: 'ACTIVE'
        }
      }
    ];

    // Send mock notifications much less frequently (every 5 minutes for testing)
    setInterval(() => {
      if (Math.random() > 0.7) { // Only 30% chance to send
        const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
        if (this.onmessage && this.readyState === WebSocket.OPEN) {
          this.onmessage(new MessageEvent('message', {
            data: JSON.stringify(randomNotification)
          }));
        }
      }
    }, 300000); // 5 minutes
    */
  }
}

// Override WebSocket in development if backend is not available
if (import.meta.env.DEV) {
  const originalWebSocket = window.WebSocket;
  
  // Check if we can connect to the backend
  const testConnection = async () => {
    try {
      const response = await fetch('http://localhost:8080/health', { 
        method: 'HEAD',
        mode: 'no-cors',
        signal: AbortSignal.timeout(2000)
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  // Use mock WebSocket if backend is not available
  testConnection().then(isBackendAvailable => {
    if (!isBackendAvailable) {
      console.log('Backend not available, using mock WebSocket');
      (window as any).WebSocket = MockWebSocket;
    }
  }).catch(() => {
    // If test fails, use mock WebSocket
    console.log('Backend test failed, using mock WebSocket');
    (window as any).WebSocket = MockWebSocket;
  });
}
