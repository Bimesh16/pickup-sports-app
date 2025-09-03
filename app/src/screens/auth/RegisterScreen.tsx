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
import { Picker } from '@react-native-picker/picker';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { useAuthStore } from '@/stores/authStore';
import { SkillLevel } from '@/types/auth';
import { colors, typography, spacing, shadows } from '@/constants/theme';
import { VALIDATION } from '@/constants/config';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    skillLevel: SkillLevel.BEGINNER,
    phone: '',
    age: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation errors for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    if (error) clearError();
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < VALIDATION.USERNAME.MIN_LENGTH) {
      errors.username = `Username must be at least ${VALIDATION.USERNAME.MIN_LENGTH} characters`;
    } else if (!VALIDATION.USERNAME.PATTERN.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!VALIDATION.EMAIL.PATTERN.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < VALIDATION.PASSWORD.MIN_LENGTH) {
      errors.password = `Password must be at least ${VALIDATION.PASSWORD.MIN_LENGTH} characters`;
    } else if (!VALIDATION.PASSWORD.PATTERN.test(formData.password)) {
      errors.password = 'Password must contain at least one letter and one number';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    // Phone validation (optional)
    if (formData.phone && !VALIDATION.PHONE.PATTERN.test(formData.phone)) {
      errors.phone = 'Please enter a valid Nepali phone number';
    }

    // Age validation (optional)
    if (formData.age) {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 13 || age > 120) {
        errors.age = 'Age must be between 13 and 120';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await register({
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        skillLevel: formData.skillLevel,
        phone: formData.phone.trim() || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
      });
    } catch (error) {
      console.error('Registration failed:', error);
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
            <Text style={styles.title}>Join the Game!</Text>
            <Text style={styles.titleNepali}>खेलमा सामेल हुनुहोस्!</Text>
            <Text style={styles.subtitle}>
              Create your account to start playing
            </Text>
          </View>
        </View>

        {/* Form */}
        <View style={[styles.formContainer, shadows.md]}>
          <Text style={styles.formTitle}>Sign Up</Text>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Personal Information */}
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: spacing.sm }]}>
              <Text style={styles.label}>First Name *</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  placeholder="First name"
                  placeholderTextColor={colors.placeholder}
                  textContentType="givenName"
                  editable={!isLoading}
                />
              </View>
              {validationErrors.firstName && (
                <Text style={styles.errorText}>{validationErrors.firstName}</Text>
              )}
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: spacing.sm }]}>
              <Text style={styles.label}>Last Name *</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  placeholder="Last name"
                  placeholderTextColor={colors.placeholder}
                  textContentType="familyName"
                  editable={!isLoading}
                />
              </View>
              {validationErrors.lastName && (
                <Text style={styles.errorText}>{validationErrors.lastName}</Text>
              )}
            </View>
          </View>

          {/* Account Information */}
          <Text style={styles.sectionTitle}>Account Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(value) => handleInputChange('username', value)}
                placeholder="Choose username"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="username"
                editable={!isLoading}
              />
            </View>
            {validationErrors.username && (
              <Text style={styles.errorText}>{validationErrors.username}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="Enter email"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                editable={!isLoading}
              />
            </View>
            {validationErrors.email && (
              <Text style={styles.errorText}>{validationErrors.email}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                placeholder="Create password"
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            {validationErrors.password && (
              <Text style={styles.errorText}>{validationErrors.password}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                placeholder="Confirm password"
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            {validationErrors.confirmPassword && (
              <Text style={styles.errorText}>{validationErrors.confirmPassword}</Text>
            )}
          </View>

          {/* Additional Information */}
          <Text style={styles.sectionTitle}>Additional Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Skill Level</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.skillLevel}
                onValueChange={(value) => handleInputChange('skillLevel', value)}
                style={styles.picker}
                enabled={!isLoading}
              >
                <Picker.Item label="Beginner (शुरुवाती)" value={SkillLevel.BEGINNER} />
                <Picker.Item label="Intermediate (मध्यम)" value={SkillLevel.INTERMEDIATE} />
                <Picker.Item label="Advanced (उन्नत)" value={SkillLevel.ADVANCED} />
              </Picker>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: spacing.sm }]}>
              <Text style={styles.label}>Phone</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  placeholder="9800000000"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="phone-pad"
                  textContentType="telephoneNumber"
                  editable={!isLoading}
                />
              </View>
              {validationErrors.phone && (
                <Text style={styles.errorText}>{validationErrors.phone}</Text>
              )}
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: spacing.sm }]}>
              <Text style={styles.label}>Age</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={formData.age}
                  onChangeText={(value) => handleInputChange('age', value)}
                  placeholder="25"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="numeric"
                  editable={!isLoading}
                />
              </View>
              {validationErrors.age && (
                <Text style={styles.errorText}>{validationErrors.age}</Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.registerButton, 
              shadows.sm,
              isLoading && styles.registerButtonDisabled
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.registerButtonText}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              Already have an account? <Text style={styles.loginButtonHighlight}>Sign In</Text>
            </Text>
          </TouchableOpacity>
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
    marginBottom: spacing['2xl'],
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
  },
  formContainer: {
    backgroundColor: colors.surface,
    padding: spacing['2xl'],
    borderRadius: 16,
  },
  formTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '20',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.lg,
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
  eyeButton: {
    padding: spacing.sm,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  picker: {
    color: colors.text,
  },
  registerButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  registerButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  registerButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.onPrimary,
  },
  loginButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  loginButtonHighlight: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
});