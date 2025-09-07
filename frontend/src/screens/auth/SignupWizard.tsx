import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthStore } from '@/stores/authStore';
import { InteractiveButton } from '@/components/common/InteractiveButton';
import { COUNTRIES } from '@/utils/countries';
import { glassmorphismStyles, roundedStyles } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

interface SignupFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  sport: string;
  skillLevel: string;
  location: string;
  nationality: string;
  birthDate: string;
  gender: string;
}

const SPORTS = [
  { id: 'football', name: 'Football', icon: 'football' },
  { id: 'basketball', name: 'Basketball', icon: 'basketball' },
  { id: 'cricket', name: 'Cricket', icon: 'baseball' },
  { id: 'volleyball', name: 'Volleyball', icon: 'football' },
  { id: 'badminton', name: 'Badminton', icon: 'tennisball' },
  { id: 'tennis', name: 'Tennis', icon: 'tennisball' },
];

const SKILL_LEVELS = [
  { id: 'beginner', name: 'Beginner' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' },
  { id: 'professional', name: 'Professional' },
];

const GENDERS = [
  { id: 'male', name: 'Male' },
  { id: 'female', name: 'Female' },
  { id: 'other', name: 'Other' },
  { id: 'prefer_not_to_say', name: 'Prefer not to say' },
];

const SignupWizard: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const { register, isLoading } = useAuthStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SignupFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    sport: '',
    skillLevel: '',
    location: '',
    nationality: '',
    birthDate: '',
    gender: '',
  });
  const [errors, setErrors] = useState<Partial<SignupFormData>>({});

  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Update progress bar
    Animated.timing(progressAnim, {
      toValue: (currentStep / 3) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];
    
    strength = checks.filter(Boolean).length;
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = [colors.error, colors.warning, colors.info, colors.success, colors.success];
    
    return {
      strength: strength / 5,
      label: labels[Math.min(strength, 4)],
      color: strengthColors[Math.min(strength, 4)],
    };
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<SignupFormData> = {};

    if (step === 1) {
      if (!formData.username) {
        newErrors.username = currentLanguage === 'ne' ? 'प्रयोगकर्ता नाम आवश्यक छ' : 'Username is required';
      }
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
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = currentLanguage === 'ne' ? 'पासवर्ड पुष्टि आवश्यक छ' : 'Password confirmation is required';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = currentLanguage === 'ne' ? 'पासवर्ड मेल खाँदैन' : 'Passwords do not match';
      }
    } else if (step === 2) {
      if (!formData.sport) {
        newErrors.sport = currentLanguage === 'ne' ? 'खेल छान्नुहोस्' : 'Please select a sport';
      }
      if (!formData.skillLevel) {
        newErrors.skillLevel = currentLanguage === 'ne' ? 'कौशल स्तर छान्नुहोस्' : 'Please select skill level';
      }
      if (!formData.location) {
        newErrors.location = currentLanguage === 'ne' ? 'स्थान प्रविष्ट गर्नुहोस्' : 'Location is required';
      }
      if (!formData.nationality) {
        newErrors.nationality = currentLanguage === 'ne' ? 'राष्ट्रियता छान्नुहोस्' : 'Please select nationality';
      }
    } else if (step === 3) {
      if (!formData.birthDate) {
        newErrors.birthDate = currentLanguage === 'ne' ? 'जन्म मिति प्रविष्ट गर्नुहोस्' : 'Birth date is required';
      }
      if (!formData.gender) {
        newErrors.gender = currentLanguage === 'ne' ? 'लिङ्ग छान्नुहोस्' : 'Please select gender';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(prev => prev + 1);
        slideAnim.setValue(width);
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
    }
  };

  const handlePrevious = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentStep(prev => prev - 1);
      slideAnim.setValue(-width);
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

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    try {
      await register(formData);
      Alert.alert(
        currentLanguage === 'ne' ? 'सफल' : 'Success',
        currentLanguage === 'ne' ? 'खाता सफलतापूर्वक सिर्जना भयो' : 'Account created successfully!'
      );
    } catch (error) {
      Alert.alert(
        currentLanguage === 'ne' ? 'त्रुटि' : 'Error',
        currentLanguage === 'ne' ? 'खाता सिर्जना गर्न असफल' : 'Failed to create account. Please try again.'
      );
    }
  };

  const renderStep1 = () => {
    const passwordStrength = getPasswordStrength(formData.password);
    
    return (
      <Animated.View
        style={[
          styles.stepContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <Text style={styles.stepTitle}>
          {currentLanguage === 'ne' ? 'खाता विवरण' : 'Account Details'}
        </Text>
        
        {/* Username */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            {currentLanguage === 'ne' ? 'प्रयोगकर्ता नाम' : 'Username'}
          </Text>
          <View style={[styles.inputWrapper, roundedStyles.input]}>
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.textInput}
              placeholder={currentLanguage === 'ne' ? 'प्रयोगकर्ता नाम प्रविष्ट गर्नुहोस्' : 'Enter username'}
              placeholderTextColor={colors.textSecondary}
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            {currentLanguage === 'ne' ? 'ईमेल' : 'Email'}
          </Text>
          <View style={[styles.inputWrapper, roundedStyles.input]}>
            <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.textInput}
              placeholder={currentLanguage === 'ne' ? 'ईमेल ठेगाना प्रविष्ट गर्नुहोस्' : 'Enter email address'}
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

        {/* Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            {currentLanguage === 'ne' ? 'पासवर्ड' : 'Password'}
          </Text>
          <View style={[styles.inputWrapper, roundedStyles.input]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.textInput}
              placeholder={currentLanguage === 'ne' ? 'पासवर्ड प्रविष्ट गर्नुहोस्' : 'Enter password'}
              placeholderTextColor={colors.textSecondary}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {formData.password && (
            <View style={styles.passwordStrength}>
              <View style={styles.strengthBar}>
                <Animated.View
                  style={[
                    styles.strengthFill,
                    {
                      backgroundColor: passwordStrength.color,
                      width: `${passwordStrength.strength * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                {passwordStrength.label}
              </Text>
            </View>
          )}
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        {/* Confirm Password */}
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
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        </View>
      </Animated.View>
    );
  };

  const renderStep2 = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <Text style={styles.stepTitle}>
        {currentLanguage === 'ne' ? 'खेल प्रोफाइल' : 'Sports Profile'}
      </Text>

      {/* Sport Selection */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {currentLanguage === 'ne' ? 'पसंदीदा खेल' : 'Favorite Sport'}
        </Text>
        <View style={[styles.inputWrapper, roundedStyles.input]}>
          <Ionicons name="football-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.textInput}
            placeholder={currentLanguage === 'ne' ? 'खेल छान्नुहोस्' : 'Select Sport'}
            placeholderTextColor={colors.textSecondary}
            value={SPORTS.find(s => s.id === formData.sport)?.name || ''}
            onFocus={() => {
              // Simple selection for now - in a real app you'd show a modal
              handleInputChange('sport', 'football');
            }}
            editable={false}
          />
        </View>
        {errors.sport && <Text style={styles.errorText}>{errors.sport}</Text>}
      </View>

      {/* Skill Level */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {currentLanguage === 'ne' ? 'कौशल स्तर' : 'Skill Level'}
        </Text>
        <View style={[styles.inputWrapper, roundedStyles.input]}>
          <Ionicons name="star-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.textInput}
            placeholder={currentLanguage === 'ne' ? 'कौशल स्तर छान्नुहोस्' : 'Select Skill Level'}
            placeholderTextColor={colors.textSecondary}
            value={SKILL_LEVELS.find(s => s.id === formData.skillLevel)?.name || ''}
            onFocus={() => {
              // Simple selection for now - in a real app you'd show a modal
              handleInputChange('skillLevel', 'intermediate');
            }}
            editable={false}
          />
        </View>
        {errors.skillLevel && <Text style={styles.errorText}>{errors.skillLevel}</Text>}
      </View>

      {/* Location */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {currentLanguage === 'ne' ? 'स्थान' : 'Location'}
        </Text>
        <View style={[styles.inputWrapper, roundedStyles.input]}>
          <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.textInput}
            placeholder={currentLanguage === 'ne' ? 'शहर, देश प्रविष्ट गर्नुहोस्' : 'Enter city, country'}
            placeholderTextColor={colors.textSecondary}
            value={formData.location}
            onChangeText={(value) => handleInputChange('location', value)}
          />
        </View>
        {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
      </View>

      {/* Nationality */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {currentLanguage === 'ne' ? 'राष्ट्रियता' : 'Nationality'}
        </Text>
        <View style={[styles.inputWrapper, roundedStyles.input]}>
          <Ionicons name="flag-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.textInput}
            placeholder={currentLanguage === 'ne' ? 'राष्ट्रियता छान्नुहोस्' : 'Select Nationality'}
            placeholderTextColor={colors.textSecondary}
            value={COUNTRIES.find(c => c.code === formData.nationality)?.name || ''}
            onFocus={() => {
              // Simple selection for now - in a real app you'd show a modal
              handleInputChange('nationality', 'NP');
            }}
            editable={false}
          />
        </View>
        {errors.nationality && <Text style={styles.errorText}>{errors.nationality}</Text>}
      </View>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <Text style={styles.stepTitle}>
        {currentLanguage === 'ne' ? 'व्यक्तिगत विवरण' : 'Personal Details'}
      </Text>

      {/* Birth Date */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {currentLanguage === 'ne' ? 'जन्म मिति' : 'Birth Date'}
        </Text>
        <View style={[styles.inputWrapper, roundedStyles.input]}>
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.textInput}
            placeholder={currentLanguage === 'ne' ? 'YYYY-MM-DD' : 'YYYY-MM-DD'}
            placeholderTextColor={colors.textSecondary}
            value={formData.birthDate}
            onChangeText={(value) => handleInputChange('birthDate', value)}
          />
        </View>
        {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
      </View>

      {/* Gender */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {currentLanguage === 'ne' ? 'लिङ्ग' : 'Gender'}
        </Text>
        <View style={[styles.inputWrapper, roundedStyles.input]}>
          <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.textInput}
            placeholder={currentLanguage === 'ne' ? 'लिङ्ग छान्नुहोस्' : 'Select Gender'}
            placeholderTextColor={colors.textSecondary}
            value={GENDERS.find(g => g.id === formData.gender)?.name || ''}
            onFocus={() => {
              // Simple selection for now - in a real app you'd show a modal
              handleInputChange('gender', 'male');
            }}
            editable={false}
          />
        </View>
        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={isDark ? [colors.background, colors.surface] : [colors.primary, colors.twilightPurple]}
        style={styles.background}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {currentLanguage === 'ne' ? 'खाता सिर्जना गर्नुहोस्' : 'Create Account'}
            </Text>
            <Text style={styles.subtitle}>
              {currentLanguage === 'ne' 
                ? `चरण ${currentStep} मध्ये ३` 
                : `Step ${currentStep} of 3`
              }
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round((currentStep / 3) * 100)}%
            </Text>
          </View>

          {/* Form Steps */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            {currentStep > 1 && (
              <InteractiveButton
                title={currentLanguage === 'ne' ? 'पछाडि' : 'Previous'}
                onPress={handlePrevious}
                variant="outline"
                size="medium"
                style={styles.navButton}
              />
            )}
            
            <InteractiveButton
              title={
                currentStep === 3
                  ? (currentLanguage === 'ne' ? 'सिर्जना गर्नुहोस्' : 'Create Account')
                  : (currentLanguage === 'ne' ? 'अगाडि' : 'Next')
              }
              onPress={currentStep === 3 ? handleSubmit : handleNext}
              variant="primary"
              size="medium"
              disabled={isLoading}
              loading={isLoading}
              style={currentStep === 1 ? styles.fullWidthButton : styles.navButton}
            />
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
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
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.8,
  },
  stepContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
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
  passwordStrength: {
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 4,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  fullWidthButton: {
    flex: 1,
  },
});

export default SignupWizard;
