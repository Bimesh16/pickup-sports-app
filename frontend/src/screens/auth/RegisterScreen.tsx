import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated, Easing, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// Location will be imported dynamically to avoid webpack issues
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TextInput, Button, Card, ActivityIndicator } from 'react-native-paper';
import { useAuthStore } from '@/stores/authStore';
import { NepalColors, FontSizes, Spacing, BorderRadius } from '@/constants/theme';
import { AuthStackParamList } from '@/types';
import { getSports, resendVerification } from '@/services/auth';
import { useLanguage } from '@/contexts/LanguageContext';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

type Step = 0 | 1 | 2; // Account -> Profile -> Confirm

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register, isLoading } = useAuthStore();
  const { t, lang, setLanguage } = useLanguage();

  // State
  const [step, setStep] = useState<Step>(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [preferredSport, setPreferredSport] = useState('');
  const [showSports, setShowSports] = useState(false);
  const [sportQuery, setSportQuery] = useState('');
  const [skillLevel, setSkillLevel] = useState<'BEGINNER'|'INTERMEDIATE'|'ADVANCED'>('BEGINNER');
  const [sports, setSports] = useState<string[]>([]);
  const [locationText, setLocationText] = useState('');
  const [fetchingSports, setFetchingSports] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Animations
  const translateX = useRef(new Animated.Value(0)).current;
  const nextStep = () => {
    Animated.timing(translateX, { toValue: -stepWidth * (step + 1), duration: 250, useNativeDriver: true, easing: Easing.out(Easing.ease) }).start();
    setStep((s) => (Math.min(2, (s + 1)) as Step));
  };
  const prevStep = () => {
    Animated.timing(translateX, { toValue: -stepWidth * (step - 1), duration: 250, useNativeDriver: true, easing: Easing.out(Easing.ease) }).start();
    setStep((s) => (Math.max(0, (s - 1)) as Step));
  };
  const stepWidth = 320; // viewport approximation; container uses flex, so we also set width style

  // Password strength
  const strength = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[a-z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s; // 0..5
  }, [password]);

  const validAccount = useMemo(() => {
    const hasUser = username.trim().length >= 3;
    const hasMin = password.length >= 8;
    const hasLetters = /[A-Za-z]/.test(password);
    const hasDigits = /\d/.test(password);
    const matches = password === confirm && confirm.length > 0;
    return hasUser && hasMin && hasLetters && hasDigits && matches;
  }, [username, password, confirm]);

  const validProfile = useMemo(() => !!preferredSport && !!locationText.trim() && !!skillLevel, [preferredSport, locationText, skillLevel]);

  // Fetch sports
  useEffect(() => {
    let mounted = true;
    (async () => {
      setFetchingSports(true);
      const res = await getSports();
      if (mounted) {
        if (res.success) setSports(res.data);
        setFetchingSports(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleUseMyLocation = async () => {
    try {
      // Dynamic import with fallback to mock
      const Location = await import('expo-location').catch(() => 
        import('@/mocks/expo-location')
      );
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Location permission is needed to autofill your city.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const str = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
      setLocationText(str);
    } catch (e) {
      Alert.alert('Error', 'Unable to fetch location');
    }
  };

  const handleRegister = async () => {
    try {
      setSubmitting(true);
      await register({
        name: username,
        username,
        password,
        email: undefined,
        phoneNumber: undefined,
        age: 18,
        preferences: { sports: [preferredSport], maxDistance: 10, skillLevel },
        location: { latitude: 0, longitude: 0, address: locationText },
        // extra used by store mapping
        // @ts-ignore
        preferredSport,
        // @ts-ignore
        locationText,
      } as any);
      setSuccess(true);
    } catch (error: any) {
      Alert.alert('Registration Failed', error?.message || 'Unable to register');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    const res = await resendVerification(username);
    if (res.success) Alert.alert('Verification Sent', 'Please check your email');
    else Alert.alert('Error', res.message || 'Failed to resend verification');
  };

  const LANG_OPTIONS = useMemo(() => [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ne', label: 'नेपाली' },
  ], []);

  return (
    <LinearGradient colors={[NepalColors.primary, NepalColors.secondary]} style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={NepalColors.textLight} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.langChip} onPress={() => setLanguage((lang as any) === 'en' ? 'ne' as any : 'en' as any)}>
          <Ionicons name="globe-outline" size={16} color={NepalColors.textLight} />
          <Text style={styles.langText}>{LANG_OPTIONS.find(l => l.code === (lang as any))?.label || 'Language'}</Text>
          <Ionicons name="chevron-down" size={16} color={NepalColors.textLight} />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>{t('register.title')}</Text>
        <Text style={styles.subtitle}>{t('hero.subtitleSignUp')}</Text>
        <View style={styles.progress}>
          {[0,1,2].map(i => (
            <View key={i} style={[styles.progressDot, step >= i && styles.progressDotActive]} />
          ))}
        </View>
      </View>

      <Card style={styles.card}>
        <Animated.View style={{ flexDirection: 'row', width: stepWidth * 3, transform: [{ translateX }], }}>
          {/* Step 1: Account */}
          <View style={[styles.step, { width: stepWidth }]}>
            <TextInput label={t('register.username')} value={username} onChangeText={setUsername} mode="outlined" style={styles.input} autoCapitalize="none" theme={{ colors: { primary: NepalColors.primary } }} />
            <TextInput label={t('register.password')} value={password} onChangeText={setPassword} mode="outlined" secureTextEntry={!showPwd} style={styles.input} right={<TextInput.Icon icon={showPwd ? 'eye-off' : 'eye'} onPress={() => setShowPwd(!showPwd)} />} theme={{ colors: { primary: NepalColors.primary } }} />
            <View style={styles.strengthBarContainer}>
              {Array.from({ length: 5 }).map((_, i) => (
                <View key={i} style={[styles.strengthBar, i < strength ? styles.strengthOn : styles.strengthOff]} />
              ))}
            </View>
            <TextInput label={t('register.confirmPassword')} value={confirm} onChangeText={setConfirm} mode="outlined" secureTextEntry={!showConfirm} style={styles.input} right={<TextInput.Icon icon={showConfirm ? 'eye-off' : 'eye'} onPress={() => setShowConfirm(!showConfirm)} />} theme={{ colors: { primary: NepalColors.primary } }} />
            <Button mode="contained" onPress={nextStep} disabled={!validAccount} style={styles.primaryBtn}>{t('register.continue')}</Button>
          </View>

          {/* Step 2: Profile */}
          <View style={[styles.step, { width: stepWidth }]}>
            <Text style={styles.label}>{t('register.preferredSport')}</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowSports(!showSports)}>
              <Text style={styles.dropdownText}>{preferredSport || (fetchingSports ? t('common.loading') : t('register.preferredSport'))}</Text>
              {fetchingSports ? (<ActivityIndicator />) : (<Ionicons name={showSports ? 'chevron-up' : 'chevron-down'} size={20} color={NepalColors.textSecondary} />)}
            </TouchableOpacity>
            {showSports && !fetchingSports && (
              <>
                <TextInput
                  mode="outlined"
                  placeholder={t('register.searchSports')}
                  value={sportQuery}
                  onChangeText={setSportQuery}
                  style={[styles.input, { marginTop: 8 }]}
                />
                <View style={styles.dropdownList}>
                  {(sports.length ? sports : ['FOOTBALL','BASKETBALL','CRICKET'])
                    .filter(s => s.toLowerCase().includes(sportQuery.toLowerCase()))
                    .map((s) => (
                      <TouchableOpacity key={s} style={styles.dropdownItem} onPress={() => { setPreferredSport(s); setShowSports(false); }}>
                        <Text style={styles.dropdownItemText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </>
            )}

            <Text style={[styles.label, { marginTop: Spacing.lg }]}>{t('register.location')}</Text>
            <TextInput label={t('register.location')} value={locationText} onChangeText={setLocationText} mode="outlined" style={styles.input} theme={{ colors: { primary: NepalColors.primary } }} />
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleUseMyLocation}>
              <Ionicons name="location" size={18} color={NepalColors.primary} />
              <Text style={styles.secondaryBtnText}>{t('register.useMyLocation')}</Text>
            </TouchableOpacity>

            <Text style={[styles.label, { marginTop: Spacing.lg }]}>{t('register.skillLevel')}</Text>
            <View style={styles.chipsRow}>
              {(['BEGINNER','INTERMEDIATE','ADVANCED'] as const).map(level => (
                <TouchableOpacity key={level} style={[styles.chip, skillLevel === level && styles.chipActive]} onPress={() => setSkillLevel(level)}>
                  <Text style={[styles.chipText, skillLevel === level && styles.chipTextActive]}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.actionsRow}>
              <Button mode="outlined" onPress={prevStep} style={styles.outlinedBtn}>Back</Button>
              <Button mode="contained" onPress={nextStep} disabled={!validProfile} style={styles.primaryBtn}>Continue</Button>
            </View>
          </View>

          {/* Step 3: Confirm */}
          <View style={[styles.step, { width: stepWidth }]}>
            {success ? (
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="checkmark-circle" size={72} color="#22C55E" />
                <Text style={styles.successTitle}>{t('register.successTitle')}</Text>
                <Text style={styles.successSub}>{t('register.successSub')}</Text>
                <Button mode="contained" onPress={() => navigation.navigate('Login')} style={styles.primaryBtn}>{t('cta.signIn')}</Button>
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendText}>{t('register.resendVerification')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.label}>Review</Text>
                <View style={styles.reviewRow}><Text style={styles.reviewKey}>Username</Text><Text style={styles.reviewVal}>{username}</Text></View>
                <View style={styles.reviewRow}><Text style={styles.reviewKey}>Preferred Sport</Text><Text style={styles.reviewVal}>{preferredSport}</Text></View>
                <View style={styles.reviewRow}><Text style={styles.reviewKey}>Location</Text><Text style={styles.reviewVal}>{locationText}</Text></View>

                <View style={styles.actionsColumn}>
                  <Button mode="outlined" onPress={prevStep} style={styles.outlinedBtn}>Back</Button>
                  <Button mode="contained" onPress={handleRegister} loading={submitting} disabled={submitting} style={styles.primaryBtn}>{t('register.createAccount')}</Button>
                </View>
              </>
            )}
          </View>
        </Animated.View>
      </Card>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}><Text style={styles.loginLink}>Sign In</Text></TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { padding: Spacing.sm },
  langChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: 999 },
  langText: { color: NepalColors.textLight },
  header: { alignItems: 'center', marginTop: Spacing.lg, marginBottom: Spacing.lg },
  title: { fontSize: FontSizes['3xl'], fontWeight: 'bold', color: NepalColors.textLight },
  subtitle: { fontSize: FontSizes.md, color: NepalColors.textLight, opacity: 0.9, marginTop: 4 },
  progress: { flexDirection: 'row', gap: 8, marginTop: Spacing.md },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  progressDotActive: { backgroundColor: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: BorderRadius.xl, overflow: 'hidden', padding: Spacing.lg },
  step: { paddingHorizontal: 4 },
  input: { marginBottom: Spacing.md },
  strengthBarContainer: { flexDirection: 'row', gap: 6, marginBottom: Spacing.md },
  strengthBar: { flex: 1, height: 6, borderRadius: 4 },
  strengthOn: { backgroundColor: '#22C55E' },
  strengthOff: { backgroundColor: '#E5E7EB' },
  primaryBtn: { backgroundColor: NepalColors.primary, borderRadius: BorderRadius.md, marginTop: Spacing.md },
  outlinedBtn: { borderRadius: BorderRadius.md, borderColor: NepalColors.primary },
  dropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12 },
  dropdownText: { color: '#111827' },
  dropdownList: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, marginTop: 6, maxHeight: 160 },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 10 },
  dropdownItemText: { color: '#111827' },
  label: { color: '#374151', marginBottom: 6, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: Spacing.md },
  actionsColumn: { gap: 10, marginTop: Spacing.md },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  secondaryBtnText: { color: NepalColors.primary, fontWeight: '600' },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#F3F4F6', paddingVertical: 8 },
  reviewKey: { color: '#6B7280' },
  reviewVal: { color: '#111827' },
  successTitle: { fontSize: FontSizes['2xl'], fontWeight: '700', marginVertical: 8, color: '#111827' },
  successSub: { color: '#6B7280', textAlign: 'center', marginBottom: Spacing.lg },
  resendText: { color: NepalColors.primary, marginTop: Spacing.md },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.lg },
  footerText: { color: '#E5E7EB' },
  loginLink: { color: '#fff', fontWeight: '700' },
  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#E5E7EB' },
  chipActive: { backgroundColor: '#EEF2FF', borderColor: NepalColors.primary },
  chipText: { color: '#111827' },
  chipTextActive: { color: NepalColors.primary, fontWeight: '700' },
});
