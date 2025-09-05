import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../constants/theme';

interface ScoutingReportData {
  sport: string;
  nickname: string;
  positions: string[];
  playStyle: string[];
  superpower: string;
  formats: string[];
  availability: string;
  funFact: string;
  skillLevel: string;
  preferredSide: string;
  kitNumber: string;
  form: string;
  travelRadius: number;
  openToInvites: boolean;
}

interface ScoutingReportEditorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: ScoutingReportData) => void;
  editingProfile?: ScoutingReportData | null;
  onUpdateProfile?: (data: ScoutingReportData) => void;
}

const SPORT_DATA = {
  soccer: {
    name: 'Soccer',
    emoji: '⚽',
    positions: ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'],
    playStyles: ['press-resistant', 'one-touch passer', 'box-to-box', 'playmaker', 'finisher', 'defensive anchor', 'wing-back', 'target man'],
    formats: ['5v5', '7v7', '11v11', 'league'],
    preferredSide: 'foot'
  },
  basketball: {
    name: 'Basketball',
    emoji: '🏀',
    positions: ['PG', 'SG', 'SF', 'PF', 'C'],
    playStyles: ['catch-and-shoot', 'off-ball mover', 'playmaker', 'defensive specialist', 'rebounder', 'scorer', 'facilitator'],
    formats: ['1v1', '3v3', '4v4', '5v5', 'league'],
    preferredSide: 'hand'
  },
  volleyball: {
    name: 'Volleyball',
    emoji: '🏐',
    positions: ['OH', 'MB', 'OPP', 'S', 'L', 'DS'],
    playStyles: ['steady passer', 'explosive arm', 'defensive specialist', 'setter', 'blocker', 'server'],
    formats: ['co-ed 6s', 'men\'s 6s', 'women\'s 6s', 'beach 2s', 'beach 4s'],
    preferredSide: 'hand'
  },
  tennis: {
    name: 'Tennis',
    emoji: '🎾',
    positions: ['Singles', 'Doubles'],
    playStyles: ['heavy topspin', 'patient rallies', 'aggressive baseliner', 'serve-and-volley', 'all-court', 'counter-puncher'],
    formats: ['Singles', 'Doubles', 'Mixed Doubles'],
    preferredSide: 'hand'
  },
  pickleball: {
    name: 'Pickleball',
    emoji: '🏓',
    positions: ['Singles', 'Doubles'],
    playStyles: ['soft hands', 'quick resets', 'aggressive dinking', 'power player', 'strategic', 'defensive'],
    formats: ['Singles', 'Doubles', 'Mixed Doubles'],
    preferredSide: 'hand'
  },
  cricket: {
    name: 'Cricket',
    emoji: '🏏',
    positions: ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'],
    playStyles: ['tight spells', 'busy bat', 'aggressive hitter', 'defensive specialist', 'pace bowler', 'spin bowler'],
    formats: ['T20', 'ODI', 'Test', 'league'],
    preferredSide: 'hand'
  },
  badminton: {
    name: 'Badminton',
    emoji: '🏸',
    positions: ['Singles', 'Doubles', 'Mixed Doubles'],
    playStyles: ['fast drives', 'net kills', 'defensive specialist', 'aggressive', 'tactical', 'power player'],
    formats: ['Singles', 'Doubles', 'Mixed Doubles'],
    preferredSide: 'hand'
  },
  running: {
    name: 'Running',
    emoji: '🏃',
    positions: ['Sprint', 'Middle Distance', 'Long Distance', 'Marathon'],
    playStyles: ['smooth cadence', 'even splits', 'negative splits', 'tempo runner', 'interval specialist', 'endurance'],
    formats: ['5K', '10K', 'Half Marathon', 'Marathon', 'Track'],
    preferredSide: 'foot'
  }
};

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Elite'];

