import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/constants/theme';

export const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.title}>Pickup Sports Nepal</Text>
        <Text style={styles.subtitle}>पिकअप खेलकुद नेपाल</Text>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.onPrimary,
    marginTop: spacing.xl,
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.onPrimary,
    marginTop: spacing.sm,
    textAlign: 'center',
    opacity: 0.9,
  },
  loading: {
    fontSize: typography.fontSize.base,
    color: colors.onPrimary,
    marginTop: spacing.lg,
    opacity: 0.8,
  },
});