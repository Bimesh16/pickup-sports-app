import { create } from 'zustand';
import { Game, Sport, CreateGameRequest, GameSearchParams } from '@/types/game';
import { gameService } from '@/services/gameService';
import { handleApiError } from '@/services/api';

interface GameState {
  // State
  games: Game[];
  myGames: Game[];
  currentGame: Game | null;
  sports: Sport[];
  isLoading: boolean;
  error: string | null;
  searchParams: GameSearchParams;
  
  // Actions
  fetchGames: (params?: GameSearchParams) => Promise<void>;
  fetchMyGames: () => Promise<void>;
  fetchGame: (gameId: number) => Promise<void>;
  createGame: (data: CreateGameRequest) => Promise<Game>;
  joinGame: (gameId: number, message?: string) => Promise<void>;
  leaveGame: (gameId: number) => Promise<void>;
  fetchSports: () => Promise<void>;
  
  // Nepal-specific actions
  fetchNearbyFutsal: (latitude: number, longitude: number) => Promise<void>;
  fetchRecommendedGames: (userId: number) => Promise<void>;
  
  // Utility actions
  setSearchParams: (params: GameSearchParams) => void;
  clearError: () => void;
  clearCurrentGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  games: [],
  myGames: [],
  currentGame: null,
  sports: [],
  isLoading: false,
  error: null,
  searchParams: {},

  // Actions
  fetchGames: async (params?: GameSearchParams) => {
    set({ isLoading: true, error: null });
    try {
      const searchParams = params || get().searchParams;
      const games = await gameService.getGames(searchParams);
      set({ games, isLoading: false });
    } catch (error) {
      set({ 
        error: handleApiError(error), 
        isLoading: false 
      });
    }
  },

  fetchMyGames: async () => {
    set({ isLoading: true, error: null });
    try {
      const myGames = await gameService.getMyGames();
      set({ myGames, isLoading: false });
    } catch (error) {
      set({ 
        error: handleApiError(error), 
        isLoading: false 
      });
    }
  },

  fetchGame: async (gameId: number) => {
    set({ isLoading: true, error: null });
    try {
      const game = await gameService.getGame(gameId);
      set({ currentGame: game, isLoading: false });
    } catch (error) {
      set({ 
        error: handleApiError(error), 
        isLoading: false 
      });
    }
  },

  createGame: async (data: CreateGameRequest) => {
    set({ isLoading: true, error: null });
    try {
      const game = await gameService.createGame(data);
      set({ 
        games: [game, ...get().games], 
        isLoading: false 
      });
      return game;
    } catch (error) {
      set({ 
        error: handleApiError(error), 
        isLoading: false 
      });
      throw error;
    }
  },

  joinGame: async (gameId: number, message?: string) => {
    set({ isLoading: true, error: null });
    try {
      await gameService.joinGame(gameId, { message });
      
      // Refresh current game if it's the one being joined
      if (get().currentGame?.id === gameId) {
        await get().fetchGame(gameId);
      }
      
      // Refresh games list
      await get().fetchGames();
      await get().fetchMyGames();
      
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: handleApiError(error), 
        isLoading: false 
      });
      throw error;
    }
  },

  leaveGame: async (gameId: number) => {
    set({ isLoading: true, error: null });
    try {
      await gameService.leaveGame(gameId);
      
      // Refresh current game if it's the one being left
      if (get().currentGame?.id === gameId) {
        await get().fetchGame(gameId);
      }
      
      // Refresh games list
      await get().fetchGames();
      await get().fetchMyGames();
      
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: handleApiError(error), 
        isLoading: false 
      });
      throw error;
    }
  },

  fetchSports: async () => {
    try {
      const sports = await gameService.getSports();
      set({ sports });
    } catch (error) {
      set({ error: handleApiError(error) });
    }
  },

  // Nepal-specific actions
  fetchNearbyFutsal: async (latitude: number, longitude: number) => {
    set({ isLoading: true, error: null });
    try {
      const games = await gameService.getNearbyFutsalGames(latitude, longitude);
      set({ games, isLoading: false });
    } catch (error) {
      set({ 
        error: handleApiError(error), 
        isLoading: false 
      });
    }
  },

  fetchRecommendedGames: async (userId: number) => {
    set({ isLoading: true, error: null });
    try {
      const games = await gameService.getRecommendedGames(userId);
      set({ games, isLoading: false });
    } catch (error) {
      set({ 
        error: handleApiError(error), 
        isLoading: false 
      });
    }
  },

  // Utility actions
  setSearchParams: (params: GameSearchParams) => {
    set({ searchParams: { ...get().searchParams, ...params } });
  },

  clearError: () => {
    set({ error: null });
  },

  clearCurrentGame: () => {
    set({ currentGame: null });
  },
}));