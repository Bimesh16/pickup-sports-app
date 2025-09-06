import * as SecureStore from 'expo-secure-store';
import { AuthResponse, User } from '@/types';

const BASE_URL = __DEV__ ? 'http://localhost:8080' : 'https://api.pickupsports.app';

export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const REFRESH_NONCE_KEY = 'refresh_nonce';

async function request<T>(path: string, init: RequestInit = {}): Promise<{ ok: boolean; status: number; data: T | any }> {
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

  // First attempt
  let { res, data } = await doFetch();
  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      ({ res, data } = await doFetch());
    }
  }
  return { ok: res.ok, status: res.status, data };
}

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
  } catch (e) {
    return false;
  }
}

export type LoginError = { success: false; message: string; fieldErrors?: Record<string, string>; retryAfterSeconds?: number; lockoutUntil?: number };
export type LoginSuccess = { success: true };

async function requestWithHeaders<T>(path: string, init: RequestInit = {}) {
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
  return { ok: res.ok, status: res.status, data, headers: res.headers };
}

export async function login(username: string, password: string): Promise<LoginSuccess | LoginError> {
  const { ok, data, status, headers } = await requestWithHeaders<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  if (!ok) {
    const message = data?.message || `HTTP ${status}`;
    const fieldErrors = data?.fieldErrors || undefined;
    // Parse lockout info either in headers or body
    const retryHeader = headers.get('Retry-After');
    const retryAfterSeconds = retryHeader ? parseInt(retryHeader, 10) : (data?.retryAfterSeconds || undefined);
    const lockoutUntil = data?.lockoutUntil ? Date.parse(data.lockoutUntil) || data.lockoutUntil : undefined;
    return { success: false, message, fieldErrors, retryAfterSeconds, lockoutUntil };
  }

  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
  await SecureStore.setItemAsync(REFRESH_NONCE_KEY, data.refreshNonce);
  return { success: true };
}

export async function logout(): Promise<void> {
  await request<void>('/auth/logout', { method: 'POST' });
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_NONCE_KEY);
}

export async function register(params: { username: string; password: string; preferredSport: string; location: string }) {
  const { ok, data, status } = await request<AuthResponse>('/users/register', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  if (!ok) return { success: false, message: data?.message || `HTTP ${status}` };
  return { success: true, data };
}

export async function getSports(): Promise<{ success: boolean; data: string[]; message?: string }> {
  // Try preferred path first (as requested), then fallback to backend spec
  let res = await request<string[]>('/api/v1/sports', { method: 'GET' });
  if (!res.ok || !Array.isArray(res.data)) {
    res = await request<string[]>('/games/sports', { method: 'GET' });
  }
  if (!res.ok || !Array.isArray(res.data)) {
    return { success: false, data: [], message: res.data?.message || 'Failed to fetch sports' };
  }
  return { success: true, data: res.data as any };
}

export async function resendVerification(username: string): Promise<{ success: boolean; message?: string }> {
  const { ok, data } = await request<void>('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ username })
  });
  return { success: ok, message: data?.message };
}

export async function forgot(username: string): Promise<{ success: boolean; message?: string }> {
  const { ok, data } = await request<void>('/auth/forgot', {
    method: 'POST',
    body: JSON.stringify({ username })
  });
  return { success: ok, message: data?.message };
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
  const { ok, data } = await request<void>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword })
  });
  return { success: ok, message: data?.message };
}

export async function changeEmail(newEmail: string, currentPassword: string): Promise<{ success: boolean; message?: string }> {
  const { ok, data } = await request<void>('/auth/change-email', {
    method: 'POST',
    body: JSON.stringify({ newEmail, currentPassword })
  });
  return { success: ok, message: data?.message };
}

export async function me(): Promise<{ success: boolean; data?: User; message?: string }> {
  const { ok, data, status } = await request<User>('/auth/me', { method: 'GET' });
  if (!ok) return { success: false, message: data?.message || `HTTP ${status}` };
  return { success: true, data };
}

export async function getStoredTokens() {
  const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  const refreshNonce = await SecureStore.getItemAsync(REFRESH_NONCE_KEY);
  return { accessToken, refreshToken, refreshNonce };
}
