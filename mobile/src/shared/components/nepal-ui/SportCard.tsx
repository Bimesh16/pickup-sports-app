import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NepalColors, NepalGradients, NepalBorderRadius, NepalSpacing, NepalShadows, getCulturalSportInfo } from '../../../design-system/nepal-theme';

export interface SportCardProps {
  sport: 'futsal' | 'cricket' | 'basketball' | 'volleyball' | 'tennis';
  gameCount: number;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  showNepaliText?: boolean;
  style?: any;
}

export const SportCard: React.FC<SportCardProps> = ({
  sport,
  gameCount,
  onPress,
  size = 'md',
  showNepaliText = true,
  style,
}) => {
  // Get cultural information for the sport
  const sportInfo = getCulturalSportInfo(sport);
  
  // Size configurations
  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          width: 120,
          height: 140,
          iconSize: 24,
          titleSize: 12,
          nepaliSize: 10,
          countSize: 10,
          padding: NepalSpacing.sm,
        };
      case 'md':
        return {
          width: 160,
          height: 180,
          iconSize: 32,
          titleSize: 16,
          nepaliSize: 12,
          countSize: 12,
          padding: NepalSpacing.md,
        };
      case 'lg':
        return {
          width: 200,
          height: 220,
          iconSize: 40,
          titleSize: 18,
          nepaliSize: 14,
          countSize: 14,
          padding: NepalSpacing.lg,
        };
      default:
        return {
          width: 160,
          height: 180,
          iconSize: 32,
          titleSize: 16,
          nepaliSize: 12,
          countSize: 12,
          padding: NepalSpacing.md,
        };
    }
  };

  const sizeConfig = getSizeConfig();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          width: sizeConfig.width,
          height: sizeConfig.height,
        },
        NepalShadows.md,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={sportInfo.gradient}
        style={[
          styles.gradientContainer,
          {
            borderRadius: NepalBorderRadius.lg,
            padding: sizeConfig.padding,
          },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Sport Icon */}
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={sportInfo.icon as any}
            size={sizeConfig.iconSize}
            color={NepalColors.snow_white}
            style={styles.sportIcon}
          />
        </View>

        {/* Sport Name */}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.sportName,
              {
                fontSize: sizeConfig.titleSize,
              },
            ]}
          >
            {sport.charAt(0).toUpperCase() + sport.slice(1)}
          </Text>
          
          {showNepaliText && (
            <Text
              style={[
                styles.sportNameNepali,
                {
                  fontSize: sizeConfig.nepaliSize,
                },
              ]}
            >
              {sportInfo.cultural_name}
            </Text>
          )}
        </View>

        {/* Game Count */}
        <View style={styles.countContainer}>
          <Text
            style={[
              styles.gameCount,
              {
                fontSize: sizeConfig.countSize,
              },
            ]}
          >
            {gameCount} games
          </Text>
          {showNepaliText && (
            <Text
              style={[
                styles.gameCountNepali,
                {
                  fontSize: sizeConfig.countSize - 2,
                },
              ]}
            >
              आज
            </Text>
          )}
        </View>

        {/* Cultural Pattern Overlay */}
        <View style={styles.patternOverlay}>
          {/* Add subtle cultural pattern based on sport */}
          {sport === 'futsal' && (
            <View style={styles.prayerFlagPattern}>
              {/* Small prayer flag elements */}
              <View style={[styles.miniFlag, { backgroundColor: NepalColors.prayer_flag_red }]} />
              <View style={[styles.miniFlag, { backgroundColor: NepalColors.prayer_flag_blue }]} />
              <View style={[styles.miniFlag, { backgroundColor: NepalColors.prayer_flag_yellow }]} />
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: NepalBorderRadius.lg,
    overflow: 'hidden',
    margin: NepalSpacing.xs,
  },
  gradientContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: NepalSpacing.sm,
  },
  sportIcon: {
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  textContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  sportName: {
    color: NepalColors.snow_white,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sportNameNepali: {
    color: NepalColors.snow_white,
    fontFamily: 'Noto Sans Devanagari',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  countContainer: {
    alignItems: 'center',
    marginBottom: NepalSpacing.xs,
  },
  gameCount: {
    color: NepalColors.snow_white,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gameCountNepali: {
    color: NepalColors.snow_white,
    fontFamily: 'Noto Sans Devanagari',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 1,
    opacity: 0.8,
  },
  patternOverlay: {
    position: 'absolute',
    top: NepalSpacing.xs,
    right: NepalSpacing.xs,
  },
  prayerFlagPattern: {
    flexDirection: 'row',
    gap: 2,
  },
  miniFlag: {
    width: 6,
    height: 4,
    opacity: 0.6,
  },
});

// Specialized sport card variants
export const FutsalCard: React.FC<Omit<SportCardProps, 'sport'>> = (props) => (
  <SportCard {...props} sport="futsal" />
);

export const CricketCard: React.FC<Omit<SportCardProps, 'sport'>> = (props) => (
  <SportCard {...props} sport="cricket" />
);

export const BasketballCard: React.FC<Omit<SportCardProps, 'sport'>> = (props) => (
  <SportCard {...props} sport="basketball" />
);

export const VolleyballCard: React.FC<Omit<SportCardProps, 'sport'>> = (props) => (
  <SportCard {...props} sport="volleyball" />
);

export const TennisCard: React.FC<Omit<SportCardProps, 'sport'>> = (props) => (
  <SportCard {...props} sport="tennis" />
);

export default SportCard;
