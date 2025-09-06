import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ScoutingReportProps {
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
  onEdit?: () => void;
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
  'default': '⚽'
};

const ScoutingReport: React.FC<ScoutingReportProps> = ({
  sport,
  nickname,
  position,
  playStyle,
  superpower,
  format,
  availability,
  funFact,
  skillLevel,
  preferredFoot,
  travelRadius,
  openToInvites = true,
  onEdit
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const sportEmoji = SPORT_EMOJIS[sport.toLowerCase() as keyof typeof SPORT_EMOJIS] || SPORT_EMOJIS.default;

  const generateScoutingBlurb = () => {
    const playStyleText = playStyle.slice(0, 2).join(', ');
    return `${sportEmoji} ${position} '${nickname}' — ${playStyleText}. Superpower: ${superpower}. ${format} ${availability}. Fun: ${funFact}`;
  };

  const blurb = generateScoutingBlurb();

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.emoji}>{sportEmoji}</Text>
          <Text style={styles.title}>Scouting Report</Text>
        </View>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <Ionicons name="create-outline" size={16} color="#22D3EE" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.blurbContainer}>
        <Text style={styles.blurb}>{blurb}</Text>
      </View>

      <TouchableOpacity 
        style={styles.expandButton}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.expandText}>
          {isExpanded ? 'Show Less' : 'Show Details'}
        </Text>
        <Ionicons 
          name={isExpanded ? 'chevron-up' : 'chevron-down'} 
          size={16} 
          color="#22D3EE" 
        />
      </TouchableOpacity>

      {isExpanded && (
        <Animated.View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Skill Level:</Text>
            <Text style={styles.detailValue}>{skillLevel}</Text>
          </View>
          
          {preferredFoot && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Preferred Foot:</Text>
              <Text style={styles.detailValue}>{preferredFoot}</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Format:</Text>
            <Text style={styles.detailValue}>{format}</Text>
          </View>
          
          {travelRadius && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Travel Radius:</Text>
              <Text style={styles.detailValue}>{travelRadius} km</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Availability:</Text>
            <Text style={styles.detailValue}>{availability}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Open to Invites:</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: openToInvites ? '#22C55E20' : '#EF444420' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: openToInvites ? '#22C55E' : '#EF4444' }
              ]}>
                {openToInvites ? 'Yes' : 'No'}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#22D3EE20',
  },
  blurbContainer: {
    backgroundColor: '#0B1220',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  blurb: {
    fontSize: 14,
    lineHeight: 20,
    color: '#F8FAFC',
    fontStyle: 'italic',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  expandText: {
    fontSize: 14,
    color: '#22D3EE',
    fontWeight: '600',
    marginRight: 4,
  },
  detailsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#30363D',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ScoutingReport;