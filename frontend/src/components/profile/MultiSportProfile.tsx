import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

interface MultiSportProfileProps {
  sportProfiles: ScoutingReportData[];
  onAddSport: () => void;
  onEditSport: (profile: ScoutingReportData) => void;
  onRemoveSport: (sport: string) => void;
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

const SPORT_COLORS: { [key: string]: string } = {
  soccer: '#22C55E',
  basketball: '#F97316',
  volleyball: '#06B6D4',
  tennis: '#84CC16',
  pickleball: '#A855F7',
  cricket: '#3B82F6',
  badminton: '#EF4444',
  running: '#F59E0B',
};

const MultiSportProfile: React.FC<MultiSportProfileProps> = ({
  sportProfiles,
  onAddSport,
  onEditSport,
  onRemoveSport,
}) => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [expandAll, setExpandAll] = useState(false);

  const toggleCard = (sport: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(sport)) {
      newExpanded.delete(sport);
    } else {
      newExpanded.add(sport);
    }
    setExpandedCards(newExpanded);
  };

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedCards(new Set());
      setExpandAll(false);
    } else {
      setExpandedCards(new Set(sportProfiles.map(profile => profile.sport)));
      setExpandAll(true);
    }
  };

  const handleRemoveSport = (sport: string) => {
    Alert.alert(
      'Remove Sport',
      `Are you sure you want to remove ${sport} from your profile?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onRemoveSport(sport) },
      ]
    );
  };

  const renderSportCard = (profile: ScoutingReportData) => {
    const isExpanded = expandedCards.has(profile.sport);
    const sportColor = SPORT_COLORS[profile.sport] || colors.primary;
    const sportEmoji = SPORT_EMOJIS[profile.sport] || '⚽';

    return (
      <View key={profile.sport} style={[styles.sportCard, { borderLeftColor: sportColor }]}>
        <TouchableOpacity
          style={styles.sportCardHeader}
          onPress={() => toggleCard(profile.sport)}
        >
          <View style={styles.sportInfo}>
            <Text style={styles.sportEmoji}>{sportEmoji}</Text>
            <View style={styles.sportDetails}>
              <Text style={styles.sportName}>{profile.sport.charAt(0).toUpperCase() + profile.sport.slice(1)}</Text>
              <Text style={styles.sportSummary}>
                {profile.nickname} • {profile.skillLevel} • {profile.travelRadius}km • {profile.positions.slice(0, 2).join(', ')}
                {profile.positions.length > 2 && '...'}
              </Text>
            </View>
          </View>
          <View style={styles.sportActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEditSport(profile)}
            >
              <Ionicons name="create-outline" size={16} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleRemoveSport(profile.sport)}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textSecondary}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.sportDetailsExpanded}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nickname:</Text>
              <Text style={styles.detailValue}>{profile.nickname}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Positions:</Text>
              <Text style={styles.detailValue}>{profile.positions.join(', ')}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Play Style:</Text>
              <Text style={styles.detailValue}>{profile.playStyle.join(', ')}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Superpower:</Text>
              <Text style={styles.detailValue}>{profile.superpower}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Formats:</Text>
              <Text style={styles.detailValue}>{profile.formats.join(', ')}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Availability:</Text>
              <Text style={styles.detailValue}>{profile.availability}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fun Fact:</Text>
              <Text style={styles.detailValue}>{profile.funFact}</Text>
            </View>
            
            <View style={styles.badgeRow}>
              <View style={[styles.skillBadge, { backgroundColor: sportColor + '20' }]}>
                <Ionicons name="star" size={14} color={sportColor} />
                <Text style={[styles.badgeText, { color: sportColor }]}>{profile.skillLevel}</Text>
              </View>
              
              <View style={styles.distanceBadge}>
                <Ionicons name="location" size={14} color="#3B82F6" />
                <Text style={[styles.badgeText, { color: '#3B82F6' }]}>{profile.travelRadius}km radius</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (sportProfiles.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🏀</Text>
        <Text style={styles.emptyTitle}>No Sports Added Yet</Text>
        <Text style={styles.emptyDescription}>
          Add your first sport to start building your player profile and get game recommendations!
        </Text>
        <TouchableOpacity style={styles.addFirstSportButton} onPress={onAddSport}>
          <Text style={styles.addFirstSportButtonText}>Add Your First Sport</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Sports Profile</Text>
          <Text style={styles.subtitle}>
            {sportProfiles.length} sport{sportProfiles.length !== 1 ? 's' : ''} • Ready to play
          </Text>
        </View>
        <View style={styles.headerActions}>
          {sportProfiles.length > 1 && (
            <TouchableOpacity style={styles.expandAllButton} onPress={toggleExpandAll}>
              <Text style={styles.expandAllButtonText}>
                {expandAll ? 'Collapse All' : 'Expand All'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.addSportButton} onPress={onAddSport}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addSportButtonText}>Add Sport</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sportCards}>
        {sportProfiles.map(renderSportCard)}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 We'll recommend games based on your sports and find the nearest ones for you!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  expandAllButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  addSportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addSportButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: '#fff',
  },
  sportCards: {
    gap: 12,
  },
  sportCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
  },
  sportCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sportEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  sportDetails: {
    flex: 1,
  },
  sportName: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  sportSummary: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  sportActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  sportDetailsExpanded: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#3B82F620',
    gap: 4,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  addFirstSportButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addFirstSportButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    marginTop: spacing.md,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default MultiSportProfile;
