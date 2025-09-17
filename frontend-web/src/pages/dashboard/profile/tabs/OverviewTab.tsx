import React, { useState } from 'react';
import { Button, Card } from '@components/ui';
import { 
  Edit3,
  Trophy,
  Zap,
  Gamepad2,
  Calendar
} from 'lucide-react';
import { UserProfile } from '../types';

const OverviewTab: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const [bio, setBio] = useState(profile.bio || '');
  const [isEditingBio, setIsEditingBio] = useState(false);

  const handleSaveBio = () => {
    // Save bio to backend
    setIsEditingBio(false);
  };

  return (
    <div className="space-y-6">
      {/* Bio Section */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[18px] font-bold text-text-strong">Bio</h3>
          <Button 
            onClick={() => setIsEditingBio(!isEditingBio)} 
            variant="outline" 
            size="sm"
          >
            <Edit3 className="w-4 h-4 mr-1" />
            {isEditingBio ? 'Save' : 'Edit'}
          </Button>
        </div>
        
        {isEditingBio ? (
          <div className="space-y-3">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="w-full p-3 border border-[var(--border)] rounded-lg resize-none"
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveBio} size="sm">Save</Button>
              <Button onClick={() => setIsEditingBio(false)} variant="outline" size="sm">Cancel</Button>
            </div>
          </div>
        ) : (
          <p className="text-text-muted">
            {bio || 'No bio yet. Click Edit to add one!'}
          </p>
        )}
      </Card>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-text-strong">{profile.stats.fairPlayScore}</div>
          <div className="text-[12px] text-text-muted">Fair Play Score</div>
        </Card>
        
        <Card className="p-4 text-center">
          <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-text-strong">{profile.stats.currentStreak}</div>
          <div className="text-[12px] text-text-muted">Current Streak</div>
        </Card>
        
        <Card className="p-4 text-center">
          <Gamepad2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-text-strong">{profile.stats.mostPlayedSport}</div>
          <div className="text-[12px] text-text-muted">Most Played</div>
        </Card>
      </div>

      {/* Next Match */}
      <Card className="p-4">
        <h3 className="text-[18px] font-bold text-text-strong mb-4">Next Match</h3>
        <div className="text-center py-8 text-text-muted">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No upcoming matches</p>
          <Button className="mt-3" size="sm">Find Games</Button>
        </div>
      </Card>
    </div>
  );
};

export default OverviewTab;
