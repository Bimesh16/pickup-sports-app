import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, shadows } from '@/constants/theme';

interface QuickActionCardProps {
  title: string;
  titleNepali?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  style?: ViewStyle;
}

const { width } = Dimensions.get('window');

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  titleNepali,
  icon,
  color,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, { borderColor: color + '30' }, shadows.sm, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      
      {titleNepali && (
        <Text style={styles.titleNepali} numberOfLines={1}>
          {titleNepali}
        </Text>
      )}
      
      <View style={[styles.arrow, { backgroundColor: color + '20' }]}>
        <Ionicons name="arrow-forward" size={16} color={color} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.4,
    marginRight: spacing.md,
    minHeight: 120,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  titleNepali: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  arrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
});