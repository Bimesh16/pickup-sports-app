import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Title, Paragraph, Chip, Button } from 'react-native-paper';
import { NepalColors, FontSizes, Spacing, BorderRadius } from '@/constants/theme';
import { useUIStore } from '@/stores/uiStore';
import { GameSummary, SportType, SkillLevel } from '@/types';
import { searchGames, getNearbyGames, joinGame } from '@/services/games';
import { selectionAsync, impactAsync } from '@/services/haptics';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function ExploreScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { highContrast, rtlEnabled } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<SportType | null>(null);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<SkillLevel | null>(null);
  const [games, setGames] = useState<GameSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const near = route.params?.near as { lat: number; lon: number; radiusKm?: number } | undefined;
  const initialSport = route.params?.sport as SportType | undefined;

  const sports: SportType[] = ['FOOTBALL', 'BASKETBALL', 'CRICKET', 'BADMINTON', 'TENNIS', 'VOLLEYBALL', 'TABLE_TENNIS', 'FUTSAL'];
  const skillLevels: SkillLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  useEffect(() => {
    loadGames();
  }, [selectedSport, selectedSkillLevel]);

  useEffect(() => {
    if (initialSport) setSelectedSport(initialSport);
  }, [initialSport]);

  const loadGames = async () => {
    try {
      setIsLoading(true);
      let res: any;
      if (near) {
        res = await getNearbyGames(near.lat, near.lon, near.radiusKm || 5);
      } else {
        res = await searchGames({ sport: selectedSport || undefined, skillLevel: selectedSkillLevel || undefined, q: searchQuery || undefined }, 0);
      }
      if (res.ok) {
        const list = (res.data?.content || res.data || []) as any[];
        const mapped: GameSummary[] = list.map((g: any) => ({
          id: String(g.id || Math.random()),
          title: g.title || `${g.sport || 'Game'}`,
          sport: g.sport || 'SPORT',
          location: { id: String(g.venue?.id || '0'), name: g.venue?.name || g.location || 'Unknown', address: g.venue?.address || '' },
          dateTime: g.time || g.dateTime || new Date().toISOString(),
          maxPlayers: g.maxPlayers || g.capacity || 0,
          currentPlayers: g.currentParticipants || g.currentPlayers || 0,
          skillLevel: g.skillLevel || 'BEGINNER',
          cost: g.pricePerPlayer || g.totalCost || 0,
        }));
        setGames(mapped);
      } else {
        setGames([]);
      }
    } catch (error) {
      console.error('Failed to load games:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadGames();
  };

  const handleSportFilter = (sport: SportType) => {
    setSelectedSport(selectedSport === sport ? null : sport);
  };

  const handleSkillLevelFilter = (skillLevel: SkillLevel) => {
    setSelectedSkillLevel(selectedSkillLevel === skillLevel ? null : skillLevel);
  };

  const clearFilters = () => {
    setSelectedSport(null);
    setSelectedSkillLevel(null);
    setSearchQuery('');
  };

  const renderGameCard = (game: GameSummary) => (
    <Card key={game.id} style={[styles.gameCard, highContrast && { backgroundColor: '#0A0A0A' }] }>
      <Card.Content>
        <View style={styles.gameHeader}>
          <Title style={[styles.gameTitle, highContrast && { color: '#fff' }]}>{game.title}</Title>
          <Chip 
            mode="outlined" 
            style={[styles.sportChip, { backgroundColor: getSportColor(game.sport) }]}
            textStyle={styles.sportChipText}
          >
            {game.sport}
          </Chip>
        </View>
        
        <Paragraph style={[styles.gameLocation, highContrast && { color: '#E5E7EB' }]}>
          <Ionicons name="location" size={16} color={NepalColors.textSecondary} />
          {' '}{game.location.name}
        </Paragraph>
        
        <Paragraph style={[styles.gameDateTime, highContrast && { color: '#E5E7EB' }]}>
          <Ionicons name="calendar" size={16} color={NepalColors.textSecondary} />
          {' '}{new Date(game.dateTime).toLocaleDateString()} at {new Date(game.dateTime).toLocaleTimeString()}
        </Paragraph>
        
        <View style={styles.gameFooter}>
          <View style={styles.gameInfo}>
            <Text style={[styles.gamePlayers, highContrast && { color: '#E5E7EB' }]}>
              {game.currentPlayers}/{game.maxPlayers} players
            </Text>
            <Text style={[styles.gameSkillLevel, highContrast && { color: '#FFD700' }]}>
              {game.skillLevel}
            </Text>
          </View>
          <View style={styles.gameCost}>
            <Text style={[styles.costText, highContrast && { color: '#FFD700' }]}>Rs. {game.cost}</Text>
          </View>
        </View>
        
        <Button mode="contained" onPress={async () => {
          await selectionAsync();
          const res = await joinGame(game.id);
          if (res.ok) { await impactAsync('light'); navigation.navigate('GameDetails', { gameId: game.id }); }
        }} style={[styles.joinButton, highContrast && { backgroundColor: '#FFD700' }]}>
          <Text style={highContrast ? { color: '#111', fontWeight: '700' } : undefined}>Join Game</Text>
        </Button>
      </Card.Content>
    </Card>
  );

  const getSportColor = (sport: SportType): string => {
    const colors: Record<SportType, string> = {
      FOOTBALL: NepalColors.futsalGreen,
      BASKETBALL: NepalColors.basketballOrange,
      CRICKET: NepalColors.cricketBrown,
      BADMINTON: NepalColors.primary,
      TENNIS: NepalColors.success,
      VOLLEYBALL: NepalColors.warning,
      TABLE_TENNIS: NepalColors.info,
      FUTSAL: NepalColors.futsalGreen,
    };
    return colors[sport] || NepalColors.primary;
  };

  return (
    <View style={[styles.container, highContrast && { backgroundColor: '#000' }]}>
      {/* Search Bar */}
      <View style={[styles.searchSection, highContrast && { backgroundColor: '#0A0A0A' }]}>
        <View style={[styles.searchBar, rtlEnabled && { flexDirection: 'row-reverse' }, highContrast && { backgroundColor: '#111', borderColor: '#333', borderWidth: 1 }]}>
          <Ionicons name="search" size={20} color={NepalColors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search games..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={handleSearch}>
            <Ionicons name="arrow-forward" size={20} color={NepalColors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Sport Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Sports</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={rtlEnabled ? { flexDirection: 'row-reverse' } : undefined}>
            <View style={styles.filterChips}>
              {sports.map((sport) => (
                <Chip
                  key={sport}
                  selected={selectedSport === sport}
                  onPress={() => handleSportFilter(sport)}
                  style={[
                    styles.filterChip,
                    selectedSport === sport && { backgroundColor: NepalColors.primary }
                  ]}
                  textStyle={[
                    styles.filterChipText,
                    selectedSport === sport && { color: NepalColors.textLight }
                  ]}
                >
                  {sport}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Skill Level Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Skill Level</Text>
          <View style={styles.filterChips}>
            {skillLevels.map((level) => (
              <Chip
                key={level}
                selected={selectedSkillLevel === level}
                onPress={() => handleSkillLevelFilter(level)}
                style={[
                  styles.filterChip,
                  selectedSkillLevel === level && { backgroundColor: NepalColors.primary }
                ]}
                textStyle={[
                  styles.filterChipText,
                  selectedSkillLevel === level && { color: NepalColors.textLight }
                ]}
              >
                {level}
              </Chip>
            ))}
          </View>
        </View>

        {/* Clear Filters */}
        {(selectedSport || selectedSkillLevel) && (
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <Ionicons name="close-circle" size={16} color={NepalColors.textSecondary} />
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        )}

        {/* Games List */}
        <View style={styles.gamesSection}>
          <Text style={styles.sectionTitle}>
            {games.length} Games Found
          </Text>
          
          {games.length > 0 ? (
            <View>
              {games.map((g) => (
                <View key={g.id} style={highContrast ? { backgroundColor: '#0A0A0A', borderRadius: 12, marginBottom: Spacing.md } : undefined}>
                  {renderGameCard(g)}
                </View>
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Ionicons name="search" size={48} color={NepalColors.textSecondary} />
                <Text style={styles.emptyText}>No games found</Text>
                <Text style={styles.emptySubtext}>
                  Try adjusting your filters or search terms
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NepalColors.background,
  },
  searchSection: {
    padding: Spacing.lg,
    backgroundColor: NepalColors.surface,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NepalColors.background,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSizes.base,
    color: NepalColors.text,
  },
  content: {
    flex: 1,
  },
  filterSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  filterTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: NepalColors.text,
    marginBottom: Spacing.sm,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  filterChipText: {
    fontSize: FontSizes.sm,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  clearFiltersText: {
    marginLeft: Spacing.xs,
    fontSize: FontSizes.sm,
    color: NepalColors.textSecondary,
  },
  gamesSection: {
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: NepalColors.text,
    marginBottom: Spacing.md,
  },
  gameCard: {
    marginBottom: Spacing.md,
    elevation: 2,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  gameTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: NepalColors.text,
    flex: 1,
  },
  sportChip: {
    marginLeft: Spacing.sm,
  },
  sportChipText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  gameLocation: {
    fontSize: FontSizes.sm,
    color: NepalColors.textSecondary,
    marginBottom: Spacing.xs,
  },
  gameDateTime: {
    fontSize: FontSizes.sm,
    color: NepalColors.textSecondary,
    marginBottom: Spacing.sm,
  },
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  gameInfo: {
    flex: 1,
  },
  gamePlayers: {
    fontSize: FontSizes.sm,
    color: NepalColors.textSecondary,
  },
  gameSkillLevel: {
    fontSize: FontSizes.sm,
    color: NepalColors.primary,
    fontWeight: '600',
  },
  gameCost: {
    alignItems: 'flex-end',
  },
  costText: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: NepalColors.primary,
  },
  joinButton: {
    backgroundColor: NepalColors.primary,
  },
  emptyCard: {
    backgroundColor: NepalColors.surface,
    borderRadius: BorderRadius.md,
  },
  emptyContent: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSizes.lg,
    color: NepalColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: FontSizes.sm,
    color: NepalColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
