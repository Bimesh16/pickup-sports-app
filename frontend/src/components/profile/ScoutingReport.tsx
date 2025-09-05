import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';

interface ScoutingReportData {
  sport: string;
  nickname: string;
  positions: string[];
  playStyle: string[];
  superpower: string;
  formats: string[];
  availability: string;
  funFact: string;
  skillLevel: string;
  preferredSide: string;
  kitNumber: string;
  form: string;
  travelRadius: number;
  openToInvites: boolean;
}

interface ScoutingReportProps {
  data: ScoutingReportData;
  compact?: boolean;
}

const SPORT_EMOJIS: { [key: string]: string } = {
  soccer: '⚽',
  basketball: '🏀',
  volleyball: '🏐',
  tennis: '🎾',
  pickleball: '🏓',
  cricket: '🏏',
  badminton: '🏸',
  running: '🏃',
};

const ScoutingReport: React.FC<ScoutingReportProps> = ({ data, compact = false }) => {
  const sportEmoji = SPORT_EMOJIS[data.sport] || '⚽';
  const sportName = data.sport.charAt(0).toUpperCase() + data.sport.slice(1);

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactSportEmoji}>{sportEmoji}</Text>
          <Text style={styles.compactSportName}>{sportName}</Text>
        </View>
        <Text style={styles.compactSummary}>
          {data.nickname} • {data.positions.slice(0, 2).join(', ')}
          {data.positions.length > 2 && '...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.sportInfo}>
          <Text style={styles.sportEmoji}>{sportEmoji}</Text>
          <Text style={styles.sportText}>{sportName}</Text>
        </View>
        <Text style={styles.nickname}>{data.nickname}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Positions:</Text>
          <Text style={styles.detailValue}>{data.positions.join(', ')}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Play Style:</Text>
          <Text style={styles.detailValue}>{data.playStyle.join(', ')}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Superpower:</Text>
          <Text style={styles.detailValue}>{data.superpower}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Formats:</Text>
          <Text style={styles.detailValue}>{data.formats.join(', ')}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Availability:</Text>
          <Text style={styles.detailValue}>{data.availability}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fun Fact:</Text>
          <Text style={styles.detailValue}>{data.funFact}</Text>
        </View>

        <View style={styles.badgeRow}>
          <View style={styles.skillBadge}>
            <Text style={styles.badgeText}>⭐ {data.skillLevel}</Text>
          </View>
          <View style={styles.distanceBadge}>
            <Text style={styles.badgeText}>📍 {data.travelRadius}km</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  compactContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  sportText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  compactSportEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  compactSportName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  compactSummary: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  nickname: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
  content: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    width: 100,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  skillBadge: {
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceBadge: {
    backgroundColor: '#3B82F620',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.text,
  },
});

export default ScoutingReport;
