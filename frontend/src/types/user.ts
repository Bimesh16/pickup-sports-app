export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  phoneNumber?: string;
  phone?: string;
  avatar?: string;
  gender?: string;
  nationality?: string;
  birthDate?: string;
  country?: string;
  bio?: string;
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

export interface UserProfile extends User {
  bio?: string;
  achievements: Achievement[];
  friends: string[];
  blockedUsers: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}