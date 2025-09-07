import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SportProfile {
  id: string;
  sport: string;
  nickname: string;
  position: string;
  playStyle: string[];
  superpower: string;
  format: string;
  availability: string;
  funFact: string;
  skillLevel: string;
  preferredFoot?: string;
  travelRadius?: number;
  openToInvites?: boolean;
}

interface MySportsProfileProps {
  sports: SportProfile[];
  onAddSport: (sport: SportProfile) => void;
  onEditSport: (id: string, sport: SportProfile) => void;
  onRemoveSport: (id: string) => void;
}

const SPORT_EMOJIS = {
  'soccer': '⚽',
  'football': '⚽',
  'basketball': '🏀',
  'volleyball': '🏐',
  'tennis': '🎾',
  'cricket': '🏏',
  'badminton': '🏸',
  'running': '🏃',
  'futsal': '⚽',
  'default': '⚽'
};

const SPORT_OPTIONS = [
  'Soccer', 'Basketball', 'Volleyball', 'Tennis', 'Cricket', 'Badminton', 'Running', 'Futsal'
];

const POSITION_OPTIONS = {
  'Soccer': ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Winger'],
  'Basketball': ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
  'Volleyball': ['Setter', 'Outside Hitter', 'Middle Blocker', 'Opposite', 'Libero'],
  'Tennis': ['Singles', 'Doubles'],
  'Cricket': ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'],
  'Badminton': ['Singles', 'Doubles'],
  'Running': ['Sprint', 'Middle Distance', 'Long Distance', 'Marathon'],
  'Futsal': ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']
};

