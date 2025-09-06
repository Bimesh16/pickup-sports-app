import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { storage } from '@/utils/storage';

type LanguageCode = 'en' | 'ne' | 'es' | 'fr' | 'hi';

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
    'settings.title': 'Settings',
    'settings.appSettings': 'App Settings',
    'settings.support': 'Support',
    'settings.account': 'Account',
    'settings.language': 'Language',
    'settings.languageSubtitle': 'Choose your preferred language',
    'settings.profile': 'Profile',
    'settings.editProfile': 'Edit Profile',
    'settings.editProfileSubtitle': 'Update your personal info',
    'settings.notifications': 'Notifications',
    'settings.notificationsSubtitle': 'Manage your notification preferences',
    'settings.privacy': 'Privacy',
    'settings.privacySubtitle': 'Control what you share',
    'settings.about': 'About',
    'settings.aboutSubtitle': 'Version and app info',
    'settings.contact': 'Contact',
    'settings.contactSubtitle': 'Reach our support team',
    'settings.help': 'Help',
    'settings.helpSubtitle': 'FAQs and guidance',
    'settings.biometric': 'Biometric Login',
    'settings.biometricSubtitle': 'Enable Face ID / Fingerprint',
    'settings.logout': 'Logout',
    'settings.logoutConfirm': 'Are you sure you want to log out?',
    'settings.deleteAccount': 'Delete Account',
    'settings.deleteAccountWarning': 'This action cannot be undone',
    'settings.deleteAccountConfirm': 'Are you sure you want to delete your account? This cannot be undone.',
    'settings.accountDeleted': 'Your account has been deleted.',
    'settings.changePassword': 'Change Password',
    'settings.changePasswordSubtitle': 'Update your password',
    'settings.changeEmail': 'Change Email',
    'settings.changeEmailSubtitle': 'Request email change',
    // Extended Register
    'register.preferredSport': 'Preferred Sport',
    'register.searchSports': 'Search sports...',
    'register.location': 'Location',
    'register.useMyLocation': 'Use my location',
    'register.skillLevel': 'Skill Level',
    'register.continue': 'Continue',
    'register.createAccount': 'Create Account',
    'register.successTitle': 'Account created',
    'register.successSub': 'We sent a verification email. Please verify to sign in.',
    'register.resendVerification': 'Resend verification',

    // Profile
    'profile.aboutMe': 'About Me',
    'profile.upcomingGames': 'Upcoming Games',
    'profile.explore': 'Explore',

    // Toasts
    'toast.profileUpdated': 'Profile updated',
    'toast.avatarUpdated': 'Avatar updated',

    // Misc
    'error.permissionRequired': 'Permission required',
    'error.uploadFailed': 'Upload Failed',
  },
  es: {
    'common.ok': 'OK',
    'common.cancel': 'Cancelar',
    'common.loading': 'Cargando...',
    'common.signingIn': 'Iniciando sesión...',
    'common.success': 'Éxito',
    'common.error': 'Error',
    'login.header': 'Bienvenido de nuevo',
    'login.subtitle': 'Inicia sesión para continuar',
    'login.username': 'Usuario o Email',
    'login.emailOrUsername': 'Email o Usuario',
    'login.password': 'Contraseña',
    'login.signIn': 'Iniciar sesión',
    'login.signingIn': 'Iniciando sesión...',
    'login.forgotPassword': '¿Olvidaste tu contraseña?',
    'login.rememberMe': 'Recuérdame',
    'login.noAccount': '¿No tienes cuenta?',
    'login.createOne': 'Crear una',
    // Extended Register/Profile
    'register.preferredSport': 'Deporte preferido',
    'register.searchSports': 'Buscar deportes...',
    'register.location': 'Ubicación',
    'register.useMyLocation': 'Usar mi ubicación',
    'register.skillLevel': 'Nivel',
    'register.continue': 'Continuar',
    'register.createAccount': 'Crear cuenta',
    'register.successTitle': 'Cuenta creada',
    'register.successSub': 'Enviamos un correo de verificación. Verifica para iniciar sesión.',
    'register.resendVerification': 'Reenviar verificación',
    'profile.aboutMe': 'Sobre mí',
    'profile.upcomingGames': 'Próximos partidos',
    'profile.explore': 'Explorar',
    'toast.profileUpdated': 'Perfil actualizado',
    'toast.avatarUpdated': 'Avatar actualizado',
    'error.permissionRequired': 'Permiso requerido',
    'error.uploadFailed': 'Error al subir',
  },
  fr: {
    'common.ok': 'OK',
    'common.cancel': 'Annuler',
    'common.loading': 'Chargement...',
    'common.signingIn': 'Connexion...',
    'common.success': 'Succès',
    'common.error': 'Erreur',
    'login.header': 'Bon retour',
    'login.subtitle': 'Connectez-vous pour continuer',
    'login.username': 'Nom d’utilisateur ou Email',
    'login.emailOrUsername': 'Email ou Nom d’utilisateur',
    'login.password': 'Mot de passe',
    'login.signIn': 'Se connecter',
    'login.signingIn': 'Connexion...',
    'login.forgotPassword': 'Mot de passe oublié ?',
    'login.rememberMe': 'Se souvenir de moi',
    'login.noAccount': 'Pas de compte ?',
    'login.createOne': 'Créer',
    // Extended Register/Profile
    'register.preferredSport': 'Sport préféré',
    'register.searchSports': 'Rechercher des sports...',
    'register.location': 'Lieu',
    'register.useMyLocation': 'Utiliser ma position',
    'register.skillLevel': 'Niveau',
    'register.continue': 'Continuer',
    'register.createAccount': 'Créer un compte',
    'register.successTitle': 'Compte créé',
    'register.successSub': 'Nous avons envoyé un e-mail de vérification. Veuillez vérifier pour vous connecter.',
    'register.resendVerification': 'Renvoyer la vérification',
    'profile.aboutMe': 'À propos de moi',
    'profile.upcomingGames': 'Prochains matchs',
    'profile.explore': 'Explorer',
    'toast.profileUpdated': 'Profil mis à jour',
    'toast.avatarUpdated': 'Avatar mis à jour',
    'error.permissionRequired': 'Permission requise',
    'error.uploadFailed': 'Échec du téléversement',
  },
  hi: {
    'common.ok': 'ठीक है',
    'common.cancel': 'रद्द',
    'common.loading': 'लोड हो रहा है...',
    'common.signingIn': 'साइन इन हो रहा है...',
    'common.success': 'सफल',
    'common.error': 'त्रुटि',
    'login.header': 'वापसी पर स्वागत है',
    'login.subtitle': 'जारी रखने के लिए साइन इन करें',
    'login.username': 'यूज़रनेम या ईमेल',
    'login.emailOrUsername': 'ईमेल या यूज़रनेम',
    'login.password': 'पासवर्ड',
    'login.signIn': 'साइन इन',
    'login.signingIn': 'साइन इन हो रहा है...',
    'login.forgotPassword': 'पासवर्ड भूल गए?',
    'login.rememberMe': 'मुझे याद रखें',
    'login.noAccount': 'कोई खाता नहीं?',
    'login.createOne': 'एक बनाएं',
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
    'settings.title': 'सेटिङ्स',
    'settings.appSettings': 'एप सेटिङ्स',
    'settings.support': 'समर्थन',
    'settings.account': 'खाता',
    'settings.language': 'भाषा',
    'settings.languageSubtitle': 'आफ्नो मन पर्ने भाषा छान्नुहोस्',
    'settings.profile': 'प्रोफाइल',
    'settings.editProfile': 'प्रोफाइल सम्पादन',
    'settings.editProfileSubtitle': 'आफ्नो जानकारी अपडेट गर्नुहोस्',
    'settings.notifications': 'सूचनाहरू',
    'settings.notificationsSubtitle': 'सूचना प्राथमिकता मिलाउनुहोस्',
    'settings.privacy': 'गोपनीयता',
    'settings.privacySubtitle': 'तपाईंले के सेयर गर्नुहुन्छ नियन्त्रण गर्नुहोस्',
    'settings.about': 'बारेमा',
    'settings.aboutSubtitle': 'संस्करण र जानकारी',
    'settings.contact': 'सम्पर्क',
    'settings.contactSubtitle': 'समर्थन टोलीसँग सम्पर्क गर्नुहोस्',
    'settings.help': 'सहायता',
    'settings.helpSubtitle': 'FAQ र मार्गदर्शन',
    'settings.biometric': 'बायोमेट्रिक लगइन',
    'settings.biometricSubtitle': 'Face ID / Fingerprint सक्रिय गर्नुहोस्',
    'settings.logout': 'लगआउट',
    'settings.logoutConfirm': 'के तपाईं लगआउट गर्न चाहनुहुन्छ?',
    'settings.deleteAccount': 'खाता मेटाउनुहोस्',
    'settings.deleteAccountWarning': 'यो काम फिर्ता गर्न सकिँदैन',
    'settings.deleteAccountConfirm': 'के तपाईं पक्का हुनुहुन्छ? यो काम फिर्ता गर्न सकिँदैन।',
    'settings.accountDeleted': 'तपाईंको खाता मेटाइयो।',
    'settings.changePassword': 'पासवर्ड परिवर्तन',
    'settings.changePasswordSubtitle': 'पासवर्ड अपडेट गर्नुहोस्',
    'settings.changeEmail': 'इमेल परिवर्तन',
    'settings.changeEmailSubtitle': 'इमेल परिवर्तन अनुरोध गर्नुहोस्',
    // Extended Register
    'register.preferredSport': 'मनपर्ने खेल',
    'register.searchSports': 'खेल खोज्नुहोस्...',
    'register.location': 'स्थान',
    'register.useMyLocation': 'मेरो स्थान प्रयोग गर्नुहोस्',
    'register.skillLevel': 'सीप स्तर',
    'register.continue': 'जारी राख्नुहोस्',
    'register.createAccount': 'खाता बनाउनुहोस्',
    'register.successTitle': 'खाता तयार भयो',
    'register.successSub': 'हामीले प्रमाणीकरण इमेल पठाएका छौं। कृपया साइन इन गर्नुअघि प्रमाणीकरण गर्नुहोस्।',
    'register.resendVerification': 'प्रमाणीकरण पुन: पठाउनुहोस्',

    // Profile
    'profile.aboutMe': 'मेरो बारे',
    'profile.upcomingGames': 'आगामी खेलहरू',
    'profile.explore': 'हेरौँ',

    // Toasts
    'toast.profileUpdated': 'प्रोफाइल अपडेट भयो',
    'toast.avatarUpdated': 'अवतार अपडेट भयो',

    // Misc
    'error.permissionRequired': 'अनुमति आवश्यक छ',
    'error.uploadFailed': 'अपलोड असफल',
  },
  hi: {
    // Common
    'common.ok': 'ठीक है',
    'common.cancel': 'रद्द',
    'common.loading': 'लोड हो रहा है...',
    'common.signingIn': 'साइन इन हो रहा है...',
    'common.success': 'सफल',
    'common.error': 'त्रुटि',
    // Login
    'login.header': 'वापसी पर स्वागत है',
    'login.subtitle': 'जारी रखने के लिए साइन इन करें',
    'login.username': 'यूज़रनेम या ईमेल',
    'login.emailOrUsername': 'ईमेल या यूज़रनेम',
    'login.password': 'पासवर्ड',
    'login.signIn': 'साइन इन',
    'login.signingIn': 'साइन इन हो रहा है...',
    'login.forgotPassword': 'पासवर्ड भूल गए?',
    'login.rememberMe': 'मुझे याद रखें',
    'login.noAccount': 'कोई खाता नहीं?',
    'login.createOne': 'एक बनाएं',
    // Extended Register/Profile
    'register.preferredSport': 'पसंदीदा खेल',
    'register.searchSports': 'खेल खोजें...',
    'register.location': 'स्थान',
    'register.useMyLocation': 'मेरा स्थान उपयोग करें',
    'register.skillLevel': 'कौशल स्तर',
    'register.continue': 'जारी रखें',
    'register.createAccount': 'खाता बनाएँ',
    'register.successTitle': 'खाता बन गया',
    'register.successSub': 'हमने एक सत्यापन ईमेल भेजा है। साइन इन करने से पहले सत्यापित करें।',
    'register.resendVerification': 'सत्यापन फिर से भेजें',
    'profile.aboutMe': 'मेरे बारे में',
    'profile.upcomingGames': 'आगामी खेल',
    'profile.explore': 'देखें',
    'toast.profileUpdated': 'प्रोफ़ाइल अपडेट हुई',
    'toast.avatarUpdated': 'अवतार अपडेट हुआ',
    'error.permissionRequired': 'अनुमति आवश्यक है',
    'error.uploadFailed': 'अपलोड विफल',
  },
};

const STORAGE_KEY = 'app_language';

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<LanguageCode>('en');

  useEffect(() => {
    (async () => {
      try {
        const stored = await storage.getItem(STORAGE_KEY);
        if (stored === 'en' || stored === 'ne' || stored === 'es' || stored === 'fr' || stored === 'hi') {
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
    await storage.setItem(STORAGE_KEY, code);
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
