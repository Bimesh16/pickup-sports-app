// src/pages/Dashboard.tsx - Comprehensive Dashboard Component

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@hooks/useAuth';
import { Button, Card, Badge, Modal, GoogleMap, CreateGameForm, UserProfile } from '@components/ui';
import LocationOnboardingModal from '@components/LocationOnboardingModal';
import { useLocationContext } from '@context/LocationContext';
import { GameCard } from '@components/GameCard';
import SuggestedGames from '@components/SuggestedGames';
import { theme } from '@styles/theme';
import { NEPAL_LOCATIONS, POPULAR_SPORTS_NEPAL } from '@constants/nepal';
import type { Game, Venue, Notification, DashboardTab, LocationData } from '@app-types/api';
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

// (removed local GameCard; using shared component instead)

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
  const location = useLocation();
  const [welcomeToast, setWelcomeToast] = useState(false);
  const [showWelcomeCard, setShowWelcomeCard] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [geoToast, setGeoToast] = useState<string | null>(null);
  const [completedToast, setCompletedToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('games');
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const { location: userLocation, setLocation: setUserLocation } = useLocationContext();
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
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

  // Optionally hydrate from geolocation if none set (kept minimal since context already initializes)
  useEffect(() => {
    const hasLoc = !!localStorage.getItem('ps_user_location');
    if (!hasLoc && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude, name: 'Your Location' } as any);
        },
        () => {
          setUserLocation(NEPAL_LOCATIONS.KATHMANDU as any);
        }
      );
    }
  }, [setUserLocation]);

  const handleCreateGame = (gameData: any) => {
    createGameMutation.mutate({
      ...gameData,
      gameTime: new Date(gameData.gameTime).toISOString()
    });
  };

  const handleJoinGame = async (gameId: number) => {
    const useMock = String((import.meta as any).env?.VITE_USE_MOCK ?? 'true').toLowerCase() !== 'false';
    if (useMock) {
      joinGameMutation.mutate(gameId);
    } else {
      const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';
      const token = localStorage.getItem('ps_token');
      await fetch(`${base}/api/v1/games/${gameId}/join`, {
        method: 'POST',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      queryClient.invalidateQueries({ queryKey: ['games'] });
    }
  };

  function SuggestedGames({ preferred, onJoin }: { preferred?: string; onJoin: (id: number) => void }) {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const useMock = String((import.meta as any).env?.VITE_USE_MOCK ?? 'true').toLowerCase() !== 'false';
    useEffect(() => {
      let mounted = true;
      (async () => {
        setLoading(true);
        try {
          if (useMock) {
            const list = await mockApi.getGames({});
            let recs = list;
            if (preferred) {
              recs = list.filter((g: any) => String(g.sport).toLowerCase() === String(preferred).toLowerCase());
              if (recs.length === 0) recs = list.slice(0, 2);
            } else {
              recs = list.slice(0, 2);
            }
            if (mounted) setItems(recs.slice(0, 3));
          } else {
            const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';
            const token = localStorage.getItem('ps_token');
            const res = await fetch(`${base}/api/v1/ai/recommendations/games?limit=5`, { headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
            if (res.ok) {
              const data = await res.json();
              // Map GameRecommendationDTO to simplified card items if needed
              const mapped = Array.isArray(data) ? data.map((r: any) => ({ id: r.gameId || r.id || Math.random(), sport: r.sport || r.game?.sport || 'Game', location: r.location || r.venueName || 'Nearby', })) : [];
              if (mounted) setItems(mapped.slice(0, 3));
            } else {
              // Fallback to empty
              if (mounted) setItems([]);
            }
          }
        } catch {
          if (mounted) setItems([]);
        }
        setLoading(false);
      })();
      return () => { mounted = false; };
    }, [preferred]);
    if (loading) return <div style={{ color: '#64748b', fontSize: 12 }}>Loading suggestions…</div>;
    return (
      <>
        {items.map((g) => {
          const dto = {
            id: g.id,
            sport: g.sport || g.game?.sport || 'Game',
            time: g.gameTime || g.time || g.game?.time || new Date().toISOString(),
            location: g.location || g.venueName || 'Nearby',
            currentPlayers: g.currentPlayers || g.players?.current || g.game?.currentPlayers || 0,
            maxPlayers: g.maxPlayers || g.players?.max || g.game?.maxPlayers || undefined,
            creatorName: g.createdBy?.username || g.organizer || undefined,
            status: g.status || g.game?.status || 'ACTIVE'
          } as any;
          return (
            <div key={dto.id} style={{ display: 'grid', gap: 8 }}>
              <GameCard g={dto} onClick={() => setActiveTab('games')} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setActiveTab('games')} style={{ padding: '6px 10px', borderRadius: 10, background: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0', fontWeight: 600 }}>View Details</button>
                <button onClick={() => onJoin(g.id)} style={{ padding: '6px 10px', borderRadius: 10, background: '#dc143c', color: 'white', border: 'none', fontWeight: 600 }}>Join</button>
              </div>
            </div>
          );
        })}
      </>
    );
  }

  const tabs: DashboardTab[] = [
    { id: 'games', label: 'Games', icon: '⚽' },
    { id: 'venues', label: 'Venues', icon: '🏟️' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
  ];

  useEffect(() => {
    const dismissed = localStorage.getItem('ps_onboarding_dismissed') === '1';
    const shouldShowChecklist = !dismissed && (!user?.avatarUrl || !user?.preferredSport);
    // Show location onboarding if not set yet
    const hasLoc = !!localStorage.getItem('ps_user_location');
    if (!hasLoc) setShowLocationModal(true);
    if (location.search.includes('welcome=1')) {
      setWelcomeToast(true);
      setShowWelcomeCard(true);
      setShowChecklist(shouldShowChecklist);
      const t = setTimeout(() => setWelcomeToast(false), 4000);
      return () => clearTimeout(t);
    } else {
      setShowChecklist(shouldShowChecklist);
    }
  }, [location.search, user?.avatarUrl, user?.preferredSport]);

  // Show a small completion toast when checklist becomes complete
  useEffect(() => {
    const complete = Boolean(user?.avatarUrl && user?.preferredSport);
    if (complete && !localStorage.getItem('ps_onboarding_completed')) {
      setCompletedToast('Nice! Your player profile looks ready.');
      setTimeout(() => setCompletedToast(null), 3000);
      localStorage.setItem('ps_onboarding_completed', '1');
    }
  }, [user?.avatarUrl, user?.preferredSport]);

  return (
    <div style={{ minHeight: '100vh', background: theme.gradients.sunset }}>
      {showWelcomeCard && (
        <div style={{ position: 'fixed', bottom: 88, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 900 }}>
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0,0,0,0.06)',
            borderRadius: 16,
            padding: '12px 16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            maxWidth: 720,
            width: 'calc(100% - 32px)'
          }}>
            <div style={{ fontSize: 22 }}>🏆</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>Welcome to the League!</div>
              <div style={{ fontSize: 13, color: '#475569' }}>Kick things off: find nearby games or complete your player badge.</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setActiveTab('games'); setShowWelcomeCard(false); }} style={{ padding: '8px 12px', borderRadius: 12, background: '#dc143c', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Find Games</button>
              <button onClick={() => { setActiveTab('profile'); setShowWelcomeCard(false); }} style={{ padding: '8px 12px', borderRadius: 12, background: 'white', color: '#0f172a', border: '1px solid #e2e8f0', fontWeight: 600, cursor: 'pointer' }}>Complete Profile</button>
              <button onClick={() => setShowWelcomeCard(false)} style={{ padding: 8, borderRadius: 12, background: 'transparent', color: '#64748b', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Dismiss</button>
            </div>
          </div>
        </div>
      )}
      {welcomeToast && (
        <div style={{ position: 'fixed', top: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'rgba(16,185,129,0.15)', color: '#A7F3D0', border: '1px solid rgba(16,185,129,0.3)', padding: '8px 14px', borderRadius: 9999 }}>
            Welcome to the league, {user?.username || 'player'}! 🎉
          </div>
        </div>
      )}
      <LocationOnboardingModal
        open={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSave={(loc) => {
          setUserLocation(loc as any);
          setShowLocationModal(false);
          setGeoToast('Location set. Showing games near you.');
          setTimeout(() => setGeoToast(null), 2000);
        }}
      />
      {geoToast && (
        <div style={{ position: 'fixed', top: 60, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'rgba(37,99,235,0.15)', color: '#93C5FD', border: '1px solid rgba(37,99,235,0.3)', padding: '8px 14px', borderRadius: 9999 }}>
            {geoToast}
          </div>
        </div>
      )}
      {completedToast && (
        <div style={{ position: 'fixed', top: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'rgba(16,185,129,0.15)', color: '#A7F3D0', border: '1px solid rgba(16,185,129,0.3)', padding: '8px 14px', borderRadius: 9999 }}>
            {completedToast}
          </div>
        </div>
      )}
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
        {showChecklist && (
          <div style={{
            padding: 16,
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            boxShadow: theme.shadows.lg,
            marginBottom: theme.spacing.xl
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 20 }}>📝</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>Finish setting up your player profile</div>
            </div>
            <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: 0, padding: 0, listStyle: 'none' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#334155' }}>✅ Create your player tag</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#334155' }}>{user?.avatarUrl ? '✅' : '⭕'} Add your photo</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#334155' }}>{user?.preferredSport ? '✅' : '⭕'} Pick your preferred sport</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#334155' }}>✅ Set your contact info</li>
            </ul>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button onClick={() => { setActiveTab('profile'); setShowChecklist(false); }} style={{ padding: '8px 12px', borderRadius: 12, background: '#dc143c', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Go to Profile</button>
              <button onClick={() => { setShowChecklist(false); localStorage.setItem('ps_onboarding_dismissed', '1'); }} style={{ padding: '8px 12px', borderRadius: 12, background: 'white', color: '#0f172a', border: '1px solid #e2e8f0', fontWeight: 600, cursor: 'pointer' }}>Dismiss</button>
              <button onClick={() => {
                setActiveTab('games');
                setShowChecklist(false);
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, name: 'Your Location' });
                      setGeoToast('Centered to your location for nearby games.');
                      setTimeout(() => setGeoToast(null), 2500);
                    },
                    () => {
                      setGeoToast('Enable location to see nearby games faster.');
                      setTimeout(() => setGeoToast(null), 3500);
                    }
                  );
                } else {
                  setGeoToast('Geolocation not supported in this browser.');
                  setTimeout(() => setGeoToast(null), 3500);
                }
              }} style={{ padding: '8px 12px', borderRadius: 12, background: '#0ea5e9', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Find Nearby Games</button>
            </div>
          </div>
        )}

        {activeTab === 'games' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xl }}>
            {/* Suggested for you */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: theme.shadows.md }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>🎯</span>
                  <strong>Suggested for you</strong>
                </div>
                <button onClick={() => setActiveTab('games')} style={{ fontSize: 12, padding: '6px 10px', borderRadius: 9999, background: '#f1f5f9', border: '1px solid #e2e8f0' }}>Refresh</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, padding: 16 }}>
                <SuggestedGames preferred={(user as any)?.preferredSport} onJoin={handleJoinGame} />
              </div>
            </div>
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
                    if (location) setUserLocation(location as any);
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
