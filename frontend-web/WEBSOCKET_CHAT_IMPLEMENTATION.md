# WebSocket Chat Implementation

## Overview

This document describes the real-time WebSocket chat implementation for the Pickup Sports App. The implementation uses STOMP (Simple Text Oriented Messaging Protocol) over WebSocket for reliable message delivery and subscription management.

## Architecture

### Frontend Components

1. **StompWebSocketContext** (`src/context/StompWebSocketContext.tsx`)
   - Manages STOMP WebSocket connection
   - Handles authentication with JWT tokens
   - Provides subscription and message sending capabilities
   - Implements automatic reconnection with exponential backoff

2. **GameChat Component** (`src/components/GameChat.tsx`)
   - Real-time chat interface for games
   - Supports message sending/receiving
   - Typing indicators
   - Message history and scrolling
   - Cultural UI design with Nepal flag colors

3. **Game Details Integration** (`src/pages/dashboard/GameDetails.tsx`)
   - Chat button in header for easy access
   - Smooth scrolling to chat section
   - Conditional rendering based on `chatEnabled` flag

### Backend Integration

The frontend connects to the Spring Boot backend using STOMP over WebSocket:

- **Connection Endpoint**: `ws://localhost:8080/ws` (with SockJS fallback)
- **Authentication**: JWT token via `Authorization` header
- **Message Broker**: Simple broker with `/topic` and `/app` prefixes

## STOMP Destinations

### Chat Messages
- **Send**: `/app/games/{gameId}/chat`
- **Subscribe**: `/topic/games/{gameId}/chat`
- **Message Format**:
  ```json
  {
    "gameId": 123,
    "sender": "Username",
    "content": "Message content",
    "clientId": "unique-client-id"
  }
  ```

### Typing Indicators
- **Send**: `/app/games/{gameId}/typing`
- **Subscribe**: `/topic/games/{gameId}/typing`
- **Message Format**:
  ```json
  {
    "gameId": "123",
    "userId": "user-id",
    "userName": "Username",
    "at": "2024-01-01T00:00:00Z"
  }
  ```

## Features

### Real-time Messaging
- ✅ Instant message delivery
- ✅ Message persistence
- ✅ Optimistic UI updates
- ✅ Message history loading

### Typing Indicators
- ✅ Real-time typing status
- ✅ Multiple user support
- ✅ Auto-cleanup after timeout

### UI/UX Features
- ✅ Nepal flag color scheme (blue to crimson gradient)
- ✅ Message bubbles with proper alignment
- ✅ User avatars and initials
- ✅ Smooth scrolling to new messages
- ✅ New message notifications
- ✅ Sound notifications (mutable)
- ✅ Responsive design
- ✅ Collapsible chat interface

### Cultural Touches
- ✅ Welcome message in English and Nepali
- ✅ Nepal flag colors throughout UI
- ✅ Friendly, social atmosphere
- ✅ Multi-language support ready

## Usage

### Basic Implementation

```tsx
import { StompWebSocketProvider } from '@context/StompWebSocketContext';
import GameChat from '@components/GameChat';

function App() {
  return (
    <StompWebSocketProvider>
      <GameChat 
        gameId="123"
        className="w-full"
      />
    </StompWebSocketProvider>
  );
}
```

### With Collapsible Interface

```tsx
const [isCollapsed, setIsCollapsed] = useState(false);

<GameChat 
  gameId="123"
  isCollapsed={isCollapsed}
  onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
  className="w-full"
/>
```

## Configuration

### Environment Variables

```env
VITE_WS_URL=ws://localhost:8080/ws
```

### Authentication

The WebSocket connection automatically uses the JWT token from localStorage (`ps_token`). The token is sent in the connection headers:

```typescript
stompClient.connectHeaders = {
  'Authorization': `Bearer ${token}`
};
```

## Error Handling

### Connection Issues
- Automatic reconnection with exponential backoff
- Maximum 5 reconnection attempts
- Connection status indicators
- Graceful degradation when disconnected

### Message Errors
- Optimistic UI updates with rollback on failure
- Error logging for debugging
- User-friendly error messages

## Testing

### Unit Tests
- Component rendering tests
- Message sending/receiving tests
- Typing indicator tests
- Connection status tests

### Integration Tests
- STOMP WebSocket connection tests
- Backend communication tests
- Message flow validation

Run tests:
```bash
npm test
```

## Performance Considerations

### Message Optimization
- Message size limits (1000 characters)
- Rate limiting on typing indicators
- Efficient subscription management

### Memory Management
- Automatic cleanup of subscriptions
- Typing indicator timeout cleanup
- Message history pagination ready

## Security

### Authentication
- JWT token validation
- User access control per game
- Message sanitization

### Content Moderation
- Profanity filtering (backend)
- Rate limiting
- Message length limits

## Browser Support

- Modern browsers with WebSocket support
- SockJS fallback for older browsers
- Mobile-responsive design

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check backend is running on port 8080
   - Verify JWT token is valid
   - Check network connectivity

2. **Messages Not Sending**
   - Verify user has access to the game
   - Check STOMP connection status
   - Review browser console for errors

3. **Typing Indicators Not Working**
   - Check subscription to typing topic
   - Verify message format
   - Check rate limiting

### Debug Mode

Enable STOMP debug logging:
```typescript
stompClient.debug = (str) => {
  console.log('STOMP Debug:', str);
};
```

## Future Enhancements

- [ ] Message reactions/emojis
- [ ] File/image sharing
- [ ] Message search
- [ ] Chat moderation tools
- [ ] Push notifications
- [ ] Message encryption
- [ ] Voice messages
- [ ] Video chat integration

## Dependencies

- `@stomp/stompjs`: STOMP client library
- `sockjs-client`: WebSocket fallback
- `react`: UI framework
- `lucide-react`: Icons
- `tailwindcss`: Styling

## License

This implementation is part of the Pickup Sports App project.
