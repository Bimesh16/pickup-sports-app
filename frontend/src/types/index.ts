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

export interface Game {
  id: string;
  title: string;
  sport: string;
  description: string;
  dateTime: string;
  duration: number;
  location: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    facilities: string[];
    rating: number;
    photos: string[];
  };
  maxPlayers: number;
  currentPlayers: number;
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  cost: number;
  currency: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  organizerId: string;
  organizer: {
    id: string;
    name: string;
    rating: number;
  };
  players: string[];
  equipment: string[];
  rules: string[];
  createdAt: string;
  updatedAt: string;
}

// Navigation Types
export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  VerifyEmail: { email: string } | undefined;
  VerifyPhone: { phone: string } | undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string } | undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Settings: undefined;
};

// Language Types
export type LanguageCode = 'en' | 'ne';

// Auth Types
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

// Scouting Report Types
export interface ScoutingReportData {
  sport: string;
  nickname: string;
  positions: string[];
  playStyle: string[];
  superpower: string;
  formats: string[];
  availability: string;
  funFact: string;
  skillLevel: string;
  preferredSide: string;
  kitNumber: string;
  form: string;
  travelRadius: number;
  openToInvites: boolean;
}

