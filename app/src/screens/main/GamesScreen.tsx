import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/MainNavigator';
import { useGameStore } from '@/stores/gameStore';
import { GameCard } from '@/components/games/GameCard';
import { colors, typography, spacing, shadows } from '@/constants/theme';

type GamesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const TABS = [
  { id: 'upcoming', name: 'Upcoming', nameNepali: 'आउँदै गरेका', icon: 'time-outline' },
  { id: 'completed', name: 'Completed', nameNepali: 'सम्पन्न', icon: 'checkmark-circle-outline' },
  { id: 'organized', name: 'Organized', nameNepali: 'आयोजना गरेका', icon: 'person-outline' },
];

export const GamesScreen: React.FC = () => {
  const navigation = useNavigation<GamesScreenNavigationProp>();
  const { myGames, isLoading, fetchMyGames } = useGameStore();
  
  const [activeTab, setActiveTab] = useState('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      await fetchMyGames();
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchMyGames();
    } catch (error) {
      console.error('Error refreshing games:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getFilteredGames = () => {
    switch (activeTab) {
      case 'upcoming':
        return myGames.filter(game => game.status === 'UPCOMING');
      case 'completed':
        return myGames.filter(game => game.status === 'COMPLETED');
      case 'organized':
        return myGames.filter(game => game.organizer.id === 1); // Replace with actual user ID
      default:
        return myGames;
    }
  };

  const filteredGames = getFilteredGames();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Games</Text>
        <Text style={styles.titleNepali}>मेरा खेलहरू</Text>
        
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateGame')}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id ? styles.activeTab : styles.inactiveTab,
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons 
                name={tab.icon as keyof typeof Ionicons.glyphMap} 
                size={20} 
                color={activeTab === tab.id ? colors.primary : colors.textSecondary} 
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.id ? styles.activeTabText : styles.inactiveTabText,
              ]}>
                {tab.name}
              </Text>
              <Text style={[
                styles.tabTextNepali,
                activeTab === tab.id ? styles.activeTabTextNepali : styles.inactiveTabTextNepali,
              ]}>
                {tab.nameNepali}
              </Text>
            </TouchableOpacity>
          ))}
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
        {/* Empty State */}
        {filteredGames.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Ionicons 
              name={activeTab === 'upcoming' ? 'calendar-outline' : 
                    activeTab === 'completed' ? 'checkmark-circle-outline' : 'person-outline'} 
              size={64} 
              color={colors.textLight} 
            />
            <Text style={styles.emptyStateTitle}>
              {activeTab === 'upcoming' ? 'No upcoming games' :
               activeTab === 'completed' ? 'No completed games' :
               'No organized games'}
            </Text>
            <Text style={styles.emptyStateText}>
              {activeTab === 'upcoming' ? 
                'Join games from the Explore tab to see them here.' :
               activeTab === 'completed' ? 
                'Games you\'ve completed will appear here.' :
                'Games you\'ve organized will appear here.'}
            </Text>
            {activeTab === 'upcoming' && (
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => navigation.navigate('MainTabs', { screen: 'Explore' })}
              >
                <Text style={styles.exploreButtonText}>Explore Games</Text>
              </TouchableOpacity>
            )}
            {(activeTab === 'organized' || activeTab === 'upcoming') && (
              <TouchableOpacity
                style={styles.createGameButton}
                onPress={() => navigation.navigate('CreateGame')}
              >
                <Text style={styles.createGameButtonText}>Create a Game</Text>
              </TouchableOpacity>
            )}
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
            <Text style={styles.loadingText}>Loading games...</Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Stats Summary */}
      <View style={[styles.statsContainer, shadows.lg]}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{myGames.length}</Text>
          <Text style={styles.statLabel}>Total Games</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {myGames.filter(g => g.status === 'UPCOMING').length}
          </Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {myGames.filter(g => g.status === 'COMPLETED').length}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>
    </View>
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  createButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  tabsContainer: {
    paddingBottom: spacing.lg,
  },
  tab: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginLeft: spacing.xl,
    borderRadius: 12,
    minWidth: 90,
  },
  activeTab: {
    backgroundColor: colors.primary + '20',
  },
  inactiveTab: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.xs,
  },
  activeTabText: {
    color: colors.primary,
  },
  inactiveTabText: {
    color: colors.textSecondary,
  },
  tabTextNepali: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginTop: 2,
  },
  activeTabTextNepali: {
    color: colors.primary,
    opacity: 0.8,
  },
  inactiveTabTextNepali: {
    color: colors.textLight,
  },
  gamesList: {
    flex: 1,
  },
  gameCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['4xl'],
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing.xl,
  },
  exploreButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  exploreButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.onSecondary,
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
  loading: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  bottomPadding: {
    height: spacing['4xl'],
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
});