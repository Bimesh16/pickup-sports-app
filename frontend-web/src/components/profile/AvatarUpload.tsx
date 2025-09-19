import React, { useState, useRef } from 'react';
import { Camera, Upload, X, AlertCircle, Check } from 'lucide-react';
import { useUploadAvatar } from '@hooks/useProfile';
import { avatarSchema } from '@lib/validation';
import { theme } from '@styles/theme';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  displayName?: string;
  onUploadSuccess?: (avatarUrl: string) => void;
  size?: number;
}

export default function AvatarUpload({ 
  currentAvatarUrl, 
  displayName, 
  onUploadSuccess,
  size = 80 
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadAvatar = useUploadAvatar();

  const handleFileSelect = async (file: File) => {
    setUploadError(null);
    
    // Validate file using zod schema
    try {
      avatarSchema.parse({ file });
    } catch (error: any) {
      const errorMessage = error.errors?.[0]?.message || 'Invalid file';
      setUploadError(errorMessage);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      const result = await uploadAvatar.mutateAsync(file);
      onUploadSuccess?.(result.avatarUrl);
      setPreviewUrl(null); // Clear preview after successful upload
    } catch (error: any) {
      setUploadError(error.message || 'Upload failed');
      setPreviewUrl(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const avatarSrc = previewUrl || currentAvatarUrl;
  const initials = displayName?.[0]?.toUpperCase() || 'U';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Avatar Display */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: '50%',
          cursor: 'pointer',
          border: dragActive ? `2px dashed ${theme.colors.primary}` : '2px solid transparent',
          transition: 'all 0.2s ease',
        }}
      >
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt="Profile avatar"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              opacity: uploadAvatar.isPending ? 0.7 : 1,
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              backgroundColor: theme.colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: size * 0.3,
              fontWeight: 'bold',
              opacity: uploadAvatar.isPending ? 0.7 : 1,
            }}
          >
            {initials}
          </div>
        )}

        {/* Upload Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: dragActive || uploadAvatar.isPending ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          {uploadAvatar.isPending ? (
            <div style={{ color: 'white', fontSize: 12, textAlign: 'center' }}>
              Uploading...
            </div>
          ) : (
            <Camera size={size * 0.25} color="white" />
          )}
        </div>

        {/* Preview Clear Button */}
        {previewUrl && !uploadAvatar.isPending && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearPreview();
            }}
            style={{
              position: 'absolute',
              top: -8,
              right: -8,
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: theme.colors.error,
              color: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={12} />
          </button>
        )}

        {/* Success Indicator */}
        {uploadAvatar.isSuccess && (
          <div
            style={{
              position: 'absolute',
              top: -8,
              right: -8,
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: theme.colors.success || '#10B981',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={12} />
          </div>
        )}
      </div>

      {/* Upload Instructions */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ 
          color: theme.colors.muted, 
          fontSize: 14, 
          margin: 0,
          marginBottom: 4 
        }}>
          Click to upload or drag & drop
        </p>
        <p style={{ 
          color: theme.colors.muted, 
          fontSize: 12, 
          margin: 0 
        }}>
          JPEG, PNG, WebP • Max 5MB
        </p>
      </div>

      {/* Error Display */}
      {uploadError && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          backgroundColor: theme.colors.error + '10',
          color: theme.colors.error,
          borderRadius: 6,
          fontSize: 12,
        }}>
          <AlertCircle size={14} />
          {uploadError}
        </div>
      )}

      {/* Upload Button Alternative */}
      <button
        onClick={handleClick}
        disabled={uploadAvatar.isPending}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          backgroundColor: 'transparent',
          color: theme.colors.primary,
          border: `1px solid ${theme.colors.primary}`,
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          cursor: uploadAvatar.isPending ? 'not-allowed' : 'pointer',
          opacity: uploadAvatar.isPending ? 0.6 : 1,
        }}
      >
        <Upload size={14} />
        {uploadAvatar.isPending ? 'Uploading...' : 'Choose File'}
      </button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}