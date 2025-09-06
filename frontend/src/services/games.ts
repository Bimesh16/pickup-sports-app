import { storage } from '@/utils/storage';
import { Platform } from 'react-native';

const BASE_URL = __DEV__ ? 'http://localhost:8080' : 'https://api.pickupsports.app';
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const REFRESH_NONCE_KEY = 'refresh_nonce';

async function tryRefresh(): Promise<boolean> {
  try {
    const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);
    const refreshNonce = await storage.getItem(REFRESH_NONCE_KEY);
    if (!refreshToken || !refreshNonce) return false;
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Refresh-Nonce': refreshNonce },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data?.accessToken && data?.refreshToken && data?.refreshNonce) {
      await storage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      await storage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      await storage.setItem(REFRESH_NONCE_KEY, data.refreshNonce);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function request<T>(path: string, init: RequestInit = {}) {
  const url = `${BASE_URL}${path}`;
  const doFetch = async () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init.headers as any) };
    const token = await storage.getItem(ACCESS_TOKEN_KEY);
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { ...init, headers });
    let data: any = null;
    try { data = await res.json(); } catch {}
    return { res, data } as { res: Response; data: any };
  };
  let { res, data } = await doFetch();
  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) ({ res, data } = await doFetch());
  }
  return { ok: res.ok, status: res.status, data };
}

export async function getNearbyGames(lat: number, lon: number, radiusKm = 5) {
  // Mock data for web development
  if (Platform.OS === 'web') {
    return {
      ok: true,
      status: 200,
      data: [
        {
          id: 'nearby-1',
          title: 'Evening Futsal League',
          sport: 'FUTSAL',
          dateTime: '2024-01-20T18:00:00Z',
          location: 'Kathmandu Sports Complex',
          currentPlayers: 7,
          maxPlayers: 10,
          cost: 200,
          skillLevel: 'INTERMEDIATE',
          distance: '2.5km'
        },
        {
          id: 'nearby-2',
          title: 'Morning Basketball',
          sport: 'BASKETBALL',
          dateTime: '2024-01-21T08:00:00Z',
          location: 'Basketball Court',
          currentPlayers: 8,
          maxPlayers: 10,
          cost: 0,
          skillLevel: 'ADVANCED',
          distance: '1.2km'
        }
      ]
    };
  }
  
  // Use backend spec query param names
  return request(`/games/nearby?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&radiusKm=${encodeURIComponent(radiusKm)}`);
}

export async function getFeaturedGames() {
  // Mock data for web development
  if (Platform.OS === 'web') {
    return {
      ok: true,
      status: 200,
      data: [
        {
          id: 'featured-1',
          title: 'Weekend Cricket Match',
          sport: 'CRICKET',
          dateTime: '2024-01-22T14:00:00Z',
          location: 'Cricket Ground',
          currentPlayers: 18,
          maxPlayers: 22,
          cost: 500,
          skillLevel: 'INTERMEDIATE',
          featured: true
        },
        {
          id: 'featured-2',
          title: 'Evening Futsal League',
          sport: 'FUTSAL',
          dateTime: '2024-01-20T18:00:00Z',
          location: 'Kathmandu Sports Complex',
          currentPlayers: 7,
          maxPlayers: 10,
          cost: 200,
          skillLevel: 'INTERMEDIATE',
          featured: true
        }
      ]
    };
  }
  
  // Try featured, fallback to explore, then plain games
  let res = await request('/games/featured');
  if (!res.ok) res = await request('/games/explore');
  if (!res.ok) res = await request('/games');
  return res;
}

export async function searchGames(filters: Partial<{ sport: string; skillLevel: string; q: string }>, page = 0) {
  // Mock data for web development
  if (Platform.OS === 'web') {
    return {
      ok: true,
      status: 200,
      data: [
        {
          id: 'search-1',
          title: 'Evening Futsal League',
          sport: 'FUTSAL',
          dateTime: '2024-01-20T18:00:00Z',
          location: 'Kathmandu Sports Complex',
          currentPlayers: 7,
          maxPlayers: 10,
          cost: 200,
          skillLevel: 'INTERMEDIATE'
        },
        {
          id: 'search-2',
          title: 'Morning Basketball',
          sport: 'BASKETBALL',
          dateTime: '2024-01-21T08:00:00Z',
          location: 'Basketball Court',
          currentPlayers: 8,
          maxPlayers: 10,
          cost: 0,
          skillLevel: 'ADVANCED'
        }
      ]
    };
  }
  
  const params = new URLSearchParams();
  if (filters.sport) params.set('sport', filters.sport);
  if (filters.skillLevel) params.set('skillLevel', filters.skillLevel);
  if (filters.q) params.set('q', filters.q);
  params.set('page', String(page));
  // Prefer /games/search/advanced; fallback to /games
  let res = await request(`/games/search/advanced?${params.toString()}`);
  if (!res.ok) res = await request(`/games?${params.toString()}`);
  return res;
}

export async function joinGame(gameId: string) {
  // Mock data for web development
  if (Platform.OS === 'web') {
    return {
      ok: true,
      status: 200,
      data: {
        message: 'Successfully joined the game!',
        gameId: gameId,
        joinedAt: new Date().toISOString()
      }
    };
  }
  
  // Support multiple variants; try /join then /rsvp
  let res = await request(`/games/${gameId}/join`, { method: 'POST' });
  if (!res.ok) res = await request(`/games/${gameId}/rsvp`, { method: 'POST' });
  return res;
}
