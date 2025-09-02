import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Searchbar, Chip, ToggleButton, FAB } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScrollContainer from '../../components/common/ScrollContainer';
import AdvancedDropdown, { 
  SPORT_OPTIONS, 
  SKILL_LEVEL_OPTIONS, 
  RADIUS_OPTIONS,
  TIME_SLOT_OPTIONS 
} from '../../components/common/AdvancedDropdown';
import { useModal } from '../../components/common/AdvancedModal';
import GameCard from '../../components/games/GameCard';
import MapViewModal from '../../components/explore/MapViewModal';

import { useCurrentLocation } from '../../stores/locationStore';
import { useSearchResults, useSearchFilters, useGameActions, useGameLoading } from '../../stores/gameStore';
import { NepalColors, commonStyles } from '../../styles/theme';
import { SearchFilters, RootStackParamList } from '../../types';

type ExploreScreenNavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * Explore Screen - Advanced Game Discovery
 * Features:
 * - Advanced search with multiple filters
 * - Map and list view toggle
 * - Real-time search suggestions
 * - Infinite scrolling
 * - Saved search preferences
 */
const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<ExploreScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { showModal } = useModal();
  
  // Store hooks
  const currentLocation = useCurrentLocation();
  const searchResults = useSearchResults();
  const searchFilters = useSearchFilters();
  const { searchGames, updateSearchFilters, clearSearch } = useGameActions();
  const isLoading = useGameLoading();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [localFilters, setLocalFilters] = useState<SearchFilters>({});

  // Animation values
  const scrollY = useSharedValue(0);
  const filterHeight = useSharedValue(0);

  // Initialize with location if available
  React.useEffect(() => {
    if (currentLocation && !searchFilters.latitude) {
      updateSearchFilters({
        latitude: currentLocation.coordinates.latitude,
        longitude: currentLocation.coordinates.longitude,
        radiusKm: 10,
      });
      setLocalFilters({
        latitude: currentLocation.coordinates.latitude,
        longitude: currentLocation.coordinates.longitude,
        radiusKm: 10,
      });
    }
  }, [currentLocation, searchFilters, updateSearchFilters]);

  // Handle search submission
  const handleSearch = useCallback(async () => {
    const filters: SearchFilters = {
      ...localFilters,
      location: searchQuery || undefined,
    };

    try {
      await searchGames(filters);
      updateSearchFilters(filters);
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, [localFilters, searchQuery, searchGames, updateSearchFilters]);

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof SearchFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Handle apply filters
  const handleApplyFilters = useCallback(() => {
    setShowFilters(false);
    handleSearch();
  }, [handleSearch]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setLocalFilters({
      latitude: currentLocation?.coordinates.latitude,
      longitude: currentLocation?.coordinates.longitude,
      radiusKm: 10,
    });
    setSearchQuery('');
    clearSearch();
  }, [currentLocation, clearSearch]);

  // Toggle filter panel
  const toggleFilters = useCallback(() => {
    setShowFilters(prev => {
      const newValue = !prev;
      filterHeight.value = withSpring(newValue ? 1 : 0, {
        damping: 20,
        stiffness: 300,
      });
      return newValue;
    });
  }, []);

  // Show map view modal
  const showMapView = useCallback(() => {
    showModal(
      <MapViewModal
        games={searchResults?.content || []}
        onGameSelect={(gameId) => {
          navigation.navigate('GameDetails', { gameId });
        }}
      />,
      {
        title: 'Games Map',
        dismissible: true,
        animationType: 'slide',
        position: 'center',
      }
    );
  }, [showModal, searchResults, navigation]);

  // Handle game press
  const handleGamePress = useCallback((gameId: number) => {
    navigation.navigate('GameDetails', { gameId });
  }, [navigation]);

  // Load more games (infinite scrolling)
  const handleLoadMore = useCallback(async () => {
    if (searchResults && searchResults.hasNext && !isLoading) {
      try {
        await searchGames(searchFilters, searchResults.currentPage + 1);
      } catch (error) {
        console.error('Load more failed:', error);
      }
    }
  }, [searchResults, searchFilters, searchGames, isLoading]);

  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Filter panel animated style
  const filterAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(filterHeight.value, [0, 1], [0, 300]);
    const opacity = filterHeight.value;
    
    return {
      height,
      opacity,
      overflow: 'hidden' as const,
    };
  });

  // Memoized filter panel
  const FilterPanel = useMemo(() => (
    <Animated.View style={[styles.filterPanel, filterAnimatedStyle]}>
      <View style={styles.filterContent}>
        <Text style={styles.filterTitle}>Advanced Filters</Text>
        
        <View style={styles.filterRow}>
          <AdvancedDropdown
            options={SPORT_OPTIONS}
            value={localFilters.sport || ''}
            onSelect={(value) => handleFilterChange('sport', value)}
            placeholder="Any Sport"
            style={styles.filterDropdown}
          />
          <AdvancedDropdown
            options={SKILL_LEVEL_OPTIONS}
            value={localFilters.skillLevel || ''}
            onSelect={(value) => handleFilterChange('skillLevel', value)}
            placeholder="Any Level"
            style={styles.filterDropdown}
          />
        </View>

        <View style={styles.filterRow}>
          <AdvancedDropdown
            options={TIME_SLOT_OPTIONS}
            value={localFilters.timeSlot || ''}
            onSelect={(value) => handleFilterChange('timeSlot', value)}
            placeholder="Any Time"
            style={styles.filterDropdown}
          />
          <AdvancedDropdown
            options={RADIUS_OPTIONS}
            value={localFilters.radiusKm?.toString() || '10'}
            onSelect={(value) => handleFilterChange('radiusKm', parseInt(value))}
            placeholder="10 km"
            style={styles.filterDropdown}
          />
        </View>

        <View style={styles.filterActions}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearFilters}
            activeOpacity={0.7}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyFilters}
            activeOpacity={0.8}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  ), [localFilters, handleFilterChange, handleClearFilters, handleApplyFilters, filterAnimatedStyle]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Explore Games</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewToggle}
            onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={viewMode === 'list' ? 'map' : 'list'}
              size={20}
              color={NepalColors.primaryCrimson}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search games, locations, sports..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={NepalColors.primaryCrimson}
          theme={{
            colors: {
              primary: NepalColors.primaryCrimson,
            },
          }}
        />
        
        <View style={styles.searchActions}>
          <TouchableOpacity
            style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            onPress={toggleFilters}
            activeOpacity={0.7}
          >
            <Ionicons
              name="options"
              size={20}
              color={showFilters ? NepalColors.primaryWhite : NepalColors.primaryCrimson}
            />
          </TouchableOpacity>
          
          {viewMode === 'list' && (
            <TouchableOpacity
              style={styles.mapButton}
              onPress={showMapView}
              activeOpacity={0.7}
            >
              <Ionicons name="map" size={20} color={NepalColors.primaryBlue} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Panel */}
      {FilterPanel}

      {/* Results */}
      <ScrollContainer
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        refreshing={isLoading}
        onRefresh={handleSearch}
      >
        {/* Active Filters */}
        {Object.keys(searchFilters).length > 0 && (
          <View style={styles.activeFilters}>
            <Text style={styles.activeFiltersTitle}>Active Filters:</Text>
            <View style={styles.filterChips}>
              {Object.entries(searchFilters).map(([key, value]) => {
                if (!value) return null;
                return (
                  <Chip
                    key={key}
                    mode="outlined"
                    onClose={() => handleFilterChange(key as keyof SearchFilters, undefined)}
                    style={styles.filterChip}
                    textStyle={styles.filterChipText}
                  >
                    {`${key}: ${value}`}
                  </Chip>
                );
              })}
            </View>
          </View>
        )}

        {/* Results List */}
        {searchResults?.content && searchResults.content.length > 0 ? (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              {searchResults.totalElements} games found
            </Text>
            <FlatList
              data={searchResults.content}
              renderItem={({ item }) => (
                <GameCard
                  game={item}
                  onPress={() => handleGamePress(item.id)}
                  style={styles.gameCard}
                />
              )}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
            />
          </View>
        ) : searchResults?.content ? (
          <View style={styles.emptyResults}>
            <Ionicons
              name="search-outline"
              size={64}
              color={NepalColors.onSurfaceVariant}
            />
            <Text style={styles.emptyTitle}>No games found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search criteria or create a new game
            </Text>
            <TouchableOpacity
              style={styles.createGameButton}
              onPress={() => navigation.navigate('Create')}
              activeOpacity={0.8}
            >
              <Text style={styles.createGameButtonText}>Create Game</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Discover Amazing Games</Text>
            <Text style={styles.welcomeText}>
              Find pickup games near you or explore new sports to try
            </Text>
          </View>
        )}
      </ScrollContainer>

      {/* Floating Search Button */}
      <FAB
        icon="search"
        style={[styles.searchFab, { bottom: insets.bottom + 16 }]}
        onPress={handleSearch}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: commonStyles.padding.large,
    paddingBottom: commonStyles.padding.medium,
    backgroundColor: NepalColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: NepalColors.outlineVariant,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
  },
  headerActions: {
    flexDirection: 'row',
    gap: commonStyles.padding.small,
  },
  viewToggle: {
    padding: commonStyles.padding.small,
    borderRadius: commonStyles.borderRadius.small,
    backgroundColor: NepalColors.surfaceVariant,
  },
  searchSection: {
    paddingHorizontal: commonStyles.padding.large,
    paddingVertical: commonStyles.padding.medium,
    backgroundColor: NepalColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: NepalColors.outlineVariant,
  },
  searchBar: {
    backgroundColor: NepalColors.background,
    marginBottom: commonStyles.padding.medium,
  },
  searchInput: {
    fontFamily: 'Poppins-Regular',
  },
  searchActions: {
    flexDirection: 'row',
    gap: commonStyles.padding.medium,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: commonStyles.padding.medium,
    borderRadius: commonStyles.borderRadius.medium,
    borderWidth: 1,
    borderColor: NepalColors.primaryCrimson,
    backgroundColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: NepalColors.primaryCrimson,
  },
  mapButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: commonStyles.padding.medium,
    borderRadius: commonStyles.borderRadius.medium,
    borderWidth: 1,
    borderColor: NepalColors.primaryBlue,
    backgroundColor: 'transparent',
  },
  filterPanel: {
    backgroundColor: NepalColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: NepalColors.outlineVariant,
  },
  filterContent: {
    padding: commonStyles.padding.large,
  },
  filterTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    marginBottom: commonStyles.padding.medium,
  },
  filterRow: {
    flexDirection: 'row',
    gap: commonStyles.padding.medium,
    marginBottom: commonStyles.padding.medium,
  },
  filterDropdown: {
    flex: 1,
  },
  filterActions: {
    flexDirection: 'row',
    gap: commonStyles.padding.medium,
    marginTop: commonStyles.padding.medium,
  },
  clearButton: {
    flex: 1,
    paddingVertical: commonStyles.padding.medium,
    borderRadius: commonStyles.borderRadius.medium,
    borderWidth: 1,
    borderColor: NepalColors.outline,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.onSurface,
  },
  applyButton: {
    flex: 1,
    paddingVertical: commonStyles.padding.medium,
    borderRadius: commonStyles.borderRadius.medium,
    backgroundColor: NepalColors.primaryCrimson,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryWhite,
  },
  scrollContent: {
    paddingHorizontal: commonStyles.padding.large,
    paddingBottom: 100,
  },
  activeFilters: {
    marginVertical: commonStyles.padding.medium,
  },
  activeFiltersTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.onSurface,
    marginBottom: commonStyles.padding.small,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: commonStyles.padding.small,
  },
  filterChip: {
    backgroundColor: NepalColors.primaryCrimson + '20',
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  resultsSection: {
    marginTop: commonStyles.padding.medium,
  },
  resultsTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    marginBottom: commonStyles.padding.large,
  },
  gameCard: {
    marginBottom: commonStyles.padding.medium,
  },
  emptyResults: {
    alignItems: 'center',
    paddingVertical: commonStyles.padding.xl * 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    marginTop: commonStyles.padding.large,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: commonStyles.padding.small,
    marginBottom: commonStyles.padding.xl,
    lineHeight: 20,
  },
  createGameButton: {
    backgroundColor: NepalColors.primaryCrimson,
    paddingHorizontal: commonStyles.padding.xl,
    paddingVertical: commonStyles.padding.medium,
    borderRadius: commonStyles.borderRadius.medium,
  },
  createGameButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryWhite,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: commonStyles.padding.xl * 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: NepalColors.onSurface,
    textAlign: 'center',
    marginBottom: commonStyles.padding.medium,
  },
  welcomeText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
  },
  searchFab: {
    position: 'absolute',
    right: commonStyles.padding.large,
    backgroundColor: NepalColors.primaryBlue,
  },
});

export default ExploreScreen;