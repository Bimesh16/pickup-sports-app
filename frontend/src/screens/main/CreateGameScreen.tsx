import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { TextInput, Button, HelperText, Card } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

import ScrollContainer from '../../components/common/ScrollContainer';
import AdvancedDropdown, { 
  SPORT_OPTIONS, 
  SKILL_LEVEL_OPTIONS,
  TIME_SLOT_OPTIONS 
} from '../../components/common/AdvancedDropdown';
import { useModal } from '../../components/common/AdvancedModal';
import LocationPicker from '../../components/create/LocationPicker';

import { useCurrentLocation } from '../../stores/locationStore';
import { useGameActions, useGameLoading } from '../../stores/gameStore';
import { NepalColors, commonStyles } from '../../styles/theme';
import { CreateGameRequest, RootStackParamList } from '../../types';

type CreateGameScreenNavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * Create Game Screen with Step-by-Step Flow
 */
const CreateGameScreen: React.FC = () => {
  const navigation = useNavigation<CreateGameScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { showModal, showConfirmDialog } = useModal();
  
  // Store hooks
  const currentLocation = useCurrentLocation();
  const { createGame } = useGameActions();
  const isLoading = useGameLoading();

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreateGameRequest>({
    sport: '',
    location: currentLocation?.address || '',
    time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    skillLevel: '',
    latitude: currentLocation?.coordinates.latitude || 27.7172,
    longitude: currentLocation?.coordinates.longitude || 85.3240,
    gameType: 'casual',
    description: '',
    minPlayers: 2,
    maxPlayers: 10,
    pricePerPlayer: 0,
    durationMinutes: 90,
    capacity: 10,
    waitlistEnabled: true,
    isPrivate: false,
    requiresApproval: false,
    weatherDependent: true,
  });
  
  const [formErrors, setFormErrors] = useState<any>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Animation values
  const stepOpacity = useSharedValue(1);
  const stepTranslateX = useSharedValue(0);

  // Steps configuration
  const steps = [
    { title: 'Basic Info', icon: 'information-circle' },
    { title: 'Location & Time', icon: 'location' },
    { title: 'Game Settings', icon: 'settings' },
    { title: 'Review & Create', icon: 'checkmark-circle' },
  ];

  // Form validation for each step
  const validateStep = useCallback((step: number): boolean => {
    const errors: any = {};

    switch (step) {
      case 1:
        if (!formData.sport) errors.sport = 'Sport is required';
        if (!formData.skillLevel) errors.skillLevel = 'Skill level is required';
        break;
      case 2:
        if (!formData.location) errors.location = 'Location is required';
        if (!formData.time) errors.time = 'Game time is required';
        if (new Date(formData.time) <= new Date()) {
          errors.time = 'Game time must be in the future';
        }
        break;
      case 3:
        if (formData.minPlayers < 2) errors.minPlayers = 'Minimum 2 players required';
        if (formData.maxPlayers <= formData.minPlayers) {
          errors.maxPlayers = 'Max players must be greater than min players';
        }
        if (formData.pricePerPlayer < 0) errors.pricePerPlayer = 'Price cannot be negative';
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle next step
  const handleNextStep = useCallback(() => {
    if (!validateStep(currentStep)) return;

    if (currentStep < steps.length) {
      // Animate step transition
      stepOpacity.value = withTiming(0, { duration: 150 });
      stepTranslateX.value = withTiming(-50, { duration: 150 });
      
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        stepTranslateX.value = 50;
        stepOpacity.value = withTiming(1, { duration: 200 });
        stepTranslateX.value = withSpring(0, { damping: 20, stiffness: 300 });
      }, 150);
    }
  }, [currentStep, validateStep]);

  // Handle previous step
  const handlePreviousStep = useCallback(() => {
    if (currentStep > 1) {
      stepOpacity.value = withTiming(0, { duration: 150 });
      stepTranslateX.value = withTiming(50, { duration: 150 });
      
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        stepTranslateX.value = -50;
        stepOpacity.value = withTiming(1, { duration: 200 });
        stepTranslateX.value = withSpring(0, { damping: 20, stiffness: 300 });
      }, 150);
    }
  }, [currentStep]);

  // Handle input changes
  const handleInputChange = useCallback((field: keyof CreateGameRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [formErrors]);

  // Handle date/time selection
  const handleDateTimeChange = useCallback((event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const currentDate = new Date(formData.time);
      
      if (showDatePicker) {
        // Update date part
        selectedDate.setHours(currentDate.getHours(), currentDate.getMinutes());
      } else {
        // Update time part
        const newDate = new Date(currentDate);
        newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
        selectedDate = newDate;
      }
      
      handleInputChange('time', selectedDate.toISOString());
    }
    
    setShowDatePicker(false);
    setShowTimePicker(false);
  }, [formData.time, showDatePicker, handleInputChange]);

  // Handle location selection
  const handleLocationSelect = useCallback((location: any) => {
    handleInputChange('location', location.address);
    handleInputChange('latitude', location.latitude);
    handleInputChange('longitude', location.longitude);
  }, [handleInputChange]);

  // Handle game creation
  const handleCreateGame = useCallback(async () => {
    if (!validateStep(4)) return;

    try {
      const createdGame = await createGame(formData);
      
      Alert.alert(
        'Game Created!',
        'Your game has been created successfully. Players can now discover and join it.',
        [
          {
            text: 'View Game',
            onPress: () => {
              navigation.reset({
                index: 1,
                routes: [
                  { name: 'BottomTabs' },
                  { name: 'GameDetails', params: { gameId: createdGame.id } },
                ],
              });
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Creation Failed',
        error.response?.data?.message || 'Failed to create game. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, [formData, validateStep, createGame, navigation]);

  // Show location picker modal
  const showLocationPicker = useCallback(() => {
    showModal(
      <LocationPicker
        initialLocation={{
          latitude: formData.latitude,
          longitude: formData.longitude,
          address: formData.location,
        }}
        onLocationSelect={handleLocationSelect}
      />,
      {
        title: 'Select Game Location',
        dismissible: true,
        animationType: 'slide',
        position: 'center',
      }
    );
  }, [showModal, formData, handleLocationSelect]);

  // Animated style for step content
  const stepAnimatedStyle = useAnimatedStyle(() => ({
    opacity: stepOpacity.value,
    transform: [{ translateX: stepTranslateX.value }],
  }));

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What are you playing?</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Sport</Text>
              <AdvancedDropdown
                options={SPORT_OPTIONS}
                value={formData.sport}
                onSelect={(value) => handleInputChange('sport', value)}
                placeholder="Select a sport"
                style={styles.dropdown}
              />
              <HelperText type="error" visible={!!formErrors.sport}>
                {formErrors.sport}
              </HelperText>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Skill Level</Text>
              <AdvancedDropdown
                options={SKILL_LEVEL_OPTIONS}
                value={formData.skillLevel}
                onSelect={(value) => handleInputChange('skillLevel', value)}
                placeholder="Select skill level"
                style={styles.dropdown}
              />
              <HelperText type="error" visible={!!formErrors.skillLevel}>
                {formErrors.skillLevel}
              </HelperText>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Game Description (Optional)"
                value={formData.description || ''}
                onChangeText={(value) => handleInputChange('description', value)}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.textInput}
                theme={{ colors: { primary: NepalColors.primaryCrimson } }}
                placeholder="Tell players what to expect..."
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>When and where?</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Location</Text>
              <TouchableOpacity
                style={styles.locationButton}
                onPress={showLocationPicker}
                activeOpacity={0.7}
              >
                <Ionicons name="location" size={20} color={NepalColors.primaryCrimson} />
                <Text style={styles.locationButtonText} numberOfLines={2}>
                  {formData.location || 'Select location'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={NepalColors.onSurfaceVariant} />
              </TouchableOpacity>
              <HelperText type="error" visible={!!formErrors.location}>
                {formErrors.location}
              </HelperText>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date & Time</Text>
              <View style={styles.dateTimeRow}>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar" size={20} color={NepalColors.primaryBlue} />
                  <Text style={styles.dateTimeText}>
                    {new Date(formData.time).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowTimePicker(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="time" size={20} color={NepalColors.primaryBlue} />
                  <Text style={styles.dateTimeText}>
                    {new Date(formData.time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
              <HelperText type="error" visible={!!formErrors.time}>
                {formErrors.time}
              </HelperText>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Duration (minutes)"
                value={formData.durationMinutes?.toString() || '90'}
                onChangeText={(value) => handleInputChange('durationMinutes', parseInt(value) || 90)}
                mode="outlined"
                keyboardType="numeric"
                style={styles.textInput}
                theme={{ colors: { primary: NepalColors.primaryCrimson } }}
                left={<TextInput.Icon icon="timer" />}
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Game settings</Text>
            
            <View style={styles.playerSection}>
              <Text style={styles.inputLabel}>Players</Text>
              <View style={styles.playerRow}>
                <View style={styles.playerInput}>
                  <TextInput
                    label="Min Players"
                    value={formData.minPlayers?.toString() || '2'}
                    onChangeText={(value) => handleInputChange('minPlayers', parseInt(value) || 2)}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.textInput}
                    theme={{ colors: { primary: NepalColors.primaryCrimson } }}
                  />
                  <HelperText type="error" visible={!!formErrors.minPlayers}>
                    {formErrors.minPlayers}
                  </HelperText>
                </View>
                
                <View style={styles.playerInput}>
                  <TextInput
                    label="Max Players"
                    value={formData.maxPlayers?.toString() || '10'}
                    onChangeText={(value) => handleInputChange('maxPlayers', parseInt(value) || 10)}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.textInput}
                    theme={{ colors: { primary: NepalColors.primaryCrimson } }}
                  />
                  <HelperText type="error" visible={!!formErrors.maxPlayers}>
                    {formErrors.maxPlayers}
                  </HelperText>
                </View>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Price per Player (Rs.)"
                value={formData.pricePerPlayer?.toString() || '0'}
                onChangeText={(value) => handleInputChange('pricePerPlayer', parseInt(value) || 0)}
                mode="outlined"
                keyboardType="numeric"
                style={styles.textInput}
                theme={{ colors: { primary: NepalColors.primaryCrimson } }}
                left={<TextInput.Icon icon="cash" />}
              />
              <HelperText type="error" visible={!!formErrors.pricePerPlayer}>
                {formErrors.pricePerPlayer}
              </HelperText>
            </View>

            <View style={styles.optionsContainer}>
              <GameOption
                title="Enable Waitlist"
                description="Allow players to join a waitlist when game is full"
                value={formData.waitlistEnabled || false}
                onToggle={(value) => handleInputChange('waitlistEnabled', value)}
              />
              
              <GameOption
                title="Private Game"
                description="Only invited players can join"
                value={formData.isPrivate || false}
                onToggle={(value) => handleInputChange('isPrivate', value)}
              />
              
              <GameOption
                title="Requires Approval"
                description="You must approve each player before they join"
                value={formData.requiresApproval || false}
                onToggle={(value) => handleInputChange('requiresApproval', value)}
              />
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review your game</Text>
            
            <Card style={styles.reviewCard}>
              <Card.Content>
                <ReviewItem icon="football" label="Sport" value={formData.sport} />
                <ReviewItem icon="location" label="Location" value={formData.location} />
                <ReviewItem 
                  icon="time" 
                  label="Date & Time" 
                  value={new Date(formData.time).toLocaleString()} 
                />
                <ReviewItem 
                  icon="people" 
                  label="Players" 
                  value={`${formData.minPlayers}-${formData.maxPlayers} players`} 
                />
                <ReviewItem 
                  icon="cash" 
                  label="Price" 
                  value={formData.pricePerPlayer ? `Rs. ${formData.pricePerPlayer}` : 'Free'} 
                />
                <ReviewItem 
                  icon="timer" 
                  label="Duration" 
                  value={`${formData.durationMinutes} minutes`} 
                />
              </Card.Content>
            </Card>

            {formData.description && (
              <Card style={styles.descriptionCard}>
                <Card.Content>
                  <Text style={styles.descriptionTitle}>Description</Text>
                  <Text style={styles.descriptionText}>{formData.description}</Text>
                </Card.Content>
              </Card>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  // Animated style for step content
  const stepContentStyle = useAnimatedStyle(() => ({
    opacity: stepOpacity.value,
    transform: [{ translateX: stepTranslateX.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (currentStep > 1) {
              handlePreviousStep();
            } else {
              showConfirmDialog(
                'Discard Game?',
                'Are you sure you want to discard this game? All progress will be lost.',
                () => navigation.goBack()
              );
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={NepalColors.onSurface} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Create Game</Text>
        
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => {
            showModal(
              <View style={styles.helpContent}>
                <Text style={styles.helpText}>
                  Create engaging games that attract players:
                  {'\n\n'}• Choose popular sports like futsal for Nepal
                  {'\n'}• Set realistic time slots
                  {'\n'}• Price fairly for your area
                  {'\n'}• Provide clear descriptions
                </Text>
              </View>,
              { title: 'Tips for Creating Games' }
            );
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="help-circle" size={24} color={NepalColors.primaryCrimson} />
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.progressStep}>
            <View
              style={[
                styles.progressDot,
                index + 1 <= currentStep && styles.progressDotActive,
                index + 1 === currentStep && styles.progressDotCurrent,
              ]}
            >
              <Ionicons
                name={step.icon as any}
                size={16}
                color={
                  index + 1 <= currentStep
                    ? NepalColors.primaryWhite
                    : NepalColors.onSurfaceVariant
                }
              />
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.progressLine,
                  index + 1 < currentStep && styles.progressLineActive,
                ]}
              />
            )}
          </View>
        ))}
      </View>

      {/* Step Content */}
      <ScrollContainer contentContainerStyle={styles.scrollContent}>
        <Animated.View style={stepContentStyle}>
          {renderStepContent()}
        </Animated.View>
      </ScrollContainer>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 16 }]}>
        {currentStep < steps.length ? (
          <View style={styles.navigationButtons}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.backStepButton}
                onPress={handlePreviousStep}
                activeOpacity={0.7}
              >
                <Text style={styles.backStepText}>Previous</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.nextStepButton, currentStep === 1 && styles.fullWidthButton]}
              onPress={handleNextStep}
              activeOpacity={0.8}
            >
              <Text style={styles.nextStepText}>
                {currentStep === steps.length - 1 ? 'Review' : 'Next'}
              </Text>
              <Ionicons name="arrow-forward" size={16} color={NepalColors.primaryWhite} />
            </TouchableOpacity>
          </View>
        ) : (
          <Button
            mode="contained"
            onPress={handleCreateGame}
            loading={isLoading}
            disabled={isLoading}
            style={styles.createButton}
            labelStyle={styles.createButtonText}
            buttonColor={NepalColors.primaryCrimson}
          >
            {isLoading ? 'Creating Game...' : 'Create Game'}
          </Button>
        )}
      </View>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(formData.time)}
          mode="date"
          display="default"
          onChange={handleDateTimeChange}
          minimumDate={new Date()}
        />
      )}
      
      {showTimePicker && (
        <DateTimePicker
          value={new Date(formData.time)}
          mode="time"
          display="default"
          onChange={handleDateTimeChange}
        />
      )}
    </View>
  );
};

