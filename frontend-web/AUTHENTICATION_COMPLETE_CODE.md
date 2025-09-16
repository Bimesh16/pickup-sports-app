# Pickup Sports App - Complete Authentication & Registration Code

## Overview
This document contains all the authentication and registration related code for the Pickup Sports App, including sign-up, sign-in, and registration pages with Nepal flag theming and sports-focused UI.

## File Structure
```
frontend-web/src/
├── pages/
│   └── Login.tsx                    # Main login page entry point
├── components/
│   ├── UnifiedJoinTheLeague.tsx    # Complete registration flow
│   └── EnhancedGameEntranceAuth.tsx # Main authentication component
├── hooks/
│   └── useAuth.tsx                 # Authentication context and hooks
└── lib/
    └── http.ts                     # HTTP service with mock API support
```

## 1. Main Login Page (Login.tsx)

```tsx
// src/pages/Login.tsx - Stadium Tunnel Auth Page
import React from 'react';
import EnhancedGameEntranceAuth from '@components/EnhancedGameEntranceAuth';

export default function Login() {
  return <EnhancedGameEntranceAuth />;
}
```

## 2. Enhanced Authentication Component (EnhancedGameEntranceAuth.tsx)

This is the main authentication component that handles both sign-in and registration with a stadium-themed UI.

### Key Features:
- **Stadium-themed UI** with floodlights and sports animations
- **Bilingual support** (English/Nepali)
- **Social login** integration (Google, Apple, Facebook, Instagram, TikTok)
- **MFA support** for enhanced security
- **Nepal flag color scheme** (crimson, blue, white)
- **Sports-focused language** and terminology

### Main Component Structure:
```tsx
export default function EnhancedGameEntranceAuth({ countdownTo }: Props) {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [language, setLanguage] = useState<"en" | "ne">("en");
  const [mfa, setMfa] = useState<{ open: boolean; challenge?: string; methods?: string[] }>({ open: false });
  
  // Stadium-themed background with floodlights
  // Language toggle (EN/ने)
  // Mode switching between signin/register
  // Form components with sports terminology
  // Social login integration
  // Success animations
}
```

### Sign-In Form:
- Username/Email input with validation
- Password input with show/hide toggle
- Forgot password/username links
- Demo mode button
- Social login options
- Sports-themed error messages

### Registration Form:
- Multi-field form with validation
- Password strength indicator
- Social media integration
- Gender and sport preferences
- Location and contact information

## 3. Unified Registration Flow (UnifiedJoinTheLeague.tsx)

This is the comprehensive registration component with a locker room theme and step-by-step flow.

### Key Features:
- **3-Step Registration Process**:
  1. **Your Jersey Identity** - Name, player tag, password
  2. **Stay Connected** - Email, phone, gender
  3. **Your Player Badge** - Avatar, social handles, preview

- **Interactive Locker Room Animation** - Locker door opens as user progresses
- **Real-time Validation** - Username availability checking
- **Avatar Upload** - Image compression and optimization
- **Social Handle Validation** - Instagram/TikTok with strict patterns
- **Country Selection** - Searchable dropdown with 50+ countries
- **Phone Number Formatting** - International format with country codes

### Step 1: Identity
```tsx
function Step1Identity({ formData, setFormData, errors }) {
  // First Name, Last Name inputs
  // Player Tag with real-time availability checking
  // Password with strength indicator
  // Username preview (@tag)
}
```

### Step 2: Contact
```tsx
function Step3Contact({ formData, setFormData, errors, countryCode, setCountryCode, ... }) {
  // Email input (full width)
  // Phone with country selector and searchable dropdown
  // Gender selection (compact pill buttons)
  // Validation for email OR phone + gender
}
```

### Step 3: Badge
```tsx
function Step4Badge({ formData, setFormData, fileInputRef, ... }) {
  // Avatar upload with camera capture
  // Jersey number input
  // Social media handles (Instagram/TikTok)
  // Player badge preview
}
```

## 4. Authentication Context (useAuth.tsx)

Complete authentication management with token handling, user state, and API integration.

### Key Features:
- **Token Management** - JWT token storage and refresh
- **User State** - Profile data and authentication status
- **API Integration** - Login, register, logout, profile refresh
- **Social Login** - Mock implementation for OAuth providers
- **Error Handling** - Comprehensive error management
- **Auto-refresh** - Token validation and profile updates

### Main Hooks:
```tsx
export function useAuth(): AuthContextType {
  // Returns: user, token, isLoading, isAuthenticated
  // Methods: login, register, logout, refreshProfile, socialLogin
}

export function useRequireAuth(): User {
  // Throws error if not authenticated
}

export function useOptionalAuth(): { user: User | null; isAuthenticated: boolean } {
  // Returns auth state without throwing
}
```

## 5. HTTP Service (http.ts)

Enhanced HTTP service with mock API support for development.

### Key Features:
- **Mock API Support** - Complete mock implementation for development
- **Real API Integration** - Ready for production backend
- **Error Handling** - Custom ApiError class
- **Authentication** - Automatic token inclusion
- **Request Interceptors** - Common headers and error handling

### Mock API Endpoints:
- `/auth/login` - User authentication
- `/auth/me` - Current user info
- `/users/register` - User registration
- `/users/check-username` - Username availability
- `/auth/forgot-password` - Password reset
- `/auth/reset-password` - Password update
- `/auth/forgot-username` - Username recovery

## 6. Key Features Implemented

### UI/UX Features:
- **Nepal Flag Colors** - Crimson (#DC143C), Blue (#003893), White
- **Sports Terminology** - "Join the League", "Player Badge", "Step onto the field"
- **Responsive Design** - Mobile-first approach
- **Animations** - Locker room, floodlights, floating sports icons
- **Accessibility** - ARIA labels, keyboard navigation, screen reader support

### Validation Features:
- **Real-time Username Checking** - Async availability validation
- **Password Strength** - Visual strength indicator
- **Email Validation** - Proper email format checking
- **Phone Validation** - International format with country codes
- **Social Handle Validation** - Strict patterns for Instagram/TikTok
- **Form Step Validation** - Progressive validation per step

### Technical Features:
- **TypeScript** - Full type safety
- **React Hooks** - Modern React patterns
- **Context API** - Global state management
- **Error Boundaries** - Graceful error handling
- **Mock API** - Complete development environment
- **Social Login** - OAuth provider integration ready

## 7. Usage Instructions

### Development Setup:
1. Set `USE_MOCK = true` in `http.ts` for development
2. Configure environment variables for production
3. Set `VITE_API_BASE` for real backend integration

### Production Deployment:
1. Set `USE_MOCK = false` in `http.ts`
2. Configure `VITE_API_BASE` to your backend URL
3. Set up OAuth providers for social login
4. Configure MFA settings

### Customization:
- Update country list in `COUNTRIES` array
- Modify sports list in `SPORTS` array
- Customize gender options in `GENDERS` array
- Update translations in `translations` object
- Modify color scheme in CSS classes

## 8. Dependencies

### Required Packages:
- `react` - Core React library
- `react-router-dom` - Routing
- `lucide-react` - Icons
- `tailwindcss` - Styling

### Optional Packages:
- `@types/react` - TypeScript types
- `@types/react-dom` - TypeScript types

This complete authentication system provides a modern, sports-themed user experience with comprehensive validation, social login support, and a beautiful UI that reflects Nepal's sports culture.
