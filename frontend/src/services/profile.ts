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
      headers: {
        'Content-Type': 'application/json',
        'X-Refresh-Nonce': refreshNonce,
      },
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
    const accessToken = await storage.getItem(ACCESS_TOKEN_KEY);
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    const res = await fetch(url, { ...init, headers });
    let data: any = null;
    try { data = await res.json(); } catch (_) {}
    return { res, data } as { res: Response; data: any };
  };
  let { res, data } = await doFetch();
  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) ({ res, data } = await doFetch());
  }
  return { ok: res.ok, status: res.status, data };
}

export async function getMyProfile() {
  // Mock data for web development
  if (Platform.OS === 'web') {
    return {
      ok: true,
      status: 200,
      data: {
        id: 'mock-user-1',
        username: 'testuser',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        phone: '+977-1234567890',
        dateOfBirth: '1990-01-01',
        gender: 'MALE',
        bio: 'Test user for web development',
        profileImage: null,
        isEmailVerified: true,
        isPhoneVerified: true,
        preferences: {
          language: 'en',
          notifications: true,
          theme: 'light'
        },
        stats: {
          gamesPlayed: 15,
          gamesWon: 8,
          gamesLost: 7,
          winRate: 53.3,
          totalHours: 45.5
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    };
  }
  
  return request('/profiles/me', { method: 'GET' });
}

export async function getDashboardSummary() {
  // Mock data for web development
  if (Platform.OS === 'web') {
    return {
      ok: true,
      status: 200,
      data: {
        userStats: {
          totalGamesPlayed: 15,
          totalGamesWon: 8,
          totalGamesLost: 5,
          totalGamesDrawn: 2,
          currentStreak: 3,
          longestStreak: 7,
          winRate: 53.3,
          averageRating: 4.2,
          totalHours: 45.5,
          favoriteSport: 'FUTSAL'
        },
        upcomingGames: [
          {
            id: 'game-1',
            title: 'Evening Futsal League',
            sport: 'FUTSAL',
            dateTime: '2024-01-20T18:00:00Z',
            location: 'Kathmandu Sports Complex',
            currentPlayers: 7,
            maxPlayers: 10,
            cost: 200,
            skillLevel: 'INTERMEDIATE',
            status: 'UPCOMING'
          },
          {
            id: 'game-2',
            title: 'Morning Basketball',
            sport: 'BASKETBALL',
            dateTime: '2024-01-18T08:00:00Z',
            location: 'Basketball Court',
            currentPlayers: 8,
            maxPlayers: 10,
            cost: 150,
            skillLevel: 'BEGINNER',
            status: 'UPCOMING'
          }
        ],
        recentActivity: [
          { type: 'game_joined', message: 'Joined Evening Futsal League', date: '2024-01-15' },
          { type: 'game_won', message: 'Won Basketball Match', date: '2024-01-14' },
          { type: 'achievement', message: 'Completed 10 games milestone', date: '2024-01-13' }
        ],
        achievements: [
          { id: 'first_game', title: 'First Game', description: 'Played your first game', unlocked: true, date: '2024-01-01' },
          { id: 'win_streak', title: 'Win Streak', description: 'Won 5 games in a row', unlocked: true, date: '2024-01-10' },
          { id: 'social_player', title: 'Social Player', description: 'Played with 20 different players', unlocked: false, progress: 15 }
        ],
        recommendations: [
          { type: 'game', title: 'Recommended: Evening Cricket', reason: 'Based on your location and skill level' },
          { type: 'player', title: 'Connect with John Doe', reason: 'Similar playing style and schedule' },
          { type: 'venue', title: 'Try Pokhara Sports Complex', reason: 'Great facilities for your favorite sports' }
        ]
      }
    };
  }
  
  // This may not exist on all backends; return empty object if not ok
  const res = await request('/api/dashboard/summary', { method: 'GET' });
  if (!res.ok) return { ok: false, status: res.status, data: {} };
  return res;
}

export async function getMyGames() {
  // Mock data for web development
  if (Platform.OS === 'web') {
    return {
      ok: true,
      status: 200,
      data: [
        {
          id: 'game-1',
          title: 'Evening Futsal League',
          sport: 'FUTSAL',
          dateTime: '2024-01-20T18:00:00Z',
          location: 'Kathmandu Sports Complex',
          currentPlayers: 7,
          maxPlayers: 10,
          cost: 200,
          skillLevel: 'INTERMEDIATE',
          status: 'UPCOMING'
        },
        {
          id: 'game-2',
          title: 'Morning Basketball',
          sport: 'BASKETBALL',
          dateTime: '2024-01-18T08:00:00Z',
          location: 'Basketball Court',
          currentPlayers: 8,
          maxPlayers: 10,
          cost: 0,
          skillLevel: 'ADVANCED',
          status: 'COMPLETED'
        }
      ]
    };
  }
  
  return request('/games/me', { method: 'GET' });
}

export async function updateMyProfile(payload: {
  firstName?: string;
  lastName?: string;
  bio?: string;
  skillLevel?: string;
  preferredSport?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  age?: number;
}) {
  return request('/profiles/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function uploadAvatar(uri: string, mime: string = 'image/jpeg') {
  const url = `${BASE_URL}/profiles/me/avatar`;
  const accessToken = await storage.getItem(ACCESS_TOKEN_KEY);
  const form = new FormData();
  form.append('avatar', {
    // @ts-ignore - RN FormData file
    uri,
    name: 'avatar.jpg',
    type: mime,
  });
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: form as any,
  });
  if (!res.ok) {
    let err: any = null;
    try { err = await res.json(); } catch (_) {}
    return { ok: false, status: res.status, data: err };
  }
  // After upload, fetch the latest thumbnail URL
  const thumb = await request<string>('/profiles/me/avatar/thumbnail', { method: 'GET' });
  return thumb;
}
