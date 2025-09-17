import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Modal } from '@components/ui';
import { 
  User, 
  Edit3, 
  Share2, 
  QrCode, 
  Copy, 
  Settings, 
  Shield, 
  Trophy, 
  Users, 
  Activity, 
  BarChart3, 
  Award,
  Gamepad2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Star,
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
  Target,
  Zap,
  Heart,
  MessageCircle,
  ThumbsUp,
  Download,
  Share,
  Plus,
  Minus,
  X,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Crown,
  Medal,
  Flame,
  Sword,
  Shield as ShieldIcon,
  Star as StarIcon
} from 'lucide-react';
import { useAppState } from '@context/AppStateContext';
import { useAuth } from '@hooks/useAuth';
import { apiClient } from '@lib/apiClient';
import { toast } from 'react-toastify';
import OverviewTab from './profile/OverviewTab';
import ActivityTab from './profile/ActivityTab';
import StatsTab from './profile/StatsTab';
import BadgesTab from './profile/BadgesTab';
import TeamsTab from './profile/TeamsTab';
import SportsTab from './profile/SportsTab';
import SecurityTab from './profile/SecurityTab';

// Types
interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
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

interface Badge {
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

interface Team {
  id: string;
  name: string;
  sport: string;
  role: 'captain' | 'player' | 'coach';
  joinedAt: string;
  roster: TeamMember[];
  isActive: boolean;
}

interface TeamMember {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  role: 'captain' | 'player' | 'coach';
  joinedAt: string;
}

interface SportProfile {
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

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

interface ActivityEvent {
  id: string;
  type: 'join' | 'rsvp' | 'rating' | 'badge' | 'team_join' | 'sport_add';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  xpGained?: number;
  metadata?: Record<string, any>;
}

// XP and Level Configuration
const LEVEL_CONFIG = {
  Learner: { min: 0, max: 100, color: 'text-green-500' },
  Competent: { min: 100, max: 250, color: 'text-blue-500' },
  Advanced: { min: 250, max: 500, color: 'text-purple-500' },
  Pro: { min: 500, max: 1000, color: 'text-yellow-500' }
};

const XP_REWARDS = {
  ADD_FIRST_SPORT: 15,
  COMPLETE_SPORT_PROFILE: 20,
  UPDATE_AVAILABILITY: 5,
  UPLOAD_PHOTO: 10,
  UNLOCK_BADGE: 25,
  ON_TIME_RSVP: 5
};

// Nepal Cultural Greeting Component
const NepalCulturalGreeting: React.FC<{ name: string; xp: number }> = ({ name, xp }) => {
  return (
    <div className="text-center space-y-3 animate-fadeIn">
      {/* Unique Nepal Flag-inspired Visual */}
      <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
        {/* Nepal Flag Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#DC143C] via-[#DC143C] to-[#003893] rounded-lg rotate-45 transform">
          <div className="absolute inset-2 bg-gradient-to-tr from-white/20 to-transparent rounded-sm"></div>
        </div>
        
        {/* Mountain Peaks */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="text-white text-xl font-bold drop-shadow-lg">🏔️</div>
        </div>
        
        {/* Sparkle Effect */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
      </div>
      
      {/* Static Greeting */}
      <div className="text-lg font-semibold text-[var(--text-primary)]">
        Namaste, {name}!
      </div>
      <div className="text-sm text-[var(--text-muted)] font-medium" style={{fontFamily: 'Noto Sans Devanagari'}}>
        नमस्कार • Sports Warrior
      </div>
      <div className="text-sm text-[var(--brand-primary)] font-medium flex items-center justify-center gap-2">
        <span className="inline-block animate-pulse">🎮</span>
        Ready for Action!
        <span className="inline-block animate-pulse">⚡</span>
      </div>
    </div>
  );
};

// Animated XP Counter
const AnimatedXPCounter: React.FC<{ currentXP: number; targetXP: number; level: number }> = ({ currentXP, targetXP, level }) => {
  const [displayXP, setDisplayXP] = useState(currentXP);
  const progress = ((currentXP - (level * 100)) / 100) * 100;

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepValue = (targetXP - currentXP) / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setDisplayXP(currentXP + (stepValue * currentStep));
      
      if (currentStep >= steps) {
        clearInterval(interval);
        setDisplayXP(targetXP);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [currentXP, targetXP]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          ⚡ XP Progress
          <span className="animate-pulse">🎯</span>
        </span>
        <span className="text-sm text-[var(--text-muted)] font-mono">
          {Math.round(displayXP)} XP
        </span>
      </div>
      
      {/* Animated Progress Bar */}
      <div className="relative w-full bg-[var(--bg-muted)] rounded-full h-4 overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--brand-primary)] via-[var(--brand-secondary)] to-[var(--brand-primary)] transition-all duration-1000 ease-out animate-shimmer"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">
          Level {level}
        </div>
        
        {/* Sparkle effects */}
        <div className="absolute top-1 right-2 w-1 h-1 bg-white rounded-full animate-ping opacity-75" />
        <div className="absolute top-2 right-6 w-1 h-1 bg-white rounded-full animate-ping delay-300 opacity-50" />
      </div>
    </div>
  );
};

// Achievement Badges with Nepal Themes
const NepalAchievementBadge: React.FC<{ badge: Badge; isNew?: boolean }> = ({ badge, isNew }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getNepalIcon = (category: string, rarity: string) => {
    const nepalIcons = {
      achievement: ['🏔️', '🙏', '⚡', '🎯', '👑'],
      participation: ['🏃‍♂️', '🤝', '🎮', '⚽', '🏀'],
      social: ['👥', '🎉', '💪', '🌟', '🔥'],
      skill: ['🥇', '🏆', '⭐', '💎', '🚀']
    };
    
    const icons = nepalIcons[category as keyof typeof nepalIcons] || nepalIcons.achievement;
    const rarityIndex = ['common', 'rare', 'epic', 'legendary'].indexOf(rarity);
    return icons[rarityIndex] || icons[0];
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'shadow-green-400/50';
      case 'rare': return 'shadow-blue-400/50';
      case 'epic': return 'shadow-purple-400/50'; 
      case 'legendary': return 'shadow-yellow-400/50';
      default: return 'shadow-gray-400/50';
    }
  };

  return (
    <div 
      className={`relative group cursor-pointer transition-all duration-300 ${
        isHovered ? 'scale-110' : 'scale-100'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-[var(--brand-primary)]/20 to-[var(--brand-secondary)]/20 border-2 border-[var(--brand-primary)]/30 flex items-center justify-center text-2xl shadow-lg ${getRarityGlow(badge.rarity)} transition-all duration-300`}>
        {getNepalIcon(badge.category, badge.rarity)}
      </div>
      
      {isNew && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce font-bold">
          !
        </div>
      )}
      
      {isHovered && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-10 animate-fadeIn">
          <div className="font-semibold">{badge.name}</div>
          <div className="text-gray-300">{badge.description}</div>
        </div>
      )}
    </div>
  );
};

// Import the new interactive profile picture
import InteractiveProfilePicture from '@components/profile/InteractiveProfilePicture';

// Profile Header Card Component  
const ProfileHeaderCard: React.FC<{
  profile: UserProfile;
  onEditProfile: () => void;
  onShareProfile: () => void;
  onShowQR: () => void;
  onCopyInvite: () => void;
  onAvatarUpdate: (newAvatar: string) => void;
}> = ({ profile, onEditProfile, onShareProfile, onShowQR, onCopyInvite, onAvatarUpdate }) => {
  const currentLevel = LEVEL_CONFIG[profile.rank];
  const progress = ((profile.xp - currentLevel.min) / (currentLevel.max - currentLevel.min)) * 100;

  return (
    <Card className="p-6 bg-gradient-to-br from-[var(--brand-primary)]/5 via-transparent to-[var(--brand-secondary)]/5 border-[var(--brand-primary)]/20 relative overflow-hidden animate-fadeIn">
      {/* Nepal Flag Pattern Background */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 animate-prayerFlag">
        <div className="w-full h-1/2 bg-[var(--brand-primary)]"></div>
        <div className="w-full h-1/2 bg-[var(--brand-secondary)]"></div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Interactive Avatar and Basic Info */}
        <div className="flex flex-col items-center md:items-start">
          {/* Nepal Cultural Greeting */}
          <NepalCulturalGreeting name={profile.displayName.split(' ')[0]} xp={profile.xp} />
          
          <div className="mt-4">
            <InteractiveProfilePicture
              currentAvatar={profile.avatarUrl}
              displayName={profile.displayName}
              onAvatarUpdate={onAvatarUpdate}
              xp={profile.xp}
              level={profile.level}
            />
          </div>
          
          <div className="text-center md:text-left mt-4">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {profile.displayName}
            </h1>
            <p className="text-[var(--text-muted)]">@{profile.username}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default">
                {profile.rank}
              </Badge>
              <span className="text-sm text-[var(--text-muted)]">
                Level {profile.level}
              </span>
            </div>
          </div>
        </div>

        {/* XP Progress and Actions */}
        <div className="flex-1 space-y-4">
          {/* XP Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-[var(--text-primary)]">XP Progress</span>
              <span className="text-sm text-[var(--text-muted)]">
                {profile.xp} / {currentLevel.max} XP
              </span>
            </div>
            <div className="w-full bg-[var(--bg-muted)] rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
              <span>{currentLevel.min} XP</span>
              <span>{currentLevel.max} XP</span>
            </div>
          </div>

          {/* Animated Greeting */}
          <div className="text-lg font-medium text-[var(--text-primary)]">
            <span className="inline-block animate-pulse">🎮</span> Game face on, {profile.displayName.split(' ')[0]}!
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={onEditProfile}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </Button>
            <Button
              onClick={onShareProfile}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button
              onClick={onShowQR}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              QR Code
            </Button>
            <Button
              onClick={onCopyInvite}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Invite
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Profile Progress Component
const ProfileProgress: React.FC<{
  profile: UserProfile;
  onTaskComplete: (task: string, xpGained: number) => void;
}> = ({ profile, onTaskComplete }) => {
  const tasks = [
    { id: 'photo', label: 'Add photo', completed: !!profile.avatarUrl, xp: XP_REWARDS.UPLOAD_PHOTO },
    { id: 'email', label: 'Verify email', completed: profile.isEmailVerified, xp: 0 },
    { id: 'bio', label: 'Write bio', completed: !!profile.bio, xp: 0 },
    { id: 'sport', label: 'Pick preferred sport', completed: profile.preferredSports.length > 0, xp: XP_REWARDS.ADD_FIRST_SPORT }
  ];

  const completedTasks = tasks.filter(task => task.completed).length;
  const progress = (completedTasks / tasks.length) * 100;

  const handleTaskClick = (task: typeof tasks[0]) => {
    if (!task.completed && task.xp > 0) {
      onTaskComplete(task.id, task.xp);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Profile Progress</h3>
        <span className="text-sm text-[var(--text-muted)]">
          {completedTasks}/{tasks.length} completed
        </span>
      </div>
      
      <div className="space-y-3">
        <div className="w-full bg-[var(--bg-muted)] rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => handleTaskClick(task)}
              className={`flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                task.completed 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--bg-contrast)]'
              }`}
            >
              {task.completed ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-[var(--border)]" />
              )}
              <span className="text-sm">{task.label}</span>
              {task.xp > 0 && (
                <span className="text-xs text-[var(--brand-primary)] ml-auto">
                  +{task.xp} XP
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};

// Privacy Preview Component
const PrivacyPreview: React.FC<{
  profile: UserProfile;
  onTogglePrivacy: (field: string) => void;
}> = ({ profile, onTogglePrivacy }) => {
  const publicFields = [
    { key: 'avatar', label: 'Avatar', icon: User },
    { key: 'displayName', label: 'Display Name', icon: User },
    { key: 'username', label: '@Username', icon: User },
    { key: 'rank', label: 'Rank', icon: Trophy },
    { key: 'preferredSports', label: 'Preferred Sports', icon: Gamepad2 }
  ];

  const privateFields = [
    { key: 'email', label: 'Email', icon: Lock },
    { key: 'phone', label: 'Phone', icon: Lock }
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Privacy Settings</h3>
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[var(--text-muted)]" />
          <span className="text-sm text-[var(--text-muted)]">Show publicly</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">Public Information</h4>
          <div className="space-y-2">
            {publicFields.map((field) => (
              <div key={field.key} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <field.icon className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">{field.label}</span>
                </div>
                <Eye className="w-4 h-4 text-green-600" />
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">Private Information</h4>
          <div className="space-y-2">
            {privateFields.map((field) => (
              <div key={field.key} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <field.icon className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700">{field.label}</span>
                </div>
                <EyeOff className="w-4 h-4 text-red-600" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Main ProfilePage Component
export default function ProfilePage() {
  const { profile: contextProfile } = useAppState();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [xpAnimation, setXpAnimation] = useState<{ show: boolean; amount: number }>({ show: false, amount: 0 });

  // Mock profile data - replace with real API calls
  const mockProfile: UserProfile = {
    id: String(user?.id || '1'),
    username: user?.username || 'player123',
    displayName: user?.firstName ? `${user.firstName} ${user?.lastName || ''}`.trim() : 'John Doe',
    email: user?.email || 'john@example.com',
    phone: '+977-9841234567',
    avatarUrl: user?.avatarUrl,
    bio: 'Passionate about pickup sports and building community through games!',
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
    badges: [
      { id: '1', name: 'First Game', description: 'Played your first game', icon: '🎮', category: 'achievement', rarity: 'common', earnedAt: '2024-01-15' },
      { id: '2', name: 'Team Player', description: 'Joined 5 teams', icon: '👥', category: 'social', rarity: 'rare', earnedAt: '2024-02-20' },
      { id: '3', name: 'Fair Play', description: 'Maintained 4.5+ rating for 10 games', icon: '🤝', category: 'achievement', rarity: 'epic', earnedAt: '2024-03-10' }
    ],
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

  // Load profile data - Optimized for instant loading
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Load cached profile data immediately for instant display
        const cachedProfile = localStorage.getItem('userProfile');
        if (cachedProfile) {
          try {
            const parsed = JSON.parse(cachedProfile);
            setProfile(parsed);
            setLoading(false); // Show data immediately
          } catch (e) {
            console.warn('Failed to parse cached profile');
          }
        }

        // If no cache, use mock data immediately
        if (!cachedProfile) {
          setProfile(mockProfile);
          setLoading(false);
          localStorage.setItem('userProfile', JSON.stringify(mockProfile));
        }

        // Background API sync with timeout - don't block UI
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
        
        try {
          // This would be the real API call when backend is ready
          // const response = await apiClient.get('/profiles/me', {
          //   signal: controller.signal
          // });
          // clearTimeout(timeoutId);
          // setProfile(response.data);
          // localStorage.setItem('userProfile', JSON.stringify(response.data));
        } catch (apiError: any) {
          clearTimeout(timeoutId);
          if (apiError.name !== 'AbortError') {
            console.warn('Profile API call failed, using cached/mock data');
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setProfile(mockProfile);
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Handle XP animation
  const handleTaskComplete = useCallback((task: string, xpGained: number) => {
    setXpAnimation({ show: true, amount: xpGained });
    toast.success(`+${xpGained} XP gained!`);
    
    // Update profile XP
    setProfile(prev => prev ? {
      ...prev,
      xp: prev.xp + xpGained
    } : null);
    
    // Hide animation after 3 seconds
    setTimeout(() => {
      setXpAnimation({ show: false, amount: 0 });
    }, 3000);
  }, []);

  // Handle profile actions
  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleShareProfile = () => {
    navigator.share?.({
      title: `${profile?.displayName}'s Profile`,
      text: `Check out ${profile?.displayName}'s pickup sports profile!`,
      url: window.location.href
    }).catch(() => {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Profile link copied to clipboard!');
    });
  };

  const handleShowQR = () => {
    setShowQRModal(true);
  };

  const handleCopyInvite = () => {
    const inviteCode = `PS-${profile?.username}-${Date.now()}`;
    navigator.clipboard.writeText(inviteCode);
    toast.success('Invite code copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="p-6 animate-pulse">
          <div className="flex gap-6">
            <div className="w-24 h-24 bg-[var(--bg-muted)] rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-[var(--bg-muted)] rounded w-1/3"></div>
              <div className="h-4 bg-[var(--bg-muted)] rounded w-1/4"></div>
              <div className="h-3 bg-[var(--bg-muted)] rounded w-1/2"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="p-8 text-center">
        <User className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Profile Not Found</h3>
        <p className="text-[var(--text-muted)]">Unable to load your profile information.</p>
      </Card>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'sports', label: 'Sports', icon: Gamepad2 },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--brand-primary)] rounded-full blur-3xl transform -translate-x-32 -translate-y-32"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-[var(--brand-secondary)] rounded-full blur-3xl transform translate-x-32"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-400 rounded-full blur-3xl transform translate-y-32"></div>
      </div>

      <div className="relative z-10 space-y-8 p-4 max-w-7xl mx-auto">
        {/* XP Animation - Enhanced */}
        {xpAnimation.show && (
          <div className="fixed top-20 right-4 z-50 animate-bounce">
            <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 transform animate-pulse">
              <Sparkles className="w-5 h-5 animate-spin" />
              <span className="font-bold text-lg">+{xpAnimation.amount} XP</span>
              <div className="absolute inset-0 bg-white/20 rounded-xl animate-ping"></div>
            </div>
          </div>
        )}

        {/* Enhanced Profile Header */}
        <div className="transform transition-all duration-500 hover:scale-[1.02] animate-fadeIn">
          <ProfileHeaderCard
            profile={profile}
            onEditProfile={handleEditProfile}
            onShareProfile={handleShareProfile}
            onShowQR={handleShowQR}
            onCopyInvite={handleCopyInvite}
            onAvatarUpdate={(newAvatar: string) => {
              setProfile(prev => prev ? { ...prev, avatarUrl: newAvatar } : null);
              toast.success('Profile picture updated!');
            }}
          />
        </div>

        {/* Enhanced Tabbed Sections */}
        <Card className="p-0 shadow-xl border-0 bg-white/80 backdrop-blur-sm transform transition-all duration-500 animate-fadeInUp">
          {/* Enhanced Tab Navigation */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50">
            <div className="flex overflow-x-auto px-2">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-3 transition-all duration-300 transform hover:scale-105 ${
                    activeTab === tab.id
                      ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--brand-primary)]/5 shadow-sm'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 hover:bg-gray-50/50'
                  }`}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="hidden sm:inline font-semibold">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="w-2 h-2 bg-[var(--brand-primary)] rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Progress and Stats Cards - Now below tabs */}
          <div className="p-6 bg-gradient-to-br from-white via-gray-50/30 to-white border-b border-gray-100">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/3 transform transition-all duration-500 hover:scale-105 animate-slideInLeft">
                <ProfileProgress
                  profile={profile}
                  onTaskComplete={handleTaskComplete}
                />
              </div>
              
              {/* Quick Stats Cards */}
              <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-4 animate-slideInRight">
                <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-700">{profile.stats.totalGames}</div>
                      <div className="text-sm text-green-600">Total Games</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-700">{profile.stats.fairPlayScore}</div>
                      <div className="text-sm text-blue-600">Fair Play Score</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                      <Flame className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-700">{profile.stats.currentStreak}</div>
                      <div className="text-sm text-orange-600">Current Streak</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Enhanced Tab Content */}
          <div className="p-8 bg-gradient-to-br from-white via-gray-50/30 to-white">
            <div className="animate-fadeIn">
              {activeTab === 'overview' && profile && (
                <div className="transform transition-all duration-500 animate-slideInUp">
                  <OverviewTab 
                    profile={profile} 
                    onProfileUpdate={(updates) => setProfile(prev => prev ? { ...prev, ...updates } : null)} 
                  />
                </div>
              )}
              
              {activeTab === 'activity' && profile && (
                <div className="transform transition-all duration-500 animate-slideInUp">
                  <ActivityTab profile={profile} />
                </div>
              )}
              
              {activeTab === 'stats' && profile && (
                <div className="transform transition-all duration-500 animate-slideInUp">
                  <StatsTab profile={profile} />
                </div>
              )}
              
              {activeTab === 'badges' && profile && (
                <div className="transform transition-all duration-500 animate-slideInUp">
                  <BadgesTab profile={profile} />
                </div>
              )}
              
              {activeTab === 'teams' && profile && (
                <div className="transform transition-all duration-500 animate-slideInUp">
                  <TeamsTab profile={profile} />
                </div>
              )}
              
              {activeTab === 'sports' && profile && (
                <div className="transform transition-all duration-500 animate-slideInUp">
                  <SportsTab 
                    profile={profile} 
                    onProfileUpdate={(updates) => setProfile(prev => prev ? { ...prev, ...updates } : null)} 
                  />
                </div>
              )}
              
              {activeTab === 'security' && profile && (
                <div className="transform transition-all duration-500 animate-slideInUp">
                  <SecurityTab profile={profile} />
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
