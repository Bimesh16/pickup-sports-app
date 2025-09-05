import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

const { width } = Dimensions.get('window');

const HomeScreenNew: React.FC = () => {
  const { user } = useAuthStore();
  const [featuredGames] = useState([
    {
      id: '1',
      sport: 'FUTSAL',
      organizer: 'Demo Organizer',
      level: 'INTERMEDIATE',
      distance: '2.5km',
      title: 'Evening Futsal League',
      time: 'Tomorrow',
      location: 'Kathmandu...',
      players: '7/10',
      spotsLeft: '3 spots left',
      price: 'Rs. 200',
      icon: 'football',
      color: colors.sportsGreen,
    },
    {
      id: '2',
      sport: 'BASKETBALL',
      organizer: 'Basketball Pro',
      level: 'ADVANCED',
      distance: '1.2km',
      title: 'Morning Basketball',
      time: '02:13 PM',
      location: 'Basketball C...',
      players: '8/10',
      spotsLeft: '2 spots left',
      price: 'Free',
      icon: 'basketball',
      color: colors.sportsOrange,
    },
    {
      id: '3',
      sport: 'CRICKET',
      organizer: 'Cricket Club',
      level: 'INTERMEDIATE',
      distance: '5.0km',
      title: 'Weekend Cricket Match',
      time: 'Sep 8',
      location: 'Cricket Gro...',
      players: '18/22',
      spotsLeft: '4 spots left',
      price: 'Rs. 500',
      icon: 'baseball',
      color: '#FFD700',
    },
  ]);

  const quickActions = [
    {
      id: '1',
      title: 'Find Games',
      icon: 'search',
      color: '#4A90E2',
      onPress: () => console.log('Find Games'),
    },
    {
      id: '2',
      title: 'Create Game',
      icon: 'add-circle',
      color: colors.success,
      onPress: () => console.log('Create Game'),
    },
    {
      id: '3',
      title: 'My Games',
      icon: 'calendar',
      color: '#FF9800',
      onPress: () => console.log('My Games'),
    },
    {
      id: '4',
      title: 'Chat',
      icon: 'chatbubble',
      color: '#E91E63',
      onPress: () => console.log('Chat'),
    },
  ];

  const renderHeader = () => (
    <LinearGradient
      colors={['#4A90E2', '#E91E63']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.greeting}>
            Namaste, {user?.name || 'Demo Apple User'}! 🙏
          </Text>
          <Text style={styles.subtitle}>Ready for your next game?</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person" size={24} color={colors.textLight} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickActionButton}
            onPress={action.onPress}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
              <Ionicons name={action.icon as any} size={24} color={colors.textLight} />
            </View>
            <Text style={styles.quickActionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFeaturedGames = () => (
    <View style={styles.featuredGamesSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Games</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gamesScrollContent}
      >
        {featuredGames.map((game) => (
          <View key={game.id} style={styles.gameCard}>
            <View style={styles.gameCardHeader}>
              <View style={styles.gameInfo}>
                <Ionicons name={game.icon as any} size={20} color={colors.textLight} />
                <View style={styles.gameTitleContainer}>
                  <Text style={styles.gameSport}>{game.sport}</Text>
                  <Text style={styles.gameOrganizer}>{game.organizer}</Text>
                </View>
              </View>
              <View style={[styles.gameLevel, { backgroundColor: game.color }]}>
                <Ionicons name="star" size={12} color={colors.textLight} />
                <Text style={styles.gameLevelText}>Featured {game.level}</Text>
              </View>
            </View>
            
            <View style={styles.gameDistance}>
              <Text style={styles.gameDistanceText}>{game.distance}</Text>
            </View>
            
            <Text style={styles.gameTitle}>{game.title}</Text>
            
            <View style={styles.gameDetails}>
              <View style={styles.gameDetailItem}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.gameDetailText}>{game.time}</Text>
              </View>
              <View style={styles.gameDetailItem}>
                <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.gameDetailText}>{game.location}</Text>
              </View>
              <View style={styles.gameDetailItem}>
                <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.gameDetailText}>
                  {game.players} <Text style={styles.spotsLeftText}>{game.spotsLeft}</Text>
                </Text>
              </View>
            </View>
            
            <View style={styles.gameFooter}>
              <Text style={styles.gamePrice}>{game.price}</Text>
              <TouchableOpacity style={styles.joinButton}>
                <Text style={styles.joinButtonText}>Join</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderBottomNavigation = () => (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
        <Ionicons name="home" size={24} color={colors.primary} />
        <Text style={[styles.navLabel, styles.activeNavLabel]}>Home</Text>
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
      <TouchableOpacity style={styles.navItem}>
        <Ionicons name="person-outline" size={24} color={colors.textSecondary} />
        <Text style={styles.navLabel}>Profile</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderHeader()}
        <View style={styles.content}>
          {renderQuickActions()}
          {renderFeaturedGames()}
        </View>
      </ScrollView>
      {renderBottomNavigation()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textLight,
    opacity: 0.9,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  quickActionsSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textLight,
    marginBottom: spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickActionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textLight,
    textAlign: 'center',
  },
  featuredGamesSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  gamesScrollContent: {
    paddingRight: spacing.lg,
  },
  gameCard: {
    width: width * 0.8,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginRight: spacing.md,
    ...colors.shadows?.md,
  },
  gameCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  gameInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  gameTitleContainer: {
    marginLeft: spacing.sm,
  },
  gameSport: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.textLight,
  },
  gameOrganizer: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textLight,
    opacity: 0.8,
  },
  gameLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  gameLevelText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.textLight,
    marginLeft: spacing.xs,
  },
  gameDistance: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  gameDistanceText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.textLight,
  },
  gameTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  gameDetails: {
    marginBottom: spacing.lg,
  },
  gameDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  gameDetailText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textLight,
    marginLeft: spacing.sm,
    opacity: 0.9,
  },
  spotsLeftText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gamePrice: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textLight,
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  joinButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.textLight,
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

export default HomeScreenNew;
