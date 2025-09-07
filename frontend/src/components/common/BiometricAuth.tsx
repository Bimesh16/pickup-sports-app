import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLocalAuth } from '@/utils/localAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { InteractiveButton } from './InteractiveButton';

interface BiometricAuthProps {
  onSuccess: () => Promise<void>;
  onError: (error: string) => void;
}

const BiometricAuth: React.FC<BiometricAuthProps> = ({ onSuccess, onError }) => {
  const { colors, isDark } = useTheme();
  const { currentLanguage } = useLanguage();
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const LocalAuthentication = getLocalAuth();
      
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (hasHardware && isEnrolled) {
        setIsAvailable(true);
        
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Touch ID');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
          setBiometricType('Iris');
        } else {
          setBiometricType('Biometric');
        }
      }
    } catch (error) {
      console.log('Biometric availability check error:', error);
    }
  };

  const handleBiometricAuth = async () => {
    if (!isAvailable) {
      onError('Biometric authentication not available');
      return;
    }

    try {
      const LocalAuthentication = getLocalAuth();
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: currentLanguage === 'ne' 
          ? 'बायोमेट्रिक प्रमाणीकरण' 
          : 'Biometric Authentication',
        cancelLabel: currentLanguage === 'ne' ? 'रद्द गर्नुहोस्' : 'Cancel',
        fallbackLabel: currentLanguage === 'ne' ? 'पासवर्ड प्रयोग गर्नुहोस्' : 'Use Password',
      });

      if (result.success) {
        await onSuccess();
      } else {
        onError('Authentication failed');
      }
    } catch (error) {
      onError('Biometric authentication error');
    }
  };

  if (!isAvailable) {
    return null;
  }

  return (
    <View style={styles.container}>
      <InteractiveButton
        title={
          currentLanguage === 'ne' 
            ? `${biometricType} प्रयोग गर्नुहोस्` 
            : `Use ${biometricType}`
        }
        onPress={handleBiometricAuth}
        variant="outline"
        size="medium"
        style={styles.biometricButton}
        icon={
          <Ionicons
            name={
              biometricType === 'Face ID' 
                ? 'scan-outline' 
                : biometricType === 'Touch ID'
                ? 'finger-print-outline'
                : 'shield-checkmark-outline'
            }
            size={20}
            color={colors.primary}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  biometricButton: {
    marginBottom: 10,
  },
});

export { BiometricAuth };