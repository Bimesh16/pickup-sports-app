import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NepalButton, TempleGoldButton } from './nepal-ui/NepalButton';
import { SportCard } from './nepal-ui/SportCard';
import { NepalColors, NepalGradients, NepalSpacing, NepalBorderRadius, getCulturalSportInfo } from '../../design-system/nepal-theme';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

// Types for the game creation process
export interface GameCreationData {
  step: number;
  sport: 'futsal' | 'cricket' | 'basketball' | 'volleyball' | 'tennis' | null;
  format: string | null;
  location: {
    venue: string | null;
    address: string | null;
    coordinates: { lat: number; lng: number } | null;
  };
  dateTime: {
    date: Date | null;
    startTime: string | null;
    duration: number; // minutes
  };
  teamFormation: {
    type: 'auto-balance' | 'manual' | 'friend-groups' | 'open';
    playersPerTeam: number;
    totalPlayers: number;
  };
  pricing: {
    costPerPlayer: number;
    currency: 'NPR' | 'USD';
    splitType: 'equal' | 'captain-pays' | 'custom';
  };
  rules: {
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
    equipment: 'provided' | 'bring-own' | 'optional';
    additionalRules: string;
  };
  preview: {
    title: string;
    description: string;
    isPublic: boolean;
  };
}

interface GameCreationWizardProps {
  onComplete: (gameData: GameCreationData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<GameCreationData>;
}

// Step Components
const StepHeader: React.FC<{ 
  currentStep: number; 
  totalSteps: number; 
  title: string; 
  nepaliTitle: string 
}> = ({ currentStep, totalSteps, title, nepaliTitle }) => (
  <LinearGradient colors={NepalGradients.nepal_flag} style={styles.stepHeader}>
    <View style={styles.stepHeaderContent}>
      <Text style={styles.stepNumber}>Step {currentStep} of {totalSteps}</Text>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepTitleNepali}>{nepaliTitle}</Text>
    </View>
    <View style={styles.progressBar}>
      <View style={[styles.progressFill, { width: `${(currentStep / totalSteps) * 100}%` }]} />
    </View>
  </LinearGradient>
);

