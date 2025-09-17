import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@components/ui';
import { 
  Edit3, 
  Save, 
  X, 
  Calendar, 
  MapPin, 
  Clock, 
  Trophy, 
  Target, 
  TrendingUp, 
  Star,
  Users,
  Gamepad2,
  Flame,
  Award,
  ChevronRight
} from 'lucide-react';
import { apiClient } from '@lib/apiClient';
import { toast } from 'react-toastify';

interface OverviewTabProps {
  profile: {
    id: string;
    displayName: string;
    bio?: string;
    rank: string;
    xp: number;
    stats: {
      totalGames: number;
      totalWins: number;
      winRate: number;
      currentStreak: number;
      longestStreak: number;
      fairPlayScore: number;
      mostPlayedSport: string;
    };
    preferredSports: string[];
  };
  onProfileUpdate: (updates: any) => void;
}

interface NextMatch {
  id: string;
  sport: string;
  time: string;
  location: string;
  venue: string;
  playersCount: number;
  maxPlayers: number;
}

interface Highlight {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  sport: string;
  time: string;
  location: string;
  matchScore: number;
  reason: string;
}

export default function OverviewTab({ profile, onProfileUpdate }: OverviewTabProps) {
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(profile.bio || '');
  const [nextMatch, setNextMatch] = useState<NextMatch | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  // Load next match and recommendations
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load next match
        try {
          const matchResponse = await apiClient.get('/api/v1/games/upcoming?limit=1');
          if (matchResponse.data.content.length > 0) {
            const match = matchResponse.data.content[0];
            setNextMatch({
              id: match.id,
              sport: match.sport,
              time: match.time,
              location: match.location,
              venue: match.venue?.name || 'TBD',
              playersCount: match.currentPlayers || 0,
              maxPlayers: match.maxPlayers || 10
            });
          }
        } catch (error) {
          console.warn('Failed to load next match:', error);
        }

        // Load recommendations
        try {
          const recResponse = await apiClient.get('/api/v1/ai/recommendations/comprehensive?limit=3');
          setRecommendations(recResponse.data.map((rec: any) => ({
            id: rec.id,
            title: rec.title,
            description: rec.description,
            sport: rec.sport,
            time: rec.time,
            location: rec.location,
            matchScore: rec.matchScore,
            reason: rec.reason
          })));
        } catch (error) {
          console.warn('Failed to load recommendations:', error);
          // Fallback to mock data
          setRecommendations([
            {
              id: '1',
              title: 'Evening Futsal Match',
              description: 'Perfect match for your skill level and schedule',
              sport: 'Futsal',
              time: 'Today 6:00 PM',
              location: 'Kathmandu Sports Complex',
              matchScore: 95,
              reason: 'Matches your preferred sport and time'
            },
            {
              id: '2',
              title: 'Basketball Tournament',
              description: 'Competitive tournament with similar skill levels',
              sport: 'Basketball',
              time: 'Tomorrow 4:00 PM',
              location: 'Basketball Court, Thamel',
              matchScore: 88,
              reason: 'High skill level match'
            },
            {
              id: '3',
              title: 'Volleyball League',
              description: 'Weekly league game with regular players',
              sport: 'Volleyball',
              time: 'Friday 7:00 PM',
              location: 'Volleyball Arena',
              matchScore: 82,
              reason: 'Consistent weekly schedule'
            }
          ]);
        }
      } catch (error) {
        console.error('Error loading overview data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Save bio changes
  const handleSaveBio = async () => {
    try {
      await apiClient.put('/profiles/me', { bio: bioText });
      onProfileUpdate({ bio: bioText });
      setIsEditingBio(false);
      toast.success('Bio updated successfully!');
    } catch (error) {
      console.error('Error updating bio:', error);
      toast.error('Failed to update bio');
    }
  };

  // Cancel bio editing
  const handleCancelBio = () => {
    setBioText(profile.bio || '');
    setIsEditingBio(false);
  };

  // Create highlights data
  const highlights: Highlight[] = [
    {
      title: 'Fair Play Score',
      value: profile.stats.fairPlayScore,
      icon: Star,
      color: 'text-green-500',
      description: 'Based on player ratings'
    },
    {
      title: 'Current Streak',
      value: `${profile.stats.currentStreak} games`,
      icon: Flame,
      color: 'text-orange-500',
      description: 'Consecutive games played'
    },
    {
      title: 'Most Played',
      value: profile.stats.mostPlayedSport,
      icon: Gamepad2,
      color: 'text-blue-500',
      description: 'Your favorite sport'
    },
    {
      title: 'Win Rate',
      value: `${profile.stats.winRate}%`,
      icon: Trophy,
      color: 'text-yellow-500',
      description: 'Games won vs total'
    }
  ];

  // Handle quick actions
  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'create-game':
        // Navigate to create game page - no pop-up
        break;
      case 'find-games':
        // Navigate to games page - no pop-up
        break;
      case 'invite-friends':
        // Open friend invite modal - no pop-up
        break;
      case 'messages':
        // Navigate to messages - no pop-up
        break;
      case 'achievements':
        // Navigate to achievements tab - no pop-up
        break;
      case 'friend-requests':
        // Open friend requests modal - no pop-up
        break;
      case 'share-profile':
        navigator.share?.({
          title: `${profile.displayName}'s Profile`,
          text: `Check out ${profile.displayName}'s pickup sports profile!`,
          url: window.location.href
        }).catch(() => {
          navigator.clipboard.writeText(window.location.href);
          toast.success('Profile link copied to clipboard!');
        });
        break;
      case 'rate-players':
        // Open player rating modal - no pop-up
        break;
      case 'send-gift':
        // Open gift modal - no pop-up
        break;
      default:
        // Silent action
        break;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Bio Section */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-[18px] font-bold text-text-strong">About Me</h3>
          {!isEditingBio && (
            <Button
              onClick={() => setIsEditingBio(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
          )}
        </div>

        {isEditingBio ? (
          <div className="space-y-4">
            <textarea
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              placeholder="Tell us about yourself..."
              className="w-full p-3 border border-[var(--border)] rounded-lg resize-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
              rows={4}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSaveBio}
                size="sm"
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </Button>
              <Button
                onClick={handleCancelBio}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-text-muted leading-relaxed">
            {profile.bio || 'No bio added yet. Click edit to add one!'}
          </p>
        )}
      </Card>

      {/* Next Match */}
      {nextMatch && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[var(--brand-primary)]" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Next Match</h3>
          </div>
          
          <div className="bg-gradient-to-r from-[var(--brand-primary)]/10 to-[var(--brand-secondary)]/10 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{nextMatch.sport === 'Futsal' ? '⚽' : nextMatch.sport === 'Basketball' ? '🏀' : '🏐'}</span>
                <h4 className="font-semibold text-[var(--text-primary)]">{nextMatch.sport}</h4>
              </div>
              <Badge variant="default">
                {nextMatch.playersCount}/{nextMatch.maxPlayers} players
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm text-[var(--text-muted)]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{nextMatch.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{nextMatch.venue}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Highlights */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[var(--brand-primary)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Highlights</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {highlights.map((highlight, index) => (
            <div key={index} className="text-center p-4 bg-[var(--bg-muted)] rounded-lg">
              <highlight.icon className={`w-8 h-8 mx-auto mb-2 ${highlight.color}`} />
              <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                {highlight.value}
              </div>
              <div className="text-sm font-medium text-[var(--text-primary)] mb-1">
                {highlight.title}
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                {highlight.description}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Matches for You */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-[var(--brand-primary)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Top Matches for You</h3>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-[var(--bg-muted)] rounded-lg animate-pulse">
                <div className="h-4 bg-[var(--bg-contrast)] rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-[var(--bg-contrast)] rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-[var(--bg-contrast)] rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-4 border border-[var(--border)] rounded-lg hover:bg-[var(--bg-muted)] transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {rec.sport === 'Futsal' ? '⚽' : rec.sport === 'Basketball' ? '🏀' : '🏐'}
                    </span>
                    <h4 className="font-semibold text-[var(--text-primary)]">{rec.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">
                      {rec.matchScore}% match
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                </div>
                
                <p className="text-sm text-[var(--text-muted)] mb-2">{rec.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{rec.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{rec.location}</span>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-[var(--brand-primary)]">
                  💡 {rec.reason}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      </div>

    </div>
  );
}
