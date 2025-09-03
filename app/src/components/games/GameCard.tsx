import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Game } from '@/types/game';
import { colors, typography, spacing, shadows } from '@/constants/theme';

interface GameCardProps {
  game: Game;
  onPress: () => void;
  style?: ViewStyle;
  compact?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPress, style, compact = false }) => {
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'UPCOMING': return colors.success;
      case 'IN_PROGRESS': return colors.warning;
      case 'COMPLETED': return colors.textSecondary;
      case 'CANCELLED': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getSportIcon = (sportName: string): keyof typeof Ionicons.glyphMap => {
    switch (sportName.toLowerCase()) {
      case 'futsal':
      case 'football':
        return 'football';
      case 'basketball':
        return 'basketball';
      case 'cricket':
        return 'baseball';
      case 'volleyball':
        return 'basketball'; // Using basketball as placeholder
      default:
        return 'fitness';
    }
  };

  const availableSpots = game.maxParticipants - game.currentParticipants;
  const isAlmostFull = availableSpots <= 2;
  const isFull = availableSpots === 0;

  return (
    <TouchableOpacity
      style={[
        compact ? styles.compactContainer : styles.container,
        shadows.md,
        style
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.sportIconContainer}>
            <Ionicons 
              name={getSportIcon(game.sport.name)} 
              size={compact ? 16 : 20} 
              color={colors.primary} 
            />
          </View>
          <View style={styles.titleText}>
            <Text style={[styles.title, compact && styles.compactTitle]} numberOfLines={1}>
              {game.title}
            </Text>
            <Text style={[styles.sport, compact && styles.compactSport]}>
              {game.sport.name}
            </Text>
          </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(game.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(game.status) }]}>
            {game.status}
          </Text>
        </View>
      </View>

      {/* Game Info */}
      <View style={styles.gameInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            {formatDate(game.startTime)} • {formatTime(game.startTime)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.infoText} numberOfLines={1}>
            {game.venue.name}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            {game.currentParticipants}/{game.maxParticipants} players
          </Text>
          {isAlmostFull && !isFull && (
            <Text style={styles.almostFullText}>Almost Full!</Text>
          )}
          {isFull && (
            <Text style={styles.fullText}>Full</Text>
          )}
        </View>

        {!compact && (
          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              NPR {game.costPerPerson.toLocaleString()}
            </Text>
            <Text style={styles.skillLevel}>
              {game.skillLevel}
            </Text>
          </View>
        )}
      </View>

      {/* Organizer */}
      {!compact && (
        <View style={styles.organizer}>
          <View style={styles.organizerAvatar}>
            <Text style={styles.organizerInitial}>
              {game.organizer.firstName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.organizerName}>
            Organized by {game.organizer.firstName} {game.organizer.lastName}
          </Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.participants}>
          {game.participants.slice(0, 3).map((participant, index) => (
            <View key={participant.id} style={[styles.participantAvatar, { marginLeft: index * -8 }]}>
              <Text style={styles.participantInitial}>
                {participant.firstName.charAt(0).toUpperCase()}
              </Text>
            </View>
          ))}
          {game.participants.length > 3 && (
            <View style={[styles.participantAvatar, { marginLeft: -8 }]}>
              <Text style={styles.participantInitial}>
                +{game.participants.length - 3}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          {availableSpots > 0 ? (
            <View style={styles.spotsAvailable}>
              <Text style={styles.spotsText}>
                {availableSpots} spot{availableSpots !== 1 ? 's' : ''} left
              </Text>
            </View>
          ) : (
            <View style={styles.spotsFull}>
              <Text style={styles.spotsFullText}>Full</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  compactContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sportIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  titleText: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  compactTitle: {
    fontSize: typography.fontSize.base,
  },
  sport: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  compactSport: {
    fontSize: typography.fontSize.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  gameInfo: {
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  almostFullText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.warning,
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fullText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.error,
    backgroundColor: colors.error + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  skillLevel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.secondary,
    backgroundColor: colors.secondary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  organizer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  organizerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  organizerInitial: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.onPrimary,
  },
  organizerName: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participants: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  participantInitial: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.onSecondary,
  },
  actions: {
    alignItems: 'flex-end',
  },
  spotsAvailable: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  spotsText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.success,
  },
  spotsFull: {
    backgroundColor: colors.error + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  spotsFullText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.error,
  },
});