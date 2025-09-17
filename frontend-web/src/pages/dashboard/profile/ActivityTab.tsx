import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge } from '@components/ui';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Award, 
  Gamepad2, 
  ThumbsUp, 
  MessageCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Trophy,
  Target,
  Zap,
  Heart,
  Shield,
  Crown
} from 'lucide-react';
import { apiClient } from '@lib/apiClient';

interface ActivityTabProps {
  profile: {
    id: string;
    username: string;
  };
}

interface ActivityEvent {
  id: string;
  type: 'join' | 'rsvp' | 'rating' | 'badge' | 'team_join' | 'sport_add' | 'win' | 'streak';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  xpGained?: number;
  metadata?: {
    gameId?: string;
    sport?: string;
    rating?: number;
    badgeName?: string;
    teamName?: string;
    streakCount?: number;
  };
}

const ACTIVITY_ICONS = {
  join: Gamepad2,
  rsvp: Calendar,
  rating: Star,
  badge: Award,
  team_join: Users,
  sport_add: Target,
  win: Trophy,
  streak: Zap
};

const ACTIVITY_COLORS = {
  join: 'text-blue-500',
  rsvp: 'text-green-500',
  rating: 'text-yellow-500',
  badge: 'text-purple-500',
  team_join: 'text-indigo-500',
  sport_add: 'text-orange-500',
  win: 'text-yellow-600',
  streak: 'text-red-500'
};

