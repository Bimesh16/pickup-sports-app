import React from 'react';
import { Button, Card } from '@components/ui';
import { 
  BarChart3,
  TrendingUp,
  Download,
  Share2
} from 'lucide-react';
import { UserProfile } from '../types';

const StatsTab: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  return (
    <div className="space-y-6">
      {/* Sport Appearances */}
      <Card className="p-4">
        <h3 className="font-semibold text-[var(--text)] mb-4">Sport Appearances</h3>
        <div className="h-64 bg-[var(--bg-muted)] rounded-lg flex items-center justify-center">
          <div className="text-center text-[var(--text-muted)]">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Chart coming soon</p>
          </div>
        </div>
      </Card>

      {/* Attendance Chart */}
      <Card className="p-4">
        <h3 className="font-semibold text-[var(--text)] mb-4">Attendance (Last 8 Weeks)</h3>
        <div className="h-64 bg-[var(--bg-muted)] rounded-lg flex items-center justify-center">
          <div className="text-center text-[var(--text-muted)]">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Chart coming soon</p>
          </div>
        </div>
      </Card>

      {/* Weekly Heatmap */}
      <Card className="p-4">
        <h3 className="font-semibold text-[var(--text)] mb-4">Weekly Activity Heatmap</h3>
        <div className="h-32 bg-[var(--bg-muted)] rounded-lg flex items-center justify-center">
          <div className="text-center text-[var(--text-muted)]">
            <div className="text-sm">Heatmap coming soon</div>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-[var(--text)]">{profile.stats.totalGames}</div>
          <div className="text-sm text-[var(--text-muted)]">Total Games</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-[var(--text)]">{Math.round(profile.stats.winRate * 100)}%</div>
          <div className="text-sm text-[var(--text-muted)]">Win Rate</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-[var(--text)]">{profile.stats.currentStreak}</div>
          <div className="text-sm text-[var(--text-muted)]">Current Streak</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-[var(--text)]">{profile.stats.fairPlayScore}</div>
          <div className="text-sm text-[var(--text-muted)]">Fair Play Score</div>
        </Card>
      </div>

      {/* Export Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-1" />
          Download Player Card
        </Button>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-1" />
          Share Recap
        </Button>
      </div>
    </div>
  );
};

export default StatsTab;
