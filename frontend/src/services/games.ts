import { storage } from '@/utils/storage';

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
  // Use backend spec query param names
  return request(`/games/nearby?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&radiusKm=${encodeURIComponent(radiusKm)}`);
}

export async function getFeaturedGames() {
  // Try featured, fallback to explore, then plain games
  let res = await request('/games/featured');
  if (!res.ok) res = await request('/games/explore');
  if (!res.ok) res = await request('/games');
  return res;
}

export async function searchGames(filters: Partial<{ sport: string; skillLevel: string; q: string }>, page = 0) {
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
  // Support multiple variants; try /join then /rsvp
  let res = await request(`/games/${gameId}/join`, { method: 'POST' });
  if (!res.ok) res = await request(`/games/${gameId}/rsvp`, { method: 'POST' });
  return res;
}
