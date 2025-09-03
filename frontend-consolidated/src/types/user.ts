export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
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
    gamesWon: number;
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