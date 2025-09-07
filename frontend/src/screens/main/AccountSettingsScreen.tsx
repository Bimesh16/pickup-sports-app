import React, { useState, useEffect } from 'react';
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
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, NepalColors } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { useImagePicker } from '@/components/common/ImagePickerComponent';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  preferredSport?: string;
  skillLevel?: string;
  age?: number;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  gender?: string;
  nationality?: string;
  birthDate?: string;
  isVerified?: boolean;
  defaultCricketFormat?: string;
}

interface NotificationSettings {
  gameInvites: boolean;
  gameUpdates: boolean;
  achievements: boolean;
  socialActivity: boolean;
  marketing: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
}

interface PaymentSettings {
  country: string;
  currency: string;
  paymentMethods: string[];
}

const AccountSettingsScreen: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { highContrast, rtlEnabled } = useUIStore();
  const { t } = useLanguage();
  const { showImagePicker, ImagePickerModal } = useImagePicker();

  // State management
  const [profile, setProfile] = useState<UserProfile>({
    id: user?.id || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || '',
    preferredSport: 'soccer',
    skillLevel: 'intermediate',
    age: 25,
    city: 'Kathmandu',
    country: 'Nepal',
    gender: 'male',
    nationality: 'Nepali',
    isVerified: false,
    defaultCricketFormat: 'T20',
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    gameInvites: true,
    gameUpdates: true,
    achievements: true,
    socialActivity: true,
    marketing: false,
    pushNotifications: true,
    emailNotifications: true,
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    country: 'Nepal',
    currency: 'NPR',
    paymentMethods: ['card', 'mobile_money'],
  });

  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'contact' | 'security' | 'notifications' | 'payments' | 'sports'>('profile');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);

  // Form states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: '',
  });

  const countries = [
    { code: 'NP', name: 'Nepal', currency: 'NPR', flag: '🇳🇵' },
    { code: 'IN', name: 'India', currency: 'INR', flag: '🇮🇳' },
    { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
    { code: 'AU', name: 'Australia', currency: 'AUD', flag: '🇦🇺' },
  ];

  const sports = [
    { id: 'soccer', name: 'Soccer', icon: '⚽' },
    { id: 'basketball', name: 'Basketball', icon: '🏀' },
    { id: 'cricket', name: 'Cricket', icon: '🏏' },
    { id: 'tennis', name: 'Tennis', icon: '🎾' },
    { id: 'badminton', name: 'Badminton', icon: '🏸' },
    { id: 'running', name: 'Running', icon: '🏃' },
  ];

  const skillLevels = [
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
    { id: 'professional', name: 'Professional' },
  ];

  const cricketFormats = [
    { id: 'T10', name: 'T10' },
    { id: 'T20', name: 'T20' },
    { id: 'ODI', name: 'ODI' },
    { id: 'Test', name: 'Test' },
    { id: 'Street', name: 'Street Cricket' },
  ];

  // Load user data on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API
      console.log('Loading user profile...');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Mock API call - PUT /profiles/me
      console.log('Saving profile:', profile);
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Profile updated successfully!');
      setLoading(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      // Mock API call - POST /auth/change-password
      console.log('Changing password...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Password changed successfully!');
      setShowChangePassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setLoading(false);
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Failed to change password. Please try again.');
      setLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    setLoading(true);
    try {
      // Mock API call - POST /auth/change-email
      console.log('Changing email to:', emailForm.newEmail);
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Email change request sent. Please check your new email for verification.');
      setShowChangeEmail(false);
      setEmailForm({ newEmail: '', password: '' });
      setLoading(false);
    } catch (error) {
      console.error('Error changing email:', error);
      Alert.alert('Error', 'Failed to change email. Please try again.');
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      // Mock API call - POST /auth/resend-verification
      console.log('Resending verification email...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Verification email sent!');
      setLoading(false);
    } catch (error) {
      console.error('Error resending verification:', error);
      Alert.alert('Error', 'Failed to send verification email. Please try again.');
      setLoading(false);
    }
  };

  const handleDetectCountry = async () => {
    setLoading(true);
    try {
      // Mock API call - GET /games/countries/detect
      console.log('Detecting country...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Mock detected country
      const detectedCountry = countries[0]; // Nepal
      setProfile(prev => ({ ...prev, country: detectedCountry.name }));
      setPaymentSettings(prev => ({ ...prev, country: detectedCountry.name, currency: detectedCountry.currency }));
      Alert.alert('Country Detected', `Detected country: ${detectedCountry.name}`);
      setLoading(false);
    } catch (error) {
      console.error('Error detecting country:', error);
      Alert.alert('Error', 'Failed to detect country. Please select manually.');
      setLoading(false);
    }
  };

  const handleAvatarUpload = () => {
    showImagePicker((result) => {
      if (result) {
        setProfile(prev => ({ ...prev, avatarUrl: result.uri }));
        // Here you would also upload to backend via PUT /profiles/me/avatar
        console.log('Avatar uploaded:', result.uri);
      }
    }, {
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      mediaTypes: 'Images',
    });
  };

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

  const SectionButton = ({ 
    id, 
    title, 
    icon, 
    isActive 
  }: { 
    id: string; 
    title: string; 
    icon: string; 
    isActive: boolean; 
  }) => (
    <TouchableOpacity
      style={[
        styles.sectionButton,
        isActive && styles.sectionButtonActive,
        highContrast && { borderColor: isActive ? '#FFD700' : '#333' }
      ]}
      onPress={() => setActiveSection(id as any)}
    >
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={isActive ? (highContrast ? '#FFD700' : colors.primary) : (highContrast ? '#E5E7EB' : colors.textSecondary)} 
      />
      <Text style={[
        styles.sectionButtonText,
        isActive && styles.sectionButtonTextActive,
        highContrast && { color: isActive ? '#FFD700' : '#E5E7EB' }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderProfileSection = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={handleAvatarUpload} style={styles.avatarContainer}>
          {profile.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={colors.textSecondary} />
            </View>
          )}
          <View style={styles.avatarOverlay}>
            <Ionicons name="camera" size={16} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={[styles.avatarLabel, highContrast && { color: '#fff' }]}>Tap to change photo</Text>
      </View>

      {/* Basic Info */}
      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>First Name *</Text>
        <TextInput
          style={[styles.formInput, highContrast && { backgroundColor: '#0A0A0A', color: '#fff', borderColor: '#333' }]}
          value={profile.firstName}
          onChangeText={(text) => setProfile(prev => ({ ...prev, firstName: text }))}
          placeholder="Enter your first name"
          placeholderTextColor={highContrast ? '#666' : colors.textSecondary}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Last Name *</Text>
        <TextInput
          style={[styles.formInput, highContrast && { backgroundColor: '#0A0A0A', color: '#fff', borderColor: '#333' }]}
          value={profile.lastName}
          onChangeText={(text) => setProfile(prev => ({ ...prev, lastName: text }))}
          placeholder="Enter your last name"
          placeholderTextColor={highContrast ? '#666' : colors.textSecondary}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Username *</Text>
        <TextInput
          style={[styles.formInput, highContrast && { backgroundColor: '#0A0A0A', color: '#fff', borderColor: '#333' }]}
          value={profile.username}
          onChangeText={(text) => setProfile(prev => ({ ...prev, username: text }))}
          placeholder="Enter your username"
          placeholderTextColor={highContrast ? '#666' : colors.textSecondary}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Bio</Text>
        <TextInput
          style={[styles.formInput, styles.bioInput, highContrast && { backgroundColor: '#0A0A0A', color: '#fff', borderColor: '#333' }]}
          value={profile.bio}
          onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
          placeholder="Tell us about yourself..."
          placeholderTextColor={highContrast ? '#666' : colors.textSecondary}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Preferred Sport</Text>
        <View style={styles.sportGrid}>
          {sports.map((sport) => (
            <TouchableOpacity
              key={sport.id}
              style={[
                styles.sportOption,
                profile.preferredSport === sport.id && styles.sportOptionActive,
                highContrast && { borderColor: profile.preferredSport === sport.id ? '#FFD700' : '#333' }
              ]}
              onPress={() => setProfile(prev => ({ ...prev, preferredSport: sport.id }))}
            >
              <Text style={styles.sportIcon}>{sport.icon}</Text>
              <Text style={[
                styles.sportName,
                profile.preferredSport === sport.id && styles.sportNameActive,
                highContrast && { color: profile.preferredSport === sport.id ? '#FFD700' : '#E5E7EB' }
              ]}>
                {sport.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Skill Level</Text>
        <View style={styles.skillLevelContainer}>
          {skillLevels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.skillLevelOption,
                profile.skillLevel === level.id && styles.skillLevelOptionActive,
                highContrast && { borderColor: profile.skillLevel === level.id ? '#FFD700' : '#333' }
              ]}
              onPress={() => setProfile(prev => ({ ...prev, skillLevel: level.id }))}
            >
              <Text style={[
                styles.skillLevelText,
                profile.skillLevel === level.id && styles.skillLevelTextActive,
                highContrast && { color: profile.skillLevel === level.id ? '#FFD700' : '#E5E7EB' }
              ]}>
                {level.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Age</Text>
        <TextInput
          style={[styles.formInput, highContrast && { backgroundColor: '#0A0A0A', color: '#fff', borderColor: '#333' }]}
          value={profile.age?.toString() || ''}
          onChangeText={(text) => setProfile(prev => ({ ...prev, age: parseInt(text) || 0 }))}
          placeholder="Enter your age"
          placeholderTextColor={highContrast ? '#666' : colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Gender</Text>
        <View style={styles.genderContainer}>
          {['male', 'female', 'other'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.genderOption,
                profile.gender === gender && styles.genderOptionActive,
                highContrast && { borderColor: profile.gender === gender ? '#FFD700' : '#333' }
              ]}
              onPress={() => setProfile(prev => ({ ...prev, gender }))}
            >
              <Text style={[
                styles.genderText,
                profile.gender === gender && styles.genderTextActive,
                highContrast && { color: profile.gender === gender ? '#FFD700' : '#E5E7EB' }
              ]}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Nationality</Text>
        <TextInput
          style={[styles.formInput, highContrast && { backgroundColor: '#0A0A0A', color: '#fff', borderColor: '#333' }]}
          value={profile.nationality}
          onChangeText={(text) => setProfile(prev => ({ ...prev, nationality: text }))}
          placeholder="Enter your nationality"
          placeholderTextColor={highContrast ? '#666' : colors.textSecondary}
        />
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSaveProfile}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveButtonText}>Save Profile</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderContactSection = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Email Address</Text>
        <View style={styles.emailContainer}>
          <TextInput
            style={[styles.formInput, styles.emailInput, highContrast && { backgroundColor: '#0A0A0A', color: '#fff', borderColor: '#333' }]}
            value={profile.email}
            editable={false}
            placeholder="Your email address"
            placeholderTextColor={highContrast ? '#666' : colors.textSecondary}
          />
          <TouchableOpacity 
            style={styles.changeButton}
            onPress={() => setShowChangeEmail(true)}
          >
            <Text style={styles.changeButtonText}>Change</Text>
          </TouchableOpacity>
        </View>
        {!profile.isVerified && (
          <View style={styles.verificationContainer}>
            <Ionicons name="warning" size={16} color="#F59E0B" />
            <Text style={[styles.verificationText, highContrast && { color: '#E5E7EB' }]}>
              Email not verified
            </Text>
            <TouchableOpacity onPress={handleResendVerification}>
              <Text style={styles.resendText}>Resend verification</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Phone Number</Text>
        <TextInput
          style={[styles.formInput, highContrast && { backgroundColor: '#0A0A0A', color: '#fff', borderColor: '#333' }]}
          value={profile.phone}
          onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
          placeholder="Enter your phone number"
          placeholderTextColor={highContrast ? '#666' : colors.textSecondary}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>City</Text>
        <TextInput
          style={[styles.formInput, highContrast && { backgroundColor: '#0A0A0A', color: '#fff', borderColor: '#333' }]}
          value={profile.city}
          onChangeText={(text) => setProfile(prev => ({ ...prev, city: text }))}
          placeholder="Enter your city"
          placeholderTextColor={highContrast ? '#666' : colors.textSecondary}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Country</Text>
        <View style={styles.countryContainer}>
          <TextInput
            style={[styles.formInput, styles.countryInput, highContrast && { backgroundColor: '#0A0A0A', color: '#fff', borderColor: '#333' }]}
            value={profile.country}
            editable={false}
            placeholder="Select your country"
            placeholderTextColor={highContrast ? '#666' : colors.textSecondary}
          />
          <TouchableOpacity 
            style={styles.detectButton}
            onPress={handleDetectCountry}
          >
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={styles.detectButtonText}>Detect</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.selectCountryButton}
          onPress={() => setShowCountryModal(true)}
        >
          <Text style={[styles.selectCountryText, highContrast && { color: '#fff' }]}>
            Select from list
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSaveProfile}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveButtonText}>Save Contact Info</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderSecuritySection = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <View style={styles.securityItem}>
        <View style={styles.securityInfo}>
          <Ionicons name="key" size={24} color={colors.primary} />
          <View style={styles.securityText}>
            <Text style={[styles.securityTitle, highContrast && { color: '#fff' }]}>Password</Text>
            <Text style={[styles.securitySubtitle, highContrast && { color: '#E5E7EB' }]}>
              Last changed 30 days ago
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.changeButton}
          onPress={() => setShowChangePassword(true)}
        >
          <Text style={styles.changeButtonText}>Change</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.securityItem}>
        <View style={styles.securityInfo}>
          <Ionicons name="mail" size={24} color={colors.primary} />
          <View style={styles.securityText}>
            <Text style={[styles.securityTitle, highContrast && { color: '#fff' }]}>Email Verification</Text>
            <Text style={[styles.securitySubtitle, highContrast && { color: '#E5E7EB' }]}>
              {profile.isVerified ? 'Verified' : 'Not verified'}
            </Text>
          </View>
        </View>
        {!profile.isVerified && (
          <TouchableOpacity 
            style={styles.changeButton}
            onPress={handleResendVerification}
          >
            <Text style={styles.changeButtonText}>Verify</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.securityItem}>
        <View style={styles.securityInfo}>
          <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
          <View style={styles.securityText}>
            <Text style={[styles.securityTitle, highContrast && { color: '#fff' }]}>Two-Factor Authentication</Text>
            <Text style={[styles.securitySubtitle, highContrast && { color: '#E5E7EB' }]}>
              Not enabled
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.changeButton}
          onPress={() => Alert.alert('Coming Soon', '2FA will be available soon!')}
        >
          <Text style={styles.changeButtonText}>Enable</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.securityItem}>
        <View style={styles.securityInfo}>
          <Ionicons name="phone-portrait" size={24} color={colors.primary} />
          <View style={styles.securityText}>
            <Text style={[styles.securityTitle, highContrast && { color: '#fff' }]}>Active Sessions</Text>
            <Text style={[styles.securitySubtitle, highContrast && { color: '#E5E7EB' }]}>
              2 devices connected
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.changeButton}
          onPress={() => Alert.alert('Coming Soon', 'Session management will be available soon!')}
        >
          <Text style={styles.changeButtonText}>Manage</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dangerZone}>
        <Text style={[styles.dangerZoneTitle, highContrast && { color: '#fff' }]}>Danger Zone</Text>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={20} color="#EF4444" />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderNotificationsSection = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <View style={styles.notificationGroup}>
        <Text style={[styles.groupTitle, highContrast && { color: '#fff' }]}>Push Notifications</Text>
        
        <View style={styles.notificationItem}>
          <View style={styles.notificationInfo}>
            <Text style={[styles.notificationTitle, highContrast && { color: '#fff' }]}>Game Invites</Text>
            <Text style={[styles.notificationSubtitle, highContrast && { color: '#E5E7EB' }]}>
              Get notified when someone invites you to a game
            </Text>
          </View>
          <Switch
            value={notificationSettings.gameInvites}
            onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, gameInvites: value }))}
            trackColor={{ false: '#E5E7EB', true: colors.primary }}
            thumbColor={notificationSettings.gameInvites ? '#fff' : '#fff'}
          />
        </View>

        <View style={styles.notificationItem}>
          <View style={styles.notificationInfo}>
            <Text style={[styles.notificationTitle, highContrast && { color: '#fff' }]}>Game Updates</Text>
            <Text style={[styles.notificationSubtitle, highContrast && { color: '#E5E7EB' }]}>
              Updates about games you're participating in
            </Text>
          </View>
          <Switch
            value={notificationSettings.gameUpdates}
            onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, gameUpdates: value }))}
            trackColor={{ false: '#E5E7EB', true: colors.primary }}
            thumbColor={notificationSettings.gameUpdates ? '#fff' : '#fff'}
          />
        </View>

        <View style={styles.notificationItem}>
          <View style={styles.notificationInfo}>
            <Text style={[styles.notificationTitle, highContrast && { color: '#fff' }]}>Achievements</Text>
            <Text style={[styles.notificationSubtitle, highContrast && { color: '#E5E7EB' }]}>
              When you unlock new achievements
            </Text>
          </View>
          <Switch
            value={notificationSettings.achievements}
            onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, achievements: value }))}
            trackColor={{ false: '#E5E7EB', true: colors.primary }}
            thumbColor={notificationSettings.achievements ? '#fff' : '#fff'}
          />
        </View>

        <View style={styles.notificationItem}>
          <View style={styles.notificationInfo}>
            <Text style={[styles.notificationTitle, highContrast && { color: '#fff' }]}>Social Activity</Text>
            <Text style={[styles.notificationSubtitle, highContrast && { color: '#E5E7EB' }]}>
              Friend requests and social interactions
            </Text>
          </View>
          <Switch
            value={notificationSettings.socialActivity}
            onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, socialActivity: value }))}
            trackColor={{ false: '#E5E7EB', true: colors.primary }}
            thumbColor={notificationSettings.socialActivity ? '#fff' : '#fff'}
          />
        </View>

        <View style={styles.notificationItem}>
          <View style={styles.notificationInfo}>
            <Text style={[styles.notificationTitle, highContrast && { color: '#fff' }]}>Marketing</Text>
            <Text style={[styles.notificationSubtitle, highContrast && { color: '#E5E7EB' }]}>
              Promotional offers and app updates
            </Text>
          </View>
          <Switch
            value={notificationSettings.marketing}
            onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, marketing: value }))}
            trackColor={{ false: '#E5E7EB', true: colors.primary }}
            thumbColor={notificationSettings.marketing ? '#fff' : '#fff'}
          />
        </View>
      </View>

      <View style={styles.notificationGroup}>
        <Text style={[styles.groupTitle, highContrast && { color: '#fff' }]}>Email Notifications</Text>
        
        <View style={styles.notificationItem}>
          <View style={styles.notificationInfo}>
            <Text style={[styles.notificationTitle, highContrast && { color: '#fff' }]}>Email Notifications</Text>
            <Text style={[styles.notificationSubtitle, highContrast && { color: '#E5E7EB' }]}>
              Receive notifications via email
            </Text>
          </View>
          <Switch
            value={notificationSettings.emailNotifications}
            onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, emailNotifications: value }))}
            trackColor={{ false: '#E5E7EB', true: colors.primary }}
            thumbColor={notificationSettings.emailNotifications ? '#fff' : '#fff'}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={() => {
          // Mock API call to save notification settings
          Alert.alert('Success', 'Notification settings updated!');
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveButtonText}>Save Settings</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderPaymentsSection = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Country & Currency</Text>
        <View style={styles.countryCurrencyContainer}>
          <View style={styles.countrySelector}>
            <Text style={[styles.selectorLabel, highContrast && { color: '#E5E7EB' }]}>Country</Text>
            <TouchableOpacity 
              style={[styles.selectorButton, highContrast && { backgroundColor: '#0A0A0A', borderColor: '#333' }]}
              onPress={() => setShowCountryModal(true)}
            >
              <Text style={[styles.selectorText, highContrast && { color: '#fff' }]}>
                {paymentSettings.country}
              </Text>
              <Ionicons name="chevron-down" size={16} color={highContrast ? '#E5E7EB' : colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.currencySelector}>
            <Text style={[styles.selectorLabel, highContrast && { color: '#E5E7EB' }]}>Currency</Text>
            <View style={[styles.selectorButton, highContrast && { backgroundColor: '#0A0A0A', borderColor: '#333' }]}>
              <Text style={[styles.selectorText, highContrast && { color: '#fff' }]}>
                {paymentSettings.currency}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Available Payment Methods</Text>
        <View style={styles.paymentMethodsContainer}>
          {paymentSettings.paymentMethods.map((method, index) => (
            <View key={index} style={[styles.paymentMethod, highContrast && { backgroundColor: '#0A0A0A', borderColor: '#333' }]}>
              <Ionicons 
                name={method === 'card' ? 'card' : 'phone-portrait'} 
                size={20} 
                color={colors.primary} 
              />
              <Text style={[styles.paymentMethodText, highContrast && { color: '#fff' }]}>
                {method === 'card' ? 'Credit/Debit Card' : 'Mobile Money'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Exchange Rates</Text>
        <View style={[styles.exchangeRatesContainer, highContrast && { backgroundColor: '#0A0A0A', borderColor: '#333' }]}>
          <Text style={[styles.exchangeRateText, highContrast && { color: '#E5E7EB' }]}>
            1 USD = 133.50 NPR
          </Text>
          <Text style={[styles.exchangeRateText, highContrast && { color: '#E5E7EB' }]}>
            1 EUR = 145.20 NPR
          </Text>
          <Text style={[styles.exchangeRateText, highContrast && { color: '#E5E7EB' }]}>
            1 GBP = 168.90 NPR
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={() => {
          // Mock API call to save payment settings
          Alert.alert('Success', 'Payment settings updated!');
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveButtonText}>Save Settings</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderSportsSection = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Default Cricket Format</Text>
        <View style={styles.cricketFormatContainer}>
          {cricketFormats.map((format) => (
            <TouchableOpacity
              key={format.id}
              style={[
                styles.cricketFormatOption,
                profile.defaultCricketFormat === format.id && styles.cricketFormatOptionActive,
                highContrast && { borderColor: profile.defaultCricketFormat === format.id ? '#FFD700' : '#333' }
              ]}
              onPress={() => setProfile(prev => ({ ...prev, defaultCricketFormat: format.id }))}
            >
              <Text style={[
                styles.cricketFormatText,
                profile.defaultCricketFormat === format.id && styles.cricketFormatTextActive,
                highContrast && { color: profile.defaultCricketFormat === format.id ? '#FFD700' : '#E5E7EB' }
              ]}>
                {format.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Sports Preferences</Text>
        <Text style={[styles.preferenceNote, highContrast && { color: '#E5E7EB' }]}>
          Your preferred sport and skill level are already set in the Profile section. 
          These settings will be used when creating new games and finding matches.
        </Text>
      </View>

      <View style={styles.sportsStats}>
        <Text style={[styles.statsTitle, highContrast && { color: '#fff' }]}>Your Sports Stats</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, highContrast && { backgroundColor: '#0A0A0A', borderColor: '#333' }]}>
            <Text style={[styles.statNumber, highContrast && { color: '#FFD700' }]}>15</Text>
            <Text style={[styles.statLabel, highContrast && { color: '#E5E7EB' }]}>Games Played</Text>
          </View>
          <View style={[styles.statCard, highContrast && { backgroundColor: '#0A0A0A', borderColor: '#333' }]}>
            <Text style={[styles.statNumber, highContrast && { color: '#FFD700' }]}>8</Text>
            <Text style={[styles.statLabel, highContrast && { color: '#E5E7EB' }]}>Games Won</Text>
          </View>
          <View style={[styles.statCard, highContrast && { backgroundColor: '#0A0A0A', borderColor: '#333' }]}>
            <Text style={[styles.statNumber, highContrast && { color: '#FFD700' }]}>4.2</Text>
            <Text style={[styles.statLabel, highContrast && { color: '#E5E7EB' }]}>Average Rating</Text>
          </View>
          <View style={[styles.statCard, highContrast && { backgroundColor: '#0A0A0A', borderColor: '#333' }]}>
            <Text style={[styles.statNumber, highContrast && { color: '#FFD700' }]}>3</Text>
            <Text style={[styles.statLabel, highContrast && { color: '#E5E7EB' }]}>Current Streak</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSaveProfile}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveButtonText}>Save Sports Settings</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={[styles.container, highContrast && { backgroundColor: '#000' }]}>
      {/* Header */}
      <LinearGradient colors={highContrast ? ['#111', '#111'] : [NepalColors.primary, NepalColors.secondary]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, highContrast && { color: '#fff' }]}>Account Settings</Text>
          <Text style={[styles.headerSubtitle, highContrast && { color: 'rgba(255,255,255,0.8)' }]}>
            Manage your account and preferences
          </Text>
        </View>
      </LinearGradient>

      {/* Section Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.sectionNav}
        contentContainerStyle={styles.sectionNavContent}
      >
        <SectionButton id="profile" title="Profile" icon="person-outline" isActive={activeSection === 'profile'} />
        <SectionButton id="contact" title="Contact" icon="mail-outline" isActive={activeSection === 'contact'} />
        <SectionButton id="security" title="Security" icon="shield-outline" isActive={activeSection === 'security'} />
        <SectionButton id="notifications" title="Notifications" icon="notifications-outline" isActive={activeSection === 'notifications'} />
        <SectionButton id="payments" title="Payments" icon="card-outline" isActive={activeSection === 'payments'} />
        <SectionButton id="sports" title="Sports" icon="football-outline" isActive={activeSection === 'sports'} />
      </ScrollView>

      {/* Section Content */}
      <View style={styles.content}>
        {activeSection === 'profile' && renderProfileSection()}
        {activeSection === 'contact' && renderContactSection()}
        {activeSection === 'security' && renderSecuritySection()}
        {activeSection === 'notifications' && renderNotificationsSection()}
        {activeSection === 'payments' && renderPaymentsSection()}
        {activeSection === 'sports' && renderSportsSection()}
      </View>

      <ImagePickerModal />

      {/* Change Password Modal */}
      <Modal
        visible={showChangePassword}
        transparent
        animationType="slide"
        onRequestClose={() => setShowChangePassword(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, highContrast && { backgroundColor: '#1A1A1A' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, highContrast && { color: '#fff' }]}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowChangePassword(false)}>
                <Ionicons name="close" size={24} color={highContrast ? '#fff' : colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Current Password</Text>
              <TextInput
                style={[styles.formInput, highContrast && { backgroundColor: '#0A0A0A', color: '#fff', borderColor: '#333' }]}
                value={passwordForm.currentPassword}
                onChangeText={(text) => setPasswordForm(prev => ({ ...prev, currentPassword: text }))}
                placeholder="Enter current password"
                placeholderTextColor={highContrast ? '#666' : colors.textSecondary}
                secureTextEntry
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>New Password</Text>
              <TextInput
                style={[styles.formInput, highContrast && { backgroundColor: '#0A0A0A', color: '#fff', borderColor: '#333' }]}
                value={passwordForm.newPassword}
                onChangeText={(text) => setPasswordForm(prev => ({ ...prev, newPassword: text }))}
                placeholder="Enter new password"
                placeholderTextColor={highContrast ? '#666' : colors.textSecondary}
                secureTextEntry
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Confirm New Password</Text>
              <TextInput
                style={[styles.formInput, highContrast && { backgroundColor: '#0A0A0A', color: '#fff', borderColor: '#333' }]}
                value={passwordForm.confirmPassword}
                onChangeText={(text) => setPasswordForm(prev => ({ ...prev, confirmPassword: text }))}
                placeholder="Confirm new password"
                placeholderTextColor={highContrast ? '#666' : colors.textSecondary}
                secureTextEntry
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowChangePassword(false)}
              >
                <Text style={[styles.modalButtonText, highContrast && { color: '#fff' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Change Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Email Modal */}
      <Modal
        visible={showChangeEmail}
        transparent
        animationType="slide"
        onRequestClose={() => setShowChangeEmail(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, highContrast && { backgroundColor: '#1A1A1A' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, highContrast && { color: '#fff' }]}>Change Email</Text>
              <TouchableOpacity onPress={() => setShowChangeEmail(false)}>
                <Ionicons name="close" size={24} color={highContrast ? '#fff' : colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Current Email</Text>
              <TextInput
                style={[styles.formInput, highContrast && { backgroundColor: '#0A0A0A', color: '#fff', borderColor: '#333' }]}
                value={profile.email}
                editable={false}
                placeholder="Current email address"
                placeholderTextColor={highContrast ? '#666' : colors.textSecondary}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>New Email</Text>
              <TextInput
                style={[styles.formInput, highContrast && { backgroundColor: '#0A0A0A', color: '#fff', borderColor: '#333' }]}
                value={emailForm.newEmail}
                onChangeText={(text) => setEmailForm(prev => ({ ...prev, newEmail: text }))}
                placeholder="Enter new email address"
                placeholderTextColor={highContrast ? '#666' : colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Current Password</Text>
              <TextInput
                style={[styles.formInput, highContrast && { backgroundColor: '#0A0A0A', color: '#fff', borderColor: '#333' }]}
                value={emailForm.password}
                onChangeText={(text) => setEmailForm(prev => ({ ...prev, password: text }))}
                placeholder="Enter current password to confirm"
                placeholderTextColor={highContrast ? '#666' : colors.textSecondary}
                secureTextEntry
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowChangeEmail(false)}
              >
                <Text style={[styles.modalButtonText, highContrast && { color: '#fff' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleChangeEmail}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Change Email</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Country Selection Modal */}
      <Modal
        visible={showCountryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, highContrast && { backgroundColor: '#1A1A1A' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, highContrast && { color: '#fff' }]}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <Ionicons name="close" size={24} color={highContrast ? '#fff' : colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.countryList} showsVerticalScrollIndicator={false}>
              {countries.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={[styles.countryItem, highContrast && { backgroundColor: '#0A0A0A' }]}
                  onPress={() => {
                    setProfile(prev => ({ ...prev, country: country.name }));
                    setPaymentSettings(prev => ({ ...prev, country: country.name, currency: country.currency }));
                    setShowCountryModal(false);
                  }}
                >
                  <Text style={styles.countryFlag}>{country.flag}</Text>
                  <View style={styles.countryInfo}>
                    <Text style={[styles.countryName, highContrast && { color: '#fff' }]}>{country.name}</Text>
                    <Text style={[styles.countryCode, highContrast && { color: '#E5E7EB' }]}>{country.code}</Text>
                  </View>
                  <Text style={[styles.countryCurrency, highContrast && { color: '#E5E7EB' }]}>{country.currency}</Text>
                  {profile.country === country.name && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  sectionNav: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionNavContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  sectionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sectionButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.textSecondary,
    marginLeft: 6,
  },
  sectionButtonTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  sectionContent: {
    flex: 1,
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
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
  sportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sportOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    minWidth: 80,
  },
  sportOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sportIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  sportName: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    textAlign: 'center',
  },
  sportNameActive: {
    color: 'white',
  },
  skillLevelContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  skillLevelOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  skillLevelOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  skillLevelText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  skillLevelTextActive: {
    color: 'white',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    flex: 1,
    alignItems: 'center',
  },
  genderOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  genderTextActive: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  // Contact Section Styles
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emailInput: {
    flex: 1,
  },
  changeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  changeButtonText: {
    color: 'white',
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  verificationText: {
    fontSize: typography.fontSize.sm,
    color: '#F59E0B',
  },
  resendText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  countryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countryInput: {
    flex: 1,
  },
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 6,
    gap: 4,
  },
  detectButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  selectCountryButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
  selectCountryText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  // Security Section Styles
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityText: {
    marginLeft: 12,
    flex: 1,
  },
  securityTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  securitySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  dangerZone: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dangerZoneTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#EF444420',
    borderRadius: 8,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: typography.fontSize.md,
    color: '#EF4444',
    fontWeight: '500',
  },
  // Notifications Section Styles
  notificationGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  notificationInfo: {
    flex: 1,
    marginRight: 16,
  },
  notificationTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  notificationSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  // Payments Section Styles
  countryCurrencyContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  countrySelector: {
    flex: 1,
  },
  currencySelector: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  selectorText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  paymentMethodsContainer: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
    gap: 12,
  },
  paymentMethodText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  exchangeRatesContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
    gap: 8,
  },
  exchangeRateText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  // Sports Section Styles
  cricketFormatContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cricketFormatOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  cricketFormatOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cricketFormatText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  cricketFormatTextActive: {
    color: 'white',
  },
  preferenceNote: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  sportsStats: {
    marginTop: 24,
  },
  statsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Modal Styles
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
  modalButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  // Country Modal Styles
  countryList: {
    maxHeight: 400,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.background,
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
  countryCode: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  countryCurrency: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginRight: 8,
  },
});

export default AccountSettingsScreen;
