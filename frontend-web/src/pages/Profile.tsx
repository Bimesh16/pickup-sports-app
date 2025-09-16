// src/pages/Profile.tsx - Comprehensive Sports Profile Management

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { Button, Input, Card, Avatar, Badge } from '@components/ui';
import { 
  Edit, Share, QrCode, Copy, Eye, EyeOff, 
  Trophy, Star, Calendar, Users, Target, 
  Settings, Shield, Activity, BarChart3,
  Plus, X, Check, Clock, MapPin, Phone,
  Mail, Instagram, Twitter, Facebook, Camera
} from 'lucide-react';

// Color tokens for WCAG AA compliance
const COLORS = {
  navy: '#1B263B',
  royal: '#003893', 
  crimson: '#E63946',
  white: '#FFFFFF',
  textDark: '#0E1116',
  textLight: '#E9EEF5',
  bodyLight: '#1F2937',
  bodyDark: '#E9EEF5',
  helperLight: '#6B7280',
  helperDark: '#C7D1E0',
  surface: 'rgba(255, 255, 255, 0.95)',
  surfaceDark: 'rgba(14, 17, 22, 0.95)'
};

// Sports data structure
interface SportProfile {
  code: string;
  name: string;
  icon: string;
  positions: string[];
  skill: number;
  style: string[];
  dominant: 'Left' | 'Right' | 'Both';
  intensity: 'Chill' | 'Competitive' | 'Tournament-ready';
  availability: Array<{day: string; slot: string}>;
  visibility: 'Public' | 'Teammates' | 'Private';
  notes?: string;
}

