import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Title, Paragraph, Button, Chip, Avatar } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { NepalColors, FontSizes, Spacing, BorderRadius } from '@/constants/theme';
import { Game, GameStackParamList } from '@/types';

type GameDetailsScreenRouteProp = RouteProp<GameStackParamList, 'GameDetails'>;

export default function GameDetailsScreen() {
  const route = useRoute<GameDetailsScreenRouteProp>();
  const { gameId } = route.params;
  
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    loadGameDetails();
  }, [gameId]);

  const loadGameDetails = async () => {
    try {
      setIsLoading(true);
      // TODO: Load game details from API
      // For now, using mock data
      setGame(null);
    } catch (error) {
      console.error('Failed to load game details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async () => {
    try {
      // TODO: Call API to join game
      setIsJoined(true);
      Alert.alert('Success', 'You have joined the game!');
    } catch (error) {
      Alert.alert('Error', 'Failed to join game. Please try again.');
    }
  };

  const handleLeaveGame = async () => {
    try {
      // TODO: Call API to leave game
      setIsJoined(false);
      Alert.alert('Success', 'You have left the game.');
    } catch (error) {
      Alert.alert('Error', 'Failed to leave game. Please try again.');
    }
  };

  if (!game) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading game details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Game Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerContent}>
            <Title style={styles.gameTitle}>{game.title}</Title>
            <Chip 
              mode="outlined" 
              style={[styles.sportChip, { backgroundColor: getSportColor(game.sport) }]}
              textStyle={styles.sportChipText}
            >
              {game.sport}
            </Chip>
          </View>
          
          <Paragraph style={styles.gameDescription}>{game.description}</Paragraph>
          
          <View style={styles.gameInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar" size={16} color={NepalColors.textSecondary} />
              <Text style={styles.infoText}>
                {new Date(game.dateTime).toLocaleDateString()} at {new Date(game.dateTime).toLocaleTimeString()}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="time" size={16} color={NepalColors.textSecondary} />
              <Text style={styles.infoText}>{game.duration} minutes</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="location" size={16} color={NepalColors.textSecondary} />
              <Text style={styles.infoText}>{game.location.name}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="people" size={16} color={NepalColors.textSecondary} />
              <Text style={styles.infoText}>{game.currentPlayers}/{game.maxPlayers} players</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Organizer Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Organizer</Title>
          <View style={styles.organizerInfo}>
            <Avatar.Text
              size={48}
              label={game.organizer.name.charAt(0)}
              style={styles.organizerAvatar}
            />
            <View style={styles.organizerDetails}>
              <Text style={styles.organizerName}>{game.organizer.name}</Text>
              <Text style={styles.organizerRating}>
                <Ionicons name="star" size={16} color={NepalColors.warning} />
                {' '}{game.organizer.rating}/5
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Players List */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Players ({game.players.length})</Title>
          <View style={styles.playersList}>
            {game.players.map((player) => (
              <View key={player.id} style={styles.playerItem}>
                <Avatar.Text
                  size={32}
                  label={player.name.charAt(0)}
                  style={styles.playerAvatar}
                />
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerSkill}>{player.skillLevel}</Text>
                </View>
                <Chip
                  mode="outlined"
                  style={[
                    styles.statusChip,
                    { backgroundColor: getStatusColor(player.status) }
                  ]}
                  textStyle={styles.statusChipText}
                >
                  {player.status}
                </Chip>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Equipment */}
      {game.equipment.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Equipment</Title>
            {game.equipment.map((item, index) => (
              <View key={index} style={styles.equipmentItem}>
                <Ionicons 
                  name={item.providedByOrganizer ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={item.providedByOrganizer ? NepalColors.success : NepalColors.error} 
                />
                <Text style={styles.equipmentText}>{item.name}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Rules */}
      {game.rules.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Rules</Title>
            {game.rules.map((rule, index) => (
              <Text key={index} style={styles.ruleText}>• {rule}</Text>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {isJoined ? (
          <Button
            mode="outlined"
            onPress={handleLeaveGame}
            style={styles.leaveButton}
            textColor={NepalColors.error}
          >
            Leave Game
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleJoinGame}
            style={styles.joinButton}
            disabled={game.currentPlayers >= game.maxPlayers}
          >
            {game.currentPlayers >= game.maxPlayers ? 'Game Full' : 'Join Game'}
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

const getSportColor = (sport: string): string => {
  const colors: Record<string, string> = {
    FOOTBALL: NepalColors.futsalGreen,
    BASKETBALL: NepalColors.basketballOrange,
    CRICKET: NepalColors.cricketBrown,
    BADMINTON: NepalColors.primary,
    TENNIS: NepalColors.success,
    VOLLEYBALL: NepalColors.warning,
    TABLE_TENNIS: NepalColors.info,
    FUTSAL: NepalColors.futsalGreen,
  };
  return colors[sport] || NepalColors.primary;
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    CONFIRMED: NepalColors.success,
    PENDING: NepalColors.warning,
    DECLINED: NepalColors.error,
    WAITLISTED: NepalColors.info,
  };
  return colors[status] || NepalColors.textSecondary;
};

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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  gameTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: NepalColors.text,
    flex: 1,
  },
  sportChip: {
    marginLeft: Spacing.sm,
  },
  sportChipText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  gameDescription: {
    fontSize: FontSizes.base,
    color: NepalColors.text,
    marginBottom: Spacing.md,
  },
  gameInfo: {
    gap: Spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: Spacing.sm,
    fontSize: FontSizes.sm,
    color: NepalColors.textSecondary,
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
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerAvatar: {
    backgroundColor: NepalColors.primary,
    marginRight: Spacing.md,
  },
  organizerDetails: {
    flex: 1,
  },
  organizerName: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: NepalColors.text,
  },
  organizerRating: {
    fontSize: FontSizes.sm,
    color: NepalColors.textSecondary,
  },
  playersList: {
    gap: Spacing.sm,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerAvatar: {
    backgroundColor: NepalColors.primary,
    marginRight: Spacing.sm,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: FontSizes.sm,
    color: NepalColors.text,
  },
  playerSkill: {
    fontSize: FontSizes.xs,
    color: NepalColors.textSecondary,
  },
  statusChip: {
    marginLeft: Spacing.sm,
  },
  statusChipText: {
    fontSize: FontSizes.xs,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  equipmentText: {
    marginLeft: Spacing.sm,
    fontSize: FontSizes.sm,
    color: NepalColors.text,
  },
  ruleText: {
    fontSize: FontSizes.sm,
    color: NepalColors.text,
    marginBottom: Spacing.xs,
  },
  actionButtons: {
    padding: Spacing.lg,
  },
  joinButton: {
    backgroundColor: NepalColors.primary,
  },
  leaveButton: {
    borderColor: NepalColors.error,
  },
});