import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Chip, FAB } from 'react-native-paper';

import ScrollContainer from '../../components/common/ScrollContainer';
import AdvancedDropdown, { SPORT_OPTIONS, RADIUS_OPTIONS } from '../../components/common/AdvancedDropdown';
import { useModal } from '../../components/common/AdvancedModal';
import GameCard from '../../components/games/GameCard';
import QuickActionCard from '../../components/home/QuickActionCard';
import StatsCard from '../../components/home/StatsCard';

import { useAuthUser } from '../../stores/authStore';
import { useCurrentLocation, useLocationActions } from '../../stores/locationStore';
import { useNearbyGames, useFeaturedGames, useGameActions, useGameLoading } from '../../stores/gameStore';
import { NepalColors, commonStyles } from '../../styles/theme';
import { GameSummary, RootStackParamList } from '../../types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BottomTabs'>;

/**
 * Home Screen - Main Dashboard
 * Features:
 * - Location-based game discovery
 * - Quick actions with dropdown filters
 * - Pull-to-refresh functionality
 * - Advanced animations and transitions
 * - Nepal-specific content
 */
const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { showModal } = useModal();
  
  // Store hooks
  const user = useAuthUser();
  const currentLocation = useCurrentLocation();
  const { getCurrentLocation } = useLocationActions();
  const nearbyGames = useNearbyGames();
  const featuredGames = useFeaturedGames();
  const { loadNearbyGames, loadFeaturedGames } = useGameActions();
  const isLoading = useGameLoading();

  // Local state
  const [selectedSport, setSelectedSport] = React.useState('');
  const [selectedRadius, setSelectedRadius] = React.useState('5');
  const [refreshing, setRefreshing] = React.useState(false);

  // Animation values
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [currentLocation]);

  const loadInitialData = useCallback(async () => {
    if (!currentLocation) {
      try {
        await getCurrentLocation();
      } catch (error) {
        console.error('Failed to get location:', error);
      }
      return;
    }

    try {
      await Promise.all([
        loadNearbyGames(
          currentLocation.coordinates.latitude,
          currentLocation.coordinates.longitude,
          parseInt(selectedRadius)
        ),
        loadFeaturedGames(),
      ]);
    } catch (error) {
      console.error('Failed to load home data:', error);
    }
  }, [currentLocation, selectedRadius, loadNearbyGames, loadFeaturedGames, getCurrentLocation]);

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
    } finally {
      setRefreshing(false);
    }
  }, [loadInitialData]);

  // Handle filter changes
  const handleSportFilter = useCallback(async (sport: string) => {
    setSelectedSport(sport);
    if (currentLocation) {
      await loadNearbyGames(
        currentLocation.coordinates.latitude,
        currentLocation.coordinates.longitude,
        parseInt(selectedRadius),
        sport || undefined
      );
    }
  }, [currentLocation, selectedRadius, loadNearbyGames]);

  const handleRadiusFilter = useCallback(async (radius: string) => {
    setSelectedRadius(radius);
    if (currentLocation) {
      await loadNearbyGames(
        currentLocation.coordinates.latitude,
        currentLocation.coordinates.longitude,
        parseInt(radius),
        selectedSport || undefined
      );
    }
  }, [currentLocation, selectedSport, loadNearbyGames]);

  // Handle game selection
  const handleGamePress = useCallback((gameId: number) => {
    navigation.navigate('GameDetails', { gameId });
  }, [navigation]);

  // Handle create game
  const handleCreateGame = useCallback(() => {
    navigation.navigate('Create');
  }, [navigation]);

  // Show location picker modal
  const showLocationPicker = useCallback(() => {
    showModal(
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Change Location</Text>
        <Text style={styles.modalText}>
          Current: {currentLocation?.city}, {currentLocation?.country}
        </Text>
        <TouchableOpacity
          style={styles.modalButton}
          onPress={async () => {
            try {
              await getCurrentLocation();
            } catch (error) {
              console.error('Location update failed:', error);
            }
          }}
        >
          <Text style={styles.modalButtonText}>Update Location</Text>
        </TouchableOpacity>
      </View>,
      {
        title: 'Location Settings',
        dismissible: true,
        animationType: 'scale',
      }
    );
  }, [showModal, currentLocation, getCurrentLocation]);

  // Scroll handler for header animation
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Header animated style
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 100], [1, 0.8]);
    const translateY = interpolate(scrollY.value, [0, 100], [0, -10]);
    
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // Memoized components for performance
  const QuickActions = useMemo(() => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <QuickActionCard
          title="Create Game"
          icon="add-circle"
          color={NepalColors.primaryCrimson}
          onPress={handleCreateGame}
        />
        <QuickActionCard
          title="Find Players"
          icon="people"
          color={NepalColors.primaryBlue}
          onPress={() => navigation.navigate('Explore')}
        />
        <QuickActionCard
          title="My Games"
          icon="calendar"
          color={NepalColors.futsalGreen}
          onPress={() => navigation.navigate('Profile')}
        />
        <QuickActionCard
          title="Messages"
          icon="chatbubbles"
          color={NepalColors.warning}
          onPress={() => navigation.navigate('Messages')}
        />
      </View>
    </View>
  ), [navigation, handleCreateGame]);

  const FilterSection = useMemo(() => (
    <View style={styles.filterSection}>
      <Text style={styles.sectionTitle}>Find Games</Text>
      <View style={styles.filterRow}>
        <AdvancedDropdown
          options={SPORT_OPTIONS}
          value={selectedSport}
          onSelect={handleSportFilter}
          placeholder="All Sports"
          style={styles.filterDropdown}
        />
        <AdvancedDropdown
          options={RADIUS_OPTIONS}
          value={selectedRadius}
          onSelect={handleRadiusFilter}
          placeholder="5 km"
          style={styles.filterDropdown}
        />
      </View>
    </View>
  ), [selectedSport, selectedRadius, handleSportFilter, handleRadiusFilter]);

  return (
    <View style={styles.container}>
      {/* Header with location */}
      <Animated.View style={[styles.header, { paddingTop: insets.top + 16 }, headerAnimatedStyle]}>
        <LinearGradient
          colors={[NepalColors.primaryBlue, NepalColors.primaryCrimson]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.firstName || 'Player'}!</Text>
          </View>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={showLocationPicker}
            activeOpacity={0.7}
          >
            <Ionicons name="location" size={16} color={NepalColors.primaryWhite} />
            <Text style={styles.locationText} numberOfLines={1}>
              {currentLocation?.city || 'Kathmandu'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Scrollable Content */}
      <ScrollContainer
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
      >
        {/* User Stats */}
        <StatsCard />

        {/* Quick Actions */}
        {QuickActions}

        {/* Filters */}
        {FilterSection}

        {/* Nearby Games */}
        <View style={styles.gamesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Games</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {nearbyGames.length > 0 ? (
            <FlatList
              data={nearbyGames.slice(0, 5)}
              renderItem={({ item }) => (
                <GameCard
                  game={item}
                  onPress={() => handleGamePress(item.id)}
                  style={styles.gameCard}
                />
              )}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Ionicons
                  name="location-outline"
                  size={48}
                  color={NepalColors.onSurfaceVariant}
                />
                <Text style={styles.emptyTitle}>No games nearby</Text>
                <Text style={styles.emptyText}>
                  Be the first to create a game in your area!
                </Text>
                <TouchableOpacity
                  style={styles.createGameButton}
                  onPress={handleCreateGame}
                >
                  <Text style={styles.createGameButtonText}>Create Game</Text>
                </TouchableOpacity>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Featured Games */}
        {featuredGames.length > 0 && (
          <View style={styles.gamesSection}>
            <Text style={styles.sectionTitle}>Trending in Nepal</Text>
            <FlatList
              data={featuredGames}
              renderItem={({ item }) => (
                <GameCard
                  game={item}
                  onPress={() => handleGamePress(item.id)}
                  style={styles.gameCard}
                  variant="featured"
                />
              )}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}
      </ScrollContainer>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={[styles.fab, { bottom: insets.bottom + 80 }]}
        onPress={handleCreateGame}
        color={NepalColors.primaryWhite}
        customSize={56}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  header: {
    paddingHorizontal: commonStyles.padding.large,
    paddingBottom: commonStyles.padding.large,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.primaryWhite,
    opacity: 0.9,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: NepalColors.primaryWhite,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: commonStyles.padding.medium,
    paddingVertical: commonStyles.padding.small,
    borderRadius: commonStyles.borderRadius.large,
    maxWidth: 120,
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.primaryWhite,
    marginLeft: 4,
  },
  scrollContent: {
    paddingHorizontal: commonStyles.padding.large,
    paddingBottom: 100, // Space for FAB
  },
  quickActionsContainer: {
    marginBottom: commonStyles.padding.xl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: commonStyles.padding.medium,
    justifyContent: 'space-between',
  },
  filterSection: {
    marginBottom: commonStyles.padding.xl,
  },
  filterRow: {
    flexDirection: 'row',
    gap: commonStyles.padding.medium,
  },
  filterDropdown: {
    flex: 1,
  },
  gamesSection: {
    marginBottom: commonStyles.padding.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: commonStyles.padding.medium,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.primaryCrimson,
  },
  gameCard: {
    marginBottom: commonStyles.padding.medium,
  },
  horizontalList: {
    paddingRight: commonStyles.padding.large,
  },
  emptyCard: {
    backgroundColor: NepalColors.surface,
    marginVertical: commonStyles.padding.medium,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: commonStyles.padding.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    marginTop: commonStyles.padding.medium,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: commonStyles.padding.small,
    marginBottom: commonStyles.padding.large,
  },
  createGameButton: {
    backgroundColor: NepalColors.primaryCrimson,
    paddingHorizontal: commonStyles.padding.large,
    paddingVertical: commonStyles.padding.medium,
    borderRadius: commonStyles.borderRadius.medium,
  },
  createGameButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryWhite,
  },
  fab: {
    position: 'absolute',
    right: commonStyles.padding.large,
    backgroundColor: NepalColors.primaryCrimson,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    marginBottom: commonStyles.padding.medium,
  },
  modalText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: commonStyles.padding.large,
  },
  modalButton: {
    backgroundColor: NepalColors.primaryCrimson,
    paddingHorizontal: commonStyles.padding.xl,
    paddingVertical: commonStyles.padding.medium,
    borderRadius: commonStyles.borderRadius.medium,
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryWhite,
  },
});

export default HomeScreen;