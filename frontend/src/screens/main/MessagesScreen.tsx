import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Searchbar, Card, Badge, Avatar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScrollContainer from '../../components/common/ScrollContainer';
import { useModal } from '../../components/common/AdvancedModal';
import ChatListItem from '../../components/messages/ChatListItem';
import NotificationItem from '../../components/messages/NotificationItem';

import { useAuthUser } from '../../stores/authStore';
import { NepalColors, commonStyles } from '../../styles/theme';
import { ChatMessage, Notification, RootStackParamList } from '../../types';

type MessagesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Mock data for demonstration
const mockChats: Array<{
  gameId: number;
  gameName: string;
  lastMessage: ChatMessage;
  unreadCount: number;
  participants: number;
}> = [
  {
    gameId: 1,
    gameName: 'Futsal @ Pulchowk',
    lastMessage: {
      id: '1',
      gameId: 1,
      senderId: 2,
      senderName: 'Raj Kumar',
      content: 'See you all at 6 PM! Don\'t forget your boots 🥾',
      timestamp: new Date().toISOString(),
      messageType: 'text',
    },
    unreadCount: 3,
    participants: 8,
  },
  {
    gameId: 2,
    gameName: 'Basketball @ TU Court',
    lastMessage: {
      id: '2',
      gameId: 2,
      senderId: 3,
      senderName: 'Maya Shakya',
      content: 'Weather looks good for tonight!',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      messageType: 'text',
    },
    unreadCount: 0,
    participants: 10,
  },
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'game_invite',
    title: 'Game Invitation',
    message: 'Sanjay invited you to join Cricket @ Ratna Park',
    timestamp: new Date().toISOString(),
    isRead: false,
    data: { gameId: 3 },
  },
  {
    id: '2',
    type: 'payment_update',
    title: 'Payment Confirmed',
    message: 'Your payment for Futsal @ Pulchowk has been confirmed',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    isRead: true,
    data: { gameId: 1, transactionId: 'txn_123' },
  },
];

/**
 * Messages Screen with Chat and Notifications
 */