/**
 * Game Option Toggle Component
 */
interface GameOptionProps {
  title: string;
  description: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

const GameOption: React.FC<GameOptionProps> = ({ title, description, value, onToggle }) => {
  return (
    <TouchableOpacity
      style={styles.optionItem}
      onPress={() => onToggle(!value)}
      activeOpacity={0.7}
    >
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <View style={[styles.toggle, value && styles.toggleActive]}>
        {value && (
          <Ionicons name="checkmark" size={16} color={NepalColors.primaryWhite} />
        )}
      </View>
    </TouchableOpacity>
  );
};

/**
 * Review Item Component
 */
interface ReviewItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ icon, label, value }) => (
  <View style={styles.reviewItem}>
    <Ionicons name={icon} size={20} color={NepalColors.primaryCrimson} />
    <View style={styles.reviewContent}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: commonStyles.padding.large,
    paddingBottom: commonStyles.padding.medium,
    backgroundColor: NepalColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: NepalColors.outlineVariant,
  },
  backButton: {
    padding: commonStyles.padding.small,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
  },
  helpButton: {
    padding: commonStyles.padding.small,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: commonStyles.padding.large,
    backgroundColor: NepalColors.surface,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: NepalColors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotActive: {
    backgroundColor: NepalColors.primaryCrimson,
  },
  progressDotCurrent: {
    backgroundColor: NepalColors.primaryBlue,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: NepalColors.outline,
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: NepalColors.primaryCrimson,
  },
  scrollContent: {
    padding: commonStyles.padding.large,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: NepalColors.onSurface,
    marginBottom: commonStyles.padding.xl,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: commonStyles.padding.large,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    marginBottom: commonStyles.padding.small,
  },
  dropdown: {
    marginBottom: commonStyles.padding.small,
  },
  textInput: {
    backgroundColor: NepalColors.surface,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NepalColors.surface,
    borderWidth: 1,
    borderColor: NepalColors.outline,
    borderRadius: commonStyles.borderRadius.medium,
    padding: commonStyles.padding.medium,
    minHeight: 56,
  },
  locationButtonText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurface,
    marginLeft: commonStyles.padding.small,
    marginRight: commonStyles.padding.small,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: commonStyles.padding.medium,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NepalColors.surface,
    borderWidth: 1,
    borderColor: NepalColors.outline,
    borderRadius: commonStyles.borderRadius.medium,
    padding: commonStyles.padding.medium,
    minHeight: 48,
  },
  dateTimeText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurface,
    marginLeft: commonStyles.padding.small,
  },
  playerSection: {
    marginBottom: commonStyles.padding.large,
  },
  playerRow: {
    flexDirection: 'row',
    gap: commonStyles.padding.medium,
  },
  playerInput: {
    flex: 1,
  },
  optionsContainer: {
    gap: commonStyles.padding.medium,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NepalColors.surface,
    borderRadius: commonStyles.borderRadius.medium,
    padding: commonStyles.padding.large,
    borderWidth: 1,
    borderColor: NepalColors.outline,
  },
  optionContent: {
    flex: 1,
    marginRight: commonStyles.padding.medium,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    lineHeight: 16,
  },
  toggle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: NepalColors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: NepalColors.primaryCrimson,
    borderColor: NepalColors.primaryCrimson,
  },
  reviewCard: {
    backgroundColor: NepalColors.surface,
    marginBottom: commonStyles.padding.large,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: commonStyles.padding.small,
    borderBottomWidth: 1,
    borderBottomColor: NepalColors.outlineVariant,
  },
  reviewContent: {
    marginLeft: commonStyles.padding.medium,
    flex: 1,
  },
  reviewLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
  },
  reviewValue: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    marginTop: 2,
  },
  descriptionCard: {
    backgroundColor: NepalColors.surface,
  },
  descriptionTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    marginBottom: commonStyles.padding.small,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    lineHeight: 20,
  },
  bottomActions: {
    padding: commonStyles.padding.large,
    backgroundColor: NepalColors.surface,
    borderTopWidth: 1,
    borderTopColor: NepalColors.outlineVariant,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: commonStyles.padding.medium,
  },
  backStepButton: {
    flex: 1,
    paddingVertical: commonStyles.padding.medium,
    borderRadius: commonStyles.borderRadius.medium,
    borderWidth: 1,
    borderColor: NepalColors.outline,
    alignItems: 'center',
  },
  backStepText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.onSurface,
  },
  nextStepButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: commonStyles.padding.medium,
    borderRadius: commonStyles.borderRadius.medium,
    backgroundColor: NepalColors.primaryCrimson,
    gap: commonStyles.padding.small,
  },
  fullWidthButton: {
    flex: 1,
  },
  nextStepText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryWhite,
  },
  createButton: {
    borderRadius: commonStyles.borderRadius.medium,
    paddingVertical: 4,
  },
  createButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
  helpContent: {
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurface,
    lineHeight: 20,
    textAlign: 'left',
  },
});

export default CreateGameScreen;