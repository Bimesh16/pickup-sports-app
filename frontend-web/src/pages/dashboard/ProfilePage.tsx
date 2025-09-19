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
import ProfileHeader from './profile/ProfileHeader';
import { Profile, updateProfile } from './profile/profile.schema';

// XP Configuration for different ranks
export const XP_CONFIG = {
  Learner: { min: 0, max: 100, color: 'text-blue-600' },
  Competent: { min: 100, max: 250, color: 'text-green-600' },
  Advanced: { min: 250, max: 500, color: 'text-purple-600' },
  Pro: { min: 500, max: 1000, color: 'text-yellow-600' }
};

// Use Profile type from schema
type UserProfile = Profile;

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
  
  // New editing state management
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);

  // Mock profile data - replace with real API calls
  const mockProfile: UserProfile = {
    id: String(user?.id || '1'),
    username: user?.username || 'player123',
    displayName: user?.firstName ? `${user.firstName} ${user?.lastName || ''}`.trim() : 'John Doe',
    firstName: user?.firstName || 'John',
    lastName: user?.lastName || 'Doe',
    email: user?.email || 'john@example.com',
    phone: '+977-9841234567',
    avatarUrl: user?.avatarUrl,
    bio: 'Passionate about pickup sports and building community through games!',
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

  // New editing handlers
  const toggleEdit = () => {
    setEditing(v => !v);
    if (!editing) {
      setDraft(profile || {});
    } else {
      setDraft({});
    }
  };

  const handleChange = (patch: Partial<Profile>) => {
    setDraft(d => ({ ...d, ...patch }));
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const updatedProfile = await updateProfile(draft);
      setProfile(updatedProfile);
      setEditing(false);
      setDraft({});
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setDraft({});
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
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'sports', label: 'Sports', icon: Gamepad2 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'stats', label: 'Stats', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-nepal-blue via-slate-900 to-nepal-crimson text-white relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-nepal-crimson rounded-full blur-3xl transform -translate-x-32 -translate-y-32 animate-pulse"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-nepal-blue rounded-full blur-3xl transform translate-x-32 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-white/20 rounded-full blur-3xl transform translate-y-32 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Enhanced Stadium-style grid overlay */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="relative z-10 space-y-8 p-4 max-w-7xl mx-auto">
        {/* Enhanced XP Animation */}
        {xpAnimation.show && (
          <div className="fixed top-20 right-4 z-50 animate-bounce">
            <div className="bg-gradient-to-r from-nepal-crimson via-yellow-500 to-nepal-blue text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 transform animate-pulse border-2 border-white/20">
              <Sparkles className="w-6 h-6 animate-spin text-yellow-300" />
              <span className="font-bold text-xl">+{xpAnimation.amount} XP</span>
              <Crown className="w-6 h-6 text-yellow-300 animate-bounce" />
              <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping"></div>
            </div>
          </div>
        )}

        {/* Enhanced Profile Header with better animations */}
        <div className="transform transition-all duration-700 hover:scale-[1.02] animate-fadeIn hover:shadow-2xl">
          <ProfileHeader
            profile={{ ...profile, ...draft }}
            editing={editing}
            onToggleEdit={toggleEdit}
            onChange={handleChange}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving}
          />
        </div>



        {/* Enhanced Tabbed Sections */}
        <Card className="p-0 shadow-2xl border-2 border-nepal-blue/30 bg-gradient-to-br from-surface-0 via-surface-1 to-surface-0 transform transition-all duration-500 animate-fadeInUp backdrop-blur-sm">
          {/* Enhanced Tab Navigation */}
          <div className="border-b-2 border-nepal-blue/30 bg-gradient-to-r from-surface-1/80 via-surface-0/80 to-surface-1/80 backdrop-blur-sm">
            <div className="flex overflow-x-auto px-4">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-8 py-5 text-sm font-medium whitespace-nowrap border-b-3 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-nepal-blue focus:ring-offset-2 ${
                    activeTab === tab.id
                      ? 'border-nepal-crimson text-nepal-crimson bg-nepal-crimson/20 shadow-lg'
                      : 'border-transparent text-text-muted hover:text-text-strong hover:border-nepal-blue/50 hover:bg-surface-1/50'
                  }`}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'bg-nepal-crimson/30 text-nepal-crimson' 
                      : 'bg-surface-1/50 text-text-muted group-hover:bg-nepal-blue/20'
                  }`}>
                    <tab.icon className="w-5 h-5" />
                  </div>
                  <span className="hidden sm:inline font-semibold">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="w-3 h-3 bg-nepal-crimson rounded-full animate-pulse shadow-lg"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Tab Content */}
          <div className="p-10 bg-gradient-to-br from-surface-1/50 via-surface-0/50 to-surface-1/50 backdrop-blur-sm">
            <div className="animate-fadeIn">
              {activeTab === 'overview' && profile && (
                <div className="transform transition-all duration-700 animate-slideInUp">
                  <OverviewTab 
                    profile={profile} 
                    onProfileUpdate={(updates) => setProfile(prev => prev ? { ...prev, ...updates } : null)} 
                  />
                </div>
              )}
              
              {activeTab === 'activity' && profile && (
                <div className="transform transition-all duration-700 animate-slideInUp">
                  <ActivityTab profile={profile} />
                </div>
              )}
              
              {activeTab === 'stats' && profile && (
                <div className="transform transition-all duration-700 animate-slideInUp">
                  <StatsTab profile={profile} />
                </div>
              )}
              
              {activeTab === 'badges' && profile && (
                <div className="transform transition-all duration-700 animate-slideInUp">
                  <BadgesTab profile={profile} />
                </div>
              )}
              
              {activeTab === 'teams' && profile && (
                <div className="transform transition-all duration-700 animate-slideInUp">
                  <TeamsTab profile={profile} />
                </div>
              )}
              
              {activeTab === 'sports' && profile && (
                <div className="transform transition-all duration-700 animate-slideInUp">
                  <SportsTab 
                    profile={profile} 
                    onProfileUpdate={(updates: Partial<Profile>) => setProfile(prev => prev ? { ...prev, ...updates } : null)} 
                  />
                </div>
              )}
              
              {activeTab === 'security' && profile && (
                <div className="transform transition-all duration-700 animate-slideInUp">
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
