import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Badge } from '@components/ui';
import { 
  Plus, 
  Search, 
  Gamepad2, 
  MapPin, 
  Clock, 
  Users, 
  Trophy, 
  Bell,
  TrendingUp,
  Activity,
  Star,
  ChevronRight,
  Thermometer,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAppState } from '@context/AppStateContext';
import { useLocationContext } from '@context/LocationContext';
import { useWebSocket } from '@context/WebSocketContext';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import { apiClient } from '@lib/apiClient';
import { mockDashboardApi } from './mockData';
import { WeatherService } from '@lib/weatherService';
import { offlineCache } from '@lib/offlineCache';

// Types
interface Game {
  id: string;
  sport: string;
  venue: string;
  time: string;
  price: number;
  playersCount: number;
  maxPlayers: number;
  skillLevel: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

interface TrendingSport {
  sport: string;
  playerCount: number;
  gameCount: number;
  icon: string;
}

interface RecentActivity {
  id: string;
  sport: string;
  venue: string;
  date: string;
  status: 'won' | 'lost' | 'tied' | 'cancelled';
  outcome: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'game' | 'venue' | 'system';
  isRead: boolean;
  createdAt: string;
}

interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  icon: string;
}

// Skeleton Components
const GameCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-[var(--bg-surface)] rounded-xl p-4 min-w-[280px]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-[var(--bg-muted)] rounded-lg"></div>
        <div className="flex-1">
          <div className="h-4 bg-[var(--bg-muted)] rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-[var(--bg-muted)] rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-[var(--bg-muted)] rounded w-full"></div>
        <div className="h-3 bg-[var(--bg-muted)] rounded w-2/3"></div>
      </div>
      <div className="mt-3 h-8 bg-[var(--bg-muted)] rounded"></div>
    </div>
  </div>
);

const TrendingChipSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-[var(--bg-surface)] rounded-full px-4 py-2 h-8 w-20"></div>
  </div>
);

const ActivityItemSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-[var(--bg-surface)] rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[var(--bg-muted)] rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-[var(--bg-muted)] rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-[var(--bg-muted)] rounded w-1/2"></div>
        </div>
      </div>
    </div>
  </div>
);

