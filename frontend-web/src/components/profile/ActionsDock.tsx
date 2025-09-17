import React, { useState } from 'react';
import { Edit3, Share2, QrCode, Copy, Check } from 'lucide-react';
import { toast } from 'react-toastify';

interface Props {
  inviteUrl: string;
  fetchQr: () => Promise<{ pngDataUrl: string }>;
  isEditing: boolean;
  onToggleEdit: () => void;
  className?: string;
}

const ActionsDock: React.FC<Props> = ({
  inviteUrl,
  fetchQr,
  isEditing,
  onToggleEdit,
  className = ''
}) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out my pickup sports profile!',
          text: 'Join me for some pickup sports!',
          url: inviteUrl
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(inviteUrl);
        toast.success('Profile link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(inviteUrl);
        toast.success('Profile link copied to clipboard!');
      } catch (clipboardError) {
        toast.error('Failed to share profile');
      }
    }
  };

  const handleShowQR = async () => {
    try {
      const qrData = await fetchQr();
      setQrDataUrl(qrData.pngDataUrl);
      setShowQRModal(true);
    } catch (error) {
      console.error('Error fetching QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success('Invite link copied to clipboard!');
    } catch (error) {
      console.error('Error copying invite:', error);
      toast.error('Failed to copy invite link');
    }
  };

  const buttons = [
    {
      id: 'edit',
      icon: isEditing ? Check : Edit3,
      label: isEditing ? 'Done' : 'Edit',
      onClick: onToggleEdit,
      testId: 'dock-edit'
    },
    {
      id: 'share',
      icon: Share2,
      label: 'Share',
      onClick: handleShare,
      testId: 'dock-share'
    },
    {
      id: 'qr',
      icon: QrCode,
      label: 'QR',
      onClick: handleShowQR,
      testId: 'dock-qr'
    },
    {
      id: 'copy',
      icon: Copy,
      label: 'Copy',
      onClick: handleCopyInvite,
      testId: 'dock-copy'
    }
  ];

  return (
    <>
      <div className={`flex items-center gap-1 bg-surface-0/92 backdrop-blur rounded-full p-1 border border-border shadow-lg ${className}`}>
        {buttons.map((button) => {
          const Icon = button.icon;
          return (
            <button
              key={button.id}
              onClick={button.onClick}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-medium transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-nepal-blue focus:ring-offset-2 ${
                button.id === 'edit' && isEditing
                  ? 'bg-nepal-crimson text-white shadow-md'
                  : 'text-text-muted hover:text-nepal-blue hover:bg-surface-1'
              }`}
              aria-label={button.label}
              data-testid={button.testId}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{button.label}</span>
            </button>
          );
        })}
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Share Profile
              </h3>
              {qrDataUrl && (
                <div className="mb-4">
                  <img
                    src={qrDataUrl}
                    alt="Profile QR Code"
                    className="mx-auto rounded-lg border border-gray-200 dark:border-gray-600"
                  />
                </div>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Scan this QR code to view the profile
              </p>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-full px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:brightness-110 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActionsDock;
