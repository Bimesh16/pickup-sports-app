import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card } from '@components/ui';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Star,
  Trophy,
  ArrowLeft,
  Plus,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Flag,
  Heart,
  Target,
  Trash2
} from 'lucide-react';
import { useLocationContext } from '@context/LocationContext';
import { gamesApi, getSportEmoji, CreateGameRequest } from '@api/games';
import { GameSummaryDTO } from '../../types/api';
import { toast } from 'react-toastify';
import ErrorBoundary from '@components/ErrorBoundary';

// Sport options with emojis
const SPORT_OPTIONS = [
  { value: 'Futsal', label: '⚽ Futsal', emoji: '⚽' },
  { value: 'Football', label: '⚽ Football', emoji: '⚽' },
  { value: 'Basketball', label: '🏀 Basketball', emoji: '🏀' },
  { value: 'Volleyball', label: '🏐 Volleyball', emoji: '🏐' },
  { value: 'Cricket', label: '🏏 Cricket', emoji: '🏏' },
  { value: 'Badminton', label: '🏸 Badminton', emoji: '🏸' },
  { value: 'Tennis', label: '🎾 Tennis', emoji: '🎾' },
  { value: 'Table Tennis', label: '🏓 Table Tennis', emoji: '🏓' },
  { value: 'Hockey', label: '🏑 Hockey', emoji: '🏑' },
  { value: 'Baseball', label: '⚾ Baseball', emoji: '⚾' },
  { value: 'Rugby', label: '🏉 Rugby', emoji: '🏉' },
  { value: 'Other', label: '🔥 Other Sport', emoji: '🔥' }
];

const SKILL_LEVELS = [
  { value: 'BEGINNER', label: 'Beginner', description: 'Just starting out, all welcome!' },
  { value: 'INTERMEDIATE', label: 'Intermediate', description: 'Some experience needed' },
  { value: 'ADVANCED', label: 'Advanced', description: 'Competitive level play' },
  { value: 'ANY', label: 'Any Level', description: 'Mixed skill levels welcome' }
];

const GAME_TYPES = [
  { value: 'PICKUP', label: 'Pickup Game', description: 'Casual, friendly game' },
  { value: 'TOURNAMENT', label: 'Tournament', description: 'Competitive tournament match' },
  { value: 'LEAGUE', label: 'League Match', description: 'Organized league game' }
];

// Form validation
interface FormErrors {
  sport?: string;
  time?: string;
  location?: string;
  maxPlayers?: string;
  pricePerPlayer?: string;
  title?: string;
}

// Success animation component
const SuccessAnimation: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="p-8 max-w-md text-center animate-in zoom-in duration-300">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <div className="flex justify-center space-x-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Sparkles
                key={i}
                className="w-4 h-4 text-[var(--brand-primary)] animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Game Created! 🎉
        </h3>
        <p className="text-[var(--text-muted)] mb-4">
          Your game is live – सुभागमन! (Good luck!)
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-[var(--brand-primary)]">
          <Flag className="w-4 h-4" />
          <span>Ready for players in Nepal's sports community</span>
        </div>
      </Card>
    </div>
  );
};

interface CreateGameProps {
  isEditing?: boolean;
  gameId?: number;
  initialData?: Partial<CreateGameRequest>;
}

