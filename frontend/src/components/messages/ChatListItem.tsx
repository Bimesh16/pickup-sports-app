import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Badge } from 'react-native-paper';
import { NepalColors, commonStyles } from '../../styles/theme';
import { ChatMessage } from '../../types';

interface ChatListItemProps {
  chat: {
    gameId: number;
    gameName: string;
    lastMessage: ChatMessage;
    unreadCount: number;
    participants: number;
  };
  onPress: () => void;
}

/**
 * Chat List Item with press animations
 */
const ChatListItem: React.FC<ChatListItemProps> = ({ chat, onPress }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Format timestamp
  const formatTimestamp = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffMinutes < 1) return 'now';
    if (diffMinutes < 60) return `${Math.floor(diffMinutes)}m`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
    return `${Math.floor(diffMinutes / 1440)}d`;
  }, []);

  // Get sport icon
  const getSportIcon = useCallback((gameName: string) => {
    if (gameName.toLowerCase().includes('futsal')) return 'football';
    if (gameName.toLowerCase().includes('basketball')) return 'basketball';
    if (gameName.toLowerCase().includes('cricket')) return 'baseball';
    return 'fitness';
  }, []);

  // Press animation handlers
  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    opacity.value = withSpring(0.8, { damping: 15, stiffness: 300 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[styles.container, chat.unreadCount > 0 && styles.unreadContainer]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Game Avatar */}
        <View style={styles.avatarContainer}>
          <Avatar.Icon
            size={48}
            icon={getSportIcon(chat.gameName)}
            style={styles.avatar}
          />
          {chat.unreadCount > 0 && (
            <Badge size={20} style={styles.unreadBadge}>
              {chat.unreadCount}
            </Badge>
          )}
        </View>

        {/* Chat Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text
              style={[styles.gameName, chat.unreadCount > 0 && styles.unreadText]}
              numberOfLines={1}
            >
              {chat.gameName}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimestamp(chat.lastMessage.timestamp)}
            </Text>
          </View>
          
          <View style={styles.messageRow}>
            <Text
              style={[styles.lastMessage, chat.unreadCount > 0 && styles.unreadMessage]}
              numberOfLines={2}
            >
              {chat.lastMessage.senderName}: {chat.lastMessage.content}
            </Text>
          </View>
          
          <View style={styles.footer}>
            <View style={styles.participantInfo}>
              <Ionicons
                name="people"
                size={14}
                color={NepalColors.onSurfaceVariant}
              />
              <Text style={styles.participantCount}>
                {chat.participants} players
              </Text>
            </View>
            
            {chat.unreadCount > 0 && (
              <View style={styles.unreadIndicator} />
            )}
          </View>
        </View>

        {/* Action Arrow */}
        <View style={styles.actionContainer}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={NepalColors.onSurfaceVariant}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NepalColors.surface,
    paddingHorizontal: commonStyles.padding.large,
    paddingVertical: commonStyles.padding.medium,
    borderBottomWidth: 1,
    borderBottomColor: NepalColors.outlineVariant,
  },
  unreadContainer: {
    backgroundColor: NepalColors.primaryCrimson + '05',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: commonStyles.padding.medium,
  },
  avatar: {
    backgroundColor: NepalColors.primaryCrimson,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: NepalColors.primaryCrimson,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gameName: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
  },
  unreadText: {
    color: NepalColors.primaryCrimson,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
  },
  messageRow: {
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    lineHeight: 18,
  },
  unreadMessage: {
    color: NepalColors.onSurface,
    fontFamily: 'Poppins-Medium',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantCount: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: NepalColors.primaryCrimson,
  },
  actionContainer: {
    marginLeft: commonStyles.padding.small,
  },
});

export default ChatListItem;