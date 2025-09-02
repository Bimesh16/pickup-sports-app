import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Card } from 'react-native-paper';
import { NepalColors, commonStyles } from '../../styles/theme';
import { GameSummary } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MapViewModalProps {
  games: GameSummary[];
  onGameSelect: (gameId: number) => void;
}

/**
 * Map View Modal for Game Discovery
 */
const MapViewModal: React.FC<MapViewModalProps> = ({
  games,
  onGameSelect,
}) => {
  const [selectedGame, setSelectedGame] = React.useState<GameSummary | null>(null);

  // Calculate map region to fit all games
  const getMapRegion = useCallback(() => {
    if (games.length === 0) {
      return {
        latitude: 27.7172,
        longitude: 85.3240,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }

    const latitudes = games.map(game => game.latitude);
    const longitudes = games.map(game => game.longitude);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const deltaLat = (maxLat - minLat) * 1.2; // Add 20% padding
    const deltaLng = (maxLng - minLng) * 1.2;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(deltaLat, 0.01),
      longitudeDelta: Math.max(deltaLng, 0.01),
    };
  }, [games]);

  // Get sport color
  const getSportColor = useCallback((sport: string) => {
    const colorMap: Record<string, string> = {
      futsal: NepalColors.futsalGreen,
      football: NepalColors.success,
      basketball: NepalColors.warning,
      cricket: NepalColors.primaryBlue,
      volleyball: NepalColors.primaryCrimson,
      badminton: NepalColors.info,
    };
    
    return colorMap[sport.toLowerCase()] || NepalColors.primaryCrimson;
  }, []);

  // Handle marker press
  const handleMarkerPress = useCallback((game: GameSummary) => {
    setSelectedGame(game);
  }, []);

  // Handle game selection
  const handleGameSelect = useCallback(() => {
    if (selectedGame) {
      onGameSelect(selectedGame.id);
    }
  }, [selectedGame, onGameSelect]);

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={getMapRegion()}
        showsUserLocation
        showsMyLocationButton
      >
        {games.map((game) => (
          <Marker
            key={game.id}
            coordinate={{
              latitude: game.latitude,
              longitude: game.longitude,
            }}
            onPress={() => handleMarkerPress(game)}
          >
            <View style={[
              styles.markerContainer,
              { backgroundColor: getSportColor(game.sport) }
            ]}>
              <Ionicons
                name="football"
                size={16}
                color={NepalColors.primaryWhite}
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Game Info Panel */}
      {selectedGame && (
        <View style={styles.gameInfoPanel}>
          <Card style={styles.gameInfoCard}>
            <Card.Content style={styles.gameInfoContent}>
              <View style={styles.gameInfoHeader}>
                <View style={styles.gameInfoLeft}>
                  <Text style={styles.gameTitle}>{selectedGame.sport}</Text>
                  <Text style={styles.gameLocation} numberOfLines={1}>
                    {selectedGame.location}
                  </Text>
                  <Text style={styles.gameTime}>
                    {new Date(selectedGame.time).toLocaleString()}
                  </Text>
                </View>
                
                <View style={styles.gameInfoRight}>
                  <Text style={styles.gamePrice}>
                    {selectedGame.pricePerPlayer > 0 
                      ? `Rs. ${selectedGame.pricePerPlayer}` 
                      : 'Free'
                    }
                  </Text>
                  <Text style={styles.gamePlayers}>
                    {selectedGame.currentPlayers}/{selectedGame.maxPlayers} players
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={handleGameSelect}
                activeOpacity={0.8}
              >
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Ionicons name="arrow-forward" size={16} color={NepalColors.primaryWhite} />
              </TouchableOpacity>
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity
          style={styles.mapControl}
          onPress={() => setSelectedGame(null)}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={20} color={NepalColors.onSurface} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: SCREEN_HEIGHT * 0.8,
    width: '100%',
    borderRadius: commonStyles.borderRadius.large,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: NepalColors.primaryWhite,
  },
  gameInfoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  gameInfoCard: {
    margin: commonStyles.padding.medium,
    backgroundColor: NepalColors.surface,
  },
  gameInfoContent: {
    padding: commonStyles.padding.medium,
  },
  gameInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: commonStyles.padding.medium,
  },
  gameInfoLeft: {
    flex: 1,
  },
  gameInfoRight: {
    alignItems: 'flex-end',
  },
  gameTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    textTransform: 'capitalize',
  },
  gameLocation: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    marginTop: 2,
  },
  gameTime: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.primaryBlue,
    marginTop: 2,
  },
  gamePrice: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryCrimson,
  },
  gamePlayers: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    marginTop: 2,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NepalColors.primaryCrimson,
    paddingVertical: commonStyles.padding.medium,
    borderRadius: commonStyles.borderRadius.medium,
    gap: commonStyles.padding.small,
  },
  viewDetailsText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryWhite,
  },
  mapControls: {
    position: 'absolute',
    top: commonStyles.padding.medium,
    right: commonStyles.padding.medium,
  },
  mapControl: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: NepalColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...commonStyles.shadows.medium,
  },
});

export default MapViewModal;