const ScoutingReportEditor: React.FC<ScoutingReportEditorProps> = ({
  visible,
  onClose,
  onSave,
  editingProfile,
  onUpdateProfile,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ScoutingReportData>({
    sport: '',
    nickname: '',
    positions: [],
    playStyle: [],
    superpower: '',
    formats: [],
    availability: '',
    funFact: '',
    skillLevel: '',
    preferredSide: '',
    kitNumber: '',
    form: '',
    travelRadius: 10,
    openToInvites: true,
  });

  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (editingProfile) {
      setFormData(editingProfile);
      setCurrentStep(1);
    } else {
      setFormData({
        sport: '',
        nickname: '',
        positions: [],
        playStyle: [],
        superpower: '',
        formats: [],
        availability: '',
        funFact: '',
        skillLevel: '',
        preferredSide: '',
        kitNumber: '',
        form: '',
        travelRadius: 10,
        openToInvites: true,
      });
      setCurrentStep(1);
    }
  }, [editingProfile, visible]);

  useEffect(() => {
    if (formData.sport && SPORT_DATA[formData.sport as keyof typeof SPORT_DATA]) {
      setIsUpdating(true);
      const sportData = SPORT_DATA[formData.sport as keyof typeof SPORT_DATA];
      
      // Reset sport-specific fields
      setFormData(prev => ({
        ...prev,
        positions: [],
        playStyle: [],
        formats: [],
        preferredSide: sportData.preferredSide,
      }));

      // Clear updating state after a brief delay
      setTimeout(() => setIsUpdating(false), 500);
    }
  }, [formData.sport]);

  const handleInputChange = (field: keyof ScoutingReportData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: 'positions' | 'playStyle' | 'formats', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleDropdownToggle = (field: string) => {
    setShowDropdown(showDropdown === field ? null : field);
  };

  const closeAllDropdowns = () => {
    setShowDropdown(null);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.sport && formData.nickname && formData.positions.length > 0 && formData.playStyle.length > 0);
      case 2:
        return !!(formData.superpower && formData.formats.length > 0 && formData.availability);
      case 3:
        return !!(formData.funFact && formData.skillLevel);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    } else {
      Alert.alert('Incomplete Information', 'Please fill in all required fields before proceeding.');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSave = () => {
    if (validateStep(3)) {
      if (editingProfile && onUpdateProfile) {
        onUpdateProfile(formData);
        Alert.alert('Success', 'Profile Updated!');
      } else {
        onSave(formData);
        Alert.alert('Success', 'Sport Profile Saved!');
      }
      onClose();
    } else {
      Alert.alert('Incomplete Information', 'Please fill in all required fields before saving.');
    }
  };

  const renderTextInput = (
    field: keyof ScoutingReportData,
    placeholder: string,
    value: string,
    multiline = false
  ) => (
    <TextInput
      style={[styles.textInput, multiline && styles.textInputMultiline]}
      placeholder={placeholder}
      value={value}
      onChangeText={(text) => handleInputChange(field, text)}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
    />
  );

  const renderArraySelector = (
    field: 'positions' | 'playStyle' | 'formats',
    label: string,
    options: string[],
    selectedValues: string[]
  ) => (
    <View style={styles.arraySelector}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionChip,
              selectedValues.includes(option) && styles.optionChipSelected,
            ]}
            onPress={() => handleArrayToggle(field, option)}
          >
            <Text
              style={[
                styles.optionChipText,
                selectedValues.includes(option) && styles.optionChipTextSelected,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDropdown = (
    field: keyof ScoutingReportData,
    label: string,
    options: string[],
    value: string
  ) => (
    <View style={styles.dropdownContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => handleDropdownToggle(field)}
      >
        <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
          {value || `Select ${label.toLowerCase()}`}
        </Text>
        <Ionicons
          name={showDropdown === field ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.text}
        />
      </TouchableOpacity>
      {showDropdown === field && (
        <View style={styles.dropdownOptions}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.dropdownOption}
              onPress={() => {
                handleInputChange(field, option);
                closeAllDropdowns();
              }}
            >
              <Text style={styles.dropdownOptionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const getCurrentSportData = () => {
    if (formData.sport && SPORT_DATA[formData.sport as keyof typeof SPORT_DATA]) {
      return SPORT_DATA[formData.sport as keyof typeof SPORT_DATA];
    }
    return null;
  };

  const sportData = getCurrentSportData();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {editingProfile ? `Edit ${sportData?.name || 'Sport'} Profile` : 'Add Sport Profile'}
          </Text>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>Step {currentStep} of 3</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(currentStep / 3) * 100}%` }
                ]}
              />
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {currentStep === 1 && (
            <View>
              <Text style={styles.stepTitle}>
                {isUpdating ? 'Updating options...' : `Basic Info ${sportData ? `• ${sportData.emoji} ${sportData.name}` : ''}`}
              </Text>
              
              {renderDropdown('sport', 'Sport', Object.keys(SPORT_DATA), formData.sport)}
              
              {formData.sport && sportData && (
                <>
                  {renderTextInput('nickname', 'Nickname (e.g., "Threadz")', formData.nickname)}
                  
                  {renderArraySelector('positions', 'Positions', sportData.positions, formData.positions)}
                  
                  {renderArraySelector('playStyle', 'Play Style', sportData.playStyles, formData.playStyle)}
                </>
              )}
            </View>
          )}

          {currentStep === 2 && (
            <View>
              <Text style={styles.stepTitle}>
                Playing Details {sportData ? `• ${sportData.emoji} ${sportData.name}` : ''}
              </Text>
              
              {renderTextInput('superpower', 'Superpower (e.g., "through-balls")', formData.superpower)}
              
              {sportData && renderArraySelector('formats', 'Preferred Formats', sportData.formats, formData.formats)}
              
              {renderTextInput('availability', 'Availability (e.g., "Weeknights 7-9pm")', formData.availability)}
            </View>
          )}

          {currentStep === 3 && (
            <View>
              <Text style={styles.stepTitle}>
                Personal Touch {sportData ? `• ${sportData.emoji} ${sportData.name}` : ''}
              </Text>
              
              {renderTextInput('funFact', 'Fun Fact (e.g., "tracks assists like goals")', formData.funFact)}
              
              {renderDropdown('skillLevel', 'Skill Level', SKILL_LEVELS, formData.skillLevel)}
              
              {sportData && (
                <View style={styles.preferenceRow}>
                  <View style={styles.preferenceItem}>
                    <Text style={styles.label}>Preferred {sportData.preferredSide === 'foot' ? 'Foot' : 'Hand'}</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder={`Left/Right ${sportData.preferredSide === 'foot' ? 'Foot' : 'Hand'}`}
                      value={formData.preferredSide}
                      onChangeText={(text) => handleInputChange('preferredSide', text)}
                    />
                  </View>
                  <View style={styles.preferenceItem}>
                    <Text style={styles.label}>Kit Number</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Number"
                      value={formData.kitNumber}
                      onChangeText={(text) => handleInputChange('kitNumber', text)}
                    />
                  </View>
                </View>
              )}
              
              <View style={styles.preferenceRow}>
                <View style={styles.preferenceItem}>
                  <Text style={styles.label}>Travel Radius (km)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="10"
                    value={formData.travelRadius.toString()}
                    onChangeText={(text) => handleInputChange('travelRadius', parseInt(text) || 10)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.preferenceItem}>
                  <Text style={styles.label}>Form</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Good/Excellent"
                    value={formData.form}
                    onChangeText={(text) => handleInputChange('form', text)}
                  />
                </View>
              </View>
              
              <View style={styles.switchContainer}>
                <Text style={styles.label}>Open to Invites</Text>
                <Switch
                  value={formData.openToInvites}
                  onValueChange={(value) => handleInputChange('openToInvites', value)}
                  trackColor={{ false: '#767577', true: colors.primary }}
                  thumbColor={formData.openToInvites ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            {currentStep > 1 && (
              <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevious}>
                <Text style={styles.secondaryButtonText}>Previous</Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.primaryButtonContainer}>
              {currentStep < 3 ? (
                <TouchableOpacity
                  style={[styles.primaryButton, !validateStep(currentStep) && styles.primaryButtonDisabled]}
                  onPress={handleNext}
                  disabled={!validateStep(currentStep)}
                >
                  <Text style={styles.primaryButtonText}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.primaryButton, !validateStep(currentStep) && styles.primaryButtonDisabled]}
                  onPress={handleSave}
                  disabled={!validateStep(currentStep)}
                >
                  <Text style={styles.primaryButtonText}>
                    {editingProfile ? 'Update Profile' : 'Save Sport Profile'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  stepIndicator: {
    alignItems: 'center',
  },
  stepText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  content: {
    maxHeight: 400,
  },
  stepTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: typography.fontSize.md,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: 16,
  },
  textInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.surface,
  },
  dropdownText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  dropdownOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginTop: 4,
    zIndex: 1000,
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownOptionText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  arraySelector: {
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  optionChipTextSelected: {
    color: '#fff',
  },
  preferenceRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  preferenceItem: {
    flex: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  footer: {
    marginTop: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secondaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  primaryButtonContainer: {
    flex: 1,
    marginLeft: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ScoutingReportEditor;
