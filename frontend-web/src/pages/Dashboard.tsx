// src/pages/Dashboard.tsx - Comprehensive Dashboard Component

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@hooks/useAuth';
import { Button, Card, Badge, Modal, GoogleMap, CreateGameForm, UserProfile } from '@components/ui';
import { theme } from '@styles/theme';
import { NEPAL_LOCATIONS, POPULAR_SPORTS_NEPAL } from '@constants/nepal';
import type { Game, Venue, Notification, DashboardTab, LocationData } from '@types/api';
import { Profile } from './Profile';
import { Settings } from './Settings';
import { GameDetails } from './GameDetails';

// Mock API functions
const mockApi = {
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

// Game Card Component
function GameCard({ game, onJoin, onClick }: { game: Game; onJoin: (gameId: number) => void; onClick?: () => void }) {
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
      case 'beginner': return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'intermediate': return { backgroundColor: '#fef3c7', color: '#92400e' };
      case 'advanced': return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default: return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  return (
    <Card 
      onClick={onClick}
      style={{ 
        padding: theme.spacing.lg, 
        transition: 'all 0.3s ease',
        borderLeft: `4px solid ${theme.colors.primary}`,
        cursor: 'pointer'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
          <div style={{ fontSize: '24px' }}>
            {POPULAR_SPORTS_NEPAL.find(s => s.name === game.sport)?.icon || '⚽'}
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{game.sport}</h3>
            {game.skillLevel && (
              <span style={{
                display: 'inline-flex',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: '500',
                borderRadius: theme.radius.full,
                ...getSkillLevelColor(game.skillLevel)
              }}>
                {game.skillLevel}
              </span>
            )}
          </div>
        </div>
        <Badge variant={getStatusColor(game.status) as 'success' | 'warning' | 'error' | 'default'}>
          {game.status}
        </Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: theme.colors.muted }}>
          <span style={{ marginRight: theme.spacing.xs }}>📍</span>
          {game.location}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: theme.colors.muted }}>
          <span style={{ marginRight: theme.spacing.xs }}>⏰</span>
          {formatTime(game.gameTime)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: theme.colors.muted }}>
          <span style={{ marginRight: theme.spacing.xs }}>👥</span>
          {game.currentPlayers}/{game.maxPlayers} players
        </div>
        {game.pricePerPlayer && (
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: theme.colors.muted }}>
            <span style={{ marginRight: theme.spacing.xs }}>💰</span>
            NPR {game.pricePerPlayer}
          </div>
        )}
      </div>

      {game.description && (
        <p style={{ fontSize: '14px', color: theme.colors.muted, marginBottom: theme.spacing.md }}>{game.description}</p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
          <img 
            src={game.createdBy.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'} 
            alt={game.createdBy.username}
            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
          />
          <span style={{ fontSize: '14px', color: theme.colors.muted }}>{game.createdBy.username}</span>
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

// Notifications Component
function NotificationsList() {
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: mockApi.getNotifications
  });

  if (isLoading) {
    return (
      <Card padding="lg">
        <div style={{ animation: 'pulse' }}>
          <div style={{ height: '16px', background: '#e5e7eb', borderRadius: theme.radius.md, width: '25%', marginBottom: theme.spacing.md }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
            <div style={{ height: '16px', background: '#e5e7eb', borderRadius: theme.radius.md }}></div>
            <div style={{ height: '16px', background: '#e5e7eb', borderRadius: theme.radius.md, width: '83%' }}></div>
            <div style={{ height: '16px', background: '#e5e7eb', borderRadius: theme.radius.md, width: '67%' }}></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: theme.spacing.lg }}>Notifications</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
        {notifications.length === 0 ? (
          <p style={{ color: theme.colors.muted, textAlign: 'center', padding: theme.spacing.xl }}>No notifications yet</p>
        ) : (
          notifications.map((notification: Notification) => (
            <div
              key={notification.id}
              style={{
                padding: theme.spacing.md,
                borderRadius: theme.radius.lg,
                border: '1px solid #e5e7eb',
                background: notification.isRead ? '#f9fafb' : '#eff6ff',
                borderColor: notification.isRead ? '#e5e7eb' : '#bfdbfe'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    fontSize: '14px', 
                    color: notification.isRead ? theme.colors.muted : '#1f2937',
                    fontWeight: notification.isRead ? '400' : '500',
                    margin: 0
                  }}>
                    {notification.message}
                  </p>
                  <p style={{ fontSize: '12px', color: theme.colors.muted, marginTop: '4px', margin: 0 }}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.isRead && (
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    background: theme.colors.primary, 
                    borderRadius: '50%', 
                    marginLeft: theme.spacing.sm,
                    marginTop: '4px'
                  }}></div>
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
export function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('games');
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [userLocation, setUserLocation] = useState<LocationData>(NEPAL_LOCATIONS.KATHMANDU);
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

  const tabs: DashboardTab[] = [
    { id: 'games', label: 'Games', icon: '⚽' },
    { id: 'venues', label: 'Venues', icon: '🏟️' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: theme.gradients.sunset }}>
      {/* Header */}
      <header style={{
        background: theme.gradients.primary,
        color: 'white',
        boxShadow: theme.shadows.lg
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <div style={{ fontSize: '24px' }}>🏔️⚽</div>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>खेल मिलन</h1>
                <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>Pickup Sports Nepal</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>नमस्ते, {user?.firstName || user?.username}</p>
                <p style={{ fontSize: '12px', opacity: 0.75, margin: 0 }}>{user?.location}</p>
              </div>
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
                alt="Profile"
                style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid white' }}
              />
              <Button variant="outline" onClick={logout} style={{ color: 'white', borderColor: 'white' }}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Navigation Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '4px', 
          background: 'white', 
          padding: '4px', 
          borderRadius: theme.radius.xl, 
          boxShadow: theme.shadows.lg, 
          marginBottom: theme.spacing.xl 
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: theme.spacing.sm,
                padding: `${theme.spacing.md}px ${theme.spacing.md}px`,
                borderRadius: theme.radius.lg,
                fontWeight: '500',
                transition: 'all 0.2s ease',
                background: activeTab === tab.id ? theme.gradients.primary : 'transparent',
                color: activeTab === tab.id ? 'white' : theme.colors.muted,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '18px' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'games' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xl }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: 0 }}>Nearby Games</h2>
                <p style={{ color: theme.colors.muted, margin: 0 }}>Discover and join sports activities in your area</p>
              </div>
              <Button onClick={() => setShowCreateGame(true)}>
                <span style={{ marginRight: theme.spacing.xs }}>➕</span>
                Create Game
              </Button>
            </div>

            {/* Location Selector */}
            <Card padding="md">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                  <span style={{ fontSize: '18px' }}>📍</span>
                  <div>
                    <p style={{ fontWeight: '500', margin: 0 }}>Current Location</p>
                    <p style={{ fontSize: '14px', color: theme.colors.muted, margin: 0 }}>
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
                  style={{
                    padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
                    border: '1px solid #d1d5db',
                    borderRadius: theme.radius.lg,
                    outline: 'none'
                  }}
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: theme.spacing.xl }}>
                {[1, 2, 3].map(i => (
                  <Card key={i} padding="lg" style={{ animation: 'pulse' }}>
                    <div style={{ height: '16px', background: '#e5e7eb', borderRadius: theme.radius.md, width: '75%', marginBottom: theme.spacing.md }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
                      <div style={{ height: '12px', background: '#e5e7eb', borderRadius: theme.radius.md }}></div>
                      <div style={{ height: '12px', background: '#e5e7eb', borderRadius: theme.radius.md, width: '83%' }}></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: theme.spacing.xl }}>
                {games.map((game: Game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onJoin={handleJoinGame}
                    onClick={() => setSelectedGame(game)}
                  />
                ))}
              </div>
            )}

            {!gamesLoading && games.length === 0 && (
              <Card padding="xl" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: theme.spacing.md }}>🏃‍♂️</div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: theme.spacing.sm }}>No Games Found</h3>
                <p style={{ color: theme.colors.muted, marginBottom: theme.spacing.lg }}>Be the first to create a game in this area!</p>
                <Button onClick={() => setShowCreateGame(true)}>
                  Create First Game
                </Button>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'venues' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xl }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: 0 }}>Sports Venues</h2>
              <p style={{ color: theme.colors.muted, margin: 0 }}>Discover sports facilities and venues</p>
            </div>

            {venuesLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: theme.spacing.xl }}>
                {[1, 2].map(i => (
                  <Card key={i} padding="lg" style={{ animation: 'pulse' }}>
                    <div style={{ height: '24px', background: '#e5e7eb', borderRadius: theme.radius.md, width: '75%', marginBottom: theme.spacing.md }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
                      <div style={{ height: '16px', background: '#e5e7eb', borderRadius: theme.radius.md }}></div>
                      <div style={{ height: '16px', background: '#e5e7eb', borderRadius: theme.radius.md, width: '83%' }}></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: theme.spacing.xl }}>
                {venues.map((venue: Venue) => (
                  <Card key={venue.id} padding="lg" style={{ transition: 'all 0.3s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>{venue.name}</h3>
                        <p style={{ fontSize: '14px', color: theme.colors.muted, margin: 0 }}>{venue.address}</p>
                      </div>
                      <div style={{ fontSize: '24px' }}>🏟️</div>
                    </div>

                    {venue.description && (
                      <p style={{ color: '#374151', marginBottom: theme.spacing.md }}>{venue.description}</p>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
                      {venue.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: theme.colors.muted }}>
                          <span style={{ marginRight: theme.spacing.xs }}>📞</span>
                          {venue.phone}
                        </div>
                      )}
                      {venue.capacity && (
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: theme.colors.muted }}>
                          <span style={{ marginRight: theme.spacing.xs }}>👥</span>
                          Capacity: {venue.capacity} people
                        </div>
                      )}
                      {venue.hourlyRate && (
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: theme.colors.muted }}>
                          <span style={{ marginRight: theme.spacing.xs }}>💰</span>
                          NPR {venue.hourlyRate}/hour
                        </div>
                      )}
                    </div>

                    {venue.amenities && venue.amenities.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.xs }}>
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
          <div style={{ maxWidth: '512px' }}>
            <UserProfile
              user={user}
              onUpdateProfile={(data) => updateProfileMutation.mutate(data)}
            />
          </div>
        )}

        {activeTab === 'profile' && (
          <div style={{ maxWidth: '800px' }}>
            <Profile />
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '800px' }}>
            <Settings />
          </div>
        )}
        
        {activeTab === 'notifications' && (
          <div style={{ maxWidth: '512px' }}>
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

      {/* Game Details Modal */}
      {selectedGame && (
        <GameDetails
          game={selectedGame}
          onJoin={handleJoinGame}
          onLeave={(gameId) => {
            // Mock leave game
            console.log('Leave game:', gameId);
            setSelectedGame(null);
          }}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </div>
  );
}
