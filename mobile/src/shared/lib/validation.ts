// src/lib/validation.ts - Form Validation Utilities

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

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

