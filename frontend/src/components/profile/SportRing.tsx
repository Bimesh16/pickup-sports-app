import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Image, TouchableOpacity, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImagePickerService from '@/components/common/ImagePicker';

interface SportRingProps {
  sport: string;
  size?: number;
  isActive?: boolean;
  onPress?: () => void;
  avatar?: string;
  onAvatarChange?: (uri: string) => void;
}

const SPORT_COLORS = {
  'soccer': '#22C55E',
  'football': '#22C55E',
  'basketball': '#F97316',
  'volleyball': '#06B6D4',
  'tennis': '#84CC16',
  'cricket': '#3B82F6',
  'badminton': '#A855F7',
  'running': '#EF4444',
  'default': '#22D3EE'
};

const SportRing: React.FC<SportRingProps> = ({ 
  sport, 
  size = 100, 
  isActive = false, 
  onPress,
  avatar,
  onAvatarChange
}) => {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const orbitAnim = useRef(new Animated.Value(0)).current;

  const sportColor = SPORT_COLORS[sport.toLowerCase() as keyof typeof SPORT_COLORS] || SPORT_COLORS.default;

  useEffect(() => {
    // Slow 6-second orbit glow
    const orbitGlow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    );
    orbitGlow.start();

    // Orbit animation
    const orbit = Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: true,
      })
    );
    orbit.start();

    return () => {
      orbitGlow.stop();
      orbit.stop();
    };
  }, []);

  const handlePress = () => {
    if (onPress) {
      // Pulse animation on tap
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      
      onPress();
    }
  };

  const handleAvatarPress = async () => {
    try {
      console.log('SportRing: handleAvatarPress called');
      const result = await ImagePickerService.showImagePicker({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        mediaTypes: 'Images',
      });

      console.log('SportRing: Image picker result:', result);
      if (result && onAvatarChange) {
        console.log('SportRing: Calling onAvatarChange with URI:', result.uri);
        onAvatarChange(result.uri);
      } else {
        console.log('SportRing: No result or onAvatarChange not provided');
      }
    } catch (error) {
      console.error('SportRing: Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const orbitRotation = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          width: size, 
          height: size,
          transform: [{ scale: pulseAnim }]
        }
      ]}
      onTouchEnd={handlePress}
    >
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size + 20,
            height: size + 20,
            borderRadius: (size + 20) / 2,
            borderColor: sportColor,
            opacity: glowOpacity,
            transform: [{ rotate: orbitRotation }],
          },
        ]}
      />
      
      {/* Main ring */}
      <View
        style={[
          styles.mainRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: sportColor,
            borderWidth: isActive ? 3 : 2,
          },
        ]}
      />
      
      {/* Inner content area with avatar */}
      <TouchableOpacity
        style={[
          styles.innerContent,
          {
            width: size - 8,
            height: size - 8,
            borderRadius: (size - 8) / 2,
          },
        ]}
        onPress={handleAvatarPress}
        activeOpacity={0.8}
      >
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            style={[
              styles.avatarImage,
              {
                width: size - 16,
                height: size - 16,
                borderRadius: (size - 16) / 2,
              },
            ]}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={size * 0.4} color="rgba(255,255,255,0.6)" />
            <Text style={[styles.uploadText, { fontSize: size * 0.12 }]}>Tap to upload</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  mainRing: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  innerContent: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  uploadText: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default SportRing;
