import axios from 'axios';
import { User, Game, ChatMessage, FeatureFlags, ApiResponse, SearchFilters } from '../types';

// Create axios instance with default config
const api = axios.create({
  baseURL: '',
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (username: string, password: string, captchaToken?: string) => {
    const response = await api.post('/auth/login', 
      { username, password },
      { headers: captchaToken ? { 'X-Captcha-Token': captchaToken } : {} }
    );
    return response.data;
  },
  
  register: async (userData: Partial<User> & { username: string; password: string }) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },
  
  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  resetPassword: async (email: string) => {
    await api.post('/auth/reset-password', { email });
  },
};

export const gamesApi = {
  getGames: async (filters?: SearchFilters): Promise<ApiResponse<Game>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`/games?${params}`);
    return response.data;
  },
  
  getGame: async (id: number): Promise<Game> => {
    const response = await api.get(`/games/${id}`);
    return response.data;
  },
  
  createGame: async (gameData: Partial<Game>): Promise<Game> => {
    const response = await api.post('/games', gameData);
    return response.data;
  },
  
  updateGame: async (id: number, gameData: Partial<Game>): Promise<Game> => {
    const response = await api.put(`/games/${id}`, gameData);
    return response.data;
  },
  
  deleteGame: async (id: number): Promise<void> => {
    await api.delete(`/games/${id}`);
  },
  
  joinGame: async (id: number, captchaToken?: string): Promise<any> => {
    const response = await api.post(`/games/${id}/join`, {}, {
      headers: captchaToken ? { 'X-Captcha-Token': captchaToken } : {}
    });
    return response.data;
  },
  
  leaveGame: async (id: number): Promise<any> => {
    const response = await api.post(`/games/${id}/leave`);
    return response.data;
  },
  
  getParticipants: async (id: number): Promise<User[]> => {
    const response = await api.get(`/games/${id}/participants`);
    return response.data;
  },
  
  getWaitlist: async (id: number): Promise<User[]> => {
    const response = await api.get(`/games/${id}/waitlist`);
    return response.data;
  },
};

export const chatApi = {
  getMessages: async (gameId: number): Promise<ChatMessage[]> => {
    const response = await api.get(`/games/${gameId}/chat`);
    return response.data;
  },
  
  sendMessage: async (gameId: number, content: string): Promise<ChatMessage> => {
    const response = await api.post(`/games/${gameId}/chat`, { content });
    return response.data;
  },
};

export const userApi = {
  getProfile: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put('/users/me', userData);
    return response.data;
  },
  
  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
};

export const configApi = {
  getFlags: async (): Promise<FeatureFlags> => {
    const response = await api.get('/config/flags');
    return response.data;
  },
};

export default api;