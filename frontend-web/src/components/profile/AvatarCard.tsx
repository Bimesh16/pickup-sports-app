import React, { useRef, useState } from 'react';
import { Camera, User } from 'lucide-react';
import { Profile, COUNTRIES, countryFlag } from '../../pages/dashboard/profile/profile.schema';

interface Props {
  profile: Profile;
  editing: boolean;
  onChange: (patch: Partial<Profile>) => void;
}

const AvatarCard: React.FC<Props> = ({ profile, editing, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Read file as data URL for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onChange({ avatarUrl: dataUrl });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setIsUploading(false);
    }
  };

  const handleAvatarClick = () => {
    if (editing) {
      fileInputRef.current?.click();
    }
  };

  const getGenderDisplay = (gender?: string) => {
    switch (gender) {
      case 'male': return '♂ Male';
      case 'female': return '♀ Female';
      case 'nonbinary': return '⚧ Non-binary';
      case 'prefer_not_to_say': return 'Prefer not to say';
      default: return null;
    }
  };

  const getCountryDisplay = (nationality?: string) => {
    if (!nationality) return null;
    const flag = countryFlag(nationality);
    const country = COUNTRIES.find(c => c.code === nationality);
    const name = country ? country.name : nationality;
    return `${flag} ${name}`;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Container */}
      <div className="relative group">
        <div className="relative w-32 h-32 sm:w-36 sm:h-36">
          {/* Avatar Ring - Solid crimson → blue */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-nepal-crimson to-nepal-blue p-1">
            <div className="w-full h-full rounded-full bg-white p-1">
              {/* Avatar Image */}
              <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Status Dot */}
          <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm" />

          {/* Upload Overlay */}
          {editing && (
            <div
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              onClick={handleAvatarClick}
            >
              <Camera className="w-6 h-6 text-white" />
            </div>
          )}

          {/* Upload Button for Mobile */}
          {editing && (
            <button
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors sm:hidden"
              onClick={handleAvatarClick}
            >
              <Camera className="w-4 h-4" />
            </button>
          )}

          {/* Loading Overlay */}
          {isUploading && (
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="sr-only"
          id="avatar-upload"
          aria-label="Upload profile picture"
        />
        <label htmlFor="avatar-upload" className="sr-only">
          Upload profile picture
        </label>
      </div>

      {/* Name and Username */}
      <div className="text-center">
        <h1 className="text-[32px] leading-[36px] font-extrabold tracking-tight text-text-strong">
          {profile.displayName}
        </h1>
        <p className="text-[14px] font-medium text-text-muted">@{profile.username}</p>
        <p className="text-[14px] font-medium text-text-muted">{profile.email}</p>
      </div>

      {/* Gender and Nationality */}
      <div className="flex flex-col items-center gap-2 text-sm">
        {editing ? (
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Gender Select */}
            <select
              value={profile.gender || ''}
              onChange={(e) => onChange({ gender: e.target.value as any })}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="nonbinary">Non-binary</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>

            {/* Country Select */}
            <select
              value={profile.nationality || ''}
              onChange={(e) => onChange({ nationality: e.target.value })}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select country</option>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {getGenderDisplay(profile.gender) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[12px] bg-[#FEF2F2] text-[#991B1B] ring-1 ring-[#FECACA]">
                {getGenderDisplay(profile.gender)}
              </span>
            )}
            {getCountryDisplay(profile.nationality) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[12px] bg-[#EEF2FF] text-[#1E40AF] ring-1 ring-[#C7D2FE]">
                {getCountryDisplay(profile.nationality)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarCard;
