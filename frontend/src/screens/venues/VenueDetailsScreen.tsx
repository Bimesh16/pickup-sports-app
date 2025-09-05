import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Title, Paragraph, Button, Chip } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { NepalColors, FontSizes, Spacing, BorderRadius } from '@/constants/theme';
import { GameLocation, GameStackParamList } from '@/types';

type VenueDetailsScreenRouteProp = RouteProp<GameStackParamList, 'VenueDetails'>;

export default function VenueDetailsScreen() {
  const route = useRoute<VenueDetailsScreenRouteProp>();
  const { venueId } = route.params;
  
  const [venue, setVenue] = useState<GameLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadVenueDetails();
  }, [venueId]);

  const loadVenueDetails = async () => {
    try {
      setIsLoading(true);
      // TODO: Load venue details from API
      // For now, using mock data
      setVenue(null);
    } catch (error) {
      console.error('Failed to load venue details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetDirections = () => {
    // TODO: Open maps app with directions
    Alert.alert('Directions', 'Opening maps app...');
  };

  const handleCallVenue = () => {
    // TODO: Open phone app to call venue
    Alert.alert('Call Venue', 'Opening phone app...');
  };

  if (!venue) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading venue details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Venue Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <Title style={styles.venueName}>{venue.name}</Title>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={NepalColors.warning} />
            <Text style={styles.ratingText}>{venue.rating}/5</Text>
          </View>
          
          <View style={styles.addressContainer}>
            <Ionicons name="location" size={16} color={NepalColors.textSecondary} />
            <Text style={styles.addressText}>{venue.address}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Facilities */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Facilities</Title>
          <View style={styles.facilitiesList}>
            {venue.facilities.map((facility, index) => (
              <Chip
                key={index}
                mode="outlined"
                style={styles.facilityChip}
                textStyle={styles.facilityChipText}
              >
                {facility}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Photos */}
      {venue.photos.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Photos</Title>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.photosContainer}>
                {venue.photos.map((photo, index) => (
                  <View key={index} style={styles.photoPlaceholder}>
                    <Ionicons name="image" size={40} color={NepalColors.textSecondary} />
                    <Text style={styles.photoText}>Photo {index + 1}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </Card.Content>
        </Card>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          mode="contained"
          onPress={handleGetDirections}
          style={styles.directionsButton}
          icon="directions"
        >
          Get Directions
        </Button>
        
        <Button
          mode="outlined"
          onPress={handleCallVenue}
          style={styles.callButton}
          icon="phone"
        >
          Call Venue
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NepalColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSizes.lg,
    color: NepalColors.textSecondary,
  },
  headerCard: {
    margin: Spacing.lg,
    elevation: 4,
  },
  venueName: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: NepalColors.text,
    marginBottom: Spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  ratingText: {
    marginLeft: Spacing.xs,
    fontSize: FontSizes.sm,
    color: NepalColors.textSecondary,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressText: {
    marginLeft: Spacing.sm,
    fontSize: FontSizes.sm,
    color: NepalColors.textSecondary,
    flex: 1,
  },
  card: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: NepalColors.text,
    marginBottom: Spacing.md,
  },
  facilitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  facilityChip: {
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  facilityChipText: {
    fontSize: FontSizes.sm,
  },
  photosContainer: {
    flexDirection: 'row',
  },
  photoPlaceholder: {
    width: 120,
    height: 80,
    backgroundColor: NepalColors.surface,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  photoText: {
    fontSize: FontSizes.xs,
    color: NepalColors.textSecondary,
    marginTop: Spacing.xs,
  },
  actionButtons: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  directionsButton: {
    backgroundColor: NepalColors.primary,
  },
  callButton: {
    borderColor: NepalColors.primary,
  },
});