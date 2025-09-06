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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
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
    if (!name.trim()) {
      setErrors({ name: 'Name is required' });
      return;
    }
    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }
    if (!password.trim()) {
      setErrors({ password: 'Password is required' });
      return;
    }

    setIsLoading(true);
    try {
      await register({
        username: email,
        email: email,
        password: password,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || '',
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
      const mockUser = {
        username: `user_${provider.toLowerCase()}`,
        email: `user@${provider.toLowerCase()}.com`,
        firstName: 'Social',
        lastName: 'User',
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use the register function to create/login user
      await register({
        username: mockUser.username,
        email: mockUser.email,
        password: 'social_login_password', // This would be handled by OAuth
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      });
      
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
                <Text style={styles.welcomeTitle}>Create Account</Text>
                
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
              <Text style={styles.formTitle}>Welcome Back!</Text>
              
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
                  // Sign up form - Name, Email, Password
                  <>
                    <View style={styles.inputContainer}>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Name"
                          placeholderTextColor={colors.textSecondary}
                          value={name}
                          onChangeText={setName}
                        />
                      </View>
                      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Email"
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

              {/* Switch Mode */}
              <TouchableOpacity style={styles.switchModeButton} onPress={() => setIsLogin(!isLogin)}>
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
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    minHeight: 600,
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
  leftPanel: {
    width: '50%',
    height: '100%',
  },
  rightPanel: {
    width: '50%',
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
