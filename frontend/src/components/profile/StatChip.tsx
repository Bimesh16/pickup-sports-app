import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatChipProps {
  value: number;
  label: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

const StatChip: React.FC<StatChipProps> = ({ 
  value, 
  label, 
  color = '#22D3EE',
  size = 'medium'
}) => {
  const sizeStyles = {
    small: { padding: 8, fontSize: 14, minWidth: 60 },
    medium: { padding: 12, fontSize: 16, minWidth: 80 },
    large: { padding: 16, fontSize: 18, minWidth: 100 }
  };

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: color + '20',
        borderColor: color,
        ...sizeStyles[size]
      }
    ]}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={[styles.label, { color: color + 'CC' }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default StatChip;
