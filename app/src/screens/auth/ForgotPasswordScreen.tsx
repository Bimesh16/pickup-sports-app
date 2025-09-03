import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { authService } from '@/services/authService';
import { colors, typography, spacing, shadows } from '@/constants/theme';
import { VALIDATION } from '@/constants/config';
import { handleApiError } from '@/services/api';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleInputChange = (value: string) => {
    setUsername(value);
    if (validationError) {
      setValidationError('');
    }
  };

  const validateInput = (): boolean => {
    if (!username.trim()) {
      setValidationError('Username or email is required');
      return false;
    }

    // Check if it's an email or username
    const isEmail = username.includes('@');
    
    if (isEmail && !VALIDATION.EMAIL.PATTERN.test(username)) {
      setValidationError('Please enter a valid email address');
      return false;
    }

    if (!isEmail && username.length < VALIDATION.USERNAME.MIN_LENGTH) {
      setValidationError(`Username must be at least ${VALIDATION.USERNAME.MIN_LENGTH} characters`);
      return false;
    }

    return true;
  };

  const handleForgotPassword = async () => {
    if (!validateInput()) {
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword({ username: username.trim() });
      setIsEmailSent(true);
      Alert.alert(
        'Reset Email Sent',
        'If an account with this username/email exists, you will receive password reset instructions.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      const errorMessage = handleApiError(error);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!username.trim()) return;

    setIsLoading(true);
    try {
      await authService.forgotPassword({ username: username.trim() });
      Alert.alert('Email Resent', 'Password reset email has been resent.');
    } catch (error) {
      const errorMessage = handleApiError(error);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={48} color={colors.primary} />
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.titleNepali}>पासवर्ड बिर्सनुभयो?</Text>
            <Text style={styles.subtitle}>
              {!isEmailSent 
                ? "Don't worry! Enter your username or email and we'll send you reset instructions."
                : "Check your email for password reset instructions."
              }
            </Text>
          </View>
        </View>

        {/* Form */}
        <View style={[styles.formContainer, shadows.md]}>
          {!isEmailSent ? (
            <>
              <Text style={styles.formTitle}>Reset Password</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Username or Email</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={handleInputChange}
                    placeholder="Enter username or email"
                    placeholderTextColor={colors.placeholder}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    textContentType="username"
                    editable={!isLoading}
                  />
                </View>
                {validationError && (
                  <Text style={styles.errorText}>{validationError}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.resetButton, 
                  shadows.sm,
                  isLoading && styles.resetButtonDisabled
                ]}
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                <Text style={styles.resetButtonText}>
                  {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={64} color={colors.success} />
                <Text style={styles.successTitle}>Email Sent!</Text>
                <Text style={styles.successMessage}>
                  We've sent password reset instructions to your email address. 
                  Please check your inbox and follow the instructions.
                </Text>
                <Text style={styles.successNote}>
                  Don't see the email? Check your spam folder or try resending.
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.resendButton, 
                  shadows.sm,
                  isLoading && styles.resendButtonDisabled
                ]}
                onPress={handleResendEmail}
                disabled={isLoading}
              >
                <Text style={styles.resendButtonText}>
                  {isLoading ? 'Resending...' : 'Resend Email'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Reset Instructions:</Text>
            <View style={styles.instructionItem}>
              <Ionicons name="mail-outline" size={16} color={colors.primary} />
              <Text style={styles.instructionText}>Check your email inbox</Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="link-outline" size={16} color={colors.primary} />
              <Text style={styles.instructionText}>Click the reset link</Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="create-outline" size={16} color={colors.primary} />
              <Text style={styles.instructionText}>Create a new password</Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="checkmark-outline" size={16} color={colors.primary} />
              <Text style={styles.instructionText}>Sign in with new password</Text>
            </View>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={styles.backToLoginButton}
            onPress={() => navigation.navigate('Login')}
            disabled={isLoading}
          >
            <Ionicons name="arrow-back-outline" size={20} color={colors.primary} />
            <Text style={styles.backToLoginText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View style={[styles.helpContainer, shadows.sm]}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            If you're having trouble resetting your password, please contact our support team.
          </Text>
          <Text style={styles.helpContact}>
            Email: support@pickupsports.com.np
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
  },
  header: {
    marginBottom: spacing['3xl'],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  titleContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  titleNepali: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    paddingHorizontal: spacing.md,
  },
  formContainer: {
    backgroundColor: colors.surface,
    padding: spacing['2xl'],
    borderRadius: 16,
    marginBottom: spacing.xl,
  },
  formTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  resetButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  resetButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  resetButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.onPrimary,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  successMessage: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing.md,
  },
  successNote: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  resendButton: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  resendButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  resendButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.onSecondary,
  },
  instructionsContainer: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  instructionsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  instructionText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  backToLoginText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  helpContainer: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 16,
  },
  helpTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  helpText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing.md,
  },
  helpContact: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
});