const MySportsProfile: React.FC<MySportsProfileProps> = ({
  sports,
  onAddSport,
  onEditSport,
  onRemoveSport
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSport, setEditingSport] = useState<SportProfile | null>(null);
  const [newSport, setNewSport] = useState<Partial<SportProfile>>({
    sport: '',
    nickname: '',
    position: '',
    playStyle: [],
    superpower: '',
    format: '',
    availability: '',
    funFact: '',
    skillLevel: 'Intermediate',
    openToInvites: true
  });

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleAddSport = () => {
    if (!newSport.sport || !newSport.nickname || !newSport.position) {
      Alert.alert('Missing Information', 'Please fill in sport, nickname, and position');
      return;
    }

    const sportProfile: SportProfile = {
      id: Date.now().toString(),
      sport: newSport.sport,
      nickname: newSport.nickname,
      position: newSport.position,
      playStyle: newSport.playStyle || [],
      superpower: newSport.superpower || '',
      format: newSport.format || '',
      availability: newSport.availability || '',
      funFact: newSport.funFact || '',
      skillLevel: newSport.skillLevel || 'Intermediate',
      preferredFoot: newSport.preferredFoot,
      travelRadius: newSport.travelRadius,
      openToInvites: newSport.openToInvites ?? true
    };

    onAddSport(sportProfile);
    setNewSport({
      sport: '',
      nickname: '',
      position: '',
      playStyle: [],
      superpower: '',
      format: '',
      availability: '',
      funFact: '',
      skillLevel: 'Intermediate',
      openToInvites: true
    });
    setShowAddModal(false);
  };

  const handleEditSport = (sport: SportProfile) => {
    setEditingSport(sport);
    setNewSport(sport);
    setShowAddModal(true);
  };

  const handleUpdateSport = () => {
    if (!editingSport || !newSport.sport || !newSport.nickname || !newSport.position) {
      Alert.alert('Missing Information', 'Please fill in sport, nickname, and position');
      return;
    }

    const updatedSport: SportProfile = {
      ...editingSport,
      ...newSport,
      sport: newSport.sport,
      nickname: newSport.nickname,
      position: newSport.position,
      playStyle: newSport.playStyle || [],
      superpower: newSport.superpower || '',
      format: newSport.format || '',
      availability: newSport.availability || '',
      funFact: newSport.funFact || '',
      skillLevel: newSport.skillLevel || 'Intermediate',
      preferredFoot: newSport.preferredFoot,
      travelRadius: newSport.travelRadius,
      openToInvites: newSport.openToInvites ?? true
    };

    onEditSport(editingSport.id, updatedSport);
    setEditingSport(null);
    setNewSport({
      sport: '',
      nickname: '',
      position: '',
      playStyle: [],
      superpower: '',
      format: '',
      availability: '',
      funFact: '',
      skillLevel: 'Intermediate',
      openToInvites: true
    });
    setShowAddModal(false);
  };

  const generateBlurb = (sport: SportProfile) => {
    const emoji = SPORT_EMOJIS[sport.sport.toLowerCase() as keyof typeof SPORT_EMOJIS] || SPORT_EMOJIS.default;
    const playStyleText = sport.playStyle.length > 0 ? sport.playStyle.join(', ') : 'versatile';
    const superpowerText = sport.superpower || 'team player';
    const formatText = sport.format || 'various formats';
    const availabilityText = sport.availability || 'flexible schedule';
    const funFactText = sport.funFact || 'enjoys the game';
    
    return `${emoji} ${sport.position} '${sport.nickname}' — ${playStyleText}. Superpower: ${superpowerText}. ${formatText} ${availabilityText}. Fun: ${funFactText}`;
  };

  return (
    <Animated.View 
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="football-outline" size={20} color="#22D3EE" />
          <Text style={styles.title}>My Sports Profile</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={20} color="#22D3EE" />
        </TouchableOpacity>
      </View>

      {sports.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="add-circle-outline" size={48} color="#6B7280" />
          <Text style={styles.emptyText}>No sports added yet</Text>
          <Text style={styles.emptySubtext}>Tap the + button to add your first sport</Text>
        </View>
      ) : (
        <ScrollView style={styles.sportsList} showsVerticalScrollIndicator={false}>
          {sports.map((sport) => (
            <View key={sport.id} style={styles.sportItem}>
              <View style={styles.sportHeader}>
                <Text style={styles.sportName}>{sport.sport}</Text>
                <View style={styles.sportActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditSport(sport)}
                  >
                    <Ionicons name="create-outline" size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => onRemoveSport(sport.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.sportBlurb}>{generateBlurb(sport)}</Text>
              <View style={styles.sportDetails}>
                <Text style={styles.skillLevel}>Skill: {sport.skillLevel}</Text>
                {sport.preferredFoot && (
                  <Text style={styles.detail}>Foot: {sport.preferredFoot}</Text>
                )}
                {sport.travelRadius && (
                  <Text style={styles.detail}>Radius: {sport.travelRadius}km</Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add/Edit Sport Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingSport ? 'Edit Sport' : 'Add Sport'}
            </Text>
            <TouchableOpacity onPress={editingSport ? handleUpdateSport : handleAddSport}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sport *</Text>
              <View style={styles.sportOptions}>
                {SPORT_OPTIONS.map((sport) => (
                  <TouchableOpacity
                    key={sport}
                    style={[
                      styles.sportOption,
                      newSport.sport === sport && styles.sportOptionSelected
                    ]}
                    onPress={() => setNewSport({ ...newSport, sport })}
                  >
                    <Text style={[
                      styles.sportOptionText,
                      newSport.sport === sport && styles.sportOptionTextSelected
                    ]}>
                      {sport}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nickname *</Text>
              <TextInput
                style={styles.input}
                value={newSport.nickname}
                onChangeText={(text) => setNewSport({ ...newSport, nickname: text })}
                placeholder="Enter your nickname"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Position *</Text>
              <View style={styles.positionOptions}>
                {newSport.sport && POSITION_OPTIONS[newSport.sport as keyof typeof POSITION_OPTIONS]?.map((position) => (
                  <TouchableOpacity
                    key={position}
                    style={[
                      styles.positionOption,
                      newSport.position === position && styles.positionOptionSelected
                    ]}
                    onPress={() => setNewSport({ ...newSport, position })}
                  >
                    <Text style={[
                      styles.positionOptionText,
                      newSport.position === position && styles.positionOptionTextSelected
                    ]}>
                      {position}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Superpower</Text>
              <TextInput
                style={styles.input}
                value={newSport.superpower}
                onChangeText={(text) => setNewSport({ ...newSport, superpower: text })}
                placeholder="What's your special skill?"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fun Fact</Text>
              <TextInput
                style={styles.input}
                value={newSport.funFact}
                onChangeText={(text) => setNewSport({ ...newSport, funFact: text })}
                placeholder="Share something fun about yourself"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Skill Level</Text>
              <View style={styles.skillOptions}>
                {['Beginner', 'Intermediate', 'Advanced', 'Professional'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.skillOption,
                      newSport.skillLevel === level && styles.skillOptionSelected
                    ]}
                    onPress={() => setNewSport({ ...newSport, skillLevel: level })}
                  >
                    <Text style={[
                      styles.skillOptionText,
                      newSport.skillLevel === level && styles.skillOptionTextSelected
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginLeft: 8,
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  sportsList: {
    maxHeight: 300,
  },
  sportItem: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  sportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sportName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  sportActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  sportBlurb: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
    marginBottom: 8,
  },
  sportDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillLevel: {
    fontSize: 12,
    color: '#22D3EE',
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  detail: {
    fontSize: 12,
    color: '#9CA3AF',
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#111827',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  saveButton: {
    fontSize: 16,
    color: '#22D3EE',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  sportOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  sportOptionSelected: {
    backgroundColor: '#22D3EE',
    borderColor: '#22D3EE',
  },
  sportOptionText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  sportOptionTextSelected: {
    color: '#111827',
  },
  positionOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  positionOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  positionOptionSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  positionOptionText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  positionOptionTextSelected: {
    color: '#111827',
  },
  skillOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  skillOptionSelected: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  skillOptionText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  skillOptionTextSelected: {
    color: '#111827',
  },
});

export default MySportsProfile;
