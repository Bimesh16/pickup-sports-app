import type { GameSummaryDTO, LoginRequest, TokenPairResponse } from '@types/api';
import { mockGames, mockAuthResponses, mockUserProfiles } from './mockData';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockApiService {
  // Mock login function
  static async login(request: LoginRequest): Promise<TokenPairResponse | { mfaRequired: boolean; challenge: string }> {
    await delay(500); // Simulate network delay
    
    const { username, password } = request;
    
    // Simple validation - accept any password for demo users
    if (username === 'jane@example.com' || username === 'john@example.com') {
      if (password === 'password' || password === 'password123') {
        return mockAuthResponses[username as keyof typeof mockAuthResponses];
      }
    }
    
    throw new Error('Invalid username or password');
  }

  // Mock user profile function
  static async me(): Promise<{ username: string; roles: string[]; authenticated: boolean }> {
    await delay(200);
    
    const token = localStorage.getItem('ps_token');
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // Find user by token
    const user = Object.entries(mockAuthResponses).find(([_, data]) => data.accessToken === token);
    if (!user) {
      throw new Error('Invalid token');
    }
    
    return mockUserProfiles[user[0] as keyof typeof mockUserProfiles];
  }

  // Mock nearby games function
  static async nearbyGames(params: { 
    latitude: number; 
    longitude: number; 
    radiusKm?: number; 
    sport?: string; 
    skillLevel?: string 
  }): Promise<GameSummaryDTO[]> {
    await delay(300);
    
    let filteredGames = [...mockGames];
    
    // Filter by sport if specified
    if (params.sport) {
      filteredGames = filteredGames.filter(game => 
        game.sport.toLowerCase() === params.sport!.toLowerCase()
      );
    }
    
    // Filter by skill level if specified
    if (params.skillLevel) {
      filteredGames = filteredGames.filter(game => 
        game.skillLevel?.toLowerCase() === params.skillLevel!.toLowerCase()
      );
    }
    
    // Simple distance filtering (mock implementation)
    if (params.latitude && params.longitude) {
      filteredGames = filteredGames.filter(game => {
        if (!game.latitude || !game.longitude) return true;
        
        // Simple distance calculation (not accurate, just for demo)
        const latDiff = Math.abs(game.latitude - params.latitude);
        const lonDiff = Math.abs(game.longitude - params.longitude);
        const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
        
        const radiusKm = params.radiusKm || 5;
        return distance < (radiusKm / 111); // Rough conversion to degrees
      });
    }
    
    return filteredGames;
  }

  // Mock trending games function
  static async trendingGames(params?: { latitude?: number; longitude?: number }): Promise<GameSummaryDTO[]> {
    await delay(250);
    
    // Return games sorted by current players (most popular first)
    return [...mockGames].sort((a, b) => (b.currentPlayers || 0) - (a.currentPlayers || 0));
  }

  // Mock environment flags
  static async getEnvironmentFlags(): Promise<{ env: string }> {
    await delay(100);
    return { env: 'mock' };
  }
}
