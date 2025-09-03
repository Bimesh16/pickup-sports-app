import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/MainNavigator';
import { colors, typography, spacing, shadows } from '@/constants/theme';

type PaymentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Payment'>;
type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'Payment'>;

export const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<PaymentScreenNavigationProp>();
  const route = useRoute<PaymentScreenRouteProp>();
  const { gameId, provider } = route.params;

  const handlePayment = () => {
    Alert.alert('Coming Soon', `${provider} payment integration will be implemented soon!`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Payment</Text>
        <Text style={styles.headerTitleNepali}>भुक्तानी</Text>
        
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={[styles.card, shadows.md]}>
          <View style={styles.providerIcon}>
            <Ionicons 
              name={provider === 'ESEWA' ? 'wallet' : 'card'} 
              size={64} 
              color={colors.primary} 
            />
          </View>
          <Text style={styles.providerTitle}>{provider} Payment</Text>
          <Text style={styles.comingSoonText}>
            {provider} payment integration is under development. You'll be able to pay for games using {provider} soon!
          </Text>
          
          <TouchableOpacity
            style={[styles.payButton, shadows.sm]}
            onPress={handlePayment}
          >
            <Text style={styles.payButtonText}>Pay with {provider}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  headerTitleNepali: {
    position: 'absolute',
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    alignSelf: 'center',
    marginTop: 24,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing['3xl'],
    alignItems: 'center',
  },
  providerIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  providerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  comingSoonText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing.xl,
  },
  payButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
  },
  payButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.onPrimary,
  },
});