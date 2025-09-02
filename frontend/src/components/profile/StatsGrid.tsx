import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from 'react-native-paper';
import { NepalColors, commonStyles } from '../../styles/theme';

interface StatsGridProps {
  stats: any;
  loading: boolean;
}

/**
 * Stats Grid with animated counters
 */
const StatsGrid: React.FC<StatsGridProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <Card style={styles.loadingCard}>
        <Card.Content style={styles.loadingContent}>
          <Text style={styles.loadingText}>Loading your stats...</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Performance</Text>
      <View style={styles.grid}>
        <StatCard
          icon="calendar"
          value={stats.gamesPlayed || 0}
          label="Games Played"
          color={NepalColors.primaryBlue}
          delay={0}
        />
        <StatCard
          icon="trophy"
          value={stats.gamesWon || 0}
          label="Games Won"
          color={NepalColors.success}
          delay={100}
        />
        <StatCard
          icon="star"
          value={`${(stats.averageRating || 0).toFixed(1)}`}
          label="Rating"
          color={NepalColors.warning}
          delay={200}
        />
        <StatCard
          icon="flash"
          value={stats.winStreak || 0}
          label="Win Streak"
          color={NepalColors.primaryCrimson}
          delay={300}
        />
      </View>
    </View>
  );
};

/**
 * Individual Stat Card with animation
 */
interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: number | string;
  label: string;
  color: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color, delay }) => {
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
    <Animated.View style={[styles.statCard, animatedStyle]}>
      <Card style={styles.statCardInner}>
        <LinearGradient
          colors={[color, color + 'CC']}
          style={styles.statGradient}
        >
          <Ionicons name={icon} size={24} color={NepalColors.primaryWhite} />
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
        </LinearGradient>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: commonStyles.padding.large,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    marginBottom: commonStyles.padding.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: commonStyles.padding.medium,
  },
  statCard: {
    width: '48%',
  },
  statCardInner: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  statGradient: {
    padding: commonStyles.padding.large,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: NepalColors.primaryWhite,
    marginTop: commonStyles.padding.small,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.primaryWhite,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 4,
  },
  loadingCard: {
    backgroundColor: NepalColors.surface,
    marginBottom: commonStyles.padding.large,
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: commonStyles.padding.xl,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
  },
});

export default StatsGrid;