import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Title, TextInput, Button, Chip } from 'react-native-paper';
import { NepalColors, FontSizes, Spacing, BorderRadius } from '@/constants/theme';
import { CreateGameRequest, SportType, SkillLevel } from '@/types';

export default function CreateGameScreen() {
  const [formData, setFormData] = useState<Partial<CreateGameRequest>>({
    title: '',
    sport: 'FOOTBALL',
    description: '',
    dateTime: '',
    duration: 90,
    maxPlayers: 10,
    skillLevel: 'BEGINNER',
    cost: 0,
    equipment: [],
    rules: [],
  });

  const sports: SportType[] = ['FOOTBALL', 'BASKETBALL', 'CRICKET', 'BADMINTON', 'TENNIS', 'VOLLEYBALL', 'TABLE_TENNIS', 'FUTSAL'];
  const skillLevels: SkillLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateGame = async () => {
    // Validate form
    if (!formData.title || !formData.description || !formData.dateTime) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      // TODO: Call API to create game
      Alert.alert('Success', 'Game created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create game. Please try again.');
    }
  };

  const renderSportChips = () => (
    <View style={styles.chipContainer}>
      {sports.map((sport) => (
        <Chip
          key={sport}
          selected={formData.sport === sport}
          onPress={() => handleInputChange('sport', sport)}
          style={[
            styles.chip,
            formData.sport === sport && { backgroundColor: NepalColors.primary }
          ]}
          textStyle={[
            styles.chipText,
            formData.sport === sport && { color: NepalColors.textLight }
          ]}
        >
          {sport}
        </Chip>
      ))}
    </View>
  );

  const renderSkillLevelChips = () => (
    <View style={styles.chipContainer}>
      {skillLevels.map((level) => (
        <Chip
          key={level}
          selected={formData.skillLevel === level}
          onPress={() => handleInputChange('skillLevel', level)}
          style={[
            styles.chip,
            formData.skillLevel === level && { backgroundColor: NepalColors.primary }
          ]}
          textStyle={[
            styles.chipText,
            formData.skillLevel === level && { color: NepalColors.textLight }
          ]}
        >
          {level}
        </Chip>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Create New Game</Title>
        <Text style={styles.headerSubtitle}>Fill in the details to create your game</Text>
      </View>

      <Card style={styles.formCard}>
        <Card.Content style={styles.formContent}>
          {/* Game Title */}
          <TextInput
            label="Game Title *"
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            mode="outlined"
            style={styles.input}
            theme={{
              colors: {
                primary: NepalColors.primary,
              },
            }}
          />

          {/* Sport Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sport *</Text>
            {renderSportChips()}
          </View>

          {/* Description */}
          <TextInput
            label="Description *"
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
            theme={{
              colors: {
                primary: NepalColors.primary,
              },
            }}
          />

          {/* Date and Time */}
          <TextInput
            label="Date & Time *"
            value={formData.dateTime}
            onChangeText={(value) => handleInputChange('dateTime', value)}
            mode="outlined"
            placeholder="YYYY-MM-DD HH:MM"
            style={styles.input}
            theme={{
              colors: {
                primary: NepalColors.primary,
              },
            }}
          />

          {/* Duration */}
          <TextInput
            label="Duration (minutes)"
            value={formData.duration?.toString()}
            onChangeText={(value) => handleInputChange('duration', parseInt(value) || 90)}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            theme={{
              colors: {
                primary: NepalColors.primary,
              },
            }}
          />

          {/* Max Players */}
          <TextInput
            label="Maximum Players"
            value={formData.maxPlayers?.toString()}
            onChangeText={(value) => handleInputChange('maxPlayers', parseInt(value) || 10)}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            theme={{
              colors: {
                primary: NepalColors.primary,
              },
            }}
          />

          {/* Skill Level */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skill Level *</Text>
            {renderSkillLevelChips()}
          </View>

          {/* Cost */}
          <TextInput
            label="Cost per Player (Rs.)"
            value={formData.cost?.toString()}
            onChangeText={(value) => handleInputChange('cost', parseInt(value) || 0)}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            theme={{
              colors: {
                primary: NepalColors.primary,
              },
            }}
          />

          {/* Create Button */}
          <Button
            mode="contained"
            onPress={handleCreateGame}
            style={styles.createButton}
            contentStyle={styles.createButtonContent}
          >
            Create Game
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NepalColors.background,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: NepalColors.primary,
  },
  headerTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: 'bold',
    color: NepalColors.textLight,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: FontSizes.base,
    color: NepalColors.textLight,
    opacity: 0.9,
  },
  formCard: {
    margin: Spacing.lg,
    elevation: 4,
  },
  formContent: {
    padding: Spacing.lg,
  },
  input: {
    marginBottom: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: NepalColors.text,
    marginBottom: Spacing.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chipText: {
    fontSize: FontSizes.sm,
  },
  createButton: {
    backgroundColor: NepalColors.primary,
    marginTop: Spacing.lg,
  },
  createButtonContent: {
    paddingVertical: Spacing.sm,
  },
});