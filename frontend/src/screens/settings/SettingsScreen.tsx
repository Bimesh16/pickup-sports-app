import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NepalColors, FontSizes, Spacing } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSelector from '../../components/LanguageSelector';

export default function SettingsScreen() {
  const { user, logout, biometricEnabled, enableBiometric, disableBiometric } = useAuthStore();
  const { t } = useLanguage();

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
              onPress={() => {
                Alert.alert(t('common.info'), 'Notification settings coming soon');
              }}
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
});