// Step 1: Sport Selection
const SportSelectionStep: React.FC<{
  selectedSport: string | null;
  onSelectSport: (sport: 'futsal' | 'cricket' | 'basketball' | 'volleyball' | 'tennis') => void;
}> = ({ selectedSport, onSelectSport }) => {
  const sports = [
    { id: 'futsal', count: 45 },
    { id: 'cricket', count: 32 },
    { id: 'basketball', count: 28 },
    { id: 'volleyball', count: 19 },
    { id: 'tennis', count: 15 },
  ] as const;

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        Choose your sport पसन्दको खेल छान्नुहोस्
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sportsList}>
        {sports.map((sport) => (
          <View key={sport.id} style={styles.sportCardWrapper}>
            <SportCard
              sport={sport.id}
              gameCount={sport.count}
              onPress={() => onSelectSport(sport.id)}
              style={[
                selectedSport === sport.id && styles.selectedSportCard
              ]}
            />
            {selectedSport === sport.id && (
              <View style={styles.selectedIndicator}>
                <Ionicons name="checkmark-circle" size={24} color={NepalColors.himalayan_gold} />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// Step 2: Format Selection
const FormatSelectionStep: React.FC<{
  sport: string;
  selectedFormat: string | null;
  onSelectFormat: (format: string) => void;
}> = ({ sport, selectedFormat, onSelectFormat }) => {
  const getFormatsForSport = (sportType: string) => {
    switch (sportType) {
      case 'futsal':
        return [
          { id: '5v5', name: '5 vs 5', nepali: '५ बिरुद्ध ५', description: 'Standard futsal format' },
          { id: '4v4', name: '4 vs 4', nepali: '४ बिरुद्ध ४', description: 'Smaller teams' },
          { id: '6v6', name: '6 vs 6', nepali: '६ बिरुद्ध ६', description: 'Larger teams' },
        ];
      case 'cricket':
        return [
          { id: 't20', name: 'T20', nepali: 'टी२०', description: '20 overs per side' },
          { id: 't10', name: 'T10', nepali: 'टी१०', description: '10 overs per side' },
          { id: 'box-cricket', name: 'Box Cricket', nepali: 'बक्स क्रिकेट', description: 'Indoor format' },
        ];
      case 'basketball':
        return [
          { id: '5v5-full', name: '5 vs 5 Full Court', nepali: '५ बिरुद्ध ५ पूर्ण कोर्ट', description: 'Standard format' },
          { id: '3v3-half', name: '3 vs 3 Half Court', nepali: '३ बिरुद्ध ३ आधा कोर्ट', description: 'Streetball format' },
        ];
      default:
        return [
          { id: 'standard', name: 'Standard', nepali: 'मानक', description: 'Regular format' },
        ];
    }
  };

  const formats = getFormatsForSport(sport);

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        Select game format खेल ढाँचा छान्नुहोस्
      </Text>
      <View style={styles.formatsList}>
        {formats.map((format) => (
          <NepalButton
            key={format.id}
            title={format.name}
            nepaliTitle={format.nepali}
            onPress={() => onSelectFormat(format.id)}
            variant={selectedFormat === format.id ? 'primary' : 'outline'}
            style={styles.formatButton}
          />
        ))}
      </View>
    </View>
  );
};

// Step 3: Location Picker (Simplified for now)
const LocationPickerStep: React.FC<{
  selectedLocation: any;
  onSelectLocation: (location: any) => void;
}> = ({ selectedLocation, onSelectLocation }) => {
  const popularVenues = [
    { id: '1', name: 'Futsal Ghar', address: 'Thamel, Kathmandu', type: 'futsal' },
    { id: '2', name: 'Sports Complex', address: 'Lalitpur', type: 'multi-sport' },
    { id: '3', name: 'Community Ground', address: 'Bhaktapur', type: 'outdoor' },
  ];

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        Choose venue स्थान छान्नुहोस्
      </Text>
      <View style={styles.venuesList}>
        {popularVenues.map((venue) => (
          <NepalButton
            key={venue.id}
            title={venue.name}
            nepaliTitle={venue.address}
            onPress={() => onSelectLocation(venue)}
            variant={selectedLocation?.id === venue.id ? 'cultural' : 'outline'}
            style={styles.venueButton}
          />
        ))}
      </View>
    </View>
  );
};

// Main Game Creation Wizard Component
export const GameCreationWizard: React.FC<GameCreationWizardProps> = ({
  onComplete,
  onCancel,
  initialData = {}
}) => {
  const [gameData, setGameData] = useState<GameCreationData>({
    step: 1,
    sport: null,
    format: null,
    location: { venue: null, address: null, coordinates: null },
    dateTime: { date: null, startTime: null, duration: 90 },
    teamFormation: { type: 'auto-balance', playersPerTeam: 5, totalPlayers: 10 },
    pricing: { costPerPlayer: 500, currency: 'NPR', splitType: 'equal' },
    rules: { skillLevel: 'mixed', equipment: 'provided', additionalRules: '' },
    preview: { title: '', description: '', isPublic: true },
    ...initialData,
  });

  const updateGameData = useCallback((updates: Partial<GameCreationData>) => {
    setGameData(prev => ({ ...prev, ...updates }));
  }, []);

  const nextStep = () => {
    if (gameData.step < 8) {
      updateGameData({ step: gameData.step + 1 });
    }
  };

  const prevStep = () => {
    if (gameData.step > 1) {
      updateGameData({ step: gameData.step - 1 });
    }
  };

  const handleComplete = async () => {
    try {
      await onComplete(gameData);
    } catch (error) {
      Alert.alert('Error', 'Failed to create game. Please try again.');
    }
  };

  const getStepInfo = (step: number) => {
    const stepInfos = [
      { title: 'Select Sport', nepali: 'खेल छान्नुहोस्' },
      { title: 'Choose Format', nepali: 'ढाँचा छान्नुहोस्' },
      { title: 'Pick Location', nepali: 'स्थान छान्नुहोस्' },
      { title: 'Date & Time', nepali: 'मिति र समय' },
      { title: 'Team Setup', nepali: 'टिम सेटअप' },
      { title: 'Pricing', nepali: 'मूल्य निर्धारण' },
      { title: 'Rules', nepali: 'नियमहरू' },
      { title: 'Preview', nepali: 'पूर्वावलोकन' },
    ];
    return stepInfos[step - 1];
  };

  const currentStepInfo = getStepInfo(gameData.step);

  const renderStepContent = () => {
    switch (gameData.step) {
      case 1:
        return (
          <SportSelectionStep
            selectedSport={gameData.sport}
            onSelectSport={(sport) => updateGameData({ sport })}
          />
        );
      case 2:
        return gameData.sport ? (
          <FormatSelectionStep
            sport={gameData.sport}
            selectedFormat={gameData.format}
            onSelectFormat={(format) => updateGameData({ format })}
          />
        ) : null;
      case 3:
        return (
          <LocationPickerStep
            selectedLocation={gameData.location}
            onSelectLocation={(location) => updateGameData({ location })}
          />
        );
      // Add cases 4-8 for other steps
      default:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepDescription}>
              Step {gameData.step} coming soon... कदम {gameData.step} छिट्टै आउँदैछ...
            </Text>
          </View>
        );
    }
  };

  const canProceed = () => {
    switch (gameData.step) {
      case 1: return gameData.sport !== null;
      case 2: return gameData.format !== null;
      case 3: return gameData.location.venue !== null;
      default: return true;
    }
  };

  return (
    <View style={styles.container}>
      <StepHeader
        currentStep={gameData.step}
        totalSteps={8}
        title={currentStepInfo.title}
        nepaliTitle={currentStepInfo.nepali}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      <View style={styles.navigationButtons}>
        <NepalButton
          title="Back"
          nepaliTitle="फिर्ता"
          onPress={gameData.step === 1 ? onCancel : prevStep}
          variant="outline"
          style={styles.navButton}
        />
        
        {gameData.step < 8 ? (
          <NepalButton
            title="Next"
            nepaliTitle="अर्को"
            onPress={nextStep}
            disabled={!canProceed()}
            style={styles.navButton}
          />
        ) : (
          <TempleGoldButton
            title="Create Game"
            nepaliTitle="खेल सिर्जना गर्नुहोस्"
            onPress={handleComplete}
            style={styles.navButton}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NepalColors.background,
  },
  stepHeader: {
    paddingHorizontal: NepalSpacing.lg,
    paddingVertical: NepalSpacing.md,
  },
  stepHeaderContent: {
    alignItems: 'center',
    marginBottom: NepalSpacing.sm,
  },
  stepNumber: {
    color: NepalColors.snow_white,
    fontSize: 12,
    opacity: 0.8,
  },
  stepTitle: {
    color: NepalColors.snow_white,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: NepalSpacing.xs,
  },
  stepTitleNepali: {
    color: NepalColors.snow_white,
    fontSize: 14,
    fontFamily: 'Noto Sans Devanagari',
    marginTop: NepalSpacing.xs,
    opacity: 0.9,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: NepalColors.himalayan_gold,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: NepalSpacing.lg,
  },
  stepDescription: {
    fontSize: 16,
    color: NepalColors.text_primary,
    textAlign: 'center',
    marginBottom: NepalSpacing.xl,
    fontFamily: 'Inter',
  },
  sportsList: {
    paddingHorizontal: NepalSpacing.sm,
  },
  sportCardWrapper: {
    position: 'relative',
    marginHorizontal: NepalSpacing.xs,
  },
  selectedSportCard: {
    transform: [{ scale: 1.05 }],
  },
  selectedIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: NepalColors.surface,
    borderRadius: 20,
    padding: 2,
  },
  formatsList: {
    gap: NepalSpacing.md,
  },
  formatButton: {
    marginBottom: NepalSpacing.sm,
  },
  venuesList: {
    gap: NepalSpacing.md,
  },
  venueButton: {
    marginBottom: NepalSpacing.sm,
  },
  navigationButtons: {
    flexDirection: 'row',
    padding: NepalSpacing.lg,
    gap: NepalSpacing.md,
    backgroundColor: NepalColors.surface,
    borderTopWidth: 1,
    borderTopColor: NepalColors.divider,
  },
  navButton: {
    flex: 1,
  },
});

export default GameCreationWizard;
