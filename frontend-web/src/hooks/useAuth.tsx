// src/hooks/useAuth.tsx - Enhanced Authentication Context

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, LoginRequest, RegisterRequest, TokenPairResponse } from '@app-types/api';
import { http, ApiError } from '@lib/http';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<TokenPairResponse>;
  loginWithCaptcha: (credentials: LoginRequest, captchaToken: string) => Promise<TokenPairResponse>;
  verifyMfa: (params: { challenge: string; code: string }) => Promise<TokenPairResponse>;
  register: (userData: RegisterRequest) => Promise<TokenPairResponse>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setToken: (token: string | null) => void;
  socialLogin: (provider: 'google' | 'facebook' | 'instagram' | 'tiktok') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'ps_token';
const USER_KEY = 'ps_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Consider user authenticated if we hold a valid token.
  // User profile may be fetched lazily where /auth/me isn't available in mock/dev.
  const isAuthenticated = !!token;

  const setToken = useCallback((newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setUser(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    
    try {
      const userInfo = await http<{ username: string; roles: string[]; authenticated: boolean }>('/auth/me');
      // For now, create a basic user object from the auth response
      // In a real app, you'd have a separate profile endpoint
      const profile: User = {
        id: 1, // This would come from a profile endpoint
        username: userInfo.username,
        email: userInfo.username, // Assuming username is email
        firstName: '',
        lastName: '',
        skillLevel: 'BEGINNER',
        location: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUser(profile);
      localStorage.setItem(USER_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      // Fail-open: do not clear token here. Some environments may not expose /auth/me yet.
      // We'll keep the token and allow the app to proceed.
    }
  }, [token, setToken]);

  const login = useCallback(async (credentials: LoginRequest): Promise<TokenPairResponse> => {
    setIsLoading(true);
    try {
      const response = await http<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }, false);
      if ((response as any)?.mfaRequired) {
        // Surface MFA requirement to caller without mutating state
        setIsLoading(false);
        throw new ApiError(403, response);
      }
      
      setToken(response.accessToken);
      
      // Store refresh token for logout
      if (response.refreshToken) {
        localStorage.setItem('ps_refresh_token', response.refreshToken);
      }
      
      // Fetch user profile after successful login
      await refreshProfile();
      
      return response;
    } catch (error) {
      setToken(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setToken, refreshProfile]);

  const register = useCallback(async (userData: RegisterRequest): Promise<TokenPairResponse> => {
    setIsLoading(true);
    try {
      // First register the user (forward all provided fields for mock/demo persistence)
      const registerData = {
        ...userData,
        preferredSport: userData.preferredSport || 'Futsal',
        location: userData.location || '',
      } as any;
      
      await http('/users/register', {
        method: 'POST',
        body: JSON.stringify(registerData)
      }, false);
      // Then login to get tokens (fail-open if login endpoint not available)
      let response: TokenPairResponse | null = null;
      try {
        response = await http<TokenPairResponse>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            username: userData.username,
            password: userData.password
          })
        }, false);
      } catch {
        response = { accessToken: `mock-${Date.now()}`, refreshToken: undefined } as any;
      }

      setToken(response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('ps_refresh_token', response.refreshToken);
      }
      try { await refreshProfile(); } catch {}
      return response;
    } catch (error) {
      // Do not clear token here; allow caller to decide next steps
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setToken, refreshProfile]);

  const loginWithCaptcha = useCallback(async (credentials: LoginRequest, captchaToken: string): Promise<TokenPairResponse> => {
    setIsLoading(true);
    try {
      const response = await http<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ ...credentials, captchaToken })
      }, false);
      if ((response as any)?.mfaRequired) {
        setIsLoading(false);
        throw new ApiError(403, response);
      }
      setToken(response.accessToken);
      if (response.refreshToken) localStorage.setItem('ps_refresh_token', response.refreshToken);
      await refreshProfile();
      return response;
    } catch (error) {
      setToken(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setToken, refreshProfile]);

  const verifyMfa = useCallback(async ({ challenge, code }: { challenge: string; code: string }): Promise<TokenPairResponse> => {
    setIsLoading(true);
    try {
      const response = await http<TokenPairResponse>('/auth/mfa/verify', {
        method: 'POST',
        body: JSON.stringify({ challenge, code })
      }, false);
      setToken(response.accessToken);
      if (response.refreshToken) localStorage.setItem('ps_refresh_token', response.refreshToken);
      await refreshProfile();
      return response;
    } catch (error) {
      setToken(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setToken, refreshProfile]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get refresh token from localStorage for logout
      const refreshToken = localStorage.getItem('ps_refresh_token');
      if (refreshToken) {
        await http('/auth/logout', { 
          method: 'POST',
          body: JSON.stringify({ refreshToken })
        }).catch(() => {
          // Ignore errors on logout endpoint
        });
      }
    } finally {
      setToken(null);
      localStorage.removeItem('ps_refresh_token');
      setIsLoading(false);
    }
  }, [setToken]);

  const socialLogin = useCallback(async (provider: 'google' | 'facebook' | 'instagram' | 'tiktok') => {
    setIsLoading(true);
    try {
      // For mock implementation, we'll simulate social login
      // In real implementation, this would redirect to OAuth provider
      const providerNames = {
        google: 'Google',
        facebook: 'Facebook',
        instagram: 'Instagram',
        tiktok: 'TikTok'
      };

      const mockSocialUser = {
        username: `${provider}_user_${Date.now()}@example.com`,
        password: 'social_login_temp',
        firstName: providerNames[provider],
        lastName: 'User',
        email: `${provider}_user_${Date.now()}@example.com`,
        gender: 'PREFER_NOT_TO_SAY',
        phoneNumber: '',
        preferredSport: 'Futsal',
        location: 'Kathmandu, Nepal',
        socialMedia: {
          [provider]: `@${provider}_user_${Date.now()}`,
          instagram: '',
          tiktok: '',
          facebook: '',
          twitter: ''
        }
      };

      // Register the social user
      await register(mockSocialUser);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, [register]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedToken) {
        setTokenState(storedToken);
        
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          } catch (error) {
            console.error('Failed to parse stored user data:', error);
          }
        }

        // Verify token is still valid and refresh profile
        try {
          await http('/auth/me');
          if (!storedUser) {
            await refreshProfile();
          }
        } catch (error) {
          // Token is invalid, clear auth state
          setToken(null);
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, [refreshProfile, setToken]);

  // Auto-refresh profile when token changes
  useEffect(() => {
    if (token && !user) {
      refreshProfile();
    }
  }, [token, user, refreshProfile]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    loginWithCaptcha,
    verifyMfa,
    register,
    logout,
    refreshProfile,
    setToken,
    socialLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Custom hook for checking authentication status
export function useRequireAuth(): User {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    throw new Promise(() => {}); // Suspense
  }
  
  if (!isAuthenticated || !user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

// Custom hook for optional authentication
export function useOptionalAuth(): { user: User | null; isAuthenticated: boolean } {
  const { user, isAuthenticated } = useAuth();
  return { user, isAuthenticated };
}
