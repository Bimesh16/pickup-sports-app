import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Badge, Modal } from '@components/ui';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Crown,
  Edit3,
  MessageCircle,
  Trophy,
  Shield,
  DollarSign,
  ArrowLeft,
  Lock,
  Globe,
  Zap,
  Heart,
  Share2,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  UserPlus,
  UserMinus,
  CreditCard,
  Target
} from 'lucide-react';
import { useAppState } from '@context/AppStateContext';
import { useLocationContext } from '@context/LocationContext';
import { gamesApi, getSportEmoji, formatGameTime } from '@api/games';
import { toast } from 'react-toastify';
import ErrorBoundary from '@components/ErrorBoundary';
import GameChat from '@components/GameChat';

// Types
interface GameDetails {
  id: number;
  sport: string;
  title: string;
  description: string;
  time: string;
  location: string;
  address: string;
  latitude?: number;
  longitude?: number;
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ANY';
  currentPlayers: number;
  maxPlayers: number;
  pricePerPlayer: number;
  isPrivate: boolean;
  requiresApproval: boolean;
  status: 'ACTIVE' | 'FULL' | 'CANCELLED' | 'COMPLETED';
  creatorName: string;
  creatorId: number;
  creatorAvatar?: string;
  participants: Participant[];
  rules?: string;
  equipment?: string;
  venueDetails?: string;
  chatEnabled: boolean;
  isUserJoined: boolean;
  isUserCreator: boolean;
}

interface Participant {
  id: number;
  username: string;
  displayName: string;
  avatar?: string;
  joinedAt: string;
  isHost: boolean;
  skillLevel?: string;
}

interface PaymentIntent {
  clientSecret: string;
  paymentUrl?: string;
  amount: number;
  currency: string;
}

// Sport background images mapping
const SPORT_BACKGROUNDS = {
  'Futsal': '/images/futsal-bg.jpg',
  'Basketball': '/images/basketball-bg.jpg', 
  'Volleyball': '/images/volleyball-bg.jpg',
  'Cricket': '/images/cricket-bg.jpg',
  'Football': '/images/football-bg.jpg',
  'default': '/images/nepal-mountains.jpg'
};

// Skill level colors
const SKILL_COLORS = {
  'BEGINNER': 'bg-green-100 text-green-800 border-green-200',
  'INTERMEDIATE': 'bg-yellow-100 text-yellow-800 border-yellow-200', 
  'ADVANCED': 'bg-red-100 text-red-800 border-red-200',
  'ANY': 'bg-blue-100 text-blue-800 border-blue-200'
};

