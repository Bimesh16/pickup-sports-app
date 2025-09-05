import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Game {
  id: string;
  title: string;
  sport: string;
  location: string;
  date: string;
  time: string;
  maxPlayers: number;
  currentPlayers: number;
  description?: string;
  image?: string;
}

interface GameState {
  games: Game[];
  featuredGames: Game[];
  isLoading: boolean;
  error: string | null;
}

interface GameActions {
  setGames: (games: Game[]) => void;
  setFeaturedGames: (games: Game[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addGame: (game: Game) => void;
  updateGame: (id: string, updates: Partial<Game>) => void;
  deleteGame: (id: string) => void;
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      games: [],
      featuredGames: [],
      isLoading: false,
      error: null,
      setGames: (games) => set({ games }),
      setFeaturedGames: (games) => set({ featuredGames: games }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      addGame: (game) => set((state) => ({ games: [...state.games, game] })),
      updateGame: (id, updates) =>
        set((state) => ({
          games: state.games.map((game) =>
            game.id === id ? { ...game, ...updates } : game
          ),
        })),
      deleteGame: (id) =>
        set((state) => ({
          games: state.games.filter((game) => game.id !== id),
        })),
    }),
    {
      name: 'game-storage',
    }
  )
);
