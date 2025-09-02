import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  User,
  AuthUser,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  Game,
  GameSummary,
  CreateGameRequest,
  SearchFilters,
  PaginatedResponse,
  FutsalGame,
  PopularArea,
  CityHost,
  PaymentRequest,
  PaymentResponse,
  Venue,
} from '../types';

// API Configuration
const API_BASE_URL = 'http://localhost:8080/api/v1';
const WS_BASE_URL = 'ws://localhost:8080/ws';

// Create axios instance with interceptors
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Request interceptor to add auth token
  client.interceptors.request.use(
    async (config) => {
      try {
        const tokenData = await SecureStore.getItemAsync('auth_tokens');
        if (tokenData) {
          const tokens: AuthTokens = JSON.parse(tokenData);
          if (tokens.accessToken) {
            config.headers.Authorization = `Bearer ${tokens.accessToken}`;
          }
        }
      } catch (error) {
        console.warn('Failed to get auth token:', error);
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as any;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Try to refresh token
          const tokenData = await SecureStore.getItemAsync('auth_tokens');
          if (tokenData) {
            const tokens: AuthTokens = JSON.parse(tokenData);
            if (tokens.refreshToken) {
              const newTokens = await authAPI.refreshToken(tokens.refreshToken);
              await SecureStore.setItemAsync('auth_tokens', JSON.stringify(newTokens));
              
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              return client(originalRequest);
            }
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          await SecureStore.deleteItemAsync('auth_tokens');
          // You might want to emit an event here to redirect to login
        }
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

const apiClient = createApiClient();

// =============== Authentication API ===============
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthUser> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<AuthUser> => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  logout: async (token: string): Promise<void> => {
    await apiClient.post('/auth/logout', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  getCurrentUser: async (token: string): Promise<User> => {
    const response = await apiClient.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateProfile: async (updates: Partial<User>, token: string): Promise<User> => {
    const response = await apiClient.put('/users/profile', updates, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { token, newPassword });
  },
};

// =============== Game API ===============
export const gameAPI = {
  getNearbyGames: async (
    latitude: number,
    longitude: number,
    radius: number = 10,
    sport?: string
  ): Promise<GameSummary[]> => {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
      radius: radius.toString(),
    });
    
    if (sport) params.append('sport', sport);
    
    const response = await apiClient.get(`/games/nearby?${params}`);
    return response.data;
  },

  getFeaturedGames: async (): Promise<GameSummary[]> => {
    const response = await apiClient.get('/games/featured');
    return response.data;
  },

  getUserGames: async (userId: number): Promise<Game[]> => {
    const response = await apiClient.get(`/users/${userId}/games`);
    return response.data;
  },

  searchGames: async (
    filters: SearchFilters,
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResponse<GameSummary>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    // Add filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get(`/search/games?${params}`);
    return response.data;
  },

  getGameDetails: async (gameId: number): Promise<Game> => {
    const response = await apiClient.get(`/games/${gameId}`);
    return response.data;
  },

  createGame: async (gameData: CreateGameRequest): Promise<Game> => {
    const params = new URLSearchParams({
      lat: gameData.latitude.toString(),
      lon: gameData.longitude.toString(),
    });
    
    const response = await apiClient.post(`/games?${params}`, gameData);
    return response.data;
  },

  joinGame: async (gameId: number): Promise<void> => {
    await apiClient.post(`/games/${gameId}/rsvp`);
  },

  leaveGame: async (gameId: number): Promise<void> => {
    await apiClient.delete(`/games/${gameId}/rsvp`);
  },

  updateGame: async (gameId: number, updates: Partial<CreateGameRequest>): Promise<Game> => {
    const response = await apiClient.put(`/games/${gameId}`, updates);
    return response.data;
  },

  deleteGame: async (gameId: number): Promise<void> => {
    await apiClient.delete(`/games/${gameId}`);
  },
};

// =============== Nepal-Specific API ===============
export const nepalAPI = {
  getFutsalGames: async (
    latitude: number,
    longitude: number,
    radiusKm: number = 5,
    timeSlot?: string
  ): Promise<FutsalGame[]> => {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radiusKm: radiusKm.toString(),
    });
    
    if (timeSlot) params.append('timeSlot', timeSlot);
    
    const response = await apiClient.get(`/nepal/futsal/nearby?${params}`);
    return response.data;
  },

  getPopularAreas: async (): Promise<PopularArea[]> => {
    const response = await apiClient.get('/nepal/futsal/popular-areas');
    return response.data;
  },

  getLocalizedSports: async (): Promise<string[]> => {
    const response = await apiClient.get('/nepal/sports/localized');
    return response.data;
  },

  getPopularTimeSlots: async (): Promise<string[]> => {
    const response = await apiClient.get('/nepal/time-slots/popular');
    return response.data;
  },

  getCityHosts: async (
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<CityHost[]> => {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
      radiusKm: radiusKm.toString(),
    });
    
    const response = await apiClient.get(`/nepal/hosts/nearby?${params}`);
    return response.data;
  },

  getHostProfile: async (hostId: number): Promise<CityHost> => {
    const response = await apiClient.get(`/nepal/hosts/${hostId}/profile`);
    return response.data;
  },

  applyAsHost: async (applicationData: any): Promise<void> => {
    await apiClient.post('/nepal/hosts/apply', applicationData);
  },

  // Payment methods
  initiateEsewaPayment: async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
    const response = await apiClient.post('/nepal/payment/esewa/initiate', paymentData);
    return response.data;
  },

  verifyEsewaPayment: async (transactionId: string): Promise<PaymentResponse> => {
    const response = await apiClient.post('/nepal/payment/esewa/verify', { transactionId });
    return response.data;
  },

  initiateKhaltiPayment: async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
    const response = await apiClient.post('/nepal/payment/khalti/initiate', paymentData);
    return response.data;
  },

  verifyKhaltiPayment: async (transactionId: string): Promise<PaymentResponse> => {
    const response = await apiClient.post('/nepal/payment/khalti/verify', { transactionId });
    return response.data;
  },
};

