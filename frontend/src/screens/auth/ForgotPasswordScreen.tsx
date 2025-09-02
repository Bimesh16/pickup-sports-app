import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScrollContainer from '../../components/common/ScrollContainer';
import { authAPI } from '../../services/api';
import { NepalColors, commonStyles } from '../../styles/theme';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<any, 'ForgotPassword'>;

/**
 * Forgot Password Screen
 */
const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = useCallback((email: string): boolean => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    setEmailError('');
    return true;
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateEmail(email)) return;

    setIsLoading(true);
    
    try {
      await authAPI.forgotPassword(email);
      setIsSuccess(true);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to send reset email. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, [email, validateEmail]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  if (isSuccess) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[NepalColors.primaryBlue, NepalColors.primaryCrimson]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        <View style={[styles.successContainer, { paddingTop: insets.top + 40 }]}>
          <View style={styles.successContent}>
            <Ionicons name="mail" size={80} color={NepalColors.primaryWhite} />
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successText}>
              We've sent a password reset link to {email}
            </Text>
            <Text style={styles.successSubtext}>
              Check your email and follow the instructions to reset your password.
            </Text>
            
            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={handleBackToLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[NepalColors.primaryBlue, NepalColors.primaryCrimson]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={NepalColors.primaryWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reset Password</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollContainer
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <View style={styles.form}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={48} color={NepalColors.primaryCrimson} />
            </View>
            
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              No worries! Enter your email address and we'll send you instructions to reset your password.
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                error={!!emailError}
                style={styles.textInput}
                theme={{
                  colors: {
                    primary: NepalColors.primaryCrimson,
                    outline: NepalColors.outline,
                  },
                }}
                left={<TextInput.Icon icon="email" />}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="send"
                onSubmitEditing={handleSubmit}
              />
              <HelperText type="error" visible={!!emailError}>
                {emailError}
              </HelperText>
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
              labelStyle={styles.submitButtonText}
              buttonColor={NepalColors.primaryCrimson}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <TouchableOpacity
              style={styles.backToLoginLink}
              onPress={handleBackToLogin}
              activeOpacity={0.7}
            >
              <Text style={styles.backToLoginLinkText}>
                Remember your password?{' '}
                <Text style={styles.backToLoginHighlight}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: commonStyles.padding.large,
    paddingBottom: commonStyles.padding.medium,
  },
  backButton: {
    padding: commonStyles.padding.small,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryWhite,
    textAlign: 'center',
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    marginHorizontal: commonStyles.padding.large,
    marginVertical: commonStyles.padding.xl,
  },
  form: {
    backgroundColor: NepalColors.primaryWhite,
    borderRadius: commonStyles.borderRadius.xl,
    padding: commonStyles.padding.xl,
    ...commonStyles.shadows.large,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: NepalColors.primaryCrimson + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: commonStyles.padding.large,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: NepalColors.onSurface,
    textAlign: 'center',
    marginBottom: commonStyles.padding.medium,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: commonStyles.padding.xl,
  },
  inputContainer: {
    width: '100%',
    marginBottom: commonStyles.padding.medium,
  },
  textInput: {
    backgroundColor: NepalColors.surface,
  },
  submitButton: {
    width: '100%',
    marginTop: commonStyles.padding.medium,
    borderRadius: commonStyles.borderRadius.medium,
    paddingVertical: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  backToLoginLink: {
    marginTop: commonStyles.padding.large,
    padding: commonStyles.padding.small,
  },
  backToLoginLinkText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    textAlign: 'center',
  },
  backToLoginHighlight: {
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryCrimson,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: commonStyles.padding.xl,
  },
  successContent: {
    alignItems: 'center',
    backgroundColor: NepalColors.primaryWhite,
    borderRadius: commonStyles.borderRadius.xl,
    padding: commonStyles.padding.xl * 2,
    ...commonStyles.shadows.large,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: NepalColors.onSurface,
    textAlign: 'center',
    marginTop: commonStyles.padding.large,
    marginBottom: commonStyles.padding.medium,
  },
  successText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.onSurface,
    textAlign: 'center',
    marginBottom: commonStyles.padding.medium,
  },
  successSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: commonStyles.padding.xl,
  },
  backToLoginButton: {
    backgroundColor: NepalColors.primaryCrimson,
    paddingHorizontal: commonStyles.padding.xl,
    paddingVertical: commonStyles.padding.medium,
    borderRadius: commonStyles.borderRadius.medium,
  },
  backToLoginText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryWhite,
  },
});

export default ForgotPasswordScreen;