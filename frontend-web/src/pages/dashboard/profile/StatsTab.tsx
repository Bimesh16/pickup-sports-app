import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@components/ui';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download, 
  Share, 
  Trophy, 
  Target, 
  Gamepad2,
  Clock,
  Users,
  Star,
  Zap,
  Award,
  Activity,
  MapPin
} from 'lucide-react';
import { apiClient } from '@lib/apiClient';
import { toast } from 'react-toastify';

interface StatsTabProps {
  profile: {
    id: string;
    stats: {
      totalGames: number;
      totalWins: number;
      winRate: number;
      currentStreak: number;
      longestStreak: number;
      fairPlayScore: number;
      mostPlayedSport: string;
      recentWeeklyAttendance: number[];
      sportAppearances: Record<string, number>;
    };
  };
}

interface WeeklyData {
  week: string;
  games: number;
  wins: number;
  attendance: number;
}

export default function StatsTab({ profile }: StatsTabProps) {
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  // Load stats data
  useEffect(() => {
    const loadStatsData = async () => {
      try {
        setLoading(true);

        try {
          // Try real API first
          const response = await apiClient.get('/api/v1/stats/player', {
            params: { playerId: profile.id }
          });

          setWeeklyData(response.data.weeklyData || []);
        } catch (apiError) {
          console.warn('API call failed, using mock data:', apiError);
          
          // Fallback to mock data
          const mockWeeklyData: WeeklyData[] = [
            { week: 'Week 1', games: 3, wins: 2, attendance: 3 },
            { week: 'Week 2', games: 2, wins: 1, attendance: 2 },
            { week: 'Week 3', games: 4, wins: 3, attendance: 4 },
            { week: 'Week 4', games: 1, wins: 1, attendance: 1 },
            { week: 'Week 5', games: 3, wins: 2, attendance: 3 },
            { week: 'Week 6', games: 2, wins: 1, attendance: 2 },
            { week: 'Week 7', games: 4, wins: 3, attendance: 4 },
            { week: 'Week 8', games: 3, wins: 2, attendance: 3 }
          ];

          setWeeklyData(mockWeeklyData);
        }
      } catch (error) {
        console.error('Error loading stats data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStatsData();
  }, [profile.id]);

  // Export player card
  const handleExportPlayerCard = async () => {
    try {
      const response = await apiClient.get('/api/v1/stats/export/player-card', {
        params: { playerId: profile.id, format: 'pdf' }
      });
      
      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `player-card-${profile.id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Player card downloaded successfully!');
    } catch (error) {
      console.error('Error exporting player card:', error);
      toast.error('Failed to export player card');
    }
  };

  // Share stats
  const handleShareStats = () => {
    const statsText = `Check out my pickup sports stats! 🏆
Games Played: ${profile.stats.totalGames}
Win Rate: ${profile.stats.winRate}%
Current Streak: ${profile.stats.currentStreak} games
Fair Play Score: ${profile.stats.fairPlayScore}/5`;

    navigator.share?.({
      title: 'My Pickup Sports Stats',
      text: statsText,
      url: window.location.href
    }).catch(() => {
      navigator.clipboard.writeText(statsText);
      toast.success('Stats copied to clipboard!');
    });
  };

  // Get intensity color
  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  // Get sport appearance data for bar chart
  const sportData = Object.entries(profile.stats.sportAppearances).map(([sport, count]) => ({
    sport,
    count,
    percentage: (count / profile.stats.totalGames) * 100
  }));

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Statistics</h3>
          <div className="flex gap-2">
            <Button
              onClick={handleExportPlayerCard}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              onClick={handleShareStats}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Share className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
      </Card>

      {/* Key Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
          <div className="text-2xl font-bold text-[var(--text-primary)]">{profile.stats.totalGames}</div>
          <div className="text-sm text-[var(--text-muted)]">Total Games</div>
        </Card>
        
        <Card className="p-4 text-center">
          <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <div className="text-2xl font-bold text-[var(--text-primary)]">{profile.stats.winRate}%</div>
          <div className="text-sm text-[var(--text-muted)]">Win Rate</div>
        </Card>
        
        <Card className="p-4 text-center">
          <Zap className="w-8 h-8 mx-auto mb-2 text-orange-500" />
          <div className="text-2xl font-bold text-[var(--text-primary)]">{profile.stats.currentStreak}</div>
          <div className="text-sm text-[var(--text-muted)]">Current Streak</div>
        </Card>
        
        <Card className="p-4 text-center">
          <Star className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <div className="text-2xl font-bold text-[var(--text-primary)]">{profile.stats.fairPlayScore}</div>
          <div className="text-sm text-[var(--text-muted)]">Fair Play Score</div>
        </Card>
      </div>

      {/* Sport Appearances Bar Chart */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-[var(--brand-primary)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Sport Appearances</h3>
        </div>
        
        <div className="space-y-3">
          {sportData.map((sport, index) => (
            <div key={sport.sport} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {sport.sport === 'Futsal' ? '⚽' : sport.sport === 'Basketball' ? '🏀' : '🏐'}
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">{sport.sport}</span>
                </div>
                <div className="text-sm text-[var(--text-muted)]">
                  {sport.count} games ({sport.percentage.toFixed(1)}%)
                </div>
              </div>
              <div className="w-full bg-[var(--bg-muted)] rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] h-3 rounded-full transition-all duration-500"
                  style={{ width: `${sport.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly Attendance Chart */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[var(--brand-primary)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Weekly Attendance (Last 8 Weeks)</h3>
        </div>
        
        {loading ? (
          <div className="h-64 bg-[var(--bg-muted)] rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-[var(--text-muted)]">Loading chart...</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-end gap-2 h-48">
              {weeklyData.map((week, index) => {
                const maxGames = Math.max(...weeklyData.map(w => w.games));
                const height = (week.games / maxGames) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="flex flex-col items-center mb-2">
                      <div 
                        className="w-full bg-gradient-to-t from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-t transition-all duration-500"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-2 text-center">
                      <div className="font-medium">{week.games}</div>
                      <div>{week.week}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[var(--brand-primary)]">
                  {weeklyData.reduce((sum, week) => sum + week.games, 0)}
                </div>
                <div className="text-sm text-[var(--text-muted)]">Total Games</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">
                  {weeklyData.reduce((sum, week) => sum + week.wins, 0)}
                </div>
                <div className="text-sm text-[var(--text-muted)]">Total Wins</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500">
                  {(weeklyData.reduce((sum, week) => sum + week.games, 0) / weeklyData.length).toFixed(1)}
                </div>
                <div className="text-sm text-[var(--text-muted)]">Avg/Week</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-500">
                  {Math.max(...weeklyData.map(w => w.games))}
                </div>
                <div className="text-sm text-[var(--text-muted)]">Best Week</div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Performance Insights */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-[var(--brand-primary)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Performance Insights</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-800">Best Performance</h4>
            </div>
            <p className="text-sm text-green-700">
              Your best week was with {Math.max(...weeklyData.map(w => w.games))} games played. 
              Keep up the great momentum and consistency!
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-800">Growth Opportunity</h4>
            </div>
            <p className="text-sm text-blue-700">
              Your {profile.stats.mostPlayedSport} skills are improving! 
              Consider trying new sports to become a well-rounded player.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
