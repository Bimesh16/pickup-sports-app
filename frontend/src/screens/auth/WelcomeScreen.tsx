import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NepalColors, commonStyles } from '../../styles/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type WelcomeScreenNavigationProp = StackNavigationProp<any, 'Welcome'>;

/**
 * Welcome Screen with Nepal-themed design and smooth animations
 */
const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const titleTranslateY = useSharedValue(50);
  const titleOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.8);
  const buttonOpacity = useSharedValue(0);
  const backgroundOpacity = useSharedValue(0);

  useEffect(() => {
    // Staggered animation sequence
    backgroundOpacity.value = withTiming(1, { duration: 500 });
    
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    logoScale.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 300 }));
    
    titleTranslateY.value = withDelay(600, withSpring(0, { damping: 20, stiffness: 300 }));
    titleOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    
    buttonOpacity.value = withDelay(1000, withTiming(1, { duration: 500 }));
    buttonScale.value = withDelay(1000, withSpring(1, { damping: 15, stiffness: 300 }));
  }, []);

  // Animated styles
  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  const handleGetStarted = () => {
    navigation.navigate('Login');
  };

  const handleCreateAccount = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <Animated.View style={[StyleSheet.absoluteFillObject, backgroundAnimatedStyle]}>
        <LinearGradient
          colors={[NepalColors.primaryBlue, NepalColors.primaryCrimson]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        {/* Logo Section */}
        <Animated.View style={[styles.logoSection, logoAnimatedStyle]}>
          <View style={styles.logoContainer}>
            <Ionicons
              name="football"
              size={100}
              color={NepalColors.primaryWhite}
            />
          </View>
          <View style={styles.logoAccent}>
            <Ionicons
              name="location"
              size={24}
              color={NepalColors.primaryWhite}
            />
          </View>
        </Animated.View>

        {/* Title Section */}
        <Animated.View style={[styles.titleSection, titleAnimatedStyle]}>
          <Text style={styles.title}>Pickup Sports</Text>
          <Text style={styles.subtitle}>
            Connect with players, discover games, and compete in your city
          </Text>
          
          {/* Nepal Flag Accent */}
          <View style={styles.flagAccent}>
            <View style={[styles.flagStripe, { backgroundColor: NepalColors.primaryBlue }]} />
            <View style={[styles.flagStripe, { backgroundColor: NepalColors.primaryCrimson }]} />
          </View>
        </Animated.View>

        {/* Features Highlight */}
        <Animated.View style={[styles.featuresSection, titleAnimatedStyle]}>
          <FeatureItem 
            icon="location-outline" 
            text="Find games nearby" 
            delay={1200}
          />
          <FeatureItem 
            icon="people-outline" 
            text="Connect with players" 
            delay={1400}
          />
          <FeatureItem 
            icon="trophy-outline" 
            text="Join tournaments" 
            delay={1600}
          />
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View style={[styles.buttonSection, buttonAnimatedStyle]}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[NepalColors.primaryWhite, NepalColors.surfaceVariant]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={NepalColors.primaryCrimson}
              />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleCreateAccount}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

/**
 * Feature Item Component with individual animation
 */
interface FeatureItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  delay: number;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, text, delay }) => {
  const translateX = useSharedValue(-50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withDelay(delay, withSpring(0, { damping: 20, stiffness: 300 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.featureItem, animatedStyle]}>
      <Ionicons name={icon} size={24} color={NepalColors.primaryWhite} />
      <Text style={styles.featureText}>{text}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: commonStyles.padding.xl,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: commonStyles.padding.xl,
  },
  logoContainer: {
    position: 'relative',
    padding: commonStyles.padding.xl,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoAccent: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: NepalColors.primaryCrimson,
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: NepalColors.primaryWhite,
  },
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: commonStyles.padding.medium,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Poppins-Bold',
    color: NepalColors.primaryWhite,
    textAlign: 'center',
    marginBottom: commonStyles.padding.medium,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.primaryWhite,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  flagAccent: {
    flexDirection: 'row',
    marginTop: commonStyles.padding.medium,
    borderRadius: 4,
    overflow: 'hidden',
  },
  flagStripe: {
    width: 30,
    height: 4,
  },
  featuresSection: {
    alignItems: 'center',
    paddingVertical: commonStyles.padding.large,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: commonStyles.padding.small,
    paddingHorizontal: commonStyles.padding.medium,
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.primaryWhite,
    marginLeft: commonStyles.padding.medium,
    opacity: 0.9,
  },
  buttonSection: {
    paddingBottom: commonStyles.padding.xl,
    gap: commonStyles.padding.medium,
  },
  primaryButton: {
    borderRadius: commonStyles.borderRadius.large,
    overflow: 'hidden',
    ...commonStyles.shadows.medium,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: commonStyles.padding.medium + 4,
    paddingHorizontal: commonStyles.padding.xl,
    gap: commonStyles.padding.small,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryCrimson,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: commonStyles.padding.medium,
    paddingHorizontal: commonStyles.padding.xl,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: commonStyles.borderRadius.large,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.primaryWhite,
  },
});

export default WelcomeScreen;