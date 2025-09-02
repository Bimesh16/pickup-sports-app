import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Chip, Avatar, Divider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import ScrollContainer from '../../components/common/ScrollContainer';
import { useModal } from '../../components/common/AdvancedModal';
import ParticipantsList from '../../components/games/ParticipantsList';

import { useGameActions, useSelectedGame, useGameLoading } from '../../stores/gameStore';
import { useAuthUser } from '../../stores/authStore';
import { NepalColors, commonStyles } from '../../styles/theme';
import { RootStackParamList } from '../../types';

type GameDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GameDetails'>;
type GameDetailsScreenRouteProp = RouteProp<RootStackParamList, 'GameDetails'>;

/**
 * Game Details Screen with comprehensive game information
 */
const GameDetailsScreen: React.FC = () => {
  const navigation = useNavigation<GameDetailsScreenNavigationProp>();
  const route = useRoute<GameDetailsScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const { showModal, showConfirmDialog } = useModal();
  
  const { gameId } = route.params;
  
  // Store hooks
  const user = useAuthUser();
  const selectedGame = useSelectedGame();
  const { getGameDetails, joinGame, leaveGame } = useGameActions();
  const isLoading = useGameLoading();

  // Animation values
  const scrollY = useSharedValue(0);

  // Load game details
  useEffect(() => {
    if (gameId) {
      getGameDetails(gameId).catch(error => {
        Alert.alert('Error', 'Failed to load game details');
        navigation.goBack();
      });
    }
  }, [gameId, getGameDetails, navigation]);

  // Check if user is participant
  const isParticipant = selectedGame?.participants?.some(p => p.id === user?.id) || false;
  const isCreator = selectedGame?.creator?.id === user?.id;
  const availableSlots = selectedGame ? selectedGame.maxPlayers - selectedGame.participants.length : 0;
  const isFull = availableSlots <= 0;

  // Handle join/leave game
  const handleJoinLeave = useCallback(async () => {
    if (!selectedGame || !user) return;

    try {
      if (isParticipant) {
        showConfirmDialog(
          'Leave Game',
          'Are you sure you want to leave this game?',
          async () => {
            await leaveGame(selectedGame.id);
          }
        );
      } else {
        if (selectedGame.pricePerPlayer > 0) {
          // Navigate to payment
          navigation.navigate('Payment', {
            gameId: selectedGame.id,
            amount: selectedGame.pricePerPlayer,
          });
        } else {
          await joinGame(selectedGame.id);
          Alert.alert('Success', 'You have joined the game!');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update game participation');
    }
  }, [selectedGame, user, isParticipant, joinGame, leaveGame, navigation, showConfirmDialog]);

  // Handle share game
  const handleShare = useCallback(async () => {
    if (!selectedGame) return;

    try {
      await Share.share({
        message: `Join me for ${selectedGame.sport} at ${selectedGame.location} on ${new Date(selectedGame.time).toLocaleString()}!`,
        url: `https://pickupsports.com/games/${selectedGame.id}`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [selectedGame]);

  // Show participants modal
  const showParticipants = useCallback(() => {
    if (!selectedGame) return;
    
    showModal(
      <ParticipantsList
        participants={selectedGame.participants}
        maxPlayers={selectedGame.maxPlayers}
        onParticipantPress={(userId) => {
          // Navigate to user profile
          Alert.alert('Profile', `View profile for user ${userId}`);
        }}
      />,
      {
        title: 'Game Participants',
        dismissible: true,
        animationType: 'slide',
      }
    );
  }, [showModal, selectedGame]);

  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Header animated style
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 200], [0, 1]);
    
    return {
      opacity,
    };
  });

  if (!selectedGame) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading game details...</Text>
      </View>
    );
  }

  const gameDate = new Date(selectedGame.time);
  const isUpcoming = gameDate > new Date();

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, { paddingTop: insets.top + 16 }, headerAnimatedStyle]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={NepalColors.onSurface} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle} numberOfLines={1}>
            {selectedGame.sport} Game
          </Text>
          
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons name="share" size={24} color={NepalColors.primaryCrimson} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Scrollable Content */}
      <ScrollContainer
        onScroll={scrollHandler}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <Card style={styles.heroCard}>
          <LinearGradient
            colors={[NepalColors.primaryBlue, NepalColors.primaryCrimson]}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Text style={styles.sportTitle}>{selectedGame.sport}</Text>
              <Text style={styles.skillLevel}>{selectedGame.skillLevel} Level</Text>
              
              <View style={styles.heroDetails}>
                <View style={styles.heroDetail}>
                  <Ionicons name="time" size={20} color={NepalColors.primaryWhite} />
                  <Text style={styles.heroDetailText}>
                    {gameDate.toLocaleDateString()} at {gameDate.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Text>
                </View>
                
                <View style={styles.heroDetail}>
                  <Ionicons name="location" size={20} color={NepalColors.primaryWhite} />
                  <Text style={styles.heroDetailText} numberOfLines={2}>
                    {selectedGame.location}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Card>

        {/* Quick Info */}
        <View style={styles.quickInfoContainer}>
          <View style={styles.quickInfoGrid}>
            <QuickInfoItem
              icon="people"
              value={`${selectedGame.participants.length}/${selectedGame.maxPlayers}`}
              label="Players"
              color={NepalColors.futsalGreen}
            />
            <QuickInfoItem
              icon="cash"
              value={selectedGame.pricePerPlayer > 0 ? `Rs. ${selectedGame.pricePerPlayer}` : 'Free'}
              label="Per Player"
              color={NepalColors.warning}
            />
            <QuickInfoItem
              icon="timer"
              value={`${selectedGame.durationMinutes}m`}
              label="Duration"
              color={NepalColors.info}
            />
            <QuickInfoItem
              icon="calendar"
              value={isUpcoming ? 'Upcoming' : 'Completed'}
              label="Status"
              color={isUpcoming ? NepalColors.success : NepalColors.onSurfaceVariant}
            />
          </View>
        </View>

        {/* Description */}
        {selectedGame.description && (
          <Card style={styles.descriptionCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>Description</Text>
              <Text style={styles.descriptionText}>{selectedGame.description}</Text>
            </Card.Content>
          </Card>
        )}

        {/* Participants */}
        <Card style={styles.participantsCard}>
          <Card.Content>
            <View style={styles.participantsHeader}>
              <Text style={styles.cardTitle}>
                Players ({selectedGame.participants.length}/{selectedGame.maxPlayers})
              </Text>
              <TouchableOpacity onPress={showParticipants} activeOpacity={0.7}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.participantsPreview}>
              {selectedGame.participants.slice(0, 6).map((participant, index) => (
                <Avatar.Text
                  key={participant.id}
                  size={40}
                  label={participant.firstName.charAt(0) + participant.lastName.charAt(0)}
                  style={[styles.participantAvatar, { zIndex: 10 - index }]}
                />
              ))}
              
              {availableSlots > 0 && (
                <View style={styles.availableSlot}>
                  <Ionicons name="add" size={20} color={NepalColors.onSurfaceVariant} />
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Map */}
        <Card style={styles.mapCard}>
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              region={{
                latitude: selectedGame.latitude,
                longitude: selectedGame.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: selectedGame.latitude,
                  longitude: selectedGame.longitude,
                }}
                title={selectedGame.sport}
                description={selectedGame.location}
              />
            </MapView>
            
            <TouchableOpacity
              style={styles.mapOverlay}
              onPress={() => {
                // Open in maps app
                Alert.alert('Directions', 'Open in maps app');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.mapOverlayText}>Tap for directions</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Game Rules & Equipment */}
        {(selectedGame.rules || selectedGame.equipmentProvided || selectedGame.equipmentRequired) && (
          <Card style={styles.rulesCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>Game Information</Text>
              
              {selectedGame.rules && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Rules</Text>
                  <Text style={styles.infoText}>{selectedGame.rules}</Text>
                </View>
              )}
              
              {selectedGame.equipmentProvided && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Equipment Provided</Text>
                  <Text style={styles.infoText}>{selectedGame.equipmentProvided}</Text>
                </View>
              )}
              
              {selectedGame.equipmentRequired && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Bring Your Own</Text>
                  <Text style={styles.infoText}>{selectedGame.equipmentRequired}</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollContainer>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        {isCreator ? (
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Edit', 'Edit game functionality')}
            style={styles.editButton}
            labelStyle={styles.editButtonText}
          >
            Edit Game
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleJoinLeave}
            loading={isLoading}
            disabled={isLoading || (!isParticipant && isFull)}
            style={[
              styles.joinButton,
              isParticipant && styles.leaveButton,
            ]}
            labelStyle={styles.joinButtonText}
            buttonColor={isParticipant ? NepalColors.error : NepalColors.primaryCrimson}
          >
            {isLoading
              ? 'Loading...'
              : isParticipant
              ? 'Leave Game'
              : isFull
              ? 'Game Full'
              : selectedGame.pricePerPlayer > 0
              ? `Join for Rs. ${selectedGame.pricePerPlayer}`
              : 'Join Game'
            }
          </Button>
        )}
      </View>
    </View>
  );
};

/**
 * Quick Info Item Component
 */
interface QuickInfoItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  color: string;
}

