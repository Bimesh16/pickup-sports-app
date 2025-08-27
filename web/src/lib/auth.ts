import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { authApi } from './api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, captchaToken?: string) => Promise<void>;
  register: (userData: Partial<User> & { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (username: string, password: string, captchaToken?: string) => {
        set({ isLoading: true });
        try {
          const { token, user } = await authApi.login(username, password, captchaToken);
          localStorage.setItem('auth_token', token);
          set({ user, isAuthenticated: true });
        } catch (error) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      register: async (userData: Partial<User> & { username: string; password: string }) => {
        set({ isLoading: true });
        try {
          const { token, user } = await authApi.register(userData);
          localStorage.setItem('auth_token', token);
          set({ user, isAuthenticated: true });
        } catch (error) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('auth_token');
          set({ user: null, isAuthenticated: false });
        }
      },
      
      loadUser: async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        
        set({ isLoading: true });
        try {
          const user = await authApi.getCurrentUser();
          set({ user, isAuthenticated: true });
        } catch (error) {
          localStorage.removeItem('auth_token');
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },
      
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);