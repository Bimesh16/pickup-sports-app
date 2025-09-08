import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Get the backend URL based on environment
const getBaseURL = () => {
  // In development, use the Replit domain
  const domain = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://173ee670-ee0c-4f6c-ab16-cfe40372013d-00-303077772r6mw.picard.replit.dev';
  return `${domain}/api`;
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
      const token = await SecureStore.getItemAsync('authToken');
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
        await SecureStore.deleteItemAsync('authToken');
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
    api.post('/auth/login', { email, password }),
  
  register: (userData: any) =>
    api.post('/users/register', userData),
  
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
    api.get('/games', { params }),
  
  getGame: (gameId: string) =>
    api.get(`/games/${gameId}`),
  
  createGame: (gameData: any) =>
    api.post('/games', gameData),
  
  updateGame: (gameId: string, gameData: any) =>
    api.put(`/games/${gameId}`, gameData),
  
  joinGame: (gameId: string) =>
    api.post(`/games/${gameId}/hold`),
  
  confirmGame: (gameId: string) =>
    api.post(`/games/${gameId}/confirm`),
  
  leaveGame: (gameId: string) =>
    api.delete(`/games/${gameId}/participants`),
};

// User API
export const userAPI = {
  getProfile: () =>
    api.get('/user/profile'),
  
  updateProfile: (userData: any) =>
    api.put('/user/profile', userData),
  
  getStats: () =>
    api.get('/stats'),
  
  getUserGames: () =>
    api.get('/user/games'),
};

// Venues API
export const venuesAPI = {
  getVenues: (params?: any) =>
    api.get('/venues', { params }),
  
  getVenue: (venueId: string) =>
    api.get(`/venues/${venueId}`),
  
  createVenue: (venueData: any) =>
    api.post('/venues', venueData),
};

// Sports API
export const sportsAPI = {
  getSports: () =>
    api.get('/sports'),
  
  getSport: (sportId: string) =>
    api.get(`/sports/${sportId}`),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () =>
    api.get('/notifications'),
  
  markAsRead: (notificationId: string) =>
    api.put(`/notifications/${notificationId}/read`),
  
  markAllAsRead: () =>
    api.put('/notifications/read-all'),
};

// Chat API
export const chatAPI = {
  getGameChat: (gameId: string) =>
    api.get(`/games/${gameId}/chat`),
  
  sendMessage: (gameId: string, message: string) =>
    api.post(`/games/${gameId}/chat`, { message }),
};

export default api;