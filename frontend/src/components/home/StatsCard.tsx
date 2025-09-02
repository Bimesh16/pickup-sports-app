import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useAuthUser } from '../../stores/authStore';
import { userAPI } from '../../services/api';
import { NepalColors, commonStyles } from '../../styles/theme';

/**
 * User Stats Card with animated counters
 */
const StatsCard: React.FC = () => {
  const user = useAuthUser();
  
  // Fetch user stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: () => userAPI.getMyStats(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Animation values
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(30);

  useEffect(() => {
    cardOpacity.value = withDelay(300, withSpring(1, { damping: 20, stiffness: 300 }));
    cardTranslateY.value = withDelay(300, withSpring(0, { damping: 20, stiffness: 300 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  if (!user || isLoading) {
    return (
      <Card style={styles.loadingCard}>
        <Card.Content style={styles.loadingContent}>
          <View style={styles.loadingIndicator} />
          <Text style={styles.loadingText}>Loading stats...</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Card style={styles.card}>
        <LinearGradient
          colors={[NepalColors.primaryBlue, NepalColors.primaryCrimson]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Your Sports Journey</Text>
              <Ionicons name="trophy" size={24} color={NepalColors.primaryWhite} />
            </View>
            
            <View style={styles.statsGrid}>
              <StatItem
                icon="calendar"
                value={stats?.gamesPlayed || 0}
                label="Games Played"
                delay={400}
              />
              <StatItem
                icon="add-circle"
                value={stats?.gamesCreated || 0}
                label="Games Created"
                delay={500}
              />
              <StatItem
                icon="location"
                value={`${(stats?.totalDistance || 0).toFixed(1)}km`}
                label="Distance Traveled"
                delay={600}
              />
              <StatItem
                icon="star"
                value={`${(stats?.averageRating || 0).toFixed(1)}`}
                label="Average Rating"
                delay={700}
              />
            </View>
          </View>
        </LinearGradient>
      </Card>
    </Animated.View>
  );
};

/**
 * Individual Stat Item with counter animation
 */
interface StatItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: number | string;
  label: string;
  delay: number;
}

const StatItem: React.FC<StatItemProps> = ({ icon, value, label, delay }) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 15, stiffness: 300 }));
    opacity.value = withDelay(delay, withSpring(1, { damping: 20, stiffness: 300 }));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.statItem, animatedStyle]}>
      <Ionicons name={icon} size={20} color={NepalColors.primaryWhite} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: commonStyles.padding.xl,
  },
  card: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: commonStyles.borderRadius.large,
  },
  content: {
    padding: commonStyles.padding.large,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: commonStyles.padding.large,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryWhite,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: commonStyles.padding.medium,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: NepalColors.primaryWhite,
    marginTop: commonStyles.padding.small,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.primaryWhite,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 2,
  },
  loadingCard: {
    backgroundColor: NepalColors.surface,
    marginBottom: commonStyles.padding.xl,
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: commonStyles.padding.xl,
  },
  loadingIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: NepalColors.surfaceVariant,
    marginBottom: commonStyles.padding.medium,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
  },
});

export default StatsCard;