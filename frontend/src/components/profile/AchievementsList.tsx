import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NepalColors, commonStyles } from '../../styles/theme';
import { Achievement } from '../../types';

interface AchievementsListProps {
  userId: number;
}

// Mock achievements data
const mockAchievements: Achievement[] = [
  {
    id: 'first_game',
    name: 'First Game',
    description: 'Played your first pickup game',
    icon: 'trophy',
    rarity: 'common',
    unlockedAt: new Date().toISOString(),
  },
  {
    id: 'team_player',
    name: 'Team Player',
    description: 'Played 10 games with other players',
    icon: 'people',
    rarity: 'rare',
    unlockedAt: new Date().toISOString(),
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Played games in 5 different locations',
    icon: 'location',
    rarity: 'epic',
    unlockedAt: new Date().toISOString(),
  },
  {
    id: 'host_master',
    name: 'Host Master',
    description: 'Created 25 successful games',
    icon: 'star',
    rarity: 'legendary',
    progress: 15,
    maxProgress: 25,
  },
];

/**
 * Achievements List Component
 */
const AchievementsList: React.FC<AchievementsListProps> = ({ userId }) => {
  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return NepalColors.onSurfaceVariant;
      case 'rare': return NepalColors.info;
      case 'epic': return NepalColors.primaryCrimson;
      case 'legendary': return NepalColors.warning;
      default: return NepalColors.onSurfaceVariant;
    }
  };

  // Render achievement item
  const renderAchievement = ({ item }: { item: Achievement }) => {
    const rarityColor = getRarityColor(item.rarity);
    const isUnlocked = !!item.unlockedAt;
    
    return (
      <View style={[
        styles.achievementItem,
        !isUnlocked && styles.lockedAchievement,
      ]}>
        <View style={[styles.achievementIcon, { backgroundColor: rarityColor + '20' }]}>
          <Ionicons
            name={item.icon as any}
            size={24}
            color={isUnlocked ? rarityColor : NepalColors.onSurfaceVariant}
          />
        </View>
        
        <View style={styles.achievementContent}>
          <Text style={[
            styles.achievementName,
            !isUnlocked && styles.lockedText,
          ]}>
            {item.name}
          </Text>
          <Text style={[
            styles.achievementDescription,
            !isUnlocked && styles.lockedText,
          ]}>
            {item.description}
          </Text>
          
          {/* Progress bar for locked achievements */}
          {!isUnlocked && item.progress !== undefined && item.maxProgress && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(item.progress / item.maxProgress) * 100}%`,
                      backgroundColor: rarityColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {item.progress}/{item.maxProgress}
              </Text>
            </View>
          )}
          
          {/* Rarity badge */}
          <View style={[styles.rarityBadge, { backgroundColor: rarityColor + '15' }]}>
            <Text style={[styles.rarityText, { color: rarityColor }]}>
              {item.rarity.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Achievements</Text>
      <FlatList
        data={mockAchievements}
        renderItem={renderAchievement}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 400,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    marginBottom: commonStyles.padding.large,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: commonStyles.padding.medium,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: commonStyles.padding.medium,
    paddingHorizontal: commonStyles.padding.medium,
    marginBottom: commonStyles.padding.small,
    backgroundColor: NepalColors.surface,
    borderRadius: commonStyles.borderRadius.medium,
    borderWidth: 1,
    borderColor: NepalColors.outline,
  },
  lockedAchievement: {
    opacity: 0.6,
    backgroundColor: NepalColors.surfaceVariant,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: commonStyles.padding.medium,
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    lineHeight: 16,
    marginBottom: commonStyles.padding.small,
  },
  lockedText: {
    color: NepalColors.onSurfaceVariant,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: commonStyles.padding.small,
    gap: commonStyles.padding.small,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: NepalColors.outline,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.onSurfaceVariant,
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: commonStyles.padding.small,
    paddingVertical: 2,
    borderRadius: commonStyles.borderRadius.small,
  },
  rarityText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 0.5,
  },
});

export default AchievementsList;