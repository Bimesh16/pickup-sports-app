import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Switch } from '@components/ui';
import { 
  Gamepad2, 
  Plus, 
  Edit, 
  Save, 
  Trash2, 
  Target, 
  Star, 
  Clock, 
  Calendar,
  Eye,
  EyeOff,
  Zap,
  Shield,
  Heart,
  Sword,
  Trophy,
  Users,
  MapPin,
  Settings,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '@lib/apiClient';
import { toast } from 'react-toastify';

interface SportsTabProps {
  profile: {
    id: string;
    preferredSports: string[];
  };
  onProfileUpdate: (updates: any) => void;
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

interface SportOption {
  id: string;
  name: string;
  icon: string;
  positions: string[];
  styleTags: string[];
  hasHandedness: boolean;
  hasFootedness: boolean;
}

const AVAILABLE_SPORTS: SportOption[] = [
  {
    id: 'futsal',
    name: 'Futsal ⚽',
    icon: '⚽',
    positions: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Winger'],
    styleTags: ['Sherpa Strong', 'Technical', 'Lightning Fast', 'Creative', 'Defensive', 'Playmaker'],
    hasHandedness: false,
    hasFootedness: true
  },
  {
    id: 'cricket',
    name: 'Cricket 🏏',
    icon: '🏏',
    positions: ['Batsman', 'Bowler', 'All-rounder', 'Wicket Keeper', 'Captain'],
    styleTags: ['Aggressive', 'Technical', 'Spinner', 'Fast Bowler', 'Finisher', 'Anchor'],
    hasHandedness: true,
    hasFootedness: false
  },
  {
    id: 'basketball',
    name: 'Basketball 🏀',
    icon: '🏀',
    positions: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
    styleTags: ['Everest Shooter', 'Playmaker', 'Defender', 'Rebounder', 'Fast Break', 'Post Player'],
    hasHandedness: true,
    hasFootedness: false
  },
  {
    id: 'volleyball',
    name: 'Volleyball 🏐',
    icon: '🏐',
    positions: ['Setter', 'Outside Hitter', 'Middle Blocker', 'Opposite Hitter', 'Libero'],
    styleTags: ['Mountain Power', 'Technical', 'Quick Strike', 'Strategic', 'Defensive', 'Attacking'],
    hasHandedness: true,
    hasFootedness: false
  },
  {
    id: 'badminton',
    name: 'Badminton 🏸',
    icon: '🏸',
    positions: ['Singles Player', 'Doubles Player'],
    styleTags: ['Tiger Aggressive', 'Defensive', 'Technical', 'Swift', 'Strategic', 'Power Smash'],
    hasHandedness: true,
    hasFootedness: false
  },
  {
    id: 'tennis',
    name: 'Tennis 🎾',
    icon: '🎾',
    positions: ['Singles Player', 'Doubles Player'],
    styleTags: ['Gurkha Aggressive', 'Defensive', 'Technical', 'Powerful', 'Strategic', 'Consistent'],
    hasHandedness: true,
    hasFootedness: false
  },
  {
    id: 'tabletennis',
    name: 'Table Tennis 🏓',
    icon: '🏓',
    positions: ['Singles Player', 'Doubles Player'],
    styleTags: ['Lightning Quick', 'Spin Master', 'Technical', 'Defensive', 'Counter Attack', 'Chopper'],
    hasHandedness: true,
    hasFootedness: false
  }
];

const TIME_SLOTS = [
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'
];

const WEEKDAYS = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

const WEEKDAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
};

export default function SportsTab({ profile, onProfileUpdate }: SportsTabProps) {
  const [sportProfiles, setSportProfiles] = useState<SportProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSport, setEditingSport] = useState<string | null>(null);
  const [showAddSport, setShowAddSport] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load sport profiles with instant cache loading
  useEffect(() => {
    const loadSportProfiles = async () => {
      try {
        // Load from localStorage immediately for instant display
        const cachedProfiles = localStorage.getItem('sportProfiles');
        if (cachedProfiles) {
          try {
            const parsed = JSON.parse(cachedProfiles);
            setSportProfiles(parsed);
            setLoading(false); // Show data immediately
          } catch (e) {
            console.warn('Failed to parse cached profiles');
          }
        }

        // Try API with shorter timeout in background
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        try {
          const response = await apiClient.get('/api/v1/profiles/me/sports', {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          setSportProfiles(response.data);
          // Cache for next time
          localStorage.setItem('sportProfiles', JSON.stringify(response.data));
        } catch (apiError: any) {
          clearTimeout(timeoutId);
          if (apiError.name !== 'AbortError') {
            console.warn('API call failed, using cached/mock data:', apiError);
          }
          
          // Use mock data only if no cache exists
          if (!cachedProfiles) {
            const mockProfiles: SportProfile[] = [
              {
                sport: 'Futsal',
                positions: ['Midfielder', 'Forward'],
                skillLevel: 4,
                styleTags: ['Technical', 'Playmaker'],
                dominantFoot: 'right',
                intensity: 'competitive',
                availability: {
                  monday: ['6:00 PM', '7:00 PM'],
                  tuesday: [],
                  wednesday: ['6:00 PM', '7:00 PM'],
                  thursday: [],
                  friday: ['6:00 PM', '7:00 PM'],
                  saturday: ['10:00 AM', '11:00 AM', '2:00 PM'],
                  sunday: ['10:00 AM', '11:00 AM']
                },
                notes: 'Prefer playing in midfield, good at passing and creating chances',
                isVisible: true
              },
              {
                sport: 'Basketball',
                positions: ['Point Guard', 'Shooting Guard'],
                skillLevel: 3,
                styleTags: ['Playmaker', 'Shooter'],
                dominantHand: 'right',
                intensity: 'casual',
                availability: {
                  monday: [],
                  tuesday: ['6:00 PM', '7:00 PM'],
                  wednesday: [],
                  thursday: ['6:00 PM', '7:00 PM'],
                  friday: [],
                  saturday: ['2:00 PM', '3:00 PM'],
                  sunday: ['2:00 PM', '3:00 PM']
                },
                notes: 'Enjoy playing guard position, good at shooting and ball handling',
                isVisible: true
              }
            ];
            
            setSportProfiles(mockProfiles);
            localStorage.setItem('sportProfiles', JSON.stringify(mockProfiles));
          }
        }
      } catch (error) {
        console.error('Error loading sport profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSportProfiles();
  }, []);

  // Auto-save changes (optimized for speed)
  const saveSportProfile = useCallback(async (sportProfile: SportProfile, showToast = true) => {
    try {
      // Save to localStorage immediately for instant persistence
      const existingProfiles = JSON.parse(localStorage.getItem('sportProfiles') || '[]');
      const updatedProfiles = existingProfiles.filter((p: SportProfile) => p.sport !== sportProfile.sport);
      updatedProfiles.push(sportProfile);
      localStorage.setItem('sportProfiles', JSON.stringify(updatedProfiles));
      
      setHasUnsavedChanges(false);
      
      if (showToast) {
        toast.success('Sport profile saved!');
      }
      
      // Background API sync with timeout - don't wait for it
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      apiClient.put('/api/v1/profiles/me/sports', sportProfile, {
        signal: controller.signal
      }).catch(error => {
        if (error.name !== 'AbortError') {
          console.warn('Background sync failed:', error);
          // Could implement retry logic here
        }
      });
      
    } catch (error) {
      console.error('Error saving sport profile:', error);
      if (showToast) {
        toast.error('Failed to save sport profile');
      }
    }
  }, []);

  // Add new sport - complete configuration in modal
  const [newSportData, setNewSportData] = useState<Partial<SportProfile>>({});

  const handleAddSport = () => {
    if (!selectedSport) return;
    
    const sportOption = AVAILABLE_SPORTS.find(s => s.id === selectedSport);
    if (!sportOption) return;

    const completeProfile: SportProfile = {
      sport: sportOption.name,
      positions: newSportData.positions || [],
      skillLevel: newSportData.skillLevel || 1,
      styleTags: newSportData.styleTags || [],
      dominantFoot: newSportData.dominantFoot,
      dominantHand: newSportData.dominantHand,
      intensity: newSportData.intensity || 'casual',
      availability: newSportData.availability || {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      },
      notes: newSportData.notes || '',
      isVisible: newSportData.isVisible ?? true
    };

    // Optimistic UI update - add to state immediately for instant response
    setSportProfiles(prev => [...prev, completeProfile]);
    
    // Show success immediately
    toast.success(`${sportOption.name} profile added successfully!`);
    
    // Reset and close form immediately
    setShowAddSport(false);
    setSelectedSport('');
    setNewSportData({});
    
    // Background save - don't wait for it
    saveSportProfile(completeProfile, false).catch(error => {
      console.error('Error adding sport:', error);
      // Could implement rollback here if needed
      toast.error(`Failed to sync ${sportOption.name} profile to server`);
    });
  };

  // Reset new sport data when modal closes
  const handleCancelAdd = () => {
    setShowAddSport(false);
    setSelectedSport('');
    setNewSportData({
      skillLevel: 1,
      intensity: 'casual',
      isVisible: true,
      positions: [],
      styleTags: [],
      availability: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      },
      notes: ''
    });
  };

  // Update new sport data
  const updateNewSportData = (updates: Partial<SportProfile>) => {
    setNewSportData(prev => ({ ...prev, ...updates }));
  };

  // Toggle day availability for new sport
  const toggleNewSportDayAvailability = (day: string) => {
    const currentSlots = newSportData.availability?.[day as keyof typeof newSportData.availability] || [];
    const newSlots = currentSlots.length > 0 ? [] : ['Available'];

    updateNewSportData({
      availability: {
        ...newSportData.availability,
        [day]: newSlots
      } as any
    });
  };

  // Update sport profile
  const updateSportProfile = (sport: string, updates: Partial<SportProfile>) => {
    setSportProfiles(prev => prev.map(profile => 
      profile.sport === sport ? { ...profile, ...updates } : profile
    ));
    setHasUnsavedChanges(true);
  };

  // Delete sport profile
  const handleDeleteSport = async (sport: string) => {
    if (!confirm(`Are you sure you want to delete your ${sport} profile? This action cannot be undone.`)) {
      return;
    }
    
    try {
      // Remove from local state immediately for fast response
      setSportProfiles(prev => prev.filter(profile => profile.sport !== sport));
      
      // Also remove from preferred sports if present
      const updatedPreferredSports = profile.preferredSports.filter(s => s !== sport);
      onProfileUpdate({ preferredSports: updatedPreferredSports });
      
      // Background API call (don't wait for it)
      apiClient.delete(`/api/v1/profiles/me/sports/${sport}`).catch(error => {
        console.error('Error deleting sport profile:', error);
        // Could add error handling here if needed
      });
      
      toast.success(`${sport} profile deleted successfully!`);
      setEditingSport(null);
    } catch (error) {
      console.error('Error deleting sport:', error);
      toast.error('Failed to delete sport profile');
    }
  };

  // Save all changes
  const handleSaveAll = async () => {
    for (const profile of sportProfiles) {
      await saveSportProfile(profile);
    }
    setEditingSport(null);
  };

  // Toggle day availability (simplified)
  const toggleDayAvailability = (sport: string, day: string) => {
    const profile = sportProfiles.find(p => p.sport === sport);
    if (!profile) return;

    const currentSlots = profile.availability[day as keyof typeof profile.availability];
    const newSlots = currentSlots.length > 0 ? [] : ['Available']; // Simple toggle: available or not

    updateSportProfile(sport, {
      availability: {
        ...profile.availability,
        [day]: newSlots
      }
    });
  };

  // Get skill level color
  const getSkillLevelColor = (level: number) => {
    if (level <= 2) return 'text-red-500';
    if (level <= 3) return 'text-yellow-500';
    if (level <= 4) return 'text-blue-500';
    return 'text-green-500';
  };

  // Get intensity color
  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'casual': return 'text-green-500';
      case 'competitive': return 'text-yellow-500';
      case 'professional': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-[var(--bg-muted)] rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-[var(--bg-muted)] rounded w-1/3"></div>
                <div className="h-4 bg-[var(--bg-muted)] rounded w-1/2"></div>
                <div className="h-4 bg-[var(--bg-muted)] rounded w-2/3"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Sports Profile</h3>
            <p className="text-[var(--text-muted)]">
              Configure your sports preferences, skill levels, and availability
            </p>
          </div>
          <div className="flex gap-2">
            {hasUnsavedChanges && (
              <Button
                onClick={handleSaveAll}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save All
              </Button>
            )}
            <Button
              onClick={() => setShowAddSport(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Sport
            </Button>
          </div>
        </div>
      </Card>

      {/* Add Sport Popup Modal Overlay */}
      {showAddSport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-semibold text-[var(--text-primary)]">Add New Sport Profile</h4>
                <Button onClick={handleCancelAdd} variant="outline" size="sm">✕</Button>
              </div>
              
              {/* Sport Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Sport *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {AVAILABLE_SPORTS.filter(sport => !sportProfiles.some(p => p.sport === sport.name)).map((sport) => (
                    <button
                      key={sport.id}
                      onClick={() => setSelectedSport(sport.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        selectedSport === sport.id
                          ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{sport.icon}</div>
                      <div className="text-sm font-medium">{sport.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Configuration Fields - Show when sport is selected */}
              {selectedSport && (() => {
                const sportOption = AVAILABLE_SPORTS.find(s => s.id === selectedSport);
                if (!sportOption) return null;
                
                return (
                  <div className="space-y-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{sportOption.icon}</div>
                      <h5 className="text-lg font-semibold text-[var(--text-primary)]">{sportOption.name} Configuration</h5>
                    </div>

                    {/* Positions */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Positions</label>
                      <div className="flex flex-wrap gap-2">
                        {sportOption.positions.map((position) => (
                          <button
                            key={position}
                            onClick={() => {
                              const currentPositions = newSportData.positions || [];
                              const newPositions = currentPositions.includes(position)
                                ? currentPositions.filter(p => p !== position)
                                : [...currentPositions, position];
                              updateNewSportData({ positions: newPositions });
                            }}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              (newSportData.positions || []).includes(position)
                                ? 'bg-[var(--brand-primary)] text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {position}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Skill Level */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Skill Level (1-5) *</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            onClick={() => updateNewSportData({ skillLevel: level })}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                              (newSportData.skillLevel || 1) >= level
                                ? 'bg-[var(--brand-primary)] text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Playing Style Tags */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Playing Style</label>
                      <div className="flex flex-wrap gap-2">
                        {sportOption.styleTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => {
                              const currentTags = newSportData.styleTags || [];
                              const newTags = currentTags.includes(tag)
                                ? currentTags.filter(t => t !== tag)
                                : [...currentTags, tag];
                              updateNewSportData({ styleTags: newTags });
                            }}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              (newSportData.styleTags || []).includes(tag)
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dominant Hand/Foot */}
                    {(sportOption.hasHandedness || sportOption.hasFootedness) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sportOption.hasHandedness && (
                          <div>
                            <label className="block text-sm font-medium mb-2">Dominant Hand</label>
                            <div className="flex gap-2">
                              {['left', 'right', 'both'].map((hand) => (
                                <button
                                  key={hand}
                                  onClick={() => updateNewSportData({ dominantHand: hand as any })}
                                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    newSportData.dominantHand === hand
                                      ? 'bg-[var(--brand-primary)] text-white'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  {hand.charAt(0).toUpperCase() + hand.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {sportOption.hasFootedness && (
                          <div>
                            <label className="block text-sm font-medium mb-2">Dominant Foot</label>
                            <div className="flex gap-2">
                              {['left', 'right', 'both'].map((foot) => (
                                <button
                                  key={foot}
                                  onClick={() => updateNewSportData({ dominantFoot: foot as any })}
                                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    newSportData.dominantFoot === foot
                                      ? 'bg-[var(--brand-primary)] text-white'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  {foot.charAt(0).toUpperCase() + foot.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Playing Intensity */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Playing Intensity *</label>
                      <div className="flex gap-2">
                        {['casual', 'competitive', 'professional'].map((intensity) => (
                          <button
                            key={intensity}
                            onClick={() => updateNewSportData({ intensity: intensity as any })}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              (newSportData.intensity || 'casual') === intensity
                                ? 'bg-[var(--brand-primary)] text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Available Days */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Available Days</label>
                      <div className="flex flex-wrap gap-2">
                        {WEEKDAYS.map((day) => (
                          <button
                            key={day}
                            onClick={() => toggleNewSportDayAvailability(day)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              (newSportData.availability?.[day as keyof typeof newSportData.availability] || []).length > 0
                                ? 'bg-[var(--brand-primary)] text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {WEEKDAY_LABELS[day as keyof typeof WEEKDAY_LABELS]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                      <textarea
                        value={newSportData.notes || ''}
                        onChange={(e) => updateNewSportData({ notes: e.target.value })}
                        placeholder="Add any additional notes about your playing style..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
                        rows={3}
                      />
                    </div>

                    {/* Profile Visibility */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-[var(--text-primary)]">Make Profile Visible</label>
                        <p className="text-xs text-[var(--text-muted)]">Other players can see your sports profile</p>
                      </div>
                      <Switch
                        checked={newSportData.isVisible ?? true}
                        onCheckedChange={(checked) => updateNewSportData({ isVisible: checked })}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleAddSport}
                  disabled={!selectedSport}
                  className="flex-1"
                >
                  {selectedSport ? `Save ${AVAILABLE_SPORTS.find(s => s.id === selectedSport)?.name} Profile` : 'Save Sport Profile'}
                </Button>
                <Button
                  onClick={handleCancelAdd}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sport Profiles */}
      <div className="space-y-6">
        {sportProfiles.map((sportProfile) => {
          const sportOption = AVAILABLE_SPORTS.find(s => s.name === sportProfile.sport);
          const isEditing = editingSport === sportProfile.sport;

          return (
            <Card key={sportProfile.sport} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{sportOption?.icon || '🏃'}</div>
                  <div>
                    <h4 className="text-xl font-semibold text-[var(--text-primary)]">
                      {sportProfile.sport}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">
                        Level {sportProfile.skillLevel}
                      </Badge>
                      <Badge variant="default">
                        {sportProfile.intensity}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {sportProfile.isVisible ? (
                          <Eye className="w-4 h-4 text-green-500" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm text-[var(--text-muted)]">
                          {sportProfile.isVisible ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDeleteSport(sportProfile.sport)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300 bg-red-50 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                  <Button
                    onClick={() => setEditingSport(isEditing ? null : sportProfile.sport)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:border-blue-300 bg-blue-50 hover:bg-blue-100"
                  >
                    <Edit className="w-4 h-4" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-6">
                  {/* Positions */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Positions</label>
                    <div className="flex flex-wrap gap-2">
                      {sportOption?.positions.map((position) => (
                        <button
                          key={position}
                          onClick={() => {
                            const newPositions = sportProfile.positions.includes(position)
                              ? sportProfile.positions.filter(p => p !== position)
                              : [...sportProfile.positions, position];
                            updateSportProfile(sportProfile.sport, { positions: newPositions });
                          }}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            sportProfile.positions.includes(position)
                              ? 'bg-[var(--brand-primary)] text-white'
                              : 'bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--bg-contrast)]'
                          }`}
                        >
                          {position}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Skill Level */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Skill Level (1-5)</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <button
                          key={level}
                          onClick={() => updateSportProfile(sportProfile.sport, { skillLevel: level })}
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                            sportProfile.skillLevel >= level
                              ? 'bg-[var(--brand-primary)] text-white'
                              : 'bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--bg-contrast)]'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Style Tags */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Style Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {sportOption?.styleTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            const newTags = sportProfile.styleTags.includes(tag)
                              ? sportProfile.styleTags.filter(t => t !== tag)
                              : [...sportProfile.styleTags, tag];
                            updateSportProfile(sportProfile.sport, { styleTags: newTags });
                          }}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            sportProfile.styleTags.includes(tag)
                              ? 'bg-[var(--brand-secondary)] text-white'
                              : 'bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--bg-contrast)]'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dominant Hand/Foot */}
                  {(sportOption?.hasHandedness || sportOption?.hasFootedness) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sportOption?.hasHandedness && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Dominant Hand</label>
                          <div className="flex gap-2">
                            {['left', 'right', 'both'].map((hand) => (
                              <button
                                key={hand}
                                onClick={() => updateSportProfile(sportProfile.sport, { dominantHand: hand as any })}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  sportProfile.dominantHand === hand
                                    ? 'bg-[var(--brand-primary)] text-white'
                                    : 'bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--bg-contrast)]'
                                }`}
                              >
                                {hand.charAt(0).toUpperCase() + hand.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {sportOption?.hasFootedness && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Dominant Foot</label>
                          <div className="flex gap-2">
                            {['left', 'right', 'both'].map((foot) => (
                              <button
                                key={foot}
                                onClick={() => updateSportProfile(sportProfile.sport, { dominantFoot: foot as any })}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  sportProfile.dominantFoot === foot
                                    ? 'bg-[var(--brand-primary)] text-white'
                                    : 'bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--bg-contrast)]'
                                }`}
                              >
                                {foot.charAt(0).toUpperCase() + foot.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Intensity */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Playing Intensity</label>
                    <div className="flex gap-2">
                      {['casual', 'competitive', 'professional'].map((intensity) => (
                        <button
                          key={intensity}
                          onClick={() => updateSportProfile(sportProfile.sport, { intensity: intensity as any })}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            sportProfile.intensity === intensity
                              ? 'bg-[var(--brand-primary)] text-white'
                              : 'bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--bg-contrast)]'
                          }`}
                        >
                          {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Availability - Simplified to just days */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Available Days</label>
                    <div className="flex flex-wrap gap-2">
                      {WEEKDAYS.map((day) => {
                        const dayAvailability = sportProfile.availability?.[day as keyof typeof sportProfile.availability] || [];
                        return (
                          <button
                            key={day}
                            onClick={() => toggleDayAvailability(sportProfile.sport, day)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              dayAvailability.length > 0
                                ? 'bg-[var(--brand-primary)] text-white'
                                : 'bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--bg-contrast)]'
                            }`}
                          >
                            {WEEKDAY_LABELS[day as keyof typeof WEEKDAY_LABELS]}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      Select the days you're available to play this sport
                    </p>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Notes</label>
                    <textarea
                      value={sportProfile.notes || ''}
                      onChange={(e) => updateSportProfile(sportProfile.sport, { notes: e.target.value })}
                      placeholder="Add any additional notes about your playing style..."
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-lg resize-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  {/* Visibility Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-[var(--text-primary)]">Make Profile Visible</label>
                      <p className="text-xs text-[var(--text-muted)]">Other players can see your sports profile</p>
                    </div>
                    <Switch
                      checked={sportProfile.isVisible}
                      onCheckedChange={(checked) => updateSportProfile(sportProfile.sport, { isVisible: checked })}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Quick Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-[var(--text-muted)]">Positions</div>
                      <div className="font-medium text-[var(--text-primary)]">
                        {sportProfile.positions.length > 0 ? sportProfile.positions.join(', ') : 'Not set'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-[var(--text-muted)]">Skill Level</div>
                      <div className={`font-medium ${getSkillLevelColor(sportProfile.skillLevel)}`}>
                        {sportProfile.skillLevel}/5
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-[var(--text-muted)]">Style</div>
                      <div className="font-medium text-[var(--text-primary)]">
                        {sportProfile.styleTags.length > 0 ? sportProfile.styleTags.join(', ') : 'Not set'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-[var(--text-muted)]">Intensity</div>
                      <div className={`font-medium ${getIntensityColor(sportProfile.intensity)}`}>
                        {sportProfile.intensity}
                      </div>
                    </div>
                  </div>

                  {/* Availability Summary - Simplified */}
                  <div>
                    <div className="text-sm text-[var(--text-muted)] mb-2">Available Days</div>
                    <div className="flex flex-wrap gap-2">
                      {WEEKDAYS.map((day) => {
                        const dayAvailability = sportProfile.availability?.[day as keyof typeof sportProfile.availability] || [];
                        const isAvailable = dayAvailability.length > 0;
                        return (
                          <span
                            key={day}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              isAvailable
                                ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]'
                                : 'bg-[var(--bg-muted)] text-[var(--text-muted)]'
                            }`}
                          >
                            {WEEKDAY_LABELS[day as keyof typeof WEEKDAY_LABELS].slice(0, 3)}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes */}
                  {sportProfile.notes && (
                    <div>
                      <div className="text-sm text-[var(--text-muted)] mb-1">Notes</div>
                      <p className="text-sm text-[var(--text-primary)]">{sportProfile.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {sportProfiles.length === 0 && (
        <Card className="p-8 text-center">
          <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)] opacity-50" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Sports Added</h3>
          <p className="text-[var(--text-muted)] mb-4">
            Add your first sport to start building your profile
          </p>
          <Button
            onClick={() => setShowAddSport(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Your First Sport
          </Button>
        </Card>
      )}
    </div>
  );
}