// Main Component
export default function HomePage() {
  const navigate = useNavigate();
  const { profile } = useAppState();
  const { location } = useLocationContext();
  const { isConnected: wsConnected, gameUpdates } = useWebSocket();
  const { isOnline } = useNetworkStatus();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [nearbyGames, setNearbyGames] = useState<Game[]>([]);
  const [trendingSports, setTrendingSports] = useState<TrendingSport[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      if (location?.lat && location?.lng) {
        try {
          const weatherData = await WeatherService.getWeather(location.lat, location.lng);
          setWeather(weatherData);
        } catch (error) {
          console.error('Weather fetch error:', error);
          // Fallback data
          setWeather({
            city: 'Kathmandu',
            temperature: 22,
            condition: 'Clear',
            icon: '01d'
          });
        }
      }
    };

    fetchWeather();
  }, [location]);

  // Fetch dashboard data with offline support
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setIsOfflineMode(!isOnline);
        
        const lat = location?.lat || 27.7172;
        const lng = location?.lng || 85.324;
        
        if (isOnline) {
          // Online: Fetch fresh data and cache it
          const [nearbyGamesData, trendingSportsData, notificationsData] = await Promise.all([
            mockDashboardApi.getNearbyGames(lat, lng, 5),
            mockDashboardApi.getTrendingSports(lat, lng),
            mockDashboardApi.getUnreadNotifications()
          ]);

          let activityData: RecentActivity[] = [];
          if (profile?.id) {
            activityData = await mockDashboardApi.getRecentActivity(profile.id);
          }

          setNearbyGames(nearbyGamesData);
          setTrendingSports(trendingSportsData);
          setRecentActivity(activityData);
          setNotifications(notificationsData);

          // Cache data for offline use
          await Promise.all([
            offlineCache.cacheGames(nearbyGamesData),
            offlineCache.cacheTrending(trendingSportsData),
            offlineCache.cacheNotifications(notificationsData)
          ]);
        } else {
          // Offline: Use cached data
          const [cachedGames, cachedTrending, cachedNotifications] = await Promise.all([
            offlineCache.getCachedGames(),
            offlineCache.getCachedTrending(),
            offlineCache.getCachedNotifications()
          ]);

          setNearbyGames(cachedGames || []);
          setTrendingSports(cachedTrending || []);
          setNotifications(cachedNotifications || []);
        }

      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        
        // Fallback to cached data on error
        try {
          const [cachedGames, cachedTrending, cachedNotifications] = await Promise.all([
            offlineCache.getCachedGames(),
            offlineCache.getCachedTrending(),
            offlineCache.getCachedNotifications()
          ]);

          setNearbyGames(cachedGames || []);
          setTrendingSports(cachedTrending || []);
          setNotifications(cachedNotifications || []);
        } catch (cacheError) {
          console.error('Failed to load cached data:', cacheError);
          // Set empty fallback data
          setNearbyGames([]);
          setTrendingSports([]);
          setRecentActivity([]);
          setNotifications([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [location, profile, isOnline]);

  // Handle real-time game updates
  useEffect(() => {
    if (gameUpdates.length > 0) {
      const latestUpdate = gameUpdates[0];
      setNearbyGames(prev => 
        prev.map(game => 
          game.id === latestUpdate.gameId 
            ? { ...game, currentPlayers: latestUpdate.playerCount, maxPlayers: latestUpdate.maxPlayers }
            : game
        )
      );
    }
  }, [gameUpdates]);

  // Calculate user rank based on XP
  const getUserRank = (xp: number) => {
    if (xp < 100) return { rank: 'Learner', color: 'text-[var(--info)]', bg: 'bg-[var(--info)]/10' };
    if (xp < 500) return { rank: 'Competent', color: 'text-[var(--warning)]', bg: 'bg-[var(--warning)]/10' };
    if (xp < 1000) return { rank: 'Advanced', color: 'text-[var(--success)]', bg: 'bg-[var(--success)]/10' };
    return { rank: 'Pro', color: 'text-[var(--brand-primary)]', bg: 'bg-[var(--brand-primary)]/10' };
  };

  const userRank = getUserRank(profile?.xp || 0);
  const xpProgress = ((profile?.xp || 0) % 100) / 100;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--nepal-navy)] via-[var(--nepal-blue)] to-[var(--nepal-crimson)] text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome back, {profile?.firstName || 'Player'}! 👋
              </h1>
              <div className="flex items-center gap-4 text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{weather?.city || 'Kathmandu'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{weather?.icon ? WeatherService.getWeatherIcon(weather.icon) : '☀️'}</span>
                  <Thermometer className="w-4 h-4" />
                  <span>{weather?.temperature || 22}°C</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:items-end gap-4">
              <div className="text-right">
                <div className="text-sm opacity-90 mb-1">Your Rank</div>
                <Badge variant="default" className={`${userRank.bg} ${userRank.color} border-0`}>
                  {userRank.rank}
                </Badge>
              </div>
              
              <div className="w-full md:w-48">
                <div className="flex justify-between text-sm mb-1">
                  <span>XP Progress</span>
                  <span>{profile?.xp || 0} XP</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-300"
                    style={{ width: `${xpProgress * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          onClick={() => navigate('/dashboard/games?action=create')}
          className="h-16 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] hover:from-[var(--brand-primary)]/90 hover:to-[var(--brand-secondary)]/90 text-white border-0"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Game
        </Button>
        
        <Button 
          onClick={() => navigate('/dashboard/games')}
          variant="outline"
          className="h-16 border-[var(--border)] hover:bg-[var(--bg-surface)]"
        >
          <Search className="w-5 h-5 mr-2" />
          Find Games
        </Button>
        
        <Button 
          onClick={() => navigate('/dashboard/games?filter=my-games')}
          variant="outline"
          className="h-16 border-[var(--border)] hover:bg-[var(--bg-surface)]"
        >
          <Gamepad2 className="w-5 h-5 mr-2" />
          My Games
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Nearby Games */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[var(--brand-primary)]" />
                Nearby Games
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dashboard/games')}
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            {loading ? (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {[...Array(3)].map((_, i) => <GameCardSkeleton key={i} />)}
              </div>
            ) : nearbyGames.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {nearbyGames.map((game) => (
                  <div key={game.id} className="bg-[var(--bg-surface)] rounded-xl p-4 min-w-[280px] border border-[var(--border)] hover:border-[var(--brand-primary)]/50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[var(--brand-primary)]/10 rounded-lg flex items-center justify-center">
                        <Gamepad2 className="w-5 h-5 text-[var(--brand-primary)]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-[var(--text)]">{game.sport}</h3>
                        <p className="text-sm text-[var(--text-muted)]">{game.venue}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(game.time).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <Users className="w-4 h-4" />
                        <span>{game.playersCount}/{game.maxPlayers} players</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{game.location.address}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-[var(--brand-primary)]">
                        NPR {game.price}
                      </div>
                      <Button size="sm" className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white">
                        Join
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--text-muted)]">
                <Gamepad2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No nearby games found</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => navigate('/dashboard/games')}
                >
                  Find Games
                </Button>
              </div>
            )}
          </Card>

          {/* Trending Sports */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[var(--success)]" />
                Trending Sports
              </h2>
            </div>
            
            {loading ? (
              <div className="flex flex-wrap gap-2">
                {[...Array(6)].map((_, i) => <TrendingChipSkeleton key={i} />)}
              </div>
            ) : trendingSports.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {trendingSports.map((sport, index) => (
                  <div 
                    key={sport.sport}
                    className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-full px-4 py-2 hover:border-[var(--brand-primary)]/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{sport.icon}</span>
                      <span className="font-medium text-[var(--text)]">{sport.sport}</span>
                      <Badge variant="default" size="sm" className="bg-[var(--success)]/10 text-[var(--success)] border-0">
                        {sport.playerCount}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--text-muted)]">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No trending sports data available</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-[var(--warning)]" />
                Recent Activity
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dashboard/profile')}
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <ActivityItemSkeleton key={i} />)}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="bg-[var(--bg-surface)] rounded-lg p-4 border border-[var(--border)] hover:border-[var(--brand-primary)]/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.status === 'won' ? 'bg-[var(--success)]/10' :
                        activity.status === 'lost' ? 'bg-[var(--error)]/10' :
                        activity.status === 'tied' ? 'bg-[var(--warning)]/10' :
                        'bg-[var(--bg-muted)]'
                      }`}>
                        {activity.status === 'won' ? <Trophy className="w-4 h-4 text-[var(--success)]" /> :
                         activity.status === 'lost' ? <Trophy className="w-4 h-4 text-[var(--error)]" /> :
                         activity.status === 'tied' ? <Trophy className="w-4 h-4 text-[var(--warning)]" /> :
                         <Clock className="w-4 h-4 text-[var(--text-muted)]" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[var(--text)]">
                          {activity.sport} at {activity.venue}
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">
                          {activity.outcome} • {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--text-muted)]">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent activity</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => navigate('/dashboard/games')}
                >
                  Join a Game
                </Button>
              </div>
            )}
          </Card>

          {/* Notifications Preview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-[var(--brand-primary)]" />
                Notifications
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dashboard/notifications')}
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            {loading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => <ActivityItemSkeleton key={i} />)}
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.slice(0, 2).map((notification) => (
                  <div key={notification.id} className="bg-[var(--bg-surface)] rounded-lg p-4 border border-[var(--border)] hover:border-[var(--brand-primary)]/50 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[var(--brand-primary)]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bell className="w-4 h-4 text-[var(--brand-primary)]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[var(--text)]">{notification.title}</p>
                        <p className="text-sm text-[var(--text-muted)]">{notification.message}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-[var(--brand-primary)] rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--text-muted)]">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No notifications</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
