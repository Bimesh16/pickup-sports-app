import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { NepalColors, FontSizes, Spacing } from '../../constants/theme';

interface BiometricAuthProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function BiometricAuth({ onSuccess, onError }: BiometricAuthProps) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<LocalAuthentication.AuthenticationType[]>([]);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (hasHardware && isEnrolled) {
        setIsAvailable(true);
        setBiometricType(supportedTypes);
      } else {
        setIsAvailable(false);
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsAvailable(false);
    }
  };

  const handleBiometricAuth = async () => {
    if (!isAvailable) {
      onError('Biometric authentication not available');
      return;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to continue',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        onSuccess();
      } else {
        onError('Authentication failed');
      }
    } catch (error) {
      onError('Biometric authentication error');
    }
  };

  const getBiometricIcon = () => {
    if (biometricType.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'scan';
    } else if (biometricType.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'finger-print';
    } else if (biometricType.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'eye';
    }
    return 'shield-checkmark';
  };

  const getBiometricText = () => {
    if (biometricType.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    } else if (biometricType.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Touch ID';
    } else if (biometricType.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    }
    return 'Biometric';
  };

  if (!isAvailable) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricAuth}>
        <Ionicons name={getBiometricIcon()} size={24} color={NepalColors.primary} />
        <Text style={styles.biometricText}>
          Use {getBiometricText()}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  biometricText: {
    color: 'white',
    fontSize: FontSizes.base,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
});

