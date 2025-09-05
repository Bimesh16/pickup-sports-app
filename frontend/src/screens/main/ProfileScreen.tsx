import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import ScoutingReportEditor from '@/components/profile/ScoutingReportEditor';
import MultiSportProfile from '@/components/profile/MultiSportProfile';
import ScoutingReport from '@/components/profile/ScoutingReport';
import AchievementSystem from '@/components/profile/AchievementSystem';
import PerformanceInsights from '@/components/profile/PerformanceInsights';
import EditProfileModal from '@/components/profile/EditProfileModal';

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
  const [editingProfile, setEditingProfile] = useState<ScoutingReportData | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');

  // Mock user data - replace with actual API call
  useEffect(() => {
    setUser({
      id: '1',
      name: 'Demo Apple User',
      username: 'demo_apple_user',
      email: 'demo@example.com',
      phone: '+1234567890',
      gender: 'Male',
      nationality: 'Nepali',
      birthDate: '1990-01-01',
      country: 'Nepal',
      bio: 'Passionate about sports and always ready to play! Love football and basketball.',
      avatar: 'https://via.placeholder.com/80x80/4A5568/FFFFFF?text=DA',
      stats: {
        totalGamesPlayed: 10,
        totalGamesWon: 5,
        totalGamesLost: 3,
        totalGamesDrawn: 2,
        currentStreak: 0,
        longestStreak: 3,
        winRate: 50,
      },
    });
    setBioText('Passionate about sports and always ready to play! Love football and basketball.');
  }, []);

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

  const handleSaveProfile = (updatedUser: User) => {
    setUser(updatedUser);
    setShowEditProfile(false);
  };

  const handleSaveBio = () => {
    if (user) {
      setUser({ ...user, bio: bioText });
    }
    setIsEditingBio(false);
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

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Magenta Background */}
      <LinearGradient
        colors={['#FF6B6B', '#FF8E8E']}
        style={styles.header}
      >
        {/* Top Action Buttons */}
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton} onPress={() => setShowEditProfile(true)}>
            <Ionicons name="create-outline" size={16} color="white" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user.avatar || 'https://via.placeholder.com/80x80/4A5568/FFFFFF?text=' + (user?.name?.charAt(0) || 'U') }}
              style={styles.avatar}
            />
            <View style={styles.onlineStatus} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userUsername}>@{user.username}</Text>
          </View>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#3B82F6' }]}>{user.stats?.totalGamesPlayed || 0}</Text>
              <Text style={styles.statLabel}>Games</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.stats?.totalGamesWon || 0}</Text>
              <Text style={styles.statLabel}>Created</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#FF6B6B' }]}>{user.stats?.winRate || 0}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
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
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.infoChipText}>Age 25</Text>
          </View>
          <View style={styles.infoChip}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.infoChipText}>Gender {user.gender || 'Male'}</Text>
          </View>
          <View style={styles.infoChip}>
            <Ionicons name="flag-outline" size={16} color="#666" />
            <Text style={styles.infoChipText}>Nationality {user.nationality || 'Not set'}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Bio Section */}
        <View style={styles.bioSection}>
          <View style={styles.bioHeader}>
            <Text style={styles.bioTitle}>About Me</Text>
            <TouchableOpacity onPress={() => setIsEditingBio(true)}>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
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
                  <Text style={styles.bioCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveBio} style={styles.bioSaveButton}>
                  <Text style={styles.bioSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.bioText}>
              {user.bio || 'No bio yet. Tap the edit icon to add one!'}
            </Text>
          )}
        </View>

        {/* Sports Profiles */}
        <MultiSportProfile
          sportProfiles={sportProfiles}
          onAddSport={() => setShowScoutingEditor(true)}
          onEditSport={handleEditSportProfile}
          onRemoveSport={handleRemoveSportProfile}
        />

        {/* Achievements */}
        {user.stats && (
          <AchievementSystem userStats={user.stats} />
        )}

        {/* Performance Insights */}
        {user.stats && (
          <PerformanceInsights
            userStats={user.stats}
            onFindGames={handleFindGames}
            onCreateGame={handleCreateGame}
            onFindPractice={handleFindPractice}
          />
        )}
      </ScrollView>

      {/* Modals */}
      <ScoutingReportEditor
        visible={showScoutingEditor}
        onClose={() => {
          setShowScoutingEditor(false);
          setEditingProfile(null);
        }}
        onSave={handleSaveSportProfile}
        editingProfile={editingProfile}
        onUpdateProfile={handleUpdateSportProfile}
      />

      <EditProfileModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onSave={handleSaveProfile}
        user={user}
      />
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
});

export default ProfileScreen;