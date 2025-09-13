import React, { useState, useEffect, useCallback, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface User {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  skillLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  age?: number;
  position?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  preferredSportId?: number;
  ratingAverage?: number;
  ratingCount?: number;
  isVerified?: boolean;
  locale?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Game {
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
  durationMinutes: number;
  status: 'ACTIVE' | 'FULL' | 'CANCELLED' | 'COMPLETED';
  createdBy: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  participants?: Array<{
    user: { id: number; username: string; skillLevel?: string; };
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    joinedAt: string;
  }>;
  venue?: {
    name: string;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Venue {
  id: number;
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  capacity?: number;
  hourlyRate?: number;
  amenities?: string[];
  isActive: boolean;
}

interface Notification {
  id: number;
  userId: number;
  message: string;
  type: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// Nepal Constants
const NEPAL_COLORS = {
  primary: '#DC143C',
  secondary: '#003893',
  accent: '#FFD700',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  muted: '#6b7280',
  background: '#f8fafc',
  surface: '#ffffff',
  mountainGreen: '#2d5016',
  himalayaBlue: '#4a90e2',
  rhododendronPink: '#e91e63',
  prayer: '#ff6b35'
};

const POPULAR_SPORTS_NEPAL = [
  { id: 1, name: 'Futsal', icon: '⚽', popularity: 95, nepaliName: 'फुटसल' },
  { id: 2, name: 'Football', icon: '🏈', popularity: 90, nepaliName: 'फुटबल' },
  { id: 3, name: 'Cricket', icon: '🏏', popularity: 85, nepaliName: 'क्रिकेट' },
  { id: 4, name: 'Basketball', icon: '🏀', popularity: 75, nepaliName: 'बास्केटबल' },
  { id: 5, name: 'Volleyball', icon: '🏐', popularity: 70, nepaliName: 'भलिबल' },
  { id: 6, name: 'Table Tennis', icon: '🏓', popularity: 65, nepaliName: 'टेबल टेनिस' },
  { id: 7, name: 'Badminton', icon: '🏸', popularity: 60, nepaliName: 'ब्याडमिन्टन' },
  { id: 8, name: 'Tennis', icon: '🎾', popularity: 45, nepaliName: 'टेनिस' }
];

const NEPAL_LOCATIONS = {
  KATHMANDU: { lat: 27.7172, lng: 85.3240, name: 'Kathmandu' },
  POKHARA: { lat: 28.2096, lng: 83.9856, name: 'Pokhara' },
  LALITPUR: { lat: 27.6588, lng: 85.3247, name: 'Lalitpur' },
  BHAKTAPUR: { lat: 27.6710, lng: 85.4298, name: 'Bhaktapur' },
};

// Mock API Functions
const mockApi = {
  login: async (credentials: { username: string; password: string }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (credentials.username === 'admin@nepal.com' && credentials.password === 'password') {
      return {
        accessToken: 'mock-token-' + Date.now(),
        user: {
          id: 1,
          username: 'admin@nepal.com',
          firstName: 'Admin',
          lastName: 'User',
          skillLevel: 'INTERMEDIATE',
          location: 'Kathmandu, Nepal',
          latitude: 27.7172,
          longitude: 85.3240,
        }
      };
    }
    throw new Error('Invalid credentials');
  },

  register: async (userData: any) => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return {
      accessToken: 'mock-token-' + Date.now(),
      user: {
        id: Date.now(),
        ...userData,
        skillLevel: 'BEGINNER',
        location: 'Kathmandu, Nepal',
        latitude: 27.7172,
        longitude: 85.3240,
      }
    };
  },

  getGames: async (params: any) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      {
        id: 1,
        sport: 'Futsal',
        location: 'Tundikhel Futsal Court',
        latitude: 27.7172,
        longitude: 85.3240,
        gameTime: new Date(Date.now() + 86400000).toISOString(),
        skillLevel: 'INTERMEDIATE',
        description: 'Evening futsal game. All skill levels welcome!',
        minPlayers: 6,
        maxPlayers: 10,
        currentPlayers: 7,
        pricePerPlayer: 150,
        durationMinutes: 90,
        status: 'ACTIVE',
        createdBy: { id: 1, username: 'john_doe', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face' },
        participants: [
          { user: { id: 1, username: 'john_doe', skillLevel: 'INTERMEDIATE' }, status: 'CONFIRMED', joinedAt: new Date().toISOString() }
        ],
        venue: { name: 'Tundikhel Futsal Court', address: 'Tundikhel, Kathmandu' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        sport: 'Basketball',
        location: 'Kathmandu Sports Complex',
        latitude: 27.7200,
        longitude: 85.3300,
        gameTime: new Date(Date.now() + 2 * 86400000).toISOString(),
        skillLevel: 'ADVANCED',
        description: 'Competitive basketball game for experienced players.',
        minPlayers: 8,
        maxPlayers: 10,
        currentPlayers: 6,
        pricePerPlayer: 200,
        durationMinutes: 120,
        status: 'ACTIVE',
        createdBy: { id: 2, username: 'basketball_pro', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face' },
        participants: [],
        venue: { name: 'Kathmandu Sports Complex', address: 'New Baneshwor, Kathmandu' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        sport: 'Cricket',
        location: 'TU Cricket Ground',
        latitude: 27.6800,
        longitude: 85.3100,
        gameTime: new Date(Date.now() + 3 * 86400000).toISOString(),
        skillLevel: 'BEGINNER',
        description: 'Friendly cricket match perfect for beginners!',
        minPlayers: 14,
        maxPlayers: 22,
        currentPlayers: 18,
        pricePerPlayer: 100,
        durationMinutes: 180,
        status: 'ACTIVE',
        createdBy: { id: 3, username: 'cricket_fan', avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=64&h=64&fit=crop&crop=face' },
        participants: [],
        venue: { name: 'TU Cricket Ground', address: 'Tribhuvan University, Kirtipur' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  },

  getVenues: async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [
      {
        id: 1,
        name: 'Tundikhel Futsal Court',
        description: 'Premier futsal facility in the heart of Kathmandu',
        address: 'Tundikhel, Kathmandu 44600',
        latitude: 27.7172,
        longitude: 85.3240,
        phone: '+977-1-4123456',
        capacity: 20,
        hourlyRate: 1500,
        amenities: ['parking', 'changing_room', 'shower', 'refreshments'],
        isActive: true
      },
      {
        id: 2,
        name: 'Kathmandu Sports Complex',
        description: 'Multi-sport facility with basketball and volleyball courts',
        address: 'New Baneshwor, Kathmandu 44600',
        latitude: 27.7200,
        longitude: 85.3300,
        phone: '+977-1-4567890',
        capacity: 100,
        hourlyRate: 2000,
        amenities: ['parking', 'changing_room', 'shower', 'first_aid', 'seating'],
        isActive: true
      }
    ];
  },

  getNotifications: async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [
      {
        id: 1,
        userId: 1,
        message: 'Your futsal game tomorrow at 6 PM is confirmed!',
        type: 'GAME_REMINDER',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 2,
        userId: 1,
        message: 'New player joined your basketball game',
        type: 'GAME_UPDATE',
        isRead: true,
        readAt: new Date(Date.now() - 1800000).toISOString(),
        createdAt: new Date(Date.now() - 7200000).toISOString()
      }
    ];
  },

  createGame: async (gameData: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      id: Date.now(),
      ...gameData,
      currentPlayers: 1,
      status: 'ACTIVE',
      createdBy: { id: 1, username: 'current_user' },
      participants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  joinGame: async (gameId: number) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, message: 'Successfully joined the game!' };
  }
};

// Auth Context
const AuthContext = React.createContext<{
  user: User | null;
  token: string | null;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
} | null>(null);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const response = await mockApi.login(credentials);
      setToken(response.accessToken);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await mockApi.register(userData);
      setToken(response.accessToken);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

// UI Components
function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false, 
  isLoading = false, 
  className = '',
  ...props 
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  [key: string]: any;
}) {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: `bg-gradient-to-r from-red-600 to-blue-800 text-white hover:from-red-700 hover:to-blue-900 focus:ring-red-500`,
    secondary: `bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500`,
    outline: `border-2 border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500`,
    ghost: `text-gray-600 hover:bg-gray-100 focus:ring-gray-500`
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}

function Input({ 
  label, 
  error, 
  className = '',
  ...props 
}: {
  label?: string;
  error?: string;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

function Card({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) {
  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 ${className}`} {...props}>
      {children}
    </div>
  );
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'error' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${variants[variant]}`}>
      {children}
    </span>
  );
}

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-96 overflow-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// Google Maps Component
function GoogleMap({ 
  center, 
  markers = [], 
  onLocationSelect, 
  className = '' 
}: { 
  center: { lat: number; lng: number }; 
  markers?: Array<{ lat: number; lng: number; title: string; }>; 
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  className?: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  // Mock Google Maps implementation
  useEffect(() => {
    if (mapRef.current) {
      // In a real implementation, you would initialize Google Maps here
      mapRef.current.innerHTML = `
        <div style="
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, #4a90e2 0%, #2d5016 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
          font-weight: 600;
          text-align: center;
          position: relative;
          border-radius: 8px;
        ">
          <div>
            <div style="font-size: 24px; margin-bottom: 8px;">🗺️</div>
            <div>Nepal Interactive Map</div>
            <div style="font-size: 12px; margin-top: 4px; opacity: 0.8;">
              Lat: ${center.lat.toFixed(4)}, Lng: ${center.lng.toFixed(4)}
            </div>
            ${markers.length > 0 ? `<div style="font-size: 12px; margin-top: 8px;">${markers.length} locations found</div>` : ''}
          </div>
        </div>
      `;
    }
  }, [center, markers]);

  const handleMapClick = () => {
    // Mock location selection
    const mockLocation = {
      lat: center.lat + (Math.random() - 0.5) * 0.01,
      lng: center.lng + (Math.random() - 0.5) * 0.01,
      address: 'Selected Location, Kathmandu, Nepal'
    };
    setSelectedLocation(mockLocation);
    onLocationSelect?.(mockLocation);
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapRef} 
        className="w-full h-64 cursor-pointer rounded-lg"
        onClick={handleMapClick}
      />
      {selectedLocation && (
        <div className="absolute bottom-2 left-2 bg-white p-2 rounded-lg shadow-lg text-sm">
          📍 {selectedLocation.address}
        </div>
      )}
    </div>
  );
}

// Game Card Component
function GameCard({ game, onJoin }: { game: Game; onJoin: (gameId: number) => void }) {
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'FULL': return 'warning';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getSkillLevelColor = (skillLevel?: string) => {
    switch (skillLevel?.toLowerCase()) {
      case 'beginner': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-l-red-500">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">
            {POPULAR_SPORTS_NEPAL.find(s => s.name === game.sport)?.icon || '⚽'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{game.sport}</h3>
            {game.skillLevel && (
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSkillLevelColor(game.skillLevel)}`}>
                {game.skillLevel}
              </span>
            )}
          </div>
        </div>
        <Badge variant={getStatusColor(game.status) as any}>
          {game.status}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">📍</span>
          {game.location}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">⏰</span>
          {formatTime(game.gameTime)}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">👥</span>
          {game.currentPlayers}/{game.maxPlayers} players
        </div>
        {game.pricePerPlayer && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">💰</span>
            NPR {game.pricePerPlayer}
          </div>
        )}
      </div>

      {game.description && (
        <p className="text-sm text-gray-600 mb-4">{game.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img 
            src={game.createdBy.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'} 
            alt={game.createdBy.username}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm text-gray-600">{game.createdBy.username}</span>
        </div>
        
        <Button
          onClick={() => onJoin(game.id)}
          disabled={game.status !== 'ACTIVE' || game.currentPlayers >= game.maxPlayers}
          size="sm"
        >
          {game.status === 'FULL' ? 'Full' : 'Join Game'}
        </Button>
      </div>
    </Card>
  );
}

// Create Game Form
function CreateGameForm({ onSubmit, onCancel }: { onSubmit: (gameData: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    sport: '',
    location: '',
    latitude: NEPAL_LOCATIONS.KATHMANDU.lat,
    longitude: NEPAL_LOCATIONS.KATHMANDU.lng,
    gameTime: '',
    skillLevel: '',
    description: '',
    minPlayers: 2,
    maxPlayers: 10,
    pricePerPlayer: 0,
    durationMinutes: 60
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setFormData(prev => ({
      ...prev,
      location: location.address,
      latitude: location.lat,
      longitude: location.lng
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
          <select
            value={formData.sport}
            onChange={(e) => setFormData(prev => ({ ...prev, sport: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          >
            <option value="">Select Sport</option>
            {POPULAR_SPORTS_NEPAL.map(sport => (
              <option key={sport.id} value={sport.name}>
                {sport.icon} {sport.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
          <select
            value={formData.skillLevel}
            onChange={(e) => setFormData(prev => ({ ...prev, skillLevel: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Any Level</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Game Date & Time</label>
        <input
          type="datetime-local"
          value={formData.gameTime}
          onChange={(e) => setFormData(prev => ({ ...prev, gameTime: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <GoogleMap
          center={{ lat: formData.latitude, lng: formData.longitude }}
          onLocationSelect={handleLocationSelect}
          className="mb-2"
        />
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          placeholder="Enter location or click on map"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your game..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Min Players"
          type="number"
          value={formData.minPlayers}
          onChange={(e) => setFormData(prev => ({ ...prev, minPlayers: Number(e.target.value) }))}
          min="2"
          required
        />
        <Input
          label="Max Players"
          type="number"
          value={formData.maxPlayers}
          onChange={(e) => setFormData(prev => ({ ...prev, maxPlayers: Number(e.target.value) }))}
          min="2"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price per Player (NPR)"
          type="number"
          value={formData.pricePerPlayer}
          onChange={(e) => setFormData(prev => ({ ...prev, pricePerPlayer: Number(e.target.value) }))}
          min="0"
        />
        <Input
          label="Duration (minutes)"
          type="number"
          value={formData.durationMinutes}
          onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
          min="30"
          required
        />
      </div>

      <div className="flex space-x-3 pt-4">
        <Button type="submit" className="flex-1">
          Create Game
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Profile Component
function UserProfile({ user, onUpdateProfile }: { user: User; onUpdateProfile: (data: any) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    bio: user.bio || '',
    skillLevel: user.skillLevel || 'BEGINNER',
    age: user.age || '',
    position: user.position || '',
    location: user.location || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            />
          </div>

          <Input
            label="Bio"
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell us about yourself..."
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
              <select
                value={formData.skillLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, skillLevel: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <Input
              label="Age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
              min="13"
              max="100"
            />
          </div>

          <Input
            label="Preferred Position"
            value={formData.position}
            onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
            placeholder="e.g., Midfielder, Point Guard, etc."
          />

          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Your city/area"
          />

          <div className="flex space-x-3">
            <Button type="submit" className="flex-1">Save Changes</Button>
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Profile</h2>
        <Button variant="outline" onClick={() => setIsEditing(true)}>
          Edit Profile
        </Button>
      </div>

      <div className="flex items-start space-x-4">
        <img
          src={user.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face'}
          alt={user.username}
          className="w-24 h-24 rounded-full border-4 border-red-200"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-gray-600">@{user.username}</p>
          {user.skillLevel && (
            <Badge variant="default" className="mt-2">
              {user.skillLevel}
            </Badge>
          )}
          {user.bio && (
            <p className="mt-3 text-gray-700">{user.bio}</p>
          )}
          <div className="mt-3 space-y-1 text-sm text-gray-600">
            {user.location && (
              <div className="flex items-center">
                <span className="mr-2">📍</span>
                {user.location}
              </div>
            )}
            {user.age && (
              <div className="flex items-center">
                <span className="mr-2">🎂</span>
                {user.age} years old
              </div>
            )}
            {user.position && (
              <div className="flex items-center">
                <span className="mr-2">⚽</span>
                {user.position}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Notifications Component
function NotificationsList() {
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: mockApi.getNotifications
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Notifications</h2>
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No notifications yet</p>
        ) : (
          notifications.map((notification: Notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

// Main Dashboard Component
function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('games');
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [userLocation, setUserLocation] = useState(NEPAL_LOCATIONS.KATHMANDU);
  const queryClient = useQueryClient();

  const { data: games = [], isLoading: gamesLoading, refetch: refetchGames } = useQuery({
    queryKey: ['games', userLocation.lat, userLocation.lng],
    queryFn: () => mockApi.getGames({ latitude: userLocation.lat, longitude: userLocation.lng })
  });

  const { data: venues = [], isLoading: venuesLoading } = useQuery({
    queryKey: ['venues'],
    queryFn: mockApi.getVenues
  });

  const createGameMutation = useMutation({
    mutationFn: mockApi.createGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      setShowCreateGame(false);
    }
  });

  const joinGameMutation = useMutation({
    mutationFn: mockApi.joinGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      // Mock profile update
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { ...user, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: 'Your Location'
          });
        },
        () => {
          // Default to Kathmandu if geolocation fails
          setUserLocation(NEPAL_LOCATIONS.KATHMANDU);
        }
      );
    }
  }, []);

  const handleCreateGame = (gameData: any) => {
    createGameMutation.mutate({
      ...gameData,
      gameTime: new Date(gameData.gameTime).toISOString()
    });
  };

  const handleJoinGame = (gameId: number) => {
    joinGameMutation.mutate(gameId);
  };

  const tabs = [
    { id: 'games', label: 'Games', icon: '⚽' },
    { id: 'venues', label: 'Venues', icon: '🏟️' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🏔️⚽</div>
              <div>
                <h1 className="text-xl font-bold">खेल मिलन</h1>
                <p className="text-sm opacity-90">Pickup Sports Nepal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">नमस्ते, {user?.firstName || user?.username}</p>
                <p className="text-xs opacity-75">{user?.location}</p>
              </div>
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <Button variant="outline" onClick={logout} className="text-white border-white hover:bg-white hover:text-red-600">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-lg mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-red-500 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'games' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Nearby Games</h2>
                <p className="text-gray-600">Discover and join sports activities in your area</p>
              </div>
              <Button onClick={() => setShowCreateGame(true)}>
                <span className="mr-2">➕</span>
                Create Game
              </Button>
            </div>

            {/* Location Selector */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">📍</span>
                  <div>
                    <p className="font-medium">Current Location</p>
                    <p className="text-sm text-gray-600">
                      {userLocation.name} ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
                    </p>
                  </div>
                </div>
                <select
                  value={`${userLocation.lat},${userLocation.lng}`}
                  onChange={(e) => {
                    const [lat, lng] = e.target.value.split(',').map(Number);
                    const location = Object.values(NEPAL_LOCATIONS).find(loc => loc.lat === lat && loc.lng === lng);
                    if (location) setUserLocation(location);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {Object.values(NEPAL_LOCATIONS).map(location => (
                    <option key={location.name} value={`${location.lat},${location.lng}`}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            </Card>

            {/* Games Grid */}
            {gamesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game: Game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onJoin={handleJoinGame}
                  />
                ))}
              </div>
            )}

            {!gamesLoading && games.length === 0 && (
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">🏃‍♂️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Games Found</h3>
                <p className="text-gray-600 mb-6">Be the first to create a game in this area!</p>
                <Button onClick={() => setShowCreateGame(true)}>
                  Create First Game
                </Button>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'venues' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Sports Venues</h2>
              <p className="text-gray-600">Discover sports facilities and venues</p>
            </div>

            {venuesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {venues.map((venue: Venue) => (
                  <Card key={venue.id} className="p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{venue.name}</h3>
                        <p className="text-sm text-gray-600">{venue.address}</p>
                      </div>
                      <div className="text-2xl">🏟️</div>
                    </div>

                    {venue.description && (
                      <p className="text-gray-700 mb-4">{venue.description}</p>
                    )}

                    <div className="space-y-2 mb-4">
                      {venue.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="mr-2">📞</span>
                          {venue.phone}
                        </div>
                      )}
                      {venue.capacity && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="mr-2">👥</span>
                          Capacity: {venue.capacity} people
                        </div>
                      )}
                      {venue.hourlyRate && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="mr-2">💰</span>
                          NPR {venue.hourlyRate}/hour
                        </div>
                      )}
                    </div>

                    {venue.amenities && venue.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {venue.amenities.map((amenity) => (
                          <Badge key={amenity} variant="default">
                            {amenity.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <GoogleMap
                      center={{ lat: venue.latitude, lng: venue.longitude }}
                      markers={[{ lat: venue.latitude, lng: venue.longitude, title: venue.name }]}
                      className="mt-4"
                    />
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && user && (
          <div className="max-w-2xl">
            <UserProfile
              user={user}
              onUpdateProfile={(data) => updateProfileMutation.mutate(data)}
            />
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="max-w-2xl">
            <NotificationsList />
          </div>
        )}
      </div>

      {/* Create Game Modal */}
      <Modal
        isOpen={showCreateGame}
        onClose={() => setShowCreateGame(false)}
        title="Create New Game"
      >
        <CreateGameForm
          onSubmit={handleCreateGame}
          onCancel={() => setShowCreateGame(false)}
        />
      </Modal>
    </div>
  );
}

// Login Page
function Login() {
  const { login, register, isLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        await register(formData);
      } else {
        await login({ username: formData.username, password: formData.password });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setError('');
    try {
      // Mock social login
      await register({
        username: `${provider}_user_${Date.now()}@example.com`,
        firstName: provider === 'google' ? 'Google' : 'Facebook',
        lastName: 'User',
        email: `${provider}_user_${Date.now()}@example.com`
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Social login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-red-800 to-yellow-600 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 50px, rgba(255,255,255,0.1) 50px, rgba(255,255,255,0.1) 100px)`
        }} className="w-full h-full" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏔️⚽</div>
          <h1 className="text-4xl font-bold text-white mb-2">खेल मिलन</h1>
          <p className="text-xl text-white opacity-90">Pickup Sports Nepal</p>
          <p className="text-sm text-white opacity-75 mt-2">नमस्ते! Connect, Play, Excel</p>
        </div>

        <Card className="p-8 backdrop-blur-lg bg-white/95">
          <div className="flex mb-6">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 text-center font-medium rounded-l-lg transition-colors ${
                !isSignUp ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 text-center font-medium rounded-r-lg transition-colors ${
                isSignUp ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required={isSignUp}
                />
                <Input
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required={isSignUp}
                />
              </div>
            )}

            <Input
              placeholder={isSignUp ? "Email" : "Username or Email"}
              type={isSignUp ? "email" : "text"}
              value={isSignUp ? formData.email : formData.username}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                [isSignUp ? 'email' : 'username']: e.target.value,
                ...(isSignUp ? { username: e.target.value } : {})
              }))}
              required
            />

            <Input
              placeholder="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          {!isSignUp && (
            <div className="mt-6">
              <p className="text-center text-sm text-gray-600 mb-4">Demo Accounts:</p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, username: 'admin@nepal.com', password: 'password' }))}
                  className="flex-1 text-xs"
                >
                  Demo User
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08