import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Title, Paragraph, Chip, Button } from 'react-native-paper';
import { NepalColors, FontSizes, Spacing, BorderRadius } from '@/constants/theme';
import { GameSummary, SportType, SkillLevel } from '@/types';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<SportType | null>(null);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<SkillLevel | null>(null);
  const [games, setGames] = useState<GameSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sports: SportType[] = ['FOOTBALL', 'BASKETBALL', 'CRICKET', 'BADMINTON', 'TENNIS', 'VOLLEYBALL', 'TABLE_TENNIS', 'FUTSAL'];
  const skillLevels: SkillLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  useEffect(() => {
    loadGames();
  }, [selectedSport, selectedSkillLevel]);

  const loadGames = async () => {
    try {
      setIsLoading(true);
      // TODO: Load games from API based on filters
      setGames([]);
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
    <Card key={game.id} style={styles.gameCard}>
      <Card.Content>
        <View style={styles.gameHeader}>
          <Title style={styles.gameTitle}>{game.title}</Title>
          <Chip 
            mode="outlined" 
            style={[styles.sportChip, { backgroundColor: getSportColor(game.sport) }]}
            textStyle={styles.sportChipText}
          >
            {game.sport}
          </Chip>
        </View>
        
        <Paragraph style={styles.gameLocation}>
          <Ionicons name="location" size={16} color={NepalColors.textSecondary} />
          {' '}{game.location.name}
        </Paragraph>
        
        <Paragraph style={styles.gameDateTime}>
          <Ionicons name="calendar" size={16} color={NepalColors.textSecondary} />
          {' '}{new Date(game.dateTime).toLocaleDateString()} at {new Date(game.dateTime).toLocaleTimeString()}
        </Paragraph>
        
        <View style={styles.gameFooter}>
          <View style={styles.gameInfo}>
            <Text style={styles.gamePlayers}>
              {game.currentPlayers}/{game.maxPlayers} players
            </Text>
            <Text style={styles.gameSkillLevel}>
              {game.skillLevel}
            </Text>
          </View>
          <View style={styles.gameCost}>
            <Text style={styles.costText}>Rs. {game.cost}</Text>
          </View>
        </View>
        
        <Button
          mode="contained"
          onPress={() => {/* Navigate to game details */}}
          style={styles.joinButton}
        >
          Join Game
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
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
              {games.map(renderGameCard)}
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