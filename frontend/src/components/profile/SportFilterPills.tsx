import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface Sport {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

interface SportFilterPillsProps {
  sports: Sport[];
  selectedSport: string | null;
  onSportSelect: (sportId: string) => void;
}

const SPORTS: Sport[] = [
  { id: 'soccer', name: 'Soccer', emoji: '⚽', color: '#22C55E' },
  { id: 'basketball', name: 'Basketball', emoji: '🏀', color: '#F97316' },
  { id: 'volleyball', name: 'Volleyball', emoji: '🏐', color: '#06B6D4' },
  { id: 'tennis', name: 'Tennis', emoji: '🎾', color: '#84CC16' },
  { id: 'cricket', name: 'Cricket', emoji: '🏏', color: '#3B82F6' },
  { id: 'badminton', name: 'Badminton', emoji: '🏸', color: '#A855F7' },
  { id: 'running', name: 'Running', emoji: '🏃', color: '#EF4444' },
];

const SportFilterPills: React.FC<SportFilterPillsProps> = ({
  sports = SPORTS,
  selectedSport,
  onSportSelect
}) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {sports.map((sport) => (
        <TouchableOpacity
          key={sport.id}
          style={[
            styles.pill,
            selectedSport === sport.id && {
              backgroundColor: sport.color + '20',
              borderColor: sport.color,
            }
          ]}
          onPress={() => onSportSelect(sport.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.emoji}>{sport.emoji}</Text>
          <Text style={[
            styles.name,
            selectedSport === sport.id && { color: sport.color }
          ]}>
            {sport.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#30363D',
    backgroundColor: '#111827',
    minHeight: 44, // WCAG AA minimum touch target
  },
  emoji: {
    fontSize: 16,
    marginRight: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
});

export default SportFilterPills;
