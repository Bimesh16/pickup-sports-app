import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Badge, Tooltip } from '@components/ui';
import { 
  Award, 
  Trophy, 
  Star, 
  Crown, 
  Medal, 
  Shield, 
  Zap, 
  Target, 
  Users, 
  Gamepad2,
  Lock,
  CheckCircle,
  Sparkles,
  Flame,
  Heart,
  Sword,
  Shield as ShieldIcon,
  Star as StarIcon,
  Clock,
  Calendar,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-toastify';

interface BadgesTabProps {
  profile: {
    id: string;
    badges: Badge[];
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

interface BadgeCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

const BADGE_CATEGORIES: BadgeCategory[] = [
  { id: 'achievement', name: 'Achievements', description: 'Milestone accomplishments', icon: Trophy, color: 'text-yellow-500' },
  { id: 'participation', name: 'Participation', description: 'Activity and engagement', icon: Calendar, color: 'text-blue-500' },
  { id: 'social', name: 'Social', description: 'Teamwork and community', icon: Users, color: 'text-green-500' },
  { id: 'skill', name: 'Skill', description: 'Performance and ability', icon: Target, color: 'text-purple-500' }
];

const RARITY_COLORS = {
  common: 'bg-gray-100 text-gray-700 border-gray-300',
  rare: 'bg-blue-100 text-blue-700 border-blue-300',
  epic: 'bg-purple-100 text-purple-700 border-purple-300',
  legendary: 'bg-yellow-100 text-yellow-700 border-yellow-300'
};

const RARITY_ICONS = {
  common: Star,
  rare: Award,
  epic: Crown,
  legendary: Trophy
};

// Confetti animation component
const ConfettiAnimation: React.FC<{ show: boolean; onComplete: () => void }> = ({ show, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!show) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiPieces: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    // Create confetti pieces
    for (let i = 0; i < 100; i++) {
      confettiPieces.push({
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        color: ['#DC143C', '#003893', '#ffffff', '#FFD700', '#FF6B6B'][Math.floor(Math.random() * 5)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confettiPieces.forEach((piece, index) => {
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.rotation += piece.rotationSpeed;
        piece.vy += 0.1; // gravity

        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate((piece.rotation * Math.PI) / 180);
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
        ctx.restore();

        // Remove pieces that are off screen
        if (piece.y > canvas.height + 10) {
          confettiPieces.splice(index, 1);
        }
      });

      if (confettiPieces.length > 0) {
        animationId = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ background: 'transparent' }}
    />
  );
};

export default function BadgesTab({ profile }: BadgesTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);

  // Load all available badges
  useEffect(() => {
    const loadAllBadges = async () => {
      try {
        // Enhanced Nepal-themed badges
        const mockAllBadges: Badge[] = [
          // Achievement badges - Nepal Cultural
          { id: '1', name: 'पहिलो खेल 🎮', description: 'Started your sports journey in Nepal - धन्यवाद!', icon: '🎮', category: 'achievement', rarity: 'common', earnedAt: '2024-01-15' },
          { id: '2', name: 'Himalayan Century 🏔️', description: 'Played 100 games like climbing 100 peaks!', icon: '🏔️', category: 'achievement', rarity: 'epic', progress: 45, maxProgress: 100 },
          { id: '3', name: 'Everest Spirit 🔥', description: 'Unstoppable 10-game win streak! Like reaching the summit!', icon: '🔥', category: 'achievement', rarity: 'legendary', progress: 7, maxProgress: 10 },
          { id: '4', name: 'Sherpa Perfect ⭐', description: 'Achieved 5.0 fair play - the Sherpa way!', icon: '⭐', category: 'achievement', rarity: 'rare', earnedAt: '2024-03-10' },
          { id: '5', name: 'Prayer Flag Victory 🙏', description: 'Won 50 games with honor and respect', icon: '🙏', category: 'achievement', rarity: 'epic', progress: 28, maxProgress: 50 },
          
          // Participation badges - Nepal Cultural
          { id: '6', name: 'सुर्योदय Warrior 🌄', description: 'Early morning games - Sunrise Champion!', icon: '🌄', category: 'participation', rarity: 'common', progress: 8, maxProgress: 10 },
          { id: '7', name: 'Temple Bell Evening 🔔', description: '10 evening games during temple time', icon: '🔔', category: 'participation', rarity: 'common', progress: 6, maxProgress: 10 },
          { id: '8', name: 'Dashain Champion 🎉', description: 'Active during all festival seasons', icon: '🎉', category: 'participation', rarity: 'rare', progress: 3, maxProgress: 5 },
          { id: '9', name: 'Monsoon Warrior ☔', description: 'Played through all weather conditions', icon: '☔', category: 'participation', rarity: 'epic', progress: 12, maxProgress: 15 },
          { id: '10', name: 'Rhododendron Regular 🌺', description: 'Consistent weekly player - like Nepal\'s national flower!', icon: '🌺', category: 'participation', rarity: 'rare', earnedAt: '2024-02-15' },
          
          // Social badges - Nepal Cultural
          { id: '11', name: 'Gurkha Team Spirit 👥', description: 'Joined 5 teams with the courage of a Gurkha!', icon: '👥', category: 'social', rarity: 'rare', earnedAt: '2024-02-20' },
          { id: '12', name: 'Kumari Captain 👑', description: 'Lead your team like the living goddess!', icon: '👑', category: 'social', rarity: 'epic', progress: 0, maxProgress: 1 },
          { id: '13', name: 'Buddha Mentor 🧘', description: 'Guided 5 new players with wisdom and patience', icon: '🧘', category: 'social', rarity: 'rare', progress: 2, maxProgress: 5 },
          { id: '14', name: 'Kathmandu Builder 🏯', description: 'Built the sports community like ancient temples', icon: '🏯', category: 'social', rarity: 'legendary', progress: 1, maxProgress: 3 },
          { id: '15', name: 'Namaste Friend 🙏', description: 'Made friends with 20 different players', icon: '🤝', category: 'social', rarity: 'epic', progress: 12, maxProgress: 20 },
          
          // Skill badges - Nepal Cultural  
          { id: '16', name: 'Annapurna Shooter 🎯', description: 'Sharp like mountain peaks - 50 perfect shots!', icon: '🎯', category: 'skill', rarity: 'rare', progress: 23, maxProgress: 50 },
          { id: '17', name: 'Lhotse Defender 🛡️', description: 'Strong defense like the mighty Lhotse peak', icon: '🛡️', category: 'skill', rarity: 'common', progress: 67, maxProgress: 100 },
          { id: '18', name: 'Khumbu Playmaker ⚡', description: 'Create paths like Sherpa guides through Khumbu', icon: '⚡', category: 'skill', rarity: 'epic', progress: 89, maxProgress: 200 },
          { id: '19', name: 'Multi-Sport Yak 🐃', description: 'Strong in 5 sports like a tireless yak!', icon: '🐃', category: 'skill', rarity: 'rare', progress: 3, maxProgress: 5 },
          { id: '20', name: 'Sagarmatha Legend 🏔️', description: 'Reached legendary status in all sports!', icon: '🏔️', category: 'skill', rarity: 'legendary', progress: 0, maxProgress: 1 },
          
          // Special Nepal Heritage badges
          { id: '21', name: 'Tiger Heart 🐅', description: 'Fearless competitor with the spirit of Royal Bengal Tiger', icon: '🐅', category: 'achievement', rarity: 'legendary', progress: 4, maxProgress: 10 },
          { id: '22', name: 'Yeti Strength 👹', description: 'Legendary power in competitive games', icon: '👹', category: 'skill', rarity: 'legendary', progress: 0, maxProgress: 1 },
          { id: '23', name: 'Pashupatinath Blessing 🕉️', description: 'Blessed by the gods with exceptional fair play', icon: '🕉️', category: 'social', rarity: 'legendary', progress: 0, maxProgress: 1 }
        ];

        setAllBadges(mockAllBadges);
      } catch (error) {
        console.error('Error loading badges:', error);
      }
    };

    loadAllBadges();
  }, []);

  // Show confetti on first visit to badges tab
  useEffect(() => {
    if (!hasShownConfetti && allBadges.length > 0) {
      const earnedBadges = allBadges.filter(badge => badge.earnedAt);
      if (earnedBadges.length > 0) {
        setShowConfetti(true);
        setHasShownConfetti(true);
        
        // Store in session storage to prevent showing again
        sessionStorage.setItem('badges-confetti-shown', 'true');
      }
    }
  }, [allBadges, hasShownConfetti]);

  // Check if confetti was already shown in this session
  useEffect(() => {
    const confettiShown = sessionStorage.getItem('badges-confetti-shown');
    if (confettiShown) {
      setHasShownConfetti(true);
    }
  }, []);

  // Filter badges by category
  const filteredBadges = allBadges.filter(badge => 
    selectedCategory === 'all' || badge.category === selectedCategory
  );

  // Group badges by earned/locked
  const earnedBadges = filteredBadges.filter(badge => badge.earnedAt);
  const lockedBadges = filteredBadges.filter(badge => !badge.earnedAt);

  // Handle confetti completion
  const handleConfettiComplete = () => {
    setShowConfetti(false);
  };

  // Get badge progress percentage
  const getBadgeProgress = (badge: Badge) => {
    if (badge.earnedAt) return 100;
    if (badge.progress && badge.maxProgress) {
      return Math.min((badge.progress / badge.maxProgress) * 100, 100);
    }
    return 0;
  };

  // Get rarity icon
  const getRarityIcon = (rarity: string) => {
    const IconComponent = RARITY_ICONS[rarity as keyof typeof RARITY_ICONS] || Star;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Confetti Animation */}
      <ConfettiAnimation show={showConfetti} onComplete={handleConfettiComplete} />

      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Badges & Achievements</h3>
            <p className="text-[var(--text-muted)]">
              Earn badges by playing games, joining teams, and achieving milestones
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[var(--brand-primary)]">
              {earnedBadges.length}
            </div>
            <div className="text-sm text-[var(--text-muted)]">
              of {allBadges.length} badges earned
            </div>
          </div>
        </div>
      </Card>

      {/* Category Filter */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[var(--brand-primary)] text-white'
                : 'bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--bg-contrast)]'
            }`}
          >
            All Badges
          </button>
          {BADGE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-[var(--brand-primary)] text-white'
                  : 'bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--bg-contrast)]'
              }`}
            >
              <category.icon className={`w-4 h-4 ${category.color}`} />
              {category.name}
            </button>
          ))}
        </div>
      </Card>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h4 className="text-lg font-semibold text-[var(--text-primary)]">Earned Badges</h4>
            <Badge variant="success">
              {earnedBadges.length}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {earnedBadges.map((badge) => (
              <Tooltip key={badge.id} content={badge.description}>
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">{badge.icon}</div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-[var(--text-primary)] group-hover:text-green-700">
                        {badge.name}
                      </h5>
                      <div className="flex items-center gap-2">
                        {getRarityIcon(badge.rarity)}
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${RARITY_COLORS[badge.rarity]}`}>
                          {badge.rarity}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-green-600 font-medium">
                    Earned on {new Date(badge.earnedAt!).toLocaleDateString()}
                  </div>
                </div>
              </Tooltip>
            ))}
          </div>
        </Card>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-[var(--text-muted)]" />
            <h4 className="text-lg font-semibold text-[var(--text-primary)]">Available Badges</h4>
            <Badge variant="default">
              {lockedBadges.length}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedBadges.map((badge) => {
              const progress = getBadgeProgress(badge);
              
              return (
                <Tooltip key={badge.id} content={badge.description}>
                  <div className="p-4 bg-[var(--bg-muted)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg-contrast)] transition-all duration-200 cursor-pointer group opacity-75">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl grayscale">{badge.icon}</div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)]">
                          {badge.name}
                        </h5>
                        <div className="flex items-center gap-2">
                          {getRarityIcon(badge.rarity)}
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${RARITY_COLORS[badge.rarity]}`}>
                            {badge.rarity}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {badge.progress && badge.maxProgress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-[var(--text-muted)]">
                          <span>Progress</span>
                          <span>{badge.progress}/{badge.maxProgress}</span>
                        </div>
                        <div className="w-full bg-[var(--bg-contrast)] rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </Card>
      )}

      {/* Badge Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {BADGE_CATEGORIES.map((category) => {
          const categoryBadges = allBadges.filter(badge => badge.category === category.id);
          const earnedInCategory = categoryBadges.filter(badge => badge.earnedAt).length;
          
          return (
            <Card key={category.id} className="p-4 text-center">
              <category.icon className={`w-8 h-8 mx-auto mb-2 ${category.color}`} />
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                {earnedInCategory}
              </div>
              <div className="text-sm text-[var(--text-muted)]">
                {category.name}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-1">
                {earnedInCategory}/{categoryBadges.length} earned
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
