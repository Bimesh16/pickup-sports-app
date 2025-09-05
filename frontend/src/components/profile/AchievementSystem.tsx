import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../constants/theme';

interface UserStats {
  totalGamesPlayed: number;
  totalGamesWon: number;
  totalGamesLost: number;
  totalGamesDrawn: number;
  currentStreak: number;
  longestStreak: number;
  winRate: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

interface AchievementSystemProps {
  userStats: UserStats;
}

const AchievementSystem: React.FC<AchievementSystemProps> = ({ userStats }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  const calculateAchievements = (stats: UserStats): Achievement[] => {
    const achievements: Achievement[] = [
      // First Win Achievement
      {
        id: 'first_win',
        title: 'First Victory',
        description: 'Win your first game',
        icon: 'trophy',
        unlocked: stats.totalGamesWon >= 1,
        progress: Math.min(stats.totalGamesWon, 1),
        maxProgress: 1,
        rarity: 'common',
        points: 10,
      },
      // Win Streak Achievements
      {
        id: 'hot_streak_3',
        title: 'Hot Streak',
        description: 'Win 3 games in a row',
        icon: 'flame',
        unlocked: stats.currentStreak >= 3,
        progress: Math.min(stats.currentStreak, 3),
        maxProgress: 3,
        rarity: 'common',
        points: 25,
      },
      {
        id: 'on_fire_5',
        title: 'On Fire',
        description: 'Win 5 games in a row',
        icon: 'flame',
        unlocked: stats.currentStreak >= 5,
        progress: Math.min(stats.currentStreak, 5),
        maxProgress: 5,
        rarity: 'rare',
        points: 50,
      },
      {
        id: 'unstoppable_10',
        title: 'Unstoppable',
        description: 'Win 10 games in a row',
        icon: 'flash',
        unlocked: stats.currentStreak >= 10,
        progress: Math.min(stats.currentStreak, 10),
        maxProgress: 10,
        rarity: 'epic',
        points: 100,
      },
      // Best Streak Achievements
      {
        id: 'streak_master_5',
        title: 'Streak Master',
        description: 'Achieve a 5-game winning streak',
        icon: 'trophy',
        unlocked: stats.longestStreak >= 5,
        progress: Math.min(stats.longestStreak, 5),
        maxProgress: 5,
        rarity: 'rare',
        points: 40,
      },
      {
        id: 'streak_legend_10',
        title: 'Streak Legend',
        description: 'Achieve a 10-game winning streak',
        icon: 'trophy',
        unlocked: stats.longestStreak >= 10,
        progress: Math.min(stats.longestStreak, 10),
        maxProgress: 10,
        rarity: 'epic',
        points: 80,
      },
      // Win Rate Achievements
      {
        id: 'competitive_50',
        title: 'Competitive',
        description: 'Maintain 50% win rate over 10+ games',
        icon: 'trending-up',
        unlocked: stats.winRate >= 50 && stats.totalGamesPlayed >= 10,
        progress: Math.min(stats.winRate, 50),
        maxProgress: 50,
        rarity: 'common',
        points: 20,
      },
      {
        id: 'dominant_75',
        title: 'Dominant',
        description: 'Maintain 75% win rate over 20+ games',
        icon: 'trending-up',
        unlocked: stats.winRate >= 75 && stats.totalGamesPlayed >= 20,
        progress: Math.min(stats.winRate, 75),
        maxProgress: 75,
        rarity: 'rare',
        points: 60,
      },
      {
        id: 'unbeatable_90',
        title: 'Unbeatable',
        description: 'Maintain 90% win rate over 30+ games',
        icon: 'shield-checkmark',
        unlocked: stats.winRate >= 90 && stats.totalGamesPlayed >= 30,
        progress: Math.min(stats.winRate, 90),
        maxProgress: 90,
        rarity: 'legendary',
        points: 150,
      },
      // Consistency Achievements
      {
        id: 'consistent_player',
        title: 'Consistent Player',
        description: 'Play 20+ games',
        icon: 'calendar',
        unlocked: stats.totalGamesPlayed >= 20,
        progress: Math.min(stats.totalGamesPlayed, 20),
        maxProgress: 20,
        rarity: 'common',
        points: 30,
      },
      {
        id: 'undefeated',
        title: 'Undefeated',
        description: 'Never lost in 10+ games',
        icon: 'shield',
        unlocked: stats.totalGamesLost === 0 && stats.totalGamesPlayed >= 10,
        progress: stats.totalGamesLost === 0 ? Math.min(stats.totalGamesPlayed, 10) : 0,
        maxProgress: 10,
        rarity: 'legendary',
        points: 200,
      },
      // Activity Achievement
      {
        id: 'active_player',
        title: 'Active Player',
        description: 'Play 50+ games',
        icon: 'fitness',
        unlocked: stats.totalGamesPlayed >= 50,
        progress: Math.min(stats.totalGamesPlayed, 50),
        maxProgress: 50,
        rarity: 'epic',
        points: 120,
      },
    ];

    return achievements;
  };

  useEffect(() => {
    const calculatedAchievements = calculateAchievements(userStats);
    setAchievements(calculatedAchievements);
    
    const points = calculatedAchievements
      .filter(achievement => achievement.unlocked)
      .reduce((total, achievement) => total + achievement.points, 0);
    setTotalPoints(points);
  }, [userStats]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#6B7280';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      default: return colors.textSecondary;
    }
  };

