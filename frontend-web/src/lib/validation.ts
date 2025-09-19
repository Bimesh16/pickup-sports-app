// src/lib/validation.ts - Form Validation Utilities
import { z } from 'zod';

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// Zod schema for profile form validation
export const profileSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .optional(),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .optional(),
  
  displayName: z.string()
    .min(1, 'Display name is required')
    .max(30, 'Display name must be less than 30 characters')
    .optional(),
  
  email: z.string()
    .email('Please enter a valid email address')
    .optional(),
  
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
  
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 characters')
    .optional(),
  
  age: z.number()
    .int('Age must be a whole number')
    .min(13, 'You must be at least 13 years old')
    .max(120, 'Please enter a valid age')
    .optional(),
  
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'])
    .optional(),
  
  skillLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO'])
    .optional(),
  
  preferredSports: z.array(z.string())
    .max(5, 'You can select up to 5 preferred sports')
    .optional(),
  
  // Privacy settings
  privacySettings: z.object({
    showEmail: z.boolean().default(false),
    showPhone: z.boolean().default(false),
    showLocation: z.boolean().default(true),
    showAge: z.boolean().default(false),
  }).optional(),
  
  // Security settings
  securitySettings: z.object({
    twoFactorEnabled: z.boolean().default(false),
    emailNotifications: z.boolean().default(true),
    pushNotifications: z.boolean().default(true),
    marketingEmails: z.boolean().default(false),
  }).optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Validation for avatar upload
export const avatarSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Only JPEG, PNG, and WebP images are allowed'
    ),
});

export type AvatarFormData = z.infer<typeof avatarSchema>;

// Phone number validation for Nepal
export const validatePhoneNumber = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: true }; // Optional field
  }
  
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Nepal phone number patterns
  const patterns = [
    /^9779[6-8]\d{8}$/, // +977 98XXXXXXXX format
    /^9[6-8]\d{8}$/,    // 98XXXXXXXX format
    /^977\d{10}$/       // +977 98XXXXXXXX format (alternative)
  ];
  
  const isValid = patterns.some(pattern => pattern.test(cleanPhone));
  
  if (!isValid) {
    return {
      isValid: false,
      message: 'Please enter a valid Nepal phone number (e.g., +977 98XXXXXXXX or 98XXXXXXXX)'
    };
  }
  
  return { isValid: true };
};

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  
  if (!isValid) {
    return {
      isValid: false,
      message: 'Please enter a valid email address'
    };
  }
  
  return { isValid: true };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long'
    };
  }
  
  if (password.length > 255) {
    return {
      isValid: false,
      message: 'Password must be less than 255 characters'
    };
  }
  
  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return {
      isValid: false,
      message: 'Password must contain at least one letter and one number'
    };
  }
  
  return { isValid: true };
};

// Username validation
export const validateUsername = (username: string): ValidationResult => {
  if (!username) {
    return { isValid: false, message: 'Username is required' };
  }
  
  if (username.length < 3) {
    return {
      isValid: false,
      message: 'Username must be at least 3 characters long'
    };
  }
  
  if (username.length > 50) {
    return {
      isValid: false,
      message: 'Username must be less than 50 characters'
    };
  }
  
  // Only allow alphanumeric characters, underscores, and hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  const isValid = usernameRegex.test(username);
  
  if (!isValid) {
    return {
      isValid: false,
      message: 'Username can only contain letters, numbers, underscores, and hyphens'
    };
  }
  
  return { isValid: true };
};

// Social media validation
export const validateSocialMedia = {
  instagram: (username: string): ValidationResult => {
    if (!username) return { isValid: true };
    
    const cleanUsername = username.replace('@', '');
    const isValid = /^[a-zA-Z0-9._]{1,30}$/.test(cleanUsername);
    
    return {
      isValid,
      message: isValid ? undefined : 'Invalid Instagram username format'
    };
  },
  
  tiktok: (username: string): ValidationResult => {
    if (!username) return { isValid: true };
    
    const cleanUsername = username.replace('@', '');
    const isValid = /^[a-zA-Z0-9._]{1,24}$/.test(cleanUsername);
    
    return {
      isValid,
      message: isValid ? undefined : 'Invalid TikTok username format'
    };
  },
  
  facebook: (username: string): ValidationResult => {
    if (!username) return { isValid: true };
    
    const isValid = /^[a-zA-Z0-9.]{5,50}$/.test(username);
    
    return {
      isValid,
      message: isValid ? undefined : 'Invalid Facebook username format'
    };
  },
  
  twitter: (username: string): ValidationResult => {
    if (!username) return { isValid: true };
    
    const cleanUsername = username.replace('@', '');
    const isValid = /^[a-zA-Z0-9_]{1,15}$/.test(cleanUsername);
    
    return {
      isValid,
      message: isValid ? undefined : 'Invalid Twitter username format'
    };
  }
};

// Form validation helper
export const validateForm = (formData: any) => {
  const errors: Record<string, string> = {};
  
  // Validate required fields
  const usernameValidation = validateUsername(formData.username);
  if (!usernameValidation.isValid) {
    errors.username = usernameValidation.message!;
  }
  
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message!;
  }
  
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message!;
  }
  
  // Validate optional fields
  if (formData.phoneNumber) {
    const phoneValidation = validatePhoneNumber(formData.phoneNumber);
    if (!phoneValidation.isValid) {
      errors.phoneNumber = phoneValidation.message!;
    }
  }
  
  // Validate social media
  if (formData.socialMedia) {
    const socialValidation = validateSocialMedia.instagram(formData.socialMedia.instagram);
    if (!socialValidation.isValid) {
      errors.instagram = socialValidation.message!;
    }
    
    const tiktokValidation = validateSocialMedia.tiktok(formData.socialMedia.tiktok);
    if (!tiktokValidation.isValid) {
      errors.tiktok = tiktokValidation.message!;
    }
    
    const facebookValidation = validateSocialMedia.facebook(formData.socialMedia.facebook);
    if (!facebookValidation.isValid) {
      errors.facebook = facebookValidation.message!;
    }
    
    const twitterValidation = validateSocialMedia.twitter(formData.socialMedia.twitter);
    if (!twitterValidation.isValid) {
      errors.twitter = twitterValidation.message!;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

