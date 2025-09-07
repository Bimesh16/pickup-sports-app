import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { DECORATIVE } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  navigation: any;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { theme, locale, setLocale } = useTheme();
  
  // Animations
  const pulseAnimation = useSharedValue(0);
  const greetingAnimation = useSharedValue(0);
  
  useEffect(() => {
    // Start pulse animation for button
    pulseAnimation.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
      -1,
      true
    );
    
    // Animate greeting
    greetingAnimation.value = withTiming(1, { 
      duration: 1000, 
      easing: Easing.out(Easing.cubic) 
    });
  }, []);

  const handleContinue = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Login');
  };

  const handleLanguageToggle = async () => {
    await Haptics.selectionAsync();
    setLocale(locale === 'nepal' ? 'global' : 'nepal');
  };

  // Animated styles
  const pulseStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulseAnimation.value, [0, 1], [1, 1.05]);
    const opacity = interpolate(pulseAnimation.value, [0, 1], [0.9, 1]);
    
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const greetingStyle = useAnimatedStyle(() => {
    const translateY = interpolate(greetingAnimation.value, [0, 1], [30, 0]);
    const opacity = interpolate(greetingAnimation.value, [0, 1], [0, 1]);
    
    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  const gradientColors = locale === 'nepal' 
    ? DECORATIVE.GRADIENTS.NEPAL_SUNSET
    : DECORATIVE.GRADIENTS.GLOBAL_OCEAN;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Decorative Mandala Pattern */}
      <View style={styles.decorativePattern}>
        {/* Add mandala/prayer flag patterns here */}
      </View>

      {/* Language Toggle */}
      <TouchableOpacity 
        style={styles.languageToggle}
        onPress={handleLanguageToggle}
        activeOpacity={0.8}
      >
        <Text style={styles.languageText}>
          {locale === 'nepal' ? '🇳🇵 नेपाली' : '🌍 English'}
        </Text>
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.content}>
        <Animated.View style={[styles.greetingContainer, greetingStyle]}>
          <Text style={styles.greeting}>
            {locale === 'nepal' ? 'नमस्ते!' : 'Namaste!'}
          </Text>
          <Text style={styles.subtitle}>
            {locale === 'nepal' 
              ? 'खेलकुद समुदायमा स्वागत छ'
              : 'Welcome to the sports community'
            }
          </Text>
        </Animated.View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featureText}>🏏 Find local games</Text>
          <Text style={styles.featureText}>👥 Meet fellow athletes</Text>
          <Text style={styles.featureText}>🏆 Track your progress</Text>
          <Text style={styles.featureText}>🌟 Build your sports profile</Text>
        </View>
      </View>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <Animated.View style={pulseStyle}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.continueButtonText}>
                {locale === 'nepal' ? 'सुरु गर्नुहोस्' : 'Get Started'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorativePattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: DECORATIVE.MANDALA_OPACITY,
  },
  languageToggle: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
  },
  languageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  greetingContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  greeting: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
  },
  featuresContainer: {
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 50,
  },
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
});

export default WelcomeScreen;