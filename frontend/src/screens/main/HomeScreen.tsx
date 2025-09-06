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
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import Shimmer from '@/components/common/Shimmer';
import { joinGame } from '@/services/games';
import { selectionAsync, impactAsync } from '@/services/haptics';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { useUIStore } from '@/stores/uiStore';
import { Game } from '@/types';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const { nearbyGames, featuredGames, fetchNearbyGames, fetchFeaturedGames, isLoading } = useGameStore();
  const { rtlEnabled, highContrast } = useUIStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
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

  const handleJoinGame = async (gameId: string) => {
    try {
      const res = await joinGame(gameId);
      if (res.ok) { await impactAsync('light'); Alert.alert('Joined', 'You have joined the game'); }
      else Alert.alert('Error', res.data?.message || 'Failed to join');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to join');
    }
  };

  const handleCreateGame = async () => {
    await selectionAsync();
    Alert.alert('Create Game', 'Create new game');
  };

  const handleFindGames = async () => {
    await selectionAsync();
    Alert.alert('Find Games', 'Find nearby games');
  };

  const handleMyGames = async () => {
    await selectionAsync();
    Alert.alert('My Games', 'View my games');
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#4A90E2', '#E91E63']}
      style={styles.header}
    >
      <View style={[styles.headerContent, rtlEnabled && { flexDirection: 'row-reverse' }]}>
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
        <TouchableOpacity style={[styles.quickActionButton, highContrast && { borderColor: '#333', borderWidth: 1 }]} onPress={handleFindGames}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#4A90E2' }]}>
            <Ionicons name="search" size={24} color={colors.textLight} />
          </View>
          <Text style={[styles.quickActionText, highContrast && { color: '#fff' }]}>Find Games</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.quickActionButton, highContrast && { borderColor: '#333', borderWidth: 1 }]} onPress={handleCreateGame}>
          <View style={[styles.quickActionIcon, { backgroundColor: colors.success }]}>
            <Ionicons name="add-circle" size={24} color={colors.textLight} />
          </View>
          <Text style={[styles.quickActionText, highContrast && { color: '#fff' }]}>Create Game</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.quickActionButton, highContrast && { borderColor: '#333', borderWidth: 1 }]} onPress={handleMyGames}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#FF9800' }]}>
            <Ionicons name="calendar" size={24} color={colors.textLight} />
          </View>
          <Text style={[styles.quickActionText, highContrast && { color: '#fff' }]}>My Games</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.quickActionButton, highContrast && { borderColor: '#333', borderWidth: 1 }]}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#E91E63' }]}>
            <Ionicons name="chatbubble" size={24} color={colors.textLight} />
          </View>
          <Text style={[styles.quickActionText, highContrast && { color: '#fff' }]}>Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderGameCard = (game: any) => (
    <View key={game.id} style={[styles.gameCard, highContrast && styles.gameCardHC]}>
      <View style={styles.gameCardHeader}>
        <View style={styles.gameInfo}>
          <Ionicons name="football" size={20} color={colors.textLight} />
          <View style={styles.gameTitleContainer}>
            <Text style={[styles.gameSport, highContrast && { color: '#FFD700' }]}>{game.sport}</Text>
            <Text style={[styles.gameOrganizer, highContrast && { color: '#E5E7EB' }]}>Demo Organizer</Text>
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
      
      <Text style={[styles.gameTitle, highContrast && { color: '#FFFFFF' }]}>{game.title}</Text>
      
      <View style={styles.gameDetails}>
        <View style={styles.gameDetailItem}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.gameDetailText, highContrast && { color: '#E5E7EB' }]}>
            {new Date(game.dateTime || game.time || game.date).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.gameDetailItem}>
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.gameDetailText, highContrast && { color: '#E5E7EB' }]}>
            {(game.location && game.location.address) || 
             (game.location && typeof game.location === 'string' ? game.location : '') || 
             'Unknown'}
          </Text>
        </View>
        <View style={styles.gameDetailItem}>
          <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.gameDetailText, highContrast && { color: '#E5E7EB' }]}>
            {game.currentPlayers}/{game.maxPlayers} players
          </Text>
        </View>
      </View>

      <View style={styles.gameFooter}>
        <Text style={[styles.gamePrice, highContrast && { color: '#FFD700' }]}>
          {game.cost > 0 ? `Rs. ${game.cost}` : 'Free'}
        </Text>
        <TouchableOpacity 
          style={[styles.joinButton, highContrast && { backgroundColor: '#FFD700' }]}
          onPress={() => handleJoinGame(game.id)}
        >
          <Text style={[styles.joinButtonText, highContrast && { color: '#111' }]}>Join</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFeaturedGames = () => (
    <View style={styles.featuredGamesSection}>
      <View style={[styles.sectionHeader, rtlEnabled && { flexDirection: 'row-reverse' }]}>
        <Text style={styles.sectionTitle}>Featured Games</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Explore', { sport: featuredGames?.[0]?.sport }) }>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading && featuredGames.length === 0 ? (
        <View style={{ flexDirection: 'row' }}>
          {[1,2].map(i => (
            <View key={i} style={[styles.gameCard, { marginRight: spacing.md }] }>
              <Shimmer width={'80%'} height={18} />
              <Shimmer width={'60%'} height={14} style={{ marginTop: 8 }} />
              <Shimmer width={'40%'} height={12} style={{ marginTop: 8 }} />
            </View>
          ))}
        </View>
      ) : featuredGames.length > 0 ? (
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

  const renderNearbyGames = () => (
    <View style={styles.featuredGamesSection}>
      <View style={[styles.sectionHeader, rtlEnabled && { flexDirection: 'row-reverse' }]}>
        <Text style={styles.sectionTitle}>Nearby Games</Text>
        <TouchableOpacity onPress={async () => {
          const coords = await getCurrentCoords();
          navigation.navigate('Explore', { near: { lat: coords.latitude, lon: coords.longitude, radiusKm: 5 } });
        }}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      {isLoading && nearbyGames.length === 0 ? (
        <View>
          {[1,2,3].map(i => (
            <View key={i} style={[styles.nearbyCard]}>
              <Shimmer width={'60%'} height={16} />
              <Shimmer width={'40%'} height={12} style={{ marginTop: 6 }} />
            </View>
          ))}
        </View>
      ) : nearbyGames.length > 0 ? (
        <View>
          {nearbyGames.slice(0,5).map((g: any) => (
            <View key={g.id} style={styles.nearbyCard}>
              <Text style={{ color: colors.textLight, fontWeight: '700' }}>{g.title}</Text>
              <Text style={{ color: colors.textLight, opacity: 0.8 }}>{g.location}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="location-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No nearby games</Text>
          <Text style={styles.emptySubtext}>Try expanding your search radius</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, highContrast && { backgroundColor: '#000' }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        <View style={[styles.content, highContrast && { backgroundColor: '#000' }]}>
          {renderQuickActions()}
          {renderFeaturedGames()}
          {renderNearbyGames()}
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
  nearbyCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  gameCard: {
    width: width * 0.8,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginRight: spacing.md,
    ...colors.shadows?.md,
  },
  gameCardHC: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#333',
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