const QuickInfoItem: React.FC<QuickInfoItemProps> = ({ icon, value, label, color }) => (
  <View style={styles.quickInfoItem}>
    <View style={[styles.quickInfoIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.quickInfoValue}>{value}</Text>
    <Text style={styles.quickInfoLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  loadingContainer: {
    ...commonStyles.centerContainer,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
  },
  header: {
    backgroundColor: NepalColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: NepalColors.outlineVariant,
    paddingHorizontal: commonStyles.padding.large,
    paddingBottom: commonStyles.padding.medium,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: commonStyles.padding.small,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    textAlign: 'center',
    marginHorizontal: commonStyles.padding.medium,
  },
  shareButton: {
    padding: commonStyles.padding.small,
  },
  scrollContent: {
    paddingHorizontal: commonStyles.padding.large,
    paddingBottom: 100, // Space for bottom bar
  },
  heroCard: {
    backgroundColor: 'transparent',
    marginBottom: commonStyles.padding.large,
    overflow: 'hidden',
  },
  heroGradient: {
    borderRadius: commonStyles.borderRadius.large,
  },
  heroContent: {
    padding: commonStyles.padding.xl,
    alignItems: 'center',
  },
  sportTitle: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: NepalColors.primaryWhite,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  skillLevel: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.primaryWhite,
    opacity: 0.9,
    marginBottom: commonStyles.padding.large,
    textTransform: 'capitalize',
  },
  heroDetails: {
    width: '100%',
    gap: commonStyles.padding.medium,
  },
  heroDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: commonStyles.padding.small,
  },
  heroDetailText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.primaryWhite,
    flex: 1,
  },
  quickInfoContainer: {
    marginBottom: commonStyles.padding.large,
  },
  quickInfoGrid: {
    flexDirection: 'row',
    backgroundColor: NepalColors.surface,
    borderRadius: commonStyles.borderRadius.large,
    padding: commonStyles.padding.large,
    ...commonStyles.shadows.medium,
  },
  quickInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickInfoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: commonStyles.padding.small,
  },
  quickInfoValue: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    textAlign: 'center',
  },
  quickInfoLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 2,
  },
  descriptionCard: {
    backgroundColor: NepalColors.surface,
    marginBottom: commonStyles.padding.large,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    marginBottom: commonStyles.padding.medium,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    lineHeight: 20,
  },
  participantsCard: {
    backgroundColor: NepalColors.surface,
    marginBottom: commonStyles.padding.large,
  },
  participantsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: commonStyles.padding.medium,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryCrimson,
  },
  participantsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: -8, // Overlap avatars
  },
  participantAvatar: {
    backgroundColor: NepalColors.primaryCrimson,
    borderWidth: 2,
    borderColor: NepalColors.surface,
  },
  availableSlot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: NepalColors.surfaceVariant,
    borderWidth: 2,
    borderColor: NepalColors.outline,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  mapCard: {
    backgroundColor: NepalColors.surface,
    marginBottom: commonStyles.padding.large,
    overflow: 'hidden',
  },
  mapContainer: {
    height: 200,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: commonStyles.padding.medium,
    alignItems: 'center',
  },
  mapOverlayText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.primaryWhite,
  },
  rulesCard: {
    backgroundColor: NepalColors.surface,
    marginBottom: commonStyles.padding.large,
  },
  infoSection: {
    marginBottom: commonStyles.padding.medium,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryCrimson,
    marginBottom: commonStyles.padding.small,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    lineHeight: 20,
  },
  bottomBar: {
    backgroundColor: NepalColors.surface,
    paddingHorizontal: commonStyles.padding.large,
    paddingTop: commonStyles.padding.medium,
    borderTopWidth: 1,
    borderTopColor: NepalColors.outlineVariant,
    ...commonStyles.shadows.medium,
  },
  joinButton: {
    borderRadius: commonStyles.borderRadius.medium,
    paddingVertical: 4,
  },
  leaveButton: {
    backgroundColor: NepalColors.error,
  },
  editButton: {
    borderColor: NepalColors.primaryCrimson,
    borderRadius: commonStyles.borderRadius.medium,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryCrimson,
  },
  joinButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default GameDetailsScreen;