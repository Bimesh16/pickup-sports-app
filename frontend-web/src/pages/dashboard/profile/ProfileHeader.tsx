import React, { useState } from 'react';
import { Button, Card, Badge, Modal } from '@components/ui';
import { 
  Camera,
  Edit3, 
  Share2, 
  QrCode, 
  Copy, 
  Check
} from 'lucide-react';
import { UserProfile } from './types';
import { XP_CONFIG } from '../ProfilePage';

interface ProfileHeaderProps {
  profile: UserProfile;
  onEdit: () => void;
  onShare: () => void;
  onQRCode: () => void;
  onCopyInvite: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  profile, 
  onEdit, 
  onShare, 
  onQRCode, 
  onCopyInvite 
}) => {
  const [showQRCode, setShowQRCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const getRankConfig = (rank: string) => {
    return XP_CONFIG[rank as keyof typeof XP_CONFIG] || XP_CONFIG.Learner;
  };

  const getXPProgress = () => {
    const config = getRankConfig(profile.rank);
    const current = profile.xp - config.min;
    const total = config.max - config.min;
    return Math.min((current / total) * 100, 100);
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(`Join me on Pickup Sports! Use my invite code: ${profile.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopyInvite();
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-[var(--brand-primary)]/5 to-[var(--brand-secondary)]/5 border-[var(--brand-primary)]/20">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center md:items-start">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center text-white text-2xl font-bold">
              {profile.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt={profile.firstName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                profile.firstName[0] + profile.lastName[0]
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--brand-primary)] rounded-full flex items-center justify-center text-white hover:bg-[var(--brand-primary)]/90 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mt-4 text-center md:text-left">
            <h1 className="text-2xl font-bold text-[var(--text)]">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="text-[var(--text-muted)]">@{profile.username}</p>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-1 text-xs rounded-full font-medium ${getRankConfig(profile.rank).color} bg-current/10`}>
                {profile.rank}
              </span>
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <div className="flex-1">
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--text-muted)]">XP Progress</span>
              <span className="font-semibold">{profile.xp} XP</span>
            </div>
            <div className="w-full bg-[var(--bg-muted)] rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] h-3 rounded-full transition-all duration-500"
                style={{ width: `${getXPProgress()}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
              <span>{getRankConfig(profile.rank).min} XP</span>
              <span>{getRankConfig(profile.rank).max} XP</span>
            </div>
          </div>

          <div className="text-sm text-[var(--text-muted)] mb-4">
            <span className="font-semibold text-[var(--brand-primary)]">Game face on, {profile.firstName}!</span> 🏆
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={onEdit} variant="outline" size="sm">
              <Edit3 className="w-4 h-4 mr-1" />
              Edit Profile
            </Button>
            <Button onClick={onShare} variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
            <Button onClick={() => setShowQRCode(true)} variant="outline" size="sm">
              <QrCode className="w-4 h-4 mr-1" />
              QR Code
            </Button>
            <Button 
              onClick={handleCopyInvite} 
              variant="outline" 
              size="sm"
              className={copied ? 'bg-green-100 text-green-700' : ''}
            >
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? 'Copied!' : 'Copy Invite'}
            </Button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <Modal isOpen={showQRCode} onClose={() => setShowQRCode(false)} size="sm">
          <div className="text-center p-6">
            <h3 className="text-lg font-semibold mb-4">Your Profile QR Code</h3>
            <div className="w-48 h-48 bg-[var(--bg-muted)] rounded-lg flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-24 h-24 text-[var(--text-muted)]" />
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Share this QR code to let others find your profile
            </p>
          </div>
        </Modal>
      )}
    </Card>
  );
};

export default ProfileHeader;
