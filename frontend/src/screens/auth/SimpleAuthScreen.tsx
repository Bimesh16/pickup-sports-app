import React, { useState } from 'react';
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
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { login, register } = useAuthStore();
  const { t } = useLanguage();

  const handleLogin = async () => {
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
      Alert.alert('Login Failed', error.message || 'Please check your credentials');
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
    if (!email.trim() && !phoneNumber.trim()) {
      setErrors({ contact: 'Email or phone number is required' });
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
                  {isLogin ? 'Sign In with Social Media' : 'Create Account with Social Media'}
                </Text>
                <Text style={styles.welcomeSubtitle}>
                  {isLogin ? 'Quick and secure sign in' : 'Quick and secure account creation'}
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
              <Text style={styles.formTitle}>{isLogin ? 'Welcome Back!' : 'Create Account'}</Text>
              
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
                        />
                      </View>
                      {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Password"
                          placeholderTextColor={colors.textSecondary}
                          value={password}
                          onChangeText={setPassword}
                          secureTextEntry
                        />
                      </View>
                      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                    </View>
                  </>
                ) : (
                  // Sign up form - First Name, Last Name, Email/Phone, Date of Birth, Password
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
                        />
                      </View>
                      {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Last Name"
                          placeholderTextColor={colors.textSecondary}
                          value={lastName}
                          onChangeText={setLastName}
                          autoCapitalize="words"
                        />
                      </View>
                      {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Email (optional)"
                          placeholderTextColor={colors.textSecondary}
                          value={email}
                          onChangeText={setEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </View>
                      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Phone Number (optional)"
                          placeholderTextColor={colors.textSecondary}
                          value={phoneNumber}
                          onChangeText={setPhoneNumber}
                          keyboardType="phone-pad"
                        />
                      </View>
                      {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
                      {errors.contact && <Text style={styles.errorText}>{errors.contact}</Text>}
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Date of Birth (YYYY-MM-DD)"
                          placeholderTextColor={colors.textSecondary}
                          value={dateOfBirth}
                          onChangeText={setDateOfBirth}
                          keyboardType="numeric"
                        />
                      </View>
                      {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Password"
                          placeholderTextColor={colors.textSecondary}
                          value={password}
                          onChangeText={setPassword}
                          secureTextEntry
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
    padding: spacing.xl,
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
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
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
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
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
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
});

export default SimpleAuthScreen;
