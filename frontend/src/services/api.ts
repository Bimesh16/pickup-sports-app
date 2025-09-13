import axios from 'axios';
import { storage } from './storage';

// Get the backend URL based on environment
const getBaseURL = () => {
  // In development, use the Replit domain
  const domain = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080';
  return domain;
};

// Create axios instance
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getItemAsync('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear stored token and redirect to login
      try {
        await storage.deleteItemAsync('authToken');
        // Navigate to auth screen - this would be handled by navigation context
      } catch (e) {
        console.log('Error clearing auth token:', e);
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { username: email, password }),
  
  register: (userData: any) =>
    api.post('/api/v1/users/register', userData),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset', { token, password }),
  
  refreshToken: () =>
    api.post('/auth/refresh'),
};

// Games API
export const gamesAPI = {
  getGames: (params?: any) =>
    api.get('/api/v1/games', { params }),
  
  getGame: (gameId: string) =>
    api.get(`/api/v1/games/${gameId}`),
  
  createGame: (gameData: any) =>
    api.post('/api/v1/games', gameData),
  
  updateGame: (gameId: string, gameData: any) =>
    api.put(`/api/v1/games/${gameId}`, gameData),
  
  joinGame: (gameId: string) =>
    api.post(`/api/v1/games/${gameId}/hold`),
  
  confirmGame: (gameId: string) =>
    api.post(`/api/v1/games/${gameId}/confirm`),
  
  leaveGame: (gameId: string) =>
    api.delete(`/api/v1/games/${gameId}/participants`),
};

// User API
export const userAPI = {
  getProfile: () =>
    api.get('/profiles/me'),
  
  updateProfile: (userData: any) =>
    api.put('/profiles/me', userData),
  
  getStats: () =>
    api.get('/api/v1/stats'),
  
  getUserGames: () =>
    api.get('/api/v1/user/games'),
};

// Venues API
export const venuesAPI = {
  getVenues: (params?: any) =>
    api.get('/api/v1/venues', { params }),
  
  getVenue: (venueId: string) =>
    api.get(`/api/v1/venues/${venueId}`),
  
  createVenue: (venueData: any) =>
    api.post('/api/v1/venues', venueData),
};

// Sports API
export const sportsAPI = {
  getSports: () =>
    api.get('/api/v1/sports'),
  
  getSport: (sportId: string) =>
    api.get(`/api/v1/sports/${sportId}`),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () =>
    api.get('/api/v1/notifications'),
  
  markAsRead: (notificationId: string) =>
    api.put(`/api/v1/notifications/${notificationId}/read`),
  
  markAllAsRead: () =>
    api.put('/api/v1/notifications/read-all'),
};

// Chat API
export const chatAPI = {
  getGameChat: (gameId: string) =>
    api.get(`/api/v1/games/${gameId}/chat`),
  
  sendMessage: (gameId: string, message: string) =>
    api.post(`/api/v1/games/${gameId}/chat`, { message }),
};

export default api;