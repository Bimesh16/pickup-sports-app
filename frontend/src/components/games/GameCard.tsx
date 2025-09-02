import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Chip, Avatar } from 'react-native-paper';
import { NepalColors, commonStyles } from '../../styles/theme';
import { GameSummary } from '../../types';
import { formatDistance } from '../../stores/locationStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - (commonStyles.padding.large * 2);

interface GameCardProps {
  game: GameSummary;
  onPress: () => void;
  style?: any;
  variant?: 'default' | 'featured' | 'compact';
}

/**
 * Advanced Game Card Component
 * Features:
 * - Multiple variants for different contexts
 * - Press animations with spring physics
 * - Sport-specific colors and icons
 * - Distance calculation
 * - Availability indicators
 */
const GameCard: React.FC<GameCardProps> = ({
  game,
  onPress,
  style,
  variant = 'default',
}) => {
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Get sport icon and color
  const getSportInfo = useCallback((sport: string) => {
    const sportMap: Record<string, { icon: string; color: string }> = {
      futsal: { icon: 'football', color: NepalColors.futsalGreen },
      football: { icon: 'football', color: NepalColors.success },
      basketball: { icon: 'basketball', color: NepalColors.warning },
      cricket: { icon: 'baseball', color: NepalColors.primaryBlue },
      volleyball: { icon: 'tennisball', color: NepalColors.primaryCrimson },
      badminton: { icon: 'tennisball', color: NepalColors.info },
      'table-tennis': { icon: 'tennisball', color: NepalColors.futsalGreen },
      tennis: { icon: 'tennisball', color: NepalColors.success },
    };
    
    return sportMap[sport.toLowerCase()] || { icon: 'fitness', color: NepalColors.primaryCrimson };
  }, []);

  // Format game time
  const formatGameTime = useCallback((timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
  }, []);

  // Calculate availability
  const availableSlots = game.maxPlayers - game.currentPlayers;
  const isAlmostFull = availableSlots <= 2;
  const isFull = availableSlots <= 0;

  const sportInfo = getSportInfo(game.sport);

  // Press animation handlers
  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    opacity.value = withSpring(0.8, { damping: 15, stiffness: 300 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, []);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Render compact variant for horizontal lists
  if (variant === 'compact') {
    return (
      <Animated.View style={[styles.compactCard, animatedStyle]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <Card style={[styles.compactCardInner, style]}>
            <LinearGradient
              colors={[sportInfo.color, sportInfo.color + 'CC']}
              style={styles.compactGradient}
            >
              <Ionicons name={sportInfo.icon as any} size={24} color={NepalColors.primaryWhite} />
              <Text style={styles.compactTitle}>{game.sport}</Text>
              <Text style={styles.compactTime}>{formatGameTime(game.time)}</Text>
              <Text style={styles.compactPlayers}>
                {game.currentPlayers}/{game.maxPlayers}
              </Text>
            </LinearGradient>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Card style={styles.card}>
          {/* Header with sport and status */}
          <View style={styles.cardHeader}>
            <View style={styles.sportInfo}>
              <View style={[styles.sportIcon, { backgroundColor: sportInfo.color }]}>
                <Ionicons
                  name={sportInfo.icon as any}
                  size={20}
                  color={NepalColors.primaryWhite}
                />
              </View>
              <View>
                <Text style={styles.sportName}>{game.sport}</Text>
                <Text style={styles.skillLevel}>{game.skillLevel}</Text>
              </View>
            </View>
            
            <View style={styles.statusContainer}>
              <Chip
                mode="outlined"
                compact
                style={[
                  styles.statusChip,
                  isFull && styles.fullChip,
                  isAlmostFull && !isFull && styles.almostFullChip,
                ]}
                textStyle={[
                  styles.statusChipText,
                  isFull && styles.fullChipText,
                  isAlmostFull && !isFull && styles.almostFullChipText,
                ]}
              >
                {isFull ? 'Full' : isAlmostFull ? 'Almost Full' : 'Available'}
              </Chip>
            </View>
          </View>

          {/* Game Details */}
          <Card.Content style={styles.cardContent}>
            {/* Location */}
            <View style={styles.detailRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color={NepalColors.primaryCrimson}
              />
              <Text style={styles.detailText} numberOfLines={1}>
                {game.location}
              </Text>
              {game.distance && (
                <Text style={styles.distanceText}>
                  {formatDistance(game.distance)}
                </Text>
              )}
            </View>

            {/* Time */}
            <View style={styles.detailRow}>
              <Ionicons
                name="time-outline"
                size={16}
                color={NepalColors.primaryBlue}
              />
              <Text style={styles.detailText}>
                {formatGameTime(game.time)}
              </Text>
            </View>

            {/* Players */}
            <View style={styles.detailRow}>
              <Ionicons
                name="people-outline"
                size={16}
                color={NepalColors.futsalGreen}
              />
              <Text style={styles.detailText}>
                {game.currentPlayers}/{game.maxPlayers} players
              </Text>
              <Text style={styles.spotsLeft}>
                {availableSlots > 0 ? `${availableSlots} spots left` : 'Full'}
              </Text>
            </View>

            {/* Price */}
            <View style={styles.detailRow}>
              <Ionicons
                name="cash-outline"
                size={16}
                color={NepalColors.warning}
              />
              <Text style={styles.detailText}>
                Rs. {game.pricePerPlayer} per player
              </Text>
            </View>

            {/* Creator */}
            <View style={styles.creatorRow}>
              <Avatar.Icon
                size={24}
                icon="account"
                style={styles.creatorAvatar}
              />
              <Text style={styles.creatorText}>
                Created by {game.creatorName}
              </Text>
            </View>
          </Card.Content>

          {/* Action Footer */}
          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={[
                styles.joinButton,
                isFull && styles.joinButtonDisabled,
              ]}
              onPress={onPress}
              disabled={isFull}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.joinButtonText,
                isFull && styles.joinButtonTextDisabled,
              ]}>
                {isFull ? 'Game Full' : 'View Details'}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={isFull ? NepalColors.onSurfaceVariant : NepalColors.primaryWhite}
              />
            </TouchableOpacity>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: NepalColors.surface,
    borderRadius: commonStyles.borderRadius.large,
    ...commonStyles.shadows.medium,
    overflow: 'hidden',
  },
  compactCard: {
    width: 160,
    marginRight: commonStyles.padding.medium,
  },
  compactCardInner: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  compactGradient: {
    padding: commonStyles.padding.medium,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  compactTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryWhite,
    marginTop: commonStyles.padding.small,
    textAlign: 'center',
  },
  compactTime: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.primaryWhite,
    opacity: 0.9,
    marginTop: 2,
  },
  compactPlayers: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.primaryWhite,
    marginTop: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: commonStyles.padding.large,
    paddingBottom: commonStyles.padding.medium,
  },
  sportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: commonStyles.padding.medium,
  },
  sportName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    textTransform: 'capitalize',
  },
  skillLevel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    textTransform: 'capitalize',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusChip: {
    backgroundColor: NepalColors.success + '20',
    borderColor: NepalColors.success,
  },
  statusChipText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.success,
  },
  almostFullChip: {
    backgroundColor: NepalColors.warning + '20',
    borderColor: NepalColors.warning,
  },
  almostFullChipText: {
    color: NepalColors.warning,
  },
  fullChip: {
    backgroundColor: NepalColors.error + '20',
    borderColor: NepalColors.error,
  },
  fullChipText: {
    color: NepalColors.error,
  },
  cardContent: {
    paddingTop: 0,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: commonStyles.padding.small,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurface,
    marginLeft: commonStyles.padding.small,
    flex: 1,
  },
  distanceText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.primaryCrimson,
  },
  spotsLeft: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.onSurfaceVariant,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: commonStyles.padding.small,
    paddingTop: commonStyles.padding.small,
    borderTopWidth: 1,
    borderTopColor: NepalColors.outlineVariant,
  },
  creatorAvatar: {
    backgroundColor: NepalColors.primaryCrimson,
    marginRight: commonStyles.padding.small,
  },
  creatorText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
  },
  cardFooter: {
    padding: commonStyles.padding.large,
    paddingTop: commonStyles.padding.medium,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NepalColors.primaryCrimson,
    paddingVertical: commonStyles.padding.medium,
    borderRadius: commonStyles.borderRadius.medium,
    gap: commonStyles.padding.small,
  },
  joinButtonDisabled: {
    backgroundColor: NepalColors.surfaceVariant,
  },
  joinButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryWhite,
  },
  joinButtonTextDisabled: {
    color: NepalColors.onSurfaceVariant,
  },
});

export default GameCard;