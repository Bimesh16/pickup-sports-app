import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { User, AuthTokens, LoginRequest, RegisterRequest } from '../types';
import { authAPI } from '../services/api';

interface AuthState {
  // State
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<void>;
}

// Secure storage for sensitive data
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await SecureStore.getItemAsync(name);
      return value;
    } catch (error) {
      console.error('Error getting secure item:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (error) {
      console.error('Error setting secure item:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.error('Error removing secure item:', error);
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Initialize auth state from secure storage
      initialize: async () => {
        set({ isLoading: true });
        
        try {
          const storedTokens = await secureStorage.getItem('auth_tokens');
          
          if (storedTokens) {
            const tokens: AuthTokens = JSON.parse(storedTokens);
            
            // Check if tokens are still valid
            if (tokens.accessToken && new Date().getTime() < tokens.expiresIn) {
              // Verify token with backend
              try {
                const user = await authAPI.getCurrentUser(tokens.accessToken);
                set({
                  user,
                  tokens,
                  isAuthenticated: true,
                  isLoading: false,
                  error: null,
                });
                return;
              } catch (error) {
                // Token invalid, try refresh
                try {
                  await get().refreshToken();
                  return;
                } catch (refreshError) {
                  // Both access and refresh failed, clear auth
                  await get().logout();
                }
              }
            }
          }
          
          set({ isLoading: false });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ isLoading: false, error: 'Failed to initialize authentication' });
        }
      },

      // Login user
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authAPI.login(credentials);
          
          // Store tokens securely
          await secureStorage.setItem('auth_tokens', JSON.stringify(response.tokens));
          
          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Register new user
      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authAPI.register(userData);
          
          // Store tokens securely
          await secureStorage.setItem('auth_tokens', JSON.stringify(response.tokens));
          
          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Registration failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Logout user
      logout: async () => {
        set({ isLoading: true });
        
        try {
          const { tokens } = get();
          
          // Call logout endpoint if tokens exist
          if (tokens?.accessToken) {
            try {
              await authAPI.logout(tokens.accessToken);
            } catch (error) {
              // Ignore logout API errors, still clear local state
              console.warn('Logout API call failed:', error);
            }
          }
          
          // Clear secure storage
          await secureStorage.removeItem('auth_tokens');
          
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Logout error:', error);
          // Force clear state even if there's an error
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Refresh authentication token
      refreshToken: async () => {
        const { tokens } = get();
        
        if (!tokens?.refreshToken) {
          throw new Error('No refresh token available');
        }
        
        try {
          const newTokens = await authAPI.refreshToken(tokens.refreshToken);
          
          // Store new tokens securely
          await secureStorage.setItem('auth_tokens', JSON.stringify(newTokens));
          
          set({
            tokens: newTokens,
            error: null,
          });
        } catch (error) {
          // Refresh failed, logout user
          await get().logout();
          throw error;
        }
      },

      // Update user profile
      updateProfile: async (updates: Partial<User>) => {
        const { user, tokens } = get();
        
        if (!user || !tokens?.accessToken) {
          throw new Error('User not authenticated');
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const updatedUser = await authAPI.updateProfile(updates, tokens.accessToken);
          
          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Profile update failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Clear error state
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          // Only persist non-sensitive data in AsyncStorage
          // Sensitive tokens are stored in SecureStore
          const value = await secureStorage.getItem(name);
          return value;
        },
        setItem: async (name: string, value: string) => {
          await secureStorage.setItem(name, value);
        },
        removeItem: async (name: string) => {
          await secureStorage.removeItem(name);
        },
      })),
      // Only persist user data, not tokens (they're stored securely)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  register: state.register,
  logout: state.logout,
  updateProfile: state.updateProfile,
  clearError: state.clearError,
}));