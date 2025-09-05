import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

type LanguageCode = 'en' | 'ne';

type Dictionary = Record<string, string>;

interface LanguageContextValue {
  lang: LanguageCode;
  setLanguage: (code: LanguageCode) => Promise<void>;
  t: (key: string) => string;
}

const TRANSLATIONS: Record<LanguageCode, Dictionary> = {
  en: {
    // Common
    'common.ok': 'OK',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'common.signingIn': 'Signing In...',
    'common.success': 'Success',
    'common.error': 'Error',
    
    // Login
    'login.header': 'Welcome Back',
    'login.subtitle': 'Sign in to continue your sports journey',
    'login.username': 'Username or Email',
    'login.email': 'Email',
    'login.phone': 'Phone',
    'login.emailOrUsername': 'Email or Username',
    'login.password': 'Password',
    'login.signIn': 'Sign In',
    'login.signingIn': 'Signing In...',
    'login.forgotPassword': 'Forgot Password?',
    'login.rememberMe': 'Remember Me',
    'login.or': 'or',
    'login.noAccount': "Don't have an account?",
    'login.createOne': 'Create one',
    'login.demoCredentials': 'Demo Credentials',
    'login.demo1': 'Email: demo@example.com',
    'login.demo2': 'Password: demo123',
    'login.demo3': 'Phone: +977-1234567890',
    'login.demo4': 'Password: demo123',
    
    // Register
    'register.title': 'Create Account',
    'register.name': 'Full Name',
    'register.username': 'Username',
    'register.email': 'Email',
    'register.phoneNumber': 'Phone Number',
    'register.agePlaceholder': 'Select your age',
    'register.location': 'Location',
    'register.password': 'Password',
    'register.confirmPassword': 'Confirm Password',
    'register.registerButton': 'Create Account',
    'register.verificationMethod': 'Verification Method',
    'register.emailVerification': 'Email Verification',
    'register.phoneVerification': 'Phone Verification',
    'register.demoAccount': 'Demo Account',
    'register.demoCredentials': 'Use these credentials to test the app',
    
    // Hero
    'hero.welcomeBack': 'Welcome Back!',
    'hero.helloFriend': 'Hello, Friend!',
    'hero.subtitleSignIn': 'Ready to play?',
    'hero.subtitleSignUp': 'Join the community!',
    
    // CTA
    'cta.signUp': 'Sign Up',
    'cta.signIn': 'Sign In',
    
    // Validation
    'validation.required': 'All fields are required',
    'validation.email.required': 'Email is required',
    'validation.password.minLength': 'Password must be at least 6 characters',
    'validation.passwordMatch': 'Passwords do not match',
    'validation.ageRange': 'Age must be between 12 and 100',
    
    // Error
    'error.loginFailed': 'Login Failed',
    'error.signupFailed': 'Signup Failed',
    'error.invalidCredentials': 'Invalid credentials',
    'error.socialLoginFailed': 'Social Login Failed',
    
    // Biometric
    'biometric.success': 'Biometric authentication successful',
    
    // Date Picker
    'datePicker.day': 'Day',
    'datePicker.month': 'Month',
    'datePicker.year': 'Year',
    
    // Settings
    'settings.language': 'Language',
    'settings.profile': 'Profile',
    'settings.notifications': 'Notifications',
    'settings.privacy': 'Privacy',
    'settings.about': 'About',
  },
  ne: {
    // Common
    'common.ok': 'ठीक छ',
    'common.cancel': 'रद्द गर्नुहोस्',
    'common.loading': 'लोड हुँदै...',
    'common.signingIn': 'साइन इन हुँदै...',
    'common.success': 'सफल',
    'common.error': 'त्रुटि',
    
    // Login
    'login.header': 'फेरि स्वागत छ',
    'login.subtitle': 'आफ्नो खेलकुद यात्रा जारी राख्न साइन इन गर्नुहोस्',
    'login.username': 'प्रयोगकर्ता नाम वा इमेल',
    'login.email': 'इमेल',
    'login.phone': 'फोन',
    'login.emailOrUsername': 'इमेल वा प्रयोगकर्ता नाम',
    'login.password': 'पासवर्ड',
    'login.signIn': 'साइन इन',
    'login.signingIn': 'साइन इन हुँदै...',
    'login.forgotPassword': 'पासवर्ड बिर्सनुभयो?',
    'login.rememberMe': 'मलाई सम्झनुहोस्',
    'login.or': 'वा',
    'login.noAccount': 'खाता छैन?',
    'login.createOne': 'नयाँ बनाउनुहोस्',
    'login.demoCredentials': 'डेमो प्रमाणपत्र',
    'login.demo1': 'इमेल: demo@example.com',
    'login.demo2': 'पासवर्ड: demo123',
    'login.demo3': 'फोन: +977-1234567890',
    'login.demo4': 'पासवर्ड: demo123',
    
    // Register
    'register.title': 'खाता बनाउनुहोस्',
    'register.name': 'पूरा नाम',
    'register.username': 'प्रयोगकर्ता नाम',
    'register.email': 'इमेल',
    'register.phoneNumber': 'फोन नम्बर',
    'register.agePlaceholder': 'आफ्नो उमेर छान्नुहोस्',
    'register.location': 'स्थान',
    'register.password': 'पासवर्ड',
    'register.confirmPassword': 'पासवर्ड पुष्टि गर्नुहोस्',
    'register.registerButton': 'खाता बनाउनुहोस्',
    'register.verificationMethod': 'प्रमाणीकरण विधि',
    'register.emailVerification': 'इमेल प्रमाणीकरण',
    'register.phoneVerification': 'फोन प्रमाणीकरण',
    'register.demoAccount': 'डेमो खाता',
    'register.demoCredentials': 'एप परीक्षण गर्न यी प्रमाणपत्र प्रयोग गर्नुहोस्',
    
    // Hero
    'hero.welcomeBack': 'फेरि स्वागत छ!',
    'hero.helloFriend': 'नमस्कार, साथी!',
    'hero.subtitleSignIn': 'खेल्न तयार हुनुहुन्छ?',
    'hero.subtitleSignUp': 'समुदायमा सामेल हुनुहोस्!',
    
    // CTA
    'cta.signUp': 'साइन अप',
    'cta.signIn': 'साइन इन',
    
    // Validation
    'validation.required': 'सबै फिल्डहरू आवश्यक छन्',
    'validation.email.required': 'इमेल आवश्यक छ',
    'validation.password.minLength': 'पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ',
    'validation.passwordMatch': 'पासवर्डहरू मेल खाँदैन',
    'validation.ageRange': 'उमेर १२ देखि १०० को बीचमा हुनुपर्छ',
    
    // Error
    'error.loginFailed': 'लगइन असफल',
    'error.signupFailed': 'साइनअप असफल',
    'error.invalidCredentials': 'अमान्य प्रमाणपत्र',
    'error.socialLoginFailed': 'सामाजिक लगइन असफल',
    
    // Biometric
    'biometric.success': 'बायोमेट्रिक प्रमाणीकरण सफल',
    
    // Date Picker
    'datePicker.day': 'दिन',
    'datePicker.month': 'महिना',
    'datePicker.year': 'वर्ष',
    
    // Settings
    'settings.language': 'भाषा',
    'settings.profile': 'प्रोफाइल',
    'settings.notifications': 'सूचनाहरू',
    'settings.privacy': 'गोपनीयता',
    'settings.about': 'बारेमा',
  },
};

const STORAGE_KEY = 'app_language';

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<LanguageCode>('en');

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(STORAGE_KEY);
        if (stored === 'en' || stored === 'ne') {
          setLang(stored);
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
        // Fallback to default language
        setLang('en');
      }
    })();
  }, []);

  const setLanguage = useCallback(async (code: LanguageCode) => {
    setLang(code);
    await SecureStore.setItemAsync(STORAGE_KEY, code);
  }, []);

  const t = useCallback(
    (key: string) => {
      const dict = TRANSLATIONS[lang];
      return dict[key] ?? TRANSLATIONS.en[key] ?? key;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLanguage, t }), [lang, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

export default LanguageContext;

