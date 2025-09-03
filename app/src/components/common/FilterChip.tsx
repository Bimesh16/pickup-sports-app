import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, typography, spacing } from '@/constants/theme';

interface FilterChipProps {
  label: string;
  labelNepali?: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  labelNepali,
  selected,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected ? styles.selected : styles.unselected,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.label,
        selected ? styles.selectedLabel : styles.unselectedLabel,
      ]}>
        {label}
      </Text>
      {labelNepali && (
        <Text style={[
          styles.labelNepali,
          selected ? styles.selectedLabelNepali : styles.unselectedLabelNepali,
        ]}>
          {labelNepali}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  selected: {
    backgroundColor: colors.primary,
  },
  unselected: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  selectedLabel: {
    color: colors.onPrimary,
  },
  unselectedLabel: {
    color: colors.text,
  },
  labelNepali: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginTop: 1,
  },
  selectedLabelNepali: {
    color: colors.onPrimary,
    opacity: 0.9,
  },
  unselectedLabelNepali: {
    color: colors.textSecondary,
  },
});