import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/MainNavigator';
import { useGameStore } from '@/stores/gameStore';
import { useAuthStore } from '@/stores/authStore';
import { colors, typography, spacing, shadows } from '@/constants/theme';

type GameDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GameDetails'>;
type GameDetailsScreenRouteProp = RouteProp<RootStackParamList, 'GameDetails'>;

export const GameDetailsScreen: React.FC = () => {
  const navigation = useNavigation<GameDetailsScreenNavigationProp>();
  const route = useRoute<GameDetailsScreenRouteProp>();
  const { gameId } = route.params;
  
  const { user } = useAuthStore();
  const { currentGame, isLoading, fetchGame, joinGame, leaveGame } = useGameStore();

  useEffect(() => {
    fetchGame(gameId);
  }, [gameId]);

  const handleJoinGame = async () => {
    try {
      await joinGame(gameId);
      Alert.alert('Success', 'You have joined the game!');
    } catch (error) {
      console.error('Error joining game:', error);
    }
  };

  const handleLeaveGame = async () => {
    Alert.alert(
      'Leave Game',
      'Are you sure you want to leave this game?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveGame(gameId);
              Alert.alert('Left Game', 'You have left the game.');
            } catch (error) {
              console.error('Error leaving game:', error);
            }
          }
        },
      ]
    );
  };

  const isParticipant = currentGame?.participants.some(p => p.id === user?.id);
  const isOrganizer = currentGame?.organizer.id === user?.id;
  const canJoin = currentGame && !isParticipant && currentGame.currentParticipants < currentGame.maxParticipants;

  if (isLoading || !currentGame) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading game details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Game Details</Text>
        
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => Alert.alert('Share', 'Share functionality coming soon!')}
        >
          <Ionicons name="share-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Game Info Card */}
        <View style={[styles.gameCard, shadows.md]}>
          <Text style={styles.gameTitle}>{currentGame.title}</Text>
          <Text style={styles.gameDescription}>{currentGame.description}</Text>
          
          <View style={styles.gameDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="football" size={20} color={colors.primary} />
              <Text style={styles.detailText}>{currentGame.sport.name}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <Text style={styles.detailText}>
                {new Date(currentGame.startTime).toLocaleDateString()} at{' '}
                {new Date(currentGame.startTime).toLocaleTimeString()}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="location" size={20} color={colors.primary} />
              <Text style={styles.detailText}>{currentGame.venue.name}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="people" size={20} color={colors.primary} />
              <Text style={styles.detailText}>
                {currentGame.currentParticipants}/{currentGame.maxParticipants} players
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="card" size={20} color={colors.primary} />
              <Text style={styles.detailText}>
                NPR {currentGame.costPerPerson.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {canJoin && (
            <TouchableOpacity
              style={[styles.joinButton, shadows.sm]}
              onPress={handleJoinGame}
            >
              <Text style={styles.joinButtonText}>Join Game</Text>
            </TouchableOpacity>
          )}
          
          {isParticipant && !isOrganizer && (
            <TouchableOpacity
              style={[styles.leaveButton, shadows.sm]}
              onPress={handleLeaveGame}
            >
              <Text style={styles.leaveButtonText}>Leave Game</Text>
            </TouchableOpacity>
          )}
          
          {isParticipant && (
            <TouchableOpacity
              style={[styles.chatButton, shadows.sm]}
              onPress={() => navigation.navigate('Chat', { gameId })}
            >
              <Ionicons name="chatbubbles" size={20} color={colors.onSecondary} />
              <Text style={styles.chatButtonText}>Chat</Text>
            </TouchableOpacity>
          )}
          
          {(isParticipant || isOrganizer) && (
            <TouchableOpacity
              style={[styles.paymentButton, shadows.sm]}
              onPress={() => navigation.navigate('Payment', { gameId, provider: 'ESEWA' })}
            >
              <Ionicons name="card" size={20} color={colors.onPrimary} />
              <Text style={styles.paymentButtonText}>Pay</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Organizer Info */}
        <View style={[styles.organizerCard, shadows.sm]}>
          <Text style={styles.organizerTitle}>Organized by</Text>
          <View style={styles.organizerInfo}>
            <View style={styles.organizerAvatar}>
              <Text style={styles.organizerInitial}>
                {currentGame.organizer.firstName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.organizerDetails}>
              <Text style={styles.organizerName}>
                {currentGame.organizer.firstName} {currentGame.organizer.lastName}
              </Text>
              <Text style={styles.organizerEmail}>{currentGame.organizer.email}</Text>
            </View>
          </View>
        </View>

        {/* Participants */}
        {currentGame.participants.length > 0 && (
          <View style={[styles.participantsCard, shadows.sm]}>
            <Text style={styles.participantsTitle}>
              Participants ({currentGame.participants.length})
            </Text>
            {currentGame.participants.map((participant) => (
              <View key={participant.id} style={styles.participantRow}>
                <View style={styles.participantAvatar}>
                  <Text style={styles.participantInitial}>
                    {participant.firstName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.participantName}>
                  {participant.firstName} {participant.lastName}
                </Text>
                <Text style={styles.participantSkill}>
                  {participant.skillLevel}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  gameCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    margin: spacing.xl,
  },
  gameTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  gameDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing.lg,
  },
  gameDetails: {
    marginTop: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  detailText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    marginLeft: spacing.md,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    marginRight: spacing.md,
    marginBottom: spacing.sm,
  },
  joinButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.onPrimary,
  },
  leaveButton: {
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    marginRight: spacing.md,
    marginBottom: spacing.sm,
  },
  leaveButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.onPrimary,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    marginRight: spacing.md,
    marginBottom: spacing.sm,
  },
  chatButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.onSecondary,
    marginLeft: spacing.sm,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  paymentButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.onPrimary,
    marginLeft: spacing.sm,
  },
  organizerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  organizerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  organizerInitial: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.onPrimary,
  },
  organizerDetails: {
    flex: 1,
  },
  organizerName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  organizerEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  participantsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  participantsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  participantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  participantInitial: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.onSecondary,
  },
  participantName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    flex: 1,
  },
  participantSkill: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  bottomPadding: {
    height: spacing['4xl'],
  },
});