import React, { useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NepalColors, commonStyles } from '../../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - (commonStyles.padding.large * 2) - commonStyles.padding.medium) / 2;

interface QuickActionCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

/**
 * Quick Action Card with spring animations
 */
const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  icon,
  color,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    opacity.value = withSpring(0.8, { damping: 15, stiffness: 300 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, { width: CARD_WIDTH }, animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.touchable}
      >
        <LinearGradient
          colors={[color, color + 'DD']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={icon} size={28} color={NepalColors.primaryWhite} />
          <Text style={styles.title}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: commonStyles.padding.medium,
  },
  touchable: {
    borderRadius: commonStyles.borderRadius.large,
    overflow: 'hidden',
    ...commonStyles.shadows.medium,
  },
  gradient: {
    padding: commonStyles.padding.large,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryWhite,
    marginTop: commonStyles.padding.small,
    textAlign: 'center',
  },
});

export default QuickActionCard;