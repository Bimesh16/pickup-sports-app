import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { Game, SportType } from '@/types/game';

const SPORTS: { type: SportType; name: string; icon: string }[] = [
  { type: 'FOOTBALL', name: 'Football', icon: 'football' },
  { type: 'BASKETBALL', name: 'Basketball', icon: 'basketball' },
  { type: 'CRICKET', name: 'Cricket', icon: 'baseball' },
  { type: 'BADMINTON', name: 'Badminton', icon: 'tennisball' },
  { type: 'TENNIS', name: 'Tennis', icon: 'tennisball' },
  { type: 'VOLLEYBALL', name: 'Volleyball', icon: 'american-football' },
];

export const ExploreScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<SportType | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    filterGames();
  }, [searchQuery, selectedSport, games]);

  const loadGames = async () => {
    // Mock data - replace with actual API call
    const mockGames: Game[] = [
      {
        id: '1',
        title: 'Morning Football at Dasharath Stadium',
        sport: 'FOOTBALL',
        description: 'Friendly morning match',
        dateTime: new Date(Date.now() + 3600000).toISOString(),
        duration: 90,
        location: {
          id: '1',
          name: 'Dasharath Stadium',
          address: 'Tripureshwor, Kathmandu',
          latitude: 27.6939,
          longitude: 85.3197,
          facilities: ['Grass field', 'Changing rooms', 'Parking'],
          rating: 4.8,
          photos: [],
        },
        maxPlayers: 22,
        currentPlayers: 15,
        skillLevel: 'INTERMEDIATE',
        cost: 250,
        currency: 'NPR',
        status: 'UPCOMING',
        organizerId: 'organizer1',
        organizer: {
          id: 'organizer1',
          name: 'Bikram Lama',
          rating: 4.9,
        },
        players: [],
        equipment: [],
        rules: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Basketball Pickup Game',
        sport: 'BASKETBALL',
        description: '3v3 basketball tournament',
        dateTime: new Date(Date.now() + 7200000).toISOString(),
        duration: 120,
        location: {
          id: '2',
          name: 'Pulchowk Basketball Court',
          address: 'Pulchowk, Lalitpur',
          latitude: 27.6777,
          longitude: 85.3210,
          facilities: ['Indoor court', 'Scoreboard'],
          rating: 4.5,
          photos: [],
        },
        maxPlayers: 12,
        currentPlayers: 8,
        skillLevel: 'ADVANCED',
        cost: 300,
        currency: 'NPR',
        status: 'UPCOMING',
        organizerId: 'organizer2',
        organizer: {
          id: 'organizer2',
          name: 'Anita Gurung',
          rating: 4.7,
        },
        players: [],
        equipment: [],
        rules: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    
    setGames(mockGames);
  };

  const filterGames = () => {
    let filtered = games;

    if (selectedSport) {
      filtered = filtered.filter(game => game.sport === selectedSport);
    }

    if (searchQuery) {
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.sport.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredGames(filtered);
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const renderSportFilter = ({ item }: { item: typeof SPORTS[0] }) => (
    <TouchableOpacity
      style={[
        styles.sportChip,
        selectedSport === item.type && styles.selectedSportChip
      ]}
      onPress={() => setSelectedSport(selectedSport === item.type ? null : item.type)}
    >
      <Ionicons 
        name={item.icon as any} 
        size={20} 
        color={selectedSport === item.type ? colors.textLight : colors.primary} 
      />
      <Text style={[
        styles.sportChipText,
        selectedSport === item.type && styles.selectedSportChipText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderGameCard = ({ item }: { item: Game }) => (
    <TouchableOpacity style={styles.gameCard}>
      <View style={styles.gameHeader}>
        <View style={styles.gameInfo}>
          <View style={styles.sportIconContainer}>
            <Ionicons 
              name={SPORTS.find(s => s.type === item.sport)?.icon as any || 'fitness'} 
              size={24} 
              color={colors.primary} 
            />
          </View>
          <View style={styles.gameDetails}>
            <Text style={styles.gameTitle}>{item.title}</Text>
            <Text style={styles.gameLocation}>{item.location.name}</Text>
            <Text style={styles.gameOrganizer}>by {item.organizer.name}</Text>
          </View>
        </View>
        <View style={styles.gamePrice}>
          <Text style={styles.priceText}>NPR {item.cost}</Text>
          <View style={[styles.skillBadge, styles[`skill${item.skillLevel}`]]}>
            <Text style={[styles.skillText, styles[`skillText${item.skillLevel}`]]}>
              {item.skillLevel}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.gameMetrics}>
        <View style={styles.metricItem}>
          <Ionicons name="time" size={16} color={colors.textSecondary} />
          <Text style={styles.metricText}>{formatDateTime(item.dateTime)}</Text>
        </View>
        <View style={styles.metricItem}>
          <Ionicons name="people" size={16} color={colors.textSecondary} />
          <Text style={styles.metricText}>{item.currentPlayers}/{item.maxPlayers} players</Text>
        </View>
        <View style={styles.metricItem}>
          <Ionicons name="location" size={16} color={colors.textSecondary} />
          <Text style={styles.metricText}>{item.location.address.split(',')[0]}</Text>
        </View>
      </View>

      <View style={styles.gameFooter}>
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Join Game</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Games</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search games, locations..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sportsFilter}>
        <FlatList
          data={SPORTS}
          renderItem={renderSportFilter}
          keyExtractor={(item) => item.type}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sportsFilterContent}
        />
      </ScrollView>

      <FlatList
        data={filteredGames}
        renderItem={renderGameCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.gamesList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No games found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        }
      />
    </SafeAreaView>
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  filterButton: {
    padding: spacing.sm,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
  },
  sportsFilter: {
    marginBottom: spacing.md,
  },
  sportsFilterContent: {
    paddingHorizontal: spacing.lg,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedSportChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sportChipText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
    marginLeft: spacing.xs,
  },
  selectedSportChipText: {
    color: colors.textLight,
  },
  gamesList: {
    paddingHorizontal: spacing.lg,
  },
  gameCard: {
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  gameInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  sportIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  gameDetails: {
    flex: 1,
  },
  gameTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  gameLocation: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  gameOrganizer: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  gamePrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  skillBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  skillBEGINNER: {
    backgroundColor: colors.success + '20',
  },
  skillINTERMEDIATE: {
    backgroundColor: colors.warning + '20',
  },
  skillADVANCED: {
    backgroundColor: colors.error + '20',
  },
  skillText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
  },
  skillTextBEGINNER: {
    color: colors.success,
  },
  skillTextINTERMEDIATE: {
    color: colors.warning,
  },
  skillTextADVANCED: {
    color: colors.error,
  },
  gameMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  joinButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    flex: 1,
    marginRight: spacing.sm,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textLight,
  },
  detailsButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});