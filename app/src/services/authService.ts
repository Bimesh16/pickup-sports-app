import { apiService } from './api';
import * as SecureStore from 'expo-secure-store';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest, 
  ChangePasswordRequest, 
  ChangeEmailRequest, 
  User 
} from '@/types/auth';
import { APP_CONFIG } from '@/constants/config';

class AuthService {
  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', request);
    
    // Store tokens securely
    await this.storeTokens(response);
    
    return response;
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/users/register', request);
    
    // Store tokens securely
    await this.storeTokens(response);
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User> {
    return await apiService.get<User>('/auth/me');
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    await apiService.post('/auth/forgot', request);
  }

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    await apiService.post('/auth/reset', request);
  }

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await apiService.post('/auth/change-password', request);
  }

  async changeEmail(request: ChangeEmailRequest): Promise<void> {
    await apiService.post('/auth/change-email', request);
  }

  async verifyEmail(token: string): Promise<void> {
    await apiService.get(`/auth/verify?token=${token}`);
  }

  async resendVerification(username: string): Promise<void> {
    await apiService.post('/auth/resend-verification', { username });
  }

  private async storeTokens(authResponse: AuthResponse): Promise<void> {
    try {
      await SecureStore.setItemAsync(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, authResponse.accessToken);
      await SecureStore.setItemAsync(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, authResponse.refreshToken);
      
      if (authResponse.user) {
        await SecureStore.setItemAsync(APP_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(authResponse.user));
      }
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  private async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      await SecureStore.deleteItemAsync(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(APP_CONFIG.STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await SecureStore.getItemAsync(APP_CONFIG.STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  // Demo login methods for testing
  async loginDemo(username: string, password: string): Promise<AuthResponse> {
    return this.login({ username, password });
  }
}

export const authService = new AuthService();