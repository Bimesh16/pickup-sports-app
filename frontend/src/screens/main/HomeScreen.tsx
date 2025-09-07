import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  useAnimatedScrollHandler,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { DECORATIVE } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme, locale } = useTheme();
  
  // State
  const [userStats, setUserStats] = useState({
    wins: 15,
    draws: 3,
    losses: 2,
    winRate: 75,
    currentStreak: 5,
    bestStreak: 8,
  });

  const [featuredGames, setFeaturedGames] = useState([
    {
      id: '1',
      sport: 'Football',
      time: '6:00 PM',
      location: 'Central Park',
      distance: '0.5 km',
      capacity: { current: 8, max: 11 },
      sportColor: '#10B981',
    },
    {
      id: '2',
      sport: 'Basketball',
      time: '7:30 PM',
      location: 'Community Center',
      distance: '1.2 km',
      capacity: { current: 6, max: 10 },
      sportColor: '#F59E0B',
    },
    {
      id: '3',
      sport: 'Cricket',
      time: 'Tomorrow 9:00 AM',
      location: 'Sports Complex',
      distance: '2.1 km',
      capacity: { current: 14, max: 22 },
      sportColor: '#3B82F6',
    },
  ]);

  // Animations
  const scrollY = useSharedValue(0);
  const headerHeight = useSharedValue(height * 0.3);
  
  const quickActions = [
    { id: 'find', title: locale === 'nepal' ? 'खेल खोज्नुहोस्' : 'Find Games', icon: 'search', span: 2, color: theme.colors.primary },
    { id: 'create', title: locale === 'nepal' ? 'खेल बनाउनुहोस्' : 'Create Game', icon: 'add-circle', span: 2, color: theme.colors.secondary },
    { id: 'my-games', title: locale === 'nepal' ? 'मेरो खेलहरू' : 'My Games', icon: 'calendar', span: 1, color: '#8B5CF6' },
    { id: 'chat', title: locale === 'nepal' ? 'च्याट' : 'Chat', icon: 'chatbubbles', span: 1, color: '#06B6D4' },
    { id: 'achievements', title: locale === 'nepal' ? 'उपलब्धिहरू' : 'Achievements', icon: 'trophy', span: 1, color: '#F59E0B' },
    { id: 'scouts', title: locale === 'nepal' ? 'स्काउट्स' : 'Scouts', icon: 'eye', span: 1, color: '#EF4444' },
  ];

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const handleQuickAction = async (actionId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    switch (actionId) {
      case 'find':
        navigation.navigate('Explore');
        break;
      case 'create':
        navigation.navigate('Create');
        break;
      case 'my-games':
        // Navigate to user games
        break;
      case 'chat':
        navigation.navigate('Chat');
        break;
      case 'achievements':
        // Navigate to achievements
        break;
      case 'scouts':
        // Navigate to scouts
        break;
    }
  };

  const handleGamePress = async (gameId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('GameDetails', { gameId });
  };

  // Animated Styles
  const headerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 200],
      [0, -50],
      'clamp'
    );
    
    const scale = interpolate(
      scrollY.value,
      [0, 200],
      [1, 0.9],
      'clamp'
    );

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  const gradientColors = locale === 'nepal' 
    ? DECORATIVE.GRADIENTS.NEPAL_SUNSET
    : DECORATIVE.GRADIENTS.GLOBAL_OCEAN;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with Himalayan Background */}
      <Animated.View style={[styles.header, headerStyle]}>
        <LinearGradient
          colors={gradientColors}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Decorative Himalayan SVG overlay would go here */}
        <View style={styles.decorativeOverlay} />
        
        <View style={styles.headerContent}>
          {/* User Avatar and Info */}
          <View style={styles.userInfo}>
            <View style={styles.sportRing}>
              <View style={[styles.sportRingInner, { borderColor: theme.colors.secondary }]}>
                <Image 
                  source={{ uri: 'https://via.placeholder.com/48x48.png?text=👤' }}
                  style={styles.avatar}
                />
              </View>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {locale === 'nepal' ? 'नमस्ते, राम!' : 'Hello, Ram!'}
              </Text>
              <Text style={styles.userSubtext}>
                {locale === 'nepal' ? 'खेल्न तयार?' : 'Ready to play?'}
              </Text>
            </View>
          </View>

          {/* Notifications Bell */}
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color="white" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>
          {/* Quick Actions Grid */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {locale === 'nepal' ? 'छिटो कार्यहरू' : 'Quick Actions'}
            </Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[
                    styles.quickActionCard,
                    { 
                      width: action.span === 2 ? '48%' : '31%',
                      backgroundColor: theme.colors.card,
                    }
                  ]}
                  onPress={() => handleQuickAction(action.id)}
                  activeOpacity={0.8}
                >
                  <BlurView intensity={10} tint="light" style={styles.quickActionBlur}>
                    <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                      <Ionicons name={action.icon as any} size={24} color={action.color} />
                    </View>
                    <Text style={[styles.quickActionTitle, { color: theme.colors.text }]}>
                      {action.title}
                    </Text>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {locale === 'nepal' ? 'तपाईंको प्रगति' : 'Your Progress'}
            </Text>
            
            <View style={styles.statsContainer}>
              {/* Win/Draw/Loss Chips */}
              <View style={styles.statsChips}>
                <View style={[styles.statChip, { backgroundColor: theme.colors.success }]}>
                  <Text style={styles.statNumber}>{userStats.wins}</Text>
                  <Text style={styles.statLabel}>
                    {locale === 'nepal' ? 'जित' : 'Wins'}
                  </Text>
                </View>
                <View style={[styles.statChip, { backgroundColor: '#F59E0B' }]}>
                  <Text style={styles.statNumber}>{userStats.draws}</Text>
                  <Text style={styles.statLabel}>
                    {locale === 'nepal' ? 'बराबरी' : 'Draws'}
                  </Text>
                </View>
                <View style={[styles.statChip, { backgroundColor: theme.colors.error }]}>
                  <Text style={styles.statNumber}>{userStats.losses}</Text>
                  <Text style={styles.statLabel}>
                    {locale === 'nepal' ? 'हार' : 'Losses'}
                  </Text>
                </View>
              </View>

              {/* Win Rate Gauge */}
              <View style={styles.winRateContainer}>
                <View style={styles.winRateGauge}>
                  <Text style={[styles.winRateText, { color: theme.colors.text }]}>
                    {userStats.winRate}%
                  </Text>
                  <Text style={[styles.winRateLabel, { color: theme.colors.textSecondary }]}>
                    {locale === 'nepal' ? 'जीत दर' : 'Win Rate'}
                  </Text>
                </View>
                
                {/* Streak Badges */}
                <View style={styles.streakBadges}>
                  <View style={styles.streakBadge}>
                    <Text style={styles.streakNumber}>{userStats.currentStreak}</Text>
                    <Text style={styles.streakLabel}>
                      {locale === 'nepal' ? 'हालको' : 'Current'}
                    </Text>
                  </View>
                  <View style={styles.streakBadge}>
                    <Text style={styles.streakNumber}>{userStats.bestStreak}</Text>
                    <Text style={styles.streakLabel}>
                      {locale === 'nepal' ? 'सर्वोत्तम' : 'Best'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Featured & Nearby Games */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {locale === 'nepal' ? 'नजिकका खेलहरू' : 'Nearby Games'}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                  {locale === 'nepal' ? 'सबै हेर्नुहोस्' : 'See All'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.gamesContainer}>
                {featuredGames.map((game) => (
                  <TouchableOpacity
                    key={game.id}
                    style={[styles.gameCard, { backgroundColor: theme.colors.card }]}
                    onPress={() => handleGamePress(game.id)}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={[`${game.sportColor}80`, `${game.sportColor}40`]}
                      style={styles.gameCardGradient}
                    >
                      <View style={styles.gameCardHeader}>
                        <View style={[styles.sportIcon, { backgroundColor: game.sportColor }]}>
                          <Ionicons name="football" size={16} color="white" />
                        </View>
                        <Text style={styles.gameTime}>{game.time}</Text>
                      </View>
                      
                      <Text style={styles.gameSport}>{game.sport}</Text>
                      <Text style={styles.gameLocation}>{game.location}</Text>
                      <Text style={styles.gameDistance}>{game.distance} away</Text>
                      
                      <View style={styles.capacityBar}>
                        <View style={styles.capacityBackground}>
                          <View 
                            style={[
                              styles.capacityFill, 
                              { 
                                width: `${(game.capacity.current / game.capacity.max) * 100}%`,
                                backgroundColor: game.sportColor
                              }
                            ]} 
                          />
                        </View>
                        <Text style={styles.capacityText}>
                          {game.capacity.current}/{game.capacity.max}
                        </Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Bottom Padding */}
          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: height * 0.25,
    overflow: 'hidden',
  },
  decorativeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sportRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  sportRingInner: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userDetails: {
    gap: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  userSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '2%',
    rowGap: 12,
  },
  quickActionCard: {
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionBlur: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  statsContainer: {
    gap: 16,
  },
  statsChips: {
    flexDirection: 'row',
    gap: 12,
  },
  statChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  winRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  winRateGauge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  winRateText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  winRateLabel: {
    fontSize: 10,
  },
  streakBadges: {
    flex: 1,
    gap: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F59E0B',
    width: 32,
  },
  streakLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  gamesContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  gameCard: {
    width: width * 0.8,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gameCardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  gameCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sportIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameTime: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gameSport: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  gameLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  gameDistance: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  capacityBar: {
    gap: 4,
  },
  capacityBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    borderRadius: 2,
  },
  capacityText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    alignSelf: 'flex-end',
  },
});

export default HomeScreen;