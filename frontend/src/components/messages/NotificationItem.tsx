import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { NepalColors, commonStyles } from '../../styles/theme';
import { Notification } from '../../types';

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
}

/**
 * Notification Item Component
 */
const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Get notification icon and color
  const getNotificationInfo = useCallback((type: string) => {
    const infoMap: Record<string, { icon: string; color: string }> = {
      game_invite: { icon: 'person-add', color: NepalColors.primaryBlue },
      payment_update: { icon: 'card', color: NepalColors.success },
      game_reminder: { icon: 'alarm', color: NepalColors.warning },
      chat_message: { icon: 'chatbubble', color: NepalColors.info },
      system: { icon: 'information-circle', color: NepalColors.onSurfaceVariant },
    };
    
    return infoMap[type] || { icon: 'notifications', color: NepalColors.primaryCrimson };
  }, []);

  // Format timestamp
  const formatTimestamp = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${Math.floor(diffMinutes)}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    
    const diffDays = Math.floor(diffMinutes / 1440);
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
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

  const notificationInfo = getNotificationInfo(notification.type);

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.container,
          !notification.isRead && styles.unreadContainer,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: notificationInfo.color + '20' }]}>
          <Ionicons
            name={notificationInfo.icon as any}
            size={24}
            color={notificationInfo.color}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text
              style={[styles.title, !notification.isRead && styles.unreadTitle]}
              numberOfLines={1}
            >
              {notification.title}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimestamp(notification.timestamp)}
            </Text>
          </View>
          
          <Text
            style={[styles.message, !notification.isRead && styles.unreadMessage]}
            numberOfLines={2}
          >
            {notification.message}
          </Text>
        </View>

        {/* Unread Indicator */}
        {!notification.isRead && (
          <View style={styles.unreadIndicator} />
        )}

        {/* Action Arrow */}
        <View style={styles.actionContainer}>
          <Ionicons
            name="chevron-forward"
            size={16}
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
    backgroundColor: NepalColors.primaryCrimson + '03',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: commonStyles.padding.medium,
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
  title: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
  },
  unreadTitle: {
    color: NepalColors.primaryCrimson,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    lineHeight: 18,
  },
  unreadMessage: {
    color: NepalColors.onSurface,
    fontFamily: 'Poppins-Medium',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: NepalColors.primaryCrimson,
    marginHorizontal: commonStyles.padding.small,
  },
  actionContainer: {
    padding: commonStyles.padding.small,
  },
});

export default ChatListItem;