// Profile schema extensions for v2 header
export interface Profile {
  id: string;
  username: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  gender?: 'male' | 'female' | 'nonbinary' | 'prefer_not_to_say';
  nationality?: string; // ISO 3166-1 alpha-2, e.g. 'NP'
  rank: 'Learner' | 'Competent' | 'Advanced' | 'Pro';
  xp: number;
  level: number;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  preferredSports: string[];
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
  badges: Badge[];
  teams: Team[];
  sports: SportProfile[];
  privacy: {
    showPublicly: boolean;
    publicFields: string[];
    privateFields: string[];
  };
  security: {
    has2FA: boolean;
    activeSessions: Session[];
    lastPasswordChange: string;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'achievement' | 'participation' | 'social' | 'skill';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface Team {
  id: string;
  name: string;
  sport: string;
  role: 'captain' | 'player' | 'coach';
  joinedAt: string;
  roster: TeamMember[];
  isActive: boolean;
}

export interface TeamMember {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  role: 'captain' | 'player' | 'coach';
  joinedAt: string;
}

export interface SportProfile {
  sport: string;
  positions: string[];
  skillLevel: number; // 1-5
  styleTags: string[];
  dominantFoot?: 'left' | 'right' | 'both';
  dominantHand?: 'left' | 'right' | 'both';
  intensity: 'casual' | 'competitive' | 'professional';
  availability: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
    saturday: string[];
    sunday: string[];
  };
  notes?: string;
  isVisible: boolean;
}

export interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

// Country data with flags
export const COUNTRIES = [
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' }
];

// Helper function to get country flag from code
export const countryFlag = (code: string): string => {
  const country = COUNTRIES.find(c => c.code === code);
  return country ? country.flag : '🏳️';
};

// API functions
export const getProfile = async (): Promise<Profile> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Try comprehensive profile first, fallback to basic profile
    let response = await fetch('/api/v1/profiles/me/comprehensive', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Fallback to basic profile
      response = await fetch('/api/v1/profiles/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const profileData = await response.json();
    
    // Transform backend data to frontend Profile format
    return {
      id: profileData.id?.toString() || '1',
      username: profileData.username || '',
      displayName: profileData.displayName || `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),
      firstName: profileData.firstName || '',
      lastName: profileData.lastName || '',
      email: profileData.email || '',
      phone: profileData.phone || '',
      avatarUrl: profileData.avatarUrl || '',
      bio: profileData.bio || '',
      gender: profileData.gender?.toLowerCase() as any || undefined,
      nationality: profileData.nationality || '',
      rank: profileData.rank?.toLowerCase() as any || 'Learner',
      xp: profileData.xp || 0,
      level: profileData.level || 1,
      isEmailVerified: profileData.isEmailVerified || false,
      isPhoneVerified: profileData.isPhoneVerified || false,
      preferredSports: profileData.preferredSports || [],
      stats: profileData.stats ? {
        totalGames: profileData.stats.totalGames || 0,
        totalWins: profileData.stats.totalWins || 0,
        winRate: profileData.stats.winRate || 0,
        currentStreak: profileData.stats.currentStreak || 0,
        longestStreak: profileData.stats.longestStreak || 0,
        fairPlayScore: profileData.stats.fairPlayScore || 0,
        mostPlayedSport: profileData.stats.mostPlayedSport || '',
        recentWeeklyAttendance: profileData.stats.recentWeeklyAttendance || [],
        sportAppearances: profileData.stats.sportAppearances || {}
      } : {
        totalGames: 0,
        totalWins: 0,
        winRate: 0,
        currentStreak: 0,
        longestStreak: 0,
        fairPlayScore: 0,
        mostPlayedSport: '',
        recentWeeklyAttendance: [],
        sportAppearances: {}
      },
      badges: profileData.badges || [],
      teams: profileData.teams || [],
      sports: profileData.sports || [],
      privacy: profileData.privacy || {
        showPublicly: true,
        publicFields: ['bio', 'stats', 'badges'],
        privateFields: ['email', 'phone']
      },
      security: profileData.security || {
        has2FA: false,
        activeSessions: [],
        lastPasswordChange: '2024-01-01'
      }
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    // Return mock data as fallback
    return {
      id: '1',
      username: 'player123',
      displayName: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+977-9841234567',
      avatarUrl: undefined,
      bio: 'Passionate about pickup sports!',
      gender: 'male',
      nationality: 'NP',
      rank: 'Competent',
      xp: 150,
      level: 2,
      isEmailVerified: true,
      isPhoneVerified: false,
      preferredSports: ['Futsal', 'Basketball'],
      stats: {
        totalGames: 45,
        totalWins: 28,
        winRate: 62.2,
        currentStreak: 5,
        longestStreak: 12,
        fairPlayScore: 4.8,
        mostPlayedSport: 'Futsal',
        recentWeeklyAttendance: [3, 2, 4, 1, 3, 2, 4],
        sportAppearances: {
          'Futsal': 25,
          'Basketball': 15,
          'Volleyball': 5
        }
      },
      badges: [],
      teams: [],
      sports: [],
      privacy: {
        showPublicly: true,
        publicFields: ['avatar', 'displayName', 'username', 'rank', 'preferredSports'],
        privateFields: ['email', 'phone']
      },
      security: {
        has2FA: false,
        activeSessions: [],
        lastPasswordChange: '2024-01-01'
      }
    };
  }
};

export const updateProfile = async (patch: Partial<Profile>): Promise<Profile> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Transform frontend Profile to backend format
    const backendPatch = {
      firstName: patch.firstName,
      lastName: patch.lastName,
      email: patch.email,
      displayName: patch.displayName,
      bio: patch.bio,
      avatarUrl: patch.avatarUrl,
      location: patch.location,
      skillLevel: patch.skillLevel,
      age: patch.age,
      position: patch.position,
      contactPreference: patch.contactPreference,
      phone: patch.phone,
      gender: patch.gender?.toUpperCase(),
      nationality: patch.nationality?.toUpperCase(),
      xp: patch.xp,
      level: patch.level,
      rank: patch.rank?.toUpperCase(),
      preferredSports: patch.preferredSports ? JSON.stringify(patch.preferredSports) : undefined,
      privacySettings: patch.privacy ? JSON.stringify(patch.privacy) : undefined,
      securitySettings: patch.security ? JSON.stringify(patch.security) : undefined
    };

    const response = await fetch('/api/v1/profiles/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(backendPatch),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const updatedProfile = await response.json();
    
    // Transform backend response to frontend Profile format
    return {
      id: updatedProfile.id?.toString() || patch.id || '1',
      username: updatedProfile.username || patch.username || '',
      displayName: updatedProfile.displayName || patch.displayName || '',
      firstName: updatedProfile.firstName || patch.firstName || '',
      lastName: updatedProfile.lastName || patch.lastName || '',
      email: updatedProfile.email || patch.email || '',
      phone: updatedProfile.phone || patch.phone || '',
      avatarUrl: updatedProfile.avatarUrl || patch.avatarUrl || '',
      bio: updatedProfile.bio || patch.bio || '',
      gender: updatedProfile.gender?.toLowerCase() as any || patch.gender,
      nationality: updatedProfile.nationality || patch.nationality || '',
      rank: updatedProfile.rank?.toLowerCase() as any || patch.rank || 'Learner',
      xp: updatedProfile.xp || patch.xp || 0,
      level: updatedProfile.level || patch.level || 1,
      isEmailVerified: updatedProfile.isEmailVerified || patch.isEmailVerified || false,
      isPhoneVerified: updatedProfile.isPhoneVerified || patch.isPhoneVerified || false,
      preferredSports: updatedProfile.preferredSports ? JSON.parse(updatedProfile.preferredSports) : patch.preferredSports || [],
      stats: patch.stats || {
        totalGames: 0,
        totalWins: 0,
        winRate: 0,
        currentStreak: 0,
        longestStreak: 0,
        fairPlayScore: 0,
        mostPlayedSport: '',
        recentWeeklyAttendance: [],
        sportAppearances: {}
      },
      badges: patch.badges || [],
      teams: patch.teams || [],
      sports: patch.sports || [],
      privacy: updatedProfile.privacySettings ? JSON.parse(updatedProfile.privacySettings) : patch.privacy || {
        showPublicly: true,
        publicFields: ['bio', 'stats', 'badges'],
        privateFields: ['email', 'phone']
      },
      security: updatedProfile.securitySettings ? JSON.parse(updatedProfile.securitySettings) : patch.security || {
        has2FA: false,
        activeSessions: [],
        lastPasswordChange: '2024-01-01'
      }
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const getStats = async () => {
  // Mock implementation
  return {
    totalGames: 45,
    totalWins: 28,
    winRate: 62.2,
    currentStreak: 5,
    longestStreak: 12,
    fairPlayScore: 4.8
  };
};

export const getBadges = async () => {
  // Mock implementation
  return [];
};

export const getNextUnlock = async () => {
  // Mock implementation
  return {
    label: 'Next Level',
    xpRemaining: 50
  };
};

export const getInviteQr = async () => {
  // Mock implementation
  return {
    pngDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  };
};
