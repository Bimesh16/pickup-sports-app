import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { colors, typography, spacing, shadows } from '@/constants/theme';

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

const { width, height } = Dimensions.get('window');

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Background */}
      <View style={styles.background} />

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="football" size={64} color={colors.onPrimary} />
          </View>
          <Text style={styles.title}>Pickup Sports Nepal</Text>
          <Text style={styles.titleNepali}>पिकअप खेलकुद नेपाल</Text>
          <Text style={styles.subtitle}>
            Find and join futsal games near you
          </Text>
          <Text style={styles.subtitleNepali}>
            आफ्नो नजिकका फुटसल खेलहरू फेला पार्नुहोस्
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="location" size={24} color={colors.onPrimary} />
            <Text style={styles.featureText}>Find games nearby</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="people" size={24} color={colors.onPrimary} />
            <Text style={styles.featureText}>Connect with players</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="card" size={24} color={colors.onPrimary} />
            <Text style={styles.featureText}>Pay with eSewa/Khalti</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton, shadows.md]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <Text style={styles.primaryButtonTextNepali}>सुरु गर्नुहोस्</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, shadows.sm]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
            <Text style={styles.secondaryButtonTextNepali}>साइन इन गर्नुहोस्</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for Nepal
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    padding: spacing['3xl'],
    justifyContent: 'space-between',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing['5xl'],
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.onPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontFamily: 'Inter',
  },
  titleNepali: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.onPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    opacity: 0.9,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.onPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    opacity: 0.9,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.lg,
  },
  subtitleNepali: {
    fontSize: typography.fontSize.base,
    color: colors.onPrimary,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  features: {
    marginTop: spacing['4xl'],
    marginBottom: spacing.xl,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  featureText: {
    fontSize: typography.fontSize.base,
    color: colors.onPrimary,
    marginLeft: spacing.md,
    fontWeight: typography.fontWeight.medium,
  },
  actions: {
    marginBottom: spacing['2xl'],
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  primaryButtonTextNepali: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
    opacity: 0.8,
    marginTop: 2,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.onPrimary,
  },
  secondaryButtonTextNepali: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.onPrimary,
    opacity: 0.8,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.onPrimary,
    opacity: 0.7,
    fontWeight: typography.fontWeight.medium,
  },
});