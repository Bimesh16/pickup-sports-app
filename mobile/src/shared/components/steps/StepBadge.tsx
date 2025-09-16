// src/components/steps/StepBadge.tsx - Step 3: Player Badge Information

import React from 'react';
import { Camera, Shirt, Trophy, Star, Instagram, Music, Upload, X } from 'lucide-react';
import { StepBadgeProps } from '../../types/registration';
// preferred sports and skill levels removed from registration

const StepBadge: React.FC<StepBadgeProps> = ({
  formData,
  setFormData,
  errors,
  fileInputRef,
  captureInputRef,
  handleAvatarUpload,
  compressing,
  avatarError,
  socialErrors,
  setSocialErrors,
  validateSocialHandle
}) => {
  const handleSocialChange = (platform: string, value: string) => {
    const cleanValue = value.replace(/[^@a-zA-Z0-9._]/g, '');
    setFormData((prev: any) => ({ ...prev, [platform]: cleanValue }));
    const error = validateSocialHandle(platform, cleanValue);
    setSocialErrors((prev: any) => ({ ...prev, [platform]: error }));
  };

  const handleSocialBlur = (platform: string, value: string) => {
    if (!value) {
      setFormData((prev: any) => ({ ...prev, [platform]: '' }));
      setSocialErrors((prev: any) => ({ ...prev, [platform]: '' }));
      return;
    }
    
    let processedValue = value.trim();
    if (!processedValue.startsWith('@')) {
      processedValue = '@' + processedValue;
    }
    
    setFormData((prev: any) => ({ ...prev, [platform]: processedValue }));
    const error = validateSocialHandle(platform, processedValue);
    setSocialErrors((prev: any) => ({ ...prev, [platform]: error }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Badge Preview */}
      <div className="rounded-2xl bg-white/90 p-4 ring-1 ring-black/5">
        <div className="flex items-center gap-4">
          <div className="relative">
            {formData.avatar ? (
              <img src={formData.avatar} alt="Preview avatar" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow">📸</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-800 truncate">{`${formData.firstName} ${formData.lastName}`.trim() || 'Display Name'}</div>
            <div className="text-xs text-nepal-crimson truncate">@{formData.username?.toLowerCase() || 'tag'}</div>
            <div className="text-xs text-gray-600">Jersey #{formData.jerseyNumber || '—'}</div>
          </div>
        </div>
      </div>
      {/* Avatar Upload */}
      <div>
        <label className="block text-sm font-medium text-[#E9EEF5] mb-2">
          Player Photo
        </label>
        <div className="flex items-center gap-4">
          {/* Avatar Preview */}
          <div className="relative">
            {formData.avatar ? (
              <div className="relative">
                <img
                  src={formData.avatar}
                  alt="Player avatar"
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev: any) => ({ ...prev, avatar: '' }))}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                <Camera className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Upload Buttons */}
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={compressing}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-white bg-nepal-crimson rounded-lg hover:bg-nepal-crimson/90 transition-colors disabled:opacity-50 min-h-[48px] focus:ring-2 focus:ring-nepal-crimson/50"
              >
                <Upload className="h-4 w-4" />
                {compressing ? 'Uploading...' : 'Upload Photo'}
              </button>
              <button
                type="button"
                onClick={() => captureInputRef.current?.click()}
                disabled={compressing}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-white bg-nepal-blue rounded-lg hover:bg-nepal-blue/90 transition-colors disabled:opacity-50 min-h-[48px] focus:ring-2 focus:ring-nepal-blue/50"
              >
                <Camera className="h-4 w-4" />
                Take Photo
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={captureInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleCapture}
              className="hidden"
            />
            
            <p className="text-xs text-[#E9EEF5]">
              Upload a clear photo of yourself. Max 5MB, JPG/PNG format.
            </p>
          </div>
        </div>
        
        {avatarError && (
          <p className="mt-1 text-sm text-nepal-crimson">{avatarError}</p>
        )}
      </div>

      {/* Jersey Number */}
      <div>
        <label htmlFor="jerseyNumber" className="block text-sm font-medium text-[#E9EEF5] mb-2">
          Jersey Number
        </label>
        <div className="relative">
          <Shirt className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#C7D1E0]" />
          <input
            type="text"
            placeholder="Your jersey number (optional)"
            id="jerseyNumber"
            value={formData.jerseyNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              setFormData((prev: any) => ({ ...prev, jerseyNumber: value }));
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nepal-crimson focus:border-transparent transition-all bg-white text-gray-900 placeholder-[#95A3B6]"
          />
        </div>
        {errors?.jerseyNumber && (
          <p className="mt-1 text-sm text-nepal-crimson">{errors.jerseyNumber}</p>
        )}
      </div>

      {/* Preferred Sport and Skill Level removed from registration; moved to profile later */}

      {/* Social Media Handles */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-[#E9EEF5]">Social Media (Optional)</h3>
        
        {/* Instagram */}
        <div>
          <label htmlFor="instagram" className="block text-sm font-medium text-[#E9EEF5] mb-2">
            Instagram Handle
          </label>
          <div className="relative">
            <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#C7D1E0]" />
            <input
              type="text"
              placeholder="@yourusername"
              id="instagram"
              value={formData.instagram}
              onChange={(e) => handleSocialChange('instagram', e.target.value)}
              onBlur={(e) => handleSocialBlur('instagram', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nepal-crimson focus:border-transparent transition-all bg-white text-gray-900 placeholder-[#95A3B6]"
            />
          </div>
          {socialErrors?.instagram && (
            <p className="mt-1 text-sm text-nepal-crimson">{socialErrors.instagram}</p>
          )}
        </div>

        {/* TikTok */}
        <div>
          <label htmlFor="tiktok" className="block text-sm font-medium text-[#E9EEF5] mb-2">
            TikTok Handle
          </label>
          <div className="relative">
            <Music className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#C7D1E0]" />
            <input
              type="text"
              placeholder="@yourusername"
              id="tiktok"
              value={formData.tiktok}
              onChange={(e) => handleSocialChange('tiktok', e.target.value)}
              onBlur={(e) => handleSocialBlur('tiktok', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nepal-crimson focus:border-transparent transition-all bg-white text-gray-900 placeholder-[#95A3B6]"
            />
          </div>
          {socialErrors?.tiktok && (
            <p className="mt-1 text-sm text-nepal-crimson">{socialErrors.tiktok}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepBadge;
