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

export async function getNotifications(page = 0) {
  return request(`/notifications?page=${page}`);
}

export async function markRead(id: string) {
  // Using PUT variant; if backend requires POST path change, this provides basic capability
  return request(`/notifications/${id}/read`, { method: 'PUT' });
}

export async function markAllRead() {
  // Using PUT mark-all-read as per spec
  return request('/notifications/mark-all-read', { method: 'PUT' });
}

// User notification preferences
export async function getMyNotificationPrefs() {
  return request('/users/me/notification-prefs', { method: 'GET' });
}

export async function updateMyNotificationPrefs(prefs: Partial<{
  inAppOnRsvp: boolean;
  inAppOnCreate: boolean;
  inAppOnCancel: boolean;
  emailOnRsvp: boolean;
  emailOnCreate: boolean;
  emailOnCancel: boolean;
  pushOnRsvp: boolean;
  pushOnCreate: boolean;
  pushOnCancel: boolean;
  emailDigestDaily: boolean;
  emailDigestWeekly: boolean;
}>) {
  return request('/users/me/notification-prefs', { method: 'PUT', body: JSON.stringify(prefs) });
}
