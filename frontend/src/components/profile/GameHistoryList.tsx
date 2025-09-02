import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { gameAPI } from '../../services/api';
import { NepalColors, commonStyles } from '../../styles/theme';
import { Game } from '../../types';

interface GameHistoryListProps {
  userId: number;
  limit?: number;
  onGamePress?: (gameId: number) => void;
}

/**
 * Game History List Component
 */
const GameHistoryList: React.FC<GameHistoryListProps> = ({
  userId,
  limit = 5,
  onGamePress,
}) => {
  // Fetch user games
  const { data: games, isLoading } = useQuery({
    queryKey: ['userGames', userId],
    queryFn: () => gameAPI.getUserGames(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // Format game date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  // Get game status
  const getGameStatus = (game: Game) => {
    const gameTime = new Date(game.time);
    const now = new Date();
    
    if (gameTime > now) return 'upcoming';
    if (gameTime.toDateString() === now.toDateString()) return 'today';
    return 'completed';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return NepalColors.info;
      case 'today': return NepalColors.warning;
      case 'completed': return NepalColors.success;
      default: return NepalColors.onSurfaceVariant;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading game history...</Text>
      </View>
    );
  }

  if (!games || games.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="calendar-outline"
          size={32}
          color={NepalColors.onSurfaceVariant}
        />
        <Text style={styles.emptyText}>No games played yet</Text>
      </View>
    );
  }

  const displayGames = games.slice(0, limit);

  return (
    <View style={styles.container}>
      <FlatList
        data={displayGames}
        renderItem={({ item }) => {
          const status = getGameStatus(item);
          const statusColor = getStatusColor(status);
          
          return (
            <TouchableOpacity
              style={styles.gameItem}
              onPress={() => onGamePress?.(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.gameHeader}>
                <View style={styles.gameInfo}>
                  <Text style={styles.gameSport}>{item.sport}</Text>
                  <Text style={styles.gameDate}>{formatDate(item.time)}</Text>
                </View>
                
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.gameLocation} numberOfLines={1}>
                {item.location}
              </Text>
              
              <View style={styles.gameDetails}>
                <Text style={styles.gamePrice}>
                  {item.pricePerPlayer > 0 ? `Rs. ${item.pricePerPlayer}` : 'Free'}
                </Text>
                <Text style={styles.gamePlayers}>
                  {item.participants?.length || 0}/{item.maxPlayers} players
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: commonStyles.padding.large,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: commonStyles.padding.xl,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    marginTop: commonStyles.padding.small,
  },
  gameItem: {
    paddingVertical: commonStyles.padding.medium,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: commonStyles.padding.small,
  },
  gameInfo: {
    flex: 1,
  },
  gameSport: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    textTransform: 'capitalize',
  },
  gameDate: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: commonStyles.padding.small,
    paddingVertical: 4,
    borderRadius: commonStyles.borderRadius.small,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    textTransform: 'uppercase',
  },
  gameLocation: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    marginBottom: commonStyles.padding.small,
  },
  gameDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  separator: {
    height: 1,
    backgroundColor: NepalColors.outlineVariant,
    marginVertical: commonStyles.padding.small,
  },
});

export default GameHistoryList;