import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { SportType, SkillLevel } from '@/types/game';
import { apiService } from '@/services/api';

const SPORTS: { type: SportType; name: string; icon: string }[] = [
  { type: 'FOOTBALL', name: 'Football', icon: 'football' },
  { type: 'BASKETBALL', name: 'Basketball', icon: 'basketball' },
  { type: 'CRICKET', name: 'Cricket', icon: 'baseball' },
  { type: 'BADMINTON', name: 'Badminton', icon: 'tennisball' },
  { type: 'TENNIS', name: 'Tennis', icon: 'tennisball' },
  { type: 'VOLLEYBALL', name: 'Volleyball', icon: 'american-football' },
  { type: 'FUTSAL', name: 'Futsal', icon: 'football' },
];

const SKILL_LEVELS: { level: SkillLevel; name: string; description: string }[] = [
  { level: 'BEGINNER', name: 'Beginner', description: 'New to the sport' },
  { level: 'INTERMEDIATE', name: 'Intermediate', description: 'Some experience' },
  { level: 'ADVANCED', name: 'Advanced', description: 'Very experienced' },
];

export const CreateGameScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sport: null as SportType | null,
    dateTime: '',
    duration: '',
    maxPlayers: '',
    cost: '',
    skillLevel: null as SkillLevel | null,
    locationId: '',
    locationName: '',
    rules: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateGame = async () => {
    if (!formData.title || !formData.sport || !formData.dateTime || !formData.maxPlayers) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const gameData = {
        title: formData.title,
        description: formData.description,
        sport: formData.sport,
        dateTime: new Date(formData.dateTime).toISOString(),
        duration: parseInt(formData.duration) || 60,
        maxPlayers: parseInt(formData.maxPlayers),
        cost: parseFloat(formData.cost) || 0,
        skillLevel: formData.skillLevel || 'BEGINNER',
        locationId: formData.locationId || '1', // Default location
        equipment: [],
        rules: formData.rules,
      };

      const response = await apiService.createGame(gameData);
      if (response.success) {
        Alert.alert('Success', 'Game created successfully!');
        // Reset form or navigate back
      } else {
        Alert.alert('Error', response.error || 'Failed to create game');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create game');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSportSelector = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Sport *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.sportsContainer}>
          {SPORTS.map((sport) => (
            <TouchableOpacity
              key={sport.type}
              style={[
                styles.sportOption,
                formData.sport === sport.type && styles.selectedSportOption
              ]}
              onPress={() => updateFormData('sport', sport.type)}
            >
              <Ionicons 
                name={sport.icon as any} 
                size={24} 
                color={formData.sport === sport.type ? colors.textLight : colors.primary} 
              />
              <Text style={[
                styles.sportText,
                formData.sport === sport.type && styles.selectedSportText
              ]}>
                {sport.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderSkillLevelSelector = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Skill Level</Text>
      {SKILL_LEVELS.map((skill) => (
        <TouchableOpacity
          key={skill.level}
          style={[
            styles.skillOption,
            formData.skillLevel === skill.level && styles.selectedSkillOption
          ]}
          onPress={() => updateFormData('skillLevel', skill.level)}
        >
          <View style={styles.skillInfo}>
            <Text style={[
              styles.skillName,
              formData.skillLevel === skill.level && styles.selectedSkillName
            ]}>
              {skill.name}
            </Text>
            <Text style={styles.skillDescription}>{skill.description}</Text>
          </View>
          <View style={[
            styles.radioButton,
            formData.skillLevel === skill.level && styles.selectedRadioButton
          ]}>
            {formData.skillLevel === skill.level && (
              <Ionicons name="checkmark" size={16} color={colors.textLight} />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Game</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Game Title *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
              placeholder="e.g., Friday Night Football"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder="Tell players about your game..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          {renderSportSelector()}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Date & Time *</Text>
            <TouchableOpacity style={styles.dateTimeButton}>
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <Text style={styles.dateTimeText}>
                {formData.dateTime || 'Select date and time'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rowContainer}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Duration (minutes)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.duration}
                onChangeText={(value) => updateFormData('duration', value)}
                placeholder="90"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Max Players *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.maxPlayers}
                onChangeText={(value) => updateFormData('maxPlayers', value)}
                placeholder="22"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Cost per Player (NPR)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.cost}
              onChangeText={(value) => updateFormData('cost', value)}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Location *</Text>
            <TouchableOpacity style={styles.locationButton}>
              <Ionicons name="location" size={20} color={colors.primary} />
              <Text style={styles.locationText}>
                {formData.locationName || 'Select location'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {renderSkillLevelSelector()}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createButton, isLoading && styles.disabledButton]}
          onPress={handleCreateGame}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.textLight} />
          ) : (
            <Text style={styles.createButtonText}>Create Game</Text>
          )}
        </TouchableOpacity>
      </View>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: spacing.lg,
  },
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  sportsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xs,
  },
  sportOption: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xs,
    minWidth: 80,
  },
  selectedSportOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sportText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  selectedSportText: {
    color: colors.textLight,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  dateTimeText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  locationText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  skillOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  selectedSkillOption: {
    backgroundColor: colors.surfaceVariant,
    borderColor: colors.primary,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text,
  },
  selectedSkillName: {
    color: colors.primary,
  },
  skillDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadioButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.md,
  },
  disabledButton: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textLight,
  },
});