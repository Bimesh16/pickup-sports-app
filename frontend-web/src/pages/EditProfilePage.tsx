import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { useProfile, useUpdateProfile, type User } from '@hooks/useProfile';
import { theme } from '@styles/theme';
import EditProfileForm from '@components/profile/EditProfileForm';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user } = useAuth();
  const { data: profileData } = useProfile();
  const updateProfile = useUpdateProfile();
  const isSheetMode = searchParams.get('mode') === 'sheet';
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSheetMode) {
        handleClose();
      }
    };

    if (isSheetMode) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isSheetMode]);

  // Focus management
  useEffect(() => {
    if (isSheetMode && sheetRef.current) {
      // Focus the first input in the form
      const firstInput = sheetRef.current.querySelector('input, textarea, select') as HTMLElement;
      if (firstInput) {
        firstInput.focus();
      }
    }
  }, [isSheetMode]);

  const handleClose = () => {
    if (isSheetMode) {
      navigate('/profile');
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async (values: Partial<User>) => {
    try {
      await updateProfile.mutateAsync(values);
      
      if (isSheetMode) {
        navigate('/profile?saved=1');
      } else {
        navigate('/profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      // TODO: Show error toast
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };



  if (isSheetMode) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center',
          justifyContent: isMobile ? 'center' : 'flex-end',
        }}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
      >
        <div 
          ref={sheetRef}
          style={{
            backgroundColor: 'white',
            borderRadius: isMobile ? '16px 16px 0 0' : '8px',
            width: isMobile ? '100%' : '560px',
            height: isMobile ? '100vh' : 'auto',
            maxHeight: isMobile ? '100vh' : '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: isMobile ? 'fixed' : 'relative',
            bottom: isMobile ? 0 : 'auto',
            right: isMobile ? 0 : 0,
            top: isMobile ? 'auto' : 0,
            transform: isMobile ? 'none' : 'none',
            animation: isMobile ? 'slideUp 0.3s ease-out' : 'slideInRight 0.3s ease-out',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sheet Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: `1px solid ${theme.colors.border}`,
            backgroundColor: 'white',
          }}>
            <h2 id="edit-profile-title" style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
              Edit Profile
            </h2>
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                padding: 8,
                cursor: 'pointer',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close edit profile"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Content */}
          <EditProfileForm
            defaultValues={{
              username: user?.username || '',
              firstName: user?.firstName || '',
              lastName: user?.lastName || '',
              email: user?.email || '',
              phoneNumber: user?.phoneNumber || '',
              gender: user?.gender || undefined,
              bio: user?.bio || '',
            }}
            onSubmit={handleSubmit}
            onCancel={handleClose}
          />
        </div>

        <style>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
          
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
          
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}</style>
      </div>
    );
  }

  // Regular page mode
  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.colors.background }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: `1px solid ${theme.colors.border}`,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            padding: 8,
            cursor: 'pointer',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Edit Profile</h1>
      </div>

      {/* Form Content */}
      <div style={{ padding: 24 }}>
        <EditProfileForm
          defaultValues={{
            username: profileData?.username || user?.username || '',
            firstName: profileData?.firstName || user?.firstName || '',
            lastName: profileData?.lastName || user?.lastName || '',
            email: profileData?.email || user?.email || '',
            phoneNumber: profileData?.phone || user?.phoneNumber || '',
            gender: (profileData?.gender || user?.gender) as 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY' | undefined,
            bio: profileData?.bio || user?.bio || '',
            avatarUrl: profileData?.avatarUrl || user?.avatarUrl || '',
            location: profileData?.location || user?.location || '',
          }}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </div>
    </div>
  );
}