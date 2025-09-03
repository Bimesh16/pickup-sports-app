import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import { RootStackParamList } from '@/navigation/MainNavigator';
import { useGameStore } from '@/stores/gameStore';
import { GameCard } from '@/components/games/GameCard';
import { FilterChip } from '@/components/common/FilterChip';
import { colors, typography, spacing, shadows } from '@/constants/theme';

type ExploreScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const SPORTS_FILTERS = [
  { id: 'all', name: 'All', nameNepali: 'सबै' },
  { id: 'futsal', name: 'Futsal', nameNepali: 'फुटसल' },
  { id: 'football', name: 'Football', nameNepali: 'फुटबल' },
  { id: 'basketball', name: 'Basketball', nameNepali: 'बास्केटबल' },
  { id: 'cricket', name: 'Cricket', nameNepali: 'क्रिकेट' },
];

const SKILL_FILTERS = [
  { id: 'all', name: 'All Levels', nameNepali: 'सबै स्तर' },
  { id: 'BEGINNER', name: 'Beginner', nameNepali: 'शुरुवाती' },
  { id: 'INTERMEDIATE', name: 'Intermediate', nameNepali: 'मध्यम' },
  { id: 'ADVANCED', name: 'Advanced', nameNepali: 'उन्नत' },
];

export const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<ExploreScreenNavigationProp>();
  const { 
    games, 
    isLoading, 
    fetchGames, 
    fetchNearbyFutsal, 
    setSearchParams, 
    searchParams 
  } = useGameStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
    requestLocation();
  }, []);

  useEffect(() => {
    // Apply filters when they change
    const params: any = {};
    
    if (selectedSport !== 'all') {
      params.sport = selectedSport;
    }
    
    if (selectedSkill !== 'all') {
      params.skillLevel = selectedSkill;
    }
    
    if (searchQuery.trim()) {
      params.query = searchQuery.trim();
    }
    
    if (location) {
      params.latitude = location.coords.latitude;
      params.longitude = location.coords.longitude;
      params.radius = 25; // 25km radius
    }
    
    setSearchParams(params);
    fetchGames(params);
  }, [selectedSport, selectedSkill, searchQuery, location]);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(currentLocation);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadInitialData = async () => {
    try {
      await fetchGames();
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchGames(searchParams);
      if (location && selectedSport === 'futsal') {
        await fetchNearbyFutsal(location.coords.latitude, location.coords.longitude);
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const clearFilters = () => {
    setSelectedSport('all');
    setSelectedSkill('all');
    setSearchQuery('');
    setSearchParams({});
    fetchGames({});
  };

  const filteredGames = games.filter(game => {
    // Additional client-side filtering if needed
    return true;
  });

  const activeFiltersCount = [
    selectedSport !== 'all',
    selectedSkill !== 'all',
    searchQuery.trim() !== '',
  ].filter(Boolean).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore Games</Text>
        <Text style={styles.titleNepali}>खेलहरू खोज्नुहोस्</Text>
        
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={requestLocation}
        >
          <Ionicons 
            name={location ? "location" : "location-outline"} 
            size={20} 
            color={location ? colors.success : colors.textSecondary} 
          />
          <Text style={[
            styles.locationText, 
            { color: location ? colors.success : colors.textSecondary }
          ]}>
            {location ? 'Kathmandu' : 'Enable Location'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, shadows.sm]}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search games, venues, or areas..."
          placeholderTextColor={colors.placeholder}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Sport:</Text>
            <View style={styles.filterChips}>
              {SPORTS_FILTERS.map((filter) => (
                <FilterChip
                  key={filter.id}
                  label={filter.name}
                  labelNepali={filter.nameNepali}
                  selected={selectedSport === filter.id}
                  onPress={() => setSelectedSport(filter.id)}
                />
              ))}
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Skill:</Text>
            <View style={styles.filterChips}>
              {SKILL_FILTERS.map((filter) => (
                <FilterChip
                  key={filter.id}
                  label={filter.name}
                  labelNepali={filter.nameNepali}
                  selected={selectedSkill === filter.id}
                  onPress={() => setSelectedSkill(filter.id)}
                />
              ))}
            </View>
          </View>
          
          {activeFiltersCount > 0 && (
            <TouchableOpacity style={styles.clearFilters} onPress={clearFilters}>
              <Ionicons name="close-outline" size={16} color={colors.error} />
              <Text style={styles.clearFiltersText}>Clear ({activeFiltersCount})</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Games List */}
      <ScrollView
        style={styles.gamesList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''} found
          </Text>
          {location && (
            <Text style={styles.locationResultsText}>
              Near Kathmandu, Nepal
            </Text>
          )}
        </View>

        {/* No Results */}
        {filteredGames.length === 0 && !isLoading && (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={64} color={colors.textLight} />
            <Text style={styles.noResultsTitle}>No games found</Text>
            <Text style={styles.noResultsText}>
              Try adjusting your filters or search in a different area.
            </Text>
            <TouchableOpacity style={styles.createGameButton} onPress={() => navigation.navigate('CreateGame')}>
              <Text style={styles.createGameButtonText}>Create a Game</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Games */}
        {filteredGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPress={() => navigation.navigate('GameDetails', { gameId: game.id })}
            style={styles.gameCard}
          />
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loading}>
            <Text style={styles.loadingText}>Finding games...</Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, shadows.lg]}
        onPress={() => navigation.navigate('CreateGame')}
      >
        <Ionicons name="add" size={24} color={colors.onPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  titleNepali: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  locationText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    marginLeft: spacing.md,
  },
  filtersContainer: {
    marginBottom: spacing.lg,
  },
  filterSection: {
    marginLeft: spacing.xl,
  },
  filterLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  filterChips: {
    flexDirection: 'row',
    marginRight: spacing.lg,
  },
  clearFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.xl,
    alignSelf: 'flex-start',
  },
  clearFiltersText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.error,
    marginLeft: spacing.xs,
  },
  gamesList: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  resultsText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  locationResultsText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  noResults: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['4xl'],
  },
  noResultsTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  noResultsText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing.xl,
  },
  createGameButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  createGameButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.onPrimary,
  },
  gameCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  loading: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  bottomPadding: {
    height: spacing['5xl'],
  },
  fab: {
    position: 'absolute',
    bottom: spacing['3xl'],
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});