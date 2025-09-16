export const testData = {
  users: {
    valid: {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe'
    },
    invalid: {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    },
    admin: {
      email: 'admin@example.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin'
    }
  },
  
  games: {
    football: {
      id: 'game-1',
      sport: 'Football',
      venue: 'Kathmandu Sports Complex',
      time: '2024-01-15T10:00:00Z',
      price: 500,
      currentPlayers: 8,
      maxPlayers: 12,
      location: { lat: 27.7172, lng: 85.324 },
      description: 'Casual football game for all skill levels',
      skillLevel: 'intermediate',
      isPrivate: false
    },
    basketball: {
      id: 'game-2',
      sport: 'Basketball',
      venue: 'Basketball Court',
      time: '2024-01-15T14:00:00Z',
      price: 300,
      currentPlayers: 4,
      maxPlayers: 10,
      location: { lat: 27.7200, lng: 85.3300 },
      description: 'Basketball game for beginners',
      skillLevel: 'beginner',
      isPrivate: false
    },
    cricket: {
      id: 'game-3',
      sport: 'Cricket',
      venue: 'Cricket Ground',
      time: '2024-01-16T09:00:00Z',
      price: 800,
      currentPlayers: 6,
      maxPlayers: 22,
      location: { lat: 27.7150, lng: 85.3200 },
      description: 'Cricket match for experienced players',
      skillLevel: 'advanced',
      isPrivate: true
    }
  },
  
  venues: {
    sportsComplex: {
      id: 'venue-1',
      name: 'Kathmandu Sports Complex',
      address: 'Kathmandu, Nepal',
      capacity: 50,
      hourlyRate: 2000,
      amenities: ['parking', 'wifi', 'shower', 'changing_room'],
      location: { lat: 27.7172, lng: 85.324 },
      phone: '+977-1-1234567',
      description: 'Modern sports complex with multiple courts'
    },
    basketballCourt: {
      id: 'venue-2',
      name: 'Basketball Court',
      address: 'Lalitpur, Nepal',
      capacity: 20,
      hourlyRate: 1000,
      amenities: ['parking', 'wifi'],
      location: { lat: 27.7200, lng: 85.3300 },
      phone: '+977-1-2345678',
      description: 'Outdoor basketball court'
    }
  },
  
  notifications: {
    gameInvite: {
      id: 'notif-1',
      type: 'game_invite',
      title: 'Game Invitation',
      message: 'You have been invited to a football game',
      isRead: false,
      timestamp: new Date().toISOString(),
      data: { gameId: 'game-1' }
    },
    reminder: {
      id: 'notif-2',
      type: 'reminder',
      title: 'Game Reminder',
      message: 'Your football game starts in 1 hour',
      isRead: false,
      timestamp: new Date().toISOString(),
      data: { gameId: 'game-1' }
    },
    achievement: {
      id: 'notif-3',
      type: 'achievement',
      title: 'Badge Earned',
      message: 'You earned the "First Goal" badge!',
      isRead: true,
      timestamp: new Date().toISOString(),
      data: { badgeId: 'first-goal' }
    }
  },
  
  trendingSports: [
    { sport: 'Football', playerCount: 45, trend: 'up' },
    { sport: 'Basketball', playerCount: 32, trend: 'up' },
    { sport: 'Cricket', playerCount: 28, trend: 'down' },
    { sport: 'Volleyball', playerCount: 20, trend: 'up' },
    { sport: 'Tennis', playerCount: 15, trend: 'stable' }
  ],
  
  userProfile: {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    bio: 'Passionate football player from Kathmandu',
    avatar: 'https://example.com/avatar.jpg',
    xp: 150,
    rank: 'Competent',
    preferences: {
      sports: ['Football', 'Basketball'],
      skillLevel: 'intermediate',
      availability: {
        monday: ['09:00', '10:00', '18:00'],
        tuesday: ['09:00', '10:00'],
        wednesday: ['18:00', '19:00'],
        thursday: ['09:00', '10:00'],
        friday: ['18:00', '19:00'],
        saturday: ['09:00', '10:00', '14:00'],
        sunday: ['09:00', '10:00', '14:00']
      }
    },
    stats: {
      gamesPlayed: 25,
      gamesWon: 18,
      averageRating: 4.2,
      favoriteSport: 'Football'
    },
    badges: [
      { id: 'first-game', name: 'First Game', description: 'Played your first game', earned: true },
      { id: 'first-goal', name: 'First Goal', description: 'Scored your first goal', earned: true },
      { id: 'team-player', name: 'Team Player', description: 'Played 10 team games', earned: true },
      { id: 'champion', name: 'Champion', description: 'Won 5 games in a row', earned: false },
      { id: 'legend', name: 'Legend', description: 'Played 100 games', earned: false }
    ]
  },
  
  teams: [
    {
      id: 'team-1',
      name: 'Kathmandu FC',
      sport: 'Football',
      members: [
        { id: 'user-123', name: 'John Doe', role: 'Captain' },
        { id: 'user-456', name: 'Jane Smith', role: 'Player' },
        { id: 'user-789', name: 'Bob Johnson', role: 'Player' }
      ],
      description: 'Local football team from Kathmandu'
    },
    {
      id: 'team-2',
      name: 'Basketball Stars',
      sport: 'Basketball',
      members: [
        { id: 'user-123', name: 'John Doe', role: 'Player' },
        { id: 'user-101', name: 'Alice Brown', role: 'Captain' }
      ],
      description: 'Competitive basketball team'
    }
  ],
  
  weather: {
    kathmandu: {
      city: 'Kathmandu',
      temperature: 22,
      condition: 'Clear',
      icon: '01d',
      humidity: 65,
      windSpeed: 5
    },
    lalitpur: {
      city: 'Lalitpur',
      temperature: 24,
      condition: 'Partly Cloudy',
      icon: '02d',
      humidity: 70,
      windSpeed: 3
    }
  },
  
  apiResponses: {
    success: { success: true },
    error: { error: 'Something went wrong' },
    validationError: { error: 'Validation failed', details: ['Field is required'] },
    notFound: { error: 'Resource not found' },
    unauthorized: { error: 'Unauthorized' },
    forbidden: { error: 'Forbidden' },
    serverError: { error: 'Internal server error' }
  },
  
  webSocketMessages: {
    gameUpdated: {
      type: 'game_updated',
      data: {
        gameId: 'game-1',
        playerCount: 10,
        maxPlayers: 12,
        status: 'active'
      }
    },
    notificationCreated: {
      type: 'notification_created',
      data: {
        id: 'notif-4',
        type: 'game_invite',
        title: 'New Game Invitation',
        message: 'You have been invited to a basketball game',
        userId: 'user-123'
      }
    },
    chatMessage: {
      type: 'chat_message',
      data: {
        gameId: 'game-1',
        userId: 'user-456',
        message: 'Hey everyone, ready to play?',
        timestamp: new Date().toISOString(),
        userName: 'Jane Doe'
      }
    }
  }
};
