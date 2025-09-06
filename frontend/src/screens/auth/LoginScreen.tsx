import React, { useMemo, useRef, useState } from 'react';
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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuthStore } from '@/stores/authStore';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { AuthStackParamList } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import Shimmer from '@/components/common/Shimmer';
import { forgot, resendVerification } from '@/services/auth';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});
  const [langModal, setLangModal] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const lockoutTimer = useRef<NodeJS.Timer | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState<number | null>(null);

  const { login, loginWithPhone } = useAuthStore();
  const { t, lang, setLanguage } = useLanguage();

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setErrors({});
    try {
      const username = email.trim();
      if (loginMethod === 'email') await login(username, password);
      else await loginWithPhone(username, password);
    } catch (error: any) {
      // Structured error from auth store (res from auth.login)
      const message = error?.message || t('error.invalidCredentials') || 'Invalid credentials';
      const fieldErrors = error?.fieldErrors || {};
      setErrors({
        general: message,
        username: fieldErrors.username,
        password: fieldErrors.password,
      });
      // Lockout handling
      const retry = error?.retryAfterSeconds as number | undefined;
      const until = error?.lockoutUntil as number | undefined;
      let seconds = 0;
      if (typeof retry === 'number' && retry > 0) seconds = retry;
      else if (typeof until === 'number' && until > Date.now()) seconds = Math.ceil((until - Date.now()) / 1000);
      if (seconds > 0) {
        if (lockoutTimer.current) clearInterval(lockoutTimer.current);
        setLockoutRemaining(seconds);
        lockoutTimer.current = setInterval(() => {
          setLockoutRemaining(prev => {
            if (prev === null) return null;
            if (prev <= 1) {
              if (lockoutTimer.current) clearInterval(lockoutTimer.current);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook' | 'apple') => {
    Alert.alert('Coming Soon', `${provider} login will be available soon!`);
  };

  const LANG_OPTIONS = useMemo(
    () => [
      { code: 'en', label: 'English' },
      { code: 'es', label: 'Español' },
      { code: 'fr', label: 'Français' },
      { code: 'hi', label: 'हिन्दी' },
      { code: 'ne', label: 'नेपाली' },
    ],
    []
  );

  const handleForgot = async () => {
    const username = email.trim();
    if (!username) return Alert.alert(t('common.error'), t('validation.required') || 'All fields are required');
    const res = await forgot(username);
    if (res.success) Alert.alert(t('common.success'), 'Check your email for reset link');
    else Alert.alert(t('common.error'), res.message || 'Failed to send reset link');
  };

  const handleResendVerification = async () => {
    const username = email.trim();
    if (!username) return Alert.alert(t('common.error'), t('validation.required') || 'All fields are required');
    const res = await resendVerification(username);
    if (res.success) Alert.alert(t('common.success'), 'Verification email sent');
    else Alert.alert(t('common.error'), res.message || 'Failed to resend verification');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header with Language Selector */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.languageSelector} onPress={() => setLangModal(true)}>
          <Text style={styles.languageText}>{LANG_OPTIONS.find(l => l.code === (lang as any))?.label || 'Language'}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      {/* Language modal */}
      <Modal visible={langModal} transparent animationType="fade" onRequestClose={() => setLangModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {LANG_OPTIONS.map(opt => (
              <TouchableOpacity key={opt.code} style={styles.modalItem} onPress={async () => { await setLanguage(opt.code as any); setLangModal(false); }}>
                <Text style={[styles.modalText, (lang as any) === opt.code && { fontFamily: typography.fontFamily.bold }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Card */}
        <View style={styles.mainCard}>
          {/* Sign Up/Sign In Toggle */}
          <View style={styles.toggleContainer}>
            <Text style={styles.signUpText}>Sign Up</Text>
            <View style={styles.socialIcons}>
              <TouchableOpacity 
                style={styles.socialIcon}
                onPress={() => handleSocialLogin('google')}
              >
                <Ionicons name="logo-google" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.socialIcon}
                onPress={() => handleSocialLogin('facebook')}
              >
                <Ionicons name="logo-facebook" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.socialIcon}
                onPress={() => handleSocialLogin('apple')}
              >
                <Ionicons name="logo-apple" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.signInText}>Sign In</Text>
          </View>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          {/* Email/Phone Toggle */}
          <View style={styles.methodToggle}>
            <TouchableOpacity
              style={[styles.methodButton, loginMethod === 'email' && styles.activeMethod]}
              onPress={() => setLoginMethod('email')}
            >
              <Ionicons 
                name="mail-outline" 
                size={20} 
                color={loginMethod === 'email' ? colors.primary : colors.textSecondary} 
              />
              <Text style={[
                styles.methodText, 
                loginMethod === 'email' && styles.activeMethodText
              ]}>
                Email
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.methodButton, loginMethod === 'phone' && styles.activeMethod]}
              onPress={() => setLoginMethod('phone')}
            >
              <Ionicons 
                name="call-outline" 
                size={20} 
                color={loginMethod === 'phone' ? colors.primary : colors.textSecondary} 
              />
              <Text style={[
                styles.methodText, 
                loginMethod === 'phone' && styles.activeMethodText
              ]}>
                Phone Number
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, emailFocused && styles.inputFocused]}>
              <Ionicons 
                name={loginMethod === 'email' ? 'mail-outline' : 'call-outline'} 
                size={20} 
                color={colors.textSecondary} 
                style={styles.inputIcon}
              />
              {isLoading ? (
                <Shimmer height={22} style={{ flex: 1 }} />
              ) : (
                <TextInput
                  style={styles.textInput}
                  placeholder={loginMethod === 'email' ? t('login.emailOrUsername') : t('login.phone')}
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType={loginMethod === 'email' ? 'email-address' : 'phone-pad'}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              )}
            </View>
            {!!errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

            <View style={[styles.inputWrapper, passwordFocused && styles.inputFocused]}>
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color={colors.textSecondary} 
                style={styles.inputIcon}
              />
              {isLoading ? (
                <Shimmer height={22} style={{ flex: 1 }} />
              ) : (
                <TextInput
                  style={styles.textInput}
                  placeholder={t('login.password')}
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
              )}
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          {/* Forgot Password */}
          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={handleForgot}
          >
            <Text style={styles.forgotPasswordText}>{t('login.forgotPassword')}</Text>
          </TouchableOpacity>

          {/* Resend verification */}
          <TouchableOpacity style={styles.forgotPassword} onPress={handleResendVerification}>
            <Text style={styles.forgotPasswordText}>{t('register.resendVerification')}</Text>
          </TouchableOpacity>

          {/* Remember Me */}
          <View style={styles.rememberMeContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setRememberMe(!rememberMe)}
            >
              {rememberMe && (
                <Ionicons name="checkmark" size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
            <Text style={styles.rememberMeText}>Remember me</Text>
          </View>

          {/* Sign In Button */}
          <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
              style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
              onPressIn={() => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start()}
              onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
              onPress={handleSignIn}
              disabled={isLoading || (lockoutRemaining !== null && lockoutRemaining > 0)}
            >
              <Text style={styles.signInButtonText}>
                {isLoading ? t('login.signingIn') : t('login.signIn')}
              </Text>
            </TouchableOpacity>
          </Animated.View>
          {lockoutRemaining !== null && lockoutRemaining > 0 && (
            <Text style={[styles.errorText, { textAlign: 'center' }]}>
              Too many attempts. Try again in {Math.floor(lockoutRemaining / 60)}:{(lockoutRemaining % 60).toString().padStart(2, '0')}
            </Text>
          )}

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpPrompt}>{t('login.noAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
          {!!errors.general && <Text style={[styles.errorText, { textAlign: 'center', marginTop: spacing.md }]}>{errors.general}</Text>}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  languageText: {
    color: colors.textLight,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    marginRight: spacing.xs,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    width: '70%',
  },
  modalItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  modalText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  mainCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
    ...colors.shadows?.md,
  },
  toggleContainer: {
    alignItems: 'center',
  },
  signUpText: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  socialIcons: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  signInText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  formContainer: {
    flex: 1,
  },
  methodToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  activeMethod: {
    backgroundColor: colors.background,
  },
  methodText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  activeMethodText: {
    color: colors.primary,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  inputFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  textInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
  },
  eyeIcon: {
    padding: spacing.sm,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rememberMeText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
  },
  signInButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  signInButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  signInButtonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textLight,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpPrompt: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  signUpLink: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  errorText: {
    color: '#EF4444',
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
});

export default LoginScreen;
