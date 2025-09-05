import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NepalColors, FontSizes, Spacing } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types';

type VerifyEmailScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'VerifyEmail'>;
type VerifyEmailScreenRouteProp = RouteProp<AuthStackParamList, 'VerifyEmail'>;

export default function VerifyEmailScreen() {
  const navigation = useNavigation<VerifyEmailScreenNavigationProp>();
  const route = useRoute<VerifyEmailScreenRouteProp>();
  const { verifyEmail, resendVerification, isLoading } = useAuthStore();
  
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const email = route.params?.email || '';

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit verification code');
      return;
    }

    try {
      await verifyEmail(email, code);
      Alert.alert('Success', 'Email verified successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('SignIn') }
      ]);
    } catch (error) {
      Alert.alert('Verification Failed', error instanceof Error ? error.message : 'Invalid verification code');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    try {
      await resendVerification('email', email);
      setTimer(60);
      setCanResend(false);
      Alert.alert('Success', 'Verification code sent to your email');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend verification code');
    }
  };

  return (
    <LinearGradient
      colors={[NepalColors.primary, NepalColors.secondary]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={NepalColors.textLight} />
          </TouchableOpacity>
          <View style={styles.iconContainer}>
            <Ionicons name="mail" size={60} color={NepalColors.textLight} />
          </View>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a verification code to{'\n'}
            <Text style={styles.email}>{email}</Text>
          </Text>
        </View>

        <Card style={styles.formCard}>
          <Card.Content style={styles.formContent}>
            <Text style={styles.instructionText}>
              Enter the 6-digit code sent to your email
            </Text>

            <TextInput
              label="Verification Code"
              value={code}
              onChangeText={setCode}
              mode="outlined"
              keyboardType="numeric"
              maxLength={6}
              style={styles.input}
              theme={{
                colors: {
                  primary: NepalColors.primary,
                },
              }}
            />

            <Button
              mode="contained"
              onPress={handleVerify}
              loading={isLoading}
              disabled={isLoading || code.length !== 6}
              style={styles.verifyButton}
              contentStyle={styles.buttonContent}
            >
              Verify Email
            </Button>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Didn't receive the code?{' '}
              </Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={!canResend}
                style={styles.resendButton}
              >
                <Text style={[
                  styles.resendButtonText,
                  !canResend && styles.disabledText
                ]}>
                  {canResend ? 'Resend Code' : `Resend in ${timer}s`}
                </Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: Spacing.sm,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes['3xl'],
    fontWeight: '700',
    color: NepalColors.textLight,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  email: {
    fontWeight: '600',
    color: NepalColors.textLight,
  },
  formCard: {
    backgroundColor: NepalColors.background,
    borderRadius: 16,
    elevation: 8,
  },
  formContent: {
    padding: Spacing.xl,
  },
  instructionText: {
    fontSize: FontSizes.base,
    color: NepalColors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  input: {
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  verifyButton: {
    marginBottom: Spacing.lg,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: Spacing.sm,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  resendText: {
    fontSize: FontSizes.base,
    color: NepalColors.textSecondary,
  },
  resendButton: {
    padding: Spacing.xs,
  },
  resendButtonText: {
    fontSize: FontSizes.base,
    color: NepalColors.primary,
    fontWeight: '600',
  },
  disabledText: {
    color: NepalColors.textSecondary,
  },
});

