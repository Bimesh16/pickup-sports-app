import * as SecureStore from 'expo-secure-store';

const BASE_URL = __DEV__ ? 'http://localhost:8080' : 'https://api.pickupsports.app';
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const REFRESH_NONCE_KEY = 'refresh_nonce';

async function tryRefresh(): Promise<boolean> {
  try {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    const refreshNonce = await SecureStore.getItemAsync(REFRESH_NONCE_KEY);
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
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
      await SecureStore.setItemAsync(REFRESH_NONCE_KEY, data.refreshNonce);
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
    const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
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
  return request('/profiles/me', { method: 'GET' });
}

export async function getDashboardSummary() {
  // This may not exist on all backends; return empty object if not ok
  const res = await request('/api/dashboard/summary', { method: 'GET' });
  if (!res.ok) return { ok: false, status: res.status, data: {} };
  return res;
}

export async function getMyGames() {
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
  const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
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