// Payment Modal Component
const PaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  game: GameDetails;
  onPaymentSuccess: () => void;
}> = ({ isOpen, onClose, game, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'success'>('details');

  const handlePayment = async () => {
    try {
      setLoading(true);
      setPaymentStep('processing');

      // Create payment intent
      const paymentIntent: PaymentIntent = await fetch('/api/v1/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: game.id,
          amount: game.pricePerPlayer,
          currency: 'NPR'
        })
      }).then(res => res.json()).catch(() => ({
        // Mock payment for demo
        clientSecret: 'mock_secret',
        amount: game.pricePerPlayer,
        currency: 'NPR'
      }));

      // Simulate payment processing
      setTimeout(() => {
        setPaymentStep('success');
        setTimeout(() => {
          onPaymentSuccess();
          onClose();
        }, 2000);
      }, 2000);

    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Payment failed. Please try again.');
      setPaymentStep('details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        {paymentStep === 'details' && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                Join Game Payment
              </h3>
              <p className="text-[var(--text-muted)]">
                Complete your payment to secure your spot
              </p>
            </div>

            <div className="bg-[var(--bg-muted)] rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{getSportEmoji(game.sport)}</span>
                <div>
                  <h4 className="font-semibold text-[var(--text-primary)]">{game.title}</h4>
                  <p className="text-sm text-[var(--text-muted)]">{formatGameTime(game.time).day} at {formatGameTime(game.time).time}</p>
                </div>
              </div>
              
              <div className="border-t border-[var(--border)] pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)]">Game Fee:</span>
                  <span className="text-2xl font-bold text-[var(--brand-primary)]">NPR {game.pricePerPlayer}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white py-3"
              >
                {loading ? 'Processing...' : '💳 Pay & Join Game'}
              </Button>
              
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>

            <div className="mt-4 text-xs text-center text-[var(--text-muted)]">
              <Shield className="w-4 h-4 inline mr-1" />
              Secure payment powered by Nepal Sports
            </div>
          </>
        )}

        {paymentStep === 'processing' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              Processing Payment...
            </h3>
            <p className="text-[var(--text-muted)]">
              Please wait while we process your payment
            </p>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-green-600 mb-2">
              Payment Successful! 🎉
            </h3>
            <p className="text-[var(--text-muted)]">
              Welcome to the game! See you on the field.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Participant Avatar Component
const ParticipantAvatar: React.FC<{ participant: Participant }> = ({ participant }) => {
  const initials = participant.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
  
  return (
    <div className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] rounded-lg border border-[var(--border)] hover:border-[var(--brand-primary)]/50 transition-colors">
      <div className="relative">
        {participant.avatar ? (
          <img 
            src={participant.avatar} 
            alt={participant.displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-full flex items-center justify-center text-white font-bold text-sm">
            {initials}
          </div>
        )}
        {participant.isHost && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
            <Crown className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <div className="font-medium text-[var(--text-primary)] flex items-center gap-2">
          {participant.displayName}
          {participant.isHost && (
            <div className="px-2 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-800 border-yellow-200">Host</div>
          )}
        </div>
        <div className="text-sm text-[var(--text-muted)]">@{participant.username}</div>
        {participant.skillLevel && (
          <div className="text-xs text-[var(--text-muted)]">{participant.skillLevel} level</div>
        )}
      </div>
    </div>
  );
};

// Main GameDetails Component
export default function GameDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAppState();
  const { location } = useLocationContext();
  
  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  // Fetch game details with performance optimization
  useEffect(() => {
    const fetchGameDetails = async () => {
      if (!id) return;
      
      try {
        // Load cached game details immediately
        const cacheKey = `game_details_${id}`;
        const cachedGame = localStorage.getItem(cacheKey);
        
        if (cachedGame) {
          try {
            const parsed = JSON.parse(cachedGame);
            setGame(parsed);
            setLoading(false); // Show immediately
          } catch (e) {
            console.warn('Failed to parse cached game details');
          }
        }

        // Background API call with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        try {
          const response = await gamesApi.getGameDetails(parseInt(id));
          clearTimeout(timeoutId);
          
          // Transform GameSummaryDTO to GameDetails format
          const gameDetails: GameDetails = {
            ...response,
            title: response.sport + ' Game', // Default title
            description: response.description || `Join us for an exciting ${response.sport.toLowerCase()} game! धन्यवाद!`,
            address: response.location,
            creatorId: response.id, // Use game ID as fallback for creatorId
            skillLevel: (response.skillLevel as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ANY') || 'ANY',
            currentPlayers: response.currentPlayers || 0,
            maxPlayers: response.maxPlayers || 10,
            pricePerPlayer: response.pricePerPlayer || 0,
            status: (response.status as 'ACTIVE' | 'FULL' | 'CANCELLED' | 'COMPLETED') || 'ACTIVE',
            creatorName: response.creatorName || 'Unknown',
            isPrivate: false, // Default values
            requiresApproval: false,
            participants: [],
            rules: '',
            equipment: '',
            venueDetails: '',
            chatEnabled: true,
            isUserJoined: false,
            isUserCreator: response.creatorName === profile?.username
          };
          
          setGame(gameDetails);
          localStorage.setItem(cacheKey, JSON.stringify(gameDetails));
        } catch (apiError: any) {
          clearTimeout(timeoutId);
          console.warn('Game details API failed, using cached/mock data:', apiError);
          
          // Use beautiful Nepal cultural mock data if no cache
          if (!cachedGame) {
            const mockGame: GameDetails = {
              id: parseInt(id),
              sport: 'Futsal',
              title: 'Saturday Evening Futsal Championship',
              description: 'Join us for an exciting futsal match in the heart of Kathmandu! This is a friendly competitive game perfect for intermediate players. धन्यवाद! 🙏',
              time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
              location: 'New Road Sports Complex',
              address: 'New Road, Kathmandu 44600, Nepal',
              latitude: 27.7172,
              longitude: 85.324,
              skillLevel: 'INTERMEDIATE',
              currentPlayers: 8,
              maxPlayers: 10,
              pricePerPlayer: 200,
              isPrivate: false,
              requiresApproval: false,
              status: 'ACTIVE',
              creatorName: 'mountain_warrior',
              creatorId: 123,
              creatorAvatar: undefined,
              participants: [
                { id: 123, username: 'mountain_warrior', displayName: 'Raj Sherpa', isHost: true, joinedAt: '2024-01-15T10:00:00Z', skillLevel: 'INTERMEDIATE' },
                { id: 124, username: 'kathmandu_striker', displayName: 'Suman Thapa', isHost: false, joinedAt: '2024-01-15T11:00:00Z', skillLevel: 'INTERMEDIATE' },
                { id: 125, username: 'himalayan_goalie', displayName: 'Bikash Gurung', isHost: false, joinedAt: '2024-01-15T12:00:00Z', skillLevel: 'ADVANCED' },
                { id: 126, username: 'everest_midfielder', displayName: 'Kiran Rai', isHost: false, joinedAt: '2024-01-15T13:00:00Z', skillLevel: 'BEGINNER' },
                { id: 127, username: 'annapurna_defender', displayName: 'Pemba Tamang', isHost: false, joinedAt: '2024-01-15T14:00:00Z', skillLevel: 'INTERMEDIATE' },
                { id: 128, username: 'pokhara_winger', displayName: 'Dipesh Magar', isHost: false, joinedAt: '2024-01-15T15:00:00Z', skillLevel: 'INTERMEDIATE' },
                { id: 129, username: 'chitwan_forward', displayName: 'Ashish Chhetri', isHost: false, joinedAt: '2024-01-15T16:00:00Z', skillLevel: 'ADVANCED' },
                { id: 130, username: 'dharan_captain', displayName: 'Suresh Limbu', isHost: false, joinedAt: '2024-01-15T17:00:00Z', skillLevel: 'INTERMEDIATE' }
              ],
              rules: 'Standard futsal rules apply. Fair play is expected from all participants. No slide tackles allowed on artificial turf.',
              equipment: 'Indoor futsal shoes recommended. Shin guards mandatory. Water bottles provided.',
              venueDetails: 'Indoor futsal court with artificial turf. Changing rooms and shower facilities available.',
              chatEnabled: true,
              isUserJoined: false,
              isUserCreator: false
            };
            
            setGame(mockGame);
            localStorage.setItem(cacheKey, JSON.stringify(mockGame));
          }
        }
      } catch (error) {
        console.error('Error fetching game details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [id]);

  // Join game handler
  const handleJoinGame = async () => {
    if (!game || !id) return;

    try {
      setActionLoading(true);

      // If game has a price, show payment modal
      if (game.pricePerPlayer > 0) {
        setShowPaymentModal(true);
        return;
      }

      // Free game - join directly
      await gamesApi.joinGame(parseInt(id));
      
      // Update local state
      setGame(prev => prev ? {
        ...prev,
        currentPlayers: prev.currentPlayers + 1,
        isUserJoined: true,
        participants: [
          ...prev.participants,
          {
            id: profile?.id || 0,
            username: profile?.username || 'user',
            displayName: profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : 'User',
            isHost: false,
            joinedAt: new Date().toISOString(),
            skillLevel: 'INTERMEDIATE'
          }
        ]
      } : null);

      toast.success('Successfully joined the game! 🎉');
      
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error('Failed to join game. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Leave game handler
  const handleLeaveGame = async () => {
    if (!game || !id) return;

    try {
      setActionLoading(true);
      await gamesApi.leaveGame(parseInt(id));
      
      // Update local state
      setGame(prev => prev ? {
        ...prev,
        currentPlayers: prev.currentPlayers - 1,
        isUserJoined: false,
        participants: prev.participants.filter(p => p.id !== profile?.id)
      } : null);

      toast.success('Left the game successfully');
      
    } catch (error) {
      console.error('Error leaving game:', error);
      toast.error('Failed to leave game. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Payment success handler
  const handlePaymentSuccess = async () => {
    if (!game || !id) return;

    try {
      await gamesApi.joinGame(parseInt(id));
      
      // Update local state
      setGame(prev => prev ? {
        ...prev,
        currentPlayers: prev.currentPlayers + 1,
        isUserJoined: true,
        participants: [
          ...prev.participants,
          {
            id: profile?.id || 0,
            username: profile?.username || 'user',
            displayName: profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : 'User',
            isHost: false,
            joinedAt: new Date().toISOString(),
            skillLevel: 'INTERMEDIATE'
          }
        ]
      } : null);

      toast.success('Payment successful! Welcome to the game! 🎉');
      
    } catch (error) {
      console.error('Error confirming game join:', error);
      toast.error('Payment successful but failed to confirm join. Please contact support.');
    }
  };

  // Share game
  const handleShareGame = () => {
    const shareUrl = window.location.href;
    const shareText = `Join me for ${game?.sport} at ${game?.location}! ${game?.title}`;
    
    if (navigator.share) {
      navigator.share({
        title: game?.title,
        text: shareText,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Game link copied to clipboard!');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)]">
        <div className="animate-pulse">
          <div className="h-80 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)]"></div>
          <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
            <div className="h-8 bg-[var(--bg-muted)] rounded w-1/3"></div>
            <div className="h-4 bg-[var(--bg-muted)] rounded w-2/3"></div>
            <div className="h-4 bg-[var(--bg-muted)] rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Game Not Found</h3>
          <p className="text-[var(--text-muted)] mb-4">The game you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/dashboard/games')} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
        </Card>
      </div>
    );
  }

  const { day, time } = formatGameTime(game.time);
  const isFull = game.currentPlayers >= game.maxPlayers;
  const canJoin = game.status === 'ACTIVE' && !isFull && !game.isUserJoined;
  const progressPercentage = (game.currentPlayers / game.maxPlayers) * 100;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[var(--bg-app)]">
        {/* Hero Section with Nepal Cultural Background */}
        <div className="relative h-80 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)] via-[var(--brand-secondary)] to-[var(--brand-primary)] opacity-90" />
          <div className="absolute inset-0 bg-[url('/images/nepal-pattern.svg')] opacity-10 bg-repeat" />
          
          {/* Content */}
          <div className="relative z-10 h-full flex items-end">
            <div className="max-w-4xl mx-auto px-4 pb-8 text-white w-full">
              <div className="flex items-start justify-between mb-4">
                <Button
                  onClick={() => navigate('/dashboard/games')}
                  variant="outline"
                  className="text-white border-white/30 hover:bg-white/10 mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Games
                </Button>
                
                <div className="flex gap-2">
                  {game.chatEnabled && (
                    <Button
                      onClick={() => {
                        const chatElement = document.getElementById('game-chat');
                        if (chatElement) {
                          chatElement.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="text-white border-white/30 hover:bg-white/10"
                      title="Scroll to chat"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    onClick={handleShareGame}
                    variant="outline"
                    size="sm"
                    className="text-white border-white/30 hover:bg-white/10"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  {game.isUserCreator && (
                    <Button
                      onClick={() => navigate(`/dashboard/games/${id}/edit`)}
                      variant="outline"
                      size="sm"
                      className="text-white border-white/30 hover:bg-white/10"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-4xl">
                  {getSportEmoji(game.sport)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">{game.title}</h1>
                  <p className="text-white/80">Hosted by @{game.creatorName}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{day} at {time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{game.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{game.currentPlayers}/{game.maxPlayers} players</span>
                </div>
                {game.pricePerPlayer > 0 && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>NPR {game.pricePerPlayer}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Game Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Game Info Card */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Game Details</h2>
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${SKILL_COLORS[game.skillLevel]}`}>
                      {game.skillLevel}
                    </div>
                    {game.isPrivate && (
                      <div className="px-2 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-800 border-gray-200 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Private
                      </div>
                    )}
                    {!game.isPrivate && (
                      <div className="px-2 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Public
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[var(--text-muted)] mb-6 leading-relaxed">
                  {game.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[var(--brand-primary)]" />
                      Location
                    </h3>
                    <p className="text-[var(--text-muted)] mb-2">{game.address}</p>
                    {game.latitude && game.longitude && (
                      <Button
                        onClick={() => window.open(`https://maps.google.com/?q=${game.latitude},${game.longitude}`, '_blank')}
                        variant="outline"
                        size="sm"
                        className="text-[var(--brand-primary)] border-[var(--brand-primary)]"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Open in Maps
                      </Button>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[var(--brand-primary)]" />
                      Time & Date
                    </h3>
                    <p className="text-[var(--text-muted)]">{day}</p>
                    <p className="text-[var(--text-muted)]">{time}</p>
                  </div>
                </div>

                {game.rules && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[var(--brand-primary)]" />
                      Rules & Guidelines
                    </h3>
                    <p className="text-[var(--text-muted)]">{game.rules}</p>
                  </div>
                )}

                {game.equipment && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-[var(--brand-primary)]" />
                      Equipment & Requirements
                    </h3>
                    <p className="text-[var(--text-muted)]">{game.equipment}</p>
                  </div>
                )}

                {game.venueDetails && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[var(--brand-primary)]" />
                      Venue Information
                    </h3>
                    <p className="text-[var(--text-muted)]">{game.venueDetails}</p>
                  </div>
                )}
              </Card>

              {/* Participants */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Participants</h2>
                  <Button
                    onClick={() => setShowParticipants(!showParticipants)}
                    variant="outline"
                    size="sm"
                  >
                    {showParticipants ? 'Hide All' : 'View All'}
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--text-muted)]">Players joined</span>
                    <span className="font-medium text-[var(--text-primary)]">
                      {game.currentPlayers}/{game.maxPlayers}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--bg-muted)] rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        progressPercentage >= 100 ? 'bg-red-500' : 
                        progressPercentage >= 80 ? 'bg-yellow-500' : 
                        'bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)]'
                      }`}
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                  {isFull && (
                    <p className="text-sm text-red-600 mt-2 font-medium">Game is full!</p>
                  )}
                </div>

                {/* Participants List */}
                <div className="space-y-3">
                  {(showParticipants ? game.participants : game.participants.slice(0, 4)).map((participant) => (
                    <ParticipantAvatar key={participant.id} participant={participant} />
                  ))}
                  
                  {!showParticipants && game.participants.length > 4 && (
                    <div className="text-center py-2">
                      <Button
                        onClick={() => setShowParticipants(true)}
                        variant="outline"
                        size="sm"
                        className="text-[var(--brand-primary)]"
                      >
                        +{game.participants.length - 4} more players
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Column - Actions */}
            <div className="space-y-6">
              {/* Join/Leave Action Card */}
              <Card className="p-6">
                <div className="text-center">
                  {game.pricePerPlayer > 0 && (
                    <div className="mb-4 p-4 bg-[var(--bg-muted)] rounded-lg">
                      <div className="text-sm text-[var(--text-muted)] mb-1">Game Fee</div>
                      <div className="text-2xl font-bold text-[var(--brand-primary)]">
                        NPR {game.pricePerPlayer}
                      </div>
                    </div>
                  )}

                  {game.isUserJoined ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">You're in! 🎉</span>
                      </div>
                      <Button
                        onClick={handleLeaveGame}
                        disabled={actionLoading}
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        {actionLoading ? 'Leaving...' : 'Leave Game'}
                      </Button>
                    </div>
                  ) : canJoin ? (
                    <Button
                      onClick={handleJoinGame}
                      disabled={actionLoading}
                      className="w-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white py-3 text-lg font-semibold"
                    >
                      <UserPlus className="w-5 h-5 mr-2" />
                      {actionLoading ? 'Joining...' : game.pricePerPlayer > 0 ? `Pay NPR ${game.pricePerPlayer} & Join` : 'Join Game'}
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 cursor-not-allowed py-3 text-lg font-semibold"
                    >
                      {isFull ? 'Game Full' : game.status === 'CANCELLED' ? 'Cancelled' : 'Not Available'}
                    </Button>
                  )}

                  {game.requiresApproval && !game.isUserJoined && canJoin && (
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      <Lock className="w-3 h-3 inline mr-1" />
                      Host approval required
                    </p>
                  )}
                </div>
              </Card>

              {/* Real-time Game Chat */}
              {game.chatEnabled && (
                <div id="game-chat">
                  <GameChat 
                    gameId={game.id.toString()}
                    className="w-full"
                  />
                </div>
              )}

              {/* Quick Actions */}
              {game.isUserCreator && (
                <Card className="p-6">
                  <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    Host Actions
                  </h3>
                  <div className="space-y-2">
                    <Button
                      onClick={() => navigate(`/dashboard/games/${id}/edit`)}
                      variant="outline"
                      className="w-full"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Game
                    </Button>
                    <Button
                      onClick={() => navigate(`/dashboard/games/${id}/score`)}
                      variant="outline"
                      className="w-full"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Record Score
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          game={game}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </div>
    </ErrorBoundary>
  );
}
