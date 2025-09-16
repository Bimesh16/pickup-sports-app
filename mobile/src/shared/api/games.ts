import { apiClient } from '@lib/apiClient';
import { GameSummaryDTO, PaginatedResponse } from '../types/api';

export interface GamesSearchParams {
  sport?: string;
  location?: string;
  skillLevel?: string;
  fromTime?: string;
  toTime?: string;
  minPrice?: number;
  maxPrice?: number;
  minPlayers?: number;
  maxPlayers?: number;
  isPrivate?: boolean;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface GamesResponse {
  content: GameSummaryDTO[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export const gamesApi = {
  // Search games with filters
  async searchGames(params: GamesSearchParams = {}): Promise<GamesResponse> {
    const queryParams = new URLSearchParams();
    
    // Add all non-undefined parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/api/v1/games/search/advanced?${queryParams.toString()}`);
    return response.data;
  },

  // Get nearby games
  async getNearbyGames(lat: number, lng: number, radiusKm: number = 5, page: number = 0, size: number = 20): Promise<GamesResponse> {
    const response = await apiClient.get('/api/v1/games/nearby', {
      params: {
        lat,
        lon: lng,
        radiusKm,
        page,
        size,
        sort: 'time,asc'
      }
    });
    return response.data;
  },

  // Get game details
  async getGameDetails(gameId: number): Promise<GameSummaryDTO> {
    const response = await apiClient.get(`/api/v1/games/${gameId}`);
    return response.data;
  },

  // Join a game
  async joinGame(gameId: number): Promise<{ status: string; position?: number; message: string }> {
    const response = await apiClient.post(`/api/v1/games/${gameId}/join`);
    return response.data;
  },

  // Leave a game
  async leaveGame(gameId: number): Promise<void> {
    await apiClient.delete(`/api/v1/games/${gameId}/join`);
  },

  // Get games by sport
  async getGamesBySport(sport: string, page: number = 0, size: number = 20): Promise<GamesResponse> {
    const response = await apiClient.get('/api/v1/games', {
      params: {
        sport,
        page,
        size,
        sort: 'time,asc'
      }
    });
    return response.data;
  }
};

// Helper function to calculate distance between two points
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper function to format time for display
export function formatGameTime(timeString: string): { day: string; time: string; date: string } {
  const date = new Date(timeString);
  return {
    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  };
}

// Helper function to get sport emoji
export function getSportEmoji(sport: string): string {
  const sportEmojis: Record<string, string> = {
    'Futsal': '⚽',
    'Football': '⚽',
    'Soccer': '⚽',
    'Basketball': '🏀',
    'Cricket': '🏏',
    'Volleyball': '🏐',
    'Badminton': '🏸',
    'Tennis': '🎾',
    'Table Tennis': '🏓',
    'Squash': '🏓',
    'Hockey': '🏑',
    'Baseball': '⚾',
    'Rugby': '🏉',
    'American Football': '🏈'
  };
  
  return sportEmojis[sport] || '⚽';
}