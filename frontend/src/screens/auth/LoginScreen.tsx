import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { DECORATIVE } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { theme, locale } = useTheme();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Animations
  const buttonScale = useSharedValue(1);
  const cardAnimation = useSharedValue(0);
  
  // Refs
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  
  useEffect(() => {
    cardAnimation.value = withTiming(1, { 
      duration: 800, 
      easing: Easing.out(Easing.cubic) 
    });
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        locale === 'nepal' ? 'त्रुटि' : 'Error',
        locale === 'nepal' ? 'कृपया सबै फिल्डहरू भर्नुहोस्' : 'Please fill in all fields'
      );
      return;
    }

    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to main app
      navigation.navigate('Main');
    } catch (error) {
      Alert.alert(
        locale === 'nepal' ? 'त्रुटि' : 'Error',
        locale === 'nepal' ? 'लगइन असफल भयो' : 'Login failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBiometric = async () => {
    await Haptics.selectionAsync();
    // Implement biometric authentication
  };

  const togglePasswordVisibility = async () => {
    await Haptics.selectionAsync();
    setShowPassword(!showPassword);
  };

  // Animated styles
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const cardStyle = useAnimatedStyle(() => {
    const translateY = interpolate(cardAnimation.value, [0, 1], [50, 0]);
    const opacity = interpolate(cardAnimation.value, [0, 1], [0, 1]);
    
    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  const gradientColors = locale === 'nepal' 
    ? DECORATIVE.GRADIENTS.NEPAL_SUNSET
    : DECORATIVE.GRADIENTS.GLOBAL_OCEAN;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Background */}
        <LinearGradient
          colors={gradientColors}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
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
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>
              {locale === 'nepal' ? 'स्वागत फिर्ता' : 'Welcome Back'}
            </Text>
            <Text style={styles.subtitle}>
              {locale === 'nepal' ? 'आफ्नो खातामा लग इन गर्नुहोस्' : 'Sign in to your account'}
            </Text>
          </View>

          {/* Login Card */}
          <Animated.View style={[styles.cardContainer, cardStyle]}>
            <BlurView intensity={20} tint="light" style={styles.card}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  {locale === 'nepal' ? 'इमेल' : 'Email'}
                </Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    ref={emailRef}
                    style={styles.textInput}
                    placeholder={locale === 'nepal' ? 'आफ्नो इमेल प्रविष्ट गर्नुहोस्' : 'Enter your email'}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  {locale === 'nepal' ? 'पासवर्ड' : 'Password'}
                </Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    ref={passwordRef}
                    style={[styles.textInput, { flex: 1 }]}
                    placeholder={locale === 'nepal' ? 'आफ्नो पासवर्ड प्रविष्ट गर्नुहोस्' : 'Enter your password'}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity onPress={togglePasswordVisibility}>
                    <Ionicons 
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color={theme.colors.textSecondary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Biometric Login */}
              <TouchableOpacity style={styles.biometricButton} onPress={handleBiometric}>
                <Ionicons name="finger-print" size={24} color={theme.colors.primary} />
                <Text style={styles.biometricText}>
                  {locale === 'nepal' ? 'बायोमेट्रिक प्रयोग गर्नुहोस्' : 'Use Biometric'}
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <Animated.View style={buttonStyle}>
                <TouchableOpacity 
                  style={[styles.loginButton, { opacity: loading ? 0.7 : 1 }]}
                  onPress={handleLogin}
                  disabled={loading}
                  onPressIn={() => {
                    buttonScale.value = withTiming(0.98, { duration: 100 });
                  }}
                  onPressOut={() => {
                    buttonScale.value = withTiming(1, { duration: 100 });
                  }}
                >
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.accent]}
                    style={styles.loginButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.loginButtonText}>
                      {loading 
                        ? (locale === 'nepal' ? 'लग इन गर्दै...' : 'Signing In...') 
                        : (locale === 'nepal' ? 'लग इन' : 'Sign In')
                      }
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Forgot Password */}
              <TouchableOpacity 
                style={styles.forgotButton}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotText}>
                  {locale === 'nepal' ? 'पासवर्ड बिर्सनुभयो?' : 'Forgot Password?'}
                </Text>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>
              {locale === 'nepal' ? 'खाता छैन?' : 'Don\'t have an account?'}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>
                {locale === 'nepal' ? 'साइन अप गर्नुहोस्' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 20,
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 24,
    marginVertical: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
    padding: 12,
  },
  biometricText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC143C',
  },
  loginButton: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  forgotButton: {
    alignSelf: 'center',
  },
  forgotText: {
    fontSize: 14,
    color: '#DC143C',
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
    gap: 4,
  },
  signupText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  signupLink: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default LoginScreen;