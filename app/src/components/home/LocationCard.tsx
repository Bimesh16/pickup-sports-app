import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors, typography, spacing, shadows } from '@/constants/theme';

interface LocationCardProps {
  location: Location.LocationObject | null;
  onLocationPress: () => void;
  style?: ViewStyle;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onLocationPress,
  style,
}) => {
  const getLocationText = (): string => {
    if (!location) {
      return 'Enable location to find nearby games';
    }
    
    // For demo purposes, show Kathmandu area
    return 'Kathmandu, Nepal';
  };

  const getLocationTextNepali = (): string => {
    if (!location) {
      return 'नजिकका खेलहरू फेला पार्न स्थान सक्षम गर्नुहोस्';
    }
    
    return 'काठमाडौं, नेपाल';
  };

  return (
    <TouchableOpacity
      style={[styles.container, shadows.md, style]}
      onPress={onLocationPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={location ? "location" : "location-outline"} 
            size={24} 
            color={location ? colors.success : colors.warning} 
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.locationText}>
            {getLocationText()}
          </Text>
          <Text style={styles.locationTextNepali}>
            {getLocationTextNepali()}
          </Text>
          
          {location && (
            <View style={styles.accuracyInfo}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.accuracyText}>
                Location enabled • Accuracy: {location.coords.accuracy?.toFixed(0)}m
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.arrow}>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
      </View>
      
      {!location && (
        <View style={styles.enableButton}>
          <Text style={styles.enableButtonText}>Enable Location</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  locationText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  locationTextNepali: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  accuracyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accuracyText: {
    fontSize: typography.fontSize.xs,
    color: colors.success,
    marginLeft: spacing.xs,
  },
  arrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enableButton: {
    backgroundColor: colors.warning + '20',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  enableButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.warning,
  },
});