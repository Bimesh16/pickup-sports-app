import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('authToken');
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
      const url = `${API_BASE_URL}${endpoint}`;
      
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

  // Authentication APIs
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyToken() {
    return this.request('/auth/verify');
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Game APIs
  async getGames(params?: {
    sport?: string;
    location?: string;
    skillLevel?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    return this.request(`/games${queryString ? `?${queryString}` : ''}`);
  }

  async getGame(gameId: string) {
    return this.request(`/games/${gameId}`);
  }

  async createGame(gameData: any) {
    return this.request('/games', {
      method: 'POST',
      body: JSON.stringify(gameData),
    });
  }

  async joinGame(gameId: string) {
    return this.request(`/games/${gameId}/join`, {
      method: 'POST',
    });
  }

  async leaveGame(gameId: string) {
    return this.request(`/games/${gameId}/leave`, {
      method: 'POST',
    });
  }

  async updateGame(gameId: string, updates: any) {
    return this.request(`/games/${gameId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteGame(gameId: string) {
    return this.request(`/games/${gameId}`, {
      method: 'DELETE',
    });
  }

  // User APIs
  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(profileData: any) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserStats() {
    return this.request('/users/stats');
  }

  // Location APIs
  async getVenues(params?: {
    latitude?: number;
    longitude?: number;
    radius?: number;
    sport?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    return this.request(`/venues${queryString ? `?${queryString}` : ''}`);
  }

  async getVenue(venueId: string) {
    return this.request(`/venues/${venueId}`);
  }

  // Payment APIs
  async createPayment(gameId: string, amount: number) {
    return this.request('/payments/create', {
      method: 'POST',
      body: JSON.stringify({ gameId, amount }),
    });
  }

  async verifyPayment(paymentId: string) {
    return this.request(`/payments/${paymentId}/verify`, {
      method: 'POST',
    });
  }

  // Chat/Messages APIs
  async getConversations() {
    return this.request('/messages/conversations');
  }

  async getMessages(conversationId: string, page = 0, size = 20) {
    return this.request(`/messages/conversations/${conversationId}?page=${page}&size=${size}`);
  }

  async sendMessage(conversationId: string, content: string, type = 'TEXT') {
    return this.request('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ conversationId, content, type }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;