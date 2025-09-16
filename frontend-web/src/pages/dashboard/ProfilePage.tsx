import React, { useState, useEffect } from 'react';
import { Card } from '@components/ui';
import { useAppState } from '@context/AppStateContext';
import ProfileHeader from './profile/ProfileHeader';
import ProfileProgress from './profile/ProfileProgress';
import PrivacyPreview from './profile/PrivacyPreview';
import TabbedSections from './profile/TabbedSections';
import { UserProfile } from './profile/types';

// XP Configuration
export const XP_CONFIG = {
  Learner: { min: 0, max: 100, color: 'text-blue-500' },
  Competent: { min: 100, max: 250, color: 'text-green-500' },
  Advanced: { min: 250, max: 500, color: 'text-yellow-500' },
  Pro: { min: 500, max: 1000, color: 'text-purple-500' }
};

// XP Rewards
export const XP_REWARDS = {
  ADD_FIRST_SPORT: 15,
  COMPLETE_SPORT_PROFILE: 20,
  UPDATE_AVAILABILITY: 5,
  UPLOAD_PHOTO: 10,
  UNLOCK_BADGE: 25,
  ON_TIME_RSVP: 5
};

export default function ProfilePage() {
  const { profile: authProfile } = useAppState();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock profile data
  useEffect(() => {
    const mockProfile: UserProfile = {
      id: '1',
      firstName: authProfile?.firstName || 'John',
      lastName: authProfile?.lastName || 'Doe',
      username: authProfile?.username || 'johndoe',
      email: authProfile?.email || 'john@example.com',
      phone: '+977-98-123-4567',
      avatar: authProfile?.avatarUrl,
      bio: 'Passionate about sports and staying active!',
      location: 'Kathmandu, Nepal',
      xp: 150,
      rank: 'Competent',
      preferredSports: ['Futsal', 'Basketball'],
      stats: {
        totalGames: 24,
        winRate: 0.75,
        currentStreak: 5,
        fairPlayScore: 4.8,
        mostPlayedSport: 'Futsal',
        recentWeeklyAttendance: [2, 3, 1, 4, 2, 3, 1]
      },
      badges: [
        { id: '1', name: 'Team Player', description: 'Played 10 team games', icon: '🏆', earned: true, earnedAt: '2024-01-15', xpReward: 25, category: 'achievement' },
        { id: '2', name: 'Fair Play', description: 'Maintained 4.5+ rating', icon: '⭐', earned: true, earnedAt: '2024-01-10', xpReward: 20, category: 'achievement' },
        { id: '3', name: 'Streak Master', description: '5 game winning streak', icon: '🔥', earned: false, xpReward: 30, category: 'milestone' }
      ],
      teams: [
        { id: '1', name: 'Thunder Bolts', role: 'captain', members: [], sport: 'Futsal', joinedAt: '2024-01-01' },
        { id: '2', name: 'City Hoops', role: 'player', members: [], sport: 'Basketball', joinedAt: '2024-01-15' }
      ],
      sports: [
        { sport: 'Futsal', skillLevel: 4, positions: ['Midfielder'], styleTags: ['Aggressive'], intensity: 'competitive', availability: {} as any, visibility: 'public' },
        { sport: 'Basketball', skillLevel: 3, positions: ['Point Guard'], styleTags: ['Strategic'], intensity: 'casual', availability: {} as any, visibility: 'public' }
      ],
      privacy: {
        showEmail: false,
        showPhone: false,
        showLocation: true
      },
      security: {
        twoFactorEnabled: false,
        activeSessions: [
          { id: '1', device: 'Chrome on Mac', location: 'Kathmandu, Nepal', lastActive: '2 hours ago', current: true },
          { id: '2', device: 'Safari on iPhone', location: 'Kathmandu, Nepal', lastActive: '1 day ago', current: false }
        ]
      },
      completion: {
        hasPhoto: !!authProfile?.avatarUrl,
        emailVerified: true,
        hasBio: true,
        hasPreferredSport: true
      }
    };

    setProfile(mockProfile);
    setLoading(false);
  }, [authProfile]);

  const handleTaskComplete = (task: keyof UserProfile['completion']) => {
    if (!profile) return;
    
    setProfile(prev => {
      if (!prev) return prev;
      const newProfile = { ...prev };
      newProfile.completion = { ...prev.completion, [task]: true };
      
      // Add XP based on task
      let xpGained = 0;
      switch (task) {
        case 'hasPhoto':
          xpGained = XP_REWARDS.UPLOAD_PHOTO;
          break;
        case 'hasPreferredSport':
          xpGained = XP_REWARDS.ADD_FIRST_SPORT;
          break;
        case 'hasBio':
          xpGained = XP_REWARDS.COMPLETE_SPORT_PROFILE;
          break;
      }
      
      newProfile.xp += xpGained;
      
      // Check for rank up
      const newRank = getRankFromXP(newProfile.xp);
      if (newRank !== newProfile.rank) {
        newProfile.rank = newRank;
        // Show rank up animation
      }
      
      return newProfile;
    });
  };

  const handleAvailabilityUpdate = () => {
    if (!profile) return;
    
    setProfile(prev => {
      if (!prev) return prev;
      const newProfile = { ...prev };
      newProfile.xp += XP_REWARDS.UPDATE_AVAILABILITY;
      
      // Check for rank up
      const newRank = getRankFromXP(newProfile.xp);
      if (newRank !== newProfile.rank) {
        newProfile.rank = newRank;
        // Show rank up animation
      }
      
      return newProfile;
    });
  };

  const getRankFromXP = (xp: number): UserProfile['rank'] => {
    if (xp >= 500) return 'Pro';
    if (xp >= 250) return 'Advanced';
    if (xp >= 100) return 'Competent';
    return 'Learner';
  };

  const handlePrivacyToggle = (field: keyof UserProfile['privacy']) => {
    if (!profile) return;
    setProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        privacy: {
          ...prev.privacy,
          [field]: !prev.privacy[field]
        }
      };
    });
  };

  if (loading || !profile) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-[var(--bg-muted)] rounded w-1/3 mb-4"></div>
            <div className="h-3 bg-[var(--bg-muted)] rounded w-2/3"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        onEdit={() => console.log('Edit profile')}
        onShare={() => console.log('Share profile')}
        onQRCode={() => console.log('Show QR code')}
        onCopyInvite={() => console.log('Copy invite')}
      />

      {/* Profile Progress */}
      <ProfileProgress
        completion={profile.completion}
        onTaskComplete={handleTaskComplete}
      />

      {/* Privacy Preview */}
      <PrivacyPreview
        privacy={profile.privacy}
        onToggle={handlePrivacyToggle}
      />

      {/* Tabbed Sections */}
      <TabbedSections
        profile={profile}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAvailabilityUpdate={handleAvailabilityUpdate}
      />
    </div>
  );
}