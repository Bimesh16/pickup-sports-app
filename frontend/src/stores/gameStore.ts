import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game, GameSummary, CreateGameRequest, SearchFilters, PaginatedResponse } from '../types';
import { gameAPI } from '../services/api';

interface GameState {
  // State
  games: Game[];
  nearbyGames: GameSummary[];
  featuredGames: GameSummary[];
  userGames: Game[];
  selectedGame: Game | null;
  isLoading: boolean;
  error: string | null;
  
  // Search & Filter State
  searchFilters: SearchFilters;
  searchResults: PaginatedResponse<GameSummary> | null;
  isSearching: boolean;

  // Actions
  loadNearbyGames: (latitude: number, longitude: number, radius?: number) => Promise<void>;
  loadFeaturedGames: () => Promise<void>;
  loadUserGames: (userId: number) => Promise<void>;
  searchGames: (filters: SearchFilters, page?: number) => Promise<void>;
  getGameDetails: (gameId: number) => Promise<Game>;
  createGame: (gameData: CreateGameRequest) => Promise<Game>;
  joinGame: (gameId: number) => Promise<void>;
  leaveGame: (gameId: number) => Promise<void>;
  updateSearchFilters: (filters: Partial<SearchFilters>) => void;
  clearSearch: () => void;
  clearError: () => void;
  setSelectedGame: (game: Game | null) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      games: [],
      nearbyGames: [],
      featuredGames: [],
      userGames: [],
      selectedGame: null,
      isLoading: false,
      error: null,
      
      // Search state
      searchFilters: {},
      searchResults: null,
      isSearching: false,

      // Load nearby games
      loadNearbyGames: async (latitude: number, longitude: number, radius = 10) => {
        set({ isLoading: true, error: null });
        
        try {
          const games = await gameAPI.getNearbyGames(latitude, longitude, radius);
          set({
            nearbyGames: games,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to load nearby games';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Load featured games
      loadFeaturedGames: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const games = await gameAPI.getFeaturedGames();
          set({
            featuredGames: games,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to load featured games';
          set({
            isLoading: false,
            error: errorMessage,
          });
        }
      },

      // Load user's games
      loadUserGames: async (userId: number) => {
        set({ isLoading: true, error: null });
        
        try {
          const games = await gameAPI.getUserGames(userId);
          set({
            userGames: games,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to load user games';
          set({
            isLoading: false,
            error: errorMessage,
          });
        }
      },

      // Search games with filters
      searchGames: async (filters: SearchFilters, page = 0) => {
        set({ isSearching: true, error: null });
        
        try {
          const results = await gameAPI.searchGames(filters, page);
          
          if (page === 0) {
            // New search
            set({
              searchResults: results,
              searchFilters: filters,
              isSearching: false,
              error: null,
            });
          } else {
            // Load more results
            const { searchResults } = get();
            if (searchResults) {
              set({
                searchResults: {
                  ...results,
                  content: [...searchResults.content, ...results.content],
                },
                isSearching: false,
              });
            }
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to search games';
          set({
            isSearching: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Get detailed game information
      getGameDetails: async (gameId: number) => {
        set({ isLoading: true, error: null });
        
        try {
          const game = await gameAPI.getGameDetails(gameId);
          
          // Update games array if game exists
          const { games } = get();
          const gameIndex = games.findIndex(g => g.id === gameId);
          
          if (gameIndex >= 0) {
            const updatedGames = [...games];
            updatedGames[gameIndex] = game;
            set({ games: updatedGames });
          } else {
            set({ games: [...games, game] });
          }
          
          set({
            selectedGame: game,
            isLoading: false,
            error: null,
          });
          
          return game;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to load game details';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Create new game
      createGame: async (gameData: CreateGameRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const game = await gameAPI.createGame(gameData);
          
          // Add to games list
          const { games } = get();
          set({
            games: [game, ...games],
            selectedGame: game,
            isLoading: false,
            error: null,
          });
          
          return game;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to create game';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Join a game
      joinGame: async (gameId: number) => {
        set({ isLoading: true, error: null });
        
        try {
          await gameAPI.joinGame(gameId);
          
          // Refresh game details
          await get().getGameDetails(gameId);
          
          set({
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to join game';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Leave a game
      leaveGame: async (gameId: number) => {
        set({ isLoading: true, error: null });
        
        try {
          await gameAPI.leaveGame(gameId);
          
          // Refresh game details
          await get().getGameDetails(gameId);
          
          set({
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to leave game';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Update search filters
      updateSearchFilters: (filters: Partial<SearchFilters>) => {
        const { searchFilters } = get();
        set({
          searchFilters: { ...searchFilters, ...filters },
        });
      },

      // Clear search results
      clearSearch: () => {
        set({
          searchResults: null,
          searchFilters: {},
        });
      },

      // Clear error state
      clearError: () => {
        set({ error: null });
      },

      // Set selected game
      setSelectedGame: (game: Game | null) => {
        set({ selectedGame: game });
      },
    }),
    {
      name: 'game-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist non-volatile data
      partialize: (state) => ({
        searchFilters: state.searchFilters,
        featuredGames: state.featuredGames,
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useNearbyGames = () => useGameStore((state) => state.nearbyGames);
export const useFeaturedGames = () => useGameStore((state) => state.featuredGames);
export const useUserGames = () => useGameStore((state) => state.userGames);
export const useSelectedGame = () => useGameStore((state) => state.selectedGame);
export const useGameLoading = () => useGameStore((state) => state.isLoading);
export const useGameError = () => useGameStore((state) => state.error);
export const useSearchResults = () => useGameStore((state) => state.searchResults);
export const useSearchFilters = () => useGameStore((state) => state.searchFilters);
export const useGameActions = () => useGameStore((state) => ({
  loadNearbyGames: state.loadNearbyGames,
  loadFeaturedGames: state.loadFeaturedGames,
  loadUserGames: state.loadUserGames,
  searchGames: state.searchGames,
  getGameDetails: state.getGameDetails,
  createGame: state.createGame,
  joinGame: state.joinGame,
  leaveGame: state.leaveGame,
  updateSearchFilters: state.updateSearchFilters,
  clearSearch: state.clearSearch,
  clearError: state.clearError,
  setSelectedGame: state.setSelectedGame,
}));