import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface CreateGameScreenProps {
  navigation: any;
}

const CreateGameScreen: React.FC<CreateGameScreenProps> = ({ navigation }) => {
  const { theme, locale } = useTheme();
  
  const [currentStep, setCurrentStep] = useState(1);
  
  const progressAnimation = useSharedValue(0.25);

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      progressAnimation.value = withTiming((currentStep + 1) * 0.25, { duration: 300 });
    }
  };

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      progressAnimation.value = withTiming((currentStep - 1) * 0.25, { duration: 300 });
    } else {
      navigation.goBack();
    }
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnimation.value * 100}%`,
  }));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              {locale === 'nepal' ? 'खेल विवरण' : 'Game Details'}
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
              {locale === 'nepal' ? 'आफ्नो खेल सेटअप गर्नुहोस्' : 'Set up your game'}
            </Text>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              {locale === 'nepal' ? 'स्थान र समय' : 'Location & Time'}
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
              {locale === 'nepal' ? 'कहाँ र कहिले खेल्ने' : 'Where and when to play'}
            </Text>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              {locale === 'nepal' ? 'अतिरिक्त सेटिङ्गहरू' : 'Additional Settings'}
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
              {locale === 'nepal' ? 'अन्तिम विवरणहरू' : 'Final details'}
            </Text>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              {locale === 'nepal' ? 'पुष्टि गर्नुहोस्' : 'Confirm'}
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
              {locale === 'nepal' ? 'तपाईंको खेल समीक्षा गर्नुहोस्' : 'Review your game'}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressBackground, { backgroundColor: theme.colors.surface }]}>
            <Animated.View style={[styles.progressFill, progressStyle, { backgroundColor: theme.colors.primary }]} />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.text }]}>
            {currentStep}/4
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <BlurView intensity={10} tint="light" style={styles.card}>
          {renderStep()}
        </BlurView>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: theme.colors.primary }]}
          onPress={currentStep === 4 ? () => {
            Alert.alert(
              locale === 'nepal' ? 'खेल सिर्जना गरियो!' : 'Game Created!',
              locale === 'nepal' ? 'तपाईंको खेल सफलतापूर्वक सिर्जना गरियो' : 'Your game has been created successfully'
            );
            navigation.goBack();
          } : handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === 4 
              ? (locale === 'nepal' ? 'खेल सिर्जना गर्नुहोस्' : 'Create Game')
              : (locale === 'nepal' ? 'अर्को' : 'Next')
            }
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  progressBackground: {
    width: '80%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  stepContainer: {
    alignItems: 'center',
    gap: 12,
    minHeight: 200,
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  navigationContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  nextButton: {
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default CreateGameScreen;