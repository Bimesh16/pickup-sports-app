import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, NepalColors } from '@/constants/theme';
import Shimmer from '@/components/common/Shimmer';
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
  const { t, setLanguage, currentLanguage } = useLanguage();
  const { highContrast, rtlEnabled, toggleHighContrast, toggleRTL } = useUIStore();
  const { logout } = useAuthStore();

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

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            try {
              console.log('Starting logout process...');
              await logout();
              console.log('Logout completed successfully');
              
              // Force navigation to auth screen as a fallback
              setTimeout(() => {
                console.log('Checking auth state after logout...');
                const { isAuthenticated } = useAuthStore.getState();
                console.log('Current auth state:', { isAuthenticated });
                if (isAuthenticated) {
                  console.log('Still authenticated, forcing logout...');
                  useAuthStore.setState({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    biometricEnabled: false,
                    isLoading: false,
                  });
                }
              }, 1000);
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        },
      ]
    );
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

  const handleFindGames = () => {
    Alert.alert('Find Games', 'This will open the games screen');
  };

  const handleCreateGame = () => {
    Alert.alert('Create Game', 'This will open the create game screen');
  };

  const handleFindPractice = () => {
    Alert.alert('Find Practice', 'This will open the practice games screen');
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
      {/* Header with Nepal Flag Colors */}
      <LinearGradient colors={highContrast ? ['#111', '#111'] : [NepalColors.primary, NepalColors.secondary]} style={styles.header}>
        {/* Top Action Buttons */}
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => setShowSettings(true)}>
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton} onPress={() => setShowEditProfile(true)}>
            <Ionicons name="create-outline" size={16} color="white" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={() => Alert.alert('Share Profile', 'Share profile coming soon!')}>
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={[styles.profileSection, rtlEnabled && { alignItems: 'stretch' }]}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user.avatar || 'https://via.placeholder.com/80x80/4A5568/FFFFFF?text=' + (user?.name?.charAt(0) || 'U') }}
              style={styles.avatar}
            />
            <View style={styles.onlineStatus} />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, highContrast && { color: '#fff' }]}>{user.name}</Text>
            <Text style={[styles.userUsername, highContrast && { color: 'rgba(255,255,255,0.8)' }]}>@{user.username}</Text>
          </View>
        </View>

        {/* Stats Card */}
        <View style={[styles.statsCard, highContrast && { backgroundColor: '#0A0A0A' }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: highContrast ? '#FFD700' : '#3B82F6' }]}>{user.stats?.totalGamesPlayed || 0}</Text>
              <Text style={[styles.statLabel, highContrast && { color: '#fff' }]}>Games Played</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: highContrast ? '#10B981' : '#10B981' }]}>{user.stats?.totalGamesWon || 0}</Text>
              <Text style={[styles.statLabel, highContrast && { color: '#fff' }]}>Wins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: highContrast ? '#FFD700' : '#F59E0B' }]}>{user.stats?.winRate || 0}%</Text>
              <Text style={[styles.statLabel, highContrast && { color: '#fff' }]}>Win Rate</Text>
            </View>
          </View>

          <View style={styles.winLossRow}>
            <View style={[styles.winLossBadge, { backgroundColor: '#3B82F620' }]}>
              <Ionicons name="trophy" size={16} color="#3B82F6" />
              <Text style={[styles.winLossText, { color: '#3B82F6' }]}>
                {user.stats?.totalGamesWon || 0} Wins
              </Text>
            </View>
            <View style={[styles.winLossBadge, { backgroundColor: '#EF444420' }]}>
              <Ionicons name="close" size={16} color="#EF4444" />
              <Text style={[styles.winLossText, { color: '#EF4444' }]}>
                {user.stats?.totalGamesLost || 0} Losses
              </Text>
            </View>
            <View style={[styles.winLossBadge, { backgroundColor: '#F59E0B20' }]}>
              <Ionicons name="remove" size={16} color="#F59E0B" />
              <Text style={[styles.winLossText, { color: '#F59E0B' }]}>
                {user.stats?.totalGamesDrawn || 0} Draws
              </Text>
            </View>
          </View>

          <View style={styles.streakRow}>
            <View style={styles.streakItem}>
              <Ionicons name="flame" size={16} color="#F59E0B" />
              <Text style={styles.streakText}>
                {user.stats?.currentStreak || 0} Current Streak
              </Text>
            </View>
            <View style={styles.streakItem}>
              <Ionicons name="trophy" size={16} color="#3B82F6" />
              <Text style={styles.streakText}>
                {user.stats?.longestStreak || 0} Best Streak
              </Text>
            </View>
          </View>

          <Text style={styles.autoTrackingNote}>
            📊 Stats automatically updated from game results
          </Text>
        </View>

        {/* Personal Info Chips */}
        <View style={styles.personalInfoRow}>
          <View style={styles.infoChip}>
            <Ionicons name="mail-outline" size={16} color="#666" />
            <Text style={styles.infoChipText}>{user.email || 'No email'}</Text>
          </View>
          <View style={styles.infoChip}>
            <Ionicons name="call-outline" size={16} color="#666" />
            <Text style={styles.infoChipText}>{user.phone || 'No phone'}</Text>
          </View>
          <View style={styles.infoChip}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.infoChipText}>{user.country || 'Nepal'}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={[styles.content, highContrast && { backgroundColor: '#000' }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshAll} />}
      >
        {/* Quick Actions */}
        <View style={[styles.quickActionsSection, highContrast && { backgroundColor: '#0A0A0A' }]}>
          <Text style={[styles.sectionTitle, highContrast && { color: '#fff' }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={[styles.quickActionButton, highContrast && { backgroundColor: '#1A1A1A', borderColor: '#333' }]} onPress={handleFindGames}>
              <Ionicons name="search-outline" size={24} color={highContrast ? '#FFD700' : colors.primary} />
              <Text style={[styles.quickActionText, highContrast && { color: '#fff' }]}>Find Games</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickActionButton, highContrast && { backgroundColor: '#1A1A1A', borderColor: '#333' }]} onPress={handleCreateGame}>
              <Ionicons name="add-circle-outline" size={24} color={highContrast ? '#10B981' : '#10B981'} />
              <Text style={[styles.quickActionText, highContrast && { color: '#fff' }]}>Create Game</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickActionButton, highContrast && { backgroundColor: '#1A1A1A', borderColor: '#333' }]} onPress={handleFindPractice}>
              <Ionicons name="fitness-outline" size={24} color={highContrast ? '#F59E0B' : '#F59E0B'} />
              <Text style={[styles.quickActionText, highContrast && { color: '#fff' }]}>Find Practice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickActionButton, highContrast && { backgroundColor: '#1A1A1A', borderColor: '#333' }]} onPress={() => Alert.alert('Coming Soon', 'Add Sport feature coming soon!')}>
              <Ionicons name="person-add-outline" size={24} color={highContrast ? '#8B5CF6' : '#8B5CF6'} />
              <Text style={[styles.quickActionText, highContrast && { color: '#fff' }]}>Add Sport</Text>
            </TouchableOpacity>
          </View>
        </View>

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
            <TouchableOpacity onPress={handleFindGames}>
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
            onFindGames={handleFindGames}
            onCreateGame={handleCreateGame}
            onFindPractice={handleFindPractice}
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
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    padding: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
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
    ...colors.shadows?.md,
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
    ...colors.shadows?.md,
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
    ...colors.shadows?.md,
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
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...colors.shadows?.sm,
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
    ...colors.shadows?.lg,
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
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
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
});

export default ProfileScreen;
