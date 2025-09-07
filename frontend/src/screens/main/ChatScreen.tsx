import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface ChatScreenProps {
  navigation: any;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation }) => {
  const { theme, locale } = useTheme();

  const chatRooms = [
    {
      id: '1',
      name: 'Football at Central Park',
      lastMessage: 'Game starts in 30 minutes!',
      timestamp: '2:30 PM',
      unreadCount: 3,
      participants: 11,
      sport: 'Football',
    },
    {
      id: '2',
      name: 'Basketball Tournament',
      lastMessage: 'Who\'s bringing the water bottles?',
      timestamp: '1:45 PM',
      unreadCount: 0,
      participants: 8,
      sport: 'Basketball',
    },
    {
      id: '3',
      name: 'Morning Cricket Match',
      lastMessage: 'Weather looks good for tomorrow',
      timestamp: '12:15 PM',
      unreadCount: 1,
      participants: 22,
      sport: 'Cricket',
    },
  ];

  const renderChatRoom = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.chatRoom, { backgroundColor: theme.colors.card }]}
      onPress={() => {
        // Navigate to chat detail
      }}
    >
      <View style={styles.chatAvatar}>
        <Ionicons 
          name="people" 
          size={24} 
          color={theme.colors.primary} 
        />
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={[styles.chatName, { color: theme.colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
            {item.timestamp}
          </Text>
        </View>
        
        <View style={styles.chatFooter}>
          <Text 
            style={[styles.lastMessage, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          <View style={styles.chatMeta}>
            <Text style={[styles.participants, { color: theme.colors.textSecondary }]}>
              {item.participants} {locale === 'nepal' ? 'सदस्यहरू' : 'members'}
            </Text>
            {item.unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {locale === 'nepal' ? 'च्याट' : 'Chats'}
        </Text>
      </View>

      <FlatList
        data={chatRooms}
        renderItem={renderChatRoom}
        keyExtractor={(item) => item.id}
        style={styles.chatList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chatRoom: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(220, 20, 60, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContent: {
    flex: 1,
    gap: 4,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
  },
  chatMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  participants: {
    fontSize: 12,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default ChatScreen;