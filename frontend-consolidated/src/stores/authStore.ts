import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '@/types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        await SecureStore.setItemAsync('authToken', data.token);
        set({ 
          user: data.user, 
          token: data.token, 
          isAuthenticated: true, 
          isLoading: false 
        });
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (userData: RegisterData) => {
    try {
      set({ isLoading: true });
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (response.ok) {
        await SecureStore.setItemAsync('authToken', data.token);
        set({ 
          user: data.user, 
          token: data.token, 
          isAuthenticated: true, 
          isLoading: false 
        });
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  initializeAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      
      if (token) {
        // Verify token with backend
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          set({ 
            user: data.user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } else {
          await SecureStore.deleteItemAsync('authToken');
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      } else {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    }
  },
}));