const SPORTS_DATA = {
  football: {
    name: 'Football (Soccer)',
    icon: '⚽',
    positions: ['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'Winger (LW/RW)', 'Striker']
  },
  futsal: {
    name: 'Futsal',
    icon: '🥅',
    positions: ['Goalkeeper', 'Fixo', 'Ala (Left/Right)', 'Pivô']
  },
  basketball: {
    name: 'Basketball',
    icon: '🏀',
    positions: ['PG', 'SG', 'SF', 'PF', 'C']
  },
  cricket: {
    name: 'Cricket',
    icon: '🏏',
    positions: ['Batter (Opener/Middle/Finisher)', 'Bowler (Pace/Spin)', 'All-rounder', 'Wicket-keeper']
  },
  volleyball: {
    name: 'Volleyball',
    icon: '🏐',
    positions: ['Setter', 'Opposite', 'Middle Blocker', 'Outside Hitter', 'Libero']
  },
  badminton: {
    name: 'Badminton',
    icon: '🏸',
    positions: ['Singles', 'Doubles (Left/Right court preference)']
  },
  tableTennis: {
    name: 'Table Tennis',
    icon: '🏓',
    positions: ['Singles', 'Doubles']
  },
  tennis: {
    name: 'Tennis',
    icon: '🎾',
    positions: ['Singles', 'Doubles']
  }
};

const SKILL_LABELS = ['Rookie', 'Developing', 'Solid', 'Advanced', 'Pro-Am'];

export function Profile() {
  const { user, logout, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [privacyMode, setPrivacyMode] = useState<'Public' | 'Teammates' | 'Private'>('Public');
  const [sportsProfiles, setSportsProfiles] = useState<SportProfile[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data for demonstration
  const mockStats = {
    appearances: 24,
    attendanceRate: 87,
    avgRating: 4.2,
    mvps: 3,
    fairPlay: 98
  };

  const mockHighlights = [
    { type: 'MVP', text: 'Scored hat-trick in championship final', date: '2024-01-15' },
    { type: 'Achievement', text: 'Reached 100 games milestone', date: '2024-01-10' },
    { type: 'Team', text: 'Joined Kathmandu United', date: '2024-01-05' }
  ];

  const mockNextMatch = {
    sport: 'Futsal',
    venue: 'Thamel Sports Complex',
    date: '2024-01-20',
    time: '6:00 PM',
    players: 8,
    maxPlayers: 10
  };

  useEffect(() => {
    // Load sports profiles from localStorage or API
    const saved = localStorage.getItem('sports_profiles');
    if (saved) {
      setSportsProfiles(JSON.parse(saved));
    }
  }, []);

  const saveSportsProfiles = (profiles: SportProfile[]) => {
    setSportsProfiles(profiles);
    localStorage.setItem('sports_profiles', JSON.stringify(profiles));
  };

  const addSportProfile = (sportCode: string) => {
    const sportData = SPORTS_DATA[sportCode as keyof typeof SPORTS_DATA];
    if (!sportData) return;

    const newProfile: SportProfile = {
      code: sportCode,
      name: sportData.name,
      icon: sportData.icon,
      positions: [],
      skill: 3,
      style: [],
      dominant: 'Right',
      intensity: 'Competitive',
      availability: [],
      visibility: 'Teammates',
      notes: ''
    };

    saveSportsProfiles([...sportsProfiles, newProfile]);
  };

  const updateSportProfile = (index: number, updates: Partial<SportProfile>) => {
    const updated = [...sportsProfiles];
    updated[index] = { ...updated[index], ...updates };
    saveSportsProfiles(updated);
  };

  const removeSportProfile = (index: number) => {
    const updated = sportsProfiles.filter((_, i) => i !== index);
    saveSportsProfiles(updated);
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/invite/${user?.username}`;
    navigator.clipboard.writeText(link);
    showToast('Invite link copied!');
  };

  const shareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user?.firstName}'s Sports Profile`,
        text: `Check out ${user?.firstName}'s sports profile on Pickup Sports Nepal!`,
        url: window.location.href
      });
    } else {
      copyInviteLink();
    }
  };

  const renderHeader = () => (
    <div className="relative">
      {/* Himalayan silhouette + stadium beams background */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          background: `
            linear-gradient(135deg, transparent 0%, rgba(27, 38, 59, 0.1) 50%, transparent 100%),
            repeating-linear-gradient(90deg, transparent 0%, rgba(0, 56, 147, 0.05) 50%, transparent 100%)
          `
        }}
      />
      
      {/* Scrim for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/28 via-transparent to-transparent h-[700px]" />
      
      <div className="relative z-10 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            {/* Logo and App Name */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-crimson to-royal rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">⚽</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white font-nepali">खेल मिलन</h1>
                <p className="text-white/80 text-sm font-english">Pickup Sports Nepal</p>
              </div>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white text-sm font-nepali">नमस्ते, {user?.firstName}</p>
                <p className="text-white/80 text-xs font-english">@{user?.username}</p>
              </div>
              <Avatar src={user?.avatarUrl} size="lg" />
              
              {/* Action Rail */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-english"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareProfile}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-english"
                >
                  <Share className="w-4 h-4 mr-1" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQR(true)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-english"
                >
                  <QrCode className="w-4 h-4 mr-1" />
                  QR
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyInviteLink}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-english"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>

              {/* Privacy Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-white/80 text-sm font-english">Privacy:</span>
                <select
                  value={privacyMode}
                  onChange={(e) => setPrivacyMode(e.target.value as any)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm font-english"
                >
                  <option value="Public" className="bg-navy text-white">Public</option>
                  <option value="Teammates" className="bg-navy text-white">Teammates</option>
                  <option value="Private" className="bg-navy text-white">Private</option>
                </select>
              </div>

              <Button
                variant="danger"
                size="sm"
                onClick={logout}
                className="bg-crimson hover:bg-crimson/90 text-white font-english"
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Player Stats Row */}
          <div className="flex items-center space-x-6 mb-6">
            <div className="flex items-center space-x-2">
              <Badge className="bg-royal text-white font-english">Level 3</Badge>
              <Badge className="bg-crimson text-white font-english">Jersey #7</Badge>
            </div>
            <div className="flex items-center space-x-4 text-white/80">
              <div className="flex items-center space-x-1">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-english">{mockStats.mvps} MVPs</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span className="text-sm font-english">{mockStats.avgRating}/5.0</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span className="text-sm font-english">{mockStats.appearances} games</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'activity', label: 'Activity', icon: Activity },
            { id: 'stats', label: 'Stats', icon: BarChart3 },
            { id: 'badges', label: 'Badges', icon: Trophy },
            { id: 'teams', label: 'Teams', icon: Users },
            { id: 'sports', label: 'Sports Profile', icon: Target },
            { id: 'security', label: 'Security', icon: Shield }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-all font-english ${
                activeTab === id
                  ? 'border-crimson text-crimson'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Next Match Card */}
      <Card className="bg-white/95 backdrop-blur-md border-0 shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 font-english">Next Match</h3>
            <Badge className="bg-green-100 text-green-800 font-english">Confirmed</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1 font-english">Sport & Venue</p>
              <p className="font-medium text-gray-900 font-english">{mockNextMatch.sport} at {mockNextMatch.venue}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1 font-english">Date & Time</p>
              <p className="font-medium text-gray-900 font-english">{mockNextMatch.date} at {mockNextMatch.time}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1 font-english">Players</p>
              <p className="font-medium text-gray-900 font-english">{mockNextMatch.players}/{mockNextMatch.maxPlayers} joined</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" className="bg-crimson hover:bg-crimson/90 text-white font-english">
                View Details
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Appearances', value: mockStats.appearances, icon: Calendar, color: 'bg-blue-500' },
          { label: 'Attendance Rate', value: `${mockStats.attendanceRate}%`, icon: Target, color: 'bg-green-500' },
          { label: 'Avg Rating', value: mockStats.avgRating, icon: Star, color: 'bg-yellow-500' },
          { label: 'MVPs (12m)', value: mockStats.mvps, icon: Trophy, color: 'bg-purple-500' },
          { label: 'Fair Play', value: `${mockStats.fairPlay}%`, icon: Shield, color: 'bg-indigo-500' }
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="bg-white/95 backdrop-blur-md border-0 shadow-lg">
            <div className="p-4 text-center">
              <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 font-english">{value}</p>
              <p className="text-sm text-gray-600 font-english">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Highlights */}
      <Card className="bg-white/95 backdrop-blur-md border-0 shadow-lg">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 font-english">Recent Highlights</h3>
          <div className="space-y-3">
            {mockHighlights.map((highlight, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-crimson rounded-full flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 font-english">{highlight.text}</p>
                  <p className="text-sm text-gray-600 font-english">{highlight.date}</p>
                </div>
                <Badge className="bg-crimson/10 text-crimson font-english">{highlight.type}</Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSportsProfile = () => (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 font-english">Sports Profile</h2>
        <p className="text-gray-600 font-english">Tell us how you play so we can recommend better games.</p>
      </div>

      {/* Sports Multi-Select */}
      <Card className="bg-white/95 backdrop-blur-md border-0 shadow-lg">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 font-english">Pick all the sports you're into.</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(SPORTS_DATA).map(([code, sport]) => {
              const isSelected = sportsProfiles.some(p => p.code === code);
              return (
                <button
                  key={code}
                  onClick={() => isSelected ? removeSportProfile(sportsProfiles.findIndex(p => p.code === code)) : addSportProfile(code)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all font-english ${
                    isSelected
                      ? 'border-crimson bg-crimson/10 text-crimson'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{sport.icon}</span>
                  <span className="font-medium">{sport.name}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Per-Sport Cards */}
      {sportsProfiles.map((profile, index) => (
        <Card key={index} className="bg-white/95 backdrop-blur-md border-0 shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{profile.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900 font-english">{profile.name}</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeSportProfile(index)}
                className="text-red-600 hover:text-red-700 font-english"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Positions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-english">
                  Choose positions you enjoy most (select many)
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPORTS_DATA[profile.code as keyof typeof SPORTS_DATA]?.positions.map((position) => (
                    <button
                      key={position}
                      onClick={() => {
                        const positions = profile.positions.includes(position)
                          ? profile.positions.filter(p => p !== position)
                          : [...profile.positions, position];
                        updateSportProfile(index, { positions });
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-all font-english ${
                        profile.positions.includes(position)
                          ? 'bg-crimson text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {position}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skill Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-english">
                  Rate yourself honestly—this helps us match you well.
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => updateSportProfile(index, { skill: level })}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all font-english ${
                        profile.skill >= level
                          ? 'bg-crimson text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600 font-english">{SKILL_LABELS[profile.skill - 1]}</span>
                </div>
              </div>

              {/* Dominant Hand/Foot */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-english">Dominant hand/foot</label>
                <div className="flex space-x-2">
                  {['Left', 'Right', 'Both'].map((option) => (
                    <button
                      key={option}
                      onClick={() => updateSportProfile(index, { dominant: option as any })}
                      className={`px-3 py-1 rounded-lg text-sm transition-all font-english ${
                        profile.dominant === option
                          ? 'bg-crimson text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-english">Intensity preference</label>
                <div className="flex space-x-2">
                  {['Chill', 'Competitive', 'Tournament-ready'].map((option) => (
                    <button
                      key={option}
                      onClick={() => updateSportProfile(index, { intensity: option as any })}
                      className={`px-3 py-1 rounded-lg text-sm transition-all font-english ${
                        profile.intensity === option
                          ? 'bg-crimson text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-english">Visibility</label>
                <select
                  value={profile.visibility}
                  onChange={(e) => updateSportProfile(index, { visibility: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent font-english"
                >
                  <option value="Public">Public</option>
                  <option value="Teammates">Teammates</option>
                  <option value="Private">Private</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-english">Notes (optional)</label>
                <textarea
                  value={profile.notes || ''}
                  onChange={(e) => updateSportProfile(index, { notes: e.target.value })}
                  placeholder="Any injuries, preferences, or notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent font-english"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Progress Indicator */}
      {sportsProfiles.length > 0 && (
        <div className="text-center">
          <Badge className="bg-green-100 text-green-800 font-english">
            {sportsProfiles.length} of {Object.keys(SPORTS_DATA).length} sports configured
          </Badge>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'sports':
        return renderSportsProfile();
      default:
        return (
          <div className="max-w-6xl mx-auto px-6 py-8">
            <Card className="bg-white/95 backdrop-blur-md border-0 shadow-lg">
              <div className="p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 font-english">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
                <p className="text-gray-600 font-english">This section is coming soon!</p>
              </div>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #1B263B 0%, #003893 50%, #E63946 100%)' }}>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg font-english">
          {toast}
        </div>
      )}
      
      {renderHeader()}
      {renderTabs()}
      {renderContent()}
    </div>
  );
}