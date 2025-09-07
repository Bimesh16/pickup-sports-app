// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationality?: string;
  gender?: string;
  location?: Location;
  verified: boolean;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  sportsProfiles: SportProfile[];
  stats: UserStats;
  achievements: Achievement[];
  rating: UserRating;
}

// Location Types
export interface Location {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
}

// Sport Types
export interface Sport {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  minPlayers: number;
  maxPlayers: number;
}

export interface SportProfile {
  id: string;
  userId: string;
  sportId: string;
  sport: Sport;
  skillLevel: SkillLevel;
  positions: string[];
  preferredGameTypes: GameType[];
  experience: string;
  achievements: string[];
  isActive: boolean;
}

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  PROFESSIONAL = 'PROFESSIONAL',
}

// Game Types
export interface Game {
  id: string;
  title: string;
  description: string;
  sportId: string;
  sport: Sport;
  hostId: string;
  host: User;
  venueId: string;
  venue: Venue;
  dateTime: string;
  duration: number;
  minPlayers: number;
  maxPlayers: number;
  currentPlayers: number;
  skillLevel: SkillLevel;
  gameType: GameType;
  pricePerPlayer: number;
  currency: string;
  equipment: Equipment[];
  rules: string[];
  isPrivate: boolean;
  requiresApproval: boolean;
  status: GameStatus;
  participants: GameParticipant[];
  waitlist: GameParticipant[];
  createdAt: string;
  updatedAt: string;
}

export enum GameStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum GameType {
  CASUAL = 'CASUAL',
  COMPETITIVE = 'COMPETITIVE',
  TOURNAMENT = 'TOURNAMENT',
  TRAINING = 'TRAINING',
}

export interface GameParticipant {
  id: string;
  gameId: string;
  userId: string;
  user: User;
  status: ParticipantStatus;
  joinedAt: string;
  position?: string;
  notes?: string;
}

export enum ParticipantStatus {
  CONFIRMED = 'CONFIRMED',
  PENDING = 'PENDING',
  WAITLISTED = 'WAITLISTED',
  DECLINED = 'DECLINED',
}

// Venue Types
export interface Venue {
  id: string;
  name: string;
  description?: string;
  location: Location;
  sports: Sport[];
  amenities: Amenity[];
  images: string[];
  priceRange: PriceRange;
  rating: number;
  reviewCount: number;
  businessHours: BusinessHours[];
  contactInfo: ContactInfo;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  category: string;
}

export interface BusinessHours {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
}

export enum PriceRange {
  FREE = 'FREE',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  PREMIUM = 'PREMIUM',
}

// Equipment Types
export interface Equipment {
  id: string;
  name: string;
  description?: string;
  category: EquipmentCategory;
  isRequired: boolean;
  providedByVenue: boolean;
  rentable: boolean;
  price?: number;
}

export enum EquipmentCategory {
  BALL = 'BALL',
  RACKET = 'RACKET',
  PROTECTIVE = 'PROTECTIVE',
  CLOTHING = 'CLOTHING',
  FOOTWEAR = 'FOOTWEAR',
  ACCESSORY = 'ACCESSORY',
}

// Chat Types
export interface ChatMessage {
  id: string;
  gameId: string;
  userId: string;
  user: User;
  content: string;
  type: MessageType;
  timestamp: string;
  readBy: string[];
  editedAt?: string;
  replyToId?: string;
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  LOCATION = 'LOCATION',
  SYSTEM = 'SYSTEM',
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export enum NotificationType {
  GAME_INVITATION = 'GAME_INVITATION',
  GAME_REMINDER = 'GAME_REMINDER',
  GAME_CANCELLED = 'GAME_CANCELLED',
  GAME_UPDATED = 'GAME_UPDATED',
  NEW_MESSAGE = 'NEW_MESSAGE',
  USER_JOINED = 'USER_JOINED',
  USER_LEFT = 'USER_LEFT',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
  RATING_RECEIVED = 'RATING_RECEIVED',
}

// Stats & Rating Types
export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesDraw: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  totalHours: number;
  favoriteSpots: Venue[];
}

export interface UserRating {
  averageRating: number;
  totalRatings: number;
  skillRating: number;
  sportsmanshipRating: number;
  reliabilityRating: number;
  communicationRating: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

export enum AchievementCategory {
  PARTICIPATION = 'PARTICIPATION',
  SKILL = 'SKILL',
  SOCIAL = 'SOCIAL',
  MILESTONE = 'MILESTONE',
  SPECIAL = 'SPECIAL',
}

export enum AchievementRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

// API Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignupForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  gender: string;
  termsAccepted: boolean;
}

export interface CreateGameForm {
  title: string;
  description: string;
  sportId: string;
  venueId: string;
  dateTime: string;
  duration: number;
  minPlayers: number;
  maxPlayers: number;
  skillLevel: SkillLevel;
  gameType: GameType;
  pricePerPlayer: number;
  equipment: string[];
  rules: string[];
  isPrivate: boolean;
  requiresApproval: boolean;
}

// Filter Types
export interface GameFilters {
  sports: string[];
  skillLevels: SkillLevel[];
  gameTypes: GameType[];
  dateRange: {
    start: string;
    end: string;
  };
  location: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  priceRange: {
    min: number;
    max: number;
  };
  availability: 'all' | 'available' | 'full';
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  GameDetails: { gameId: string };
  CreateGame: undefined;
  Profile: { userId?: string };
  EditProfile: undefined;
  Settings: undefined;
  Notifications: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Create: undefined;
  Chat: undefined;
  Profile: undefined;
};