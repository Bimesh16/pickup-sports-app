import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Avatar, Chip, Divider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import ScrollContainer from '../../components/common/ScrollContainer';
import { useModal } from '../../components/common/AdvancedModal';
import StatsGrid from '../../components/profile/StatsGrid';
import GameHistoryList from '../../components/profile/GameHistoryList';
import AchievementsList from '../../components/profile/AchievementsList';

import { useAuthUser, useAuthActions } from '../../stores/authStore';
import { userAPI } from '../../services/api';
import { NepalColors, commonStyles } from '../../styles/theme';
import { RootStackParamList, Achievement } from '../../types';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * Profile Screen with User Stats and Achievements
 */
const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { showModal, showConfirmDialog } = useModal();
  
  // Store hooks
  const user = useAuthUser();
  const { logout } = useAuthActions();

  // Animation values
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);

  // Fetch user stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: () => userAPI.getMyStats(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Handle logout
  const handleLogout = useCallback(() => {
    showConfirmDialog(
      'Sign Out',
      'Are you sure you want to sign out?',
      async () => {
        try {
          await logout();
        } catch (error) {
          Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
      }
    );
  }, [showConfirmDialog, logout]);

  // Handle settings navigation
  const handleSettings = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  // Show edit profile modal
  const showEditProfile = useCallback(() => {
    showModal(
      <EditProfileForm user={user} onSave={(updates) => {
        // Handle profile updates
        console.log('Profile updates:', updates);
      }} />,
      {
        title: 'Edit Profile',
        dismissible: true,
        animationType: 'slide',
        position: 'center',
      }
    );
  }, [showModal, user]);

  // Show achievements modal
  const showAchievements = useCallback(() => {
    showModal(
      <AchievementsList userId={user?.id || 0} />,
      {
        title: 'Your Achievements',
        dismissible: true,
        animationType: 'scale',
      }
    );
  }, [showModal, user]);

  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Header animated style
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [0, 100], [1, 0.95]);
    const opacity = interpolate(scrollY.value, [0, 100], [1, 0.8]);
    
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  if (!user) return null;

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, { paddingTop: insets.top + 16 }, headerAnimatedStyle]}>
        <LinearGradient
          colors={[NepalColors.primaryBlue, NepalColors.primaryCrimson]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        
        <View style={styles.headerContent}>
          {/* Settings Button */}
          <TouchableOpacity
            style={styles.headerAction}
            onPress={handleSettings}
            activeOpacity={0.7}
          >
            <Ionicons name="settings" size={24} color={NepalColors.primaryWhite} />
          </TouchableOpacity>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <TouchableOpacity onPress={showEditProfile} activeOpacity={0.8}>
              <Avatar.Image
                size={80}
                source={{ uri: user.profilePictureUrl || 'https://via.placeholder.com/80' }}
                style={styles.avatar}
              />
              <View style={styles.editBadge}>
                <Ionicons name="pencil" size={12} color={NepalColors.primaryWhite} />
              </View>
            </TouchableOpacity>
            
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.userHandle}>@{user.username}</Text>
            
            {/* Verification Badge */}
            {user.isVerified && (
              <View style={styles.verificationBadge}>
                <Ionicons name="checkmark-circle" size={16} color={NepalColors.success} />
                <Text style={styles.verifiedText}>Verified Player</Text>
              </View>
            )}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.headerAction}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out" size={24} color={NepalColors.primaryWhite} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Scrollable Content */}
      <ScrollContainer
        onScroll={scrollHandler}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Bio */}
        {user.bio && (
          <Card style={styles.bioCard}>
            <Card.Content>
              <Text style={styles.bioTitle}>About Me</Text>
              <Text style={styles.bioText}>{user.bio}</Text>
            </Card.Content>
          </Card>
        )}

        {/* Quick Stats */}
        <StatsGrid stats={stats} loading={statsLoading} />

        {/* Sports Preferences */}
        <Card style={styles.preferencesCard}>
          <Card.Content>
            <Text style={styles.cardTitle}>Preferred Sports</Text>
            <View style={styles.sportsChips}>
              {user.preferredSports?.map((sport, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  style={styles.sportChip}
                  textStyle={styles.sportChipText}
                >
                  {sport}
                </Chip>
              )) || (
                <Text style={styles.noSportsText}>No sports preferences set</Text>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Achievements Preview */}
        <Card style={styles.achievementsCard}>
          <Card.Content>
            <View style={styles.achievementsHeader}>
              <Text style={styles.cardTitle}>Recent Achievements</Text>
              <TouchableOpacity
                onPress={showAchievements}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {/* Mock achievements */}
            <View style={styles.achievementsPreview}>
              <AchievementBadge
                icon="trophy"
                name="First Game"
                color={NepalColors.warning}
              />
              <AchievementBadge
                icon="people"
                name="Team Player"
                color={NepalColors.success}
              />
              <AchievementBadge
                icon="location"
                name="Explorer"
                color={NepalColors.info}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Recent Games */}
        <Card style={styles.gamesCard}>
          <Card.Content>
            <View style={styles.gamesHeader}>
              <Text style={styles.cardTitle}>Recent Games</Text>
              <TouchableOpacity
                onPress={() => {
                  // Navigate to full game history
                  Alert.alert('Games', 'Navigate to full game history');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <GameHistoryList userId={user.id} limit={3} />
          </Card.Content>
        </Card>

        {/* Profile Actions */}
        <View style={styles.actionsContainer}>
          <ProfileAction
            icon="person-circle"
            title="Edit Profile"
            subtitle="Update your information"
            onPress={showEditProfile}
          />
          
          <ProfileAction
            icon="notifications"
            title="Notification Settings"
            subtitle="Manage your notifications"
            onPress={() => Alert.alert('Settings', 'Notification settings')}
          />
          
          <ProfileAction
            icon="shield-checkmark"
            title="Privacy & Security"
            subtitle="Manage your privacy settings"
            onPress={() => Alert.alert('Settings', 'Privacy settings')}
          />
          
          <ProfileAction
            icon="help-circle"
            title="Help & Support"
            subtitle="Get help and contact support"
            onPress={() => Alert.alert('Help', 'Help and support')}
          />
        </View>
      </ScrollContainer>
    </View>
  );
};

