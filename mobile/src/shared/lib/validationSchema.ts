// src/lib/validationSchema.ts - Zod validation schemas for registration

import { z } from 'zod';

// Social handle validation pattern
const socialHandlePattern = /^@?[A-Za-z0-9._]{2,30}$/;

// Password strength validation (>=8, at least one number and one symbol)
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one symbol');

// Username validation
const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be no more than 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
  .transform(val => val.toLowerCase());

// Phone validation with country code
const phoneSchema = z.string()
  .optional()
  .refine((val) => {
    if (!val) return true; // Optional field
    return val.startsWith('+') && val.length >= 10;
  }, 'Phone number must start with + and be at least 10 digits');

// Email validation
const emailSchema = z.string()
  .email('Please enter a valid email address')
  .optional();

// Social handle validation
const socialHandleSchema = z.string()
  .optional()
  .refine((val) => {
    if (!val) return true; // Optional field
    return socialHandlePattern.test(val);
  }, 'Invalid social handle format. Use 2-30 characters with letters, numbers, dots, and underscores');

// Main form validation schema
export const registrationSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be no more than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be no more than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  username: usernameSchema,
  
  email: emailSchema,
  
  password: passwordSchema,
  
  phone: phoneSchema,
  
  // location removed from registration flow
  
  avatar: z.string().optional(),
  
  jerseyNumber: z.string()
    .max(10, 'Jersey number must be no more than 10 characters')
    .regex(/^[0-9]*$/, 'Jersey number can only contain digits')
    .optional(),
  
  // preferredSport removed from registration flow
  
  gender: z.string()
    .min(1, 'Please select your gender')
    .refine((val) => ['male', 'female', 'non-binary', 'prefer-not-to-say'].includes(val), 
      'Please select a valid gender option'),
  
  skillLevel: z.string()
    .optional()
    .refine((val) => !val || ['beginner', 'intermediate', 'advanced', 'professional'].includes(val), 
      'Please select a valid skill level'),
  
  instagram: socialHandleSchema,
  
  tiktok: socialHandleSchema,
});

// Step-specific validation schemas
export const step1Schema = z.object({
  firstName: registrationSchema.shape.firstName,
  lastName: registrationSchema.shape.lastName,
  username: registrationSchema.shape.username,
  password: registrationSchema.shape.password,
});

export const step2Schema = z.object({
  email: emailSchema,
  phone: phoneSchema,
  gender: registrationSchema.shape.gender,
}).refine((data) => {
  // Either email or phone must be provided
  return data.email || data.phone;
}, {
  message: 'Please provide either an email or phone number',
  path: ['email'], // This will show the error on the email field
});

export const step3Schema = z.object({
  jerseyNumber: registrationSchema.shape.jerseyNumber.optional(),
  instagram: socialHandleSchema,
  tiktok: socialHandleSchema,
});

// Validation helper functions
export const validateStep = (step: number, data: any) => {
  switch (step) {
    case 1:
      return step1Schema.safeParse(data);
    case 2:
      return step2Schema.safeParse(data);
    case 3:
      return step3Schema.safeParse(data);
    default:
      return { success: false, error: { issues: [{ message: 'Invalid step' }] } };
  }
};

export const validateFullForm = (data: any) => {
  return registrationSchema.safeParse(data);
};

// Social handle validation function
export const validateSocialHandle = (platform: string, value: string): string => {
  if (!value) return '';
  
  const result = socialHandleSchema.safeParse(value);
  if (!result.success) {
    return result.error.issues[0].message;
  }
  
  return '';
};

// Password strength calculation
export const getPasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
};

// Username availability check (mock implementation)
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  // Mock implementation - in real app, this would call an API
  const unavailableUsernames = ['admin', 'test', 'demo', 'user', 'guest'];
  return !unavailableUsernames.includes(username.toLowerCase());
};
