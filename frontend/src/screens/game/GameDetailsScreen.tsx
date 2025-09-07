import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface GameDetailsScreenProps {
  navigation: any;
  route: any;
}

const GameDetailsScreen: React.FC<GameDetailsScreenProps> = ({ navigation, route }) => {
  const { theme, locale } = useTheme();
  const { gameId } = route.params;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={styles.hero}>
          <LinearGradient
            colors={['#DC143C', '#5B2C6F']}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.title}>Game Details</Text>
          <Text style={styles.subtitle}>Game ID: {gameId}</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={[styles.text, { color: theme.colors.text }]}>
            {locale === 'nepal' 
              ? 'खेल विवरण यहाँ देखिनेछ' 
              : 'Game details will appear here'
            }
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    padding: 20,
  },
  text: {
    fontSize: 16,
  },
});

export default GameDetailsScreen;