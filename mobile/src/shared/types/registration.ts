// src/types/registration.ts - Shared types for registration flow

export interface FormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  avatar: string;
  jerseyNumber: string;
  gender: string;
  skillLevel: string;
  instagram: string;
  tiktok: string;
}

export interface SocialErrors {
  instagram?: string;
  tiktok?: string;
}

export interface StepProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  errors: Record<string, string>;
}

export interface StepIdentityProps extends StepProps {
  onSuggest: (tag: string) => void;
}

export interface StepContactProps extends StepProps {
  passwordStrength: number;
  countryCode: string;
  setCountryCode: (code: string) => void;
  countrySearch: string;
  setCountrySearch: (search: string) => void;
  showCountryDropdown: boolean;
  setShowCountryDropdown: (show: boolean) => void;
  countryDropdownRef: React.RefObject<HTMLDivElement>;
  genderPublic: boolean;
  setGenderPublic: (value: boolean) => void;
}

export interface StepBadgeProps extends StepProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
  captureInputRef: React.RefObject<HTMLInputElement>;
  handleAvatarUpload: (file: File) => void;
  compressing: boolean;
  avatarError: string | null;
  socialErrors: SocialErrors;
  setSocialErrors: React.Dispatch<React.SetStateAction<SocialErrors>>;
  validateSocialHandle: (platform: string, value: string) => string;
}

export interface StepReviewProps {
  formData: FormData;
  countryCode: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  emailUpdates: boolean;
  setAcceptTerms: (accept: boolean) => void;
  setAcceptPrivacy: (accept: boolean) => void;
  setEmailUpdates: (updates: boolean) => void;
  navigateToStep: (stepKey: string) => void;
}

export interface Country {
  name: string;
  code: string;
  flag: string;
  mask: string;
}

export interface Step {
  id: number;
  key: string;
  title: string;
  icon: string;
  hint: string;
  description: string;
}
