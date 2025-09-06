import { storage } from '@/utils/storage';
import { 
  User, 
  Game, 
  GameSummary, 
  CreateGameRequest, 
  SearchFilters, 
  PaginatedResponse, 
  ApiResponse, 
  AuthResponse,
  RegisterRequest,
  ChatMessage,
  Conversation,
  Payment,
  Notification,
  GameLocation
} from '@/types';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8080/api' 
  : 'https://api.pickupsports.app/api';

// API Client with interceptors
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await storage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      const url = `${this.baseURL}${endpoint}`;
      
      const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        defaultHeaders.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { 
          success: false, 
          error: data.message || `HTTP ${response.status}`,
          message: data.message
        };
      }
    } catch (error) {
      console.error('API request error:', error);
      return { 
        success: false, 
        error: 'Network error',
        message: 'Unable to connect to server'
      };
    }
  }

  // HTTP Methods
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL);

// Helper function to handle API responses
function handleApiResponse<T>(response: ApiResponse<T>): ApiResponse<T> {
  if (!response.success) {
    console.error('API Error:', response.error);
  }
  return response;
}

// Authentication API
export const authAPI = {
  login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });
    return handleApiResponse(response);
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    return handleApiResponse(response);
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/auth/logout');
    return handleApiResponse(response);
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ token: string; refreshToken: string }>> => {
    const response = await apiClient.post<ApiResponse<{ token: string; refreshToken: string }>>('/auth/refresh', {
      refreshToken,
    });
    return handleApiResponse(response);
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return handleApiResponse(response);
  },

  updateProfile: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>('/auth/profile', userData);
    return handleApiResponse(response);
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.put<ApiResponse<void>>('/auth/password', {
      currentPassword,
      newPassword,
    });
    return handleApiResponse(response);
  },

  forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/auth/forgot-password', { email });
    return handleApiResponse(response);
  },

  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/auth/reset-password', {
      token,
      newPassword,
    });
    return handleApiResponse(response);
  },
};

// Game API
export const gameAPI = {
  getNearbyGames: async (latitude: number, longitude: number, radius = 10): Promise<ApiResponse<GameSummary[]>> => {
    const response = await apiClient.get<ApiResponse<GameSummary[]>>('/games/nearby', {
      latitude,
      longitude,
      radius,
    });
    return handleApiResponse(response);
  },

  getFeaturedGames: async (): Promise<ApiResponse<GameSummary[]>> => {
    const response = await apiClient.get<ApiResponse<GameSummary[]>>('/games/featured');
    return handleApiResponse(response);
  },

  getUserGames: async (userId: string): Promise<ApiResponse<Game[]>> => {
    const response = await apiClient.get<ApiResponse<Game[]>>(`/games/user/${userId}`);
    return handleApiResponse(response);
  },

  searchGames: async (filters: SearchFilters, page = 0): Promise<ApiResponse<PaginatedResponse<GameSummary>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<GameSummary>>>('/games/search', {
      ...filters,
      page,
    });
    return handleApiResponse(response);
  },

  getGameDetails: async (gameId: string): Promise<ApiResponse<Game>> => {
    const response = await apiClient.get<ApiResponse<Game>>(`/games/${gameId}`);
    return handleApiResponse(response);
  },

  createGame: async (gameData: CreateGameRequest): Promise<ApiResponse<Game>> => {
    const response = await apiClient.post<ApiResponse<Game>>('/games', gameData);
    return handleApiResponse(response);
  },

  joinGame: async (gameId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(`/games/${gameId}/join`);
    return handleApiResponse(response);
  },

  leaveGame: async (gameId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(`/games/${gameId}/leave`);
    return handleApiResponse(response);
  },

  updateGame: async (gameId: string, gameData: Partial<CreateGameRequest>): Promise<ApiResponse<Game>> => {
    const response = await apiClient.put<ApiResponse<Game>>(`/games/${gameId}`, gameData);
    return handleApiResponse(response);
  },

  cancelGame: async (gameId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(`/games/${gameId}/cancel`);
    return handleApiResponse(response);
  },
};

// Chat API
export const chatAPI = {
  getConversations: async (): Promise<ApiResponse<Conversation[]>> => {
    const response = await apiClient.get<ApiResponse<Conversation[]>>('/chat/conversations');
    return handleApiResponse(response);
  },

  getMessages: async (conversationId: string, page = 0): Promise<ApiResponse<PaginatedResponse<ChatMessage>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ChatMessage>>>(
      `/chat/conversations/${conversationId}/messages`,
      { page }
    );
    return handleApiResponse(response);
  },

  sendMessage: async (conversationId: string, content: string, type: 'TEXT' | 'IMAGE' = 'TEXT'): Promise<ApiResponse<ChatMessage>> => {
    const response = await apiClient.post<ApiResponse<ChatMessage>>(`/chat/conversations/${conversationId}/messages`, {
      content,
      type,
    });
    return handleApiResponse(response);
  },

  createConversation: async (participantIds: string[], gameId?: string): Promise<ApiResponse<Conversation>> => {
    const response = await apiClient.post<ApiResponse<Conversation>>('/chat/conversations', {
      participantIds,
      gameId,
    });
    return handleApiResponse(response);
  },
};

// Notification API
export const notificationAPI = {
  getNotifications: async (page = 0): Promise<ApiResponse<PaginatedResponse<Notification>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Notification>>>('/notifications', { page });
    return handleApiResponse(response);
  },

  markAsRead: async (notificationId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.put<ApiResponse<void>>(`/notifications/${notificationId}/read`);
    return handleApiResponse(response);
  },

  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.put<ApiResponse<void>>('/notifications/read-all');
    return handleApiResponse(response);
  },
};

// Payment API
export const paymentAPI = {
  createPayment: async (gameId: string, amount: number): Promise<ApiResponse<Payment>> => {
    const response = await apiClient.post<ApiResponse<Payment>>('/payments', {
      gameId,
      amount,
    });
    return handleApiResponse(response);
  },

  getPaymentHistory: async (page = 0): Promise<ApiResponse<PaginatedResponse<Payment>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Payment>>>('/payments', { page });
    return handleApiResponse(response);
  },

  processPayment: async (paymentId: string, paymentMethod: string): Promise<ApiResponse<Payment>> => {
    const response = await apiClient.post<ApiResponse<Payment>>(`/payments/${paymentId}/process`, {
      paymentMethod,
    });
    return handleApiResponse(response);
  },
};

// Settings API
export const settingsAPI = {
  updatePreferences: async (preferences: any): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>('/settings/preferences', preferences);
    return handleApiResponse(response);
  },
};

// Venue API
export const venueAPI = {
  getNearbyVenues: async (latitude: number, longitude: number, radius = 10): Promise<ApiResponse<GameLocation[]>> => {
    const response = await apiClient.get<ApiResponse<GameLocation[]>>('/venues/nearby', {
      latitude,
      longitude,
      radius,
    });
    return handleApiResponse(response);
  },

  getVenueDetails: async (venueId: string): Promise<ApiResponse<GameLocation>> => {
    const response = await apiClient.get<ApiResponse<GameLocation>>(`/venues/${venueId}`);
    return handleApiResponse(response);
  },

  searchVenues: async (query: string, filters?: any): Promise<ApiResponse<GameLocation[]>> => {
    const response = await apiClient.get<ApiResponse<GameLocation[]>>('/venues/search', {
      query,
      ...filters,
    });
    return handleApiResponse(response);
  },
};

// Export the API client for direct use if needed
export { apiClient };
export default apiClient;