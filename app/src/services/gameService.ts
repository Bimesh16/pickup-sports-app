import { apiService } from './api';
import { 
  Game, 
  CreateGameRequest, 
  UpdateGameRequest, 
  JoinGameRequest, 
  GameSearchParams, 
  Sport, 
  GameTemplate 
} from '@/types/game';

class GameService {
  // Game Management
  async getGames(params?: GameSearchParams): Promise<Game[]> {
    return await apiService.get<Game[]>('/games', params);
  }

  async getGame(gameId: number): Promise<Game> {
    return await apiService.get<Game>(`/games/${gameId}`);
  }

  async createGame(request: CreateGameRequest): Promise<Game> {
    return await apiService.post<Game>('/games', request);
  }

  async updateGame(gameId: number, request: UpdateGameRequest): Promise<Game> {
    return await apiService.put<Game>(`/games/${gameId}`, request);
  }

  async deleteGame(gameId: number): Promise<void> {
    await apiService.delete(`/games/${gameId}`);
  }

  // Game Participation
  async joinGame(gameId: number, request?: JoinGameRequest): Promise<void> {
    await apiService.post(`/games/${gameId}/join`, request);
  }

  async leaveGame(gameId: number): Promise<void> {
    await apiService.post(`/games/${gameId}/leave`);
  }

  async getMyGames(): Promise<Game[]> {
    return await apiService.get<Game[]>('/games/my');
  }

  async getGameParticipants(gameId: number): Promise<any[]> {
    return await apiService.get<any[]>(`/games/${gameId}/participants`);
  }

  // Sports
  async getSports(): Promise<Sport[]> {
    return await apiService.get<Sport[]>('/sports');
  }

  async getSport(sportId: number): Promise<Sport> {
    return await apiService.get<Sport>(`/sports/${sportId}`);
  }

  // Game Templates
  async getGameTemplates(): Promise<GameTemplate[]> {
    return await apiService.get<GameTemplate[]>('/api/game-templates');
  }

  async createGameFromTemplate(templateId: number, data: any): Promise<Game> {
    return await apiService.post<Game>(`/api/game-templates/${templateId}/apply`, data);
  }

  // Team Management
  async getGameTeams(gameId: number): Promise<any[]> {
    return await apiService.get<any[]>(`/games/${gameId}/teams`);
  }

  async formTeams(gameId: number, strategy: string = 'SKILL_BALANCED'): Promise<void> {
    await apiService.post(`/games/${gameId}/teams/form`, {
      strategy,
      assignCaptains: true,
      preserveFriendGroups: false
    });
  }

  // Nepal Specific Features
  async getNearbyFutsalGames(latitude: number, longitude: number, radius: number = 25): Promise<Game[]> {
    return await apiService.get<Game[]>('/api/v1/nepal/futsal/nearby', {
      latitude,
      longitude,
      radius
    });
  }

  async getPopularAreas(): Promise<string[]> {
    return await apiService.get<string[]>('/api/v1/nepal/futsal/popular-areas');
  }

  async getLocalizedSports(): Promise<Sport[]> {
    return await apiService.get<Sport[]>('/api/v1/nepal/sports/localized');
  }

  async getPopularTimeSlots(): Promise<any[]> {
    return await apiService.get<any[]>('/api/v1/nepal/time-slots/popular');
  }

  // AI Recommendations
  async getRecommendedGames(userId: number): Promise<Game[]> {
    return await apiService.get<Game[]>(`/api/v1/ai/recommendations/games/${userId}`);
  }

  async getGameAnalytics(gameId: number): Promise<any> {
    return await apiService.get<any>(`/api/v1/ai/analytics/games/${gameId}`);
  }

  // Game Search with AI
  async searchGamesWithAI(query: string, location?: { latitude: number; longitude: number }): Promise<Game[]> {
    return await apiService.post<Game[]>('/api/v1/ai/search/games', {
      query,
      location
    });
  }
}

export const gameService = new GameService();