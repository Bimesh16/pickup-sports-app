import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthStore } from '@/stores/authStore';
import LanguageSelector from '@/components/LanguageSelector';
import { InteractiveButton } from '@/components/common/InteractiveButton';
import { MandalaMotif } from '@/components/common/MandalaMotif';
import { PrayerFlagMotif } from '@/components/common/PrayerFlagMotif';
import { culturalMotifs, glassmorphismStyles } from '@/constants/theme';
import { AuthStackParamList } from '@/types';

const { width, height } = Dimensions.get('window');

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const { colors, isDark } = useTheme();
  const { t, currentLanguage } = useLanguage();
  
  // Animation values
  const sunrayAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Sunray rotation animation
    Animated.loop(
      Animated.timing(sunrayAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation for continue button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      // Cleanup not needed for Animated.Value
      // Animated.loop() and Animated.sequence() return CompositeAnimation
      // which automatically stops when component unmounts
    };
  }, []);

  const handleContinue = () => {
    console.log('Continue pressed - navigating to login');
    navigation.navigate('Login');
  };

  const handleLanguageChange = (newLanguage: string) => {
    // Language change is handled by LanguageSelector component
    console.log('Language changed to:', newLanguage);
  };

  // Sunray component
  const Sunray = ({ angle, delay = 0 }: { angle: number; delay?: number }) => {
    const sunrayRotation = sunrayAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [`${angle}deg`, `${angle + 360}deg`],
    });

    return (
      <Animated.View
        style={[
          styles.sunray,
          {
            transform: [{ rotate: sunrayRotation }],
            opacity: 0.6,
          },
        ]}
      >
        <LinearGradient
          colors={[colors.sunriseOrange, colors.sunriseLight, 'transparent']}
          style={styles.sunrayGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Himalayan Background */}
      <LinearGradient
        colors={culturalMotifs.himalayanGradient.colors}
        style={styles.background}
        start={culturalMotifs.himalayanGradient.start}
        end={culturalMotifs.himalayanGradient.end}
      >
        {/* Animated Sun with Sunrays */}
        <View style={styles.sunContainer}>
          <View style={styles.sun}>
            <LinearGradient
              colors={[colors.sunriseOrange, colors.sunriseLight, colors.nepalGold]}
              style={styles.sunGradient}
            />
          </View>
          
          {/* Sunrays */}
          {Array.from({ length: 12 }, (_, i) => (
            <Sunray key={i} angle={i * 30} delay={i * 100} />
          ))}
        </View>

        {/* Cultural Motifs */}
        <MandalaMotif
          size={300}
          style={styles.mandalaTop}
          opacity={0.1}
        />
        <PrayerFlagMotif
          count={7}
          style={styles.prayerFlags}
          opacity={0.3}
        />

        {/* Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Language Selector */}
          <View style={styles.languageContainer}>
            <LanguageSelector />
          </View>

          {/* Greeting */}
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>
              {currentLanguage === 'ne' ? 'नमस्ते!' : 'Namaste!'} 🙏
            </Text>
            <Text style={styles.subtitle}>
              {currentLanguage === 'ne' 
                ? 'खेलकुदको संसारमा स्वागत छ' 
                : 'Welcome to the world of sports'
              }
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={[styles.featureCard, glassmorphismStyles.light]}>
              <Ionicons name="football" size={24} color={colors.textLight} />
              <Text style={styles.featureText}>
                {currentLanguage === 'ne' ? 'खेलकुद' : 'Sports'}
              </Text>
            </View>
            <View style={[styles.featureCard, glassmorphismStyles.light]}>
              <Ionicons name="location" size={24} color={colors.textLight} />
              <Text style={styles.featureText}>
                {currentLanguage === 'ne' ? 'स्थान' : 'Location'}
              </Text>
            </View>
            <View style={[styles.featureCard, glassmorphismStyles.light]}>
              <Ionicons name="people" size={24} color={colors.textLight} />
              <Text style={styles.featureText}>
                {currentLanguage === 'ne' ? 'समुदाय' : 'Community'}
              </Text>
            </View>
          </View>

          {/* Continue Button */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <InteractiveButton
              title={currentLanguage === 'ne' ? 'जारी राख्नुहोस्' : 'Continue'}
              onPress={handleContinue}
              variant="glass"
              size="large"
              style={styles.continueButton}
            />
          </Animated.View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    position: 'relative',
  },
  sunContainer: {
    position: 'absolute',
    top: height * 0.15,
    right: width * 0.1,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sun: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  sunGradient: {
    flex: 1,
    borderRadius: 40,
  },
  sunray: {
    position: 'absolute',
    width: 60,
    height: 4,
    top: 58,
    left: 30,
  },
  sunrayGradient: {
    flex: 1,
    borderRadius: 2,
  },
  mandalaTop: {
    position: 'absolute',
    top: height * 0.05,
    left: -50,
  },
  prayerFlags: {
    position: 'absolute',
    top: height * 0.2,
    left: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  languageContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  greetingContainer: {
    alignItems: 'center',
    marginBottom: 40,
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
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 60,
  },
  featureCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    minWidth: 80,
  },
  featureText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  continueButton: {
    minWidth: 200,
  },
});

export default WelcomeScreen;