export default function CreateGame({ isEditing = false, gameId, initialData }: CreateGameProps) {
  const navigate = useNavigate();
  const { location } = useLocationContext();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Form state
  const [formData, setFormData] = useState<CreateGameRequest>({
    sport: initialData?.sport || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    time: initialData?.time ? new Date(initialData.time).toISOString().slice(0, 16) : '',
    location: initialData?.location || location?.name || '',
    latitude: initialData?.latitude || location?.lat || 27.7172,
    longitude: initialData?.longitude || location?.lng || 85.324,
    skillLevel: initialData?.skillLevel || 'ANY',
    maxPlayers: initialData?.maxPlayers || 10,
    minPlayers: initialData?.minPlayers || 2,
    pricePerPlayer: initialData?.pricePerPlayer || 0,
    gameType: initialData?.gameType || 'PICKUP',
    duration: initialData?.duration || 90,
    equipment: initialData?.equipment || '',
    rules: initialData?.rules || '',
    isPrivate: initialData?.isPrivate || false,
    requiresApproval: initialData?.requiresApproval || false
  });

  // Get current date/time for validation
  const now = new Date();
  const minDateTime = new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16); // 1 hour from now

  // Update form field
  const updateField = (field: keyof CreateGameRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.sport) {
      newErrors.sport = 'Please select a sport';
    }

    if (!formData.time) {
      newErrors.time = 'Please select date and time';
    } else if (new Date(formData.time) < new Date()) {
      newErrors.time = 'Game time must be in the future';
    }

    if (!formData.location?.trim()) {
      newErrors.location = 'Please enter a location';
    }

    if (!formData.maxPlayers || formData.maxPlayers < 2) {
      newErrors.maxPlayers = 'Maximum players must be at least 2';
    }

    if (formData.pricePerPlayer < 0) {
      newErrors.pricePerPlayer = 'Price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      setLoading(true);

      const gameData: CreateGameRequest = {
        ...formData,
        time: new Date(formData.time).toISOString(),
        title: formData.title || `${formData.sport} Game`,
        description: formData.description || `Join us for an exciting ${formData.sport.toLowerCase()} match! All ${formData.skillLevel.toLowerCase()} players welcome. धन्यवाद! 🙏`
      };

      let result: GameSummaryDTO;
      if (isEditing && gameId) {
        result = await gamesApi.updateGame(gameId, gameData);
        toast.success('Game updated successfully! 🎉');
        navigate(`/games/${gameId}`);
      } else {
        result = await gamesApi.createGame(gameData);
        setShowSuccess(true);
        setTimeout(() => {
          navigate(`/games/${result.id}`);
        }, 3000);
      }

    } catch (error) {
      console.error('Error creating/updating game:', error);
      toast.error(isEditing ? 'Failed to update game' : 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/dashboard/games');
  };

  // Handle delete (editing only)
  const handleDelete = async () => {
    if (!gameId || !isEditing) return;
    
    const confirmed = window.confirm('Are you sure you want to cancel this game? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setLoading(true);
      await gamesApi.deleteGame(gameId);
      toast.success('Game cancelled successfully');
      navigate('/dashboard/games');
    } catch (error) {
      console.error('Error deleting game:', error);
      toast.error('Failed to cancel game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[var(--bg-app)]">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] py-8">
          <div className="absolute inset-0 bg-[url('/images/nepal-pattern.svg')] opacity-10 bg-repeat" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="text-white border-white/30 hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Games
              </Button>
              
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Flag className="w-4 h-4" />
                <span>Nepal Sports Community</span>
              </div>
            </div>

            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                {formData.sport ? getSportEmoji(formData.sport) : <Plus className="w-8 h-8" />}
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {isEditing ? 'Edit Your Game' : 'Create New Game'}
              </h1>
              <p className="text-white/80">
                {isEditing ? 'Update game details' : 'Organize a game in your community'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Details */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[var(--brand-primary)]" />
                  Game Details
                </h2>

                {/* Sport Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Sport *
                  </label>
                  <select
                    value={formData.sport}
                    onChange={(e) => updateField('sport', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent ${
                      errors.sport ? 'border-red-500' : 'border-[var(--border)]'
                    }`}
                  >
                    <option value="">Select a sport</option>
                    {SPORT_OPTIONS.map((sport) => (
                      <option key={sport.value} value={sport.value}>
                        {sport.label}
                      </option>
                    ))}
                  </select>
                  {errors.sport && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.sport}
                    </p>
                  )}
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Game Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
                    placeholder="e.g., Friday Night Futsal Championship"
                  />
                  <p className="text-[var(--text-muted)] text-xs mt-1">
                    Leave blank to auto-generate based on sport
                  </p>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
                    placeholder="Describe your game... All skill levels welcome! धन्यवाद! 🙏"
                    rows={3}
                  />
                </div>

                {/* Date & Time */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.time}
                    min={minDateTime}
                    onChange={(e) => updateField('time', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent ${
                      errors.time ? 'border-red-500' : 'border-[var(--border)]'
                    }`}
                  />
                  {errors.time && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.time}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent ${
                      errors.location ? 'border-red-500' : 'border-[var(--border)]'
                    }`}
                    placeholder="e.g., Kathmandu Sports Arena, New Road"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.location}
                    </p>
                  )}
                </div>
              </Card>

              {/* Equipment & Rules */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[var(--brand-primary)]" />
                  Additional Details
                </h2>

                {/* Equipment */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Equipment & Requirements
                  </label>
                  <textarea
                    value={formData.equipment}
                    onChange={(e) => updateField('equipment', e.target.value)}
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
                    placeholder="e.g., Indoor shoes required, water bottles provided"
                    rows={2}
                  />
                </div>

                {/* Rules */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Special Rules & Notes
                  </label>
                  <textarea
                    value={formData.rules}
                    onChange={(e) => updateField('rules', e.target.value)}
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
                    placeholder="Any special rules or important notes for players..."
                    rows={2}
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => updateField('duration', parseInt(e.target.value) || 90)}
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
                    min="30"
                    max="300"
                  />
                </div>
              </Card>
            </div>

            {/* Right Column - Settings */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-[var(--brand-primary)]" />
                  Game Settings
                </h2>

                {/* Skill Level */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Skill Level
                  </label>
                  <div className="space-y-2">
                    {SKILL_LEVELS.map((level) => (
                      <label key={level.value} className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-lg hover:border-[var(--brand-primary)] cursor-pointer">
                        <input
                          type="radio"
                          name="skillLevel"
                          value={level.value}
                          checked={formData.skillLevel === level.value}
                          onChange={(e) => updateField('skillLevel', e.target.value as any)}
                          className="text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                        />
                        <div>
                          <div className="font-medium">{level.label}</div>
                          <div className="text-sm text-[var(--text-muted)]">{level.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Players */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Max Players *
                    </label>
                    <input
                      type="number"
                      value={formData.maxPlayers}
                      onChange={(e) => updateField('maxPlayers', parseInt(e.target.value) || 10)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent ${
                        errors.maxPlayers ? 'border-red-500' : 'border-[var(--border)]'
                      }`}
                      min="2"
                      max="50"
                    />
                    {errors.maxPlayers && (
                      <p className="text-red-500 text-sm mt-1">{errors.maxPlayers}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Min Players
                    </label>
                    <input
                      type="number"
                      value={formData.minPlayers}
                      onChange={(e) => updateField('minPlayers', parseInt(e.target.value) || 2)}
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
                      min="1"
                      max={formData.maxPlayers}
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Price per Player (NPR)
                  </label>
                  <input
                    type="number"
                    value={formData.pricePerPlayer}
                    onChange={(e) => updateField('pricePerPlayer', parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent ${
                      errors.pricePerPlayer ? 'border-red-500' : 'border-[var(--border)]'
                    }`}
                    min="0"
                  />
                  <p className="text-[var(--text-muted)] text-xs mt-1">
                    Set to 0 for free games
                  </p>
                  {errors.pricePerPlayer && (
                    <p className="text-red-500 text-sm mt-1">{errors.pricePerPlayer}</p>
                  )}
                </div>

                {/* Game Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Game Type
                  </label>
                  <div className="space-y-2">
                    {GAME_TYPES.map((type) => (
                      <label key={type.value} className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-lg hover:border-[var(--brand-primary)] cursor-pointer">
                        <input
                          type="radio"
                          name="gameType"
                          value={type.value}
                          checked={formData.gameType === type.value}
                          onChange={(e) => updateField('gameType', e.target.value as any)}
                          className="text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                        />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-[var(--text-muted)]">{type.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Privacy Options */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Privacy Settings
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.isPrivate}
                        onChange={(e) => updateField('isPrivate', e.target.checked)}
                        className="text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                      />
                      <div>
                        <div className="font-medium">Private Game</div>
                        <div className="text-sm text-[var(--text-muted)]">Only invited players can see this game</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.requiresApproval}
                        onChange={(e) => updateField('requiresApproval', e.target.checked)}
                        className="text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                      />
                      <div>
                        <div className="font-medium">Requires Approval</div>
                        <div className="text-sm text-[var(--text-muted)]">You must approve players before they join</div>
                      </div>
                    </label>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <Card className="p-6">
                <div className="space-y-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white py-3 text-lg font-semibold"
                  >
                    {loading ? 'Creating...' : isEditing ? 'Update Game' : '🎯 Create Game'}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={handleCancel}
                    variant="outline"
                    className="w-full"
                  >
                    Cancel
                  </Button>

                  {isEditing && (
                    <Button
                      type="button"
                      onClick={handleDelete}
                      disabled={loading}
                      className="w-full bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Cancel Game
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </form>
        </div>

        {/* Success Animation */}
        {showSuccess && (
          <SuccessAnimation onClose={() => setShowSuccess(false)} />
        )}
      </div>
    </ErrorBoundary>
  );
}
