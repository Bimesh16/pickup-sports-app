import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScrollContainer from '../../components/common/ScrollContainer';
import AdvancedDropdown, { SKILL_LEVEL_OPTIONS } from '../../components/common/AdvancedDropdown';
import { useAuthActions, useAuthLoading, useAuthError } from '../../stores/authStore';
import { useCurrentLocation } from '../../stores/locationStore';
import { NepalColors, commonStyles } from '../../styles/theme';
import { RegisterRequest } from '../../types';

type RegisterScreenNavigationProp = StackNavigationProp<any, 'Register'>;

/**
 * Registration Screen with comprehensive form validation
 */
const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { register, clearError } = useAuthActions();
  const isLoading = useAuthLoading();
  const error = useAuthError();
  const currentLocation = useCurrentLocation();

  // Form state
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    country: currentLocation?.country || 'Nepal',
    city: currentLocation?.city || 'Kathmandu',
    phoneNumber: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [skillLevel, setSkillLevel] = useState('');
  const [formErrors, setFormErrors] = useState<any>({});

  React.useEffect(() => {
    clearError();
  }, [clearError]);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const errors: any = {};

    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation (optional)
    if (formData.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, confirmPassword]);

  // Handle form input changes
  const handleInputChange = useCallback((field: keyof RegisterRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [formErrors]);

  // Handle registration submission
  const handleRegister = useCallback(async () => {
    if (!validateForm()) return;

    try {
      await register(formData);
      // Navigation handled by RootNavigator based on auth state
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.response?.data?.message || 'Please check your information and try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, [formData, validateForm, register]);

  // Navigate to login
  const handleNavigateToLogin = () => {
    navigation.navigate('Login');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={[NepalColors.primaryBlue, NepalColors.primaryCrimson]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={NepalColors.primaryWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Form Container */}
      <ScrollContainer
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <View style={styles.form}>
            {/* Welcome Text */}
            <Text style={styles.welcomeText}>
              Join the community and start playing
            </Text>

            {/* Personal Information */}
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <TextInput
                  label="First Name"
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  mode="outlined"
                  error={!!formErrors.firstName}
                  style={styles.textInput}
                  theme={{ colors: { primary: NepalColors.primaryCrimson } }}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
                <HelperText type="error" visible={!!formErrors.firstName}>
                  {formErrors.firstName}
                </HelperText>
              </View>
              
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <TextInput
                  label="Last Name"
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  mode="outlined"
                  error={!!formErrors.lastName}
                  style={styles.textInput}
                  theme={{ colors: { primary: NepalColors.primaryCrimson } }}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
                <HelperText type="error" visible={!!formErrors.lastName}>
                  {formErrors.lastName}
                </HelperText>
              </View>
            </View>

            {/* Account Information */}
            <Text style={styles.sectionTitle}>Account Information</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                label="Username"
                value={formData.username}
                onChangeText={(value) => handleInputChange('username', value)}
                mode="outlined"
                error={!!formErrors.username}
                style={styles.textInput}
                theme={{ colors: { primary: NepalColors.primaryCrimson } }}
                left={<TextInput.Icon icon="account" />}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
              <HelperText type="error" visible={!!formErrors.username}>
                {formErrors.username}
              </HelperText>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Email"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                mode="outlined"
                error={!!formErrors.email}
                style={styles.textInput}
                theme={{ colors: { primary: NepalColors.primaryCrimson } }}
                left={<TextInput.Icon icon="email" />}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
              <HelperText type="error" visible={!!formErrors.email}>
                {formErrors.email}
              </HelperText>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Phone Number (Optional)"
                value={formData.phoneNumber || ''}
                onChangeText={(value) => handleInputChange('phoneNumber', value)}
                mode="outlined"
                error={!!formErrors.phoneNumber}
                style={styles.textInput}
                theme={{ colors: { primary: NepalColors.primaryCrimson } }}
                left={<TextInput.Icon icon="phone" />}
                keyboardType="phone-pad"
                returnKeyType="next"
              />
              <HelperText type="error" visible={!!formErrors.phoneNumber}>
                {formErrors.phoneNumber}
              </HelperText>
            </View>

            {/* Password Section */}
            <Text style={styles.sectionTitle}>Security</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                label="Password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                mode="outlined"
                error={!!formErrors.password}
                secureTextEntry={!showPassword}
                style={styles.textInput}
                theme={{ colors: { primary: NepalColors.primaryCrimson } }}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                returnKeyType="next"
              />
              <HelperText type="error" visible={!!formErrors.password}>
                {formErrors.password}
              </HelperText>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                error={!!formErrors.confirmPassword}
                secureTextEntry={!showConfirmPassword}
                style={styles.textInput}
                theme={{ colors: { primary: NepalColors.primaryCrimson } }}
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              <HelperText type="error" visible={!!formErrors.confirmPassword}>
                {formErrors.confirmPassword}
              </HelperText>
            </View>

            {/* Skill Level Dropdown */}
            <Text style={styles.sectionTitle}>Sports Preferences</Text>
            
            <View style={styles.inputContainer}>
              <AdvancedDropdown
                options={SKILL_LEVEL_OPTIONS}
                value={skillLevel}
                onSelect={setSkillLevel}
                placeholder="Select your skill level"
                style={styles.dropdown}
              />
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Register Button */}
            <Button
              mode="contained"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.registerButton}
              labelStyle={styles.registerButtonText}
              buttonColor={NepalColors.primaryCrimson}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            {/* Login Link */}
            <TouchableOpacity
              style={styles.loginLinkButton}
              onPress={handleNavigateToLogin}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLinkText}>
                Already have an account?{' '}
                <Text style={styles.loginLinkHighlight}>Sign In</Text>
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
    paddingVertical: commonStyles.padding.large,
  },
  formContainer: {
    marginHorizontal: commonStyles.padding.large,
  },
  form: {
    backgroundColor: NepalColors.primaryWhite,
    borderRadius: commonStyles.borderRadius.xl,
    padding: commonStyles.padding.xl,
    ...commonStyles.shadows.large,
  },
  welcomeText: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.onSurface,
    textAlign: 'center',
    marginBottom: commonStyles.padding.xl,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryCrimson,
    marginBottom: commonStyles.padding.medium,
    marginTop: commonStyles.padding.medium,
  },
  row: {
    flexDirection: 'row',
    gap: commonStyles.padding.medium,
  },
  halfWidth: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: commonStyles.padding.medium,
  },
  textInput: {
    backgroundColor: NepalColors.surface,
  },
  dropdown: {
    marginBottom: commonStyles.padding.small,
  },
  errorContainer: {
    backgroundColor: NepalColors.error + '15',
    borderColor: NepalColors.error,
    borderWidth: 1,
    borderRadius: commonStyles.borderRadius.small,
    padding: commonStyles.padding.medium,
    marginBottom: commonStyles.padding.medium,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.error,
    textAlign: 'center',
  },
  registerButton: {
    marginTop: commonStyles.padding.large,
    borderRadius: commonStyles.borderRadius.medium,
    paddingVertical: 4,
  },
  registerButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  loginLinkButton: {
    alignSelf: 'center',
    marginTop: commonStyles.padding.large,
    padding: commonStyles.padding.small,
  },
  loginLinkText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    textAlign: 'center',
  },
  loginLinkHighlight: {
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryCrimson,
  },
});

export default RegisterScreen;