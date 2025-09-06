import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NepalColors, FontSizes, Spacing } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSelector from '../../components/LanguageSelector';
import { useNavigation } from '@react-navigation/native';
import { TextInput, Button } from 'react-native-paper';
import { changePassword, changeEmail } from '@/services/auth';
import { getMyNotificationPrefs, updateMyNotificationPrefs } from '@/services/notifications';
import { useUIStore } from '@/stores/uiStore';
import { useNotificationPrefStore } from '@/stores/notificationPrefStore';

export default function SettingsScreen() {
  const { user, logout, biometricEnabled, enableBiometric, disableBiometric } = useAuthStore();
  const { t } = useLanguage();
  const navigation = useNavigation<any>();
  const { reducedMotion, highContrast, setReducedMotion, setHighContrast } = useUIStore();
  const { gameInvites, recommendations, systemAlerts, setGameInvites, setRecommendations, setSystemAlerts } = useNotificationPrefStore();
  const [syncingPrefs, setSyncingPrefs] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('settings.logout'), 
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const handleBiometricToggle = async (value: boolean) => {
    try {
      if (value) {
        await enableBiometric();
      } else {
        await disableBiometric();
      }
    } catch (error) {
      Alert.alert(t('common.error'), error instanceof Error ? error.message : 'Biometric operation failed');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.deleteAccount'),
      t('settings.deleteAccountConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('settings.deleteAccount'), 
          style: 'destructive',
          onPress: () => {
            // Implement account deletion logic
            Alert.alert(t('common.success'), t('settings.accountDeleted'));
          }
        }
      ]
    );
  };

  // Load backend notification prefs and map to three categories (basic mapping)
  React.useEffect(() => {
    (async () => {
      try {
        const res = await getMyNotificationPrefs();
        if (res.ok) {
          const p = res.data;
          // Map: game invites -> inAppOnRsvp, recommendations -> pushOnCreate, systemAlerts -> emailOnCancel
          setGameInvites(!!p.inAppOnRsvp);
          setRecommendations(!!p.pushOnCreate);
          setSystemAlerts(!!p.emailOnCancel);
        }
      } catch {}
    })();
  }, []);

  // Debounced sync to backend on toggle changes
  React.useEffect(() => {
    const id = setTimeout(async () => {
      try {
        setSyncingPrefs(true);
        await updateMyNotificationPrefs({
          inAppOnRsvp: gameInvites,
          pushOnCreate: recommendations,
          emailOnCancel: systemAlerts,
        });
      } finally {
        setSyncingPrefs(false);
      }
    }, 500);
    return () => clearTimeout(id);
  }, [gameInvites, recommendations, systemAlerts]);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert(t('common.error'), 'Please fill both current and new password');
      return;
    }
    try {
      setSubmitting(true);
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        Alert.alert(t('common.success'), 'Password changed successfully');
        setShowPwdModal(false);
        setCurrentPassword('');
        setNewPassword('');
      } else {
        Alert.alert(t('common.error'), res.message || 'Failed to change password');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail || !currentPassword) {
      Alert.alert(t('common.error'), 'Please fill new email and current password');
      return;
    }
    try {
      setSubmitting(true);
      const res = await changeEmail(newEmail, currentPassword);
      if (res.success) {
        Alert.alert(t('common.success'), 'Email change requested. Please verify via the link sent to your new email.');
        setShowEmailModal(false);
        setNewEmail('');
        setCurrentPassword('');
      } else {
        Alert.alert(t('common.error'), res.message || 'Failed to change email');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement,
    danger = false 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, danger && styles.dangerIconContainer]}>
          <Ionicons 
            name={icon as any} 
            size={24} 
            color={danger ? '#ef4444' : NepalColors.primary} 
          />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, danger && styles.dangerText]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {rightElement || (onPress && (
        <Ionicons name="chevron-forward" size={20} color={NepalColors.textSecondary} />
      ))}
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[NepalColors.primary, NepalColors.secondary]}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('settings.title')}</Text>
          <Text style={styles.headerSubtitle}>
            {user?.name || 'User'} • {user?.email || user?.phoneNumber || 'No contact'}
          </Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.profile')}</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="person-outline"
              title={t('settings.editProfile')}
              subtitle={t('settings.editProfileSubtitle')}
              onPress={() => {
                // Navigate to edit profile
                Alert.alert(t('common.info'), 'Edit profile functionality coming soon');
              }}
            />
            <SettingItem
              icon="shield-outline"
              title={t('settings.privacy')}
              subtitle={t('settings.privacySubtitle')}
              onPress={() => {
                Alert.alert(t('common.info'), 'Privacy settings coming soon');
              }}
            />
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.appSettings')}</Text>
          <View style={styles.sectionContent}>
            {/* Notification Categories */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="notifications-outline" size={24} color={NepalColors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Game Invites</Text>
                  <Text style={styles.settingSubtitle}>Invitations to games and RSVPs</Text>
                </View>
              </View>
              <Switch value={gameInvites} onValueChange={setGameInvites} />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="sparkles-outline" size={24} color={NepalColors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Recommendations</Text>
                  <Text style={styles.settingSubtitle}>Games and venues you might like</Text>
                </View>
              </View>
              <Switch value={recommendations} onValueChange={setRecommendations} />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="alert-circle-outline" size={24} color={NepalColors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>System Alerts</Text>
                  <Text style={styles.settingSubtitle}>Announcements and account alerts</Text>
                </View>
              </View>
              <Switch value={systemAlerts} onValueChange={setSystemAlerts} />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="language-outline" size={24} color={NepalColors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>{t('settings.language')}</Text>
                  <Text style={styles.settingSubtitle}>{t('settings.languageSubtitle')}</Text>
                </View>
              </View>
              <LanguageSelector showLabel={false} />
            </View>

            <SettingItem
              icon="notifications-outline"
              title={t('settings.notifications')}
              subtitle={t('settings.notificationsSubtitle')}
              onPress={() => navigation.navigate('Settings', { screen: 'Notifications' })}
            />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="finger-print-outline" size={24} color={NepalColors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>{t('settings.biometric')}</Text>
                  <Text style={styles.settingSubtitle}>{t('settings.biometricSubtitle')}</Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: '#767577', true: NepalColors.primary }}
                thumbColor={biometricEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.support')}</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="help-circle-outline"
              title={t('settings.help')}
              subtitle={t('settings.helpSubtitle')}
              onPress={() => {
                Alert.alert(t('common.info'), 'Help center coming soon');
              }}
            />
            <SettingItem
              icon="mail-outline"
              title={t('settings.contact')}
              subtitle={t('settings.contactSubtitle')}
              onPress={() => {
                Alert.alert(t('common.info'), 'Contact support coming soon');
              }}
            />
            <SettingItem
              icon="information-circle-outline"
              title={t('settings.about')}
              subtitle={t('settings.aboutSubtitle')}
              onPress={() => {
                Alert.alert(
                  t('settings.about'),
                  'Pickup Sports App v1.0.0\n\nA community-driven platform for sports enthusiasts in Nepal.',
                  [{ text: t('common.ok') }]
                );
              }}
            />
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View className="iconContainer" style={styles.iconContainer}>
                  <Ionicons name="contrast-outline" size={24} color={NepalColors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>High Contrast</Text>
                  <Text style={styles.settingSubtitle}>Improve readability for text and UI</Text>
                </View>
              </View>
              <Switch value={highContrast} onValueChange={setHighContrast} />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View className="iconContainer" style={styles.iconContainer}>
                  <Ionicons name="remove-outline" size={24} color={NepalColors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Reduced Motion</Text>
                  <Text style={styles.settingSubtitle}>Limit animations and motion effects</Text>
                </View>
              </View>
              <Switch value={reducedMotion} onValueChange={setReducedMotion} />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View className="iconContainer" style={styles.iconContainer}>
                  <Ionicons name="swap-horizontal-outline" size={24} color={NepalColors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>RTL Layout</Text>
                  <Text style={styles.settingSubtitle}>Right-to-left layout (requires reload)</Text>
                </View>
              </View>
              <Switch value={useUIStore.getState().rtlEnabled} onValueChange={(v) => {
                useUIStore.getState().setRtlEnabled(v);
                Alert.alert('Restart Required', 'Please restart the app for RTL changes to take full effect.');
              }} />
            </View>
            <SettingItem
              icon="key-outline"
              title={t('settings.changePassword') || 'Change Password'}
              subtitle={t('settings.changePasswordSubtitle') || 'Update your password'}
              onPress={() => setShowPwdModal(true)}
            />
            <SettingItem
              icon="mail-outline"
              title={t('settings.changeEmail') || 'Change Email'}
              subtitle={t('settings.changeEmailSubtitle') || 'Request email change'}
              onPress={() => setShowEmailModal(true)}
            />
            <SettingItem
              icon="log-out-outline"
              title={t('settings.logout')}
              onPress={handleLogout}
              danger
            />
            <SettingItem
              icon="trash-outline"
              title={t('settings.deleteAccount')}
              subtitle={t('settings.deleteAccountWarning')}
              onPress={handleDeleteAccount}
              danger
            />
          </View>
        </View>

        {/* App Version */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>v1.0.0</Text>
          <Text style={styles.footerText}>Made with ❤️ in Nepal</Text>
        </View>
      </ScrollView>
      {/* Change Password Modal */}
      <Modal visible={showPwdModal} transparent animationType="slide" onRequestClose={() => setShowPwdModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('settings.changePassword') || 'Change Password'}</Text>
            <TextInput
              label={t('register.password') || 'Password'}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              mode="outlined"
              secureTextEntry
              style={styles.modalInput}
            />
            <TextInput
              label={'New Password'}
              value={newPassword}
              onChangeText={setNewPassword}
              mode="outlined"
              secureTextEntry
              style={styles.modalInput}
            />
            <Button mode="contained" onPress={handleChangePassword} loading={submitting} disabled={submitting}>
              {t('settings.changePassword') || 'Change Password'}
            </Button>
            <Button onPress={() => setShowPwdModal(false)} style={{ marginTop: 8 }}>
              {t('common.cancel')}
            </Button>
          </View>
        </View>
      </Modal>

      {/* Change Email Modal */}
      <Modal visible={showEmailModal} transparent animationType="slide" onRequestClose={() => setShowEmailModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('settings.changeEmail') || 'Change Email'}</Text>
            <TextInput
              label={'New Email'}
              value={newEmail}
              onChangeText={setNewEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.modalInput}
            />
            <TextInput
              label={t('register.password') || 'Password'}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              mode="outlined"
              secureTextEntry
              style={styles.modalInput}
            />
            <Button mode="contained" onPress={handleChangeEmail} loading={submitting} disabled={submitting}>
              {t('settings.changeEmail') || 'Change Email'}
            </Button>
            <Button onPress={() => setShowEmailModal(false)} style={{ marginTop: 8 }}>
              {t('common.cancel')}
            </Button>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: FontSizes['3xl'],
    fontWeight: 'bold',
    color: NepalColors.textLight,
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    fontSize: FontSizes.base,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: NepalColors.textLight,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  sectionContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: Spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  dangerIconContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FontSizes.base,
    fontWeight: '500',
    color: NepalColors.textLight,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  dangerText: {
    color: '#ef4444',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  versionText: {
    fontSize: FontSizes.sm,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: Spacing.xs,
  },
  footerText: {
    fontSize: FontSizes.sm,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: Spacing.lg,
    width: '100%',
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  modalInput: {
    marginBottom: Spacing.md,
  },
});