export default function ActivityTab({ profile }: ActivityTabProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<'all' | 'joins' | 'rsvps' | 'ratings' | 'badges'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Load activities - Optimized for instant loading
  const loadActivities = useCallback(async (pageNum: number = 0, reset: boolean = false) => {
    try {
      // Load cached activities immediately for instant display
      const cacheKey = `activities_${filter}_${pageNum}`;
      const cachedActivities = localStorage.getItem(cacheKey);
      
      if (cachedActivities && reset) {
        try {
          const parsed = JSON.parse(cachedActivities);
          setActivities(parsed);
          setLoading(false); // Show data immediately
        } catch (e) {
          console.warn('Failed to parse cached activities');
        }
      }

      // Background API sync with timeout - don't block UI
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
      
      try {
        const response = await apiClient.get('/api/v1/activities', {
          params: {
            page: pageNum,
            size: 20,
            type: filter === 'all' ? undefined : filter
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const newActivities = response.data.content.map((activity: any) => ({
          id: activity.id,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          timestamp: activity.timestamp,
          icon: activity.icon,
          xpGained: activity.xpGained,
          metadata: activity.metadata
        }));

        if (reset) {
          setActivities(newActivities);
          localStorage.setItem(cacheKey, JSON.stringify(newActivities));
        } else {
          setActivities(prev => [...prev, ...newActivities]);
        }

        setHasMore(!response.data.last);
      } catch (apiError: any) {
        clearTimeout(timeoutId);
        if (apiError.name !== 'AbortError') {
          console.warn('API call failed, using cached/mock data:', apiError);
        }

        // Use mock data only if no cache exists
        if (!cachedActivities || !reset) {
          // Enhanced mock data with Nepal cultural elements
        const mockActivities: ActivityEvent[] = [
          {
            id: '1',
            type: 'join',
            title: 'जिन किया फुटसल मैच!', // Joined Futsal Match! 
            description: 'Joined "Evening Futsal" at New Road Sports Complex - धन्यवाद!',
            timestamp: '2024-01-15T18:00:00Z',
            icon: '⚽',
            xpGained: 5,
            metadata: { gameId: '123', sport: 'Futsal' }
          },
          {
            id: '2',
            type: 'badge',
            title: 'नयाँ बैज अनलक!', // New Badge Unlocked!
            description: 'Earned "Himalayan Warrior 🏔️" badge for 10 consecutive games',
            timestamp: '2024-01-14T16:30:00Z',
            icon: '🏔️',
            xpGained: 25,
            metadata: { badgeName: 'Himalayan Warrior' }
          },
          {
            id: '3',
            type: 'rating',
            title: 'शानदार खेल!', // Amazing Game!
            description: 'Received 5.0⭐ rating for fair play in Basketball at Durbar Marg',
            timestamp: '2024-01-13T20:15:00Z',
            icon: '⭐',
            xpGained: 10,
            metadata: { rating: 5.0, sport: 'Basketball' }
          },
          {
            id: '4',
            type: 'rsvp',
            title: 'RSVP गरियो!', // RSVP Done!
            description: 'Confirmed for "Dashain Festival Volleyball Tournament" 🎉',
            timestamp: '2024-01-12T14:20:00Z',
            icon: '🏐',
            xpGained: 5,
            metadata: { gameId: '456', sport: 'Volleyball' }
          },
          {
            id: '5',
            type: 'win',
            title: 'विजयी भयो!', // Victory!
            description: 'Won epic Futsal match 3-1 at Patan Dhoka - जय हो! 🎯',
            timestamp: '2024-01-11T19:45:00Z',
            icon: '🏆',
            xpGained: 15,
            metadata: { sport: 'Futsal' }
          },
          {
            id: '6',
            type: 'streak',
            title: 'स्ट्रिक मिलेस्टोन!', // Streak Milestone!
            description: 'Reached legendary 5-game winning streak! 🔥 The mountain warrior spirit!',
            timestamp: '2024-01-10T21:00:00Z',
            icon: '🔥',
            xpGained: 20,
            metadata: { streakCount: 5 }
          },
          {
            id: '7',
            type: 'team_join',
            title: 'टिम जॉइन!', // Team Join!
            description: 'Joined "Everest Thunders" basketball team as star player 👑',
            timestamp: '2024-01-09T17:30:00Z',
            icon: '👥',
            xpGained: 10,
            metadata: { teamName: 'Everest Thunders' }
          },
          {
            id: '8',
            type: 'sport_add',
            title: 'नयाँ खेल थपियो!', // New Sport Added!
            description: 'Added Cricket to your sports - now a multi-sport champion! 🏏',
            timestamp: '2024-01-08T12:00:00Z',
            icon: '🏏',
            xpGained: 15,
            metadata: { sport: 'Cricket' }
          },
          {
            id: '9',
            type: 'badge',
            title: 'Prayer Flag चढायो!', // Raised Prayer Flag!
            description: 'Unlocked "Community Builder 🙏" for organizing 3 local games',
            timestamp: '2024-01-07T15:45:00Z',
            icon: '🙏',
            xpGained: 30,
            metadata: { badgeName: 'Community Builder' }
          },
          {
            id: '10',
            type: 'win',
            title: 'शेर्पा Victory!', // Sherpa Victory!
            description: 'Led team to victory in intense Basketball match at Thamel Court 🏀',
            timestamp: '2024-01-06T19:30:00Z',
            icon: '👑',
            xpGained: 18,
            metadata: { sport: 'Basketball' }
          }
        ];

        // Filter mock data based on current filter
        let filteredActivities = mockActivities;
        if (filter !== 'all') {
          const filterMap = {
            joins: 'join',
            rsvps: 'rsvp',
            ratings: 'rating',
            badges: 'badge'
          };
          filteredActivities = mockActivities.filter(activity => 
            activity.type === filterMap[filter]
          );
        }

        // Simulate pagination
        const startIndex = pageNum * 20;
        const endIndex = startIndex + 20;
        const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

        if (reset) {
          setActivities(paginatedActivities);
        } else {
          setActivities(prev => [...prev, ...paginatedActivities]);
        }

        setHasMore(endIndex < filteredActivities.length);
        }
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter]);

  // Load more activities
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadActivities(nextPage, false);
    }
  };

  // Filter change
  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    setPage(0);
    loadActivities(0, true);
  };

  // Initial load
  useEffect(() => {
    loadActivities(0, true);
  }, [loadActivities]);

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Activity', count: activities.length },
    { value: 'joins', label: 'Game Joins', count: activities.filter(a => a.type === 'join').length },
    { value: 'rsvps', label: 'RSVPs', count: activities.filter(a => a.type === 'rsvp').length },
    { value: 'ratings', label: 'Ratings', count: activities.filter(a => a.type === 'rating').length },
    { value: 'badges', label: 'Badges', count: activities.filter(a => a.type === 'badge').length }
  ];

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent Activity</h3>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filter
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-[var(--text-muted)]">
            {activities.length} activities
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange(option.value as typeof filter)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === option.value
                      ? 'bg-[var(--brand-primary)] text-white'
                      : 'bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--bg-contrast)]'
                  }`}
                >
                  {option.label} ({option.count})
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Activity Timeline */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[var(--bg-muted)] rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[var(--bg-muted)] rounded w-1/3"></div>
                    <div className="h-3 bg-[var(--bg-muted)] rounded w-2/3"></div>
                    <div className="h-3 bg-[var(--bg-muted)] rounded w-1/4"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : activities.length > 0 ? (
          activities.map((activity, index) => {
            const IconComponent = ACTIVITY_ICONS[activity.type] || Gamepad2;
            const colorClass = ACTIVITY_COLORS[activity.type] || 'text-gray-500';

            return (
              <Card key={activity.id} className="p-4 hover:bg-[var(--bg-muted)] transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full bg-[var(--bg-muted)] flex items-center justify-center ${colorClass}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-[var(--text-primary)]">{activity.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        {activity.xpGained && (
                          <Badge variant="default">
                            +{activity.xpGained} XP
                          </Badge>
                        )}
                        <span>{formatTimestamp(activity.timestamp)}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-[var(--text-muted)] mb-2">{activity.description}</p>
                    
                    {/* Additional metadata */}
                    {activity.metadata && (
                      <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                        {activity.metadata.sport && (
                          <div className="flex items-center gap-1">
                            <Gamepad2 className="w-3 h-3" />
                            <span>{activity.metadata.sport}</span>
                          </div>
                        )}
                        {activity.metadata.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            <span>{activity.metadata.rating} stars</span>
                          </div>
                        )}
                        {activity.metadata.streakCount && (
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            <span>{activity.metadata.streakCount} games</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)] opacity-50" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Activity Found</h3>
            <p className="text-[var(--text-muted)]">
              {filter === 'all' 
                ? "You haven't done any activities yet. Start playing games to see your activity here!"
                : `No ${filter} activities found. Try a different filter.`
              }
            </p>
          </Card>
        )}

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="text-center">
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              variant="outline"
              className="w-full"
            >
              {loadingMore ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MoreHorizontal className="w-4 h-4" />
                  Load More Activities
                </div>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
