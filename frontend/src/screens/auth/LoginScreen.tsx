import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthStore } from '@/stores/authStore';
import { InteractiveButton } from '@/components/common/InteractiveButton';
import { BiometricAuth } from '@/components/common/BiometricAuth';
import { glassmorphismStyles, roundedStyles } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

interface LoginFormData {
  email: string;
  password: string;
}

const LoginScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const { login, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Animation values
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Validate form
    const isValid = formData.email.length > 0 && formData.password.length > 0;
    setIsFormValid(isValid);
  }, [formData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email) {
      newErrors.email = currentLanguage === 'ne' ? 'ईमेल आवश्यक छ' : 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = currentLanguage === 'ne' ? 'वैध ईमेल ठेगाना प्रविष्ट गर्नुहोस्' : 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = currentLanguage === 'ne' ? 'पासवर्ड आवश्यक छ' : 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = currentLanguage === 'ne' ? 'पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ' : 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      // Shake animation for invalid form
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    try {
      await login(formData.email, formData.password);
    } catch (error) {
      Alert.alert(
        currentLanguage === 'ne' ? 'त्रुटि' : 'Error',
        currentLanguage === 'ne' ? 'लगइन गर्न असफल' : 'Login failed. Please try again.'
      );
    }
  };

  const handleBiometricLogin = async () => {
    try {
      // Simulate biometric login
      await login('biometric@example.com', 'biometric_password');
    } catch (error) {
      console.log('Biometric login error:', error);
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password screen
    console.log('Navigate to forgot password');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={isDark ? [colors.background, colors.surface] : [colors.primary, colors.twilightPurple]}
        style={styles.background}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { translateX: shakeAnim },
                ],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {currentLanguage === 'ne' ? 'लगइन गर्नुहोस्' : 'Welcome Back'}
              </Text>
              <Text style={styles.subtitle}>
                {currentLanguage === 'ne' 
                  ? 'आफ्नो खातामा प्रवेश गर्नुहोस्' 
                  : 'Sign in to your account'
                }
              </Text>
            </View>

            {/* Login Form */}
            <View style={[styles.formContainer, glassmorphismStyles.light]}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  {currentLanguage === 'ne' ? 'ईमेल' : 'Email'}
                </Text>
                <View style={[styles.inputWrapper, roundedStyles.input]}>
                  <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                  <TextInput
                    style={styles.textInput}
                    placeholder={currentLanguage === 'ne' ? 'ईमेल ठेगाना प्रविष्ट गर्नुहोस्' : 'Enter your email'}
                    placeholderTextColor={colors.textSecondary}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  {currentLanguage === 'ne' ? 'पासवर्ड' : 'Password'}
                </Text>
                <View style={[styles.inputWrapper, roundedStyles.input]}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
                  <TextInput
                    style={styles.textInput}
                    placeholder={currentLanguage === 'ne' ? 'पासवर्ड प्रविष्ट गर्नुहोस्' : 'Enter your password'}
                    placeholderTextColor={colors.textSecondary}
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              {/* Forgot Password */}
              <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>
                  {currentLanguage === 'ne' ? 'पासवर्ड बिर्सनुभयो?' : 'Forgot Password?'}
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <InteractiveButton
                title={currentLanguage === 'ne' ? 'लगइन गर्नुहोस्' : 'Sign In'}
                onPress={handleLogin}
                variant="primary"
                size="large"
                disabled={!isFormValid || isLoading}
                loading={isLoading}
                style={styles.loginButton}
              />

              {/* Biometric Login */}
              <BiometricAuth
                onSuccess={handleBiometricLogin}
                onError={(error) => console.log('Biometric error:', error)}
              />

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>
                  {currentLanguage === 'ne' ? 'वा' : 'or'}
                </Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login */}
              <View style={styles.socialContainer}>
                <InteractiveButton
                  title="Google"
                  onPress={() => console.log('Google login')}
                  variant="outline"
                  size="medium"
                  style={styles.socialButton}
                />
                <InteractiveButton
                  title="Facebook"
                  onPress={() => console.log('Facebook login')}
                  variant="outline"
                  size="medium"
                  style={styles.socialButton}
                />
              </View>
            </View>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>
                {currentLanguage === 'ne' ? 'खाता छैन?' : "Don't have an account?"}
              </Text>
              <TouchableOpacity>
                <Text style={styles.signupLink}>
                  {currentLanguage === 'ne' ? 'साइन अप गर्नुहोस्' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  formContainer: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    marginLeft: 12,
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
  loginButton: {
    marginBottom: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: 'white',
    fontSize: 14,
    marginHorizontal: 16,
    opacity: 0.7,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.8,
  },
  signupLink: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default LoginScreen;