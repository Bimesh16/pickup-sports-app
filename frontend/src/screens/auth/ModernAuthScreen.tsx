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
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuthStore } from '@/stores/authStore';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { AuthStackParamList } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

const { width, height } = Dimensions.get('window');

type ModernAuthScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ModernAuth'>;

interface ModernAuthScreenProps {
  navigation: ModernAuthScreenNavigationProp;
}

const ModernAuthScreen: React.FC<ModernAuthScreenProps> = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(false); // Start with sign up
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { login, register } = useAuthStore();
  const { t } = useLanguage();

  const slideAnim = useRef(new Animated.Value(width)).current; // Start with sign up panel

  const toggleMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    setErrors({});
    
    Animated.timing(slideAnim, {
      toValue: newMode ? 0 : width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (isLogin) {
      // For login, check username/email and password
      if (!username.trim() && !email.trim()) {
        newErrors.username = 'Username or email is required';
      }
      if (!password.trim()) {
        newErrors.password = 'Password is required';
      }
    } else {
      // For sign up, check all fields
      if (!name.trim()) {
        newErrors.name = 'Name is required';
      }
      if (!email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!password.trim()) {
        newErrors.password = 'Password is required';
      } else if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (!confirmPassword.trim()) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Use username if provided, otherwise use email
      const loginIdentifier = username.trim() || email.trim();
      await login(loginIdentifier, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register({
        username: email,
        email: email,
        password: password,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || '',
      });
      Alert.alert('Success', 'Account created successfully! Please check your email for verification.');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('Social Login', `${provider} login coming soon!`);
  };

  const InputField = ({ 
    placeholder, 
    value, 
    onChangeText, 
    secureTextEntry = false, 
    icon, 
    error,
    onFocus,
    onBlur,
    rightIcon,
    onRightIconPress
  }: any) => (
    <View style={styles.inputContainer}>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <Ionicons name={icon} size={20} color={error ? colors.error : colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Ionicons name={rightIcon} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Left Panel - Sign Up */}
          <Animated.View 
            style={[
              styles.panel,
              styles.leftPanel,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            <LinearGradient
              colors={[colors.primary, '#8B5CF6']}
              style={styles.gradientPanel}
            >
              <View style={styles.panelContent}>
                <Text style={styles.welcomeTitle}>Create Account</Text>
                
                {/* Social Login Buttons */}
                <View style={styles.socialContainer}>
                  <TouchableOpacity 
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('Google')}
                  >
                    <Ionicons name="logo-google" size={20} color="#DB4437" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('Facebook')}
                  >
                    <Ionicons name="logo-facebook" size={20} color="#4267B2" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('GitHub')}
                  >
                    <Ionicons name="logo-github" size={20} color="#333" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('LinkedIn')}
                  >
                    <Ionicons name="logo-linkedin" size={20} color="#0077B5" />
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Right Panel - Login */}
          <Animated.View 
            style={[
              styles.panel,
              styles.rightPanel,
              { transform: [{ translateX: Animated.subtract(0, slideAnim) }] }
            ]}
          >
            <View style={styles.registerContent}>
              <Text style={styles.registerTitle}>Welcome Back!</Text>
              
              {/* Form Fields */}
              <View style={styles.formContainer}>
                {isLogin && (
                  <InputField
                    placeholder="Username or Email"
                    value={username}
                    onChangeText={setUsername}
                    icon="person-outline"
                    error={errors.username}
                  />
                )}
                
                {!isLogin && (
                  <InputField
                    placeholder="Name"
                    value={name}
                    onChangeText={setName}
                    icon="person-outline"
                    error={errors.name}
                  />
                )}
                
                <InputField
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  icon="mail-outline"
                  error={errors.email}
                />
                
                <InputField
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  icon="lock-closed-outline"
                  error={errors.password}
                  rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                />
                
                {!isLogin && (
                  <InputField
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    icon="lock-closed-outline"
                    error={errors.confirmPassword}
                    rightIcon={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
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

              {/* Switch Mode */}
              <TouchableOpacity style={styles.switchModeButton} onPress={toggleMode}>
                <Text style={styles.switchModeText}>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <Text style={styles.switchModeLink}>
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    minHeight: height,
  },
  card: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    height: 500,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    flexDirection: 'row',
  },
  panel: {
    width: '50%',
    height: '100%',
  },
  leftPanel: {
    left: 0,
  },
  rightPanel: {
    right: 0,
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
    marginBottom: spacing.md,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  switchButton: {
    backgroundColor: 'white',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  switchButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContent: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  registerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
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
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  separatorText: {
    marginHorizontal: spacing.md,
    color: colors.textSecondary,
    fontSize: 14,
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
  inputError: {
    borderColor: colors.error,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  rightIcon: {
    padding: spacing.xs,
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

export default ModernAuthScreen;
