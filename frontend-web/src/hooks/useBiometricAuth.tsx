import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

interface BiometricAuthConfig {
  enableFingerprint: boolean;
  enableFaceId: boolean;
  enableTouchId: boolean;
  fallbackToPassword: boolean;
}

const defaultConfig: BiometricAuthConfig = {
  enableFingerprint: true,
  enableFaceId: true,
  enableTouchId: true,
  fallbackToPassword: true,
};

export const useBiometricAuth = (config: Partial<BiometricAuthConfig> = {}) => {
  const authConfig = { ...defaultConfig, ...config };
  const { login } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'face' | 'touch' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if WebAuthn is supported
  const checkWebAuthnSupport = useCallback(() => {
    return (
      typeof window !== 'undefined' &&
      'navigator' in window &&
      'credentials' in navigator &&
      'create' in navigator.credentials &&
      'get' in navigator.credentials
    );
  }, []);

  // Check if biometric authentication is available
  const checkBiometricAvailability = useCallback(async () => {
    if (!checkWebAuthnSupport()) {
      return false;
    }

    try {
      // Check if platform authenticator is available
      const available = await navigator.credentials.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    } catch (error) {
      console.warn('Biometric availability check failed:', error);
      return false;
    }
  }, [checkWebAuthnSupport]);

  // Detect biometric type
  const detectBiometricType = useCallback(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      // iOS - could be Face ID or Touch ID
      return 'face'; // Default to Face ID for iOS
    } else if (userAgent.includes('android')) {
      // Android - could be fingerprint or face
      return 'fingerprint'; // Default to fingerprint for Android
    } else if (userAgent.includes('mac')) {
      // macOS - could be Touch ID
      return 'touch';
    }
    
    return 'fingerprint'; // Default fallback
  }, []);

  // Initialize biometric authentication
  useEffect(() => {
    const initBiometric = async () => {
      const supported = checkWebAuthnSupport();
      setIsSupported(supported);

      if (supported) {
        const available = await checkBiometricAvailability();
        setIsAvailable(available);
        
        if (available) {
          const type = detectBiometricType();
          setBiometricType(type);
        }
      }
    };

    initBiometric();
  }, [checkWebAuthnSupport, checkBiometricAvailability, detectBiometricType]);

  // Register biometric credential
  const registerBiometric = useCallback(async (userId: string, userEmail: string) => {
    if (!isSupported || !isAvailable) {
      throw new Error('Biometric authentication not supported');
    }

    try {
      setIsLoading(true);
      setError(null);

      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'Pickup Sports',
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(userId),
            name: userEmail,
            displayName: userEmail,
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 }, // ES256
            { type: 'public-key', alg: -257 }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 60000,
          attestation: 'direct',
        },
      });

      // Store the credential ID for future use
      if (credential && 'rawId' in credential) {
        const credentialId = Array.from(new Uint8Array(credential.rawId));
        localStorage.setItem('biometricCredentialId', JSON.stringify(credentialId));
        localStorage.setItem('biometricUserId', userId);
      }

      return credential;
    } catch (error) {
      console.error('Biometric registration failed:', error);
      setError('Failed to register biometric authentication');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, isAvailable]);

  // Authenticate with biometric
  const authenticateBiometric = useCallback(async () => {
    if (!isSupported || !isAvailable) {
      throw new Error('Biometric authentication not supported');
    }

    try {
      setIsLoading(true);
      setError(null);

      const storedCredentialId = localStorage.getItem('biometricCredentialId');
      const storedUserId = localStorage.getItem('biometricUserId');

      if (!storedCredentialId || !storedUserId) {
        throw new Error('No biometric credential found');
      }

      const credentialId = new Uint8Array(JSON.parse(storedCredentialId));
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [
            {
              id: credentialId,
              type: 'public-key',
              transports: ['internal'],
            },
          ],
          userVerification: 'required',
          timeout: 60000,
        },
      });

      if (credential) {
        // Use the stored user ID to login
        await login(storedUserId, 'biometric');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      setError('Biometric authentication failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, isAvailable, login]);

  // Check if biometric is enrolled
  const isBiometricEnrolled = useCallback(() => {
    return !!(
      localStorage.getItem('biometricCredentialId') &&
      localStorage.getItem('biometricUserId')
    );
  }, []);

  // Clear biometric data
  const clearBiometric = useCallback(() => {
    localStorage.removeItem('biometricCredentialId');
    localStorage.removeItem('biometricUserId');
  }, []);

  // Get biometric type display name
  const getBiometricTypeName = useCallback(() => {
    switch (biometricType) {
      case 'fingerprint':
        return 'Fingerprint';
      case 'face':
        return 'Face ID';
      case 'touch':
        return 'Touch ID';
      default:
        return 'Biometric';
    }
  }, [biometricType]);

  // Get biometric icon
  const getBiometricIcon = useCallback(() => {
    switch (biometricType) {
      case 'fingerprint':
        return '👆';
      case 'face':
        return '👤';
      case 'touch':
        return '👆';
      default:
        return '🔐';
    }
  }, [biometricType]);

  return {
    isSupported,
    isAvailable,
    isEnrolled: isBiometricEnrolled(),
    biometricType,
    isLoading,
    error,
    registerBiometric,
    authenticateBiometric,
    clearBiometric,
    getBiometricTypeName,
    getBiometricIcon,
  };
};
