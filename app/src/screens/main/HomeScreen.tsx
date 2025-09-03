import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import { RootStackParamList } from '@/navigation/MainNavigator';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import { GameCard } from '@/components/games/GameCard';
import { QuickActionCard } from '@/components/home/QuickActionCard';
import { LocationCard } from '@/components/home/LocationCard';
import { colors, typography, spacing, shadows } from '@/constants/theme';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuthStore();
  const { 
    games, 
    myGames, 
    isLoading, 
    fetchGames, 
    fetchMyGames, 
    fetchNearbyFutsal, 
    fetchRecommendedGames 
  } = useGameStore();
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    requestLocationPermission();
    loadInitialData();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Please enable location services to find games near you.'
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentLocation);

      // Fetch nearby futsal games
      if (user?.id) {
        fetchNearbyFutsal(currentLocation.coords.latitude, currentLocation.coords.longitude);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadInitialData = async () => {
    try {
      await Promise.all([
        fetchGames(),
        fetchMyGames(),
        user?.id && fetchRecommendedGames(user.id),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
      if (location && user?.id) {
        await fetchNearbyFutsal(location.coords.latitude, location.coords.longitude);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getGreetingNepali = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'शुभ प्रभात';
    if (hour < 17) return 'शुभ दिन';
    return 'शुभ साँझ';
  };

  const nearbyGames = games.slice(0, 5);
  const upcomingGames = myGames.filter(game => game.status === 'UPCOMING').slice(0, 3);

  return (
    <ScrollView
      style={styles.container}
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>{getGreeting()}</Text>
          <Text style={styles.greetingTextNepali}>{getGreetingNepali()}</Text>
          <Text style={styles.userName}>{user?.firstName || 'Player'}!</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Location Card */}
      <LocationCard 
        location={location}
        onLocationPress={() => {}}
        style={styles.locationCard}
      />

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActions}
        >
          <QuickActionCard
            title="Create Game"
            titleNepali="खेल बनाउनुहोस्"
            icon="add-circle"
            color={colors.primary}
            onPress={() => navigation.navigate('CreateGame')}
          />
          <QuickActionCard
            title="Find Futsal"
            titleNepali="फुटसल खेल्नुहोस्"
            icon="football"
            color={colors.secondary}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Explore' })}
          />
          <QuickActionCard
            title="My Games"
            titleNepali="मेरा खेलहरू"
            icon="list"
            color={colors.success}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Games' })}
          />
        </ScrollView>
      </View>

      {/* Nearby Games */}
      {nearbyGames.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Games</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Explore' })}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.gamesScroll}
          >
            {nearbyGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onPress={() => navigation.navigate('GameDetails', { gameId: game.id })}
                style={styles.gameCard}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* My Upcoming Games */}
      {upcomingGames.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Upcoming Games</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Games' })}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {upcomingGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPress={() => navigation.navigate('GameDetails', { gameId: game.id })}
              style={styles.upcomingGameCard}
              compact={true}
            />
          ))}
        </View>
      )}

      {/* Popular Areas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Areas in Kathmandu</Text>
        <View style={styles.areasGrid}>
          {['Thamel', 'Lazimpat', 'New Baneshwor', 'Pulchowk', 'Dillibazar', 'Maharajgunj'].map((area) => (
            <TouchableOpacity
              key={area}
              style={[styles.areaCard, shadows.sm]}
              onPress={() => {
                // Navigate to explore with area filter
                navigation.navigate('MainTabs', { 
                  screen: 'Explore',
                  params: { area } 
                });
              }}
            >
              <Ionicons name="location" size={20} color={colors.primary} />
              <Text style={styles.areaText}>{area}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom Padding */}
      <View style={styles.bottomPadding} />
    </ScrollView>
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
  greeting: {
    flex: 1,
  },
  greetingText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  greetingTextNepali: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  locationCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  seeAllText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  quickActions: {
    paddingLeft: spacing.xl,
    paddingRight: spacing.md,
  },
  gamesScroll: {
    paddingLeft: spacing.xl,
    paddingRight: spacing.md,
  },
  gameCard: {
    width: width * 0.8,
    marginRight: spacing.md,
  },
  upcomingGameCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  areasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xl,
  },
  areaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    marginRight: spacing.md,
    marginBottom: spacing.md,
    width: (width - spacing.xl * 2 - spacing.md) / 2,
  },
  areaText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  bottomPadding: {
    height: spacing['5xl'],
  },
});