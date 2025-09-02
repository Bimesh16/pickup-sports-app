import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScrollContainer from '../../components/common/ScrollContainer';
import { useAuthActions, useAuthLoading, useAuthError } from '../../stores/authStore';
import { NepalColors, commonStyles } from '../../styles/theme';
import { LoginRequest } from '../../types';

type LoginScreenNavigationProp = StackNavigationProp<any, 'Login'>;

/**
 * Login Screen with advanced form handling and animations
 */
const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { login, clearError } = useAuthActions();
  const isLoading = useAuthLoading();
  const error = useAuthError();

  // Form state
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<LoginRequest>>({});

  // Animation values
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(30);

  React.useEffect(() => {
    // Clear any previous errors
    clearError();
    
    // Start form animation
    formOpacity.value = withTiming(1, { duration: 600 });
    formTranslateY.value = withSpring(0, { damping: 20, stiffness: 300 });
  }, [clearError]);

  // Animated styles
  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  // Form validation
  const validateForm = useCallback((): boolean => {
    const errors: Partial<LoginRequest> = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle form input changes
  const handleInputChange = useCallback((field: keyof LoginRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [formErrors]);

  // Handle login submission
  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;

    try {
      await login(formData);
      // Navigation handled by RootNavigator based on auth state
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'Please check your credentials and try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, [formData, validateForm, login]);

  // Navigate to register
  const handleNavigateToRegister = () => {
    navigation.navigate('Register');
  };

  // Navigate to forgot password
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  // Navigate back to welcome
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
        <Text style={styles.headerTitle}>Welcome Back</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Form Container */}
      <ScrollContainer
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
          <View style={styles.form}>
            {/* Welcome Text */}
            <Text style={styles.welcomeText}>
              Sign in to continue your sports journey
            </Text>

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Username or Email"
                value={formData.username}
                onChangeText={(value) => handleInputChange('username', value)}
                mode="outlined"
                error={!!formErrors.username}
                style={styles.textInput}
                theme={{
                  colors: {
                    primary: NepalColors.primaryCrimson,
                    outline: NepalColors.outline,
                  },
                }}
                left={<TextInput.Icon icon="account" />}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
              <HelperText type="error" visible={!!formErrors.username}>
                {formErrors.username}
              </HelperText>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                mode="outlined"
                error={!!formErrors.password}
                secureTextEntry={!showPassword}
                style={styles.textInput}
                theme={{
                  colors: {
                    primary: NepalColors.primaryCrimson,
                    outline: NepalColors.outline,
                  },
                }}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <HelperText type="error" visible={!!formErrors.password}>
                {formErrors.password}
              </HelperText>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Login Button */}
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
              labelStyle={styles.loginButtonText}
              buttonColor={NepalColors.primaryCrimson}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register Link */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleNavigateToRegister}
              activeOpacity={0.8}
            >
              <Text style={styles.registerText}>
                Don't have an account?{' '}
                <Text style={styles.registerLinkText}>Create one</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
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
    marginRight: 40, // Compensate for back button width
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
  },
  welcomeText: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.onSurface,
    textAlign: 'center',
    marginBottom: commonStyles.padding.xl,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: commonStyles.padding.medium,
  },
  textInput: {
    backgroundColor: NepalColors.surface,
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
  loginButton: {
    marginTop: commonStyles.padding.medium,
    borderRadius: commonStyles.borderRadius.medium,
    paddingVertical: 4,
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    marginTop: commonStyles.padding.medium,
    padding: commonStyles.padding.small,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.primaryCrimson,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: commonStyles.padding.large,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: NepalColors.outline,
  },
  dividerText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    marginHorizontal: commonStyles.padding.medium,
  },
  registerButton: {
    alignSelf: 'center',
    padding: commonStyles.padding.small,
  },
  registerText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    textAlign: 'center',
  },
  registerLinkText: {
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryCrimson,
  },
});

export default LoginScreen;