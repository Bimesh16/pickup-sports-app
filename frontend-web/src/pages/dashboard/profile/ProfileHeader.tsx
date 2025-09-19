import React, { useState } from 'react';
import { Profile, getInviteQr, COUNTRIES } from './profile.schema';
import ActionsDock from '@components/profile/ActionsDock';
import EditProfileModal from '@components/EditProfileModal';
import { useAuth } from '@hooks/useAuth';
import { toast } from 'react-toastify';
import { useReducedMotion } from 'framer-motion';

interface Props {
  profile: Profile;
  editing: boolean;
  onToggleEdit: () => void;
  onChange: (patch: Partial<Profile>) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

const ProfileHeader: React.FC<Props> = ({
  profile,
  editing,
  onToggleEdit,
  onChange,
  onSave,
  onCancel,
  saving
}) => {
  const { logout } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const inviteUrl = `${window.location.origin}/profile/${profile.username}`;
  const shouldReduceMotion = useReducedMotion();

  // Helper function to get current value (draft or profile)
  const getCurrentValue = (field: keyof Profile) => {
    // This assumes the parent component passes the merged draft+profile data
    // If not, we'd need to receive draft as a separate prop
    return profile[field];
  };

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleModalSave = async (updatedProfile: Partial<Profile>) => {
    // Update the profile with the changes from the modal
    Object.keys(updatedProfile).forEach(key => {
      onChange({ [key]: updatedProfile[key as keyof Profile] });
    });
    
    // Call the parent's save function
    await onSave();
    setShowEditModal(false);
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    onCancel(); // Reset any pending changes
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // Read file as data URL for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onChange({ avatarUrl: dataUrl });
    };
    reader.readAsDataURL(file);
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
    const country = COUNTRIES.find(c => c.code === nationality);
    return country ? `${country.flag} ${country.name}` : nationality;
  };

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success('Successfully signed out!');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  return (
    <div className={`transform transition-all duration-500 ${shouldReduceMotion ? '' : 'hover:scale-[1.01]'} animate-fadeIn`} data-testid="profile-header">
      <div className="relative rounded-2xl max-w-screen-2xl mx-auto shadow-2xl overflow-hidden">
        {/* Deep Nepal Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-nepal-blue via-nepal-blue/90 to-nepal-crimson">
          {/* Dhaka Textile Pattern Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
        </div>
        
        {/* Auto Scrim for Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" data-testid="header-scrim" />
        
        {/* Micro-ornaments */}
        {/* Everest Diamond - Top Left */}
        <div className="absolute top-4 left-4 z-20" data-testid="everest-diamond">
          <div className="w-10 h-10 relative">
            <svg width="40" height="40" viewBox="0 0 24 24" className="text-white/90 drop-shadow-lg">
              <path d="M12 2L8 8L12 14L16 8L12 2Z" fill="currentColor" opacity="0.8"/>
              <path d="M10 6L12 8L14 6L12 4L10 6Z" fill="currentColor" opacity="0.6"/>
              <path d="M11 4L12 5L13 4L12 3L11 4Z" fill="currentColor" opacity="0.4"/>
            </svg>
            {/* Soft gold dot accent */}
            <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full opacity-60"></div>
          </div>
        </div>

        {/* Dhwaja Chevron - Far Right */}
        <div className="absolute top-4 right-4 z-20 opacity-[0.07]" data-testid="dhwaja-chevron">
          <div className="w-8 h-8 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" className="text-white">
              <path d="M12 2L20 8L12 14L4 8L12 2Z" fill="currentColor"/>
              <path d="M8 8L12 12L16 8L12 4L8 8Z" fill="currentColor" opacity="0.7"/>
            </svg>
          </div>
        </div>
        
        {/* Content Container */}
        <div className="relative z-10 p-4 sm:p-6">
        {/* Action Buttons - Left side */}
        <div className="absolute left-4 top-4 z-10">
          <ActionsDock
            inviteUrl={inviteUrl}
            fetchQr={getInviteQr}
            isEditing={showEditModal}
            onToggleEdit={handleEditClick}
          />
        </div>

        {/* Sign Out Button - Right side */}
        <div className="absolute right-4 top-4 z-10">
          <button
            onClick={handleSignOut}
            className="group flex items-center gap-2 px-4 py-2 text-[12px] font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span className="hidden sm:inline font-semibold">Sign Out</span>
            <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </button>
        </div>

        <div className="flex justify-center pt-8">
          {/* CENTER: Avatar Block - Smaller and Compact */}
          <section className="w-full max-w-[400px] flex flex-col items-center text-center gap-3">
            {/* Inline Avatar Upload - Smaller */}
            <div className="relative group">
              {/* Clickable file input that covers the circle */}
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                className="absolute inset-0 z-20 opacity-0 cursor-pointer"
                aria-label="Upload profile picture"
                onChange={handleAvatarUpload}
              />
              
              {/* Ring + Mask - Smaller */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-nepal-crimson to-nepal-blue p-1" data-testid="avatar-ring">
                  <div className="w-full h-full rounded-full bg-white p-1">
                    <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden flex items-center justify-center relative">
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt="Profile photo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-400">
                          {profile.firstName?.[0] || 'J'}
                        </div>
                      )}
                      
