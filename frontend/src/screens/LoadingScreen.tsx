import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { NepalColors, FontSizes } from '@/constants/theme';

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={NepalColors.primary} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: NepalColors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: FontSizes.lg,
    color: NepalColors.text,
  },
});