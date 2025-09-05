import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Title, Paragraph, Avatar } from 'react-native-paper';
import { NepalColors, FontSizes, Spacing, BorderRadius } from '@/constants/theme';
import { Conversation } from '@/types';

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      // TODO: Load conversations from API
      setConversations([]);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => {/* Navigate to chat */}}
    >
      <Card style={styles.conversationCard}>
        <Card.Content style={styles.conversationContent}>
          <Avatar.Text
            size={48}
            label={item.participants[0]?.name?.charAt(0) || '?'}
            style={styles.avatar}
          />
          
          <View style={styles.conversationInfo}>
            <View style={styles.conversationHeader}>
              <Title style={styles.conversationTitle}>
                {item.type === 'GAME' 
                  ? `Game Chat` 
                  : item.participants.map(p => p.name).join(', ')
                }
              </Title>
              <Text style={styles.conversationTime}>
                {item.lastMessage 
                  ? new Date(item.lastMessage.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })
                  : ''
                }
              </Text>
            </View>
            
            <Paragraph style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage?.content || 'No messages yet'}
            </Paragraph>
          </View>
          
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.newMessageButton}>
          <Ionicons name="create" size={24} color={NepalColors.primary} />
        </TouchableOpacity>
      </View>

      {conversations.length > 0 ? (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          style={styles.conversationsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={80} color={NepalColors.textSecondary} />
          <Text style={styles.emptyTitle}>No Messages Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start a conversation with other players or join game chats
          </Text>
          <TouchableOpacity style={styles.startChatButton}>
            <Text style={styles.startChatButtonText}>Start Chatting</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NepalColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: NepalColors.surface,
    elevation: 2,
  },
  headerTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: 'bold',
    color: NepalColors.text,
  },
  newMessageButton: {
    padding: Spacing.sm,
  },
  conversationsList: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  conversationItem: {
    marginVertical: Spacing.xs,
  },
  conversationCard: {
    elevation: 1,
  },
  conversationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: NepalColors.primary,
    marginRight: Spacing.md,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  conversationTitle: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: NepalColors.text,
    flex: 1,
  },
  conversationTime: {
    fontSize: FontSizes.sm,
    color: NepalColors.textSecondary,
  },
  lastMessage: {
    fontSize: FontSizes.sm,
    color: NepalColors.textSecondary,
  },
  unreadBadge: {
    backgroundColor: NepalColors.primary,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  unreadCount: {
    color: NepalColors.textLight,
    fontSize: FontSizes.xs,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: NepalColors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSizes.base,
    color: NepalColors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  startChatButton: {
    backgroundColor: NepalColors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  startChatButtonText: {
    color: NepalColors.textLight,
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
});