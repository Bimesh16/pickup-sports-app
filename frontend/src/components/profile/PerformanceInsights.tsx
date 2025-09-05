import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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

interface PerformanceInsightsProps {
  userStats: UserStats;
  onFindGames: () => void;
  onCreateGame: () => void;
  onFindPractice: () => void;
}

interface Insight {
  type: 'positive' | 'warning' | 'info' | 'achievement';
  title: string;
  description: string;
  icon: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const PerformanceInsights: React.FC<PerformanceInsightsProps> = ({
  userStats,
  onFindGames,
  onCreateGame,
  onFindPractice,
}) => {
  const generateInsights = (stats: UserStats): Insight[] => {
    const insights: Insight[] = [];

    // Win Rate Analysis
    if (stats.winRate >= 80) {
      insights.push({
        type: 'positive',
        title: 'Excellent Performance!',
        description: `You're winning ${stats.winRate.toFixed(1)}% of your games. Keep up the great work!`,
        icon: 'trophy',
        action: {
          label: 'Find Games',
          onPress: onFindGames,
        },
      });
    } else if (stats.winRate >= 60) {
      insights.push({
        type: 'positive',
        title: 'Good Performance',
        description: `You're winning ${stats.winRate.toFixed(1)}% of your games. You're doing well!`,
        icon: 'thumbs-up',
        action: {
          label: 'Find Games',
          onPress: onFindGames,
        },
      });
    } else if (stats.winRate >= 40) {
      insights.push({
        type: 'info',
        title: 'Room for Improvement',
        description: `You're winning ${stats.winRate.toFixed(1)}% of your games. Consider practicing more!`,
        icon: 'trending-up',
        action: {
          label: 'Find Practice',
          onPress: onFindPractice,
        },
      });
    } else if (stats.totalGamesPlayed > 0) {
      insights.push({
        type: 'warning',
        title: 'Keep Practicing',
        description: `You're winning ${stats.winRate.toFixed(1)}% of your games. Don't give up!`,
        icon: 'bulb',
        action: {
          label: 'Find Practice',
          onPress: onFindPractice,
        },
      });
    }

    // Streak Analysis
    if (stats.currentStreak >= 5) {
      insights.push({
        type: 'achievement',
        title: 'On Fire! 🔥',
        description: `You're on a ${stats.currentStreak}-game winning streak!`,
        icon: 'flame',
        action: {
          label: 'Find Games',
          onPress: onFindGames,
        },
      });
    } else if (stats.currentStreak >= 3) {
      insights.push({
        type: 'positive',
        title: 'Hot Streak',
        description: `You're on a ${stats.currentStreak}-game winning streak!`,
        icon: 'flame',
        action: {
          label: 'Find Games',
          onPress: onFindGames,
        },
      });
    }

    // Consistency Analysis
    if (stats.totalGamesPlayed >= 20) {
      insights.push({
        type: 'positive',
        title: 'Consistent Player',
        description: `You've played ${stats.totalGamesPlayed} games. Your consistency is impressive!`,
        icon: 'calendar',
        action: {
          label: 'Create Game',
          onPress: onCreateGame,
        },
      });
    } else if (stats.totalGamesPlayed >= 10) {
      insights.push({
        type: 'info',
        title: 'Getting Active',
        description: `You've played ${stats.totalGamesPlayed} games. Keep playing to build your stats!`,
        icon: 'fitness',
        action: {
          label: 'Find Games',
          onPress: onFindGames,
        },
      });
    } else if (stats.totalGamesPlayed > 0) {
      insights.push({
        type: 'info',
        title: 'New Player',
        description: `You've played ${stats.totalGamesPlayed} games. Play more to unlock insights!`,
        icon: 'star',
        action: {
          label: 'Find Games',
          onPress: onFindGames,
        },
      });
    } else {
      insights.push({
        type: 'info',
        title: 'Start Playing',
        description: 'Play your first game to start building your performance insights!',
        icon: 'play',
        action: {
          label: 'Find Games',
          onPress: onFindGames,
        },
      });
    }

    // Best Streak Analysis
    if (stats.longestStreak >= 10) {
      insights.push({
        type: 'achievement',
        title: 'Streak Legend',
        description: `Your best streak is ${stats.longestStreak} games. Incredible!`,
        icon: 'trophy',
      });
    } else if (stats.longestStreak >= 5) {
      insights.push({
        type: 'positive',
        title: 'Streak Master',
        description: `Your best streak is ${stats.longestStreak} games. Great job!`,
        icon: 'medal',
      });
    }

    return insights;
  };

  const insights = generateInsights(userStats);

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'positive':
        return {
          backgroundColor: '#10B98120',
          borderColor: '#10B981',
          iconColor: '#10B981',
        };
      case 'warning':
        return {
          backgroundColor: '#F59E0B20',
          borderColor: '#F59E0B',
          iconColor: '#F59E0B',
        };
      case 'info':
        return {
          backgroundColor: '#3B82F620',
          borderColor: '#3B82F6',
          iconColor: '#3B82F6',
        };
      case 'achievement':
        return {
          backgroundColor: '#8B5CF620',
          borderColor: '#8B5CF6',
          iconColor: '#8B5CF6',
        };
      default:
        return {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          iconColor: colors.textSecondary,
        };
    }
  };

  const renderInsight = (insight: Insight, index: number) => {
    const style = getInsightStyle(insight.type);

    return (
      <View
        key={index}
        style={[
          styles.insightCard,
          {
            backgroundColor: style.backgroundColor,
            borderColor: style.borderColor,
          },
        ]}
      >
        <View style={styles.insightHeader}>
          <View style={[styles.insightIcon, { backgroundColor: style.backgroundColor }]}>
            <Ionicons name={insight.icon as any} size={20} color={style.iconColor} />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightDescription}>{insight.description}</Text>
          </View>
        </View>
        {insight.action && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: style.borderColor }]}
            onPress={insight.action.onPress}
          >
            <Text style={[styles.actionButtonText, { color: style.iconColor }]}>
              {insight.action.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance Insights</Text>
        <Text style={styles.subtitle}>Based on your game history</Text>
      </View>

      <View style={styles.insightsList}>
        {insights.map(renderInsight)}
      </View>

      {insights.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No insights available yet</Text>
        </View>
      )}
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
    marginBottom: 16,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  insightsList: {
    gap: 12,
  },
  insightCard: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  insightDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  actionButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
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

export default PerformanceInsights;
