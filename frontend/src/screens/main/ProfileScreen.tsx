import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  TextInput,
  Modal,
  RefreshControl,
  Switch,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, NepalColors } from '@/constants/theme';
import SportRing from '@/components/profile/SportRing';
import StatChip from '@/components/profile/StatChip';
import ProgressRing from '@/components/profile/ProgressRing';
import SportFilterPills from '@/components/profile/SportFilterPills';
import ScoutingReport from '@/components/profile/ScoutingReport';
import Shimmer from '@/components/common/Shimmer';
import { storage } from '@/utils/storage';
import { getMyProfile, getDashboardSummary, getMyGames } from '@/services/profile';
// import ScoutingReportEditor from '@/components/profile/ScoutingReportEditor';
// import MultiSportProfile from '@/components/profile/MultiSportProfile';
// import ScoutingReport from '@/components/profile/ScoutingReport';
// import AchievementSystem from '@/components/profile/AchievementSystem';
// import PerformanceInsights from '@/components/profile/PerformanceInsights';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { updateMyProfile } from '@/services/profile';
import { useUIStore } from '@/stores/uiStore';
import { Snackbar } from 'react-native-paper';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthStore } from '@/stores/authStore';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  gender?: string;
  nationality?: string;
  birthDate?: string;
  country?: string;
  bio?: string;
  avatar?: string;
  stats?: {
    totalGamesPlayed: number;
    totalGamesWon: number;
    totalGamesLost: number;
    totalGamesDrawn: number;
    currentStreak: number;
    longestStreak: number;
    winRate: number;
  };
}

interface ScoutingReportData {
  sport: string;
  nickname: string;
  positions: string[];
  playStyle: string[];
  superpower: string;
  formats: string[];
  availability: string;
  funFact: string;
  skillLevel: string;
  preferredSide: string;
  kitNumber: string;
  form: string;
  travelRadius: number;
  openToInvites: boolean;
}

