import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

const { width } = Dimensions.get('window');

const ProfileScreenNew: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'sports' | 'ratings'>('profile');

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

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing will be available soon!');
  };

  const handleAddSport = () => {
    Alert.alert('Add Sport', 'Sport selection will be available soon!');
  };

  const renderProfileHeader = () => (
    <LinearGradient
      colors={['#FF6B6B', '#FF8E8E']}
      style={styles.profileHeader}
    >
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="settings-outline" size={24} color={colors.textLight} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="share-outline" size={24} color={colors.textLight} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Ionicons name="create-outline" size={16} color={colors.textLight} />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileInfo}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={colors.textLight} />
          </View>
          <View style={styles.onlineIndicator} />
        </View>
        
        <Text style={styles.userName}>{user?.name || 'Demo Apple User'}</Text>
        <Text style={styles.userHandle}>@{user?.username || 'demo_apple_user'}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>10</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Created</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>50%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
        </View>

        <View style={styles.personalInfo}>
          <View style={styles.infoChip}>
            <Ionicons name="calendar-outline" size={16} color={colors.textLight} />
            <Text style={styles.infoText}>Age 25</Text>
          </View>
          <View style={styles.infoChip}>
            <Ionicons name="male" size={16} color={colors.textLight} />
            <Text style={styles.infoText}>Gender Male</Text>
          </View>
          <View style={styles.infoChip}>
            <Ionicons name="flag-outline" size={16} color={colors.textLight} />
            <Text style={styles.infoText}>Nationality Not set</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderSportsProfile = () => (
    <View style={styles.sportsProfile}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Sport Profiles</Text>
        <TouchableOpacity style={styles.addSportButton} onPress={handleAddSport}>
          <Text style={styles.addSportText}>+ Add Sport</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sportCard}>
        <View style={[styles.sportCardBorder, { backgroundColor: colors.sportsGreen }]} />
        <View style={styles.sportCardContent}>
          <View style={styles.sportHeader}>
            <View style={styles.sportInfo}>
              <Ionicons name="football" size={20} color={colors.textSecondary} />
              <Text style={styles.sportName}>Soccer</Text>
            </View>
            <View style={styles.sportActions}>
              <TouchableOpacity style={styles.sportActionButton}>
                <Ionicons name="create-outline" size={16} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.sportActionButton}>
                <Ionicons name="trash-outline" size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.sportDetails}>
            <Text style={styles.sportDetail}>Nickname: "Threadz"</Text>
            <Text style={styles.sportDetail}>Positions: RB</Text>
            <Text style={styles.sportDetail}>Play Style: one-touch passer, pace, back-post runs</Text>
            <Text style={styles.sportDetail}>Superpower: through-balls</Text>
            <Text style={styles.sportDetail}>Formats: 11v11</Text>
            <Text style={styles.sportDetail}>Availability: weeknights 7-9</Text>
            <Text style={styles.sportDetail}>Fun Fact: tracks assists like goals</Text>
          </View>
        </View>
      </View>

      <View style={styles.sportCard}>
        <View style={[styles.sportCardBorder, { backgroundColor: colors.sportsOrange }]} />
        <View style={styles.sportCardContent}>
          <View style={styles.sportHeader}>
            <View style={styles.sportInfo}>
              <Ionicons name="basketball" size={20} color={colors.textSecondary} />
              <Text style={styles.sportName}>Basketball</Text>
            </View>
            <View style={styles.sportActions}>
              <TouchableOpacity style={styles.sportActionButton}>
                <Ionicons name="create-outline" size={16} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.sportActionButton}>
                <Ionicons name="trash-outline" size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.sportDetails}>
            <Text style={styles.sportDetail}>Nickname: "Threadz"</Text>
          </View>
        </View>
      </View>

      <View style={styles.hintContainer}>
        <Ionicons name="bulb-outline" size={20} color={colors.textSecondary} />
        <Text style={styles.hintText}>
          We'll recommend games based on your sports and find the nearest ones for you
        </Text>
      </View>
    </View>
  );

  const renderRecentRatings = () => (
    <View style={styles.ratingsSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Ratings</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.ratingsDescription}>
        Reliability is based on: showing up on time, completing games, following rules, and positive feedback from other players.
      </Text>

      <View style={styles.ratingCard}>
        <View style={styles.ratingHeader}>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons key={star} name="star" size={16} color="#FFD700" />
            ))}
          </View>
          <Text style={styles.ratingDate}>1/16/2024</Text>
        </View>
        <Text style={styles.ratingText}>"Great player, very reliable and skilled!"</Text>
        <Text style={styles.ratingGame}>From game: Football at Tudikhel</Text>
        <Text style={styles.ratingUser}>Anonymous User</Text>
      </View>

      <View style={styles.ratingCard}>
        <View style={styles.ratingHeader}>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4].map((star) => (
              <Ionicons key={star} name="star" size={16} color="#FFD700" />
            ))}
            <Ionicons name="star-outline" size={16} color="#FFD700" />
          </View>
          <Text style={styles.ratingDate}>1/21/2024</Text>
        </View>
        <Text style={styles.ratingText}>"Good team player, showed up on time."</Text>
        <Text style={styles.ratingGame}>From game: Basketball at Patan</Text>
        <Text style={styles.ratingUser}>Anonymous User</Text>
      </View>

      <View style={styles.ratingCard}>
        <View style={styles.ratingHeader}>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons key={star} name="star" size={16} color="#FFD700" />
            ))}
          </View>
          <Text style={styles.ratingDate}>1/25/2024</Text>
        </View>
        <Text style={styles.ratingText}>"Excellent sportsmanship and skills!"</Text>
        <Text style={styles.ratingGame}>From game: Cricket at Chitwan</Text>
        <Text style={styles.ratingUser}>Anonymous User</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderProfileHeader()}
        
        <View style={styles.content}>
          {activeTab === 'profile' && renderSportsProfile()}
          {activeTab === 'sports' && renderSportsProfile()}
          {activeTab === 'ratings' && renderRecentRatings()}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home-outline" size={24} color={colors.textSecondary} />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="search-outline" size={24} color={colors.textSecondary} />
          <Text style={styles.navLabel}>Discover</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="add-circle-outline" size={24} color={colors.textSecondary} />
          <Text style={styles.navLabel}>Create</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="chatbubble-outline" size={24} color={colors.textSecondary} />
          <Text style={styles.navLabel}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Ionicons name="person" size={24} color={colors.primary} />
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileHeader: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  editButtonText: {
    color: colors.textLight,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    marginLeft: spacing.xs,
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.textLight,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  userHandle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textLight,
    opacity: 0.8,
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textLight,
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: spacing.md,
  },
  personalInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginHorizontal: spacing.xs,
    marginVertical: spacing.xs,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textLight,
    marginLeft: spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sportsProfile: {
    paddingVertical: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  addSportButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  addSportText: {
    color: colors.textLight,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  sportCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  sportCardBorder: {
    width: 4,
  },
  sportCardContent: {
    flex: 1,
    padding: spacing.lg,
  },
  sportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportName: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  sportActions: {
    flexDirection: 'row',
  },
  sportActionButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  sportDetails: {
    gap: spacing.xs,
  },
  sportDetail: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  hintText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  ratingsSection: {
    paddingVertical: spacing.lg,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  ratingsDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  ratingCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingDate: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  ratingText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  ratingGame: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  ratingUser: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  activeNavItem: {
    // Active state styling
  },
  navLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  activeNavLabel: {
    color: colors.primary,
  },
});

export default ProfileScreenNew;
