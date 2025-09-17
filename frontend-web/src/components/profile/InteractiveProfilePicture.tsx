import React, { useState, useRef, useCallback } from 'react';
import { Button, Modal } from '@components/ui';
import { 
  Camera, 
  Upload, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Save, 
  X,
  User,
  Sparkles,
  Crown
} from 'lucide-react';

interface InteractiveProfilePictureProps {
  currentAvatar?: string;
  displayName: string;
  onAvatarUpdate: (newAvatarUrl: string) => void;
  xp?: number;
  level?: number;
}

const InteractiveProfilePicture: React.FC<InteractiveProfilePictureProps> = ({
  currentAvatar,
  displayName,
  onAvatarUpdate,
  xp = 0,
  level = 1
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSave = async () => {
    if (!selectedImage || !canvasRef.current) return;

    setIsUploading(true);
    try {
      // Create canvas for image processing
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = async () => {
        const size = 200;
        canvas.width = size;
        canvas.height = size;

        // Clear canvas
        ctx.clearRect(0, 0, size, size);

        // Apply transformations
        ctx.translate(size / 2, size / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);

        // Draw image
        ctx.drawImage(img, -size / 2, -size / 2, size, size);

        // Convert to blob
        canvas.toBlob(async (blob) => {
          if (blob) {
            // In a real app, upload to your server
            // For now, create object URL for demo
            const newAvatarUrl = URL.createObjectURL(blob);
            onAvatarUpdate(newAvatarUrl);
            setIsEditing(false);
            setSelectedImage(null);
          }
        }, 'image/jpeg', 0.9);
      };
      img.src = selectedImage;
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getLevelBorder = (level: number) => {
    if (level >= 10) return 'ring-yellow-400 ring-4';
    if (level >= 5) return 'ring-purple-400 ring-4';
    if (level >= 3) return 'ring-blue-400 ring-3';
    return 'ring-green-400 ring-2';
  };

  const getLevelIcon = (level: number) => {
    if (level >= 10) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (level >= 5) return <Sparkles className="w-5 h-5 text-purple-400" />;
    return null;
  };

  return (
    <>
      <div className="relative group">
        {/* Profile Picture */}
        <div className={`relative w-32 h-32 rounded-full overflow-hidden ${getLevelBorder(level)} bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] p-1`}>
          <div className="w-full h-full rounded-full overflow-hidden bg-[var(--bg-surface)]">
            {currentAvatar ? (
              <img 
                src={currentAvatar} 
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white text-3xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Level Badge */}
        <div className="absolute -top-2 -right-2 bg-[var(--brand-primary)] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
          {getLevelIcon(level) || level}
        </div>

        {/* XP Progress Ring */}
        <div className="absolute inset-0 rounded-full">
          <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="2"
            />
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${((xp % 100) / 100) * 301.6} 301.6`}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--brand-primary)" />
                <stop offset="100%" stopColor="var(--brand-secondary)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Edit Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <Camera className="w-8 h-8" />
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Profile Picture">
        <div className="space-y-6">
          {selectedImage && (
            <div className="space-y-4">
              {/* Preview */}
              <div className="flex justify-center">
                <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-[var(--brand-primary)]">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="w-full h-full object-cover transition-all duration-300"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`
                    }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-4">
                {/* Zoom Control */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Zoom: {Math.round(zoom * 100)}%
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                      variant="outline"
                      size="sm"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                      variant="outline"
                      size="sm"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Rotation Control */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Rotation: {rotation}°
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setRotation((rotation - 90) % 360)}
                      variant="outline"
                      size="sm"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => setRotation((rotation + 90) % 360)}
                      variant="outline"
                      size="sm"
                    >
                      <RotateCcw className="w-4 h-4 transform scale-x-[-1]" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={isUploading}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isUploading ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>

              {/* Hidden Canvas for Processing */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default InteractiveProfilePicture;
