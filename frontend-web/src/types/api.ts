// src/types/api.ts - Complete API Types

export interface User {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  skillLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  age?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  phoneNumber?: string;
  position?: string;
  contactPreference?: 'EMAIL' | 'PHONE' | 'IN_APP';
  location?: string;
  latitude?: number;
  longitude?: number;
  preferredSportId?: number;
  ratingAverage?: number;
  ratingCount?: number;
  isVerified?: boolean;
  locale?: string;
  socialMedia?: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    twitter?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Game {
  id: number;
  sport: string;
  location: string;
  latitude?: number;
  longitude?: number;
  gameTime: string;
  skillLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  description?: string;
  minPlayers: number;
  maxPlayers: number;
  currentPlayers: number;
  pricePerPlayer?: number;
  totalCost?: number;
  durationMinutes: number;
  capacity: number;
  waitlistEnabled: boolean;
  isPrivate: boolean;
  requiresApproval: boolean;
  weatherDependent: boolean;
  cancellationPolicy?: string;
  rules?: string;
  equipmentProvided?: string;
  equipmentRequired?: string;
  status: 'ACTIVE' | 'FULL' | 'CANCELLED' | 'COMPLETED';
  createdBy: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  venue?: Venue;
  participants?: GameParticipant[];
  createdAt: string;
  updatedAt: string;
}

export interface GameSummaryDTO {
  id: number;
  sport: string;
  location: string;
  time: string;
  skillLevel?: string;
  latitude?: number;
  longitude?: number;
  creatorName?: string;
  currentPlayers?: number;
  maxPlayers?: number;
  status?: string;
  pricePerPlayer?: number;
  durationMinutes?: number;
  description?: string;
  equipmentProvided?: string;
  venueId?: number;
  venue?: {
    name: string;
    address: string;
  };
}

export interface GameParticipant {
  gameId: number;
  user: {
    id: number;
    username: string;
    avatarUrl?: string;
    skillLevel?: string;
  };
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  joinedAt: string;
}

export interface Venue {
  id: number;
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  website?: string;
  capacity?: number;
  hourlyRate?: number;
  amenities?: string[];
  rules?: string;
  operatingHours?: Record<string, any>;
  isActive: boolean;
}

export interface Sport {
  id: number;
  name: string;
  description?: string;
  minPlayers: number;
  maxPlayers: number;
  equipmentRequired?: string[];
  isActive: boolean;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  type: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  phoneNumber?: string;
  preferredSport?: string;
  location?: string;
  socialMedia?: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    twitter?: string;
  };
}

export interface TokenPairResponse {
  accessToken: string;
  refreshToken: string;
  refreshNonce?: string;
  tokenType: string;
  expiresInSeconds: number;
}

export interface CreateGameRequest {
  sport: string;
  location: string;
  latitude?: number;
  longitude?: number;
  gameTime: string;
  skillLevel?: string;
  description?: string;
  minPlayers: number;
  maxPlayers: number;
  pricePerPlayer?: number;
  durationMinutes: number;
  capacity: number;
  isPrivate?: boolean;
  requiresApproval?: boolean;
  weatherDependent?: boolean;
  venueId?: number;
}

export interface UpdateProfileRequest {
  bio?: string;
  skillLevel?: string;
  age?: number;
  position?: string;
  contactPreference?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

export interface ComprehensiveRecommendationsResponse {
  games: Game[];
  venues: Venue[];
  players: User[];
}

export interface NepalFutsalParams {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  timeSlot?: string;
}

export interface PopularFutsalArea {
  name: string;
  latitude: number;
  longitude: number;
  venueCount: number;
  averageRating: number;
}

export interface SystemMetrics {
  activeUsers: number;
  activeGames: number;
  totalUsers: number;
  totalGames: number;
  systemLoad: number;
  memoryUsage: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

// Advanced Game Card Props
export interface GameCardProps {
  game: Game;
  onJoin: (gameId: number) => void;
}

// Create Game Form Props
export interface CreateGameFormProps {
  onSubmit: (gameData: CreateGameRequest) => void;
  onCancel: () => void;
}

// User Profile Props
export interface UserProfileProps {
  user: User;
  onUpdateProfile: (data: UpdateProfileRequest) => void;
}

// Google Map Props
export interface GoogleMapProps {
  center: { lat: number; lng: number };
  markers?: Array<{ lat: number; lng: number; title: string }>;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  className?: string;
}

// Dashboard Tab
export interface DashboardTab {
  id: string;
  label: string;
  icon: string;
}

// Location Data
export interface LocationData {
  lat: number;
  lng: number;
  name: string;
}

// Legacy types for backward compatibility
export type UserDTO = User;
export type RsvpResultResponse = { joined: boolean; waitlisted: boolean; message: string };

// Dashboard Tab
export interface DashboardTab {
  id: string;
  label: string;
  icon: string;
}

// Location Data
export interface LocationData {
  lat: number;
  lng: number;
  name: string;
}

// Legacy types for backward compatibility
export type UserDTO = User;
export type RsvpResultResponse = { joined: boolean; waitlisted: boolean; message: string };