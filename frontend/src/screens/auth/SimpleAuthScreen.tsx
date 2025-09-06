import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuthStore } from '@/stores/authStore';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { AuthStackParamList } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

type SimpleAuthScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ModernAuth'>;

const SimpleAuthScreen: React.FC = () => {
  // Add global CSS to remove focus styles
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `
        input:focus {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
        input {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
      `;
      document.head.appendChild(style);
      return () => document.head.removeChild(style);
    }
  }, []);

  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const dateOfBirthRef = useRef<TextInput>(null);
  const registerPasswordRef = useRef<TextInput>(null);

  const { login, register } = useAuthStore();
  const { t } = useLanguage();

  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

  const handleGenderSelect = (selectedGender: string) => {
    setGender(selectedGender);
    setShowGenderModal(false);
    // Focus on email field after selection
    emailRef.current?.focus();
  };

  const handleLogin = async () => {
    // Clear previous errors
    setErrors({});

    // Validate required fields
    if (!username.trim()) {
      setErrors({ username: 'Username is required' });
      return;
    }
    if (!password.trim()) {
      setErrors({ password: 'Password is required' });
      return;
    }

    setIsLoading(true);
    try {
      await login(username.trim(), password);
    } catch (error: any) {
      // Check if it's a credentials error vs other error
      if (error.message && error.message.includes('Invalid credentials')) {
        setErrors({ 
          username: 'Username or password is incorrect',
          password: 'Username or password is incorrect'
        });
      } else {
        setErrors({ 
          username: error.message || 'Login failed. Please try again.',
          password: error.message || 'Login failed. Please try again.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    // Clear previous errors
    setErrors({});
    
    // Validate required fields
    if (!firstName.trim()) {
      setErrors({ firstName: 'First name is required' });
      return;
    }
    if (!lastName.trim()) {
      setErrors({ lastName: 'Last name is required' });
      return;
    }
    if (!gender.trim()) {
      setErrors({ gender: 'Gender is required' });
      return;
    }
    if (!email.trim() && !phoneNumber.trim()) {
      setErrors({ 
        email: 'Please provide either email or phone number',
        phoneNumber: 'Please provide either email or phone number'
      });
      return;
    }
    if (!dateOfBirth.trim()) {
      setErrors({ dateOfBirth: 'Date of birth is required' });
      return;
    }
    if (!password.trim()) {
      setErrors({ password: 'Password is required' });
      return;
    }

    // Validate email format if provided
    if (email.trim() && !/\S+@\S+\.\S+/.test(email.trim())) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    // Validate phone format if provided
    if (phoneNumber.trim() && !/^[\+]?[1-9][\d]{0,15}$/.test(phoneNumber.replace(/\s/g, ''))) {
      setErrors({ phoneNumber: 'Please enter a valid phone number' });
      return;
    }

    setIsLoading(true);
    try {
      const username = email.trim() || phoneNumber.trim();
      await register({
        username: username,
        email: email.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        password: password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender: gender.trim(),
        age: new Date().getFullYear() - new Date(dateOfBirth).getFullYear(),
      });
      Alert.alert('Success', 'Account created successfully!');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      // Mock social login for now - in real app, this would integrate with OAuth providers
      const mockUsername = `user_${provider.toLowerCase()}`;
      const mockPassword = 'social_login_password';
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use the login function to sign in the user
      await login(mockUsername, mockPassword);
      
      Alert.alert('Success', `Successfully signed in with ${provider}!`);
    } catch (error: any) {
      Alert.alert('Social Login Failed', error.message || `Failed to sign in with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Left Panel - Sign Up */}
          <View style={styles.leftPanel}>
            <LinearGradient
              colors={[colors.primary, '#8B5CF6']}
              style={styles.gradientPanel}
            >
              <View style={styles.panelContent}>
                <Text style={styles.welcomeTitle}>
                  {isLogin ? 'Quick Sign In' : 'Create Account with Social Media'}
                </Text>
                <Text style={styles.welcomeSubtitle}>
                  {isLogin ? 'Use your social media accounts' : 'One-click account creation'}
                </Text>
                
                {/* Social Login Buttons */}
                <View style={styles.socialContainer}>
                  <TouchableOpacity 
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('Google')}
                    disabled={isLoading}
                  >
                    <Ionicons name="logo-google" size={20} color="#DB4437" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('Facebook')}
                    disabled={isLoading}
                  >
                    <Ionicons name="logo-facebook" size={20} color="#4267B2" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('GitHub')}
                    disabled={isLoading}
                  >
                    <Ionicons name="logo-github" size={20} color="#333" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('LinkedIn')}
                    disabled={isLoading}
                  >
                    <Ionicons name="logo-linkedin" size={20} color="#0077B5" />
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Right Panel - Login */}
          <View style={styles.rightPanel}>
            <View style={styles.formContent}>
              <Text style={styles.formTitle}>{isLogin ? 'Welcome Back!' : 'Create Account Manually'}</Text>
              {!isLogin && (
                <Text style={styles.formSubtitle}>Fill out the form below with your details</Text>
              )}
              
              {/* Form Fields */}
              <View style={styles.formContainer}>
                {isLogin ? (
                  // Login form - only Username and Password
                  <>
                    <View style={styles.inputContainer}>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Username"
                          placeholderTextColor={colors.textSecondary}
                          value={username}
                          onChangeText={setUsername}
                          autoCapitalize="none"
                          returnKeyType="next"
                          onSubmitEditing={() => {
                            // Focus on password field when Enter is pressed
                            passwordRef.current?.focus();
                          }}
                        />
                      </View>
                      {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          ref={passwordRef}
                          style={styles.input}
                          placeholder="Password"
                          placeholderTextColor={colors.textSecondary}
                          value={password}
                          onChangeText={setPassword}
                          secureTextEntry
                          returnKeyType="done"
                          onSubmitEditing={() => {
                            // Trigger login when Enter is pressed in password field
                            if (isLogin) {
                              handleLogin();
                            }
                          }}
                        />
                      </View>
                      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                    </View>
                  </>
                ) : (
                  // Sign up form - First Name, Last Name, Gender, Email/Phone, Date of Birth, Password
                  <>
                    <View style={styles.inputContainer}>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="First Name"
                          placeholderTextColor={colors.textSecondary}
                          value={firstName}
                          onChangeText={setFirstName}
                          autoCapitalize="words"
                          returnKeyType="next"
                          onSubmitEditing={() => {
                            lastNameRef.current?.focus();
                          }}
                        />
                      </View>
                      {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          ref={lastNameRef}
                          style={styles.input}
                          placeholder="Last Name"
                          placeholderTextColor={colors.textSecondary}
                          value={lastName}
                          onChangeText={setLastName}
                          autoCapitalize="words"
                          returnKeyType="next"
                          onSubmitEditing={() => {
                            setShowGenderModal(true);
                          }}
                        />
                      </View>
                      {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <TouchableOpacity 
                        style={[styles.inputWrapper, gender && styles.inputWrapperSelected]}
                        onPress={() => setShowGenderModal(true)}
                      >
                        <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                        <Text style={[styles.input, gender ? styles.inputText : styles.inputPlaceholder]}>
                          {gender || 'Select Gender'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                      {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          ref={emailRef}
                          style={styles.input}
                          placeholder="Email (required if no phone)"
                          placeholderTextColor={colors.textSecondary}
                          value={email}
                          onChangeText={(text) => {
                            setEmail(text.toLowerCase().trim());
                          }}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          returnKeyType="next"
                          onSubmitEditing={() => {
                            phoneRef.current?.focus();
                          }}
                        />
                      </View>
                      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          ref={phoneRef}
                          style={styles.input}
                          placeholder="Phone Number (required if no email)"
                          placeholderTextColor={colors.textSecondary}
                          value={phoneNumber}
                          onChangeText={(text) => {
                            // Auto-format phone number as user types
                            let formatted = text.replace(/\D/g, ''); // Remove non-digits
                            if (formatted.length >= 3) {
                              formatted = formatted.substring(0, 3) + '-' + formatted.substring(3);
                            }
                            if (formatted.length >= 7) {
                              formatted = formatted.substring(0, 7) + '-' + formatted.substring(7, 11);
                            }
                            setPhoneNumber(formatted);
                          }}
                          keyboardType="phone-pad"
                          returnKeyType="next"
                          maxLength={12}
                          onSubmitEditing={() => {
                            dateOfBirthRef.current?.focus();
                          }}
                        />
                      </View>
                      {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          ref={dateOfBirthRef}
                          style={styles.input}
                          placeholder="Date of Birth (YYYY-MM-DD)"
                          placeholderTextColor={colors.textSecondary}
                          value={dateOfBirth}
                          onChangeText={(text) => {
                            // Auto-format date as user types
                            let formatted = text.replace(/\D/g, ''); // Remove non-digits
                            if (formatted.length >= 4) {
                              formatted = formatted.substring(0, 4) + '-' + formatted.substring(4);
                            }
                            if (formatted.length >= 7) {
                              formatted = formatted.substring(0, 7) + '-' + formatted.substring(7, 9);
                            }
                            setDateOfBirth(formatted);
                          }}
                          keyboardType="numeric"
                          returnKeyType="next"
                          maxLength={10}
                          onSubmitEditing={() => {
                            registerPasswordRef.current?.focus();
                          }}
                        />
                      </View>
                      {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          ref={registerPasswordRef}
                          style={styles.input}
                          placeholder="Password"
                          placeholderTextColor={colors.textSecondary}
                          value={password}
                          onChangeText={setPassword}
                          secureTextEntry
                          returnKeyType="done"
                          onSubmitEditing={() => {
                            // Trigger registration when Enter is pressed in password field
                            if (!isLogin) {
                              handleRegister();
                            }
                          }}
                        />
                      </View>
                      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                    </View>
                  </>
                )}
              </View>

              {/* Action Button */}
              <TouchableOpacity 
                style={[styles.actionButton, isLoading && styles.actionButtonDisabled]}
                onPress={isLogin ? handleLogin : handleRegister}
                disabled={isLoading}
              >
                <Text style={styles.actionButtonText}>
                  {isLoading ? 'Please wait...' : (isLogin ? 'SIGN IN' : 'SIGN UP')}
                </Text>
              </TouchableOpacity>

              {/* Toggle Mode Button */}
              <TouchableOpacity 
                style={styles.switchModeButton}
                onPress={() => setIsLogin(!isLogin)}
                disabled={isLoading}
              >
                <Text style={styles.switchModeText}>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <Text style={styles.switchModeLink}>
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </Text>
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </ScrollView>

      {/* Gender Selection Modal */}
      <Modal
        visible={showGenderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGenderModal(false)}
        >
          <View style={styles.genderModal}>
            <Text style={styles.genderModalTitle}>Select Gender</Text>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.genderOption,
                  gender === option && styles.genderOptionSelected
                ]}
                onPress={() => handleGenderSelect(option)}
              >
                <Text style={[
                  styles.genderOptionText,
                  gender === option && styles.genderOptionSelectedText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 1,
    height: '100%',
  },
  rightPanel: {
    flex: 1,
    height: '100%',
    backgroundColor: 'white',
  },
  gradientPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  panelContent: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
    marginVertical: spacing.xs,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  formContent: {
    flex: 1,
    padding: spacing.xl * 1.5,
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  formSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  formContainer: {
    marginBottom: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 50,
  },
  inputWrapperFocused: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
    outline: 'none',
    border: 'none',
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    minHeight: 50,
  },
  actionButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchModeButton: {
    alignItems: 'center',
  },
  switchModeText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  switchModeLink: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  // Gender modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  genderModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  genderOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  genderOptionText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  genderOptionSelected: {
    backgroundColor: colors.primary + '10',
  },
  genderOptionSelectedText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  inputWrapperSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputText: {
    color: colors.text,
  },
  inputPlaceholder: {
    color: colors.textSecondary,
  },
});

export default SimpleAuthScreen;