/**
 * Achievement Badge Component
 */
interface AchievementBadgeProps {
  icon: keyof typeof Ionicons.glyphMap;
  name: string;
  color: string;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ icon, name, color }) => (
  <View style={styles.achievementBadge}>
    <View style={[styles.achievementIcon, { backgroundColor: color }]}>
      <Ionicons name={icon} size={20} color={NepalColors.primaryWhite} />
    </View>
    <Text style={styles.achievementName}>{name}</Text>
  </View>
);

/**
 * Profile Action Item Component
 */
interface ProfileActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}

const ProfileAction: React.FC<ProfileActionProps> = ({ icon, title, subtitle, onPress }) => {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={styles.actionItem}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.actionIcon}>
          <Ionicons name={icon} size={24} color={NepalColors.primaryCrimson} />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={NepalColors.onSurfaceVariant} />
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * Edit Profile Form Component
 */
interface EditProfileFormProps {
  user: any;
  onSave: (updates: any) => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ user, onSave }) => (
  <View style={styles.editForm}>
    <Text style={styles.editFormText}>Profile editing form would go here</Text>
    <TouchableOpacity style={styles.saveButton} onPress={() => onSave({})}>
      <Text style={styles.saveButtonText}>Save Changes</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  header: {
    paddingHorizontal: commonStyles.padding.large,
    paddingBottom: commonStyles.padding.xl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerAction: {
    padding: commonStyles.padding.small,
    borderRadius: commonStyles.borderRadius.small,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileInfo: {
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    borderWidth: 3,
    borderColor: NepalColors.primaryWhite,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: NepalColors.primaryCrimson,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: NepalColors.primaryWhite,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: NepalColors.primaryWhite,
    marginTop: commonStyles.padding.medium,
    textAlign: 'center',
  },
  userHandle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.primaryWhite,
    opacity: 0.9,
    marginTop: 4,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: commonStyles.padding.medium,
    paddingVertical: commonStyles.padding.small,
    borderRadius: commonStyles.borderRadius.large,
    marginTop: commonStyles.padding.small,
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.primaryWhite,
  },
  scrollContent: {
    paddingHorizontal: commonStyles.padding.large,
    paddingBottom: commonStyles.padding.xl,
  },
  bioCard: {
    backgroundColor: NepalColors.surface,
    marginBottom: commonStyles.padding.large,
  },
  bioTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    marginBottom: commonStyles.padding.small,
  },
  bioText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    lineHeight: 20,
  },
  preferencesCard: {
    backgroundColor: NepalColors.surface,
    marginBottom: commonStyles.padding.large,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    marginBottom: commonStyles.padding.medium,
  },
  sportsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: commonStyles.padding.small,
  },
  sportChip: {
    backgroundColor: NepalColors.primaryCrimson + '20',
    borderColor: NepalColors.primaryCrimson,
  },
  sportChipText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.primaryCrimson,
  },
  noSportsText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  achievementsCard: {
    backgroundColor: NepalColors.surface,
    marginBottom: commonStyles.padding.large,
  },
  achievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: commonStyles.padding.medium,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryCrimson,
  },
  achievementsPreview: {
    flexDirection: 'row',
    gap: commonStyles.padding.large,
  },
  achievementBadge: {
    alignItems: 'center',
    flex: 1,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: commonStyles.padding.small,
  },
  achievementName: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.onSurface,
    textAlign: 'center',
  },
  gamesCard: {
    backgroundColor: NepalColors.surface,
    marginBottom: commonStyles.padding.large,
  },
  gamesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: commonStyles.padding.medium,
  },
  actionsContainer: {
    gap: commonStyles.padding.small,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NepalColors.surface,
    paddingHorizontal: commonStyles.padding.large,
    paddingVertical: commonStyles.padding.medium,
    borderRadius: commonStyles.borderRadius.medium,
    ...commonStyles.shadows.small,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: NepalColors.primaryCrimson + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: commonStyles.padding.medium,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
  },
  actionSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    marginTop: 2,
  },
  editForm: {
    alignItems: 'center',
    padding: commonStyles.padding.large,
  },
  editFormText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurface,
    marginBottom: commonStyles.padding.large,
  },
  saveButton: {
    backgroundColor: NepalColors.primaryCrimson,
    paddingHorizontal: commonStyles.padding.xl,
    paddingVertical: commonStyles.padding.medium,
    borderRadius: commonStyles.borderRadius.medium,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryWhite,
  },
});

export default ProfileScreen;