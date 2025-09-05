import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import { useLocationStore } from '@/stores/locationStore';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Game } from '@/types';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { nearbyGames, featuredGames, fetchNearbyGames, fetchFeaturedGames } = useGameStore();
  const { location, requestLocationPermission } = useLocationStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      await requestLocationPermission();
      await Promise.all([
        fetchNearbyGames(),
        fetchFeaturedGames(),
      ]);
    } catch (error) {
      console.error('Error initializing home data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchNearbyGames(),
        fetchFeaturedGames(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleJoinGame = (gameId: string) => {
    Alert.alert('Join Game', `Join game ${gameId}?`);
  };

  const handleCreateGame = () => {
    Alert.alert('Create Game', 'Create new game');
  };

  const handleFindGames = () => {
    Alert.alert('Find Games', 'Find nearby games');
  };

  const handleMyGames = () => {
    Alert.alert('My Games', 'View my games');
  };

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
        <TouchableOpacity style={styles.quickActionButton} onPress={handleFindGames}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#4A90E2' }]}>
            <Ionicons name="search" size={24} color={colors.textLight} />
          </View>
          <Text style={styles.quickActionText}>Find Games</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton} onPress={handleCreateGame}>
          <View style={[styles.quickActionIcon, { backgroundColor: colors.success }]}>
            <Ionicons name="add-circle" size={24} color={colors.textLight} />
          </View>
          <Text style={styles.quickActionText}>Create Game</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton} onPress={handleMyGames}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#FF9800' }]}>
            <Ionicons name="calendar" size={24} color={colors.textLight} />
          </View>
          <Text style={styles.quickActionText}>My Games</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#E91E63' }]}>
            <Ionicons name="chatbubble" size={24} color={colors.textLight} />
          </View>
          <Text style={styles.quickActionText}>Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderGameCard = (game: Game) => (
    <View key={game.id} style={styles.gameCard}>
      <View style={styles.gameCardHeader}>
        <View style={styles.gameInfo}>
          <Ionicons name="football" size={20} color={colors.textLight} />
          <View style={styles.gameTitleContainer}>
            <Text style={styles.gameSport}>{game.sport}</Text>
            <Text style={styles.gameOrganizer}>Demo Organizer</Text>
          </View>
        </View>
        <View style={[styles.gameLevel, { backgroundColor: colors.sportsGreen }]}>
          <Ionicons name="star" size={12} color={colors.textLight} />
          <Text style={styles.gameLevelText}>Featured INTERMEDIATE</Text>
        </View>
      </View>
      
      <View style={styles.gameDistance}>
        <Text style={styles.gameDistanceText}>2.5km</Text>
      </View>
      
      <Text style={styles.gameTitle}>{game.title}</Text>
      
      <View style={styles.gameDetails}>
        <View style={styles.gameDetailItem}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.gameDetailText}>
            {new Date(game.dateTime).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.gameDetailItem}>
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.gameDetailText}>{game.location.address}</Text>
        </View>
        <View style={styles.gameDetailItem}>
          <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.gameDetailText}>
            {game.currentPlayers}/{game.maxPlayers} players
          </Text>
        </View>
      </View>
      
      <View style={styles.gameFooter}>
        <Text style={styles.gamePrice}>
          {game.cost > 0 ? `Rs. ${game.cost}` : 'Free'}
        </Text>
        <TouchableOpacity 
          style={styles.joinButton}
          onPress={() => handleJoinGame(game.id)}
        >
          <Text style={styles.joinButtonText}>Join</Text>
        </TouchableOpacity>
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
      
      {featuredGames.length > 0 ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gamesScrollContent}
        >
          {featuredGames.map(renderGameCard)}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="star-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No featured games</Text>
          <Text style={styles.emptySubtext}>Check back later for featured games</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        <View style={styles.content}>
          {renderQuickActions()}
          {renderFeaturedGames()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default HomeScreen;