import { create } from 'zustand';
import { User, LoginRequest, RegisterRequest } from '@/types/auth';
import { authService } from '@/services/authService';
import { handleApiError } from '@/services/api';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: User) => void;
  
  // Demo actions
  loginDemo: (username: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ username, password });
      set({ 
        user: response.user || null, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      set({ 
        error: errorMessage, 
        isLoading: false, 
        isAuthenticated: false 
      });
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(data);
      set({ 
        user: response.user || null, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      set({ 
        error: errorMessage, 
        isLoading: false, 
        isAuthenticated: false 
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false, 
        error: null 
      });
    } catch (error) {
      // Even if logout fails on server, clear local state
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false, 
        error: null 
      });
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        // Try to get current user from server
        try {
          const user = await authService.getCurrentUser();
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          // If server request fails, try stored user
          const storedUser = await authService.getStoredUser();
          if (storedUser) {
            set({ 
              user: storedUser, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else {
            // No valid authentication
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false 
            });
          }
        }
      } else {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false, 
        error: handleApiError(error) 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  updateUser: (user: User) => {
    set({ user });
  },

  loginDemo: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.loginDemo(username, password);
      set({ 
        user: response.user || null, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      set({ 
        error: errorMessage, 
        isLoading: false, 
        isAuthenticated: false 
      });
      throw error;
    }
  },
}));