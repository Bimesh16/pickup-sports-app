import React, { useState, useEffect } from 'react';
import { Button, Card, Badge } from '@components/ui';
import { ActivityItem, UserProfile } from '../types';

const ActivityTab: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Mock activities
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'join',
        title: 'Joined Futsal Game',
        description: 'Joined "Friday Night Futsal" at Tundikhel Court',
        timestamp: '2 hours ago',
        xpGained: 5,
        icon: '⚽'
      },
      {
        id: '2',
        type: 'badge',
        title: 'Earned Badge',
        description: 'Unlocked "Team Player" badge',
        timestamp: '1 day ago',
        xpGained: 25,
        icon: '🏆'
      },
      {
        id: '3',
        type: 'rating',
        title: 'Received Rating',
        description: 'Got 5 stars for fair play',
        timestamp: '2 days ago',
        xpGained: 10,
        icon: '⭐'
      },
      {
        id: '4',
        type: 'team',
        title: 'Joined Team',
        description: 'Became captain of "Thunder Bolts"',
        timestamp: '1 week ago',
        xpGained: 15,
        icon: '👥'
      },
      {
        id: '5',
        type: 'rsvp',
        title: 'RSVP Confirmed',
        description: 'Confirmed attendance for Basketball game',
        timestamp: '1 week ago',
        xpGained: 5,
        icon: '✅'
      }
    ];
    setActivities(mockActivities);
  }, []);

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.type === filter
  );

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'join', 'rsvp', 'rating', 'badge', 'team'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === filterType
                ? 'bg-[var(--brand-primary)] text-white'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:bg-[var(--brand-primary)]/10'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {filteredActivities.map((activity) => (
          <Card key={activity.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[var(--brand-primary)]/10 rounded-full flex items-center justify-center">
                <span className="text-lg">{activity.icon}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-[var(--text)]">{activity.title}</h4>
                <p className="text-sm text-[var(--text-muted)]">{activity.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-[var(--text-muted)]">{activity.timestamp}</span>
                  {activity.xpGained && (
                    <Badge variant="default" size="sm" className="bg-green-100 text-green-700 border-0">
                      +{activity.xpGained} XP
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="sm">Load More</Button>
      </div>
    </div>
  );
};

export default ActivityTab;
