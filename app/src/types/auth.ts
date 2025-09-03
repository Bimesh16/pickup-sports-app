export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  skillLevel: SkillLevel;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  phone?: string;
  age?: number;
  isEmailVerified: boolean;
  rating?: number;
  ratingCount?: number;
  createdAt: string;
  updatedAt: string;
}

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE', 
  ADVANCED = 'ADVANCED',
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  refreshNonce: string;
  expiresIn: number;
  tokenType: string;
  user?: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  skillLevel: SkillLevel;
  bio?: string;
  phone?: string;
  age?: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  username: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeEmailRequest {
  newEmail: string;
  currentPassword: string;
}