                      {/* Camera hint on hover */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M14.5 4h-5l-1 2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2.5l-1-2z"/>
                          <circle cx="12" cy="13" r="3.5"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Status dot - Smaller */}
                <div className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
            </div>

            {/* Name / Username / Email - Proud Sports Typography */}
            <div className="text-center">
              <div>
                <h1 className="text-[32px] leading-[36px] font-extrabold tracking-tight text-text-dark-contrast">
                  {profile.displayName}
                </h1>
                <p className="text-[14px] font-medium text-text-dark-contrast">@{profile.username}</p>
                <p className="text-[14px] font-medium text-text-dark-contrast">{profile.email}</p>
                {(profile.firstName || profile.lastName) && (
                  <p className="text-[14px] font-medium text-text-dark-contrast">
                    {profile.firstName} {profile.lastName}
                  </p>
                )}
                {profile.phone && (
                  <p className="text-[14px] font-medium text-text-dark-contrast">{profile.phone}</p>
                )}
              </div>
            </div>

            {/* Gender + Nationality Chips - Solid fills */}
            <div className="flex flex-wrap items-center justify-center gap-1">
              {getGenderDisplay(profile.gender) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[12px] bg-[#FEF2F2] text-[#991B1B] ring-1 ring-[#FECACA] focus:outline-none focus:ring-2 focus:ring-nepal-blue focus:ring-offset-1" data-testid="gender-chip">
                  {getGenderDisplay(profile.gender)}
                </span>
              )}
              {getCountryDisplay(profile.nationality) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[12px] bg-[#EEF2FF] text-[#1E40AF] ring-1 ring-[#C7D2FE] focus:outline-none focus:ring-2 focus:ring-nepal-blue focus:ring-offset-1" data-testid="nationality-chip">
                  {getCountryDisplay(profile.nationality)}
                </span>
              )}
              {profile.bio && (
                <div className="w-full mt-2">
                  <p className="text-[12px] text-text-dark-contrast/80 text-center italic">
                    "{profile.bio}"
                  </p>
                </div>
              )}
            </div>

            {/* Level/Rank Pills - Crimson styling */}
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full text-[12px] font-medium px-2 py-1 bg-nepal-crimson/10 text-nepal-crimson/80 ring-1 ring-nepal-crimson/30">
                {profile.rank}
              </span>
              <span className="text-[12px] text-text-dark-contrast">
                Level {profile.level}
              </span>
            </div>
          </section>
        </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={handleModalClose}
        profile={profile}
        onSave={handleModalSave}
        saving={saving}
      />
    </div>
  );
};

export default ProfileHeader;