import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from 'react-native-paper';
import { NepalColors, commonStyles } from '../../styles/theme';
import { User } from '../../types';

interface ParticipantsListProps {
  participants: User[];
  maxPlayers: number;
  onParticipantPress: (userId: number) => void;
}

/**
 * Participants List Component
 */
const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  maxPlayers,
  onParticipantPress,
}) => {
  const availableSlots = maxPlayers - participants.length;

  // Render participant item
  const renderParticipant = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.participantItem}
      onPress={() => onParticipantPress(item.id)}
      activeOpacity={0.7}
    >
      <Avatar.Image
        size={48}
        source={{ uri: item.profilePictureUrl || 'https://via.placeholder.com/48' }}
        style={styles.avatar}
      />
      
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.participantHandle}>@{item.username}</Text>
        {item.skillLevel && (
          <Text style={styles.participantSkill}>{item.skillLevel} level</Text>
        )}
      </View>
      
      {item.isVerified && (
        <Ionicons name="checkmark-circle" size={20} color={NepalColors.success} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Participants ({participants.length}/{maxPlayers})
      </Text>
      
      <FlatList
        data={participants}
        renderItem={renderParticipant}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        style={styles.list}
      />
      
      {availableSlots > 0 && (
        <View style={styles.availableSlotsContainer}>
          <Text style={styles.availableSlotsText}>
            {availableSlots} spot{availableSlots > 1 ? 's' : ''} remaining
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 400,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
    marginBottom: commonStyles.padding.large,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: commonStyles.padding.medium,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: commonStyles.padding.medium,
    paddingHorizontal: commonStyles.padding.medium,
    marginBottom: commonStyles.padding.small,
    backgroundColor: NepalColors.surface,
    borderRadius: commonStyles.borderRadius.medium,
    borderWidth: 1,
    borderColor: NepalColors.outline,
  },
  avatar: {
    marginRight: commonStyles.padding.medium,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.onSurface,
  },
  participantHandle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: NepalColors.onSurfaceVariant,
    marginTop: 2,
  },
  participantSkill: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: NepalColors.primaryCrimson,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  availableSlotsContainer: {
    alignItems: 'center',
    paddingVertical: commonStyles.padding.medium,
    backgroundColor: NepalColors.success + '10',
    borderRadius: commonStyles.borderRadius.medium,
    marginTop: commonStyles.padding.medium,
  },
  availableSlotsText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: NepalColors.success,
  },
});

export default ParticipantsList;