// =============== Venue API ===============
export const venueAPI = {
  searchVenues: async (
    latitude: number,
    longitude: number,
    filters?: any
  ): Promise<Venue[]> => {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
    });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    
    const response = await apiClient.get(`/venues/search?${params}`);
    return response.data;
  },

  getVenueDetails: async (venueId: number): Promise<Venue> => {
    const response = await apiClient.get(`/venues/${venueId}`);
    return response.data;
  },

  checkAvailability: async (
    venueId: number,
    startTime: string,
    endTime: string
  ): Promise<any> => {
    const params = new URLSearchParams({
      startTime,
      endTime,
    });
    
    const response = await apiClient.get(`/venue-bookings/${venueId}/availability?${params}`);
    return response.data;
  },

  getTimeSlots: async (venueId: number, date: string): Promise<any[]> => {
    const response = await apiClient.get(`/venue-bookings/${venueId}/time-slots?date=${date}`);
    return response.data;
  },
};

// =============== AI Recommendation API ===============
export const aiAPI = {
  getRecommendations: async (limit: number = 10): Promise<any> => {
    const response = await apiClient.get(`/ai/recommendations/comprehensive?limit=${limit}`);
    return response.data;
  },

  getEnhancedRecommendations: async (
    limit: number = 10,
    algorithm: string = 'hybrid'
  ): Promise<any> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      algorithm,
    });
    
    const response = await apiClient.get(`/ai/enhanced/recommendations?${params}`);
    return response.data;
  },
};

// =============== User API ===============
export const userAPI = {
  getUserProfile: async (userId: number): Promise<User> => {
    const response = await apiClient.get(`/users/${userId}/profile`);
    return response.data;
  },

  updateUserProfile: async (userId: number, updates: Partial<User>): Promise<User> => {
    const response = await apiClient.put(`/users/${userId}/profile`, updates);
    return response.data;
  },

  getUserStats: async (userId: number): Promise<any> => {
    const response = await apiClient.get(`/stats/users/${userId}`);
    return response.data;
  },

  getMyStats: async (): Promise<any> => {
    const response = await apiClient.get('/stats/users/me');
    return response.data;
  },
};

// =============== Error Handling ===============
export const handleApiError = (error: AxiosError): string => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return (data as any)?.message || 'Invalid request';
      case 401:
        return 'Authentication required';
      case 403:
        return 'Access denied';
      case 404:
        return 'Resource not found';
      case 409:
        return 'Conflict - resource already exists';
      case 422:
        return 'Validation error';
      case 429:
        return 'Too many requests - please try again later';
      case 500:
        return 'Server error - please try again later';
      default:
        return (data as any)?.message || 'An error occurred';
    }
  } else if (error.request) {
    // Request made but no response received
    return 'Network error - please check your connection';
  } else {
    // Something else happened
    return 'An unexpected error occurred';
  }
};

// =============== WebSocket Configuration ===============
export const createWebSocketConnection = (
  endpoint: string,
  token?: string
): WebSocket => {
  const wsUrl = `${WS_BASE_URL}${endpoint}${token ? `?token=${token}` : ''}`;
  return new WebSocket(wsUrl);
};

// =============== Health Check ===============
export const healthAPI = {
  ping: async (): Promise<boolean> => {
    try {
      const response = await apiClient.get('/system/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },
};

// Export the main client for custom requests
export { apiClient };
export default apiClient;