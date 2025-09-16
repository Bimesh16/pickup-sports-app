export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  xp: number;
  rank: 'Learner' | 'Competent' | 'Advanced' | 'Pro';
  preferredSports: string[];
  stats: {
    totalGames: number;
    winRate: number;
    currentStreak: number;
    fairPlayScore: number;
    mostPlayedSport: string;
    recentWeeklyAttendance: number[];
  };
  badges: Badge[];
  teams: Team[];
  sports: SportProfile[];
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    activeSessions: Session[];
  };
  completion: {
    hasPhoto: boolean;
    emailVerified: boolean;
    hasBio: boolean;
    hasPreferredSport: boolean;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
  xpReward: number;
  category: 'achievement' | 'milestone' | 'special';
}

export interface Team {
  id: string;
  name: string;
  role: 'captain' | 'player' | 'coach';
  members: TeamMember[];
  sport: string;
  joinedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

export interface SportProfile {
  sport: string;
  skillLevel: number; // 1-5
  positions: string[];
  styleTags: string[];
  dominantFoot?: 'left' | 'right';
  dominantHand?: 'left' | 'right';
  intensity: 'casual' | 'competitive' | 'professional';
  availability: AvailabilityGrid;
  notes?: string;
  visibility: 'public' | 'private';
}

export interface AvailabilityGrid {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'join' | 'rsvp' | 'rating' | 'badge' | 'team';
  title: string;
  description: string;
  timestamp: string;
  xpGained?: number;
  icon: string;
}
