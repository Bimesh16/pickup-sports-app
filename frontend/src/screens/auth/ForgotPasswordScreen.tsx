import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { DECORATIVE } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

interface ForgotPasswordScreenProps {
  navigation: any;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const { theme, locale } = useTheme();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  // Animations
  const envelopeAnimation = useSharedValue(0);
  const cardAnimation = useSharedValue(0);
  
  useEffect(() => {
    // Start envelope animation
    envelopeAnimation.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
      -1,
      true
    );
    
    // Animate card
    cardAnimation.value = withTiming(1, { 
      duration: 800, 
      easing: Easing.out(Easing.cubic) 
    });
  }, []);

  const handleSendReset = async () => {
    if (!email) {
      Alert.alert(
        locale === 'nepal' ? 'त्रुटि' : 'Error',
        locale === 'nepal' ? 'कृपया इमेल प्रविष्ट गर्नुहोस्' : 'Please enter your email'
      );
      return;
    }

    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setEmailSent(true);
      Alert.alert(
        locale === 'nepal' ? 'इमेल पठाइयो' : 'Email Sent',
        locale === 'nepal' 
          ? 'पासवर्ड रिसेट लिङ्क तपाईंको इमेलमा पठाइयो' 
          : 'Password reset link has been sent to your email'
      );
    } catch (error) {
      Alert.alert(
        locale === 'nepal' ? 'त्रुटि' : 'Error',
        locale === 'nepal' ? 'इमेल पठाउन असफल' : 'Failed to send email'
      );
    } finally {
      setLoading(false);
    }
  };

  // Animated styles
  const envelopeStyle = useAnimatedStyle(() => {
    const translateY = interpolate(envelopeAnimation.value, [0, 1], [-5, 5]);
    const rotateZ = interpolate(envelopeAnimation.value, [0, 1], [-2, 2]);
    
    return {
      transform: [{ translateY }, { rotateZ: `${rotateZ}deg` }],
    };
  });

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
        
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Animated Envelope Icon */}
            <Animated.View style={[styles.iconContainer, envelopeStyle]}>
              <Ionicons 
                name={emailSent ? "mail" : "mail-outline"} 
                size={80} 
                color="white" 
              />
            </Animated.View>

            <Text style={styles.title}>
              {locale === 'nepal' ? 'पासवर्ड बिर्सनुभयो?' : 'Forgot Password?'}
            </Text>
            
            <Text style={styles.subtitle}>
              {emailSent 
                ? (locale === 'nepal' 
                    ? 'तपाईंको इमेल जाँच गर्नुहोस्' 
                    : 'Check your email for reset instructions')
                : (locale === 'nepal' 
                    ? 'चिन्ता नगर्नुहोस्! तपाईंको इमेल प्रविष्ट गर्नुहोस्'
                    : 'No worries! Enter your email address')
              }
            </Text>

            {/* Reset Card */}
            {!emailSent && (
              <Animated.View style={[styles.cardContainer, cardStyle]}>
                <BlurView intensity={20} tint="light" style={styles.card}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      {locale === 'nepal' ? 'इमेल ठेगाना' : 'Email Address'}
                    </Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />
                      <TextInput
                        style={styles.textInput}
                        placeholder={locale === 'nepal' ? 'आफ्नो इमेल प्रविष्ट गर्नुहोस्' : 'Enter your email'}
                        placeholderTextColor={theme.colors.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoFocus
                      />
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.resetButton, { opacity: loading ? 0.7 : 1 }]}
                    onPress={handleSendReset}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={DECORATIVE.GRADIENTS.SUCCESS_GRADIENT}
                      style={styles.resetButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.resetButtonText}>
                        {loading 
                          ? (locale === 'nepal' ? 'पठाउदै...' : 'Sending...') 
                          : (locale === 'nepal' ? 'रिसेट लिङ्क पठाउनुहोस्' : 'Send Reset Link')
                        }
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </BlurView>
              </Animated.View>
            )}

            {/* Success Actions */}
            {emailSent && (
              <View style={styles.successActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.actionButtonText}>
                    {locale === 'nepal' ? 'लगइनमा फर्कनुहोस्' : 'Back to Login'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.resendButton}
                  onPress={() => setEmailSent(false)}
                >
                  <Text style={styles.resendButtonText}>
                    {locale === 'nepal' ? 'फेरि पठाउनुहोस्' : 'Resend Email'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: '100%',
  },
  card: {
    borderRadius: 20,
    padding: 24,
  },
  inputContainer: {
    marginBottom: 24,
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
  resetButton: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  resetButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  successActions: {
    gap: 16,
    width: '100%',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  resendButton: {
    alignSelf: 'center',
  },
  resendButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'underline',
  },
});

export default ForgotPasswordScreen;