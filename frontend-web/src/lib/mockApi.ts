// src/lib/mockApi.ts - Comprehensive Mock API Service

import type {
  User, Game, GameSummaryDTO, Venue, Sport, Notification,
  LoginRequest, RegisterRequest, TokenPairResponse,
  CreateGameRequest, UpdateProfileRequest,
  ComprehensiveRecommendationsResponse, NepalFutsalParams,
  PopularFutsalArea, SystemMetrics, PaginatedResponse
} from '@app-types/api';

import { NEPAL_LOCATIONS, POPULAR_SPORTS_NEPAL, KATHMANDU_AREAS } from '@constants/nepal';

class MockHttpError extends Error {
  status: number;
  body: any;
  constructor(status: number, body: any) {
    super(typeof body === 'string' ? body : body?.message || `Mock HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage
let mockUsers: User[] = [
  {
    id: 1,
    username: 'jane@example.com',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    bio: 'Soccer enthusiast from Kathmandu. Love playing futsal every evening!',
    skillLevel: 'INTERMEDIATE',
    age: 25,
    gender: 'FEMALE',
    phoneNumber: '+977 98XXXXXXXX',
    position: 'Midfielder',
    location: 'Thamel, Kathmandu',
    latitude: 27.7172,
    longitude: 85.3240,
    preferredSportId: 1,
    ratingAverage: 4.2,
    ratingCount: 15,
    isVerified: true,
    locale: 'en-NP',
    socialMedia: {
      instagram: '@jane_doe',
      tiktok: '@jane_sports',
      facebook: 'jane.doe.123',
      twitter: '@jane_doe'
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: 2,
    username: 'john@example.com',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Smith',
    bio: 'Basketball player and coach from Pokhara. Always up for a good game!',
    skillLevel: 'ADVANCED',
    age: 28,
    gender: 'MALE',
    phoneNumber: '+977 98XXXXXXXX',
    position: 'Point Guard',
    location: 'Lakeside, Pokhara',
    latitude: 28.2096,
    longitude: 83.9856,
    preferredSportId: 4,
    ratingAverage: 4.7,
    ratingCount: 23,
    isVerified: true,
    locale: 'en-NP',
    socialMedia: {
      instagram: '@john_smith',
      tiktok: '@john_basketball',
      facebook: 'john.smith.456',
      twitter: '@john_smith'
    },
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-18T16:45:00Z'
  }
];

let mockGames: Game[] = [
  {
    id: 1,
    sport: 'Futsal',
    location: 'Tundikhel Futsal Court',
    latitude: 27.7172,
    longitude: 85.3240,
    gameTime: '2025-01-15T18:00:00Z',
    skillLevel: 'INTERMEDIATE',
    description: 'Evening futsal game. All skill levels welcome! Great way to end the day.',
    minPlayers: 6,
    maxPlayers: 10,
    currentPlayers: 7,
    pricePerPlayer: 150,
    totalCost: 1500,
    durationMinutes: 90,
    capacity: 10,
    waitlistEnabled: true,
    isPrivate: false,
    requiresApproval: false,
    weatherDependent: false,
    equipmentProvided: 'Balls, Bibs',
    equipmentRequired: 'Football boots, Shin guards',
    status: 'ACTIVE',
    createdBy: {
      id: 1,
      username: 'jane@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=64&h=64&fit=crop&crop=face'
    },
    participants: [
      {
        gameId: 1,
        user: {
          id: 1,
          username: 'jane@example.com',
          skillLevel: 'INTERMEDIATE'
        },
        status: 'CONFIRMED',
        joinedAt: '2025-01-14T10:00:00Z'
      }
    ],
    createdAt: '2025-01-14T10:00:00Z',
    updatedAt: '2025-01-14T15:30:00Z'
  },
  {
    id: 2,
    sport: 'Basketball',
    location: 'Kathmandu Sports Complex',
    latitude: 27.7200,
    longitude: 85.3300,
    gameTime: '2025-01-15T19:30:00Z',
    skillLevel: 'ADVANCED',
    description: 'Competitive basketball game. Looking for experienced players only.',
    minPlayers: 8,
    maxPlayers: 10,
    currentPlayers: 6,
    pricePerPlayer: 200,
    totalCost: 2000,
    durationMinutes: 120,
    capacity: 10,
    waitlistEnabled: false,
    isPrivate: false,
    requiresApproval: true,
    weatherDependent: false,
    equipmentProvided: 'Basketball',
    equipmentRequired: 'Basketball shoes',
    status: 'ACTIVE',
    createdBy: {
      id: 2,
      username: 'john@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
    },
    participants: [],
    createdAt: '2025-01-13T14:00:00Z',
    updatedAt: '2025-01-14T09:15:00Z'
  },
  {
    id: 3,
    sport: 'Cricket',
    location: 'TU Cricket Ground',
    latitude: 27.6800,
    longitude: 85.3100,
    gameTime: '2025-01-16T15:00:00Z',
    skillLevel: 'BEGINNER',
    description: 'Friendly cricket match. Perfect for beginners to learn and play!',
    minPlayers: 14,
    maxPlayers: 22,
    currentPlayers: 18,
    pricePerPlayer: 100,
    totalCost: 2200,
    durationMinutes: 180,
    capacity: 22,
    waitlistEnabled: true,
    isPrivate: false,
    requiresApproval: false,
    weatherDependent: true,
    equipmentProvided: 'Bat, Ball, Wickets',
    equipmentRequired: 'Sports clothing',
    status: 'ACTIVE',
    createdBy: {
      id: 1,
      username: 'jane@example.com'
    },
    participants: [],
    createdAt: '2025-01-12T16:00:00Z',
    updatedAt: '2025-01-14T11:20:00Z'
  }
];

let mockVenues: Venue[] = [
  {
    id: 1,
    name: 'Tundikhel Futsal Court',
    description: 'Premier futsal facility in the heart of Kathmandu',
    address: 'Tundikhel, Kathmandu 44600',
    latitude: 27.7172,
    longitude: 85.3240,
    phone: '+977-1-4123456',
    email: 'info@tundikhelfutsal.com',
    capacity: 20,
    hourlyRate: 1500,
    amenities: ['parking', 'changing_room', 'shower', 'refreshments'],
    operatingHours: {
      monday: '06:00-22:00',
      tuesday: '06:00-22:00',
      wednesday: '06:00-22:00',
      thursday: '06:00-22:00',
      friday: '06:00-22:00',
      saturday: '06:00-23:00',
      sunday: '06:00-23:00'
    },
    isActive: true
  },
  {
    id: 2,
    name: 'Kathmandu Sports Complex',
    description: 'Multi-sport facility with basketball and volleyball courts',
    address: 'New Baneshwor, Kathmandu 44600',
    latitude: 27.7200,
    longitude: 85.3300,
    phone: '+977-1-4567890',
    capacity: 100,
    hourlyRate: 2000,
    amenities: ['parking', 'changing_room', 'shower', 'first_aid', 'seating'],
    isActive: true
  }
];

let mockNotifications: Notification[] = [
  {
    id: 1,
    userId: 1,
    message: 'Your futsal game tomorrow at 6 PM is confirmed!',
    type: 'GAME_REMINDER',
    isRead: false,
    createdAt: '2025-01-14T20:00:00Z'
  },
  {
    id: 2,
    userId: 1,
    message: 'New player joined your basketball game',
    type: 'GAME_UPDATE',
    isRead: true,
    readAt: '2025-01-14T10:30:00Z',
    createdAt: '2025-01-14T10:00:00Z'
  }
];

// Authentication responses
const mockAuthResponses = {
  'jane@example.com': {
    accessToken: 'mock-jwt-token-jane-' + Date.now(),
    refreshToken: 'mock-refresh-token-jane-' + Date.now(),
    tokenType: 'Bearer',
    expiresInSeconds: 7200
  },
  'john@example.com': {
    accessToken: 'mock-jwt-token-john-' + Date.now(),
    refreshToken: 'mock-refresh-token-john-' + Date.now(),
    tokenType: 'Bearer',
    expiresInSeconds: 7200
  }
};

let currentUser: User | null = null;

export class MockApiService {
  static async checkUsername(username: string): Promise<{ available: boolean }> {
    await delay(150);
    const pattern = /^[a-zA-Z0-9_]{3,20}$/;
    if (!pattern.test(username)) return { available: false };
    const exists = mockUsers.some(u => u.username.toLowerCase() === username.toLowerCase());
    return { available: !exists };
  }
  // Authentication
  static async login(request: LoginRequest & { captchaToken?: string }): Promise<TokenPairResponse | { mfaRequired: boolean; challenge: string; methods: string[] }> {
    await delay(500);
    
    const { username, password, captchaToken } = request;
    
    // Demo credentials for easy testing
    const validCredentials = [
      { username: 'demo@example.com', password: 'password123' },
      { username: 'demo123', password: 'password123' },
      { username: 'jane@example.com', password: 'password123' },
      { username: 'john@example.com', password: 'password123' }
    ];
    
    // Special flows for demoing CAPTCHA and MFA
    if (username === 'needcaptcha@example.com') {
      // Require a captchaToken to proceed
      if (!captchaToken || captchaToken.toLowerCase() !== 'ok') {
        // Signal 429 with captchaRequired
        throw new MockHttpError(429, { error: 'too_many_requests', captchaRequired: true, message: 'Please complete CAPTCHA' });
      }
    }
    if (username === 'needmfa@example.com') {
      return { mfaRequired: true, challenge: 'mock-challenge-123456', methods: ['TOTP'] };
    }

    const isValid = validCredentials.some(cred => 
      cred.username === username && cred.password === password
    );
    
    if (isValid) {
      // Use demo user for demo credentials
      const user = username.startsWith('demo') 
        ? mockUsers[0] // Use first user as demo
        : mockUsers.find(u => u.username === username);
      
      currentUser = user || mockUsers[0];
      
      const token = `mock-jwt-token-${username}-${Date.now()}`;
      return {
        accessToken: token,
        refreshToken: `mock-refresh-token-${username}-${Date.now()}`,
        tokenType: 'Bearer',
        expiresInSeconds: 3600
      };
    }
    
    throw new Error('Invalid username or password');
  }

  static async verifyMfa(request: { challenge: string; code: string }): Promise<TokenPairResponse> {
    await delay(400);
    const { challenge, code } = request || {} as any;
    if (challenge !== 'mock-challenge-123456') {
      throw new MockHttpError(400, { error: 'invalid_request', message: 'Invalid challenge' });
    }
    if (!code || !/^\d{6}$/.test(code)) {
      throw new MockHttpError(400, { error: 'invalid_grant', message: 'Invalid code' });
    }
    if (code !== '123456' && code !== '000000') {
      throw new MockHttpError(401, { error: 'invalid_grant', message: 'Incorrect code' });
    }
    const token = `mock-jwt-token-mfa-${Date.now()}`;
    return {
      accessToken: token,
      refreshToken: `mock-refresh-token-mfa-${Date.now()}`,
      tokenType: 'Bearer',
      expiresInSeconds: 3600
    };
  }

  static async register(request: RegisterRequest & { gender?: string; phoneNumber?: string; location?: string; preferences?: any; }): Promise<TokenPairResponse> {
    await delay(600);
    
    const { 
      username, 
      password, 
      email, 
      firstName, 
      lastName, 
      gender, 
      phoneNumber, 
      preferredSport, 
      location, 
      socialMedia 
    } = request;
    
    // Check if user already exists
    if (mockUsers.find(u => u.username === username || u.email === email)) {
      throw new Error('User already exists');
    }
    
    // Create new user
    const newUser: User = {
      id: mockUsers.length + 1,
      username,
      email: email || username,
      firstName,
      lastName,
      bio: '',
      skillLevel: 'BEGINNER',
      gender: (gender as any) || 'PREFER_NOT_TO_SAY',
      phoneNumber: phoneNumber || '',
      location: location || 'Kathmandu, Nepal',
      latitude: NEPAL_LOCATIONS.KATHMANDU.lat,
      longitude: NEPAL_LOCATIONS.KATHMANDU.lng,
      isVerified: false,
      locale: 'en-NP',
      socialMedia: socialMedia || {
        instagram: '',
        tiktok: '',
        facebook: '',
        twitter: ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    // persist simple preferences for demo
    (newUser as any).preferences = request.preferences || {};
    
    mockUsers.push(newUser);
    currentUser = newUser;
    
    const token = `mock-jwt-token-${username}-${Date.now()}`;
    mockAuthResponses[username as keyof typeof mockAuthResponses] = {
      accessToken: token,
      refreshToken: `mock-refresh-token-${username}-${Date.now()}`,
      tokenType: 'Bearer',
      expiresInSeconds: 7200
    };
    
    return mockAuthResponses[username as keyof typeof mockAuthResponses];
  }

  static async me(): Promise<{ username: string; roles: string[]; authenticated: boolean }> {
    await delay(200);
    
    if (!currentUser) {
      throw new Error('Not authenticated');
    }
    
    return {
      username: currentUser.username,
      roles: ['USER'],
      authenticated: true
    };
  }

  static async logout(): Promise<void> {
    await delay(100);
    currentUser = null;
  }

  static async forgotPassword(request: { email?: string; phone?: string }) {
    await delay(300);
    if (!request.email && !request.phone) {
      throw new Error('Provide email or phone');
    }
    // Generate a mock reset token
    const resetToken = 'mock-reset-' + Math.random().toString(36).slice(2);
    // In a real app, email/SMS would be sent. Here we return the token so UI can proceed.
    return { message: 'If the account exists, reset instructions were sent.', resetToken };
  }

  static async resetPassword(request: { token: string; newPassword: string }) {
    await delay(300);
    if (!request.token || request.newPassword?.length < 6) {
      throw new Error('Invalid token or weak password');
    }
    return { success: true, message: 'Password updated' };
  }

  static async forgotUsername(request: { email?: string; phone?: string }) {
    await delay(300);
    if (!request.email && !request.phone) {
      throw new Error('Provide email or phone');
    }
    return { message: 'If the account exists, your username has been sent.' };
  }

  // Profile Management
  static async getProfile(): Promise<User> {
    await delay(200);
    
    if (!currentUser) {
      throw new Error('Not authenticated');
    }
    
    return currentUser;
  }

  static async updateProfile(request: UpdateProfileRequest): Promise<User> {
    await delay(300);
    
    if (!currentUser) {
      throw new Error('Not authenticated');
    }
    
    // Update current user
    Object.assign(currentUser, request, { updatedAt: new Date().toISOString() });
    
    // Update in mock users array
    const index = mockUsers.findIndex(u => u.id === currentUser!.id);
    if (index !== -1) {
      mockUsers[index] = { ...currentUser };
    }
    
    return currentUser;
  }

  // Games
  static async nearbyGames(params: {
    latitude: number;
    longitude: number;
    radiusKm?: number;
    sport?: string;
    skillLevel?: string;
  }): Promise<GameSummaryDTO[]> {
    await delay(300);
    
    let filteredGames = mockGames.map(game => ({
      id: game.id,
      sport: game.sport,
      location: game.location,
      time: game.gameTime,
      skillLevel: game.skillLevel,
      latitude: game.latitude,
      longitude: game.longitude,
      creatorName: game.createdBy.username,
      currentPlayers: game.currentPlayers,
      maxPlayers: game.maxPlayers,
      status: game.status,
      pricePerPlayer: game.pricePerPlayer,
      durationMinutes: game.durationMinutes,
      description: game.description,
      equipmentProvided: game.equipmentProvided
    }));
    
    // Filter by sport
    if (params.sport) {
      filteredGames = filteredGames.filter(game => 
        game.sport.toLowerCase() === params.sport!.toLowerCase()
      );
    }
    
    // Filter by skill level
    if (params.skillLevel) {
      filteredGames = filteredGames.filter(game => 
        game.skillLevel?.toLowerCase() === params.skillLevel!.toLowerCase()
      );
    }
    
    // Simple distance filtering (mock implementation)
    const radiusKm = params.radiusKm || 5;
    filteredGames = filteredGames.filter(game => {
      if (!game.latitude || !game.longitude) return true;
      
      const latDiff = Math.abs(game.latitude - params.latitude);
      const lonDiff = Math.abs(game.longitude - params.longitude);
      const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
      
      return distance < (radiusKm / 111); // Rough conversion
    });
    
    return filteredGames;
  }

  static async trendingGames(params?: {
    latitude?: number;
    longitude?: number;
  }): Promise<GameSummaryDTO[]> {
    await delay(250);
    
    const games = mockGames.map(game => ({
      id: game.id,
      sport: game.sport,
      location: game.location,
      time: game.gameTime,
      skillLevel: game.skillLevel,
      latitude: game.latitude,
      longitude: game.longitude,
      creatorName: game.createdBy.username,
      currentPlayers: game.currentPlayers,
      maxPlayers: game.maxPlayers,
      status: game.status,
      pricePerPlayer: game.pricePerPlayer,
      durationMinutes: game.durationMinutes,
      description: game.description,
      equipmentProvided: game.equipmentProvided
    }));
    
    // Sort by popularity (current players)
    return games.sort((a, b) => (b.currentPlayers || 0) - (a.currentPlayers || 0));
  }

  static async createGame(request: CreateGameRequest): Promise<Game> {
    await delay(400);
    
    if (!currentUser) {
      throw new Error('Not authenticated');
    }
    
    const newGame: Game = {
      id: mockGames.length + 1,
      sport: request.sport,
      location: request.location,
      latitude: request.latitude,
      longitude: request.longitude,
      gameTime: request.gameTime,
      skillLevel: request.skillLevel as any,
      description: request.description,
      minPlayers: request.minPlayers,
      maxPlayers: request.maxPlayers,
      currentPlayers: 1, // Creator joins automatically
      pricePerPlayer: request.pricePerPlayer,
      totalCost: (request.pricePerPlayer || 0) * request.maxPlayers,
      durationMinutes: request.durationMinutes,
      capacity: request.capacity,
      waitlistEnabled: false,
      isPrivate: request.isPrivate || false,
      requiresApproval: request.requiresApproval || false,
      weatherDependent: request.weatherDependent || false,
      status: 'ACTIVE',
      createdBy: {
        id: currentUser.id,
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl
      },
      participants: [{
        gameId: mockGames.length + 1,
        user: {
          id: currentUser.id,
          username: currentUser.username,
          skillLevel: currentUser.skillLevel
        },
        status: 'CONFIRMED',
        joinedAt: new Date().toISOString()
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockGames.push(newGame);
    return newGame;
  }

  static async getGame(gameId: number): Promise<Game> {
    await delay(200);
    
    const game = mockGames.find(g => g.id === gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    return game;
  }

  static async joinGame(gameId: number): Promise<{ success: boolean; message: string }> {
    await delay(300);
    
    if (!currentUser) {
      throw new Error('Not authenticated');
    }
    
    const game = mockGames.find(g => g.id === gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    if (game.currentPlayers >= game.maxPlayers) {
      return { success: false, message: 'Game is full' };
    }
    
    // Add participant
    game.participants = game.participants || [];
    game.participants.push({
      gameId: gameId,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        skillLevel: currentUser.skillLevel
      },
      status: game.requiresApproval ? 'PENDING' : 'CONFIRMED',
      joinedAt: new Date().toISOString()
    });
    
    if (!game.requiresApproval) {
      game.currentPlayers++;
    }
    
    return { 
      success: true, 
      message: game.requiresApproval ? 'Join request sent for approval' : 'Successfully joined the game!' 
    };
  }

  static async leaveGame(gameId: number): Promise<{ success: boolean; message: string }> {
    await delay(200);
    
    if (!currentUser) {
      throw new Error('Not authenticated');
    }
    
    const game = mockGames.find(g => g.id === gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    // Remove participant
    game.participants = game.participants?.filter(p => p.user.id !== currentUser!.id) || [];
    game.currentPlayers = Math.max(0, game.currentPlayers - 1);
    
    return { success: true, message: 'Successfully left the game' };
  }

  // Venues
  static async getVenues(params?: {
    latitude?: number;
    longitude?: number;
    radius?: number;
  }): Promise<Venue[]> {
    await delay(250);
    return mockVenues;
  }

  // AI Recommendations
  static async getComprehensiveRecommendations(): Promise<ComprehensiveRecommendationsResponse> {
    await delay(400);
    
    return {
      games: mockGames.slice(0, 3),
      venues: mockVenues,
      players: mockUsers.filter(u => u.id !== currentUser?.id)
    };
  }

  // Nepal-specific endpoints
  static async getNepalFutsalNearby(params: NepalFutsalParams): Promise<GameSummaryDTO[]> {
    await delay(300);
    
    const futsalGames = mockGames
      .filter(game => game.sport.toLowerCase().includes('futsal'))
      .map(game => ({
        id: game.id,
        sport: game.sport,
        location: game.location,
        time: game.gameTime,
        skillLevel: game.skillLevel,
        latitude: game.latitude,
        longitude: game.longitude,
        creatorName: game.createdBy.username,
        currentPlayers: game.currentPlayers,
        maxPlayers: game.maxPlayers,
        status: game.status,
        pricePerPlayer: game.pricePerPlayer,
        durationMinutes: game.durationMinutes,
        description: game.description,
        equipmentProvided: game.equipmentProvided
      }));
    
    return futsalGames;
  }

  static async getPopularFutsalAreas(): Promise<PopularFutsalArea[]> {
    await delay(200);
    
    return [
      {
        name: 'Thamel Area',
        latitude: 27.7172,
        longitude: 85.3240,
        venueCount: 8,
        averageRating: 4.2
      },
      {
        name: 'New Baneshwor',
        latitude: 27.6892,
        longitude: 85.3450,
        venueCount: 12,
        averageRating: 4.5
      },
      {
        name: 'Lalitpur',
        latitude: 27.6588,
        longitude: 85.3247,
        venueCount: 6,
        averageRating: 4.0
      }
    ];
  }

  static async getLocalizedSports(): Promise<Sport[]> {
    await delay(150);
    
    return POPULAR_SPORTS_NEPAL.map((sport, index) => ({
      id: sport.id,
      name: sport.name,
      description: sport.description,
      minPlayers: sport.name === 'Cricket' ? 14 : sport.name === 'Basketball' ? 8 : 6,
      maxPlayers: sport.name === 'Cricket' ? 22 : sport.name === 'Basketball' ? 10 : 12,
      equipmentRequired: ['Sports clothing', 'Appropriate footwear'],
      isActive: true
    }));
  }

  // Notifications
  static async getNotifications(): Promise<Notification[]> {
    await delay(200);
    
    if (!currentUser) {
      throw new Error('Not authenticated');
    }
    
    return mockNotifications.filter(n => n.userId === currentUser.id);
  }

  static async markNotificationRead(notificationId: number): Promise<{ success: boolean }> {
    await delay(100);
    
    const notification = mockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      notification.readAt = new Date().toISOString();
    }
    
    return { success: true };
  }

  // System endpoints
  static async getEnvironmentFlags(): Promise<{ env: string }> {
    await delay(100);
    return { env: 'mock' };
  }

  static async getSystemStatus(): Promise<{ 
    name: string; 
    version: string; 
    status: string; 
    timestamp: number 
  }> {
    await delay(150);
    return {
      name: 'Pickup Sports API',
      version: '1.0.0',
      status: 'ok',
      timestamp: Date.now()
    };
  }

  static async getSystemMetrics(): Promise<SystemMetrics> {
    await delay(200);
    
    return {
      activeUsers: Math.floor(Math.random() * 100) + 50,
      activeGames: Math.floor(Math.random() * 20) + 10,
      totalUsers: mockUsers.length,
      totalGames: mockGames.length,
      systemLoad: Math.random() * 0.8 + 0.1,
      memoryUsage: Math.random() * 0.7 + 0.2
    };
  }
}
