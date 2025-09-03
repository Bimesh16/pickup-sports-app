import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { Game } from '@/types/game';
import { useAuthStore } from '@/stores/authStore';

export const HomeScreen: React.FC = () => {
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([]);
  const [nearbyGames, setNearbyGames] = useState<Game[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    // Mock data for now - replace with actual API calls
    setUpcomingGames([
      {
        id: '1',
        title: 'Football at Ratna Park',
        sport: 'FOOTBALL',
        description: 'Friendly football match',
        dateTime: new Date(Date.now() + 3600000).toISOString(),
        duration: 90,
        location: {
          id: '1',
          name: 'Ratna Park',
          address: 'Ratna Park, Kathmandu',
          latitude: 27.7056,
          longitude: 85.3137,
          facilities: ['Grass field', 'Changing rooms'],
          rating: 4.5,
          photos: [],
        },
        maxPlayers: 22,
        currentPlayers: 18,
        skillLevel: 'INTERMEDIATE',
        cost: 200,
        currency: 'NPR',
        status: 'UPCOMING',
        organizerId: 'organizer1',
        organizer: {
          id: 'organizer1',
          name: 'Ram Sharma',
          rating: 4.8,
        },
        players: [],
        equipment: [],
        rules: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    setNearbyGames([
      {
        id: '2',
        title: 'Basketball at TU',
        sport: 'BASKETBALL',
        description: 'Quick basketball game',
        dateTime: new Date(Date.now() + 7200000).toISOString(),
        duration: 60,
        location: {
          id: '2',
          name: 'TU Basketball Court',
          address: 'Tribhuvan University, Kirtipur',
          latitude: 27.6766,
          longitude: 85.2924,
          facilities: ['Indoor court', 'Scoreboard'],
          rating: 4.2,
          photos: [],
        },
        maxPlayers: 10,
        currentPlayers: 6,
        skillLevel: 'BEGINNER',
        cost: 150,
        currency: 'NPR',
        status: 'UPCOMING',
        organizerId: 'organizer2',
        organizer: {
          id: 'organizer2',
          name: 'Sita Tamang',
          rating: 4.6,
        },
        players: [],
        equipment: [],
        rules: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
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

  const getSportIcon = (sport: string) => {
    switch (sport) {
      case 'FOOTBALL': return 'football';
      case 'BASKETBALL': return 'basketball';
      case 'CRICKET': return 'baseball';
      case 'BADMINTON': return 'tennisball';
      case 'TENNIS': return 'tennisball';
      case 'VOLLEYBALL': return 'american-football';
      default: return 'fitness';
    }
  };

  const renderGameCard = ({ item }: { item: Game }) => (
    <TouchableOpacity style={styles.gameCard}>
      <View style={styles.gameHeader}>
        <View style={styles.gameInfo}>
          <View style={styles.sportIconContainer}>
            <Ionicons 
              name={getSportIcon(item.sport) as any} 
              size={24} 
              color={colors.primary} 
            />
          </View>
          <View style={styles.gameDetails}>
            <Text style={styles.gameTitle}>{item.title}</Text>
            <Text style={styles.gameLocation}>{item.location.name}</Text>
          </View>
        </View>
        <View style={styles.gamePrice}>
          <Text style={styles.priceText}>NPR {item.cost}</Text>
        </View>
      </View>
      
      <View style={styles.gameMetrics}>
        <View style={styles.metricItem}>
          <Ionicons name="time" size={16} color={colors.textSecondary} />
          <Text style={styles.metricText}>{formatDateTime(item.dateTime)}</Text>
        </View>
        <View style={styles.metricItem}>
          <Ionicons name="people" size={16} color={colors.textSecondary} />
          <Text style={styles.metricText}>{item.currentPlayers}/{item.maxPlayers}</Text>
        </View>
        <View style={styles.metricItem}>
          <Ionicons name="trophy" size={16} color={colors.textSecondary} />
          <Text style={styles.metricText}>{item.skillLevel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[]}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Namaste,</Text>
                <Text style={styles.userName}>{user?.name || 'Player'}!</Text>
              </View>
              <TouchableOpacity style={styles.notificationButton}>
                <Ionicons name="notifications-outline" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{user?.stats?.gamesPlayed || 0}</Text>
                <Text style={styles.statLabel}>Games Played</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{user?.stats?.rating?.toFixed(1) || '0.0'}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{nearbyGames.length}</Text>
                <Text style={styles.statLabel}>Nearby Games</Text>
              </View>
            </View>

            {/* Your Upcoming Games */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Upcoming Games</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              {upcomingGames.length > 0 ? (
                <FlatList
                  data={upcomingGames}
                  renderItem={renderGameCard}
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyText}>No upcoming games</Text>
                  <Text style={styles.emptySubtext}>Join some games to see them here</Text>
                </View>
              )}
            </View>

            {/* Nearby Games */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Games Near You</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={nearbyGames}
                renderItem={renderGameCard}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
  greeting: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  notificationButton: {
    padding: spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    ...shadows.sm,
  },
  statNumber: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  viewAllText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  gameCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
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
    width: 40,
    height: 40,
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
  },
  gamePrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.secondary,
  },
  gameMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
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
  },
});