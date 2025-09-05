import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Title, Paragraph, Button, RadioButton } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { NepalColors, FontSizes, Spacing, BorderRadius } from '@/constants/theme';
import { GameStackParamList } from '@/types';

type PaymentScreenRouteProp = RouteProp<GameStackParamList, 'Payment'>;

export default function PaymentScreen() {
  const route = useRoute<PaymentScreenRouteProp>();
  const { gameId, amount } = route.params;
  
  const [selectedMethod, setSelectedMethod] = useState('esewa');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    {
      id: 'esewa',
      name: 'eSewa',
      icon: 'card',
      description: 'Pay with eSewa wallet',
      color: '#4CAF50',
    },
    {
      id: 'khalti',
      name: 'Khalti',
      icon: 'card',
      description: 'Pay with Khalti wallet',
      color: '#5C2D91',
    },
    {
      id: 'connect_ips',
      name: 'Connect IPS',
      icon: 'card',
      description: 'Pay with Connect IPS',
      color: '#2196F3',
    },
    {
      id: 'cash',
      name: 'Cash',
      icon: 'cash',
      description: 'Pay at venue',
      color: '#FF9800',
    },
  ];

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      
      // TODO: Process payment based on selected method
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      Alert.alert(
        'Payment Successful',
        'Your payment has been processed successfully!',
        [{ text: 'OK', onPress: () => {/* Navigate back */} }]
      );
    } catch (error) {
      Alert.alert('Payment Failed', 'Please try again or use a different payment method.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentMethod = (method: typeof paymentMethods[0]) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethodCard,
        selectedMethod === method.id && styles.selectedPaymentMethod
      ]}
      onPress={() => setSelectedMethod(method.id)}
    >
      <View style={styles.paymentMethodContent}>
        <View style={styles.paymentMethodInfo}>
          <View style={[styles.paymentMethodIcon, { backgroundColor: method.color }]}>
            <Ionicons name={method.icon as any} size={24} color={NepalColors.textLight} />
          </View>
          <View style={styles.paymentMethodDetails}>
            <Text style={styles.paymentMethodName}>{method.name}</Text>
            <Text style={styles.paymentMethodDescription}>{method.description}</Text>
          </View>
        </View>
        <RadioButton
          value={method.id}
          status={selectedMethod === method.id ? 'checked' : 'unchecked'}
          onPress={() => setSelectedMethod(method.id)}
          color={NepalColors.primary}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Payment Summary */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title style={styles.summaryTitle}>Payment Summary</Title>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Game Fee</Text>
            <Text style={styles.summaryValue}>Rs. {amount}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Platform Fee</Text>
            <Text style={styles.summaryValue}>Rs. 0</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>Rs. {amount}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Payment Methods */}
      <Card style={styles.methodsCard}>
        <Card.Content>
          <Title style={styles.methodsTitle}>Select Payment Method</Title>
          
          <View style={styles.paymentMethodsList}>
            {paymentMethods.map(renderPaymentMethod)}
          </View>
        </Card.Content>
      </Card>

      {/* Terms and Conditions */}
      <Card style={styles.termsCard}>
        <Card.Content>
          <View style={styles.termsContent}>
            <Ionicons name="information-circle-outline" size={20} color={NepalColors.info} />
            <Text style={styles.termsText}>
              By proceeding with payment, you agree to our Terms of Service and Privacy Policy.
              Payment is non-refundable unless the game is cancelled by the organizer.
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Payment Button */}
      <View style={styles.paymentButtonContainer}>
        <Button
          mode="contained"
          onPress={handlePayment}
          loading={isProcessing}
          disabled={isProcessing}
          style={styles.paymentButton}
          contentStyle={styles.paymentButtonContent}
        >
          {isProcessing ? 'Processing...' : `Pay Rs. ${amount}`}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NepalColors.background,
  },
  summaryCard: {
    margin: Spacing.lg,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: NepalColors.text,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: FontSizes.base,
    color: NepalColors.textSecondary,
  },
  summaryValue: {
    fontSize: FontSizes.base,
    color: NepalColors.text,
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: NepalColors.border,
    marginVertical: Spacing.md,
  },
  totalLabel: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: NepalColors.text,
  },
  totalValue: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: NepalColors.primary,
  },
  methodsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    elevation: 2,
  },
  methodsTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: NepalColors.text,
    marginBottom: Spacing.md,
  },
  paymentMethodsList: {
    gap: Spacing.sm,
  },
  paymentMethodCard: {
    borderWidth: 1,
    borderColor: NepalColors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  selectedPaymentMethod: {
    borderColor: NepalColors.primary,
    backgroundColor: NepalColors.surfaceVariant,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: NepalColors.text,
    marginBottom: Spacing.xs,
  },
  paymentMethodDescription: {
    fontSize: FontSizes.sm,
    color: NepalColors.textSecondary,
  },
  termsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    elevation: 2,
  },
  termsContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  termsText: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSizes.sm,
    color: NepalColors.textSecondary,
    lineHeight: 20,
  },
  paymentButtonContainer: {
    padding: Spacing.lg,
  },
  paymentButton: {
    backgroundColor: NepalColors.primary,
  },
  paymentButtonContent: {
    paddingVertical: Spacing.sm,
  },
});