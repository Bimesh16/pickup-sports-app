import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Searchbar, Button } from 'react-native-paper';
import { NepalColors, commonStyles } from '../../styles/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LocationPickerProps {
  initialLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}

/**
 * Advanced Location Picker with Map
 */
const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLocation,
  onLocationSelect,
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Handle map press
  const handleMapPress = useCallback((event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    setSelectedLocation({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      address: 'Selected location', // You would normally reverse geocode this
    });
  }, []);

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Here you would integrate with a geocoding service
    // For now, we'll simulate a search
    setTimeout(() => {
      setIsSearching(false);
      // Mock search result
      Alert.alert('Search', `Searching for: ${searchQuery}`);
    }, 1000);
  }, [searchQuery]);

  // Handle confirm location
  const handleConfirm = useCallback(() => {
    onLocationSelect(selectedLocation);
  }, [selectedLocation, onLocationSelect]);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search for a location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          loading={isSearching}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={NepalColors.primaryCrimson}
        />
      </View>

      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton
      >
        <Marker
          coordinate={{
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
          }}
          title="Game Location"
          description={selectedLocation.address}
        />
      </MapView>

      {/* Selected Location Info */}
      <View style={styles.locationInfo}>
        <View style={styles.locationHeader}>
          <Ionicons name="location" size={20} color={NepalColors.primaryCrimson} />
          <Text style={styles.locationTitle}>Selected Location</Text>
        </View>
        <Text style={styles.locationAddress}>{selectedLocation.address}</Text>
        <Text style={styles.locationCoords}>
          {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={handleConfirm}
          style={styles.confirmButton}
          labelStyle={styles.confirmButtonText}
          buttonColor={NepalColors.primaryCrimson}
        >
          Confirm Location
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: SCREEN_HEIGHT * 0.7,
    width: '100%',
  },
  searchContainer: {
    padding: commonStyles.padding.medium,
    backgroundColor: NepalColors.surface,
  },
  searchBar: {
    backgroundColor: NepalColors.background,
  },
  searchInput: {
    fontFamily: 'Poppins-Regular',
  },
  map: {
    flex: 1,
  },
  locationInfo: {
    backgroundColor: NepalColors.surface,
    padding: commonStyles.padding.large,
    borderTopWidth: 1,
    borderTopColor: NepalColors.outlineVariant,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: commonStyles.padding.small,
  },
  locationTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    marginLeft: commonStyles.padding.small,
  },
  locationAddress: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurface,
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
  },
  actions: {
    padding: commonStyles.padding.large,
    backgroundColor: NepalColors.surface,
  },
  confirmButton: {
    borderRadius: commonStyles.borderRadius.medium,
    paddingVertical: 4,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default LocationPicker;