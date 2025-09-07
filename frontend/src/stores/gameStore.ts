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
  nearbyGames: Game[];
  isLoading: boolean;
  error: string | null;
}

interface GameActions {
  setGames: (games: Game[]) => void;
  setFeaturedGames: (games: Game[]) => void;
  setNearbyGames: (games: Game[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addGame: (game: Game) => void;
  updateGame: (id: string, updates: Partial<Game>) => void;
  deleteGame: (id: string) => void;
  fetchNearbyGames: () => Promise<void>;
  fetchFeaturedGames: () => Promise<void>;
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      games: [],
      featuredGames: [],
      nearbyGames: [],
      isLoading: false,
      error: null,
      setGames: (games) => set({ games }),
      setFeaturedGames: (games) => set({ featuredGames: games }),
      setNearbyGames: (games) => set({ nearbyGames: games }),
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
      fetchNearbyGames: async () => {
        try {
          set({ isLoading: true });
          // Mock data for now
          const lat = 27.7172;
          const lon = 85.3240;
          const res = { ok: true, data: [] };
          if (res.ok) {
            const list = (res.data?.content || res.data || []) as any[];
            const mapped: Game[] = list.map((g: any) => ({
              id: String(g.id || Math.random()),
              title: g.title || `${g.sport || 'Game'} @ ${g.venue?.name || g.location || ''}`,
              sport: g.sport || 'SPORT',
              location: g.venue?.name || (typeof g.location === 'string' ? g.location : g.location?.name || g.location?.address || 'Unknown'),
              date: g.time || g.dateTime || new Date().toISOString(),
              time: g.time || g.dateTime || new Date().toISOString(),
              maxPlayers: g.maxPlayers || g.capacity || 0,
              currentPlayers: g.currentParticipants || g.currentPlayers || 0,
            }));
            set({ nearbyGames: mapped, isLoading: false });
          } else {
            set({ isLoading: false, error: res.data?.message || 'Failed to load nearby games' });
          }
        } catch (e: any) {
          set({ isLoading: false, error: e?.message || 'Failed to load nearby games' });
        }
      },
      fetchFeaturedGames: async () => {
        try {
          set({ isLoading: true });
          // Mock data for now
          const res = { ok: true, data: [] };
          if (res.ok) {
            const list = (res.data?.content || res.data || []) as any[];
            const mapped: Game[] = list.map((g: any) => ({
              id: String(g.id || Math.random()),
              title: g.title || `${g.sport || 'Game'} @ ${g.venue?.name || g.location || ''}`,
              sport: g.sport || 'SPORT',
              location: g.venue?.name || (typeof g.location === 'string' ? g.location : g.location?.name || g.location?.address || 'Unknown'),
              date: g.time || g.dateTime || new Date().toISOString(),
              time: g.time || g.dateTime || new Date().toISOString(),
              maxPlayers: g.maxPlayers || g.capacity || 0,
              currentPlayers: g.currentParticipants || g.currentPlayers || 0,
            }));
            set({ featuredGames: mapped, isLoading: false });
          } else {
            set({ isLoading: false, error: res.data?.message || 'Failed to load featured games' });
          }
        } catch (e: any) {
          set({ isLoading: false, error: e?.message || 'Failed to load featured games' });
        }
      },
    }),
    {
      name: 'game-storage',
    }
  )
);
