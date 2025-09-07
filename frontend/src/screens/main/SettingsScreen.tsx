import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, NepalColors } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useLanguage } from '@/contexts/LanguageContext';

const SettingsScreen: React.FC = () => {
  const { logout, user } = useAuthStore();
  const { highContrast, rtlEnabled, toggleHighContrast, toggleRTL } = useUIStore();
  const { t, setLanguage, currentLanguage } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [tempBio, setTempBio] = useState(user?.bio || '');

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as any);
    setShowLanguageModal(false);
  };

  const handleSaveAccount = () => {
    // Here you would typically save to backend
    Alert.alert('Success', 'Account settings updated!');
    setShowAccountModal(false);
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ne', name: 'नेपाली', flag: '🇳🇵' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  ];

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
      style={[styles.settingItem, highContrast && { backgroundColor: '#1A1A1A', borderColor: '#333' }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, danger && { backgroundColor: '#EF444420' }]}>
          <Ionicons 
            name={icon as any} 
            size={20} 
            color={danger ? '#EF4444' : (highContrast ? '#FFD700' : colors.primary)} 
          />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, highContrast && { color: '#fff' }, danger && { color: '#EF4444' }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, highContrast && { color: '#E5E7EB' }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement || (onPress && (
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={highContrast ? '#E5E7EB' : colors.textSecondary} 
        />
      ))}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, highContrast && { backgroundColor: '#000' }]}>
      {/* Header */}
      <LinearGradient colors={highContrast ? ['#111', '#111'] : [NepalColors.primary, NepalColors.secondary]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, highContrast && { color: '#fff' }]}>Settings</Text>
          <Text style={[styles.headerSubtitle, highContrast && { color: 'rgba(255,255,255,0.8)' }]}>
            Manage your account and preferences
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={[styles.content, highContrast && { backgroundColor: '#000' }]} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={[styles.section, highContrast && { backgroundColor: '#0A0A0A' }]}>
          <Text style={[styles.sectionTitle, highContrast && { color: '#fff' }]}>Account</Text>
          
          <SettingItem
            icon="person-outline"
            title="Account Settings"
            subtitle="Manage your profile and personal information"
            onPress={() => {
              // Navigate to AccountSettingsScreen
              // This would typically use navigation.navigate('AccountSettings')
              Alert.alert('Account Settings', 'Account settings will open in a new screen');
            }}
          />
          
          <SettingItem
            icon="shield-outline"
            title="Privacy & Security"
            subtitle="Control your privacy settings"
            onPress={() => Alert.alert('Coming Soon', 'Privacy settings will be available soon!')}
          />
          
          <SettingItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Manage your notification preferences"
            onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon!')}
          />
        </View>

        {/* Appearance Section */}
        <View style={[styles.section, highContrast && { backgroundColor: '#0A0A0A' }]}>
          <Text style={[styles.sectionTitle, highContrast && { color: '#fff' }]}>Appearance</Text>
          
          <SettingItem
            icon="language-outline"
            title="Language"
            subtitle={languages.find(l => l.code === currentLanguage)?.name || 'English'}
            onPress={() => setShowLanguageModal(true)}
          />
          
          <View style={[styles.settingItem, highContrast && { backgroundColor: '#1A1A1A', borderColor: '#333' }]}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Ionicons 
                  name="contrast-outline" 
                  size={20} 
                  color={highContrast ? '#FFD700' : colors.primary} 
                />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, highContrast && { color: '#fff' }]}>
                  High Contrast
                </Text>
                <Text style={[styles.settingSubtitle, highContrast && { color: '#E5E7EB' }]}>
                  Improve visibility for better accessibility
                </Text>
              </View>
            </View>
            <Switch
              value={highContrast}
              onValueChange={toggleHighContrast}
              trackColor={{ false: '#E5E7EB', true: colors.primary }}
              thumbColor={highContrast ? '#FFD700' : '#fff'}
            />
          </View>
          
          <View style={[styles.settingItem, highContrast && { backgroundColor: '#1A1A1A', borderColor: '#333' }]}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Ionicons 
                  name="swap-horizontal-outline" 
                  size={20} 
                  color={highContrast ? '#FFD700' : colors.primary} 
                />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, highContrast && { color: '#fff' }]}>
                  Right-to-Left Layout
                </Text>
                <Text style={[styles.settingSubtitle, highContrast && { color: '#E5E7EB' }]}>
                  Enable RTL layout for Arabic and Hebrew
                </Text>
              </View>
            </View>
            <Switch
              value={rtlEnabled}
              onValueChange={toggleRTL}
              trackColor={{ false: '#E5E7EB', true: colors.primary }}
              thumbColor={rtlEnabled ? '#FFD700' : '#fff'}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={[styles.section, highContrast && { backgroundColor: '#0A0A0A' }]}>
          <Text style={[styles.sectionTitle, highContrast && { color: '#fff' }]}>Support</Text>
          
          <SettingItem
            icon="help-circle-outline"
            title="Help & FAQ"
            subtitle="Get help and find answers"
            onPress={() => Alert.alert('Coming Soon', 'Help section will be available soon!')}
          />
          
          <SettingItem
            icon="mail-outline"
            title="Contact Support"
            subtitle="Get in touch with our team"
            onPress={() => Alert.alert('Coming Soon', 'Contact support will be available soon!')}
          />
          
          <SettingItem
            icon="information-circle-outline"
            title="About"
            subtitle="App version and information"
            onPress={() => Alert.alert('About', 'Pickup Sports App v1.0.0\nBuilt with React Native & Expo')}
          />
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, highContrast && { backgroundColor: '#0A0A0A' }]}>
          <Text style={[styles.sectionTitle, highContrast && { color: '#fff' }]}>Account Actions</Text>
          
          <SettingItem
            icon="log-out-outline"
            title="Sign Out"
            subtitle="Sign out of your account"
            onPress={handleLogout}
            danger
          />
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, highContrast && { backgroundColor: '#1A1A1A' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, highContrast && { color: '#fff' }]}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name="close" size={24} color={highContrast ? '#fff' : colors.text} />
              </TouchableOpacity>
            </View>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.languageItem, highContrast && { backgroundColor: '#0A0A0A' }]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text style={[styles.languageName, highContrast && { color: '#fff' }]}>{lang.name}</Text>
                {currentLanguage === lang.code && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Account Settings Modal */}
      <Modal
        visible={showAccountModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAccountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, highContrast && { backgroundColor: '#1A1A1A' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, highContrast && { color: '#fff' }]}>Account Settings</Text>
              <TouchableOpacity onPress={() => setShowAccountModal(false)}>
                <Ionicons name="close" size={24} color={highContrast ? '#fff' : colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Name</Text>
              <TextInput
                style={[styles.formInput, highContrast && { backgroundColor: '#0A0A0A', color: '#fff', borderColor: '#333' }]}
                value={user?.name || ''}
                placeholder="Your full name"
                placeholderTextColor={highContrast ? '#666' : colors.textSecondary}
                editable={false}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Email</Text>
              <TextInput
                style={[styles.formInput, highContrast && { backgroundColor: '#0A0A0A', color: '#fff', borderColor: '#333' }]}
                value={user?.email || ''}
                placeholder="Your email address"
                placeholderTextColor={highContrast ? '#666' : colors.textSecondary}
                editable={false}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Bio</Text>
              <TextInput
                style={[styles.formInput, styles.bioInput, highContrast && { backgroundColor: '#0A0A0A', color: '#fff', borderColor: '#333' }]}
                value={tempBio}
                onChangeText={setTempBio}
                placeholder="Tell us about yourself..."
                placeholderTextColor={highContrast ? '#666' : colors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAccountModal(false)}
              >
                <Text style={[styles.modalButtonText, highContrast && { color: '#fff' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveAccount}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 20,
    ...colors.shadows?.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    ...colors.shadows?.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: typography.fontSize.md,
    color: colors.text,
    backgroundColor: colors.background,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: colors.surfaceVariant,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: 'white',
  },
});

export default SettingsScreen;
