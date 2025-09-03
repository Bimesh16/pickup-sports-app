import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/MainNavigator';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import { colors, typography, spacing, shadows } from '@/constants/theme';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout } = useAuthStore();
  const { myGames } = useGameStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        },
      ]
    );
  };

  const getSkillLevelNepali = (skillLevel: string) => {
    switch (skillLevel) {
      case 'BEGINNER': return 'शुरुवाती';
      case 'INTERMEDIATE': return 'मध्यम';
      case 'ADVANCED': return 'उन्नत';
      default: return skillLevel;
    }
  };

  const upcomingGames = myGames.filter(game => game.status === 'UPCOMING').length;
  const completedGames = myGames.filter(game => game.status === 'COMPLETED').length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.titleNepali}>प्रोफाइल</Text>
        
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={[styles.profileCard, shadows.md]}>
        <View style={styles.avatarContainer}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.firstName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          
          <TouchableOpacity style={styles.editAvatarButton}>
            <Ionicons name="camera-outline" size={16} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          <View style={styles.skillBadge}>
            <Text style={styles.skillText}>
              {user?.skillLevel} • {getSkillLevelNepali(user?.skillLevel || '')}
            </Text>
          </View>

          {user?.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={colors.warning} />
              <Text style={styles.ratingText}>
                {user.rating.toFixed(1)} ({user.ratingCount || 0} reviews)
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Stats */}
      <View style={[styles.statsContainer, shadows.sm]}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{myGames.length}</Text>
          <Text style={styles.statLabel}>Total Games</Text>
          <Text style={styles.statLabelNepali}>कुल खेलहरू</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{upcomingGames}</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
          <Text style={styles.statLabelNepali}>आउँदै गरेका</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completedGames}</Text>
          <Text style={styles.statLabel}>Completed</Text>
          <Text style={styles.statLabelNepali}>सम्पन्न</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={[styles.menuContainer, shadows.sm]}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.menuItemTitle}>Edit Profile</Text>
              <Text style={styles.menuItemTitleNepali}>प्रोफाइल सम्पादन गर्नुहोस्</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: colors.secondary + '20' }]}>
              <Ionicons name="card-outline" size={20} color={colors.secondary} />
            </View>
            <View>
              <Text style={styles.menuItemTitle}>Payment History</Text>
              <Text style={styles.menuItemTitleNepali}>भुक्तानी इतिहास</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="trophy-outline" size={20} color={colors.success} />
            </View>
            <View>
              <Text style={styles.menuItemTitle}>Achievements</Text>
              <Text style={styles.menuItemTitleNepali}>उपलब्धिहरू</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="people-outline" size={20} color={colors.warning} />
            </View>
            <View>
              <Text style={styles.menuItemTitle}>Friends</Text>
              <Text style={styles.menuItemTitleNepali}>साथीहरू</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: colors.info + '20' }]}>
              <Ionicons name="notifications-outline" size={20} color={colors.info} />
            </View>
            <View>
              <Text style={styles.menuItemTitle}>Notifications</Text>
              <Text style={styles.menuItemTitleNepali}>सूचनाहरू</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={[styles.appInfoContainer, shadows.sm]}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: colors.textSecondary + '20' }]}>
              <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />
            </View>
            <Text style={styles.menuItemTitle}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: colors.textSecondary + '20' }]}>
              <Ionicons name="shield-outline" size={20} color={colors.textSecondary} />
            </View>
            <Text style={styles.menuItemTitle}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: colors.textSecondary + '20' }]}>
              <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
            </View>
            <Text style={styles.menuItemTitle}>Terms of Service</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        style={[styles.logoutButton, shadows.sm]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.logoutButtonText}>Logout</Text>
        <Text style={styles.logoutButtonTextNepali}>बाहिर निस्कनुहोस्</Text>
      </TouchableOpacity>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Pickup Sports Nepal v1.0.0</Text>
        <Text style={styles.versionTextNepali}>पिकअप खेलकुद नेपाल</Text>
        <Text style={styles.madeInNepal}>Made with ❤️ for Nepal</Text>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    flex: 1,
  },
  titleNepali: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    position: 'absolute',
    top: spacing['2xl'] + 32,
    left: spacing.xl,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
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
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.onPrimary,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  skillBadge: {
    backgroundColor: colors.secondary + '20',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginBottom: spacing.md,
  },
  skillText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.secondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: spacing.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  statLabelNepali: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  appInfoContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuItemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  menuItemTitleNepali: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.error + '20',
  },
  logoutButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
    marginLeft: spacing.sm,
  },
  logoutButtonTextNepali: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    marginLeft: spacing.sm,
    opacity: 0.8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  versionText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  versionTextNepali: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    marginTop: 2,
  },
  madeInNepal: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.sm,
  },
  bottomPadding: {
    height: spacing['4xl'],
  },
});