const MessagesScreen: React.FC = () => {
  const navigation = useNavigation<MessagesScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { showModal } = useModal();
  const user = useAuthUser();

  // Local state
  const [activeTab, setActiveTab] = useState<'chats' | 'notifications'>('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState(mockChats);
  const [notifications, setNotifications] = useState(mockNotifications);

  // Animation values
  const scrollY = useSharedValue(0);

  // Calculate unread counts
  const unreadChatsCount = chats.reduce((total, chat) => total + chat.unreadCount, 0);
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  // Filter chats based on search
  const filteredChats = React.useMemo(() => {
    if (!searchQuery.trim()) return chats;
    
    return chats.filter(chat =>
      chat.gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chats, searchQuery]);

  // Handle chat press
  const handleChatPress = useCallback((gameId: number) => {
    // Navigate to game chat (you would implement this screen)
    Alert.alert('Chat', `Opening chat for game ${gameId}`);
  }, []);

  // Handle notification press
  const handleNotificationPress = useCallback((notification: Notification) => {
    if (notification.type === 'game_invite' && notification.data?.gameId) {
      navigation.navigate('GameDetails', { gameId: notification.data.gameId });
    }
    
    // Mark as read
    setNotifications(prev =>
      prev.map(n => (n.id === notification.id ? { ...n, isRead: true } : n))
    );
  }, [navigation]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Header animated style
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 100], [1, 0.9]);
    
    return {
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { paddingTop: insets.top + 16 }, headerAnimatedStyle]}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => {
            showModal(
              <View style={styles.helpContent}>
                <Text style={styles.helpText}>
                  • Join game chats to coordinate with other players
                  {'\n'}• Get notified about game updates and invitations
                  {'\n'}• Chat with fellow players to build community
                  {'\n'}• Receive payment and booking confirmations
                </Text>
              </View>,
              { title: 'Messages Help' }
            );
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="help-circle" size={24} color={NepalColors.primaryCrimson} />
        </TouchableOpacity>
      </Animated.View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search messages..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={NepalColors.primaryCrimson}
        />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chats' && styles.activeTab]}
          onPress={() => setActiveTab('chats')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'chats' && styles.activeTabText]}>
            Chats
          </Text>
          {unreadChatsCount > 0 && (
            <Badge size={18} style={styles.badge}>
              {unreadChatsCount}
            </Badge>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
          onPress={() => setActiveTab('notifications')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>
            Notifications
          </Text>
          {unreadNotificationsCount > 0 && (
            <Badge size={18} style={styles.badge}>
              {unreadNotificationsCount}
            </Badge>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollContainer
        onScroll={scrollHandler}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'chats' ? (
          <>
            {/* Chat List */}
            {filteredChats.length > 0 ? (
              <FlatList
                data={filteredChats}
                renderItem={({ item }) => (
                  <ChatListItem
                    chat={item}
                    onPress={() => handleChatPress(item.gameId)}
                  />
                )}
                keyExtractor={(item) => item.gameId.toString()}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={64}
                  color={NepalColors.onSurfaceVariant}
                />
                <Text style={styles.emptyTitle}>No conversations yet</Text>
                <Text style={styles.emptyText}>
                  Join games to start chatting with other players
                </Text>
                <TouchableOpacity
                  style={styles.emptyAction}
                  onPress={() => navigation.navigate('Explore')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emptyActionText}>Find Games</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Notifications Header */}
            {notifications.length > 0 && unreadNotificationsCount > 0 && (
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationHeaderText}>
                  {unreadNotificationsCount} unread notifications
                </Text>
                <TouchableOpacity
                  onPress={markAllAsRead}
                  activeOpacity={0.7}
                >
                  <Text style={styles.markAllReadText}>Mark all as read</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Notifications List */}
            {notifications.length > 0 ? (
              <FlatList
                data={notifications}
                renderItem={({ item }) => (
                  <NotificationItem
                    notification={item}
                    onPress={() => handleNotificationPress(item)}
                  />
                )}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="notifications-outline"
                  size={64}
                  color={NepalColors.onSurfaceVariant}
                />
                <Text style={styles.emptyTitle}>No notifications</Text>
                <Text style={styles.emptyText}>
                  You'll receive notifications about game updates and invitations
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: commonStyles.padding.large,
    paddingBottom: commonStyles.padding.medium,
    backgroundColor: NepalColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: NepalColors.outlineVariant,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
  },
  headerAction: {
    padding: commonStyles.padding.small,
  },
  searchSection: {
    paddingHorizontal: commonStyles.padding.large,
    paddingVertical: commonStyles.padding.medium,
    backgroundColor: NepalColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: NepalColors.outlineVariant,
  },
  searchBar: {
    backgroundColor: NepalColors.background,
  },
  searchInput: {
    fontFamily: 'Poppins-Regular',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: NepalColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: NepalColors.outlineVariant,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: commonStyles.padding.medium,
    gap: commonStyles.padding.small,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: NepalColors.primaryCrimson,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.onSurfaceVariant,
  },
  activeTabText: {
    color: NepalColors.primaryCrimson,
    fontFamily: 'Poppins-SemiBold',
  },
  badge: {
    backgroundColor: NepalColors.primaryCrimson,
  },
  scrollContent: {
    flexGrow: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: commonStyles.padding.large,
    paddingVertical: commonStyles.padding.medium,
    backgroundColor: NepalColors.primaryCrimson + '10',
    borderBottomWidth: 1,
    borderBottomColor: NepalColors.outlineVariant,
  },
  notificationHeaderText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.primaryCrimson,
  },
  markAllReadText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryCrimson,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: commonStyles.padding.xl * 3,
    paddingHorizontal: commonStyles.padding.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    marginTop: commonStyles.padding.large,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: commonStyles.padding.small,
    marginBottom: commonStyles.padding.xl,
  },
  emptyAction: {
    backgroundColor: NepalColors.primaryCrimson,
    paddingHorizontal: commonStyles.padding.xl,
    paddingVertical: commonStyles.padding.medium,
    borderRadius: commonStyles.borderRadius.medium,
  },
  emptyActionText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.primaryWhite,
  },
  helpContent: {
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurface,
    lineHeight: 20,
    textAlign: 'left',
  },
});

export default MessagesScreen;