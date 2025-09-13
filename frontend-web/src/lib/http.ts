import { MockApiService } from './mockApi';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const BASE = (import.meta as any).env?.VITE_API_BASE ?? '';
const USE_MOCK = true; // Set to true to use mock data, false for real API

export class ApiError extends Error {
  status: number;
  body?: any;
  constructor(status: number, body?: any) {
    super(body?.message || `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

export async function http<T>(path: string, options: RequestInit = {}, withAuth = true): Promise<T> {
  // Use mock API if enabled
  if (USE_MOCK) {
    return await handleMockRequest<T>(path, options, withAuth);
  }

  // Original real API logic
  const url = `${BASE}${path}`;
  const token = localStorage.getItem('ps_token');
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(withAuth && token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 204) return undefined as unknown as T;
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}

// Mock request handler
async function handleMockRequest<T>(path: string, options: RequestInit = {}, withAuth = true): Promise<T> {
  const method = options.method || 'GET';
  
  // Handle authentication endpoints
  if (path === '/auth/login' && method === 'POST') {
    const body = JSON.parse(options.body as string);
    return MockApiService.login(body) as T;
  }
  
  if (path === '/auth/me' && method === 'GET') {
    return MockApiService.me() as T;
  }
  
  // Handle games endpoints
  if (path.startsWith('/api/v1/games/nearby') && method === 'GET') {
    const url = new URL(path, 'http://localhost');
    const params = {
      latitude: parseFloat(url.searchParams.get('latitude') || '0'),
      longitude: parseFloat(url.searchParams.get('longitude') || '0'),
      radiusKm: parseFloat(url.searchParams.get('radiusKm') || '5'),
      sport: url.searchParams.get('sport') || undefined,
      skillLevel: url.searchParams.get('skillLevel') || undefined
    };
    return MockApiService.nearbyGames(params) as T;
  }
  
  if (path.startsWith('/api/v1/games/trending') && method === 'GET') {
    const url = new URL(path, 'http://localhost');
    const params = {
      latitude: url.searchParams.get('latitude') ? parseFloat(url.searchParams.get('latitude')!) : undefined,
      longitude: url.searchParams.get('longitude') ? parseFloat(url.searchParams.get('longitude')!) : undefined
    };
    return MockApiService.trendingGames(params) as T;
  }
  
  // Handle config endpoints
  if (path === '/config/flags' && method === 'GET') {
    return MockApiService.getEnvironmentFlags() as T;
  }
  
  // Default mock response
  return {} as T;
}

