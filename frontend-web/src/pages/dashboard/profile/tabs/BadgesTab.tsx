import React, { useState, useEffect } from 'react';
import { Card, Badge } from '@components/ui';
import { UserProfile } from '../types';

const BadgesTab: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Show confetti on first visit to badges tab
    const hasVisitedBadges = sessionStorage.getItem('visitedBadges');
    if (!hasVisitedBadges) {
      setShowConfetti(true);
      sessionStorage.setItem('visitedBadges', 'true');
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, []);

  const earnedBadges = profile.badges.filter(badge => badge.earned);
  const lockedBadges = profile.badges.filter(badge => !badge.earned);

  return (
    <div className="space-y-6">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce">🎉</div>
          </div>
        </div>
      )}

      {/* Badge Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-[var(--text)]">{earnedBadges.length}</div>
          <div className="text-sm text-[var(--text-muted)]">Badges Earned</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-[var(--text)]">{lockedBadges.length}</div>
          <div className="text-sm text-[var(--text-muted)]">Badges Locked</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-[var(--text)]">{profile.badges.length}</div>
          <div className="text-sm text-[var(--text-muted)]">Total Badges</div>
        </Card>
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div>
          <h3 className="font-semibold text-[var(--text)] mb-4">Earned Badges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {earnedBadges.map((badge) => (
              <Card key={badge.id} className="p-4 border-green-200 bg-green-50/50">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-2xl">{badge.icon}</span>
                  </div>
                  <h4 className="font-semibold text-[var(--text)] mb-1">{badge.name}</h4>
                  <p className="text-sm text-[var(--text-muted)] mb-2">{badge.description}</p>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="default" size="sm" className="bg-green-100 text-green-700 border-0">
                      Earned
                    </Badge>
                    {badge.earnedAt && (
                      <span className="text-xs text-[var(--text-muted)]">
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <div>
          <h3 className="font-semibold text-[var(--text)] mb-4">Available Badges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedBadges.map((badge) => (
              <Card key={badge.id} className="p-4 border-gray-200 bg-gray-50/50">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-2xl grayscale opacity-50">{badge.icon}</span>
                  </div>
                  <h4 className="font-semibold text-[var(--text)] mb-1">{badge.name}</h4>
                  <p className="text-sm text-[var(--text-muted)] mb-2">{badge.description}</p>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline" size="sm" className="text-gray-500">
                      Locked
                    </Badge>
                    <span className="text-xs text-[var(--text-muted)]">
                      +{badge.xpReward} XP
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Badge Categories */}
      <Card className="p-4">
        <h3 className="font-semibold text-[var(--text)] mb-4">Badge Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2">🏆</div>
            <h4 className="font-medium text-[var(--text)]">Achievement</h4>
            <p className="text-sm text-[var(--text-muted)]">Complete specific tasks</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="font-medium text-[var(--text)]">Milestone</h4>
            <p className="text-sm text-[var(--text-muted)]">Reach important goals</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl mb-2">⭐</div>
            <h4 className="font-medium text-[var(--text)]">Special</h4>
            <p className="text-sm text-[var(--text-muted)]">Unique accomplishments</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BadgesTab;
