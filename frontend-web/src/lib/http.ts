// src/lib/http.ts - Enhanced HTTP Service with Mock Support

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const BASE = (import.meta as any).env?.VITE_API_BASE ?? '';

// Set to false when you want to use real backend
const USE_MOCK = true;

export class ApiError extends Error {
  status: number;
  body?: any;
  
  constructor(status: number, body?: any) {
    super(body?.message || `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

export async function http<T>(
  path: string, 
  options: RequestInit = {}, 
  withAuth = true
): Promise<T> {
  // Use mock API if enabled
  if (USE_MOCK) {
    const { MockApiService } = await import('./mockApi');
    return await handleMockRequest<T>(path, options, withAuth);
  }

  // Real API implementation
  const url = `${BASE}${path}`;
  const token = localStorage.getItem('ps_token');
  
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
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
async function handleMockRequest<T>(
  path: string, 
  options: RequestInit = {}, 
  withAuth = true
): Promise<T> {
  const { MockApiService } = await import('./mockApi');
  const method = options.method || 'GET';
  
  // Add artificial delay to simulate network
  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

  try {
    // Authentication endpoints
    if (path === '/auth/login' && method === 'POST') {
      const body = JSON.parse(options.body as string);
      return MockApiService.login(body) as T;
    }
    
    if (path === '/auth/me' && method === 'GET') {
      return MockApiService.me() as T;
    }
    
    if (path === '/users/register' && method === 'POST') {
      const body = JSON.parse(options.body as string);
      return MockApiService.register(body) as T;
    }

    if (path === '/auth/logout' && method === 'POST') {
      return MockApiService.logout() as T;
    }

    // Profile endpoints
    if (path === '/profiles/me' && method === 'GET') {
      return MockApiService.getProfile() as T;
    }

    if (path === '/profiles/me' && method === 'PUT') {
      const body = JSON.parse(options.body as string);
      return MockApiService.updateProfile(body) as T;
    }

    // Games endpoints
    if (path.startsWith('/api/v1/games/nearby') && method === 'GET') {
      const url = new URL(path, 'http://localhost');
      const params = Object.fromEntries(url.searchParams.entries());
      return MockApiService.nearbyGames({
        latitude: parseFloat(params.latitude || '0'),
        longitude: parseFloat(params.longitude || '0'),
        radiusKm: parseFloat(params.radiusKm || '5'),
        sport: params.sport || undefined,
        skillLevel: params.skillLevel || undefined
      }) as T;
    }
    
    if (path.startsWith('/api/v1/games/trending') && method === 'GET') {
      const url = new URL(path, 'http://localhost');
      const params = Object.fromEntries(url.searchParams.entries());
      return MockApiService.trendingGames({
        latitude: params.latitude ? parseFloat(params.latitude) : undefined,
        longitude: params.longitude ? parseFloat(params.longitude) : undefined
      }) as T;
    }

    if (path === '/api/v1/games' && method === 'POST') {
      const body = JSON.parse(options.body as string);
      return MockApiService.createGame(body) as T;
    }

    if (path.match(/^\/api\/v1\/games\/\d+$/) && method === 'GET') {
      const gameId = parseInt(path.split('/').pop()!);
      return MockApiService.getGame(gameId) as T;
    }

    if (path.match(/^\/api\/v1\/games\/\d+\/join$/) && method === 'POST') {
      const gameId = parseInt(path.split('/')[4]);
      return MockApiService.joinGame(gameId) as T;
    }

    if (path.match(/^\/api\/v1\/games\/\d+\/leave$/) && method === 'DELETE') {
      const gameId = parseInt(path.split('/')[4]);
      return MockApiService.leaveGame(gameId) as T;
    }

    // Venues endpoints
    if (path.startsWith('/api/v1/venues') && method === 'GET') {
      const url = new URL(path, 'http://localhost');
      const params = Object.fromEntries(url.searchParams.entries());
      return MockApiService.getVenues({
        latitude: params.latitude ? parseFloat(params.latitude) : undefined,
        longitude: params.longitude ? parseFloat(params.longitude) : undefined,
        radius: params.radius ? parseFloat(params.radius) : undefined
      }) as T;
    }

    // AI Recommendations
    if (path === '/api/v1/ai/recommendations/comprehensive' && method === 'GET') {
      return MockApiService.getComprehensiveRecommendations() as T;
    }

    // Nepal specific endpoints
    if (path.startsWith('/api/v1/nepal/futsal/nearby') && method === 'GET') {
      const url = new URL(path, 'http://localhost');
      const params = Object.fromEntries(url.searchParams.entries());
      return MockApiService.getNepalFutsalNearby({
        latitude: parseFloat(params.latitude),
        longitude: parseFloat(params.longitude),
        radiusKm: params.radiusKm ? parseFloat(params.radiusKm) : undefined,
        timeSlot: params.timeSlot || undefined
      }) as T;
    }

    if (path === '/api/v1/nepal/futsal/popular-areas' && method === 'GET') {
      return MockApiService.getPopularFutsalAreas() as T;
    }

    if (path === '/api/v1/nepal/sports/localized' && method === 'GET') {
      return MockApiService.getLocalizedSports() as T;
    }

    // Notifications
    if (path.startsWith('/api/v1/notifications') && method === 'GET') {
      return MockApiService.getNotifications() as T;
    }

    if (path.match(/^\/api\/v1\/notifications\/\d+\/read$/) && method === 'PUT') {
      const notificationId = parseInt(path.split('/')[4]);
      return MockApiService.markNotificationRead(notificationId) as T;
    }

    // System/Config endpoints
    if (path === '/config/flags' && method === 'GET') {
      return MockApiService.getEnvironmentFlags() as T;
    }

    if (path === '/status' && method === 'GET') {
      return MockApiService.getSystemStatus() as T;
    }

    if (path === '/api/v1/system/performance/metrics' && method === 'GET') {
      return MockApiService.getSystemMetrics() as T;
    }

    // Default response for unmapped endpoints
    console.warn(`Mock endpoint not implemented: ${method} ${path}`);
    return {} as T;

  } catch (error) {
    console.error('Mock API Error:', error);
    throw new ApiError(500, { message: 'Mock API Error: ' + (error as Error).message });
  }
}

// Request interceptor for adding common headers
export function createAuthenticatedHttp() {
  return {
    get: <T>(path: string, options: Omit<RequestInit, 'method'> = {}) =>
      http<T>(path, { ...options, method: 'GET' }),
    
    post: <T>(path: string, body?: any, options: Omit<RequestInit, 'method' | 'body'> = {}) =>
      http<T>(path, { 
        ...options, 
        method: 'POST', 
        body: body ? JSON.stringify(body) : undefined 
      }),
    
    put: <T>(path: string, body?: any, options: Omit<RequestInit, 'method' | 'body'> = {}) =>
      http<T>(path, { 
        ...options, 
        method: 'PUT', 
        body: body ? JSON.stringify(body) : undefined 
      }),
    
    patch: <T>(path: string, body?: any, options: Omit<RequestInit, 'method' | 'body'> = {}) =>
      http<T>(path, { 
        ...options, 
        method: 'PATCH', 
        body: body ? JSON.stringify(body) : undefined 
      }),
    
    delete: <T>(path: string, options: Omit<RequestInit, 'method'> = {}) =>
      http<T>(path, { ...options, method: 'DELETE' })
  };
}