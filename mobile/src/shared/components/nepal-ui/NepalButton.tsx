import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NepalColors, NepalGradients, NepalBorderRadius, NepalSpacing, NepalShadows } from '../../../design-system/nepal-theme';

export interface NepalButtonProps {
  title: string;
  nepaliTitle?: string; // Optional Nepali text
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'cultural' | 'gold' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: readonly string[]; // Custom gradient colors
  culturalPattern?: 'prayer_flags' | 'temple_gold' | 'mountain' | 'mandala';
}

export const NepalButton: React.FC<NepalButtonProps> = ({
  title,
  nepaliTitle,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
  style,
  textStyle,
  gradient,
  culturalPattern,
}) => {
  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          colors: gradient || NepalGradients.nepal_flag,
          textColor: NepalColors.snow_white,
          shadow: NepalShadows.nepal_flag,
        };
      case 'secondary':
        return {
          colors: [NepalColors.secondary, NepalColors.mountain_blue],
          textColor: NepalColors.snow_white,
          shadow: NepalShadows.md,
        };
      case 'cultural':
        return {
          colors: gradient || NepalGradients.himalayan_sunset,
          textColor: NepalColors.text_primary,
          shadow: NepalShadows.lg,
        };
      case 'gold':
        return {
          colors: NepalGradients.temple_gold,
          textColor: NepalColors.text_primary,
          shadow: NepalShadows.lg,
        };
      case 'outline':
        return {
          colors: ['transparent', 'transparent'],
          textColor: NepalColors.primary,
          border: true,
          shadow: NepalShadows.sm,
        };
      default:
        return {
          colors: NepalGradients.nepal_flag,
          textColor: NepalColors.snow_white,
          shadow: NepalShadows.md,
        };
    }
  };

  // Get size-specific styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: NepalSpacing.sm,
          paddingHorizontal: NepalSpacing.md,
          fontSize: 12,
          borderRadius: NepalBorderRadius.sm,
        };
      case 'md':
        return {
          paddingVertical: NepalSpacing.md,
          paddingHorizontal: NepalSpacing.lg,
          fontSize: 14,
          borderRadius: NepalBorderRadius.md,
        };
      case 'lg':
        return {
          paddingVertical: NepalSpacing.lg,
          paddingHorizontal: NepalSpacing.xl,
          fontSize: 16,
          borderRadius: NepalBorderRadius.lg,
        };
      default:
        return {
          paddingVertical: NepalSpacing.md,
          paddingHorizontal: NepalSpacing.lg,
          fontSize: 14,
          borderRadius: NepalBorderRadius.md,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const buttonContent = (
    <>
      <div style={styles.contentContainer}>
        {icon && <div style={styles.iconContainer}>{icon}</div>}
        <div style={styles.textContainer}>
          <Text
            style={[
              styles.buttonText,
              {
                color: variantStyles.textColor,
                fontSize: sizeStyles.fontSize,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {nepaliTitle && (
            <Text
              style={[
                styles.nepaliText,
                {
                  color: variantStyles.textColor,
                  fontSize: sizeStyles.fontSize * 0.8,
                },
              ]}
            >
              {nepaliTitle}
            </Text>
          )}
        </div>
      </div>
    </>
  );

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          {
            paddingVertical: sizeStyles.paddingVertical,
            paddingHorizontal: sizeStyles.paddingHorizontal,
            borderRadius: sizeStyles.borderRadius,
            borderWidth: 2,
            borderColor: NepalColors.primary,
            backgroundColor: 'transparent',
          },
          variantStyles.shadow,
          disabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {buttonContent}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          borderRadius: sizeStyles.borderRadius,
        },
        variantStyles.shadow,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={variantStyles.colors as readonly [string, string, ...string[]]}
        style={[
          styles.gradientContainer,
          {
            borderRadius: sizeStyles.borderRadius,
          },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {buttonContent}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  gradientContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: NepalSpacing.sm,
  },
  textContainer: {
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  nepaliText: {
    fontFamily: 'Noto Sans Devanagari',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
});

// Cultural pattern variations
export const PrayerFlagButton: React.FC<Omit<NepalButtonProps, 'variant'>> = (props) => (
  <NepalButton
    {...props}
    variant="cultural"
    gradient={NepalGradients.prayer_flags}
    culturalPattern="prayer_flags"
  />
);

export const TempleGoldButton: React.FC<Omit<NepalButtonProps, 'variant'>> = (props) => (
  <NepalButton
    {...props}
    variant="gold"
    culturalPattern="temple_gold"
  />
);

export const MountainButton: React.FC<Omit<NepalButtonProps, 'variant'>> = (props) => (
  <NepalButton
    {...props}
    variant="secondary"
    gradient={NepalGradients.mountain_mist}
    culturalPattern="mountain"
  />
);

export default NepalButton;
