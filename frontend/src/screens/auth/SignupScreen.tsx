import React, { useState, useRef } from 'react';
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
import { SkillLevel } from '../../types';

const { width } = Dimensions.get('window');

interface SignupScreenProps {
  navigation: any;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const { theme, locale } = useTheme();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Step 2
    sport: '',
    skillLevel: SkillLevel.BEGINNER,
    location: '',
    nationality: '',
    
    // Step 3
    dateOfBirth: '',
    gender: '',
    
    // Step 4 - Review
  });
  
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Animations
  const progressAnimation = useSharedValue(0.25);
  const cardAnimation = useSharedValue(0);
  
  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      progressAnimation.value = withTiming((currentStep + 1) * 0.25, { duration: 300 });
      cardAnimation.value = 0;
      cardAnimation.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    }
  };
  
  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      progressAnimation.value = withTiming((currentStep - 1) * 0.25, { duration: 300 });
      cardAnimation.value = 0;
      cardAnimation.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    }
  };
  
  const handleSignup = async () => {
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        locale === 'nepal' ? 'स्वागत छ!' : 'Welcome!',
        locale === 'nepal' ? 'खाता सफलतापूर्वक बनाइयो' : 'Account created successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Main'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        locale === 'nepal' ? 'त्रुटि' : 'Error',
        locale === 'nepal' ? 'खाता बनाउन असफल' : 'Failed to create account'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };
  
  // Animated styles
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnimation.value * 100}%`,
  }));
  
  const cardStyle = useAnimatedStyle(() => {
    const translateX = interpolate(cardAnimation.value, [0, 1], [50, 0]);
    const opacity = interpolate(cardAnimation.value, [0, 1], [0, 1]);
    
    return {
      transform: [{ translateX }],
      opacity,
    };
  });
  
  const gradientColors = locale === 'nepal' 
    ? DECORATIVE.GRADIENTS.NEPAL_SUNSET
    : DECORATIVE.GRADIENTS.GLOBAL_OCEAN;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {locale === 'nepal' ? 'खाता जानकारी' : 'Account Information'}
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {locale === 'nepal' ? 'प्रयोगकर्ता नाम' : 'Username'}
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={styles.textInput}
                  placeholder={locale === 'nepal' ? 'आफ्नो प्रयोगकर्ता नाम प्रविष्ट गर्नुहोस्' : 'Enter your username'}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.username}
                  onChangeText={(text) => setFormData({...formData, username: text})}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {locale === 'nepal' ? 'इमेल' : 'Email'}
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={styles.textInput}
                  placeholder={locale === 'nepal' ? 'आफ्नो इमेल प्रविष्ट गर्नुहोस्' : 'Enter your email'}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {locale === 'nepal' ? 'पासवर्ड' : 'Password'}
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={styles.textInput}
                  placeholder={locale === 'nepal' ? 'आफ्नो पासवर्ड प्रविष्ट गर्नुहोस्' : 'Enter your password'}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.password}
                  onChangeText={(text) => {
                    setFormData({...formData, password: text});
                    calculatePasswordStrength(text);
                  }}
                  secureTextEntry
                />
              </View>
              
              {/* Password Strength Meter */}
              {formData.password.length > 0 && (
                <View style={styles.strengthMeter}>
                  <View style={styles.strengthBarContainer}>
                    <View 
                      style={[
                        styles.strengthBar, 
                        { 
                          width: `${passwordStrength}%`,
                          backgroundColor: passwordStrength < 50 ? '#EF4444' : passwordStrength < 80 ? '#F59E0B' : '#10B981'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.strengthText}>
                    {passwordStrength < 50 ? 'Weak' : passwordStrength < 80 ? 'Medium' : 'Strong'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {locale === 'nepal' ? 'पासवर्ड पुष्टि गर्नुहोस्' : 'Confirm Password'}
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={styles.textInput}
                  placeholder={locale === 'nepal' ? 'पासवर्ड पुष्टि गर्नुहोस्' : 'Confirm your password'}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
        );
        
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {locale === 'nepal' ? 'खेलकुद प्राथमिकताहरू' : 'Sports Preferences'}
            </Text>
            
            {/* Sports Selection */}
            <View style={styles.chipContainer}>
              <Text style={styles.chipLabel}>
                {locale === 'nepal' ? 'मनपर्ने खेल' : 'Favorite Sport'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipGrid}>
                  {['Football', 'Cricket', 'Basketball', 'Volleyball', 'Tennis'].map((sport) => (
                    <TouchableOpacity
                      key={sport}
                      style={[
                        styles.chip,
                        formData.sport === sport && styles.chipSelected,
                      ]}
                      onPress={() => setFormData({...formData, sport})}
                    >
                      <Text style={[
                        styles.chipText,
                        formData.sport === sport && styles.chipTextSelected,
                      ]}>
                        {sport}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Skill Level */}
            <View style={styles.chipContainer}>
              <Text style={styles.chipLabel}>
                {locale === 'nepal' ? 'सीप स्तर' : 'Skill Level'}
              </Text>
              <View style={styles.chipGrid}>
                {Object.values(SkillLevel).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.chip,
                      formData.skillLevel === level && styles.chipSelected,
                    ]}
                    onPress={() => setFormData({...formData, skillLevel: level})}
                  >
                    <Text style={[
                      styles.chipText,
                      formData.skillLevel === level && styles.chipTextSelected,
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
        
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {locale === 'nepal' ? 'व्यक्तिगत जानकारी' : 'Personal Information'}
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {locale === 'nepal' ? 'जन्म मिति' : 'Date of Birth'}
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={styles.textInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.dateOfBirth}
                  onChangeText={(text) => setFormData({...formData, dateOfBirth: text})}
                />
              </View>
            </View>

            {/* Gender Selection */}
            <View style={styles.chipContainer}>
              <Text style={styles.chipLabel}>
                {locale === 'nepal' ? 'लिङ्ग' : 'Gender'}
              </Text>
              <View style={styles.chipGrid}>
                {['Male', 'Female', 'Other'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.chip,
                      formData.gender === gender && styles.chipSelected,
                    ]}
                    onPress={() => setFormData({...formData, gender})}
                  >
                    <Text style={[
                      styles.chipText,
                      formData.gender === gender && styles.chipTextSelected,
                    ]}>
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
        
      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              {locale === 'nepal' ? 'पुष्टि गर्नुहोस्' : 'Confirm Details'}
            </Text>
            
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Username:</Text>
                <Text style={styles.summaryValue}>{formData.username}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Email:</Text>
                <Text style={styles.summaryValue}>{formData.email}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Sport:</Text>
                <Text style={styles.summaryValue}>{formData.sport}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Skill Level:</Text>
                <Text style={styles.summaryValue}>{formData.skillLevel}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date of Birth:</Text>
                <Text style={styles.summaryValue}>{formData.dateOfBirth}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Gender:</Text>
                <Text style={styles.summaryValue}>{formData.gender}</Text>
              </View>
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };

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
          {/* Header with Progress */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={currentStep === 1 ? () => navigation.goBack() : handleBack}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <Animated.View style={[styles.progressFill, progressStyle]} />
              </View>
              <Text style={styles.progressText}>
                {currentStep}/4
              </Text>
            </View>
          </View>

          {/* Signup Card */}
          <Animated.View style={[styles.cardContainer, cardStyle]}>
            <BlurView intensity={20} tint="light" style={styles.card}>
              {renderStep()}
              
              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                {currentStep < 4 ? (
                  <TouchableOpacity 
                    style={styles.nextButton}
                    onPress={handleNext}
                  >
                    <LinearGradient
                      colors={[theme.colors.primary, theme.colors.accent]}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.buttonText}>
                        {locale === 'nepal' ? 'अर्को' : 'Next'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={[styles.nextButton, { opacity: loading ? 0.7 : 1 }]}
                    onPress={handleSignup}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={DECORATIVE.GRADIENTS.SUCCESS_GRADIENT}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.buttonText}>
                        {loading 
                          ? (locale === 'nepal' ? 'खाता बनाइदै...' : 'Creating Account...') 
                          : (locale === 'nepal' ? 'खाता बनाउनुहोस्' : 'Create Account')
                        }
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </BlurView>
          </Animated.View>
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
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  progressBackground: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
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
  stepContainer: {
    gap: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 10,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
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
  strengthMeter: {
    gap: 4,
  },
  strengthBarContainer: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  chipContainer: {
    gap: 12,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: '#DC143C',
    borderColor: '#DC143C',
  },
  chipText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: 'white',
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 20,
  },
  nextButton: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default SignupScreen;