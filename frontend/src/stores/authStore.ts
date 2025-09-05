import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  phoneNumber?: string;
  avatar?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  preferences: {
    sports: string[];
    maxDistance: number;
    skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  };
  stats: {
    gamesPlayed: number;
    totalGamesPlayed: number;
    gamesWon: number;
    totalGamesWon: number;
    totalGamesLost: number;
    totalGamesDrawn: number;
    currentStreak: number;
    longestStreak: number;
    winRate: number;
    rating: number;
    reliability: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  biometricEnabled: boolean;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phone: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  socialLogin: (socialData: SocialLoginData) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  verifyPhone: (phone: string, code: string) => Promise<void>;
  resendVerification: (method: 'email' | 'phone', identifier: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export interface RegisterData {
  name: string;
  username: string;
  email?: string;
  phoneNumber?: string;
  age: number;
  password: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface SocialLoginData {
  provider: 'google' | 'facebook' | 'apple';
  accessToken: string;
  idToken?: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

type AuthStore = AuthState & AuthActions;

// Mock API functions - replace with actual API calls
const mockApi = {
  login: async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Accept any email/password for testing purposes
    if (email && password && password.length >= 3) {
      const username = email.split('@')[0];
      return {
        user: {
          id: '1',
          name: username.charAt(0).toUpperCase() + username.slice(1),
          username: username,
          email: email,
          phoneNumber: '+977-1234567890',
          avatar: `https://via.placeholder.com/80x80/4A5568/FFFFFF?text=${username.charAt(0).toUpperCase()}`,
          location: {
            latitude: 27.7172,
            longitude: 85.3240,
            address: 'Kathmandu, Nepal'
          },
          preferences: {
            sports: ['FOOTBALL', 'BASKETBALL'],
            maxDistance: 10,
            skillLevel: 'INTERMEDIATE'
          },
          stats: {
            gamesPlayed: 25,
            totalGamesPlayed: 25,
            gamesWon: 18,
            totalGamesWon: 18,
            totalGamesLost: 5,
            totalGamesDrawn: 2,
            currentStreak: 3,
            longestStreak: 8,
            winRate: 72,
            rating: 4.5,
            reliability: 95
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        token: 'mock_jwt_token_12345'
      };
    }
    
    throw new Error('Invalid credentials');
  },
  
  loginWithPhone: async (phone: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Accept any phone/password for testing purposes
    if (phone && password && password.length >= 3) {
      return {
        user: {
          id: '1',
          name: `User ${phone.slice(-4)}`,
          username: `user_${phone.slice(-4)}`,
          phoneNumber: phone,
          avatar: 'https://via.placeholder.com/80x80/4A5568/FFFFFF?text=DU',
          location: {
            latitude: 27.7172,
            longitude: 85.3240,
            address: 'Kathmandu, Nepal'
          },
          preferences: {
            sports: ['FOOTBALL', 'BASKETBALL'],
            maxDistance: 10,
            skillLevel: 'INTERMEDIATE'
          },
          stats: {
            gamesPlayed: 25,
            totalGamesPlayed: 25,
            gamesWon: 18,
            totalGamesWon: 18,
            totalGamesLost: 5,
            totalGamesDrawn: 2,
            currentStreak: 3,
            longestStreak: 8,
            winRate: 72,
            rating: 4.5,
            reliability: 95
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        token: 'mock_jwt_token_12345'
      };
    }
    
    throw new Error('Invalid credentials');
  },
  
  register: async (userData: RegisterData) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate registration success
    return {
      message: 'Registration successful. Please verify your email/phone.',
      verificationRequired: true
    };
  },
  
  socialLogin: async (socialData: SocialLoginData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      user: {
        id: socialData.user.id,
        name: socialData.user.name,
        username: socialData.user.email.split('@')[0],
        email: socialData.user.email,
        avatar: socialData.user.avatar,
        location: {
          latitude: 27.7172,
          longitude: 85.3240,
          address: 'Kathmandu, Nepal'
        },
        preferences: {
          sports: ['FOOTBALL'],
          maxDistance: 10,
          skillLevel: 'BEGINNER'
        },
        stats: {
          gamesPlayed: 0,
          totalGamesPlayed: 0,
          gamesWon: 0,
          totalGamesWon: 0,
          totalGamesLost: 0,
          totalGamesDrawn: 0,
          currentStreak: 0,
          longestStreak: 0,
          winRate: 0,
          rating: 0,
          reliability: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      token: `mock_${socialData.provider}_token_12345`
    };
  },
  
  verifyEmail: async (email: string, code: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (code === '123456') {
      return { success: true };
    }
    
    throw new Error('Invalid verification code');
  },
  
  verifyPhone: async (phone: string, code: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (code === '123456') {
      return { success: true };
    }
    
    throw new Error('Invalid verification code');
  },
  
  resendVerification: async (method: 'email' | 'phone', identifier: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, message: `Verification code sent to ${identifier}` };
  },
  
  forgotPassword: async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, message: 'Password reset link sent to your email' };
  },
  
  resetPassword: async (token: string, newPassword: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, message: 'Password reset successful' };
  }
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      biometricEnabled: false,

      // Actions
      login: async (email: string, password: string) => {
        console.log('Login attempt:', { email, password: '***' });
        set({ isLoading: true });
        try {
          const response = await mockApi.login(email, password);
          console.log('Login successful:', response.user.name);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          console.log('Login failed:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      loginWithPhone: async (phone: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await mockApi.loginWithPhone(phone, password);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true });
        try {
          await mockApi.register(userData);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      socialLogin: async (socialData: SocialLoginData) => {
        set({ isLoading: true });
        try {
          const response = await mockApi.socialLogin(socialData);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          // Clear biometric data
          await SecureStore.deleteItemAsync('biometric_enabled');
          await SecureStore.deleteItemAsync('biometric_token');
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            biometricEnabled: false,
            isLoading: false
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      verifyEmail: async (email: string, code: string) => {
        set({ isLoading: true });
        try {
          await mockApi.verifyEmail(email, code);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      verifyPhone: async (phone: string, code: string) => {
        set({ isLoading: true });
        try {
          await mockApi.verifyPhone(phone, code);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      resendVerification: async (method: 'email' | 'phone', identifier: string) => {
        set({ isLoading: true });
        try {
          await mockApi.resendVerification(method, identifier);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true });
        try {
          await mockApi.forgotPassword(email);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      resetPassword: async (token: string, newPassword: string) => {
        set({ isLoading: true });
        try {
          await mockApi.resetPassword(token, newPassword);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateProfile: async (userData: Partial<User>) => {
        set({ isLoading: true });
        try {
          const currentUser = get().user;
          if (currentUser) {
            const updatedUser = { ...currentUser, ...userData };
            set({ user: updatedUser, isLoading: false });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      enableBiometric: async () => {
        try {
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const isEnrolled = await LocalAuthentication.isEnrolledAsync();
          
          if (!hasHardware || !isEnrolled) {
            throw new Error('Biometric authentication not available');
          }

          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Enable biometric authentication',
            cancelLabel: 'Cancel',
            disableDeviceFallback: false,
          });

          if (result.success) {
            await SecureStore.setItemAsync('biometric_enabled', 'true');
            if (get().token) {
              await SecureStore.setItemAsync('biometric_token', get().token!);
            }
            set({ biometricEnabled: true });
          } else {
            throw new Error('Biometric authentication failed');
          }
        } catch (error) {
          throw error;
        }
      },

      disableBiometric: async () => {
        try {
          await SecureStore.deleteItemAsync('biometric_enabled');
          await SecureStore.deleteItemAsync('biometric_token');
          set({ biometricEnabled: false });
        } catch (error) {
          throw error;
        }
      },

      authenticateWithBiometric: async () => {
        try {
          const biometricEnabled = await SecureStore.getItemAsync('biometric_enabled');
          if (!biometricEnabled) {
            return false;
          }

          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const isEnrolled = await LocalAuthentication.isEnrolledAsync();
          
          if (!hasHardware || !isEnrolled) {
            return false;
          }

          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Authenticate to continue',
            cancelLabel: 'Cancel',
            disableDeviceFallback: false,
          });

          if (result.success) {
            const storedToken = await SecureStore.getItemAsync('biometric_token');
            if (storedToken) {
              // In a real app, you would validate the token with your backend
              set({ token: storedToken, isAuthenticated: true });
              return true;
            }
          }
          
          return false;
        } catch (error) {
          console.error('Biometric authentication error:', error);
          return false;
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          biometricEnabled: false,
          isLoading: false
        });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        biometricEnabled: state.biometricEnabled
      })
    }
  )
);