import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { authAPI, userAPI } from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  verified: boolean;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check stored auth token on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          setAuthState(prev => ({
            ...prev,
            token,
            isAuthenticated: true,
            isLoading: false,
          }));
          // Fetch user profile
          fetchUserProfile();
        } else {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.log('Error checking auth status:', error);
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    };

    checkAuthStatus();
  }, []);

  // Fetch user profile
  const { data: userProfile, refetch: fetchUserProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => userAPI.getProfile(),
    enabled: authState.isAuthenticated,
  });

  // Handle user profile updates
  useEffect(() => {
    if (userProfile) {
      setAuthState(prev => ({
        ...prev,
        user: userProfile.data,
      }));
    }
  }, [userProfile]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authAPI.login(email, password),
    onSuccess: async (response: any) => {
      const { token, user } = response.data;
      
      // Store token
      await SecureStore.setItemAsync('authToken', token);
      
      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      });
      
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error: any) => {
      console.log('Login error:', error.response?.data?.message || error.message);
      throw error;
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData: any) => authAPI.register(userData),
    onSuccess: async (response: any) => {
      const { token, user } = response.data;
      
      // Store token
      await SecureStore.setItemAsync('authToken', token);
      
      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      });
      
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error: any) => {
      console.log('Register error:', error.response?.data?.message || error.message);
      throw error;
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authAPI.forgotPassword(email),
    onError: (error: any) => {
      console.log('Forgot password error:', error.response?.data?.message || error.message);
      throw error;
    },
  });

  // Logout function
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
      
      // Clear all queries
      queryClient.clear();
    } catch (error) {
      console.log('Error during logout:', error);
    }
  };

  return {
    ...authState,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    logout,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isForgotPasswordLoading: forgotPasswordMutation.isPending,
  };
};