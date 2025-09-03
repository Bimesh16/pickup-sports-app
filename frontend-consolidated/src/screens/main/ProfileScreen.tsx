import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color={colors.primary} />
        </View>
        <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.stats?.gamesPlayed || 0}</Text>
          <Text style={styles.statLabel}>Games Played</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.stats?.rating?.toFixed(1) || '0.0'}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.stats?.gamesWon || 0}</Text>
          <Text style={styles.statLabel}>Games Won</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  settingsButton: {
    padding: spacing.sm,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.error,
    marginLeft: spacing.sm,
  },
});