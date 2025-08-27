export interface User {
  id: number;
  username: string;
  preferredSport?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro';
  ratingAverage?: number;
  ratingCount?: number;
  age?: number;
  position?: string;
}

export interface Game {
  id: number;
  sport: string;
  location: string;
  time: string;
  skillLevel?: string;
  latitude?: number;
  longitude?: number;
  user: User;
  participants: User[];
  maxParticipants?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: number;
  gameId: number;
  user: User;
  content: string;
  timestamp: string;
}

export interface FeatureFlags {
  env: string;
  recommend: boolean;
  chatEnabled: boolean;
}

export interface ApiResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface SearchFilters {
  sport?: string;
  location?: string;
  skillLevel?: string;
  dateFrom?: string;
  dateTo?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}