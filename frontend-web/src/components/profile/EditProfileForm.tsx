import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Settings, 
  Camera, 
  Upload,
  X,
  Check,
  AlertCircle,
  Lock,
  Bell
} from 'lucide-react';
import { useProfile, useUpdateProfile, useUploadAvatar, type User as ProfileUser } from '@hooks/useProfile';
import { profileSchema, type ProfileFormData } from '@lib/validation';
import AvatarUpload from './AvatarUpload';
import { theme } from '@styles/theme';

interface User {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  location?: string;
}

interface EditProfileFormProps {
  defaultValues: Partial<User>;
  onSubmit: (values: Partial<User>) => Promise<void>;
  onCancel: () => void;
}

const sections = [
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'account', label: 'Account', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
];

export default function EditProfileForm({ defaultValues, onSubmit, onCancel }: EditProfileFormProps) {
  const [activeSection, setActiveSection] = useState('profile');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Initialize react-hook-form with zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    watch,
    setValue,
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: defaultValues?.firstName || '',
      lastName: defaultValues?.lastName || '',
      displayName: defaultValues?.username || '',
      email: defaultValues?.email || '',
      bio: defaultValues?.bio || '',
      location: defaultValues?.location || '',
      phone: defaultValues?.phoneNumber || '',
      gender: defaultValues?.gender,
    },
    mode: 'onChange'
  });

  // Watch for changes to show unsaved changes warning
  const watchedValues = watch();

  // Reset form when defaultValues change
  useEffect(() => {
    reset({
      firstName: defaultValues?.firstName || '',
      lastName: defaultValues?.lastName || '',
      displayName: defaultValues?.username || '',
      email: defaultValues?.email || '',
      bio: defaultValues?.bio || '',
      location: defaultValues?.location || '',
      phone: defaultValues?.phoneNumber || '',
      gender: defaultValues?.gender,
    });
  }, [defaultValues, reset]);

  // Handle unsaved changes when navigating between sections
  const handleSectionChange = (sectionId: string) => {
    if (isDirty && sectionId !== activeSection) {
      setPendingNavigation(sectionId);
      setShowUnsavedDialog(true);
    } else {
      setActiveSection(sectionId);
    }
  };

  const handleDiscardChanges = () => {
    reset();
    setShowUnsavedDialog(false);
    if (pendingNavigation) {
      setActiveSection(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleKeepEditing = () => {
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };

  const onFormSubmit = async (data: ProfileFormData) => {
    setSaveStatus('saving');
    
    try {
      // Transform form data to match API expectations
      const submitData = {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.displayName,
        email: data.email,
        bio: data.bio,
        location: data.location,
        phoneNumber: data.phone,
        gender: data.gender,
      };
      
      await onSubmit(submitData);
      setSaveStatus('saved');
      
      // Auto-hide success after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      setSaveStatus('error');
    }
  };

  const renderProfileSection = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <AvatarUpload
        currentAvatarUrl={defaultValues?.avatarUrl}
        displayName={defaultValues?.firstName || defaultValues?.username}
        onUploadSuccess={(avatarUrl) => {
          // Update form data with new avatar URL
          setValue('avatarUrl' as any, avatarUrl);
        }}
        size={100}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label 
            htmlFor="firstName"
            style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
          >
            First Name *
          </label>
          <input
            id="firstName"
            type="text"
            {...register('firstName')}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            aria-invalid={!!errors.firstName}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${errors.firstName ? theme.colors.error : theme.colors.border}`,
              borderRadius: 8,
              fontSize: 14,
            }}
            placeholder="Enter your first name"
          />
          {errors.firstName && (
            <p 
              id="firstName-error"
              role="alert"
              style={{ fontSize: 12, color: theme.colors.error, marginTop: 4 }}
            >
              {errors.firstName.message}
            </p>
          )}
        </div>
        
        <div>
          <label 
            htmlFor="lastName"
            style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
          >
            Last Name *
          </label>
          <input
            id="lastName"
            type="text"
            {...register('lastName')}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            aria-invalid={!!errors.lastName}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${errors.lastName ? theme.colors.error : theme.colors.border}`,
              borderRadius: 8,
              fontSize: 14,
            }}
            placeholder="Enter your last name"
          />
          {errors.lastName && (
            <p 
              id="lastName-error"
              role="alert"
              style={{ fontSize: 12, color: theme.colors.error, marginTop: 4 }}
            >
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label 
          htmlFor="displayName"
          style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
        >
          Display Name *
        </label>
        <input
          id="displayName"
          type="text"
          {...register('displayName')}
          aria-describedby={errors.displayName ? 'displayName-error' : undefined}
          aria-invalid={!!errors.displayName}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: `1px solid ${errors.displayName ? theme.colors.error : theme.colors.border}`,
            borderRadius: 8,
            fontSize: 14,
          }}
          placeholder="Enter your display name"
        />
        {errors.displayName && (
          <p 
            id="displayName-error"
            role="alert"
            style={{ fontSize: 12, color: theme.colors.error, marginTop: 4 }}
          >
            {errors.displayName.message}
          </p>
        )}
        <p style={{ fontSize: 12, color: theme.colors.muted, marginTop: 4 }}>
          This appears on game cards
        </p>
      </div>

      <div>
        <label 
          htmlFor="bio"
          style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
        >
          Bio
        </label>
        <textarea
          id="bio"
          {...register('bio')}
          aria-describedby={errors.bio ? 'bio-error' : undefined}
          aria-invalid={!!errors.bio}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: `1px solid ${errors.bio ? theme.colors.error : theme.colors.border}`,
            borderRadius: 8,
            fontSize: 14,
            minHeight: 80,
            resize: 'vertical',
          }}
          placeholder="Tell others about yourself..."
        />
        {errors.bio && (
          <p 
            id="bio-error"
            role="alert"
            style={{ fontSize: 12, color: theme.colors.error, marginTop: 4 }}
          >
            {errors.bio.message}
          </p>
        )}
      </div>
    </div>
  );

  const renderAccountSection = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <label 
          htmlFor="email"
          style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
        >
          Email *
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          aria-describedby={errors.email ? 'email-error' : undefined}
          aria-invalid={!!errors.email}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: `1px solid ${errors.email ? theme.colors.error : theme.colors.border}`,
            borderRadius: 8,
            fontSize: 14,
          }}
          placeholder="Enter your email"
        />
        {errors.email && (
          <p 
            id="email-error"
            role="alert"
            style={{ fontSize: 12, color: theme.colors.error, marginTop: 4 }}
          >
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label 
          htmlFor="phone"
          style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
        >
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          {...register('phone')}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
          aria-invalid={!!errors.phone}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: `1px solid ${errors.phone ? theme.colors.error : theme.colors.border}`,
            borderRadius: 8,
            fontSize: 14,
          }}
          placeholder="Enter your phone number"
        />
        {errors.phone && (
          <p 
            id="phone-error"
            role="alert"
            style={{ fontSize: 12, color: theme.colors.error, marginTop: 4 }}
          >
            {errors.phone.message}
          </p>
        )}
      </div>

      <div>
        <label 
          htmlFor="location"
          style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
        >
          Location
        </label>
        <input
          id="location"
          type="text"
          {...register('location')}
          aria-describedby={errors.location ? 'location-error' : undefined}
          aria-invalid={!!errors.location}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: `1px solid ${errors.location ? theme.colors.error : theme.colors.border}`,
            borderRadius: 8,
            fontSize: 14,
          }}
          placeholder="Enter your location"
        />
        {errors.location && (
          <p 
            id="location-error"
            role="alert"
            style={{ fontSize: 12, color: theme.colors.error, marginTop: 4 }}
          >
            {errors.location.message}
          </p>
        )}
      </div>

      <div>
        <label 
          htmlFor="gender"
          style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
        >
          Gender
        </label>
        <select
          id="gender"
          {...register('gender')}
          aria-describedby={errors.gender ? 'gender-error' : undefined}
          aria-invalid={!!errors.gender}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: `1px solid ${errors.gender ? theme.colors.error : theme.colors.border}`,
            borderRadius: 8,
            fontSize: 14,
            backgroundColor: 'white',
          }}
        >
          <option value="">Select gender</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
          <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
        </select>
        {errors.gender && (
           <p 
             id="gender-error"
             role="alert"
             style={{ fontSize: 12, color: theme.colors.error, marginTop: 4 }}
           >
             {errors.gender.message}
           </p>
         )}
       </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Notification Preferences</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          { id: 'game-invites', label: 'Game invitations', description: 'Get notified when someone invites you to a game' },
          { id: 'game-updates', label: 'Game updates', description: 'Updates about games you\'ve joined' },
          { id: 'messages', label: 'Messages', description: 'Direct messages from other players' },
          { id: 'marketing', label: 'Marketing emails', description: 'Tips, features, and promotional content' },
        ].map((item) => (
          <div key={item.id} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            padding: 16,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 8,
          }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 14, color: theme.colors.muted }}>{item.description}</div>
            </div>
            <input type="checkbox" defaultChecked style={{ marginTop: 2 }} />
          </div>
        ))}
      </div>
    </div>
  );

  const renderPrivacySection = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Privacy Settings</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          { id: 'profile-visibility', label: 'Profile visibility', description: 'Who can see your profile information' },
          { id: 'location-sharing', label: 'Location sharing', description: 'Share your location with other players' },
          { id: 'activity-status', label: 'Activity status', description: 'Show when you\'re online' },
          { id: 'search-visibility', label: 'Search visibility', description: 'Allow others to find you in search' },
        ].map((item) => (
          <div key={item.id} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            padding: 16,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 8,
          }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 14, color: theme.colors.muted }}>{item.description}</div>
            </div>
            <select style={{ 
              padding: '4px 8px', 
              border: `1px solid ${theme.colors.border}`, 
              borderRadius: 4,
              fontSize: 12,
            }}>
              <option>Everyone</option>
              <option>Friends only</option>
              <option>Private</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSection();
      case 'account': return renderAccountSection();
      case 'notifications': return renderNotificationsSection();
      case 'privacy': return renderPrivacySection();
      default: return renderProfileSection();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit(onFormSubmit)} 
      className="overflow-y-auto max-h-[calc(90vh-80px)]" 
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      role="form"
      aria-label="Edit profile form"
    >
      {/* Navigation and Content Container */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Navigation */}
        <nav 
          style={{
            width: 200,
            borderRight: `1px solid ${theme.colors.border}`,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
          role="tablist"
          aria-label="Profile sections"
        >
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => handleSectionChange(section.id)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${section.id}-panel`}
                tabIndex={isActive ? 0 : -1}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const currentIndex = sections.findIndex(s => s.id === section.id);
                    const nextIndex = e.key === 'ArrowDown' 
                      ? (currentIndex + 1) % sections.length
                      : (currentIndex - 1 + sections.length) % sections.length;
                    const nextSection = sections[nextIndex];
                     handleSectionChange(nextSection.id);
                     // Focus the next button
                     setTimeout(() => {
                       const nextButton = document.querySelector(`[aria-controls="${nextSection.id}-panel"]`) as HTMLButtonElement;
                       nextButton?.focus();
                     }, 0);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: 8,
                  backgroundColor: isActive ? theme.colors.primary + '10' : 'transparent',
                  color: isActive ? theme.colors.primary : theme.colors.text,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <Icon size={16} />
                {section.label}
              </button>
            );
          })}
        </nav>

        {/* Main Content */}
        <div 
          style={{ flex: 1, padding: 24, overflow: 'auto' }}
          role="tabpanel"
          id={`${activeSection}-panel`}
          aria-labelledby={`${activeSection}-tab`}
        >
          {renderContent()}
        </div>
      </div>

      {/* Sticky Save Bar */}
      <div style={{
        borderTop: `1px solid ${theme.colors.border}`,
        padding: '16px 24px',
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ fontSize: 14, color: theme.colors.muted }}>
          {isDirty ? 'You have unsaved changes' : 'All changes saved'}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isDirty || isSubmitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              backgroundColor: isDirty ? theme.colors.primary : theme.colors.muted,
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: isDirty ? 'pointer' : 'not-allowed',
              opacity: isDirty ? 1 : 0.6,
            }}
          >
            {saveStatus === 'saving' ? (
              <>Saving...</>
            ) : saveStatus === 'saved' ? (
              <>
                <Check size={16} />
                Saved
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>

      {/* Unsaved Changes Dialog */}
      {showUnsavedDialog && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={handleKeepEditing}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 24,
              maxWidth: 400,
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="unsaved-dialog-title"
            aria-describedby="unsaved-dialog-description"
          >
            <div style={{ marginBottom: 16 }}>
              <h3 
                id="unsaved-dialog-title"
                style={{ 
                  fontSize: 18, 
                  fontWeight: 600, 
                  marginBottom: 8,
                  color: theme.colors.text 
                }}
              >
                Unsaved Changes
              </h3>
              <p 
                id="unsaved-dialog-description"
                style={{ 
                  fontSize: 14, 
                  color: theme.colors.muted,
                  lineHeight: 1.5 
                }}
              >
                You have unsaved changes. Do you want to discard them and continue?
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleKeepEditing}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: theme.colors.text,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleDiscardChanges}
                style={{
                  padding: '8px 16px',
                  backgroundColor: theme.colors.error,
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}