const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sportProfiles, setSportProfiles] = useState<ScoutingReportData[]>([]);
  const [showScoutingEditor, setShowScoutingEditor] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ScoutingReportData | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [accountForm, setAccountForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingGames, setLoadingGames] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [games, setGames] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [snack, setSnack] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
  const [selectedSport, setSelectedSport] = useState<string | null>('soccer');
  const [scoutingData, setScoutingData] = useState<any>(null);
  const { t, setLanguage } = useLanguage();
  
  // Ensure English is set as default language
  useEffect(() => {
    // Force English language on profile screen and clear any stored language
    const forceEnglish = async () => {
      try {
        // Clear stored language preference
        await storage.removeItem('app_language');
        // Set to English
        await setLanguage('en');
      } catch (error) {
        console.error('Error setting language to English:', error);
      }
    };
    forceEnglish();
  }, [setLanguage]);
  const { highContrast, rtlEnabled } = useUIStore();
  const { logout } = useAuthStore();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const statsAnimations = useRef({
    gamesPlayed: new Animated.Value(0),
    wins: new Animated.Value(0),
    losses: new Animated.Value(0),
    draws: new Animated.Value(0),
    winRate: new Animated.Value(0),
    currentStreak: new Animated.Value(0),
    longestStreak: new Animated.Value(0),
  }).current;

  // Count-up animation function
  const animateCountUp = (animValue: Animated.Value, targetValue: number, duration: number = 1000) => {
    Animated.timing(animValue, {
      toValue: targetValue,
      duration: duration,
      useNativeDriver: false,
    }).start();
  };

  // Animate stats on load
  const animateStats = useCallback(() => {
    if (user?.stats) {
      const { stats } = user;
      animateCountUp(statsAnimations.gamesPlayed, stats.totalGamesPlayed || 0, 1200);
      animateCountUp(statsAnimations.wins, stats.totalGamesWon || 0, 1000);
      animateCountUp(statsAnimations.losses, stats.totalGamesLost || 0, 1000);
      animateCountUp(statsAnimations.draws, stats.totalGamesDrawn || 0, 1000);
      animateCountUp(statsAnimations.winRate, stats.winRate || 0, 1500);
      animateCountUp(statsAnimations.currentStreak, stats.currentStreak || 0, 800);
      animateCountUp(statsAnimations.longestStreak, stats.longestStreak || 0, 800);
    }
  }, [user?.stats]);

  // Animate header on load
  const animateHeader = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Helper function to calculate age
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Animated Stat Component
  const AnimatedStat = ({ animValue, label, color, icon, suffix = '' }: {
    animValue: Animated.Value;
    label: string;
    color: string;
    icon: string;
    suffix?: string;
  }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      const listener = animValue.addListener(({ value }) => {
        setDisplayValue(Math.round(value));
      });
      return () => animValue.removeListener(listener);
    }, [animValue]);

    return (
      <Animated.View style={[styles.statItem, { opacity: fadeAnim }]}>
        <View style={styles.statIconContainer}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <Animated.Text style={[styles.statNumber, { color }]}>
          {displayValue}{suffix}
        </Animated.Text>
        <Text style={[styles.statLabel, highContrast && { color: '#fff' }]}>{label}</Text>
      </Animated.View>
    );
  };

  // Fetch real data
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingProfile(true);
        const res = await getMyProfile();
        if (mounted && res.ok) {
          const p = res.data;
          const userData = {
            id: String(p.id ?? ''),
            name: [p.firstName, p.lastName].filter(Boolean).join(' ') || p.username || 'User',
            username: p.username ?? 'user',
            email: p.email ?? '',
            phone: p.phone ?? p.phoneNumber,
            gender: p.gender,
            nationality: p.nationality,
            birthDate: p.birthDate,
            country: p.country ?? p.location,
            bio: p.bio ?? '',
            avatar: p.avatarUrl,
            stats: {
              totalGamesPlayed: p.totalGamesPlayed ?? 0,
              totalGamesWon: p.totalGamesWon ?? 0,
              totalGamesLost: p.totalGamesLost ?? 0,
              totalGamesDrawn: p.totalGamesDrawn ?? 0,
              currentStreak: p.currentStreak ?? 0,
              longestStreak: p.longestStreak ?? 0,
              winRate: p.winRate ?? 0,
            },
          } as any;
          setUser(userData);
          setBioText(p.bio ?? '');
          // Initialize account form
          setAccountForm({
            name: userData.name,
            email: userData.email,
            phone: userData.phone || '',
            bio: userData.bio || '',
          });
          // Trigger animations
          setTimeout(() => {
            animateHeader();
            animateStats();
          }, 100);
          

          // Mock scouting data
          setScoutingData({
            sport: 'soccer',
            nickname: 'Threadz',
            position: 'CM',
            playStyle: ['press-resistant', 'one-touch passer'],
            superpower: 'through-balls',
            format: '7v7 weeknights',
            availability: 'weeknights',
            funFact: 'tracks assists',
            skillLevel: 'INTERMEDIATE',
            preferredFoot: 'Right',
            travelRadius: 15,
            openToInvites: true
          });
        }
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    })();

    (async () => {
      try {
        setLoadingSummary(true);
        const res = await getDashboardSummary();
        if (mounted && res.ok) setDashboard(res.data);
      } finally {
        if (mounted) setLoadingSummary(false);
      }
    })();

    (async () => {
      try {
        setLoadingGames(true);
        const res = await getMyGames();
        if (mounted && res.ok) setGames(res.data?.content || res.data || []);
      } finally {
        if (mounted) setLoadingGames(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      setRefreshing(true);
      const [p, s, g] = await Promise.all([getMyProfile(), getDashboardSummary(), getMyGames()]);
      if (p.ok) {
        const pp = p.data;
        setUser({
          id: String(pp.id ?? ''),
          name: [pp.firstName, pp.lastName].filter(Boolean).join(' ') || pp.username || 'User',
          username: pp.username ?? 'user',
          email: pp.email ?? '',
          phone: pp.phone ?? pp.phoneNumber,
          gender: pp.gender,
          nationality: pp.nationality,
          birthDate: pp.birthDate,
          country: pp.country ?? pp.location,
          bio: pp.bio ?? '',
          avatar: pp.avatarUrl,
          stats: {
            totalGamesPlayed: pp.totalGamesPlayed ?? 0,
            totalGamesWon: pp.totalGamesWon ?? 0,
            totalGamesLost: pp.totalGamesLost ?? 0,
            totalGamesDrawn: pp.totalGamesDrawn ?? 0,
            currentStreak: pp.currentStreak ?? 0,
            longestStreak: pp.longestStreak ?? 0,
            winRate: pp.winRate ?? 0,
          },
        } as any);
      }
      if (g.ok) setGames(g.data?.content || g.data || []);
      if (s.ok) setDashboard(s.data);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleLogout = () => {
    console.log('handleLogout called');
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    console.log('User confirmed logout');
    setShowLogoutConfirm(false);
    performLogout();
  };

  const cancelLogout = () => {
    console.log('User cancelled logout');
    setShowLogoutConfirm(false);
  };

  const performLogout = async () => {
    try {
      console.log('Starting logout process...');
      
      // Clear auth state immediately
      useAuthStore.setState({
        user: null,
        token: null,
        isAuthenticated: false,
        biometricEnabled: false,
        isLoading: false,
      });
      
      // Clear storage
      await storage.removeItem('access_token');
      await storage.removeItem('refresh_token');
      await storage.removeItem('refresh_nonce');
      await storage.removeItem('biometric_enabled');
      await storage.removeItem('biometric_token');
      
      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear the state
      useAuthStore.setState({
        user: null,
        token: null,
        isAuthenticated: false,
        biometricEnabled: false,
        isLoading: false,
      });
    }
  };

  const handleSaveSportProfile = (data: ScoutingReportData) => {
    setSportProfiles(prev => [...prev, data]);
    setShowScoutingEditor(false);
  };

  const handleUpdateSportProfile = (data: ScoutingReportData) => {
    setSportProfiles(prev => 
      prev.map(profile => 
        profile.sport === data.sport ? data : profile
      )
    );
    setShowScoutingEditor(false);
    setEditingProfile(null);
  };

  const handleEditSportProfile = (profile: ScoutingReportData) => {
    setEditingProfile(profile);
    setShowScoutingEditor(true);
  };

  const handleRemoveSportProfile = (sport: string) => {
    setSportProfiles(prev => prev.filter(profile => profile.sport !== sport));
  };

  const handleSaveProfile = async (updatedUser: User) => {
    try {
      const [firstName, ...rest] = (updatedUser.name || '').split(' ');
      const lastName = rest.join(' ');
      await updateMyProfile({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        bio: updatedUser.bio || undefined,
        phone: updatedUser.phone || undefined,
        location: updatedUser.country || undefined,
      });
      // Refresh profile from backend to ensure consistency
      const res = await getMyProfile();
      if (res.ok) {
        const p = res.data;
        setUser({
          id: String(p.id ?? ''),
          name: [p.firstName, p.lastName].filter(Boolean).join(' ') || p.username || 'User',
          username: p.username ?? 'user',
          email: p.email ?? '',
          phone: p.phone ?? p.phoneNumber,
          gender: p.gender,
          nationality: p.nationality,
          birthDate: p.birthDate,
          country: p.country ?? p.location,
          bio: p.bio ?? '',
          avatar: p.avatarUrl,
          stats: {
            totalGamesPlayed: p.totalGamesPlayed ?? 0,
            totalGamesWon: p.totalGamesWon ?? 0,
            totalGamesLost: p.totalGamesLost ?? 0,
            totalGamesDrawn: p.totalGamesDrawn ?? 0,
            currentStreak: p.currentStreak ?? 0,
            longestStreak: p.longestStreak ?? 0,
            winRate: p.winRate ?? 0,
          },
        } as any);
      }
      setSnack({ visible: true, message: t('toast.profileUpdated') });
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to update profile');
    } finally {
      setShowEditProfile(false);
    }
  };

  const handleSaveBio = () => {
    if (user) {
      setUser({ ...user, bio: bioText });
    }
    setIsEditingBio(false);
  };

  const handleSaveAccountSettings = async () => {
    try {
      // Update user data
      if (user) {
        const updatedUser = {
          ...user,
          name: accountForm.name,
          email: accountForm.email,
          phone: accountForm.phone,
          bio: accountForm.bio,
        };
        setUser(updatedUser);
        setBioText(accountForm.bio);
      }
      
      // Show success message
      setSnack({ visible: true, message: 'Account settings updated successfully!' });
      setShowAccountSettings(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update account settings');
    }
  };


  if (!user || loadingProfile) {
    return (
      <View style={[styles.container, highContrast && { backgroundColor: '#000' }]}>
        <LinearGradient colors={[NepalColors.primary, NepalColors.secondary]} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <Shimmer width={80} height={80} borderRadius={40} />
              </View>
              <View style={styles.userInfo}>
                <Shimmer width={160} height={20} />
                <Shimmer width={100} height={16} style={{ marginTop: 8 }} />
                <Shimmer width={220} height={14} style={{ marginTop: 8 }} />
              </View>
            </View>
            <View style={[styles.editButton, { opacity: 0.6 }] }>
              <Shimmer width={70} height={32} borderRadius={16} />
            </View>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              {[1,2,3].map(i => (
                <View key={i} style={styles.statItem}>
                  <Shimmer width={40} height={18} />
                  <Shimmer width={60} height={12} style={{ marginTop: 6 }} />
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, highContrast && { backgroundColor: '#000' }]}>
      <ScrollView
        style={[styles.content, highContrast && { backgroundColor: '#000' }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshAll} />}
      >
        {/* Header with Nepal Theme */}
        <LinearGradient colors={['#E51A1A', '#003F87']} style={styles.header}>
          {/* Top Action Buttons */}
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.headerIcon} onPress={() => setShowSettings(true)}>
              <Ionicons name="settings-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Profile Section with Sport Ring */}
          <View style={[styles.profileSection, rtlEnabled && { alignItems: 'stretch' }]}>
            <View style={styles.avatarContainer}>
              <SportRing 
                sport={selectedSport || 'soccer'} 
                size={100} 
                isActive={true}
                onPress={() => Alert.alert('Sport Ring', 'Sport ring tapped!')}
              />
              <View style={styles.avatarOverlay}>
                <Image
                  source={{ uri: user.avatar || 'https://via.placeholder.com/80x80/4A5568/FFFFFF?text=' + (user?.name?.charAt(0) || 'U') }}
                  style={styles.avatar}
                />
                <View style={styles.onlineStatus} />
              </View>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, highContrast && { color: '#fff' }]}>{user.name}</Text>
              <Text style={[styles.userUsername, highContrast && { color: 'rgba(255,255,255,0.8)' }]}>@{user.username}</Text>
              
              {/* Age, Nationality, and Edit Profile */}
              <View style={styles.userDetailsRow}>
                {user.birthDate && calculateAge(user.birthDate) && (
                  <View style={styles.userDetailChip}>
                    <Ionicons name="calendar-outline" size={14} color="#22D3EE" />
                    <Text style={styles.userDetailText}>{calculateAge(user.birthDate)} years old</Text>
                  </View>
                )}
                <View style={styles.userDetailChip}>
                  <Ionicons name="flag-outline" size={14} color="#A3E635" />
                  <Text style={styles.userDetailText}>{user.nationality || user.country || 'Nepal'}</Text>
                </View>
                <TouchableOpacity style={styles.editProfileButton} onPress={() => setShowEditProfile(true)}>
                  <Ionicons name="create-outline" size={14} color="#FB7185" />
                  <Text style={styles.editProfileText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* New Stats Layout */}
          <Animated.View 
            style={[
              styles.newStatsCard, 
              { 
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            {/* W-D-L Chips Row */}
            <View style={styles.statsChipsRow}>
              <StatChip 
                value={user.stats?.totalGamesWon || 0} 
                label="Wins" 
                color="#22C55E" 
                size="large"
              />
              <StatChip 
                value={user.stats?.totalGamesDrawn || 0} 
                label="Draws" 
                color="#F59E0B" 
                size="large"
              />
              <StatChip 
                value={user.stats?.totalGamesLost || 0} 
                label="Losses" 
                color="#EF4444" 
                size="large"
              />
            </View>

            {/* Win Rate Progress Ring */}
            <View style={styles.progressRingContainer}>
              <ProgressRing 
                percentage={user.stats?.winRate || 0}
                size={120}
                color="#22D3EE"
                backgroundColor="#30363D"
              />
            </View>

            {/* Streak Badges */}
            <View style={styles.streakBadgesRow}>
              <View style={[styles.streakBadge, { backgroundColor: '#F59E0B20', borderColor: '#F59E0B' }]}>
                <Ionicons name="flame" size={16} color="#F59E0B" />
                <Text style={[styles.streakBadgeText, { color: '#F59E0B' }]}>
                  {user.stats?.currentStreak || 0} Current
                </Text>
              </View>
              <View style={[styles.streakBadge, { backgroundColor: '#3B82F620', borderColor: '#3B82F6' }]}>
                <Ionicons name="trophy" size={16} color="#3B82F6" />
                <Text style={[styles.streakBadgeText, { color: '#3B82F6' }]}>
                  {user.stats?.longestStreak || 0} Best
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Enhanced Personal Info Chips */}
          <Animated.View 
            style={[
              styles.personalInfoRow,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            {user.birthDate && calculateAge(user.birthDate) && (
              <Animated.View 
                style={[
                  styles.infoChip,
                  { transform: [{ scale: scaleAnim }] }
                ]}
              >
                <Ionicons name="calendar-outline" size={16} color="#3B82F6" />
                <Text style={styles.infoChipText}>{calculateAge(user.birthDate)} years old</Text>
              </Animated.View>
            )}
            <Animated.View 
              style={[
                styles.infoChip,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <Ionicons name="flag-outline" size={16} color="#10B981" />
              <Text style={styles.infoChipText}>{user.nationality || user.country || 'Nepal'}</Text>
            </Animated.View>
            {user.gender && (
              <Animated.View 
                style={[
                  styles.infoChip,
                  { transform: [{ scale: scaleAnim }] }
                ]}
              >
                <Ionicons name="person-outline" size={16} color="#F59E0B" />
                <Text style={styles.infoChipText}>{user.gender}</Text>
              </Animated.View>
            )}
          </Animated.View>

          {/* Sport Filter Pills */}
          <SportFilterPills
            sports={[]}
            selectedSport={selectedSport}
            onSportSelect={setSelectedSport}
          />
        </LinearGradient>

        {/* Scouting Report */}
        {scoutingData && (
          <ScoutingReport
            sport={scoutingData.sport}
            nickname={scoutingData.nickname}
            position={scoutingData.position}
            playStyle={scoutingData.playStyle}
            superpower={scoutingData.superpower}
            format={scoutingData.format}
            availability={scoutingData.availability}
            funFact={scoutingData.funFact}
            skillLevel={scoutingData.skillLevel}
            preferredFoot={scoutingData.preferredFoot}
            travelRadius={scoutingData.travelRadius}
            openToInvites={scoutingData.openToInvites}
            onEdit={() => Alert.alert('Edit Scouting Report', 'Edit functionality coming soon!')}
          />
        )}


        {/* Bio Section */}
        <View style={[styles.bioSection, highContrast && { backgroundColor: '#0A0A0A' }]}>
          <View style={styles.bioHeader}>
            <Text style={[styles.bioTitle, highContrast && { color: '#fff' }]}>{t('profile.aboutMe')}</Text>
            <TouchableOpacity onPress={() => setIsEditingBio(true)}>
              <Ionicons name="create-outline" size={20} color={highContrast ? '#FFD700' : colors.primary} />
            </TouchableOpacity>
          </View>
          {isEditingBio ? (
            <View style={styles.bioEditContainer}>
              <TextInput
                style={styles.bioInput}
                value={bioText}
                onChangeText={setBioText}
                multiline
                placeholder="Tell us about yourself, your sports interests, and what makes you unique..."
                placeholderTextColor={colors.textSecondary}
                maxLength={500}
              />
              <View style={styles.bioActions}>
                <TouchableOpacity onPress={() => setIsEditingBio(false)} style={styles.bioCancelButton}>
                  <Text style={[styles.bioCancelText, highContrast && { color: '#fff' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveBio} style={styles.bioSaveButton}>
                  <Text style={styles.bioSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={[styles.bioText, highContrast && { color: '#fff' }]}>
              {user.bio || 'Tell us about yourself, your sports interests, and what makes you unique...'}
            </Text>
          )}
        </View>

        {/* Upcoming Games */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('profile.upcomingGames')}</Text>
            <TouchableOpacity onPress={() => Alert.alert('Explore', 'Explore games coming soon!')}>
              <Text style={styles.sectionLink}>{t('profile.explore')}</Text>
            </TouchableOpacity>
          </View>
          {loadingGames ? (
            <View>
              {[1, 2, 3].map((i) => (
                <View key={i} style={[styles.gameCard, highContrast && { backgroundColor: '#0A0A0A', borderColor: '#333', borderWidth: 1 }]}>
                  <View style={styles.gameRow}>
                    <Shimmer width={36} height={36} borderRadius={18} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Shimmer width={'60%'} height={14} />
                      <Shimmer width={'40%'} height={12} style={{ marginTop: 6 }} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View>
              {(games && games.length ? games : []).slice(0, 5).map((g: any) => (
                <View key={String(g.id || Math.random())} style={[styles.gameCard, highContrast && { backgroundColor: '#0A0A0A', borderColor: '#333', borderWidth: 1 }]}>
                  <View style={styles.gameRow}>
                    <View style={styles.gameIconCircle}>
                      <Ionicons name="football-outline" size={18} color={colors.textLight} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.gameTitle, highContrast && { color: '#fff' }]}>{g.title || g.sport || 'Game'}</Text>
                      <Text style={[styles.gameMeta, highContrast && { color: '#E5E7EB' }]}>
                        {(g.venue?.name || (typeof g.location === 'string' ? g.location : g.location?.name || g.location?.address) || g.city || 'Unknown venue')} • {g.time || g.dateTime || g.startTime || 'TBA'}
                      </Text>
                    </View>
                    <View style={styles.gameCapacityChip}>
                      <Text style={[styles.gameCapacityText, highContrast && { color: '#111' }]}>
                        {g.currentParticipants || g.currentPlayers || 0}/{g.capacity || g.maxPlayers || 0}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
              {(!games || games.length === 0) && (
                <Text style={[styles.emptyText, highContrast && { color: '#E5E7EB' }]}>No upcoming games—{t('profile.explore').toLowerCase()} to join one!</Text>
              )}
            </View>
          )}
        </View>

        {/* Sports Profiles - Temporarily disabled for debugging */}
        {/* <MultiSportProfile
          sportProfiles={sportProfiles}
          onAddSport={() => setShowScoutingEditor(true)}
          onEditSport={handleEditSportProfile}
          onRemoveSport={handleRemoveSportProfile}
        /> */}

        {/* Achievements - Temporarily disabled for debugging */}
        {/* {user.stats && (
          <AchievementSystem userStats={user.stats} />
        )} */}

        {/* Performance Insights - Temporarily disabled for debugging */}
        {/* {user.stats && (
          <PerformanceInsights
            userStats={user.stats}
            onFindGames={() => Alert.alert('Find Games', 'Find games coming soon!')}
            onCreateGame={() => Alert.alert('Create Game', 'Create game coming soon!')}
            onFindPractice={() => Alert.alert('Find Practice', 'Find practice coming soon!')}
          />
        )} */}
      </ScrollView>

      {/* Modals */}
      {/* <ScoutingReportEditor
        visible={showScoutingEditor}
        onClose={() => {
          setShowScoutingEditor(false);
          setEditingProfile(null);
        }}
        onSave={handleSaveSportProfile}
        editingProfile={editingProfile}
        onUpdateProfile={handleUpdateSportProfile}
      /> */}

      <EditProfileModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onSave={handleSaveProfile}
        user={user}
        onAvatarChanged={(url) => {
          if (user) setUser({ ...user, avatar: url });
          setSnack({ visible: true, message: t('toast.avatarUpdated') });
        }}
      />

      <Snackbar
        visible={snack.visible}
        onDismiss={() => setSnack({ visible: false, message: '' })}
        duration={2000}
      >{snack.message}</Snackbar>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.settingsModal, highContrast && { backgroundColor: '#1A1A1A' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, highContrast && { color: '#fff' }]}>Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Ionicons name="close" size={24} color={highContrast ? '#fff' : colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.settingsContent} showsVerticalScrollIndicator={false}>
              {/* Account Section */}
              <View style={[styles.settingsSection, highContrast && { backgroundColor: '#0A0A0A' }]}>
                <Text style={[styles.sectionTitle, highContrast && { color: '#fff' }]}>Account</Text>
                
                <TouchableOpacity 
                  style={[styles.settingItem, highContrast && { backgroundColor: '#1A1A1A', borderColor: '#333' }]}
                  onPress={() => {
                    setShowSettings(false);
                    setShowAccountSettings(true);
                  }}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIcon}>
                      <Ionicons name="person-outline" size={20} color={highContrast ? '#FFD700' : colors.primary} />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={[styles.settingTitle, highContrast && { color: '#fff' }]}>Account Settings</Text>
                      <Text style={[styles.settingSubtitle, highContrast && { color: '#E5E7EB' }]}>Manage your profile and personal information</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={highContrast ? '#E5E7EB' : colors.textSecondary} />
                </TouchableOpacity>
              </View>


              {/* Account Actions */}
              <View style={[styles.settingsSection, highContrast && { backgroundColor: '#0A0A0A' }]}>
                <Text style={[styles.sectionTitle, highContrast && { color: '#fff' }]}>Account Actions</Text>
                
                <TouchableOpacity 
                  style={[styles.settingItem, highContrast && { backgroundColor: '#1A1A1A', borderColor: '#333' }]}
                  onPress={() => {
                    setShowSettings(false);
                    handleLogout();
                  }}
                >
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIcon, { backgroundColor: '#EF444420' }]}>
                      <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={[styles.settingTitle, highContrast && { color: '#fff' }, { color: '#EF4444' }]}>Sign Out</Text>
                      <Text style={[styles.settingSubtitle, highContrast && { color: '#E5E7EB' }]}>Sign out of your account</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Account Settings Modal */}
      <Modal
        visible={showAccountSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAccountSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.settingsModal, highContrast && { backgroundColor: '#1A1A1A' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, highContrast && { color: '#fff' }]}>Account Settings</Text>
              <TouchableOpacity onPress={() => setShowAccountSettings(false)}>
                <Ionicons name="close" size={24} color={highContrast ? '#fff' : colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.settingsContent} showsVerticalScrollIndicator={false}>
              <View style={[styles.settingsSection, highContrast && { backgroundColor: '#0A0A0A' }]}>
                <Text style={[styles.sectionTitle, highContrast && { color: '#fff' }]}>Personal Information</Text>
                
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Full Name</Text>
                  <TextInput
                    style={[styles.formInput, highContrast && { backgroundColor: '#0A0A0A', color: '#fff', borderColor: '#333' }]}
                    value={accountForm.name}
                    onChangeText={(text) => setAccountForm({ ...accountForm, name: text })}
                    placeholder="Enter your full name"
                    placeholderTextColor={highContrast ? '#666' : colors.textSecondary}
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Email Address</Text>
                  <TextInput
                    style={[styles.formInput, highContrast && { backgroundColor: '#0A0A0A', color: '#fff', borderColor: '#333' }]}
                    value={accountForm.email}
                    onChangeText={(text) => setAccountForm({ ...accountForm, email: text })}
                    placeholder="Enter your email address"
                    placeholderTextColor={highContrast ? '#666' : colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Phone Number</Text>
                  <TextInput
                    style={[styles.formInput, highContrast && { backgroundColor: '#0A0A0A', color: '#fff', borderColor: '#333' }]}
                    value={accountForm.phone}
                    onChangeText={(text) => setAccountForm({ ...accountForm, phone: text })}
                    placeholder="Enter your phone number"
                    placeholderTextColor={highContrast ? '#666' : colors.textSecondary}
                    keyboardType="phone-pad"
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, highContrast && { color: '#fff' }]}>Bio</Text>
                  <TextInput
                    style={[styles.formInput, styles.bioInput, highContrast && { backgroundColor: '#0A0A0A', color: '#fff', borderColor: '#333' }]}
                    value={accountForm.bio}
                    onChangeText={(text) => setAccountForm({ ...accountForm, bio: text })}
                    placeholder="Tell us about yourself..."
                    placeholderTextColor={highContrast ? '#666' : colors.textSecondary}
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowAccountSettings(false)}
                >
                  <Text style={[styles.modalButtonText, highContrast && { color: '#fff' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveAccountSettings}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutConfirm}
        transparent
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.logoutModal, highContrast && { backgroundColor: '#1A1A1A' }]}>
            <View style={styles.logoutIconContainer}>
              <Ionicons name="log-out-outline" size={48} color="#EF4444" />
            </View>
            <Text style={[styles.logoutTitle, highContrast && { color: '#fff' }]}>Sign Out</Text>
            <Text style={[styles.logoutMessage, highContrast && { color: '#E5E7EB' }]}>
              Are you sure you want to sign out?
            </Text>
            <View style={styles.logoutActions}>
              <TouchableOpacity 
                style={[styles.logoutButton, styles.cancelLogoutButton]}
                onPress={cancelLogout}
              >
                <Text style={[styles.logoutButtonText, highContrast && { color: '#fff' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.logoutButton, styles.confirmLogoutButton]}
                onPress={confirmLogout}
              >
                <Text style={styles.confirmLogoutButtonText}>Sign Out</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: typography.fontSize.lg,
    color: colors.text,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    marginBottom: 20,
  },
  statsContainer: {
    marginTop: 20,
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  editButtonText: {
    fontSize: typography.fontSize.sm,
    color: 'white',
    fontWeight: '600',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
  },
  onlineStatus: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userUsername: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  statIconContainer: {
    marginBottom: 8,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statNumber: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  winLossRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  winLossBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  winLossText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  streakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  autoTrackingNote: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  personalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  infoChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  bioSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bioTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  bioText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  bioEditContainer: {
    marginTop: 8,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: typography.fontSize.md,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  bioActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  bioCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bioCancelText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  bioSaveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bioSaveText: {
    fontSize: typography.fontSize.md,
    color: 'white',
    fontWeight: '600',
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  sectionLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  gameCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontWeight: '600',
  },
  gameMeta: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  gameCapacityChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceVariant,
  },
  gameCapacityText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 6,
  },
  quickActionsSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIconContainer: {
    marginBottom: 8,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  quickActionSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  // Upcoming Games Section Styles
  upcomingGamesSection: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  upcomingGamesScroll: {
    paddingRight: 20,
  },
  upcomingGameCard: {
    width: 280,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sportIcon: {
    fontSize: 24,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  gameSport: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  gameVenue: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  gameDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  gameDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  gameDetailText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  gameParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  participantsText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gamePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  joinButtonTextDisabled: {
    color: '#9CA3AF',
  },
  quickActionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  settingsModal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  settingsContent: {
    flex: 1,
  },
  settingsSection: {
    backgroundColor: colors.surface,
    marginBottom: 20,
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  logoutModal: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EF444420',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  logoutMessage: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  logoutActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  logoutButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelLogoutButton: {
    backgroundColor: colors.surfaceVariant,
  },
  confirmLogoutButton: {
    backgroundColor: '#EF4444',
  },
  logoutButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  confirmLogoutButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: 'white',
  },
  // New component styles
  userDetailsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  userDetailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  userDetailText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#F8FAFC',
    marginLeft: 4,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(251, 113, 133, 0.2)',
    borderWidth: 1,
    borderColor: '#FB7185',
  },
  editProfileText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FB7185',
    marginLeft: 4,
  },
  newStatsCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  statsChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  progressRingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  streakBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  streakBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default ProfileScreen;
