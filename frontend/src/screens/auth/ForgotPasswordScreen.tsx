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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { InteractiveButton } from '@/components/common/InteractiveButton';
import { glassmorphismStyles, roundedStyles } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { t, currentLanguage } = useLanguage();
  
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'email' | 'token' | 'reset'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Animation values
  const envelopeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Envelope animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(envelopeAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(envelopeAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email);
  };

  const handleSendResetEmail = async () => {
    if (!email) {
      setError(currentLanguage === 'ne' ? 'ईमेल आवश्यक छ' : 'Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError(currentLanguage === 'ne' ? 'वैध ईमेल ठेगाना प्रविष्ट गर्नुहोस्' : 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Move to token step
      setStep('token');
      Alert.alert(
        currentLanguage === 'ne' ? 'सफल' : 'Success',
        currentLanguage === 'ne' 
          ? 'पासवर्ड रिसेट लिंक आपको ईमेलमा पठाइएको छ' 
          : 'Password reset link sent to your email'
      );
    } catch (error) {
      setError(currentLanguage === 'ne' ? 'त्रुटि आयो, पुन: प्रयास गर्नुहोस्' : 'An error occurred, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyToken = async () => {
    if (!token) {
      setError(currentLanguage === 'ne' ? 'टोकन आवश्यक छ' : 'Token is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Move to reset step
      setStep('reset');
    } catch (error) {
      setError(currentLanguage === 'ne' ? 'अवैध टोकन' : 'Invalid token');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      setError(currentLanguage === 'ne' ? 'नयाँ पासवर्ड आवश्यक छ' : 'New password is required');
      return;
    }

    if (newPassword.length < 6) {
      setError(currentLanguage === 'ne' ? 'पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ' : 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(currentLanguage === 'ne' ? 'पासवर्ड मेल खाँदैन' : 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        currentLanguage === 'ne' ? 'सफल' : 'Success',
        currentLanguage === 'ne' 
          ? 'पासवर्ड सफलतापूर्वक परिवर्तन भयो' 
          : 'Password changed successfully!'
      );
      
      // Reset form
      setStep('email');
      setEmail('');
      setToken('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError(currentLanguage === 'ne' ? 'त्रुटि आयो, पुन: प्रयास गर्नुहोस्' : 'An error occurred, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Animated Envelope */}
      <View style={styles.envelopeContainer}>
        <Animated.View
          style={[
            styles.envelope,
            {
              transform: [
                { scale: pulseAnim },
                {
                  rotateY: envelopeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '10deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="mail" size={60} color="white" />
        </Animated.View>
      </View>

      <Text style={styles.title}>
        {currentLanguage === 'ne' ? 'पासवर्ड बिर्सनुभयो?' : 'Forgot Password?'}
      </Text>
      
      <Text style={styles.subtitle}>
        {currentLanguage === 'ne' 
          ? 'आपको ईमेल ठेगाना प्रविष्ट गर्नुहोस् र हामी तपाईंलाई पासवर्ड रिसेट लिंक पठाउनेछौं' 
          : 'Enter your email address and we\'ll send you a password reset link'
        }
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {currentLanguage === 'ne' ? 'ईमेल ठेगाना' : 'Email Address'}
        </Text>
        <View style={[styles.inputWrapper, roundedStyles.input]}>
          <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.textInput}
            placeholder={currentLanguage === 'ne' ? 'ईमेल ठेगाना प्रविष्ट गर्नुहोस्' : 'Enter your email address'}
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <InteractiveButton
        title={currentLanguage === 'ne' ? 'रिसेट लिंक पठाउनुहोस्' : 'Send Reset Link'}
        onPress={handleSendResetEmail}
        variant="primary"
        size="large"
        disabled={isLoading}
        loading={isLoading}
        style={styles.button}
      />
    </Animated.View>
  );

  const renderTokenStep = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="key" size={60} color="white" />
      </View>

      <Text style={styles.title}>
        {currentLanguage === 'ne' ? 'टोकन प्रविष्ट गर्नुहोस्' : 'Enter Token'}
      </Text>
      
      <Text style={styles.subtitle}>
        {currentLanguage === 'ne' 
          ? 'तपाईंको ईमेलमा पठाइएको टोकन प्रविष्ट गर्नुहोस्' 
          : 'Enter the token sent to your email'
        }
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {currentLanguage === 'ne' ? 'रिसेट टोकन' : 'Reset Token'}
        </Text>
        <View style={[styles.inputWrapper, roundedStyles.input]}>
          <Ionicons name="key-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.textInput}
            placeholder={currentLanguage === 'ne' ? 'टोकन प्रविष्ट गर्नुहोस्' : 'Enter token'}
            placeholderTextColor={colors.textSecondary}
            value={token}
            onChangeText={(value) => {
              setToken(value);
              setError('');
            }}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <InteractiveButton
        title={currentLanguage === 'ne' ? 'टोकन जाँच गर्नुहोस्' : 'Verify Token'}
        onPress={handleVerifyToken}
        variant="primary"
        size="large"
        disabled={isLoading}
        loading={isLoading}
        style={styles.button}
      />
    </Animated.View>
  );

  const renderResetStep = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="lock-closed" size={60} color="white" />
      </View>

      <Text style={styles.title}>
        {currentLanguage === 'ne' ? 'नयाँ पासवर्ड सेट गर्नुहोस्' : 'Set New Password'}
      </Text>
      
      <Text style={styles.subtitle}>
        {currentLanguage === 'ne' 
          ? 'आफ्नो नयाँ पासवर्ड प्रविष्ट गर्नुहोस्' 
          : 'Enter your new password'
        }
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {currentLanguage === 'ne' ? 'नयाँ पासवर्ड' : 'New Password'}
        </Text>
        <View style={[styles.inputWrapper, roundedStyles.input]}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.textInput}
            placeholder={currentLanguage === 'ne' ? 'नयाँ पासवर्ड प्रविष्ट गर्नुहोस्' : 'Enter new password'}
            placeholderTextColor={colors.textSecondary}
            value={newPassword}
            onChangeText={(value) => {
              setNewPassword(value);
              setError('');
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {currentLanguage === 'ne' ? 'पासवर्ड पुष्टि' : 'Confirm Password'}
        </Text>
        <View style={[styles.inputWrapper, roundedStyles.input]}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.textInput}
            placeholder={currentLanguage === 'ne' ? 'पासवर्ड पुन: प्रविष्ट गर्नुहोस्' : 'Confirm password'}
            placeholderTextColor={colors.textSecondary}
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              setError('');
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <InteractiveButton
        title={currentLanguage === 'ne' ? 'पासवर्ड परिवर्तन गर्नुहोस्' : 'Change Password'}
        onPress={handleResetPassword}
        variant="primary"
        size="large"
        disabled={isLoading}
        loading={isLoading}
        style={styles.button}
      />
    </Animated.View>
  );

  const handleStepTransition = (newStep: 'email' | 'token' | 'reset') => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(newStep);
      slideAnim.setValue(-50);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={isDark ? [colors.background, colors.surface] : [colors.primary, colors.twilightPurple]}
        style={styles.background}
      >
        <View style={styles.content}>
          {step === 'email' && renderEmailStep()}
          {step === 'token' && renderTokenStep()}
          {step === 'reset' && renderResetStep()}

          {/* Back Button */}
          {step !== 'email' && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => handleStepTransition('email')}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
              <Text style={styles.backButtonText}>
                {currentLanguage === 'ne' ? 'पछाडि' : 'Back'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    justifyContent: 'center',
  },
  stepContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    marginBottom: 20,
  },
  envelopeContainer: {
    marginBottom: 30,
  },
  envelope: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 30,
    lineHeight: 24,
  },
  inputContainer: {
    width: '100%',
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
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    marginTop: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
    opacity: 0.8,
  },
});

export default ForgotPasswordScreen;