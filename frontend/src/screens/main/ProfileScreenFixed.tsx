import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NepalColors, FontSizes, Spacing } from '../../constants/theme';
import ScoutingReportEditor from '../../components/profile/ScoutingReportEditor';
import MultiSportProfile from '../../components/profile/MultiSportProfile';
import ScoutingReport from '../../components/profile/ScoutingReport';
import AchievementSystem from '../../components/profile/AchievementSystem';
import PerformanceInsights from '../../components/profile/PerformanceInsights';
import EditProfileModal from '../../components/profile/EditProfileModal';

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

const ProfileScreenFixed: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sportProfiles, setSportProfiles] = useState<ScoutingReportData[]>([]);
  const [showScoutingEditor, setShowScoutingEditor] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ScoutingReportData | null>(null);

  // Mock user data - replace with actual API call
  useEffect(() => {
    setUser({
      id: '1',
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      phone: '+1234567890',
      gender: 'Male',
      nationality: 'Nepali',
      birthDate: '1990-01-01',
      country: 'Nepal',
      bio: 'Passionate about sports and always ready to play!',
      avatar: 'https://via.placeholder.com/80x80/4A5568/FFFFFF?text=JD',
      stats: {
        totalGamesPlayed: 25,
        totalGamesWon: 18,
        totalGamesLost: 5,
        totalGamesDrawn: 2,
        currentStreak: 3,
        longestStreak: 8,
        winRate: 72,
      },
    });
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
      <LinearGradient
        colors={[NepalColors.primary, NepalColors.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
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
              {user.bio && (
                <Text style={styles.userBio}>{user.bio}</Text>
              )}
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowEditProfile(true)}
          >
            <Ionicons name="create-outline" size={16} color="#fff" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.stats?.totalGamesPlayed || 0}</Text>
              <Text style={styles.statLabel}>Games Played</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.stats?.totalGamesWon || 0}</Text>
              <Text style={styles.statLabel}>Games Created</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.stats?.winRate || 0}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
          </View>

          <View style={styles.winLossRow}>
            <View style={[styles.winLossBadge, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="trophy" size={16} color="#10B981" />
              <Text style={[styles.winLossText, { color: '#10B981' }]}>
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
                Current Streak: {user.stats?.currentStreak || 0}
              </Text>
            </View>
            <View style={styles.streakItem}>
              <Ionicons name="trophy" size={16} color="#3B82F6" />
              <Text style={styles.streakText}>
                Best Streak: {user.stats?.longestStreak || 0}
              </Text>
            </View>
          </View>

          <Text style={styles.autoTrackingNote}>
            📊 Stats automatically updated from game results
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <MultiSportProfile
          sportProfiles={sportProfiles}
          onAddSport={() => setShowScoutingEditor(true)}
          onEditSport={handleEditSportProfile}
          onRemoveSport={handleRemoveSportProfile}
        />

        {user.stats && (
          <AchievementSystem userStats={user.stats} />
        )}

        {user.stats && (
          <PerformanceInsights
            userStats={user.stats}
            onFindGames={handleFindGames}
            onCreateGame={handleCreateGame}
            onFindPractice={handleFindPractice}
          />
        )}
      </ScrollView>

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
    backgroundColor: NepalColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: NepalColors.background,
  },
  loadingText: {
    fontSize: FontSizes.lg,
    color: NepalColors.text,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
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
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userUsername: {
    fontSize: FontSizes.md,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userBio: {
    fontSize: FontSizes.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
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
    fontSize: FontSizes.sm,
    color: '#fff',
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
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
    fontSize: FontSizes['2xl'],
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
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
    fontSize: FontSizes.sm,
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
    fontSize: FontSizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  autoTrackingNote: {
    fontSize: FontSizes.xs,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
    padding: 20,
  },
});

export default ProfileScreenFixed;