  const getRarityBackground = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#6B728020';
      case 'rare': return '#3B82F620';
      case 'epic': return '#8B5CF620';
      case 'legendary': return '#F59E0B20';
      default: return colors.surface;
    }
  };

  const renderAchievement = (achievement: Achievement) => {
    const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;
    const rarityColor = getRarityColor(achievement.rarity);
    const rarityBackground = getRarityBackground(achievement.rarity);

    return (
      <TouchableOpacity
        key={achievement.id}
        style={[
          styles.achievementCard,
          { borderLeftColor: rarityColor },
          achievement.unlocked && styles.achievementUnlocked,
        ]}
        onPress={() => {
          if (achievement.unlocked) {
            Alert.alert(
              achievement.title,
              `${achievement.description}\n\nPoints: ${achievement.points}`,
              [{ text: 'OK' }]
            );
          }
        }}
      >
        <View style={styles.achievementHeader}>
          <View style={[styles.achievementIcon, { backgroundColor: rarityBackground }]}>
            <Ionicons
              name={achievement.icon as any}
              size={24}
              color={achievement.unlocked ? rarityColor : colors.textSecondary}
            />
          </View>
          <View style={styles.achievementInfo}>
            <Text style={[
              styles.achievementTitle,
              { color: achievement.unlocked ? colors.text : colors.textSecondary }
            ]}>
              {achievement.title}
            </Text>
            <Text style={styles.achievementDescription}>
              {achievement.description}
            </Text>
          </View>
          <View style={styles.achievementPoints}>
            <Text style={[styles.pointsText, { color: rarityColor }]}>
              {achievement.points}
            </Text>
            <Text style={styles.pointsLabel}>pts</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: achievement.unlocked ? rarityColor : colors.border,
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {achievement.progress}/{achievement.maxProgress}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
        <View style={styles.pointsContainer}>
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text style={styles.pointsText}>{totalPoints} points</Text>
        </View>
      </View>

      <ScrollView style={styles.achievementsList} showsVerticalScrollIndicator={false}>
        {unlockedAchievements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Unlocked ({unlockedAchievements.length})</Text>
            {unlockedAchievements.map(renderAchievement)}
          </View>
        )}

        {lockedAchievements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>In Progress ({lockedAchievements.length})</Text>
            {lockedAchievements.map(renderAchievement)}
          </View>
        )}

        {achievements.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No achievements available</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: '#F59E0B',
  },
  achievementsList: {
    maxHeight: 300,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  achievementCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    opacity: 0.7,
  },
  achievementUnlocked: {
    opacity: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  achievementPoints: {
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    minWidth: 40,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});

export default AchievementSystem;
