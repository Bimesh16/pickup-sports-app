// =============== User Types ===============
export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  country: string;
  city: string;
  latitude?: number;
  longitude?: number;
  bio?: string;
  skillLevel: string;
  preferredSports: string[];
  isVerified: boolean;
  isActive: boolean;
  joinedAt: string;
  lastSeenAt: string;
}

export interface UserProfile extends User {
  stats: UserStats;
  achievements: Achievement[];
  gameHistory: GameSummary[];
}

export interface UserStats {
  gamesPlayed: number;
  gamesCreated: number;
  totalDistance: number;
  averageRating: number;
  favoritesSports: string[];
  winStreak: number;
}

// =============== Game Types ===============
export interface Game {
  id: number;
  sport: string;
  location: string;
  time: string;
  skillLevel: string;
  latitude: number;
  longitude: number;
  gameType: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  pricePerPlayer: number;
  totalCost: number;
  durationMinutes: number;
  rsvpCutoff: string;
  capacity: number;
  waitlistEnabled: boolean;
  isPrivate: boolean;
  requiresApproval: boolean;
  weatherDependent: boolean;
  cancellationPolicy: string;
  rules: string;
  equipmentProvided: string;
  equipmentRequired: string;
  creator: User;
  participants: User[];
  createdAt: string;
  updatedAt: string;
  distance?: number;
  availableSlots?: number;
}

export interface GameSummary {
  id: number;
  sport: string;
  location: string;
  time: string;
  skillLevel: string;
  latitude: number;
  longitude: number;
  currentPlayers: number;
  maxPlayers: number;
  pricePerPlayer: number;
  distance?: number;
  creatorName: string;
}

export interface CreateGameRequest {
  sport: string;
  location: string;
  time: string;
  skillLevel: string;
  latitude: number;
  longitude: number;
  gameType?: string;
  description?: string;
  minPlayers?: number;
  maxPlayers?: number;
  pricePerPlayer?: number;
  totalCost?: number;
  durationMinutes?: number;
  rsvpCutoff?: string;
  capacity?: number;
  waitlistEnabled?: boolean;
  isPrivate?: boolean;
  requiresApproval?: boolean;
  weatherDependent?: boolean;
  cancellationPolicy?: string;
  rules?: string;
  equipmentProvided?: string;
  equipmentRequired?: string;
}

// =============== Venue Types ===============
export interface Venue {
  id: number;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  facilities: string[];
  amenities: string[];
  priceRange: string;
  rating: number;
  reviewCount: number;
  images: string[];
  openingHours: OpeningHours;
  contact: VenueContact;
  supportedSports: string[];
}

export interface OpeningHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface VenueContact {
  phone?: string;
  email?: string;
  website?: string;
}

// =============== Nepal Specific Types ===============
export interface FutsalGame {
  id: number;
  location: string;
  time: string;
  skillLevel: string;
  pricePerPlayer: number;
  currentPlayers: number;
  maxPlayers: number;
  latitude: number;
  longitude: number;
  hostName: string;
  courtType: string;
  hasShoes: boolean;
  hasJersey: boolean;
  timeSlot: string;
}

export interface PopularArea {
  name: string;
  playerDensity: number;
  avgPrice: number;
  activeGames: number;
  latitude: number;
  longitude: number;
  radius: number;
}

export interface CityHost {
  id: number;
  name: string;
  bio: string;
  rating: number;
  reviewCount: number;
  totalGamesHosted: number;
  specialties: string[];
  preferredAreas: string[];
  profilePictureUrl?: string;
  badgeLevel: string;
  isVerified: boolean;
  latitude: number;
  longitude: number;
}

// =============== Payment Types ===============
export interface PaymentMethod {
  id: string;
  type: 'esewa' | 'khalti' | 'stripe' | 'paypal';
  name: string;
  icon: string;
  isAvailable: boolean;
  supportedCountries: string[];
}

export interface PaymentRequest {
  gameId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  returnUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  paymentUrl?: string;
  message: string;
}

// =============== Chat & Notification Types ===============
export interface ChatMessage {
  id: string;
  gameId: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
  messageType: 'text' | 'image' | 'system';
  replyTo?: string;
}

export interface Notification {
  id: string;
  type: 'game_invite' | 'payment_update' | 'game_reminder' | 'chat_message' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: string;
  isRead: boolean;
}

// =============== API Response Types ===============
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// =============== Authentication Types ===============
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
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
  country: string;
  city: string;
  phoneNumber?: string;
}

export interface AuthUser {
  user: User;
  tokens: AuthTokens;
}

// =============== Search & Filter Types ===============
export interface SearchFilters {
  sport?: string;
  location?: string;
  skillLevel?: string;
  fromDate?: string;
  toDate?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  minPrice?: number;
  maxPrice?: number;
  hasAvailableSlots?: boolean;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

// =============== Location Types ===============
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocationData {
  coordinates: LocationCoordinates;
  address: string;
  city: string;
  country: string;
  countryCode: string;
  timestamp: number;
}

// =============== Achievement Types ===============
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

// =============== Form Types ===============
export interface DropdownOption {
  label: string;
  value: string;
  icon?: string;
  disabled?: boolean;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'dropdown' | 'date' | 'location';
  required?: boolean;
  placeholder?: string;
  options?: DropdownOption[];
  validation?: (value: any) => string | null;
}

// =============== Modal Types ===============
export interface ModalOptions {
  title?: string;
  dismissible?: boolean;
  showCloseButton?: boolean;
  animationType?: 'slide' | 'fade' | 'scale';
  position?: 'center' | 'bottom' | 'top';
  backgroundColor?: string;
  onDismiss?: () => void;
}

// =============== Component Props Types ===============
export interface ScrollContainerProps {
  children: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  showsVerticalScrollIndicator?: boolean;
  contentContainerStyle?: any;
  style?: any;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  style?: any;
}

// =============== Navigation Types ===============
export type RootStackParamList = {
  // Auth Stack
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  
  // Main App Stack
  BottomTabs: undefined;
  
  // Game Stack
  GameDetails: { gameId: number };
  CreateGame: undefined;
  EditGame: { gameId: number };
  JoinGame: { gameId: number };
  
  // User Stack
  Profile: { userId?: number };
  EditProfile: undefined;
  Settings: undefined;
  
  // Nepal Specific
  FutsalDiscovery: undefined;
  CityHosts: undefined;
  HostProfile: { hostId: number };
  
  // Payment
  Payment: { gameId: number; amount: number };
  PaymentSuccess: { transactionId: string };
  PaymentFailure: { error: string };
  
  // Chat
  GameChat: { gameId: number };
  
  // Venue
  VenueDetails: { venueId: number };
  VenueBooking: { venueId: number };
};

export type BottomTabParamList = {
  Home: undefined;
  Explore: undefined;
  Create: undefined;
  Messages: undefined;
  Profile: undefined;
};

// =============== Hook Types ===============
export interface UseScrollOptions {
  refreshing?: boolean;
  onRefresh?: () => void;
  onScroll?: (event: any) => void;
  showsVerticalScrollIndicator?: boolean;
}

export interface UseModalReturn {
  isVisible: boolean;
  show: (options?: ModalOptions) => void;
  hide: () => void;
  options: ModalOptions;
}

// =============== Error Types ===============
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}