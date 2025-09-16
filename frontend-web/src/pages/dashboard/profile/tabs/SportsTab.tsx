import React, { useState } from 'react';
import { Button, Card, Badge } from '@components/ui';
import { 
  Gamepad2,
  Star,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';
import { UserProfile, SportProfile, AvailabilityGrid } from '../types';

const SportsTab: React.FC<{ profile: UserProfile; onAvailabilityUpdate: () => void }> = ({ profile, onAvailabilityUpdate }) => {
  const [sports, setSports] = useState<SportProfile[]>(profile.sports);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const availableSports = ['Futsal', 'Basketball', 'Cricket', 'Volleyball', 'Badminton', 'Tennis', 'Football', 'Table Tennis'];

  const handleSportChange = (sport: string, updates: Partial<SportProfile>) => {
    setSports(prev => {
      const newSports = prev.map(s => s.sport === sport ? { ...s, ...updates } : s);
      setHasChanges(true);
      return newSports;
    });
  };

  const handleAddSport = (sportName: string) => {
    if (sports.find(s => s.sport === sportName)) return;
    
    const newSport: SportProfile = {
      sport: sportName,
      skillLevel: 1,
      positions: [],
      styleTags: [],
      intensity: 'casual',
      availability: {} as any,
      visibility: 'public'
    };
    
    setSports(prev => [...prev, newSport]);
    setSelectedSport(sportName);
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    // Save to backend
    setHasChanges(false);
    console.log('Saving sports profile:', sports);
  };

  const getSkillLevelColor = (level: number) => {
    if (level >= 4) return 'text-green-600';
    if (level >= 3) return 'text-yellow-600';
    if (level >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'professional':
        return 'bg-purple-100 text-purple-700';
      case 'competitive':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Save Changes Button */}
      {hasChanges && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-700">You have unsaved changes</span>
            </div>
            <Button onClick={handleSaveChanges} size="sm">
              <Save className="w-4 h-4 mr-1" />
              Save Changes
            </Button>
          </div>
        </Card>
      )}

      {/* Sport Selection */}
      <Card className="p-4">
        <h3 className="font-semibold text-[var(--text)] mb-4">How You Play</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {availableSports.map((sport) => {
            const isSelected = selectedSport === sport;
            const isAdded = sports.find(s => s.sport === sport);
            
            return (
              <button
                key={sport}
                onClick={() => {
                  if (isAdded) {
                    setSelectedSport(isSelected ? null : sport);
                  } else {
                    handleAddSport(sport);
                  }
                }}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-[var(--brand-primary)] text-white'
                    : isAdded
                    ? 'bg-green-100 text-green-700'
                    : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:bg-[var(--brand-primary)]/10'
                }`}
              >
                {sport}
                {isAdded && <span className="ml-1">✓</span>}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Sport Details */}
      {selectedSport && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--text)]">{selectedSport} Profile</h3>
            <Badge 
              variant="default" 
              className={`${getIntensityColor(sports.find(s => s.sport === selectedSport)?.intensity || 'casual')} border-0`}
            >
              {sports.find(s => s.sport === selectedSport)?.intensity || 'casual'}
            </Badge>
          </div>
          
          <div className="space-y-4">
            {/* Skill Level */}
            <div>
              <label className="block text-sm font-medium mb-2">Skill Level (1-5)</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                      sports.find(s => s.sport === selectedSport)?.skillLevel === level
                        ? 'bg-[var(--brand-primary)] text-white'
                        : 'bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--brand-primary)]/10'
                    }`}
                    onClick={() => handleSportChange(selectedSport, { skillLevel: level })}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                <span>Beginner</span>
                <span>Expert</span>
              </div>
            </div>

            {/* Intensity */}
            <div>
              <label className="block text-sm font-medium mb-2">Intensity</label>
              <select
                value={sports.find(s => s.sport === selectedSport)?.intensity || 'casual'}
                onChange={(e) => handleSportChange(selectedSport, { intensity: e.target.value as any })}
                className="w-full p-2 border border-[var(--border)] rounded-lg"
              >
                <option value="casual">Casual</option>
                <option value="competitive">Competitive</option>
                <option value="professional">Professional</option>
              </select>
            </div>

            {/* Positions */}
            <div>
              <label className="block text-sm font-medium mb-2">Preferred Positions</label>
              <div className="flex flex-wrap gap-2">
                {['Forward', 'Midfielder', 'Defender', 'Goalkeeper', 'Point Guard', 'Center', 'Wing'].map((position) => {
                  const isSelected = sports.find(s => s.sport === selectedSport)?.positions.includes(position);
                  return (
                    <button
                      key={position}
                      onClick={() => {
                        const currentPositions = sports.find(s => s.sport === selectedSport)?.positions || [];
                        const newPositions = isSelected
                          ? currentPositions.filter(p => p !== position)
                          : [...currentPositions, position];
                        handleSportChange(selectedSport, { positions: newPositions });
                      }}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        isSelected
                          ? 'bg-[var(--brand-primary)] text-white'
                          : 'bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--brand-primary)]/10'
                      }`}
                    >
                      {position}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Style Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">Playing Style</label>
              <div className="flex flex-wrap gap-2">
                {['Aggressive', 'Strategic', 'Defensive', 'Offensive', 'Team Player', 'Individual', 'Fast', 'Technical'].map((style) => {
                  const isSelected = sports.find(s => s.sport === selectedSport)?.styleTags.includes(style);
                  return (
                    <button
                      key={style}
                      onClick={() => {
                        const currentStyles = sports.find(s => s.sport === selectedSport)?.styleTags || [];
                        const newStyles = isSelected
                          ? currentStyles.filter(s => s !== style)
                          : [...currentStyles, style];
                        handleSportChange(selectedSport, { styleTags: newStyles });
                      }}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        isSelected
                          ? 'bg-[var(--brand-primary)] text-white'
                          : 'bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--brand-primary)]/10'
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium mb-2">Profile Visibility</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSportChange(selectedSport, { visibility: 'public' })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    sports.find(s => s.sport === selectedSport)?.visibility === 'public'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-[var(--bg-muted)] text-[var(--text-muted)]'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Public
                </button>
                <button
                  onClick={() => handleSportChange(selectedSport, { visibility: 'private' })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    sports.find(s => s.sport === selectedSport)?.visibility === 'private'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-[var(--bg-muted)] text-[var(--text-muted)]'
                  }`}
                >
                  <EyeOff className="w-4 h-4" />
                  Private
                </button>
              </div>
            </div>

            {/* Availability Grid */}
            <div>
              <label className="block text-sm font-medium mb-2">Weekly Availability</label>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                  const dayKey = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][index] as keyof AvailabilityGrid;
                  const isAvailable = sports.find(s => s.sport === selectedSport)?.availability?.[dayKey]?.some(slot => slot.available) || false;
                  
                  return (
                    <div key={day} className="text-center">
                      <div className="text-[var(--text-muted)] mb-1">{day}</div>
                      <button
                        onClick={() => {
                          const currentAvailability = sports.find(s => s.sport === selectedSport)?.availability || {} as AvailabilityGrid;
                          const newAvailability = {
                            ...currentAvailability,
                            [dayKey]: [{ start: '18:00', end: '20:00', available: !isAvailable }]
                          };
                          handleSportChange(selectedSport, { availability: newAvailability });
                          onAvailabilityUpdate(); // Award XP for availability update
                        }}
                        className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                          isAvailable
                            ? 'bg-green-100 text-green-700'
                            : 'bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-green-100'
                        }`}
                      >
                        {isAvailable ? '✓' : '○'}
                      </button>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                Click to toggle availability for each day
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={sports.find(s => s.sport === selectedSport)?.notes || ''}
                onChange={(e) => handleSportChange(selectedSport, { notes: e.target.value })}
                placeholder="Add any additional notes about your playing style..."
                className="w-full p-3 border border-[var(--border)] rounded-lg resize-none"
                rows={3}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Sports Summary */}
      <Card className="p-4">
        <h3 className="font-semibold text-[var(--text)] mb-4">Your Sports Summary</h3>
        <div className="space-y-3">
          {sports.map((sport) => (
            <div key={sport.sport} className="flex items-center justify-between p-3 bg-[var(--bg-muted)] rounded-lg">
              <div className="flex items-center gap-3">
                <Gamepad2 className="w-5 h-5 text-[var(--text-muted)]" />
                <div>
                  <div className="font-medium text-[var(--text)]">{sport.sport}</div>
                  <div className="text-sm text-[var(--text-muted)]">
                    Level {sport.skillLevel} • {sport.intensity} • {sport.positions.length} positions
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  size="sm"
                  className={sport.visibility === 'public' ? 'text-green-600' : 'text-red-600'}
                >
                  {sport.visibility}
                </Badge>
                <button
                  onClick={() => setSelectedSport(sport.sport)}
                  className="text-[var(--brand-primary)] hover:underline text-sm"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SportsTab;
