// src/components/UnifiedJoinTheLeague.tsx - Ultimate Hybrid Registration Flow

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { logEvent } from '@lib/analytics';
import { Trophy, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from '../hooks/useAuth';
import { validateForm } from '@lib/validation';
import { validateStep, validateFullForm, checkUsernameAvailability } from '../lib/validationSchema';
import { FormData, Step, SocialErrors } from '../types/registration';
import { SPORTS, COUNTRIES } from '../lib/constants';
import StepIdentity from './steps/StepIdentity';
import StepContact from './steps/StepContact';
import StepBadge from './steps/StepBadge';
import StepReview from './steps/StepReview';

// Ultimate Hybrid Registration Flow
// Combines Locker Room animations with Player Badge design
// Theme: Digital Locker Room with Glowing Player Badge

interface Props {
  onComplete?: () => void;
  onBack?: () => void;
}

export default function UnifiedJoinTheLeague({ onComplete, onBack }: Props) {
  const { register, socialLogin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    avatar: '',
    jerseyNumber: '',
    gender: '',
    skillLevel: 'beginner', // Set default skill level
    instagram: '',
    tiktok: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [fileInputRef] = useState<React.RefObject<HTMLInputElement>>(useRef<HTMLInputElement>(null));
  const [captureInputRef] = useState<React.RefObject<HTMLInputElement>>(useRef<HTMLInputElement>(null));
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [countryCode, setCountryCode] = useState<string>(COUNTRIES[0].code);
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [showCountryDropdown, setShowCountryDropdown] = useState<boolean>(false);
  const [socialErrors, setSocialErrors] = useState<SocialErrors>({});
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const [lastTagCheck, setLastTagCheck] = useState<{ name: string; available: boolean } | null>(null);

  // Progress persistence keys
  const PROGRESS_KEY = 'ps_registration_progress';
  const FORM_DATA_KEY = 'ps_registration_form_data';

  // Additional state for review step
  const [genderPublic, setGenderPublic] = useState<boolean>(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(false);

  // Locker door opening animation based on step
  const getLockerOpenness = () => {
    switch (currentStep) {
      case 1: return '15%'; // Cracked open
      case 2: return '35%'; // Partially open
      case 3: return '55%'; // Mostly open
      case 4: return '75%'; // Almost fully open
      default: return '15%';
    }
  };

  // Add gear to locker as form is filled
  useEffect(() => {
    const newGear: string[] = [];
    if (formData.firstName) newGear.push('👕');
    if (formData.email) newGear.push('👟');
    if (formData.phone) newGear.push('📱');
    if (formData.avatar) newGear.push('📸');
    if (formData.instagram || formData.tiktok) newGear.push('📱');
    setGearInLocker(newGear);
  }, [formData]);

  // Save progress to localStorage
  useEffect(() => {
    const progressData = {
      currentStep,
      formData,
      countryCode,
      socialErrors
    };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressData));
  }, [currentStep, formData, countryCode, socialErrors]);

  // Restore progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(PROGRESS_KEY);
    if (savedProgress) {
      try {
        const { currentStep: savedStep, formData: savedFormData, countryCode: savedCountryCode, socialErrors: savedSocialErrors } = JSON.parse(savedProgress);
        if (savedStep && savedFormData) {
          setCurrentStep(savedStep);
          setFormData(savedFormData);
          setCountryCode(savedCountryCode || COUNTRIES[0].code);
          setSocialErrors(savedSocialErrors || {});
        }
      } catch (error) {
        console.warn('Failed to restore registration progress:', error);
        localStorage.removeItem(PROGRESS_KEY);
      }
    }
  }, []);

  // Clear progress function
  const clearProgress = () => {
    // Only clear persisted progress; avoid mutating in-memory wizard state to prevent flicker
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(FORM_DATA_KEY);
    setFormData({
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      phone: '',
      avatar: '',
      jerseyNumber: '',
      gender: '',
      skillLevel: 'beginner',
      instagram: '',
      tiktok: ''
    });
    setCurrentStep(1);
    setErrors({});
  };

  // Close country dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
        setCountrySearch('');
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowCountryDropdown(false);
        setCountrySearch('');
      }
    };

    if (showCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showCountryDropdown]);

  const steps: Step[] = [
    { id: 1, key: 'identity', title: 'Your Jersey Identity', icon: '👕', hint: 'Your Jersey Identity — Set your name, player tag, and secure password.', description: 'Build your player profile' },
    { id: 2, key: 'contact', title: 'Stay Connected — Email, phone, and gender', icon: '📱', hint: 'Choose how you want to be seen in the app.', description: 'Stay connected with teammates' },
    { id: 3, key: 'badge', title: 'Your Player Badge', icon: '🏆', hint: 'Your Player Badge — Upload photo and add optional details', description: 'Finalize your player badge' },
    { id: 4, key: 'review', title: 'Review & Confirm', icon: '✅', hint: 'Double-check your details and join the league', description: 'Final review before joining' }
  ];

  // Navigation function for edit chips
  const navigateToStep = (stepKey: string) => {
    const step = steps.find(s => s.key === stepKey);
    if (step) {
      setCurrentStep(step.id);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const validateSocialHandle = (platform: string, value: string): string => {
    if (!value) return '';
    
    const pattern = /^@?[A-Za-z0-9._]{2,30}$/;
    if (!pattern.test(value)) {
      return 'Invalid format. Use 2-30 characters with letters, numbers, dots, and underscores.';
    }
    
    if (value.includes('..')) {
      return 'Handle cannot contain consecutive periods';
    }
    
    return '';
  };

  const isStepValid = (step: number) => {
    const result = validateStep(step, formData);
    if (step === 4) {
      return result.success && acceptTerms && acceptPrivacy;
    }
    return result.success;
  };

  const handleNext = async () => {
    // Only enforce password rules on Step 1, not on final submission
    if (currentStep === 1) {
      const pw = formData.password || '';
      const okLen = pw.length >= 8;
      const okNum = /\d/.test(pw);
      const okSym = /[^A-Za-z0-9]/.test(pw);
      if (!(okLen && okNum && okSym)) {
        setErrors(prev => ({ ...prev, password: 'Password must be 8+ chars with at least 1 number and 1 symbol' }));
        return;
      }
    }
    // Normalize phone before validating (user might not blur the field)
    let dataForValidation = { ...formData } as any;
    if (currentStep === 2 && dataForValidation.phone && !String(dataForValidation.phone).startsWith('+')) {
      const selected = COUNTRIES.find(c => c.code === countryCode);
      if (selected) {
        const local = String(dataForValidation.phone).replace(/[^\d]/g, '');
        const combined = `${selected.code}${local}`;
        dataForValidation.phone = combined;
        setFormData((prev: any) => ({ ...prev, phone: combined }));
      }
    }

    // E.164 validation if phone provided (only on step 2, not final submission)
    if (currentStep === 2 && dataForValidation.phone) {
      const e164Ok = /^\+\d{7,15}$/.test(String(dataForValidation.phone));
      if (!e164Ok) {
        setErrors(prev => ({ ...prev, phone: 'Enter a valid phone number' }));
        return;
      }
    }

    const result = validateStep(currentStep, dataForValidation);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      if (result.error && 'issues' in result.error) {
        result.error.issues.forEach((issue: any) => {
          if (issue.path && issue.path[0]) {
            newErrors[issue.path[0] as string] = issue.message;
          }
        });
      }
      setErrors(newErrors);
      return;
    }
    
    // Async availability check for player tag on step 1
    if (currentStep === 1 && formData.username) {
      // If we have a recent availability result for this exact tag and it's available, skip re-check
      if (lastTagCheck && lastTagCheck.name === formData.username.toLowerCase() && lastTagCheck.available) {
        // proceed
      } else {
      try {
        const { http } = await import('@lib/http');
        const res = await http<{ available: boolean; reason?: string }>(`/users/check-username?username=${encodeURIComponent(formData.username)}`);
        if (!res.available) {
          const msg = res.reason === 'invalid_format' ? 'Use 3–30 lowercase letters, numbers, or _' : 'That tag is taken — try another';
          setErrors(prev => ({ ...prev, username: msg }));
          return;
        }
        setLastTagCheck({ name: formData.username.toLowerCase(), available: true });
      } catch {}
      }
    }
    const maxStep = steps.length; // keep header/indexing in-bounds
    if (currentStep < maxStep) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Already at last step; optionally trigger submit
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const handleSubmit = async () => {
    // Guard against duplicate submits and hide wizard to avoid flicker
    // If already finalizing, no-op
    // Note: we set finalizing in a separate state to render a loading screen
    // until navigation happens
    // (state declared near gearInLocker)
    // Only validate required fields at final submit, don't redirect to step 1
    const pw = formData.password || '';
    const okLen = pw.length >= 8;
    const okNum = /\d/.test(pw);
    const okSym = /[^A-Za-z0-9]/.test(pw);
    if (!(okLen && okNum && okSym)) {
      setErrors(prev => ({ ...prev, password: 'Password must be 8+ chars with at least 1 number and 1 symbol' }));
      setCurrentStep(1);
      return;
    }
    
    // Normalize phone if provided
    if (formData.phone) {
      const selected = COUNTRIES.find(c => c.code === countryCode);
      const rawLocal = String(formData.phone).replace(/^[^\d]*\+?\d+\s?/, '');
      const local = rawLocal.replace(/[^\d]/g, '');
      const combined = selected ? `${selected.code}${local}` : formData.phone;
      if (combined !== formData.phone) {
        setFormData(prev => ({ ...prev, phone: combined }));
      }
    }
    const result = validateFullForm(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      if (result.error && 'issues' in result.error) {
        result.error.issues.forEach((issue: any) => {
          if (issue.path && issue.path[0]) {
            const key = issue.path[0] as string;
            newErrors[key] = issue.message;
          }
        });
      }
      setErrors(newErrors);
      // Don't redirect to step 1, stay on current step and show errors
      return;
    }
    try {
      setFinalizing(true);
      console.log('Starting registration process...');
      
      // Final username availability check before registering
      if (formData.username) {
        try {
          const { http } = await import('@lib/http');
          const res = await http<{ available: boolean }>(`/users/check-username?username=${encodeURIComponent(formData.username)}`);
          if (!res.available) {
            setErrors(prev => ({ ...prev, username: 'That tag is taken — try another' }));
            setCurrentStep(1);
            setFinalizing(false);
            return;
          }
        } catch (error) {
          console.log('Username check failed:', error);
        }
      }

      const registerData = {
        ...formData,
        gender: formData.gender.toUpperCase() as 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'
      };
      
      console.log('Registering with data:', registerData);
      const result = await register(registerData);
      console.log('Registration successful!', result);
      
      // Clear saved progress so we don't restore wizard on next visit
      clearProgress();
      
      // Set a flag to indicate registration completed
      try {
        sessionStorage.setItem('ps_reg_complete', '1');
      } catch {}
      
      // Redirect to dashboard
      if (onComplete) {
        onComplete();
      } else {
        navigate('/dashboard?welcome=1');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      console.error('Error details:', {
        message: error?.message,
        status: error?.status || error?.response?.status,
        response: error?.response?.data
      });
      
      // Attempt to surface specific errors
      const status = error?.status || error?.response?.status;
      if (status === 409 && /email/i.test(error?.message || '')) {
        setErrors(prev => ({ ...prev, email: 'Email already in use' }));
      } else if (status === 409 && /username|tag/i.test(error?.message || '')) {
        setErrors(prev => ({ ...prev, username: 'That tag is taken — try another' }));
      } else {
        setErrors({ submit: error?.message || 'Registration failed. Please try again.' });
      }
      setFinalizing(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      await socialLogin(provider as any);
      if (onComplete) onComplete();
    } catch (error) {
      console.error(`${provider} login failed:`, error);
    }
  };

  const handleAvatarUpload = (file: File) => {
    if (file) {
      const MAX = 4 * 1024 * 1024; // 4MB
      const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
      if (!ALLOWED.includes(file.type)) {
        setAvatarError('Unsupported image type. Please use JPEG, PNG, or WEBP.');
        return;
      }
      if (file.size > MAX) {
        setAvatarError('Image too large (max 4 MB). Choose a smaller photo.');
        return;
      }
      setAvatarError(null);
      setCompressing(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
          if (!ctx) return;
          
          const maxSize = 800;
          let { width, height } = img;
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
            } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          setFormData((prev: any) => ({ ...prev, avatar: compressed }));
          setCompressing(false);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    }
  };

  const [gearInLocker, setGearInLocker] = useState<string[]>([]);
  const [finalizing, setFinalizing] = useState<boolean>(false);
  // Removed session storage check that was causing redirect issues

  if (finalizing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nepal-blue via-nepal-blue/80 to-nepal-crimson/90 text-white grid place-items-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-2 border-white/40 border-t-white rounded-full mx-auto mb-3" />
          <div className="text-white/90">Creating your player badge…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-nepal-blue via-nepal-blue/80 to-nepal-crimson/90 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,37,64,0.25),transparent_55%)]" />
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg,rgba(10,37,64,0.12),transparent_45%,rgba(220,20,60,0.12),transparent_90%,rgba(10,37,64,0.12))] animate-spin" style={{ animationDuration: '22s' }} />
      
      {/* Scrim for contrast (0.25–0.35) */}
      <div className="absolute inset-0 bg-black/30" />
            
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Header copy */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-nepal-crimson to-nepal-blue rounded-full mb-3 shadow-lg">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>Join the League</h1>
              <p className="text-white/90">Create your player badge and step onto the field</p>
              <button
                onClick={clearProgress}
                className="mt-2 text-xs text-white/70 hover:text-nepal-crimson transition-colors underline"
              >
                Clear progress and start over
              </button>
              </div>

            {/* Step Content */}
            <div className="space-y-8 pb-[calc(env(safe-area-inset-bottom)+96px)]">
              {/* Step Header */}
              <div className="text-center">
                {(() => {
                  const idx = Math.max(0, Math.min(currentStep - 1, steps.length - 1));
                  const s = steps[idx];
                  return (
                    <>
                      <p className="text-xs text-white/70 mb-1">Step {currentStep} of {steps.length}</p>
                      <div className="text-4xl mb-2">{s.icon}</div>
                      <h2 className="text-2xl font-bold text-white mb-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{s.title}</h2>
                      <p className="text-white/90">{s.hint}</p>
                    </>
                  );
                })()}
            </div>

            {/* Minimal Progress Bar */}
            <div className="w-full bg-white/30 rounded-full h-1.5 mb-6">
              <div 
                className="bg-gradient-to-r from-nepal-blue to-nepal-crimson h-1.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>

            {/* Form Card: dark frosted with high opacity and blur */}
            <div className="rounded-3xl p-8 shadow-2xl ring-1 ring-white/10 mb-6 backdrop-blur-[14px] bg-[#0E1116]/[0.92]">
              {/* Form Steps */}
              {currentStep === 1 && (
                <StepIdentity
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  onSuggest={(tag: string) => setFormData((prev: any) => ({ ...prev, username: tag }))}
                  onAvailabilityChange={(name: string, available: boolean) => setLastTagCheck({ name, available })}
                />
              )}
              {currentStep === 2 && <StepContact formData={formData} setFormData={setFormData} passwordStrength={passwordStrength} errors={errors} countryCode={countryCode} setCountryCode={setCountryCode} countrySearch={countrySearch} setCountrySearch={setCountrySearch} showCountryDropdown={showCountryDropdown} setShowCountryDropdown={setShowCountryDropdown} countryDropdownRef={countryDropdownRef} genderPublic={genderPublic} setGenderPublic={setGenderPublic} />}
              {currentStep === 3 && <StepBadge formData={formData} setFormData={setFormData} errors={errors} fileInputRef={fileInputRef} captureInputRef={captureInputRef} handleAvatarUpload={handleAvatarUpload} compressing={compressing} avatarError={avatarError} socialErrors={socialErrors} setSocialErrors={setSocialErrors} validateSocialHandle={validateSocialHandle} />}
              {currentStep === 4 && <StepReview formData={formData} countryCode={countryCode} acceptTerms={acceptTerms} acceptPrivacy={acceptPrivacy} emailUpdates={emailUpdates} setAcceptTerms={setAcceptTerms} setAcceptPrivacy={setAcceptPrivacy} setEmailUpdates={setEmailUpdates} navigateToStep={navigateToStep} />}
            </div>

            {/* Trust Pills - pinned above sticky bar with gap */}
            <div className="flex items-center justify-center gap-3 text-[11px] text-white/80 mb-4 px-2">
              <span className="px-2 py-1 bg-white/10 rounded-full">🔒 Secure</span>
              <span className="px-2 py-1 bg-white/10 rounded-full">🎯 Fair Play</span>
              <span className="px-2 py-1 bg-white/10 rounded-full">⚡ Fast</span>
              <span className="px-2 py-1 bg-white/10 rounded-full">🛡 Protected</span>
            </div>

            {/* Sticky Bottom CTA Bar with safe-area handling */}
            <div className="sticky bottom-0 -mx-6 bg-[#0B0F14]/80 backdrop-blur-[12px] px-6 py-5 rounded-2xl ring-1 ring-white/10 z-50 mt-4 shadow-xl" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
              <div className="mx-auto max-w-2xl flex items-center justify-between gap-3">
                <button onClick={handleBack} className="btn btn-outline" style={{ minWidth: 120 }}>
                  <span className="inline-flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Back</span>
                </button>
                {currentStep < steps.length ? (
                  <button onClick={handleNext} className="btn btn-primary" style={{ minWidth: 160 }}>
                    <span className="inline-flex items-center gap-2">Next Step <ArrowRight className="h-4 w-4" /></span>
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={isLoading || !acceptTerms || !acceptPrivacy} className="btn btn-primary" style={{ minWidth: 160 }}>
                    <span className="inline-flex items-center gap-2">{isLoading ? 'Creating Badge...' : '🏆 Join the League'}</span>
                  </button>
                )}
              </div>
              <p className="mt-2 text-center text-xs text-white/85">You can edit details later in your profile.</p>
            </div>
          </div>
        </div>

      {/* Success Animation */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 text-center animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-nepal-crimson mb-2">You're drafted to the team!</h3>
            <p className="text-gray-600">Welcome to Nepal's sports community!</p>
          </div>
        </div>
      )}

      {/* Confetti Animation */}
      {showSuccess && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {['🎉', '🏆', '⚽', '🏀', '🎊'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

