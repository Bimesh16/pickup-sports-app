import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  FlatList,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface ExploreScreenProps {
  navigation: any;
}

const ExploreScreen: React.FC<ExploreScreenProps> = ({ navigation }) => {
  const { theme, locale } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(false);
  
  const mapAnimation = useSharedValue(0);
  
  const filters = [
    { id: 'football', label: 'Football', icon: 'football' },
    { id: 'basketball', label: 'Basketball', icon: 'basketball' },
    { id: 'cricket', label: 'Cricket', icon: 'baseball' },
    { id: 'tennis', label: 'Tennis', icon: 'tennisball' },
    { id: 'nearby', label: locale === 'nepal' ? 'नजिकै' : 'Nearby', icon: 'location' },
    { id: 'today', label: locale === 'nepal' ? 'आज' : 'Today', icon: 'today' },
    { id: 'free', label: locale === 'nepal' ? 'निःशुल्क' : 'Free', icon: 'pricetag' },
  ];

  const games = [
    {
      id: '1',
      sport: 'Football',
      title: 'Evening Match at Central Park',
      time: '6:00 PM',
      location: 'Central Park Field A',
      distance: '0.5 km',
      price: 'Free',
      capacity: { current: 8, max: 11 },
      skillLevel: 'Intermediate',
      host: 'Ram Sharma',
      image: 'https://via.placeholder.com/300x150/10B981/ffffff?text=Football',
    },
    {
      id: '2',
      sport: 'Basketball',
      title: 'Sunday Hoops Tournament',
      time: '7:30 PM',
      location: 'Community Center Court',
      distance: '1.2 km',
      price: 'NPR 200',
      capacity: { current: 6, max: 10 },
      skillLevel: 'Advanced',
      host: 'Sita Patel',
      image: 'https://via.placeholder.com/300x150/F59E0B/ffffff?text=Basketball',
    },
    {
      id: '3',
      sport: 'Cricket',
      title: 'Weekend Cricket Match',
      time: 'Tomorrow 9:00 AM',
      location: 'Sports Complex Ground 2',
      distance: '2.1 km',
      price: 'NPR 150',
      capacity: { current: 14, max: 22 },
      skillLevel: 'Beginner',
      host: 'Hari Thapa',
      image: 'https://via.placeholder.com/300x150/3B82F6/ffffff?text=Cricket',
    },
  ];

  const handleFilterPress = async (filterId: string) => {
    await Haptics.selectionAsync();
    
    setSelectedFilters(prev => 
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const toggleMapView = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const newShowMap = !showMap;
    setShowMap(newShowMap);
    mapAnimation.value = withSpring(newShowMap ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  };

  const handleGamePress = async (gameId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('GameDetails', { gameId });
  };

  const mapContainerStyle = useAnimatedStyle(() => ({
    height: interpolate(mapAnimation.value, [0, 1], [0, height * 0.5]),
    opacity: mapAnimation.value,
  }));

  const listContainerStyle = useAnimatedStyle(() => ({
    flex: interpolate(mapAnimation.value, [0, 1], [1, 0.6]),
  }));

  const renderGameCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.gameCard, { backgroundColor: theme.colors.card }]}
      onPress={() => handleGamePress(item.id)}
      activeOpacity={0.9}
    >
      <BlurView intensity={10} tint="light" style={styles.gameCardBlur}>
        <View style={styles.gameCardHeader}>
          <View style={styles.gameInfo}>
            <Text style={[styles.gameTitle, { color: theme.colors.text }]}>
              {item.title}
            </Text>
            <View style={styles.gameMetaRow}>
              <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.gameMeta, { color: theme.colors.textSecondary }]}>
                {item.time}
              </Text>
            </View>
            <View style={styles.gameMetaRow}>
              <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.gameMeta, { color: theme.colors.textSecondary }]}>
                {item.location} • {item.distance}
              </Text>
            </View>
          </View>
          
          <View style={styles.gameStats}>
            <View style={[styles.priceTag, { 
              backgroundColor: item.price === 'Free' ? theme.colors.success : theme.colors.primary 
            }]}>
              <Text style={styles.priceText}>{item.price}</Text>
            </View>
            <View style={styles.capacityInfo}>
              <Text style={[styles.capacityText, { color: theme.colors.text }]}>
                {item.capacity.current}/{item.capacity.max}
              </Text>
              <View style={styles.capacityBar}>
                <View 
                  style={[
                    styles.capacityFill, 
                    { 
                      width: `${(item.capacity.current / item.capacity.max) * 100}%`,
                      backgroundColor: theme.colors.secondary,
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.gameFooter}>
          <View style={styles.hostInfo}>
            <Ionicons name="person-circle-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.hostText, { color: theme.colors.textSecondary }]}>
              {locale === 'nepal' ? 'होस्ट:' : 'Host:'} {item.host}
            </Text>
          </View>
          <View style={[styles.skillBadge, { backgroundColor: `${theme.colors.accent}20` }]}>
            <Text style={[styles.skillText, { color: theme.colors.accent }]}>
              {item.skillLevel}
            </Text>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder={locale === 'nepal' ? 'खेलहरू खोज्नुहोस्...' : 'Search games...'}
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.mapToggle, { 
              backgroundColor: showMap ? theme.colors.primary : theme.colors.surface 
            }]}
            onPress={toggleMapView}
          >
            <Ionicons 
              name={showMap ? "list" : "map"} 
              size={20} 
              color={showMap ? 'white' : theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                {
                  backgroundColor: selectedFilters.includes(filter.id)
                    ? theme.colors.primary
                    : theme.colors.surface,
                },
              ]}
              onPress={() => handleFilterPress(filter.id)}
            >
              <Ionicons
                name={filter.icon as any}
                size={16}
                color={
                  selectedFilters.includes(filter.id)
                    ? 'white'
                    : theme.colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.filterText,
                  {
                    color: selectedFilters.includes(filter.id)
                      ? 'white'
                      : theme.colors.text,
                  },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map View */}
      {showMap && (
        <Animated.View style={[styles.mapContainer, mapContainerStyle]}>
          <View style={[styles.mapPlaceholder, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="map" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.mapPlaceholderText, { color: theme.colors.textSecondary }]}>
              {locale === 'nepal' ? 'नक्सा यहाँ देखिनेछ' : 'Map will appear here'}
            </Text>
          </View>
          
          {/* Recenter Button */}
          <TouchableOpacity style={styles.recenterButton}>
            <Ionicons name="locate" size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Games List */}
      <Animated.View style={[styles.listContainer, listContainerStyle]}>
        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: theme.colors.text }]}>
            {locale === 'nepal' ? 'उपलब्ध खेलहरू' : 'Available Games'}
          </Text>
          <Text style={[styles.gameCount, { color: theme.colors.textSecondary }]}>
            {games.length} {locale === 'nepal' ? 'खेलहरू फेला पारियो' : 'games found'}
          </Text>
        </View>

        <FlatList
          data={games}
          renderItem={renderGameCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gamesList}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  mapToggle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mapContainer: {
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  mapPlaceholderText: {
    fontSize: 16,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DC143C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  listHeader: {
    paddingVertical: 16,
    gap: 4,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  gameCount: {
    fontSize: 14,
  },
  gamesList: {
    gap: 16,
    paddingBottom: 100,
  },
  gameCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gameCardBlur: {
    padding: 16,
    gap: 12,
  },
  gameCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gameInfo: {
    flex: 1,
    gap: 4,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gameMeta: {
    fontSize: 12,
  },
  gameStats: {
    alignItems: 'flex-end',
    gap: 8,
  },
  priceTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  capacityInfo: {
    alignItems: 'flex-end',
    gap: 4,
  },
  capacityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  capacityBar: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    borderRadius: 2,
  },
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hostText: {
    fontSize: 12,
  },
  skillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  skillText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default ExploreScreen;